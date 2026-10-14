import { authSignal, logout } from '@/slices/auth/index.ts';
import { fetchPriorities } from '@/slices/priorities/index.ts';
import { fetchTags, openManageTagsModal } from '@/slices/tags/index.ts';
import {
  deletingTaskSignal,
  fetchTrashCount,
  isShortcutHelpModalOpenSignal,
  loadTasks,
  openCreateModal,
  openShortcutHelpModal,
  openTrashModal,
  paginationSignal,
  selectNextTask,
  selectPrevTask,
  trashCountSignal,
} from '@/slices/tasks/index.ts';
import { fireEvent, render, screen } from '@testing-library/preact';
import { LocationProvider } from 'preact-iso';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage.tsx';

const mockRoute = vi.fn();

vi.mock('preact-iso', async () => {
  const actual = await vi.importActual<typeof import('preact-iso')>('preact-iso');
  return {
    ...actual,
    useLocation: () => ({
      ...actual.useLocation(),
      route: mockRoute,
    }),
  };
});

vi.mock('@/slices/tasks/index.ts', async () => {
  const actual =
    await vi.importActual<typeof import('@/slices/tasks/index.ts')>('@/slices/tasks/index.ts');
  return {
    ...actual,
    loadTasks: vi.fn(),
    fetchTrashCount: vi.fn(),
    openCreateModal: vi.fn(),
    openTrashModal: vi.fn(),
    openShortcutHelpModal: vi.fn(),
    selectNextTask: vi.fn(),
    selectPrevTask: vi.fn(),
  };
});

vi.mock('@/slices/priorities/index.ts', async () => {
  const actual = await vi.importActual<typeof import('@/slices/priorities/index.ts')>(
    '@/slices/priorities/index.ts'
  );
  return {
    ...actual,
    fetchPriorities: vi.fn(),
  };
});

vi.mock('@/slices/tags/index.ts', async () => {
  const actual =
    await vi.importActual<typeof import('@/slices/tags/index.ts')>('@/slices/tags/index.ts');
  return {
    ...actual,
    fetchTags: vi.fn(),
    openManageTagsModal: vi.fn(),
  };
});

vi.mock('@/slices/auth/index.ts', async () => {
  const actual =
    await vi.importActual<typeof import('@/slices/auth/index.ts')>('@/slices/auth/index.ts');
  return {
    ...actual,
    logout: vi.fn(),
  };
});

describe('HomePage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    authSignal.value = {
      token: 'valid-token',
      user: { user_id: '1', username: 'antigravity_user', created_at: '2026-01-01' },
      isAuthenticated: true,
      isLoading: false,
    };

    paginationSignal.value = {
      page: 1,
      per_page: 20,
      total_items: 5,
      total_pages: 1,
      has_prev: false,
      has_next: false,
    };

    trashCountSignal.value = 2;
    deletingTaskSignal.value = null;
    isShortcutHelpModalOpenSignal.value = false;
  });

  it('triggers initial data loads on mount', () => {
    render(
      <LocationProvider>
        <HomePage />
      </LocationProvider>
    );

    expect(loadTasks).toHaveBeenCalledTimes(1);
    expect(fetchPriorities).toHaveBeenCalledTimes(1);
    expect(fetchTags).toHaveBeenCalledTimes(1);
    expect(fetchTrashCount).toHaveBeenCalledTimes(1);
  });

  it('renders header with username, task count, and action buttons', () => {
    render(
      <LocationProvider>
        <HomePage />
      </LocationProvider>
    );

    expect(screen.getByText('antigravity_user')).toBeInTheDocument();
    expect(screen.getByText('5 tasks')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /TRASH \(2\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /MANAGE TAGS/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ CREATE TASK/i })).toBeInTheDocument();
  });

  it('handles logout clicking and redirects to /login', () => {
    render(
      <LocationProvider>
        <HomePage />
      </LocationProvider>
    );

    const logoutBtn = screen.getByRole('button', { name: /Logout/i });
    fireEvent.click(logoutBtn);

    expect(logout).toHaveBeenCalledTimes(1);
    expect(mockRoute).toHaveBeenCalledWith('/login');
  });

  it('opens create modal when clicking "+ CREATE TASK"', () => {
    render(
      <LocationProvider>
        <HomePage />
      </LocationProvider>
    );

    const createBtn = screen.getByRole('button', { name: /\+ CREATE TASK/i });
    fireEvent.click(createBtn);

    expect(openCreateModal).toHaveBeenCalledTimes(1);
  });

  it('opens trash and manage tags modals on button clicks', () => {
    render(
      <LocationProvider>
        <HomePage />
      </LocationProvider>
    );

    const trashBtn = screen.getByRole('button', { name: /TRASH \(2\)/i });
    fireEvent.click(trashBtn);
    expect(openTrashModal).toHaveBeenCalledTimes(1);

    const manageTagsBtn = screen.getByRole('button', { name: /MANAGE TAGS/i });
    fireEvent.click(manageTagsBtn);
    expect(openManageTagsModal).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard shortcuts (c, ?, j, k) when no modal is open', () => {
    render(
      <LocationProvider>
        <HomePage />
      </LocationProvider>
    );

    fireEvent.keyDown(window, { key: 'c' });
    expect(openCreateModal).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: '?' });
    expect(openShortcutHelpModal).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'j' });
    expect(selectNextTask).toHaveBeenCalled();

    fireEvent.keyDown(window, { key: 'k' });
    expect(selectPrevTask).toHaveBeenCalled();
  });
});
