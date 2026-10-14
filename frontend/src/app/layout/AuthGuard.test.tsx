import { authSignal } from '@/slices/auth/index.ts';
import { render, screen } from '@testing-library/preact';
import { LocationProvider } from 'preact-iso';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuthGuard } from './AuthGuard.tsx';

describe('AuthGuard component', () => {
  beforeEach(() => {
    authSignal.value = {
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };
  });

  it('renders children when user is authenticated', () => {
    authSignal.value = {
      token: 'valid-token',
      user: { user_id: '1', username: 'john', created_at: '2026-01-01' },
      isAuthenticated: true,
      isLoading: false,
    };

    render(
      <LocationProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </LocationProvider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('does not render children when user is not authenticated', () => {
    authSignal.value = {
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };

    render(
      <LocationProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </LocationProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('unmounts children when isAuthenticated changes from true to false', () => {
    authSignal.value = {
      token: 'valid-token',
      user: { user_id: '1', username: 'john', created_at: '2026-01-01' },
      isAuthenticated: true,
      isLoading: false,
    };

    const { rerender } = render(
      <LocationProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </LocationProvider>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();

    // Simular logout
    authSignal.value = {
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    };

    rerender(
      <LocationProvider>
        <AuthGuard>
          <div>Protected Content</div>
        </AuthGuard>
      </LocationProvider>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
