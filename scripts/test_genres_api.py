#!/usr/bin/env python
import os
import django
import requests

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from songs.models import Genre

print("=== TESTING GENRES ===")
print("Genres in database:")
for genre in Genre.objects.all()[:5]:
    print(f"  ID: {genre.id} (type: {type(genre.id)}) - Name: {genre.name}")

print("\n=== TESTING API ===")
try:
    response = requests.get('http://127.0.0.1:8000/api/songs/genres/')
    print(f"API Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"API Response (first 2 items):")
        for item in data[:2]:
            print(f"  {item}")
    else:
        print(f"API Error: {response.text}")
except Exception as e:
    print(f"Error calling API: {e}")
