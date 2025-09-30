#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.payments.models import Transaction
from src.apps.payments.services import PaymentService
from src.apps.users.models import User
import logging

# Enable logging
logging.basicConfig(level=logging.INFO)

def auto_verify_pending():
    print("=== AUTO-VERIFYING PENDING PAYMENTS ===")
    
    user = User.objects.first()
    pending_transactions = Transaction.objects.filter(
        user=user,
        status='pending'
    ).order_by('-initiated_at')[:3]  # Only check last 3
    
    if not pending_transactions:
        print("No pending transactions found")
        return
    
    print(f"Found {pending_transactions.count()} pending transactions")
    
    service = PaymentService()
    verified_count = 0
    
    for transaction in pending_transactions:
        print(f"\nVerifying: {transaction.paystack_reference}")
        print(f"Amount: {transaction.amount}")
        print(f"Status: {transaction.status}")
        
        success, result = service.handle_payment_success(transaction.paystack_reference)
        
        if success:
            verified_count += 1
            print(f"✅ Successfully verified: {transaction.paystack_reference}")
        else:
            print(f"❌ Failed to verify: {transaction.paystack_reference}")
            print(f"Error: {result}")
    
    print(f"\n=== SUMMARY ===")
    print(f"Total verified: {verified_count}/{pending_transactions.count()}")

if __name__ == "__main__":
    auto_verify_pending()