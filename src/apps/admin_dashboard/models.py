from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
import uuid

User = get_user_model()


class AdminAction(models.Model):
    """Track all admin actions for audit purposes"""
    ACTION_TYPES = [
        ('user_create', 'User Created'),
        ('user_update', 'User Updated'),
        ('user_delete', 'User Deleted'),
        ('user_verify', 'User Verified'),
        ('user_suspend', 'User Suspended'),
        ('song_approve', 'Song Approved'),
        ('song_reject', 'Song Rejected'),
        ('song_delete', 'Song Deleted'),
        ('payment_process', 'Payment Processed'),
        ('payment_refund', 'Payment Refunded'),
        ('notification_send', 'Notification Sent'),
        ('settings_update', 'Settings Updated'),
        ('bulk_action', 'Bulk Action'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    admin_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_actions')
    action_type = models.CharField(max_length=50, choices=ACTION_TYPES)
    target_model = models.CharField(max_length=50)  # User, Song, Payment, etc.
    target_id = models.CharField(max_length=100)  # ID of the affected object
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)  # Additional data about the action
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'admin_actions'
        ordering = ['-created_at']
        verbose_name = _('Admin Action')
        verbose_name_plural = _('Admin Actions')
    
    def __str__(self):
        return f"{self.admin_user.username} - {self.get_action_type_display()}"


class SystemSettings(models.Model):
    """Global platform settings"""
    SETTING_TYPES = [
        ('commission', 'Commission Rate'),
        ('upload_limit', 'Upload Limit'),
        ('file_size_limit', 'File Size Limit'),
        ('feature_flag', 'Feature Flag'),
        ('maintenance', 'Maintenance Mode'),
        ('email_template', 'Email Template'),
        ('platform_fee', 'Platform Fee'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    setting_type = models.CharField(max_length=20, choices=SETTING_TYPES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_settings')
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='updated_settings')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'system_settings'
        ordering = ['key']
        verbose_name = _('System Setting')
        verbose_name_plural = _('System Settings')
    
    def __str__(self):
        return f"{self.key}: {self.value}"


class PlatformAnalytics(models.Model):
    """Store daily platform analytics"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date = models.DateField(unique=True)
    
    # User metrics
    total_users = models.PositiveIntegerField(default=0)
    new_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    verified_artists = models.PositiveIntegerField(default=0)
    
    # Content metrics
    total_songs = models.PositiveIntegerField(default=0)
    new_songs = models.PositiveIntegerField(default=0)
    approved_songs = models.PositiveIntegerField(default=0)
    pending_songs = models.PositiveIntegerField(default=0)
    rejected_songs = models.PositiveIntegerField(default=0)
    
    # Financial metrics
    total_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    daily_revenue = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    total_payouts = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    daily_payouts = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    platform_commission = models.DecimalField(max_digits=15, decimal_places=2, default=0.00)
    
    # Subscription metrics
    bronze_subscribers = models.PositiveIntegerField(default=0)
    gold_subscribers = models.PositiveIntegerField(default=0)
    platinum_subscribers = models.PositiveIntegerField(default=0)
    free_users = models.PositiveIntegerField(default=0)
    
    # Support metrics
    total_tickets = models.PositiveIntegerField(default=0)
    open_tickets = models.PositiveIntegerField(default=0)
    resolved_tickets = models.PositiveIntegerField(default=0)
    
    # System metrics
    api_requests = models.PositiveIntegerField(default=0)
    upload_requests = models.PositiveIntegerField(default=0)
    download_requests = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'platform_analytics'
        ordering = ['-date']
        verbose_name = _('Platform Analytics')
        verbose_name_plural = _('Platform Analytics')
    
    def __str__(self):
        return f"Analytics for {self.date}"


class BulkNotification(models.Model):
    """For sending bulk notifications to users"""
    RECIPIENT_TYPES = [
        ('all', 'All Users'),
        ('artists', 'All Artists'),
        ('subscribers', 'All Subscribers'),
        ('free_users', 'Free Users'),
        ('specific_plan', 'Specific Subscription Plan'),
        ('custom', 'Custom Selection'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('sending', 'Sending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    message = models.TextField()
    recipient_type = models.CharField(max_length=20, choices=RECIPIENT_TYPES)
    recipient_filter = models.JSONField(default=dict, blank=True)  # Additional filters
    
    # Delivery options
    send_email = models.BooleanField(default=True)
    send_push = models.BooleanField(default=True)
    send_in_app = models.BooleanField(default=True)
    
    # Scheduling
    scheduled_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    # Stats
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    total_recipients = models.PositiveIntegerField(default=0)
    successful_sends = models.PositiveIntegerField(default=0)
    failed_sends = models.PositiveIntegerField(default=0)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bulk_notifications')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'bulk_notifications'
        ordering = ['-created_at']
        verbose_name = _('Bulk Notification')
        verbose_name_plural = _('Bulk Notifications')
    
    def __str__(self):
        return f"{self.title} - {self.get_recipient_type_display()}"
