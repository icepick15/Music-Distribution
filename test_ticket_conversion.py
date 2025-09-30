#!/usr/bin/env python
"""
Test the convert_to_ticket functionality
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

from src.apps.support.models import ContactMessage
from django.contrib.auth import get_user_model

User = get_user_model()

def test_convert_to_ticket():
    """Test converting contact messages to tickets"""
    print("🎫 Testing Convert to Ticket Functionality\n")
    
    # First, create a test user if it doesn't exist
    try:
        test_user, created = User.objects.get_or_create(
            username='testuser_contact',
            email='testcontact@example.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'ContactUser'
            }
        )
        if created:
            print(f"✅ Created test user: {test_user.username}")
        else:
            print(f"📋 Using existing test user: {test_user.username}")
    except Exception as e:
        print(f"❌ Error creating test user: {str(e)}")
        return
    
    # Create a contact message from the registered user
    try:
        test_contact = ContactMessage.objects.create(
            name='Test Contact User',
            email='testcontact@example.com',
            subject='Test Contact from Registered User',
            message='This is a test contact message from a registered user to test ticket conversion.',
            category='technical',
            priority='high',
            user=test_user
        )
        print(f"✅ Created test contact message: {test_contact.id}")
    except Exception as e:
        print(f"❌ Error creating test contact: {str(e)}")
        return
    
    # Get contact messages to test (including our new one)
    test_messages = ContactMessage.objects.filter(related_ticket__isnull=True)[:4]
    
    for msg in test_messages:
        print(f"\n📨 Testing: {msg.name} ({msg.email})")
        print(f"   Subject: {msg.subject}")
        print(f"   Category: {msg.get_category_display()}")
        print(f"   Priority: {msg.get_priority_display()}")
        print(f"   User Account: {'Yes' if msg.user else 'No'}")
        
        try:
            if msg.user:
                # Try to convert if user exists
                ticket = msg.convert_to_ticket()
                print(f"   ✅ SUCCESS: Created ticket {ticket.ticket_id}")
                print(f"   📊 Ticket Status: {ticket.get_status_display()}")
                print(f"   📂 Ticket Category: {ticket.get_category_display()}")
                print(f"   👤 Ticket Author: {ticket.author.username}")
                print(f"   📝 Contact Status: {msg.get_status_display()}")
            else:
                # Test the error handling for anonymous users
                print(f"   ⚠️  SKIPPING: Anonymous user (no account)")
                print(f"   💡 Recommendation: Handle as contact message or create user account")
                
        except Exception as e:
            print(f"   ❌ ERROR: {str(e)}")
        
        print()

def show_ticket_conversion_stats():
    """Show statistics about ticket conversions"""
    print("📊 Ticket Conversion Statistics\n")
    
    total_contacts = ContactMessage.objects.count()
    converted_contacts = ContactMessage.objects.filter(related_ticket__isnull=False).count()
    anonymous_contacts = ContactMessage.objects.filter(user__isnull=True).count()
    registered_contacts = ContactMessage.objects.filter(user__isnull=False).count()
    
    print(f"📈 Total Contact Messages: {total_contacts}")
    print(f"🎫 Converted to Tickets: {converted_contacts}")
    print(f"👤 From Registered Users: {registered_contacts}")
    print(f"👻 From Anonymous Users: {anonymous_contacts}")
    
    if registered_contacts > 0:
        conversion_rate = (converted_contacts / registered_contacts) * 100
        print(f"📊 Conversion Rate (Registered): {conversion_rate:.1f}%")

def main():
    """Run the test"""
    try:
        test_convert_to_ticket()
        show_ticket_conversion_stats()
        
        print("💡 Admin Tips:")
        print("- Only messages from registered users can be converted to tickets")
        print("- Anonymous contact messages should be handled directly via email")
        print("- Use Django Admin bulk actions for easy ticket conversion")
        print("- Visit: http://localhost:8000/admin/support/contactmessage/")
        
    except Exception as e:
        print(f"❌ Test failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()