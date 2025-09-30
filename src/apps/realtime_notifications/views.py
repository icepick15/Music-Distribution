"""
ViewSets for real-time notifications REST API
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q

from .models import RealtimeNotification, NotificationTemplate, UserNotificationSettings
from .serializers import (
    RealtimeNotificationSerializer,
    NotificationTemplateSerializer,
    UserNotificationSettingsSerializer
)
from .services import RealtimeNotificationService


class RealtimeNotificationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing real-time notifications
    """
    serializer_class = RealtimeNotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'notification_type', 'priority']
    
    def get_queryset(self):
        """Return notifications for the current user"""
        return RealtimeNotification.objects.filter(recipient=self.request.user)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get unread notification count"""
        count = self.get_queryset().filter(
            status__in=['pending', 'sent', 'delivered']
        ).count()
        return Response({'unread_count': count})
    
    @action(detail=False, methods=['get'])
    def unread(self, request):
        """Get unread notifications"""
        notifications = self.get_queryset().filter(
            status__in=['pending', 'sent', 'delivered']
        ).order_by('-created_at')
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a notification as read"""
        notification = self.get_object()
        notification.mark_as_read()
        
        # Update unread count via WebSocket
        service = RealtimeNotificationService()
        service.update_unread_count(request.user)
        
        return Response({'status': 'marked_as_read'})
    
    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """Mark all notifications as read"""
        notifications = self.get_queryset().filter(
            status__in=['pending', 'sent', 'delivered']
        )
        count = notifications.count()
        notifications.update(
            status='read',
            read_at=timezone.now()
        )
        
        # Update unread count via WebSocket
        service = RealtimeNotificationService()
        service.update_unread_count(request.user)
        
        return Response({
            'status': 'marked_all_as_read',
            'count': count
        })
    
    @action(detail=False, methods=['delete'])
    def clear_read(self, request):
        """Clear all read notifications"""
        count = self.get_queryset().filter(status='read').delete()[0]
        return Response({
            'status': 'cleared_read_notifications',
            'count': count
        })
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recent notifications"""
        limit = int(request.query_params.get('limit', 10))
        notifications = self.get_queryset().order_by('-created_at')[:limit]
        
        serializer = self.get_serializer(notifications, many=True)
        return Response(serializer.data)


class NotificationTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for notification templates (read-only for regular users)
    """
    queryset = NotificationTemplate.objects.filter(is_active=True)
    serializer_class = NotificationTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def render_preview(self, request, pk=None):
        """Preview template with sample context"""
        template = self.get_object()
        context = request.data.get('context', {})
        
        try:
            rendered = template.render(context)
            return Response({
                'rendered': rendered,
                'template_name': template.name
            })
        except Exception as e:
            return Response(
                {'error': f'Template rendering failed: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class UserNotificationSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user notification settings
    """
    serializer_class = UserNotificationSettingsSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return settings for the current user only"""
        return UserNotificationSettings.objects.filter(user=self.request.user)
    
    def get_object(self):
        """Get or create settings for the current user"""
        settings, created = UserNotificationSettings.objects.get_or_create(
            user=self.request.user,
            defaults={'enable_websocket': True}
        )
        return settings
    
    @action(detail=False, methods=['get'])
    def my_settings(self, request):
        """Get current user's notification settings"""
        settings = self.get_object()
        serializer = self.get_serializer(settings)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def update_settings(self, request):
        """Update current user's notification settings"""
        settings = self.get_object()
        serializer = self.get_serializer(settings, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def toggle_websocket(self, request):
        """Toggle WebSocket notifications on/off"""
        settings = self.get_object()
        settings.enable_websocket = not settings.enable_websocket
        settings.save(update_fields=['enable_websocket'])
        
        return Response({
            'enable_websocket': settings.enable_websocket,
            'status': 'websocket_notifications_' + ('enabled' if settings.enable_websocket else 'disabled')
        })
    
    @action(detail=False, methods=['post'])
    def update_quiet_hours(self, request):
        """Update quiet hours settings"""
        settings = self.get_object()
        
        enable_quiet_hours = request.data.get('enable_quiet_hours')
        quiet_start_time = request.data.get('quiet_start_time')
        quiet_end_time = request.data.get('quiet_end_time')
        
        if enable_quiet_hours is not None:
            settings.enable_quiet_hours = enable_quiet_hours
        
        if quiet_start_time:
            from datetime import datetime
            settings.quiet_start_time = datetime.strptime(quiet_start_time, '%H:%M').time()
        
        if quiet_end_time:
            from datetime import datetime
            settings.quiet_end_time = datetime.strptime(quiet_end_time, '%H:%M').time()
        
        settings.save(update_fields=['enable_quiet_hours', 'quiet_start_time', 'quiet_end_time'])
        
        serializer = self.get_serializer(settings)
        return Response(serializer.data)


class AdminNotificationViewSet(viewsets.ViewSet):
    """
    Admin-only ViewSet for sending notifications
    """
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """Only allow staff users"""
        self.permission_classes = [IsAuthenticated]
        permissions = [permission() for permission in self.permission_classes]
        
        # Add staff check
        if not self.request.user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Admin access required")
        
        return permissions
    
    @action(detail=False, methods=['post'])
    def send_notification(self, request):
        """Send notification to specific users"""
        service = RealtimeNotificationService()
        
        recipient_ids = request.data.get('recipient_ids', [])
        notification_type = request.data.get('notification_type', 'admin_alert')
        title = request.data.get('title')
        message = request.data.get('message')
        priority = request.data.get('priority', 'normal')
        
        if not title or not message:
            return Response(
                {'error': 'Title and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        recipients = User.objects.filter(id__in=recipient_ids)
        notifications = service.send_bulk_notification(
            recipients=recipients,
            notification_type=notification_type,
            title=title,
            message=message,
            priority=priority,
            sender=request.user
        )
        
        return Response({
            'status': 'notifications_sent',
            'count': len(notifications),
            'notification_ids': [str(n.id) for n in notifications]
        })
    
    @action(detail=False, methods=['post'])
    def send_admin_alert(self, request):
        """Send alert to all admin users"""
        service = RealtimeNotificationService()
        
        title = request.data.get('title')
        message = request.data.get('message')
        priority = request.data.get('priority', 'normal')
        
        if not title or not message:
            return Response(
                {'error': 'Title and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        notifications = service.send_admin_notification(
            title=title,
            message=message,
            priority=priority,
            sender=request.user
        )
        
        return Response({
            'status': 'admin_alert_sent',
            'count': len(notifications),
            'notification_ids': [str(n.id) for n in notifications]
        })
    
    @action(detail=False, methods=['post'])
    def system_announcement(self, request):
        """Send system-wide announcement"""
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        announcement = {
            'title': request.data.get('title'),
            'message': request.data.get('message'),
            'priority': request.data.get('priority', 'normal'),
            'timestamp': timezone.now().isoformat(),
            'sender': request.user.get_full_name() or request.user.email
        }
        
        if not announcement['title'] or not announcement['message']:
            return Response(
                {'error': 'Title and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            "system_announcements",
            {
                'type': 'system_announcement',
                'announcement': announcement
            }
        )
        
        return Response({
            'status': 'system_announcement_sent',
            'announcement': announcement
        })