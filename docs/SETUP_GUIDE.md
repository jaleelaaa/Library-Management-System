# FOLIO LMS Setup Guide
Royal Family Library Management System - Complete Installation Guide

## Quick Start with Docker Compose (Recommended)

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker + Docker Compose (Linux)
- 4GB+ RAM available for containers
- 10GB+ disk space

### Steps

1. **Clone/Navigate to project:**
```bash
cd E:\Folio\folio-lms
```

2. **Configure environment variables (optional):**
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. **Start all services:**
```bash
docker-compose up -d
```

4. **Wait for services to initialize** (2-3 minutes):
```bash
# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
```

5. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- Elasticsearch: http://localhost:9200

6. **Default login credentials:**
- Username: `admin`
- Password: `Admin@123`

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (reset database)
docker-compose down -v
```

---

## Manual Setup (Development)

### Backend Setup

#### Prerequisites
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Elasticsearch 8+ (optional, for search)

#### Steps

1. **Create virtual environment:**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

**Note:** Includes new dependencies for Royal Family Library features:
- `Pillow` - Barcode and QR code image generation
- `qrcode[pil]` - QR code generation for artifacts
- `aiosmtplib` - Email notification system

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Set up PostgreSQL database:**
```sql
CREATE DATABASE folio_lms;
CREATE USER folio WITH PASSWORD 'folio_password';
GRANT ALL PRIVILEGES ON DATABASE folio_lms TO folio;
```

5. **Run migrations:**
```bash
alembic upgrade head
```

6. **Initialize database with seed data:**
```bash
python -m app.db.init_db
```

7. **Run development server:**
```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

#### Prerequisites
- Node.js 18+
- npm or yarn

#### Steps

1. **Navigate to frontend:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env if needed
```

4. **Run development server:**
```bash
npm run dev
```

Frontend will be available at http://localhost:3000

---

## Multi-Tenancy Setup

See [MULTI_TENANCY.md](./MULTI_TENANCY.md) for detailed multi-tenant configuration.

---

## Royal Family Library Features Configuration

### Email Notification System

The system includes automated email notifications for patrons and administrators.

#### SMTP Configuration

Edit `backend/.env` and add the following SMTP settings:

```ini
# Email Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=library@royalfamily.sa
SMTP_PASSWORD=your_app_password_here
SMTP_FROM=Royal Family Library <library@royalfamily.sa>
SMTP_USE_TLS=true

# Administrator Emails (comma-separated)
ADMIN_EMAILS=admin1@royalfamily.sa,admin2@royalfamily.sa
```

#### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account → Security → 2-Step Verification → App Passwords
   - Generate password for "Mail" application
   - Use this password as `SMTP_PASSWORD`

3. **Gmail Settings:**
```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=generated_app_password
```

#### Microsoft 365 / Outlook Setup

```ini
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=library@yourdomain.com
SMTP_PASSWORD=your_password
```

#### Email Templates

Email templates are located in `backend/app/templates/emails/`:
- `checkout_confirmation.html` - Checkout receipt
- `overdue_reminder.html` - Overdue item notifications
- `item_missing.html` - URGENT missing artifact alerts
- `item_added.html` - New item catalogued notifications
- `hold_available.html` - Hold ready for pickup
- `welcome.html` - New user welcome email

Templates use Jinja2 syntax and can be customized with your branding.

#### Testing Email Configuration

```bash
# Start Python shell
python

# Test SMTP connection
from app.services.email_service import EmailService
import asyncio

async def test_email():
    service = EmailService()
    await service.send_email(
        to="test@example.com",
        subject="Test Email",
        html_content="<p>Test message from FOLIO LMS</p>"
    )

asyncio.run(test_email())
```

#### Automated Notification Triggers

The system automatically sends emails for:

**Patron Notifications:**
- ✅ Checkout confirmation
- ✅ Due soon reminder (3 days before)
- ✅ Overdue notices (daily)
- ✅ Hold available alerts
- ✅ Fine notices

**Administrator Notifications:**
- ✅ Item added to collection
- ✅ Item removed from catalog
- ✅ **URGENT:** Missing artifact alerts
- ✅ Daily overdue summary

See [EMAIL_SETUP.md](../backend/EMAIL_SETUP.md) for detailed email configuration.

---

### Barcode Generation System

The system includes automatic barcode generation for all library items.

#### Features

- **Code128 Format:** Linear barcodes for traditional scanning
- **QR Code Format:** 2D barcodes with embedded item URLs
- **Label Printing:** Avery 5160 format (30 labels per sheet)
- **Bulk Generation:** Generate labels for multiple items at once
- **USB Scanner Support:** Plug-and-play compatibility

#### Barcode API Endpoints

```bash
# Generate unique barcode
POST /api/v1/barcode/generate
{
  "prefix": "ITM"
}

# Validate barcode
GET /api/v1/barcode/validate/ITM1A2B3C4D5E6F

# Scan barcode (instant item lookup)
GET /api/v1/barcode/scan/ITM1A2B3C4D5E6F

