export interface UniversalCategoryGroup {
  code: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L';
  name: string;
  description: string;
  domainGroup: string;
  subcategories: string[];
  featuredQueries: string[];
}

export const UNIVERSAL_12_CATEGORIES: UniversalCategoryGroup[] = [
  {
    code: 'A',
    name: 'Academic & School Education',
    description: 'LKG–12, State Boards, CBSE, ICSE, NCERT, university subjects, exam prep & olympiads.',
    domainGroup: 'Academic',
    subcategories: [
      'School Education (LKG to Class 12)',
      'Mathematics & Statistics',
      'Physics, Chemistry & Biology',
      'Social Studies & History',
      'Microeconomics & Macroeconomics',
      'Competitive Exam Preparation',
    ],
    featuredQueries: ['What is Microeconomics?', 'Class 10 Science NCERT', 'Engineering Mathematics'],
  },
  {
    code: 'B',
    name: 'Artificial Intelligence & Emerging Technologies',
    description: 'AI fundamentals, Machine Learning, Generative AI, Prompt Engineering, LLMs & AI Ethics.',
    domainGroup: 'Technology',
    subcategories: [
      'Artificial Intelligence',
      'Generative AI',
      'Machine Learning',
      'Deep Learning',
      'Prompt Engineering',
      'AI Ethics & Responsible AI',
    ],
    featuredQueries: ['Artificial Intelligence & Generative AI for Beginners', 'Machine Learning Python', 'Prompt Engineering'],
  },
  {
    code: 'C',
    name: 'Computer Science, IT & Software Development',
    description: 'Python, Java, C++, Web Development, Mobile Apps, Cloud, DevOps & Cybersecurity.',
    domainGroup: 'Technology',
    subcategories: [
      'Python Programming',
      'JavaScript & Web Development',
      'Full Stack Development',
      'App Development (Android / iOS)',
      'Cloud Computing (AWS / Azure / GCP)',
      'Cybersecurity & Ethical Hacking',
    ],
    featuredQueries: ['Python Programming Tutorial for Students', 'Full Stack Web Development', 'Cybersecurity Foundations'],
  },
  {
    code: 'D',
    name: 'Productivity Software & Office Tools',
    description: 'Microsoft Excel, Advanced Excel, Word, PowerPoint, Google Workspace, Notion & CRM.',
    domainGroup: 'Professional',
    subcategories: [
      'Microsoft Excel / Advanced Excel',
      'PowerPoint Presentation Design',
      'Microsoft Word & Documentation',
      'Google Workspace Productivity',
      'Data Entry & Operations Automation',
      'Project Tracking & Notion',
    ],
    featuredQueries: ['Microsoft Excel / Advanced Excel', 'PowerPoint Presentation', 'Excel Pivot Tables & Dashboards'],
  },
  {
    code: 'E',
    name: 'Business, Finance & Management',
    description: 'Business management, Financial Literacy, Accounting, Tally, GST, Startups & Project Management.',
    domainGroup: 'Business',
    subcategories: [
      'Business Management',
      'Entrepreneurship & Startups',
      'Financial Literacy & Banking',
      'Accounting & Taxation',
      'Stock Market Education',
      'Project & HR Management',
    ],
    featuredQueries: ['Entrepreneurship & Startup Management', 'Financial Literacy & Accounting', 'Stock Market Basics'],
  },
  {
    code: 'F',
    name: 'Digital Marketing, Sales & E-Commerce',
    description: 'SEO, Social Media Marketing, Performance Ads, Content Strategy, B2B Sales & E-Commerce.',
    domainGroup: 'Business',
    subcategories: [
      'Digital Marketing',
      'Search Engine Optimization (SEO)',
      'Social Media Marketing',
      'Content Creation & Copywriting',
      'Sales & Client Acquisition',
      'E-Commerce Store Operations',
    ],
    featuredQueries: ['Digital Marketing Strategy & SEO', 'Social Media Marketing', 'E-Commerce Business Setup'],
  },
  {
    code: 'G',
    name: 'Creative Design, Media & Animation',
    description: 'Graphic Design, UI/UX, Canva, Figma, Video Editing, 2D/3D Animation, Music & Photography.',
    domainGroup: 'Creative',
    subcategories: [
      'Graphic Design',
      'UI/UX Design & Figma',
      'Animation & Motion Design',
      'Video Editing & Production',
      'Photography & Visual Arts',
      'Creative Writing & Storytelling',
    ],
    featuredQueries: ['Graphic Design & UI/UX Fundamentals', 'UI Animation & Motion', 'Video Editing Complete Course'],
  },
  {
    code: 'H',
    name: 'Engineering, Manufacturing & Technical Trades',
    description: 'Robotics, IoT, Electronics, Mechanical/Civil/CAD, EV, Solar & Vocational Trades.',
    domainGroup: 'STEM',
    subcategories: [
      'Robotics & Automation',
      'Internet of Things (IoT)',
      'Electronics & Embedded Systems',
      'Renewable & Solar Technology',
      'Automobile & EV Systems',
      'Manufacturing & CAD Engineering',
    ],
    featuredQueries: ['Robotics & IoT Engineering', 'Solar Energy Systems', 'Embedded Electronics Basics'],
  },
  {
    code: 'I',
    name: 'Healthcare, Wellness & Life Sciences',
    description: 'Anatomy, Nutrition, Public Health, First Aid, Psychology, Mental Wellness & Yoga.',
    domainGroup: 'Wellbeing',
    subcategories: [
      'Healthcare Education',
      'Nutrition & Dietetics',
      'Psychology & Behavioural Science',
      'First Aid & Community Health',
      'Wellness & Mindfulness',
      'Environmental Health',
    ],
    featuredQueries: ['Nutrition & Holistic Wellness', 'Psychology Fundamentals', 'Public Health Awareness'],
  },
  {
    code: 'J',
    name: 'Languages & Communication',
    description: 'Spoken English, Kannada, Hindi, Tamil, Telugu, Malayalam, Sanskrit, French, German & Public Speaking.',
    domainGroup: 'Professional',
    subcategories: [
      'Spoken English',
      'Communication Skills',
      'Business Writing & Email Etiquette',
      'Public Speaking & Debate',
      'Indian Regional Languages',
      'Foreign Languages',
    ],
    featuredQueries: ['Spoken English & Communication Skills', 'Public Speaking Mastery', 'Kannada & Hindi Fluency'],
  },
  {
    code: 'K',
    name: 'Personal Development, IQ/EQ/SQ & Career Skills',
    description: 'Critical Thinking, Emotional Intelligence, Spiritual Intelligence, Resume, Interviews & Parenting.',
    domainGroup: 'Intelligence',
    subcategories: [
      'Emotional Intelligence (EQ)',
      'IQ & Analytical Thinking',
      'SQ & Values Leadership',
      'Interview Preparation & Resumes',
      'Personality & Leadership',
      'Parenting & Educator Training',
    ],
    featuredQueries: ['Interview Preparation & Career Skills', 'Emotional Intelligence Leadership', 'Critical Thinking'],
  },
  {
    code: 'L',
    name: 'Agriculture, Rural Innovation & Community Empowerment',
    description: 'Smart farming, organic agriculture, rural startups, SHGs, financial inclusion & sustainability.',
    domainGroup: 'Wellbeing',
    subcategories: [
      'Agriculture Technology',
      'Organic & Sustainable Farming',
      'Rural Entrepreneurship',
      'Women Entrepreneurship & SHGs',
      'Food Processing & Agribusiness',
      'Sustainability & Clean Energy',
    ],
    featuredQueries: ['Rural Entrepreneurship & Smart Agriculture', 'Sustainable Farming Practices', 'Women SHG Enterprise'],
  },
];

