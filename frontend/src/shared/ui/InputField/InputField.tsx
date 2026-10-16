import type { ComponentChildren, Ref } from 'preact';
import './InputField.css';

export interface InputFieldProps {
  id: string;
  name?: string;
  type?: 'text' | 'password' | 'email' | 'date' | 'search' | 'number';
  label?: ComponentChildren;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  showAsterisk?: boolean;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  autoComplete?: string;
  error?: string | null;
  hint?: string;
  className?: string;
  inputClassName?: string;
  inputRef?: Ref<HTMLInputElement>;
  endAdornment?: ComponentChildren;
  noMargin?: boolean;
  'aria-label'?: string;
  'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
  'aria-expanded'?: boolean | 'true' | 'false';
  'aria-haspopup'?: 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | boolean;
  onInput?: (value: string, e: Event) => void;
  onChange?: (value: string, e: Event) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  onBlur?: (e: FocusEvent) => void;
  onFocus?: (e: FocusEvent) => void;
}

export function InputField({
  id,
  name,
  type = 'text',
  label,
  value,
  defaultValue,
  placeholder,
  required = false,
  showAsterisk = false,
  disabled = false,
  maxLength,
  minLength,
  autoComplete,
  error,
  hint,
  className = '',
  inputClassName = '',
  inputRef,
  endAdornment,
  noMargin = false,
  'aria-label': ariaLabel,
  'aria-autocomplete': ariaAutocomplete,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHasPopup,
  onInput,
  onChange,
  onKeyDown,
  onBlur,
  onFocus,
}: InputFieldProps) {
  const hasError = Boolean(error);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy =
    [hasError ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  const rootClasses = [
    'app-input-field',
    hasError ? 'app-input-field--error' : '',
    noMargin ? 'app-input-field--no-margin' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div class={rootClasses}>
      {(label || hint) && (
        <div class="app-input-field__header">
          {label && (
            <label for={id} class="app-input-field__label">
              <span>{label}</span>
              {showAsterisk && (
                <span class="required" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {hint && (
            <span id={hintId} class="app-input-field__hint">
              {hint}
            </span>
          )}
        </div>
      )}

      <div class="app-input-field__control">
        <input
          {...(inputRef ? { ref: inputRef } : {})}
          id={id}
          name={name || id}
          type={type as 'text'}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          minLength={minLength}
          autoComplete={autoComplete}
          aria-label={ariaLabel}
          aria-autocomplete={ariaAutocomplete}
          aria-expanded={ariaExpanded}
          aria-haspopup={ariaHasPopup}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={describedBy}
          class={[
            'app-input-field__input',
            endAdornment ? 'app-input-field__input--has-end' : '',
            inputClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          onInput={(e) => {
            const val = (e.target as HTMLInputElement).value;
            onInput?.(val, e);
          }}
          onChange={(e) => {
            const val = (e.target as HTMLInputElement).value;
            onChange?.(val, e);
          }}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
          onFocus={onFocus}
        />
        {endAdornment && <div class="app-input-field__end-adornment">{endAdornment}</div>}
      </div>

      {hasError && (
        <span id={errorId} class="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
