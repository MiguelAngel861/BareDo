import { signal } from '@preact/signals';
import { tagsApi } from './tags.api.ts';
import type { Tag } from './tags.types.ts';

export const tagsSignal = signal<Tag[]>([]);
export const isLoadingTagsSignal = signal<boolean>(false);

export async function fetchTags(): Promise<void> {
  isLoadingTagsSignal.value = true;
  try {
    const res = await tagsApi.getTags();
    tagsSignal.value = res.tags;
  } catch {
    // Error silencioso al listar tags
  } finally {
    isLoadingTagsSignal.value = false;
  }
}

export async function findOrCreateTag(name: string): Promise<Tag | null> {
  const clean = name.trim().toLowerCase().replace(/^#/, '');
  if (!clean) {
    return null;
  }

  const existing = tagsSignal.value.find((t) => t.name.toLowerCase() === clean);
  if (existing) {
    return existing;
  }

  try {
    const created = await tagsApi.createTag(clean);
    tagsSignal.value = [...tagsSignal.value, created];
    return created;
  } catch {
    return null;
  }
}
