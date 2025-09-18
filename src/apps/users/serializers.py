from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User, UserProfile


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 
            'phone_number', 'password', 'password_confirm'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate password confirmation and email uniqueness"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Password confirmation doesn't match")
        
        # Check email uniqueness
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("User with this email already exists")
        
        # Check username uniqueness  
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError("User with this username already exists")
        
        return attrs
    
    def create(self, validated_data):
        """Create user with validated data"""
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        # Create user profile
        UserProfile.objects.create(user=user)
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user info"""
    
    username_field = 'email'  # Allow login with email
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['role'] = user.role
        token['subscription'] = user.subscription
        token['is_verified'] = user.is_verified
        token['is_admin'] = user.is_admin_user
        
        return token
    
    def validate(self, attrs):
        """Custom validation to allow email login"""
        # The custom EmailBackend will handle email authentication
        # Just call the parent validate which will use our custom backend
        return super().validate(attrs)


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile data"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    has_active_subscription = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'phone_number', 'role', 'subscription', 'subscription_expires_at',
            'bio', 'profile_image', 'location', 'website',
            'instagram_url', 'twitter_url', 'facebook_url', 'youtube_url', 'spotify_url',
            'is_verified', 'is_artist_verified', 'has_active_subscription',
            'created_at', 'updated_at', 'last_login'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at', 'last_login', 'is_verified', 
            'is_artist_verified', 'subscription', 'subscription_expires_at'
        ]


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile preferences"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'user', 'email_notifications', 'marketing_emails', 'push_notifications',
            'release_updates', 'profile_visible', 'show_email', 'show_phone', 
            'data_sharing', 'preferred_currency', 'timezone', 'language',
            'total_releases', 'total_streams', 'total_revenue',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'total_releases', 'total_streams', 'total_revenue', 
            'created_at', 'updated_at'
        ]


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for password change"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New password confirmation doesn't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    # Treat social fields as plain char fields so we can normalize before URL validation
    website = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    instagram_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    twitter_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    facebook_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    youtube_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    spotify_url = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    profile_image = serializers.ImageField(required=False, allow_null=True, use_url=True)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'bio', 
            'profile_image', 'location', 'website',
            'instagram_url', 'twitter_url', 'facebook_url', 
            'youtube_url', 'spotify_url'
        ]
    
    def validate_email(self, value):
        """Prevent email changes for now"""
        if self.instance and self.instance.email != value:
            raise serializers.ValidationError("Email cannot be changed")
        return value

    def validate(self, attrs):
        """Normalize social / website URLs so users can paste handles or urls without scheme.

        If a value is provided without an http(s) scheme, prefix with 'https://' so
        DRF/Django URLField validation accepts it and stored URLs are normalized.
        """
        url_fields = [
            'website', 'instagram_url', 'twitter_url', 'facebook_url',
            'youtube_url', 'spotify_url'
        ]

        from django.core.validators import URLValidator
        from django.core.exceptions import ValidationError as DjangoValidationError

        validator = URLValidator()

        for field in url_fields:
            val = attrs.get(field)
            if val in (None, ''):
                # allow clearing the field
                continue

            if isinstance(val, str):
                v = val.strip()
                original = v
                if v.startswith('@'):
                    handle = v[1:]
                    # Map handles to common platform domains
                    if field == 'twitter_url':
                        v = f'https://twitter.com/{handle}'
                    elif field == 'instagram_url':
                        v = f'https://instagram.com/{handle}'
                    elif field == 'facebook_url':
                        v = f'https://facebook.com/{handle}'
                    elif field == 'youtube_url':
                        v = f'https://youtube.com/{handle}'
                    elif field == 'spotify_url':
                        v = f'https://open.spotify.com/{handle}'
                    else:
                        v = f'https://{handle}'
                elif not v.lower().startswith(('http://', 'https://')):
                    v = 'https://' + v
                # Validate the normalized URL
                try:
                    validator(v)
                except DjangoValidationError:
                    raise serializers.ValidationError({field: 'Enter a valid URL.'})
                attrs[field] = v

        return attrs
