import { kyInstance, validatedRequest } from '@/shared/api/client.ts';
import { PriorityListResponseSchema } from './schemas.ts';
import type { PriorityListResponse } from './types.ts';

let cachedPrioritiesPromise: Promise<PriorityListResponse> | null = null;
let cachedDescriptions: Map<number, string> | null = null;

export const prioritiesApi = {
  list: (): Promise<PriorityListResponse> => {
    if (!cachedPrioritiesPromise) {
      cachedPrioritiesPromise = validatedRequest(
        () => kyInstance.get('priorities').json<unknown>(),
        PriorityListResponseSchema
      );
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
