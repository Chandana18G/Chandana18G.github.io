// All English UI strings. To add German, copy this file to de.ts,
// translate the values, and register it in ./utils.ts.
export const en = {
  'site.title': 'Chandana — Applied Data Science & AI',
  'site.description':
    'Chandana Gurusiddappa — M.Sc. Applied Data Science & AI student in Germany building NLP, RAG and forecasting systems. Open to working-student roles in Regensburg or remote.',

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

  'footer.rights': 'All rights reserved.',
  'footer.built': 'Built with Astro and Three.js.',
  'footer.source': 'Source',

  'home.eyebrow': 'hello, world',
  'home.available': 'Open to Werkstudent roles · Regensburg / remote',
  'home.role': 'Data Science & ML — NLP, RAG and forecasting',
  'home.greeting': "Hi, I'm",
  'home.lede':
    'M.Sc. student at SRH University with a data-science internship behind me. I build ML systems end to end and evaluate them honestly — a news classifier at 91% accuracy, a RAG assistant that cites its sources, and COVID-19 forecasts that cut error by 87% versus a linear baseline.',
  'home.cta.projects': 'See projects',
  'home.cta.contact': 'Get in touch',
  'home.cta.cv': 'Download CV',
  'home.experience': 'Experience',
  'home.proof': 'Selected results',
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
  'glance.focusValue': 'NLP · RAG / GenAI · time-series forecasting',
  'glance.stackValue': 'Python · SQL · scikit-learn · XGBoost · FAISS · Power BI',
  'glance.basedValue': 'Regensburg, DE',
  'glance.seekingValue': 'working student · Regensburg / remote',

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
  'projects.results': 'Key results',

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
  'about.experience': 'Experience',
  'about.languages': 'Languages',

  'contact.title': 'Contact',
  'contact.lede':
    'I am looking for a working-student role (Werkstudent) in data science, ML or AI engineering, in Regensburg or remote. The fastest way to reach me is email.',
  'contact.email': 'Email',
  'contact.github': 'GitHub',
  'contact.linkedin': 'LinkedIn',

  '404.title': 'Page not found',
  '404.lede': 'This page drifted out of the latent space.',
  '404.home': 'Back to home',
} as const;

export type UIKey = keyof typeof en;
