import { apiClient } from '@/shared/api/client/index.ts';
import type { PriorityListResponse } from './priorities.types.ts';

export const prioritiesApi = {
  list: (): Promise<PriorityListResponse> =>
    apiClient.get('priorities').json<PriorityListResponse>(),
};
