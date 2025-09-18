#!/usr/bin/env python3
"""
Script to create test songs with pending status for testing
"""
import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from src.apps.songs.models import Song, Genre

User = get_user_model()

def create_test_songs():
    # Get or create a test genre
    genre, created = Genre.objects.get_or_create(
        name='Hip Hop',
        defaults={'description': 'Hip hop music genre'}
    )
    
    # Get the first user to use as artist
    artist = User.objects.first()
    if not artist:
        print("No users found. Please create a user first.")
        return
    
    # Create test songs with pending status
    test_songs = [
        {
            'title': 'Test Song 1',
            'status': 'pending',
            'price': 0.99,
            'duration': 180,  # 3 minutes
        },
        {
            'title': 'Pending Track 2',
            'status': 'pending',
            'price': 1.29,
            'duration': 240,  # 4 minutes
        },
        {
            'title': 'Awaiting Approval',
            'status': 'pending',
            'price': 0.99,
            'duration': 200,
        },
        {
            'title': 'Approved Song',
            'status': 'approved',
            'price': 0.99,
            'duration': 220,
        },
        {
            'title': 'Draft Song',
            'status': 'draft',
            'price': 0.99,
            'duration': 190,
        }
    ]
    
    created_songs = []
    for song_data in test_songs:
        # Check if song already exists
        existing = Song.objects.filter(title=song_data['title'], artist=artist).first()
        if not existing:
            song = Song.objects.create(
                title=song_data['title'],
                artist=artist,
                genre=genre,
                status=song_data['status'],
                price=song_data['price'],
                duration=song_data['duration']
            )
            created_songs.append(song)
            print(f"Created: {song.title} ({song.status})")
        else:
            print(f"Already exists: {song_data['title']}")
    
    print(f"\nSummary:")
    print(f"Total songs in database: {Song.objects.count()}")
    print(f"Pending songs: {Song.objects.filter(status='pending').count()}")
    print(f"Approved songs: {Song.objects.filter(status='approved').count()}")
    print(f"Draft songs: {Song.objects.filter(status='draft').count()}")

if __name__ == "__main__":
    create_test_songs()
