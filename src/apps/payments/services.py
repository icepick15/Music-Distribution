import os
import uuid
import logging
from decimal import Decimal
from typing import Dict, Optional, Tuple
from django.conf import settings
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.db import transaction
from pypaystack2 import PaystackClient
from .models import PaymentMethod, Subscription, Transaction

User = get_user_model()
logger = logging.getLogger(__name__)


class PaymentService:
    """Service for handling payments via Paystack"""
    
    def __init__(self):
        self.paystack = PaystackClient(secret_key=settings.PAYSTACK_SECRET_KEY)
        self.public_key = settings.PAYSTACK_PUBLIC_KEY
    
    def create_customer(self, user) -> Optional[str]:
        """Create or get Paystack customer"""
        try:
            # Check if customer already exists
            existing_payment_methods = PaymentMethod.objects.filter(
                user=user,
                paystack_customer_code__isnull=False
            ).first()
            
            if existing_payment_methods:
                return existing_payment_methods.paystack_customer_code
            
            # Create new customer
            customer_data = {
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'phone': user.phone_number or '',
            }
            
            response = self.paystack.customers.create(**customer_data)
            
            if response.status_code == 200 and response.data:
                return response.data.customer_code
            else:
                logger.error(f"Failed to create Paystack customer: {response.message}")
                return None
                
        except Exception as e:
            logger.error(f"Error creating customer: {str(e)}")
            return None
    
    def initialize_payment(
        self, 
        user, 
        amount: Decimal, 
        transaction_type: str,
        **kwargs
    ) -> Tuple[bool, Dict]:
        """Initialize a payment transaction"""
        try:
            # Generate unique reference
            reference = f"mdp_{transaction_type}_{user.id}_{uuid.uuid4().hex[:8]}"
            
            # Convert amount to kobo (Paystack uses kobo)
            amount_in_kobo = int(amount * 100)
            
            # Prepare payment data
            payment_data = {
                'email': user.email,
                'amount': amount_in_kobo,
                'reference': reference,
                'currency': 'NGN',
                'callback_url': f"{settings.FRONTEND_URL}/payment/callback",
                'metadata': {
                    'user_id': str(user.id),
                    'transaction_type': transaction_type,
                    'custom_fields': [
                        {
                            'display_name': 'User',
                            'variable_name': 'user',
                            'value': user.get_full_name()
                        }
                    ]
                }
            }
            
            # Add additional metadata based on transaction type
            if transaction_type == 'subscription':
                payment_data['metadata']['subscription_type'] = kwargs.get('subscription_type')
            elif transaction_type == 'credit_purchase':
                payment_data['metadata']['song_credits'] = kwargs.get('song_credits')
            
            # Initialize payment with Paystack
            response = self.paystack.transactions.initialize(**payment_data)
            
            if response.status_code == 200 and response.data:
                # Create transaction record
                transaction = Transaction.objects.create(
                    user=user,
                    transaction_type=transaction_type,
                    amount=amount,
                    paystack_reference=reference,
                    paystack_access_code=response.data.access_code,
                    description=kwargs.get('description', f'{transaction_type.title()} Payment'),
                    metadata=payment_data['metadata']
                )
                
                return True, {
                    'transaction_id': str(transaction.id),
                    'reference': reference,
                    'access_code': response.data.access_code,
                    'authorization_url': response.data.authorization_url,
                    'amount': float(amount),
                    'currency': 'NGN'
                }
            else:
                logger.error(f"Failed to initialize payment: {getattr(response, 'message', 'Unknown error')}")
                return False, {'error': getattr(response, 'message', 'Payment initialization failed')}
                
        except Exception as e:
            logger.error(f"Error initializing payment: {str(e)}")
            return False, {'error': 'Payment initialization failed'}
    
    def verify_payment(self, reference: str) -> Tuple[bool, Dict]:
        """Verify a payment transaction"""
        try:
            response = self.paystack.transactions.verify(reference=reference)
            
            if response.status_code == 200 and response.data:
                # Convert response data to JSON-safe format
                payment_data = self._make_json_safe(response.data.__dict__)
                return True, payment_data
            else:
                logger.error(f"Failed to verify payment: {getattr(response, 'message', 'Unknown error')}")
                return False, {'error': getattr(response, 'message', 'Payment verification failed')}
                
        except Exception as e:
            logger.error(f"Error verifying payment: {str(e)}")
            return False, {'error': 'Payment verification failed'}
    
    def handle_payment_success(self, reference: str) -> Tuple[bool, Dict]:
        """Handle successful payment"""
        try:
            logger.info(f"Processing payment success for reference: {reference}")
            
            # Use atomic transaction to prevent database locks and race conditions
            with transaction.atomic():
                # Get transaction with SELECT FOR UPDATE to prevent race conditions
                try:
                    transaction_obj = Transaction.objects.select_for_update().get(paystack_reference=reference)
                except Transaction.DoesNotExist:
                    logger.error(f"Transaction not found for reference: {reference}")
                    return False, {'error': 'Transaction not found'}
                
                logger.info(f"Found transaction: {transaction_obj.id}, status: {transaction_obj.status}")
                
                # Skip if already processed to prevent double processing
                if transaction_obj.status == 'completed':
                    logger.info(f"Transaction {transaction_obj.id} already completed, skipping")
                    return True, {'message': 'Payment already processed'}
                
                # Verify payment with Paystack
                success, payment_data = self.verify_payment(reference)
                logger.info(f"Paystack verification: success={success}, status={payment_data.get('status') if success else 'failed'}")
                
                if not success:
                    logger.error(f"Paystack verification failed: {payment_data}")
                    return False, payment_data
                
                # Check if payment was successful
                if payment_data['status'] != 'success':
                    logger.warning(f"Payment status is not success: {payment_data['status']}")
                    transaction_obj.mark_as_failed('Payment not successful')
                    return False, {'error': 'Payment was not successful'}
                
                # Update transaction
                transaction_obj.gateway_response = payment_data
                transaction_obj.mark_as_completed()
                logger.info(f"Transaction {transaction_obj.id} marked as completed")
                
                # Process based on transaction type
                if transaction_obj.transaction_type == 'subscription':
                    success, result = self._process_subscription_payment(transaction_obj, payment_data)
                    logger.info(f"Subscription processing: success={success}")
                elif transaction_obj.transaction_type == 'credit_purchase':
                    success, result = self._process_credit_purchase(transaction_obj, payment_data)
                    logger.info(f"Credit purchase processing: success={success}")
                elif transaction_obj.transaction_type == 'song_upload':
                    success, result = self._process_song_upload_payment(transaction_obj, payment_data)
                    logger.info(f"Song upload processing: success={success}")
                else:
                    success, result = True, {'message': 'Payment processed successfully'}
                
                # Save payment method if authorization code is provided
                auth_data = payment_data.get('authorization', {})
                if auth_data.get('reusable') and auth_data.get('authorization_code'):
                    self._save_payment_method(transaction_obj.user, auth_data)
                
                logger.info(f"Payment processing completed successfully for {reference}")
                return success, result
            
        except Exception as e:
            logger.error(f"Error handling payment success: {str(e)}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return False, {'error': 'Failed to process payment'}
    
    def _process_subscription_payment(self, transaction: Transaction, payment_data: Dict) -> Tuple[bool, Dict]:
        """Process subscription payment"""
        try:
            subscription_type = transaction.metadata.get('subscription_type')
            
            if not subscription_type:
                return False, {'error': 'Subscription type not found'}
            
            # Calculate end date based on subscription type
            start_date = timezone.now()
            end_date = None
            song_credits = 0
            
            if subscription_type == 'yearly':
                end_date = start_date + timezone.timedelta(days=365)
            elif subscription_type == 'pay_per_song':
                # For pay-per-song, calculate credits based on amount
                song_credits = int(transaction.amount / 5000)  # ₦5,000 per song
            
            # Cancel existing active subscriptions ONLY if it's a different type
            # For pay-per-song, we want to add credits to existing subscription
            if subscription_type != 'pay_per_song':
                Subscription.objects.filter(
                    user=transaction.user,
                    status='active'
                ).update(status='canceled')
            
            # For pay-per-song, check if user already has an active subscription
            existing_pps = None
            if subscription_type == 'pay_per_song':
                existing_pps = Subscription.objects.filter(
                    user=transaction.user,
                    subscription_type='pay_per_song',
                    status='active'
                ).first()
            
            if existing_pps:
                # Add credits to existing subscription
                existing_pps.song_credits += song_credits
                existing_pps.save()
                subscription = existing_pps
                transaction.subscription = subscription
                transaction.save()
            else:
                # Create new subscription
                subscription = Subscription.objects.create(
                    user=transaction.user,
                    subscription_type=subscription_type,
                    amount=transaction.amount,
                    song_credits=song_credits,
                    start_date=start_date,
                    end_date=end_date,
                    payment_method=transaction.payment_method
                )
                
                transaction.subscription = subscription
                transaction.save()

            # Update user subscription info
            # Map billing types to subscription tiers
            if subscription_type == 'yearly':
                user_subscription_tier = 'gold'  # Yearly gets gold tier
            elif subscription_type == 'pay_per_song':
                user_subscription_tier = 'silver'  # Pay-per-song gets silver tier
            else:
                user_subscription_tier = subscription_type  # Keep original if it's already a valid tier
            
            transaction.user.subscription = user_subscription_tier
            transaction.user.subscription_expires_at = end_date
            # If this grants upload access (either yearly or pay_per_song), set role to artist
            if subscription_type in ('yearly', 'pay_per_song'):
                transaction.user.role = 'artist'
            transaction.user.save()
            
            return True, {
                'message': 'Subscription activated successfully',
                'subscription_id': str(subscription.id),
                'subscription_type': subscription_type,
                'song_credits': song_credits
            }
            
        except Exception as e:
            logger.error(f"Error processing subscription payment: {str(e)}")
            return False, {'error': 'Failed to activate subscription'}
    
    def _process_credit_purchase(self, transaction: Transaction, payment_data: Dict) -> Tuple[bool, Dict]:
        """Process credit purchase"""
        try:
            song_credits = transaction.metadata.get('song_credits', 0)
            
            # Get user's current pay-per-song subscription or create one
            subscription = Subscription.objects.filter(
                user=transaction.user,
                subscription_type='pay_per_song',
                status='active'
            ).first()
            
            if not subscription:
                subscription = Subscription.objects.create(
                    user=transaction.user,
                    subscription_type='pay_per_song',
                    amount=0,
                    song_credits=song_credits
                )
            else:
                subscription.song_credits += song_credits
                subscription.save()
            
            transaction.subscription = subscription
            transaction.save()

            # Ensure user's subscription/role reflects the credit purchase
            transaction.user.subscription = 'silver'  # Map pay_per_song to silver tier
            # subscription.end_date may be None for pay_per_song
            transaction.user.subscription_expires_at = subscription.end_date
            transaction.user.role = 'artist'
            transaction.user.save()

            return True, {
                'message': f'{song_credits} song credits added successfully',
                'total_credits': subscription.song_credits,
                'remaining_credits': subscription.remaining_credits
            }
            
        except Exception as e:
            logger.error(f"Error processing credit purchase: {str(e)}")
            return False, {'error': 'Failed to add credits'}
    
    def _process_song_upload_payment(self, transaction: Transaction, payment_data: Dict) -> Tuple[bool, Dict]:
        """Process song upload payment"""
        try:
            # Use one credit from user's subscription
            subscription = Subscription.objects.filter(
                user=transaction.user,
                subscription_type='pay_per_song',
                status='active'
            ).first()
            
            if subscription and subscription.use_credit():
                return True, {
                    'message': 'Song upload payment processed',
                    'remaining_credits': subscription.remaining_credits
                }
            else:
                return False, {'error': 'No credits available'}
                
        except Exception as e:
            logger.error(f"Error processing song upload payment: {str(e)}")
            return False, {'error': 'Failed to process upload payment'}
    
    def _save_payment_method(self, user, auth_data: Dict):
        """Save payment method for future use"""
        try:
            # Check if payment method already exists
            existing = PaymentMethod.objects.filter(
                user=user,
                paystack_auth_code=auth_data['authorization_code']
            ).first()
            
            if existing:
                return existing
            
            # Create new payment method
            payment_method = PaymentMethod.objects.create(
                user=user,
                payment_type='card',
                card_last_four=auth_data.get('last4'),
                card_brand=auth_data.get('brand'),
                card_exp_month=auth_data.get('exp_month'),
                card_exp_year=auth_data.get('exp_year'),
                paystack_auth_code=auth_data['authorization_code'],
                paystack_customer_code=auth_data.get('customer_code'),
                is_default=not PaymentMethod.objects.filter(user=user).exists()
            )
            
            return payment_method
            
        except Exception as e:
            logger.error(f"Error saving payment method: {str(e)}")
            return None
    
    def charge_authorization(
        self, 
        auth_code: str, 
        amount: Decimal, 
        email: str,
        reference: str = None
    ) -> Tuple[bool, Dict]:
        """Charge a saved authorization"""
        try:
            if not reference:
                reference = f"mdp_charge_{uuid.uuid4().hex[:8]}"
            
            amount_in_kobo = int(amount * 100)
            
            charge_data = {
                'authorization_code': auth_code,
                'email': email,
                'amount': amount_in_kobo,
                'reference': reference
            }
            
            response = self.paystack.transactions.charge_authorization(**charge_data)
            
            if response.status_code == 200 and response.data:
                # Convert response data to JSON-safe format
                payment_data = self._make_json_safe(response.data.__dict__)
                return True, payment_data
            else:
                logger.error(f"Failed to charge authorization: {getattr(response, 'message', 'Unknown error')}")
                return False, {'error': getattr(response, 'message', 'Authorization charge failed')}
                
        except Exception as e:
            logger.error(f"Error charging authorization: {str(e)}")
            return False, {'error': 'Authorization charge failed'}
    
    def get_banks(self) -> Tuple[bool, list]:
        """Get list of supported banks"""
        try:
            response = self.paystack.miscellaneous.list_banks()
            
            if response.status_code == 200 and response.data:
                return True, [bank.__dict__ for bank in response.data]
            else:
                logger.error(f"Failed to get banks: {getattr(response, 'message', 'Unknown error')}")
                return False, []
                
        except Exception as e:
            logger.error(f"Error getting banks: {str(e)}")
            return False, []

    def _make_json_safe(self, data):
        """Convert data to JSON-safe format by handling datetime objects"""
        import json
        from datetime import datetime, date
        
        if isinstance(data, dict):
            return {key: self._make_json_safe(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [self._make_json_safe(item) for item in data]
        elif isinstance(data, (datetime, date)):
            return data.isoformat()
        elif hasattr(data, '__dict__'):
            return self._make_json_safe(data.__dict__)
        else:
            # Try to JSON serialize to check if it's safe
            try:
                json.dumps(data)
                return data
            except (TypeError, ValueError):
                return str(data)


# Pricing configurations
PRICING_CONFIG = {
    'pay_per_song': {
        'amount': Decimal('5000.00'),  # ₦5,000 per song
        'currency': 'NGN',
        'description': 'Pay Per Song Upload'
    },
    'yearly': {
        'amount': Decimal('39900.00'),  # ₦39,900 per year
        'currency': 'NGN', 
        'description': 'Yearly Premium Subscription'
    },
    'credit_packs': {
        '1': {'amount': Decimal('5000.00'), 'credits': 1},
        '5': {'amount': Decimal('23750.00'), 'credits': 5},  # 5% discount
        '10': {'amount': Decimal('45000.00'), 'credits': 10},  # 10% discount
        '20': {'amount': Decimal('85000.00'), 'credits': 20},  # 15% discount
    }
}


def get_pricing_for_subscription(subscription_type: str) -> Dict:
    """Get pricing information for subscription type"""
    return PRICING_CONFIG.get(subscription_type, {})


def get_pricing_for_credits(credit_count: int) -> Dict:
    """Get pricing information for credit purchase"""
    return PRICING_CONFIG['credit_packs'].get(str(credit_count), {})
