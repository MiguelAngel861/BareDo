import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { AuthCard } from './AuthCard.tsx';

describe('AuthCard component', () => {
  it('renders title, children and footer', () => {
    render(
      <AuthCard title="Test Title" footer={<a href="/test">Test Link</a>}>
        <div data-testid="child-content">Child Content</div>
      </AuthCard>
    );

    expect(screen.getByRole('heading', { name: 'Test Title' })).toBeInTheDocument();
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Test Link' })).toHaveAttribute('href', '/test');
  });

  it('renders without footer when footer is not provided', () => {
    const { container } = render(
      <AuthCard title="No Footer">
        <p>Only children</p>
      </AuthCard>
    );

    expect(screen.getByRole('heading', { name: 'No Footer' })).toBeInTheDocument();
    expect(container.querySelector('.switch-link')).toBeNull();
  });
});
