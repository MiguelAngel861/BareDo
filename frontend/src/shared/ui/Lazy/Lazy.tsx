import type { ComponentChildren, ComponentType } from 'preact';
import { useEffect, useState } from 'preact/hooks';

export interface LazyProps {
  load: () => Promise<ComponentType>;
  fallback?: ComponentChildren;
}

export function Lazy({ load, fallback }: LazyProps) {
  const [Component, setComponent] = useState<ComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    load()
      .then((mod) => {
        if (!cancelled) {
          setComponent(mod);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [load]);

  if (error) {
    return <>{fallback ?? 'Error cargando el módulo'}</>;
  }
  if (!Component) {
    return <>{fallback ?? null}</>;
  }
  return <Component />;
}
