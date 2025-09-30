from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
from .models import ContactMessage, Ticket
from .contact_serializers import (
    ContactMessageSerializer, 
    ContactMessageDetailSerializer,
    ContactMessageStatusUpdateSerializer
)
from src.apps.notifications.services import NotificationService
import logging

logger = logging.getLogger(__name__)


class ContactMessageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling contact form submissions and management
    
    Provides CRUD operations for contact messages with different
    permissions for public users vs admin users.
    """
    
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category', 'priority', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    ordering_fields = ['created_at', 'updated_at', 'priority']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'create':
            # Anyone can create a contact message
            permission_classes = [permissions.AllowAny]
        elif self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            # Only admin users can view/manage contact messages
            permission_classes = [permissions.IsAdminUser]
        else:
            # Default to admin only for custom actions
            permission_classes = [permissions.IsAdminUser]
        
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """
        Return the appropriate serializer class based on the action.
        """
        if self.action == 'retrieve' and self.request.user.is_staff:
            return ContactMessageDetailSerializer
        elif self.action in ['update_status']:
            return ContactMessageStatusUpdateSerializer
        return ContactMessageSerializer
    
    def get_queryset(self):
        """
        Filter queryset based on user permissions.
        """
        queryset = ContactMessage.objects.all()
        
        # Admin users can see all messages
        if self.request.user.is_staff:
            return queryset
        
        # Regular users can only see their own messages (if logged in)
        if self.request.user.is_authenticated:
            return queryset.filter(user=self.request.user)
        
        # Anonymous users cannot list messages
        return ContactMessage.objects.none()
    
    def perform_create(self, serializer):
        """
        Save the contact message with additional metadata.
        """
        # Get request metadata
        ip_address = self.get_client_ip()
        user_agent = self.request.META.get('HTTP_USER_AGENT', '')
        referrer = self.request.META.get('HTTP_REFERER', '')
        
        # Set auto-priority based on category
        category = serializer.validated_data.get('category', 'general')
        priority = self.get_auto_priority(category)
        
        # Save with metadata
        contact_message = serializer.save(
            user=self.request.user if self.request.user.is_authenticated else None,
            ip_address=ip_address,
            user_agent=user_agent,
            referrer=referrer,
            priority=priority
        )
        
        # Send notifications
        self.send_contact_notifications(contact_message)
        
        logger.info(
            f"New contact message created: {contact_message.id} from {contact_message.email}"
        )
    
    def get_client_ip(self):
        """Get client IP address from request."""
        x_forwarded_for = self.request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = self.request.META.get('REMOTE_ADDR')
        return ip
    
    def get_auto_priority(self, category):
        """Auto-assign priority based on category."""
        high_priority_categories = ['billing', 'technical', 'account']
        if category in high_priority_categories:
            return 'high'
        return 'medium'
    
    def send_contact_notifications(self, contact_message):
        """
        Send email notifications for new contact message.
        """
        try:
            # Send confirmation email to user (if they have an email)
            if contact_message.email:
                # For anonymous users, we need to create a temporary context
                context_data = {
                    'contact_name': contact_message.name,
                    'contact_email': contact_message.email,
                    'subject': contact_message.subject,
                    'category': contact_message.get_category_display(),
                    'message_id': str(contact_message.id),
                    'created_at': contact_message.created_at.strftime('%Y-%m-%d %H:%M:%S')
                }
                
                # If user is authenticated, send normal notification
                if contact_message.user:
                    NotificationService.send_user_notification(
                        user=contact_message.user,
                        notification_type_name='contact_confirmation',
                        title=f'We received your message: {contact_message.subject}',
                        message=f'Thank you for contacting us. We will get back to you within 24 hours.',
                        context_data=context_data
                    )
                # For anonymous users, we need to send direct email (TODO: implement this)
                
            # Send admin notification
            NotificationService.send_admin_notification(
                title=f'New Contact Message: {contact_message.category}',
                message=f'New contact form submission from {contact_message.name} ({contact_message.email})',
                context_data={
                    'contact_name': contact_message.name,
                    'contact_email': contact_message.email,
                    'subject': contact_message.subject,
                    'category': contact_message.get_category_display(),
                    'priority': contact_message.get_priority_display(),
                    'message_preview': contact_message.message[:200],
                    'message_id': str(contact_message.id),
                    'admin_url': f'/admin/support/contactmessage/{contact_message.id}/',
                    'created_at': contact_message.created_at.strftime('%Y-%m-%d %H:%M:%S')
                }
            )
            
            logger.info(f"Contact notifications sent for message {contact_message.id}")
            
        except Exception as e:
            logger.error(f"Failed to send contact notifications: {str(e)}")
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark a contact message as read.
        """
        contact_message = self.get_object()
        contact_message.mark_as_read()
        
        return Response({
            'status': 'success',
            'message': 'Contact message marked as read',
            'contact_message': ContactMessageDetailSerializer(contact_message).data
        })
    
    @action(detail=True, methods=['post'])
    def mark_as_responded(self, request, pk=None):
        """
        Mark a contact message as responded.
        """
        contact_message = self.get_object()
        contact_message.mark_as_responded()
        
        return Response({
            'status': 'success',
            'message': 'Contact message marked as responded',
            'contact_message': ContactMessageDetailSerializer(contact_message).data
        })
    
    @action(detail=True, methods=['post'])
    def convert_to_ticket(self, request, pk=None):
        """
        Convert a contact message to a support ticket.
        """
        contact_message = self.get_object()
        
        if contact_message.related_ticket:
            return Response({
                'error': 'Contact message already has a related ticket',
                'ticket_id': contact_message.related_ticket.id
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get assigned user from request (optional)
        assigned_to_id = request.data.get('assigned_to')
        assigned_to = None
        if assigned_to_id:
            try:
                from django.contrib.auth import get_user_model
                User = get_user_model()
                assigned_to = User.objects.get(id=assigned_to_id, is_staff=True)
            except User.DoesNotExist:
                return Response({
                    'error': 'Invalid assigned user'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Convert to ticket
        ticket = contact_message.convert_to_ticket(assigned_to=assigned_to)
        
        return Response({
            'status': 'success',
            'message': 'Contact message converted to ticket',
            'ticket_id': ticket.id,
            'contact_message': ContactMessageDetailSerializer(contact_message).data
        })
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """
        Update the status of a contact message.
        """
        contact_message = self.get_object()
        serializer = ContactMessageStatusUpdateSerializer(
            contact_message, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'message': 'Contact message status updated',
                'contact_message': ContactMessageDetailSerializer(contact_message).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get contact message statistics (admin only).
        """
        queryset = self.get_queryset()
        
        # Basic counts
        total_messages = queryset.count()
        new_messages = queryset.filter(status='new').count()
        in_progress = queryset.filter(status='in_progress').count()
        resolved = queryset.filter(status='resolved').count()
        
        # Category breakdown
        categories = {}
        for choice in ContactMessage.CATEGORY_CHOICES:
            category_key = choice[0]
            categories[category_key] = queryset.filter(category=category_key).count()
        
        # Priority breakdown
        priorities = {}
        for choice in ContactMessage.PRIORITY_CHOICES:
            priority_key = choice[0]
            priorities[priority_key] = queryset.filter(priority=priority_key).count()
        
        # Recent activity (last 7 days)
        recent_cutoff = timezone.now() - timezone.timedelta(days=7)
        recent_messages = queryset.filter(created_at__gte=recent_cutoff).count()
        
        return Response({
            'total_messages': total_messages,
            'status_breakdown': {
                'new': new_messages,
                'in_progress': in_progress,
                'resolved': resolved,
                'read': queryset.filter(status='read').count(),
                'responded': queryset.filter(status='responded').count(),
            },
            'category_breakdown': categories,
            'priority_breakdown': priorities,
            'recent_activity': {
                'last_7_days': recent_messages
            }
        })
    
    @action(detail=False, methods=['get'])
    def urgent(self, request):
        """
        Get urgent/high priority contact messages.
        """
        urgent_messages = self.get_queryset().filter(
            priority__in=['high', 'urgent'],
            status__in=['new', 'read', 'in_progress']
        )
        
        serializer = ContactMessageDetailSerializer(urgent_messages, many=True)
        return Response({
            'count': urgent_messages.count(),
            'messages': serializer.data
        })