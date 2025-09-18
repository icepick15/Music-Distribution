import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.test_settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

user, _ = User.objects.get_or_create(email='socialdebug@example.com', defaults={'username':'socialdebug','first_name':'Social','last_name':'Debug'})
user.set_password('Debugpass123!')
user.save()

from users.models import UserProfile
UserProfile.objects.get_or_create(user=user)

client = APIClient()
client.defaults['HTTP_HOST'] = 'localhost'

# login
resp = client.post('/api/auth/login/', {'email': 'socialdebug@example.com', 'password': 'Debugpass123!'}, format='json')
print('login', resp.status_code, getattr(resp, 'data', resp.content))
assert resp.status_code == 200
client.credentials(HTTP_AUTHORIZATION='Bearer ' + resp.data['access'])

# Try updating with a bare domain (no scheme)
resp = client.patch('/api/auth/profile/update/', {'twitter_url': 'twitter.com/testprofile'}, format='json')
print('patch 1 status', resp.status_code, getattr(resp, 'data', resp.content))
user.refresh_from_db()
print('twitter stored:', user.twitter_url)

# Try updating with an @handle
resp = client.patch('/api/auth/profile/update/', {'twitter_url': '@handle'}, format='json')
print('patch 2 status', resp.status_code, getattr(resp, 'data', resp.content))
user.refresh_from_db()
print('twitter stored:', user.twitter_url)
