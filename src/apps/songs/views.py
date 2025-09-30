from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from django.utils import timezone

from .models import Song, Genre, Platform, SongDistribution
from .serializers import (
    SongSerializer, SongUploadSerializer, SongUpdateSerializer,
    GenreSerializer, PlatformSerializer
)
from django.conf import settings


class SongListCreateView(generics.ListCreateAPIView):
    """List user's songs and create new uploads"""
    permission_classes = [permissions.IsAuthenticated]  # Back to requiring auth
    parser_classes = (MultiPartParser, FormParser)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'album_title', 'featured_artists']
    ordering_fields = ['created_at', 'title', 'total_streams', 'total_revenue']
    ordering = ['-created_at']
    
    def post(self, request, *args, **kwargs):
        """Override post to add debugging"""
        print(f"=== UPLOAD REQUEST DEBUG ===")
        print(f"User: {request.user.email if request.user.is_authenticated else 'Anonymous'}")
        print(f"Request data keys: {list(request.data.keys())}")
        print(f"Files received: {list(request.FILES.keys())}")
        print(f"Title: {request.data.get('title', 'No title')}")
        print(f"Genre: {request.data.get('genre', 'No genre')}")
        print(f"Audio file: {request.FILES.get('audio_file', 'No audio file')}")
        print(f"Cover image: {request.FILES.get('cover_image', 'No cover image')}")
        
        try:
            result = super().post(request, *args, **kwargs)
            print(f"Upload successful, response status: {result.status_code}")
            if hasattr(result, 'data') and result.data:
                print(f"Response data: {result.data}")
            return result
        except Exception as e:
            print(f"Upload failed with exception: {e}")
            raise
    
    def get_queryset(self):
        """Return songs for current user only"""
        try:
            return Song.objects.filter(artist=self.request.user)
        except Exception:
            return Song.objects.none()
    
    def list(self, request, *args, **kwargs):
        """Override list to handle database errors gracefully"""
        import logging
        logger = logging.getLogger(__name__)
        
        try:
            user = request.user
            logger.info(f"List request for user: {user.email if user.is_authenticated else 'Anonymous'}")
            
            # Debug: Check queryset
            queryset = self.get_queryset()
            logger.info(f"Queryset count: {queryset.count()}")
            
            # Debug: Check raw Song count for user
            from .models import Song
            total_songs = Song.objects.filter(artist=user).count()
            logger.info(f"Total songs for user {user.id}: {total_songs}")
            
            if total_songs > 0:
                songs = Song.objects.filter(artist=user)
                for song in songs:
                    logger.info(f"Song found: ID={song.id}, Title={song.title}, Status={song.status}")
            
            response = super().list(request, *args, **kwargs)
            logger.info(f"Response data length: {len(response.data) if hasattr(response, 'data') else 'No data'}")
            return response
            
        except Exception as e:
            logger.error(f"Error in list method: {e}")
            # Return empty list if database error
            return Response([])
    
    def get_serializer_class(self):
        """Use different serializers for list vs create"""
        if self.request.method == 'POST':
            return SongUploadSerializer
        return SongSerializer
    
    def perform_create(self, serializer):
        """Save song with current user as artist and consume upload credit if necessary.

        This uses a select_for_update() transaction to avoid race conditions.
        """
        import logging
        from django.db import transaction
        from src.apps.payments.models import Subscription
        from .notifications import MusicNotifications

        logger = logging.getLogger(__name__)
        user = self.request.user
        
        logger.info(f"Starting song upload for user {user.id} ({user.email})")
        logger.info(f"Request data keys: {list(self.request.data.keys())}")
        logger.info(f"Files: audio_file={bool(self.request.FILES.get('audio_file'))}, cover_image={bool(self.request.FILES.get('cover_image'))}")

        with transaction.atomic():
            # Lock user row
            user = type(user).objects.select_for_update().get(pk=user.pk)

            # Check for active yearly subscription
            yearly_active = False
            subs = Subscription.objects.filter(user=user, status='active').first()
            if subs and subs.subscription_type == 'yearly' and subs.is_active:
                yearly_active = True
                logger.info(f"User has active yearly subscription: {subs.id}")

            if yearly_active:
                logger.info("Saving song with yearly subscription")
                song = serializer.save(artist=user)
                logger.info(f"Song saved successfully: {song.id}")
                
                # Send admin notification about new upload
                MusicNotifications.send_upload_notification_to_admin(song)
                return

            # Try pay-per-song subscription with available credits
            pps = Subscription.objects.filter(
                user=user,
                subscription_type='pay_per_song',
                status='active',
                song_credits__gt=0
            ).select_for_update().first()

            if pps and pps.remaining_credits > 0:
                logger.info(f"User has pay-per-song subscription with {pps.remaining_credits} credits")
                # Use one credit
                pps.credits_used += 1
                pps.save()
                song = serializer.save(artist=user)
                logger.info(f"Song saved successfully: {song.id}")

                # Send admin notification about new upload
                MusicNotifications.send_upload_notification_to_admin(song)

                # Note: Keep user as 'artist' even when credits reach 0
                # They should be able to buy more credits to continue uploading
                if pps.remaining_credits == 0:
                    logger.info(f"User {user.id} has used all credits but remains an artist")
                return

            # No valid subscription/credits
            logger.warning(f"User {user.id} has no valid subscription or credits")
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No upload credits available. Please purchase credits or subscribe.')


class SongDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a specific song"""
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def get_queryset(self):
        """Return songs for current user only"""
        return Song.objects.filter(artist=self.request.user)
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.request.method in ['PUT', 'PATCH']:
            return SongUpdateSerializer
        return SongSerializer
    
    def delete(self, request, *args, **kwargs):
        """Delete song (only if not distributed)"""
        song = self.get_object()
        if song.status == 'distributed':
            return Response({
                'error': 'Cannot delete distributed song'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        return super().delete(request, *args, **kwargs)


class GenreListView(generics.ListAPIView):
    """List available music genres (public)"""
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    # Genres are reference data and should be accessible publicly
    permission_classes = [permissions.AllowAny]


class PlatformListView(generics.ListAPIView):
    """List available distribution platforms (public)"""
    queryset = Platform.objects.filter(is_active=True)
    serializer_class = PlatformSerializer
    # Platform list is reference data; allow public access
    permission_classes = [permissions.AllowAny]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_for_review(request, song_id):
    """Submit song for review and distribution"""
    try:
        song = Song.objects.get(id=song_id, artist=request.user)
    except Song.DoesNotExist:
        return Response({
            'error': 'Song not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if song.status != 'draft':
        return Response({
            'error': f'Song is already {song.status}'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate required fields
    required_fields = ['title', 'audio_file', 'cover_image', 'genre']
    missing_fields = []
    
    for field in required_fields:
        if not getattr(song, field):
            missing_fields.append(field)
    
    if missing_fields:
        return Response({
            'error': 'Missing required fields',
            'missing_fields': missing_fields
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Update song status
    song.status = 'pending'
    song.submitted_at = timezone.now()
    song.save()
    
    # Create distribution entries for all active platforms
    platforms = Platform.objects.filter(is_active=True)
    for platform in platforms:
        SongDistribution.objects.get_or_create(
            song=song,
            platform=platform,
            defaults={'status': 'pending'}
        )
    
    return Response({
        'message': 'Song submitted for review successfully',
        'song': SongSerializer(song).data
    })




@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_song(request, song_id):
    """Approve song for distribution (admin only)"""
    if not request.user.is_staff:
        return Response({
            'error': 'Permission denied'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        song = Song.objects.get(id=song_id)
    except Song.DoesNotExist:
        return Response({
            'error': 'Song not found'
        }, status=status.HTTP_404_NOT_FOUND)
    
    if song.status != 'pending':
        return Response({
            'error': f'Song is not pending review (current status: {song.status})'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Update song status
    song.status = 'approved'
    song.approved_at = timezone.now()
    song.save()
    
    # Update distribution status
    song.distributions.update(status='live', distributed_at=timezone.now())
    
    # Mark as distributed
    song.status = 'distributed'
    song.distributed_at = timezone.now()
    song.save()
    
    # Update user profile stats
    profile = song.artist.profile
    profile.total_releases += 1
    profile.save()
    
    return Response({
        'message': 'Song approved and distributed successfully',
        'song': SongSerializer(song).data
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_song_status(request, song_id):
    """Generic status update endpoint.

    Allowed transitions:
      draft -> pending  (artist submits for review)
      pending -> approved (staff) then immediately to distributed (mirrors approve_song)
      pending -> rejected (staff)
      approved -> distributed (staff) if not already distributed
    """
    target_status = request.data.get('status')
    if target_status not in ['pending', 'rejected', 'approved', 'distributed']:
        return Response({'error': 'Invalid target status'}, status=400)

    try:
        song = Song.objects.get(id=song_id)
    except Song.DoesNotExist:
        return Response({'error': 'Song not found'}, status=404)

    # Artist can only move own song draft -> pending
    if target_status == 'pending':
        if song.artist != request.user:
            return Response({'error': 'Not your song'}, status=403)
        if song.status != 'draft':
            return Response({'error': f'Cannot submit from {song.status}'}, status=400)
        # minimal validation (reuse original submission checks)
        required_fields = ['audio_file', 'cover_image', 'genre']
        missing = [f for f in required_fields if not getattr(song, f)]
        if missing:
            return Response({'error': 'Missing required fields', 'missing_fields': missing}, status=400)
        song.status = 'pending'
        song.submitted_at = timezone.now()
        song.save()
        return Response({'message': 'Submitted for review', 'song': SongSerializer(song).data})

    # Staff only beyond this point
    if not request.user.is_staff:
        return Response({'error': 'Staff permission required'}, status=403)

    if target_status == 'rejected':
        if song.status not in ['pending']:
            return Response({'error': f'Cannot reject from {song.status}'}, status=400)
        song.status = 'rejected'
        song.save(update_fields=['status'])
        return Response({'message': 'Song rejected', 'song': SongSerializer(song).data})

    if target_status == 'approved':
        if song.status != 'pending':
            return Response({'error': f'Cannot approve from {song.status}'}, status=400)
        song.status = 'approved'
        song.approved_at = timezone.now()
        song.save()
        return Response({'message': 'Song approved (awaiting distribution)', 'song': SongSerializer(song).data})

    if target_status == 'distributed':
        if song.status not in ['approved', 'pending']:
            return Response({'error': f'Cannot distribute from {song.status}'}, status=400)
        # If still pending, treat as approve+distribute
        if song.status == 'pending':
            song.approved_at = timezone.now()
        song.status = 'distributed'
        song.distributed_at = timezone.now()
        song.save()
        # Ensure distribution rows exist
        platforms = Platform.objects.filter(is_active=True)
        for platform in platforms:
            SongDistribution.objects.get_or_create(song=song, platform=platform, defaults={'status': 'live'})
        song.distributions.update(status='live', distributed_at=timezone.now())
        return Response({'message': 'Song distributed', 'song': SongSerializer(song).data})

    return Response({'error': 'Unhandled transition'}, status=400)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_music_stats(request):
    """Get user's music statistics"""
    try:
        user = request.user
        songs = Song.objects.filter(artist=user)
        
        stats = {
            'total_songs': songs.count(),
            'draft_songs': songs.filter(status='draft').count(),
            'pending_songs': songs.filter(status='pending').count(),
            'approved_songs': songs.filter(status='approved').count(),
            'awaiting_review': songs.filter(status__in=['draft', 'pending']).count(),
            'distributed_songs': songs.filter(status='distributed').count(),
            'total_streams': sum(song.total_streams for song in songs),
            'total_downloads': sum(song.total_downloads for song in songs),
            'total_revenue': sum(song.total_revenue for song in songs),
            'recent_songs': SongSerializer(songs[:5], many=True).data
        }
        
        return Response(stats)
    
    except Exception as e:
        # Return default stats if there's any database error
        return Response({
            'total_songs': 0,
            'draft_songs': 0,
            'pending_songs': 0,
            'approved_songs': 0,
            'awaiting_review': 0,
            'distributed_songs': 0,
            'total_streams': 0,
            'total_downloads': 0,
            'total_revenue': 0,
            'recent_songs': []
        })
