import type {
  EducationCategoryCode,
  MarketplaceCourse,
  MarketplaceModule,
} from '../types';
import { compute90PercentCoursePricing } from '../utils/pricingEngine';

export interface CuratedYoutubeBoardSeed {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  subject: string;
  recommendedReason: string;
  board?: string;
  language?: string;
}

/**
 * Curated YouTube educational seeds covering LKG, UKG, Class 1–12, Karnataka SSLC/PUC,
 * CBSE/NCERT, ICSE, Diploma, Undergraduate, Postgraduate, and All-India Languages.
 */
export const LKG_TO_PG_YOUTUBE_SEEDS: CuratedYoutubeBoardSeed[] = [
  // LKG & UKG Early Childhood
  {
    id: 'yt-lkg-phonics',
    videoId: 'BELlZKpi1Zs',
    title: 'LKG & UKG English Phonics, A–Z Sounds & Early Reading',
    channelTitle: 'Early Learning India',
    duration: '18:20',
    level: 'Beginner',
    subject: 'lkg ukg nursery kindergarten alphabet phonics english rhymes reading',
    recommendedReason: 'Structured phonics sounds and alphabet recognition ideal for LKG & UKG learners.',
    board: 'All Boards (NCERT / CBSE / Karnataka KSEAB)',
    language: 'English',
  },
  {
    id: 'yt-lkg-numbers',
    videoId: 'D0Ajq682yrA',
    title: 'LKG & UKG Counting 1 to 100, Shapes, Colors & Number Concepts',
    channelTitle: 'Kids Foundational Maths',
    duration: '22:10',
    level: 'Beginner',
    subject: 'lkg ukg kindergarten numbers counting shapes math primary',
    recommendedReason: 'Interactive visual counting and shape mastery aligned to Balvatika & LKG-UKG.',
    board: 'NCERT Balvatika / CBSE / State Boards',
    language: 'English',
  },
  {
    id: 'yt-lkg-kannada',
    videoId: 't_E0x9x2cQ8',
    title: 'Kannada Varnamala (ಕನ್ನಡ ವರ್ಣಮಾಲೆ) & LKG–Class 2 Aksharamale',
    channelTitle: 'Kannada Kali Academy',
    duration: '24:35',
    level: 'Beginner',
    subject: 'kannada lkg ukg class 1 varnamala alphabet karnataka dsert',
    recommendedReason: 'Clear pronunciation and writing stroke guide for Kannada Varnamala and simple words.',
    board: 'Karnataka State Board (KTBS / DSERT)',
    language: 'Kannada',
  },
  {
    id: 'yt-lkg-hindi',
    videoId: 'pB6yN8bZ4oM',
    title: 'Hindi Varnamala Swar & Vyanjan (क ख ग घ) for LKG, UKG & Primary',
    channelTitle: 'Hindi Pathshala India',
    duration: '26:15',
    level: 'Beginner',
    subject: 'hindi lkg ukg primary varnamala cbse ncert matra reading',
    recommendedReason: 'Beginner Hindi vowels, consonants, and Matra formation for foundational learners.',
    board: 'NCERT / CBSE / State Boards',
    language: 'Hindi',
  },

  // Class 1 - 10 CBSE / NCERT / Karnataka SSLC / State Boards
  {
    id: 'yt-class5-fractions',
    videoId: 'p33BYf1NDAE',
    title: 'Class 1–5 Primary Mathematics: Addition, Multiplication & Fractions',
    channelTitle: 'Khan Academy India',
    duration: '34:40',
    level: 'Beginner',
    subject: 'class 1 class 2 class 3 class 4 class 5 primary mathematics fractions arithmetic cbse ncert',
    recommendedReason: 'Crystal-clear primary school arithmetic and fractions explanation with visual models.',
    board: 'NCERT / CBSE / All State Boards',
    language: 'English',
  },
  {
    id: 'yt-class8-algebra',
    videoId: 'NybHckSEQBI',
    title: 'Class 6–8 NCERT & State Board Algebra, Linear Equations & Geometry',
    channelTitle: 'Khan Academy India',
    duration: '42:15',
    level: 'Beginner',
    subject: 'class 6 class 7 class 8 middle school algebra geometry mathematics ncert cbse icse',
    recommendedReason: 'Builds middle school algebraic reasoning required for Class 9–10 board exams.',
    board: 'NCERT / CBSE / ICSE / State Boards',
    language: 'English',
  },
  {
    id: 'yt-class10-quadratics',
    videoId: 'IlNAJl36-10',
    title: 'Class 10 SSLC / CBSE / NCERT Quadratic Equations & Trigonometry Complete Revision',
    channelTitle: 'NCERT & State Board Maths',
    duration: '58:40',
    level: 'Intermediate',
    subject: 'class 9 class 10 sslc karnataka kseab cbse icse ncert quadratic equations trigonometry math',
    recommendedReason: 'Exam-focused step-by-step derivations and board exam problems for Class 10 Mathematics.',
    board: 'Karnataka KSEAB SSLC / CBSE / NCERT',
    language: 'English',
  },
  {
    id: 'yt-class10-science',
    videoId: 'WUvTyaaNkzM',
    title: 'Class 10 Science: Chemical Reactions, Electricity & Life Processes (NCERT/SSLC)',
    channelTitle: 'NCERT Science Lab',
    duration: '52:10',
    level: 'Intermediate',
    subject: 'class 9 class 10 science physics chemistry biology ncert cbse sslc karnataka state board',
    recommendedReason: 'Covers core high-school physics, chemistry, and biology concepts tested in board exams.',
    board: 'NCERT / CBSE / Karnataka KSEAB SSLC',
    language: 'English',
  },

  // Class 11–12 / 1st & 2nd PUC
  {
    id: 'yt-puc-physics',
    videoId: 'ZM8ECpBuQYE',
    title: '1st & 2nd PUC / Class 11–12 Physics: Kinematics, Electrostatics & Optics',
    channelTitle: 'Physics & JEE/NEET Foundation',
    duration: '1:05:20',
    level: 'Intermediate',
    subject: 'puc 1st puc 2nd puc class 11 class 12 physics dpue ncert cbse isc science',
    recommendedReason: 'Conceptual and numerical problem solving for 1st/2nd PUC and Class 11–12 Science.',
    board: 'Karnataka DPUE PUC / CBSE / NCERT / ISC',
    language: 'English',
  },
  {
    id: 'yt-puc-commerce',
    videoId: 'R8p8Z_pL8p4',
    title: 'Class 11–12 & PUC Commerce: Accountancy Ledger, Trial Balance & Financial Statements',
    channelTitle: 'Commerce & CA Foundation',
    duration: '54:18',
    level: 'Intermediate',
    subject: 'puc commerce class 11 class 12 accountancy ledger journal economics business studies',
    recommendedReason: 'Master double-entry bookkeeping, journalizing, and balance sheets for PUC & CBSE Commerce.',
    board: 'Karnataka DPUE PUC / CBSE / ISC',
    language: 'English',
  },

  // Diploma, Polytechnic, Undergraduate (BA, BCom, BBA, BCA, BSc, BE/BTech)
  {
    id: 'yt-ug-bca-web',
    videoId: 'G3e-cpL7ofc',
    title: 'BCA & BTech Full Course: HTML5, CSS3, Responsive Web & Website Architecture',
    channelTitle: 'SuperSimpleDev',
    duration: '6:31:24',
    level: 'Beginner',
    subject: 'bca btech cse web development html css javascript website diploma computer science',
    recommendedReason: 'Project-based undergraduate web engineering curriculum from scratch to live deployment.',
    board: 'University UG / Polytechnic Diploma',
    language: 'English',
  },
  {
    id: 'yt-ug-bcom-excel',
    videoId: 'Vl0H-qTclOg',
    title: 'BCom / BBA / MBA Complete Microsoft Excel, Formulas, PivotTables & Financial Modeling',
    channelTitle: 'freeCodeCamp.org',
    duration: '2:26:52',
    level: 'Beginner',
    subject: 'excel bcom bba mba mcom accounting finance spreadsheets pivot tables business analytics',
    recommendedReason: 'Full hands-on commercial spreadsheet & financial reporting mastery.',
    board: 'University UG / PG',
    language: 'English',
  },
  {
    id: 'yt-ug-python-cs',
    videoId: '_uQrJ0TkZlc',
    title: 'BSc CS / BCA / BTech Python Programming, Data Structures & Automation',
    channelTitle: 'Programming with Mosh',
    duration: '1:00:14',
    level: 'Beginner',
    subject: 'python programming bca btech bsc computer science mca mtech coding',
    recommendedReason: 'Complete university programming foundation covering syntax, OOP, and real projects.',
    board: 'University UG / PG',
    language: 'English',
  },

  // Postgraduate & Doctoral (MBA, MCA, MSc, MCom, MTech, PhD)
  {
    id: 'yt-pg-ml-stanford',
    videoId: 'i_LwzRVP7bg',
    title: 'MTech / MCA / MSc Machine Learning & Statistical Pattern Recognition',
    channelTitle: 'Stanford Online',
    duration: '1:16:48',
    level: 'Advanced',
    subject: 'mtech mca msc machine learning data science ai postgraduate research statistics',
    recommendedReason: 'Graduate-level mathematical treatment of supervised learning and optimization.',
    board: 'University Postgraduate (MTech / MCA / MSc)',
    language: 'English',
  },
  {
    id: 'yt-pg-research',
    videoId: '3r46X2Z-p6s',
    title: 'PhD & Postgraduate Research Methodology, Literature Review & Paper Writing',
    channelTitle: 'Academic Research Council',
    duration: '46:30',
    level: 'Advanced',
    subject: 'phd research methodology mphil ma msc mba academic writing thesis publication spss',
    recommendedReason: 'Step-by-step guide to research design, hypothesis testing, citations, and journal publishing.',
    board: 'University PG & Doctoral Research',
    language: 'English',
  },
];

