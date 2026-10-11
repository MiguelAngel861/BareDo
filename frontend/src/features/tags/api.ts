import { kyInstance, validatedRequest } from '@/shared/api/client.ts';
import { TagDeleteResponseSchema, TagListResponseSchema, TagSchema } from './schemas.ts';
import type { Tag, TagDeleteResponse } from './types.ts';

export const tagsApi = {
  getTags: (): Promise<{ tags: Tag[] }> =>
    validatedRequest(() => kyInstance.get('tags').json<unknown>(), TagListResponseSchema),

  createTag: (name: string): Promise<Tag> =>
    validatedRequest(() => kyInstance.post('tags', { json: { name } }).json<unknown>(), TagSchema),

  deleteTag: (tagId: number): Promise<TagDeleteResponse> =>
    validatedRequest(
      () => kyInstance.delete(`tags/${tagId}`).json<unknown>(),
      TagDeleteResponseSchema
    ),
};
