import { render, screen } from '@testing-library/preact';
import { LocationProvider } from 'preact-iso';
import { describe, expect, it } from 'vitest';
import { LoginForm } from './LoginForm.tsx';

describe('LoginForm component', () => {
  it('renders username and password inputs with submit button', () => {
    render(
      <LocationProvider>
        <LoginForm />
      </LocationProvider>
    );

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toHaveAttribute('href', '/register');
  });
});
