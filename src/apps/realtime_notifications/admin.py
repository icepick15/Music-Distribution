"""
Admin interface for real-time notifications
"""
from django.contrib import admin
from django.utils.html import format_html
from django.utils import timezone
from django.urls import reverse
from django.db.models import Count, Q
from .models import RealtimeNotification, NotificationTemplate, UserNotificationSettings
from .services import RealtimeNotificationService


@admin.register(RealtimeNotification)
class RealtimeNotificationAdmin(admin.ModelAdmin):
    """
    Admin interface for real-time notifications
    """
    list_display = [
        'title', 'recipient_email', 'notification_type', 'priority', 
        'status_badge', 'created_at', 'action_buttons'
    ]
    list_filter = [
        'notification_type', 'priority', 'status', 'created_at',
        ('sender', admin.RelatedOnlyFieldListFilter),
    ]
    search_fields = ['title', 'message', 'recipient__email', 'recipient__first_name', 'recipient__last_name']
    readonly_fields = [
        'id', 'created_at', 'sent_at', 'delivered_at', 'read_at',
        'retry_count', 'is_expired'
    ]
    fieldsets = (
        ('Notification Details', {
            'fields': ('id', 'recipient', 'sender', 'notification_type', 'priority', 'status')
        }),
        ('Content', {
            'fields': ('title', 'message', 'action_url', 'action_text')
        }),
        ('Metadata', {
            'fields': ('metadata', 'expires_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'sent_at', 'delivered_at', 'read_at'),
            'classes': ('collapse',)
        }),
        ('Technical', {
            'fields': ('channel_name', 'retry_count', 'max_retries', 'is_expired'),
            'classes': ('collapse',)
        })
    )
    
    date_hierarchy = 'created_at'
    ordering = ['-created_at']
    
    actions = [
        'mark_as_read', 'mark_as_sent', 'retry_failed',
        'send_notification', 'delete_expired'
    ]
    
    def recipient_email(self, obj):
        """Display recipient email"""
        return obj.recipient.email
    recipient_email.short_description = 'Recipient'
    recipient_email.admin_order_field = 'recipient__email'
    
    def status_badge(self, obj):
        """Display status with color badge"""
        colors = {
            'pending': '#ffc107',
            'sent': '#17a2b8',
            'delivered': '#28a745',
            'read': '#6c757d',
            'failed': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    status_badge.admin_order_field = 'status'
    
    def action_buttons(self, obj):
        """Display action buttons"""
        buttons = []
        
        if obj.status in ['pending', 'failed']:
            buttons.append(format_html(
                '<a class="button" href="{}">Send</a>',
                reverse('admin:realtime_send_notification', args=[obj.pk])
            ))
        
        if obj.status in ['pending', 'sent', 'delivered']:
            buttons.append(format_html(
                '<a class="button" href="{}">Mark Read</a>',
                reverse('admin:realtime_mark_read', args=[obj.pk])
            ))
        
        return format_html(' '.join(buttons))
    action_buttons.short_description = 'Actions'
    
    def mark_as_read(self, request, queryset):
        """Mark selected notifications as read"""
        count = 0
        for notification in queryset:
            if notification.status in ['pending', 'sent', 'delivered']:
                notification.mark_as_read()
                count += 1
        
        self.message_user(request, f'Marked {count} notifications as read.')
    mark_as_read.short_description = 'Mark selected as read'
    
    def mark_as_sent(self, request, queryset):
        """Mark selected notifications as sent"""
        count = 0
        for notification in queryset.filter(status='pending'):
            notification.mark_as_sent()
            count += 1
        
        self.message_user(request, f'Marked {count} notifications as sent.')
    mark_as_sent.short_description = 'Mark selected as sent'
    
    def retry_failed(self, request, queryset):
        """Retry failed notifications"""
        service = RealtimeNotificationService()
        count = 0
        
        for notification in queryset.filter(status='failed'):
            if notification.can_retry() and not notification.is_expired():
                if service.send_notification(notification):
                    count += 1
        
        self.message_user(request, f'Retried {count} failed notifications.')
    retry_failed.short_description = 'Retry failed notifications'
    
    def send_notification(self, request, queryset):
        """Send pending notifications"""
        service = RealtimeNotificationService()
        count = 0
        
        for notification in queryset.filter(status='pending'):
            if not notification.is_expired():
                if service.send_notification(notification):
                    count += 1
        
        self.message_user(request, f'Sent {count} notifications.')
    send_notification.short_description = 'Send selected notifications'
    
    def delete_expired(self, request, queryset):
        """Delete expired notifications"""
        expired = queryset.filter(expires_at__lt=timezone.now())
        count = expired.count()
        expired.delete()
        
        self.message_user(request, f'Deleted {count} expired notifications.')
    delete_expired.short_description = 'Delete expired notifications'


@admin.register(NotificationTemplate)
class NotificationTemplateAdmin(admin.ModelAdmin):
    """
    Admin interface for notification templates
    """
    list_display = [
        'name', 'notification_type', 'priority', 'expires_in_minutes',
        'is_active', 'template_preview', 'created_at'
    ]
    list_filter = ['notification_type', 'priority', 'is_active', 'created_at']
    search_fields = ['name', 'title_template', 'message_template']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Template Details', {
            'fields': ('name', 'notification_type', 'priority', 'is_active')
        }),
        ('Content Templates', {
            'fields': ('title_template', 'message_template', 'action_url_template', 'action_text')
        }),
        ('Settings', {
            'fields': ('expires_in_minutes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['activate_templates', 'deactivate_templates', 'test_template']
    
    def template_preview(self, obj):
        """Show template preview"""
        return format_html(
            '<details><summary>Preview</summary><div style="padding: 10px; background: #f8f9fa; border-radius: 3px;"><strong>{}</strong><br>{}</div></details>',
            obj.title_template[:50] + ('...' if len(obj.title_template) > 50 else ''),
            obj.message_template[:100] + ('...' if len(obj.message_template) > 100 else '')
        )
    template_preview.short_description = 'Preview'
    
    def activate_templates(self, request, queryset):
        """Activate selected templates"""
        count = queryset.update(is_active=True)
        self.message_user(request, f'Activated {count} templates.')
    activate_templates.short_description = 'Activate selected templates'
    
    def deactivate_templates(self, request, queryset):
        """Deactivate selected templates"""
        count = queryset.update(is_active=False)
        self.message_user(request, f'Deactivated {count} templates.')
    deactivate_templates.short_description = 'Deactivate selected templates'
    
    def test_template(self, request, queryset):
        """Test templates with sample data"""
        # This would typically redirect to a template testing view
        self.message_user(request, f'Testing {queryset.count()} templates.')
    test_template.short_description = 'Test selected templates'


@admin.register(UserNotificationSettings)
class UserNotificationSettingsAdmin(admin.ModelAdmin):
    """
    Admin interface for user notification settings
    """
    list_display = [
        'user_email', 'enable_websocket', 'enable_browser_push',
        'notification_types_summary', 'quiet_hours_status', 'updated_at'
    ]
    list_filter = [
        'enable_websocket', 'enable_browser_push', 'enable_quiet_hours',
        'contact_notifications', 'song_notifications', 'payment_notifications',
        'admin_notifications', 'system_notifications'
    ]
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('WebSocket Settings', {
            'fields': ('enable_websocket', 'enable_browser_push')
        }),
        ('Notification Types', {
            'fields': (
                'contact_notifications', 'song_notifications', 'payment_notifications',
                'admin_notifications', 'system_notifications'
            )
        }),
        ('Quiet Hours', {
            'fields': ('enable_quiet_hours', 'quiet_start_time', 'quiet_end_time'),
            'classes': ('collapse',)
        }),
        ('Browser Push (Advanced)', {
            'fields': ('push_endpoint', 'push_p256dh', 'push_auth'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    actions = ['enable_websocket', 'disable_websocket', 'reset_to_defaults']
    
    def user_email(self, obj):
        """Display user email"""
        return obj.user.email
    user_email.short_description = 'User Email'
    user_email.admin_order_field = 'user__email'
    
    def notification_types_summary(self, obj):
        """Show enabled notification types"""
        enabled = []
        if obj.contact_notifications:
            enabled.append('Contact')
        if obj.song_notifications:
            enabled.append('Songs')
        if obj.payment_notifications:
            enabled.append('Payments')
        if obj.admin_notifications:
            enabled.append('Admin')
        if obj.system_notifications:
            enabled.append('System')
        
        return ', '.join(enabled) if enabled else 'None'
    notification_types_summary.short_description = 'Enabled Types'
    
    def quiet_hours_status(self, obj):
        """Show quiet hours status"""
        if not obj.enable_quiet_hours:
            return '❌ Disabled'
        elif obj.is_in_quiet_hours():
            return '🔕 Active'
        else:
            return '✅ Inactive'
    quiet_hours_status.short_description = 'Quiet Hours'
    
    def enable_websocket(self, request, queryset):
        """Enable WebSocket for selected users"""
        count = queryset.update(enable_websocket=True)
        self.message_user(request, f'Enabled WebSocket for {count} users.')
    enable_websocket.short_description = 'Enable WebSocket notifications'
    
    def disable_websocket(self, request, queryset):
        """Disable WebSocket for selected users"""
        count = queryset.update(enable_websocket=False)
        self.message_user(request, f'Disabled WebSocket for {count} users.')
    disable_websocket.short_description = 'Disable WebSocket notifications'
    
    def reset_to_defaults(self, request, queryset):
        """Reset settings to defaults"""
        count = queryset.update(
            enable_websocket=True,
            enable_browser_push=False,
            contact_notifications=True,
            song_notifications=True,
            payment_notifications=True,
            admin_notifications=True,
            system_notifications=True,
            enable_quiet_hours=False
        )
        self.message_user(request, f'Reset settings for {count} users to defaults.')
    reset_to_defaults.short_description = 'Reset to default settings'


# Admin site customization
admin.site.site_header = "Music Distribution - Real-time Notifications"
admin.site.site_title = "Real-time Notifications Admin"
admin.site.index_title = "Real-time Notifications Management"