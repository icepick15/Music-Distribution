"""
Test Song Approval Email Notification
======================================

This script tests that email notifications are sent when songs are approved.

Usage:
    python test_song_approval_email.py
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.songs.models import Song
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

def test_approval_notification():
    """Test approval notification by changing a song status"""
    print("\n" + "=" * 70)
    print("🧪 Testing Song Approval Email Notification")
    print("=" * 70)
    
    # Find a pending song
    pending_song = Song.objects.filter(status='pending').first()
    
    if not pending_song:
        print("\n⚠️  No pending songs found. Creating a test scenario...")
        
        # Try to find any song to use for testing
        test_song = Song.objects.first()
        if not test_song:
            print("❌ No songs in database. Please upload a song first.")
            return False
        
        # Reset it to pending for testing
        test_song.status = 'pending'
        test_song.approved_at = None
        test_song.distributed_at = None
        test_song.save()
        print(f"✅ Reset '{test_song.title}' to pending status")
        pending_song = test_song
    
    print(f"\n📍 Test Song: '{pending_song.title}'")
    print(f"   Artist: {pending_song.artist.get_full_name()} ({pending_song.artist.email})")
    print(f"   Current Status: {pending_song.get_status_display()}")
    print(f"   Song ID: {pending_song.id}")
    
    confirm = input(f"\n⚠️  Approve this song to test email notification? [y/N]: ")
    
    if confirm.lower() != 'y':
        print("❌ Test cancelled.")
        return False
    
    print("\n🔄 Approving song...")
    
    # This mimics what the admin action does
    old_status = pending_song.status
    pending_song.status = 'approved'
    pending_song.approved_at = timezone.now()
    
    try:
        pending_song.save()
        print(f"✅ Song status changed: {old_status} → approved")
        
        print("\n📧 Email notification should have been sent to:")
        print(f"   To: {pending_song.artist.email}")
        print(f"   Subject: Great news! '{pending_song.title}' has been approved")
        print(f"   Template: song_approved.html")
        
        print("\n✅ Test complete! Check the artist's email inbox.")
        print("\n💡 Tips for debugging:")
        print("   1. Check Django logs for email sending confirmation")
        print("   2. Check your email service (ZeptoMail) dashboard")
        print("   3. Look for any error messages in the terminal")
        print("   4. Verify email settings in settings.py")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        print("   The email notification might not have been sent.")
        return False

def test_distribution_notification():
    """Test distribution notification"""
    print("\n" + "=" * 70)
    print("🧪 Testing Song Distribution Email Notification")
    print("=" * 70)
    
    # Find an approved song
    approved_song = Song.objects.filter(status='approved').first()
    
    if not approved_song:
        print("\n⚠️  No approved songs found.")
        print("   Please approve a song first, then run this test again.")
        return False
    
    print(f"\n📍 Test Song: '{approved_song.title}'")
    print(f"   Artist: {approved_song.artist.get_full_name()} ({approved_song.artist.email})")
    print(f"   Current Status: {approved_song.get_status_display()}")
    
    confirm = input(f"\n⚠️  Distribute this song to test email notification? [y/N]: ")
    
    if confirm.lower() != 'y':
        print("❌ Test cancelled.")
        return False
    
    print("\n🔄 Distributing song...")
    
    old_status = approved_song.status
    approved_song.status = 'distributed'
    approved_song.distributed_at = timezone.now()
    
    try:
        approved_song.save()
        print(f"✅ Song status changed: {old_status} → distributed")
        
        print("\n📧 Email notification should have been sent to:")
        print(f"   To: {approved_song.artist.email}")
        print(f"   Subject: '{approved_song.title}' is now live on streaming platforms!")
        print(f"   Template: song_distributed.html")
        
        print("\n✅ Test complete! Check the artist's email inbox.")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error occurred: {str(e)}")
        return False

def show_menu():
    """Show test menu"""
    print("\n" + "=" * 70)
    print("📧 Email Notification Testing Tool")
    print("=" * 70)
    print("\nWhat would you like to test?")
    print("1. Test Approval Email (pending → approved)")
    print("2. Test Distribution Email (approved → distributed)")
    print("3. Test Both (pending → approved → distributed)")
    print("4. Exit")
    print("-" * 70)

def main():
    """Main test function"""
    while True:
        show_menu()
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            test_approval_notification()
        elif choice == '2':
            test_distribution_notification()
        elif choice == '3':
            if test_approval_notification():
                input("\n📍 Press Enter to test distribution notification...")
                test_distribution_notification()
        elif choice == '4':
            print("\n👋 Goodbye!")
            break
        else:
            print("\n❌ Invalid choice. Please enter 1-4.")
        
        input("\n📍 Press Enter to continue...")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted. Goodbye!")
        sys.exit(0)
