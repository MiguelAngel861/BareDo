import type { ComponentChildren } from 'preact';
import './Checkbox.css';

export interface CheckboxProps {
  id?: string;
  name?: string;
  checked: boolean;
  onChange?: (checked: boolean, e: Event) => void;
  disabled?: boolean;
  label?: ComponentChildren;
  ariaLabel?: string;
  className?: string;
}

export function Checkbox({
  id,
  name,
  checked,
  onChange,
  disabled = false,
  label,
  ariaLabel,
  className = '',
}: CheckboxProps) {
  const handleChange = (e: Event) => {
    if (disabled) {
      return;
    }
    const isChecked = (e.target as HTMLInputElement).checked;
    onChange?.(isChecked, e);
  };

  const rootClasses = ['app-checkbox', disabled ? 'app-checkbox--disabled' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <label class={rootClasses} htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        name={name}
        class="app-checkbox__native visually-hidden"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        aria-label={ariaLabel}
      />
      <span class="app-checkbox__box" aria-hidden="true">
        <span class={`app-checkbox__indicator ${checked ? 'is-checked' : ''}`} />
      </span>
      {label && <span class="app-checkbox__label">{label}</span>}
    </label>
  );
}
