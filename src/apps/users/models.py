from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """Custom user model with additional fields for music distribution platform"""
    
    ROLE_CHOICES = [
        ('user', 'User'),
        ('artist', 'Artist'),
        ('admin', 'Admin'),
        ('staff', 'Staff'),
    ]
    
    SUBSCRIPTION_CHOICES = [
        ('free', 'Free'),
        ('bronze', 'Bronze'),
        ('silver', 'Silver'), 
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]
    
    # Basic info
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    
    # Profile info
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    subscription = models.CharField(max_length=10, choices=SUBSCRIPTION_CHOICES, default='free')
    subscription_expires_at = models.DateTimeField(blank=True, null=True)
    
    # Profile details
    bio = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    # Social media links
    instagram_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    facebook_url = models.URLField(blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)
    spotify_url = models.URLField(blank=True, null=True)
    
    # Account status
    is_verified = models.BooleanField(default=False)
    is_artist_verified = models.BooleanField(default=False)
    verification_documents = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(blank=True, null=True)
    
    # Use email as the unique identifier
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    def get_full_name(self):
        """Return the first_name plus the last_name, with a space in between."""
        full_name = f"{self.first_name} {self.last_name}"
        return full_name.strip()
    
    def get_short_name(self):
        """Return the short name for the user."""
        return self.first_name
    
    @property
    def has_active_subscription(self):
        """Check if user has an active subscription"""
        if self.subscription == 'free':
            return False
        if self.subscription_expires_at:
            from django.utils import timezone
            return timezone.now() < self.subscription_expires_at
        return True
    
    @property
    def is_admin_user(self):
        """Check if user is admin or staff"""
        return self.role in ['admin', 'staff'] or self.is_staff or self.is_superuser


class UserProfile(models.Model):
    """Extended user profile for additional metadata"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    release_updates = models.BooleanField(default=True)
    
    # Privacy settings
    profile_visible = models.BooleanField(default=True)
    show_email = models.BooleanField(default=False)
    show_phone = models.BooleanField(default=False)
    data_sharing = models.BooleanField(default=False)
    
    # Platform preferences  
    preferred_currency = models.CharField(max_length=3, default='NGN')
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    
    # Statistics
    total_releases = models.PositiveIntegerField(default=0)
    total_streams = models.PositiveIntegerField(default=0)
    total_revenue = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = _('User Profile')
        verbose_name_plural = _('User Profiles')
    
    def __str__(self):
        return f"{self.user.get_full_name()}'s Profile"
