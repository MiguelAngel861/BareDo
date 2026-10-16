import { apiClient, validatedRequest } from '@/shared/api/client/index.ts';
import { TagListResponseSchema, TagSchema } from './tags.schemas.ts';
import type { Tag, TagListResponse } from './tags.types.ts';

export const tagsApi = {
  getTags: (): Promise<TagListResponse> =>
    validatedRequest(() => apiClient.get('tags').json<unknown>(), TagListResponseSchema),

  createTag: (name: string): Promise<Tag> =>
    validatedRequest(() => apiClient.post('tags', { json: { name } }).json<unknown>(), TagSchema),

  updateTag: (tagId: number, name: string): Promise<Tag> =>
    validatedRequest(
      () => apiClient.put(`tags/${tagId}`, { json: { name } }).json<unknown>(),
      TagSchema
    ),

  deleteTag: (tagId: number) => apiClient.delete(`tags/${tagId}`),
};
