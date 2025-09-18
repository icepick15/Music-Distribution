#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import boto3
from botocore.exceptions import ClientError

def test_s3_connection():
    """Test S3 connection and bucket access"""
    print("🔍 Testing S3 Connection...")
    
    try:
        # Test basic storage
        print("✅ Default storage backend:", default_storage.__class__.__name__)
        
        # Test AWS credentials and bucket access
        if hasattr(default_storage, 'bucket_name'):
            print(f"📦 Bucket name: {default_storage.bucket_name}")
            print(f"🌍 Region: {default_storage.region_name}")
            
            # Test file upload to src/media folder
            test_content = ContentFile(b"Test file content")
            test_path = "src/media/test_upload.txt"
            
            print(f"📤 Testing upload to: {test_path}")
            saved_path = default_storage.save(test_path, test_content)
            print(f"✅ File uploaded successfully to: {saved_path}")
            
            # Test file URL generation
            file_url = default_storage.url(saved_path)
            print(f"🔗 File URL: {file_url}")
            
            # Clean up test file
            default_storage.delete(saved_path)
            print("🧹 Test file cleaned up")
            
            print("🎉 S3 connection test PASSED!")
            return True
            
    except Exception as e:
        print(f"❌ S3 connection test FAILED: {str(e)}")
        
        # Additional debugging
        if "403" in str(e) or "Forbidden" in str(e):
            print("🔒 Permission issue detected. Check your bucket policy and ACL settings.")
        elif "NoSuchBucket" in str(e):
            print("🚫 Bucket not found. Check bucket name and region.")
        elif "InvalidAccessKeyId" in str(e):
            print("🔑 Invalid access key. Check your AWS credentials.")
            
        return False

def test_direct_boto3():
    """Test direct boto3 connection"""
    print("\n🔍 Testing direct boto3 connection...")
    
    try:
        from django.conf import settings
        
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        # List bucket contents
        response = s3_client.list_objects_v2(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            MaxKeys=5
        )
        
        print(f"✅ Bucket accessible via boto3")
        print(f"📁 Objects in bucket: {response.get('KeyCount', 0)}")
        
        if 'Contents' in response:
            print("📋 Sample objects:")
            for obj in response['Contents'][:3]:
                print(f"   - {obj['Key']}")
                
        return True
        
    except ClientError as e:
        print(f"❌ Boto3 connection failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting S3 Configuration Test...")
    print("=" * 50)
    
    storage_test = test_s3_connection()
    boto3_test = test_direct_boto3()
    
    print("\n" + "=" * 50)
    if storage_test and boto3_test:
        print("🎉 ALL TESTS PASSED! S3 is properly configured.")
    else:
        print("❌ Some tests failed. Check the errors above.")
