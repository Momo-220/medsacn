"""Add quota_reset_date for daily gemme quota

Revision ID: 003_quota_reset
Revises: 002_reminder_takes
Create Date: 2026-02-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '003_quota_reset'
down_revision: Union[str, None] = '002_reminder_takes'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.name == 'sqlite':
        conn.execute(sa.text(
            "ALTER TABLE user_credits ADD COLUMN quota_reset_date DATE"
        ))
    else:
        op.add_column('user_credits', sa.Column('quota_reset_date', sa.Date, nullable=True))


def downgrade() -> None:
    op.drop_column('user_credits', 'quota_reset_date')
