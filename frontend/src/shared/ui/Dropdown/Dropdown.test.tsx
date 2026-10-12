import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { Dropdown } from './Dropdown.tsx';

describe('Dropdown component', () => {
  const options = [
    { value: '1', label: 'Option One' },
    { value: '2', label: 'Option Two' },
  ];

  it('renders with placeholder when no value is selected', () => {
    render(
      <Dropdown
        options={options}
        value=""
        onChange={vi.fn()}
        placeholder="Select something"
        ariaLabel="Test dropdown"
      />
    );

    expect(screen.getByText('Select something')).toBeInTheDocument();
  });

  it('toggles options list on click', () => {
    render(
      <Dropdown
        options={options}
        value=""
        onChange={vi.fn()}
        placeholder="Select something"
        ariaLabel="Test dropdown"
      />
    );

    const trigger = screen.getByRole('button', { name: /test dropdown/i });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('Option One')).toBeInTheDocument();
    expect(screen.getByText('Option Two')).toBeInTheDocument();
  });

  it('calls onChange with selected value when an option is clicked', () => {
    const handleChange = vi.fn();
    render(
      <Dropdown options={options} value="" onChange={handleChange} placeholder="Select something" />
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    const option = screen.getByText('Option Two');
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith('2');
  });
});
