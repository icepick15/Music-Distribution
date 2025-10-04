"""
Test Script: Verify Song Status Workflow Changes
================================================

This script verifies that the song status changes are working correctly
without breaking any existing functionality.

Run this after applying the migration:
    python test_status_change.py
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

def test_default_status():
    """Test that new songs get 'pending' as default status"""
    print("\n🧪 Test 1: Default Status for New Songs")
    print("-" * 50)
    
    # Get a test user (or create one)
    user = User.objects.filter(role='artist').first()
    if not user:
        print("⚠️  No artist user found. Creating test user...")
        user = User.objects.create_user(
            username='test_artist_status',
            email='test_status@example.com',
            password='testpass123',
            first_name='Test',
            last_name='Artist',
            role='artist'
        )
        print(f"✅ Created test user: {user.email}")
    
    # Create a test song WITHOUT specifying status
    song = Song.objects.create(
        title=f"Test Song Status - {timezone.now().strftime('%H:%M:%S')}",
        artist=user
    )
    
    print(f"📝 Created song: {song.title}")
    print(f"🎯 Status: {song.status}")
    
    if song.status == 'pending':
        print("✅ PASS: Default status is 'pending'")
        # Clean up
        song.delete()
        return True
    else:
        print(f"❌ FAIL: Expected 'pending', got '{song.status}'")
        # Clean up
        song.delete()
        return False


def test_status_choices():
    """Test that all expected status choices exist"""
    print("\n🧪 Test 2: Status Choices")
    print("-" * 50)
    
    expected_statuses = ['draft', 'pending', 'approved', 'distributed', 'rejected']
    actual_statuses = [choice[0] for choice in Song.STATUS_CHOICES]
    
    print(f"Expected: {expected_statuses}")
    print(f"Actual:   {actual_statuses}")
    
    if set(expected_statuses) == set(actual_statuses):
        print("✅ PASS: All status choices exist")
        return True
    else:
        print("❌ FAIL: Status choices don't match")
        return False


def test_existing_songs():
    """Check status distribution of existing songs"""
    print("\n🧪 Test 3: Existing Songs Status Distribution")
    print("-" * 50)
    
    total = Song.objects.count()
    print(f"📊 Total songs: {total}")
    
    if total == 0:
        print("⚠️  No songs in database yet")
        return True
    
    for status, label in Song.STATUS_CHOICES:
        count = Song.objects.filter(status=status).count()
        percentage = (count / total * 100) if total > 0 else 0
        print(f"   {label:12} ({status:11}): {count:3} ({percentage:5.1f}%)")
    
    return True


def test_admin_querysets():
    """Test that admin queries work with new status"""
    print("\n🧪 Test 4: Admin Queryset Filters")
    print("-" * 50)
    
    try:
        # Simulate admin action queries
        pending_count = Song.objects.filter(status='pending').count()
        approved_count = Song.objects.filter(status='approved').count()
        distributable = Song.objects.filter(status='approved').count()
        approvable = Song.objects.filter(status='pending').count()
        
        print(f"✅ Pending songs (approvable):     {approvable}")
        print(f"✅ Approved songs (distributable): {distributable}")
        print(f"✅ Total pending:                  {pending_count}")
        print(f"✅ Total approved:                 {approved_count}")
        print("✅ PASS: All admin querysets work")
        return True
    except Exception as e:
        print(f"❌ FAIL: Query error - {e}")
        return False


def main():
    """Run all tests"""
    print("\n" + "=" * 50)
    print("🚀 Song Status Workflow Verification")
    print("=" * 50)
    
    tests = [
        test_default_status,
        test_status_choices,
        test_existing_songs,
        test_admin_querysets
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with exception: {e}")
            results.append(False)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary")
    print("=" * 50)
    passed = sum(results)
    total = len(results)
    print(f"Passed: {passed}/{total}")
    
    if passed == total:
        print("✅ All tests passed! Status change is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please review the output above.")
        return 1


if __name__ == '__main__':
    sys.exit(main())
