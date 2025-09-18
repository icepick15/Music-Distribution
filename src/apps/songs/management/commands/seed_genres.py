from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Seed default music genres into the database (safe to run multiple times)'

    DEFAULT_GENRES = [
        ('Pop', 'Popular music spanning many styles'),
        ('Hip-Hop', 'Hip-Hop / Rap'),
        ('R&B', 'Rhythm and Blues'),
        ('Afrobeats', 'African popular music / Afrobeats'),
        ('Rock', 'Rock and related genres'),
        ('Electronic', 'Electronic / Dance music'),
        ('Jazz', 'Jazz and improvisational music'),
        ('Classical', 'Classical and orchestral music'),
    ]

    def handle(self, *args, **options):
        from src.apps.songs.models import Genre
        created = 0
        for name, desc in self.DEFAULT_GENRES:
            obj, was_created = Genre.objects.get_or_create(name=name, defaults={'description': desc})
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"Created genre: {name}"))
            else:
                self.stdout.write(f"Exists: {name}")

        total = Genre.objects.count()
        self.stdout.write(self.style.SUCCESS(f"Seeding complete. {created} created. Total genres in DB: {total}"))
