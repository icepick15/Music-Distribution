from django.urls import reverse
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile


User = get_user_model()


class ProfileUpdateTests(APITestCase):
	def setUp(self):
		self.user = User.objects.create_user(
			email='testuser@example.com',
			username='testuser',
			first_name='Test',
			last_name='User',
			password='Testpass123!'
		)
		# ensure profile exists
		from src.apps.users.models import UserProfile
		UserProfile.objects.get_or_create(user=self.user)

	def authenticate(self):
		resp = self.client.post('/api/auth/login/', {'email': 'testuser@example.com', 'password': 'Testpass123!'}, format='json')
		self.assertEqual(resp.status_code, 200)
		token = resp.data.get('access')
		self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)

	def test_json_profile_update(self):
		self.authenticate()
		url = '/api/auth/profile/update/'
		resp = self.client.patch(url, {'first_name': 'Updated', 'bio': 'Updated bio'}, format='json')
		self.assertEqual(resp.status_code, 200)
		self.user.refresh_from_db()
		self.assertEqual(self.user.first_name, 'Updated')

	def test_multipart_profile_update_with_image(self):
		self.authenticate()
		url = '/api/auth/profile/update/'
		# Generate a real 1x1 PNG using Pillow so ImageField validation accepts it
		from io import BytesIO
		from PIL import Image
		buf = BytesIO()
		img = Image.new('RGBA', (1, 1), color=(255, 255, 255, 0))
		img.save(buf, format='PNG')
		buf.seek(0)
		image = SimpleUploadedFile('avatar.png', buf.read(), content_type='image/png')
		resp = self.client.patch(url, {'profile_image': image, 'bio': 'Image update'}, format='multipart')
		self.assertEqual(resp.status_code, 200)
		self.user.refresh_from_db()
		# profile_image may be stored as a path string; ensure it's not None when uploaded
		self.assertIsNotNone(self.user.profile_image)
