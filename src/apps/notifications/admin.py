from django.contrib import admin
from .models import NotificationType, Notification, UserNotificationPreference, EmailTemplate, NotificationLog


@admin.register(NotificationType)
class NotificationTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'is_active', 'default_email_enabled', 'created_at')
    list_filter = ('category', 'is_active')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'recipient', 'notification_type', 'status', 'priority', 'created_at')
    list_filter = ('status', 'priority', 'notification_type', 'created_at')
    search_fields = ('title', 'message', 'recipient__email', 'recipient__first_name', 'recipient__last_name')
    readonly_fields = ('created_at', 'sent_at', 'read_at')
    raw_id_fields = ('recipient', 'related_song', 'related_user')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('notification_type', 'recipient', 'title', 'message')
        }),
        ('Delivery Settings', {
            'fields': ('send_email', 'send_push', 'send_in_app', 'priority', 'scheduled_for')
        }),
        ('Status', {
            'fields': ('status', 'created_at', 'sent_at', 'read_at')
        }),
        ('Related Objects', {
            'fields': ('related_song', 'related_user'),
            'classes': ('collapse',)
        }),
        ('Context Data', {
            'fields': ('context_data',),
            'classes': ('collapse',)
        }),
    )


@admin.register(UserNotificationPreference)
class UserNotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'email_enabled', 'push_enabled', 'frequency')
    list_filter = ('frequency', 'email_enabled', 'push_enabled', 'notification_type')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    raw_id_fields = ('user',)


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'template_type', 'is_active', 'is_default', 'version', 'created_at')
    list_filter = ('template_type', 'is_active', 'is_default')
    search_fields = ('name', 'subject_template')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'template_type', 'notification_type')
        }),
        ('Template Content', {
            'fields': ('subject_template', 'html_template', 'text_template')
        }),
        ('Settings', {
            'fields': ('is_active', 'is_default', 'version', 'parent_template')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = ('notification', 'channel', 'status', 'created_at')
    list_filter = ('channel', 'status', 'created_at')
    search_fields = ('notification__title', 'email_id')
    readonly_fields = ('created_at',)
    raw_id_fields = ('notification',)
    
    def has_add_permission(self, request):
        return False  # Logs are created automatically
    
    def has_change_permission(self, request, obj=None):
        return False  # Logs should not be modified
