from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
import os

User = get_user_model()


def audio_upload_path(instance, filename):
    """Generate upload path for audio files"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('src', 'media', 'audio', str(instance.artist.id), filename)


def cover_upload_path(instance, filename):
    """Generate upload path for cover images"""
    ext = filename.split('.')[-1]
    filename = f"cover_{uuid.uuid4()}.{ext}"
    return os.path.join('src', 'media', 'covers', str(instance.artist.id), filename)


class Genre(models.Model):
    """Music genres"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'genres'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Song(models.Model):
    """Music track model"""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('pending', 'Pending Review'),
        ('approved', 'Approved'),
        ('distributed', 'Distributed'),
        ('rejected', 'Rejected'),
    ]
    
    RELEASE_TYPE_CHOICES = [
        ('single', 'Single'),
        ('ep', 'EP'),
        ('album', 'Album'),
        ('compilation', 'Compilation'),
    ]
    
    # Basic Info
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    artist = models.ForeignKey(User, on_delete=models.CASCADE, related_name='songs')
    featured_artists = models.CharField(max_length=500, blank=True, null=True, help_text="Comma-separated list of featured artists")
    
    # Release Info
    release_type = models.CharField(max_length=20, choices=RELEASE_TYPE_CHOICES, default='single')
    album_title = models.CharField(max_length=200, blank=True, null=True)
    track_number = models.PositiveIntegerField(blank=True, null=True)
    
    # Content
    # Allow either direct file upload (backend-handled) or client direct-to-Cloudinary URLs
    audio_file = models.FileField(upload_to=audio_upload_path, help_text="Audio file (MP3, WAV, FLAC)", blank=True, null=True)
    cover_image = models.ImageField(upload_to=cover_upload_path, help_text="Cover art (minimum 1400x1400px)", blank=True, null=True)
    # Optional direct URLs (e.g. Cloudinary secure_url) when client uploads directly to cloudinary
    audio_url = models.URLField(blank=True, null=True)
    cover_url = models.URLField(blank=True, null=True)
    
    # Metadata
    genre = models.ForeignKey(Genre, on_delete=models.SET_NULL, null=True, blank=True)
    subgenre = models.CharField(max_length=100, blank=True, null=True)
    duration = models.PositiveIntegerField(help_text="Duration in seconds", blank=True, null=True)
    
    # Rights & Publishing
    composer = models.CharField(max_length=200, blank=True, null=True)
    publisher = models.CharField(max_length=200, blank=True, null=True)
    isrc_code = models.CharField(max_length=12, blank=True, null=True, unique=True, help_text="International Standard Recording Code")
    
    # Pricing & Distribution
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.99)
    is_explicit = models.BooleanField(default=False)
    release_date = models.DateField(blank=True, null=True)
    
    # Status & Analytics
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    total_streams = models.PositiveIntegerField(default=0)
    total_downloads = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    submitted_at = models.DateTimeField(blank=True, null=True)
    approved_at = models.DateTimeField(blank=True, null=True)
    distributed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'songs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['artist', 'status']),
            models.Index(fields=['genre']),
            models.Index(fields=['release_date']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.artist.get_full_name()}"
    
    @property
    def duration_formatted(self):
        """Return duration in MM:SS format"""
        if not self.duration:
            return "0:00"
        minutes = self.duration // 60
        seconds = self.duration % 60
        return f"{minutes}:{seconds:02d}"
    
    @property
    def file_size(self):
        """Return audio file size in MB"""
        try:
            if self.audio_file:
                return round(self.audio_file.size / (1024 * 1024), 2)
        except (AttributeError, OSError, IOError):
            # Handle S3 or file access errors gracefully
            pass
        return 0


class Platform(models.Model):
    """Streaming/distribution platforms"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    logo = models.ImageField(upload_to='platform_logos/', blank=True, null=True)
    is_active = models.BooleanField(default=True)
    revenue_share = models.DecimalField(max_digits=5, decimal_places=2, default=70.00, help_text="Platform revenue share percentage")
    
    class Meta:
        db_table = 'platforms'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class SongDistribution(models.Model):
    """Track distribution to platforms"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    song = models.ForeignKey(Song, on_delete=models.CASCADE, related_name='distributions')
    platform = models.ForeignKey(Platform, on_delete=models.CASCADE)
    
    platform_song_id = models.CharField(max_length=200, blank=True, null=True)
    platform_url = models.URLField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=[
        ('pending', 'Pending'),
        ('live', 'Live'),
        ('failed', 'Failed'),
        ('removed', 'Removed'),
    ], default='pending')
    
    distributed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'song_distributions'
        unique_together = ['song', 'platform']
    
    def __str__(self):
        return f"{self.song.title} on {self.platform.name}"
