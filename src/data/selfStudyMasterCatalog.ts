import { ALL_INDIA_BOARDS } from './allIndiaBoardsData';
import { getQuestionBank, IqEqSqGradeBand } from './iqEqSqQuestionsData';
import {
  AssessmentDimension,
  IqEqSqQuestionItem,
  SelfStudyChapterNote,
  SelfStudyExamQuestion,
  SelfStudyTopicDiagnostic,
} from '../types';

export interface SelfStudySubjectSpec {
  id: string;
  name: string;
  department: string;
  chapters: string[];
}

export interface SelfStudyClassOrDeptSpec {
  id: string;
  label: string;
  streamOrFaculty?: string;
  gradeBand: IqEqSqGradeBand;
  subjects: SelfStudySubjectSpec[];
}

export interface SelfStudyMasterLevel {
  levelNumber: number; // 1 to 10
  code: string;
  title: string;
  shortLabel: string;
  educationCategoryCode: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J';
  description: string;
  classesOrDepartments: SelfStudyClassOrDeptSpec[];
}

export const SELF_STUDY_MASTER_LEVELS: SelfStudyMasterLevel[] = [
  {
    levelNumber: 1,
    code: 'L1_LKG_UKG',
    title: '1. LKG & UKG (Foundational Balvatika)',
    shortLabel: '1. LKG & UKG',
    educationCategoryCode: 'A',
    description: 'Early literacy, phonics, numbers, rhymes, Kannada/Hindi/English basics, and playful nature discovery.',
    classesOrDepartments: [
      {
        id: 'LKG',
        label: 'LKG (Lower Kindergarten)',
        gradeBand: 'Primary (1-5)',
        subjects: [
          {
            id: 'lkg-eng',
            name: 'English Phonics & Rhymes',
            department: 'Foundational Literacy',
            chapters: [
              'Alphabet A to M Sounds & Tracing',
              'Alphabet N to Z Sounds & Tracing',
              'Short Vowel Sounds (a, e, i, o, u)',
              'Action Rhymes & Story Listening',
              'Picture Naming & Everyday Vocabulary',
            ],
          },
          {
            id: 'lkg-math',
            name: 'Early Numeracy & Shapes',
            department: 'Foundational Numeracy',
            chapters: [
              'Counting Numbers 1 to 20',
              'Counting Numbers 21 to 50',
              'Big & Small, Tall & Short Comparisons',
              'Basic 2D Shapes (Circle, Square, Triangle)',
              'Colours, Patterns & Matching',
            ],
          },
          {
            id: 'lkg-evs',
            name: 'General Awareness & EVS',
            department: 'World Around Us',
            chapters: [
              'Myself, Body Parts & Good Habits',
              'My Family, Home & School',
              'Fruits, Vegetables & Healthy Food',
              'Domestic & Wild Animals',
              'Seasons, Weather & Transport',
            ],
          },
          {
            id: 'lkg-lang',
            name: 'Regional Language (Kannada / Hindi)',
            department: 'Mother Tongue',
            chapters: [
              'Swaragalu / Swar Varnamala Basics',
              'Simple Words & Picture Stories',
              'Greetings, Family Words & Folk Rhymes',
              'Numbers 1 to 10 in Regional Script',
            ],
          },
        ],
      },
      {
        id: 'UKG',
        label: 'UKG (Upper Kindergarten)',
        gradeBand: 'Primary (1-5)',
        subjects: [
          {
            id: 'ukg-eng',
            name: 'English Reading & Writing',
            department: 'Foundational Literacy',
            chapters: [
              'CVC Three-Letter Words & Blending',
              'Sight Words & Simple Sentences',
              'Use of A, An, This & That',
              'Opposites, Plurals & Picture Comprehension',
              'Storytelling & Spoken Conversation',
            ],
          },
          {
            id: 'ukg-math',
            name: 'Mathematics Foundation',
            department: 'Foundational Numeracy',
            chapters: [
              'Numbers 1 to 100 & Number Names',
              'Before, After & Between Numbers',
              'Single-Digit Addition with Pictures',
              'Single-Digit Subtraction with Pictures',
              'Time (O-Clock), Days & Money Coins',
            ],
          },
          {
            id: 'ukg-evs',
            name: 'Environmental Studies (EVS)',
            department: 'World Around Us',
            chapters: [
              'Living & Non-Living Things',
              'Parts of a Plant & Seed Growth',
              'Community Helpers & Neighbourhood',
              'Water, Air & Clean Earth Habits',
              'Indian Festivals & National Symbols',
            ],
          },
        ],
      },
    ],
  },
  {
    levelNumber: 2,
    code: 'L2_PRIMARY',
    title: '2. Primary School (Class 1 to Class 5)',
    shortLabel: '2. Class 1–5',
    educationCategoryCode: 'B',
    description: 'Core NCERT, Karnataka KTBS, CBSE, ICSE & State Board primary mathematics, EVS, English, and regional languages.',
    classesOrDepartments: [
      {
        id: 'CLASS_1_2',
        label: 'Class 1 & Class 2',
        gradeBand: 'Primary (1-5)',
        subjects: [
          {
            id: 'p12-math',
            name: 'Mathematics',
            department: 'Primary STEM',
            chapters: [
              'Shapes and Spatial Understanding',
              'Numbers from 1 to 100 & Place Value',
              'Addition and Subtraction up to 99',
              'Introduction to Multiplication Tables (2 to 10)',
              'Measurement of Length, Weight & Capacity',
              'Time, Calendar & Indian Currency',
            ],
          },
          {
            id: 'p12-evs',
            name: 'Environmental Studies (EVS)',
            department: 'Primary Science',
            chapters: [
              'Our Sense Organs & Personal Hygiene',
              'Food We Eat & Nutrition Basics',
              'Plants Around Us & Their Uses',
              'Animals, Habitats & Shelters',
              'Air, Water & Weather Changes',
            ],
          },
          {
            id: 'p12-eng',
            name: 'English Grammar & Reading',
            department: 'Languages',
            chapters: [
              'Nouns, Pronouns & Naming Words',
              'Action Words (Verbs) & Describing Words',
              'Sentence Formation & Punctuation',
              'Reading Comprehension Stories',
            ],
          },
        ],
      },
      {
        id: 'CLASS_3_5',
        label: 'Class 3, Class 4 & Class 5',
        gradeBand: 'Primary (1-5)',
        subjects: [
          {
            id: 'p35-math',
            name: 'Mathematics',
            department: 'Primary STEM',
            chapters: [
              'Large Numbers & Indian Place Value System',
              'Four Fundamental Operations & Word Problems',
              'Factors, Multiples, HCF & LCM',
              'Fractions & Equivalent Fractions',
              'Decimals, Money & Unitary Method',
              'Angles, Perimeter & Area of Shapes',
              'Data Handling & Bar Charts',
            ],
          },
          {
            id: 'p35-sci',
            name: 'Science / EVS',
            department: 'Primary Science',
            chapters: [
              'Super Senses & Animal Adaptations',
              'Digestion, Nutrition & Healthy Living',
              'Seeds, Photosynthesis & Plant Life',
              'States of Matter: Solid, Liquid & Gas',
              'Force, Work & Simple Machines',
              'Solar System, Earth & Natural Resources',
            ],
          },
          {
            id: 'p35-soc',
            name: 'Social Studies',
            department: 'Humanities',
            chapters: [
              'Globes, Maps & Continents',
              'India: States, Capitals & Physical Features',
              'Our Constitution, Rights & Local Governance',
              'Transport, Communication & Heritage of India',
            ],
          },
          {
            id: 'p35-comp',
            name: 'Computer Basics & Digital Literacy',
            department: 'Computing',
            chapters: [
              'Parts of a Computer & Input/Output Devices',
              'Typing, Paint & Word Processing Basics',
              'Safe Internet Habits & Digital Citizenship',
              'Introduction to Scratch Visual Coding',
            ],
          },
        ],
      },
    ],
  },
  {
    levelNumber: 3,
    code: 'L3_MIDDLE',
    title: '3. Middle School (Class 6 to Class 8)',
    shortLabel: '3. Class 6–8',
    educationCategoryCode: 'C',
    description: 'Complete chapter-by-chapter Karnataka State Board (KTBS/DSERT), NCERT, CBSE & ICSE middle-school subjects including 8th Standard Science.',
    classesOrDepartments: [
      {
        id: 'CLASS_8',
        label: 'Class 8 (8th Standard)',
        gradeBand: 'Middle (6-8)',
        subjects: [
          {
            id: 'c8-sci',
            name: 'Science',
            department: 'Science (Karnataka KTBS / NCERT / CBSE / ICSE)',
            chapters: [
              'Crop Production and Management',
              'Microorganisms: Friend and Foe',
              'Coal and Petroleum',
              'Combustion and Flame',
              'Conservation of Plants and Animals',
              'Reproduction in Animals',
              'Reaching the Age of Adolescence',
              'Force and Pressure',
              'Friction',
              'Sound',
              'Chemical Effects of Electric Current',
              'Some Natural Phenomena',
              'Light',
            ],
          },
          {
            id: 'c8-math',
            name: 'Mathematics',
            department: 'Mathematics',
            chapters: [
              'Rational Numbers',
              'Linear Equations in One Variable',
              'Understanding Quadrilaterals',
              'Data Handling & Probability',
              'Squares and Square Roots',
              'Cubes and Cube Roots',
              'Comparing Quantities (Percentage & Compound Interest)',
              'Algebraic Expressions and Identities',
              'Mensuration (Surface Area & Volume)',
              'Exponents and Powers',
              'Direct and Inverse Proportions',
              'Factorisation & Introduction to Graphs',
            ],
          },
          {
            id: 'c8-soc',
            name: 'Social Science',
            department: 'History, Geography & Civics',
            chapters: [
              'Sources of Indian History & Ancient Civilisations',
              'The Mauryas, Guptas & South Indian Dynasties (Chalukyas, Cholas, Hoysalas)',
              'The Earth — Our Living Planet & Lithosphere',
              'Atmosphere, Hydrosphere & Biosphere',
              'Meaning and Importance of Political Science & Citizen Rights',
              'Basic Concepts of Economics & National Income',
            ],
          },
          {
            id: 'c8-eng',
            name: 'English First / Second Language',
            department: 'Languages',
            chapters: [
              'Prose Comprehension & Literary Devices',
              'Tenses, Active & Passive Voice',
              'Direct and Indirect Speech',
              'Formal Letter, Essay & Precis Writing',
            ],
          },
          {
            id: 'c8-kan',
            name: 'Kannada / Hindi / Regional Language',
            department: 'State & National Languages',
            chapters: [
              'Gadya & Padya Sahitya Comprehension',
              'Vyakarana (Sandhi, Samasa, Alankara)',
              'Patra Lekhana & Prabandha Writing',
            ],
          },
          {
            id: 'c8-comp',
            name: 'Computer Science & Coding',
            department: 'Computing',
            chapters: [
              'Computer Networks & Internet Architecture',
              'Spreadsheets (Excel) Formulas & Charts',
              'HTML5 & CSS3 Webpage Fundamentals',
              'Python Programming Basics & Loops',
            ],
          },
        ],
      },
      {
        id: 'CLASS_6',
        label: 'Class 6 (6th Standard)',
        gradeBand: 'Middle (6-8)',
        subjects: [
          {
            id: 'c6-sci',
            name: 'Science',
            department: 'Science',
            chapters: [
              'Components of Food & Balanced Diet',
              'Sorting Materials into Groups',
              'Separation of Substances',
              'Getting to Know Plants',
              'Body Movements & Skeletal System',
              'Motion and Measurement of Distances',
              'Light, Shadows and Reflections',
              'Electricity and Circuits',
              'Fun with Magnets',
            ],
          },
          {
            id: 'c6-math',
            name: 'Mathematics',
            department: 'Mathematics',
            chapters: [
              'Knowing Our Numbers',
              'Whole Numbers & Number Line',
              'Playing with Numbers (Primes, HCF, LCM)',
              'Basic Geometrical Ideas',
              'Integers',
              'Fractions and Decimals',
              'Mensuration & Algebra Basics',
              'Ratio and Proportion',
            ],
          },
          {
            id: 'c6-soc',
            name: 'Social Science',
            department: 'Humanities',
            chapters: [
              'Early Humans & Harappan Civilisation',
              'The Earth in the Solar System',
              'Latitudes, Longitudes & Maps',
              'Diversity, Government & Panchayati Raj',
            ],
          },
        ],
      },
      {
        id: 'CLASS_7',
        label: 'Class 7 (7th Standard)',
        gradeBand: 'Middle (6-8)',
        subjects: [
          {
            id: 'c7-sci',
            name: 'Science',
            department: 'Science',
            chapters: [
              'Nutrition in Plants',
              'Nutrition in Animals',
              'Heat and Temperature Transfer',
              'Acids, Bases and Salts',
              'Physical and Chemical Changes',
              'Respiration in Organisms',
              'Transportation in Animals and Plants',
              'Motion and Time',
              'Electric Current and its Effects',
              'Light, Mirrors and Lenses',
            ],
          },
          {
            id: 'c7-math',
            name: 'Mathematics',
            department: 'Mathematics',
            chapters: [
              'Integers & Properties',
              'Fractions and Decimals',
              'Simple Equations',
              'Lines and Angles',
              'The Triangle and its Properties',
              'Comparing Quantities (Profit, Loss & Simple Interest)',
              'Perimeter and Area',
              'Algebraic Expressions & Exponents',
            ],
          },
        ],
      },
    ],
  },
  {
    levelNumber: 4,
    code: 'L4_SECONDARY',
    title: '4. Secondary & Board Exams (Class 9–10 / SSLC)',
    shortLabel: '4. Class 9–10 / SSLC',
    educationCategoryCode: 'D',
    description: 'High-school board exam mastery for Karnataka KSEAB SSLC, NCERT, CBSE, CISCE ICSE, NIOS & all State Boards.',
    classesOrDepartments: [
      {
        id: 'CLASS_10',
        label: 'Class 10 (SSLC / CBSE / ICSE / NIOS)',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'c10-sci',
            name: 'Science (Physics, Chemistry & Biology)',
            department: 'Board Science',
            chapters: [
              'Chemical Reactions and Equations',
              'Acids, Bases and Salts',
              'Metals and Non-Metals',
              'Carbon and its Compounds',
              'Life Processes (Nutrition, Respiration, Circulation)',
              'Control and Coordination',
              'Heredity and Evolution',
              'Light — Reflection and Refraction',
              'The Human Eye and the Colourful World',
              'Electricity (Ohm’s Law, Circuits & Power)',
              'Magnetic Effects of Electric Current',
              'Our Environment & Sustainable Management',
            ],
          },
          {
            id: 'c10-math',
            name: 'Mathematics',
            department: 'Board Mathematics',
            chapters: [
              'Real Numbers & Euclid’s Division Lemma',
              'Polynomials',
              'Pair of Linear Equations in Two Variables',
              'Quadratic Equations',
              'Arithmetic Progressions',
              'Triangles & Similarity Theorems',
              'Coordinate Geometry',
              'Introduction to Trigonometry & Applications',
              'Circles & Tangents',
              'Surface Areas and Volumes',
              'Statistics & Probability',
            ],
          },
          {
            id: 'c10-soc',
            name: 'Social Science',
            department: 'History, Geography, Civics & Economics',
            chapters: [
              'The Advent of Europeans & Freedom Movement in India',
              'World Wars & Post-Independence India',
              'Indian Physiography, Climate, Soils & Agriculture',
              'Power Sharing, Federalism & Democratic Institutions',
              'Development, Sectors of Indian Economy & Banking',
            ],
          },
        ],
      },
      {
        id: 'CLASS_9',
        label: 'Class 9 (9th Standard)',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'c9-sci',
            name: 'Science',
            department: 'High School Science',
            chapters: [
              'Matter in Our Surroundings',
              'Atoms and Molecules',
              'Structure of the Atom',
              'The Fundamental Unit of Life (Cell)',
              'Tissues (Plant & Animal)',
              'Motion (Equations & Graphs)',
              'Force and Laws of Motion',
              'Gravitation & Archimedian Principle',
              'Work and Energy',
              'Sound Waves & Echoes',
            ],
          },
          {
            id: 'c9-math',
            name: 'Mathematics',
            department: 'High School Mathematics',
            chapters: [
              'Number Systems (Irrational & Real)',
              'Polynomials & Factor Theorem',
              'Linear Equations in Two Variables',
              'Lines, Angles & Triangles Congruence',
              'Quadrilaterals & Circles',
              'Heron’s Formula, Surface Areas & Volumes',
              'Statistics & Graphical Representation',
            ],
          },
        ],
      },
    ],
  },
  {
    levelNumber: 5,
    code: 'L5_PUC_SENIOR',
    title: '5. Senior Secondary & PUC (1st & 2nd PUC / Class 11–12)',
    shortLabel: '5. 1st & 2nd PUC',
    educationCategoryCode: 'E',
    description: 'Karnataka DPUE 1st & 2nd PUC, CBSE, ISC & State Senior Secondary across Science, Commerce, and Arts streams.',
    classesOrDepartments: [
      {
        id: 'PUC_SCIENCE',
        label: '1st & 2nd PUC — Science Stream (PCMB / PCMC)',
        streamOrFaculty: 'Science',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'puc-phy',
            name: 'Physics',
            department: 'Science Stream',
            chapters: [
              'Electric Charges and Fields (Gauss’s Law)',
              'Electrostatic Potential and Capacitance',
              'Current Electricity & Kirchhoff’s Rules',
              'Moving Charges and Magnetism',
              'Electromagnetic Induction & Alternating Current',
              'Ray Optics, Wave Optics & Interference',
              'Dual Nature of Radiation, Atoms & Nuclei',
              'Semiconductor Electronics & Logic Gates',
            ],
          },
          {
            id: 'puc-chem',
            name: 'Chemistry',
            department: 'Science Stream',
            chapters: [
              'Solutions & Colligative Properties',
              'Electrochemistry & Nernst Equation',
              'Chemical Kinetics & Order of Reaction',
              'd- and f-Block Elements & Coordination Compounds',
              'Haloalkanes, Alcohols, Phenols & Ethers',
              'Aldehydes, Ketones, Carboxylic Acids & Amines',
              'Biomolecules & Polymers',
            ],
          },
          {
            id: 'puc-math',
            name: 'Mathematics',
            department: 'Science Stream',
            chapters: [
              'Relations, Functions & Inverse Trigonometry',
              'Matrices and Determinants',
              'Continuity, Differentiability & Applications of Derivatives',
              'Indefinite & Definite Integrals',
              'Differential Equations',
              'Vector Algebra & Three-Dimensional Geometry',
              'Linear Programming & Bayes’ Probability',
            ],
          },
          {
            id: 'puc-bio',
            name: 'Biology',
            department: 'Science Stream',
            chapters: [
              'Sexual Reproduction in Flowering Plants & Human Reproduction',
              'Principles of Inheritance and Molecular Basis of Inheritance',
              'Human Health, Immunity & Microbes in Welfare',
              'Biotechnology: Principles, Recombinant DNA & Applications',
              'Organisms, Ecosystems & Biodiversity Conservation',
            ],
          },
          {
            id: 'puc-cs',
            name: 'Computer Science',
            department: 'Science Stream',
            chapters: [
              'Data Structures (Stacks, Queues, Linked Lists)',
              'Database Management Systems & SQL Queries',
              'Object-Oriented Programming (C++ / Python)',
              'Computer Networks, Protocols & Cyber Security',
            ],
          },
        ],
      },
      {
        id: 'PUC_COMMERCE',
        label: '1st & 2nd PUC — Commerce Stream',
        streamOrFaculty: 'Commerce',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'puc-acc',
            name: 'Accountancy',
            department: 'Commerce Stream',
            chapters: [
              'Accounting for Partnership Firms: Fundamentals & Goodwill',
              'Reconstitution, Admission & Retirement of a Partner',
              'Accounting for Share Capital & Debentures',
              'Financial Statements of a Company & Ratio Analysis',
              'Cash Flow Statement Preparation',
            ],
          },
          {
            id: 'puc-bs',
            name: 'Business Studies',
            department: 'Commerce Stream',
            chapters: [
              'Nature, Significance & Principles of Management',
              'Planning, Organising, Staffing & Directing',
              'Financial Management & Capital Markets',
              'Marketing Management & Consumer Protection Act',
            ],
          },
          {
            id: 'puc-eco',
            name: 'Economics',
            department: 'Commerce Stream',
            chapters: [
              'Microeconomics: Consumer Behaviour, Demand & Elasticity',
              'Production Costs & Market Equilibrium',
              'Macroeconomics: National Income Accounting (GDP/GNP)',
              'Money, Banking (RBI) & Government Fiscal Budget',
              'Balance of Payments & Foreign Exchange',
            ],
          },
        ],
      },
      {
        id: 'PUC_ARTS',
        label: '1st & 2nd PUC — Arts & Humanities Stream',
        streamOrFaculty: 'Arts',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'puc-hist',
            name: 'History',
            department: 'Arts & Humanities',
            chapters: [
              'Indus Valley, Vedic Age & Mauryan Empire',
              'Vijayanagara Empire & Bhakti-Sufi Traditions',
              'Indian National Movement & Constitutional Making',
              'Unification of Karnataka & Modern India',
            ],
          },
          {
            id: 'puc-pol',
            name: 'Political Science',
            department: 'Arts & Humanities',
            chapters: [
              'Indian Constitution, Fundamental Rights & DPSP',
              'Election Commission, Parliament & Judiciary',
              'Nation Building, Federalism & Foreign Policy of India',
            ],
          },
          {
            id: 'puc-psy',
            name: 'Psychology & Sociology',
            department: 'Arts & Humanities',
            chapters: [
              'Variations in Psychological Attributes (IQ, EQ, Aptitude)',
              'Self, Personality, Stress Management & Social Influence',
              'Indian Social Structure, Social Change & Rural Development',
            ],
          },
        ],
      },
    ],
  },
  {
    levelNumber: 6,
    code: 'L6_DIPLOMA',
    title: '6. Diploma & Polytechnic Departments',
    shortLabel: '6. Diploma / Polytechnic',
    educationCategoryCode: 'F',
    description: 'State DTE & AICTE Polytechnic engineering, IT, and technical diploma subjects with lab-ready chapters.',
    classesOrDepartments: [
      {
        id: 'DIP_CS',
        label: 'Diploma in Computer Science & Engineering',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'dip-cs-prog',
            name: 'Programming & Data Structures',
            department: 'Polytechnic CS',
            chapters: [
              'C & Python Programming Foundations',
              'Arrays, Pointers, Stacks & Queues',
              'Sorting, Searching & Recursion',
              'Relational Database & SQL Lab',
              'Operating Systems & Linux Shell Basics',
            ],
          },
          {
            id: 'dip-cs-web',
            name: 'Web & Cloud Engineering',
            department: 'Polytechnic CS',
            chapters: [
              'HTML5, CSS3 & Responsive UI Design',
              'JavaScript DOM, Async APIs & TypeScript',
              'REST APIs, Node.js & Cloud Deployment',
            ],
          },
        ],
      },
      {
        id: 'DIP_CORE',
        label: 'Diploma in ECE / Mechanical / Civil / Electrical',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'dip-ece',
            name: 'Electronics, Embedded & Electrical Systems',
            department: 'Core Polytechnic',
            chapters: [
              'Digital Logic Gates & Boolean Simplification',
              'Microcontrollers (Arduino / 8051) & IoT Sensors',
              'AC/DC Machines, Transformers & Power Distribution',
              'Engineering Drawing, AutoCAD & Workshop Practice',
            ],
          },
        ],
      },
    ],
  },
  {
    levelNumber: 7,
    code: 'L7_UG',
    title: '7. Undergraduate Degrees (BA, BCom, BBA, BCA, BSc, BE/BTech, LLB)',
    shortLabel: '7. UG Degrees',
    educationCategoryCode: 'G',
    description: 'University UGC / VTU / AICTE undergraduate degree departments with structured semester-level chapters.',
    classesOrDepartments: [
      {
        id: 'UG_TECH',
        label: 'BTech / BE / BCA / BSc Computer Science',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'ug-dsa',
            name: 'Data Structures & Algorithms',
            department: 'Engineering & Computing',
            chapters: [
              'Time & Space Complexity (Big-O Analysis)',
              'Trees, Binary Search Trees & Heaps',
              'Graphs: BFS, DFS & Shortest Path (Dijkstra)',
              'Dynamic Programming & Greedy Algorithms',
            ],
          },
          {
            id: 'ug-dbms',
            name: 'DBMS, OS & Computer Networks',
            department: 'Engineering & Computing',
            chapters: [
              'ER Modeling, Normalisation (1NF to BCNF) & Transactions',
              'Process Scheduling, Deadlocks & Virtual Memory',
              'TCP/IP Suite, HTTP/HTTPS, DNS & Cloud Architecture',
              'Software Engineering, Agile & System Design',
            ],
          },
          {
            id: 'ug-aiml',
            name: 'Artificial Intelligence & Machine Learning',
            department: 'Engineering & Computing',
            chapters: [
              'Linear Regression, Logistic Regression & Gradient Descent',
              'Decision Trees, Random Forests & Clustering',
              'Neural Networks, Backpropagation & Transformers',
              'Prompt Engineering & Applied Generative AI',
            ],
          },
        ],
      },
      {
        id: 'UG_COMMERCE',
        label: 'BCom / BBA / BA Economics & Management',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'ug-fin',
            name: 'Corporate Accounting, Taxation & Finance',
            department: 'Commerce & Management',
            chapters: [
              'Corporate Financial Reporting & Ind AS Standards',
              'Direct Tax (Income Tax India) & GST Compliance',
              'Cost Accounting, Marginal Costing & Variance Analysis',
              'Time Value of Money, Capital Budgeting (NPV / IRR)',
            ],
          },
          {
            id: 'ug-mgmt',
            name: 'Business Law, HR & Marketing Strategy',
            department: 'Commerce & Management',
            chapters: [
              'Indian Contract Act & Companies Act Essentials',
              'Organisational Behaviour & Talent Management',
              'Digital Marketing Funnel, Brand Positioning & CRM',
            ],
          },
        ],
      },
      {
        id: 'UG_SCIENCE_LAW',
        label: 'BSc Sciences / LLB / BPharm / Nursing',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'ug-life',
            name: 'Applied Sciences, Healthcare & Legal Studies',
            department: 'Allied Degrees',
            chapters: [
              'Biochemistry, Genetics & Microbiology Lab Foundations',
              'Human Anatomy, Pharmacology & Clinical Care Basics',
              'Constitutional Law, Jurisprudence & Cyber Law',
            ],
          },
        ],
      },
    ],
  },
  {
    levelNumber: 8,
    code: 'L8_PG',
    title: '8. Postgraduate Degrees (MBA, MCA, MSc, MCom, MA, MTech)',
    shortLabel: '8. PG Degrees',
    educationCategoryCode: 'H',
    description: 'Postgraduate mastery modules across management, advanced computing, data science, finance, and humanities.',
    classesOrDepartments: [
      {
        id: 'PG_MBA',
        label: 'MBA / MCom — Management & Financial Leadership',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'pg-mba-fin',
            name: 'Strategic Financial Management & Valuation',
            department: 'Postgraduate Management',
            chapters: [
              'Corporate Valuation, DCF & WACC Modeling',
              'Mergers, Acquisitions & Portfolio Risk Management',
              'Derivatives, Hedging & International Finance',
              'Business Analytics, KPI Dashboards & Decision Science',
            ],
          },
          {
            id: 'pg-mba-ops',
            name: 'Operations, Supply Chain & Corporate Strategy',
            department: 'Postgraduate Management',
            chapters: [
              'Porter’s Five Forces, Blue Ocean & Competitive Advantage',
              'Lean Six Sigma, Inventory Control & Global Logistics',
              'Enterprise Product Management & Go-To-Market Scaling',
            ],
          },
        ],
      },
      {
        id: 'PG_TECH',
        label: 'MCA / MTech / MSc Data Science & AI',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'pg-cs-dist',
            name: 'Distributed Systems, Deep Learning & Cloud Architecture',
            department: 'Postgraduate Computing',
            chapters: [
              'Microservices, Event-Driven Systems & Kubernetes',
              'Deep Learning: CNNs, Attention & Multimodal LLMs',
              'MLOps, Vector Databases & Production Retrieval (RAG)',
              'Zero-Trust Cloud Security & DevSecOps',
            ],
          },
        ],
      },
    ],
  },
  {
    levelNumber: 9,
    code: 'L9_PHD',
    title: '9. Doctoral & Research (PhD & Fellowship)',
    shortLabel: '9. PhD & Research',
    educationCategoryCode: 'I',
    description: 'Research methodology, statistical inference, systematic literature review, and publication ethics.',
    classesOrDepartments: [
      {
        id: 'PHD_CORE',
        label: 'PhD Coursework & Research Methodology',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'phd-meth',
            name: 'Research Design, Biostatistics & Ethics',
            department: 'Doctoral Studies',
            chapters: [
              'Formulating Research Problems, Hypotheses & Literature Gaps',
              'Quantitative & Qualitative Research Methodologies',
              'Hypothesis Testing (t-test, ANOVA, Chi-Square & Regression)',
              'Systematic Reviews, PRISMA & Bibliometric Analysis',
              'Academic Writing, Peer Review, Plagiarism & Publication Ethics',
            ],
          },
        ],
      },
    ],
  },
  {
    levelNumber: 10,
    code: 'L10_CAREER',
    title: '10. Professional, Vocational & Job-Ready Skills',
    shortLabel: '10. Career Skills',
    educationCategoryCode: 'J',
    description: 'Industry-ready modules in Microsoft Excel, AI Tools, Full-Stack Coding, Tally/GST, Spoken English & Entrepreneurship.',
    classesOrDepartments: [
      {
        id: 'CAREER_PRO',
        label: 'Job-Ready Professional & Digital Tracks',
        gradeBand: 'Secondary (9-12)',
        subjects: [
          {
            id: 'pro-excel',
            name: 'Microsoft Excel & Business Analytics',
            department: 'Productivity & Analytics',
            chapters: [
              'What is Excel: Interface, Cells, Ranges & Core Formulas',
              'Lookup Functions (VLOOKUP, XLOOKUP, INDEX-MATCH)',
              'PivotTables, PivotCharts & Slicers',
              'Power Query Data Cleaning & Executive KPI Dashboards',
            ],
          },
          {
            id: 'pro-web',
            name: 'Full-Stack Web & App Development',
            department: 'Software Engineering',
            chapters: [
              'Modern HTML5, Tailwind CSS & Responsive Layouts',
              'React, TypeScript & Component State Architecture',
              'Node.js, Express APIs & Cloud Databases',
              'Authentication, Payment Gateways & Production Launch',
            ],
          },
          {
            id: 'pro-ai',
            name: 'Applied Generative AI & Workplace Automation',
            department: 'AI & Automation',
            chapters: [
              'Prompt Engineering Frameworks & Structured Outputs',
              'AI Workflows for Documentation, Research & Coding',
              'Building Custom AI Assistants & Ethical AI Governance',
            ],
          },
          {
            id: 'pro-biz',
            name: 'Accounting (Tally/GST), Digital Marketing & Communication',
            department: 'Business & Communication',
            chapters: [
              'TallyPrime Bookkeeping, Ledger Entries & GST Filing',
              'SEO, Social Media Campaigns & Performance Analytics',
              'Executive English Speaking, Resume & Interview Mastery',
            ],
          },
        ],
      },
    ],
  },
];

