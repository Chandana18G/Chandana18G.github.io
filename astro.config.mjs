// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://chandana18g.github.io',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  i18n: {
    // English first. To add German: add 'de' here, create src/i18n/de.ts,
    // and add pages under src/pages/de/ (see CLAUDE.md).
    locales: ['en'],
    defaultLocale: 'en',
  },
  vite: {
    // The Three.js hero chunk (~130 kB gzipped) is lazy-loaded after page load.
    build: { chunkSizeWarningLimit: 600 },
  },
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed' },
  },
});
