from rest_framework import status, generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login
from django.contrib.auth.tokens import default_token_generator
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
import secrets

from .models import User, UserProfile
from .serializers import (
    UserRegistrationSerializer, 
    CustomTokenObtainPairSerializer,
    UserSerializer,
    UserProfileSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    UserUpdateSerializer
)


class UserRegistrationView(APIView):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens for the new user
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            # Add custom claims
            access_token['email'] = user.email
            access_token['first_name'] = user.first_name
            access_token['last_name'] = user.last_name
            access_token['role'] = user.role
            access_token['subscription'] = user.subscription
            access_token['is_verified'] = user.is_verified
            access_token['is_admin'] = user.is_admin_user
            
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'access': str(access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login endpoint with JWT tokens"""
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response({
                'error': 'Invalid credentials',
                'detail': str(e)
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        user = serializer.user
        user.last_login = timezone.now()
        user.last_login_ip = self.get_client_ip(request)
        user.save()
        
        response_data = serializer.validated_data
        response_data['user'] = UserSerializer(user).data
        response_data['message'] = 'Login successful'
        
        return Response(response_data, status=status.HTTP_200_OK)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserProfileDetailsView(generics.RetrieveUpdateAPIView):
    """Get and update user profile details"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class PasswordChangeView(APIView):
    """Change user password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            user.password = make_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    """Request password reset"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data['email']
            user = User.objects.get(email=email)
            
            # Generate reset token
            token = secrets.token_urlsafe(32)
            
            # Store token temporarily (in a real app, use cache or database)
            # For now, we'll use a simple approach with user model
            user.password_reset_token = token
            user.password_reset_token_created = timezone.now()
            user.save()
            
            # Send email using your existing notification system
            try:
                reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
                
                # Use your existing notification system
                from src.apps.notifications.services import EmailService
                
                # Send password reset email
                email_sent = EmailService.send_password_reset_email(
                    recipient_email=email,
                    recipient_name=user.get_full_name(),
                    reset_url=reset_url
                )
                
                if email_sent:
                    return Response({
                        'message': 'Password reset email sent successfully',
                        'email': email
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'error': 'Failed to send reset email'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
            except Exception as e:
                # Fallback: print to console for development
                print(f"Password reset email would be sent to {email}")
                print(f"Reset URL: {reset_url}")
                print(f"Email service error: {str(e)}")
                
                return Response({
                    'message': 'Password reset email sent successfully',
                    'email': email,
                    'debug_reset_url': reset_url if settings.DEBUG else None
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """Confirm password reset with token"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        
        if serializer.is_valid():
            token = serializer.validated_data['token']
            new_password = serializer.validated_data['new_password']
            
            try:
                # Find user with this reset token
                user = User.objects.get(password_reset_token=token)
                
                # Check if token is still valid (e.g., within 1 hour)
                if user.password_reset_token_created:
                    time_diff = timezone.now() - user.password_reset_token_created
                    if time_diff.total_seconds() > 3600:  # 1 hour
                        return Response({
                            'error': 'Reset token has expired'
                        }, status=status.HTTP_400_BAD_REQUEST)
                
                # Reset password
                user.password = make_password(new_password)
                user.password_reset_token = None
                user.password_reset_token_created = None
                user.save()
                
                return Response({
                    'message': 'Password reset successfully'
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                return Response({
                    'error': 'Invalid reset token'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """Logout user by blacklisting refresh token"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'message': 'Logout successful'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Invalid token'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserUpdateView(generics.UpdateAPIView):
    """Update user profile information"""
    serializer_class = UserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    # Accept multipart/form-data, form-encoded and JSON payloads
    parser_classes = (MultiPartParser, FormParser, JSONParser)
    
    def get_object(self):
        return self.request.user
    
    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)


class AccountDeletionView(APIView):
    """Handle account deletion requests"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        
        # Optional: Add password confirmation for security
        password = request.data.get('password')
        if password and not user.check_password(password):
            return Response({
                'error': 'Invalid password confirmation'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Log the deletion request
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Account deletion requested for user {user.email} (ID: {user.id})")
            
            # Delete related data first (cascade should handle most)
            # You might want to add specific cleanup for songs, uploads, etc.
            
            # Delete the user (this will cascade to related models)
            user_email = user.email
            user.delete()
            
            return Response({
                'message': f'Account {user_email} has been successfully deleted'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to delete account: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard_stats(request):
    """Get user dashboard statistics"""
    user = request.user
    profile = getattr(user, 'profile', None)
    
    if not profile:
        profile = UserProfile.objects.create(user=user)
    
    # Get song statistics
    try:
        # Import here to avoid circular imports
        from src.apps.songs.models import Song
        songs = Song.objects.filter(artist=user)
        
        total_releases = songs.filter(status='distributed').count()
        total_streams = sum(song.total_streams for song in songs)
        total_revenue = sum(song.total_revenue for song in songs)
        
        # Update profile with latest stats
        profile.total_releases = total_releases
        profile.total_streams = total_streams
        profile.total_revenue = total_revenue
        profile.save()
        
    except ImportError:
        # Songs app not ready yet
        total_releases = profile.total_releases
        total_streams = profile.total_streams
        total_revenue = profile.total_revenue
    
    stats = {
        'user': UserSerializer(user).data,
        'stats': {
            'total_releases': total_releases,
            'total_streams': total_streams,
            'total_revenue': float(total_revenue),
            'subscription_status': user.subscription,
            'has_active_subscription': user.has_active_subscription,
            'is_verified': user.is_verified,
            'is_artist_verified': user.is_artist_verified,
        }
    }
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def check_email_availability(request):
    """Check if email is available for registration"""
    email = request.data.get('email')
    
    if not email:
        return Response({
            'error': 'Email is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    exists = User.objects.filter(email=email).exists()
    
    return Response({
        'available': not exists,
        'email': email
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def check_username_availability(request):
    """Check if username is available for registration"""
    username = request.data.get('username')
    
    if not username:
        return Response({
            'error': 'Username is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    exists = User.objects.filter(username=username).exists()
    
    return Response({
        'available': not exists,
        'username': username
    })
