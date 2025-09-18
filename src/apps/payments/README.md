This module includes a Celery task for expiring subscriptions and reverting user roles.

Tasks
- expire_subscriptions: Expires yearly subscriptions whose end_date has passed and pay_per_song subscriptions with no remaining credits. Reverts user.role to 'user' when no other active subscription exists.

How to run
1. Ensure Redis (or another broker) is configured and CELERY_BROKER_URL is set in Django settings.
2. Start a Celery worker:
   celery -A music_distribution_backend worker --loglevel=info
3. Start a Celery beat scheduler (to run periodic tasks):
   celery -A music_distribution_backend beat --loglevel=info

Alternatively, use django-celery-beat to register the `expire_subscriptions` task as a PeriodicTask in the Django admin or programmatically.