export const PDF_HERO_EXAMPLE_QUERIES: string[] = [
  'What is Microeconomics?',
  'Microsoft Excel / Advanced Excel',
  'PowerPoint Presentation',
  'Python Programming Tutorial for Students',
  'Artificial Intelligence & Generative AI for Beginners',
  'Digital Marketing Strategy & SEO',
  'Financial Literacy & Accounting',
  'Spoken English & Communication Skills',
  'Robotics & IoT Engineering',
  'Rural Entrepreneurship & Smart Agriculture',
  'Graphic Design & UI/UX Fundamentals',
  'Interview Preparation & Career Skills',
];

export const EXCEL_TOPIC_GROUPS = [
  'All Excel Topics',
  'Beginner Tutorials',
  'Formulas & Functions',
  'Dashboards & Pivot Tables',
  'Data Analysis',
  'Practical Projects',
  'Interview Preparation',
];

export const SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES = [
  { code: 'auto', label: 'Auto-Detect Language' },
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi (हिन्दी)' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)' },
  { code: 'ta', label: 'Tamil (தமிழ்)' },
  { code: 'te', label: 'Telugu (తెలుగు)' },
  { code: 'ml', label: 'Malayalam (മലയാളം)' },
  { code: 'mr', label: 'Marathi (मराठी)' },
  { code: 'bn', label: 'Bengali (বাংলা)' },
  { code: 'gu', label: 'Gujarati (ગુજરાતી)' },
  { code: 'pa', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'or', label: 'Odia (ଓଡ଼ିଆ)' },
  { code: 'ur', label: 'Urdu (اردو)' },
  { code: 'es', label: 'Spanish (Español)' },
  { code: 'fr', label: 'French (Français)' },
  { code: 'de', label: 'German (Deutsch)' },
];

