#!/bin/bash

###############################################################################
# Database Restore Script for FOLIO LMS
#
# This script restores PostgreSQL database from backup
#
# Usage: ./restore_database.sh <backup_file>
# Example: ./restore_database.sh /var/backups/folio-lms/daily/folio_lms_daily_20251103_120000.sql.gz
###############################################################################

set -e  # Exit on error

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-folio_lms}"
DB_USER="${DB_USER:-folio}"
DB_PASSWORD="${DB_PASSWORD:-folio_password}"

# Backup file
BACKUP_FILE="$1"

# Timestamp
DATE=$(date +"%Y-%m-%d %H:%M:%S")

###############################################################################
# Functions
###############################################################################

log() {
    echo "[${DATE}] $1"
}

error() {
    echo "[${DATE}] ERROR: $1" >&2
    exit 1
}

check_prerequisites() {
    # Check if backup file is provided
    if [ -z "$BACKUP_FILE" ]; then
        error "Usage: $0 <backup_file>"
    fi

    # Check if backup file exists
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Backup file not found: $BACKUP_FILE"
    fi

    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        error "psql not found. Please install PostgreSQL client tools."
    fi

    # Check if database is accessible
    if ! PGPASSWORD="${DB_PASSWORD}" pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" &> /dev/null; then
        error "Database is not accessible at ${DB_HOST}:${DB_PORT}"
    fi
}

confirm_restore() {
    log "WARNING: This will replace all data in database '${DB_NAME}'"
    log "Backup file: ${BACKUP_FILE}"
    echo -n "Are you sure you want to continue? (yes/no): "
    read -r CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        log "Restore cancelled by user"
        exit 0
    fi
}

create_backup_before_restore() {
    log "Creating safety backup before restore..."
    SAFETY_BACKUP="/tmp/folio_lms_pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"

    PGPASSWORD="${DB_PASSWORD}" pg_dump \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        --format=plain \
        --no-owner \
        --no-acl \
        | gzip > "${SAFETY_BACKUP}"

    log "Safety backup created: ${SAFETY_BACKUP}"
}

drop_connections() {
    log "Dropping existing database connections..."

    PGPASSWORD="${DB_PASSWORD}" psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d postgres \
        -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();" \
        > /dev/null 2>&1 || true
}

restore_database() {
    log "Starting database restore..."
    log "Database: ${DB_NAME}"
    log "Backup file: ${BACKUP_FILE}"

    # Drop and recreate database
    log "Dropping database..."
    PGPASSWORD="${DB_PASSWORD}" psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d postgres \
        -c "DROP DATABASE IF EXISTS ${DB_NAME};" \
        > /dev/null

    log "Creating database..."
    PGPASSWORD="${DB_PASSWORD}" psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d postgres \
        -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};" \
        > /dev/null

    # Restore from backup
    log "Restoring data..."
    gunzip -c "${BACKUP_FILE}" | PGPASSWORD="${DB_PASSWORD}" psql \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        > /dev/null

    if [ $? -eq 0 ]; then
        log "Restore completed successfully"
    else
        error "Restore failed"
    fi
}

verify_restore() {
    log "Verifying restore..."

    # Check if database exists
    if ! PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -lqt | cut -d \| -f 1 | grep -qw "${DB_NAME}"; then
        error "Database not found after restore"
    fi

    # Count tables
    TABLE_COUNT=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

    log "Database verified: ${TABLE_COUNT} tables found"
}

###############################################################################
# Main execution
###############################################################################

log "========================================="
log "FOLIO LMS Database Restore"
log "========================================="

# Check prerequisites
check_prerequisites

# Confirm restore
confirm_restore

# Create safety backup
create_backup_before_restore

# Drop existing connections
drop_connections

# Restore database
restore_database

# Verify restore
verify_restore

log "========================================="
log "Restore completed successfully"
log "Don't forget to restart application services"
log "========================================="

exit 0
