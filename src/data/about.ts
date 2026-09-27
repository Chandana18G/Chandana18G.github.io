// Content for the About page (and the Experience section on the home page).
// Edit freely — this is plain data.

export const bio: string[] = [
  "I'm Chandana, an M.Sc. student in Applied Data Science & AI at SRH University (Munich campus), based in Regensburg, Bavaria. I grew up in Mysuru, India, where I studied computer science.",
  'I build machine-learning systems end to end: from messy public data to a model that is honestly evaluated and a tool someone can use. My recent work covers NLP and semantic search, retrieval-augmented generation (RAG) and time-series forecasting.',
  "I'm looking for a working-student role (Werkstudent) in data science, machine learning or applied generative AI, in Regensburg or remote.",
];

export interface ExperienceItem {
  role: string;
  company: string;
  location: string;
  period: string;
  points: string[];
}

export const experience: ExperienceItem[] = [
  {
    role: 'Data Science Intern',
    company: 'TechnoTut',
    location: 'Mysuru, India',
    period: 'Feb 2025 – May 2025',
    points: [
      'Built and evaluated supervised and unsupervised ML models in Python for real-world analytical use cases.',
      'Did exploratory analysis, feature engineering and model benchmarking across multiple datasets.',
      'Presented results to technical and non-technical stakeholders.',
    ],
  },
  {
    role: 'Data Analysis Trainee',
    company: 'SPORTS-KPI',
    location: 'India',
    period: 'Sep 2023 – Oct 2023',
    points: [
      'Built KPI dashboards and reports for football and kabaddi match data, from raw data to visual delivery.',
    ],
  },
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
    details: 'Coursework projects in machine learning, NLP, time-series forecasting and responsible AI.',
  },
  {
    degree: 'B.E. Computer Science & Engineering',
    school: 'The National Institute of Engineering (NIE)',
    location: 'Mysuru, India',
    period: '2023 – 2025',
    details: 'First Class. VTU Sports Award for athletic achievement alongside studies.',
  },
  {
    degree: 'Diploma in Computer Science',
    school: 'JSS Polytechnic for Women',
    location: 'Mysuru, India',
    period: '2019 – 2022',
    details: 'First Class with Distinction.',
  },
];

export interface SkillGroup {
  label: string;
  items: string[];
}

export const skills: SkillGroup[] = [
  { label: 'Languages', items: ['Python', 'SQL', 'Java', 'C', 'Bash'] },
  { label: 'Machine learning', items: ['scikit-learn', 'XGBoost', 'time-series forecasting', 'model evaluation & CV'] },
  { label: 'NLP & GenAI', items: ['sentence-transformers', 'FAISS', 'RAG', 'LDA / gensim', 'spaCy', 'NLTK', 'OpenAI API'] },
  { label: 'Data & BI', items: ['pandas', 'NumPy', 'Power BI', 'Tableau', 'matplotlib', 'seaborn', 'Excel'] },
  { label: 'Databases', items: ['PostgreSQL', 'MySQL', 'SQLite', 'MongoDB'] },
  { label: 'Tools', items: ['Git', 'Docker', 'Linux', 'Jupyter', 'Streamlit'] },
];
