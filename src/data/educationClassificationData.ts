import { EducationCategoryCode, EducationClassificationCategory } from '../types';

/**
 * Complete Education Classification System (Level 1 to Level 10 / Categories A to J)
 * Supports Early Childhood (LKG) to Research & Doctoral and Professional Skills,
 * dynamically extensible via Firestore `education_taxonomy` managed by Admin.
 */
export const EDUCATION_CLASSIFICATION_CATEGORIES: EducationClassificationCategory[] = [
  {
    code: 'A',
    levelNumber: 1,
    id: 'early_childhood',
    title: 'Early Childhood Education',
    shortTitle: 'Level 1 · Early Childhood (LKG–UKG)',
    description: 'Foundational phonics, alphabet recognition, counting, rhymes, motor skills & curiosity.',
    programmes: ['LKG', 'UKG', 'Kindergarten', 'Foundational Learning'],
    streams: ['Alphabet & Phonics', 'Numbers & Counting', 'Storytelling & Rhymes', 'Motor & Visual Skills'],
    sampleSubjects: ['English Alphabet', 'Basic Numbers', 'Shapes & Colors', 'Rhymes & Stories'],
    sampleQueries: ['LKG alphabet phonics', 'UKG counting numbers', 'Kindergarten foundational learning'],
  },
  {
    code: 'B',
    levelNumber: 2,
    id: 'primary_education',
    title: 'Primary School',
    shortTitle: 'Level 2 · Primary (Class 1–5)',
    description: 'Elementary numeracy, reading comprehension, EVS, science curiosity & foundational skills.',
    programmes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    streams: ['Mathematics', 'English & Grammar', 'Environmental Studies (EVS)', 'General Science'],
    sampleSubjects: ['Fractions & Arithmetic', 'Reading Comprehension', 'Basic Science', 'Hindi / Regional Languages'],
    sampleQueries: ['Class 5 mathematics fractions', 'Class 3 science plants animals', 'Class 4 English grammar'],
  },
  {
    code: 'C',
    levelNumber: 3,
    id: 'middle_school',
    title: 'Middle School',
    shortTitle: 'Level 3 · Middle School (Class 6–8)',
    description: 'Core NCERT/CBSE/State curriculum across algebra, geometry, science, social studies & coding.',
    programmes: ['Class 6', 'Class 7', 'Class 8'],
    streams: ['Mathematics', 'Science', 'Social Studies', 'Computer Basics & Coding'],
    sampleSubjects: ['Algebra & Geometry', 'Light, Electricity & Force', 'History & Civics', 'Scratch & Python Intro'],
    sampleQueries: ['Class 6 integers and algebra', 'Class 8 physics force and pressure', 'Middle school coding basics'],
  },
  {
    code: 'D',
    levelNumber: 4,
    id: 'secondary_education',
    title: 'Secondary School',
    shortTitle: 'Level 4 · Secondary (Class 9–10)',
    description: 'Board preparation in Science, Mathematics, Social Science, Languages & IT foundations.',
    programmes: ['Class 9', 'Class 10'],
    streams: ['Mathematics', 'Physics, Chemistry & Biology', 'Social Science & Economics', 'English & IT'],
    sampleSubjects: ['Quadratic Equations & Trigonometry', 'Chemical Reactions & Genetics', 'Economics & Civics', 'Board Exam Prep'],
    sampleQueries: ['Class 10 science chemical reactions', 'Class 10 trigonometry mathematics', 'Class 9 physics laws of motion'],
  },
  {
    code: 'E',
    levelNumber: 5,
    id: 'higher_secondary',
    title: 'Higher Secondary',
    shortTitle: 'Level 5 · Higher Secondary (11–12 / PUC)',
    description: 'Pre-University & Senior Secondary streams covering Science, Commerce, Arts & Humanities, and Vocational Education.',
    programmes: [
      'Class 11',
      'Class 12',
      'PUC First Year',
      'PUC Second Year',
      'Science',
      'Commerce',
      'Arts and Humanities',
      'Vocational Education',
    ],
    streams: ['PCMB / PCMC (Science)', 'CEBA / SEBA (Commerce)', 'HEPS / Arts & Humanities', 'Vocational & Applied'],
    sampleSubjects: ['Accountancy & Business Studies', 'Microeconomics & Macroeconomics', 'Calculus & Physics', 'Computer Science C++/Python'],
    sampleQueries: ['PUC commerce accounting ledger', 'Class 12 Microeconomics supply demand', 'Class 11 organic chemistry basics'],
  },
  {
    code: 'F',
    levelNumber: 6,
    id: 'diploma_polytechnic',
    title: 'Diploma and Vocational',
    shortTitle: 'Level 6 · Diploma & Vocational',
    description: 'Polytechnic engineering, CAD, electrical systems, networking & applied vocational trades.',
    programmes: [
      'Polytechnic',
      'Computer Science',
      'Mechanical',
      'Civil',
      'Electrical',
      'Electronics',
      'Other vocational programmes',
    ],
    streams: ['Diploma in Computer Science', 'Diploma in Mechanical & CAD', 'Diploma in Civil', 'Diploma in Electrical & Electronics'],
    sampleSubjects: ['C/Python & Databases', 'AutoCAD & Manufacturing', 'Circuit Design & PLC', 'Surveying & Estimation'],
    sampleQueries: ['Polytechnic computer science networking', 'Mechanical AutoCAD drafting basics', 'Electrical PLC automation'],
  },
  {
    code: 'G',
    levelNumber: 7,
    id: 'undergraduate',
    title: 'Undergraduate Degrees',
    shortTitle: 'Level 7 · Undergraduate Degrees',
    description: 'All bachelor programmes across Arts, Commerce & Management, Computer Science & Technology, Science, Engineering & Professional Degrees.',
    programmes: [
      // Arts
      'BA', 'Journalism', 'Psychology', 'Sociology', 'Economics', 'History', 'Political Science', 'English',
      // Commerce and Management
      'BCom', 'BBA', 'BBM', 'Accounting', 'Finance',
      // Computer Science and Technology
      'BCA', 'BSc Computer Science', 'BSc IT', 'BSc Data Science', 'BSc Artificial Intelligence', 'Software Development',
      // Science
      'BSc Physics', 'BSc Chemistry', 'BSc Mathematics', 'BSc Biology', 'Biotechnology', 'Microbiology',
      // Engineering
      'BE', 'BTech', 'CSE', 'Mechanical', 'Civil', 'Electrical', 'Electronics', 'AI and Data Science',
      // Professional Degrees
      'BPharm', 'Nursing', 'Physiotherapy', 'LLB', 'Architecture', 'Design', 'Other professional programmes',
    ],
    degreeGroups: [
      {
        group: 'Arts',
        degrees: ['BA', 'Journalism', 'Psychology', 'Sociology', 'Economics', 'History', 'Political Science', 'English'],
      },
      {
        group: 'Commerce and Management',
        degrees: ['BCom', 'BBA', 'BBM', 'Accounting', 'Finance'],
      },
      {
        group: 'Computer Science and Technology',
        degrees: ['BCA', 'BSc Computer Science', 'BSc IT', 'BSc Data Science', 'BSc Artificial Intelligence', 'Software Development'],
      },
      {
        group: 'Science',
        degrees: ['BSc Physics', 'BSc Chemistry', 'BSc Mathematics', 'BSc Biology', 'Biotechnology', 'Microbiology'],
      },
      {
        group: 'Engineering',
        degrees: ['BE', 'BTech', 'CSE', 'Mechanical', 'Civil', 'Electrical', 'Electronics', 'AI and Data Science'],
      },
      {
        group: 'Professional Degrees',
        degrees: ['BPharm', 'Nursing', 'Physiotherapy', 'LLB', 'Architecture', 'Design', 'Other professional programmes'],
      },
    ],
    streams: ['Arts', 'Commerce and Management', 'Computer Science & Technology', 'Science', 'Engineering', 'Professional Degrees'],
    sampleSubjects: ['Data Structures & DBMS', 'Corporate Accounting & GST', 'Financial Management', 'Artificial Intelligence', 'Business Law'],
    sampleQueries: [
      'I am studying BCA and want to learn digital marketing',
      'I am a BCom student and want to learn Python',
      'Engineering student looking for AI courses',
    ],
  },
  {
    code: 'H',
    levelNumber: 8,
    id: 'postgraduate',
    title: 'Postgraduate',
    shortTitle: 'Level 8 · Postgraduate (MA/MBA/MCA/MTech)',
    description: 'Master degree academic depth, specialization modules, management & research methods.',
    programmes: [
      'MA', 'MSc', 'MCom', 'MBA', 'MCA', 'MTech', 'ME', 'MSW', 'LLM', 'MPharm', 'MDes', 'Other postgraduate programmes',
    ],
    streams: ['MBA & Strategic Management', 'MCA & MTech Advanced Computing', 'MSc & MA Research Tracks', 'MCom & Quantitative Finance'],
    sampleSubjects: ['Corporate Finance & Valuation', 'Machine Learning Systems', 'Research Methodology', 'Organizational Leadership'],
    sampleQueries: ['MBA student seeking finance skill development', 'MCA distributed systems and cloud', 'MCom financial modeling Excel'],
  },
  {
    code: 'I',
    levelNumber: 9,
    id: 'doctoral_research',
    title: 'Research and Doctoral',
    shortTitle: 'Level 9 · Research & Doctoral (PhD)',
    description: 'PhD readiness, MPhil, research methodology, systematic literature reviews & academic publications.',
    programmes: [
      'Research Methodology',
      'MPhil',
      'PhD',
      'Doctoral Research',
      'Academic Writing',
      'Research Publications',
    ],
    streams: ['Quantitative & Qualitative Methodology', 'Literature Synthesis & Citations', 'Statistical Analysis (R / Python / SPSS)', 'Peer-Reviewed Academic Writing'],
    sampleSubjects: ['Research Methodology & Design', 'Academic Writing & Publications', 'Hypothesis Testing & Statistics', 'Ethics in Research'],
    sampleQueries: ['Postgraduate student wanting to learn research methodology', 'Academic writing for PhD thesis', 'Qualitative research coding'],
  },
  {
    code: 'J',
    levelNumber: 10,
    id: 'professional_skills',
    title: 'Professional and Independent Skills',
    shortTitle: 'Level 10 · Professional & Independent Skills',
    description: 'Job-ready skills for students, freshers, career switchers & working professionals.',
    programmes: [
      'Digital Marketing',
      'Programming',
      'Web Development',
      'Mobile App Development',
      'Artificial Intelligence',
      'Machine Learning',
      'Data Analytics',
      'Cybersecurity',
      'Cloud Computing',
      'Graphic Design',
      'Video Editing',
      'Accounting',
      'Finance',
      'Communication Skills',
      'Spoken English',
      'Entrepreneurship',
      'Sales',
      'Human Resources',
      'Business Management',
      'Career Development',
    ],
    streams: ['AI, Cloud & Software Engineering', 'Digital Marketing, Sales & Growth', 'Finance, Accounting & Management', 'Design, Video & Communication'],
    sampleSubjects: ['Advanced Microsoft Excel', 'SEO & Performance Marketing', 'Spoken English & Communication', 'Power BI & Data Analytics'],
    sampleQueries: ['Professional searching for communication skills courses', 'Advanced Microsoft Excel pivot tables', 'Digital Marketing complete strategy'],
  },
];

