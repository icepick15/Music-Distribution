import uuid
import string
import random
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator


def generate_referral_code():
    """Generate a unique 8-character referral code"""
    characters = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choices(characters, k=8))
        if not ReferralCode.objects.filter(code=code).exists():
            return code


class ReferralCode(models.Model):
    """Referral code owned by a user"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='referral_code'
    )
    code = models.CharField(max_length=8, unique=True, default=generate_referral_code)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    
    # Analytics
    clicks = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    signups = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    paid_referrals = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    
    class Meta:
        db_table = 'referral_codes'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['user', 'is_active']),
        ]
        
    def __str__(self):
        return f"{self.user.email} - {self.code}"
    
    @property
    def conversion_rate(self):
        """Calculate signup to click conversion rate"""
        if self.clicks == 0:
            return 0
        return round((self.signups / self.clicks) * 100, 2)
    
    @property
    def payment_rate(self):
        """Calculate payment conversion rate"""
        if self.signups == 0:
            return 0
        return round((self.paid_referrals / self.signups) * 100, 2)
    
    @property
    def referral_url(self):
        """Generate the full referral URL"""
        from django.conf import settings
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        return f"{base_url}/join/{self.code}"


class Referral(models.Model):
    """Track individual referrals"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('signed_up', 'Signed Up'),
        ('paid', 'Paid'),
        ('credit_awarded', 'Credit Awarded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referral_code = models.ForeignKey(
        ReferralCode,
        on_delete=models.CASCADE,
        related_name='referrals'
    )
    referred_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='referral_source',
        null=True,
        blank=True
    )
    
    # Tracking data
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    tracking_cookie = models.CharField(max_length=100, null=True, blank=True)
    
    # Timestamps
    clicked_at = models.DateTimeField(auto_now_add=True)
    signed_up_at = models.DateTimeField(null=True, blank=True)
    first_payment_at = models.DateTimeField(null=True, blank=True)
    credit_awarded_at = models.DateTimeField(null=True, blank=True)
    
    # Additional data
    first_payment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'referrals'
        indexes = [
            models.Index(fields=['referral_code', 'status']),
            models.Index(fields=['referred_user']),
            models.Index(fields=['tracking_cookie']),
            models.Index(fields=['-clicked_at']),
        ]
        
    def __str__(self):
        user_email = self.referred_user.email if self.referred_user else "Anonymous"
        return f"{self.referral_code.code} -> {user_email} ({self.status})"
    
    def mark_signed_up(self, user):
        """Mark referral as signed up"""
        self.referred_user = user
        self.status = 'signed_up'
        self.signed_up_at = timezone.now()
        self.save()
        
        # Update referral code stats
        self.referral_code.signups += 1
        self.referral_code.save()
    
    def mark_paid(self, payment_amount):
        """Mark referral as paid"""
        if self.status in ['pending', 'signed_up']:
            self.status = 'paid'
            self.first_payment_at = timezone.now()
            self.first_payment_amount = payment_amount
            self.save()
            
            # Update referral code stats
            self.referral_code.paid_referrals += 1
            self.referral_code.save()


class ReferralCredit(models.Model):
    """Track credits earned from referrals"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('available', 'Available'),
        ('used', 'Used'),
        ('expired', 'Expired'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='referral_credits'
    )
    
    # Credit details
    amount = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Number of free uploads"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    
    # Source tracking
    earned_from_referrals = models.ManyToManyField(
        Referral,
        related_name='credits_awarded',
        blank=True
    )
    
    # Timestamps
    earned_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # Usage tracking
    used_for_song = models.ForeignKey(
        'songs.Song',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='referral_credits_used'
    )
    
    class Meta:
        db_table = 'referral_credits'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', '-earned_at']),
        ]
        ordering = ['-earned_at']
        
    def __str__(self):
        return f"{self.user.email} - {self.amount} credit(s) ({self.status})"
    
    def use_credit(self, song):
        """Mark credit as used"""
        if self.status != 'available':
            raise ValueError("Credit is not available for use")
        
        self.status = 'used'
        self.used_at = timezone.now()
        self.used_for_song = song
        self.save()
    
    @classmethod
    def get_available_credits(cls, user):
        """Get total available credits for a user"""
        return cls.objects.filter(
            user=user,
            status='available'
        ).aggregate(total=models.Sum('amount'))['total'] or 0
    
    @classmethod
    def use_credits_for_upload(cls, user, song):
        """Use one credit for an upload"""
        credit = cls.objects.filter(
            user=user,
            status='available'
        ).first()
        
        if not credit:
            raise ValueError("No available credits")
        
        credit.use_credit(song)
        return credit
