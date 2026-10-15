import { renderHook } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { useDocumentTitle } from './useDocumentTitle.ts';

describe('useDocumentTitle hook', () => {
  it('updates document.title on mount', () => {
    renderHook(() => useDocumentTitle('Tasks — BareDo'));
    expect(document.title).toBe('Tasks — BareDo');
  });

  it('updates document.title when prop changes', () => {
    const { rerender } = renderHook(({ title }: { title: string }) => useDocumentTitle(title), {
      initialProps: { title: 'Initial Title' },
    });
    expect(document.title).toBe('Initial Title');

    rerender({ title: 'Updated Title — BareDo' });
    expect(document.title).toBe('Updated Title — BareDo');
  });
});
