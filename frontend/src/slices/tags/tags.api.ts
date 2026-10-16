import { apiClient } from '@/shared/api/client/index.ts';
import type { Tag, TagListResponse } from './tags.types.ts';

export const tagsApi = {
  getTags: (): Promise<TagListResponse> => apiClient.get('tags').json<TagListResponse>(),

  createTag: (name: string): Promise<Tag> => apiClient.post('tags', { json: { name } }).json<Tag>(),

  updateTag: (tagId: number, name: string): Promise<Tag> =>
    apiClient.put(`tags/${tagId}`, { json: { name } }).json<Tag>(),

  deleteTag: (tagId: number) => apiClient.delete(`tags/${tagId}`),
};
