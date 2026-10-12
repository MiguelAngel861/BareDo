import { authSignal } from '@/slices/auth/index.ts';
import type { ComponentChildren } from 'preact';
import { useLocation } from 'preact-iso';
import { useEffect } from 'preact/hooks';

export function AuthGuard({ children }: { children: ComponentChildren }) {
  const location = useLocation();

  useEffect(() => {
    if (!authSignal.value.isAuthenticated) {
      location.route('/login');
    }
  }, [location]);

  if (!authSignal.value.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
