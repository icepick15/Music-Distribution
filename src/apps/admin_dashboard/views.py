from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Sum
from django.utils import timezone
from datetime import timedelta
from django.http import JsonResponse

from .models import AdminAction, SystemSettings, PlatformAnalytics, BulkNotification
from .serializers import (
    UserOverviewSerializer, SongApprovalSerializer, DashboardStatsSerializer,
    RevenueAnalyticsSerializer, SystemSettingsSerializer, AdminActionSerializer,
    BulkNotificationSerializer
)
from src.apps.songs.models import Song
from src.apps.notifications.models import Notification

User = get_user_model()


class IsAdminOrStaff(permissions.BasePermission):
    """Custom permission class for admin-only access"""
    
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.role in ['admin', 'staff'] or request.user.is_staff
        )


class AdminDashboardViewSet(viewsets.ViewSet):
    """Main admin dashboard viewset"""
    # permission_classes = [IsAdminOrStaff]  # Temporarily disabled for testing
    permission_classes = []
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get dashboard overview statistics with real data"""
        try:
            # Get real user count
            total_users = User.objects.count()
            
            # Get real song statistics
            total_songs = Song.objects.count()
            pending_songs = Song.objects.filter(status='pending').count()
            approved_songs = Song.objects.filter(status='approved').count()
            distributed_songs = Song.objects.filter(status='distributed').count()
            live_songs = distributed_songs  # Live songs are distributed songs
            
            # Get real revenue data - try to import Payment model safely
            total_revenue = 0
            try:
                from src.apps.payments.models import Payment
                total_revenue = Payment.objects.filter(
                    payment_type='subscription',
                    status='completed'
                ).aggregate(total=Sum('amount'))['total'] or 0
                total_revenue = float(total_revenue)  # Convert Decimal to float
            except ImportError:
                print("Payment model not found, using revenue fallback")
                total_revenue = 0
            except Exception as e:
                print(f"Payment calculation error: {e}")
                total_revenue = 0
            
            # Calculate new users today
            from datetime import date
            today = date.today()
            new_users_today = User.objects.filter(date_joined__date=today).count()
            
            # Calculate active users (users who logged in within last 30 days)
            from datetime import timedelta
            thirty_days_ago = timezone.now() - timedelta(days=30)
            active_users = User.objects.filter(last_login__gte=thirty_days_ago).count()
            
            # Get verified artists count - handle if field doesn't exist
            verified_artists = 0
            try:
                verified_artists = User.objects.filter(
                    role='artist', 
                    is_artist_verified=True
                ).count()
            except Exception as e:
                print(f"Artist verification field error: {e}")
                # Fallback: count users with role='artist'
                verified_artists = User.objects.filter(role='artist').count()
            
            # Get distributed (live) songs count
            distributed_songs = Song.objects.filter(status='distributed').count()
            live_songs = distributed_songs  # Same as distributed for now
            
            # Recent activity counts - count songs distributed today
            approved_songs_today = Song.objects.filter(
                status='distributed',
                distributed_at__date=today
            ).count()
            
            recent_uploads = Song.objects.filter(
                created_at__date=today
            ).count()
            
            return Response({
                'total_users': total_users,
                'new_users_today': new_users_today,
                'active_users': active_users,
                'verified_artists': verified_artists,
                'total_songs': total_songs,
                'pending_songs': pending_songs,
                'live_songs': live_songs,
                'distributed_songs': distributed_songs,
                'approved_songs_today': approved_songs_today,
                'total_revenue': total_revenue,
                'recent_uploads': recent_uploads,
                'recent_registrations': new_users_today,
                'open_tickets': 0  # Add this if you have a tickets model later
            })
            
        except Exception as e:
            # Return a fallback response with error info for debugging
            print(f"Dashboard stats error: {e}")
            return Response({
                'error': str(e),
                'total_users': User.objects.count() if 'User' in globals() else 0,
                'new_users_today': 0,
                'active_users': 0,
                'verified_artists': 0,
                'total_songs': Song.objects.count() if 'Song' in globals() else 0,
                'pending_songs': 0,
                'approved_songs_today': 0,
                'total_revenue': 0,
                'recent_uploads': 0,
                'recent_registrations': 0,
                'open_tickets': 0
            }, status=200)  # Return 200 even with errors for debugging
    
    @action(detail=False, methods=['post'])
    def approve_pending_songs(self, request):
        """Approve all pending songs or specific songs"""
        from datetime import datetime
        
        try:
            # Get songs to approve
            song_ids = request.data.get('song_ids', [])
            
            if song_ids:
                # Approve specific songs
                songs_to_approve = Song.objects.filter(
                    id__in=song_ids,
                    status='pending'
                )
            else:
                # Approve all pending songs
                songs_to_approve = Song.objects.filter(status='pending')
            
            if not songs_to_approve.exists():
                return Response({
                    'success': False,
                    'message': 'No pending songs found to approve'
                }, status=404)
            
            # Update songs to distributed status (live)
            updated_count = songs_to_approve.update(
                status='distributed',
                approved_at=timezone.now(),
                distributed_at=timezone.now()
            )
            
            return Response({
                'success': True,
                'message': f'Successfully approved {updated_count} songs',
                'approved_count': updated_count
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error approving songs: {str(e)}'
            }, status=500)
    
    @action(detail=False, methods=['get'])
    def pending_songs_list(self, request):
        """Get list of pending songs for approval"""
        try:
            pending_songs = Song.objects.filter(status='pending').select_related('artist')
            
            songs_data = []
            for song in pending_songs:
                songs_data.append({
                    'id': str(song.id),
                    'title': song.title,
                    'artist_name': song.artist.get_full_name() if hasattr(song.artist, 'get_full_name') else song.artist.username,
                    'genre': song.genre.name if song.genre else 'Unknown',
                    'created_at': song.created_at.isoformat(),
                    'duration': song.duration,
                    'price': float(song.price) if song.price else 0.99
                })
            
            return Response({
                'success': True,
                'pending_songs': songs_data,
                'count': len(songs_data)
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Error fetching pending songs: {str(e)}'
            }, status=500)
    
    @action(detail=False, methods=['get'])
    def revenue_analytics(self, request):
        """Get revenue analytics"""
        serializer = RevenueAnalyticsSerializer({})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def user_growth(self, request):
        """Get user growth data for charts"""
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Generate daily user counts
        growth_data = []
        current_date = start_date
        
        while current_date <= end_date:
            users_count = User.objects.filter(date_joined__date=current_date).count()
            growth_data.append({
                'date': current_date.isoformat(),
                'new_users': users_count,
                'total_users': User.objects.filter(date_joined__date__lte=current_date).count()
            })
            current_date += timedelta(days=1)
        
        return Response({'growth_data': growth_data})
    
    @action(detail=False, methods=['get'])
    def content_stats(self, request):
        """Get content statistics"""
        songs_by_status = Song.objects.values('status').annotate(count=Count('id'))
        songs_by_genre = Song.objects.select_related('genre').values(
            'genre__name'
        ).annotate(count=Count('id')).order_by('-count')[:10]
        
        return Response({
            'songs_by_status': list(songs_by_status),
            'songs_by_genre': list(songs_by_genre),
            'total_songs': Song.objects.count(),
            'total_artists': User.objects.filter(role='artist').count()
        })


class UserManagementViewSet(viewsets.ViewSet):
    """User management viewset"""
    # Temporarily disable permissions for testing
    # permission_classes = [IsAdminOrStaff]
    permission_classes = []  # Explicitly disable all permissions for testing
    
    def list(self, request):
        """List all users with filtering and pagination"""
        queryset = User.objects.all()
        
        # Filtering
        role = request.query_params.get('role')
        subscription = request.query_params.get('subscription')
        is_verified = request.query_params.get('is_verified')
        search = request.query_params.get('search')
        
        if role:
            queryset = queryset.filter(role=role)
        if subscription:
            queryset = queryset.filter(subscription=subscription)
        if is_verified is not None:
            queryset = queryset.filter(is_verified=is_verified.lower() == 'true')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) |
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )
        
        # Ordering
        ordering = request.query_params.get('ordering', '-date_joined')
        queryset = queryset.order_by(ordering)
        
        # Pagination (manual)
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 25))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = queryset.count()
        users = queryset[start:end]
        
        serializer = UserOverviewSerializer(users, many=True)
        
        return Response({
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })
    
    @action(detail=True, methods=['post'])
    def verify_artist(self, request, pk=None):
        """Verify an artist"""
        try:
            user = User.objects.get(pk=pk)
            user.is_artist_verified = True
            user.save()
            
            # Log admin action
            AdminAction.objects.create(
                admin_user=request.user,
                action_type='user_verify',
                target_model='User',
                target_id=str(user.id),
                description=f"Verified artist: {user.username}",
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': 'Artist verified successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)
    
    @action(detail=True, methods=['post'])
    def suspend_user(self, request, pk=None):
        """Suspend/unsuspend a user"""
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save()
            
            action = 'suspended' if not user.is_active else 'unsuspended'
            
            # Log admin action
            AdminAction.objects.create(
                admin_user=request.user,
                action_type='user_suspend',
                target_model='User',
                target_id=str(user.id),
                description=f"User {action}: {user.username}",
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response({'message': f'User {action} successfully'})
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


class ContentManagementViewSet(viewsets.ViewSet):
    """Content management viewset for song approval"""
    permission_classes = [IsAdminOrStaff]
    
    def list(self, request):
        """List songs pending approval"""
        status_filter = request.query_params.get('status', 'pending')
        search = request.query_params.get('search')
        
        queryset = Song.objects.select_related('artist', 'genre')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(artist__username__icontains=search) |
                Q(artist__email__icontains=search)
            )
        
        # Pagination
        page = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 25))
        start = (page - 1) * page_size
        end = start + page_size
        
        total_count = queryset.count()
        songs = queryset.order_by('-created_at')[start:end]
        
        serializer = SongApprovalSerializer(songs, many=True)
        
        return Response({
            'results': serializer.data,
            'count': total_count,
            'page': page,
            'page_size': page_size,
            'total_pages': (total_count + page_size - 1) // page_size
        })
    
    @action(detail=True, methods=['post'])
    def approve_song(self, request, pk=None):
        """Approve a song"""
        try:
            song = Song.objects.get(pk=pk)
            song.status = 'approved'
            song.save()
            
            # Log admin action
            AdminAction.objects.create(
                admin_user=request.user,
                action_type='song_approve',
                target_model='Song',
                target_id=str(song.id),
                description=f"Approved song: {song.title} by {song.artist.username}",
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            # Send notification to artist (if notification system exists)
            try:
                Notification.objects.create(
                    user=song.artist,
                    title="Song Approved!",
                    message=f"Your song '{song.title}' has been approved and is now live on all platforms.",
                    notification_type="music_approved"
                )
            except:
                pass
            
            return Response({'message': 'Song approved successfully'})
        except Song.DoesNotExist:
            return Response({'error': 'Song not found'}, status=404)
    
    @action(detail=True, methods=['post'])
    def reject_song(self, request, pk=None):
        """Reject a song"""
        try:
            song = Song.objects.get(pk=pk)
            reason = request.data.get('reason', 'No reason provided')
            
            song.status = 'rejected'
            song.save()
            
            # Log admin action
            AdminAction.objects.create(
                admin_user=request.user,
                action_type='song_reject',
                target_model='Song',
                target_id=str(song.id),
                description=f"Rejected song: {song.title} by {song.artist.username}. Reason: {reason}",
                metadata={'rejection_reason': reason},
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            # Send notification to artist
            try:
                Notification.objects.create(
                    user=song.artist,
                    title="Song Rejected",
                    message=f"Your song '{song.title}' was rejected. Reason: {reason}",
                    notification_type="music_rejected"
                )
            except:
                pass
            
            return Response({'message': 'Song rejected successfully'})
        except Song.DoesNotExist:
            return Response({'error': 'Song not found'}, status=404)


class SystemSettingsViewSet(viewsets.ModelViewSet):
    """System settings management"""
    queryset = SystemSettings.objects.all()
    serializer_class = SystemSettingsSerializer
    permission_classes = [IsAdminOrStaff]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class AdminActionsViewSet(viewsets.ReadOnlyModelViewSet):
    """Audit log for admin actions"""
    queryset = AdminAction.objects.all()
    serializer_class = AdminActionSerializer
    permission_classes = [IsAdminOrStaff]
    
    def get_queryset(self):
        queryset = AdminAction.objects.select_related('admin_user')
        
        # Filtering
        action_type = self.request.query_params.get('action_type')
        admin_user = self.request.query_params.get('admin_user')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        if admin_user:
            queryset = queryset.filter(admin_user__id=admin_user)
        if date_from:
            queryset = queryset.filter(created_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(created_at__date__lte=date_to)
        
        return queryset.order_by('-created_at')


class BulkNotificationViewSet(viewsets.ModelViewSet):
    """Bulk notification management"""
    queryset = BulkNotification.objects.all()
    serializer_class = BulkNotificationSerializer
    permission_classes = [IsAdminOrStaff]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def send_notification(self, request, pk=None):
        """Send a bulk notification"""
        try:
            notification = self.get_object()
            
            # Calculate recipients based on type
            if notification.recipient_type == 'all':
                recipients = User.objects.filter(is_active=True)
            elif notification.recipient_type == 'artists':
                recipients = User.objects.filter(role='artist', is_active=True)
            elif notification.recipient_type == 'subscribers':
                recipients = User.objects.exclude(subscription='free').filter(is_active=True)
            elif notification.recipient_type == 'free_users':
                recipients = User.objects.filter(subscription='free', is_active=True)
            else:
                recipients = User.objects.none()
            
            notification.total_recipients = recipients.count()
            notification.status = 'sending'
            notification.save()
            
            # Create individual notifications
            successful_sends = 0
            failed_sends = 0
            
            for user in recipients:
                try:
                    Notification.objects.create(
                        user=user,
                        title=notification.title,
                        message=notification.message,
                        notification_type="admin_announcement"
                    )
                    successful_sends += 1
                except:
                    failed_sends += 1
            
            notification.successful_sends = successful_sends
            notification.failed_sends = failed_sends
            notification.status = 'sent'
            notification.sent_at = timezone.now()
            notification.save()
            
            return Response({
                'message': 'Notification sent successfully',
                'total_recipients': notification.total_recipients,
                'successful_sends': successful_sends,
                'failed_sends': failed_sends
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=400)
