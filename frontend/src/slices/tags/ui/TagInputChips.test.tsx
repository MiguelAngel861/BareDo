import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as tagsState from '../tags.state.ts';
import type { Tag } from '../tags.types.ts';
import { TagInputChips } from './TagInputChips.tsx';

describe('TagInputChips', () => {
  const tag1: Tag = { tag_id: 1, name: 'work' };
  const tag2: Tag = { tag_id: 2, name: 'home' };
  const tag3: Tag = { tag_id: 3, name: 'urgent' };
  const mockTags: Tag[] = [tag1, tag2, tag3];

  beforeEach(() => {
    vi.restoreAllMocks();
    tagsState.tagsSignal.value = [...mockTags];
    vi.spyOn(tagsState, 'fetchTags').mockImplementation(async () => {});
    vi.spyOn(tagsState, 'findOrCreateTag').mockImplementation(async (name) => ({
      tag_id: 999,
      name,
    }));
  });

  it('renders chips for passed tags and allows removing a chip', () => {
    const handleChange = vi.fn();
    render(<TagInputChips tags={[tag1]} onChange={handleChange} />);

    expect(screen.getByText('#work')).toBeInTheDocument();
    const removeBtn = screen.getByLabelText('Remove tag work');
    fireEvent.click(removeBtn);

    expect(handleChange).toHaveBeenCalledWith([]);
  });

  it('shows matching existing tags in the combobox dropdown on input', async () => {
    const handleChange = vi.fn();
    render(<TagInputChips tags={[]} onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: 'urg' } });

    expect(screen.getByText('#urgent')).toBeInTheDocument();
    expect(screen.queryByText('#work')).not.toBeInTheDocument();
  });

  it('shows "+ Create tag" explicit option when typing an unexisting tag', async () => {
    const handleChange = vi.fn();
    render(<TagInputChips tags={[]} onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: 'personal' } });

    expect(screen.getByText('#personal')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
  });

  it('selects an existing tag when clicking from the dropdown', async () => {
    const handleChange = vi.fn();
    render(<TagInputChips tags={[]} onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: 'wo' } });

    const item = screen.getByText('#work');
    fireEvent.click(item);

    expect(handleChange).toHaveBeenCalledWith([tag1]);
  });

  it('creates and adds a tag when clicking the explicit create option', async () => {
    const createdTag: Tag = { tag_id: 99, name: 'newtag' };
    vi.spyOn(tagsState, 'findOrCreateTag').mockResolvedValue(createdTag);

    const handleChange = vi.fn();
    render(<TagInputChips tags={[]} onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: 'newtag' } });

    const createOption = screen.getByRole('option', { name: /create tag/i });
    fireEvent.click(createOption);

    expect(tagsState.findOrCreateTag).toHaveBeenCalledWith('newtag');
  });

  it('removes the last tag on Backspace when input is empty', () => {
    const handleChange = vi.fn();
    render(<TagInputChips tags={[tag1, tag2]} onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Backspace' });

    expect(handleChange).toHaveBeenCalledWith([tag1]);
  });

  it('navigates options with ArrowDown and selects with Enter', async () => {
    const handleChange = vi.fn();
    render(<TagInputChips tags={[]} onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    fireEvent.input(input, { target: { value: 'ho' } });

    // ArrowDown highlights option
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleChange).toHaveBeenCalledWith([tag2]);
  });

  it('prevents adding more than 7 tags', () => {
    const sevenTags: Tag[] = Array.from({ length: 7 }, (_, i) => ({
      tag_id: i + 1,
      name: `t${i}`,
    }));

    const handleChange = vi.fn();
    render(<TagInputChips tags={sevenTags} onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(screen.getByPlaceholderText('Max tags reached')).toBeInTheDocument();
  });
});
