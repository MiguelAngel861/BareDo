import { useDocumentTitle } from '@/shared/hooks/index.ts';
import { RegisterForm, authSignal } from '@/slices/auth/index.ts';
import { useLocation } from 'preact-iso';
import { useEffect } from 'preact/hooks';

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
