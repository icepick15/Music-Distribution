import os
import django
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')
django.setup()

cursor = connection.cursor()

# Check platforms table structure
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='platforms' AND column_name='id'
""")
platform_result = cursor.fetchone()
print('Platform id column:', platform_result)

# Check genres table structure
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='genres' AND column_name='id'
""")
genre_result = cursor.fetchone()
print('Genre id column:', genre_result)

# Check song_distributions table structure
cursor.execute("""
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name='song_distributions' AND column_name='id'
""")
song_dist_result = cursor.fetchone()
print('SongDistribution id column:', song_dist_result)

cursor.close()
