"""initial schema

Revision ID: 1785959834
Revises:
Create Date: 2026-08-05 13:57:14.702183

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "1785959834"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = ("default",)
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "users",
        sa.Column("user_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("username", sa.String(length=50), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.PrimaryKeyConstraint("user_id"),
        sa.UniqueConstraint("username"),
    )
    op.create_table(
        "tasks",
        sa.Column("task_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=40), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=True),
        sa.Column("priority", sa.Integer(), nullable=False, server_default=sa.text("1")),
        sa.Column(
            "due_date",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_DATE"),
        ),
        sa.Column(
            "completed",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(),
            nullable=False,
            server_default=sa.text("CURRENT_TIMESTAMP"),
        ),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"]),
        sa.PrimaryKeyConstraint("task_id"),
    )
    op.create_index("ix_tasks_user_id", "tasks", ["user_id"])
    op.create_index("ix_tasks_completed", "tasks", ["completed"])
    op.create_index("ix_tasks_created_at", "tasks", ["created_at"])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("ix_tasks_created_at", table_name="tasks")
    op.drop_index("ix_tasks_completed", table_name="tasks")
    op.drop_index("ix_tasks_user_id", table_name="tasks")
    op.drop_table("tasks")
    op.drop_table("users")
