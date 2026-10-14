import { LoginForm, authSignal } from '@/slices/auth/index.ts';
import { useLocation } from 'preact-iso';
import { useEffect } from 'preact/hooks';

export function LoginPage() {
  const location = useLocation();

  useEffect(() => {
    if (authSignal.value.isAuthenticated) {
      location.route('/');
    }
  }, [location]);

  return <LoginForm />;
}
