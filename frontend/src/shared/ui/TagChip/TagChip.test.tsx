import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { TagChip } from './TagChip.tsx';

describe('TagChip', () => {
  it('renders tag name with default prefix', () => {
    render(<TagChip name="frontend" />);
    expect(screen.getByText('#frontend')).toBeInTheDocument();
  });

  it('renders custom prefix', () => {
    render(<TagChip name="design" prefix="@" />);
    expect(screen.getByText('@design')).toBeInTheDocument();
  });

  it('renders remove button and handles click', () => {
    const handleRemove = vi.fn();
    render(<TagChip name="work" onRemove={handleRemove} />);

    const removeBtn = screen.getByRole('button', { name: 'Remove tag work' });
    expect(removeBtn).toBeInTheDocument();

    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it('handles chip click when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<TagChip name="clickable" onClick={handleClick} />);

    const chip = screen.getByRole('button');
    fireEvent.click(chip);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
