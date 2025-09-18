import boto3
from decouple import config

print("=== Minimal S3 Test for Django Storage ===")

try:
    # Create S3 client
    s3_client = boto3.client(
        's3',
        aws_access_key_id=config('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=config('AWS_SECRET_ACCESS_KEY'),
        region_name=config('AWS_S3_REGION_NAME', default='us-east-1')
    )
    
    bucket_name = config('AWS_STORAGE_BUCKET_NAME')
    test_key = 'test-uploads/test-file.txt'
    test_content = b'Hello from Django S3 test!'
    
    print(f"Testing minimal S3 operations for bucket: {bucket_name}")
    print(f"Using region: {config('AWS_S3_REGION_NAME')}")
    
    # Test 1: Try to put an object (this is what Django needs)
    print("\n=== Test 1: PUT Object ===")
    try:
        s3_client.put_object(
            Bucket=bucket_name,
            Key=test_key,
            Body=test_content,
            ContentType='text/plain'
        )
        print("✓ PUT object successful")
    except Exception as e:
        print(f"✗ PUT object failed: {e}")
    
    # Test 2: Try to get the object back
    print("\n=== Test 2: GET Object ===")
    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=test_key)
        content = response['Body'].read()
        print(f"✓ GET object successful: {content.decode()}")
    except Exception as e:
        print(f"✗ GET object failed: {e}")
    
    # Test 3: Try to delete the test object
    print("\n=== Test 3: DELETE Object ===")
    try:
        s3_client.delete_object(Bucket=bucket_name, Key=test_key)
        print("✓ DELETE object successful")
    except Exception as e:
        print(f"✗ DELETE object failed: {e}")
    
    # Test 4: Generate a pre-signed URL (for direct uploads)
    print("\n=== Test 4: Generate Pre-signed URL ===")
    try:
        url = s3_client.generate_presigned_url(
            'put_object',
            Params={'Bucket': bucket_name, 'Key': 'test-presigned.txt'},
            ExpiresIn=3600
        )
        print("✓ Pre-signed URL generation successful")
        print(f"URL: {url[:100]}...")
    except Exception as e:
        print(f"✗ Pre-signed URL generation failed: {e}")

except Exception as e:
    print(f"Failed to create S3 client: {e}")

print("\n=== Recommendation ===")
print("For Django S3 storage to work, your IAM user needs these permissions:")
print("- s3:PutObject")
print("- s3:GetObject") 
print("- s3:DeleteObject")
print("- s3:PutObjectAcl (if using ACLs)")
print("- s3:GetObjectAcl (if using ACLs)")
print("\nOptional but recommended:")
print("- s3:ListBucket (to check if objects exist)")
print("\nYou can add these to your IAM user policy in AWS Console.")
