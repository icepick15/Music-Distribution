from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.utils import timezone
from .models import Song, Genre, Platform, SongDistribution
from .album_models import Album, AlbumTrack


@admin.register(Song)
class SongAdmin(admin.ModelAdmin):
    """Comprehensive Song administration with approval workflow"""
    
    list_display = [
        'title', 'artist', 'get_status_badge', 'genre', 'release_type', 
        'total_streams', 'total_revenue', 'created_at', 'get_audio_player'
    ]
    list_filter = [
        'status', 'release_type', 'genre', 'is_explicit', 
        'created_at', 'distributed_at', 'artist__is_artist_verified'
    ]
    search_fields = ['title', 'artist__email', 'artist__first_name', 'artist__last_name', 'featured_artists']
    ordering = ['-created_at']
    
    # Enhanced fieldsets
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'artist', 'featured_artists')
        }),
        ('Release Details', {
            'fields': ('release_type', 'album_title', 'track_number', 'release_date')
        }),
        ('Content', {
            'fields': ('audio_file', 'audio_url', 'cover_image', 'cover_url', 'duration'),
            'description': 'Upload files or provide direct URLs'
        }),
        ('Metadata', {
            'fields': ('genre', 'subgenre', 'composer', 'publisher', 'isrc_code')
        }),
        ('Pricing & Distribution', {
            'fields': ('price', 'is_explicit', 'status')
        }),
        ('Analytics', {
            'fields': ('total_streams', 'total_downloads', 'total_revenue'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'submitted_at', 'approved_at', 'distributed_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = [
        'created_at', 'updated_at', 'submitted_at', 'approved_at', 
        'distributed_at', 'total_streams', 'total_downloads', 'total_revenue'
    ]
    
    # Custom actions for content moderation
    actions = ['approve_songs', 'reject_songs', 'distribute_songs', 'reset_to_pending']
    
    def get_status_badge(self, obj):
        """Display status with color-coded badges"""
        colors = {
            'draft': '#6c757d',
            'pending': '#ffc107', 
            'approved': '#28a745',
            'distributed': '#007bff',
            'rejected': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-size: 11px;">{}</span>',
            color, obj.get_status_display()
        )
    get_status_badge.short_description = 'Status'
    
    def get_audio_player(self, obj):
        """Display audio player if file exists"""
        if obj.audio_file:
            return format_html(
                '<audio controls style="width: 200px;"><source src="{}" type="audio/mpeg"></audio>',
                obj.audio_file.url
            )
        elif obj.audio_url:
            return format_html(
                '<audio controls style="width: 200px;"><source src="{}" type="audio/mpeg"></audio>',
                obj.audio_url
            )
        return "No audio"
    get_audio_player.short_description = 'Audio'
    
    # Admin actions
    def approve_songs(self, request, queryset):
        """Approve selected pending songs"""
        updated = queryset.filter(status='pending').update(
            status='approved',
            approved_at=timezone.now()
        )
        self.message_user(request, f'{updated} songs approved successfully.')
    approve_songs.short_description = "Approve selected songs"
    
    def reject_songs(self, request, queryset):
        """Reject selected songs"""
        updated = queryset.filter(status__in=['pending', 'approved']).update(status='rejected')
        self.message_user(request, f'{updated} songs rejected.')
    reject_songs.short_description = "Reject selected songs"
    
    def distribute_songs(self, request, queryset):
        """Mark approved songs as distributed (live)"""
        updated = queryset.filter(status='approved').update(
            status='distributed',
            distributed_at=timezone.now()
        )
        self.message_user(request, f'{updated} songs marked as distributed.')
    distribute_songs.short_description = "Distribute approved songs"
    
    def reset_to_pending(self, request, queryset):
        """Reset songs to pending review"""
        updated = queryset.update(status='pending', approved_at=None, distributed_at=None)
        self.message_user(request, f'{updated} songs reset to pending.')
    reset_to_pending.short_description = "Reset to pending review"


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    """Music genre management"""
    
    list_display = ['name', 'description', 'get_songs_count', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']
    
    def get_songs_count(self, obj):
        count = obj.song_set.count()
        if count > 0:
            url = reverse('admin:songs_song_changelist') + f'?genre__id__exact={obj.id}'
            return format_html('<a href="{}">{} songs</a>', url, count)
        return count
    get_songs_count.short_description = 'Songs'


@admin.register(Platform)
class PlatformAdmin(admin.ModelAdmin):
    """Streaming platform management"""
    
    list_display = ['name', 'is_active', 'revenue_share', 'get_distributions_count']
    list_filter = ['is_active']
    search_fields = ['name']
    
    def get_distributions_count(self, obj):
        count = obj.songdistribution_set.count()
        if count > 0:
            url = reverse('admin:songs_songdistribution_changelist') + f'?platform__id__exact={obj.id}'
            return format_html('<a href="{}">{} distributions</a>', url, count)
        return count
    get_distributions_count.short_description = 'Distributions'


@admin.register(SongDistribution)
class SongDistributionAdmin(admin.ModelAdmin):
    """Song distribution tracking"""
    
    list_display = [
        'song', 'platform', 'status', 'platform_song_id', 
        'distributed_at', 'get_platform_link'
    ]
    list_filter = ['status', 'platform', 'distributed_at']
    search_fields = ['song__title', 'platform__name', 'platform_song_id']
    
    def get_platform_link(self, obj):
        if obj.platform_url:
            return format_html('<a href="{}" target="_blank">View on Platform</a>', obj.platform_url)
        return "No link"
    get_platform_link.short_description = 'Platform Link'


@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    """Album/EP administration"""
    
    list_display = [
        'title', 'artist', 'release_type', 'get_status_badge', 
        'tracks_uploaded', 'number_of_tracks', 'get_completion', 
        'release_date', 'get_days_until_release', 'created_at'
    ]
    list_filter = [
        'status', 'release_type', 'is_explicit', 
        'created_at', 'release_date', 'genre'
    ]
    search_fields = ['title', 'artist__email', 'artist__first_name', 'artist__last_name', 'genre']
    ordering = ['-created_at']
    readonly_fields = [
        'id', 'tracks_uploaded', 'created_at', 'updated_at',
        'submitted_at', 'approved_at', 'distributed_at',
        'get_completion_percentage', 'get_days_until_release'
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'title', 'artist', 'release_type', 'status')
        }),
        ('Content', {
            'fields': ('description', 'genre', 'cover_art', 'cover_url', 'is_explicit')
        }),
        ('Track Management', {
            'fields': ('number_of_tracks', 'tracks_uploaded', 'get_completion_percentage')
        }),
        ('Release Information', {
            'fields': ('release_date', 'get_days_until_release')
        }),
        ('Admin Notifications', {
            'fields': ('admin_notified_scheduled', 'admin_notified_days'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'submitted_at', 'approved_at', 'distributed_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_status_badge(self, obj):
        """Display status with color coding"""
        colors = {
            'draft': 'gray',
            'in_progress': 'blue',
            'pending': 'orange',
            'scheduled': 'purple',
            'approved': 'green',
            'distributed': 'darkgreen',
            'rejected': 'red',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color, obj.status.upper()
        )
    get_status_badge.short_description = 'Status'
    
    def get_completion(self, obj):
        """Display completion progress"""
        percentage = obj.completion_percentage
        color = 'green' if percentage == 100 else 'orange' if percentage >= 50 else 'red'
        return format_html(
            '<div style="background-color: #f0f0f0; border-radius: 10px; overflow: hidden; width: 100px;">'
            '<div style="background-color: {}; height: 20px; width: {}%; text-align: center; color: white; font-size: 11px; line-height: 20px;">{:.0f}%</div>'
            '</div>',
            color, percentage, percentage
        )
    get_completion.short_description = 'Progress'
    
    def get_completion_percentage(self, obj):
        """Get completion percentage as text"""
        return f"{obj.completion_percentage:.1f}%"
    get_completion_percentage.short_description = 'Completion'
    
    def get_days_until_release(self, obj):
        """Display days until scheduled release"""
        if not obj.is_scheduled:
            return "Not scheduled"
        days = obj.days_until_release
        if days == 0:
            return format_html('<strong style="color: red;">Releases Today!</strong>')
        elif days == 1:
            return format_html('<strong style="color: orange;">Releases Tomorrow</strong>')
        elif days <= 7:
            return format_html('<strong style="color: orange;">In {} days</strong>', days)
        else:
            return f"In {days} days"
    get_days_until_release.short_description = 'Days Until Release'
    
    actions = ['approve_albums', 'mark_as_distributed', 'send_reminder_notification']
    
    def approve_albums(self, request, queryset):
        """Approve selected albums"""
        updated = queryset.filter(status='pending').update(
            status='approved',
            approved_at=timezone.now()
        )
        self.message_user(request, f'{updated} album(s) approved successfully.')
    approve_albums.short_description = 'Approve selected albums'
    
    def mark_as_distributed(self, request, queryset):
        """Mark albums as distributed"""
        updated = queryset.filter(status='approved').update(
            status='distributed',
            distributed_at=timezone.now()
        )
        self.message_user(request, f'{updated} album(s) marked as distributed.')
    mark_as_distributed.short_description = 'Mark as distributed'
    
    def send_reminder_notification(self, request, queryset):
        """Send reminder notification to admin"""
        from apps.notifications.services import NotificationService
        
        for album in queryset:
            if album.is_scheduled:
                try:
                    NotificationService.send_admin_notification(
                        title=f"Manual Reminder: {album.title}",
                        message=f"Reminder for {album.title} - Releases in {album.days_until_release} days",
                        notification_type='manual_reminder',
                        context_data={'album_id': str(album.id), 'album_title': album.title},
                        send_email=True,
                        send_websocket=True
                    )
                except Exception as e:
                    self.message_user(request, f"Error sending notification for {album.title}: {e}", level='error')
        
        self.message_user(request, f'Sent reminders for {queryset.count()} album(s).')
    send_reminder_notification.short_description = 'Send reminder notification'


@admin.register(AlbumTrack)
class AlbumTrackAdmin(admin.ModelAdmin):
    """Album track management"""
    
    list_display = ['album', 'track_number', 'song', 'created_at']
    list_filter = ['album__release_type', 'created_at']
    search_fields = ['album__title', 'song__title']
    ordering = ['album', 'track_number']
