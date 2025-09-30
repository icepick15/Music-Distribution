from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db import transaction as db_transaction
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import PaymentMethod, Subscription, Transaction
from .serializers import (
    PaymentMethodSerializer, SubscriptionSerializer, TransactionSerializer,
    PaymentInitiationSerializer, SubscriptionUpgradeSerializer,
    CardPaymentSerializer, BankTransferSerializer
)
from .services import PaymentService, get_pricing_for_subscription, get_pricing_for_credits
import logging

logger = logging.getLogger(__name__)


class PaymentMethodListCreateView(generics.ListCreateAPIView):
    """List and create payment methods"""
    
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user, is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PaymentMethodDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a payment method"""
    
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)
    
    def perform_destroy(self, instance):
        # Soft delete - mark as inactive
        instance.is_active = False
        instance.save()


class SubscriptionListView(generics.ListAPIView):
    """List user subscriptions"""
    
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)


class CurrentSubscriptionView(APIView):
    """Get current active subscription"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        subscription = Subscription.objects.filter(
            user=request.user,
            status='active'
        ).first()
        
        if subscription:
            serializer = SubscriptionSerializer(subscription)
            return Response(serializer.data)
        
        return Response({
            'subscription_type': 'free',
            'status': 'active',
            'is_active': True,
            'remaining_credits': 0
        })


class TransactionListView(generics.ListAPIView):
    """List user transactions"""
    
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)


