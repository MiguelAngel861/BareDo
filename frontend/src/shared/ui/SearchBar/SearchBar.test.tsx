import { cleanup, fireEvent, render, screen } from '@testing-library/preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchBar } from './SearchBar.tsx';

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    cleanup();
  });

  it('renders search role, input and default placeholder', () => {
    render(<SearchBar placeholder="Find items..." ariaLabel="Search items" />);

    const searchRegion = screen.getByRole('search', { name: 'Search items' });
    const input = screen.getByPlaceholderText('Find items...');

    expect(searchRegion).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'search');
  });

  it('shows shortcut badge when unfocused and empty', () => {
    render(<SearchBar shortcutHint="/" defaultValue="" />);

    const badge = screen.getByText('/');
    expect(badge).toBeInTheDocument();
    expect(badge.tagName.toLowerCase()).toBe('kbd');
  });

  it('handles debounced typing and immediate change', () => {
    const handleSearch = vi.fn();
    const handleImmediateChange = vi.fn();

    render(
      <SearchBar
        debounceMs={300}
        onSearch={handleSearch}
        onImmediateChange={handleImmediateChange}
      />
    );

    const input = screen.getByRole('searchbox');
    fireEvent.input(input, { target: { value: 'fix bug' } });

    expect(handleImmediateChange).toHaveBeenCalledWith('fix bug');
    expect(handleSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(299);
    expect(handleSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(handleSearch).toHaveBeenCalledWith('fix bug');
  });

  it('triggers search immediately on Enter key press', () => {
    const handleSearch = vi.fn();

    render(<SearchBar debounceMs={300} onSearch={handleSearch} />);

    const input = screen.getByRole('searchbox');
    fireEvent.input(input, { target: { value: 'deploy release' } });

    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleSearch).toHaveBeenCalledTimes(1);
    expect(handleSearch).toHaveBeenCalledWith('deploy release');
  });

  it('clears query and notifies on Escape key press', () => {
    const handleSearch = vi.fn();
    const handleClear = vi.fn();

    render(<SearchBar defaultValue="something" onSearch={handleSearch} onClear={handleClear} />);

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    expect(input.value).toBe('something');

    fireEvent.keyDown(input, { key: 'Escape' });

    expect(input.value).toBe('');
    expect(handleSearch).toHaveBeenCalledWith('');
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('clears input when clicking clear button', () => {
    const handleSearch = vi.fn();
    const handleClear = vi.fn();

    render(<SearchBar defaultValue="search query" onSearch={handleSearch} onClear={handleClear} />);

    const clearBtn = screen.getByRole('button', { name: 'Clear search' });
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(handleSearch).toHaveBeenCalledWith('');
    expect(handleClear).toHaveBeenCalledTimes(1);
  });

  it('focuses input on global "/" shortcut when not editing', () => {
    render(<SearchBar enableGlobalShortcut={true} shortcutHint="/" />);

    const input = screen.getByRole('searchbox');
    const focusSpy = vi.spyOn(input, 'focus');

    // Simulate pressing "/" on document body
    fireEvent.keyDown(window, { key: '/' });

    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('does not trigger global shortcut if target is already an input', () => {
    render(
      <div>
        <input type="text" data-testid="other-input" />
        <SearchBar enableGlobalShortcut={true} shortcutHint="/" />
      </div>
    );

    const otherInput = screen.getByTestId('other-input');
    const searchInput = screen.getByRole('searchbox');
    const focusSpy = vi.spyOn(searchInput, 'focus');

    // Trigger keydown originating from other input
    fireEvent.keyDown(otherInput, { key: '/' });

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('renders loading spinner when isLoading is true', () => {
    render(<SearchBar isLoading={true} />);

    const spinner = screen.getByLabelText('Loading...');
    expect(spinner).toBeInTheDocument();
  });

  it('respects disabled prop', () => {
    const handleSearch = vi.fn();

    render(<SearchBar disabled={true} onSearch={handleSearch} />);

    const input = screen.getByRole('searchbox');
    expect(input).toBeDisabled();
  });

  it('updates internal state when controlled value prop changes', () => {
    const { rerender } = render(<SearchBar value="alpha" />);

    const input = screen.getByRole('searchbox') as HTMLInputElement;
    expect(input.value).toBe('alpha');

    rerender(<SearchBar value="beta" />);
    expect(input.value).toBe('beta');
  });
});
