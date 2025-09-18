from rest_framework import serializers
from .models import Notification, NotificationType, UserNotificationPreference, EmailTemplate


class NotificationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationType
        fields = ['id', 'name', 'category', 'description', 'is_active']


class NotificationSerializer(serializers.ModelSerializer):
    notification_type = NotificationTypeSerializer(read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'title', 'message', 'status', 'priority',
            'created_at', 'sent_at', 'read_at', 'time_ago', 'context_data'
        ]
        read_only_fields = ['id', 'created_at', 'sent_at']
    
    def get_time_ago(self, obj):
        from django.utils import timezone
        from django.utils.timesince import timesince
        return timesince(obj.created_at, timezone.now())


class UserNotificationPreferenceSerializer(serializers.ModelSerializer):
    notification_type = NotificationTypeSerializer(read_only=True)
    notification_type_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = UserNotificationPreference
        fields = [
            'id', 'notification_type', 'notification_type_id', 'email_enabled',
            'push_enabled', 'in_app_enabled', 'frequency'
        ]
    
    def create(self, validated_data):
        notification_type_id = validated_data.pop('notification_type_id')
        notification_type = NotificationType.objects.get(id=notification_type_id)
        validated_data['notification_type'] = notification_type
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class EmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailTemplate
        fields = [
            'id', 'name', 'template_type', 'subject_template', 'html_template',
            'text_template', 'is_active', 'is_default', 'version'
        ]
