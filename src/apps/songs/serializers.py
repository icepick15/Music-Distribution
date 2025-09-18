from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Song, Genre, Platform, SongDistribution

User = get_user_model()


class GenreSerializer(serializers.ModelSerializer):
    """Serializer for music genres"""
    
    class Meta:
        model = Genre
        fields = ['id', 'name', 'description']


class PlatformSerializer(serializers.ModelSerializer):
    """Serializer for distribution platforms"""
    
    class Meta:
        model = Platform
        fields = ['id', 'name', 'logo', 'is_active', 'revenue_share']


class SongDistributionSerializer(serializers.ModelSerializer):
    """Serializer for song distribution status"""
    platform = PlatformSerializer(read_only=True)
    
    class Meta:
        model = SongDistribution
        fields = [
            'id', 'platform', 'platform_song_id', 'platform_url',
            'status', 'distributed_at', 'created_at'
        ]


class SongSerializer(serializers.ModelSerializer):
    """Serializer for song listing and details"""
    artist_name = serializers.CharField(source='artist.get_full_name', read_only=True)
    genre_name = serializers.CharField(source='genre.name', read_only=True)
    duration_formatted = serializers.CharField(read_only=True)
    file_size = serializers.FloatField(read_only=True)
    distributions = SongDistributionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Song
        fields = [
            'id', 'title', 'artist', 'artist_name', 'featured_artists',
            'release_type', 'album_title', 'track_number',
            'audio_file', 'cover_image', 'genre', 'genre_name', 'subgenre',
            'audio_url', 'cover_url',
            'duration', 'duration_formatted', 'file_size',
            'composer', 'publisher', 'isrc_code',
            'price', 'is_explicit', 'release_date',
            'status', 'total_streams', 'total_downloads', 'total_revenue',
            'created_at', 'updated_at', 'submitted_at', 'approved_at', 'distributed_at',
            'distributions'
        ]
        read_only_fields = [
            'artist', 'total_streams', 'total_downloads', 'total_revenue',
            'submitted_at', 'approved_at', 'distributed_at'
        ]


class SongUploadSerializer(serializers.ModelSerializer):
    """Serializer for song upload"""
    genre = serializers.PrimaryKeyRelatedField(queryset=Genre.objects.all(), required=False, allow_null=True)
    
    class Meta:
        model = Song
        fields = [
            'id', 'title', 'featured_artists', 'release_type', 'album_title', 'track_number',
            'audio_file', 'cover_image', 'genre', 'subgenre',
            'audio_url', 'cover_url',
            'composer', 'publisher', 'price', 'is_explicit', 'release_date'
        ]
        read_only_fields = ['id']
    
    def validate_audio_file(self, value):
        """Validate audio file format and size"""
        # Allow audio_url to provide the file instead of direct upload
        request = self.context.get('request')
        if not value and request and request.data.get('audio_url'):
            return value
        if not value:
            raise serializers.ValidationError("Audio file is required (or provide audio_url)")
        
        # Check file extension
        allowed_extensions = ['.mp3', '.wav', '.flac', '.m4a']
        ext = value.name.lower().split('.')[-1]
        if f'.{ext}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported audio format. Allowed formats: {', '.join(allowed_extensions)}"
            )
        
        # Check file size (max 100MB)
        max_size = 100 * 1024 * 1024  # 100MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"Audio file too large. Maximum size is 100MB, got {value.size / (1024 * 1024):.1f}MB"
            )
        
        return value
    
    def validate_cover_image(self, value):
        """Validate cover image format and dimensions"""
        request = self.context.get('request')
        if not value and request and request.data.get('cover_url'):
            return value
        if not value:
            raise serializers.ValidationError("Cover image is required (or provide cover_url)")
        
        # Check file extension
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.webp']
        ext = value.name.lower().split('.')[-1]
        if f'.{ext}' not in allowed_extensions:
            raise serializers.ValidationError(
                f"Unsupported image format. Allowed formats: {', '.join(allowed_extensions)}"
            )
        
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"Cover image too large. Maximum size is 10MB, got {value.size / (1024 * 1024):.1f}MB"
            )
        
        return value
    
    def create(self, validated_data):
        """Create song with current user as artist"""
        validated_data['artist'] = self.context['request'].user
        validated_data['status'] = 'draft'
        return super().create(validated_data)


class SongUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating song metadata"""
    
    class Meta:
        model = Song
        fields = [
            'title', 'featured_artists', 'release_type', 'album_title', 'track_number',
            'genre', 'subgenre', 'composer', 'publisher', 'price', 'is_explicit', 'release_date'
        ]
    
    def update(self, instance, validated_data):
        """Update song metadata"""
        # Don't allow updates if song is already distributed
        if instance.status == 'distributed':
            raise serializers.ValidationError(
                "Cannot update song metadata after distribution"
            )
        
        return super().update(instance, validated_data)
