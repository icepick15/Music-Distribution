"""
Real-time notification service for WebSocket notifications
"""
import json
import logging
from datetime import timedelta
from typing import Dict, List, Optional
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import transaction

from .models import RealtimeNotification, NotificationTemplate, UserNotificationSettings

User = get_user_model()
logger = logging.getLogger(__name__)


class RealtimeNotificationService:
    """
    Service for managing real-time WebSocket notifications
    """
    
    def __init__(self):
        self.channel_layer = get_channel_layer()
    
    def create_notification(
        self,
        recipient: User,
        notification_type: str,
        title: str = None,
        message: str = None,
        sender: User = None,
        template_name: str = None,
        context: Dict = None,
        priority: str = 'normal',
        action_url: str = None,
        action_text: str = None,
        metadata: Dict = None,
        expires_in_minutes: int = 1440
    ) -> RealtimeNotification:
        """
        Create a new real-time notification
        """
        with transaction.atomic():
            # Check user notification preferences
            settings, created = UserNotificationSettings.objects.get_or_create(
                user=recipient,
                defaults={'enable_websocket': True}
            )
            
            if not settings.enable_websocket:
                logger.info(f"WebSocket notifications disabled for user {recipient.email}")
                return None
            
            if not settings.is_notification_type_enabled(notification_type):
                logger.info(f"Notification type '{notification_type}' disabled for user {recipient.email}")
                return None
            
            # Check quiet hours
            if settings.is_in_quiet_hours() and priority not in ['high', 'urgent']:
                logger.info(f"User {recipient.email} is in quiet hours, skipping notification")
                return None
            
            # Use template if specified
            if template_name:
                try:
                    template = NotificationTemplate.objects.get(
                        name=template_name,
                        is_active=True
                    )
                    rendered = template.render(context or {})
                    title = rendered['title']
                    message = rendered['message']
                    action_url = rendered['action_url'] or action_url
                    action_text = rendered['action_text'] or action_text
                    priority = rendered['priority']
                    expires_in_minutes = rendered['expires_in_minutes']
                except NotificationTemplate.DoesNotExist:
                    logger.error(f"Template '{template_name}' not found")
                    if not title or not message:
                        raise ValueError("Template not found and no title/message provided")
            
            # Create notification
            expires_at = timezone.now() + timedelta(minutes=expires_in_minutes)
            
            notification = RealtimeNotification.objects.create(
                recipient=recipient,
                sender=sender,
                notification_type=notification_type,
                priority=priority,
                title=title,
                message=message,
                action_url=action_url,
                action_text=action_text,
                metadata=metadata or {},
                expires_at=expires_at
            )
            
            logger.info(f"Created real-time notification {notification.id} for {recipient.email}")
            return notification
    
    def send_notification(self, notification: RealtimeNotification) -> bool:
        """
        Send notification via WebSocket
        """
        if notification.is_expired():
            logger.warning(f"Notification {notification.id} has expired, not sending")
            notification.mark_as_failed()
            return False
        
        try:
            group_name = f"notifications_{notification.recipient.id}"
            
            # Send to WebSocket group
            async_to_sync(self.channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_message',
                    'notification': notification.to_dict()
                }
            )
            
            notification.mark_as_sent()
            logger.info(f"Sent notification {notification.id} to WebSocket group {group_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send notification {notification.id}: {str(e)}")
            notification.mark_as_failed()
            return False
    
    def send_notification_now(
        self,
        recipient: User,
        notification_type: str,
        title: str = None,
        message: str = None,
        **kwargs
    ) -> Optional[RealtimeNotification]:
        """
        Create and immediately send a notification
        """
        notification = self.create_notification(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message,
            **kwargs
        )
        
        if notification:
            self.send_notification(notification)
        
        return notification
    
    def send_bulk_notification(
        self,
        recipients: List[User],
        notification_type: str,
        title: str,
        message: str,
        **kwargs
    ) -> List[RealtimeNotification]:
        """
        Send notification to multiple users
        """
        notifications = []
        
        for recipient in recipients:
            notification = self.send_notification_now(
                recipient=recipient,
                notification_type=notification_type,
                title=title,
                message=message,
                **kwargs
            )
            if notification:
                notifications.append(notification)
        
        logger.info(f"Sent bulk notification to {len(notifications)} users")
        return notifications
    
    def send_admin_notification(
        self,
        title: str,
        message: str,
        priority: str = 'normal',
        **kwargs
    ) -> List[RealtimeNotification]:
        """
        Send notification to all admin users
        """
        admin_users = User.objects.filter(is_staff=True, is_active=True)
        
        return self.send_bulk_notification(
            recipients=admin_users,
            notification_type='admin_alert',
            title=title,
            message=message,
            priority=priority,
            **kwargs
        )
    
    def update_unread_count(self, user: User):
        """
        Send updated unread count to user's WebSocket
        """
        try:
            unread_count = RealtimeNotification.objects.filter(
                recipient=user,
                status__in=['pending', 'sent', 'delivered']
            ).count()
            
            group_name = f"notifications_{user.id}"
            
            async_to_sync(self.channel_layer.group_send)(
                group_name,
                {
                    'type': 'unread_count_update',
                    'count': unread_count
                }
            )
            
            logger.debug(f"Updated unread count ({unread_count}) for user {user.email}")
            
        except Exception as e:
            logger.error(f"Failed to update unread count for user {user.id}: {str(e)}")
    
    def mark_notification_as_read(self, notification_id: str, user: User) -> bool:
        """
        Mark a notification as read and update unread count
        """
        try:
            notification = RealtimeNotification.objects.get(
                id=notification_id,
                recipient=user
            )
            notification.mark_as_read()
            self.update_unread_count(user)
            return True
        except RealtimeNotification.DoesNotExist:
            logger.error(f"Notification {notification_id} not found for user {user.id}")
            return False
    
    def get_user_notifications(
        self,
        user: User,
        status: str = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[RealtimeNotification]:
        """
        Get user's notifications
        """
        queryset = RealtimeNotification.objects.filter(recipient=user)
        
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset[offset:offset + limit]
    
    def cleanup_expired_notifications(self) -> int:
        """
        Remove expired notifications
        """
        expired_count = RealtimeNotification.objects.filter(
            expires_at__lt=timezone.now()
        ).delete()[0]
        
        logger.info(f"Cleaned up {expired_count} expired notifications")
        return expired_count
    
    def retry_failed_notifications(self) -> int:
        """
        Retry failed notifications that can be retried
        """
        from django.db.models import F
        failed_notifications = RealtimeNotification.objects.filter(
            status='failed',
            retry_count__lt=F('max_retries')
        )
        
        retry_count = 0
        for notification in failed_notifications:
            if notification.can_retry() and not notification.is_expired():
                if self.send_notification(notification):
                    retry_count += 1
        
        logger.info(f"Retried {retry_count} failed notifications")
        return retry_count


# Convenience function for quick access
def send_realtime_notification(
    recipient,
    notification_type: str,
    title: str,
    message: str,
    **kwargs
):
    """
    Quick function to send a real-time notification
    """
    service = RealtimeNotificationService()
    return service.send_notification_now(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        **kwargs
    )


def send_admin_alert(title: str, message: str, priority: str = 'normal', **kwargs):
    """
    Quick function to send admin alert
    """
    service = RealtimeNotificationService()
    return service.send_admin_notification(
        title=title,
        message=message,
        priority=priority,
        **kwargs
    )