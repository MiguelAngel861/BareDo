import { fireEvent, render, screen } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { ShortcutHelpModal } from './ShortcutHelpModal.tsx';

describe('ShortcutHelpModal component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(<ShortcutHelpModal isOpen={false} onClose={() => {}} />);
    expect(container.querySelector('.shortcut-help-container')).not.toBeInTheDocument();
  });

  it('renders keyboard shortcuts sections and cards when isOpen is true', () => {
    render(<ShortcutHelpModal isOpen={true} onClose={() => {}} />);

    expect(screen.getByText('KEYBOARD SHORTCUTS')).toBeInTheDocument();
    expect(screen.getByText('Vim Navigation')).toBeInTheDocument();
    expect(screen.getByText('Select next task in list')).toBeInTheDocument();
    expect(screen.getByText('0MS OPTIMISTIC')).toBeInTheDocument();
    expect(screen.getByText('Global & System Commands')).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    let closed = false;
    render(
      <ShortcutHelpModal
        isOpen={true}
        onClose={() => {
          closed = true;
        }}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /cerrar modal de atajos/i });
    expect(closeBtn.textContent).toContain('ESC / CLOSE');
    fireEvent.click(closeBtn);

    expect(closed).toBe(true);
  });
});
