"""
Management command to populate music genres
"""
from django.core.management.base import BaseCommand
from src.apps.songs.models import Genre


class Command(BaseCommand):
    help = 'Populate music genres in the database'

    def handle(self, *args, **options):
        genres_data = [
            {'name': 'Pop', 'description': 'Popular music with catchy melodies'},
            {'name': 'Hip Hop', 'description': 'Rap and urban music'},
            {'name': 'R&B', 'description': 'Rhythm and Blues'},
            {'name': 'Afrobeats', 'description': 'African popular music'},
            {'name': 'Afro Pop', 'description': 'African popular music fusion'},
            {'name': 'Amapiano', 'description': 'South African house music'},
            {'name': 'Highlife', 'description': 'West African music genre'},
            {'name': 'Reggae', 'description': 'Jamaican music with offbeat rhythm'},
            {'name': 'Dancehall', 'description': 'Jamaican popular music'},
            {'name': 'Rock', 'description': 'Rock and roll music'},
            {'name': 'Electronic', 'description': 'Electronic dance music'},
            {'name': 'House', 'description': 'Electronic dance music'},
            {'name': 'Jazz', 'description': 'Jazz music'},
            {'name': 'Blues', 'description': 'Blues music'},
            {'name': 'Classical', 'description': 'Classical music'},
            {'name': 'Country', 'description': 'Country music'},
            {'name': 'Gospel', 'description': 'Christian gospel music'},
            {'name': 'Soul', 'description': 'Soul music'},
            {'name': 'Funk', 'description': 'Funk music'},
            {'name': 'Reggaeton', 'description': 'Latin urban music'},
            {'name': 'Latin', 'description': 'Latin music'},
            {'name': 'World', 'description': 'World music'},
        ]

        created_count = 0
        updated_count = 0

        for genre_data in genres_data:
            genre, created = Genre.objects.get_or_create(
                name=genre_data['name'],
                defaults={'description': genre_data['description']}
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created genre: {genre.name}')
                )
            else:
                # Update description if it changed
                if genre.description != genre_data['description']:
                    genre.description = genre_data['description']
                    genre.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'⟳ Updated genre: {genre.name}')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Complete! Created {created_count} genres, updated {updated_count} genres.'
            )
        )
        
        total = Genre.objects.count()
        self.stdout.write(
            self.style.SUCCESS(f'📊 Total genres in database: {total}')
        )
