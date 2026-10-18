import { tasksSignal } from '@/slices/tasks/tasks.state.ts';
import { signal } from '@preact/signals';
import { tagsApi } from './tags.api.ts';
import type { Tag } from './tags.types.ts';

export const tagsSignal = signal<Tag[]>([]);
export const isManageTagsModalOpenSignal = signal<boolean>(false);

export function openManageTagsModal(): void {
  isManageTagsModalOpenSignal.value = true;
}

export function closeManageTagsModal(): void {
  isManageTagsModalOpenSignal.value = false;
}

export async function fetchTags(): Promise<void> {
  try {
    const res = await tagsApi.getTags();
    tagsSignal.value = res.tags;
  } catch {
    // Error silencioso al listar tags
  }
}

export function normalizeTagName(name: string): string {
  return name.trim().toLowerCase().replace(/^#/, '');
}

export async function findOrCreateTag(name: string): Promise<Tag | null> {
  const clean = normalizeTagName(name);
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

export async function updateTagState(tagId: number, name: string): Promise<Tag | null> {
  const clean = normalizeTagName(name);
  if (!clean) {
    return null;
  }

  const updated = await tagsApi.updateTag(tagId, clean);
  tagsSignal.value = tagsSignal.value.map((t) => (t.tag_id === tagId ? updated : t));

  // Sincronizar tareas que contengan esta etiqueta
  tasksSignal.value = tasksSignal.value.map((task) => ({
    ...task,
    tags: task.tags.map((t) => (t.tag_id === tagId ? updated : t)),
  }));

  return updated;
}

export async function deleteTagState(tagId: number): Promise<boolean> {
  await tagsApi.deleteTag(tagId);
  tagsSignal.value = tagsSignal.value.filter((t) => t.tag_id !== tagId);

  // Sincronizar tareas que contengan esta etiqueta
  tasksSignal.value = tasksSignal.value.map((task) => ({
    ...task,
    tags: task.tags.filter((t) => t.tag_id !== tagId),
  }));

  return true;
}
