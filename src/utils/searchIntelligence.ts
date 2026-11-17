import type { EducationCategoryCode, ParsedLearningIntent, StudentProfile } from '../types';
import { EDUCATION_CATEGORY_BY_CODE, inferEducationCategoryFromText } from '../data/educationClassificationData';

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

export const EXPLORE_KNOWLEDGE_SUGGESTED_EXAMPLES: string[] = [
  'Mathematics',
  'Digital Marketing',
  'BCA Programming',
  'MBA Finance',
  'Artificial Intelligence',
  'Spoken English',
  'Engineering',
  'Graphic Design',
  'Accounting',
  'Business Management',
];

export const PDF_HERO_EXAMPLE_QUERIES: string[] = [
  'Mathematics',
  'Digital Marketing',
  'BCA Programming',
  'MBA Finance',
  'Artificial Intelligence',
  'Spoken English',
  'Engineering',
  'Graphic Design',
  'Accounting',
  'Business Management',
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

export const POPULAR_SEARCH_TOPICS: string[] = [
  'Microsoft Excel',
  'What is Microeconomics?',
  'Artificial Intelligence',
  'Python Programming',
  'PowerPoint Presentation',
  'Digital Marketing',
  'Spoken English',
  'Graphic Designing',
];

const SYNONYM_AND_TYPO_MAP: Record<string, { terms: string[]; hintLabel?: string }> = {
  exel: { terms: ['excel', 'spreadsheet', 'ms excel'], hintLabel: 'Excel' },
  excl: { terms: ['excel', 'microsoft excel'], hintLabel: 'Excel' },
  excel: { terms: ['microsoft excel', 'spreadsheets', 'formulas', 'pivot tables'] },
  ppt: { terms: ['powerpoint', 'presentation', 'slides'] },
  powrpoint: { terms: ['powerpoint', 'presentation', 'slides'], hintLabel: 'PowerPoint' },
  powerpoint: { terms: ['presentation', 'slides', 'ppt'] },
  pyhton: { terms: ['python', 'programming'], hintLabel: 'Python' },
  pythn: { terms: ['python', 'programming'], hintLabel: 'Python' },
  py: { terms: ['python'] },
  js: { terms: ['javascript', 'web development'] },
  microecomomics: { terms: ['microeconomics', 'economics', 'supply demand'], hintLabel: 'Microeconomics' },
  microeconomics: { terms: ['economics', 'microeconomics', 'supply demand', 'finance'] },
  macroeconomics: { terms: ['economics', 'macroeconomics', 'finance'] },
  artifical: { terms: ['artificial intelligence', 'ai', 'machine learning'], hintLabel: 'Artificial Intelligence' },
  intalligence: { terms: ['intelligence', 'artificial intelligence'], hintLabel: 'Intelligence' },
  ai: { terms: ['artificial intelligence', 'generative ai', 'machine learning'] },
  ml: { terms: ['machine learning', 'artificial intelligence', 'data science'] },
  machin: { terms: ['machine learning', 'ai'], hintLabel: 'Machine Learning' },
  lerning: { terms: ['learning', 'machine learning', 'course'], hintLabel: 'Learning' },
  genai: { terms: ['generative ai', 'llm', 'prompt engineering'] },
  coding: { terms: ['programming', 'python', 'javascript', 'software development'] },
  marketing: { terms: ['digital marketing', 'seo', 'social media'] },
  english: { terms: ['spoken english', 'communication skills'] },
  spokn: { terms: ['spoken english', 'communication skills'], hintLabel: 'Spoken English' },
  agri: { terms: ['agriculture', 'farming', 'rural entrepreneurship'] },
  uiux: { terms: ['ui/ux design', 'graphic design', 'figma'] },
  ux: { terms: ['ui/ux design', 'product design'] },
  graphik: { terms: ['graphic design', 'canva', 'photoshop'], hintLabel: 'Graphic Designing' },
  acounting: { terms: ['accounting', 'tally', 'finance'], hintLabel: 'Accounting' },
  managment: { terms: ['management', 'business management', 'leadership'], hintLabel: 'Management' },
  engeneering: { terms: ['engineering', 'robotics', 'software'], hintLabel: 'Engineering' },
  entreprenuer: { terms: ['entrepreneurship', 'startup', 'business'], hintLabel: 'Entrepreneurship' },
  vedio: { terms: ['video editing', 'premiere', 'filmmaking'], hintLabel: 'Video Editing' },
  editng: { terms: ['video editing', 'editing', 'design'], hintLabel: 'Editing' },
  motivaton: { terms: ['motivation', 'personality development', 'leadership'], hintLabel: 'Motivation' },
  lkg: { terms: ['early childhood', 'alphabet', 'phonics', 'kindergarten', 'lkg'], hintLabel: 'LKG Early Childhood' },
  ukg: { terms: ['early childhood', 'kindergarten', 'counting', 'phonics', 'ukg'], hintLabel: 'UKG Early Childhood' },
  phonics: { terms: ['alphabet', 'reading', 'early childhood', 'english'] },
  puc: { terms: ['higher secondary', 'class 11', 'class 12', 'puc', 'intermediate'] },
  bca: { terms: ['computer applications', 'programming', 'software', 'web development', 'bca'] },
  bcom: { terms: ['commerce', 'accounting', 'finance', 'business', 'tally', 'gst', 'bcom'] },
  mba: { terms: ['management', 'finance', 'leadership', 'business strategy', 'marketing', 'mba'] },
  btech: { terms: ['engineering', 'computer science', 'artificial intelligence', 'software', 'btech'] },
  mca: { terms: ['computer applications', 'cloud', 'software engineering', 'ai', 'mca'] },
  phd: { terms: ['doctoral', 'research methodology', 'academic writing', 'statistics', 'phd'] },
  reasearch: { terms: ['research methodology', 'academic writing', 'statistics'], hintLabel: 'Research Methodology' },
  methodolgy: { terms: ['research methodology', 'research design'], hintLabel: 'Methodology' },
  comunication: { terms: ['communication skills', 'spoken english', 'public speaking'], hintLabel: 'Communication' },
  communicaton: { terms: ['communication skills', 'spoken english', 'presentation'], hintLabel: 'Communication' },
  digtal: { terms: ['digital marketing', 'seo', 'social media'], hintLabel: 'Digital Marketing' },
  marketng: { terms: ['digital marketing', 'marketing', 'seo'], hintLabel: 'Marketing' },
  finace: { terms: ['finance', 'financial literacy', 'accounting', 'corporate finance'], hintLabel: 'Finance' },
  math: { terms: ['mathematics', 'algebra', 'calculus', 'geometry'] },
  maths: { terms: ['mathematics', 'arithmetic', 'algebra', 'geometry'] },
  scienc: { terms: ['science', 'physics', 'chemistry', 'biology'], hintLabel: 'Science' },
  gst: { terms: ['accounting', 'taxation', 'gst', 'commerce'] },
  tally: { terms: ['accounting', 'tally', 'finance', 'bookkeeping'] },
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
  if (/\b(malayalam|in malayalam)\b/.test(lower)) return { code: 'ml', label: 'Malayalam' };
  if (/\b(marathi|in marathi)\b/.test(lower)) return { code: 'mr', label: 'Marathi' };
  if (/\b(bengali|bangla|in bengali)\b/.test(lower)) return { code: 'bn', label: 'Bengali' };
  if (/\b(gujarati|in gujarati)\b/.test(lower)) return { code: 'gu', label: 'Gujarati' };
  if (/\b(punjabi|in punjabi)\b/.test(lower)) return { code: 'pa', label: 'Punjabi' };
  if (/\b(urdu|in urdu)\b/.test(lower)) return { code: 'ur', label: 'Urdu' };
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
  const hints: string[] = [];

  for (const t of rawTokens) {
    const mapped = SYNONYM_AND_TYPO_MAP[t];
    if (mapped) {
      mapped.terms.forEach((m) => expanded.add(m));
      if (mapped.hintLabel) hints.push(mapped.hintLabel);
    }
  }

  return {
    cleaned,
    tokens: rawTokens,
    expandedTerms: Array.from(expanded),
    correctionHint: hints.length > 0 ? `Showing results including "${hints.join(', ')}"` : undefined,
  };
}

const SKILL_MATCH_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: 'Digital Marketing', regex: /\b(digital marketing|seo|social media marketing|performance ads|sem)\b/i },
  { label: 'Python Programming', regex: /\b(python|django|flask|pandas)\b/i },
  { label: 'Artificial Intelligence', regex: /\b(artificial intelligence|\bai\b|generative ai|machine learning|\bml\b|llm|prompt engineering)\b/i },
  { label: 'Finance & Financial Literacy', regex: /\b(finance|financial modeling|corporate finance|valuation|investing|banking)\b/i },
  { label: 'Accounting & Taxation', regex: /\b(accounting|accountancy|bookkeeping|tally|gst|ledger|balance sheet)\b/i },
  { label: 'Research Methodology', regex: /\b(research methodology|academic writing|literature review|hypothesis|spss|biostatistics)\b/i },
  { label: 'Communication Skills', regex: /\b(communication skills|spoken english|public speaking|interpersonal|soft skills|business writing)\b/i },
  { label: 'Microsoft Excel', regex: /\b(microsoft excel|advanced excel|\bexcel\b|pivot table|vlookup|xlookup)\b/i },
  { label: 'PowerPoint Presentation', regex: /\b(powerpoint|presentation|\bppt\b|slides)\b/i },
  { label: 'Web Development', regex: /\b(web development|html|css|javascript|react|node\.js|full stack)\b/i },
  { label: 'Data Analytics', regex: /\b(data analytics|data science|power bi|tableau|sql)\b/i },
  { label: 'Graphic Design', regex: /\b(graphic design|ui\/ux|figma|canva|photoshop|illustrator)\b/i },
  { label: 'Video Editing', regex: /\b(video editing|premiere|after effects|filmmaking)\b/i },
  { label: 'Microeconomics', regex: /\b(microeconomics|macroeconomics|supply and demand|elasticity)\b/i },
  { label: 'Alphabet & Phonics', regex: /\b(alphabet|phonics|abc|early reading|counting|numbers)\b/i },
  { label: 'Mathematics', regex: /\b(mathematics|\bmath\b|\bmaths\b|fractions|algebra|geometry|trigonometry|calculus)\b/i },
  { label: 'Science', regex: /\b(science|physics|chemistry|biology|chemical reactions|force|optics)\b/i },
  { label: 'Entrepreneurship', regex: /\b(entrepreneurship|startup|business plan)\b/i },
];

