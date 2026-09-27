import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getNotes } from '@/lib/content';
import { profile } from '@/data/profile';

export async function GET(context: APIContext) {
  const notes = await getNotes();
  return rss({
    title: `${profile.name} — Notes`,
    description: 'Short write-ups on data science, ML and generative AI.',
    site: context.site ?? profile.siteUrl,
    items: notes.map((note) => ({
      title: note.data.title,
      pubDate: note.data.date,
      description: note.data.summary,
      link: `/notes/${note.id}/`,
      categories: note.data.tags,
    })),
  });
}
