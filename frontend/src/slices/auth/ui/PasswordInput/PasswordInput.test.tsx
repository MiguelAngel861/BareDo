import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { PasswordInput } from './PasswordInput.tsx';

describe('PasswordInput component', () => {
  it('renders input with type password initially and shows toggle button', () => {
    render(<PasswordInput id="pwd" name="pwd" value="secret123" />);

    const input = screen.getByDisplayValue('secret123');
    expect(input).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByRole('button', { name: 'Show password' });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('toggles input type between password and text on button click', () => {
    render(<PasswordInput id="pwd" name="pwd" value="secret123" />);

    const input = screen.getByDisplayValue('secret123');
    const toggleBtn = screen.getByRole('button', { name: 'Show password' });

    // Click to show password
    fireEvent.click(toggleBtn);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();

    // Click to hide password
    fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: 'Show password' })).toBeInTheDocument();
  });

  it('supports custom toggle aria labels', () => {
    render(
      <PasswordInput
        id="confirm-pwd"
        name="confirm-pwd"
        value="secret123"
        toggleAriaLabel={{
          show: 'Show confirm password',
          hide: 'Hide confirm password',
        }}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: 'Show confirm password' });
    expect(toggleBtn).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByRole('button', { name: 'Hide confirm password' })).toBeInTheDocument();
  });
});