interface BlueprintDef {
  id: string;
  title: string;
  category: string;
  categoryGroup: string;
  subcategory: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  educationLevel: EducationCategoryCode;
  degreeProgrammes: string[];
  board: string;
  boards: string[];
  language: string;
  supportedLanguages: string[];
  duration: string;
  estimatedHours: number;
  videoId: string;
  youtubeChannelName: string;
  shortDesc: string;
  skillsAcquired: string[];
  keywords: string[];
  parts: Array<{ title: string; lessons: string[]; exercise: string }>;
}

const BLUEPRINTS: BlueprintDef[] = [
  // ========================
  // LEVEL A: LKG & UKG
  // ========================
  {
    id: 'OF-SCH-LKG-001',
    title: 'LKG & UKG Complete Foundation: Phonics, Alphabet, Numbers & Rhymes',
    category: 'School Education',
    categoryGroup: 'Academic',
    subcategory: 'LKG & UKG Pre-Primary',
    level: 'Beginner',
    educationLevel: 'A',
    degreeProgrammes: ['LKG', 'UKG', 'Kindergarten', 'Foundational Learning'],
    board: 'NCERT Balvatika / CBSE / Karnataka State Board',
    boards: ['CBSE', 'NCERT', 'Karnataka KSEAB', 'CISCE (ICSE)', 'State Boards'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Marathi'],
    duration: '12 Hours',
    estimatedHours: 12,
    videoId: 'BELlZKpi1Zs',
    youtubeChannelName: 'Early Learning India',
    shortDesc: 'Structured A–Z phonics, numbers 1–100, shapes, colors & storytelling modules aligned to NEP 2020 Balvatika, CBSE, and State Pre-Primary.',
    skillsAcquired: ['Phonics & Letter Sounds', 'Counting 1–100', 'Shapes & Colors', 'Early Listening & Rhymes'],
    keywords: ['lkg', 'ukg', 'kindergarten', 'nursery', 'phonics', 'alphabet', 'numbers', 'balvatika'],
    parts: [
      {
        title: 'Part 1: Alphabet A–Z Sounds, Tracing & Phonics',
        lessons: ['Vowels & Consonants Songs', 'Phonics Sight Words & Pictures', 'Guided Letter Tracing Practice'],
        exercise: 'Recognize and sound out all 26 uppercase and lowercase letters.',
      },
      {
        title: 'Part 2: Numbers 1–100, Shapes & Everyday World',
        lessons: ['Counting Objects 1–50 & 51–100', 'Basic Shapes, Colors & Comparisons', 'Seasons, Fruits & Good Habits'],
        exercise: 'Match visual objects to numbers and identify 6 core geometric shapes.',
      },
      {
        title: 'Part 3: Rhymes, Storytelling & Oral Verification Test',
        lessons: ['Action Rhymes & Short Moral Stories', 'Picture Comprehension & Readiness Check'],
        exercise: 'Complete the playful LKG/UKG picture & phonics readiness quiz.',
      },
    ],
  },
  {
    id: 'OF-SCH-LKG-002',
    title: 'LKG to Class 2 Kannada Varnamala & Early Language (ಕನ್ನಡ ಪ್ರಾಥಮಿಕ)',
    category: 'School Education',
    categoryGroup: 'Academic',
    subcategory: 'Kannada State Medium (KSEAB / KTBS)',
    level: 'Beginner',
    educationLevel: 'A',
    degreeProgrammes: ['LKG', 'UKG', 'Class 1', 'Class 2'],
    board: 'Karnataka State Board (KSEAB / KTBS)',
    boards: ['Karnataka KSEAB', 'NCERT', 'CBSE'],
    language: 'Kannada',
    supportedLanguages: ['Kannada', 'English'],
    duration: '10 Hours',
    estimatedHours: 10,
    videoId: 't_E0x9x2cQ8',
    youtubeChannelName: 'Kannada Kali Academy',
    shortDesc: 'Swaragalu, Vyanjanagalu, Kagunita & simple Kannada vocabulary taught for LKG, UKG, Class 1 & Class 2 learners.',
    skillsAcquired: ['Kannada Swara & Vyanjana', 'Kagunita Blending', 'Simple Word Reading', 'Kannada Numerals'],
    keywords: ['kannada', 'karnataka', 'lkg', 'ukg', 'class 1', 'varnamala', 'kseab', 'ktbs'],
    parts: [
      {
        title: 'Part 1: Swaragalu (ಅ–ಅಃ) & Yogavaha',
        lessons: ['Vowel Sounds & Recognition', 'Picture Words for Each Swara'],
        exercise: 'Trace and pronounce all Kannada vowels cleanly.',
      },
      {
        title: 'Part 2: Vyanjanagalu (ಕ–ಳ) & Kagunita',
        lessons: ['Consonant Groups & Pronunciation', 'Forming 2-Letter & 3-Letter Words'],
        exercise: 'Read 15 everyday Kannada words and pass the oral/quiz check.',
      },
    ],
  },
  {
    id: 'OF-SCH-LKG-003',
    title: 'LKG to Class 2 Hindi Varnamala, Swar & Matra (हिन्दी बालवाटिका)',
    category: 'School Education',
    categoryGroup: 'Academic',
    subcategory: 'Hindi Foundational Literacy',
    level: 'Beginner',
    educationLevel: 'A',
    degreeProgrammes: ['LKG', 'UKG', 'Class 1', 'Class 2'],
    board: 'NCERT / CBSE / All State Boards',
    boards: ['NCERT', 'CBSE', 'UP Board', 'Bihar Board', 'MP Board', 'Rajasthan RBSE'],
    language: 'Hindi',
    supportedLanguages: ['Hindi', 'English'],
    duration: '10 Hours',
    estimatedHours: 10,
    videoId: 'pB6yN8bZ4oM',
    youtubeChannelName: 'Hindi Pathshala India',
    shortDesc: 'Complete Hindi alphabet (अ–ज्ञ), Matra blending, rhymes & short stories for LKG, UKG & Class 1–2 CBSE/State students.',
    skillsAcquired: ['Hindi Swar & Vyanjan', 'Matra Reading', 'Simple Sentence Framing'],
    keywords: ['hindi', 'varnamala', 'lkg', 'ukg', 'class 1', 'ncert', 'cbse'],
    parts: [
      {
        title: 'Part 1: Swar (अ–अः) & Vyanjan (क–ज्ञ)',
        lessons: ['Swar Sound & Tracing', 'Vyanjan Family Groups'],
        exercise: 'Read and identify Hindi vowels and consonants.',
      },
      {
        title: 'Part 2: Two/Three Letter Words & Matras',
        lessons: ['Aa, E, U, O Matra Drills', 'Hindi Balgeet & Quiz Check'],
        exercise: 'Complete word-picture matching & Hindi readiness quiz.',
      },
    ],
  },

  // ========================
  // LEVEL B: PRIMARY (CLASS 1 - 5)
  // ========================
  {
    id: 'OF-SCH-PRI-001',
    title: 'Class 1 to Class 5 Primary Mathematics: Numbers, Fractions & Mental Maths (NCERT/State)',
    category: 'Mathematics',
    categoryGroup: 'Academic',
    subcategory: 'Primary School (Class 1–5)',
    level: 'Beginner',
    educationLevel: 'B',
    degreeProgrammes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    board: 'NCERT / CBSE / Karnataka KTBS / ICSE',
    boards: ['NCERT', 'CBSE', 'Karnataka KSEAB', 'CISCE (ICSE)', 'State Boards'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi', 'Bengali'],
    duration: '18 Hours',
    estimatedHours: 18,
    videoId: 'p33BYf1NDAE',
    youtubeChannelName: 'Khan Academy India',
    shortDesc: 'Full primary school NCERT & State Board maths covering place value, multiplication tables, division, fractions, decimals, geometry & word problems.',
    skillsAcquired: ['Arithmetic Operations', 'Fractions & Decimals', 'Measurement & Time', 'Word Problem Solving'],
    keywords: ['class 1', 'class 2', 'class 3', 'class 4', 'class 5', 'primary', 'maths', 'fractions', 'ncert', 'cbse'],
    parts: [
      {
        title: 'Part 1: Whole Numbers, Place Value & Four Operations',
        lessons: ['Place Value & Number Sense', 'Fast Addition, Subtraction, Multiplication & Division'],
        exercise: 'Solve 10 mixed multi-digit arithmetic challenges.',
      },
      {
        title: 'Part 2: Fractions, Decimals, Time & Money',
        lessons: ['Visualizing Numerator & Denominator', 'Adding Like Fractions & Measuring Metric Units'],
        exercise: 'Complete primary fractions worksheet & verification quiz.',
      },
    ],
  },
  {
    id: 'OF-SCH-PRI-002',
    title: 'Class 1 to Class 5 Environmental Studies (EVS), General Science & English Grammar',
    category: 'Science',
    categoryGroup: 'Academic',
    subcategory: 'Primary EVS & English',
    level: 'Beginner',
    educationLevel: 'B',
    degreeProgrammes: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'],
    board: 'NCERT / CBSE / Karnataka State Board',
    boards: ['NCERT', 'CBSE', 'Karnataka KSEAB', 'CISCE (ICSE)', 'State Boards'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'],
    duration: '16 Hours',
    estimatedHours: 16,
    videoId: 'D0Ajq682yrA',
    youtubeChannelName: 'OpenFrame Primary Faculty',
    shortDesc: 'Plants, animals, water conservation, human body, parts of speech, tenses & paragraph reading for Classes 1 to 5.',
    skillsAcquired: ['EVS & Nature Concepts', 'Parts of Speech & Tenses', 'Reading Comprehension'],
    keywords: ['evs', 'primary science', 'english grammar', 'class 3', 'class 4', 'class 5', 'ncert'],
    parts: [
      {
        title: 'Part 1: Plants, Animals, Food & Water Cycle (EVS)',
        lessons: ['Parts of a Plant & Habitats', 'Nutrition, Cleanliness & States of Water'],
        exercise: 'Diagram and label plant growth and water cycle stages.',
      },
      {
        title: 'Part 2: Primary English Grammar & Comprehension',
        lessons: ['Nouns, Pronouns, Verbs & Adjectives', 'Present, Past & Future Tenses + Reading Test'],
        exercise: 'Complete primary grammar & EVS verification test.',
      },
    ],
  },

  // ========================
  // LEVEL C: MIDDLE SCHOOL (CLASS 6 - 8)
  // ========================
  {
    id: 'OF-SCH-MID-001',
    title: 'Class 6 to Class 8 Mathematics: Integers, Algebra, Mensuration & Triangles (NCERT/State)',
    category: 'Mathematics',
    categoryGroup: 'Academic',
    subcategory: 'Middle School (Class 6–8)',
    level: 'Beginner',
    educationLevel: 'C',
    degreeProgrammes: ['Class 6', 'Class 7', 'Class 8'],
    board: 'NCERT / CBSE / Karnataka DSERT / ICSE',
    boards: ['NCERT', 'CBSE', 'Karnataka KSEAB', 'CISCE (ICSE)', 'NIOS', 'State Boards'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi', 'Bengali', 'Urdu'],
    duration: '24 Hours',
    estimatedHours: 24,
    videoId: 'NybHckSEQBI',
    youtubeChannelName: 'Khan Academy India',
    shortDesc: 'Complete NCERT & State syllabus for Class 6, 7 & 8 covering integers, algebraic expressions, linear equations, congruence, percentages & graphs.',
    skillsAcquired: ['Linear Equations', 'Integers & Rationals', 'Mensuration & Area', 'Algebraic Identities'],
    keywords: ['class 6', 'class 7', 'class 8', 'middle school', 'algebra', 'geometry', 'ncert', 'cbse', 'karnataka'],
    parts: [
      {
        title: 'Part 1: Number Systems, Ratios & Percentages',
        lessons: ['Integers, Rational Numbers & Exponents', 'Profit/Loss, Simple Interest & Percentages'],
        exercise: 'Solve middle-school commercial math problems.',
      },
      {
        title: 'Part 2: Algebra, Linear Equations & Geometry',
        lessons: ['Variables, Algebraic Identities & Equations', 'Triangles, Parallel Lines & Area/Volume Mensuration'],
        exercise: 'Pass the Class 6–8 Algebra & Mensuration verification test.',
      },
    ],
  },
  {
    id: 'OF-SCH-MID-002',
    title: 'Class 6 to Class 8 Science & Coding Intro: Force, Light, Microorganisms & Python Basics',
    category: 'Science',
    categoryGroup: 'Academic',
    subcategory: 'Middle School Science & Coding',
    level: 'Beginner',
    educationLevel: 'C',
    degreeProgrammes: ['Class 6', 'Class 7', 'Class 8'],
    board: 'NCERT / CBSE / State Boards',
    boards: ['NCERT', 'CBSE', 'Karnataka KSEAB', 'CISCE (ICSE)', 'State Boards'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'],
    duration: '20 Hours',
    estimatedHours: 20,
    videoId: '_uQrJ0TkZlc',
    youtubeChannelName: 'Khan Academy & Mosh',
    shortDesc: 'Force & pressure, electricity & circuits, light reflection, cells & microorganisms, plus beginner coding for Classes 6–8.',
    skillsAcquired: ['Motion, Force & Light', 'Cells & Microorganisms', 'Intro to Python & Logic'],
    keywords: ['class 6', 'class 7', 'class 8', 'science', 'physics', 'biology', 'coding', 'ncert'],
    parts: [
      {
        title: 'Part 1: Physics & Chemistry Fundamentals (Classes 6–8)',
        lessons: ['Force, Friction, Pressure & Sound', 'Acids, Bases, Combustion & Electric Circuits'],
        exercise: 'Analyze everyday circuit & force scenarios.',
      },
      {
        title: 'Part 2: Biology & Digital Coding Foundations',
        lessons: ['Cell Structure, Microorganisms & Conservation', 'Algorithmic Logic & First Python Program'],
        exercise: 'Complete the Class 6–8 Science + Logic check.',
      },
    ],
  },

  // ========================
  // LEVEL D: SECONDARY (CLASS 9 - 10 · SSLC / CBSE / ICSE)
  // ========================
  {
    id: 'OF-SCH-SEC-001',
    title: 'Karnataka SSLC (KSEAB) & CBSE Class 10 Mathematics Mastery (Quadratics, Trigonometry & Circles)',
    category: 'Mathematics',
    categoryGroup: 'Academic',
    subcategory: 'Class 9–10 Board Preparation',
    level: 'Intermediate',
    educationLevel: 'D',
    degreeProgrammes: ['Class 9', 'Class 10'],
    board: 'Karnataka KSEAB SSLC / CBSE / NCERT / ICSE',
    boards: ['Karnataka KSEAB', 'CBSE', 'NCERT', 'CISCE (ICSE)', 'Maharashtra SSC', 'TN DGE', 'AP BSEAP', 'TS BSE', 'UPMSP'],
    language: 'English',
    supportedLanguages: ['English', 'Kannada', 'Hindi', 'Tamil', 'Telugu', 'Marathi', 'Urdu'],
    duration: '30 Hours',
    estimatedHours: 30,
    videoId: 'IlNAJl36-10',
    youtubeChannelName: 'NCERT & State Board Maths',
    shortDesc: 'Full board-exam syllabus for Karnataka SSLC & CBSE/ICSE Class 10: Real Numbers, Quadratic Equations, Arithmetic Progressions, Triangles, Trigonometry, Statistics & Surface Areas.',
    skillsAcquired: ['Quadratic Equations', 'Trigonometric Identities', 'Arithmetic Progressions', 'Coordinate Geometry & Theorems'],
    keywords: ['class 10', 'sslc', 'karnataka', 'kseab', 'cbse', 'ncert', 'icse', 'mathematics', 'trigonometry', 'quadratic'],
    parts: [
      {
        title: 'Part 1: Algebra — Polynomials, Linear Pairs & Quadratic Equations',
        lessons: ['Euclid Division & Fundamental Theorem', 'Arithmetic Progressions & Quadratic Roots Formula'],
        exercise: 'Solve 5 Karnataka SSLC / CBSE previous-year algebra problems.',
      },
      {
        title: 'Part 2: Geometry — Similar Triangles, Circles & Constructions',
        lessons: ['Thales Proportionality & Pythagoras Theorems', 'Tangent-Secant Theorems & Coordinate Distance Formula'],
        exercise: 'Prove triangle similarity and circle tangent results step by step.',
      },
      {
        title: 'Part 3: Trigonometry, Surface Areas, Statistics & Board Mock Test',
        lessons: ['Trig Ratios, Identities & Heights-Distances', 'Ogive Mean/Median/Mode & Full Board Quiz'],
        exercise: 'Pass the 10th Board Mathematics Verification Test (≥70%).',
      },
    ],
  },
  {
    id: 'OF-SCH-SEC-002',
    title: 'Class 9 & Class 10 Science: Physics, Chemistry & Biology (Karnataka SSLC / NCERT / CBSE)',
    category: 'Science',
    categoryGroup: 'Academic',
    subcategory: 'Class 9–10 Science Boards',
    level: 'Intermediate',
    educationLevel: 'D',
    degreeProgrammes: ['Class 9', 'Class 10'],
    board: 'NCERT / CBSE / Karnataka KSEAB SSLC',
    boards: ['Karnataka KSEAB', 'CBSE', 'NCERT', 'CISCE (ICSE)', 'NIOS', 'All State Boards'],
    language: 'Kannada',
    supportedLanguages: ['Kannada', 'English', 'Hindi', 'Tamil', 'Telugu', 'Marathi'],
    duration: '28 Hours',
    estimatedHours: 28,
    videoId: 'WUvTyaaNkzM',
    youtubeChannelName: 'NCERT Science Lab',
    shortDesc: 'Bilingual NCERT & Karnataka SSLC Class 9–10 Science: Chemical Reactions, Acids/Bases, Carbon Compounds, Electricity, Magnetic Effects, Control & Coordination, and Heredity.',
    skillsAcquired: ['Balancing Chemical Equations', 'Ohm Law & Circuits', 'Ray Diagrams & Optics', 'Genetics & Life Processes'],
    keywords: ['class 10 science', 'class 9 science', 'sslc', 'kannada', 'karnataka', 'ncert', 'cbse', 'physics', 'chemistry', 'biology'],
    parts: [
      {
        title: 'Part 1: Chemistry — Reactions, Periodic Table & Carbon Compounds',
        lessons: ['Balanced Equations & Redox Reactions', 'Metals, Non-Metals & Functional Carbon Groups'],
        exercise: 'Balance 8 board-level chemical equations.',
      },
      {
        title: 'Part 2: Physics — Electricity, Magnetism, Light Reflection & Refraction',
        lessons: ['Ohm Law, Series-Parallel Resistors & Joule Heating', 'Concave/Convex Mirrors, Lenses & Human Eye'],
        exercise: 'Compute circuit resistance and draw lens ray diagrams.',
      },
      {
        title: 'Part 3: Biology — Life Processes, Nervous System & Heredity',
        lessons: ['Nutrition, Respiration, Circulation & Excretion', 'Mendel Heredity, Evolution & Board Quiz'],
        exercise: 'Pass the SSLC / NCERT Class 10 Science verification test.',
      },
    ],
  },

  // ========================
  // LEVEL E: HIGHER SECONDARY (CLASS 11 - 12 / 1st & 2nd PUC)
  // ========================
  {
    id: 'OF-SCH-PUC-001',
    title: '1st & 2nd PUC / Class 11–12 Science (PCMB/PCMC): Physics, Chemistry, Maths & CS (DPUE/CBSE)',
    category: 'Physics',
    categoryGroup: 'Academic',
    subcategory: 'Higher Secondary (11–12 / PUC)',
    level: 'Intermediate',
    educationLevel: 'E',
    degreeProgrammes: ['PUC First Year', 'PUC Second Year', 'Class 11', 'Class 12', 'Science'],
    board: 'Karnataka DPUE PUC / CBSE / NCERT / CISCE (ISC)',
    boards: ['Karnataka DPUE PUC', 'CBSE', 'NCERT', 'CISCE (ISC)', 'State Boards'],
    language: 'English',
    supportedLanguages: ['English', 'Kannada', 'Hindi', 'Tamil', 'Telugu', 'Marathi'],
    duration: '36 Hours',
    estimatedHours: 36,
    videoId: 'ZM8ECpBuQYE',
    youtubeChannelName: 'Physics & JEE/NEET Foundation',
    shortDesc: 'Senior Secondary & Karnataka 1st/2nd PUC Science: Mechanics, Thermodynamics, Electrostatics, Calculus Matrices, Organic Chemistry & Python/SQL CS.',
    skillsAcquired: ['Differential & Integral Calculus', 'Electromagnetism & Optics', 'Organic Reaction Mechanisms', 'PUC / Board Problem Solving'],
    keywords: ['puc', '1st puc', '2nd puc', 'karnataka', 'dpue', 'class 11', 'class 12', 'physics', 'chemistry', 'maths', 'pcmb', 'pcmc'],
    parts: [
      {
        title: 'Part 1: Class 11 / 1st PUC — Kinematics, Laws of Motion & Derivatives',
        lessons: ['Vectors, Projectile Motion & Rotational Dynamics', 'Thermodynamics & Equilibrium'],
        exercise: 'Solve 5 numerical derivations from 1st PUC / NCERT.',
      },
      {
        title: 'Part 2: Class 12 / 2nd PUC — Electrostatics, Current, Integrals & Organic Chemistry',
        lessons: ['Gauss Law, Kirchhoff Circuits & Electromagnetic Induction', 'Matrices, Definite Integrals & Haloalkanes'],
        exercise: 'Solve 2nd PUC / Class 12 integration & circuit problems.',
      },
      {
        title: 'Part 3: Board Blueprints, Viva Practice & Verification Exam',
        lessons: ['3-Mark & 5-Mark Board Derivation Drill', 'Timed Verification Assessment'],
        exercise: 'Pass the 1st/2nd PUC Science Verification Assessment.',
      },
    ],
  },
  {
    id: 'OF-SCH-PUC-002',
    title: '1st & 2nd PUC / Class 11–12 Commerce: Accountancy, Economics & Business Studies (CEBA/SEBA)',
    category: 'Accounting',
    categoryGroup: 'Business',
    subcategory: 'PUC & Class 11–12 Commerce',
    level: 'Intermediate',
    educationLevel: 'E',
    degreeProgrammes: ['PUC First Year', 'PUC Second Year', 'Class 11', 'Class 12', 'Commerce'],
    board: 'Karnataka DPUE PUC / CBSE / NCERT / ISC',
    boards: ['Karnataka DPUE PUC', 'CBSE', 'NCERT', 'CISCE (ISC)', 'State Boards'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi', 'Gujarati'],
    duration: '30 Hours',
    estimatedHours: 30,
    videoId: 'R8p8Z_pL8p4',
    youtubeChannelName: 'Commerce & CA Foundation',
    shortDesc: 'Complete 1st & 2nd PUC / Class 11–12 Commerce track: Journal, Ledger, Bank Reconciliation, Partnership Accounts, Company Balance Sheet & Microeconomics.',
    skillsAcquired: ['Double-Entry Bookkeeping', 'Partnership & Company Accounts', 'Cash Flow Statements', 'Micro & Macroeconomics'],
    keywords: ['puc commerce', '1st puc', '2nd puc', 'class 11 commerce', 'class 12 commerce', 'accountancy', 'economics', 'business studies', 'ceba'],
    parts: [
      {
        title: 'Part 1: Accounting Cycle — Journal, Ledger & Trial Balance',
        lessons: ['Golden Rules of Accounting & GST Entries', 'Cash Book, BRS & Depreciation Methods'],
        exercise: 'Prepare a complete Trial Balance and Trading & P&L statement.',
      },
      {
        title: 'Part 2: Partnership, Shares & Financial Ratio Analysis',
        lessons: ['Partnership Admission, Retirement & Dissolution', 'Issue of Shares, Cash Flow & Microeconomics'],
        exercise: 'Compute liquidity/profitability ratios & pass the Commerce Verification Quiz.',
      },
    ],
  },

  // ========================
  // LEVEL F: DIPLOMA & POLYTECHNIC
  // ========================
  {
    id: 'OF-DIP-ENG-001',
    title: 'Polytechnic & Diploma Engineering: CS Networking, C Programming & AutoCAD / Electrical PLC',
    category: 'Career and Vocational Skills',
    categoryGroup: 'STEM',
    subcategory: 'Diploma & Polytechnic',
    level: 'Intermediate',
    educationLevel: 'F',
    degreeProgrammes: ['Polytechnic', 'Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics'],
    board: 'DTE Karnataka / AICTE Polytechnic Boards',
    boards: ['AICTE Polytechnic', 'Karnataka DTE', 'MSBTE', 'NIOS Vocational'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Marathi'],
    duration: '26 Hours',
    estimatedHours: 26,
    videoId: 'G3e-cpL7ofc',
    youtubeChannelName: 'Engineering & Polytechnic Faculty',
    shortDesc: 'Applied polytechnic skills for CS, ECE, EEE, Mechanical & Civil diploma cohorts covering C/Web, TCP/IP, CAD drafting & industrial safety.',
    skillsAcquired: ['Structured Programming', 'TCP/IP & Subnets', 'Engineering Drawing', 'Industrial PLC & Wiring'],
    keywords: ['diploma', 'polytechnic', 'iti', 'dte', 'msbte', 'mechanical', 'electrical', 'civil', 'computer science'],
    parts: [
      {
        title: 'Part 1: Engineering Math, Logic & Technical Drawing',
        lessons: ['Diploma Mathematics & Unit Conversions', 'CAD Projection & Circuit Reading'],
        exercise: 'Interpret a multi-component engineering schematic.',
      },
      {
        title: 'Part 2: Applied Software, Networking & Lab Verification',
        lessons: ['C Programming & IP Addressing Basics', 'Hands-On Diploma Verification Assessment'],
        exercise: 'Complete the practical diploma assessment with ≥70%.',
      },
    ],
  },

  // ========================
  // LEVEL G: UNDERGRADUATE DEGREES (BA, BCom, BBA, BCA, BSc, BE/BTech, LLB, Nursing)
  // ========================
  {
    id: 'OF-UG-BCA-001',
    title: 'BCA / BSc CS / BTech Full-Stack Web Development & Website Architecture (React, HTML, CSS, APIs)',
    category: 'Web Development',
    categoryGroup: 'Technology',
    subcategory: 'Undergraduate Computing (BCA / BSc / BTech)',
    level: 'All Levels',
    educationLevel: 'G',
    degreeProgrammes: ['BCA', 'BSc Computer Science', 'BSc IT', 'BE', 'BTech', 'CSE'],
    board: 'Indian Universities UGC / VTU / Bengaluru City / Mumbai / Delhi Univ',
    boards: ['UGC Universities', 'VTU', 'AICTE Engineering', 'OpenFrame University Track'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'],
    duration: '34 Hours',
    estimatedHours: 34,
    videoId: 'G3e-cpL7ofc',
    youtubeChannelName: 'SuperSimpleDev',
    shortDesc: 'How to build modern websites end-to-end for BCA, BSc CS & BTech students: Semantic HTML5, CSS Grid/Flexbox, TypeScript/JS DOM, REST APIs, and Cloud Deployment.',
    skillsAcquired: ['HTML5 & Modern CSS', 'JavaScript & React SPA', 'REST APIs & Auth', 'Responsive Production Deployment'],
    keywords: ['build a website', 'website', 'web development', 'bca', 'btech', 'bsc', 'html', 'css', 'javascript', 'react'],
    parts: [
      {
        title: 'Part 1: Semantic HTML5, Responsive CSS3 & Layout Systems',
        lessons: ['Semantic Landmarks & Accessible Forms', 'Flexbox, CSS Grid & Mobile-First Breakpoints'],
        exercise: 'Build a responsive 3-section website layout.',
      },
      {
        title: 'Part 2: Interactive JavaScript, Component UI & REST APIs',
        lessons: ['DOM Manipulation, Search & Filtering', 'Fetching APIs, State Management & Routing'],
        exercise: 'Wire dynamic course/catalog search inside a multi-view app.',
      },
      {
        title: 'Part 3: SEO Metadata, Security & Production Deployment',
        lessons: ['OpenGraph Tags, Performance & Deployment', 'University Capstone & Verification Exam'],
        exercise: 'Pass the Web Development Verification Quiz & deploy project.',
      },
    ],
  },
  {
    id: 'OF-UG-BCOM-001',
    title: 'BCom / BBA Complete Accounting, GST, Excel & Financial Analytics Track',
    category: 'Accounting',
    categoryGroup: 'Business',
    subcategory: 'Undergraduate Commerce (BCom / BBA)',
    level: 'All Levels',
    educationLevel: 'G',
    degreeProgrammes: ['BCom', 'BBA', 'BBM', 'Accounting', 'Finance'],
    board: 'UGC Universities (BCom / BBA Semester Curriculum)',
    boards: ['UGC Universities', 'ICAI Commerce Bridge', 'OpenFrame University Track'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Gujarati', 'Marathi'],
    duration: '28 Hours',
    estimatedHours: 28,
    videoId: 'Vl0H-qTclOg',
    youtubeChannelName: 'freeCodeCamp.org',
    shortDesc: 'Practical university BCom & BBA specialization uniting Corporate Accounting, Indian GST compliance, XLOOKUP/PivotTables in Excel, and Financial Statement Analysis.',
    skillsAcquired: ['Excel XLOOKUP & PivotTables', 'GST Input Tax Credit', 'Corporate Financial Statements', 'Budgeting & Valuation'],
    keywords: ['bcom', 'bba', 'bbm', 'excel', 'what is excel', 'accounting', 'gst', 'finance', 'spreadsheet', 'commerce'],
    parts: [
      {
        title: 'Part 1: Excel Mastery & Business Spreadsheets',
        lessons: ['What Is Excel? Workbooks, Cells & Formulas', 'XLOOKUP, SUMIFS, IF & Data Validation'],
        exercise: 'Build an automated GST invoice & sales tracker in Excel.',
      },
      {
        title: 'Part 2: PivotTables, Dashboards & Corporate Financial Statements',
        lessons: ['Dynamic PivotTables & KPI Slicers', 'Balance Sheet, Cash Flow & Ratio Auditing'],
        exercise: 'Complete the BCom/Excel Financial Analytics Capstone & Quiz.',
      },
    ],
  },
  {
    id: 'OF-UG-ENG-001',
    title: 'BE / BTech CSE, AI & Data Science: Python, Data Structures & Algorithms Mastery',
    category: 'Python Programming',
    categoryGroup: 'Technology',
    subcategory: 'Undergraduate Engineering (BE / BTech / BCA)',
    level: 'Intermediate',
    educationLevel: 'G',
    degreeProgrammes: ['BE', 'BTech', 'CSE', 'AI and Data Science', 'BCA', 'BSc Data Science'],
    board: 'AICTE / VTU / IIT NPTEL Aligned Engineering',
    boards: ['AICTE Engineering', 'VTU', 'UGC Universities'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'],
    duration: '38 Hours',
    estimatedHours: 38,
    videoId: '_uQrJ0TkZlc',
    youtubeChannelName: 'Programming with Mosh',
    shortDesc: 'University semester-aligned Python & DSA: Object-Oriented Design, Recursion, Stacks, Queues, Trees, Graphs, SQL Databases & Coding Interview prep.',
    skillsAcquired: ['Python & OOP', 'Data Structures & Algorithms', 'SQL & Relational Modeling', 'Time/Space Complexity'],
    keywords: ['btech', 'be', 'cse', 'python', 'dsa', 'algorithms', 'bca', 'engineering', 'coding'],
    parts: [
      {
        title: 'Part 1: Python Core, Functions & Object-Oriented Programming',
        lessons: ['Control Flow, Lists, Dicts & Modular Functions', 'Classes, Inheritance & File I/O'],
        exercise: 'Implement an OOP student & inventory processor in Python.',
      },
      {
        title: 'Part 2: Data Structures, Trees, Graphs & Interview Practice',
        lessons: ['Asymptotic Complexity, Stacks, Queues & Linked Lists', 'Binary Trees, BFS/DFS & Dynamic Programming Intro'],
        exercise: 'Solve 5 coding problems and pass the Technical Verification Exam.',
      },
    ],
  },
  {
    id: 'OF-UG-BA-001',
    title: 'BA Humanities & Social Sciences: Economics, Psychology, Journalism & Public Policy',
    category: 'Psychology',
    categoryGroup: 'Wellbeing',
    subcategory: 'Undergraduate Arts (BA / LLB)',
    level: 'Beginner',
    educationLevel: 'G',
    degreeProgrammes: ['BA', 'Psychology', 'Economics', 'Journalism', 'Political Science', 'History', 'English', 'LLB'],
    board: 'UGC Universities NEP 4-Year BA / LLB',
    boards: ['UGC Universities', 'State Universities', 'OpenFrame University Track'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Bengali', 'Marathi'],
    duration: '22 Hours',
    estimatedHours: 22,
    videoId: '3r46X2Z-p6s',
    youtubeChannelName: 'Academic Humanities Council',
    shortDesc: 'Interdisciplinary BA/LLB foundation bridging behavioral psychology, Indian constitutional polity, macroeconomics, media ethics & analytical writing.',
    skillsAcquired: ['Behavioral Psychology', 'Policy & Constitutional Analysis', 'Structured Essay Writing', 'Media & Communication Ethics'],
    keywords: ['ba', 'arts', 'psychology', 'economics', 'journalism', 'political science', 'llb', 'humanities'],
    parts: [
      {
        title: 'Part 1: Foundations of Psychology, Polity & Economics',
        lessons: ['Cognitive Processes & Social Behavior', 'Constitutional Framework & Public Finance Basics'],
        exercise: 'Write a 300-word structured policy/behavioral analysis brief.',
      },
      {
        title: 'Part 2: Analytical Writing, Media & Verification Exam',
        lessons: ['Critical Source Evaluation & Reporting Ethics', 'BA Humanities Verification Assessment'],
        exercise: 'Pass the BA Humanities & Policy Verification Quiz.',
      },
    ],
  },

  // ========================
  // LEVEL H & I: POSTGRADUATE & PhD RESEARCH
  // ========================
  {
    id: 'OF-PG-MBA-001',
    title: 'MBA / PGDM / MCom Executive Specialization: Corporate Finance, Strategy & Leadership',
    category: 'Business Management',
    categoryGroup: 'Business',
    subcategory: 'Postgraduate Management (MBA / MCom)',
    level: 'Advanced',
    educationLevel: 'H',
    degreeProgrammes: ['MBA', 'MCom', 'PGDM', 'Executive'],
    board: 'UGC / AICTE Postgraduate Management',
    boards: ['AICTE Management', 'UGC Universities', 'OpenFrame PG Council'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada'],
    duration: '36 Hours',
    estimatedHours: 36,
    videoId: 'Vl0H-qTclOg',
    youtubeChannelName: 'OpenFrame PG Business Faculty',
    shortDesc: 'Postgraduate business & finance curriculum covering DCF Valuation, Capital Budgeting, Competitive Strategy, Supply Chain KPIs, and Executive Analytics.',
    skillsAcquired: ['DCF Financial Modeling', 'Corporate Valuation & WACC', 'Competitive Strategy', 'Executive KPI Reporting'],
    keywords: ['mba', 'mcom', 'postgraduate', 'pgdm', 'finance', 'management', 'strategy', 'valuation'],
    parts: [
      {
        title: 'Part 1: Financial Statement Modeling, WACC & Capital Budgeting',
        lessons: ['Free Cash Flow, NPV, IRR & Sensitivity Modeling', 'Capital Structure & Working Capital Management'],
        exercise: 'Build a 3-year DCF projection in Excel.',
      },
      {
        title: 'Part 2: Competitive Strategy, Operations & Leadership Case Study',
        lessons: ['Industry Five-Forces & GTM Unit Economics', 'Boardroom Decision Defense & MBA Verification Test'],
        exercise: 'Complete the MBA Strategic Finance Case Verification Exam.',
      },
    ],
  },
  {
    id: 'OF-PG-MTECH-001',
    title: 'MCA / MTech / MSc Applied AI, Machine Learning Systems & Distributed Cloud Architecture',
    category: 'Machine Learning',
    categoryGroup: 'Technology',
    subcategory: 'Postgraduate Computing (MCA / MTech / MSc)',
    level: 'Advanced',
    educationLevel: 'H',
    degreeProgrammes: ['MCA', 'MTech', 'MSc', 'ME', 'BTech'],
    board: 'AICTE / UGC Postgraduate Computing',
    boards: ['AICTE Postgraduate', 'UGC Universities', 'OpenFrame PG Council'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu'],
    duration: '40 Hours',
    estimatedHours: 40,
    videoId: 'i_LwzRVP7bg',
    youtubeChannelName: 'Stanford Online',
    shortDesc: 'Graduate-level Machine Learning, Neural Architectures, LLM Evaluation, Distributed Cloud Systems & MLOps deployment for MCA, MTech & MSc scholars.',
    skillsAcquired: ['Supervised & Unsupervised ML', 'Transformer Neural Networks', 'Distributed Microservices', 'Production MLOps'],
    keywords: ['mca', 'mtech', 'msc', 'machine learning', 'deep learning', 'ai', 'postgraduate', 'cloud', 'distributed systems'],
    parts: [
      {
        title: 'Part 1: Statistical Learning Theory, Gradient Optimization & Neural Nets',
        lessons: ['Linear/Logistic Regression, Regularization & Bias-Variance', 'Backpropagation & Transformer Self-Attention'],
        exercise: 'Train and validate a gradient-descent classifier on tabular features.',
      },
      {
        title: 'Part 2: Scalable Systems, Evaluation & PG Verification Exam',
        lessons: ['Model Serving Latency, Caching & Reliability', 'Postgraduate ML & Systems Verification Exam'],
        exercise: 'Score ≥70% on the PG Machine Learning Verification Exam.',
      },
    ],
  },
  {
    id: 'OF-PG-PHD-001',
    title: 'PhD / MPhil / PG Research Methodology, Quantitative Statistics & Academic Paper Writing',
    category: 'Competitive Exam Preparation',
    categoryGroup: 'Academic',
    subcategory: 'Doctoral & Research (PhD / MPhil / PG)',
    level: 'Advanced',
    educationLevel: 'I',
    degreeProgrammes: ['PhD', 'MPhil', 'Doctoral Research', 'Research Methodology', 'Academic Writing', 'MA', 'MSc', 'MCom'],
    board: 'UGC NET / PhD Research Framework',
    boards: ['UGC Research Council', 'All Indian Universities'],
    language: 'English',
    supportedLanguages: ['English', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Bengali'],
    duration: '32 Hours',
    estimatedHours: 32,
    videoId: '3r46X2Z-p6s',
    youtubeChannelName: 'Academic Research Council',
    shortDesc: 'Mandatory UGC-aligned doctoral & master thesis course: Problem Formulation, PRISMA Literature Reviews, Hypothesis Testing (t-test/ANOVA), Plagiarism Ethics & Scopus/IEEE Publishing.',
    skillsAcquired: ['Systematic Literature Review', 'Hypothesis & ANOVA Testing', 'APA/IEEE Citations', 'Manuscript & Thesis Defense'],
    keywords: ['phd', 'research', 'research methodology', 'mphil', 'thesis', 'dissertation', 'academic writing', 'ugc net', 'publication'],
    parts: [
      {
        title: 'Part 1: Research Design, Sampling & Systematic Literature Reviews',
        lessons: ['Formulating Null/Alternative Hypotheses & Variables', 'PRISMA Screening & Reference Management'],
        exercise: 'Draft a 1-page research proposal with objectives & research gap.',
      },
      {
        title: 'Part 2: Quantitative Analysis, Publication Ethics & Viva Defense',
        lessons: ['t-Tests, Chi-Square, ANOVA & Regression Interpretation', 'Peer-Review Rebuttal & Research Methodology Quiz'],
        exercise: 'Pass the Research Methodology Verification Assessment.',
      },
    ],
  },
];

/**
 * Generates normalized, 90%-off priced (strictly ₹300–₹2,500) MarketplaceCourse entries
 * covering LKG through Post-Graduation & PhD across Indian Boards & Languages.
 */
export const LKG_TO_PG_CURRICULUM_COURSES: MarketplaceCourse[] = BLUEPRINTS.map((bp, idx) => {
  const pricing = compute90PercentCoursePricing({
    id: bp.id,
    title: bp.title,
    category: bp.category,
    categoryGroup: bp.categoryGroup,
    level: bp.level,
    educationLevels: [bp.educationLevel],
    degreeProgrammes: bp.degreeProgrammes,
    estimatedHours: bp.estimatedHours,
    board: bp.board,
  });

  const matchingSeed =
    LKG_TO_PG_YOUTUBE_SEEDS.find((s) => s.videoId === bp.videoId) || LKG_TO_PG_YOUTUBE_SEEDS[0];

  const modules: MarketplaceModule[] = bp.parts.map((part, pIdx) => ({
    id: `${bp.id}_M${pIdx + 1}`,
    moduleNumber: pIdx + 1,
    partLabel: part.title,
    level: pIdx === 0 ? 'Beginner' : pIdx === bp.parts.length - 1 ? 'Advanced' : 'Intermediate',
    title: part.title,
    duration: `${Math.max(3, Math.round(bp.estimatedHours / bp.parts.length))} Hours`,
    lessons: part.lessons,
    videoIds: [bp.videoId],
    objectives: [
      `Master ${part.title}`,
      part.exercise,
    ],
  }));

  const ytUrl = `https://www.youtube.com/watch?v=${bp.videoId}`;
  const thumb = `https://i.ytimg.com/vi/${bp.videoId}/hqdefault.jpg`;

  return {
    id: bp.id,
    title: bp.title,
    category: bp.category,
    categories: [bp.category, 'School Education', bp.subcategory].filter(Boolean),
    categoryGroup: bp.categoryGroup,
    subcategory: bp.subcategory,
    level: bp.level,
    duration: bp.duration,
    estimatedHours: bp.estimatedHours,
    pricingTier: pricing.pricingTier,
    price: pricing.finalPriceInr,
    marketBenchmarkPrice: pricing.marketBenchmarkPrice,
    discountPercent: pricing.discountPercent,
    isFree: false,
    status: 'Published',
    courseType: 'youtube_video',
    contentType: 'Full course',
    topic: bp.subcategory,
    board: bp.board,
    boards: bp.boards,
    gradeLevel: bp.degreeProgrammes.join(', '),
    educationLevels: [bp.educationLevel],
    degreeProgrammes: bp.degreeProgrammes,
    instructorName: `OpenFrame ${bp.board.split('/')[0].trim()} Faculty`,
    youtubeChannelName: bp.youtubeChannelName,
    youtubeVideoId: bp.videoId,
    youtubeUrl: ytUrl,
    language: bp.language,
    supportedLanguages: bp.supportedLanguages,
    rating: 4.9,
    reviewCount: 42 + idx * 7,
    hasVerifiedReviews: true,
    enrolledCount: 2800 + idx * 450,
    isPopular: true,
    isTrending: true,
    isNew: true,
    isRecommended: true,
    certificateEligibility: true,
    thumbnailUrl: thumb,
    imageUrl: thumb,
    shortDesc: bp.shortDesc,
    description: `${bp.shortDesc} Market tuition ${pricing.marketBenchmarkPrice.toLocaleString('en-IN')} INR — available under the 90% OpenFrame Grant at just ₹${pricing.finalPriceInr.toLocaleString('en-IN')}. Includes YouTube video lessons, progressive Parts & Modules, verification assessment test, and QR-verified Certificate.`,
    learningObjectives: bp.parts.map((p) => p.exercise),
    targetAudience: `${bp.degreeProgrammes.join(', ')} learners (${bp.board})`,
    skillsAcquired: bp.skillsAcquired,
    practicalProjects: bp.parts.map((p) => p.exercise),
    assessmentMethod: 'Module Completion + AI Verification Test (≥70%) + Address-Verified Credential',
    certificateNote: `Eligible for OpenFrame Verified Certificate upon completing all modules, scoring ≥70% on the Verification Test, and confirming home address & contact details.`,
    keywords: Array.from(
      new Set([
        ...bp.keywords,
        ...bp.boards.map((b) => b.toLowerCase()),
        ...bp.supportedLanguages.map((l) => l.toLowerCase()),
        ...bp.degreeProgrammes.map((d) => d.toLowerCase()),
      ])
    ),
    modules,
    recommendedVideos: [
      {
        id: `${bp.id}-vid-1`,
        videoId: bp.videoId,
        youtubeId: bp.videoId,
        youtubeUrl: ytUrl,
        title: matchingSeed.title,
        channelTitle: bp.youtubeChannelName,
        thumbnail: thumb,
        thumbnailUrl: thumb,
        duration: matchingSeed.duration,
        level: matchingSeed.level,
        detectedLanguage: bp.language,
        recommendedReason: matchingSeed.recommendedReason,
        embedUrl: `https://www.youtube-nocookie.com/embed/${bp.videoId}`,
        source: 'curated_library',
      },
    ],
    publishedDate: '2026-11-18',
    updatedAt: '2026-11-18T00:00:00.000Z',
  };
});
