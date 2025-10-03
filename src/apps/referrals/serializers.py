from rest_framework import serializers
from .models import ReferralCode, Referral, ReferralCredit


class ReferralCodeSerializer(serializers.ModelSerializer):
    """Serializer for referral codes"""
    referral_url = serializers.ReadOnlyField()
    conversion_rate = serializers.ReadOnlyField()
    payment_rate = serializers.ReadOnlyField()
    total_credits_earned = serializers.SerializerMethodField()
    
    class Meta:
        model = ReferralCode
        fields = [
            'id', 'code', 'referral_url', 'created_at', 'is_active',
            'clicks', 'signups', 'paid_referrals',
            'conversion_rate', 'payment_rate', 'total_credits_earned'
        ]
        read_only_fields = ['id', 'code', 'created_at', 'clicks', 'signups', 'paid_referrals']
    
    def get_total_credits_earned(self, obj):
        """Calculate total credits earned from this referral code"""
        # Every 2 paid referrals = 1 credit
        return obj.paid_referrals // 2


class ReferralSerializer(serializers.ModelSerializer):
    """Serializer for individual referrals"""
    referred_user_email = serializers.SerializerMethodField()
    referrer_email = serializers.SerializerMethodField()
    
    class Meta:
        model = Referral
        fields = [
            'id', 'status', 'referred_user_email', 'referrer_email',
            'clicked_at', 'signed_up_at', 'first_payment_at',
            'first_payment_amount', 'credit_awarded_at'
        ]
        read_only_fields = fields
    
    def get_referred_user_email(self, obj):
        return obj.referred_user.email if obj.referred_user else None
    
    def get_referrer_email(self, obj):
        return obj.referral_code.user.email


class ReferralCreditSerializer(serializers.ModelSerializer):
    """Serializer for referral credits"""
    referral_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ReferralCredit
        fields = [
            'id', 'amount', 'status', 'earned_at', 'used_at',
            'expires_at', 'referral_count'
        ]
        read_only_fields = fields
    
    def get_referral_count(self, obj):
        """Number of referrals that contributed to this credit"""
        return obj.earned_from_referrals.count()


class ReferralStatsSerializer(serializers.Serializer):
    """Serializer for referral statistics"""
    total_clicks = serializers.IntegerField()
    total_signups = serializers.IntegerField()
    total_paid_referrals = serializers.IntegerField()
    total_credits_earned = serializers.IntegerField()
    available_credits = serializers.IntegerField()
    used_credits = serializers.IntegerField()
    conversion_rate = serializers.FloatField()
    payment_rate = serializers.FloatField()
    pending_credits = serializers.IntegerField()
    next_credit_progress = serializers.DictField()


class ReferralTrackingSerializer(serializers.Serializer):
    """Serializer for tracking referral clicks"""
    code = serializers.CharField(max_length=8)
    ip_address = serializers.IPAddressField(required=False, allow_null=True)
    user_agent = serializers.CharField(required=False, allow_blank=True)
