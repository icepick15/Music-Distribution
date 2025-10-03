"""
Management command to check scheduled releases and notify admins
Run this daily via cron job or task scheduler
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from apps.songs.album_models import Album
from apps.notifications.services import NotificationService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Check scheduled releases and send admin notifications'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Checking scheduled releases...'))
        
        # Get all scheduled albums
        scheduled_albums = Album.objects.filter(
            status='scheduled',
            release_date__gt=timezone.now().date()
        )
        
        notification_count = 0
        
        for album in scheduled_albums:
            if album.should_notify_admin():
                self.notify_admin(album)
                notification_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully sent {notification_count} notifications for {scheduled_albums.count()} scheduled releases'
            )
        )
    
    def notify_admin(self, album):
        """Send notification to admin about upcoming release"""
        days_until = album.days_until_release
        
        try:
            message = f"REMINDER: '{album.title}' by {album.artist.get_full_name()} releases in {days_until} day(s) on {album.release_date}"
            
            context_data = {
                'album_id': str(album.id),
                'album_title': album.title,
                'artist': album.artist.get_full_name(),
                'artist_email': album.artist.email,
                'release_date': album.release_date.isoformat(),
                'days_until_release': days_until,
                'release_type': album.release_type,
                'tracks_count': album.tracks_uploaded,
                'is_complete': album.is_complete,
            }
            
            NotificationService.send_admin_notification(
                title=f"Release in {days_until} day(s): {album.title}",
                message=message,
                notification_type='scheduled_release_reminder',
                context_data=context_data,
                send_email=True,
                send_websocket=True,
                priority='high' if days_until <= 3 else 'medium'
            )
            
            # Update admin_notified_days
            if days_until not in album.admin_notified_days:
                album.admin_notified_days.append(days_until)
                album.save(update_fields=['admin_notified_days'])
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'  ✓ Notified admin about {album.title} (releasing in {days_until} days)'
                )
            )
            
            logger.info(f"Admin notified: {album.title} - {days_until} days until release")
            
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(
                    f'  ✗ Failed to notify about {album.title}: {str(e)}'
                )
            )
            logger.error(f"Failed to notify admin about {album.title}: {e}")