const SYNONYM_AND_TYPO_MAP: Record<string, string[]> = {
  exel: ['excel', 'spreadsheet', 'ms excel'],
  excel: ['microsoft excel', 'spreadsheets', 'formulas', 'pivot tables'],
  ppt: ['powerpoint', 'presentation', 'slides'],
  powerpoint: ['presentation', 'slides', 'ppt'],
  pyhton: ['python', 'programming'],
  py: ['python'],
  js: ['javascript', 'web development'],
  microeconomics: ['economics', 'microeconomics', 'supply demand', 'finance'],
  macroeconomics: ['economics', 'macroeconomics', 'finance'],
  ai: ['artificial intelligence', 'generative ai', 'machine learning'],
  ml: ['machine learning', 'artificial intelligence', 'data science'],
  genai: ['generative ai', 'llm', 'prompt engineering'],
  coding: ['programming', 'python', 'javascript', 'software development'],
  marketing: ['digital marketing', 'seo', 'social media'],
  english: ['spoken english', 'communication skills'],
  agri: ['agriculture', 'farming', 'rural entrepreneurship'],
  uiux: ['ui/ux design', 'graphic design', 'figma'],
  ux: ['ui/ux design', 'product design'],
};

/**
 * Automatic script & language detection for multilingual queries (English, 11+ Indian & international languages).
 */
export function detectQueryLanguage(query: string): { code: string; label: string } {
  const q = (query || '').trim();
  if (!q) return { code: 'en', label: 'English' };
  if (/[\u0C80-\u0CFF]/.test(q)) return { code: 'kn', label: 'Kannada' };
  if (/[\u0B80-\u0BFF]/.test(q)) return { code: 'ta', label: 'Tamil' };
  if (/[\u0C00-\u0C7F]/.test(q)) return { code: 'te', label: 'Telugu' };
  if (/[\u0D00-\u0D7F]/.test(q)) return { code: 'ml', label: 'Malayalam' };
  if (/[\u0980-\u09FF]/.test(q)) return { code: 'bn', label: 'Bengali' };
  if (/[\u0A80-\u0AFF]/.test(q)) return { code: 'gu', label: 'Gujarati' };
  if (/[\u0A00-\u0A7F]/.test(q)) return { code: 'pa', label: 'Punjabi' };
  if (/[\u0B00-\u0B7F]/.test(q)) return { code: 'or', label: 'Odia' };
  if (/[\u0600-\u06FF]/.test(q)) return { code: 'ur', label: 'Urdu' };
  if (/[\u0900-\u097F]/.test(q)) {
    if (/(मराठी|आहे|कसे|शिकणे)/.test(q)) return { code: 'mr', label: 'Marathi' };
    return { code: 'hi', label: 'Hindi' };
  }
  const lower = q.toLowerCase();
  if (/\b(kannada|bengaluru|karnataka)\b/.test(lower) && /\b(in|language)\b/.test(lower)) {
    return { code: 'kn', label: 'Kannada' };
  }
  if (/\b(hindi|hindime|in hindi)\b/.test(lower)) return { code: 'hi', label: 'Hindi' };
  if (/\b(tamil|in tamil)\b/.test(lower)) return { code: 'ta', label: 'Tamil' };
  if (/\b(telugu|in telugu)\b/.test(lower)) return { code: 'te', label: 'Telugu' };
  if (/\b(spanish|español)\b/.test(lower)) return { code: 'es', label: 'Spanish' };
  if (/\b(french|français)\b/.test(lower)) return { code: 'fr', label: 'French' };
  return { code: 'en', label: 'English' };
}

/**
 * Expands search query with typo corrections & semantic synonyms without mutating user text destructively.
 */
export function normalizeAndExpandQuery(rawQuery: string): {
  cleaned: string;
  tokens: string[];
  expandedTerms: string[];
  correctionHint?: string;
} {
  const cleaned = (rawQuery || '')
    .trim()
    .replace(/[?.,!]+$/g, '')
    .replace(/\s+/g, ' ');
  const lower = cleaned.toLowerCase();

  // Strip natural conversational prefixes ("What is ...", "How to learn ...", "Best course for ...")
  const corePhrase = lower
    .replace(/^(what is|what are|how to learn|how to use|learn|course on|tutorial for|guide to)\s+/i, '')
    .trim();

  const rawTokens = corePhrase.split(/[\s/+&,-]+/).filter((t) => t.length >= 2);
  const expanded = new Set<string>(rawTokens);
  let correctionHint: string | undefined;

  for (const t of rawTokens) {
    const mapped = SYNONYM_AND_TYPO_MAP[t];
    if (mapped) {
      mapped.forEach((m) => expanded.add(m));
      if (t === 'exel') correctionHint = 'Showing results including "Excel"';
      if (t === 'pyhton') correctionHint = 'Showing results including "Python"';
    }
  }

  return {
    cleaned,
    tokens: rawTokens,
    expandedTerms: Array.from(expanded),
    correctionHint,
  };
}

const RECENT_SEARCHES_KEY = 'openframe_recent_searches_v1';

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): string[] {
  const clean = (query || '').trim();
  if (clean.length < 2) return getRecentSearches();
  const existing = getRecentSearches().filter((q) => q.toLowerCase() !== clean.toLowerCase());
  const next = [clean, ...existing].slice(0, 8);
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  } catch {
    // ignore storage quota errors
  }
  return next;
}

export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {
    // ignore
  }
}
