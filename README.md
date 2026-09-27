# chandana18g.github.io

Personal portfolio of **Chandana Gurusiddappa**, M.Sc. Applied Data Science & AI student.
Live at **https://chandana18g.github.io**.

Built with [Astro](https://astro.build), TypeScript and [Three.js](https://threejs.org).
Deployed to GitHub Pages by GitHub Actions on every push to `main`.

## Run locally

Requirements: Node.js 22.12+ (24 recommended) and npm.

```bash
npm install        # once
npm run dev        # http://localhost:4321, reloads on save
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ locally
```

## Add a project

**With Claude Code:** run `/add-project`. It asks for the details, can draft the text from the
GitHub README, then builds, commits and pushes.

**By hand:**

1. Create `src/content/projects/<slug>.md`. The filename becomes the URL
   (`/projects/<slug>/`).
2. Add the frontmatter:

   ```yaml
   ---
   title: "My Project"
   date: 2026-03-01
   status: completed        # completed | in-progress | planned
   summary: "One or two sentences shown on the card."
   tags: [genai, rag]
   stack: [Python, LangChain]
   github: https://github.com/Chandana18G/my-project   # or TODO
   demo: https://...                                   # optional
   image: /images/projects/my-project.png              # optional, file in public/images/projects/
   imageAlt: "What the image shows"                    # needed if image is set
   highlights: ["91% accuracy"]  # optional, max 3 short result chips
   featured: false          # true = shown on the home page (max 3)
   draft: false             # true = hidden on the live site until finished
   ---
   ```

3. Write the body in Markdown (`## Problem`, `## Data`, `## Approach`, `## Results`,
   `## What I learned`).
4. `npm run build`. If the frontmatter is wrong, the build tells you which field.
5. Commit and push to `main`. The site updates in about a minute.

Notes/blog posts work the same way in `src/content/notes/` (fields: `title`, `date`,
`summary`, `tags`, `draft`).

## Edit other content

| What                                   | Where                   |
| -------------------------------------- | ----------------------- |
| Email, GitHub, LinkedIn, CV, languages | `src/data/profile.ts`   |
| Bio, experience, education, skills     | `src/data/about.ts`     |
| Home text, at-a-glance card, all labels | `src/i18n/en.ts`        |
| Colours, fonts, spacing                | `src/styles/tokens.css` |
| Social preview image / icons           | `scripts/generate-images.mjs`, then `npm run images` |

See [CLAUDE.md](CLAUDE.md) for architecture, design tokens and conventions.
