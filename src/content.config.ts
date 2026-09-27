import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// A URL, or the literal "TODO" placeholder (rendered as hidden until filled in).
const urlOrTodo = z.union([z.url(), z.literal('TODO')]);

export const STATUSES = ['completed', 'in-progress', 'planned'] as const;
export type ProjectStatus = (typeof STATUSES)[number];

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    /** Completion date, or start/target date for in-progress/planned work. */
    date: z.coerce.date(),
    status: z.enum(STATUSES),
    /** One or two sentences; shown on cards and as the page meta description. */
    summary: z.string().max(240),
    tags: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    github: urlOrTodo,
    demo: urlOrTodo.optional(),
    /** Path under /public, e.g. "/images/projects/smard.png". */
    image: z.string().startsWith('/').optional(),
    imageAlt: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    summary: z.string().max(240),
    tags: z.array(z.string()).default([]),
    /** Drafts are excluded from every listing, page and feed. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, notes };
