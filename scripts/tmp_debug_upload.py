import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.test_settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from payments.models import Subscription
from django.utils import timezone

User = get_user_model()
user = User.objects.create_user(email='debugpay@example.com', username='debugpay', first_name='Debug', last_name='Pay', password='Testpass123!')
Subscription.objects.create(user=user, subscription_type='pay_per_song', amount=5000, song_credits=1, start_date=timezone.now(), status='active')

client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'
resp = client.post('/api/auth/login/', {'email': 'debugpay@example.com', 'password': 'Testpass123!'}, format='json')
print('login', resp.status_code, getattr(resp, 'data', resp.content))
client.credentials(HTTP_AUTHORIZATION='Bearer ' + resp.data['access'])

from django.core.files.uploadedfile import SimpleUploadedFile
img = SimpleUploadedFile('avatar.png', b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01', content_type='image/png')
audio = SimpleUploadedFile('audio.mp3', b'ID3\x00\x00\x00', content_type='audio/mpeg')

resp = client.post('/api/songs/', {'title':'Debug Song', 'audio_file': audio, 'cover_image': img}, format='multipart')
print('post', resp.status_code)
try:
    print(resp.data)
except Exception:
    print(resp.content)
