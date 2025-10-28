"""
Individual email sending tasks.

These tasks are triggered by specific events (user registration, checkout, etc.)
and send transactional emails to users.
"""

import logging
from typing import Dict, List, Optional
from uuid import UUID
from datetime import datetime

from app.core.celery_app import celery_app
from app.services.email_service import get_email_service
from app.services.websocket_service import get_websocket_service
from app.models.notification import NotificationType

logger = logging.getLogger(__name__)


@celery_app.task(name='app.tasks.email_tasks.send_welcome_email_task', bind=True, max_retries=3)
def send_welcome_email_task(self, user_email: str, user_name: str, username: str, user_id: str, tenant_id: str):
    """
    Send welcome email to newly registered user.

    Args:
        user_email: User's email address
        user_name: User's full name
        username: User's username
        user_id: User's UUID
        tenant_id: Tenant ID
    """
    try:
        email_service = get_email_service()

        # Send email
        result = email_service.send_welcome_email(
            user_email=user_email,
            user_name=user_name,
            username=username
        )

        logger.info(f"Welcome email sent to {user_email} (user_id: {user_id})")

        # Also send in-app notification via WebSocket
        try:
            import asyncio
            ws_service = get_websocket_service()

            notification_data = {
                'user_id': user_id,
                'tenant_id': tenant_id,
                'type': NotificationType.SUCCESS.value,
                'title': 'Welcome to FOLIO LMS!',
                'message': f'Welcome {user_name}! Your account has been created successfully.',
                'metadata': {'username': username}
            }

            # Run async WebSocket send in sync context
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(ws_service.send_notification_to_user(user_id, notification_data))
            loop.close()
        except Exception as ws_error:
            logger.warning(f"Failed to send WebSocket notification for welcome email: {ws_error}")

        return {'status': 'success', 'email': user_email}

    except Exception as exc:
        logger.error(f"Failed to send welcome email to {user_email}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@celery_app.task(name='app.tasks.email_tasks.send_checkout_receipt_task', bind=True, max_retries=3)
def send_checkout_receipt_task(
    self,
    user_email: str,
    user_name: str,
    user_id: str,
    tenant_id: str,
    items: List[Dict]
):
    """
    Send checkout receipt to user after checking out items.

    Args:
        user_email: User's email address
        user_name: User's full name
        user_id: User's UUID
        tenant_id: Tenant ID
        items: List of checked out items with details
    """
    try:
        email_service = get_email_service()

        # Send email
        result = email_service.send_checkout_receipt(
            user_email=user_email,
            user_name=user_name,
            items=items,
            total_items=len(items)
        )

        logger.info(f"Checkout receipt sent to {user_email} for {len(items)} item(s)")

        # Also send in-app notification
        try:
            import asyncio
            ws_service = get_websocket_service()

            item_titles = [item.get('title', 'Unknown') for item in items[:3]]
            message = f"You've checked out {len(items)} item(s): {', '.join(item_titles)}"
            if len(items) > 3:
                message += f" and {len(items) - 3} more"

            notification_data = {
                'user_id': user_id,
                'tenant_id': tenant_id,
                'type': NotificationType.CHECKOUT.value,
                'title': 'Items Checked Out',
                'message': message,
                'metadata': {'item_count': len(items), 'items': items}
            }

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(ws_service.send_notification_to_user(user_id, notification_data))
            loop.close()
        except Exception as ws_error:
            logger.warning(f"Failed to send WebSocket notification for checkout: {ws_error}")

        return {'status': 'success', 'email': user_email, 'items_count': len(items)}

    except Exception as exc:
        logger.error(f"Failed to send checkout receipt to {user_email}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@celery_app.task(name='app.tasks.email_tasks.send_checkin_confirmation_task', bind=True, max_retries=3)
def send_checkin_confirmation_task(
    self,
    user_email: str,
    user_name: str,
    user_id: str,
    tenant_id: str,
    item_title: str,
    return_date: str,
    had_fine: bool = False,
    fine_amount: Optional[float] = None
):
    """
    Send check-in confirmation to user after returning items.

    Args:
        user_email: User's email address
        user_name: User's full name
        user_id: User's UUID
        tenant_id: Tenant ID
        item_title: Title of returned item
        return_date: Return date
        had_fine: Whether there was a fine
        fine_amount: Fine amount if applicable
    """
    try:
        email_service = get_email_service()

        # Prepare email content
        subject = "Item Return Confirmation - FOLIO LMS"

        # For now, use a simple text-based email (template can be added later)
        html_body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Item Return Confirmation</h2>
            <p>Dear {user_name},</p>
            <p>Thank you for returning the following item to the library:</p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #106ba3; padding: 15px; margin: 20px 0;">
                <strong>{item_title}</strong><br>
                Return Date: {return_date}
            </div>
            {f'<p><strong>Fine Applied:</strong> ${fine_amount:.2f}</p>' if had_fine else ''}
            <p>Thank you for using our library!</p>
            <p>Best regards,<br>Your Library Team</p>
        </body>
        </html>
        """

        result = email_service.send_email(
            to_email=user_email,
            subject=subject,
            html_body=html_body
        )

        logger.info(f"Check-in confirmation sent to {user_email} for item: {item_title}")

        # Send in-app notification
        try:
            import asyncio
            ws_service = get_websocket_service()

            message = f"You've returned: {item_title}"
            if had_fine:
                message += f" (Fine: ${fine_amount:.2f})"

            notification_data = {
                'user_id': user_id,
                'tenant_id': tenant_id,
                'type': NotificationType.CHECKIN.value,
                'title': 'Item Returned',
                'message': message,
                'metadata': {
                    'item_title': item_title,
                    'return_date': return_date,
                    'had_fine': had_fine,
                    'fine_amount': fine_amount
                }
            }

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(ws_service.send_notification_to_user(user_id, notification_data))
            loop.close()
        except Exception as ws_error:
            logger.warning(f"Failed to send WebSocket notification for check-in: {ws_error}")

        return {'status': 'success', 'email': user_email}

    except Exception as exc:
        logger.error(f"Failed to send check-in confirmation to {user_email}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@celery_app.task(name='app.tasks.email_tasks.send_hold_available_task', bind=True, max_retries=3)
def send_hold_available_task(
    self,
    user_email: str,
    user_name: str,
    user_id: str,
    tenant_id: str,
    item_title: str,
    pickup_location: str,
    expiration_date: str
):
    """
    Send hold available notification to user.

    Args:
        user_email: User's email address
        user_name: User's full name
        user_id: User's UUID
        tenant_id: Tenant ID
        item_title: Title of available item
        pickup_location: Pickup location name
        expiration_date: When hold expires
    """
    try:
        email_service = get_email_service()

        # Send email
        result = email_service.send_hold_available_notice(
            user_email=user_email,
            user_name=user_name,
            item_title=item_title,
            pickup_location=pickup_location,
            expiration_date=expiration_date
        )

        logger.info(f"Hold available notice sent to {user_email} for item: {item_title}")

        # Send in-app notification
        try:
            import asyncio
            ws_service = get_websocket_service()

            notification_data = {
                'user_id': user_id,
                'tenant_id': tenant_id,
                'type': NotificationType.HOLD_AVAILABLE.value,
                'title': 'Your Hold is Ready!',
                'message': f"{item_title} is now available for pickup at {pickup_location}. Hold expires: {expiration_date}",
                'metadata': {
                    'item_title': item_title,
                    'pickup_location': pickup_location,
                    'expiration_date': expiration_date
                }
            }

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(ws_service.send_notification_to_user(user_id, notification_data))
            loop.close()
        except Exception as ws_error:
            logger.warning(f"Failed to send WebSocket notification for hold available: {ws_error}")

        return {'status': 'success', 'email': user_email}

    except Exception as exc:
        logger.error(f"Failed to send hold available notice to {user_email}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))


@celery_app.task(name='app.tasks.email_tasks.send_overdue_notice_task', bind=True, max_retries=3)
def send_overdue_notice_task(
    self,
    user_email: str,
    user_name: str,
    user_id: str,
    tenant_id: str,
    overdue_items: List[Dict]
):
    """
    Send overdue notice to user for overdue items.

    Args:
        user_email: User's email address
        user_name: User's full name
        user_id: User's UUID
        tenant_id: Tenant ID
        overdue_items: List of overdue items with details
    """
    try:
        email_service = get_email_service()

        # Send email
        result = email_service.send_overdue_notice(
            user_email=user_email,
            user_name=user_name,
            overdue_items=overdue_items,
            total_items=len(overdue_items)
        )

        logger.info(f"Overdue notice sent to {user_email} for {len(overdue_items)} item(s)")

        # Send in-app notification
        try:
            import asyncio
            ws_service = get_websocket_service()

            total_fine = sum(item.get('fine_amount', 0) for item in overdue_items)
            item_titles = [item.get('title', 'Unknown') for item in overdue_items[:2]]
            message = f"You have {len(overdue_items)} overdue item(s): {', '.join(item_titles)}"
            if len(overdue_items) > 2:
                message += f" and {len(overdue_items) - 2} more"
            if total_fine > 0:
                message += f". Total fines: ${total_fine:.2f}"

            notification_data = {
                'user_id': user_id,
                'tenant_id': tenant_id,
                'type': NotificationType.OVERDUE.value,
                'title': 'Overdue Items - Action Required',
                'message': message,
                'metadata': {
                    'overdue_count': len(overdue_items),
                    'total_fine': total_fine,
                    'items': overdue_items
                },
                'priority': 'high'
            }

            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            loop.run_until_complete(ws_service.send_notification_to_user(user_id, notification_data))
            loop.close()
        except Exception as ws_error:
            logger.warning(f"Failed to send WebSocket notification for overdue: {ws_error}")

        return {'status': 'success', 'email': user_email, 'items_count': len(overdue_items)}

    except Exception as exc:
        logger.error(f"Failed to send overdue notice to {user_email}: {exc}")
        raise self.retry(exc=exc, countdown=60 * (self.request.retries + 1))
