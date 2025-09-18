from django.urls import path
from . import views

app_name = 'songs'

urlpatterns = [
    # Song CRUD endpoints
    path('', views.SongListCreateView.as_view(), name='song_list_create'),
    path('<uuid:pk>/', views.SongDetailView.as_view(), name='song_detail'),
    
    # Song management
    path('<uuid:song_id>/submit/', views.submit_for_review, name='submit_for_review'),
    path('<uuid:song_id>/approve/', views.approve_song, name='approve_song'),
    path('<uuid:song_id>/status/', views.update_song_status, name='update_song_status'),
    
    # Reference data
    path('genres/', views.GenreListView.as_view(), name='genre_list'),
    path('platforms/', views.PlatformListView.as_view(), name='platform_list'),
    
    # Statistics
    path('stats/', views.user_music_stats, name='user_music_stats'),
]
