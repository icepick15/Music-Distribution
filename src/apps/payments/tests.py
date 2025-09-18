from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from src.apps.payments.models import Subscription
from rest_framework.test import APIClient

User = get_user_model()


class PayPerSongFlowTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='paytest@example.com', username='paytest', first_name='Pay', last_name='Test', password='Testpass123!'
        )
        self.client = APIClient()
        resp = self.client.post('/api/auth/login/', {'email': 'paytest@example.com', 'password': 'Testpass123!'}, format='json')
        self.token = resp.data['access']
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token)

    def test_purchase_credits_and_upload_consume(self):
        # Simulate purchase by creating subscription with 1 credit
        sub = Subscription.objects.create(
            user=self.user,
            subscription_type='pay_per_song',
            amount=5000,
            song_credits=1,
            start_date=timezone.now(),
            status='active'
        )
        # user role should be set to artist by service logic normally, emulate here
        self.user.role = 'artist'
        self.user.save()

        # Upload a song via API should consume credit. We'll call the songs create view.
        url = '/api/songs/'
        # Minimal required fields depending on serializer; use title and dummy files
        from django.core.files.uploadedfile import SimpleUploadedFile
        from io import BytesIO
        from PIL import Image

        buf = BytesIO()
        img_obj = Image.new('RGBA', (1, 1), color=(255, 255, 255, 0))
        img_obj.save(buf, format='PNG')
        buf.seek(0)
        img = SimpleUploadedFile('avatar.png', buf.read(), content_type='image/png')

        audio = SimpleUploadedFile('audio.mp3', b'ID3\x00\x00\x00', content_type='audio/mpeg')
        data = {
            'title': 'Test Song',
            'audio_file': audio,
            'cover_image': img
        }
        resp = self.client.post(url, data, format='multipart')
        self.assertEqual(resp.status_code, 201)

        sub.refresh_from_db()
        self.assertEqual(sub.remaining_credits, 0)

        # After consuming the only credit, user role should revert
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, 'user')
