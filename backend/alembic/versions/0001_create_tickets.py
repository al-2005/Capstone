"""Create campus support tickets.

Revision ID: 0001_create_tickets
Revises:
Create Date: 2026-10-17
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_create_tickets"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tickets",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("subject", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=30), nullable=False, server_default="IT"),
        sa.Column("priority", sa.String(length=10), nullable=False, server_default="normal"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="open"),
        sa.Column("requester", sa.String(length=100), nullable=False),
        sa.Column("assignee", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_tickets_id", "tickets", ["id"])


def downgrade() -> None:
    op.drop_index("ix_tickets_id", table_name="tickets")
    op.drop_table("tickets")
