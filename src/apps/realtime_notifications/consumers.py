"""
WebSocket consumer for real-time notifications
Enhanced version with comprehensive real-time features
"""
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()
logger = logging.getLogger(__name__)


class RealtimeNotificationConsumer(AsyncWebsocketConsumer):
    """
    Enhanced WebSocket consumer for real-time notifications
    """
    
    async def connect(self):
        """Handle WebSocket connection"""
        self.user = self.scope["user"]
        
        if self.user.is_anonymous:
            logger.warning("Anonymous user attempted WebSocket connection")
            await self.close(code=4001)
            return
        
        # Create user-specific group
        self.group_name = f"notifications_{self.user.id}"
        
        # Join the group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        logger.info(f"WebSocket connected: User {self.user.email} joined group {self.group_name}")
        
        # Send connection confirmation and initial data
        await self.send_connection_confirmation()
        await self.send_unread_count()
        await self.send_recent_notifications()
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
            logger.info(f"WebSocket disconnected: User {self.user.email} left group {self.group_name} (code: {close_code})")
    
    async def receive(self, text_data):
        """Handle messages from WebSocket client"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            logger.debug(f"Received WebSocket message: {message_type} from {self.user.email}")
            
            # Route message to appropriate handler
            handlers = {
                'mark_as_read': self.handle_mark_as_read,
                'mark_all_as_read': self.handle_mark_all_as_read,
                'get_unread_count': self.handle_get_unread_count,
                'get_notifications': self.handle_get_notifications,
                'ping': self.handle_ping,
                'subscribe_to_type': self.handle_subscribe_to_type,
                'unsubscribe_from_type': self.handle_unsubscribe_from_type,
            }
            
            handler = handlers.get(message_type)
            if handler:
                await handler(data)
            else:
                await self.send_error(f"Unknown message type: {message_type}")
        
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received from {self.user.email}")
            await self.send_error("Invalid JSON format")
        except Exception as e:
            logger.error(f"Error handling WebSocket message from {self.user.email}: {str(e)}")
            await self.send_error("Internal server error")
    
    async def handle_mark_as_read(self, data):
        """Mark a specific notification as read"""
        notification_id = data.get('notification_id')
        if not notification_id:
            await self.send_error("notification_id required")
            return
        
        success = await self.mark_notification_as_read(notification_id)
        await self.send(text_data=json.dumps({
            'type': 'mark_as_read_response',
            'notification_id': notification_id,
            'success': success
        }))
        
        if success:
            await self.send_unread_count()
    
    async def handle_mark_all_as_read(self, data):
        """Mark all notifications as read"""
        count = await self.mark_all_notifications_as_read()
        await self.send(text_data=json.dumps({
            'type': 'mark_all_as_read_response',
            'marked_count': count,
            'success': True
        }))
        await self.send_unread_count()
    
    async def handle_get_unread_count(self, data):
        """Send current unread count"""
        await self.send_unread_count()
    
    async def handle_get_notifications(self, data):
        """Send recent notifications"""
        limit = data.get('limit', 20)
        offset = data.get('offset', 0)
        status = data.get('status')
        
        notifications = await self.get_user_notifications(limit, offset, status)
        await self.send(text_data=json.dumps({
            'type': 'notifications_list',
            'notifications': notifications,
            'limit': limit,
            'offset': offset
        }))
    
    async def handle_ping(self, data):
        """Handle ping/pong for connection health"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))
    
    async def handle_subscribe_to_type(self, data):
        """Subscribe to specific notification types"""
        notification_type = data.get('notification_type')
        if notification_type:
            success = await self.update_notification_preference(notification_type, True)
            await self.send(text_data=json.dumps({
                'type': 'subscription_updated',
                'notification_type': notification_type,
                'subscribed': success
            }))
    
    async def handle_unsubscribe_from_type(self, data):
        """Unsubscribe from specific notification types"""
        notification_type = data.get('notification_type')
        if notification_type:
            success = await self.update_notification_preference(notification_type, False)
            await self.send(text_data=json.dumps({
                'type': 'subscription_updated',
                'notification_type': notification_type,
                'subscribed': not success
            }))
    
    async def send_connection_confirmation(self):
        """Send connection confirmation to client"""
        await self.send(text_data=json.dumps({
            'type': 'connection_confirmed',
            'user_id': self.user.id,
            'user_email': self.user.email,
            'timestamp': timezone.now().isoformat()
        }))
    
    async def send_unread_count(self):
        """Send current unread notification count"""
        unread_count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': unread_count
        }))
    
    async def send_recent_notifications(self, limit=5):
        """Send recent unread notifications"""
        notifications = await self.get_user_notifications(limit=limit, status='unread')
        await self.send(text_data=json.dumps({
            'type': 'recent_notifications',
            'notifications': notifications
        }))
    
    async def send_error(self, message):
        """Send error message to client"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message,
            'timestamp': timezone.now().isoformat()
        }))
    
    # Channel layer message handlers
    async def notification_message(self, event):
        """Handle new notification from channel layer"""
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification': event['notification']
        }))
    
    async def unread_count_update(self, event):
        """Handle unread count update from channel layer"""
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': event['count']
        }))
    
    async def system_announcement(self, event):
        """Handle system-wide announcements"""
        await self.send(text_data=json.dumps({
            'type': 'system_announcement',
            'announcement': event['announcement']
        }))
    
    # Database operations
    @database_sync_to_async
    def get_unread_count(self):
        """Get unread notification count"""
        from .models import RealtimeNotification
        return RealtimeNotification.objects.filter(
            recipient=self.user,
            status__in=['pending', 'sent', 'delivered']
        ).count()
    
    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        """Mark specific notification as read"""
        try:
            from .models import RealtimeNotification
            notification = RealtimeNotification.objects.get(
                id=notification_id,
                recipient=self.user
            )
            notification.mark_as_read()
            return True
        except RealtimeNotification.DoesNotExist:
            logger.error(f"Notification {notification_id} not found for user {self.user.id}")
            return False
    
    @database_sync_to_async
    def mark_all_notifications_as_read(self):
        """Mark all user's notifications as read"""
        from .models import RealtimeNotification
        notifications = RealtimeNotification.objects.filter(
            recipient=self.user,
            status__in=['pending', 'sent', 'delivered']
        )
        count = notifications.count()
        notifications.update(
            status='read',
            read_at=timezone.now()
        )
        return count
    
    @database_sync_to_async
    def get_user_notifications(self, limit=20, offset=0, status=None):
        """Get user's notifications"""
        from .models import RealtimeNotification
        
        queryset = RealtimeNotification.objects.filter(recipient=self.user)
        
        if status == 'unread':
            queryset = queryset.filter(status__in=['pending', 'sent', 'delivered'])
        elif status:
            queryset = queryset.filter(status=status)
        
        notifications = queryset[offset:offset + limit]
        return [notification.to_dict() for notification in notifications]
    
    @database_sync_to_async
    def update_notification_preference(self, notification_type, enabled):
        """Update user's notification preferences"""
        try:
            from .models import UserNotificationSettings
            settings, created = UserNotificationSettings.objects.get_or_create(
                user=self.user,
                defaults={'enable_websocket': True}
            )
            
            # Map notification types to settings fields
            type_mapping = {
                'contact_received': 'contact_notifications',
                'contact_replied': 'contact_notifications',
                'song_uploaded': 'song_notifications',
                'song_approved': 'song_notifications',
                'song_rejected': 'song_notifications',
                'payment_received': 'payment_notifications',
                'admin_alert': 'admin_notifications',
                'system_maintenance': 'system_notifications',
            }
            
            field_name = type_mapping.get(notification_type)
            if field_name:
                setattr(settings, field_name, enabled)
                settings.save(update_fields=[field_name])
                return True
            
            return False
        except Exception as e:
            logger.error(f"Error updating notification preference: {str(e)}")
            return False


class SystemAnnouncementConsumer(AsyncWebsocketConsumer):
    """
    Consumer for system-wide announcements
    """
    
    async def connect(self):
        """Handle connection to system announcements"""
        await self.channel_layer.group_add("system_announcements", self.channel_name)
        await self.accept()
        logger.info("Client connected to system announcements")
    
    async def disconnect(self, close_code):
        """Handle disconnection from system announcements"""
        await self.channel_layer.group_discard("system_announcements", self.channel_name)
        logger.info(f"Client disconnected from system announcements (code: {close_code})")
    
    async def system_announcement(self, event):
        """Send system announcement to client"""
        await self.send(text_data=json.dumps({
            'type': 'system_announcement',
            'announcement': event['announcement']
        }))