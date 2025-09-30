"""
Real-time notification models for WebSocket-based notifications
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()


class RealtimeNotification(models.Model):
    """
    Model for real-time notifications sent via WebSocket
    """
    NOTIFICATION_TYPES = [
        ('contact_received', 'Contact Message Received'),
        ('contact_replied', 'Contact Message Replied'),
        ('song_uploaded', 'Song Uploaded'),
        ('song_approved', 'Song Approved'),
        ('song_rejected', 'Song Rejected'),
        ('payment_received', 'Payment Received'),
        ('user_registered', 'User Registered'),
        ('admin_alert', 'Admin Alert'),
        ('system_maintenance', 'System Maintenance'),
        ('welcome_message', 'Welcome Message'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('read', 'Read'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='realtime_notifications')
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_realtime_notifications')
    
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    
    title = models.CharField(max_length=200)
    message = models.TextField()
    action_url = models.URLField(blank=True, null=True, help_text="URL for notification action")
    action_text = models.CharField(max_length=50, blank=True, null=True, help_text="Text for action button")
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional notification data")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True, help_text="Notification expiry time")
    
    # WebSocket specific
    channel_name = models.CharField(max_length=100, blank=True, null=True, help_text="WebSocket channel name")
    retry_count = models.PositiveIntegerField(default=0)
    max_retries = models.PositiveIntegerField(default=3)
    
    class Meta:
        db_table = 'realtime_notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'status']),
            models.Index(fields=['notification_type', 'priority']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.email} ({self.status})"
    
    def mark_as_sent(self):
        """Mark notification as sent"""
        self.status = 'sent'
        self.sent_at = timezone.now()
        self.save(update_fields=['status', 'sent_at'])
    
    def mark_as_delivered(self):
        """Mark notification as delivered"""
        self.status = 'delivered'
        self.delivered_at = timezone.now()
        self.save(update_fields=['status', 'delivered_at'])
    
    def mark_as_read(self):
        """Mark notification as read"""
        self.status = 'read'
        self.read_at = timezone.now()
        self.save(update_fields=['status', 'read_at'])
    
    def mark_as_failed(self):
        """Mark notification as failed"""
        self.status = 'failed'
        self.retry_count += 1
        self.save(update_fields=['status', 'retry_count'])
    
    def can_retry(self):
        """Check if notification can be retried"""
        return self.retry_count < self.max_retries and self.status == 'failed'
    
    def is_expired(self):
        """Check if notification has expired"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False
    
    def to_dict(self):
        """Convert notification to dictionary for WebSocket transmission"""
        return {
            'id': str(self.id),
            'type': self.notification_type,
            'priority': self.priority,
            'status': self.status,
            'title': self.title,
            'message': self.message,
            'action_url': self.action_url,
            'action_text': self.action_text,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat(),
            'sender': self.sender.get_full_name() if self.sender else None,
        }


class NotificationTemplate(models.Model):
    """
    Templates for real-time notifications
    """
    name = models.CharField(max_length=100, unique=True)
    notification_type = models.CharField(max_length=30, choices=RealtimeNotification.NOTIFICATION_TYPES)
    
    title_template = models.CharField(max_length=200, help_text="Title template with placeholders")
    message_template = models.TextField(help_text="Message template with placeholders")
    action_url_template = models.CharField(max_length=500, blank=True, null=True)
    action_text = models.CharField(max_length=50, blank=True, null=True)
    
    priority = models.CharField(max_length=10, choices=RealtimeNotification.PRIORITY_CHOICES, default='normal')
    expires_in_minutes = models.PositiveIntegerField(default=1440, help_text="Expiry time in minutes (default 24 hours)")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_templates'
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.notification_type})"
    
    def render(self, context):
        """Render template with context data"""
        from django.template import Template, Context
        
        title = Template(self.title_template).render(Context(context))
        message = Template(self.message_template).render(Context(context))
        action_url = None
        
        if self.action_url_template:
            action_url = Template(self.action_url_template).render(Context(context))
        
        return {
            'title': title,
            'message': message,
            'action_url': action_url,
            'action_text': self.action_text,
            'priority': self.priority,
            'expires_in_minutes': self.expires_in_minutes,
        }


class UserNotificationSettings(models.Model):
    """
    User preferences for real-time notifications
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='realtime_notification_settings')
    
    # WebSocket notifications
    enable_websocket = models.BooleanField(default=True)
    enable_browser_push = models.BooleanField(default=False)
    
    # Notification types preferences
    contact_notifications = models.BooleanField(default=True)
    song_notifications = models.BooleanField(default=True)
    payment_notifications = models.BooleanField(default=True)
    admin_notifications = models.BooleanField(default=True)
    system_notifications = models.BooleanField(default=True)
    
    # Quiet hours
    enable_quiet_hours = models.BooleanField(default=False)
    quiet_start_time = models.TimeField(default='22:00')
    quiet_end_time = models.TimeField(default='08:00')
    
    # Browser push settings
    push_endpoint = models.TextField(blank=True, null=True)
    push_p256dh = models.TextField(blank=True, null=True)
    push_auth = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_notification_settings'
    
    def __str__(self):
        return f"Notification Settings - {self.user.email}"
    
    def is_notification_type_enabled(self, notification_type):
        """Check if a specific notification type is enabled for the user"""
        type_mapping = {
            'contact_received': self.contact_notifications,
            'contact_replied': self.contact_notifications,
            'song_uploaded': self.song_notifications,
            'song_approved': self.song_notifications,
            'song_rejected': self.song_notifications,
            'payment_received': self.payment_notifications,
            'admin_alert': self.admin_notifications,
            'system_maintenance': self.system_notifications,
            'welcome_message': self.system_notifications,
        }
        return type_mapping.get(notification_type, True)
    
    def is_in_quiet_hours(self):
        """Check if current time is within quiet hours"""
        if not self.enable_quiet_hours:
            return False
        
        from datetime import time
        current_time = timezone.now().time()
        
        if self.quiet_start_time <= self.quiet_end_time:
            return self.quiet_start_time <= current_time <= self.quiet_end_time
        else:
            return current_time >= self.quiet_start_time or current_time <= self.quiet_end_time