export interface OfficialTextbookLink {
  label: string;
  url: string;
  authority: string;
}

export function getOfficialTextbookLinks(
  boardId: string,
  classOrDepartment: string,
  subject: string
): OfficialTextbookLink[] {
  const b = (boardId || '').toUpperCase();
  const links: OfficialTextbookLink[] = [];

  if (b.includes('KAR') || b.includes('KSEAB') || b.includes('DPUE') || b.includes('KTBS')) {
    links.push(
      {
        label: `Karnataka KTBS / DSERT Official Textbooks (${classOrDepartment})`,
        url: 'https://ktbs.kar.nic.in/',
        authority: 'Karnataka Textbook Society (KTBS)',
      },
      {
        label: 'Karnataka PUC (DPUE) Question Banks & Textbooks',
        url: 'https://pue.karnataka.gov.in/',
        authority: 'Department of Pre-University Education, Karnataka',
      }
    );
  } else if (b.includes('ICSE') || b.includes('CISCE') || b.includes('ISC')) {
    links.push({
      label: 'CISCE Official ICSE / ISC Syllabus & Publications',
      url: 'https://cisce.org/publications/',
      authority: 'Council for the Indian School Certificate Examinations',
    });
  } else if (b.includes('NIOS')) {
    links.push({
      label: 'NIOS Open Schooling Free Online Course Material (PDF)',
      url: 'https://www.nios.ac.in/online-course-material.aspx',
      authority: 'National Institute of Open Schooling',
    });
  } else if (b.includes('TN') || b.includes('TAMIL')) {
    links.push({
      label: 'Tamil Nadu Samacheer Kalvi Official Textbooks',
      url: 'https://textbookcorp.tn.gov.in/',
      authority: 'Tamil Nadu Textbook and Educational Services Corporation',
    });
  } else if (b.includes('MH') || b.includes('MAHARASHTRA')) {
    links.push({
      label: 'Maharashtra Balbharati e-Textbooks Portal',
      url: 'https://cart.ebalbharati.in/',
      authority: 'Maharashtra State Bureau of Textbook Production',
    });
  } else if (b.includes('KL') || b.includes('KERALA')) {
    links.push({
      label: 'SCERT Kerala Samagra Textbooks Repository',
      url: 'https://samagra.kite.kerala.gov.in/',
      authority: 'SCERT Kerala / KITE',
    });
  } else {
    const matchedBoard = ALL_INDIA_BOARDS.find((item) => item.id === boardId);
    if (matchedBoard?.officialWebsite) {
      links.push({
        label: `${matchedBoard.shortName} Official Board Portal`,
        url: matchedBoard.officialWebsite,
        authority: matchedBoard.officialName,
      });
    }
  }

  // Always include national NCERT, ePathshala, DIKSHA & SWAYAM/NPTEL links as verified national backups
  links.push(
    {
      label: `NCERT Official PDF Textbooks — ${subject}`,
      url: 'https://ncert.nic.in/textbook.php',
      authority: 'NCERT (National Council of Educational Research and Training)',
    },
    {
      label: 'ePathshala & DIKSHA National Digital Textbook Library',
      url: 'https://diksha.gov.in/',
      authority: 'Ministry of Education, Government of India',
    }
  );

  if (
    /degree|ug|pg|btech|bca|mba|mca|phd|diploma|polytechnic|professional/i.test(classOrDepartment)
  ) {
    links.push({
      label: 'SWAYAM / NPTEL / e-PG Pathshala University Open Textbooks',
      url: 'https://epgp.inflibnet.ac.in/',
      authority: 'UGC / INFLIBNET / NPTEL',
    });
  }

  return links.slice(0, 4);
}

