from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .album_views import AlbumViewSet, AlbumTrackViewSet

app_name = 'songs'

# Router for Album ViewSets
router = DefaultRouter()
router.register(r'albums', AlbumViewSet, basename='album')
router.register(r'album-tracks', AlbumTrackViewSet, basename='album-track')

urlpatterns = [
    # Album/EP routes (ViewSet)
    path('', include(router.urls)),
    
    # Song CRUD endpoints
    path('songs/', views.SongListCreateView.as_view(), name='song_list_create'),
    path('songs/<uuid:pk>/', views.SongDetailView.as_view(), name='song_detail'),
    
    # Song management
    path('songs/<uuid:song_id>/submit/', views.submit_for_review, name='submit_for_review'),
    path('songs/<uuid:song_id>/approve/', views.approve_song, name='approve_song'),
    path('songs/<uuid:song_id>/status/', views.update_song_status, name='update_song_status'),
    
    # Reference data
    path('genres/', views.GenreListView.as_view(), name='genre_list'),
    path('platforms/', views.PlatformListView.as_view(), name='platform_list'),
    
    # Statistics
    path('stats/', views.user_music_stats, name='user_music_stats'),
]
