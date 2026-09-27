// All English UI strings. To add German, copy this file to de.ts,
// translate the values, and register it in ./utils.ts.
export const en = {
  'site.title': 'Chandana — Applied Data Science & AI',
  'site.description':
    'Portfolio of Chandana, M.Sc. Applied Data Science & AI student in Germany. Forecasting, RAG and generative AI, and BI projects. Open to internships and working-student roles.',

  'skip': 'Skip to main content',
  'nav.home': 'Home',
  'nav.projects': 'Projects',
  'nav.about': 'About',
  'nav.notes': 'Notes',
  'nav.contact': 'Contact',
  'nav.label': 'Main',
  'nav.menu': 'Menu',

  'motion.pause': 'Pause motion',
  'motion.play': 'Play motion',

  'footer.built': 'Built with Astro and Three.js.',
  'footer.source': 'Source',

  'home.eyebrow': 'hello, world',
  'home.greeting': "Hi, I'm",
  'home.lede':
    'I study Applied Data Science & AI in Munich and build forecasting models, retrieval-augmented assistants and dashboards that people actually use. Currently looking for a 6-month internship (Pflichtpraktikum) or a working-student role in Germany or Europe.',
  'home.cta.projects': 'See projects',
  'home.cta.contact': 'Get in touch',
  'home.featured': 'Featured projects',
  'home.allProjects': 'All projects',
  'home.notes': 'Recent notes',
  'home.allNotes': 'All notes',
  'home.noNotes': 'No notes yet. The first one is on its way.',

  'glance.title': 'at-a-glance',
  'glance.name': 'name',
  'glance.role': 'role',
  'glance.focus': 'focus',
  'glance.stack': 'stack',
  'glance.based': 'based',
  'glance.seeking': 'seeking',
  'glance.roleValue': 'M.Sc. Applied Data Science & AI @ SRH University',
  'glance.focusValue': 'time-series forecasting · RAG / GenAI · BI',
  'glance.stackValue': 'Python · SQL · pandas · scikit-learn · LangChain · Power BI',
  'glance.basedValue': 'Regensburg, DE',
  'glance.seekingValue': 'internship · working student',

  'projects.title': 'Projects',
  'projects.lede': 'Things I have built, am building, or plan to build.',
  'projects.filter': 'Filter by tag',
  'projects.all': 'All',
  'projects.empty': 'No projects match this tag.',
  'projects.back': 'All projects',
  'projects.code': 'Code',
  'projects.demo': 'Live demo',
  'projects.stack': 'Stack',
  'projects.tags': 'Tags',

  'status.completed': 'completed',
  'status.in-progress': 'in progress',
  'status.planned': 'planned',

  'notes.title': 'Notes',
  'notes.lede': 'Short write-ups on things I am learning, building or reading.',
  'notes.back': 'All notes',
  'notes.empty': 'No notes published yet.',

  'about.title': 'About',
  'about.education': 'Education',
  'about.skills': 'Skills',
  'about.languages': 'Languages',

  'contact.title': 'Contact',
  'contact.lede':
    'I am looking for a 6-month mandatory internship (Pflichtpraktikum) and working-student roles in data science, ML or AI engineering. The fastest way to reach me is email.',
  'contact.email': 'Email',
  'contact.github': 'GitHub',
  'contact.linkedin': 'LinkedIn',

  '404.title': 'Page not found',
  '404.lede': 'This page drifted out of the latent space.',
  '404.home': 'Back to home',
} as const;

export type UIKey = keyof typeof en;
