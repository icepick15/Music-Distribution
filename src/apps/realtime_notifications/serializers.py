"""
Serializers for real-time notifications
"""
from rest_framework import serializers
from .models import RealtimeNotification, NotificationTemplate, UserNotificationSettings


class RealtimeNotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for real-time notifications
    """
    sender_name = serializers.SerializerMethodField()
    time_since_created = serializers.SerializerMethodField()
    is_expired = serializers.ReadOnlyField()
    
    class Meta:
        model = RealtimeNotification
        fields = [
            'id', 'notification_type', 'priority', 'status',
            'title', 'message', 'action_url', 'action_text',
            'metadata', 'sender_name', 'created_at', 'sent_at',
            'delivered_at', 'read_at', 'expires_at',
            'time_since_created', 'is_expired'
        ]
        read_only_fields = [
            'id', 'sent_at', 'delivered_at', 'read_at', 'created_at'
        ]
    
    def get_sender_name(self, obj):
        """Get sender's display name"""
        if obj.sender:
            return obj.sender.get_full_name() or obj.sender.email
        return None
    
    def get_time_since_created(self, obj):
        """Get human-readable time since creation"""
        from django.utils import timezone
        from datetime import timedelta
        
        now = timezone.now()
        diff = now - obj.created_at
        
        if diff < timedelta(minutes=1):
            return "Just now"
        elif diff < timedelta(hours=1):
            minutes = int(diff.total_seconds() / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif diff < timedelta(days=1):
            hours = int(diff.total_seconds() / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        elif diff < timedelta(days=7):
            days = diff.days
            return f"{days} day{'s' if days != 1 else ''} ago"
        else:
            return obj.created_at.strftime('%b %d, %Y')


class NotificationTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer for notification templates
    """
    notification_type_display = serializers.CharField(
        source='get_notification_type_display',
        read_only=True
    )
    
    class Meta:
        model = NotificationTemplate
        fields = [
            'id', 'name', 'notification_type', 'notification_type_display',
            'title_template', 'message_template', 'action_url_template',
            'action_text', 'priority', 'expires_in_minutes',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def validate_expires_in_minutes(self, value):
        """Validate expiry time"""
        if value <= 0:
            raise serializers.ValidationError("Expiry time must be positive")
        if value > 43200:  # 30 days
            raise serializers.ValidationError("Expiry time cannot exceed 30 days")
        return value


class UserNotificationSettingsSerializer(serializers.ModelSerializer):
    """
    Serializer for user notification settings
    """
    user_email = serializers.CharField(source='user.email', read_only=True)
    quiet_hours_status = serializers.SerializerMethodField()
    
    class Meta:
        model = UserNotificationSettings
        fields = [
            'id', 'user_email', 'enable_websocket', 'enable_browser_push',
            'contact_notifications', 'song_notifications', 'payment_notifications',
            'admin_notifications', 'system_notifications',
            'enable_quiet_hours', 'quiet_start_time', 'quiet_end_time',
            'quiet_hours_status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user_email', 'created_at', 'updated_at']
    
    def get_quiet_hours_status(self, obj):
        """Get current quiet hours status"""
        if not obj.enable_quiet_hours:
            return "disabled"
        
        if obj.is_in_quiet_hours():
            return "active"
        else:
            return "inactive"
    
    def validate(self, data):
        """Validate quiet hours"""
        enable_quiet_hours = data.get('enable_quiet_hours')
        quiet_start_time = data.get('quiet_start_time')
        quiet_end_time = data.get('quiet_end_time')
        
        if enable_quiet_hours and (not quiet_start_time or not quiet_end_time):
            raise serializers.ValidationError(
                "Quiet start and end times are required when quiet hours are enabled"
            )
        
        return data


class BulkNotificationSerializer(serializers.Serializer):
    """
    Serializer for sending bulk notifications
    """
    recipient_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text="List of user IDs to send notifications to"
    )
    notification_type = serializers.ChoiceField(
        choices=RealtimeNotification.NOTIFICATION_TYPES,
        default='admin_alert'
    )
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    priority = serializers.ChoiceField(
        choices=RealtimeNotification.PRIORITY_CHOICES,
        default='normal'
    )
    action_url = serializers.URLField(required=False, allow_blank=True)
    action_text = serializers.CharField(max_length=50, required=False, allow_blank=True)
    expires_in_minutes = serializers.IntegerField(default=1440, min_value=1, max_value=43200)
    
    def validate_recipient_ids(self, value):
        """Validate recipient IDs exist"""
        if not value:
            raise serializers.ValidationError("At least one recipient is required")
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        existing_ids = set(User.objects.filter(id__in=value).values_list('id', flat=True))
        invalid_ids = set(value) - existing_ids
        
        if invalid_ids:
            raise serializers.ValidationError(
                f"Invalid user IDs: {list(invalid_ids)}"
            )
        
        return value


class SystemAnnouncementSerializer(serializers.Serializer):
    """
    Serializer for system announcements
    """
    title = serializers.CharField(max_length=200)
    message = serializers.CharField()
    priority = serializers.ChoiceField(
        choices=RealtimeNotification.PRIORITY_CHOICES,
        default='normal'
    )
    
    def validate_title(self, value):
        """Validate announcement title"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Title must be at least 3 characters")
        return value.strip()
    
    def validate_message(self, value):
        """Validate announcement message"""
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters")
        return value.strip()