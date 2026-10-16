export interface CloseIconProps {
  size?: number | string;
  strokeWidth?: number | string;
  className?: string;
  ariaHidden?: boolean;
  title?: string;
}

export function CloseIcon({
  size = 16,
  strokeWidth = 2,
  className = '',
  ariaHidden = true,
  title = 'Close',
}: CloseIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-linejoin="round"
      class={`close-icon ${className}`.trim()}
      aria-hidden={ariaHidden ? 'true' : undefined}
      style={{ flexShrink: 0, display: 'block' }}
    >
      <title>{title}</title>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
