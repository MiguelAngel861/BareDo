import { render } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { CloseIcon } from './CloseIcon.tsx';

describe('CloseIcon component', () => {
  it('renders default SVG attributes', () => {
    const { container } = render(<CloseIcon />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
    expect(svg).toHaveAttribute('stroke-width', '2');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('accepts custom size and strokeWidth', () => {
    const { container } = render(
      <CloseIcon size={12} strokeWidth={2.5} className="custom-close" />
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '12');
    expect(svg).toHaveAttribute('height', '12');
    expect(svg).toHaveAttribute('stroke-width', '2.5');
    expect(svg).toHaveClass('custom-close');
  });
});
