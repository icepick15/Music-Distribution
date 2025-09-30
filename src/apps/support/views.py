from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Q, Count
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from .models import Ticket, TicketResponse, TicketAttachment
from .serializers import (
    TicketListSerializer,
    TicketDetailSerializer,
    TicketCreateSerializer,
    TicketResponseSerializer,
    TicketStatusUpdateSerializer,
    TicketAttachmentSerializer
)
from .permissions import TicketPermission
from .filters import TicketFilter
from .notification_utils import (
    notify_ticket_created,
    notify_ticket_updated,
    notify_ticket_response,
    notify_ticket_assigned,
    notify_ticket_status_changed
)


class TicketViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing support tickets
    
    Provides CRUD operations for tickets with appropriate permissions:
    - Users can create tickets and view/update their own tickets
    - Staff can view and manage all tickets
    """
    permission_classes = [permissions.IsAuthenticated, TicketPermission]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = TicketFilter
    search_fields = ['ticket_id', 'title', 'description', 'author__username', 'author__email']
    ordering_fields = ['created_at', 'updated_at', 'priority', 'status']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            # Staff can see all tickets
            return Ticket.objects.select_related('author', 'assignee').prefetch_related('responses', 'attachments')
        else:
            # Users can only see their own tickets
            return Ticket.objects.filter(author=user).select_related('author', 'assignee').prefetch_related('responses', 'attachments')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TicketCreateSerializer
        elif self.action in ['list']:
            return TicketListSerializer
        elif self.action in ['update_status']:
            return TicketStatusUpdateSerializer
        else:
            return TicketDetailSerializer
    
    def perform_create(self, serializer):
        ticket = serializer.save(author=self.request.user)
        # Send notification about new ticket
        notify_ticket_created(ticket)
    
    @action(detail=True, methods=['post'])
    def add_response(self, request, pk=None):
        """Add a response to a ticket"""
        ticket = self.get_object()
        serializer = TicketResponseSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            response = serializer.save(ticket=ticket)
            
            # Update ticket's updated_at timestamp
            ticket.updated_at = timezone.now()
            ticket.save(update_fields=['updated_at'])
            
            # Send notification about new response
            notify_ticket_response(ticket, response, request.user)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Quick status update for tickets"""
        ticket = self.get_object()
        old_status = ticket.status
        old_assignee = ticket.assignee
        
        serializer = TicketStatusUpdateSerializer(
            ticket, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        
        if serializer.is_valid():
            updated_ticket = serializer.save()
            
            # Send notifications for status change
            if old_status != updated_ticket.status:
                notify_ticket_status_changed(updated_ticket, old_status, updated_ticket.status, request.user)
            
            # Send notification for assignment change
            if old_assignee != updated_ticket.assignee and updated_ticket.assignee:
                notify_ticket_assigned(updated_ticket, updated_ticket.assignee)
            
            # Send general update notification
            notify_ticket_updated(updated_ticket, request.user)
            
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def assign_to_me(self, request, pk=None):
        """Allow staff to assign ticket to themselves"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can assign tickets'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        ticket = self.get_object()
        ticket.assignee = request.user
        ticket.status = 'in_progress'
        ticket.save(update_fields=['assignee', 'status'])
        
        serializer = self.get_serializer(ticket)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get ticket statistics"""
        user = request.user
        
        if user.is_staff:
            # Admin stats - all tickets
            queryset = Ticket.objects.all()
        else:
            # User stats - only their tickets
            queryset = Ticket.objects.filter(author=user)
        
        stats = queryset.aggregate(
            total=Count('id'),
            open=Count('id', filter=Q(status='open')),
            in_progress=Count('id', filter=Q(status='in_progress')),
            pending=Count('id', filter=Q(status='pending')),
            resolved=Count('id', filter=Q(status='resolved')),
            closed=Count('id', filter=Q(status='closed')),
        )
        
        # Add active tickets count
        stats['active'] = stats['open'] + stats['in_progress'] + stats['pending']
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def my_tickets(self, request):
        """Get current user's tickets"""
        tickets = Ticket.objects.filter(author=request.user).order_by('-created_at')
        serializer = TicketListSerializer(tickets, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def assigned_to_me(self, request):
        """Get tickets assigned to current user (staff only)"""
        if not request.user.is_staff:
            return Response(
                {'error': 'Only staff can view assigned tickets'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        tickets = Ticket.objects.filter(assignee=request.user).order_by('-created_at')
        serializer = TicketListSerializer(tickets, many=True)
        return Response(serializer.data)


class TicketResponseViewSet(viewsets.ModelViewSet):
    """ViewSet for managing ticket responses"""
    serializer_class = TicketResponseSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return TicketResponse.objects.select_related('ticket', 'author')
        else:
            # Users can only see responses to their own tickets
            return TicketResponse.objects.filter(
                ticket__author=user,
                is_internal=False  # Hide internal staff notes from users
            ).select_related('ticket', 'author')
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class TicketAttachmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing ticket attachments"""
    serializer_class = TicketAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return TicketAttachment.objects.select_related('ticket', 'uploaded_by')
        else:
            # Users can only see attachments from their own tickets
            return TicketAttachment.objects.filter(
                ticket__author=user
            ).select_related('ticket', 'uploaded_by')
    
    def perform_create(self, serializer):
        file_obj = self.request.FILES.get('file')
        if file_obj:
            serializer.save(
                uploaded_by=self.request.user,
                filename=file_obj.name,
                file_size=file_obj.size
            )