"""
Generate share_slug for existing songs that don't have one
Run this once after adding the share_slug field
"""
import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.songs.models import Song
from django.utils.text import slugify

def generate_slugs():
    """Generate share slugs for all songs without one"""
    songs_without_slug = Song.objects.filter(share_slug__isnull=True) | Song.objects.filter(share_slug='')
    count = songs_without_slug.count()
    
    print(f"Found {count} songs without share_slug")
    
    for song in songs_without_slug:
        # Use the model's save method which will auto-generate the slug
        song.save()
        print(f"✅ Generated slug for '{song.title}': {song.share_slug}")
    
    print(f"\n✨ Generated {count} share slugs successfully!")

if __name__ == '__main__':
    generate_slugs()
