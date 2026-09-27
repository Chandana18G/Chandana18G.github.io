// Personal facts and links (language-independent).
// Links set to 'TODO' are hidden on the site until filled in.
export const profile = {
  name: 'Chandana Gurusiddappa',
  shortName: 'Chandana',
  location: 'Regensburg, Bavaria, Germany',
  origin: 'Mysuru, India',
  email: 'Chanduu4055@gmail.com',
  github: 'https://github.com/Chandana18G',
  linkedin: 'https://www.linkedin.com/in/chandana-gurusiddappa-785563223/',
  /** Path to a CV in /public, e.g. '/Chandana-Gurusiddappa-CV.pdf'. Buttons stay hidden while 'TODO'. */
  cv: 'TODO',
  siteUrl: 'https://chandana18g.github.io',
  languages: [
    { name: 'English', level: 'C1' },
    { name: 'German', level: 'B1' },
    { name: 'Kannada', level: 'native' },
  ],
} as const;

export const isSet = (value: string | undefined | null): value is string =>
  !!value && value.trim() !== '' && value.trim().toUpperCase() !== 'TODO';
