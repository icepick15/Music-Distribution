from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import Notification, NotificationType, UserNotificationPreference, EmailTemplate
from .serializers import (
    NotificationSerializer, NotificationTypeSerializer,
    UserNotificationPreferenceSerializer, EmailTemplateSerializer
)
from .services import NotificationService


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for user notifications
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related('notification_type').order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = NotificationService.get_unread_count(request.user)
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        notifications = NotificationService.get_user_notifications(
            request.user, 
            limit=20, 
            unread_only=True
        )
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read"""
        success = NotificationService.mark_notification_as_read(pk, request.user)
        if success:
            return Response({'status': 'marked as read'})
        else:
            return Response(
                {'error': 'Notification not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read for the user"""
        updated = Notification.objects.filter(
            recipient=request.user,
            status__in=['pending', 'sent']
        ).update(
            status='read',
            read_at=models.functions.Now()
        )
        return Response({'marked_as_read': updated})

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def broadcast(self, request):
        """Broadcast notification to all users (Admin only)"""
        from .notification_utils import create_admin_broadcast
        
        title = request.data.get('title')
        message = request.data.get('message')
        priority = request.data.get('priority', 'normal')
        
        if not title or not message:
            return Response(
                {'error': 'Title and message are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notifications = create_admin_broadcast(title, message, priority, request.user)
        
        return Response({
            'message': f'Broadcast sent to {len(notifications)} users',
            'notifications_created': len(notifications)
        })

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def send_to_user(self, request):
        """Send notification to specific user (Admin only)"""
        from django.contrib.auth import get_user_model
        from .notification_utils import create_ticket_notification
        from .models import Ticket
        
        User = get_user_model()
        
        user_id = request.data.get('user_id')
        title = request.data.get('title')
        message = request.data.get('message')
        priority = request.data.get('priority', 'normal')
        
        if not all([user_id, title, message]):
            return Response(
                {'error': 'user_id, title, and message are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Create a dummy ticket for notification context
        # In a real implementation, you might want a separate function for admin messages
        notification = create_ticket_notification(
            ticket=None,  # No specific ticket
            notification_type_name='admin_message',
            title=title,
            message=message,
            recipient=user
        )
        
        if notification:
            return Response({'message': 'Notification sent successfully'})
        else:
            return Response(
                {'error': 'Failed to send notification'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAdminUser])
    def stats(self, request):
        """Get notification statistics (Admin only)"""
        from django.db.models import Count, Q
        from django.utils import timezone
        from datetime import timedelta
        
        # Get date ranges
        now = timezone.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        stats = {
            'total_notifications': Notification.objects.count(),
            'unread_count': Notification.objects.filter(status__in=['pending', 'sent']).count(),
            'read_count': Notification.objects.filter(status='read').count(),
            'week_count': Notification.objects.filter(created_at__gte=week_ago).count(),
            'month_count': Notification.objects.filter(created_at__gte=month_ago).count(),
            'by_type': Notification.objects.values('notification_type__name').annotate(count=Count('id')),
            'by_priority': Notification.objects.values('priority').annotate(count=Count('id')),
        }
        
        return Response(stats)


class NotificationTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for notification types
    """
    serializer_class = NotificationTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = NotificationType.objects.filter(is_active=True)


class UserNotificationPreferenceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user notification preferences
    """
    serializer_class = UserNotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserNotificationPreference.objects.filter(
            user=self.request.user
        ).select_related('notification_type')
    
    @action(detail=False, methods=['post'])
    def bulk_update(self, request):
        """Bulk update notification preferences"""
        preferences_data = request.data.get('preferences', [])
        updated_count = 0
        
        for pref_data in preferences_data:
            try:
                preference = UserNotificationPreference.objects.get(
                    id=pref_data['id'],
                    user=request.user
                )
                
                # Update fields
                for field in ['email_enabled', 'push_enabled', 'in_app_enabled', 'frequency']:
                    if field in pref_data:
                        setattr(preference, field, pref_data[field])
                
                preference.save()
                updated_count += 1
                
            except UserNotificationPreference.DoesNotExist:
                continue
        
        return Response({'updated': updated_count})
    
    @action(detail=False, methods=['get'])
    def defaults(self, request):
        """Get default preferences for all notification types"""
        notification_types = NotificationType.objects.filter(is_active=True)
        defaults = []
        
        for nt in notification_types:
            # Get existing preference or create default
            try:
                pref = UserNotificationPreference.objects.get(
                    user=request.user,
                    notification_type=nt
                )
                serializer = self.get_serializer(pref)
                defaults.append(serializer.data)
            except UserNotificationPreference.DoesNotExist:
                # Create default preference
                pref = UserNotificationPreference.objects.create(
                    user=request.user,
                    notification_type=nt,
                    email_enabled=nt.default_email_enabled,
                    push_enabled=nt.default_push_enabled,
                    in_app_enabled=nt.default_in_app_enabled
                )
                serializer = self.get_serializer(pref)
                defaults.append(serializer.data)
        
        return Response(defaults)


class EmailTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for email templates (admin only)
    """
    serializer_class = EmailTemplateSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = EmailTemplate.objects.all()
    
    @action(detail=True, methods=['post'])
    def preview(self, request, pk=None):
        """Preview an email template with sample data"""
        template = self.get_object()
        
        # Sample context data
        context = {
            'user': request.user,
            'recipient_name': request.user.get_full_name(),
            'title': 'Sample Notification Title',
            'message': 'This is a sample notification message.',
            'site_name': 'Music Distribution Platform',
            'frontend_url': 'http://localhost:5173',
            'context_data': {
                'song_title': 'Sample Song Title',
                'artist_name': 'Sample Artist',
                'amount': '1000',
            }
        }
        
        # Render template
        from .tasks import render_to_string_from_template
        try:
            rendered_html = render_to_string_from_template(template.html_template, context)
            rendered_subject = render_to_string_from_template(template.subject_template, context)
            
            return Response({
                'subject': rendered_subject,
                'html_content': rendered_html,
                'context_used': context
            })
        except Exception as e:
            return Response(
                {'error': f'Template rendering error: {str(e)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
