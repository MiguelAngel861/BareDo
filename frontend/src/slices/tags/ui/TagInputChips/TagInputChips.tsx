import { InputField, TagChip } from '@/shared/ui/index.ts';
import { useEffect, useRef, useState } from 'preact/hooks';
import { fetchTags, findOrCreateTag, normalizeTagName, tagsSignal } from '../../tags.state.ts';
import type { Tag } from '../../tags.types.ts';
import './TagInputChips.css';

const MAX_TAGS = 7;

type ComboboxOption = { isCreate: false; tag: Tag } | { isCreate: true; name: string };

export function TagInputChips({
  tags,
  onChange,
}: {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const cleanQuery = normalizeTagName(inputValue);

  // Tags disponibles que aún no han sido asignados a la tarea
  const selectedTagIds = new Set(tags.map((t) => t.tag_id));
  const availableTags = tagsSignal.value.filter((t) => !selectedTagIds.has(t.tag_id));

  // Filtrado por texto
  const filteredTags = cleanQuery
    ? availableTags.filter((t) => t.name.toLowerCase().includes(cleanQuery))
    : availableTags;

  // Verificamos si existe una coincidencia exacta en todos los tags del usuario
  const exactMatch = tagsSignal.value.some((t) => t.name.toLowerCase() === cleanQuery);

  // Armamos la lista de opciones para el combobox
  const options: ComboboxOption[] = [];

  for (const tag of filteredTags) {
    options.push({ isCreate: false, tag });
  }

  // Si hay texto y no hay match exacto existente, ofrecemos crear explícitamente
  if (cleanQuery && !exactMatch && cleanQuery.length <= 30) {
    options.push({ isCreate: true, name: cleanQuery });
  }

  // Click outside listener
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const addTag = (tag: Tag) => {
    if (tags.length >= MAX_TAGS) {
      setError(`Maximum ${MAX_TAGS} tags allowed`);
      return;
    }

    const isAlreadyAdded = tags.some((t) => t.tag_id === tag.tag_id);
    if (!isAlreadyAdded) {
      onChange([...tags, tag]);
    }

    setInputValue('');
    setError(null);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleCreate = async (name: string) => {
    if (tags.length >= MAX_TAGS) {
      setError(`Maximum ${MAX_TAGS} tags allowed`);
      return;
    }

    setError(null);
    const created = await findOrCreateTag(name);
    if (created) {
      addTag(created);
    }
  };

  const selectOption = (opt: ComboboxOption) => {
    if (opt.isCreate) {
      handleCreate(opt.name);
    } else {
      addTag(opt.tag);
    }
  };

  const removeTag = (tagId: number) => {
    onChange(tags.filter((t) => t.tag_id !== tagId));
    setError(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else if (options.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % options.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.length - 1);
      } else if (options.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
      }
      return;
    }

    if (e.key === 'Escape') {
      if (isOpen) {
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
      return;
    }

    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      const lastTag = tags[tags.length - 1];
      if (lastTag) {
        removeTag(lastTag.tag_id);
      }
      return;
    }

    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();

      if (tags.length >= MAX_TAGS) {
        setError(`Maximum ${MAX_TAGS} tags allowed`);
        return;
      }

      // Si hay una opción resaltada en el menú
      if (isOpen && highlightedIndex >= 0 && options[highlightedIndex]) {
        selectOption(options[highlightedIndex]);
        return;
      }

      // Si no hay opción resaltada pero hay opciones visibles y el input tiene texto
      if (cleanQuery) {
        // Si hay una sola opción o coincidencia exacta
        const match = filteredTags.find((t) => t.name.toLowerCase() === cleanQuery);
        if (match) {
          addTag(match);
        } else {
          await handleCreate(cleanQuery);
        }
      }
    }
  };

  return (
    <div class="tag-input-section" ref={containerRef}>
      <div class="tag-input-container" id="task-tags-container">
        <div class="tag-chips-wrapper" id="tag-chips-wrapper">
          {tags.map((tag) => (
            <TagChip
              key={tag.tag_id}
              name={tag.name}
              onRemove={() => removeTag(tag.tag_id)}
              size="md"
            />
          ))}
        </div>

        <div class="tag-combobox-wrapper">
          <InputField
            inputRef={inputRef}
            type="text"
            id="tag-input-field"
            placeholder={
              tags.length >= MAX_TAGS ? 'Max tags reached' : 'Type to search or add tag...'
            }
            maxLength={30}
            autoComplete="off"
            disabled={tags.length >= MAX_TAGS}
            value={inputValue}
            className="tag-input-field-wrapper"
            noMargin={true}
            onFocus={() => {
              if (tags.length < MAX_TAGS) {
                setIsOpen(true);
              }
            }}
            onInput={(val) => {
              setInputValue(val);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          />

          {isOpen && tags.length < MAX_TAGS && options.length > 0 && (
            <div class="tag-combobox-dropdown" role="listbox" id="tag-combobox-list" tabIndex={-1}>
              {options.map((opt, idx) => {
                const isHighlighted = idx === highlightedIndex;

                if (opt.isCreate) {
                  return (
                    <div
                      key={`create-${opt.name}`}
                      class={`tag-combobox-item tag-combobox-create ${isHighlighted ? 'highlighted' : ''}`}
                      role="option"
                      aria-selected={isHighlighted}
                      tabIndex={0}
                      onClick={() => selectOption(opt)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                    >
                      <span class="create-badge">
                        <span class="create-icon">+</span> Create tag
                      </span>
                      <strong>#{opt.name}</strong>
                    </div>
                  );
                }

                return (
                  <div
                    key={`tag-${opt.tag.tag_id}`}
                    class={`tag-combobox-item ${isHighlighted ? 'highlighted' : ''}`}
                    role="option"
                    aria-selected={isHighlighted}
                    tabIndex={0}
                    onClick={() => selectOption(opt)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <span>#{opt.tag.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          {isOpen && tags.length < MAX_TAGS && options.length === 0 && cleanQuery && (
            <div class="tag-combobox-dropdown">
              <div class="tag-combobox-empty">Tag name exceeds character limit</div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <span class="error-message" id="tags-error">
          {error}
        </span>
      )}
    </div>
  );
}
