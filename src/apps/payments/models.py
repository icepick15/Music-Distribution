from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from decimal import Decimal
import uuid

User = get_user_model()


class PaymentMethod(models.Model):
    """User's saved payment methods"""
    PAYMENT_TYPE_CHOICES = [
        ('card', 'Credit/Debit Card'),
        ('bank_transfer', 'Bank Transfer'),
        ('ussd', 'USSD'),
        ('qr', 'QR Code'),
        ('mobile_money', 'Mobile Money'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payment_methods')
    
    # Payment method details
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    # Card details (encrypted/tokenized)
    card_last_four = models.CharField(max_length=4, blank=True, null=True)
    card_brand = models.CharField(max_length=20, blank=True, null=True)  # visa, mastercard, etc
    card_exp_month = models.CharField(max_length=2, blank=True, null=True)
    card_exp_year = models.CharField(max_length=4, blank=True, null=True)
    
    # Bank details
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    account_number = models.CharField(max_length=20, blank=True, null=True)
    
    # External payment processor data
    paystack_auth_code = models.CharField(max_length=255, blank=True, null=True)
    paystack_customer_code = models.CharField(max_length=255, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'payment_methods'
        ordering = ['-is_default', '-created_at']
    
    def __str__(self):
        if self.payment_type == 'card' and self.card_last_four:
            return f"{self.card_brand} ****{self.card_last_four}"
        elif self.payment_type == 'bank_transfer' and self.bank_name:
            return f"{self.bank_name} Transfer"
        return f"{self.get_payment_type_display()}"
    
    def save(self, *args, **kwargs):
        # Ensure only one default payment method per user
        if self.is_default:
            PaymentMethod.objects.filter(
                user=self.user, 
                is_default=True
            ).exclude(id=self.id).update(is_default=False)
        super().save(*args, **kwargs)


class Subscription(models.Model):
    """User subscription management"""
    SUBSCRIPTION_TYPE_CHOICES = [
        ('free', 'Free'),
        ('pay_per_song', 'Pay Per Song'),
        ('yearly', 'Yearly Premium'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('canceled', 'Canceled'),
        ('expired', 'Expired'),
        ('suspended', 'Suspended'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    
    subscription_type = models.CharField(max_length=20, choices=SUBSCRIPTION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Pricing
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    currency = models.CharField(max_length=3, default='NGN')
    
    # Credits for pay-per-song model
    song_credits = models.PositiveIntegerField(default=0)
    credits_used = models.PositiveIntegerField(default=0)
    
    # Subscription dates
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(blank=True, null=True)
    auto_renew = models.BooleanField(default=True)
    
    # Payment method used
    payment_method = models.ForeignKey(
        PaymentMethod, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'subscriptions'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_subscription_type_display()}"
    
    @property
    def is_active(self):
        """Check if subscription is currently active"""
        if self.status != 'active':
            return False
        if self.end_date and timezone.now() > self.end_date:
            return False
        return True
    
    @property
    def remaining_credits(self):
        """Get remaining song credits for pay-per-song subscriptions"""
        if self.subscription_type == 'pay_per_song':
            return max(0, self.song_credits - self.credits_used)
        return 0
    
    def use_credit(self):
        """Use one song credit"""
        if self.subscription_type == 'pay_per_song' and self.remaining_credits > 0:
            self.credits_used += 1
            self.save()
            return True
        return False


class Transaction(models.Model):
    """Payment transaction records"""
    TRANSACTION_TYPE_CHOICES = [
        ('subscription', 'Subscription Payment'),
        ('song_upload', 'Song Upload Payment'),
        ('credit_purchase', 'Credit Purchase'),
        ('refund', 'Refund'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('canceled', 'Canceled'),
        ('refunded', 'Refunded'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    
    # Transaction details
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Financial details
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='NGN')
    fees = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    # Related objects
    subscription = models.ForeignKey(
        Subscription, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    payment_method = models.ForeignKey(
        PaymentMethod, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True
    )
    
    # External payment processor data
    paystack_reference = models.CharField(max_length=255, unique=True)
    paystack_access_code = models.CharField(max_length=255, blank=True, null=True)
    gateway_response = models.JSONField(default=dict, blank=True)
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    initiated_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        db_table = 'transactions'
        ordering = ['-initiated_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['paystack_reference']),
        ]
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_transaction_type_display()} - ₦{self.amount}"
    
    def mark_as_completed(self):
        """Mark transaction as completed"""
        self.status = 'success'
        self.completed_at = timezone.now()
        self.save()
    
    def mark_as_failed(self, reason=None):
        """Mark transaction as failed"""
        self.status = 'failed'
        if reason:
            self.metadata['failure_reason'] = reason
        self.save()
