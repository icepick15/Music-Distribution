"""
Revert Song Status for Testing
================================

This script helps you revert songs back to pending status for testing the
approval and distribution email notifications.

Usage:
    python revert_song_status.py
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.songs.models import Song
from django.contrib.auth import get_user_model

User = get_user_model()

def show_menu():
    """Display menu options"""
    print("\n" + "=" * 60)
    print("🔄 Song Status Reverter - Testing Tool")
    print("=" * 60)
    print("\nWhat would you like to do?")
    print("1. Pick song from list (Easy)")
    print("2. Revert all distributed songs to pending")
    print("3. Revert all approved songs to pending")
    print("4. Revert all songs to pending")
    print("5. Show all songs with their status")
    print("6. Revert specific song by ID (Advanced)")
    print("7. Exit")
    print("-" * 60)

def show_all_songs():
    """Display all songs with their status"""
    songs = Song.objects.all().order_by('-created_at')
    
    if not songs.exists():
        print("\n❌ No songs found in database.")
        return None
    
    print(f"\n📋 Total Songs: {songs.count()}")
    print("-" * 120)
    print(f"{'#':<4} {'Title':<30} {'Artist':<20} {'Status':<15} {'Full ID':<40}")
    print("-" * 120)
    
    songs_list = []
    for i, song in enumerate(songs, 1):
        title = (song.title[:27] + "...") if len(song.title) > 30 else song.title
        artist = song.artist.get_full_name()[:17] + "..." if len(song.artist.get_full_name()) > 20 else song.artist.get_full_name()
        status = song.get_status_display()
        full_id = str(song.id)
        print(f"{i:<4} {title:<30} {artist:<20} {status:<15} {full_id:<40}")
        songs_list.append(song)
    
    print("-" * 120)
    return songs_list

def revert_by_number():
    """Revert song by selecting from numbered list"""
    songs_list = show_all_songs()
    
    if not songs_list:
        return
    
    choice = input("\n📝 Enter song number (or 'back' to return): ").strip()
    
    if choice.lower() == 'back':
        return
    
    try:
        song_num = int(choice)
        if song_num < 1 or song_num > len(songs_list):
            print(f"\n❌ Invalid number. Please enter 1-{len(songs_list)}")
            return
        
        song = songs_list[song_num - 1]
        print(f"\n📍 Selected: '{song.title}' by {song.artist.get_full_name()}")
        print(f"   Current Status: {song.get_status_display()}")
        print(f"   Song ID: {song.id}")
        
        confirm = input(f"\n⚠️  Revert to PENDING? [y/N]: ")
        
        if confirm.lower() == 'y':
            old_status = song.status
            song.status = 'pending'
            song.approved_at = None
            song.distributed_at = None
            song.submitted_at = None
            song.save()
            print(f"\n✅ Song reverted from '{old_status}' to 'pending'")
            print("   You can now test approval/distribution emails!")
        else:
            print("❌ Cancelled.")
    
    except ValueError:
        print(f"\n❌ Please enter a valid number.")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

def revert_by_id():
    """Revert specific song by ID (Advanced)"""
    songs_list = show_all_songs()
    
    if not songs_list:
        return
    
    print("\n💡 Tip: You can copy the Full ID from the table above")
    song_id = input("\n📝 Enter Full Song ID (or 'back' to return): ").strip()
    
    if song_id.lower() == 'back':
        return
    
    try:
        song = Song.objects.get(id=song_id)
        print(f"\n📍 Found: '{song.title}' by {song.artist.get_full_name()}")
        print(f"   Current Status: {song.get_status_display()}")
        
        confirm = input(f"\n⚠️  Revert to PENDING? [y/N]: ")
        
        if confirm.lower() == 'y':
            old_status = song.status
            song.status = 'pending'
            song.approved_at = None
            song.distributed_at = None
            song.submitted_at = None
            song.save()
            print(f"\n✅ Song reverted from '{old_status}' to 'pending'")
            print("   You can now test approval/distribution emails!")
        else:
            print("❌ Cancelled.")
    
    except Song.DoesNotExist:
        print(f"\n❌ Song with ID '{song_id}' not found.")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")

def revert_distributed_songs():
    """Revert all distributed songs to pending"""
    distributed = Song.objects.filter(status='distributed')
    count = distributed.count()
    
    if count == 0:
        print("\n✅ No distributed songs found.")
        return
    
    print(f"\n📊 Found {count} distributed song(s):")
    for i, song in enumerate(distributed, 1):
        print(f"   {i}. {song.title} by {song.artist.get_full_name()}")
    
    confirm = input(f"\n⚠️  Revert {count} song(s) to pending? [y/N]: ")
    
    if confirm.lower() == 'y':
        updated = distributed.update(
            status='pending',
            approved_at=None,
            distributed_at=None
        )
        print(f"\n✅ Successfully reverted {updated} song(s) to pending!")
        print("   You can now test approval/distribution emails!")
    else:
        print("❌ Cancelled.")

def revert_approved_songs():
    """Revert all approved songs to pending"""
    approved = Song.objects.filter(status='approved')
    count = approved.count()
    
    if count == 0:
        print("\n✅ No approved songs found.")
        return
    
    print(f"\n📊 Found {count} approved song(s):")
    for i, song in enumerate(approved, 1):
        print(f"   {i}. {song.title} by {song.artist.get_full_name()}")
    
    confirm = input(f"\n⚠️  Revert {count} song(s) to pending? [y/N]: ")
    
    if confirm.lower() == 'y':
        updated = approved.update(
            status='pending',
            approved_at=None,
            distributed_at=None
        )
        print(f"\n✅ Successfully reverted {updated} song(s) to pending!")
        print("   You can now test approval emails!")
    else:
        print("❌ Cancelled.")

def revert_all_songs():
    """Revert all songs to pending"""
    all_songs = Song.objects.exclude(status='pending')
    count = all_songs.count()
    
    if count == 0:
        print("\n✅ All songs are already pending.")
        return
    
    print(f"\n⚠️  WARNING: This will revert ALL {count} song(s) to pending status!")
    
    # Show status breakdown
    print("\n📊 Current Status Distribution:")
    for status, label in Song.STATUS_CHOICES:
        song_count = Song.objects.filter(status=status).count()
        if song_count > 0:
            print(f"   {label}: {song_count}")
    
    confirm = input(f"\n⚠️  Are you absolutely sure? Type 'YES' to confirm: ")
    
    if confirm == 'YES':
        updated = all_songs.update(
            status='pending',
            approved_at=None,
            distributed_at=None,
            submitted_at=None
        )
        print(f"\n✅ Successfully reverted {updated} song(s) to pending!")
        print("   All songs are now ready for testing!")
    else:
        print("❌ Cancelled. (You need to type 'YES' to confirm)")

def main():
    """Main program loop"""
    while True:
        show_menu()
        choice = input("\nEnter your choice (1-7): ").strip()
        
        if choice == '1':
            revert_by_number()
        elif choice == '2':
            revert_distributed_songs()
        elif choice == '3':
            revert_approved_songs()
        elif choice == '4':
            revert_all_songs()
        elif choice == '5':
            show_all_songs()
        elif choice == '6':
            revert_by_id()
        elif choice == '7':
            print("\n👋 Goodbye!")
            break
        else:
            print("\n❌ Invalid choice. Please enter 1-7.")
        
        input("\n📍 Press Enter to continue...")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n👋 Interrupted. Goodbye!")
        sys.exit(0)
