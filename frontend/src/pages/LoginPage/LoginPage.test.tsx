import { authSignal } from '@/slices/auth/index.ts';
import { render, screen } from '@testing-library/preact';
import { LocationProvider } from 'preact-iso';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage.tsx';

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

describe('LoginPage component', () => {
  beforeEach(() => {
    mockRoute.mockClear();
    authSignal.value = {
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
  });

  it('renders LoginForm when user is not authenticated', () => {
    render(
      <LocationProvider>
        <LoginPage />
      </LocationProvider>
    );

    expect(screen.getByLabelText(/^username$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(document.title).toBe('Sign In — BareDo');
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
        <LoginPage />
      </LocationProvider>
    );

    expect(mockRoute).toHaveBeenCalledWith('/');
  });
});
