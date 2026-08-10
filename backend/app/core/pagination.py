from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Pagination:
    page: int
    per_page: int
    total: int

    @property
    def total_pages(self) -> int:
        return (self.total + self.per_page - 1) // self.per_page if self.per_page > 0 else 0

    @property
    def has_prev(self) -> bool:
        return self.page > 1

    @property
    def has_next(self) -> bool:
        return self.page < self.total_pages

    def to_dict(self) -> dict:
        return {
            "total": self.total,
            "total_items": self.total,
            "page": self.page,
            "per_page": self.per_page,
            "total_pages": self.total_pages,
            "has_prev": self.has_prev,
            "has_next": self.has_next,
        }
