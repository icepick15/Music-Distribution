import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

print("=== S3 Configuration Check ===")
print(f"USE_S3: {getattr(settings, 'USE_S3', 'Not Set')}")
print(f"DEFAULT_FILE_STORAGE: {getattr(settings, 'DEFAULT_FILE_STORAGE', 'Not Set')}")
print(f"AWS_ACCESS_KEY_ID: {'Set' if getattr(settings, 'AWS_ACCESS_KEY_ID', None) else 'Not Set'}")
print(f"AWS_STORAGE_BUCKET_NAME: {getattr(settings, 'AWS_STORAGE_BUCKET_NAME', 'Not Set')}")
print(f"MEDIA_URL: {settings.MEDIA_URL}")

print("\n=== Database Check ===")
from songs.models import Song
from payments.models import Subscription
from django.contrib.auth import get_user_model

User = get_user_model()
print(f"Song count: {Song.objects.count()}")
print(f"User count: {User.objects.count()}")

if User.objects.exists():
    user = User.objects.first()
    print(f"First user: {user.email}")
    subs = Subscription.objects.filter(user=user)
    print(f"User subscriptions: {list(subs.values('subscription_type', 'status', 'song_credits', 'credits_used'))}")

print("\n=== Test S3 Connection ===")
if getattr(settings, 'USE_S3', False):
    try:
        import boto3
        from botocore.exceptions import ClientError
        
        s3_client = boto3.client(
            's3',
            aws_access_key_id=getattr(settings, 'AWS_ACCESS_KEY_ID', None),
            aws_secret_access_key=getattr(settings, 'AWS_SECRET_ACCESS_KEY', None),
            region_name=getattr(settings, 'AWS_S3_REGION_NAME', 'us-east-1')
        )
        
        bucket_name = getattr(settings, 'AWS_STORAGE_BUCKET_NAME', None)
        if bucket_name:
            response = s3_client.head_bucket(Bucket=bucket_name)
            print(f"S3 bucket '{bucket_name}' is accessible")
        else:
            print("No bucket name configured")
    except ClientError as e:
        print(f"S3 connection failed: {e}")
    except Exception as e:
        print(f"S3 test error: {e}")
else:
    print("S3 not enabled, using local storage")
