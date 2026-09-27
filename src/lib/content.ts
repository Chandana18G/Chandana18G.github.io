import { getCollection, type CollectionEntry } from 'astro:content';
import type { ProjectStatus } from '@/content.config';

export type Project = CollectionEntry<'projects'>;
export type Note = CollectionEntry<'notes'>;

const statusRank: Record<ProjectStatus, number> = { 'in-progress': 0, completed: 1, planned: 2 };

/** Drafts are shown while developing locally, never in the production build. */
const visible = (draft: boolean) => import.meta.env.DEV || !draft;

/** All projects: in-progress first, then completed, then planned; newest first within each. */
export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects', ({ data }) => visible(data.draft));
  return all.sort(
    (a, b) =>
      statusRank[a.data.status] - statusRank[b.data.status] ||
      b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  return (await getProjects()).filter((p) => p.data.featured).slice(0, limit);
}

/** Published notes (drafts excluded), newest first. */
export async function getNotes(): Promise<Note[]> {
  const all = await getCollection('notes', ({ data }) => visible(data.draft));
  return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

/** Unique tags across entries, most used first. */
export function collectTags(entries: { data: { tags: string[] } }[]): string[] {
  const counts = new Map<string, number>();
  for (const e of entries) for (const t of e.data.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t);
}
