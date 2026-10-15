import './TagChip.css';

export interface TagChipProps {
  name: string;
  prefix?: string;
  variant?: 'default' | 'subtle';
  size?: 'sm' | 'md';
  onRemove?: () => void;
  onClick?: (e: MouseEvent) => void;
  className?: string;
  title?: string;
}

export function TagChip({
  name,
  prefix = '#',
  variant = 'default',
  size = 'sm',
  onRemove,
  onClick,
  className = '',
  title,
}: TagChipProps) {
  const isClickable = Boolean(onClick && !onRemove);
  const isRemovable = Boolean(onRemove);

  const classes = [
    'app-tag-chip',
    `app-tag-chip--${variant}`,
    `app-tag-chip--${size}`,
    isClickable ? 'app-tag-chip--clickable' : '',
    isRemovable ? 'app-tag-chip--removable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = `${prefix}${name}`;

  return (
    <span
      class={classes}
      title={title}
      onClick={isClickable ? onClick : undefined}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <span class="app-tag-chip__label">{content}</span>
      {isRemovable && (
        <button
          type="button"
          class="app-tag-chip__remove"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          aria-label={`Remove tag ${name}`}
        >
          &times;
        </button>
      )}
    </span>
  );
}
