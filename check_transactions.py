#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.payments.models import Transaction
from src.apps.users.models import User

def check_recent_transactions():
    print("=== RECENT TRANSACTIONS ===")
    transactions = Transaction.objects.all().order_by('-initiated_at')[:5]
    
    for tx in transactions:
        print(f"Reference: {tx.paystack_reference}")
        print(f"User: {tx.user.username}")
        print(f"Status: {tx.status}")
        print(f"Type: {tx.transaction_type}")
        print(f"Amount: {tx.amount}")
        print(f"Initiated: {tx.initiated_at}")
        print(f"Completed: {tx.completed_at}")
        print("---")

if __name__ == "__main__":
    check_recent_transactions()