const DEGREE_CLASS_PATTERNS: Array<{ label: string; code: EducationCategoryCode; regex: RegExp }> = [
  { label: 'LKG', code: 'A', regex: /\blkg\b/i },
  { label: 'UKG', code: 'A', regex: /\bukg\b/i },
  { label: 'Kindergarten', code: 'A', regex: /\b(kindergarten|nursery|preschool|pre-primary)\b/i },
  { label: 'Class 1', code: 'B', regex: /\b(class|grade|std)\s*1\b/i },
  { label: 'Class 2', code: 'B', regex: /\b(class|grade|std)\s*2\b/i },
  { label: 'Class 3', code: 'B', regex: /\b(class|grade|std)\s*3\b/i },
  { label: 'Class 4', code: 'B', regex: /\b(class|grade|std)\s*4\b/i },
  { label: 'Class 5', code: 'B', regex: /\b(class|grade|std)\s*5\b/i },
  { label: 'Class 6', code: 'C', regex: /\b(class|grade|std)\s*6\b/i },
  { label: 'Class 7', code: 'C', regex: /\b(class|grade|std)\s*7\b/i },
  { label: 'Class 8', code: 'C', regex: /\b(class|grade|std)\s*8\b/i },
  { label: 'Class 9', code: 'D', regex: /\b(class|grade|std)\s*9\b/i },
  { label: 'Class 10', code: 'D', regex: /\b(class|grade|std)\s*10\b|\bsslc\b/i },
  { label: 'PUC Commerce', code: 'E', regex: /\bpuc\s*(commerce|1st|2nd)?\b.*\b(commerce|accounting)\b|\bcommerce\s*puc\b/i },
  { label: 'PUC / Class 11–12', code: 'E', regex: /\b(puc|class\s*11|class\s*12|higher secondary|\+2)\b/i },
  { label: 'Diploma / Polytechnic', code: 'F', regex: /\b(diploma|polytechnic)\b/i },
  { label: 'BCA', code: 'G', regex: /\bbca\b/i },
  { label: 'BCom', code: 'G', regex: /\bb\.?com\b/i },
  { label: 'BBA', code: 'G', regex: /\bbba\b/i },
  { label: 'BBM', code: 'G', regex: /\bbbm\b/i },
  { label: 'BA', code: 'G', regex: /\b(b\.?a\.?\s+student|studying\s+ba)\b/i },
  { label: 'BSc Computer Science', code: 'G', regex: /\bb\.?sc\s*(cs|computer science|it|data science)\b/i },
  { label: 'BSc', code: 'G', regex: /\bb\.?sc\b/i },
  { label: 'BTech / BE Engineering', code: 'G', regex: /\b(b\.?tech|b\.?e\.?|engineering student|cse|mechanical engineering|civil engineering|ece)\b/i },
  { label: 'MBA', code: 'H', regex: /\bmba\b/i },
  { label: 'MCA', code: 'H', regex: /\bmca\b/i },
  { label: 'MCom', code: 'H', regex: /\bm\.?com\b/i },
  { label: 'MSc', code: 'H', regex: /\bm\.?sc\b/i },
  { label: 'MTech', code: 'H', regex: /\bm\.?tech\b/i },
  { label: 'Postgraduate', code: 'H', regex: /\b(postgraduate|post graduate|masters)\b/i },
  { label: 'PhD / Doctoral Research', code: 'I', regex: /\b(phd|doctoral|doctorate)\b/i },
  { label: 'Working Professional', code: 'J', regex: /\b(working professional|professional|career|freshers?)\b/i },
];

