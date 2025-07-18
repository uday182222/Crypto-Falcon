"""fix purchases table

Revision ID: fix_purchases_table
Revises: add_missing_tables
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'fix_purchases_table'
down_revision = 'add_missing_tables'
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Upgrade schema."""
    # Check if purchases table exists, if not create it
    inspector = op.get_bind().dialect.inspector(op.get_bind())
    tables = inspector.get_table_names()
    
    if 'purchases' not in tables:
        # Create purchases table
        op.create_table('purchases',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('package_id', sa.Integer(), nullable=True),
            sa.Column('amount', sa.Numeric(precision=10, scale=2), nullable=False),
            sa.Column('coins_received', sa.Numeric(precision=20, scale=8), nullable=True),
            sa.Column('razorpay_order_id', sa.String(), nullable=False),
            sa.Column('razorpay_payment_id', sa.String(), nullable=True),
            sa.Column('status', sa.String(), nullable=False, server_default='pending'),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['package_id'], ['demo_coin_packages.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_purchases_id'), 'purchases', ['id'], unique=False)
        op.create_index(op.f('ix_purchases_user_id'), 'purchases', ['user_id'], unique=False)
        op.create_index(op.f('ix_purchases_razorpay_order_id'), 'purchases', ['razorpay_order_id'], unique=True)
        print("Created purchases table")
    else:
        print("Purchases table already exists")

def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_purchases_razorpay_order_id'), table_name='purchases')
    op.drop_index(op.f('ix_purchases_user_id'), table_name='purchases')
    op.drop_index(op.f('ix_purchases_id'), table_name='purchases')
    op.drop_table('purchases') 