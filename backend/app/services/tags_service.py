from collections.abc import Sequence

from app.errors.exceptions import ConflictError, DataValidationError, NotFoundError
from app.models.tags import Tags
from app.repositories.tags_repository import TagsRepository
from app.services.base import BaseService


class TagsService(BaseService):
    @property
    def repository_class(self) -> type[TagsRepository]:
        return TagsRepository

    def get_all_user_tags(self, user_id: int) -> Sequence[Tags]:
        return self._execute_in_transaction(lambda repo: repo.get_all_by_user(user_id=user_id))

    def create_tag(self, name: str, user_id: int) -> Tags:
        cleaned_name = name.strip().lower()
        if not cleaned_name:
            raise DataValidationError("Tag name cannot be empty")
        if len(cleaned_name) > 30:
            raise DataValidationError("Tag name cannot exceed 30 characters")

        def _create(repo: TagsRepository) -> Tags:
            existing = repo.get_by_name(cleaned_name, user_id=user_id)
            if existing:
                raise ConflictError(f"Tag '{cleaned_name}' already exists")
            tag = Tags(name=cleaned_name, user_id=user_id)
            return repo.create(tag)

        return self._execute_in_transaction(_create)

    def update_tag(self, tag_id: int, name: str, user_id: int) -> Tags:
        cleaned_name = name.strip().lower()
        if not cleaned_name:
            raise DataValidationError("Tag name cannot be empty")
        if len(cleaned_name) > 30:
            raise DataValidationError("Tag name cannot exceed 30 characters")

        def _update(repo: TagsRepository) -> Tags:
            tag = repo.get_by_id(tag_id, user_id=user_id)
            if not tag:
                raise NotFoundError("Tag not found")

            existing = repo.get_by_name(cleaned_name, user_id=user_id)
            if existing and existing.tag_id != tag_id:
                raise ConflictError(f"Tag '{cleaned_name}' already exists")

            tag.name = cleaned_name
            return tag

        return self._execute_in_transaction(_update)

    def delete_tag(self, tag_id: int, user_id: int) -> None:
        def _delete(repo: TagsRepository) -> None:
            tag = repo.get_by_id(tag_id, user_id=user_id)
            if not tag:
                raise NotFoundError("Tag not found")
            repo.delete(tag_id, user_id=user_id)

        self._execute_in_transaction(_delete)

    def validate_and_get_tags(self, tag_ids: list[int], user_id: int) -> Sequence[Tags]:
        if not tag_ids:
            return []
        if len(tag_ids) > 7:
            raise DataValidationError("A task can have at most 7 tags")

        def _get_tags(repo: TagsRepository) -> Sequence[Tags]:
            tags = repo.get_by_ids(tag_ids, user_id=user_id)
            if len(tags) != len(set(tag_ids)):
                raise DataValidationError(
                    "One or more tag IDs are invalid or belong to another user"
                )
            return tags

        return self._execute_in_transaction(_get_tags)
