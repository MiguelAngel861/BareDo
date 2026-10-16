import { signal } from '@preact/signals';
import { prioritiesApi } from './priorities.api.ts';
import type { Priority } from './priorities.types.ts';

export const prioritiesSignal = signal<Priority[]>([
  { priority_id: 1, name: 'Low', level: 1, description: 'Tareas sin urgencia' },
  { priority_id: 2, name: 'Medium-Low', level: 2, description: 'Tareas de baja prioridad' },
  { priority_id: 3, name: 'Medium', level: 3, description: 'Tareas regulares' },
  { priority_id: 4, name: 'Medium-High', level: 4, description: 'Tareas de alta atención' },
  { priority_id: 5, name: 'High', level: 5, description: 'Tareas críticas y urgentes' },
]);

export const priorityDescriptionsSignal = signal<Map<number, string>>(new Map());

export async function fetchPriorities(): Promise<void> {
  try {
    const res = await prioritiesApi.list();
    if (res.priorities && res.priorities.length > 0) {
      prioritiesSignal.value = res.priorities;
      const descMap = new Map<number, string>();
      for (const p of res.priorities) {
        if (p.description) {
          descMap.set(p.priority_id, p.description);
        }
      }
      priorityDescriptionsSignal.value = descMap;
    }
  } catch {
    // Si falla, se usan las prioridades base por defecto
  }
}

export function getPriorityLabel(id: number): string {
  const p = prioritiesSignal.value.find((item) => item.priority_id === id);
  return p ? p.name : `Priority ${id}`;
}

export function getPriorityDescription(id: number): string {
  return priorityDescriptionsSignal.value.get(id) || '';
}

export type PriorityBadgeVariant = 'danger' | 'solid' | 'outline' | 'default';

export function getPriorityBadgeVariant(id: number): PriorityBadgeVariant {
  if (id === 5) {
    return 'danger';
  }
  if (id === 4) {
    return 'solid';
  }
  if (id === 3) {
    return 'outline';
  }
  return 'default';
}