export function buildDeterministicChapterNote(params: {
  boardId: string;
  boardName: string;
  levelLabel: string;
  classOrDepartment: string;
  subject: string;
  chapterTitle: string;
  language: string;
}): SelfStudyChapterNote {
  const { boardId, boardName, levelLabel, classOrDepartment, subject, chapterTitle, language } = params;
  const cleanChapter = chapterTitle.trim() || `${subject} Core Chapter`;

  return {
    chapterTitle: cleanChapter,
    boardName,
    levelLabel,
    classOrDepartment,
    subject,
    language,
    overview: `${cleanChapter} is a foundational chapter in ${subject} for ${classOrDepartment} (${boardName}). This structured self-study edition condenses core textbook definitions, conceptual principles, applied examples, and exam-oriented revision checkpoints so learners can master the topic thoroughly even when a direct lecture video is unavailable.`,
    keyDefinitions: [
      {
        term: `Core Principle of ${cleanChapter}`,
        definition: `The primary governing concept, law, or structural rule that explains how ${cleanChapter.toLowerCase()} operates within ${subject}.`,
      },
      {
        term: 'Cause-and-Effect Mechanism',
        definition: `How measurable inputs, variables, or conditions produce predictable outcomes in ${cleanChapter}.`,
      },
      {
        term: 'Classification & Components',
        definition: `The standard categories, parts, or stages prescribed in the ${boardName} syllabus for ${cleanChapter}.`,
      },
      {
        term: 'Standard Units / Notation',
        definition: `Recognised academic symbols, SI units, terminology, or analytical frameworks required in ${classOrDepartment} assessments.`,
      },
      {
        term: 'Real-World Application',
        definition: `Practical daily-life, scientific, industrial, or civic situations where ${cleanChapter} is directly observed or applied.`,
      },
      {
        term: 'Common Misconception Check',
        definition: `Typical conceptual errors students make during exams on ${cleanChapter}, contrasted with the scientifically/academically verified explanation.`,
      },
    ],
    coreConcepts: [
      {
        heading: `1. Conceptual Foundations of ${cleanChapter}`,
        explanation: `Begin by connecting ${cleanChapter} to prior chapters in ${subject}. Identify the central phenomenon or problem statement, the key components involved, and why the ${boardName} curriculum places it at the ${classOrDepartment} stage.`,
        bulletPoints: [
          `Define the central terms of ${cleanChapter} in your own words before memorising textbook wording.`,
          `Map how ${cleanChapter} links to everyday observations and laboratory or practical activities.`,
          `Note any prerequisite concepts from earlier lessons needed to solve multi-step problems.`,
        ],
      },
      {
        heading: '2. Step-by-Step Process, Rules & Structural Breakdown',
        explanation: `Every major topic in ${subject} follows a repeatable logical sequence. Break ${cleanChapter} into input conditions, governing rule/mechanism, and resulting output or inference.`,
        bulletPoints: [
          'List each stage or sub-category in sequential order with one clear distinguishing feature.',
          'Compare contrasting types (e.g., direct vs. inverse, contact vs. non-contact, primary vs. secondary).',
          'Highlight diagrams, tables, or labelled schematics expected in board or university exams.',
        ],
      },
      {
        heading: '3. Analytical Problem Solving & Exam Strategy',
        explanation: `Board and university examinations evaluate both conceptual clarity and structured application. Practice translating word scenarios into clean logical steps.`,
        bulletPoints: [
          'Always state the given facts or conditions clearly before applying a rule or formula.',
          'Verify units, directional signs, or logical assumptions at every intermediate step.',
          'Conclude long-form answers with a concise summary sentence tying back to the question.',
        ],
      },
      {
        heading: '4. Cross-Disciplinary Relevance & Mastery Check',
        explanation: `Understanding why ${cleanChapter} matters beyond the classroom builds long-term retention and improves both IQ reasoning and ethical/social awareness.`,
        bulletPoints: [
          `Identify 2 real-world Indian or global use cases directly driven by ${cleanChapter}.`,
          'Teach the main concept aloud in 60 seconds to test whether any gap remains.',
          'Proceed directly to the 30-Question Mastery Exam to pinpoint strong vs. weak sub-topics.',
        ],
      },
    ],
    formulasOrKeyRules: [
      `Rule 1 — Clarity of Definition: Always pair every key term in ${cleanChapter} with one concrete example.`,
      `Rule 2 — Evidence & Verification: Support claims in ${subject} using observations, equations, or syllabus criteria.`,
      `Rule 3 — Structured Comparison: Use 2-column comparison tables when contrasting two mechanisms in ${cleanChapter}.`,
      `Rule 4 — Precision & Units: Double-check terminology, units, and step ordering before finalizing answers.`,
    ],
    workedExamples: [
      {
        problem: `Example 1 (Conceptual Identification): Explain the primary mechanism behind ${cleanChapter} and cite one practical observation from daily life.`,
        solution: `Step 1: State the exact syllabus definition of ${cleanChapter}. Step 2: Describe the underlying cause-and-effect relationship clearly. Step 3: Connect it to a concrete everyday scenario and note what changes if the key controlling factor increases or decreases.`,
      },
      {
        problem: `Example 2 (Applied Analysis): A student observes an unexpected outcome while studying ${cleanChapter} in ${subject}. How should they diagnose and correct the reasoning?`,
        solution: `Step 1: Isolate the controlling variables or conditions. Step 2: Check whether an assumption or boundary condition was violated. Step 3: Re-apply the core principle step-by-step and confirm the corrected outcome matches theoretical expectations.`,
      },
      {
        problem: `Example 3 (Board / Exam Evaluation): Compare two contrasting aspects of ${cleanChapter} in a structured exam-ready answer.`,
        solution: `Present at least 3 clear points of distinction covering (a) Definition/Nature, (b) Operating Mechanism or Rule, and (c) Real-world Example or Impact. Keep each point concise and accurate to score full marks.`,
      },
    ],
    quickRevisionChecklist: [
      `I can define all core terms in "${cleanChapter}" without looking at notes.`,
      `I can draw or explain the key structure, diagram, or sequence for ${cleanChapter}.`,
      `I can distinguish between related concepts and avoid common exam traps.`,
      `I have reviewed at least 2 applied examples linking ${cleanChapter} to real life.`,
      `I checked the official ${boardName} / NCERT textbook reference link if I need textbook exercises.`,
      'I am ready to attempt the 30-Question Exam + IQ/EQ/SQ evaluation to generate my 20-graph progress report.',
    ],
    officialTextbookLinks: getOfficialTextbookLinks(boardId, classOrDepartment, subject),
    generatedBy: 'structured_engine',
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generates exactly 30 distinct, chapter-grounded diagnostic MCQs grouped across 5 sub-topics
 * and 4 cognitive levels (Recall, Understanding, Application, Analysis) so students always get
 * an accurate 30-question mastery & weak-topic diagnostic after completing any video or PDF chapter.
 */
export function buildDeterministic30QuestionExam(params: {
  boardName: string;
  classOrDepartment: string;
  subject: string;
  chapterTitle: string;
  videoTitle?: string;
}): SelfStudyExamQuestion[] {
  const { boardName, classOrDepartment, subject, chapterTitle } = params;
  const ch = chapterTitle.trim() || `${subject} Core Topic`;
  const sub = subject.trim() || 'General Studies';

  const subTopics = [
    `${ch}: Core Definitions`,
    `${ch}: Rules & Principles`,
    `${ch}: Classification & Comparison`,
    `${ch}: Real-World Applications`,
    `${ch}: Exam Problem Solving`,
  ];

  const templates: Array<{
    subTopicIdx: number;
    cognitiveLevel: SelfStudyExamQuestion['cognitiveLevel'];
    stem: string;
    options: [string, string, string, string];
    correctIndex: number;
    explanation: string;
  }> = [
    // Sub-topic 0: Core Definitions (Q1–Q6)
    {
      subTopicIdx: 0,
      cognitiveLevel: 'Recall',
      stem: `What is the main focus of "${ch}" in ${classOrDepartment} ${sub}?`,
      options: [
        `Core concepts, principles, and uses of ${ch}`,
        'Memorising page numbers only',
        'Skipping key definitions',
        'Unrelated syllabus topics',
      ],
      correctIndex: 0,
      explanation: `${boardName} structures "${ch}" around core concepts and real-world applications.`,
    },
    {
      subTopicIdx: 0,
      cognitiveLevel: 'Recall',
      stem: `What should you check first before solving a "${ch}" question?`,
      options: [
        'Question word count',
        'Exact definitions, terms, and given values',
        'Guessing the answer immediately',
        'Ignoring units and conditions',
      ],
      correctIndex: 1,
      explanation: 'Clear definitions and given conditions prevent foundational mistakes.',
    },
    {
      subTopicIdx: 0,
      cognitiveLevel: 'Understanding',
      stem: `Why is "${ch}" included in the ${boardName} ${classOrDepartment} syllabus?`,
      options: [
        'To add extra pages only',
        `It builds the base for higher ${sub} topics`,
        'It is optional trivia',
        'To encourage rote memorisation',
      ],
      correctIndex: 1,
      explanation: `Each chapter in ${sub} lays the foundation for advanced units.`,
    },
    {
      subTopicIdx: 0,
      cognitiveLevel: 'Understanding',
      stem: `Which note-taking style works best for learning "${ch}"?`,
      options: [
        'Copying whole pages blindly',
        'Writing only headings',
        'Definition + key rule + one example',
        'Skipping diagrams and formulas',
      ],
      correctIndex: 2,
      explanation: 'Pairing definitions with rules and concrete examples boosts recall.',
    },
    {
      subTopicIdx: 0,
      cognitiveLevel: 'Application',
      stem: `How can you clarify two easily confused terms in "${ch}"?`,
      options: [
        'Treat both as identical',
        'Compare definitions side-by-side with examples',
        'Skip both during revision',
        'Memorise only one term',
      ],
      correctIndex: 1,
      explanation: 'Side-by-side comparison with examples eliminates confusion.',
    },
    {
      subTopicIdx: 0,
      cognitiveLevel: 'Analysis',
      stem: `What proves you truly understand the basics of "${ch}"?`,
      options: [
        'Reciting one sentence from memory',
        'Explaining it simply and solving unseen questions',
        'Guessing multiple-choice answers',
        'Avoiding practice problems',
      ],
      correctIndex: 1,
      explanation: 'Explaining simply and applying concepts to new problems proves mastery.',
    },

    // Sub-topic 1: Rules & Principles (Q7–Q12)
    {
      subTopicIdx: 1,
      cognitiveLevel: 'Recall',
      stem: `In "${ch}", what links a cause (input) to its observed effect (output)?`,
      options: [
        'Random chance',
        `A governing rule or principle in ${sub}`,
        'Unverified guesses',
        'Ignoring observations',
      ],
      correctIndex: 1,
      explanation: `${sub} relies on verifiable cause-and-effect principles.`,
    },
    {
      subTopicIdx: 1,
      cognitiveLevel: 'Understanding',
      stem: `If one key variable in "${ch}" doubles while others stay fixed, what must you check?`,
      options: [
        'Whether the relation is direct or inverse',
        'Assume the output becomes zero',
        'Ignore the governing formula',
        'Change every other variable too',
      ],
      correctIndex: 0,
      explanation: 'Identifying direct vs. inverse relationships predicts outcomes accurately.',
    },
    {
      subTopicIdx: 1,
      cognitiveLevel: 'Understanding',
      stem: `Why do rules in "${ch}" state specific conditions or assumptions?`,
      options: [
        'To lengthen answers',
        'Rules hold accurately only within valid conditions',
        'For textbook formatting only',
        'Conditions never change results',
      ],
      correctIndex: 1,
      explanation: 'Knowing boundary conditions prevents misapplying formulas or laws.',
    },
    {
      subTopicIdx: 1,
      cognitiveLevel: 'Application',
      stem: `If a step in a "${ch}" derivation feels unclear, what should you do?`,
      options: [
        'Pause, trace the rule used, and test a small case',
        'Skip the rest of the chapter',
        'Memorise only the final line',
        'Close the notes immediately',
      ],
      correctIndex: 0,
      explanation: 'Verifying each step with a simple case builds strong understanding.',
    },
    {
      subTopicIdx: 1,
      cognitiveLevel: 'Analysis',
      stem: `How do you settle two different answers to the same "${ch}" problem?`,
      options: [
        'Pick the popular one',
        'Check assumptions, steps, and textbook rules',
        'Choose the shorter answer',
        'Discard both without checking',
      ],
      correctIndex: 1,
      explanation: 'Auditing logic against verified principles resolves conflicts reliably.',
    },
    {
      subTopicIdx: 1,
      cognitiveLevel: 'Analysis',
      stem: `What happens if you change two independent factors at once in "${ch}"?`,
      options: [
        'Results become more accurate',
        'You cannot tell which factor caused the change',
        'No measurement is needed',
        'Errors disappear automatically',
      ],
      correctIndex: 1,
      explanation: 'Changing one variable at a time isolates the true cause.',
    },

    // Sub-topic 2: Classification & Comparison (Q13–Q18)
    {
      subTopicIdx: 2,
      cognitiveLevel: 'Recall',
      stem: `Why does ${sub} group items in "${ch}" into categories?`,
      options: [
        'To make study harder',
        'To show shared traits and clear differences',
        'Categories have no meaning',
        'To avoid giving examples',
      ],
      correctIndex: 1,
      explanation: 'Classification organizes facts by shared traits and criteria.',
    },
    {
      subTopicIdx: 2,
      cognitiveLevel: 'Understanding',
      stem: `What is the clearest exam format to compare two types in "${ch}"?`,
      options: [
        'One vague sentence',
        'A side-by-side table with matching criteria',
        'Describing only the first type',
        'Listing unrelated facts',
      ],
      correctIndex: 1,
      explanation: 'Point-by-point tables earn full marks and show clear understanding.',
    },
    {
      subTopicIdx: 2,
      cognitiveLevel: 'Understanding',
      stem: `What best distinguishes two similar sub-concepts in "${ch}"?`,
      options: [
        'Textbook box colour',
        'Their core mechanism and trigger condition',
        'Alphabetical order',
        'Word length',
      ],
      correctIndex: 1,
      explanation: 'Mechanisms and trigger conditions provide reliable differentiation.',
    },
    {
      subTopicIdx: 2,
      cognitiveLevel: 'Application',
      stem: `How should you classify a new real-life example from "${ch}"?`,
      options: [
        'Guess from the first word',
        'Match its features against defining chapter criteria',
        'Place it in every group',
        'Skip unfamiliar examples',
      ],
      correctIndex: 1,
      explanation: 'Matching observable traits to syllabus criteria ensures accuracy.',
    },
    {
      subTopicIdx: 2,
      cognitiveLevel: 'Analysis',
      stem: `An example looks like Group X superficially but obeys Group Y’s rule. Where does it belong?`,
      options: [
        'Group X by appearance',
        'Group Y by governing principle',
        'Neither group',
        'Whichever comes first',
      ],
      correctIndex: 1,
      explanation: 'Academic classification always follows governing principles over surface looks.',
    },
    {
      subTopicIdx: 2,
      cognitiveLevel: 'Analysis',
      stem: `What does a concept map of "${ch}" help you spot fastest?`,
      options: [
        'Links, hierarchy, and gaps between sub-topics',
        'Pages you can skip',
        'Unrelated trivia',
        'Textbook fonts',
      ],
      correctIndex: 0,
      explanation: 'Concept maps reveal connections and missing links before exams.',
    },

    // Sub-topic 3: Real-World Applications (Q19–Q24)
    {
      subTopicIdx: 3,
      cognitiveLevel: 'Recall',
      stem: `How does "${ch}" connect to daily life outside school?`,
      options: [
        'It has no practical use',
        `It explains everyday tools, nature, or ${sub} workflows`,
        'It only works in diagrams',
        'Real life ignores academic rules',
      ],
      correctIndex: 1,
      explanation: `Applying "${ch}" to everyday systems strengthens retention.`,
    },
    {
      subTopicIdx: 3,
      cognitiveLevel: 'Understanding',
      stem: `Why record real observations honestly during a "${ch}" activity?`,
      options: [
        'To invent perfect numbers',
        'Honest data reveals measurement limits and real factors',
        'To throw away notes',
        'Because theory is always wrong',
      ],
      correctIndex: 1,
      explanation: 'Honest observation and error analysis are core to genuine learning.',
    },
    {
      subTopicIdx: 3,
      cognitiveLevel: 'Application',
      stem: `What makes a ${classOrDepartment} mini-project on "${ch}" stand out?`,
      options: [
        'Copied text with no demo',
        'Clear principle + working demo + real-world impact',
        'Unrelated decorations',
        'Ignoring the syllabus',
      ],
      correctIndex: 1,
      explanation: 'Great projects link clear theory to observable evidence.',
    },
    {
      subTopicIdx: 3,
      cognitiveLevel: 'Application',
      stem: `Beyond accuracy, what matters when applying "${ch}" in society?`,
      options: [
        'Safety, sustainability, cost, and ethical impact',
        'Speed without safety checks',
        'Ignoring resource waste',
        'Ignoring user needs',
      ],
      correctIndex: 0,
      explanation: 'Responsible application balances accuracy with safety and ethics.',
    },
    {
      subTopicIdx: 3,
      cognitiveLevel: 'Analysis',
      stem: `Your first demo of "${ch}" fails to match the expected result. What is the best next step?`,
      options: [
        'Quit immediately',
        'Check setup, measurements, and error sources, then re-test',
        'Fake the outcome',
        'Blame the textbook',
      ],
      correctIndex: 1,
      explanation: 'Systematic troubleshooting turns failed trials into mastery.',
    },
    {
      subTopicIdx: 3,
      cognitiveLevel: 'Analysis',
      stem: `Why do ${boardName} exams include case-study questions on "${ch}"?`,
      options: [
        'To test concept application in real situations',
        'To confuse learners with other subjects',
        'Because definitions do not matter',
        'To discourage reasoning',
      ],
      correctIndex: 0,
      explanation: 'Case studies evaluate true understanding rather than rote recall.',
    },

    // Sub-topic 4: Exam Problem Solving (Q25–Q30)
    {
      subTopicIdx: 4,
      cognitiveLevel: 'Recall',
      stem: `What is Step 1 for a multi-mark exam question on "${ch}"?`,
      options: [
        'Jump straight to a guessed answer',
        'Read carefully, list given data, and note what is asked',
        'Write unrelated chapter notes',
        'Skip checking units',
      ],
      correctIndex: 1,
      explanation: 'Listing given data and target outputs prevents misreading.',
    },
    {
      subTopicIdx: 4,
      cognitiveLevel: 'Understanding',
      stem: `Why do ${boardName} examiners award step marks in ${sub}?`,
      options: [
        'To reward clear method, right rule choice, and logical steps',
        'To reward messy work',
        'Final answers are never checked',
        'Only for MCQs',
      ],
      correctIndex: 0,
      explanation: 'Showing clean steps demonstrates true method mastery.',
    },
    {
      subTopicIdx: 4,
      cognitiveLevel: 'Application',
      stem: `You score 90% on "${ch}" definitions but 45% on applications. What should you practise next?`,
      options: [
        'Only re-read definitions',
        'Worked examples and scenario problems on weak areas',
        'Stop revising',
        'Skip application questions',
      ],
      correctIndex: 1,
      explanation: 'Targeting weak sub-topics raises exam scores fastest.',
    },
    {
      subTopicIdx: 4,
      cognitiveLevel: 'Application',
      stem: `How do you verify a "${ch}" answer before submitting?`,
      options: [
        'Never review your answer',
        'Check units, scale, limits, and the exact question asked',
        'Change answers randomly',
        'Erase your working steps',
      ],
      correctIndex: 1,
      explanation: 'Quick unit and sanity checks catch avoidable errors.',
    },
    {
      subTopicIdx: 4,
      cognitiveLevel: 'Analysis',
      stem: `Which revision schedule gives the strongest retention for "${ch}"?`,
      options: [
        'One-night cramming without testing',
        'Spaced active recall after 2, 7, and 14 days',
        'Highlighting every sentence passively',
        'Reading chapter titles only',
      ],
      correctIndex: 1,
      explanation: 'Spaced repetition with active testing maximizes memory.',
    },
    {
      subTopicIdx: 4,
      cognitiveLevel: 'Analysis',
      stem: `How should you use your 20-graph report after finishing "${ch}"?`,
      options: [
        'Ignore weak topics completely',
        'Revise every topic below 70% and re-test to confirm growth',
        'Delete the report',
        'Focus only on chart colours',
      ],
      correctIndex: 1,
      explanation: 'Closing gaps on topics below 70% turns diagnostics into mastery.',
    },
  ];

  return templates.map((tpl, index) => ({
    id: `ss-q-${index + 1}`,
    number: index + 1,
    questionText: tpl.stem,
    subTopic: subTopics[tpl.subTopicIdx],
    cognitiveLevel: tpl.cognitiveLevel,
    options: [...tpl.options],
    correctIndex: tpl.correctIndex,
    explanation: tpl.explanation,
  }));
}

export function evaluate30QuestionExam(
  questions: SelfStudyExamQuestion[],
  answers: Record<string, number>
): {
  totalQuestions: number;
  correctAnswers: number;
  scorePercent: number;
  topicDiagnostics: SelfStudyTopicDiagnostic[];
  strongTopics: string[];
  weakTopics: string[];
  remediationPlan: string[];
} {
  const totalQuestions = questions.length;
  let correctAnswers = 0;
  const buckets = new Map<string, { total: number; correct: number }>();

  for (const q of questions) {
    const bucket = buckets.get(q.subTopic) || { total: 0, correct: 0 };
    bucket.total += 1;
    if (answers[q.id] === q.correctIndex) {
      correctAnswers += 1;
      bucket.correct += 1;
    }
    buckets.set(q.subTopic, bucket);
  }

  const topicDiagnostics: SelfStudyTopicDiagnostic[] = Array.from(buckets.entries()).map(
    ([topic, stats]) => {
      const accuracyPercent = Math.round((stats.correct / Math.max(1, stats.total)) * 100);
      const status: SelfStudyTopicDiagnostic['status'] =
        accuracyPercent >= 75 ? 'Strong' : accuracyPercent >= 50 ? 'Developing' : 'Weak';
      return {
        topic,
        total: stats.total,
        correct: stats.correct,
        accuracyPercent,
        status,
      };
    }
  );

  const strongTopics = topicDiagnostics.filter((d) => d.status === 'Strong').map((d) => d.topic);
  const weakTopics = topicDiagnostics
    .filter((d) => d.status === 'Weak' || d.status === 'Developing')
    .sort((a, b) => a.accuracyPercent - b.accuracyPercent)
    .map((d) => d.topic);

  const remediationPlan: string[] = [];
  if (weakTopics.length > 0) {
    weakTopics.slice(0, 3).forEach((wt) => {
      remediationPlan.push(
        `Priority Revision: Re-study "${wt}" via the Chapter PDF Study Notes or lecture replay and solve 5 applied examples.`
      );
    });
  } else {
    remediationPlan.push(
      'Excellent mastery across all chapter sub-topics! Advance to the next module and schedule a 7-day spaced revision check.'
    );
  }

  const scorePercent = Math.round((correctAnswers / Math.max(1, totalQuestions)) * 100);
  return {
    totalQuestions,
    correctAnswers,
    scorePercent,
    topicDiagnostics,
    strongTopics,
    weakTopics,
    remediationPlan,
  };
}

/**
 * Reuses the existing `iqEqSqQuestionsData.ts` bank and appends 1 subject-contextualized prompt
 * per dimension (IQ, EQ, SQ) tailored to the student's active chapter & subject matter.
 */
export function buildSubjectContextualIqEqSqBank(params: {
  gradeBand: IqEqSqGradeBand;
  subject: string;
  chapterTitle: string;
}): Record<AssessmentDimension, IqEqSqQuestionItem[]> {
  const { gradeBand, subject, chapterTitle } = params;
  const baseIQ = getQuestionBank('IQ', gradeBand).slice(0, 5);
  const baseEQ = getQuestionBank('EQ', gradeBand).slice(0, 4);
  const baseSQ = getQuestionBank('SQ', gradeBand).slice(0, 4);

  const subjectIqItem: IqEqSqQuestionItem = {
    id: `iq-subj-${subject.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}`,
    prompt: `Subject Logical Reasoning (${subject} — ${chapterTitle}): If Principle P always implies Outcome Q, and Outcome Q did NOT occur during a controlled test of ${chapterTitle}, what can you logically deduce?`,
    domain: `${subject} Analytical Deduction`,
    questionType: 'mcq',
    options: [
      'Principle P must also have occurred',
      'Condition P did not hold (or an external assumption was violated)',
      'Outcome Q occurred secretly',
      'No logical deduction is possible',
    ],
    correctOptionIndex: 1,
  };

  const subjectEqItem: IqEqSqQuestionItem = {
    id: `eq-subj-${subject.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}`,
    prompt: `Subject Self-Regulation (${subject} — ${chapterTitle}): When I get several practice questions wrong in "${chapterTitle}", I stay calm, review the explanation, and adjust my study strategy instead of giving up.`,
    domain: 'Academic Resilience & Focus',
    questionType: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    likertWeights: [20, 40, 60, 80, 100],
  };

  const subjectSqItem: IqEqSqQuestionItem = {
    id: `sq-subj-${subject.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}`,
    prompt: `Ethical & Social Application (${subject} — ${chapterTitle}): I reflect on how knowledge from "${chapterTitle}" can be used honestly to help my classmates, community, and environment responsibly.`,
    domain: 'Civic & Ethical Subject Use',
    questionType: 'likert',
    options: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    likertWeights: [20, 40, 60, 80, 100],
  };

  return {
    IQ: [...baseIQ, subjectIqItem],
    EQ: [...baseEQ, subjectEqItem],
    SQ: [...baseSQ, subjectSqItem],
  };
}

export function evaluateCustomIqEqSqDimension(
  dimension: AssessmentDimension,
  questions: IqEqSqQuestionItem[],
  answers: Record<string, number>
): { scorePercent: number; bandLabel: string } {
  if (!questions.length) return { scorePercent: 0, bandLabel: 'Pending' };
  let total = 0;
  for (const q of questions) {
    const chosen = answers[q.id];
    if (typeof chosen === 'number' && Number.isFinite(chosen)) {
      if (q.questionType === 'mcq') {
        total += chosen === q.correctOptionIndex ? 100 : 0;
      } else {
        const weights = q.likertWeights || [20, 40, 60, 80, 100];
        const idx = Math.max(0, Math.min(weights.length - 1, Math.round(chosen)));
        total += weights[idx] ?? 0;
      }
    }
  }
  const scorePercent = Math.round(total / questions.length);
  const bandLabel =
    scorePercent >= 85
      ? 'Strong Mastery'
      : scorePercent >= 70
      ? 'Proficient & Growing'
      : scorePercent >= 50
      ? 'Developing'
      : 'Needs Guided Practice';

  return { scorePercent, bandLabel };
}
