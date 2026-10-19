import { HomePage, LandingPage, LoginPage, NotFoundPage, RegisterPage } from '@/pages/index.ts';
import { authSignal } from '@/slices/auth/index.ts';
import { LocationProvider, Route, Router } from 'preact-iso';
import { AppLayout } from './layout/AppLayout.tsx';
import { AuthGuard } from './layout/AuthGuard.tsx';

function RootRoute() {
  if (authSignal.value.isAuthenticated) {
    return <HomePage />;
  }
  return <LandingPage />;
}

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
          <Route path="/" component={RootRoute} />
          <Route path="/tasks" component={ProtectedHome} />
          <Route path="/landing" component={LandingPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route default component={NotFoundPage} />
        </Router>
      </AppLayout>
    </LocationProvider>
  );
}
