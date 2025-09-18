import json
import hashlib
import hmac
import logging
from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings
from django.utils.decorators import method_decorator
from .services import PaymentService
from .models import Transaction

logger = logging.getLogger(__name__)


@csrf_exempt
@require_POST
def paystack_webhook(request):
    """Handle Paystack webhooks"""
    try:
        # Verify webhook signature
        signature = request.META.get('HTTP_X_PAYSTACK_SIGNATURE')
        if not signature:
            logger.warning("Webhook received without signature")
            return HttpResponseBadRequest("No signature provided")
        
        # Get webhook secret from environment
        webhook_secret = settings.PAYSTACK_WEBHOOK_SECRET
        if not webhook_secret:
            logger.error("Paystack webhook secret not configured")
            return HttpResponseBadRequest("Webhook secret not configured")
        
        # Verify signature
        body = request.body
        expected_signature = hmac.new(
            webhook_secret.encode('utf-8'),
            body,
            hashlib.sha512
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            logger.warning("Invalid webhook signature")
            return HttpResponseBadRequest("Invalid signature")
        
        # Parse webhook data
        try:
            data = json.loads(body.decode('utf-8'))
        except json.JSONDecodeError:
            logger.error("Invalid JSON in webhook payload")
            return HttpResponseBadRequest("Invalid JSON")
        
        event = data.get('event')
        transaction_data = data.get('data', {})
        
        logger.info(f"Received webhook event: {event}")
        
        # Handle different webhook events
        if event == 'charge.success':
            return handle_charge_success(transaction_data)
        elif event == 'charge.failed':
            return handle_charge_failed(transaction_data)
        elif event == 'transfer.success':
            return handle_transfer_success(transaction_data)
        elif event == 'transfer.failed':
            return handle_transfer_failed(transaction_data)
        elif event == 'subscription.create':
            return handle_subscription_create(transaction_data)
        elif event == 'subscription.disable':
            return handle_subscription_disable(transaction_data)
        elif event == 'invoice.create':
            return handle_invoice_create(transaction_data)
        elif event == 'invoice.payment_failed':
            return handle_invoice_payment_failed(transaction_data)
        else:
            logger.info(f"Unhandled webhook event: {event}")
            return HttpResponse("Event not handled", status=200)
    
    except Exception as e:
        logger.error(f"Error processing webhook: {str(e)}")
        return HttpResponseBadRequest("Webhook processing failed")


def handle_charge_success(data):
    """Handle successful charge webhook"""
    try:
        reference = data.get('reference')
        if not reference:
            logger.error("No reference in charge success webhook")
            return HttpResponseBadRequest("No reference provided")
        
        # Find transaction
        try:
            transaction = Transaction.objects.get(paystack_reference=reference)
        except Transaction.DoesNotExist:
            logger.warning(f"Transaction not found for reference: {reference}")
            return HttpResponse("Transaction not found", status=200)
        
        # Update transaction if not already completed
        if transaction.status != 'success':
            service = PaymentService()
            success, result = service.handle_payment_success(reference)
            
            if success:
                logger.info(f"Successfully processed charge for reference: {reference}")
            else:
                logger.error(f"Failed to process charge for reference: {reference}")
        
        return HttpResponse("OK", status=200)
        
    except Exception as e:
        logger.error(f"Error handling charge success: {str(e)}")
        return HttpResponseBadRequest("Failed to process charge success")


def handle_charge_failed(data):
    """Handle failed charge webhook"""
    try:
        reference = data.get('reference')
        if not reference:
            logger.error("No reference in charge failed webhook")
            return HttpResponseBadRequest("No reference provided")
        
        # Find transaction
        try:
            transaction = Transaction.objects.get(paystack_reference=reference)
        except Transaction.DoesNotExist:
            logger.warning(f"Transaction not found for reference: {reference}")
            return HttpResponse("Transaction not found", status=200)
        
        # Update transaction status
        if transaction.status == 'pending':
            failure_reason = data.get('gateway_response', 'Payment failed')
            transaction.mark_as_failed(failure_reason)
            logger.info(f"Marked transaction as failed for reference: {reference}")
        
        return HttpResponse("OK", status=200)
        
    except Exception as e:
        logger.error(f"Error handling charge failed: {str(e)}")
        return HttpResponseBadRequest("Failed to process charge failure")


def handle_transfer_success(data):
    """Handle successful transfer webhook"""
    try:
        # Handle successful transfers (e.g., payouts to artists)
        transfer_code = data.get('transfer_code')
        logger.info(f"Transfer successful: {transfer_code}")
        
        # Add logic to handle successful transfers
        # This could involve updating artist payout records
        
        return HttpResponse("OK", status=200)
        
    except Exception as e:
        logger.error(f"Error handling transfer success: {str(e)}")
        return HttpResponseBadRequest("Failed to process transfer success")


def handle_transfer_failed(data):
    """Handle failed transfer webhook"""
    try:
        # Handle failed transfers
        transfer_code = data.get('transfer_code')
        failure_reason = data.get('failure_reason', 'Transfer failed')
        logger.warning(f"Transfer failed: {transfer_code} - {failure_reason}")
        
        # Add logic to handle failed transfers
        # This could involve notifying admins or retrying transfers
        
        return HttpResponse("OK", status=200)
        
    except Exception as e:
        logger.error(f"Error handling transfer failure: {str(e)}")
        return HttpResponseBadRequest("Failed to process transfer failure")


def handle_subscription_create(data):
    """Handle subscription creation webhook"""
    try:
        subscription_code = data.get('subscription_code')
        customer_email = data.get('customer', {}).get('email')
        
        logger.info(f"Subscription created: {subscription_code} for {customer_email}")
        
        # Add logic to handle subscription creation
        # This could involve updating user subscription status
        
        return HttpResponse("OK", status=200)
        
    except Exception as e:
        logger.error(f"Error handling subscription creation: {str(e)}")
        return HttpResponseBadRequest("Failed to process subscription creation")


def handle_subscription_disable(data):
    """Handle subscription disable webhook"""
    try:
        subscription_code = data.get('subscription_code')
        customer_email = data.get('customer', {}).get('email')
        
        logger.info(f"Subscription disabled: {subscription_code} for {customer_email}")
        
        # Add logic to handle subscription disabling
        # This could involve updating user subscription status
        
        return HttpResponse("OK", status=200)
        
    except Exception as e:
        logger.error(f"Error handling subscription disable: {str(e)}")
        return HttpResponseBadRequest("Failed to process subscription disable")


def handle_invoice_create(data):
    """Handle invoice creation webhook"""
    try:
        invoice_code = data.get('invoice_code')
        customer_email = data.get('customer', {}).get('email')
        
        logger.info(f"Invoice created: {invoice_code} for {customer_email}")
        
        # Add logic to handle invoice creation
        # This could involve notifying users about upcoming charges
        
        return HttpResponse("OK", status=200)
        
    except Exception as e:
        logger.error(f"Error handling invoice creation: {str(e)}")
        return HttpResponseBadRequest("Failed to process invoice creation")


def handle_invoice_payment_failed(data):
    """Handle invoice payment failure webhook"""
    try:
        invoice_code = data.get('invoice_code')
        customer_email = data.get('customer', {}).get('email')
        
        logger.warning(f"Invoice payment failed: {invoice_code} for {customer_email}")
        
        # Add logic to handle invoice payment failures
        # This could involve notifying users and potentially suspending subscriptions
        
        return HttpResponse("OK", status=200)
        
    except Exception as e:
        logger.error(f"Error handling invoice payment failure: {str(e)}")
        return HttpResponseBadRequest("Failed to process invoice payment failure")
