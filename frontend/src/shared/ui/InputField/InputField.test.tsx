import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { InputField } from './InputField.tsx';

describe('InputField', () => {
  it('renders input with label and handles typing', () => {
    const handleInput = vi.fn();
    render(
      <InputField
        id="test-input"
        label="Username"
        placeholder="Enter username"
        onInput={handleInput}
      />
    );

    const input = screen.getByLabelText('Username');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter username');

    fireEvent.input(input, { target: { value: 'miguel' } });
    expect(handleInput).toHaveBeenCalledWith('miguel', expect.any(Object));
  });

  it('renders required indicator', () => {
    render(<InputField id="title" label="Title" required={true} showAsterisk={true} />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('renders error message and sets aria-invalid and aria-describedby', () => {
    render(<InputField id="email" label="Email" error="Invalid email format" />);

    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');

    const errorMsg = screen.getByRole('alert');
    expect(errorMsg).toHaveTextContent('Invalid email format');
  });

  it('renders hint text', () => {
    render(<InputField id="tags" label="Tags" hint="max 7 items" />);
    expect(screen.getByText('max 7 items')).toBeInTheDocument();
  });
});
