#!/usr/bin/env python
"""
Contact Message Reply and Notification System
Demonstrates how to reply to users and manage notifications
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
from src.apps.notifications.services import NotificationService
from src.apps.notifications.models import Notification, NotificationType
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

def send_contact_reply(contact_message_id, reply_message, admin_user=None):
    """
    Send a reply to a contact message
    """
    try:
        contact = ContactMessage.objects.get(id=contact_message_id)
        print(f"📧 Sending reply to: {contact.name} ({contact.email})")
        print(f"📝 Original subject: {contact.subject}")
        print(f"💬 Reply message: {reply_message[:100]}...")
        
        # Create reply notification context
        context_data = {
            'contact_name': contact.name,
            'contact_email': contact.email,
            'original_subject': contact.subject,
            'original_message': contact.message,
            'reply_message': reply_message,
            'admin_name': admin_user.get_full_name() if admin_user else 'Support Team',
            'contact_id': str(contact.id),
            'replied_at': timezone.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        # If the contact has a user account, send notification
        if contact.user:
            # First create the notification type if it doesn't exist
            reply_type, created = NotificationType.objects.get_or_create(
                name='contact_reply',
                defaults={
                    'category': 'system',
                    'description': 'Reply to contact message',
                    'email_subject_template': 'Reply to: {{ context_data.original_subject }}',
                    'email_template_name': 'contact_reply',
                    'is_active': True,
                    'default_email_enabled': True,
                }
            )
            
            NotificationService.send_user_notification(
                user=contact.user,
                notification_type_name='contact_reply',
                title=f'Reply to: {contact.subject}',
                message=f'We have replied to your message about "{contact.subject}"',
                context_data=context_data
            )
            print("✅ Notification sent to registered user")
        else:
            # For anonymous users, we could send direct email
            print("📧 Anonymous user - would send direct email")
        
        # Mark as responded
        contact.mark_as_responded()
        print(f"✅ Contact message marked as responded")
        
        return True
        
    except ContactMessage.DoesNotExist:
        print(f"❌ Contact message {contact_message_id} not found")
        return False
    except Exception as e:
        print(f"❌ Failed to send reply: {str(e)}")
        return False

def get_contact_notifications():
    """
    Get all contact-related notifications
    """
    print("🔔 Contact Notifications Overview\n")
    
    # Get contact confirmations (sent to users)
    confirmations = Notification.objects.filter(
        notification_type__name='contact_confirmation'
    ).order_by('-created_at')
    
    # Get admin alerts (sent to admins)
    admin_alerts = Notification.objects.filter(
        notification_type__name='contact_admin_alert'
    ).order_by('-created_at')
    
    print(f"📧 Contact Confirmations: {confirmations.count()}")
    print(f"🚨 Admin Alerts: {admin_alerts.count()}")
    
    print(f"\n📮 Recent Admin Alerts:")
    for alert in admin_alerts[:5]:
        print(f"   • {alert.title}")
        print(f"     Created: {alert.created_at.strftime('%Y-%m-%d %H:%M')}")
        if alert.context_data and 'contact_email' in alert.context_data:
            print(f"     From: {alert.context_data['contact_email']}")
        print()

def demo_admin_reply():
    """
    Demo how an admin would reply to a contact message
    """
    print("🎯 Admin Reply Demo\n")
    
    # Get a new contact message
    new_contact = ContactMessage.objects.filter(status='new').first()
    
    if not new_contact:
        print("No new contact messages available")
        return
    
    print(f"📨 Contact Message Details:")
    print(f"   From: {new_contact.name} ({new_contact.email})")
    print(f"   Subject: {new_contact.subject}")
    print(f"   Category: {new_contact.get_category_display()}")
    print(f"   Message: {new_contact.message[:200]}...")
    print(f"   Status: {new_contact.get_status_display()}")
    
    # Compose a reply based on the category
    if new_contact.category == 'technical':
        reply = f"""Dear {new_contact.name},

Thank you for contacting our technical support team.

We've received your inquiry about "{new_contact.subject}" and our technical team has reviewed the issue.

For technical issues, we recommend:
1. Checking our troubleshooting guide at musicdistribution.com/help
2. Ensuring your audio files meet our format requirements
3. Clearing your browser cache if experiencing upload issues

If the issue persists, please reply with:
- Your browser type and version
- File formats you're trying to upload
- Any error messages you're seeing

We're here to help and will resolve this quickly.

Best regards,
Technical Support Team
Music Distribution Platform"""

    elif new_contact.category == 'billing':
        reply = f"""Dear {new_contact.name},

Thank you for contacting us regarding billing.

We've reviewed your account and inquiry about "{new_contact.subject}".

For billing questions, we can help with:
- Payment history and receipts
- Royalty calculations and statements
- Subscription changes or cancellations
- Refund requests

Your account is in good standing. If you need specific information about payments or royalties, please log into your dashboard at musicdistribution.com/dashboard.

Best regards,
Billing Support Team
Music Distribution Platform"""

    else:
        reply = f"""Dear {new_contact.name},

Thank you for contacting Music Distribution Platform.

We've received your message regarding "{new_contact.subject}" and appreciate you reaching out to us.

Our team has reviewed your inquiry and we're here to help. Based on your question about {new_contact.get_category_display().lower()}, we'll provide you with the information and assistance you need.

If you have any additional questions, please don't hesitate to contact us.

Best regards,
Support Team
Music Distribution Platform
support@musicdistribution.com"""
    
    # Send the reply
    print(f"\n📤 Sending Reply...")
    success = send_contact_reply(new_contact.id, reply)
    
    if success:
        print(f"✅ Reply sent successfully!")
        print(f"📊 Status: {new_contact.get_status_display()}")
        if new_contact.response_time_hours:
            print(f"⏱️ Response time: {new_contact.response_time_hours:.1f} hours")

def show_contact_stats():
    """
    Show contact message statistics
    """
    print("📊 Contact Message Statistics\n")
    
    total = ContactMessage.objects.count()
    new_count = ContactMessage.objects.filter(status='new').count()
    responded_count = ContactMessage.objects.filter(status='responded').count()
    
    print(f"📈 Total Messages: {total}")
    print(f"🆕 New Messages: {new_count}")
    print(f"✅ Responded: {responded_count}")
    print(f"📧 Response Rate: {(responded_count/total*100):.1f}%" if total > 0 else "0%")
    
    # Category breakdown
    print(f"\n📂 By Category:")
    for category_code, category_name in ContactMessage.CATEGORY_CHOICES:
        count = ContactMessage.objects.filter(category=category_code).count()
        if count > 0:
            print(f"   {category_name}: {count}")

def main():
    """
    Run the complete contact notification and reply demo
    """
    print("🚀 Contact Notification & Reply System\n")
    
    try:
        # 1. Show contact statistics
        show_contact_stats()
        
        # 2. Show notifications
        get_contact_notifications()
        
        # 3. Demo admin reply
        demo_admin_reply()
        
        print("\n🎉 Contact Management Demo Complete!")
        print("\n📋 Admin Actions Available:")
        print("1. 🖥️  Django Admin: http://localhost:8000/admin/support/contactmessage/")
        print("2. 🔔 Notifications: http://localhost:8000/admin/notifications/notification/")
        print("3. 🚀 API Endpoints:")
        print("   - GET /api/support/contact/ (list all)")
        print("   - POST /api/support/contact/{id}/mark_as_responded/")
        print("   - GET /api/support/contact/stats/")
        print("   - GET /api/support/contact/urgent/")
        
    except Exception as e:
        print(f"❌ Demo failed: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()