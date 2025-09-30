#!/usr/bin/env python
"""
Test script to verify notification system is working
"""
import os
import sys
import django

# Add the project directory to Python path
project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_dir)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from src.apps.notifications.notification_utils import create_notification, create_admin_broadcast

User = get_user_model()

def test_notification_system():
    print("Testing notification system...")
    
    # Get or create a test user
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={
            'username': 'testuser',
            'first_name': 'Test',
            'last_name': 'User'
        }
    )
    
    if created:
        print(f"Created test user: {user.email}")
    else:
        print(f"Using existing test user: {user.email}")
    
    # Test individual notification
    print("Creating individual notification...")
    notification = create_notification(
        recipient=user,
        title='Test Notification',
        message='This is a test notification from the backend system.',
        notification_type_name='test_message',
        priority='normal'
    )
    
    if notification:
        print(f"✅ Individual notification created successfully: {notification.id}")
    else:
        print("❌ Failed to create individual notification")
    
    # Test broadcast notification
    print("Creating broadcast notification...")
    notifications = create_admin_broadcast(
        title='System Maintenance Notice',
        message='The system will undergo scheduled maintenance tonight from 2 AM to 4 AM.',
        priority='high'
    )
    
    if notifications:
        print(f"✅ Broadcast notification sent to {len(notifications)} users")
    else:
        print("❌ Failed to create broadcast notification")
    
    # Print summary
    from src.apps.notifications.models import Notification
    total_notifications = Notification.objects.count()
    unread_count = Notification.objects.filter(status__in=['pending', 'sent']).count()
    
    print(f"\n📊 Notification Summary:")
    print(f"   Total notifications: {total_notifications}")
    print(f"   Unread notifications: {unread_count}")
    print(f"   Users in system: {User.objects.count()}")
    
    print("\n🎉 Notification system test completed!")

if __name__ == '__main__':
    test_notification_system()