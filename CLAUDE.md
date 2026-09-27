# CLAUDE.md

Personal portfolio of Chandana Gurusiddappa, deployed at https://chandana18g.github.io.
Astro 7 + TypeScript (strict) + Three.js. Static output, deployed by GitHub Actions.

## Rules

1. **Never break the build.** Run `npm run build` before every commit. It runs `astro check`
   (type-checks `.astro`/`.ts` and validates content frontmatter) and then `astro build`. If it
   fails, fix it before committing.
2. **Keep commits small** and focused on one change, with a clear imperative subject line
   (e.g. `Add SMARD forecasting results`, `Fix tag filter on mobile`).
3. Work on `main`. Every push to `main` deploys to production automatically.
4. **Never put a phone number on the site.** The contact channels are email, GitHub and LinkedIn.
5. Keep the visual language: use the design tokens (below), not new hard-coded colours.
6. Everything that moves must respect `html[data-motion="paused"]` and
   `prefers-reduced-motion` (see Motion).
7. Keep it accessible: WCAG AA contrast, visible focus, keyboard-operable controls,
   one `<h1>` per page, meaningful `alt` text.

## Commands

| Command           | What it does                                                    |
| ----------------- | --------------------------------------------------------------- |
| `npm install`     | Install dependencies                                            |
| `npm run dev`     | Dev server at http://localhost:4321                             |
| `npm run build`   | `astro check` + static build into `dist/`                       |
| `npm run preview` | Serve the built `dist/` locally                                 |
| `npm run check`   | Type/content check only                                         |
| `npm run images`  | Regenerate `public/og-image.png`, `favicon.ico`, `apple-touch-icon.png` |

Slash command: `/add-project` (in `.claude/commands/add-project.md`) walks through adding a project.

## Architecture

```
.github/workflows/deploy.yml   Build + deploy to Pages on push to main (PRs: build only)
.claude/commands/add-project.md
scripts/generate-images.mjs    OG image + raster icons (run manually, outputs are committed)
public/                        Static files served as-is (favicon, og-image, robots.txt, images/)
src/
  content.config.ts            Zod schemas for the `projects` and `notes` collections
  content/projects/<slug>.md   One file per project (slug = filename = URL)
  content/notes/<slug>.md      One file per note/blog post
  data/profile.ts              Name, email, GitHub, LinkedIn, languages (+ isSet helper)
  data/about.ts                About page: bio paragraphs, education timeline, skills
  i18n/en.ts                   ALL UI strings (English)
  i18n/utils.ts                useTranslations, localizePath, formatDate, language list
  lib/content.ts               getProjects / getFeaturedProjects / getNotes / collectTags
  lib/motion.ts                Pause-motion state + change event
  lib/tilt.ts                  Tilt/glare for [data-tilt] elements
  lib/three/capability.ts      Decides WebGL vs static fallback (no Three.js import)
  lib/three/objects.ts         Three.js objects: sphere, icosa, knot, helix, orbit (dynamic import)
  layouts/BaseLayout.astro     <head>/SEO, skip link, nav, footer, motion bootstrap script
  components/                  Nav, Footer, SEO, MotionToggle, Hero, Object3D, GlanceCard,
                               ProjectCard, StatusBadge, NoteList, PageHeader
  pages/                       index, about, contact, 404, projects/[slug], notes/[slug], rss.xml
  styles/tokens.css            Design tokens
  styles/global.css            Base styles, utilities (.container, .btn, .tag, .prose, ...)
```

Import alias: `@/` → `src/`.

## Content rules

- **Never hide or remove a project without asking the user first.** All of her projects stay
  visible. `draft: true` is only for when she asks for it.
- **Never publish placeholder text.** Keep TODO reminders as YAML comments in the frontmatter
  (`# TODO: ...`), not in the visible summary or body. For unfinished write-ups, use a short
  factual overview and "*A detailed write-up ... is coming soon.*"
- **Never invent results.** Numbers in `highlights`/Results must come from the linked repo
  or from the user. When unsure, leave it out.
- Experience, education and skills live in `src/data/about.ts`; the CV link in `src/data/profile.ts`.

## Content schema

### Projects — `src/content/projects/<slug>.md`

