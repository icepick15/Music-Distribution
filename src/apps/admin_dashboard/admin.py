from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db.models import Count, Sum
from django.utils.safestring import mark_safe
from .models import AdminAction, SystemSettings, PlatformAnalytics, BulkNotification


@admin.register(AdminAction)
class AdminActionAdmin(admin.ModelAdmin):
    """Enhanced Admin action logging and tracking"""
    
    list_display = ['admin_user', 'action_type', 'target_model', 'target_id', 'created_at']
    list_filter = ['action_type', 'target_model', 'created_at']
    search_fields = ['admin_user__username', 'description', 'target_id']
    readonly_fields = ['created_at']
    ordering = ['-created_at']


@admin.register(SystemSettings) 
class SystemSettingsAdmin(admin.ModelAdmin):
    """Enhanced Platform system settings management"""
    
    list_display = ['key', 'value', 'setting_type', 'is_active', 'updated_at']
    list_filter = ['setting_type', 'is_active']
    search_fields = ['key', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PlatformAnalytics)
class PlatformAnalyticsAdmin(admin.ModelAdmin):
    """Enhanced Platform analytics and metrics"""
    
    list_display = ['date', 'total_users', 'new_users', 'total_songs', 'daily_revenue']
    list_filter = ['date']
    ordering = ['-date']


@admin.register(BulkNotification)
class BulkNotificationAdmin(admin.ModelAdmin):
    """Enhanced Bulk notification management"""
    
    list_display = ['title', 'recipient_type', 'status', 'total_recipients', 'created_at']
    list_filter = ['recipient_type', 'status', 'created_at']
    search_fields = ['title', 'message']
    readonly_fields = ['total_recipients', 'successful_sends', 'failed_sends', 'sent_at']
