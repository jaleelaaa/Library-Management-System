"""
Celery tasks for asynchronous background processing.

This package contains task modules for:
- Email sending (email_tasks)
- Scheduled notifications (notification_tasks)
"""

from app.tasks.email_tasks import (
    send_welcome_email_task,
    send_checkout_receipt_task,
    send_checkin_confirmation_task,
    send_hold_available_task,
    send_overdue_notice_task,
)

from app.tasks.notification_tasks import (
    send_overdue_notifications,
    send_hold_available_notifications,
    cleanup_old_notifications,
)

__all__ = [
    # Email tasks
    'send_welcome_email_task',
    'send_checkout_receipt_task',
    'send_checkin_confirmation_task',
    'send_hold_available_task',
    'send_overdue_notice_task',
    # Scheduled notification tasks
    'send_overdue_notifications',
    'send_hold_available_notifications',
    'cleanup_old_notifications',
]
