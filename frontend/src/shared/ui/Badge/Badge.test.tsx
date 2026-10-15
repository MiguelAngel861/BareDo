import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { Badge } from './Badge.tsx';

describe('Badge', () => {
  it('renders default badge with children', () => {
    render(<Badge>Test Badge</Badge>);
    const el = screen.getByText('Test Badge');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass('app-badge');
    expect(el).toHaveClass('app-badge--default');
    expect(el).toHaveClass('app-badge--sm');
  });

  it('applies variant and size classes', () => {
    render(
      <Badge variant="danger" size="md">
        Critical
      </Badge>
    );
    const el = screen.getByText('Critical');
    expect(el).toHaveClass('app-badge--danger');
    expect(el).toHaveClass('app-badge--md');
  });

  it('supports custom className and HTML attributes', () => {
    render(
      <Badge className="custom-class" title="Tooltip">
        Custom
      </Badge>
    );
    const el = screen.getByText('Custom');
    expect(el).toHaveClass('custom-class');
    expect(el).toHaveAttribute('title', 'Tooltip');
  });
});
