"""
Scheduled notification tasks.

These tasks run on a schedule (via Celery Beat) to send batch notifications
to users about overdue items, available holds, etc.
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import joinedload

from app.core.celery_app import celery_app
from app.db.session import get_session
from app.models.circulation import Loan, LoanStatus, Request as Hold, RequestStatus as HoldStatus
from app.models.user import User
from app.models.inventory import Instance, Item
from app.models.notification import Notification
from app.tasks.email_tasks import (
    send_overdue_notice_task,
    send_hold_available_task
)

logger = logging.getLogger(__name__)


@celery_app.task(name='app.tasks.notification_tasks.send_overdue_notifications')
def send_overdue_notifications():
    """
    Scheduled task to send overdue notifications to users.

    Runs daily at 9 AM to check for overdue items and send notifications.
    """
    try:
        logger.info("Starting overdue notifications task")

        # Get database session
        session = next(get_session())

        try:
            # Query for all overdue loans
            today = datetime.utcnow().date()

            stmt = (
                select(Loan)
                .where(
                    and_(
                        Loan.status == LoanStatus.CHECKED_OUT,
                        Loan.due_date < today
                    )
                )
                .options(
                    joinedload(Loan.user),
                    joinedload(Loan.item).joinedload(Item.instance)
                )
            )

            overdue_loans = session.execute(stmt).scalars().all()

            logger.info(f"Found {len(overdue_loans)} overdue loan(s)")

            # Group loans by user
            user_overdue_items: Dict[str, List[Dict]] = {}

            for loan in overdue_loans:
                user_id = str(loan.user_id)

                if user_id not in user_overdue_items:
                    user_overdue_items[user_id] = {
                        'user': loan.user,
                        'items': []
                    }

                # Calculate days overdue
                days_overdue = (today - loan.due_date).days

                # Calculate fine (e.g., $0.25 per day)
                fine_amount = days_overdue * 0.25

                item_data = {
                    'title': loan.item.instance.title if loan.item and loan.item.instance else 'Unknown',
                    'due_date': loan.due_date.strftime('%Y-%m-%d'),
                    'days_overdue': days_overdue,
                    'fine_amount': fine_amount
                }

                user_overdue_items[user_id]['items'].append(item_data)

            # Send notifications to each user
            notifications_sent = 0

            for user_id, data in user_overdue_items.items():
                user = data['user']
                items = data['items']

                try:
                    # Send email via Celery task (async)
                    send_overdue_notice_task.delay(
                        user_email=user.email,
                        user_name=user.full_name or user.username,
                        user_id=str(user.id),
                        tenant_id=str(user.tenant_id),
                        overdue_items=items
                    )

                    notifications_sent += 1

                except Exception as e:
                    logger.error(f"Failed to send overdue notice to user {user_id}: {e}")

            logger.info(f"Overdue notifications task completed. Sent {notifications_sent} notification(s)")

            return {
                'status': 'success',
                'overdue_loans': len(overdue_loans),
                'users_notified': notifications_sent
            }

        finally:
            session.close()

    except Exception as exc:
        logger.error(f"Error in overdue notifications task: {exc}")
        raise


@celery_app.task(name='app.tasks.notification_tasks.send_hold_available_notifications')
def send_hold_available_notifications():
    """
    Scheduled task to send hold available notifications.

    Runs every 4 hours to check for newly available holds and notify users.
    """
    try:
        logger.info("Starting hold available notifications task")

        session = next(get_session())

        try:
            # Query for holds that just became available (within last 4 hours)
            # and haven't been notified yet
            four_hours_ago = datetime.utcnow() - timedelta(hours=4)

            stmt = (
                select(Hold)
                .where(
                    and_(
                        Hold.status == HoldStatus.AVAILABLE,
                        Hold.available_date >= four_hours_ago
                    )
                )
                .options(
                    joinedload(Hold.user),
                    joinedload(Hold.instance)
                )
            )

            available_holds = session.execute(stmt).scalars().all()

            logger.info(f"Found {len(available_holds)} newly available hold(s)")

            notifications_sent = 0

            for hold in available_holds:
                try:
                    # Calculate expiration date (e.g., 7 days from now)
                    expiration_date = (datetime.utcnow() + timedelta(days=7)).strftime('%Y-%m-%d')

                    # Send email via Celery task
                    send_hold_available_task.delay(
                        user_email=hold.user.email,
                        user_name=hold.user.full_name or hold.user.username,
                        user_id=str(hold.user_id),
                        tenant_id=str(hold.tenant_id),
                        item_title=hold.instance.title if hold.instance else 'Unknown',
                        pickup_location=hold.pickup_location or 'Main Library',
                        expiration_date=expiration_date
                    )

                    notifications_sent += 1

                except Exception as e:
                    logger.error(f"Failed to send hold available notice for hold {hold.id}: {e}")

            logger.info(f"Hold available notifications task completed. Sent {notifications_sent} notification(s)")

            return {
                'status': 'success',
                'available_holds': len(available_holds),
                'notifications_sent': notifications_sent
            }

        finally:
            session.close()

    except Exception as exc:
        logger.error(f"Error in hold available notifications task: {exc}")
        raise


@celery_app.task(name='app.tasks.notification_tasks.cleanup_old_notifications')
def cleanup_old_notifications():
    """
    Scheduled task to clean up old read notifications.

    Runs weekly (Sunday midnight) to delete read notifications older than 30 days.
    """
    try:
        logger.info("Starting notification cleanup task")

        session = next(get_session())

        try:
            # Delete read notifications older than 30 days
            thirty_days_ago = datetime.utcnow() - timedelta(days=30)

            stmt = (
                select(Notification)
                .where(
                    and_(
                        Notification.is_read == True,
                        Notification.created_at < thirty_days_ago
                    )
                )
            )

            old_notifications = session.execute(stmt).scalars().all()

            count = len(old_notifications)

            # Delete notifications
            for notification in old_notifications:
                session.delete(notification)

            session.commit()

            logger.info(f"Notification cleanup task completed. Deleted {count} old notification(s)")

            return {
                'status': 'success',
                'deleted_count': count
            }

        finally:
            session.close()

    except Exception as exc:
        logger.error(f"Error in notification cleanup task: {exc}")
        session.rollback()
        raise


@celery_app.task(name='app.tasks.notification_tasks.send_due_soon_reminders')
def send_due_soon_reminders():
    """
    Scheduled task to send reminders for items due soon.

    Runs daily to notify users about items due in 2 days.
    """
    try:
        logger.info("Starting due soon reminders task")

        session = next(get_session())

        try:
            # Query for loans due in 2 days
            today = datetime.utcnow().date()
            due_date_target = today + timedelta(days=2)

            stmt = (
                select(Loan)
                .where(
                    and_(
                        Loan.status == LoanStatus.CHECKED_OUT,
                        Loan.due_date == due_date_target
                    )
                )
                .options(
                    joinedload(Loan.user),
                    joinedload(Loan.item).joinedload(Item.instance)
                )
            )

            due_soon_loans = session.execute(stmt).scalars().all()

            logger.info(f"Found {len(due_soon_loans)} loan(s) due in 2 days")

            # Group by user
            user_due_items: Dict[str, List[Dict]] = {}

            for loan in due_soon_loans:
                user_id = str(loan.user_id)

                if user_id not in user_due_items:
                    user_due_items[user_id] = {
                        'user': loan.user,
                        'items': []
                    }

                item_data = {
                    'title': loan.item.instance.title if loan.item and loan.item.instance else 'Unknown',
                    'due_date': loan.due_date.strftime('%Y-%m-%d'),
                    'renewable': loan.renewal_count < 2  # Example: allow up to 2 renewals
                }

                user_due_items[user_id]['items'].append(item_data)

            # Send reminders
            reminders_sent = 0

            for user_id, data in user_due_items.items():
                user = data['user']
                items = data['items']

                try:
                    # Send in-app notification via WebSocket
                    import asyncio
                    from app.services.websocket_service import get_websocket_service

                    ws_service = get_websocket_service()

                    item_titles = [item['title'] for item in items[:2]]
                    message = f"Reminder: {len(items)} item(s) due in 2 days: {', '.join(item_titles)}"
                    if len(items) > 2:
                        message += f" and {len(items) - 2} more"

                    notification_data = {
                        'user_id': user_id,
                        'tenant_id': str(user.tenant_id),
                        'type': 'info',
                        'title': 'Items Due Soon',
                        'message': message,
                        'metadata': {'items': items}
                    }

                    # Run async in sync context
                    loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(loop)
                    loop.run_until_complete(ws_service.send_notification_to_user(user_id, notification_data))
                    loop.close()

                    reminders_sent += 1

                except Exception as e:
                    logger.error(f"Failed to send due soon reminder to user {user_id}: {e}")

            logger.info(f"Due soon reminders task completed. Sent {reminders_sent} reminder(s)")

            return {
                'status': 'success',
                'due_soon_loans': len(due_soon_loans),
                'reminders_sent': reminders_sent
            }

        finally:
            session.close()

    except Exception as exc:
        logger.error(f"Error in due soon reminders task: {exc}")
        raise
