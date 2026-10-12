import { useState } from 'preact/hooks';
import { findOrCreateTag } from '../tags.state.ts';
import type { Tag } from '../tags.types.ts';

const MAX_TAGS = 7;

export function TagInputChips({
  tags,
  onChange,
}: {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const raw = inputValue.trim();
      if (!raw) {
        return;
      }

      if (tags.length >= MAX_TAGS) {
        setError(`Maximum ${MAX_TAGS} tags allowed`);
        return;
      }

      setError(null);
      const tag = await findOrCreateTag(raw);
      if (tag) {
        const isAlreadyAdded = tags.some((t) => t.tag_id === tag.tag_id);
        if (!isAlreadyAdded) {
          onChange([...tags, tag]);
        }
        setInputValue('');
      }
    }
  };

  const removeTag = (tagId: number) => {
    onChange(tags.filter((t) => t.tag_id !== tagId));
    setError(null);
  };

  return (
    <div class="tag-input-section">
      <div class="tag-input-container" id="task-tags-container">
        <div class="tag-chips-wrapper" id="tag-chips-wrapper">
          {tags.map((tag) => (
            <span key={tag.tag_id} class="tag-chip">
              #{tag.name}
              <button
                type="button"
                class="tag-chip-remove"
                onClick={() => removeTag(tag.tag_id)}
                aria-label={`Remove tag ${tag.name}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          id="tag-input-field"
          placeholder={tags.length >= MAX_TAGS ? 'Max tags reached' : 'Add tag...'}
          maxLength={30}
          autoComplete="off"
          disabled={tags.length >= MAX_TAGS}
          value={inputValue}
          onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {error && (
        <span class="error-message" id="tags-error">
          {error}
        </span>
      )}
    </div>
  );
}
