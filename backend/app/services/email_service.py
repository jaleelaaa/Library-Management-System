"""
Email Service
Send emails using SMTP with Jinja2 templates
"""

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Environment, FileSystemLoader, select_autoescape
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending templated emails"""

    def __init__(self):
        """Initialize email service with SMTP configuration"""
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USERNAME
        self.smtp_password = settings.SMTP_PASSWORD
        self.smtp_use_tls = settings.SMTP_USE_TLS
        self.smtp_use_ssl = settings.SMTP_USE_SSL
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME

        # Setup Jinja2 template environment
        template_dir = Path(__file__).parent.parent / 'templates' / 'emails'
        template_dir.mkdir(parents=True, exist_ok=True)

        self.jinja_env = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=select_autoescape(['html', 'xml'])
        )

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_body: str,
        text_body: Optional[str] = None,
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
    ) -> bool:
        """
        Send email via SMTP

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_body: HTML email body
            text_body: Plain text email body (optional)
            cc: CC recipients (optional)
            bcc: BCC recipients (optional)

        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # Create message
            message = MIMEMultipart('alternative')
            message['Subject'] = subject
            message['From'] = f"{self.from_name} <{self.from_email}>"
            message['To'] = to_email

            if cc:
                message['Cc'] = ', '.join(cc)
            if bcc:
                message['Bcc'] = ', '.join(bcc)

            # Add text and HTML parts
            if text_body:
                text_part = MIMEText(text_body, 'plain')
                message.attach(text_part)

            html_part = MIMEText(html_body, 'html')
            message.attach(html_part)

            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_username,
                password=self.smtp_password,
                start_tls=self.smtp_use_tls,
                use_tls=self.smtp_use_ssl,
            )

            logger.info(f"Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {e}")
            return False

    def render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        """
        Render email template with context

        Args:
            template_name: Template file name
            context: Template context variables

        Returns:
            Rendered HTML string
        """
        try:
            template = self.jinja_env.get_template(template_name)
            return template.render(**context)
        except Exception as e:
            logger.error(f"Failed to render template {template_name}: {e}")
            raise

    async def send_templated_email(
        self,
        to_email: str,
        subject: str,
        template_name: str,
        context: Dict[str, Any],
        cc: Optional[List[str]] = None,
        bcc: Optional[List[str]] = None,
    ) -> bool:
        """
        Send email using a template

        Args:
            to_email: Recipient email address
            subject: Email subject
            template_name: Template file name (e.g., 'overdue_notice.html')
            context: Template context variables
            cc: CC recipients (optional)
            bcc: BCC recipients (optional)

        Returns:
            True if email sent successfully, False otherwise
        """
        try:
            # Render template
            html_body = self.render_template(template_name, context)

            # Send email
            return await self.send_email(
                to_email=to_email,
                subject=subject,
                html_body=html_body,
                cc=cc,
                bcc=bcc,
            )

        except Exception as e:
            logger.error(f"Failed to send templated email to {to_email}: {e}")
            return False

    async def send_overdue_notice(
        self,
        user_email: str,
        user_name: str,
        overdue_items: List[Dict[str, Any]]
    ) -> bool:
        """Send overdue notice email"""
        context = {
            'user_name': user_name,
            'overdue_items': overdue_items,
            'total_items': len(overdue_items),
        }

        return await self.send_templated_email(
            to_email=user_email,
            subject=f"Library Notice: {len(overdue_items)} Overdue Item(s)",
            template_name='overdue_notice.html',
            context=context,
        )

    async def send_hold_available_notice(
        self,
        user_email: str,
        user_name: str,
        item_title: str,
        pickup_location: str,
        expiration_date: str,
    ) -> bool:
        """Send hold available notice email"""
        context = {
            'user_name': user_name,
            'item_title': item_title,
            'pickup_location': pickup_location,
            'expiration_date': expiration_date,
        }

        return await self.send_templated_email(
            to_email=user_email,
            subject="Library Notice: Your Hold is Available",
            template_name='hold_available.html',
            context=context,
        )

    async def send_checkout_receipt(
        self,
        user_email: str,
        user_name: str,
        items: List[Dict[str, Any]],
    ) -> bool:
        """Send checkout receipt email"""
        context = {
            'user_name': user_name,
            'items': items,
            'total_items': len(items),
        }

        return await self.send_templated_email(
            to_email=user_email,
            subject=f"Library Receipt: {len(items)} Item(s) Checked Out",
            template_name='checkout_receipt.html',
            context=context,
        )

    async def send_welcome_email(
        self,
        user_email: str,
        user_name: str,
        username: str,
    ) -> bool:
        """Send welcome email to new users"""
        context = {
            'user_name': user_name,
            'username': username,
        }

        return await self.send_templated_email(
            to_email=user_email,
            subject="Welcome to FOLIO LMS",
            template_name='welcome.html',
            context=context,
        )


# Singleton instance
_email_service: Optional[EmailService] = None


def get_email_service() -> EmailService:
    """Get or create email service singleton"""
    global _email_service

    if _email_service is None:
        _email_service = EmailService()

    return _email_service