class PaymentInitiationView(APIView):
    """Initialize a payment"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PaymentInitiationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        service = PaymentService()
        
        # Initialize payment
        success, result = service.initialize_payment(
            user=request.user,
            amount=data['amount'],
            transaction_type=data['transaction_type'],
            subscription_type=data.get('subscription_type'),
            song_credits=data.get('song_credits'),
            description=f"{data['transaction_type'].title()} Payment"
        )
        
        if success:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)


class SubscriptionUpgradeView(APIView):
    """Upgrade user subscription"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = SubscriptionUpgradeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        data = serializer.validated_data
        subscription_type = data['subscription_type']
        
        # Get pricing for subscription
        pricing = get_pricing_for_subscription(subscription_type)
        if not pricing:
            return Response(
                {'error': 'Invalid subscription type'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already has this subscription
        # For pay-per-song, allow multiple purchases to add more credits
        # For yearly, prevent duplicate subscriptions
        if subscription_type == 'yearly':
            existing = Subscription.objects.filter(
                user=request.user,
                subscription_type=subscription_type,
                status='active'
            ).first()
            
            if existing:
                return Response(
                    {'error': 'You already have an active yearly subscription'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        # For pay-per-song, we allow multiple purchases to add credits
        
        service = PaymentService()
        
        # Initialize payment
        success, result = service.initialize_payment(
            user=request.user,
            amount=pricing['amount'],
            transaction_type='subscription',
            subscription_type=subscription_type,
            description=f"{subscription_type.title()} Subscription"
        )
        
        if success:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)


class CreditPurchaseView(APIView):
    """Purchase song upload credits"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        credit_count = request.data.get('credits', 1)
        
        # Get pricing for credits
        pricing = get_pricing_for_credits(credit_count)
        if not pricing:
            return Response(
                {'error': 'Invalid credit count'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = PaymentService()
        
        # Initialize payment
        success, result = service.initialize_payment(
            user=request.user,
            amount=pricing['amount'],
            transaction_type='credit_purchase',
            song_credits=credit_count,
            description=f"Purchase {credit_count} Song Credits"
        )
        
        if success:
            return Response(result, status=status.HTTP_201_CREATED)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class PaymentCallbackView(APIView):
    """Handle payment callbacks from Paystack"""
    
    permission_classes = []  # No authentication required for callbacks
    
    def post(self, request):
        reference = request.data.get('reference')
        
        if not reference:
            return Response(
                {'error': 'Reference is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        service = PaymentService()
        success, result = service.handle_payment_success(reference)
        
        if success:
            return Response(result, status=status.HTTP_200_OK)
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)


class PaymentVerificationView(APIView):
    """Verify payment status"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        reference = request.data.get('reference')
        
        if not reference:
            return Response(
                {'error': 'Reference is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            transaction = Transaction.objects.get(
                paystack_reference=reference,
                user=request.user
            )
            
            logger.info(f"Verifying payment for reference: {reference}, user: {request.user.id}")
            
            service = PaymentService()
            success, result = service.handle_payment_success(reference)
            
            logger.info(f"Payment verification result: success={success}, result={result}")
            
            if success:
                return Response({
                    'status': 'success',
                    'transaction_id': str(transaction.id),
                    'message': 'Payment verified successfully',
                    **result
                })
            else:
                logger.error(f"Payment verification failed: {result}")
                return Response({
                    'status': 'failed',
                    'message': result.get('error', 'Payment verification failed')
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Transaction.DoesNotExist:
            logger.error(f"Transaction not found for reference: {reference}, user: {request.user.id}")
            return Response(
                {'error': 'Transaction not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class AutoVerifyPendingPaymentsView(APIView):
    """Auto-verify pending payments for current user"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Use database transaction to prevent concurrent modifications
            with db_transaction.atomic():
                # Get all pending transactions for this user with SELECT FOR UPDATE to prevent race conditions
                pending_transactions = Transaction.objects.select_for_update().filter(
                    user=request.user,
                    status='pending'
                ).order_by('-initiated_at')[:5]  # Only check last 5 pending
                
                if not pending_transactions:
                    return Response({
                        'verified_count': 0,
                        'message': 'No pending payments found'
                    })
                
                logger.info(f"Found {pending_transactions.count()} pending transactions for user {request.user.id}")
                
                service = PaymentService()
                verified_count = 0
                
                for transaction in pending_transactions:
                    logger.info(f"Attempting to verify transaction: {transaction.paystack_reference}")
                    
                    # Skip if this transaction is already being processed
                    if transaction.status != 'pending':
                        continue
                    
                    # Try to verify each pending transaction
                    success, result = service.handle_payment_success(transaction.paystack_reference)
                    
                    if success:
                        verified_count += 1
                        logger.info(f"Successfully verified transaction: {transaction.paystack_reference}")
                    else:
                        logger.warning(f"Failed to verify transaction {transaction.paystack_reference}: {result}")
                
                if verified_count > 0:
                    # Return success response with details
                    return Response({
                        'verified_count': verified_count,
                        'message': f'Successfully verified {verified_count} payment(s)',
                        'status': 'success'
                    })
                else:
                    return Response({
                        'verified_count': 0,
                        'message': 'No payments could be verified at this time'
                    })
                    
        except Exception as e:
            logger.error(f"Error in auto-verify pending payments: {str(e)}")
            return Response({
                'error': 'Failed to verify pending payments',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ChargeAuthorizationView(APIView):
    """Charge a saved payment method"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        payment_method_id = request.data.get('payment_method_id')
        amount = request.data.get('amount')
        transaction_type = request.data.get('transaction_type', 'subscription')
        
        if not payment_method_id or not amount:
            return Response(
                {'error': 'payment_method_id and amount are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            payment_method = PaymentMethod.objects.get(
                id=payment_method_id,
                user=request.user,
                is_active=True
            )
            
            if not payment_method.paystack_auth_code:
                return Response(
                    {'error': 'Payment method not set up for automatic charging'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            service = PaymentService()
            
            # Generate reference
            import uuid
            reference = f"mdp_{transaction_type}_{request.user.id}_{uuid.uuid4().hex[:8]}"
            
            # Charge authorization
            success, result = service.charge_authorization(
                auth_code=payment_method.paystack_auth_code,
                amount=amount,
                email=request.user.email,
                reference=reference
            )
            
            if success:
                # Create transaction record
                with db_transaction.atomic():
                    transaction = Transaction.objects.create(
                        user=request.user,
                        transaction_type=transaction_type,
                        amount=amount,
                        paystack_reference=reference,
                        payment_method=payment_method,
                        description=f"{transaction_type.title()} Payment",
                        status='success',
                        gateway_response=result
                    )
                    transaction.mark_as_completed()
                
                return Response({
                    'status': 'success',
                    'transaction_id': str(transaction.id),
                    'reference': reference,
                    'message': 'Payment processed successfully'
                })
            else:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
                
        except PaymentMethod.DoesNotExist:
            return Response(
                {'error': 'Payment method not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class BankListView(APIView):
    """Get list of supported banks"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        service = PaymentService()
        success, banks = service.get_banks()
        
        if success:
            return Response({'banks': banks})
        else:
            return Response(
                {'error': 'Failed to fetch banks'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class PricingView(APIView):
    """Get pricing information"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        from .services import PRICING_CONFIG
        from decimal import Decimal
        
        # Convert Decimal objects to float for JSON serialization
        def convert_decimals(obj):
            if isinstance(obj, dict):
                return {key: convert_decimals(value) for key, value in obj.items()}
            elif isinstance(obj, list):
                return [convert_decimals(item) for item in obj]
            elif isinstance(obj, Decimal):
                return float(obj)
            return obj
        
        pricing_data = {
            'subscriptions': {
                'pay_per_song': convert_decimals(PRICING_CONFIG['pay_per_song']),
                'yearly': convert_decimals(PRICING_CONFIG['yearly'])
            },
            'credit_packs': convert_decimals(PRICING_CONFIG['credit_packs'])
        }
        
        return Response(pricing_data)

@api_view(['POST'])
@permission_classes([])
def dev_set_role(request):
    """Dev-only: set a user's role and subscription for local testing. Only works when DEBUG=True."""
    import json
    from django.conf import settings
    if not settings.DEBUG:
        return Response({'error': 'Not allowed in non-debug mode'}, status=status.HTTP_403_FORBIDDEN)

    try:
        data = request.data if hasattr(request, 'data') else json.loads(request.body.decode('utf-8'))
        user_id = data.get('user_id')
        role = data.get('role')
        subscription = data.get('subscription')

        if not user_id or not role:
            return Response({'error': 'user_id and role are required'}, status=status.HTTP_400_BAD_REQUEST)

        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(id=user_id)
        user.role = role
        if subscription:
            user.subscription = subscription
        user.save()

        return Response({'status': 'ok', 'user_id': str(user.id), 'role': user.role, 'subscription': getattr(user, 'subscription', None)})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_subscription(request):
    """Cancel user's active subscription"""
    try:
        subscription = Subscription.objects.get(
            user=request.user,
            status='active'
        )
        
        subscription.status = 'canceled'
        subscription.auto_renew = False
        subscription.save()
        
        # Update user model
        request.user.subscription = 'free'
        request.user.subscription_expires_at = None
        request.user.save()
        
        return Response({'message': 'Subscription canceled successfully'})
        
    except Subscription.DoesNotExist:
        return Response(
            {'error': 'No active subscription found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_default_payment_method(request, payment_method_id):
    """Set default payment method"""
    try:
        payment_method = PaymentMethod.objects.get(
            id=payment_method_id,
            user=request.user,
            is_active=True
        )
        
        # Remove default from other payment methods
        PaymentMethod.objects.filter(
            user=request.user,
            is_default=True
        ).update(is_default=False)
        
        # Set new default
        payment_method.is_default = True
        payment_method.save()
        
        return Response({'message': 'Default payment method updated'})
        
    except PaymentMethod.DoesNotExist:
        return Response(
            {'error': 'Payment method not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


class ConsumeUploadCreditView(APIView):
    """Consume one upload credit for pay-per-song subscriptions"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            # Use a transaction lock to avoid races when consuming credits
            with db_transaction.atomic():
                subscription = Subscription.objects.select_for_update().filter(
                    user=request.user,
                    subscription_type='pay_per_song',
                    status='active'
                ).first()

                if not subscription or subscription.remaining_credits <= 0:
                    return Response(
                        {'error': 'No active pay-per-song subscription with available credits'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Consume one credit by incrementing credits_used
                subscription.credits_used = (subscription.credits_used or 0) + 1
                subscription.save()

                remaining = subscription.remaining_credits

                # If no credits remain, expire the subscription and revert role if user has no other active yearly subscription
                if remaining <= 0:
                    subscription.status = 'expired'
                    subscription.save()

                    # Check for any other active yearly subscription before reverting role
                    has_yearly = Subscription.objects.filter(
                        user=request.user,
                        subscription_type='yearly',
                        status='active'
                    ).exists()

                    if not has_yearly:
                        # Revert user role and subscription flags
                        try:
                            request.user.role = 'user'
                            request.user.subscription = 'free'
                            request.user.subscription_expires_at = None
                            request.user.save()
                        except Exception:
                            # Non-fatal: avoid failing the credit consumption if user model fields differ
                            logger.exception('Failed to revert user role after subscription expiration')

                return Response({
                    'message': 'Upload credit consumed successfully',
                    'remaining_credits': remaining
                })

        except Exception as e:
            logger.exception('Error while consuming upload credit')
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['GET'])
@permission_classes([permissions.AllowAny])  # Temporarily allow public access for testing
def dev_test_verification(request):
    """Development endpoint to test payment verification"""
    try:
        # Get user_id from query params if not authenticated
        user_id = request.GET.get('user_id')
        if hasattr(request, 'user') and request.user.is_authenticated:
            user = request.user
        elif user_id:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            user = User.objects.get(id=user_id)
        else:
            return Response({
                'error': 'Please provide user_id as query parameter or authenticate',
                'example': '/api/payments/dev/test-verify/?user_id=1'
            })
        
        # Get the most recent pending transaction for this user
        transaction = Transaction.objects.filter(
            user=user,
            status='pending'
        ).order_by('-initiated_at').first()
        
        if not transaction:
            return Response({
                'error': 'No pending transactions found',
                'user_transactions': list(Transaction.objects.filter(user=user).values_list('paystack_reference', 'status')),
                'user_email': user.email
            })
        
        # Test verification
        service = PaymentService()
        success, result = service.handle_payment_success(transaction.paystack_reference)
        
        return Response({
            'transaction_reference': transaction.paystack_reference,
            'verification_success': success,
            'result': result,
            'transaction_status_before': 'pending',
            'transaction_status_after': Transaction.objects.get(id=transaction.id).status,
            'user_email': user.email
        })
        
    except Exception as e:
        logger.exception('Error in dev test verification')
        return Response({'error': str(e)}, status=500)
