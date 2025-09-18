#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from src.apps.songs.models import Song
from django.utils import timezone

def update_approved_songs():
    # Get all approved songs
    approved_songs = Song.objects.filter(status='approved')
    print(f"Found {approved_songs.count()} approved songs")
    
    # Update them to distributed with distributed_at timestamp
    for song in approved_songs:
        song.status = 'distributed'
        song.distributed_at = timezone.now()
        song.save()
        print(f"Updated song '{song.title}' to distributed")
    
    print("Done updating songs!")

if __name__ == '__main__':
    update_approved_songs()
