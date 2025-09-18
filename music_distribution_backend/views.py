from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings


@api_view(['GET'])
@permission_classes([AllowAny])
def api_health(request):
    """Health check endpoint for the API"""
    return Response({
        'status': 'healthy',
        'message': 'Music Distribution API is running',
        'version': '1.0.0',
        'debug': settings.DEBUG,
        'endpoints': {
            'auth': {
                'register': '/api/auth/register/',
                'login': '/api/auth/login/',
                'logout': '/api/auth/logout/',
                'profile': '/api/auth/profile/',
                'token_refresh': '/api/auth/token/refresh/',
            }
        }
    })


@api_view(['GET'])  
@permission_classes([AllowAny])
def api_test_cors(request):
    """Test CORS configuration"""
    return Response({
        'message': 'CORS is working correctly',
        'origin': request.META.get('HTTP_ORIGIN', 'No origin header'),
        'method': request.method,
        'headers': dict(request.headers)
    })
