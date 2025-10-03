"""
Album/EP Management Models
Allows artists to create albums/EPs first, then add tracks later
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
import uuid

User = get_user_model()


def album_cover_upload_path(instance, filename):
    """Generate upload path for album cover images"""
    ext = filename.split('.')[-1]
    filename = f"album_cover_{uuid.uuid4()}.{ext}"
    return f'albums/{instance.artist.id}/{filename}'


class Album(models.Model):
    """Album/EP model - created first before adding tracks"""
    
    RELEASE_TYPE_CHOICES = [
        ('single', 'Single'),
        ('ep', 'EP'),
        ('album', 'Album'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('in_progress', 'In Progress'),
        ('pending', 'Pending Review'),
        ('scheduled', 'Scheduled'),
        ('approved', 'Approved'),
        ('distributed', 'Distributed'),
        ('rejected', 'Rejected'),
    ]
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    artist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='albums')
    release_type = models.CharField(max_length=20, choices=RELEASE_TYPE_CHOICES, default='album')
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    cover_art = models.ImageField(upload_to=album_cover_upload_path, blank=True, null=True)
    cover_url = models.URLField(blank=True, null=True)  # For direct Cloudinary uploads
    
    # Track Management
    number_of_tracks = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Total number of tracks planned for this release"
    )
    tracks_uploaded = models.PositiveIntegerField(default=0)
    
    # Release Info
    release_date = models.DateField(help_text="Scheduled or actual release date")
    is_explicit = models.BooleanField(default=False)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    distributed_at = models.DateTimeField(blank=True, null=True)
    
    # Admin Notifications
    admin_notified_scheduled = models.BooleanField(default=False, help_text="Has admin been notified about scheduled release?")
    admin_notified_days = models.JSONField(default=list, help_text="Days before release admin was notified")
    
    class Meta:
        db_table = 'albums'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['artist', 'status']),
            models.Index(fields=['release_date']),
            models.Index(fields=['status', 'release_date']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.release_type}) by {self.artist.get_full_name()}"
    
    @property
    def is_complete(self):
        """Check if all tracks have been uploaded"""
        return self.tracks_uploaded >= self.number_of_tracks
    
    @property
    def completion_percentage(self):
        """Calculate upload completion percentage"""
        if self.number_of_tracks == 0:
            return 0
        return (self.tracks_uploaded / self.number_of_tracks) * 100
    
    @property
    def is_scheduled(self):
        """Check if release is scheduled for future"""
        from django.utils import timezone
        return self.release_date > timezone.now().date()
    
    @property
    def days_until_release(self):
        """Calculate days until scheduled release"""
        from django.utils import timezone
        if not self.is_scheduled:
            return 0
        delta = self.release_date - timezone.now().date()
        return delta.days
    
    def should_notify_admin(self):
        """Check if admin should be notified about upcoming release"""
        if not self.is_scheduled or self.status != 'scheduled':
            return False
        
        days_until = self.days_until_release
        # Notify at 30, 14, 7, 3, 1 days before release
        notification_days = [30, 14, 7, 3, 1]
        
        for day in notification_days:
            if days_until == day and day not in self.admin_notified_days:
                return True
        
        return False


class AlbumTrack(models.Model):
    """Tracks that belong to an album/EP"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='tracks')
    song = models.ForeignKey('Song', on_delete=models.CASCADE, related_name='album_membership')
    track_number = models.PositiveIntegerField()
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'album_tracks'
        ordering = ['track_number']
        unique_together = ['album', 'track_number']
        indexes = [
            models.Index(fields=['album', 'track_number']),
        ]
    
    def __str__(self):
        return f"Track {self.track_number}: {self.song.title} (from {self.album.title})"
    
    def save(self, *args, **kwargs):
        """Update album's tracks_uploaded count"""
        is_new = self._state.adding
        super().save(*args, **kwargs)
        
        if is_new:
            # Increment tracks uploaded count
            self.album.tracks_uploaded = self.album.tracks.count()
            self.album.save(update_fields=['tracks_uploaded'])
