"""Add reminder_takes table for adherence tracking

Revision ID: 002_reminder_takes
Revises: 001_initial
Create Date: 2026-02-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '002_reminder_takes'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.name == 'sqlite':
        conn.execute(sa.text(
            "CREATE TABLE IF NOT EXISTS reminder_takes ("
            "id VARCHAR(36) PRIMARY KEY, reminder_id VARCHAR(36) NOT NULL, "
            "user_id VARCHAR(128) NOT NULL, taken_at DATETIME NOT NULL)"
        ))
        conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_reminder_takes_reminder_id ON reminder_takes(reminder_id)"))
        conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_reminder_takes_user_id ON reminder_takes(user_id)"))
        conn.execute(sa.text("CREATE INDEX IF NOT EXISTS idx_reminder_takes_user_date ON reminder_takes(user_id, taken_at)"))
    else:
        op.create_table(
            'reminder_takes',
            sa.Column('id', sa.String(36), primary_key=True),
            sa.Column('reminder_id', sa.String(36), nullable=False),
            sa.Column('user_id', sa.String(128), nullable=False),
            sa.Column('taken_at', sa.DateTime, nullable=False),
        )
        op.create_index('idx_reminder_takes_reminder_id', 'reminder_takes', ['reminder_id'])
        op.create_index('idx_reminder_takes_user_id', 'reminder_takes', ['user_id'])
        op.create_index('idx_reminder_takes_user_date', 'reminder_takes', ['user_id', 'taken_at'])


def downgrade() -> None:
    op.drop_index('idx_reminder_takes_user_date', table_name='reminder_takes')
    op.drop_index('idx_reminder_takes_user_id', table_name='reminder_takes')
    op.drop_index('idx_reminder_takes_reminder_id', table_name='reminder_takes')
    op.drop_table('reminder_takes')
