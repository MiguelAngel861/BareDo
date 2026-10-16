import { apiClient } from '@/shared/api/client/index.ts';
import type { PriorityListResponse } from './priorities.types.ts';

let cachedPrioritiesPromise: Promise<PriorityListResponse> | null = null;
let cachedDescriptions: Map<number, string> | null = null;

export const prioritiesApi = {
  list: (): Promise<PriorityListResponse> => {
    if (!cachedPrioritiesPromise) {
      cachedPrioritiesPromise = apiClient.get('priorities').json<PriorityListResponse>();
    }
    return cachedPrioritiesPromise;
  },

  getDescriptions: async (): Promise<Map<number, string>> => {
    if (cachedDescriptions) {
      return cachedDescriptions;
    }
    try {
      const data = await prioritiesApi.list();
      cachedDescriptions = new Map<number, string>();
      for (const p of data.priorities) {
        cachedDescriptions.set(p.priority_id, p.description || '');
      }
      return cachedDescriptions;
    } catch {
      return new Map();
    }
  },
};
