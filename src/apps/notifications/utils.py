from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Notification)
def send_realtime_notification(sender, instance, created, **kwargs):
    """
    Send real-time notification when a new notification is created
    """
    if created and instance.send_in_app:
        try:
            # Try to send via WebSocket if channels is available
            send_notification_to_user(instance)
        except Exception as e:
            logger.error(f"Failed to send real-time notification: {str(e)}")


def send_notification_to_user(notification):
    """
    Send notification to user via WebSocket
    """
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        if channel_layer:
            group_name = f"notifications_{notification.recipient.id}"
            
            # Prepare notification data
            notification_data = {
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'priority': notification.priority,
                'created_at': notification.created_at.isoformat(),
                'notification_type': {
                    'name': notification.notification_type.name,
                    'category': notification.notification_type.category,
                }
            }
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_message',
                    'notification': notification_data
                }
            )
            
            logger.info(f"Real-time notification sent to user {notification.recipient.email}")
    
    except ImportError:
        # Channels not installed, skip WebSocket functionality
        logger.debug("Channels not available, skipping WebSocket notification")
    except Exception as e:
        logger.error(f"Failed to send WebSocket notification: {str(e)}")


def send_unread_count_update(user_id, count):
    """
    Send unread count update to user
    """
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        
        channel_layer = get_channel_layer()
        if channel_layer:
            group_name = f"notifications_{user_id}"
            
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'unread_count_update',
                    'count': count
                }
            )
    
    except ImportError:
        # Channels not installed, skip WebSocket functionality
        pass
    except Exception as e:
        logger.error(f"Failed to send unread count update: {str(e)}")


# Frontend notification component helper
def create_toast_notification(title, message, type="info", duration=5000):
    """
    Helper function to create frontend toast notification data
    """
    return {
        'title': title,
        'message': message,
        'type': type,  # 'success', 'error', 'warning', 'info'
        'duration': duration,
        'timestamp': str(timezone.now().isoformat())
    }
