#!/usr/bin/env python
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
import json

User = get_user_model()

def test_api_verification():
    client = Client()
    user = User.objects.first()
    
    # Login the user
    client.force_login(user)
    
    # Test verification API with latest completed transaction
    from src.apps.payments.models import Transaction
    transaction = Transaction.objects.filter(
        user=user, 
        status='success'
    ).first()
    
    if not transaction:
        print("No successful transactions found")
        return
    
    print(f"Testing verification API for: {transaction.paystack_reference}")
    
    # Call the verification endpoint
    response = client.post('/api/payments/verify/', 
                          data=json.dumps({'reference': transaction.paystack_reference}),
                          content_type='application/json')
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    test_api_verification()