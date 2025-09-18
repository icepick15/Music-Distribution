from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class FeatureNotification(models.Model):
    """Track which users want to be notified about feature releases"""
    
    FEATURE_CHOICES = [
        ('distribution', 'Music Distribution'),
        ('real_time_analytics', 'Real-Time Analytics'),
        ('album_creation', 'Album Creation'),
        ('release_scheduling', 'Release Scheduling'),
        ('advanced_reports', 'Advanced Reports'),
        ('label_management', 'Label Management'),
        ('api_access', 'API Access'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('notified', 'Notified'),
        ('seen', 'Seen'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feature_notifications')
    feature = models.CharField(max_length=50, choices=FEATURE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    notified_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'feature']
        ordering = ['-created_at']

class FeatureUpdate(models.Model):
    """Track feature releases and updates"""
    
    UPDATE_TYPES = [
        ('new_feature', 'New Feature'),
        ('feature_update', 'Feature Update'),
        ('bug_fix', 'Bug Fix'),
        ('maintenance', 'Maintenance'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    feature = models.CharField(max_length=50)
    title = models.CharField(max_length=200)
    description = models.TextField()
    update_type = models.CharField(max_length=20, choices=UPDATE_TYPES)
    version = models.CharField(max_length=20, blank=True)
    release_date = models.DateTimeField()
    is_live = models.BooleanField(default=False)
    
    # Targeting
    requires_subscription = models.BooleanField(default=False)
    target_user_types = models.JSONField(default=list)  # ['free', 'pro', 'enterprise']
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-release_date']

class UserNotificationPreference(models.Model):
    """User preferences for how they want to receive updates"""
    
    NOTIFICATION_METHODS = [
        ('email', 'Email'),
        ('in_app', 'In-App Notification'),
        ('sms', 'SMS'),
        ('push', 'Push Notification'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    feature_updates = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=True)
    security_alerts = models.BooleanField(default=True)
    
    # Notification methods
    preferred_methods = models.JSONField(default=lambda: ['email', 'in_app'])
    
    # Frequency
    frequency = models.CharField(
        max_length=20,
        choices=[
            ('immediate', 'Immediate'),
            ('daily', 'Daily Digest'),
            ('weekly', 'Weekly Summary'),
        ],
        default='immediate'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class InAppNotification(models.Model):
    """In-app notifications for users"""
    
    NOTIFICATION_TYPES = [
        ('feature_release', 'Feature Release'),
        ('account_update', 'Account Update'),
        ('payment_update', 'Payment Update'),
        ('system_alert', 'System Alert'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=200)
    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    
    # Metadata
    action_url = models.URLField(blank=True)
    action_text = models.CharField(max_length=50, blank=True)
    
    # Status
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-created_at']