```yaml
---
title: "German Electricity Price Forecasting"   # required
date: 2025-09-01          # required. Completion date; start/target date if in-progress/planned
status: completed         # required. completed | in-progress | planned
summary: "One or two sentences."                # required, max 240 chars; card text + meta description
tags: [energy, time-series, forecasting]        # lowercase, kebab-case; drives the tag filter
stack: [Python, pandas, scikit-learn]
github: https://github.com/Chandana18G/repo     # required: a URL or the literal TODO (hidden)
demo: https://example.com                       # optional: URL or TODO
image: /images/projects/<slug>.png              # optional: file in public/images/projects/
imageAlt: "Describe the image"                  # required if image is set
highlights: ["91.2% test accuracy", "P@5 0.844"]  # max 3 short, factual result chips (≤40 chars)
featured: true            # up to 3 featured projects appear on the home page
draft: false              # true = hidden on the live site (visible in npm run dev)
---

## Problem
## Data
## Approach
## Results        (planned projects: "Planned scope")
## What I learned (planned projects: "Open questions")
```

Ordering on /projects: in-progress → completed → planned, newest first within each group.
Home page shows the first 3 `featured: true` projects in that order.

### Notes — `src/content/notes/<slug>.md`

```yaml
---
title: "Hello, world"
date: 2026-09-27
summary: "One or two sentences."
tags: [meta]
draft: false              # true = excluded from all pages, listings and RSS
---
```

## Design tokens (`src/styles/tokens.css`)

| Token             | Hex       | Use                               |
| ----------------- | --------- | --------------------------------- |
| `--bg`            | `#07060b` | Page background                   |
| `--surface`       | `#110e1a` | Cards                             |
| `--surface-2`     | `#1a1528` | Raised / hover                    |
| `--border`        | `#2a2240` | Hairlines                         |
| `--text`          | `#ece8f5` | Body text                         |
| `--text-muted`    | `#a59dbb` | Secondary text                    |
| `--violet`        | `#8b5cf6` | Primary accent, buttons, borders  |
| `--violet-bright` | `#b794ff` | Links, focus ring                 |
| `--neon`          | `#c77dff` | Highlights, eyebrows, glows       |
| `--magenta`       | `#e879f9` | Sparing 2nd accent; status planned |
| `--mint`          | `#5eead4` | Status completed, terminal prompt |

Fonts (self-hosted via Fontsource): Space Grotesk (`--font-display`), Inter (`--font-body`),
JetBrains Mono (`--font-mono`). Fluid type scale `--step--1` … `--step-4`; spacing `--space-*`.
Glows: `--glow-sm`, `--glow-md`. Body text on `--bg` must stay ≥ 4.5:1 contrast.

## Motion & 3D

- `html[data-motion]` is `running` or `paused`. It is set before first paint by the inline
  script in `BaseLayout.astro`: stored user choice (localStorage `motion`) wins; otherwise
  `paused` if `prefers-reduced-motion: reduce`.
- `MotionToggle` flips it via `setMotionPaused()`, which dispatches `motionchange`.
  Subscribe with `onMotionChange(cb)` from `@/lib/motion`.
- CSS animations are paused globally under `html[data-motion="paused"]`.
- 3D objects: every page shows at least two — one beside the page title and one in the footer.
  Use `<Object3D variant="sphere|icosa|knot|helix|orbit" size="..." />`. `PageHeader` takes an
  `object` prop (default `icosa`). Current mapping: home hero `sphere`, projects `icosa`,
  project detail `knot`, notes `knot`, note detail `helix`, about `helix`, contact `sphere`,
  404 `icosa`, footer `orbit`.
- Each object renders a static SVG first. After `load`, on the first interaction (or 4 s),
  objects are mounted one at a time as they come near the viewport. `canRun3D()` (no WebGL,
  Save-Data, <4 GB memory or <4 cores → keep the SVG) gates a dynamic import of
  `lib/three/objects.ts`, which mounts a small renderer per object. Each loop runs only while
  that object is on-screen, the tab is visible and motion is not paused; when paused it renders
  one still frame. Objects lean gently toward the mouse.
- Three.js must only ever be imported from `lib/three/objects.ts` (or other dynamically imported
  modules) so it never lands in the initial bundle.

## i18n (German later)

English is the default and has no URL prefix. To add German:
1. Add `'de'` to `i18n.locales` in `astro.config.mjs` and `de: 'Deutsch'` to `languages` in
   `src/i18n/utils.ts`; register the dictionary there.
2. Copy `src/i18n/en.ts` → `de.ts` and translate (missing keys fall back to English).
3. Add pages under `src/pages/de/` that reuse the same components (they read the language
   from the URL via `getLangFromUrl`). For translated content, add a `lang` field to the
   schemas or use `src/content/projects/de/`.
4. Add a language switcher to `Nav.astro` and `hreflang` links in `SEO.astro`.

Never hard-code UI strings in components — add a key to `en.ts` instead.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`: `npm ci` → `npm run build` →
upload `dist/` → deploy to GitHub Pages. Pull requests only build. Repo setting required:
Settings → Pages → Build and deployment → Source: **GitHub Actions**.
