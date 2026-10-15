import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './Checkbox.tsx';

describe('Checkbox', () => {
  it('renders unchecked checkbox with label', () => {
    render(<Checkbox checked={false} label="Accept terms" />);

    const input = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect(input).toBeInTheDocument();
    expect(input).not.toBeChecked();
  });

  it('renders checked checkbox', () => {
    render(<Checkbox checked={true} label="Completed" />);

    const input = screen.getByRole('checkbox', { name: 'Completed' });
    expect(input).toBeChecked();
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox checked={false} label="Task item" onChange={handleChange} />);

    const input = screen.getByRole('checkbox', { name: 'Task item' });
    fireEvent.click(input);

    expect(handleChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('respects disabled state', () => {
    const handleChange = vi.fn();
    render(
      <Checkbox checked={false} disabled={true} label="Disabled item" onChange={handleChange} />
    );

    const input = screen.getByRole('checkbox', { name: 'Disabled item' });
    expect(input).toBeDisabled();

    fireEvent.click(input);
    expect(handleChange).not.toHaveBeenCalled();
  });
});
