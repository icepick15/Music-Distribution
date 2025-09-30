#!/usr/bin/env python
"""
Admin Contact Message Access Demo
Shows different ways to access contact messages as an admin
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
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from datetime import timedelta

User = get_user_model()

def demo_admin_access():
    """Demonstrate different ways to access contact messages as admin"""
    print("🔧 Admin Contact Message Access Demo\n")
    
    # 1. Get all contact messages
    print("1️⃣ All Contact Messages:")
    all_messages = ContactMessage.objects.all()
    print(f"   Total: {all_messages.count()} messages")
    
    # 2. Filter by status
    print("\n2️⃣ Messages by Status:")
    for status_code, status_name in ContactMessage.STATUS_CHOICES:
        count = ContactMessage.objects.filter(status=status_code).count()
        print(f"   {status_name}: {count}")
    
    # 3. Filter by priority
    print("\n3️⃣ Messages by Priority:")
    for priority_code, priority_name in ContactMessage.PRIORITY_CHOICES:
        count = ContactMessage.objects.filter(priority=priority_code).count()
        print(f"   {priority_name}: {count}")
    
    # 4. Filter by category
    print("\n4️⃣ Messages by Category:")
    for category_code, category_name in ContactMessage.CATEGORY_CHOICES:
        count = ContactMessage.objects.filter(category=category_code).count()
        if count > 0:
            print(f"   {category_name}: {count}")
    
    # 5. Get new/unread messages
    print("\n5️⃣ New/Unread Messages:")
    new_messages = ContactMessage.objects.filter(status='new')
    print(f"   New messages requiring attention: {new_messages.count()}")
    
    for msg in new_messages[:3]:  # Show first 3
        print(f"   - {msg.name} ({msg.email}): {msg.subject}")
    
    # 6. Get urgent messages
    print("\n6️⃣ Urgent Messages:")
    urgent_messages = ContactMessage.objects.filter(
        priority__in=['high', 'urgent'],
        status__in=['new', 'read', 'in_progress']
    )
    print(f"   Urgent messages: {urgent_messages.count()}")
    
    for msg in urgent_messages:
        print(f"   - [{msg.get_priority_display()}] {msg.name}: {msg.subject}")
    
    # 7. Recent activity
    print("\n7️⃣ Recent Activity (Last 24 hours):")
    yesterday = timezone.now() - timedelta(hours=24)
    recent_messages = ContactMessage.objects.filter(created_at__gte=yesterday)
    print(f"   Messages in last 24h: {recent_messages.count()}")
    
    # 8. Search functionality
    print("\n8️⃣ Search Example (messages containing 'technical'):")
    search_results = ContactMessage.objects.filter(
        models.Q(subject__icontains='technical') |
        models.Q(message__icontains='technical') |
        models.Q(category='technical')
    )
    print(f"   Technical-related messages: {search_results.count()}")
    
    # 9. Response time analysis
    print("\n9️⃣ Response Time Analysis:")
    responded_messages = ContactMessage.objects.filter(
        responded_at__isnull=False
    )
    if responded_messages.exists():
        total_response_time = 0
        count = 0
        for msg in responded_messages:
            if msg.response_time_hours:
                total_response_time += msg.response_time_hours
                count += 1
        
        if count > 0:
            avg_response_time = total_response_time / count
            print(f"   Average response time: {avg_response_time:.1f} hours")
        else:
            print("   No response time data available")
    else:
        print("   No responded messages yet")
    
    # 10. Detailed view of a specific message
    print("\n🔍 Detailed View Example:")
    if all_messages.exists():
        sample_msg = all_messages.first()
        print(f"   ID: {sample_msg.id}")
        print(f"   Name: {sample_msg.name}")
        print(f"   Email: {sample_msg.email}")
        print(f"   Subject: {sample_msg.subject}")
        print(f"   Category: {sample_msg.get_category_display()}")
        print(f"   Status: {sample_msg.get_status_display()}")
        print(f"   Priority: {sample_msg.get_priority_display()}")
        print(f"   Created: {sample_msg.created_at}")
        if sample_msg.ip_address:
            print(f"   IP Address: {sample_msg.ip_address}")
        print(f"   Message Preview: {sample_msg.message[:100]}...")

def demo_admin_actions():
    """Demonstrate admin actions on contact messages"""
    print("\n🎯 Admin Actions Demo\n")
    
    # Get a new message to work with
    new_message = ContactMessage.objects.filter(status='new').first()
    
    if not new_message:
        print("   No new messages available for demo")
        return
    
    print(f"Working with message: {new_message.subject}")
    print(f"Current status: {new_message.get_status_display()}")
    
    # Demo action: Mark as read
    print("\n📖 Marking as read...")
    new_message.mark_as_read()
    print(f"   Status updated to: {new_message.get_status_display()}")
    print(f"   Read at: {new_message.read_at}")
    
    # Demo action: Mark as responded
    print("\n💬 Marking as responded...")
    new_message.mark_as_responded()
    print(f"   Status updated to: {new_message.get_status_display()}")
    print(f"   Responded at: {new_message.responded_at}")
    print(f"   Response time: {new_message.response_time_hours:.1f} hours")

def demo_statistics():
    """Generate statistics dashboard"""
    print("\n📊 Contact Statistics Dashboard\n")
    
    total = ContactMessage.objects.count()
    
    # Status breakdown
    status_stats = {}
    for status_code, status_name in ContactMessage.STATUS_CHOICES:
        count = ContactMessage.objects.filter(status=status_code).count()
        percentage = (count / total * 100) if total > 0 else 0
        status_stats[status_name] = {'count': count, 'percentage': percentage}
    
    print("Status Breakdown:")
    for status, stats in status_stats.items():
        print(f"   {status}: {stats['count']} ({stats['percentage']:.1f}%)")
    
    # Category breakdown
    print("\nCategory Breakdown:")
    for category_code, category_name in ContactMessage.CATEGORY_CHOICES:
        count = ContactMessage.objects.filter(category=category_code).count()
        if count > 0:
            percentage = (count / total * 100) if total > 0 else 0
            print(f"   {category_name}: {count} ({percentage:.1f}%)")
    
    # Recent activity
    print("\nRecent Activity:")
    for days in [1, 7, 30]:
        cutoff = timezone.now() - timedelta(days=days)
        count = ContactMessage.objects.filter(created_at__gte=cutoff).count()
        print(f"   Last {days} day(s): {count} messages")

def main():
    """Run all admin demos"""
    try:
        demo_admin_access()
        demo_admin_actions()
        demo_statistics()
        
        print("\n✅ Admin access demo completed successfully!")
        print("\n🔗 Quick Access URLs:")
        print("   Django Admin: http://localhost:8000/admin/support/contactmessage/")
        print("   API Endpoint: http://localhost:8000/api/support/contact/")
        print("   Statistics: http://localhost:8000/api/support/contact/stats/")
        print("   Urgent Messages: http://localhost:8000/api/support/contact/urgent/")
        
    except Exception as e:
        print(f"❌ Demo failed with error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()