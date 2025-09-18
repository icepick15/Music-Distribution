#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from payments.models import Transaction
from payments.services import PaymentService
from django.conf import settings

print("=== TESTING PAYMENT VERIFICATION ===")
print(f"Paystack Secret Key: {settings.PAYSTACK_SECRET_KEY[:10]}...{settings.PAYSTACK_SECRET_KEY[-10:]}")
print(f"Paystack Public Key: {settings.PAYSTACK_PUBLIC_KEY}")

# Get recent pending transactions
pending_transactions = Transaction.objects.filter(status='pending').order_by('-initiated_at')[:5]
print(f"\nPending transactions: {pending_transactions.count()}")

for transaction in pending_transactions:
    print(f"  {transaction.paystack_reference} - {transaction.amount} - {transaction.initiated_at}")

# Test payment service
if pending_transactions.exists():
    test_transaction = pending_transactions.first()
    print(f"\nTesting verification for: {test_transaction.paystack_reference}")
    
    service = PaymentService()
    try:
        success, result = service.verify_payment(test_transaction.paystack_reference)
        print(f"Verification result: success={success}")
        if success:
            print(f"Payment status: {result.get('status')}")
            print(f"Amount: {result.get('amount')}")
        else:
            print(f"Error: {result}")
    except Exception as e:
        print(f"Error: {e}")
else:
    print("No pending transactions to test with")

# Check subscription status
from payments.models import Subscription
from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.first()
if user:
    subs = Subscription.objects.filter(user=user)
    print(f"\nUser {user.email} subscriptions:")
    for sub in subs:
        print(f"  {sub.subscription_type} - {sub.status} - Credits: {sub.song_credits}/{sub.credits_used}")
