import { HomePage, LoginPage, NotFoundPage, RegisterPage } from '@/pages/index.ts';
import { LocationProvider, Route, Router } from 'preact-iso';
import { AppLayout } from './layout/AppLayout.tsx';
import { AuthGuard } from './layout/AuthGuard.tsx';

function ProtectedHome() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  );
}

export function App() {
  return (
    <LocationProvider>
      <AppLayout>
        <Router>
          <Route path="/" component={ProtectedHome} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route default component={NotFoundPage} />
        </Router>
      </AppLayout>
    </LocationProvider>
  );
}
