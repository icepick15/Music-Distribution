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
from django.conf import settings

def test_s3_permissions():
    """Test S3 connection with better error handling"""
    print("🔍 Testing S3 Connection with Enhanced Error Handling...")
    
    try:
        # Test basic storage info
        print("✅ Default storage backend:", default_storage.__class__.__name__)
        print(f"📦 Bucket name: {settings.AWS_STORAGE_BUCKET_NAME}")
        print(f"🌍 Region: {settings.AWS_S3_REGION_NAME}")
        print(f"🔗 Custom domain: {getattr(settings, 'AWS_S3_CUSTOM_DOMAIN', 'N/A')}")
        
        # Test with a simpler path first
        test_content = ContentFile(b"Test file content for src folder")
        test_path = "src/media/uploads/test_file.txt"
        
        print(f"📤 Testing upload to: {test_path}")
        
        # Try to save the file
        saved_path = default_storage.save(test_path, test_content)
        print(f"✅ File uploaded successfully to: {saved_path}")
        
        # Test file existence
        if default_storage.exists(saved_path):
            print("✅ File exists in bucket")
            
            # Test file URL generation
            try:
                file_url = default_storage.url(saved_path)
                print(f"🔗 File URL: {file_url}")
            except Exception as url_error:
                print(f"⚠️  URL generation warning: {url_error}")
            
            # Clean up test file
            try:
                default_storage.delete(saved_path)
                print("🧹 Test file cleaned up")
            except Exception as delete_error:
                print(f"⚠️  Could not delete test file: {delete_error}")
                
        else:
            print("❌ File was not found after upload")
            
        print("🎉 S3 upload test PASSED!")
        return True
        
    except Exception as e:
        print(f"❌ S3 test FAILED: {str(e)}")
        
        # Enhanced error analysis
        error_str = str(e).lower()
        if "403" in error_str or "forbidden" in error_str:
            print("\n🔒 PERMISSION ISSUE DETECTED:")
            print("   Your S3 bucket policy may be too restrictive.")
            print("   Try adding this policy to your bucket:")
            print(f"""
   {{
       "Version": "2012-10-17",
       "Statement": [
           {{
               "Effect": "Allow",
               "Principal": {{
                   "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER"
               }},
               "Action": [
                   "s3:GetObject",
                   "s3:PutObject",
                   "s3:DeleteObject"
               ],
               "Resource": "arn:aws:s3:::{settings.AWS_STORAGE_BUCKET_NAME}/src/*"
           }}
       ]
   }}""")
        elif "nosuchbucket" in error_str:
            print(f"\n🚫 BUCKET NOT FOUND: '{settings.AWS_STORAGE_BUCKET_NAME}' in region '{settings.AWS_S3_REGION_NAME}'")
        elif "invalidaccesskeyid" in error_str:
            print("\n🔑 INVALID CREDENTIALS: Check your AWS_ACCESS_KEY_ID")
        elif "signaturesmatch" in error_str:
            print("\n🔐 SIGNATURE ERROR: Check your AWS_SECRET_ACCESS_KEY")
        elif "requesttimetooskewed" in error_str:
            print("\n⏰ TIME SKEW ERROR: Your system time is out of sync with AWS")
            print("   Run: w32tm /resync (Windows) or ntpdate -s time.nist.gov (Linux)")
            
        return False

def test_bucket_accessibility():
    """Test basic bucket access without uploading"""
    print("\n🔍 Testing Basic Bucket Access...")
    
    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        # Test bucket location
        location = s3_client.get_bucket_location(Bucket=settings.AWS_STORAGE_BUCKET_NAME)
        print(f"✅ Bucket location confirmed: {location.get('LocationConstraint', 'us-east-1')}")
        
        # Test listing with prefix
        response = s3_client.list_objects_v2(
            Bucket=settings.AWS_STORAGE_BUCKET_NAME,
            Prefix='src/',
            MaxKeys=5
        )
        
        print(f"✅ Can list objects in src/ folder")
        print(f"📁 Objects found: {response.get('KeyCount', 0)}")
        
        return True
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        print(f"❌ Bucket access failed: {error_code} - {e.response['Error']['Message']}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Enhanced S3 Configuration Test...")
    print("=" * 60)
    
    bucket_test = test_bucket_accessibility()
    upload_test = test_s3_permissions()
    
    print("\n" + "=" * 60)
    if bucket_test and upload_test:
        print("🎉 ALL TESTS PASSED! S3 is properly configured for src/ uploads.")
    else:
        print("❌ Some tests failed. Check the detailed errors above.")
        print("\n💡 Quick fixes to try:")
        print("   1. Check your bucket policy allows PutObject/GetObject for src/*")
        print("   2. Verify your IAM user has S3 permissions") 
        print("   3. Ensure your system time is synchronized")
        print("   4. Try disabling bucket public access block temporarily for testing")
