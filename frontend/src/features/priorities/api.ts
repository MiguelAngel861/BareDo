import { kyInstance, validatedRequest } from '@/shared/api/client.ts';
import { PriorityListResponseSchema } from './schemas.ts';

export const prioritiesApi = {
  list: () =>
    validatedRequest(
      () => kyInstance.get('priorities').json<unknown>(),
      PriorityListResponseSchema
    ),
};
