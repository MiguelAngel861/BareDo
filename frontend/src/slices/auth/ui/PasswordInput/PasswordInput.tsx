import { InputField, type InputFieldProps } from '@/shared/ui/index.ts';
import { useState } from 'preact/hooks';
import './PasswordInput.css';

export interface PasswordInputProps extends Omit<InputFieldProps, 'type' | 'endAdornment'> {
  toggleAriaLabel?: {
    show: string;
    hide: string;
  };
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function PasswordInput({
  toggleAriaLabel = { show: 'Show password', hide: 'Hide password' },
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <InputField
      {...props}
      type={isVisible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          class="password-toggle-btn"
          aria-label={isVisible ? toggleAriaLabel.hide : toggleAriaLabel.show}
          onClick={() => setIsVisible((prev) => !prev)}
        >
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
}
