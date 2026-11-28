import { fireEvent, render, screen } from '@testing-library/preact';
import { LocationProvider } from 'preact-iso';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LandingPage } from './LandingPage.tsx';

describe('LandingPage component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders brand lockup, headline, and subtext', () => {
    render(
      <LocationProvider>
        <LandingPage />
      </LocationProvider>
    );

    // Verify brand name
    const brandElements = screen.getAllByText('BAREDO');
    expect(brandElements.length).toBeGreaterThanOrEqual(1);

    // Verify hero headline
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/CUT THE NOISE/i);

    // Verify creed in footer
    expect(screen.getByText('CUT THE NOISE. EXECUTE.')).toBeInTheDocument();

    // Verify header calibration badge is removed
    expect(screen.queryByText('REV_1.0 // ZERO_TELEMETRY')).not.toBeInTheDocument();
  });

  it('renders all key sections with technical inspection indices', () => {
    render(
      <LocationProvider>
        <LandingPage />
      </LocationProvider>
    );

    // Section 2: Shortcuts
    expect(screen.getByRole('heading', { name: /ZERO MOUSE DEPENDENCY/i })).toBeInTheDocument();
    expect(screen.getByText('[ 01 / 04 ] // INPUT_PIPELINE')).toBeInTheDocument();

    // Section 3: Philosophy
    expect(screen.getByRole('heading', { name: /AMPUTATING THE BLOAT/i })).toBeInTheDocument();
    expect(screen.getByText('[ 02 / 04 ] // REDUCTION_AUDIT')).toBeInTheDocument();

    // Section 4: Workflow
    expect(screen.getByRole('heading', { name: /THE 3-SECOND RITUAL/i })).toBeInTheDocument();
    expect(screen.getByText('[ 03 / 04 ] // WORKFLOW_RITUAL')).toBeInTheDocument();

    // Section 5: Covenant
    expect(
      screen.getByRole('heading', { name: /A CONTRACT WITH YOUR ATTENTION/i })
    ).toBeInTheDocument();
    expect(screen.getByText('[ 04 / 04 ] // ATTENTION_COVENANT')).toBeInTheDocument();
  });

  it('renders clean BareDo task demo without fake telemetry and supports task toggle', () => {
    render(
      <LocationProvider>
        <LandingPage />
      </LocationProvider>
    );

    expect(screen.getByText('TASKS')).toBeInTheDocument();
    expect(screen.getByText('3 tasks')).toBeInTheDocument();
    expect(screen.queryByText(/LATENCY/i)).not.toBeInTheDocument();
    expect(screen.queryByText('SIMULATE')).not.toBeInTheDocument();

    const taskTitle = screen.getByText('Refactor auth middleware');
    expect(taskTitle).toBeInTheDocument();

    const taskRow = taskTitle.closest('li');
    expect(taskRow).toBeInTheDocument();
    if (taskRow) {
      fireEvent.click(taskRow);
      expect(taskRow.className).toContain('is-completed');
    }
  });

  it('supports keyboard navigation, inline task creation, and deletion inside demo', () => {
    render(
      <LocationProvider>
        <LandingPage />
      </LocationProvider>
    );

    const sandbox = screen.getByRole('region', {
      name: /Interactive BareDo Task Demo/i,
    });
    expect(sandbox).toBeInTheDocument();

    const getRows = () => sandbox.querySelectorAll('li.sandbox-task-row');

    // Initial selection is row 0; press 'j' to move to row 1
    fireEvent.keyDown(sandbox, { key: 'j' });
    expect(getRows()[1]?.className).toContain('is-selected');

    // Press 'k' to move back to row 0
    fireEvent.keyDown(sandbox, { key: 'k' });
    expect(getRows()[0]?.className).toContain('is-selected');

    // Press Space to toggle completion on selected row
    fireEvent.keyDown(sandbox, { key: ' ' });
    expect(getRows()[0]?.className).toContain('is-completed');

    // Press 'c' to open inline input, type a real task, and submit
    fireEvent.keyDown(sandbox, { key: 'c' });
    const input = screen.getByLabelText('New task title');
    fireEvent.input(input, { target: { value: 'Deploy release v2.0' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);
    expect(screen.getByText('Deploy release v2.0')).toBeInTheDocument();
    expect(screen.getByText('4 tasks')).toBeInTheDocument();

    // Press 'd' to delete newly created selected task
    fireEvent.keyDown(sandbox, { key: 'd' });
    expect(screen.queryByText('Deploy release v2.0')).not.toBeInTheDocument();
    expect(screen.getByText('3 tasks')).toBeInTheDocument();
  });

  it('renders call to action buttons without keyboard badge', () => {
    render(
      <LocationProvider>
        <LandingPage />
      </LocationProvider>
    );

    const registerLinks = screen.getAllByRole('link', { name: /REGISTER/i });
    expect(registerLinks.length).toBeGreaterThanOrEqual(1);

    const signInLinks = screen.getAllByRole('link', { name: /SIGN IN/i });
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);

    // Verify Enter key affordance badge is removed
    expect(screen.queryByText('↵ ENTER')).not.toBeInTheDocument();
  });
});
