import { useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { useDocumentTitle } from '@/shared/hooks/index.ts';
import { authSignal, LoginForm } from '@/slices/auth/index.ts';

export function LoginPage() {
  useDocumentTitle('Sign In — BareDo');
  const location = useLocation();

  useEffect(() => {
    if (authSignal.value.isAuthenticated) {
      location.route('/');
    }
  }, [location]);

  return <LoginForm />;
}
