from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from .models import User, UserProfile


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced User admin with music platform features"""
    
    list_display = [
        'email', 'get_full_name', 'role', 'subscription', 'is_verified', 
        'is_artist_verified', 'date_joined', 'last_login', 'get_songs_count'
    ]
    list_filter = [
        'role', 'subscription', 'is_verified', 'is_artist_verified', 
        'is_active', 'date_joined', 'last_login'
    ]
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering = ['-date_joined']
    
    # Fieldsets for the edit form
    fieldsets = (
        ('Authentication', {
            'fields': ('email', 'username', 'password')
        }),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'phone_number', 'location')
        }),
        ('Profile', {
            'fields': ('role', 'subscription', 'subscription_expires_at', 'bio', 'profile_image', 'website')
        }),
        ('Social Media', {
            'fields': ('instagram_url', 'twitter_url', 'facebook_url', 'youtube_url', 'spotify_url'),
            'classes': ('collapse',)
        }),
        ('Verification', {
            'fields': ('is_verified', 'is_artist_verified', 'verification_documents')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Fields for the add form
    add_fieldsets = (
        ('Create New User', {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login', 'created_at', 'updated_at', 'get_songs_count']
    
    # Custom actions
    actions = ['verify_artists', 'unverify_artists', 'upgrade_to_premium']
    
    def get_full_name(self, obj):
        return obj.get_full_name()
    get_full_name.short_description = 'Full Name'
    
    def get_songs_count(self, obj):
        count = obj.songs.count()
        if count > 0:
            url = reverse('admin:songs_song_changelist') + f'?artist__id__exact={obj.id}'
            return format_html('<a href="{}">{} songs</a>', url, count)
        return count
    get_songs_count.short_description = 'Songs'
    
    def verify_artists(self, request, queryset):
        updated = queryset.filter(role='artist').update(is_artist_verified=True)
        self.message_user(request, f'{updated} artists verified successfully.')
    verify_artists.short_description = "Verify selected artists"
    
    def unverify_artists(self, request, queryset):
        updated = queryset.update(is_artist_verified=False)
        self.message_user(request, f'{updated} users unverified.')
    unverify_artists.short_description = "Remove verification"
    
    def upgrade_to_premium(self, request, queryset):
        updated = queryset.update(subscription='gold')
        self.message_user(request, f'{updated} users upgraded to Gold.')
    upgrade_to_premium.short_description = "Upgrade to Gold subscription"


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """User profile administration"""
    
    list_display = [
        'user', 'total_releases', 'total_streams', 'total_revenue', 
        'preferred_currency', 'profile_visible', 'email_notifications'
    ]
    list_filter = [
        'profile_visible', 'email_notifications', 'marketing_emails', 
        'preferred_currency', 'language'
    ]
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Notifications', {
            'fields': ('email_notifications', 'marketing_emails', 'push_notifications', 'release_updates')
        }),
        ('Privacy', {
            'fields': ('profile_visible', 'show_email', 'show_phone', 'data_sharing')
        }),
        ('Preferences', {
            'fields': ('preferred_currency', 'timezone', 'language')
        }),
        ('Statistics', {
            'fields': ('total_releases', 'total_streams', 'total_revenue'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['total_releases', 'total_streams', 'total_revenue']
