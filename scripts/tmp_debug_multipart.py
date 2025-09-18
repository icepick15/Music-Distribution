import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.test_settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

# Create or get user
user, _ = User.objects.get_or_create(email='debuguser@example.com', defaults={
    'username': 'debuguser', 'first_name': 'Debug', 'last_name': 'User'
})
user.set_password('Debugpass123!')
user.save()

# Ensure profile exists
from users.models import UserProfile
UserProfile.objects.get_or_create(user=user)

client = APIClient()
# Test client defaults to 'testserver' which can trigger DisallowedHost; set to localhost
client.defaults['HTTP_HOST'] = 'localhost'
# Login
resp = client.post('/api/auth/login/', {'email': 'debuguser@example.com', 'password': 'Debugpass123!'}, format='json')
print('login status', resp.status_code, resp.data)
if resp.status_code != 200:
    raise SystemExit('login failed')

token = resp.data.get('access')
client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

# Build minimal PNG
png_bytes = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0bIDAT\x08\xd7c``\x00\x00\x00\x04\x00\x01\x0d\n\x2d\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
image = SimpleUploadedFile('avatar.png', png_bytes, content_type='image/png')

resp = client.patch('/api/auth/profile/update/', {'profile_image': image, 'bio': 'Image update via debug'}, format='multipart')
print('patch status', resp.status_code)
try:
    print('response data:', resp.data)
except Exception:
    print('response content:', resp.content)

# Show user profile image
user.refresh_from_db()
print('user.profile_image:', user.profile_image)
