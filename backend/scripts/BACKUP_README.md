# Database Backup System for FOLIO LMS

## Overview

This backup system provides comprehensive, automated database backups for the FOLIO Library Management System, suitable for ministry-level production deployment.

## Features

- ✅ **Automated Scheduled Backups** (via Celery Beat)
- ✅ **Three-Tier Retention Policy** (Daily, Weekly, Monthly)
- ✅ **Automatic Compression** (gzip)
- ✅ **Backup Verification** (integrity checks)
- ✅ **Rotation & Cleanup** (automatic deletion of old backups)
- ✅ **Manual Backup Triggers**
- ✅ **Restore Procedures**
- ✅ **Logging & Monitoring**

## Backup Schedule

| Type | Schedule | Retention | Purpose |
|------|----------|-----------|---------|
| **Daily** | 2:00 AM | 7 days | Regular backups |
| **Weekly** | Sunday 3:00 AM | 28 days (4 weeks) | Weekly snapshots |
| **Monthly** | 1st day 4:00 AM | 365 days (12 months) | Long-term archival |

## Architecture

### Components

1. **Shell Scripts** (`backup_database.sh`, `restore_database.sh`)
   - Standalone bash scripts for manual execution
   - Can be used independently or via cron

2. **Python Module** (`database_backup.py`)
   - Object-oriented backup manager
   - Can be imported and used programmatically
   - CLI interface for manual operations

3. **Celery Tasks** (`app/tasks/backup_tasks.py`)
   - Integration with Celery Beat for automation
   - Retry logic and error handling
   - Monitoring via Flower dashboard

## Installation & Setup

### 1. Prerequisites

**System Requirements:**
- PostgreSQL client tools (pg_dump, pg_restore, psql)
- Python 3.11+
- Sufficient disk space (recommend 3x database size)

**Install PostgreSQL Client Tools:**

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

### 2. Directory Setup

Create backup directories:

```bash
# Linux/macOS
sudo mkdir -p /var/backups/folio-lms/{daily,weekly,monthly,logs}
sudo chown -R your-user:your-group /var/backups/folio-lms

# Windows
mkdir C:\backups\folio-lms\daily
mkdir C:\backups\folio-lms\weekly
mkdir C:\backups\folio-lms\monthly
mkdir C:\backups\folio-lms\logs
```

### 3. Configure Environment Variables

Create `.env` file or export variables:

```bash
# Database Connection
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=folio_lms
export DB_USER=folio
export DB_PASSWORD=your_secure_password

# Backup Location
export BACKUP_DIR=/var/backups/folio-lms
```

### 4. Set Script Permissions

```bash
chmod +x backend/scripts/backup_database.sh
chmod +x backend/scripts/restore_database.sh
```

### 5. Configure Celery Beat Schedule

Add to `backend/app/core/celery_config.py`:

```python
from celery.schedules import crontab

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
```

## Usage

### Manual Backup (Shell Script)

```bash
# Daily backup
./backend/scripts/backup_database.sh daily

# Weekly backup
./backend/scripts/backup_database.sh weekly

# Monthly backup
./backend/scripts/backup_database.sh monthly
```

### Manual Backup (Python CLI)

```bash
# Change to backend directory
cd backend

# Create backup
python scripts/database_backup.py backup --type daily

# List backups
python scripts/database_backup.py list

# List specific type
python scripts/database_backup.py list --type monthly
```

### Programmatic Backup (Python)

```python
from scripts.database_backup import DatabaseBackup

# Initialize backup manager
backup_manager = DatabaseBackup(
    backup_dir="/var/backups/folio-lms",
    db_host="localhost",
    db_port=5432,
    db_name="folio_lms",
    db_user="folio",
    db_password="your_password"
)

# Create backup
success, message, backup_path = backup_manager.create_backup('daily')

if success:
    print(f"Backup successful: {backup_path}")
else:
    print(f"Backup failed: {message}")

# List available backups
backups = backup_manager.list_backups()
for backup in backups:
    print(f"{backup['filename']} - {backup['size_mb']:.2f} MB")
```

### Trigger via Celery (API/Django Admin)

```python
from app.tasks.backup_tasks import trigger_backup_now

# Trigger immediate backup
result = trigger_backup_now.delay('daily')

# Check result
print(result.get())
```

## Restore Procedures

### Restore from Backup

```bash
# List available backups first
python backend/scripts/database_backup.py list

# Restore specific backup
./backend/scripts/restore_database.sh /var/backups/folio-lms/daily/folio_lms_daily_20251103_120000.sql.gz
```

**⚠️ Warning:** Restore will DROP and RECREATE the database. Always create a safety backup before restore.

