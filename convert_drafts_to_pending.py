"""
Convert All Draft Songs to Pending
===================================

This script converts all existing draft songs to pending status.

Usage:
    python convert_drafts_to_pending.py
"""

import os
import sys
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.songs.models import Song
from django.utils import timezone

def convert_drafts_to_pending():
    """Convert all draft songs to pending status"""
    print("\n" + "=" * 60)
    print("🔄 Converting Draft Songs to Pending")
    print("=" * 60)
    
    # Count draft songs
    draft_songs = Song.objects.filter(status='draft')
    count = draft_songs.count()
    
    if count == 0:
        print("\n✅ No draft songs found. All songs are already in other statuses.")
        return
    
    print(f"\n📊 Found {count} draft song(s)")
    
    # Show which songs will be converted
    print("\n📝 Songs to be converted:")
    for i, song in enumerate(draft_songs, 1):
        print(f"   {i}. {song.title} by {song.artist.get_full_name()} (ID: {song.id})")
    
    # Confirm
    confirm = input(f"\n⚠️  Convert {count} song(s) to pending? [y/N]: ")
    
    if confirm.lower() != 'y':
        print("❌ Cancelled. No changes made.")
        return
    
    # Convert songs
    updated = draft_songs.update(
        status='pending',
        submitted_at=timezone.now()
    )
    
    print(f"\n✅ Successfully converted {updated} song(s) to pending status!")
    print("🎉 These songs are now in the admin review queue.")
    
    # Show updated status distribution
    print("\n📊 Current Status Distribution:")
    for status, label in Song.STATUS_CHOICES:
        count = Song.objects.filter(status=status).count()
        print(f"   {label:15} ({status:11}): {count}")

if __name__ == '__main__':
    convert_drafts_to_pending()
