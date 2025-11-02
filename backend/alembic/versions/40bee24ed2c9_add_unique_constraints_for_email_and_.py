"""add_unique_constraints_for_email_and_barcode

Revision ID: 40bee24ed2c9
Revises: 8dfaea897107
Create Date: 2025-10-31 06:55:03.454774

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '40bee24ed2c9'
down_revision: Union[str, None] = '8dfaea897107'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Add UNIQUE constraints for email and barcode fields.

    BUG-003: Missing Database UNIQUE Constraints
    - users.email should be UNIQUE per tenant
    - users.barcode should be UNIQUE per tenant
    - items.barcode should be UNIQUE per tenant

    NOTE: Run scripts/check_duplicates.py BEFORE running this migration
    to ensure no duplicate data exists.
    """

    # Drop existing single-column unique indexes if they exist
    # These were created in the initial migration but aren't tenant-aware
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_barcode', table_name='users')
    op.drop_index('ix_items_barcode', table_name='items')

    # Create composite UNIQUE constraints (tenant_id + field)
    # This allows same email/barcode in different tenants (multi-tenancy support)
    op.create_unique_constraint(
        'uq_users_email_tenant',
        'users',
        ['tenant_id', 'email']
    )

    op.create_unique_constraint(
        'uq_users_barcode_tenant',
        'users',
        ['tenant_id', 'barcode']
    )

    op.create_unique_constraint(
        'uq_items_barcode_tenant',
        'items',
        ['tenant_id', 'barcode']
    )

    # Re-create indexes for performance (non-unique, but indexed)
    op.create_index('ix_users_email', 'users', ['email'], unique=False)
    op.create_index('ix_users_barcode', 'users', ['barcode'], unique=False)
    op.create_index('ix_items_barcode', 'items', ['barcode'], unique=False)


def downgrade() -> None:
    """
    Remove UNIQUE constraints for email and barcode fields.
    """

    # Drop composite unique constraints
    op.drop_constraint('uq_users_email_tenant', 'users', type_='unique')
    op.drop_constraint('uq_users_barcode_tenant', 'users', type_='unique')
    op.drop_constraint('uq_items_barcode_tenant', 'items', type_='unique')

    # Drop non-unique indexes
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_barcode', table_name='users')
    op.drop_index('ix_items_barcode', table_name='items')

    # Re-create original single-column unique indexes
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    op.create_index('ix_users_barcode', 'users', ['barcode'], unique=True)
    op.create_index('ix_items_barcode', 'items', ['barcode'], unique=True)
