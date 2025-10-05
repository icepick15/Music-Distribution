"""
Test Share Button Functionality
Tests distribution email with actual shareable URLs
"""

import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from src.apps.songs.models import Song, Platform, SongDistribution
from src.apps.notifications.services import NotificationService
from django.utils import timezone

User = get_user_model()


def test_share_button_with_platform_url():
    """Test distribution email with actual platform URL"""
    print("\n" + "="*70)
    print("🧪 Testing Share Buttons with Platform URL")
    print("="*70)
    
    # Get or create test data
    try:
        user = User.objects.filter(is_staff=False).first()
        if not user:
            print("❌ No non-staff user found. Please create a user first.")
            return
        
        song = Song.objects.filter(artist=user).first()
        if not song:
            print("❌ No songs found for user. Please create a song first.")
            return
        
        print(f"\n✅ Using Song: '{song.title}' by {user.get_full_name()}")
        
        # Create or get Spotify platform
        spotify, created = Platform.objects.get_or_create(
            name='Spotify',
            defaults={
                'is_active': True,
                'revenue_share': 70.00
            }
        )
        print(f"{'✅ Created' if created else '✅ Found'} Platform: {spotify.name}")
        
        # Create distribution with fake Spotify URL
        distribution, created = SongDistribution.objects.update_or_create(
            song=song,
            platform=spotify,
            defaults={
                'platform_url': f'https://open.spotify.com/track/{song.id}',
                'status': 'live',
                'distributed_at': timezone.now()
            }
        )
        print(f"{'✅ Created' if created else '✅ Updated'} Distribution: {distribution.platform_url}")
        
        # Send distribution notification
        print("\n📧 Sending distribution notification with share URL...")
        
        notification = NotificationService.send_user_notification(
            user=user,
            notification_type_name='song_distributed',
            title=f"'{song.title}' is now live on streaming platforms!",
            message="Congratulations! Your song is now available on Spotify, Apple Music, and other major platforms.",
            context_data={
                'song_title': song.title,
                'song_id': str(song.id),
                'artist_name': user.get_full_name(),
                'release_date': timezone.now().strftime('%B %d, %Y'),
                'share_url': distribution.platform_url,
            },
            related_song=song,
            priority='high'
        )
        
        if notification:
            print(f"✅ Notification created: {notification.id}")
            print(f"   Type: {notification.notification_type.name}")
            print(f"   Title: {notification.title}")
            print(f"   Email sent: {notification.email_sent}")
            
            # Display share URLs
            print("\n🔗 Share Button URLs:")
            print(f"   Twitter: https://twitter.com/intent/tweet?text=... {distribution.platform_url}")
            print(f"   Facebook: https://facebook.com/sharer/sharer.php?u={distribution.platform_url}")
            print(f"   WhatsApp: https://wa.me/?text=... {distribution.platform_url}")
            print(f"   Direct Link: {distribution.platform_url}")
            
            print("\n✅ SUCCESS! Check your email for the distribution notification.")
            print("   The share buttons should include the actual Spotify URL.")
        else:
            print("❌ Failed to create notification")
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


def test_share_button_without_platform_url():
    """Test distribution email without platform URL (fallback)"""
    print("\n" + "="*70)
    print("🧪 Testing Share Buttons WITHOUT Platform URL (Fallback)")
    print("="*70)
    
    try:
        user = User.objects.filter(is_staff=False).first()
        if not user:
            print("❌ No non-staff user found.")
            return
        
        song = Song.objects.filter(artist=user).first()
        if not song:
            print("❌ No songs found.")
            return
        
        print(f"\n✅ Using Song: '{song.title}' by {user.get_full_name()}")
        
        # Remove any distributions to test fallback
        SongDistribution.objects.filter(song=song).delete()
        print("✅ Removed all distributions to test fallback")
        
        # Send notification without share_url (should fallback to dashboard)
        print("\n📧 Sending distribution notification with fallback URL...")
        
        notification = NotificationService.send_user_notification(
            user=user,
            notification_type_name='song_distributed',
            title=f"'{song.title}' is now live on streaming platforms!",
            message="Congratulations! Your song is now available.",
            context_data={
                'song_title': song.title,
                'song_id': str(song.id),
                'artist_name': user.get_full_name(),
                'release_date': timezone.now().strftime('%B %d, %Y'),
                # No share_url - should fallback to frontend_url
            },
            related_song=song,
            priority='high'
        )
        
        if notification:
            print(f"✅ Notification created: {notification.id}")
            print(f"   Email sent: {notification.email_sent}")
            
            # Display fallback URLs
            fallback_url = f"http://localhost:5173/dashboard/songs/{song.id}"
            print("\n🔗 Share Button URLs (Fallback):")
            print(f"   Twitter: Uses fallback dashboard URL")
            print(f"   Facebook: Uses fallback dashboard URL")
            print(f"   WhatsApp: Uses fallback dashboard URL")
            print(f"   Direct Link: {fallback_url}")
            
            print("\n✅ SUCCESS! Check your email for the distribution notification.")
            print("   The share buttons should use the dashboard URL as fallback.")
        else:
            print("❌ Failed to create notification")
            
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


def display_menu():
    """Display test menu"""
    print("\n" + "="*70)
    print("🎵 Share Button Test Menu")
    print("="*70)
    print("\n1. Test with Platform URL (Spotify)")
    print("2. Test without Platform URL (Fallback to Dashboard)")
    print("3. Run both tests")
    print("4. Exit")
    print("\n" + "="*70)


if __name__ == '__main__':
    while True:
        display_menu()
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            test_share_button_with_platform_url()
        elif choice == '2':
            test_share_button_without_platform_url()
        elif choice == '3':
            test_share_button_with_platform_url()
            test_share_button_without_platform_url()
        elif choice == '4':
            print("\n👋 Exiting test script...")
            break
        else:
            print("\n❌ Invalid choice. Please try again.")
        
        input("\nPress Enter to continue...")
