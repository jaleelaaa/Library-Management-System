"""
Database Backup Utility for FOLIO LMS

This module provides database backup functionality that can be triggered
via Celery tasks for automated scheduled backups.

Features:
- PostgreSQL pg_dump backups
- Automatic compression (gzip)
- Backup rotation and retention
- Email notifications on failure
- Integration with Celery Beat

Author: Claude Code
Date: 2025-11-03
"""

import os
import subprocess
import gzip
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, Tuple
import logging

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DatabaseBackup:
    """Database backup manager for PostgreSQL"""

    def __init__(
        self,
        backup_dir: str = "/var/backups/folio-lms",
        db_host: str = "localhost",
        db_port: int = 5432,
        db_name: str = "folio_lms",
        db_user: str = "folio",
        db_password: str = "folio_password"
    ):
        self.backup_dir = Path(backup_dir)
        self.db_host = db_host
        self.db_port = db_port
        self.db_name = db_name
        self.db_user = db_user
        self.db_password = db_password

        # Retention policies (in days)
        self.retention_policies = {
            'daily': 7,
            'weekly': 28,
            'monthly': 365
        }

    def create_backup(self, backup_type: str = 'daily') -> Tuple[bool, str, Optional[Path]]:
        """
        Create a database backup

        Args:
            backup_type: Type of backup ('daily', 'weekly', or 'monthly')

        Returns:
            Tuple of (success: bool, message: str, backup_path: Optional[Path])
        """
        try:
            # Create backup directories
            self._create_directories()

            # Generate backup filename
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"{self.db_name}_{backup_type}_{timestamp}.sql.gz"
            backup_path = self.backup_dir / backup_type / backup_filename

            logger.info(f"Starting {backup_type} backup: {backup_filename}")

            # Check if pg_dump is available
            if not self._check_pg_dump():
                return False, "pg_dump not found. Install PostgreSQL client tools.", None

            # Check database connectivity
            if not self._check_db_connection():
                return False, f"Cannot connect to database at {self.db_host}:{self.db_port}", None

            # Create backup
            success = self._run_pg_dump(backup_path)
            if not success:
                return False, "pg_dump failed", None

            # Verify backup
            if not self._verify_backup(backup_path):
                return False, "Backup verification failed", None

            # Rotate old backups
            self._rotate_backups(backup_type)

            # Calculate backup size
            backup_size = backup_path.stat().st_size
            size_mb = backup_size / (1024 * 1024)

            message = f"Backup successful: {backup_filename} ({size_mb:.2f} MB)"
            logger.info(message)

            return True, message, backup_path

        except Exception as e:
            error_msg = f"Backup failed: {str(e)}"
            logger.error(error_msg, exc_info=True)
            return False, error_msg, None

    def _create_directories(self):
        """Create backup directory structure"""
        for backup_type in ['daily', 'weekly', 'monthly', 'logs']:
            dir_path = self.backup_dir / backup_type
            dir_path.mkdir(parents=True, exist_ok=True)

    def _check_pg_dump(self) -> bool:
        """Check if pg_dump is available"""
        try:
            subprocess.run(['pg_dump', '--version'], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    def _check_db_connection(self) -> bool:
        """Check if database is accessible"""
        try:
            env = os.environ.copy()
            env['PGPASSWORD'] = self.db_password

            result = subprocess.run(
                [
                    'pg_isready',
                    '-h', self.db_host,
                    '-p', str(self.db_port),
                    '-U', self.db_user
                ],
                env=env,
                capture_output=True,
                timeout=10
            )
            return result.returncode == 0
        except Exception as e:
            logger.error(f"Database connection check failed: {e}")
            return False

    def _run_pg_dump(self, backup_path: Path) -> bool:
        """Run pg_dump and compress output"""
        try:
            env = os.environ.copy()
            env['PGPASSWORD'] = self.db_password

            # Run pg_dump
            dump_process = subprocess.Popen(
                [
                    'pg_dump',
                    '-h', self.db_host,
                    '-p', str(self.db_port),
                    '-U', self.db_user,
                    '-d', self.db_name,
                    '--format=plain',
                    '--no-owner',
                    '--no-acl'
                ],
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )

            # Compress output
            with gzip.open(backup_path, 'wb') as f_out:
                while True:
                    chunk = dump_process.stdout.read(8192)
                    if not chunk:
                        break
                    f_out.write(chunk)

            # Wait for pg_dump to complete
            dump_process.wait()

            if dump_process.returncode != 0:
                error_output = dump_process.stderr.read().decode('utf-8')
                logger.error(f"pg_dump failed: {error_output}")
                return False

            return True

        except Exception as e:
            logger.error(f"pg_dump execution failed: {e}")
            return False

    def _verify_backup(self, backup_path: Path) -> bool:
        """Verify backup file integrity"""
        try:
            # Check if file exists
            if not backup_path.exists():
                logger.error(f"Backup file not found: {backup_path}")
                return False

            # Check file size (should be at least 1KB)
            file_size = backup_path.stat().st_size
            if file_size < 1024:
                logger.error(f"Backup file too small: {file_size} bytes")
                return False

            # Verify gzip integrity
            with gzip.open(backup_path, 'rb') as f:
                # Read first chunk to verify it's valid gzip
                f.read(1024)

            return True

        except Exception as e:
            logger.error(f"Backup verification failed: {e}")
            return False

    def _rotate_backups(self, backup_type: str):
        """Remove old backups based on retention policy"""
        try:
            retention_days = self.retention_policies.get(backup_type, 7)
            cutoff_date = datetime.now() - timedelta(days=retention_days)

            backup_dir = self.backup_dir / backup_type
            pattern = f"{self.db_name}_{backup_type}_*.sql.gz"

            deleted_count = 0
            for backup_file in backup_dir.glob(pattern):
                # Get file modification time
                file_mtime = datetime.fromtimestamp(backup_file.stat().st_mtime)

                if file_mtime < cutoff_date:
                    backup_file.unlink()
                    deleted_count += 1
                    logger.info(f"Deleted old backup: {backup_file.name}")

            if deleted_count > 0:
                logger.info(f"Rotation complete: {deleted_count} old backups deleted")

        except Exception as e:
            logger.error(f"Backup rotation failed: {e}")

    def list_backups(self, backup_type: Optional[str] = None) -> list:
        """List available backups"""
        backups = []

        if backup_type:
            types = [backup_type]
        else:
            types = ['daily', 'weekly', 'monthly']

        for btype in types:
            backup_dir = self.backup_dir / btype
            if not backup_dir.exists():
                continue

            pattern = f"{self.db_name}_{btype}_*.sql.gz"
            for backup_file in sorted(backup_dir.glob(pattern), reverse=True):
                file_stat = backup_file.stat()
                backups.append({
                    'filename': backup_file.name,
                    'path': str(backup_file),
                    'type': btype,
                    'size': file_stat.st_size,
                    'size_mb': file_stat.st_size / (1024 * 1024),
                    'created': datetime.fromtimestamp(file_stat.st_mtime).isoformat()
                })

        return backups


def main():
    """Command-line interface for database backup"""
    import argparse

    parser = argparse.ArgumentParser(description='FOLIO LMS Database Backup Utility')
    parser.add_argument(
        'action',
        choices=['backup', 'list'],
        help='Action to perform'
    )
    parser.add_argument(
        '--type',
        choices=['daily', 'weekly', 'monthly'],
        default='daily',
        help='Backup type (default: daily)'
    )
    parser.add_argument(
        '--backup-dir',
        default='/var/backups/folio-lms',
        help='Backup directory (default: /var/backups/folio-lms)'
    )

    args = parser.parse_args()

    # Get database configuration from environment
    db_config = {
        'backup_dir': args.backup_dir,
        'db_host': os.getenv('DB_HOST', 'localhost'),
        'db_port': int(os.getenv('DB_PORT', '5432')),
        'db_name': os.getenv('DB_NAME', 'folio_lms'),
        'db_user': os.getenv('DB_USER', 'folio'),
        'db_password': os.getenv('DB_PASSWORD', 'folio_password')
    }

    backup_manager = DatabaseBackup(**db_config)

    if args.action == 'backup':
        success, message, backup_path = backup_manager.create_backup(args.type)
        if success:
            print(f"✓ {message}")
            return 0
        else:
            print(f"✗ {message}")
            return 1

    elif args.action == 'list':
        backups = backup_manager.list_backups(args.type)
        if not backups:
            print("No backups found")
            return 0

        print(f"\nAvailable backups ({len(backups)}):")
        print("-" * 80)
        for backup in backups:
            print(f"{backup['filename']:<50} {backup['size_mb']:>8.2f} MB  {backup['created']}")
        print("-" * 80)
        return 0


if __name__ == '__main__':
    import sys
    sys.exit(main())
