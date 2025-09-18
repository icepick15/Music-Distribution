import boto3
from decouple import config

print("=== S3 Connection Test ===")

try:
    # Create S3 client
    s3_client = boto3.client(
        's3',
        aws_access_key_id=config('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=config('AWS_SECRET_ACCESS_KEY'),
        region_name=config('AWS_S3_REGION_NAME', default='us-east-1')
    )
    
    print(f"Using region: {config('AWS_S3_REGION_NAME')}")
    print(f"Access Key ID: {config('AWS_ACCESS_KEY_ID')[:10]}...")
    
    # Test bucket access
    print("\n=== Testing Bucket Access ===")
    try:
        response = s3_client.head_bucket(Bucket='musicdp')
        print("✓ Bucket 'musicdp' is accessible")
    except Exception as e:
        print(f"✗ Bucket access failed: {e}")
    
    # Try to get bucket location
    print("\n=== Getting Bucket Location ===")
    try:
        response = s3_client.get_bucket_location(Bucket='musicdp')
        location = response.get('LocationConstraint') or 'us-east-1'
        print(f"Bucket location: {location}")
        
        if location != config('AWS_S3_REGION_NAME'):
            print(f"WARNING: Region mismatch! Bucket is in {location}, but config says {config('AWS_S3_REGION_NAME')}")
    except Exception as e:
        print(f"Error getting bucket location: {e}")
    
    # List all buckets (tests basic S3 access)
    print("\n=== Listing All Buckets ===")
    try:
        response = s3_client.list_buckets()
        print("Available buckets:")
        for bucket in response['Buckets']:
            print(f"  - {bucket['Name']}")
    except Exception as e:
        print(f"Error listing buckets: {e}")

except Exception as e:
    print(f"Failed to create S3 client: {e}")
