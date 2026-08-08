def parse_sort(sort_str: str | None, allowed_fields: list[str]) -> list[tuple[str, bool]]:
    """Parse sort string into list of (field, desc) tuples."""
    if not sort_str:
        return []

    fields: list[tuple[str, bool]] = []

    for raw in sort_str.split(","):
        raw = raw.strip()
        if not raw:
            continue

        desc = raw.startswith("-")
        field = raw[1:] if desc else raw

        if field not in allowed_fields:
            continue

        fields.append((field, desc))

    return fields
