from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import datetime, timedelta

from .models import AdminAction, SystemSettings, PlatformAnalytics, BulkNotification
from src.apps.songs.models import Song
from src.apps.payments.models import Transaction, Subscription
from src.apps.notifications.models import Notification

User = get_user_model()


class UserOverviewSerializer(serializers.ModelSerializer):
    """Serializer for user overview in admin dashboard"""
    total_songs = serializers.SerializerMethodField()
    total_revenue = serializers.SerializerMethodField()
    subscription_status = serializers.SerializerMethodField()
    last_activity = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'subscription', 'is_verified', 'is_artist_verified',
            'total_songs', 'total_revenue', 'subscription_status',
            'last_activity', 'date_joined', 'last_login'
        ]
    
    def get_total_songs(self, obj):
        return obj.songs.count()
    
    def get_total_revenue(self, obj):
        return obj.songs.aggregate(
            total=Sum('total_revenue')
        )['total'] or 0
    
    def get_subscription_status(self, obj):
        if obj.subscription_expires_at:
            is_active = obj.subscription_expires_at > timezone.now()
            return {
                'plan': obj.subscription,
                'expires_at': obj.subscription_expires_at,
                'is_active': is_active
            }
        return {'plan': obj.subscription, 'expires_at': None, 'is_active': True}
    
    def get_last_activity(self, obj):
        # Get the most recent activity (song upload, login, etc.)
        last_song = obj.songs.order_by('-created_at').first()
        if last_song:
            return last_song.created_at
        return obj.last_login


class SongApprovalSerializer(serializers.ModelSerializer):
    """Serializer for song approval in admin dashboard"""
    artist_name = serializers.CharField(source='artist.username', read_only=True)
    artist_email = serializers.CharField(source='artist.email', read_only=True)
    genre_name = serializers.CharField(source='genre.name', read_only=True)
    file_size = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()
    
    class Meta:
        model = Song
        fields = [
            'id', 'title', 'artist_name', 'artist_email', 'status',
            'genre_name', 'release_type', 'is_explicit', 'price',
            'file_size', 'duration_formatted', 'created_at', 'updated_at',
            'audio_file', 'cover_image', 'audio_url', 'cover_url'
        ]
    
    def get_file_size(self, obj):
        if obj.audio_file:
            try:
                return obj.audio_file.size
            except:
                return None
        return None
    
    def get_duration_formatted(self, obj):
        if obj.duration:
            minutes = obj.duration // 60
            seconds = obj.duration % 60
            return f"{minutes}:{seconds:02d}"
        return None


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard overview statistics"""
    
    # User stats
    total_users = serializers.IntegerField()
    new_users_today = serializers.IntegerField()
    active_users = serializers.IntegerField()
    verified_artists = serializers.IntegerField()
    
    # Content stats
    total_songs = serializers.IntegerField()
    pending_songs = serializers.IntegerField()
    approved_songs_today = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    
    # Recent activity
    recent_uploads = serializers.IntegerField()
    recent_registrations = serializers.IntegerField()
    open_tickets = serializers.IntegerField()
    
    def to_representation(self, instance):
        # Calculate stats
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        week_ago = today - timedelta(days=7)
        
        # User statistics
        total_users = User.objects.count()
        new_users_today = User.objects.filter(date_joined__date=today).count()
        active_users = User.objects.filter(last_login__gte=week_ago).count()
        verified_artists = User.objects.filter(is_artist_verified=True).count()
        
        # Content statistics
        total_songs = Song.objects.count()
        pending_songs = Song.objects.filter(status='pending').count()
        approved_songs_today = Song.objects.filter(
            status='approved', 
            updated_at__date=today
        ).count()
        total_revenue = Song.objects.aggregate(
            total=Sum('total_revenue')
        )['total'] or 0
        
        # Activity statistics
        recent_uploads = Song.objects.filter(created_at__date=today).count()
        recent_registrations = User.objects.filter(date_joined__date=today).count()
        
        # Support statistics - assuming you have a Ticket model
        try:
            from src.apps.support.models import Ticket
            open_tickets = Ticket.objects.filter(status='open').count()
        except:
            open_tickets = 0
        
        return {
            'total_users': total_users,
            'new_users_today': new_users_today,
            'active_users': active_users,
            'verified_artists': verified_artists,
            'total_songs': total_songs,
            'pending_songs': pending_songs,
            'approved_songs_today': approved_songs_today,
            'total_revenue': total_revenue,
            'recent_uploads': recent_uploads,
            'recent_registrations': recent_registrations,
            'open_tickets': open_tickets,
        }


class RevenueAnalyticsSerializer(serializers.Serializer):
    """Serializer for revenue analytics"""
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    monthly_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    yearly_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    subscription_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    song_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    top_earning_artists = serializers.ListField()
    revenue_by_plan = serializers.DictField()
    
    def to_representation(self, instance):
        today = timezone.now().date()
        current_month = today.replace(day=1)
        current_year = today.replace(month=1, day=1)
        
        # Total revenue from songs
        total_revenue = Song.objects.aggregate(
            total=Sum('total_revenue')
        )['total'] or 0
        
        # Monthly revenue
        monthly_revenue = Song.objects.filter(
            created_at__gte=current_month
        ).aggregate(total=Sum('total_revenue'))['total'] or 0
        
        # Yearly revenue  
        yearly_revenue = Song.objects.filter(
            created_at__gte=current_year
        ).aggregate(total=Sum('total_revenue'))['total'] or 0
        
        # Top earning artists
        top_artists = User.objects.annotate(
            total_earnings=Sum('songs__total_revenue')
        ).filter(total_earnings__gt=0).order_by('-total_earnings')[:10]
        
        top_earning_artists = [
            {
                'id': str(artist.id),
                'name': f"{artist.first_name} {artist.last_name}".strip() or artist.username,
                'email': artist.email,
                'total_earnings': float(artist.total_earnings or 0),
                'song_count': artist.songs.count()
            }
            for artist in top_artists
        ]
        
        # Revenue by subscription plan
        revenue_by_plan = {}
        for plan in ['bronze', 'gold', 'platinum']:
            plan_revenue = User.objects.filter(
                subscription=plan
            ).aggregate(
                total=Sum('songs__total_revenue')
            )['total'] or 0
            revenue_by_plan[plan] = float(plan_revenue)
        
        return {
            'total_revenue': total_revenue,
            'monthly_revenue': monthly_revenue,
            'yearly_revenue': yearly_revenue,
            'subscription_revenue': 0,  # Will be calculated from actual subscriptions
            'song_revenue': total_revenue,
            'top_earning_artists': top_earning_artists,
            'revenue_by_plan': revenue_by_plan,
        }


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for system settings"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    updated_by_name = serializers.CharField(source='updated_by.username', read_only=True)
    
    class Meta:
        model = SystemSettings
        fields = '__all__'


class AdminActionSerializer(serializers.ModelSerializer):
    """Serializer for admin actions/audit log"""
    admin_name = serializers.CharField(source='admin_user.username', read_only=True)
    admin_email = serializers.CharField(source='admin_user.email', read_only=True)
    
    class Meta:
        model = AdminAction
        fields = [
            'id', 'admin_name', 'admin_email', 'action_type',
            'target_model', 'target_id', 'description', 'metadata',
            'ip_address', 'created_at'
        ]


class BulkNotificationSerializer(serializers.ModelSerializer):
    """Serializer for bulk notifications"""
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = BulkNotification
        fields = '__all__'
