"""
Notification utilities for creating and sending notifications
"""
from django.contrib.auth import get_user_model
from .models import Notification, NotificationType
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


def send_realtime_notification(user, notification):
    """
    Send real-time notification via WebSocket
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            group_name = f"notifications_{user.id}"
            
            # Prepare notification data
            notification_data = {
                'id': str(notification.id),
                'title': notification.title,
                'message': notification.message,
                'priority': notification.priority,
                'status': notification.status,
                'created_at': notification.created_at.isoformat(),
                'notification_type': {
                    'name': notification.notification_type.name,
                    'category': notification.notification_type.category,
                }
            }
            
            # Send to WebSocket group
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'send_notification',
                    'notification': notification_data
                }
            )
            
            logger.info(f"Sent real-time notification to user {user.id}")
    
    except Exception as e:
        logger.error(f"Failed to send real-time notification: {str(e)}")


def create_notification(recipient, title, message, notification_type_name='admin_message', priority='normal', context_data=None):
    """
    Create a notification for a user
    
    Args:
        recipient: User to receive notification
        title: Notification title
        message: Notification message
        notification_type_name: Name of the notification type
        priority: Notification priority (low, normal, high, urgent)
        context_data: Additional context data
    """
    try:
        # Get or create notification type
        notification_type, created = NotificationType.objects.get_or_create(
            name=notification_type_name,
            defaults={
                'category': 'admin',
                'description': f'Notification for {notification_type_name}',
                'email_subject_template': title,
                'default_email_enabled': True,
                'default_push_enabled': True,
                'default_in_app_enabled': True,
            }
        )
        
        # Create notification
        notification = Notification.objects.create(
            notification_type=notification_type,
            recipient=recipient,
            title=title,
            message=message,
            priority=priority,
            send_email=True,
            send_push=True,
            send_in_app=True,
            context_data=context_data or {},
        )
        
        # Send real-time notification via WebSocket
        send_realtime_notification(recipient, notification)
        
        return notification
        
    except Exception as e:
        logger.error(f"Failed to create notification: {str(e)}")
        return None


def create_admin_broadcast(title, message, priority='normal', sender=None):
    """
    Create a broadcast notification to all users
    """
    try:
        # Get or create admin message notification type
        notification_type, created = NotificationType.objects.get_or_create(
            name='admin_broadcast',
            defaults={
                'category': 'admin',
                'description': 'Admin broadcast message',
                'email_subject_template': title,
                'default_email_enabled': True,
                'default_push_enabled': True,
                'default_in_app_enabled': True,
            }
        )
        
        # Get all users
        users = User.objects.filter(is_active=True)
        notifications_created = []
        
        for user in users:
            notification = Notification.objects.create(
                notification_type=notification_type,
                recipient=user,
                title=title,
                message=message,
                priority=priority,
                send_email=True,
                send_push=True,
                send_in_app=True,
            )
            notifications_created.append(notification)
            
            # Send real-time notification
            send_realtime_notification(user, notification)
        
        logger.info(f"Created {len(notifications_created)} broadcast notifications")
        return notifications_created
        
    except Exception as e:
        logger.error(f"Failed to create admin broadcast: {str(e)}")
        return []


def create_ticket_notification(ticket, notification_type_name, title, message, recipient=None):
    """
    Create a notification for ticket-related events
    
    Args:
        ticket: Ticket instance (can be None for admin messages)
        notification_type_name: Name of the notification type
        title: Notification title
        message: Notification message
        recipient: User to receive notification
    """
    if ticket is None:
        # For admin messages without specific ticket
        return create_notification(
            recipient=recipient,
            title=title,
            message=message,
            notification_type_name=notification_type_name,
            priority='normal'
        )
    
    try:
        # Get or create notification type
        notification_type, created = NotificationType.objects.get_or_create(
            name=notification_type_name,
            defaults={
                'category': 'system',
                'description': f'Notification for {notification_type_name}',
                'email_subject_template': title,
                'default_email_enabled': True,
                'default_push_enabled': True,
                'default_in_app_enabled': True,
            }
        )
        
        # Determine recipient
        if recipient is None:
            recipient = ticket.author
        
        # Create notification
        notification = Notification.objects.create(
            notification_type=notification_type,
            recipient=recipient,
            title=title,
            message=message,
            priority='normal',
            send_email=True,
            send_push=True,
            send_in_app=True,
            context_data={
                'ticket_id': str(ticket.id),
                'ticket_title': ticket.title,
                'ticket_status': ticket.status,
            }
        )
        
        # Send real-time notification via WebSocket
        send_realtime_notification(recipient, notification)
        
        return notification
        
    except Exception as e:
        logger.error(f"Failed to create ticket notification: {str(e)}")
        return None