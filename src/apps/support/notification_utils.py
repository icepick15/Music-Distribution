"""
Notification utilities for the support app
"""
from django.contrib.auth import get_user_model
from src.apps.notifications.models import Notification, NotificationType
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

User = get_user_model()
logger = logging.getLogger(__name__)


def create_ticket_notification(ticket, notification_type_name, title, message, recipient=None):
    """
    Create a notification for ticket-related events
    
    Args:
        ticket: Ticket instance
        notification_type_name: Name of the notification type (e.g., 'ticket_created', 'ticket_updated')
        title: Notification title
        message: Notification message
        recipient: User to receive notification (defaults to ticket author)
    """
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


def notify_ticket_created(ticket):
    """Notify when a new ticket is created"""
    # Notify admins about new ticket
    admin_users = User.objects.filter(is_staff=True)
    for admin in admin_users:
        create_ticket_notification(
            ticket=ticket,
            notification_type_name='ticket_created_admin',
            title='New Support Ticket Created',
            message=f'A new support ticket "{ticket.title}" has been created by {ticket.author.get_full_name() or ticket.author.email}.',
            recipient=admin
        )
    
    # Confirm to user that ticket was created
    create_ticket_notification(
        ticket=ticket,
        notification_type_name='ticket_created_user',
        title='Support Ticket Created',
        message=f'Your support ticket "{ticket.title}" has been created successfully. Ticket ID: {ticket.ticket_id}',
        recipient=ticket.author
    )


def notify_ticket_updated(ticket, updated_by):
    """Notify when a ticket is updated"""
    if updated_by != ticket.author:
        # Notify user that their ticket was updated
        create_ticket_notification(
            ticket=ticket,
            notification_type_name='ticket_updated',
            title='Support Ticket Updated',
            message=f'Your support ticket "{ticket.title}" has been updated. Status: {ticket.get_status_display()}',
            recipient=ticket.author
        )


def notify_ticket_response(ticket, response, responder):
    """Notify when a response is added to a ticket"""
    if responder != ticket.author:
        # Notify user about staff response
        create_ticket_notification(
            ticket=ticket,
            notification_type_name='ticket_response',
            title='New Response to Your Ticket',
            message=f'A new response has been added to your ticket "{ticket.title}". Please check your ticket for details.',
            recipient=ticket.author
        )
    else:
        # Notify staff about user response
        if ticket.assignee:
            create_ticket_notification(
                ticket=ticket,
                notification_type_name='ticket_user_response',
                title='New User Response',
                message=f'The user has responded to ticket "{ticket.title}". Ticket ID: {ticket.ticket_id}',
                recipient=ticket.assignee
            )


def notify_ticket_assigned(ticket, assignee):
    """Notify when a ticket is assigned"""
    if assignee:
        create_ticket_notification(
            ticket=ticket,
            notification_type_name='ticket_assigned',
            title='Ticket Assigned to You',
            message=f'You have been assigned to ticket "{ticket.title}". Ticket ID: {ticket.ticket_id}',
            recipient=assignee
        )


def notify_ticket_status_changed(ticket, old_status, new_status, changed_by):
    """Notify when ticket status changes"""
    if changed_by != ticket.author:
        # Notify user about status change
        create_ticket_notification(
            ticket=ticket,
            notification_type_name='ticket_status_changed',
            title='Ticket Status Updated',
            message=f'Your ticket "{ticket.title}" status has been changed from {old_status} to {new_status}.',
            recipient=ticket.author
        )


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