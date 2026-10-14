import { useEffect, useRef, useState } from 'preact/hooks';
import './SearchBar.css';

export interface SearchBarProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  ariaLabel?: string;
  debounceMs?: number;
  shortcutHint?: string;
  enableGlobalShortcut?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  onSearch?: (query: string) => void;
  onImmediateChange?: (value: string) => void;
  onClear?: () => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onFocus?: (e: FocusEvent) => void;
  onBlur?: (e: FocusEvent) => void;
}

export function SearchBar({
  id = 'global-search-bar',
  name = 'search',
  value,
  defaultValue = '',
  placeholder = 'Search tasks...',
  ariaLabel = 'Search tasks',
  debounceMs = 300,
  shortcutHint = '/',
  enableGlobalShortcut = true,
  disabled = false,
  isLoading = false,
  className = '',
  onSearch,
  onImmediateChange,
  onClear,
  onKeyDown,
  onFocus,
  onBlur,
}: SearchBarProps) {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string>(value ?? defaultValue);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<number | null>(null);

  const currentValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (isControlled && value !== undefined) {
      setInternalValue(value);
    }
  }, [isControlled, value]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!enableGlobalShortcut || disabled) {
      return;
    }

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key !== shortcutHint) {
        return;
      }

      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isEditable =
        target?.isContentEditable ||
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select';

      if (isEditable) {
        return;
      }

      const isModalOpen = Boolean(
        document.querySelector('[role="dialog"], .modal-overlay, .base-modal-backdrop')
      );
      if (isModalOpen) {
        return;
      }

      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [enableGlobalShortcut, shortcutHint, disabled]);

  const triggerSearch = (query: string) => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    onSearch?.(query);
  };

  const handleInput = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    if (!isControlled) {
      setInternalValue(val);
    }
    onImmediateChange?.(val);

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      onSearch?.(val.trim());
      debounceTimerRef.current = null;
    }, debounceMs);
  };

  const handleKeyDownInternal = (e: KeyboardEvent) => {
    onKeyDown?.(e);

    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch(currentValue.trim());
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();

      if (currentValue) {
        if (!isControlled) {
          setInternalValue('');
        }
        onImmediateChange?.('');
        triggerSearch('');
        onClear?.();
      }
      inputRef.current?.blur();
    }
  };

  const handleClearClick = () => {
    if (disabled) {
      return;
    }
    if (!isControlled) {
      setInternalValue('');
    }
    onImmediateChange?.('');
    triggerSearch('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleFocus = (e: FocusEvent) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const containerClasses = [
    'search-bar-container',
    disabled ? 'search-bar-container--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const hasValue = Boolean(currentValue && currentValue.length > 0);

  return (
    <div class={containerClasses} role="search" aria-label={ariaLabel}>
      <span class="search-bar-icon-wrap" aria-hidden="true">
        <svg class="search-bar-icon" viewBox="0 0 24 24" role="img" aria-label="Search icon">
          <title>Search</title>
          <circle cx="10.5" cy="10.5" r="7" />
          <line x1="16" y1="16" x2="21" y2="21" />
        </svg>
      </span>

      <input
        ref={inputRef}
        type="search"
        id={id}
        name={name}
        class="search-bar-input"
        value={currentValue}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        spellcheck={false}
        aria-label={ariaLabel}
        onInput={handleInput}
        onKeyDown={handleKeyDownInternal}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />

      <div class="search-bar-actions">
        {isLoading && <span class="search-bar-spinner" aria-label="Loading..." />}

        {hasValue && !disabled && (
          <button
            type="button"
            class="search-bar-clear-btn"
            onClick={handleClearClick}
            aria-label="Clear search"
            title="Clear search (Esc)"
          >
            ×
          </button>
        )}

        {shortcutHint && !hasValue && !isFocused && (
          <kbd class="search-bar-kbd" title={`Press ${shortcutHint} to search`}>
            {shortcutHint}
          </kbd>
        )}
      </div>
    </div>
  );
}
