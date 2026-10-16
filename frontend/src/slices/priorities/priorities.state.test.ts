import { describe, expect, it, vi } from 'vitest';
import {
  getPriorityBadgeVariant,
  getPriorityDescription,
  getPriorityLabel,
  priorityDescriptionsSignal,
} from './priorities.state.ts';

describe('priorities.state helpers', () => {
  it('returns default priority label if not found or correct name if found', () => {
    expect(getPriorityLabel(1)).toBe('Low');
    expect(getPriorityLabel(5)).toBe('High');
    expect(getPriorityLabel(999)).toBe('Priority 999');
  });

  it('returns description from priorityDescriptionsSignal or empty string', () => {
    priorityDescriptionsSignal.value = new Map([[1, 'Low priority description']]);
    expect(getPriorityDescription(1)).toBe('Low priority description');
    expect(getPriorityDescription(2)).toBe('');
  });

  it('maps priority ID to appropriate badge variant', () => {
    expect(getPriorityBadgeVariant(5)).toBe('danger');
    expect(getPriorityBadgeVariant(4)).toBe('solid');
    expect(getPriorityBadgeVariant(3)).toBe('outline');
    expect(getPriorityBadgeVariant(2)).toBe('default');
    expect(getPriorityBadgeVariant(1)).toBe('default');
  });

  it('fetchPriorities updates signals on successful response', async () => {
    const { prioritiesApi } = await import('./priorities.api.ts');
    const { fetchPriorities, prioritiesSignal } = await import('./priorities.state.ts');

    const mockPriorities = [{ priority_id: 1, name: 'Urgent', level: 1, description: 'Do it now' }];
    vi.spyOn(prioritiesApi, 'list').mockResolvedValueOnce({ priorities: mockPriorities });

    await fetchPriorities();

    expect(prioritiesSignal.value).toEqual(mockPriorities);
    expect(priorityDescriptionsSignal.value.get(1)).toBe('Do it now');
  });

  it('fetchPriorities keeps current priorities on error', async () => {
    const { prioritiesApi } = await import('./priorities.api.ts');
    const { fetchPriorities, prioritiesSignal } = await import('./priorities.state.ts');

    const currentPriorities = [...prioritiesSignal.value];
    vi.spyOn(prioritiesApi, 'list').mockRejectedValueOnce(new Error('Network failure'));

    await fetchPriorities();

    expect(prioritiesSignal.value).toEqual(currentPriorities);
  });
});
