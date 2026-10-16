import { render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState.tsx';

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState title="NO TASKS FOUND" description="Create your first task to get started." />
    );
    expect(screen.getByText('NO TASKS FOUND')).toBeInTheDocument();
    expect(screen.getByText('Create your first task to get started.')).toBeInTheDocument();
  });

  it('renders tag when provided', () => {
    render(<EmptyState tag="STATUS: 0 TASKS" title="EMPTY" />);
    expect(screen.getByText('STATUS: 0 TASKS')).toBeInTheDocument();
  });

  it('renders action element', () => {
    render(<EmptyState title="EMPTY" action={<button type="button">Create Task</button>} />);
    expect(screen.getByRole('button', { name: 'Create Task' })).toBeInTheDocument();
  });
});
