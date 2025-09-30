#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.payments.models import Transaction
from src.apps.payments.services import PaymentService
import logging

# Enable logging
logging.basicConfig(level=logging.INFO)

def test_payment_verification():
    print("=== TESTING PAYMENT VERIFICATION ===")
    
    # Get the latest pending transaction
    transaction = Transaction.objects.filter(status='pending').first()
    
    if not transaction:
        print("No pending transactions found")
        return
    
    print(f"Testing transaction: {transaction.paystack_reference}")
    print(f"User: {transaction.user.username}")
    print(f"Amount: {transaction.amount}")
    print(f"Type: {transaction.transaction_type}")
    print(f"Status: {transaction.status}")
    
    # Test the verification
    service = PaymentService()
    success, result = service.handle_payment_success(transaction.paystack_reference)
    
    print(f"\n=== VERIFICATION RESULT ===")
    print(f"Success: {success}")
    print(f"Result: {result}")
    
    # Check transaction after verification
    transaction.refresh_from_db()
    print(f"\n=== TRANSACTION AFTER VERIFICATION ===")
    print(f"Status: {transaction.status}")
    print(f"Completed at: {transaction.completed_at}")

if __name__ == "__main__":
    test_payment_verification()