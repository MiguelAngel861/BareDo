import { describe, expect, it } from 'vitest';
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
});
