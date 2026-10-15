import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tagsSignal } from '../../tags.state.ts';
import { TagFilterDropdown } from './TagFilterDropdown.tsx';

describe('TagFilterDropdown component', () => {
  beforeEach(() => {
    tagsSignal.value = [
      { tag_id: 1, name: 'frontend' },
      { tag_id: 2, name: 'backend' },
    ];
  });

  it('renders dropdown with tag options', () => {
    render(<TagFilterDropdown value={undefined} onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: /filter by tag/i })).toBeInTheDocument();
  });

  it('calls onChange with selected tag id or undefined when cleared', () => {
    const handleChange = vi.fn();
    render(<TagFilterDropdown value={undefined} onChange={handleChange} />);

    const trigger = screen.getByRole('button', { name: /filter by tag/i });
    fireEvent.click(trigger);

    fireEvent.click(screen.getByRole('option', { name: '#frontend' }));
    expect(handleChange).toHaveBeenCalledWith('1');

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('option', { name: 'All Tags' }));
    expect(handleChange).toHaveBeenCalledWith(undefined);
  });
});
