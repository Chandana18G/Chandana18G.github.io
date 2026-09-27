// Content for the About page. Edit freely — this is plain data.

export const bio: string[] = [
  "I'm Chandana, an M.Sc. student in Applied Data Science & AI at SRH University's Munich campus. I live in Regensburg, Bavaria, and grew up in Mysuru, India.",
  'I like problems where data meets a real decision: forecasting energy prices, anticipating clinical needs, or helping someone find the right answer in a pile of documents. I care about models that are useful, explainable and responsibly built, not just accurate on a benchmark.',
  "I'm looking for a 6-month mandatory internship (Pflichtpraktikum) and working-student roles in Germany or Europe, in industry teams working on data science, machine learning or applied generative AI.",
];

export interface EducationItem {
  degree: string;
  school: string;
  location: string;
  period: string;
  current?: boolean;
  details?: string;
}

export const education: EducationItem[] = [
  {
    degree: 'M.Sc. Applied Data Science & Artificial Intelligence',
    school: 'SRH University',
    location: 'Munich, Germany',
    period: '2025 – 2027 (expected)',
    current: true,
    details: 'TODO: focus areas, notable courses or projects.',
  },
  {
    degree: 'B.E. Computer Science & Engineering',
    school: 'The National Institute of Engineering (NIE)',
    location: 'Mysuru, India',
    period: '2023 – 2025',
  },
  {
    degree: 'Diploma in Computer Science',
    school: 'JSS Polytechnic for Women',
    location: 'Mysuru, India',
    period: '2019 – 2022',
  },
];

export interface SkillGroup {
  label: string;
  items: string[];
}

// TODO: review and adjust to match your actual skill set.
export const skills: SkillGroup[] = [
  { label: 'Languages', items: ['Python', 'SQL'] },
  { label: 'Data & ML', items: ['pandas', 'NumPy', 'scikit-learn', 'time-series forecasting'] },
  { label: 'GenAI', items: ['LLMs', 'retrieval-augmented generation', 'LangChain', 'prompt design'] },
  { label: 'BI & viz', items: ['Power BI', 'DAX', 'Power Query', 'matplotlib'] },
  { label: 'Practices', items: ['Git', 'Jupyter', 'responsible AI'] },
];
