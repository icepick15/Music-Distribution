"""
Test public song sharing functionality
"""
import os
import django
import requests

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.songs.models import Song

def test_public_song_api():
    """Test the public song API endpoint"""
    print("=" * 60)
    print("🧪 TESTING PUBLIC SONG SHARING SYSTEM")
    print("=" * 60)
    
    # Get a distributed song
    distributed_songs = Song.objects.filter(status='distributed')
    
    if not distributed_songs.exists():
        print("\n❌ No distributed songs found. Please distribute a song first.")
        return
    
    song = distributed_songs.first()
    
    print(f"\n📀 Testing with song: '{song.title}'")
    print(f"   Artist: {song.artist.get_full_name()}")
    print(f"   Status: {song.status}")
    print(f"   Share Slug: {song.share_slug}")
    print(f"   Public URL: {song.public_url}")
    
    # Test API endpoint
    api_url = f"http://localhost:8000/api/songs/public/{song.share_slug}/"
    print(f"\n🌐 Testing API endpoint: {api_url}")
    
    try:
        response = requests.get(api_url)
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ API RESPONSE SUCCESS!")
            print(f"   Title: {data.get('title')}")
            print(f"   Artist: {data.get('artist_name')}")
            print(f"   Genre: {data.get('genre')}")
            print(f"   Release Date: {data.get('release_date')}")
            print(f"   Duration: {data.get('duration')}")
            print(f"   Total Streams: {data.get('total_streams')}")
            print(f"   Share URL: {data.get('share_url')}")
            print(f"   Platform Links: {len(data.get('platform_links', []))} platforms")
            
            # Show platform links
            if data.get('platform_links'):
                print("\n   🎵 Available Platforms:")
                for link in data['platform_links']:
                    print(f"      - {link['platform']}: {link['url']}")
            
            print("\n" + "=" * 60)
            print("✨ PUBLIC SHARING SYSTEM WORKING PERFECTLY!")
            print("=" * 60)
            
        else:
            print(f"\n❌ API returned status code: {response.status_code}")
            print(f"   Response: {response.text}")
    
    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to Django server.")
        print("   Make sure the server is running: python manage.py runserver")
    except Exception as e:
        print(f"\n❌ Error testing API: {str(e)}")
    
    # Test non-distributed song (should fail)
    print("\n" + "-" * 60)
    print("🧪 Testing security: Non-distributed song should be hidden")
    print("-" * 60)
    
    pending_songs = Song.objects.filter(status='pending')
    if pending_songs.exists():
        pending_song = pending_songs.first()
        print(f"\n📀 Testing with pending song: '{pending_song.title}'")
        
        # Force save to generate slug if needed
        if not pending_song.share_slug:
            pending_song.save()
        
        api_url = f"http://localhost:8000/api/songs/public/{pending_song.share_slug}/"
        print(f"   API endpoint: {api_url}")
        
        try:
            response = requests.get(api_url)
            
            if response.status_code == 404:
                print("\n✅ SECURITY CHECK PASSED!")
                print("   Non-distributed songs are properly hidden")
            else:
                print(f"\n⚠️ WARNING: Non-distributed song is accessible (status: {response.status_code})")
        
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
    else:
        print("\n   (No pending songs to test)")
    
    print("\n" + "=" * 60)
    print("📋 SHARE URL EXAMPLES")
    print("=" * 60)
    
    print("\n✉️ Email Share Buttons:")
    share_url = song.public_url
    print(f"\n   Twitter:")
    print(f"   https://twitter.com/intent/tweet?text=Check%20out%20my%20new%20song!%20{share_url}")
    
    print(f"\n   Facebook:")
    print(f"   https://facebook.com/sharer/sharer.php?u={share_url}")
    
    print(f"\n   WhatsApp:")
    print(f"   https://wa.me/?text=Check%20out%20my%20new%20song!%20{share_url}")
    
    print("\n" + "=" * 60)
    print("✅ ALL TESTS COMPLETE!")
    print("=" * 60)


if __name__ == '__main__':
    test_public_song_api()
