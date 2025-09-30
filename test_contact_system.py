#!/usr/bin/env python
"""
Test script for the Contact System
Tests the ContactMessage model and ViewSet functionality
"""

import os
import sys
import django
from django.conf import settings

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

# Now we can import Django models
from src.apps.support.models import ContactMessage
from src.apps.support.contact_serializers import ContactMessageSerializer
from django.contrib.auth import get_user_model
from django.test import RequestFactory
from rest_framework.test import force_authenticate
from src.apps.support.contact_views import ContactMessageViewSet
import json

User = get_user_model()

def test_contact_message_model():
    """Test the ContactMessage model functionality"""
    print("🧪 Testing ContactMessage Model...")
    
    # Test creating a contact message
    contact_data = {
        'name': 'John Doe',
        'email': 'john.doe@example.com',
        'subject': 'Test Subject',
        'message': 'This is a test message from the contact form.',
        'category': 'general',
        'priority': 'medium'
    }
    
    contact = ContactMessage.objects.create(**contact_data)
    print(f"✅ Created contact message: {contact.id}")
    print(f"   - Name: {contact.name}")
    print(f"   - Email: {contact.email}")
    print(f"   - Subject: {contact.subject}")
    print(f"   - Category: {contact.get_category_display()}")
    print(f"   - Status: {contact.get_status_display()}")
    print(f"   - Priority: {contact.get_priority_display()}")
    
    # Test status changes
    contact.mark_as_read()
    print(f"✅ Marked as read. Status: {contact.get_status_display()}")
    
    contact.mark_as_responded()
    print(f"✅ Marked as responded. Status: {contact.get_status_display()}")
    
    return contact

def test_contact_serializer():
    """Test the ContactMessage serializer"""
    print("\n🧪 Testing ContactMessage Serializer...")
    
    # Test serializer validation
    data = {
        'name': 'Jane Smith',
        'email': 'jane.smith@example.com',
        'subject': 'Serializer Test',
        'message': 'Testing the contact message serializer.',
        'category': 'technical'
    }
    
    serializer = ContactMessageSerializer(data=data)
    if serializer.is_valid():
        print("✅ Serializer validation passed")
        contact = serializer.save()
        print(f"   - Created contact: {contact.id}")
        
        # Test serialization
        serialized_data = ContactMessageSerializer(contact).data
        print(f"   - Serialized data keys: {list(serialized_data.keys())}")
        return contact
    else:
        print(f"❌ Serializer validation failed: {serializer.errors}")
        return None

def test_contact_viewset():
    """Test the ContactMessage ViewSet"""
    print("\n🧪 Testing ContactMessage ViewSet...")
    
    # Create a request factory
    factory = RequestFactory()
    
    # Test creating a contact message (anonymous user)
    view = ContactMessageViewSet()
    view.action = 'create'
    
    data = {
        'name': 'Test User',
        'email': 'test@example.com',
        'subject': 'ViewSet Test',
        'message': 'Testing the contact message viewset.',
        'category': 'support'
    }
    
    request = factory.post('/api/contact/', data=data, content_type='application/json')
    view.request = request
    view.format_kwarg = None
    
    # Test permissions
    permissions = view.get_permissions()
    print(f"✅ Create permissions: {[p.__class__.__name__ for p in permissions]}")
    
    # Test serializer class
    serializer_class = view.get_serializer_class()
    print(f"✅ Serializer class: {serializer_class.__name__}")
    
    return True

def test_contact_categories():
    """Test all contact message categories"""
    print("\n🧪 Testing Contact Categories...")
    
    categories = [choice[0] for choice in ContactMessage.CATEGORY_CHOICES]
    print(f"✅ Available categories: {categories}")
    
    for category in categories:
        contact = ContactMessage.objects.create(
            name=f'Test User {category}',
            email=f'test_{category}@example.com',
            subject=f'Test {category} message',
            message=f'This is a test message for {category} category.',
            category=category
        )
        print(f"   - Created {category}: {contact.get_category_display()}")
    
    return True

def test_contact_statistics():
    """Test contact message statistics"""
    print("\n🧪 Testing Contact Statistics...")
    
    total_contacts = ContactMessage.objects.count()
    new_contacts = ContactMessage.objects.filter(status='new').count()
    
    print(f"✅ Total contacts: {total_contacts}")
    print(f"✅ New contacts: {new_contacts}")
    
    # Category breakdown
    categories = {}
    for choice in ContactMessage.CATEGORY_CHOICES:
        category_key = choice[0]
        count = ContactMessage.objects.filter(category=category_key).count()
        categories[category_key] = count
        if count > 0:
            print(f"   - {choice[1]}: {count}")
    
    return categories

def main():
    """Run all tests"""
    print("🚀 Starting Contact System Tests...\n")
    
    try:
        # Test model
        contact1 = test_contact_message_model()
        
        # Test serializer
        contact2 = test_contact_serializer()
        
        # Test ViewSet
        test_contact_viewset()
        
        # Test categories
        test_contact_categories()
        
        # Test statistics
        stats = test_contact_statistics()
        
        print("\n🎉 All Contact System Tests Completed Successfully!")
        print("\n📊 Final Statistics:")
        print(f"   - Total contact messages: {ContactMessage.objects.count()}")
        print(f"   - Categories tested: {len(ContactMessage.CATEGORY_CHOICES)}")
        print(f"   - Status options: {len(ContactMessage.STATUS_CHOICES)}")
        print(f"   - Priority levels: {len(ContactMessage.PRIORITY_CHOICES)}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)