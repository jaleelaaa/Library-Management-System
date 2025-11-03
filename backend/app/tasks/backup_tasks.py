"""
Celery tasks for automated database backups

These tasks integrate with Celery Beat for scheduled automatic backups.

Schedule configuration (add to app/core/celery_config.py):

CELERYBEAT_SCHEDULE = {
    # Daily backup at 2 AM
    'database-backup-daily': {
        'task': 'app.tasks.backup_tasks.backup_database_daily',
        'schedule': crontab(hour=2, minute=0),
    },
    # Weekly backup on Sunday at 3 AM
    'database-backup-weekly': {
        'task': 'app.tasks.backup_tasks.backup_database_weekly',
        'schedule': crontab(hour=3, minute=0, day_of_week=0),
    },
    # Monthly backup on 1st day at 4 AM
    'database-backup-monthly': {
        'task': 'app.tasks.backup_tasks.backup_database_monthly',
        'schedule': crontab(hour=4, minute=0, day_of_month=1),
    },
}
"""

import os
import sys
from pathlib import Path

# Add scripts directory to Python path
scripts_dir = Path(__file__).parent.parent.parent / 'scripts'
sys.path.insert(0, str(scripts_dir))

from database_backup import DatabaseBackup
from app.core.celery_app import celery_app
from app.core.config import settings

import logging

logger = logging.getLogger(__name__)


def get_backup_manager() -> DatabaseBackup:
    """Create database backup manager with configuration from settings"""
    # Parse DATABASE_URL to get connection details
    db_url = settings.DATABASE_URL

    # Extract host, port, user, password, database from URL
    # Format: postgresql+asyncpg://user:password@host:port/database
    if '://' in db_url:
        _, conn_str = db_url.split('://', 1)
        if '@' in conn_str:
            auth, location = conn_str.split('@', 1)
            user, password = auth.split(':', 1)
            if '/' in location:
                host_port, database = location.split('/', 1)
                if ':' in host_port:
                    host, port = host_port.split(':', 1)
                else:
                    host, port = host_port, '5432'
            else:
                host_port = location
                database = 'folio_lms'
                if ':' in host_port:
                    host, port = host_port.split(':', 1)
                else:
                    host, port = host_port, '5432'
        else:
            # No authentication in URL
            host, port, database, user, password = 'localhost', '5432', 'folio_lms', 'folio', 'folio_password'
    else:
        # Fallback defaults
        host, port, database, user, password = 'localhost', '5432', 'folio_lms', 'folio', 'folio_password'

    return DatabaseBackup(
        backup_dir=os.getenv('BACKUP_DIR', '/var/backups/folio-lms'),
        db_host=host,
        db_port=int(port),
        db_name=database,
        db_user=user,
        db_password=password
    )


@celery_app.task(bind=True, name='app.tasks.backup_tasks.backup_database_daily')
def backup_database_daily(self):
    """
    Celery task for daily database backup

    This task runs automatically via Celery Beat schedule.
    Retention: 7 days
    """
    try:
        logger.info("Starting daily database backup task")

        backup_manager = get_backup_manager()
        success, message, backup_path = backup_manager.create_backup('daily')

        if success:
            logger.info(f"Daily backup successful: {message}")
            return {
                'status': 'success',
                'message': message,
                'backup_path': str(backup_path) if backup_path else None
            }
        else:
            logger.error(f"Daily backup failed: {message}")
            # Retry task up to 3 times with exponential backoff
            raise self.retry(exc=Exception(message), countdown=300, max_retries=3)

    except Exception as e:
        logger.error(f"Daily backup task error: {str(e)}", exc_info=True)
        return {
            'status': 'error',
            'message': str(e)
        }


@celery_app.task(bind=True, name='app.tasks.backup_tasks.backup_database_weekly')
def backup_database_weekly(self):
    """
    Celery task for weekly database backup

    This task runs automatically via Celery Beat schedule.
    Retention: 28 days (4 weeks)
    """
    try:
        logger.info("Starting weekly database backup task")

        backup_manager = get_backup_manager()
        success, message, backup_path = backup_manager.create_backup('weekly')

        if success:
            logger.info(f"Weekly backup successful: {message}")
            return {
                'status': 'success',
                'message': message,
                'backup_path': str(backup_path) if backup_path else None
            }
        else:
            logger.error(f"Weekly backup failed: {message}")
            raise self.retry(exc=Exception(message), countdown=600, max_retries=3)

    except Exception as e:
        logger.error(f"Weekly backup task error: {str(e)}", exc_info=True)
        return {
            'status': 'error',
            'message': str(e)
        }


@celery_app.task(bind=True, name='app.tasks.backup_tasks.backup_database_monthly')
def backup_database_monthly(self):
    """
    Celery task for monthly database backup

    This task runs automatically via Celery Beat schedule.
    Retention: 365 days (12 months)
    """
    try:
        logger.info("Starting monthly database backup task")

        backup_manager = get_backup_manager()
        success, message, backup_path = backup_manager.create_backup('monthly')

        if success:
            logger.info(f"Monthly backup successful: {message}")
            return {
                'status': 'success',
                'message': message,
                'backup_path': str(backup_path) if backup_path else None
            }
        else:
            logger.error(f"Monthly backup failed: {message}")
            raise self.retry(exc=Exception(message), countdown=900, max_retries=3)

    except Exception as e:
        logger.error(f"Monthly backup task error: {str(e)}", exc_info=True)
        return {
            'status': 'error',
            'message': str(e)
        }


@celery_app.task(name='app.tasks.backup_tasks.trigger_backup_now')
def trigger_backup_now(backup_type: str = 'daily'):
    """
    Manually trigger a backup

    Args:
        backup_type: Type of backup ('daily', 'weekly', or 'monthly')

    Returns:
        dict: Status and message
    """
    try:
        logger.info(f"Manual {backup_type} backup triggered")

        backup_manager = get_backup_manager()
        success, message, backup_path = backup_manager.create_backup(backup_type)

        return {
            'status': 'success' if success else 'error',
            'message': message,
            'backup_path': str(backup_path) if backup_path else None
        }

    except Exception as e:
        logger.error(f"Manual backup error: {str(e)}", exc_info=True)
        return {
            'status': 'error',
            'message': str(e)
        }


@celery_app.task(name='app.tasks.backup_tasks.list_backups')
def list_backups(backup_type: str = None):
    """
    List available backups

    Args:
        backup_type: Optional backup type filter

    Returns:
        list: Available backups
    """
    try:
        backup_manager = get_backup_manager()
        backups = backup_manager.list_backups(backup_type)
        return backups
    except Exception as e:
        logger.error(f"List backups error: {str(e)}", exc_info=True)
        return []
