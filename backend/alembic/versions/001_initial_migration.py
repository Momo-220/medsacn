"""Initial migration - Create all tables

Revision ID: 001_initial
Revises: 
Create Date: 2026-01-20

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy.dialects import sqlite

# Helper to handle JSON for both SQLite and PostgreSQL
def get_json_type():
    """Return appropriate JSON type based on database"""
    # Check if we're using SQLite or PostgreSQL
    bind = op.get_bind()
    if bind.dialect.name == 'sqlite':
        return sa.Text  # SQLite uses TEXT for JSON
    else:
        return sa.JSON  # PostgreSQL has native JSON support

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    json_type = get_json_type()
    
    # Medications table
    op.create_table(
        'medications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('generic_name', sa.String(255)),
        sa.Column('brand_names', json_type),
        sa.Column('medication_type', sa.String(100)),
        sa.Column('therapeutic_class', sa.String(255)),
        sa.Column('drug_class', sa.String(255)),
        sa.Column('dosage_forms', json_type),
        sa.Column('strengths', json_type),
        sa.Column('indications', sa.Text),
        sa.Column('usage_instructions', sa.Text),
        sa.Column('dosage_guidelines', json_type),
        sa.Column('contraindications', json_type),
        sa.Column('warnings', json_type),
        sa.Column('side_effects', json_type),
        sa.Column('interactions', json_type),
        sa.Column('manufacturer', sa.String(255)),
        sa.Column('storage_conditions', sa.Text),
        sa.Column('data_source', sa.String(100)),
        sa.Column('confidence_score', sa.Float),
        sa.Column('verified', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_medication_name', 'medications', ['name'])
    op.create_index('idx_medication_generic', 'medications', ['generic_name'])
    op.create_index('idx_medication_class', 'medications', ['drug_class'])

    # User Medications table
    op.create_table(
        'user_medications',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(128), nullable=False),
        sa.Column('medication_id', sa.String(36)),
        sa.Column('medication_name', sa.String(255), nullable=False),
        sa.Column('scan_id', sa.String(128)),
        sa.Column('image_url', sa.Text),
        sa.Column('detected_dosage', sa.String(100)),
        sa.Column('detected_form', sa.String(100)),
        sa.Column('detected_manufacturer', sa.String(255)),
        sa.Column('nickname', sa.String(100)),
        sa.Column('purpose', sa.Text),
        sa.Column('prescribing_doctor', sa.String(255)),
        sa.Column('notes', sa.Text),
        sa.Column('dosage_schedule', json_type),
        sa.Column('reminder_enabled', sa.Boolean, default=False),
        sa.Column('active', sa.Boolean, default=True),
        sa.Column('start_date', sa.DateTime),
        sa.Column('end_date', sa.DateTime),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_user_medications_user_id', 'user_medications', ['user_id'])
    op.create_index('idx_user_medications_active', 'user_medications', ['user_id', 'active'])

    # User Credits table
    op.create_table(
        'user_credits',
        sa.Column('user_id', sa.String(128), primary_key=True),
        sa.Column('credits', sa.Integer, nullable=False, default=0),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_user_credits_user_id', 'user_credits', ['user_id'])

    # Scan History table (replaces Firestore)
    op.create_table(
        'scan_history',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(128), nullable=False),
        sa.Column('scan_id', sa.String(128), nullable=False, unique=True),
        sa.Column('medication_name', sa.String(255), nullable=False),
        sa.Column('generic_name', sa.String(255)),
        sa.Column('dosage', sa.String(100)),
        sa.Column('form', sa.String(100)),
        sa.Column('manufacturer', sa.String(255)),
        sa.Column('confidence', sa.String(50), default='low'),
        sa.Column('analysis_data', json_type),
        sa.Column('warnings', json_type),
        sa.Column('contraindications', json_type),
        sa.Column('interactions', json_type),
        sa.Column('side_effects', json_type),
        sa.Column('image_url', sa.Text),
        sa.Column('packaging_language', sa.String(10)),
        sa.Column('category', sa.String(100)),
        sa.Column('created_at', sa.DateTime, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime, default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('idx_scan_history_user_id', 'scan_history', ['user_id'])
    op.create_index('idx_scan_history_created_at', 'scan_history', ['user_id', 'created_at'])
    op.create_index('idx_scan_history_scan_id', 'scan_history', ['scan_id'])


def downgrade() -> None:
    op.drop_index('idx_scan_history_scan_id', table_name='scan_history')
    op.drop_index('idx_scan_history_created_at', table_name='scan_history')
    op.drop_index('idx_scan_history_user_id', table_name='scan_history')
    op.drop_table('scan_history')
    
    op.drop_index('idx_user_credits_user_id', table_name='user_credits')
    op.drop_table('user_credits')
    
    op.drop_index('idx_user_medications_active', table_name='user_medications')
    op.drop_index('idx_user_medications_user_id', table_name='user_medications')
    op.drop_table('user_medications')
    
    op.drop_index('idx_medication_class', table_name='medications')
    op.drop_index('idx_medication_generic', table_name='medications')
    op.drop_index('idx_medication_name', table_name='medications')
    op.drop_table('medications')