# Generate label
POST /api/v1/barcode/label
{
  "barcode": "ITM123",
  "title": "Ancient Manuscript",
  "location": "Archive - Shelf A3",
  "format": "code128"
}

# Bulk labels
POST /api/v1/barcode/labels/bulk
{
  "item_ids": ["uuid1", "uuid2", "uuid3"],
  "format": "code128"
}
```

#### Label Printer Setup

1. **Purchase Compatible Labels:**
   - Avery 5160 (1" × 2.625")
   - Or equivalent generic labels

2. **Connect USB Barcode Scanner:**
   - Plug in keyboard wedge scanner
   - No additional software required
   - Scanner types as if it's a keyboard

3. **Print Labels:**
   - Generate label sheet via API or UI
   - Download PNG image
   - Print to laser/inkjet printer with label sheets

---

### Progressive Web App (PWA) Configuration

The system is installable as a mobile/desktop app.

#### PWA Files

- `frontend/public/manifest.json` - App metadata
- `frontend/public/service-worker.js` - Offline caching
- `frontend/public/icons/` - App icons (192×192, 512×512)

#### Verify PWA Configuration

1. **Build Frontend:**
```bash
cd frontend
npm run build
```

2. **Test PWA:**
   - Open in Chrome/Edge
   - Open DevTools → Application → Manifest
   - Verify manifest loads correctly
   - Check Service Worker registration

3. **Lighthouse Audit:**
```bash
# Install Lighthouse
npm install -g lighthouse

# Run PWA audit
lighthouse http://localhost:3000 --view
```

**Target Scores:**
- Progressive Web App: 100
- Performance: 90+
- Accessibility: 90+

#### Install PWA

**iOS (iPhone/iPad):**
1. Open Safari → Navigate to FOLIO LMS
2. Tap Share → "Add to Home Screen"

**Android:**
1. Open Chrome → Navigate to FOLIO LMS
2. Tap "Install" banner or Menu → "Install app"

**Desktop (Windows/Mac/Linux):**
1. Open Chrome/Edge → Navigate to FOLIO LMS
2. Click install icon in address bar

---

## Troubleshooting

### Database Connection Issues

**Problem:** Backend can't connect to database

**Solutions:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists and user has permissions

### Frontend API Connection

**Problem:** Frontend can't reach backend API

**Solutions:**
- Verify backend is running on port 8000
- Check VITE_API_URL in frontend/.env
- Check browser console for CORS errors

### Docker Issues

**Problem:** Containers fail to start

**Solutions:**
```bash
# Check logs
docker-compose logs

# Rebuild containers
docker-compose build --no-cache

# Reset everything
docker-compose down -v
docker-compose up -d --build
```

### Email Notification Issues

**Problem:** Emails not sending

**Solutions:**
1. **Verify SMTP Settings:**
   ```bash
   # Check .env file
   cat backend/.env | grep SMTP
   ```

2. **Test SMTP Connection:**
   ```python
   # In Python shell
   from app.services.email_service import EmailService
   import asyncio

   async def test():
       service = EmailService()
       result = await service.send_email(
           to="your-email@example.com",
           subject="Test",
           html_content="<p>Test</p>"
       )
       print(f"Email sent: {result}")

   asyncio.run(test())
   ```

3. **Common Issues:**
   - Gmail: Use App Password, not regular password
   - Microsoft 365: Ensure account has SMTP enabled
   - Firewall: Check port 587 or 465 is not blocked
   - TLS: Verify `SMTP_USE_TLS=true` for port 587

**Problem:** Missing item alerts not received

**Solution:**
- Verify `ADMIN_EMAILS` in .env contains correct addresses
- Check spam/junk folder
- Review backend logs: `docker-compose logs backend | grep email`

### Barcode Generation Issues

**Problem:** Barcode images not generating

**Solutions:**
1. **Verify Dependencies:**
   ```bash
   pip list | grep -i pillow
   pip list | grep -i qrcode
   ```

2. **Reinstall Image Libraries:**
   ```bash
   pip uninstall Pillow qrcode
   pip install Pillow==10.2.0 qrcode[pil]==7.4.2
   ```

3. **Check File Permissions:**
   - Ensure temp directory is writable
   - On Linux: `chmod 755 /tmp`

**Problem:** Barcode scanner not working

**Solutions:**
1. **USB Scanner (Keyboard Wedge):**
   - Verify scanner is in keyboard wedge mode
   - Test scanner in Notepad/TextEdit (should type barcode)
   - No driver installation needed
   - Focus must be in barcode input field

2. **Scanner Configuration:**
   - Configure scanner to add "Enter" after scan
   - Set scanner to output barcode without prefix/suffix
   - Check scanner manual for configuration barcodes

**Problem:** Label printing issues

**Solutions:**
- Use Avery 5160 or exact equivalent labels
- Set printer to 100% scale (no fit-to-page)
- Print PNG at actual size, not scaled
- Use laser printer for best results (inkjet may smudge)

### PWA Installation Issues

**Problem:** "Install" button not showing

**Solutions:**
1. **Requirements:**
   - Must use HTTPS (or localhost for testing)
   - Must use supported browser (Chrome, Edge, Safari)
   - Service worker must register successfully

2. **Check PWA Criteria:**
   ```bash
   # Run Lighthouse audit
   lighthouse http://localhost:3000 --view
   ```

3. **Verify Manifest:**
   - Open DevTools → Application → Manifest
   - Check for errors in manifest.json
   - Verify icons exist and load correctly

4. **Service Worker:**
   - Open DevTools → Application → Service Workers
   - Check if SW is registered and activated
   - Clear cache if needed

**Problem:** PWA not working offline

**Solutions:**
- Check service worker is active
- Clear browser cache and reinstall PWA
- Verify service-worker.js is caching correct resources
- Check Console for service worker errors

---

## Testing

### Backend Tests
```bash
cd backend
pytest
pytest --cov=app tests/
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## Production Deployment

