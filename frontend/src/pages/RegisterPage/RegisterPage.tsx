import { useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { useDocumentTitle } from '@/shared/hooks/index.ts';
import { authSignal, RegisterForm } from '@/slices/auth/index.ts';

export function RegisterPage() {
  useDocumentTitle('Create Account — BareDo');
  const location = useLocation();

  useEffect(() => {
    if (authSignal.value.isAuthenticated) {
      location.route('/');
    }
  }, [location]);

  return <RegisterForm />;
}