/**
 * Natural-language educational intent parser.
 * Parses statements such as "I am studying BCA and want to learn digital marketing"
 * and ALWAYS prioritizes the user's current query topic/skill over stored background degree.
 */
export function parseEducationalIntent(
  rawQuery: string,
  studentProfile?: Partial<StudentProfile> | null
): ParsedLearningIntent {
  const { cleaned, tokens, expandedTerms, correctionHint } = normalizeAndExpandQuery(rawQuery);
  const lang = detectQueryLanguage(cleaned);

  let detectedDegree: string | undefined;
  let detectedCode: EducationCategoryCode | undefined;

  for (const pat of DEGREE_CLASS_PATTERNS) {
    if (pat.regex.test(cleaned)) {
      detectedDegree = pat.label;
      detectedCode = pat.code;
      break;
    }
  }

  if (!detectedCode) {
    const inferred = inferEducationCategoryFromText(cleaned);
    if (inferred) detectedCode = inferred.code;
  }

  // Fallback to profile education context ONLY if query didn't specify one
  const effectiveCode = detectedCode || studentProfile?.educationLevel;
  const effectiveDegree = detectedDegree || studentProfile?.degreeOrClass || studentProfile?.qualification;
  const effectiveCat = effectiveCode ? EDUCATION_CATEGORY_BY_CODE[effectiveCode] : undefined;

  // Detect target skill / subject from the explicit query (never override with old profile skills!)
  const matchedSkills: string[] = [];
  for (const s of SKILL_MATCH_PATTERNS) {
    if (s.regex.test(cleaned)) {
      matchedSkills.push(s.label);
    }
  }

  // Extract explicit clause after "want to learn", "seeking", "looking for", "about"
  const goalMatch = cleaned.match(
    /(?:want to learn|wanting to learn|want to study|seeking|looking for|need courses? (?:in|on|for)|interested in|learn|search(?:ing)? for|about)\s+(.+)$/i
  );
  const targetPhrase = goalMatch?.[1]
    ? goalMatch[1].replace(/\b(courses?|tutorials?|skills?|skill development|for beginners?)\b/gi, '').trim()
    : '';

  const desiredSkill = matchedSkills[0] || (targetPhrase.length >= 2 ? targetPhrase : cleaned);
  const primarySubject = matchedSkills[0] || targetPhrase || cleaned;

  // Determine preferred format if mentioned
  let preferredFormat: ParsedLearningIntent['preferredFormat'];
  if (/\b(video|youtube|watch|lecture)\b/i.test(cleaned)) preferredFormat = 'Video';
  else if (/\b(roadmap|path|plan|step by step)\b/i.test(cleaned)) preferredFormat = 'Roadmap';
  else if (/^(what|why|how|explain|define)\b/i.test(cleaned) || cleaned.endsWith('?')) preferredFormat = 'Q&A';
  else if (/\b(course|certification|enroll)\b/i.test(cleaned)) preferredFormat = 'Course';

  // Compute skill/subject-focused expansion WITHOUT polluting with degree prefixes (bca/bcom/mba/lkg/puc)
  const degreeStripped = cleaned
    .replace(/\b(lkg|ukg|kindergarten|nursery|preschool|class\s*\d+|grade\s*\d+|std\s*\d+|puc(\s*commerce)?|higher\s*secondary|diploma|polytechnic|bca|b\.?com|bba|bbm|b\.?sc|b\.?tech|b\.?e\.?|mba|mca|m\.?com|m\.?sc|m\.?tech|postgraduate|post\s*graduate|phd|doctoral|working\s*professional|professional)\b/gi, ' ')
    .replace(/\b(i\s+am|i'm|studying|students?|want\s+to\s+learn|wanting\s+to\s+learn|want\s+to\s+study|seeking|looking\s+for|searching\s+for|learning|skill\s+development|skills?|development|courses?|tutorials?|basics?)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const skillExpansion = normalizeAndExpandQuery(skillExpansionQuery(degreeStripped, matchedSkills));

  // Priority keywords: place desired skill/topic tokens FIRST, removing conversational & degree filler
  const stopWords = new Set([
    'am', 'is', 'are', 'was', 'studying', 'student', 'students', 'want', 'wanting', 'to', 'learn', 'learning',
    'and', 'the', 'for', 'in', 'on', 'with', 'about', 'seeking', 'looking', 'searching', 'courses', 'course',
    'skill', 'skills', 'development', 'what', 'how', 'why', 'please', 'find', 'me', 'class', 'grade', 'std',
    'lkg', 'ukg', 'puc', 'bca', 'bcom', 'bba', 'bsc', 'btech', 'mba', 'mca', 'mcom', 'msc', 'mtech', 'phd',
    'postgraduate', 'diploma', 'professional', 'fundamentals', 'basics', 'tutorial', 'tutorials',
  ]);

  const skillSynonymExtras: Record<string, string[]> = {
    'Alphabet & Phonics': ['alphabet', 'phonics', 'school education', 'spoken english', 'english', 'reading', 'creative writing'],
    'Accounting & Taxation': ['accounting', 'finance & accounting', 'bookkeeping', 'tally', 'gst', 'taxation'],
    'Finance & Financial Literacy': ['finance', 'financial literacy', 'finance & accounting', 'banking', 'stock market', 'investing'],
    'Research Methodology': ['research', 'data analytics', 'data science', 'statistics', 'python', 'academic'],
    'Science': ['science', 'physics', 'chemistry', 'biology'],
    'Mathematics': ['mathematics', 'math', 'algebra', 'geometry', 'fractions'],
    'Digital Marketing': ['digital marketing', 'seo', 'social media marketing', 'marketing'],
    'Python Programming': ['python', 'python programming', 'programming'],
    'Artificial Intelligence': ['artificial intelligence', 'generative ai', 'machine learning', 'ai'],
    'Communication Skills': ['communication skills', 'spoken english', 'public speaking', 'communication'],
  };

  const matchedExtras = matchedSkills.flatMap((sk) => skillSynonymExtras[sk] || [sk.toLowerCase()]);
  const cleanIntentTerms = Array.from(
    new Set([
      ...matchedSkills,
      ...matchedExtras,
      ...(targetPhrase && !stopWords.has(targetPhrase.toLowerCase()) ? [targetPhrase] : []),
      ...skillExpansion.expandedTerms.filter((t) => !stopWords.has(t.toLowerCase())),
    ])
  ).filter(Boolean);

  return {
    rawQuery: rawQuery || '',
    cleanedQuery: cleaned,
    educationLevelCode: effectiveCode,
    educationLevelLabel: effectiveCat?.title,
    currentQualification: effectiveDegree,
    degreeOrClass: effectiveDegree,
    primarySubject: primarySubject || cleaned,
    desiredSkill: desiredSkill || cleaned,
    careerGoal: studentProfile?.careerAspirations || (/\b(job|career|placement|interview)\b/i.test(cleaned) ? 'Career Advancement' : undefined),
    preferredLanguage: lang.label,
    preferredLanguageCode: lang.code,
    preferredFormat,
    intentPriorityTerms: cleanIntentTerms.length > 0 ? cleanIntentTerms : tokens.filter((t) => !stopWords.has(t.toLowerCase())),
    searchKeywords: Array.from(new Set([...cleanIntentTerms, ...tokens])).slice(0, 12),
    correctionHint,
    usedAiParser: false,
  };
}

function skillExpansionQuery(stripped: string, matchedSkills: string[]): string {
  if (stripped && stripped.length >= 2) return stripped;
  return matchedSkills.join(' ');
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