### Security Checklist
- [ ] Change SECRET_KEY in backend/.env (minimum 32 characters)
- [ ] Update database credentials
- [ ] Configure SMTP credentials for email notifications
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure firewall rules (allow ports 443, 80 only)
- [ ] Set DEBUG=false in all .env files
- [ ] Review CORS settings (whitelist only your domains)
- [ ] Set up automated daily database backups
- [ ] Disable PostgreSQL remote access (use SSH tunnel)
- [ ] Configure admin email addresses for alerts
- [ ] Set strong passwords for all default accounts
- [ ] Enable rate limiting for API endpoints
- [ ] Review and test email notification templates

### Environment Variables for Production

**Backend (.env):**
```ini
# Application
DEBUG=false
ENVIRONMENT=production
SECRET_KEY=<generate-strong-secret-key-minimum-32-characters>

# Database
DATABASE_URL=postgresql+asyncpg://user:pass@prod-db:5432/folio_lms

# Redis
REDIS_URL=redis://prod-redis:6379/0

# CORS
BACKEND_CORS_ORIGINS=https://library.royalfamily.sa

# Security
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email Notifications (REQUIRED for Royal Family features)
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USERNAME=library@royalfamily.sa
SMTP_PASSWORD=<your-smtp-password>
SMTP_FROM=Royal Family Library <library@royalfamily.sa>
SMTP_USE_TLS=true
ADMIN_EMAILS=admin1@royalfamily.sa,admin2@royalfamily.sa

# Search (optional)
ELASTICSEARCH_URL=http://prod-elasticsearch:9200

# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
UPLOAD_DIR=/app/uploads

# Logging
LOG_LEVEL=INFO
```

**Frontend (.env):**
```ini
VITE_API_URL=https://api.library.royalfamily.sa
VITE_APP_NAME=FOLIO Library Management System
VITE_ENVIRONMENT=production
```

---

## Next Steps

1. **Review Documentation:**
   - [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and architecture
   - [MULTI_TENANCY.md](./MULTI_TENANCY.md) - Multi-tenant configuration
   - [EMAIL_SETUP.md](../backend/EMAIL_SETUP.md) - Email notification setup
   - [User Manual](../FOLIO_LMS_USER_MANUAL.html) - Complete user guide

2. **Configure Royal Family Features:**
   - Set up SMTP email notifications
   - Test barcode generation and scanning
   - Install PWA on staff devices
   - Configure admin email addresses

3. **API Documentation:**
   - Explore interactive API docs at http://localhost:8000/docs
   - Test barcode endpoints: `/api/v1/barcode/*`
   - Review email notification triggers

4. **Initial Setup:**
   - Check seed data in `/backend/seed_data/` directory
   - Create patron groups and loan policies
   - Set up library locations and campuses
   - Configure circulation rules

5. **Testing:**
   - Run backend tests: `pytest`
   - Run frontend tests: `npm test`
   - Test email notifications
   - Test barcode scanner with USB device
   - Verify PWA installation on mobile devices

6. **Production Readiness:**
   - Complete security checklist
   - Configure production environment variables
   - Set up HTTPS and SSL certificates
   - Configure automated backups
   - Test disaster recovery procedures

## Support & Resources

- **User Manual:** Open `FOLIO_LMS_USER_MANUAL.html` in browser
- **Compliance Report:** See `100_PERCENT_COMPLIANCE_TEST_REPORT.md`
- **API Docs:** http://localhost:8000/docs (when running)
- **Email Templates:** `backend/app/templates/emails/`
- **Barcode Service:** `backend/app/services/barcode_service.py`

---

**🎉 Congratulations!** Your FOLIO Library Management System for the Royal Family Library is now set up and ready to use.

**✅ 100% Compliant** with all Royal Family Library requirements including:
- Barcode generation (Code128 & QR codes)
- Email notifications (patron & admin alerts)
- Mobile app (PWA for iOS/Android/Desktop)
- Label printing (Avery 5160 format)
- Audit logging and preservation tracking
