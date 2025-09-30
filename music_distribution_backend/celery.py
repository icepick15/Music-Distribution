import os
from celery import Celery
import logging

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'music_distribution_backend.settings')

app = Celery('music_distribution_backend')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Configure logging for Celery
logger = logging.getLogger(__name__)

@app.task(bind=True)
def debug_task(self):
    logger.info(f'Debug task executed: {self.request!r}')
    return f'Request: {self.request!r}'

# Error handling for failed tasks
@app.task(bind=True)
def handle_task_failure(self, exc, task_id, args, kwargs, traceback):
    logger.error(f'Task {task_id} failed: {exc}')
    