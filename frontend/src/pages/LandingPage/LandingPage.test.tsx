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

  it('renders interactive sandbox with latency telemetry and supports task toggle', () => {
    render(
      <LocationProvider>
        <LandingPage />
      </LocationProvider>
    );

    // Verify telemetry readout is rendered
    expect(screen.getByLabelText(/System Performance Readout/i)).toBeInTheDocument();
    expect(screen.getByText(/LATENCY:/i)).toBeInTheDocument();

    const taskTitle = screen.getByText('Refactor auth middleware to zero-allocation pipeline');
    expect(taskTitle).toBeInTheDocument();

    // Click task row to toggle
    const taskRow = taskTitle.closest('li');
    expect(taskRow).toBeInTheDocument();
    if (taskRow) {
      fireEvent.click(taskRow);
      expect(taskRow.className).toContain('is-completed');
    }
  });

  it('supports keyboard navigation inside sandbox region', () => {
    render(
      <LocationProvider>
        <LandingPage />
      </LocationProvider>
    );

    const sandbox = screen.getByRole('region', {
      name: /Interactive Vim Keyboard Sandbox/i,
    });
    expect(sandbox).toBeInTheDocument();

    // Press 'j' to move cursor down
    fireEvent.keyDown(sandbox, { key: 'j' });
    expect(screen.getByText(/FOCUS TASK_02/i)).toBeInTheDocument();

    // Press 'k' to move cursor up
    fireEvent.keyDown(sandbox, { key: 'k' });
    expect(screen.getByText(/FOCUS TASK_01/i)).toBeInTheDocument();

    // Press 'c' to append a task
    fireEvent.keyDown(sandbox, { key: 'c' });
    expect(screen.getByText(/APPENDED TASK_04/i)).toBeInTheDocument();

    // Press 'r' to reset
    fireEvent.keyDown(sandbox, { key: 'r' });
    expect(screen.getByText(/QUEUE_RESTORED/i)).toBeInTheDocument();
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