export const EDUCATION_CATEGORY_BY_CODE: Record<EducationCategoryCode, EducationClassificationCategory> =
  EDUCATION_CLASSIFICATION_CATEGORIES.reduce((acc, item) => {
    acc[item.code] = item;
    return acc;
  }, {} as Record<EducationCategoryCode, EducationClassificationCategory>);

export function getEducationCategoryByCode(code?: string): EducationClassificationCategory | undefined {
  if (!code) return undefined;
  const normalized = code.trim().toUpperCase() as EducationCategoryCode;
  return EDUCATION_CATEGORY_BY_CODE[normalized];
}

export function getAllProgrammesForCategory(code?: string): string[] {
  const cat = getEducationCategoryByCode(code);
  return cat ? cat.programmes : [];
}

/**
 * Maps a programme, class, or degree string into its canonical Category (A-J).
 */
export function inferEducationCategoryFromText(text: string): EducationClassificationCategory | undefined {
  const q = String(text || '').toLowerCase();
  if (!q) return undefined;

  if (/\b(lkg|ukg|kindergarten|nursery|preschool|pre-primary|early childhood|alphabet|phonics)\b/.test(q)) {
    return EDUCATION_CATEGORY_BY_CODE.A;
  }
  if (/\b(class\s*[1-5]|grade\s*[1-5]|std\s*[1-5]|primary school)\b/.test(q)) {
    return EDUCATION_CATEGORY_BY_CODE.B;
  }
  if (/\b(class\s*[6-8]|grade\s*[6-8]|std\s*[6-8]|middle school)\b/.test(q)) {
    return EDUCATION_CATEGORY_BY_CODE.C;
  }
  if (/\b(class\s*(9|10)|grade\s*(9|10)|std\s*(9|10)|sslc|matric|secondary)\b/.test(q)) {
    return EDUCATION_CATEGORY_BY_CODE.D;
  }
  if (/\b(puc|class\s*(11|12)|grade\s*(11|12)|\+2|higher secondary|intermediate)\b/.test(q)) {
    return EDUCATION_CATEGORY_BY_CODE.E;
  }
  if (/\b(diploma|polytechnic|iti|vocational trade)\b/.test(q)) {
    return EDUCATION_CATEGORY_BY_CODE.F;
  }
  if (/\b(phd|doctoral|doctorate|research methodology|academic writing|dissertation|thesis)\b/.test(q)) {
    return EDUCATION_CATEGORY_BY_CODE.I;
  }
  if (/\b(mba|mca|mcom|m\.com|msc|m\.sc|ma\b|m\.a\.|mtech|m\.tech|me\b|msw|llm|mph|mpharm|mdes|postgraduate|post graduate|masters)\b/.test(q)) {
    return EDUCATION_CATEGORY_BY_CODE.H;
  }
  if (/\b(bca|bcom|b\.com|bba|bbm|bsc|b\.sc|ba\b|b\.a\.|btech|b\.tech|be\b|b\.e\.|llb|bpharm|nursing|bpt|bdes|barch|undergraduate|engineering student|college student)\b/.test(q)) {
    return EDUCATION_CATEGORY_BY_CODE.G;
  }
  if (/\b(professional|career|working|reskill|upskill|job ready|corporate)\b/.test(q)) {
    return EDUCATION_CATEGORY_BY_CODE.J;
  }
  return undefined;
}
