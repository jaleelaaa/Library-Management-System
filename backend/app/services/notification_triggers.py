"""
Notification Triggers Service
Automatically send notifications based on system events
"""

from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
import logging

from app.models.notification import Notification, NotificationType
from app.models.user import User
from app.models.inventory import Item, ItemStatus
from app.models.circulation import Loan, LoanStatus
from app.services.email_service import EmailService
from app.tasks.email_tasks import send_notification_email

logger = logging.getLogger(__name__)


class NotificationTriggersService:
    """Service for triggering notifications based on system events"""

    def __init__(self, db: AsyncSession):
        self.db = db
        self.email_service = EmailService()

    async def notify_item_added(
        self,
        item_id: str,
        title: str,
        added_by_user_id: str,
        tenant_id: str,
        admin_emails: List[str]
    ):
        """
        Send notification when a new item is added to the system

        Args:
            item_id: ID of the new item
            title: Title of the item
            added_by_user_id: User who added the item
            tenant_id: Tenant ID
            admin_emails: List of admin email addresses
        """
        try:
            # Create notification for admins
            notification_message = f"New item added to the collection: {title}"

            # Send email to all admins
            for email in admin_emails:
                await self.email_service.send_template_email(
                    to_email=email,
                    template_name="item_added",
                    context={
                        "title": title,
                        "item_id": item_id,
                        "added_by": added_by_user_id,
                        "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M")
                    }
                )

            logger.info(f"Sent item added notifications for item {item_id}")

        except Exception as e:
            logger.error(f"Error sending item added notification: {e}")

    async def notify_item_removed(
        self,
        item_id: str,
        title: str,
        removed_by_user_id: str,
        tenant_id: str,
        admin_emails: List[str]
    ):
        """
        Send notification when an item is removed from the system

        Args:
            item_id: ID of the removed item
            title: Title of the item
            removed_by_user_id: User who removed the item
            tenant_id: Tenant ID
            admin_emails: List of admin email addresses
        """
        try:
            # Send email to all admins
            for email in admin_emails:
                await self.email_service.send_template_email(
                    to_email=email,
                    template_name="item_removed",
                    context={
                        "title": title,
                        "item_id": item_id,
                        "removed_by": removed_by_user_id,
                        "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M")
                    }
                )

            logger.info(f"Sent item removed notifications for item {item_id}")

        except Exception as e:
            logger.error(f"Error sending item removed notification: {e}")

    async def notify_item_missing(
        self,
        item_id: str,
        title: str,
        barcode: str,
        last_known_location: Optional[str],
        tenant_id: str,
        admin_emails: List[str]
    ):
        """
        Send urgent notification when an item is marked as missing

        Args:
            item_id: ID of the missing item
            title: Title of the item
            barcode: Item barcode
            last_known_location: Last known location
            tenant_id: Tenant ID
            admin_emails: List of admin email addresses
        """
        try:
            # Send urgent email to all admins
            for email in admin_emails:
                await self.email_service.send_template_email(
                    to_email=email,
                    template_name="item_missing",
                    context={
                        "title": title,
                        "item_id": item_id,
                        "barcode": barcode,
                        "location": last_known_location or "Unknown",
                        "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
                        "priority": "URGENT"
                    }
                )

            logger.info(f"Sent missing item alert for item {item_id}")

        except Exception as e:
            logger.error(f"Error sending missing item notification: {e}")

    async def notify_overdue_items(self, tenant_id: str):
        """
        Check for overdue items and send notifications

        Args:
            tenant_id: Tenant ID
        """
        try:
            # Find overdue loans
            result = await self.db.execute(
                select(Loan)
                .where(
                    and_(
                        Loan.tenant_id == tenant_id,
                        Loan.status == LoanStatus.OPEN,
                        Loan.due_date < datetime.utcnow()
                    )
                )
            )
            overdue_loans = result.scalars().all()

            for loan in overdue_loans:
                # Get user
                user_result = await self.db.execute(
                    select(User).where(User.id == loan.user_id)
                )
                user = user_result.scalar_one_or_none()

                if user and user.email:
                    days_overdue = (datetime.utcnow() - loan.due_date).days

                    await self.email_service.send_template_email(
                        to_email=user.email,
                        template_name="overdue_reminder",
                        context={
                            "user_name": f"{user.first_name} {user.last_name}",
                            "due_date": loan.due_date.strftime("%Y-%m-%d"),
                            "days_overdue": days_overdue,
                            "loan_id": str(loan.id)
                        }
                    )

                    # Create in-app notification
                    notification = Notification(
                        user_id=user.id,
                        type=NotificationType.OVERDUE,
                        title="Overdue Item",
                        message=f"You have an item that is {days_overdue} days overdue. Please return it as soon as possible.",
                        tenant_id=tenant_id,
                        priority="high",
                        entity_type="loan",
                        entity_id=loan.id
                    )
                    self.db.add(notification)

            await self.db.commit()
            logger.info(f"Sent {len(overdue_loans)} overdue notifications")

        except Exception as e:
            logger.error(f"Error sending overdue notifications: {e}")
            await self.db.rollback()

    async def notify_hold_available(
        self,
        user_id: str,
        user_email: str,
        user_name: str,
        title: str,
        pickup_location: str,
        expiry_date: datetime,
        tenant_id: str
    ):
        """
        Notify user when their hold is ready for pickup

        Args:
            user_id: User ID
            user_email: User email
            user_name: User name
            title: Item title
            pickup_location: Pickup location
            expiry_date: Hold expiration date
            tenant_id: Tenant ID
        """
        try:
            await self.email_service.send_template_email(
                to_email=user_email,
                template_name="hold_available",
                context={
                    "user_name": user_name,
                    "title": title,
                    "pickup_location": pickup_location,
                    "expiry_date": expiry_date.strftime("%Y-%m-%d"),
                    "days_to_pickup": (expiry_date - datetime.utcnow()).days
                }
            )

            # Create in-app notification
            notification = Notification(
                user_id=user_id,
                type=NotificationType.HOLD_AVAILABLE,
                title="Hold Ready for Pickup",
                message=f"'{title}' is ready for pickup at {pickup_location}. Please collect by {expiry_date.strftime('%Y-%m-%d')}.",
                tenant_id=tenant_id,
                priority="high"
            )
            self.db.add(notification)
            await self.db.commit()

            logger.info(f"Sent hold available notification to user {user_id}")

        except Exception as e:
            logger.error(f"Error sending hold available notification: {e}")
            await self.db.rollback()

    async def notify_due_soon(self, tenant_id: str, days_before: int = 3):
        """
        Notify users about items due soon

        Args:
            tenant_id: Tenant ID
            days_before: Number of days before due date to send notification
        """
        try:
            due_soon_date = datetime.utcnow() + timedelta(days=days_before)

            result = await self.db.execute(
                select(Loan)
                .where(
                    and_(
                        Loan.tenant_id == tenant_id,
                        Loan.status == LoanStatus.OPEN,
                        Loan.due_date >= datetime.utcnow(),
                        Loan.due_date <= due_soon_date
                    )
                )
            )
            due_soon_loans = result.scalars().all()

            for loan in due_soon_loans:
                user_result = await self.db.execute(
                    select(User).where(User.id == loan.user_id)
                )
                user = user_result.scalar_one_or_none()

                if user and user.email:
                    await self.email_service.send_template_email(
                        to_email=user.email,
                        template_name="due_soon_reminder",
                        context={
                            "user_name": f"{user.first_name} {user.last_name}",
                            "due_date": loan.due_date.strftime("%Y-%m-%d"),
                            "days_until_due": (loan.due_date - datetime.utcnow()).days,
                            "loan_id": str(loan.id)
                        }
                    )

            logger.info(f"Sent {len(due_soon_loans)} due soon reminders")

        except Exception as e:
            logger.error(f"Error sending due soon notifications: {e}")

    async def notify_checkout(
        self,
        user_id: str,
        user_email: str,
        user_name: str,
        title: str,
        due_date: datetime,
        barcode: str,
        tenant_id: str
    ):
        """
        Notify user when they check out an item

        Args:
            user_id: User ID
            user_email: User email
            user_name: User name
            title: Item title
            due_date: Due date
            barcode: Item barcode
            tenant_id: Tenant ID
        """
        try:
            await self.email_service.send_template_email(
                to_email=user_email,
                template_name="checkout_confirmation",
                context={
                    "user_name": user_name,
                    "title": title,
                    "barcode": barcode,
                    "checkout_date": datetime.utcnow().strftime("%Y-%m-%d"),
                    "due_date": due_date.strftime("%Y-%m-%d")
                }
            )

            # Create in-app notification
            notification = Notification(
                user_id=user_id,
                type=NotificationType.CHECKOUT,
                title="Item Checked Out",
                message=f"You have checked out '{title}'. Due date: {due_date.strftime('%Y-%m-%d')}",
                tenant_id=tenant_id
            )
            self.db.add(notification)
            await self.db.commit()

            logger.info(f"Sent checkout confirmation to user {user_id}")

        except Exception as e:
            logger.error(f"Error sending checkout notification: {e}")
            await self.db.rollback()


async def get_admin_emails(db: AsyncSession, tenant_id: str) -> List[str]:
    """
    Get all admin email addresses for a tenant

    Args:
        db: Database session
        tenant_id: Tenant ID

    Returns:
        List of admin email addresses
    """
    result = await db.execute(
        select(User.email)
        .where(
            and_(
                User.tenant_id == tenant_id,
                User.is_superuser == True,
                User.is_active == True,
                User.email.isnot(None)
            )
        )
    )
    emails = [email for (email,) in result.all() if email]
    return emails
