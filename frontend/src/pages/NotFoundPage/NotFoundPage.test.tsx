import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { NotFoundPage } from './NotFoundPage.tsx';

describe('NotFoundPage component', () => {
  it('renders 404 code, error title and description', () => {
    render(<NotFoundPage />);

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Page Not Found' })).toBeInTheDocument();
    expect(
      screen.getByText('The resource you requested does not exist or has been moved.')
    ).toBeInTheDocument();
    expect(screen.getByText('STATUS: 404')).toBeInTheDocument();
    expect(screen.getByText('RESOURCE: MISSING')).toBeInTheDocument();
  });

  it('renders the return home link pointing to "/"', () => {
    render(<NotFoundPage />);

    const homeLink = screen.getByRole('button', { name: /Return Home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
