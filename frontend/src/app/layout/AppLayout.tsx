import { ServerWarmupBanner, ToastContainer } from '@/shared/ui/index.ts';
import { initAuth } from '@/slices/auth/index.ts';
import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';

export function AppLayout({ children }: { children: ComponentChildren }) {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <div class="app-layout">
      <ServerWarmupBanner />
      <ToastContainer />
      {children}
    </div>
  );
}
