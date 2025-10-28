# Email Notification Setup Guide

This guide explains how to configure and use the email notification system in FOLIO LMS.

## Overview

The FOLIO LMS email notification system uses:
- **Celery** for asynchronous task processing
- **Redis** as the message broker
- **SMTP** for sending emails
- **Jinja2** for email templates
- **Flower** for monitoring Celery tasks

## Features

### Transactional Emails (Event-Based)
- **Welcome Email**: Sent when a new user account is created
- **Checkout Receipt**: Sent when items are checked out
- **Check-in Confirmation**: Sent when items are returned
- **Hold Available**: Sent when a requested item becomes available
- **Overdue Notice**: Sent for individual overdue items

### Scheduled Notifications (Celery Beat)
- **Daily Overdue Notifications**: Runs at 9:00 AM daily
- **Hold Available Notifications**: Runs every 4 hours
- **Due Soon Reminders**: Sends reminders for items due in 2 days
- **Cleanup Old Notifications**: Runs weekly on Sunday at midnight

## Configuration

### 1. SMTP Settings

Copy `.env.example` to `.env` and configure SMTP settings:

```bash
# Email/SMTP Configuration
SMTP_HOST=smtp.gmail.com          # Your SMTP server
SMTP_PORT=587                      # Usually 587 for TLS or 465 for SSL
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password    # For Gmail, use App Password
SMTP_FROM_EMAIL=noreply@folio-lms.com
SMTP_FROM_NAME=FOLIO Library Management System
SMTP_USE_TLS=true                  # Enable TLS (recommended)
SMTP_USE_SSL=false                 # Enable SSL (alternative to TLS)
```

### 2. Gmail Configuration

If using Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account Settings → Security
   - Under "Signing in to Google", select "App passwords"
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASSWORD`

### 3. Other Email Providers

**Outlook/Office 365:**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USE_TLS=true
```

**SendGrid:**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USERNAME=apikey
SMTP_PASSWORD=<your-sendgrid-api-key>
```

**Mailgun:**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USERNAME=<your-mailgun-username>
SMTP_PASSWORD=<your-mailgun-password>
```

## Running with Docker Compose

The docker-compose.yml includes all necessary services:

```bash
# Start all services (backend, celery-worker, celery-beat, flower)
docker-compose up -d

# View logs for specific service
docker-compose logs -f celery-worker
docker-compose logs -f celery-beat

# Restart services after configuration changes
docker-compose restart celery-worker celery-beat
```

## Monitoring with Flower

Flower provides a web-based UI for monitoring Celery tasks:

1. Access Flower at: http://localhost:5555
2. View active tasks, completed tasks, and worker status
3. Monitor task success/failure rates
4. Retry failed tasks manually

## Using Email Tasks in Code

### Sending Transactional Emails

```python
from app.tasks.email_tasks import (
    send_welcome_email_task,
    send_checkout_receipt_task,
    send_hold_available_task,
    send_overdue_notice_task,
)

# Send welcome email (async via Celery)
send_welcome_email_task.delay(
    user_email="user@example.com",
    user_name="John Doe",
    username="johndoe",
    user_id="user-uuid",
    tenant_id="tenant-uuid"
)

# Send checkout receipt
send_checkout_receipt_task.delay(
    user_email="user@example.com",
    user_name="John Doe",
    user_id="user-uuid",
    tenant_id="tenant-uuid",
    items=[
        {
            'title': 'Book Title',
            'checkout_date': '2025-01-15',
            'due_date': '2025-02-15',
            'renewable': True
        }
    ]
)
```

### Email Templates

Templates are located in `app/templates/emails/`:

- `base.html` - Base template with FOLIO branding
- `welcome.html` - Welcome email for new users
- `checkout_receipt.html` - Checkout confirmation
- `hold_available.html` - Hold ready notification
- `overdue_notice.html` - Overdue items warning

To customize templates, edit the HTML files and use Jinja2 syntax for dynamic content.

## Scheduled Task Configuration

Scheduled tasks are configured in `app/core/celery_app.py`:

```python
celery_app.conf.beat_schedule = {
    'send-overdue-notifications': {
        'task': 'app.tasks.notification_tasks.send_overdue_notifications',
        'schedule': crontab(hour=9, minute=0),  # Daily at 9 AM
    },
    'send-hold-available-notifications': {
        'task': 'app.tasks.notification_tasks.send_hold_available_notifications',
        'schedule': crontab(minute=0, hour='*/4'),  # Every 4 hours
    },
    'cleanup-old-notifications': {
        'task': 'app.tasks.notification_tasks.cleanup_old_notifications',
        'schedule': crontab(hour=0, minute=0, day_of_week=0),  # Weekly Sunday midnight
    }
}
```

## Troubleshooting

### Emails Not Sending

1. **Check SMTP credentials**:
   ```bash
   docker-compose logs backend | grep SMTP
   ```

2. **Check Celery worker logs**:
   ```bash
   docker-compose logs celery-worker
   ```

3. **Test SMTP connection**:
   ```python
   # In Python shell
   import asyncio
   from app.services.email_service import get_email_service

   async def test():
       service = get_email_service()
       result = await service.send_email(
           to_email="test@example.com",
           subject="Test Email",
           html_body="<p>This is a test</p>"
       )
       print(f"Email sent: {result}")

   asyncio.run(test())
   ```

### Tasks Not Running

1. **Check Redis connection**:
   ```bash
   docker-compose exec redis redis-cli ping
   ```

2. **Check Celery worker status**:
   - Open Flower at http://localhost:5555
   - Verify workers are online and processing tasks

3. **Restart Celery services**:
   ```bash
   docker-compose restart celery-worker celery-beat
   ```

### Gmail "Less Secure Apps" Error

- Gmail no longer supports "less secure apps"
- You **must** use App Passwords (see Gmail Configuration above)
- Regular account password will not work

## Production Considerations

1. **Use a dedicated email service** (SendGrid, Mailgun, AWS SES) instead of Gmail
2. **Set rate limits** to avoid being flagged as spam
3. **Monitor email delivery** with webhook notifications
4. **Enable email tracking** for open/click rates
5. **Implement email preferences** for users to opt-out
6. **Set up proper SPF/DKIM/DMARC** DNS records
7. **Use environment variables** for all sensitive credentials
8. **Enable Celery task result backend** for better error tracking

## Next Steps

- [ ] Implement user email preferences (opt-in/opt-out)
- [ ] Add email delivery tracking and logging
- [ ] Create admin dashboard for email statistics
- [ ] Implement email templates for all notification types
- [ ] Add A/B testing for email content
- [ ] Set up email bounce handling

## References

- [Celery Documentation](https://docs.celeryq.dev/)
- [Flower Documentation](https://flower.readthedocs.io/)
- [aiosmtplib Documentation](https://aiosmtplib.readthedocs.io/)
- [Jinja2 Documentation](https://jinja.palletsprojects.com/)
