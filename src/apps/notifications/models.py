from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
import uuid

User = get_user_model()


class NotificationType(models.Model):
    """Define different types of notifications"""
    CATEGORY_CHOICES = [
        ('system', 'System'),
        ('music', 'Music & Releases'),
        ('payment', 'Payment & Billing'),
        ('marketing', 'Marketing'),
        ('admin', 'Admin'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    # Email template settings
    email_subject_template = models.CharField(max_length=200, blank=True)
    email_template_name = models.CharField(max_length=100, blank=True)
    
    # Default settings
    default_email_enabled = models.BooleanField(default=True)
    default_push_enabled = models.BooleanField(default=True)
    default_in_app_enabled = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_types'
        verbose_name = _('Notification Type')
        verbose_name_plural = _('Notification Types')
    
    def __str__(self):
        return f"{self.name} ({self.category})"


class Notification(models.Model):
    """Individual notification instances"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('read', 'Read'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification_type = models.ForeignKey(NotificationType, on_delete=models.CASCADE)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    
    # Content
    title = models.CharField(max_length=200)
    message = models.TextField()
    context_data = models.JSONField(default=dict, blank=True)  # Additional data for templates
    
    # Delivery channels
    send_email = models.BooleanField(default=True)
    send_push = models.BooleanField(default=True)
    send_in_app = models.BooleanField(default=True)
    
    # Status tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    
    # Related objects (optional)
    related_song = models.ForeignKey('songs.Song', on_delete=models.CASCADE, null=True, blank=True)
    related_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='related_notifications')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)  # For scheduled notifications
    
    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'status']),
            models.Index(fields=['notification_type']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.recipient.get_full_name()}"
    
    def mark_as_read(self):
        """Mark notification as read"""
        if self.status != 'read':
            self.status = 'read'
            self.read_at = models.DateTimeField.now()
            self.save(update_fields=['status', 'read_at'])
    
    def mark_as_sent(self):
        """Mark notification as sent"""
        if self.status == 'pending':
            self.status = 'sent'
            self.sent_at = models.DateTimeField.now()
            self.save(update_fields=['status', 'sent_at'])


class UserNotificationPreference(models.Model):
    """User preferences for different notification types"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notification_preferences')
    notification_type = models.ForeignKey(NotificationType, on_delete=models.CASCADE)
    
    # Channel preferences
    email_enabled = models.BooleanField(default=True)
    push_enabled = models.BooleanField(default=True)
    in_app_enabled = models.BooleanField(default=True)
    
    # Frequency settings for non-urgent notifications
    frequency = models.CharField(max_length=20, choices=[
        ('immediate', 'Immediate'),
        ('hourly', 'Hourly Digest'),
        ('daily', 'Daily Digest'),
        ('weekly', 'Weekly Digest'),
        ('never', 'Never'),
    ], default='immediate')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_notification_preferences'
        unique_together = ['user', 'notification_type']
        verbose_name = _('User Notification Preference')
        verbose_name_plural = _('User Notification Preferences')
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.notification_type.name}"


class EmailTemplate(models.Model):
    """Customizable email templates"""
    TEMPLATE_TYPE_CHOICES = [
        ('transactional', 'Transactional'),
        ('promotional', 'Promotional'),
        ('system', 'System'),
        ('digest', 'Digest'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPE_CHOICES)
    notification_type = models.ForeignKey(NotificationType, on_delete=models.CASCADE, null=True, blank=True)
    
    # Template content
    subject_template = models.CharField(max_length=200)
    html_template = models.TextField()
    text_template = models.TextField(blank=True)
    
    # Settings
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    
    # A/B testing
    version = models.CharField(max_length=10, default='1.0')
    parent_template = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'email_templates'
        verbose_name = _('Email Template')
        verbose_name_plural = _('Email Templates')
    
    def __str__(self):
        return f"{self.name} ({self.template_type})"


class NotificationLog(models.Model):
    """Log of sent notifications for analytics"""
    STATUS_CHOICES = [
        ('sent', 'Sent'),
        ('delivered', 'Delivered'),
        ('opened', 'Opened'),
        ('clicked', 'Clicked'),
        ('bounced', 'Bounced'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    notification = models.ForeignKey(Notification, on_delete=models.CASCADE, related_name='logs')
    
    # Delivery details
    channel = models.CharField(max_length=20, choices=[
        ('email', 'Email'),
        ('push', 'Push'),
        ('in_app', 'In-App'),
        ('sms', 'SMS'),
    ])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Email specific tracking
    email_id = models.CharField(max_length=100, blank=True)  # For email service provider tracking
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    
    # Error details
    error_message = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'notification_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['notification', 'channel']),
            models.Index(fields=['status', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.notification.title} - {self.channel} - {self.status}"
