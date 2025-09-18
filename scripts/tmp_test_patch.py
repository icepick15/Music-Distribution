import os, sys
sys.path.append(r'C:\Users\ajibade.akinola\Documents\Music Distribution\Music-Distribution')
os.environ.setdefault('DJANGO_SETTINGS_MODULE','music_distribution_backend.settings')
import django
django.setup()
from rest_framework.test import APIClient
from users.models import User
# Create or get user (lookup by email to avoid unique username race)
user, created = User.objects.get_or_create(
    email='apitest@example.com',
    defaults={'username': 'apitest', 'first_name': 'Api', 'last_name': 'Test'}
)
if created:
    user.set_password('Test12345')
    user.save()
client = APIClient()
# Ensure test client uses a host allowed by Django settings to avoid DisallowedHost
client.defaults['HTTP_HOST'] = 'localhost'
# Obtain token via login
resp = client.post('/api/auth/login/', {'email':'apitest@example.com','password':'Test12345'}, format='json')
print('login status', resp.status_code, getattr(resp, 'data', resp.content))
if resp.status_code==200:
    token = resp.data.get('access') or (resp.data.get('tokens') or {}).get('access')
    client.credentials(HTTP_AUTHORIZATION='Bearer '+token)
    # Try multipart patch with an image file
    import io
    data = {'first_name':'Api2','bio':'Updated via test'}
    # create a small in-memory file
    file_obj = io.BytesIO(b'testimagecontent')
    file_obj.name = 'avatar.png'
    files = {'profile_image': file_obj}
    resp2 = client.patch('/api/auth/profile/update/', data, format='multipart')
    print('patch status', resp2.status_code)
    try:
        print(resp2.data)
    except Exception as e:

        import os
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
        import django
        django.setup()

        from django.contrib.auth import get_user_model
        from rest_framework.test import APIClient
        from django.core.files.uploadedfile import SimpleUploadedFile

        User = get_user_model()

        # Create or get a test user
        user, created = User.objects.get_or_create(
            email='testpatch@example.com',
            defaults={'username': 'testpatch', 'first_name': 'Test', 'last_name': 'Patch'}
        )
        if created:
            user.set_password('Testpass123!')
            user.save()
            from users.models import UserProfile
            UserProfile.objects.get_or_create(user=user)

        client = APIClient()
        client.force_authenticate(user=user)
        client.defaults['HTTP_HOST'] = 'localhost'

        update_url = '/api/auth/profile/update/'

        def pretty_print(resp):
            try:
                data = resp.data
            except Exception:
                data = str(resp.content)
            print(f'Status: {resp.status_code}\nData: {data}\n')

        print('--- Testing JSON PATCH ---')
        resp = client.patch(update_url, {'first_name': 'Updated', 'bio': 'Script update'}, format='json')
        pretty_print(resp)

        print('--- Testing MULTIPART PATCH (profile_image) ---')
        image = SimpleUploadedFile('avatar.jpg', b'\x00\x01\x02', content_type='image/jpeg')
        resp2 = client.patch(update_url, {'profile_image': image, 'first_name': 'ImgUpdate'}, format='multipart')
        pretty_print(resp2)

        print('--- Testing GET profile details ---')
        get_url = '/api/auth/profile/details/'
        resp3 = client.get(get_url)
        pretty_print(resp3)

        print('Done')
