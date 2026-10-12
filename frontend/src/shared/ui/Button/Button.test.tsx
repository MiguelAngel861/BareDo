import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Button } from './Button.tsx';

describe('Button Component', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with default primary variant and md size', () => {
    render(<Button>Click Me</Button>);
    const btn = screen.getByRole('button', { name: 'Click Me' });
    expect(btn).toBeInTheDocument();
    expect(btn.className).toContain('app-btn');
    expect(btn.className).toContain('app-btn--primary');
    expect(btn.className).toContain('app-btn--md');
  });

  it('applies variant and size classes properly', () => {
    render(
      <Button variant="danger" size="sm" fullWidth={true}>
        Delete
      </Button>
    );
    const btn = screen.getByRole('button', { name: 'Delete' });
    expect(btn.className).toContain('app-btn--danger');
    expect(btn.className).toContain('app-btn--sm');
    expect(btn.className).toContain('app-btn--full-width');
  });

  it('handles clicks when not disabled or loading', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Action</Button>);
    const btn = screen.getByRole('button', { name: 'Action' });
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled and sets aria-busy when isLoading is true', () => {
    const handleClick = vi.fn();
    render(
      <Button isLoading={true} onClick={handleClick}>
        Saving
      </Button>
    );
    const btn = screen.getByRole('button', { name: 'Saving' });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('is disabled when disabled prop is true', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled={true} onClick={handleClick}>
        Disabled Action
      </Button>
    );
    const btn = screen.getByRole('button', { name: 'Disabled Action' });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
