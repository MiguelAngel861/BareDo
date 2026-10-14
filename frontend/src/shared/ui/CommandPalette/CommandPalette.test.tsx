import { fireEvent, render, screen } from '@testing-library/preact';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommandPalette } from './CommandPalette.tsx';
import {
  closeCommandPalette,
  isCommandPaletteOpenSignal,
  openCommandPalette,
} from './command-palette.state.ts';

describe('CommandPalette component', () => {
  beforeEach(() => {
    closeCommandPalette();
    vi.restoreAllMocks();
  });

  it('does not render dialog content when closed', () => {
    const { container } = render(<CommandPalette />);
    expect(container.querySelector('.command-palette-container')).not.toBeInTheDocument();
  });

  it('renders command list and search input when open', () => {
    openCommandPalette();
    render(<CommandPalette />);

    expect(screen.getByPlaceholderText('Type a command or search tasks...')).toBeInTheDocument();
    expect(screen.getByText('Create new task')).toBeInTheDocument();
    expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    expect(screen.getByText('View keyboard shortcuts guide')).toBeInTheDocument();
  });

  it('filters command list dynamically based on input query', () => {
    openCommandPalette();
    render(<CommandPalette />);

    const input = screen.getByPlaceholderText('Type a command or search tasks...');
    fireEvent.input(input, { target: { value: 'clear' } });

    expect(screen.getByText('Clear all filters')).toBeInTheDocument();
    expect(screen.queryByText('Create new task')).not.toBeInTheDocument();
  });

  it('opens and closes via toggleCommandPalette or keyboard shortcut Ctrl+K', () => {
    render(<CommandPalette />);
    expect(isCommandPaletteOpenSignal.value).toBe(false);

    // Simulate global Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(isCommandPaletteOpenSignal.value).toBe(true);

    // Simulate second Ctrl+K to toggle close
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(isCommandPaletteOpenSignal.value).toBe(false);
  });

  it('closes command palette when ESC / CLOSE ghost button is clicked', () => {
    openCommandPalette();
    render(<CommandPalette />);

    const closeBtn = screen.getByRole('button', { name: /cerrar paleta de comandos/i });
    expect(closeBtn).toBeInTheDocument();
    expect(closeBtn.textContent).toContain('ESC / CLOSE');

    fireEvent.click(closeBtn);
    expect(isCommandPaletteOpenSignal.value).toBe(false);
  });
});
