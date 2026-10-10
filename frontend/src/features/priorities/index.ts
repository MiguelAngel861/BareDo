export { prioritiesApi } from './api.ts';
export * from './schemas.ts';
export type { Priority, PriorityListResponse } from './types.ts';

export const PRIORITY_LABELS: Record<number, string> = {
  1: 'Low',
  2: 'Medium-Low',
  3: 'Medium',
  4: 'Medium-High',
  5: 'High',
};

export function getPriorityLabel(priorityId: number): string {
  return PRIORITY_LABELS[priorityId] || 'Medium';
}
