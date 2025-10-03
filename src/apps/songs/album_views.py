"""
Album/EP Management Views
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
import logging

from .album_models import Album, AlbumTrack
from .album_serializers import AlbumSerializer, AlbumDetailSerializer, AlbumTrackSerializer
from .models import Song

logger = logging.getLogger(__name__)


class IsYearlySubscriber(IsAuthenticated):
    """Permission class to check if user has yearly subscription"""
    
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        
        # Check subscription type from user's subscription
        try:
            from src.apps.payments.models import Subscription
            subscription = Subscription.objects.filter(user=request.user, status='active').first()
            if subscription and subscription.subscription_type == 'yearly':
                return True
        except Exception as e:
            logger.error(f"Error checking subscription: {e}")
        
        return False


class AlbumViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Albums/EPs
    Only accessible to yearly premium subscribers
    """
    permission_classes = [IsYearlySubscriber]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'genre']
    ordering_fields = ['created_at', 'release_date', 'title']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AlbumDetailSerializer
        return AlbumSerializer
    
    def get_queryset(self):
        """Return albums for current user only"""
        return Album.objects.filter(artist=self.request.user).select_related('artist')
    
    def perform_create(self, serializer):
        """Create album and set artist to current user"""
        album = serializer.save(artist=self.request.user)
        logger.info(f"Album created: {album.title} by {self.request.user.email}")
        
        # Send notification to admin about new album
        self._notify_admin_new_album(album)
        
        # If scheduled for future, notify admin
        if album.is_scheduled:
            self._notify_admin_scheduled_release(album)
    
    def _notify_admin_new_album(self, album):
        """Send notification to admin about new album creation"""
        try:
            from apps.notifications.services import NotificationService
            
            message = f"New {album.release_type.upper()} created: '{album.title}' by {album.artist.get_full_name()}"
            context_data = {
                'album_id': str(album.id),
                'album_title': album.title,
                'artist': album.artist.get_full_name(),
                'artist_email': album.artist.email,
                'release_type': album.release_type,
                'release_date': album.release_date.isoformat(),
                'number_of_tracks': album.number_of_tracks,
                'is_scheduled': album.is_scheduled,
            }
            
            NotificationService.send_admin_notification(
                title=f"New {album.release_type.upper()}: {album.title}",
                message=message,
                notification_type='album_created',
                context_data=context_data,
                send_email=True,
                send_websocket=True
            )
            
            logger.info(f"Admin notified about new album: {album.title}")
        except Exception as e:
            logger.error(f"Failed to notify admin about new album: {e}")
    
    def _notify_admin_scheduled_release(self, album):
        """Send notification about scheduled release"""
        try:
            from apps.notifications.services import NotificationService
            
            days_until = album.days_until_release
            message = f"Scheduled Release: '{album.title}' by {album.artist.get_full_name()} - Releasing in {days_until} days on {album.release_date}"
            
            context_data = {
                'album_id': str(album.id),
                'album_title': album.title,
                'artist': album.artist.get_full_name(),
                'release_date': album.release_date.isoformat(),
                'days_until_release': days_until,
                'release_type': album.release_type,
            }
            
            NotificationService.send_admin_notification(
                title=f"Scheduled: {album.title}",
                message=message,
                notification_type='album_scheduled',
                context_data=context_data,
                send_email=True,
                send_websocket=True
            )
            
            # Mark as notified
            album.admin_notified_scheduled = True
            album.save(update_fields=['admin_notified_scheduled'])
            
            logger.info(f"Admin notified about scheduled album: {album.title}")
        except Exception as e:
            logger.error(f"Failed to notify admin about scheduled album: {e}")
    
    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, pk=None):
        """Submit completed album for admin review"""
        album = self.get_object()
        
        if not album.is_complete:
            return Response({
                'error': f'Album is not complete. {album.tracks_uploaded}/{album.number_of_tracks} tracks uploaded.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if album.status in ['pending', 'approved', 'distributed']:
            return Response({
                'error': f'Album is already {album.status}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update status
        album.status = 'scheduled' if album.is_scheduled else 'pending'
        album.submitted_at = timezone.now()
        album.save()
        
        # Notify admin
        try:
            from apps.notifications.services import NotificationService
            
            message = f"Album '{album.title}' by {album.artist.get_full_name()} submitted for review"
            context_data = {
                'album_id': str(album.id),
                'album_title': album.title,
                'artist': album.artist.get_full_name(),
                'release_date': album.release_date.isoformat(),
                'tracks_count': album.tracks_uploaded,
            }
            
            NotificationService.send_admin_notification(
                title=f"Review Required: {album.title}",
                message=message,
                notification_type='album_review',
                context_data=context_data,
                send_email=True,
                send_websocket=True
            )
        except Exception as e:
            logger.error(f"Failed to notify admin about album submission: {e}")
        
        serializer = self.get_serializer(album)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def scheduled(self, request):
        """Get all scheduled releases"""
        scheduled_albums = self.get_queryset().filter(
            status='scheduled',
            release_date__gt=timezone.now().date()
        )
        serializer = self.get_serializer(scheduled_albums, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def draft(self, request):
        """Get all draft albums"""
        draft_albums = self.get_queryset().filter(status='draft')
        serializer = self.get_serializer(draft_albums, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_track(self, request, pk=None):
        """Add a track to the album"""
        album = self.get_object()
        
        song_id = request.data.get('song_id')
        track_number = request.data.get('track_number')
        
        if not song_id:
            return Response({
                'error': 'song_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            song = Song.objects.get(id=song_id, artist=request.user)
        except Song.DoesNotExist:
            return Response({
                'error': 'Song not found or does not belong to you'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Auto-assign track number if not provided
        if not track_number:
            track_number = album.tracks.count() + 1
        
        track_data = {
            'album': album.id,
            'song': song.id,
            'track_number': track_number
        }
        
        track_serializer = AlbumTrackSerializer(data=track_data)
        if track_serializer.is_valid():
            track_serializer.save()
            
            # Return updated album data
            album.refresh_from_db()
            serializer = AlbumDetailSerializer(album)
            return Response(serializer.data)
        
        return Response(track_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AlbumTrackViewSet(viewsets.ModelViewSet):
    """ViewSet for managing album tracks"""
    permission_classes = [IsYearlySubscriber]
    serializer_class = AlbumTrackSerializer
    
    def get_queryset(self):
        """Return tracks for albums owned by current user"""
        return AlbumTrack.objects.filter(
            album__artist=self.request.user
        ).select_related('album', 'song')
