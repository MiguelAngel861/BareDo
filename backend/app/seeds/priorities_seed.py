from app.models.priorities import Priorities

PRIORITIES_SEED = [
    {
        "name": "Low",
        "level": 1,
        "description": "Can do when I have time",
    },
    {"name": "Medium-Low", "level": 2, "description": "Can wait but not too long"},
    {
        "name": "Medium",
        "level": 3,
        "description": "should do soon",
    },
    {
        "name": "Medium-High",
        "level": 4,
        "description": "Should not postpone",
    },
    {
        "name": "High",
        "level": 5,
        "description": "Requires immediate attention",
    },
]


def seed_priorities(session) -> None:
    existing = session.query(Priorities).count()
    if existing == 0:
        for data in PRIORITIES_SEED:
            session.add(Priorities(**data))
        session.commit()
        print(f"Seeded {len(PRIORITIES_SEED)} priorities.")
    else:
        print(f"Priorities table already has {existing} rows. Skipping seed.")
