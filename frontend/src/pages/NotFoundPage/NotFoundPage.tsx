import { useDocumentTitle } from '@/shared/hooks/index.ts';
import './NotFoundPage.css';

export function NotFoundPage() {
  useDocumentTitle('404 Not Found — BareDo');
  return (
    <main class="error-page">
      <div class="error-content">
        <div class="error-code" aria-hidden="true">
          404
        </div>
        <div class="error-divider" />
        <div class="error-info">
          <span class="error-tag">ERROR</span>
          <h1>Page Not Found</h1>
          <p class="error-description">
            The resource you requested does not exist or has been moved.
          </p>
          <div class="error-meta">
            <span class="meta-item">STATUS: 404</span>
            <span class="meta-separator">/</span>
            <span class="meta-item">RESOURCE: MISSING</span>
          </div>
        </div>
        <a href="/" class="error-action" role="button">
          <span class="action-label">Return Home</span>
          <span class="action-arrow">&rarr;</span>
        </a>
      </div>
    </main>
  );
}
