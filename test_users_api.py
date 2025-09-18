from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import get_user_model

User = get_user_model()

@csrf_exempt
def test_users_api(request):
    """Simple test endpoint to check users without authentication"""
    try:
        users = User.objects.all()
        user_data = []
        for user in users:
            user_data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': getattr(user, 'role', 'user'),
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat() if user.date_joined else None
            })
        
        return JsonResponse({
            'count': len(user_data),
            'users': user_data
        })
    except Exception as e:
        return JsonResponse({
            'error': str(e),
            'count': 0,
            'users': []
        })
