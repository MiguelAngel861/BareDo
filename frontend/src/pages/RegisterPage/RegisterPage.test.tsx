import { authSignal } from '@/slices/auth/index.ts';
import { render, screen } from '@testing-library/preact';
import { LocationProvider } from 'preact-iso';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterPage } from './RegisterPage.tsx';

const mockRoute = vi.fn();

vi.mock('preact-iso', async () => {
  const actual = await vi.importActual<typeof import('preact-iso')>('preact-iso');
  return {
    ...actual,
    useLocation: () => ({
      ...actual.useLocation(),
      route: mockRoute,
    }),
  };
});

describe('RegisterPage component', () => {
  beforeEach(() => {
    mockRoute.mockClear();
    authSignal.value = {
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
  });

  it('renders RegisterForm when user is not authenticated', () => {
    render(
      <LocationProvider>
        <RegisterPage />
      </LocationProvider>
    );

    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(document.title).toBe('Create Account — BareDo');
    expect(mockRoute).not.toHaveBeenCalled();
  });

  it('redirects to "/" when user is already authenticated', () => {
    authSignal.value = {
      token: 'jwt-token',
      user: { user_id: '1', username: 'john', created_at: '2026-01-01' },
      isAuthenticated: true,
      isLoading: false,
    };

    render(
      <LocationProvider>
        <RegisterPage />
      </LocationProvider>
    );

    expect(mockRoute).toHaveBeenCalledWith('/');
  });
});
