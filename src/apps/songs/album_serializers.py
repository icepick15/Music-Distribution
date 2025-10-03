"""
Album/EP Serializers
"""
from rest_framework import serializers
from .album_models import Album, AlbumTrack
from .models import Song


class AlbumSerializer(serializers.ModelSerializer):
    """Serializer for Album/EP creation and management"""
    
    artist_name = serializers.CharField(source='artist.get_full_name', read_only=True)
    is_complete = serializers.BooleanField(read_only=True)
    completion_percentage = serializers.FloatField(read_only=True)
    is_scheduled = serializers.BooleanField(read_only=True)
    days_until_release = serializers.IntegerField(read_only=True)
    tracks_count = serializers.IntegerField(source='tracks.count', read_only=True)
    
    class Meta:
        model = Album
        fields = [
            'id', 'title', 'artist', 'artist_name', 'release_type',
            'description', 'genre', 'cover_art', 'cover_url',
            'number_of_tracks', 'tracks_uploaded', 'tracks_count',
            'release_date', 'is_explicit', 'status',
            'is_complete', 'completion_percentage', 'is_scheduled', 'days_until_release',
            'created_at', 'updated_at', 'submitted_at', 'approved_at', 'distributed_at'
        ]
        read_only_fields = [
            'id', 'artist', 'tracks_uploaded', 'status',
            'created_at', 'updated_at', 'submitted_at', 'approved_at', 'distributed_at'
        ]
    
    def validate_release_date(self, value):
        """Ensure release date is not in the past"""
        from django.utils import timezone
        if value < timezone.now().date():
            raise serializers.ValidationError("Release date cannot be in the past")
        return value
    
    def validate(self, data):
        """Validate release type and number of tracks"""
        release_type = data.get('release_type')
        number_of_tracks = data.get('number_of_tracks')
        
        if release_type == 'ep' and (number_of_tracks < 3 or number_of_tracks > 6):
            raise serializers.ValidationError({
                'number_of_tracks': 'An EP typically has 3-6 tracks'
            })
        
        if release_type == 'album' and number_of_tracks < 7:
            raise serializers.ValidationError({
                'number_of_tracks': 'An album typically has 7 or more tracks'
            })
        
        return data


class AlbumDetailSerializer(AlbumSerializer):
    """Detailed album serializer with track list"""
    
    tracks = serializers.SerializerMethodField()
    
    class Meta(AlbumSerializer.Meta):
        fields = AlbumSerializer.Meta.fields + ['tracks']
    
    def get_tracks(self, obj):
        """Get all tracks in this album"""
        album_tracks = obj.tracks.select_related('song').all()
        return [{
            'track_number': at.track_number,
            'song_id': str(at.song.id),
            'title': at.song.title,
            'duration': at.song.duration_formatted,
            'is_explicit': at.song.is_explicit,
            'status': at.song.status,
        } for at in album_tracks]


class AlbumTrackSerializer(serializers.ModelSerializer):
    """Serializer for adding tracks to an album"""
    
    song_title = serializers.CharField(source='song.title', read_only=True)
    
    class Meta:
        model = AlbumTrack
        fields = ['id', 'album', 'song', 'song_title', 'track_number', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def validate(self, data):
        """Validate track number and album capacity"""
        album = data.get('album')
        track_number = data.get('track_number')
        song = data.get('song')
        
        # Check if album has reached capacity
        if album.tracks_uploaded >= album.number_of_tracks:
            raise serializers.ValidationError({
                'album': f'Album already has maximum number of tracks ({album.number_of_tracks})'
            })
        
        # Check if track number is valid
        if track_number > album.number_of_tracks:
            raise serializers.ValidationError({
                'track_number': f'Track number cannot exceed album capacity ({album.number_of_tracks})'
            })
        
        # Check if song belongs to same artist
        if song.artist != album.artist:
            raise serializers.ValidationError({
                'song': 'Song must belong to the same artist as the album'
            })
        
        return data
