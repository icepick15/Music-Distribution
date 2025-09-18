from rest_framework import serializers
from decimal import Decimal
from .models import PaymentMethod, Subscription, Transaction


class PaymentMethodSerializer(serializers.ModelSerializer):
    """Serializer for payment methods"""
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id', 'payment_type', 'is_default', 'is_active',
            'card_last_four', 'card_brand', 'card_exp_month', 'card_exp_year',
            'bank_name', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'paystack_auth_code', 'paystack_customer_code']
    
    def to_representation(self, instance):
        """Custom representation for security"""
        data = super().to_representation(instance)
        
        # Hide sensitive card info, only show last 4 digits
        if instance.payment_type == 'card':
            data['display_name'] = f"{instance.card_brand} ****{instance.card_last_four}"
        elif instance.payment_type == 'bank_transfer':
            data['display_name'] = f"{instance.bank_name} Transfer"
        else:
            data['display_name'] = instance.get_payment_type_display()
        
        return data


class SubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for user subscriptions"""
    
    is_active = serializers.ReadOnlyField()
    remaining_credits = serializers.ReadOnlyField()
    payment_method_display = serializers.CharField(source='payment_method', read_only=True)
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'subscription_type', 'status', 'amount', 'currency',
            'song_credits', 'credits_used', 'remaining_credits',
            'start_date', 'end_date', 'auto_renew', 'is_active',
            'payment_method_display', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'credits_used']


class TransactionSerializer(serializers.ModelSerializer):
    """Serializer for payment transactions"""
    
    payment_method_display = serializers.CharField(source='payment_method', read_only=True)
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_type', 'status', 'amount', 'currency', 'fees',
            'description', 'paystack_reference', 'payment_method_display',
            'initiated_at', 'completed_at'
        ]
        read_only_fields = ['id', 'initiated_at', 'completed_at', 'paystack_reference']


class PaymentInitiationSerializer(serializers.Serializer):
    """Serializer for initiating payments"""
    
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('100.00'))
    transaction_type = serializers.ChoiceField(choices=Transaction.TRANSACTION_TYPE_CHOICES)
    payment_method_id = serializers.UUIDField(required=False)
    subscription_type = serializers.ChoiceField(
        choices=Subscription.SUBSCRIPTION_TYPE_CHOICES, 
        required=False
    )
    song_credits = serializers.IntegerField(min_value=1, required=False)
    
    def validate(self, data):
        """Validate payment initiation data"""
        transaction_type = data.get('transaction_type')
        
        if transaction_type == 'subscription':
            if not data.get('subscription_type'):
                raise serializers.ValidationError(
                    "subscription_type is required for subscription payments"
                )
        
        elif transaction_type == 'credit_purchase':
            if not data.get('song_credits'):
                raise serializers.ValidationError(
                    "song_credits is required for credit purchases"
                )
        
        return data


class SubscriptionUpgradeSerializer(serializers.Serializer):
    """Serializer for subscription upgrades"""
    
    subscription_type = serializers.ChoiceField(choices=Subscription.SUBSCRIPTION_TYPE_CHOICES)
    payment_method_id = serializers.UUIDField(required=False)
    auto_renew = serializers.BooleanField(default=True)
    
    def validate_subscription_type(self, value):
        """Validate subscription type"""
        if value == 'free':
            raise serializers.ValidationError("Cannot upgrade to free plan")
        return value


class CardPaymentSerializer(serializers.Serializer):
    """Serializer for card payments"""
    
    card_number = serializers.CharField(max_length=19)
    expiry_month = serializers.CharField(max_length=2)
    expiry_year = serializers.CharField(max_length=4) 
    cvv = serializers.CharField(max_length=4)
    save_card = serializers.BooleanField(default=False)
    
    def validate_card_number(self, value):
        """Basic card number validation"""
        # Remove spaces and validate length
        card_number = value.replace(' ', '')
        if not card_number.isdigit() or len(card_number) < 13 or len(card_number) > 19:
            raise serializers.ValidationError("Invalid card number")
        return card_number
    
    def validate_expiry_month(self, value):
        """Validate expiry month"""
        try:
            month = int(value)
            if not 1 <= month <= 12:
                raise serializers.ValidationError("Invalid month")
        except ValueError:
            raise serializers.ValidationError("Month must be a number")
        return value
    
    def validate_expiry_year(self, value):
        """Validate expiry year"""
        try:
            year = int(value)
            if year < 2024:
                raise serializers.ValidationError("Card has expired")
        except ValueError:
            raise serializers.ValidationError("Year must be a number")
        return value
    
    def validate_cvv(self, value):
        """Validate CVV"""
        if not value.isdigit() or len(value) < 3 or len(value) > 4:
            raise serializers.ValidationError("Invalid CVV")
        return value


class BankTransferSerializer(serializers.Serializer):
    """Serializer for bank transfer payments"""
    
    bank_code = serializers.CharField(max_length=10)
    account_number = serializers.CharField(max_length=20)
    
    def validate_account_number(self, value):
        """Validate account number"""
        if not value.isdigit() or len(value) != 10:
            raise serializers.ValidationError("Invalid account number")
        return value