### Restore Process

The restore script automatically:
1. Creates a safety backup of current database
2. Confirms restoration (requires 'yes' input)
3. Drops all existing connections
4. Drops and recreates database
5. Restores from backup file
6. Verifies restoration

After restore, remember to:
```bash
# Restart application services
docker-compose restart backend celery-worker

# Or if running directly
systemctl restart folio-lms-backend
systemctl restart folio-lms-celery
```

## Monitoring

### Check Backup Status

```bash
# View backup logs
tail -f /var/backups/folio-lms/logs/backup_$(date +%Y%m).log

# List recent backups
ls -lh /var/backups/folio-lms/daily/

# Check backup sizes
du -sh /var/backups/folio-lms/*
```

### Celery Flower Dashboard

Monitor backup tasks via Flower:

```bash
# Access Flower at http://localhost:5555
# View scheduled tasks
# Check task history
# View task logs
```

### Verify Last Backup

```bash
# Check if backup ran today
find /var/backups/folio-lms/daily -name "*.sql.gz" -mtime -1

# Test backup integrity
gunzip -t /var/backups/folio-lms/daily/latest_backup.sql.gz
```

## Backup File Format

Backup filenames follow this pattern:
```
{database_name}_{backup_type}_{timestamp}.sql.gz
```

Example:
```
folio_lms_daily_20251103_020000.sql.gz
folio_lms_weekly_20251103_030000.sql.gz
folio_lms_monthly_20251101_040000.sql.gz
```

## Storage Requirements

**Estimate backup size:**
- Database size: ~500 MB (typical)
- Compressed backup: ~100-150 MB (70-80% compression)
- Daily retention: 7 backups × 150 MB = ~1 GB
- Weekly retention: 4 backups × 150 MB = ~600 MB
- Monthly retention: 12 backups × 150 MB = ~1.8 GB
- **Total: ~3.4 GB**

**Recommendations:**
- Minimum: 10 GB free space
- Production: 50 GB free space
- Monitor disk usage regularly

## Troubleshooting

### Backup Fails with "pg_dump not found"

```bash
# Install PostgreSQL client tools
sudo apt-get install postgresql-client  # Ubuntu/Debian
brew install postgresql                   # macOS
```

### Backup Fails with "Cannot connect to database"

```bash
# Test database connection
pg_isready -h localhost -p 5432 -U folio

# Check PostgreSQL is running
docker ps | grep postgres
# or
systemctl status postgresql
```

### Backup Directory Permission Denied

```bash
# Fix permissions
sudo chown -R your-user:your-group /var/backups/folio-lms
chmod 755 /var/backups/folio-lms
```

### Restore Fails

```bash
# Verify backup file integrity
gunzip -t backup_file.sql.gz

# Check disk space
df -h

# Ensure no active connections
docker-compose stop backend celery-worker
```

## Security Considerations

1. **Database Password**: Store securely, use environment variables
2. **Backup Location**: Ensure proper permissions (700 or 750)
3. **Offsite Backups**: Copy backups to remote location/cloud storage
4. **Encryption**: Consider encrypting backups at rest
5. **Access Control**: Limit who can access backup files

## Best Practices

1. **Test Restores Regularly**: Verify backups can be restored successfully
2. **Monitor Disk Space**: Set up alerts for low disk space
3. **Offsite Copy**: Sync backups to remote storage (S3, Azure, etc.)
4. **Document Recovery**: Keep restore procedures accessible
5. **Backup Before Changes**: Always backup before major updates
6. **Test in Staging**: Test restore procedure in non-production first

## Automated Testing

```bash
# Test backup creation
python backend/scripts/database_backup.py backup --type daily

# Verify backup
ls -lh /var/backups/folio-lms/daily/

# Test restore (in test environment!)
# DO NOT run in production without safety backup
./backend/scripts/restore_database.sh /path/to/backup.sql.gz
```

## Integration with CI/CD

Example GitHub Actions workflow:

```yaml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  workflow_dispatch:  # Manual trigger

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Backup Database
        run: |
          docker-compose exec -T postgres pg_dump -U folio folio_lms | gzip > backup.sql.gz
      - name: Upload to S3
        run: aws s3 cp backup.sql.gz s3://your-bucket/backups/
```

## Support

For issues or questions:
1. Check logs: `/var/backups/folio-lms/logs/`
2. Review documentation: This file
3. Contact system administrator

## Changelog

### Version 1.0.0 (2025-11-03)
- Initial release
- Bash and Python backup scripts
- Celery task integration
- Three-tier retention policy
- Comprehensive documentation

---

**Created:** 2025-11-03
**Author:** Claude Code
**Status:** Production Ready ✅
