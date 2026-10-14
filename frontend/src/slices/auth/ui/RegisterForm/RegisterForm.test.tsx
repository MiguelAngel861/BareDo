import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { LocationProvider } from 'preact-iso';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authState from '../../auth.state.ts';
import { RegisterForm } from './RegisterForm.tsx';

describe('RegisterForm component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all fields, password requirements, submit button, and login link', () => {
    render(
      <LocationProvider>
        <RegisterForm />
      </LocationProvider>
    );

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
    expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();

    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('validates fields on blur', async () => {
    render(
      <LocationProvider>
        <RegisterForm />
      </LocationProvider>
    );

    const usernameInput = screen.getByLabelText(/^username$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/^confirm password$/i);

    fireEvent.input(usernameInput, { target: { value: 'ab' } });
    fireEvent.blur(usernameInput);
    expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();

    fireEvent.input(passwordInput, { target: { value: '123' } });
    fireEvent.blur(passwordInput);
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();

    fireEvent.input(confirmInput, { target: { value: 'mismatch' } });
    fireEvent.blur(confirmInput);
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('shows validation errors and prevents submission when fields are invalid', async () => {
    const registerSpy = vi.spyOn(authState, 'register');

    render(
      <LocationProvider>
        <RegisterForm />
      </LocationProvider>
    );

    const form = document.getElementById('register-form');
    expect(form).not.toBeNull();
    if (form) {
      fireEvent.submit(form);
    }

    expect(registerSpy).not.toHaveBeenCalled();
    expect(screen.getByText('Username is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
  });

  it('calls register and navigates on successful submission', async () => {
    const registerSpy = vi.spyOn(authState, 'register').mockResolvedValue(undefined);

    render(
      <LocationProvider>
        <RegisterForm />
      </LocationProvider>
    );

    fireEvent.input(screen.getByLabelText(/^username$/i), { target: { value: 'newuser' } });
    fireEvent.input(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.input(screen.getByLabelText(/^confirm password$/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(registerSpy).toHaveBeenCalledWith('newuser', 'password123');
    });
  });

  it('displays global error message when registration fails', async () => {
    vi.spyOn(authState, 'register').mockRejectedValue(new Error('Username already exists'));

    render(
      <LocationProvider>
        <RegisterForm />
      </LocationProvider>
    );

    fireEvent.input(screen.getByLabelText(/^username$/i), { target: { value: 'existinguser' } });
    fireEvent.input(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } });
    fireEvent.input(screen.getByLabelText(/^confirm password$/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText('Username already exists')).toBeInTheDocument();
    });
  });

  it('toggles visibility for both password and confirm-password fields', () => {
    render(
      <LocationProvider>
        <RegisterForm />
      </LocationProvider>
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/^confirm password$/i);

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');

    const showPasswordBtn = screen.getByRole('button', { name: 'Show password' });
    const showConfirmBtn = screen.getByRole('button', { name: 'Show confirm password' });

    fireEvent.click(showPasswordBtn);
    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument();

    fireEvent.click(showConfirmBtn);
    expect(confirmInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide confirm password' })).toBeInTheDocument();
  });
});
