#!/usr/bin/env python
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from songs.models import Genre
from songs.serializers import SongUploadSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

print("=== TESTING GENRE UUID ISSUE ===")

# Get first genre
genre = Genre.objects.first()
print(f"First genre: {genre.id} ({type(genre.id)}) - {genre.name}")

# Test serializer with UUID string
print(f"\n=== TESTING SERIALIZER ===")
test_data = {
    'title': 'Test Song',
    'genre': str(genre.id),  # Convert UUID to string
}

print(f"Test data: {test_data}")

# Create a test user (just for serializer context)
try:
    user = User.objects.first()
    if not user:
        print("No user found, creating test user...")
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    # Test serializer
    serializer = SongUploadSerializer(data=test_data, context={'request': type('obj', (object,), {'user': user})()})
    print(f"Serializer is_valid: {serializer.is_valid()}")
    if not serializer.is_valid():
        print(f"Errors: {serializer.errors}")
    else:
        print("Serializer validation passed!")
        
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
