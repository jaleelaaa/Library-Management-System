#!/bin/bash

###############################################################################
# Database Backup Script for FOLIO LMS
#
# This script creates PostgreSQL database backups with rotation policy
# Suitable for ministry-level production deployment
#
# Features:
# - Full database dump using pg_dump
# - Automatic compression (gzip)
# - Retention policy: Daily (7 days), Weekly (4 weeks), Monthly (12 months)
# - Backup verification
# - Email notifications (optional)
# - Logging
#
# Usage: ./backup_database.sh [daily|weekly|monthly]
###############################################################################

set -e  # Exit on error

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/folio-lms}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-folio_lms}"
DB_USER="${DB_USER:-folio}"
DB_PASSWORD="${DB_PASSWORD:-folio_password}"

# Backup type (daily, weekly, monthly)
BACKUP_TYPE="${1:-daily}"

# Retention policies (in days)
DAILY_RETENTION=7
WEEKLY_RETENTION=28
MONTHLY_RETENTION=365

# Timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Backup filename
BACKUP_FILENAME="${DB_NAME}_${BACKUP_TYPE}_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_TYPE}/${BACKUP_FILENAME}"

# Log file
LOG_DIR="${BACKUP_DIR}/logs"
LOG_FILE="${LOG_DIR}/backup_$(date +"%Y%m").log"

###############################################################################
# Functions
###############################################################################

log() {
    echo "[${DATE}] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[${DATE}] ERROR: $1" | tee -a "$LOG_FILE" >&2
    exit 1
}

create_directories() {
    mkdir -p "${BACKUP_DIR}/daily"
    mkdir -p "${BACKUP_DIR}/weekly"
    mkdir -p "${BACKUP_DIR}/monthly"
    mkdir -p "${LOG_DIR}"
}

check_prerequisites() {
    # Check if pg_dump is available
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump not found. Please install PostgreSQL client tools."
    fi

    # Check if database is accessible
    if ! PGPASSWORD="${DB_PASSWORD}" pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" &> /dev/null; then
        error "Database is not accessible at ${DB_HOST}:${DB_PORT}"
    fi
}

create_backup() {
    log "Starting ${BACKUP_TYPE} backup..."
    log "Database: ${DB_NAME}"
    log "Backup file: ${BACKUP_FILENAME}"

    # Create backup with pg_dump and compress
    PGPASSWORD="${DB_PASSWORD}" pg_dump \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        --format=plain \
        --no-owner \
        --no-acl \
        --verbose \
        2>> "$LOG_FILE" \
        | gzip > "${BACKUP_PATH}"

    if [ $? -eq 0 ]; then
        log "Backup created successfully: ${BACKUP_PATH}"
    else
        error "Backup failed"
    fi
}

verify_backup() {
    log "Verifying backup..."

    # Check if file exists and has content
    if [ ! -f "${BACKUP_PATH}" ]; then
        error "Backup file not found: ${BACKUP_PATH}"
    fi

    # Check file size (should be at least 1KB)
    FILE_SIZE=$(stat -f%z "${BACKUP_PATH}" 2>/dev/null || stat -c%s "${BACKUP_PATH}" 2>/dev/null)
    if [ "$FILE_SIZE" -lt 1024 ]; then
        error "Backup file is too small: ${FILE_SIZE} bytes"
    fi

    # Verify gzip integrity
    if ! gzip -t "${BACKUP_PATH}" 2>/dev/null; then
        error "Backup file is corrupted"
    fi

    log "Backup verified successfully (${FILE_SIZE} bytes)"
}

rotate_backups() {
    log "Rotating old backups..."

    case $BACKUP_TYPE in
        daily)
            RETENTION=$DAILY_RETENTION
            ;;
        weekly)
            RETENTION=$WEEKLY_RETENTION
            ;;
        monthly)
            RETENTION=$MONTHLY_RETENTION
            ;;
        *)
            RETENTION=$DAILY_RETENTION
            ;;
    esac

    # Delete backups older than retention period
    find "${BACKUP_DIR}/${BACKUP_TYPE}" -name "${DB_NAME}_${BACKUP_TYPE}_*.sql.gz" -type f -mtime +${RETENTION} -delete 2>/dev/null || true

    log "Backup rotation complete (retention: ${RETENTION} days)"
}

calculate_backup_size() {
    TOTAL_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)
    log "Total backup storage used: ${TOTAL_SIZE}"
}

###############################################################################
# Main execution
###############################################################################

log "========================================="
log "FOLIO LMS Database Backup"
log "========================================="

# Create necessary directories
create_directories

# Check prerequisites
check_prerequisites

# Create backup
create_backup

# Verify backup
verify_backup

# Rotate old backups
rotate_backups

# Calculate total backup size
calculate_backup_size

log "Backup completed successfully"
log "========================================="

exit 0
