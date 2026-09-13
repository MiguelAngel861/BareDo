"""add priorities table

Revision ID: 1785960000
Revises: 1785959834
Create Date: 2026-09-12 00:00:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "1785960000"
down_revision: str | Sequence[str] | None = "1785959834"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Create priorities table
    op.create_table(
        "priorities",
        sa.Column("priority_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=20), nullable=False),
        sa.Column("level", sa.Integer(), nullable=False),
        sa.Column("description", sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint("priority_id"),
        sa.UniqueConstraint("level"),
        sa.UniqueConstraint("name"),
    )

    # Seed priorities data
    priorities_table = sa.table(
        "priorities",
        sa.column("priority_id", sa.Integer),
        sa.column("name", sa.String),
        sa.column("level", sa.Integer),
        sa.column("description", sa.String),
    )
    op.bulk_insert(
        priorities_table,
        [
            {
                "priority_id": 1,
                "name": "Low",
                "level": 1,
                "description": "No urgency, can do when I have time",
            },
            {
                "priority_id": 2,
                "name": "Medium-Low",
                "level": 2,
                "description": "Can wait but not too long",
            },
            {
                "priority_id": 3,
                "name": "Medium",
                "level": 3,
                "description": "Standard priority, should do soon",
            },
            {
                "priority_id": 4,
                "name": "Medium-High",
                "level": 4,
                "description": "Important, should not postpone",
            },
            {
                "priority_id": 5,
                "name": "High",
                "level": 5,
                "description": "Urgent, requires immediate attention",
            },
        ],
    )

    # Add priority_id column to tasks (nullable initially for data migration)
    op.add_column("tasks", sa.Column("priority_id", sa.Integer(), nullable=True))

    # Migrate existing data: set priority_id = priority for existing rows
    op.execute("UPDATE tasks SET priority_id = priority")

    # Make priority_id NOT NULL and set default
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.alter_column(
            "priority_id",
            existing_type=sa.Integer(),
            nullable=False,
            server_default="3",
        )

    # Create foreign key constraint
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.create_foreign_key(
            "fk_tasks_priority_id_priorities",
            "priorities",
            ["priority_id"],
            ["priority_id"],
        )

    # Create index on priority_id
    op.create_index("ix_tasks_priority_id", "tasks", ["priority_id"])

    # Drop old priority column
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.drop_column("priority")


def downgrade() -> None:
    # Add back old priority column
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.add_column(
            sa.Column("priority", sa.Integer(), nullable=False, server_default=sa.text("1"))
        )

    # Migrate data back
    op.execute("UPDATE tasks SET priority = priority_id")

    # Drop foreign key and index
    op.drop_index("ix_tasks_priority_id", table_name="tasks")
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.drop_constraint("fk_tasks_priority_id_priorities", type_="foreignkey")

    # Drop priority_id column
    with op.batch_alter_table("tasks") as batch_op:
        batch_op.drop_column("priority_id")

    # Drop priorities table
    op.drop_table("priorities")
