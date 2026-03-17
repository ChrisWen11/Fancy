from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery = Celery(
    "polsia",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

# Schedule daily agent cycles for all active companies
celery.conf.beat_schedule = {
    "run-daily-cycles": {
        "task": "app.tasks.celery_tasks.run_all_daily_cycles",
        "schedule": crontab(hour=6, minute=0),  # Run at 6 AM UTC daily
    },
}
