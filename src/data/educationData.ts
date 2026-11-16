import {
  School,
  Code2,
  Brain,
  Palette,
  Briefcase,
  TrendingUp,
  Cpu,
  Globe,
  Sparkles,
  Rocket,
  Compass,
  HeartHandshake,
  BookOpen,
  Laptop,
  Users,
  Award,
  Video,
  Lightbulb,
  CheckCircle2,
  ShieldCheck,
  Zap,
  BarChart3,
  Layers,
  GraduationCap
} from 'lucide-react';

export interface EducationCategoryItem {
  id: string;
  name: string;
  categoryGroup: 'Academic' | 'Technology' | 'Professional' | 'Creative' | 'Intelligence' | 'Business' | 'STEM' | 'Wellbeing';
  badge: string;
  ageBracket: string;
  targetGrades: string;
  iconName: string;
  imageUrl: string;
  shortDesc: string;
  fullDesc: string;
  officialFee: string;
  feeType: 'tuition' | 'skill' | 'mentoring' | 'special';
  modules: string[];
  learningOutcomes: string[];
  certificationNote: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  isPopular?: boolean;
  isFeatured?: boolean;
}

export interface PricingPlanItem {
  id: string;
  title: string;
  badge?: string;
  frequency: string;
  price: string;
  isPopular?: boolean;
  idealFor: string;
  features: string[];
  sourceDocument: string;
  category: 'academic' | 'skills_subscription' | 'mentoring_subscription' | 'standalone';
}

export interface OfficialBrochureItem {
  id: string;
  title: string;
  subtitle: string;
  pageCount: number;
  fileSize: string;
  publicationYear: string;
  coverImage: string;
  pdfUrl: string;
  description: string;
  highlights: string[];
}

export interface ProgrammeHighlightItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  badge: string;
  keyFeatures: string[];
  actionLabel: string;
  targetId: string;
}

export const PROGRAMME_HIGHLIGHTS: ProgrammeHighlightItem[] = [
  {
    id: 'highlight-tuition',
    title: 'Academic Tuition Programmes',
    tagline: 'Classes 1st to 12th Standard • State & CBSE Aligned',
    description: 'Strengthen core academic concepts, improve performance, and build a strong learning foundation with expert educators across 9 school subjects.',
    imageUrl: '/assets/images/academic_education.jpg',
    badge: 'Classes 1–12',
    keyFeatures: ['1 to 3 live classes weekly', 'Board exam foundation & revision', 'Subject-wise concept clinics', 'Regular parent progress reports'],
    actionLabel: 'View Tuition Plans',
    targetId: 'pricing-section'
  },
  {
    id: 'highlight-100skills',
    title: '100+ Skill Development Programme',
    tagline: 'Practical Skills • Real Projects • Certification',
    description: 'A comprehensive, industry-aligned skill ecosystem from beginner programming and digital literacy to advanced AI, robotics, and design.',
    imageUrl: '/assets/images/technology_digital_skills.jpg',
    badge: '100+ Courses',
    keyFeatures: ['Live workshops & code labs', 'Portfolio project building', 'Recognized skill certificates', 'Subscriptions from ₹300/mo'],
    actionLabel: 'Explore 100+ Skills',
    targetId: 'courses-catalogue'
  },
  {
    id: 'highlight-ai',
    title: 'Artificial Intelligence & Future Tech',
    tagline: 'Machine Learning • Generative AI • Cloud & AR/VR',
    description: 'Equip young minds and college students with cutting-edge technologies to innovate, solve real-world problems, and build future-proof careers.',
    imageUrl: '/assets/images/artificial_intelligence.jpg',
    badge: 'High Impact',
    keyFeatures: ['Generative AI & Prompt Engineering', 'Machine Learning algorithms', 'Cloud computing & IoT integration', 'Hands-on AI mini projects'],
    actionLabel: 'View AI Courses',
    targetId: 'courses-catalogue'
  },
  {
    id: 'highlight-iqeqsq',
    title: 'IQ, EQ & SQ Student Development',
    tagline: 'Continuous Cognitive & Emotional Growth',
    description: 'A scientific continuous development programme to discover and improve a student’s intelligence quotient, emotional strength, and social quotient.',
    imageUrl: '/assets/images/iq_eq_sq_development.jpg',
    badge: 'Holistic Mindset',
    keyFeatures: ['Weekly cognitive assessments', 'Monthly progress reports', 'Parent progress summary', '₹300 per month assessment plan'],
    actionLabel: 'Discover IQ/EQ/SQ',
    targetId: 'pricing-section'
  },
  {
    id: 'highlight-mentoring',
    title: 'Personal 1-on-1 Mentoring',
    tagline: 'Individual Guidance • Study Strategy • Career Roadmaps',
    description: 'One-to-one mentoring sessions with dedicated academic mentors to guide, support, and help students overcome learning hurdles and plan careers.',
    imageUrl: '/assets/images/career_development.jpg',
    badge: 'Personalized',
    keyFeatures: ['30-minute private sessions', 'Academic planning & time management', 'Confidence building & stress management', 'From ₹500/session'],
    actionLabel: 'Book Mentoring',
    targetId: 'pricing-section'
  },
  {
    id: 'highlight-stem',
    title: 'Robotics, Coding & STEM Innovation',
    tagline: 'Sensors • Microcontrollers • Maker Lab Experiments',
    description: 'Nurture curiosity and experiential problem-solving with hands-on robotics kits, scratch coding, embedded circuits, and science experiments.',
    imageUrl: '/assets/images/robotics_stem.jpg',
    badge: 'Hands-on Labs',
    keyFeatures: ['Circuit simulation & breadboards', 'Scratch to Python coding progression', 'Maker lab & DIY innovation challenges', 'Hackathon showcase'],
    actionLabel: 'Explore STEM',
    targetId: 'courses-catalogue'
  },
  {
    id: 'highlight-creative',
    title: 'Graphic Design & Creative Media',
    tagline: 'Canva • Photoshop • Video Editing • UI/UX Basics',
    description: 'Empower creative expression with visual composition, branding aesthetics, modern digital editing tools, and digital storytelling workflows.',
    imageUrl: '/assets/images/graphic_design_media.jpg',
    badge: 'Creative Portfolio',
    keyFeatures: ['Poster, logo & visual asset creation', 'Short-form & long-form video editing', 'UI/UX basics on modern design tools', 'Creative portfolio showcase'],
    actionLabel: 'View Creative Courses',
    targetId: 'courses-catalogue'
  },
  {
    id: 'highlight-wellbeing',
    title: 'Parenting & Student Wellbeing',
    tagline: 'Emotional Balance • Healthy Habits • Guidance Clinics',
    description: 'Supporting students through academic stress, emotional regulation, screen time balance, and offering parents guidance workshops.',
    imageUrl: '/assets/images/parenting_wellbeing.jpg',
    badge: 'Support & Care',
    keyFeatures: ['Positive parenting workshops', 'Anxiety & stress management clinics', 'Healthy study & digital screen habits', 'Family guidance sessions'],
    actionLabel: 'Read Wellbeing Focus',
    targetId: 'courses-catalogue'
  },
  {
    id: 'highlight-rural',
    title: 'Rural Skill & Grassroots Innovation',
    tagline: 'In Collaboration with HopeNest Global Foundation',
    description: 'Extending digital literacy, rural entrepreneurship, and agricultural innovation to underserved youth through Section 8 foundation partnership.',
    imageUrl: '/assets/images/agriculture_rural_innovation.jpg',
    badge: 'Social Impact',
    keyFeatures: ['Grassroots community digital centers', 'Smart agriculture & organic farming tech', 'Women & youth self-employment', 'No student left behind'],
    actionLabel: 'View Grassroots Work',
    targetId: 'courses-catalogue'
  }
];

export const OFFICIAL_BROCHURES: OfficialBrochureItem[] = [
  {
    id: 'brochure-pricing-2026-27',
    title: 'OpenFrame Education – Student Programmes & Pricing Catalogue',
    subtitle: 'Official Academic Tuition, Skill Courses, Mentoring & Subscription Fee Schedule 2026–27',
    pageCount: 5,
    fileSize: '13.6 MB',
    publicationYear: '2026–27 Academic Year',
    coverImage: '/assets/images/brochure_pricing_cover.jpg',
    pdfUrl: '/assets/brochures/OpenFrame_Education_Pricing_Catalogue_2026-27.pdf',
    description: 'The official 5-page visual pricing brochure detailing monthly tuition plans (₹300/₹500/₹1,000), 9 school subjects, skill course fees (₹1,200), personal mentoring (₹500/session), IQ/EQ/SQ assessment (₹300/mo), and the 6-step student enrolment procedure.',
    highlights: [
      'Tuition Plans: Basic (₹300/mo), Standard (₹500/mo), Advanced (₹1,000/mo)',
      '9 Core Subjects: Math, Science, English, Kannada, Hindi, Social Science, CS, GK, Exam Prep',
      'Skill Development: ₹1,200 Per Course with Certificate',
      'Personal 1-on-1 Mentoring: ₹500 Per 30-min Session',
      'IQ, EQ & SQ Student Development: ₹300 Per Month',
      'In Collaboration with HopeNest Global Foundation (Section 8 Non-Profit)'
    ]
  },
  {
    id: 'brochure-corporate-2024-25',
    title: 'OpenFrame Education – Corporate & Comprehensive Programme Brochure',
    subtitle: '42-Page Complete Educational Ecosystem, 33 Categories, 100+ Skills & DPIIT Profile',
    pageCount: 42,
    fileSize: '26.0 MB',
    publicationYear: '2024–25 Corporate Edition',
    coverImage: '/assets/images/brochure_corporate_cover.jpg',
    pdfUrl: '/assets/brochures/OpenFrame_Education_Corporate_Brochure.pdf',
    description: 'The comprehensive 42-page corporate publication detailing OpenFrame IT Solutions Private Limited’s education vertical, DPIIT recognition (DIPP153945), 33 course categories, the 100+ Skill Development Programme (Page 28), and Personal Mentoring Subscriptions (Page 29).',
    highlights: [
      'Official DPIIT Recognition No. DIPP153945 & CIN: U62099KA2023PTC180260',
      '33 Programmatic Course Categories across K-12, College & Professionals',
      '100+ Skill Subscription Plans: Basic (₹300), Standard (₹499), Pro (₹999)',
      'Mentoring Subscriptions: Basic (₹300), Standard (₹499), Premium (₹999)',
      'STEM, Robotics, AI, Data Science, Web Development & Maker Labs',
      'Institutional Alliances & Student Scholarship Frameworks'
    ]
  }
];

export const OFFICIAL_PRICING_PLANS: PricingPlanItem[] = [
  // 1. Academic Tuition Plans (Page 2 & Page 5 of Pricing Catalogue)
  {
    id: 'tuition-basic',
    title: 'Tuition Basic Plan',
    badge: 'Foundational',
    frequency: 'Per Month',
    price: '₹300',
    idealFor: 'Classes 1st – 5th: Concept Building & Weekly Assistance',
    features: [
      '1 Live Interactive Class per week',
      'Comprehensive study notes & digital worksheets',
      'Subject-focused concept strengthening',
      'Monthly performance tracking & report',
      'Access to recorded class revisions',
      'Choice of 9 subjects (Math, Science, English, etc.)'
    ],
    sourceDocument: 'Source: Student Programmes & Pricing Catalogue 2026–27 (Page 2 & 5)',
    category: 'academic'
  },
  {
    id: 'tuition-standard',
    title: 'Tuition Standard Plan',
    badge: '★ Most Popular',
    frequency: 'Per Month',
    price: '₹500',
    isPopular: true,
    idealFor: 'Classes 6th – 10th: Subject Mastery & Exam Readiness',
    features: [
      '2 Live Interactive Classes per week',
      'Dedicated doubt resolution clinics',
      'Regular practice exercises & board pattern tests',
      'Bi-weekly progress monitoring & parent updates',
      'Full access to digital revision materials & recorded lessons',
      'Covers core curriculum for State & CBSE boards'
    ],
    sourceDocument: 'Source: Student Programmes & Pricing Catalogue 2026–27 (Page 2 & 5)',
    category: 'academic'
  },
  {
    id: 'tuition-advanced',
    title: 'Tuition Advanced Plan',
    badge: 'Intensive',
    frequency: 'Per Month',
    price: '₹1,000',
    idealFor: 'Classes 9th – 12th: Board Exams, Science & Commerce',
    features: [
      '3 Live Interactive Classes per week',
      'In-depth numerical & conceptual masterclasses',
      'Weekly mock tests with personalized educator feedback',
      'Priority doubt solving and one-on-one check-ins',
      'Comprehensive exam strategy & time management guidance',
      'Complete coverage for higher secondary board readiness'
    ],
    sourceDocument: 'Source: Student Programmes & Pricing Catalogue 2026–27 (Page 2 & 5)',
    category: 'academic'
  },

  // 2. 100+ Skill Development Subscriptions (Page 28 of Corporate Brochure)
  {
    id: 'sub-skills-basic',
    title: '100+ Skills: Basic Plan',
    badge: 'Foundation',
    frequency: 'Per Month',
    price: '₹300',
    idealFor: 'School & College Learners starting their digital journey',
    features: [
      'Access to 50+ essential practical skill courses',
      'High-definition recorded video lessons & exercises',
      'Practice exercises, quizzes & downloadable cheat sheets',
      'OpenFrame Course Completion Certificate',
      'Self-paced learning on web & mobile'
    ],
    sourceDocument: 'Source: Corporate Brochure Page 28 (100 Skill Development Programme)',
    category: 'skills_subscription'
  },
  {
    id: 'sub-skills-standard',
    title: '100+ Skills: Standard Plan',
    badge: '★ Most Popular',
    frequency: 'Per Month',
    price: '₹499',
    isPopular: true,
    idealFor: 'Career Booster for ambitious students and youth',
    features: [
      'Access to all 100+ practical skill courses',
      'Weekly live classes with expert industry trainers',
      'Hands-on portfolio projects & real-world case studies',
      'Industry-recognized skill certificates',
      'Career guidance & quarterly skill mentoring'
    ],
    sourceDocument: 'Source: Corporate Brochure Page 28 (100 Skill Development Programme)',
    category: 'skills_subscription'
  },
  {
    id: 'sub-skills-premium',
    title: '100+ Skills: Premium Pro',
    badge: 'Job-Ready Pro',
    frequency: 'Per Month',
    price: '₹999',
    idealFor: 'College students & professionals seeking job-readiness',
    features: [
      'Full unlimited access to 100+ premium skills',
      'Real-world capstone projects for recruiter portfolios',
      'Internship & placement guidance support*',
      '1-to-1 dedicated expert mentorship sessions',
      'Priority educator support and lifetime revision access'
    ],
    sourceDocument: 'Source: Corporate Brochure Page 28 (100 Skill Development Programme)',
    category: 'skills_subscription'
  },

  // 3. Mentoring Subscriptions (Page 29 of Corporate Brochure)
  {
    id: 'sub-mentor-basic',
    title: 'Mentoring: Basic Plan',
    badge: 'Guidance',
    frequency: 'Per Month',
    price: '₹300',
    idealFor: 'General academic guidance & study planning',
    features: [
      'Bi-weekly group mentoring sessions',
      'Academic guidance & habit architecture',
      'Study resources, planner templates & tools',
      'Monthly student progress update report'
    ],
    sourceDocument: 'Source: Corporate Brochure Page 29 (Our Mentoring Programmes)',
    category: 'mentoring_subscription'
  },
  {
    id: 'sub-mentor-standard',
    title: 'Mentoring: Standard Plan',
    badge: '★ Most Popular',
    frequency: 'Per Month',
    price: '₹499',
    isPopular: true,
    idealFor: 'Personalised student coaching & doubt resolution',
    features: [
      '1-to-1 personalized mentoring sessions',
      'Tailored personalized learning & study plan',
      'Exam anxiety & doubt resolution guidance',
      'Goal setting & continuous progress tracking',
      'Dedicated parent update & feedback session'
    ],
    sourceDocument: 'Source: Corporate Brochure Page 29 (Our Mentoring Programmes)',
    category: 'mentoring_subscription'
  },
  {
    id: 'sub-mentor-premium',
    title: 'Mentoring: Premium Pro',
    badge: 'Complete Mentorship',
    frequency: 'Per Month',
    price: '₹999',
    idealFor: 'Comprehensive holistic student guidance & stream selection',
    features: [
      'Weekly priority 1-to-1 private mentoring sessions',
      'Comprehensive academic + career + skill roadmap',
      'Personalised performance optimization plan',
      'Regular parent counselling & strategic review',
      'Holistic wellbeing, focus & motivation support'
    ],
    sourceDocument: 'Source: Corporate Brochure Page 29 (Our Mentoring Programmes)',
    category: 'mentoring_subscription'
  },

  // 4. Standalone Programmes (Page 3, 4, 5 of Pricing Catalogue)
  {
    id: 'standalone-skill',
    title: 'Individual Skill Certification',
    badge: 'Per Course',
    frequency: 'Single Course Fee',
    price: '₹1,200',
    idealFor: 'Focused mastery in any single skill (Python, Design, AI, etc.)',
    features: [
      'Full structured curriculum for chosen skill module',
      'Live expert trainer guidance & hands-on practice',
      '2 real-world portfolio projects',
      'Final skills assessment & code/asset review',
      'Verified OpenFrame Course Certificate in collaboration with HopeNest'
    ],
    sourceDocument: 'Source: Student Programmes & Pricing Catalogue 2026–27 (Page 3 & 5)',
    category: 'standalone'
  },
  {
    id: 'standalone-session',
    title: 'Personal Mentoring (Single Session)',
    badge: 'Per Session',
    frequency: '30-Minute Session',
    price: '₹500',
    idealFor: 'Immediate academic counseling, exam strategy or career advice',
    features: [
      '30-minute private 1-on-1 video appointment',
      'Diagnostic review of student strengths & hurdles',
      'Targeted study timetable & subject strategy',
      'Actionable recommendations report shared with parents'
    ],
    sourceDocument: 'Source: Student Programmes & Pricing Catalogue 2026–27 (Page 4 & 5)',
    category: 'standalone'
  },
  {
    id: 'standalone-iqeqsq',
    title: 'IQ, EQ & SQ Development Programme',
    badge: 'Continuous',
    frequency: 'Per Month',
    price: '₹300',
    idealFor: 'Students seeking holistic cognitive, emotional & social balance',
    features: [
      'Weekly standardized IQ, EQ & SQ assessments',
      'Monthly in-depth progress analysis report',
      'Clear identification of strengths & growth areas',
      'Parent progress summary with guidance tips',
      'Personalised developmental cognitive activities'
    ],
    sourceDocument: 'Source: Student Programmes & Pricing Catalogue 2026–27 (Page 4 & 5)',
    category: 'standalone'
  }
];

// All 33 Complete Course Categories from the 42-page brochure & 5-page pricing catalogue
export const EDUCATION_CATEGORIES_33: EducationCategoryItem[] = [
  // 1 to 5: Academic School Tuition & Board Prep
  {
    id: 'cat-acad-primary',
    name: 'Primary Academic Foundations (Classes 1–5)',
    categoryGroup: 'Academic',
    badge: 'Foundational Learning',
    ageBracket: 'Ages 6–10',
    targetGrades: 'Classes 1st – 5th',
    iconName: 'School',
    imageUrl: '/assets/images/academic_education.jpg',
    shortDesc: 'Concept-based foundational learning strengthening literacy, mental arithmetic, handwriting, and scientific curiosity.',
    fullDesc: 'A nurturing academic programme for early primary students that replaces rote memorization with intuitive visual lessons, daily practice worksheets, and bilingual support in Mathematics, Environmental Science, English, Kannada, and Hindi.',
    officialFee: '₹300 / ₹500 / ₹1,000 per month (Tuition Plans)',
    feeType: 'tuition',
    modules: [
      'Number sense, mental math & multiplication tables',
      'Reading comprehension, phonics & handwriting',
      'Environmental studies & basic natural phenomena',
      'Creative expression, storytelling & curiosity building',
      'Introductory IQ and spatial puzzles'
    ],
    learningOutcomes: [
      'Solid command over basic arithmetic and reading fluency',
      'Positive study habits and reduced school anxiety',
      'Strong conceptual base for middle school sciences'
    ],
    certificationNote: 'OpenFrame Primary Academic Milestone Record issued',
    duration: 'Ongoing Academic Session (Weekly Batches)',
    level: 'Beginner',
    isPopular: true
  },
  {
    id: 'cat-acad-middle',
    name: 'Middle School Core Sciences & Mathematics (Classes 6–8)',
    categoryGroup: 'Academic',
    badge: 'Concept Building',
    ageBracket: 'Ages 11–13',
    targetGrades: 'Classes 6th – 8th',
    iconName: 'BookOpen',
    imageUrl: '/assets/images/academic_education.jpg',
    shortDesc: 'Systematic concept clarity across Mathematics, General Science, Social Studies, and English grammar.',
    fullDesc: 'Designed to bridge the gap between elementary schooling and high school board rigor. Students gain deep understanding of algebraic expressions, geometry, physics mechanics, chemical changes, biological systems, and historical contexts.',
    officialFee: '₹300 / ₹500 / ₹1,000 per month (Tuition Plans)',
    feeType: 'tuition',
    modules: [
      'Algebraic equations, geometry proofs & data handling',
      'Physics: Motion, force, light, and sound fundamentals',
      'Chemistry: Elements, compounds, and physical changes',
      'Biology: Plant & animal cellular structures, nutrition',
      'Grammar mechanics, essay composition & vocabulary'
    ],
    learningOutcomes: [
      'Ability to solve multi-step mathematical problems confidently',
      'Scientific thinking and observation-backed reasoning',
      'Preparedness for secondary school board syllabi'
    ],
    certificationNote: 'OpenFrame Middle Academic Record issued upon term assessment',
    duration: 'Ongoing Academic Session',
    level: 'Beginner',
    isPopular: true
  },
  {
    id: 'cat-acad-secondary',
    name: 'Secondary Board Foundation (Classes 9–10)',
    categoryGroup: 'Academic',
    badge: 'Board Exam Preparation',
    ageBracket: 'Ages 14–16',
    targetGrades: 'Classes 9th – 10th',
    iconName: 'GraduationCap',
    imageUrl: '/assets/images/academic_education.jpg',
    shortDesc: 'Rigorous board preparation for State & CBSE boards with mock tests, question bank drills, and doubt clearing.',
    fullDesc: 'Comprehensive board exam training focusing on Mathematics, Physics, Chemistry, Biology, and Social Sciences. Features weekly chapter tests, previous 10-year question paper drills, time-management blueprints, and formula revision sheets.',
    officialFee: '₹500 / ₹1,000 per month (Standard & Advanced)',
    feeType: 'tuition',
    modules: [
      'Real numbers, polynomials, quadratic equations & trigonometry',
      'Light reflection/refraction, electricity & magnetic effects',
      'Chemical reactions, acids/bases, metals & carbon compounds',
      'Life processes, reproduction, heredity & environment',
      'Board exam mock test series and answer writing techniques'
    ],
    learningOutcomes: [
      'Flawless exam presentation and speed problem-solving',
      'Thorough mastery of NCERT and State Board syllabus',
      'Confidence to score distinction in secondary board examinations'
    ],
    certificationNote: 'OpenFrame Board Readiness Milestone Certificate issued',
    duration: '24–36 Weeks (Full Academic Year)',
    level: 'Intermediate',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'cat-acad-senior-science',
    name: 'Senior Secondary Science: PCM & PCB (Classes 11–12)',
    categoryGroup: 'Academic',
    badge: 'Higher Secondary',
    ageBracket: 'Ages 16–18',
    targetGrades: 'Classes 11th – 12th',
    iconName: 'Cpu',
    imageUrl: '/assets/images/academic_education.jpg',
    shortDesc: 'Advanced theoretical depth and numerical problem-solving in Physics, Chemistry, Mathematics, and Biology.',
    fullDesc: 'Structured for 11th and 12th science students balancing school boards with entrance readiness. Special focus on derivations, calculus applications, organic chemistry mechanisms, and biological classifications.',
    officialFee: '₹1,000 per month (Advanced Tuition Plan)',
    feeType: 'tuition',
    modules: [
      'Calculus, vectors, 3D geometry & differential equations',
      'Electrostatics, current electricity, magnetism & optics',
      'Physical chemistry kinetics, thermodynamics & electrochemistry',
      'Organic chemistry named reactions & synthesis mechanisms',
      'Genetics, biotechnology & human physiology'
    ],
    learningOutcomes: [
      'Mastery over complex analytical numerical problems',
      'Exemplary conceptual clarity for board examinations',
      'Smooth transition to engineering or medical entrance tracks'
    ],
    certificationNote: 'OpenFrame Senior Science Academic Record issued',
    duration: 'Full Academic Year',
    level: 'Advanced',
    isFeatured: true
  },
  {
    id: 'cat-acad-senior-commerce',
    name: 'Senior Secondary Commerce & Economics (Classes 11–12)',
    categoryGroup: 'Academic',
    badge: 'Commerce & Finance',
    ageBracket: 'Ages 16–18',
    targetGrades: 'Classes 11th – 12th',
    iconName: 'TrendingUp',
    imageUrl: '/assets/images/entrepreneurship_finance.jpg',
    shortDesc: 'Accountancy principles, financial statements, business studies, microeconomics, and macroeconomic trends.',
    fullDesc: 'Tailored for senior secondary commerce students seeking exceptional clarity in financial ledger accounting, partnership firms, company accounts, government budgeting, and economic development.',
    officialFee: '₹1,000 per month (Advanced Tuition Plan)',
    feeType: 'tuition',
    modules: [
      'Financial accounting, balance sheets & cash flow statements',
      'Accounting for partnership firms and share capital',
      'Principles of management, marketing & consumer protection',
      'Microeconomics: Demand, supply, elasticity & market forms',
      'Macroeconomics: National income, banking & monetary policy'
    ],
    learningOutcomes: [
      'Accurate balance sheet drafting and financial reconciliation',
      'Strong grasp of business management frameworks and economic theory',
      'Readiness for CA Foundation, CUET, and B.Com / BBA entrance'
    ],
    certificationNote: 'OpenFrame Senior Commerce Academic Record issued',
    duration: 'Full Academic Year',
    level: 'Advanced'
  },

  // 6 to 10: Language & Core Subject Specializations
  {
    id: 'cat-math-mastery',
    name: 'Mathematics Mastery & Mental Math',
    categoryGroup: 'Academic',
    badge: 'Core Subject',
    ageBracket: 'Classes 3–10',
    targetGrades: 'Classes 3rd – 10th',
    iconName: 'Layers',
    imageUrl: '/assets/images/academic_education.jpg',
    shortDesc: 'Speed math techniques, algebraic visualization, geometry proofs, and mathematical problem solving.',
    fullDesc: 'Eliminates fear of mathematics by instilling arithmetic speed, Vedic and mental math techniques, visual geometry, and deductive proofs. Ideal for students who struggle with formulas or want speed.',
    officialFee: '₹300 / ₹500 per month (Included in Tuition)',
    feeType: 'tuition',
    modules: [
      'Vedic arithmetic shortcuts for multiplication & square roots',
      'Fractions, percentages, ratios and proportions in daily life',
      'Visual algebra and word problem translation',
      'Geometric construction and theorem verification',
      'Speed and accuracy timed mental math drills'
    ],
    learningOutcomes: [
      '50% faster mental calculation speed without calculator',
      'Confidence to tackle high-weightage word problems',
      'Improved school exam scores in mathematics'
    ],
    certificationNote: 'OpenFrame Mathematics Achievement Record issued',
    duration: '12–24 Weeks',
    level: 'All Levels',
    isPopular: true
  },
  {
    id: 'cat-lang-english',
    name: 'English Language, Grammar & Creative Writing',
    categoryGroup: 'Professional',
    badge: 'Communication',
    ageBracket: 'Classes 1–12 & Adults',
    targetGrades: 'All Grades',
    iconName: 'BookOpen',
    imageUrl: '/assets/images/communication_personality.jpg',
    shortDesc: 'Spoken English fluency, structural grammar, reading comprehension, and formal writing techniques.',
    fullDesc: 'Transforms passive English knowledge into active verbal fluency and written precision. Covers tenses, sentence mechanics, corporate emails, debate speaking, essay composition, and accent clarity.',
    officialFee: '₹1,200 (Skill Course) or Included in Tuition (₹300/mo)',
    feeType: 'skill',
    modules: [
      'Parts of speech, sentence syntax & correct tense usage',
      'Phonics, pronunciation and conversational dialogue practice',
      'Formal letter, email and descriptive essay writing',
      'Reading comprehension and inferential deductions',
      'Extempore public speaking and presentation articulation'
    ],
    learningOutcomes: [
      'Effortless conversational fluency in social and academic settings',
      'Grammatically flawless written reports, emails, and exam answers',
      'Poised presentation and public speaking delivery'
    ],
    certificationNote: 'OpenFrame English Proficiency Certificate issued',
    duration: '8–12 Weeks',
    level: 'All Levels',
    isPopular: true
  },
  {
    id: 'cat-lang-kannada',
    name: 'Kannada Bhasha & Literature (Syllabus & Spoken)',
    categoryGroup: 'Academic',
    badge: 'State Language',
    ageBracket: 'Classes 1–10',
    targetGrades: 'Classes 1st – 10th',
    iconName: 'BookOpen',
    imageUrl: '/assets/images/academic_education.jpg',
    shortDesc: 'Comprehensive Karnataka state syllabus coaching, Varnamale, grammar (Vyakarana), and conversational Kannada.',
    fullDesc: 'Dedicated instruction for students learning Kannada as first, second, or third language. Covers Kannada alphabets (Varnamale), Sandhi, Samasa, Chandassu, prose comprehension, and conversational fluency for non-native residents.',
    officialFee: 'Included in Academic Tuition (From ₹300/month)',
    feeType: 'tuition',
    modules: [
      'Kannada Varnamale, Gunithakshara & Otthakshara foundations',
      'Vyakarana: Sandhi, Samasa, Vibhakthi Prathyaya & Tatsama-Tadbhava',
      'Textbook prose and poetry explanation with moral synthesis',
      'Kannada essay (Prabandha) and letter (Pathra Lekhana) writing',
      'Conversational Kannada for daily interactions'
    ],
    learningOutcomes: [
      'Fluent reading, writing, and speaking in Kannada',
      'Top marks in Karnataka state board Kannada examinations',
      'Appreciation of regional culture and literature'
    ],
    certificationNote: 'OpenFrame Regional Language Record issued',
    duration: 'Academic Session',
    level: 'All Levels'
  },
  {
    id: 'cat-lang-hindi',
    name: 'Hindi Language & Vyakarana Mastery',
    categoryGroup: 'Academic',
    badge: 'National Language',
    ageBracket: 'Classes 1–10',
    targetGrades: 'Classes 1st – 10th',
    iconName: 'BookOpen',
    imageUrl: '/assets/images/academic_education.jpg',
    shortDesc: 'Hindi Varnamala, grammar rules, Muhavare, textbook chapters, and formal composition.',
    fullDesc: 'Focused Hindi language tuition for CBSE and State board students. Emphasizes correct spelling (Vartani), sentence formation (Vakya Rachna), idioms (Muhavare), comprehension, and dialogue articulation.',
    officialFee: 'Included in Academic Tuition (From ₹300/month)',
    feeType: 'tuition',
    modules: [
      'Devanagari script, Matras and spelling precision',
      'Shabd Bhed, Sangya, Sarvanam, Kriya, Karak & Kaal',
      'Muhavare, Lokoktiyan and creative Vakya prayog',
      'Anuched Lekhan, Patra Lekhan & Samvad Lekhan',
      'Prescribed textbook prose and poetry interpretation'
    ],
    learningOutcomes: [
      'Correct grammatical syntax and rich Hindi vocabulary',
      'High scores in school terminal and annual Hindi tests',
      'Confident spoken articulation in academic discussions'
    ],
    certificationNote: 'OpenFrame Hindi Milestone Record issued',
    duration: 'Academic Session',
    level: 'All Levels'
  },
  {
    id: 'cat-exam-prep',
    name: 'Board Exam Preparation & Test Series',
    categoryGroup: 'Academic',
    badge: 'Exam Readiness',
    ageBracket: 'Classes 9–12',
    targetGrades: 'Classes 9th – 12th',
    iconName: 'Award',
    imageUrl: '/assets/images/academic_education.jpg',
    shortDesc: 'Structured mock exams, timed paper-solving, examiner tips, and calm, structured revision blueprints.',
    fullDesc: 'Intensive exam preparation designed to convert syllabus knowledge into high exam scores. Includes chapter-wise question banks, previous years solved papers, timed simulated exams, step-marking strategies, and revision schedules.',
    officialFee: 'Included in Standard & Advanced Plans (₹500 / ₹1,000)',
    feeType: 'tuition',
    modules: [
      'Analysis of blue-prints, weightage and mark distribution',
      'Timed simulated full-length mock examinations',
      'Line-by-line answer presentation and step-marking guidance',
      'Common pitfalls, negative marking precautions & error audits',
      'Stress management, memory triggers and revision calendar'
    ],
    learningOutcomes: [
      'Reduced exam nervousness and enhanced pacing',
      'Familiarity with all probable question patterns',
      'Consistent 15–25% improvement in board exam mock scores'
    ],
    certificationNote: 'OpenFrame Board Readiness Certificate issued',
    duration: '12–16 Weeks leading to board exams',
    level: 'Intermediate',
    isPopular: true
  },

  // 11 to 16: Technology & Programming Skills
  {
    id: 'cat-comp-fundamentals',
    name: 'Computer Fundamentals & Productivity (MS Office & OS)',
    categoryGroup: 'Technology',
    badge: 'Digital Literacy',
    ageBracket: 'Classes 3–12 & Adults',
    targetGrades: 'All Ages',
    iconName: 'Laptop',
    imageUrl: '/assets/images/technology_digital_skills.jpg',
    shortDesc: 'Operating system navigation, touch typing, MS Word, Advanced Excel, PowerPoint, and online safety.',
    fullDesc: 'Foundational computer literacy training for students and adults. Covers Windows navigation, file management, document formatting in Word, spreadsheet formulas in Excel, presentation design in PowerPoint, and cyber hygiene.',
    officialFee: '₹1,200 (Skill Course) or ₹300/mo Subscription',
    feeType: 'skill',
    modules: [
      'Computer hardware, OS navigation and file organization',
      'MS Word: Professional documents, formatting, tables & citations',
      'MS Excel: Formulas (SUM, VLOOKUP, IF), charts & pivot tables',
      'MS PowerPoint: Slide transitions, animations & visual storytelling',
      'Digital safety, strong passwords, phishing awareness & cloud backup'
    ],
    learningOutcomes: [
      'Mastery of essential office productivity software',
      'Ability to build polished student assignments and reports',
      'Confident computer operation in school and workplace'
    ],
    certificationNote: 'OpenFrame Certificate in Computer Applications issued',
    duration: '6–8 Weeks',
    level: 'Beginner',
    isPopular: true
  },
  {
    id: 'cat-prog-coding-basics',
    name: 'Coding & Logic Fundamentals (Scratch & Blockly)',
    categoryGroup: 'Technology',
    badge: 'Junior Coding',
    ageBracket: 'Classes 3–8',
    targetGrades: 'Classes 3rd – 8th',
    iconName: 'Code2',
    imageUrl: '/assets/images/coding_programming.jpg',
    shortDesc: 'Algorithmic thinking, block-based programming, interactive animations, and beginner logic puzzles.',
    fullDesc: 'Engaging, gamified coding for young learners. Using MIT Scratch and block editors, children learn sequencing, loops, conditional statements, variables, and event listeners while building their own 2D games and animated stories.',
    officialFee: '₹1,200 (Skill Course) or ₹300/mo Subscription',
    feeType: 'skill',
    modules: [
      'Introduction to algorithms, sequencing and computational logic',
      'Block programming in Scratch: Sprites, costumes and coordinates',
      'Loops, repeat structures, and event-driven broadcasting',
      'Variables, scoreboards, and conditional If-Else decisions',
      'Building 3 interactive games and publishing to the community'
    ],
    learningOutcomes: [
      'Strong logical problem-solving and algorithmic thinking',
      'Creation of functional interactive 2D games and stories',
      'Effortless transition to text-based coding in Python'
    ],
    certificationNote: 'OpenFrame Junior Coder Certificate issued',
    duration: '8 Weeks',
    level: 'Beginner',
    isPopular: true
  },
  {
    id: 'cat-prog-python',
    name: 'Python Programming & Problem Solving',
    categoryGroup: 'Technology',
    badge: 'Industry Code',
    ageBracket: 'Classes 7–12 & College',
    targetGrades: 'Classes 7th – College+',
    iconName: 'Code2',
    imageUrl: '/assets/images/coding_programming.jpg',
    shortDesc: 'Modern Python syntax, data structures, object-oriented concepts, and automation scripting.',
    fullDesc: 'A comprehensive, text-based programming course using Python 3. Students progress from basic variables and control flow to functions, data structures (lists, dictionaries, sets), file handling, OOP, and real-world automation scripts.',
    officialFee: '₹1,200 (Skill Course) or ₹499/mo Subscription',
    feeType: 'skill',
    modules: [
      'Python syntax, operators, data types and input/output',
      'Control flow: Conditionals, while loops and for loops',
      'Functions, scope, lambda functions and module imports',
      'Data structures: Lists, tuples, dictionaries and set operations',
      'File I/O operations and exception handling',
      'Object-Oriented Programming (Classes, Objects, Inheritance)',
      'Building 3 practical console projects & automation scripts'
    ],
    learningOutcomes: [
      'Proficiency in writing clean, modular Python programs',
      'Sound understanding of data structures and algorithmic complexity',
      'Strong foundation for Artificial Intelligence and Web Development'
    ],
    certificationNote: 'OpenFrame Python Developer Certificate issued',
    duration: '10–12 Weeks',
    level: 'Intermediate',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'cat-prog-web-dev',
    name: 'Full-Stack Web Development (HTML5, CSS3, JS & React)',
    categoryGroup: 'Technology',
    badge: 'Web Technologies',
    ageBracket: 'Classes 9–12 & College',
    targetGrades: 'Classes 9th – College+',
    iconName: 'Globe',
    imageUrl: '/assets/images/coding_programming.jpg',
    shortDesc: 'Modern responsive websites, Tailwind CSS layouts, interactive JavaScript, and React component state.',
    fullDesc: 'Hands-on practical web development curriculum. Learners build real websites starting with semantic HTML5, CSS3 Flexbox & Grid, modern JavaScript (ES6+), DOM manipulation, API fetching, and modern React user interfaces.',
    officialFee: '₹1,200 (Skill Course) or ₹499/mo Subscription',
    feeType: 'skill',
    modules: [
      'Semantic HTML5, accessibility standards & SEO basics',
      'CSS3 Flexbox, CSS Grid, animations & Tailwind CSS styling',
      'JavaScript ES6+: Variables, functions, array methods, async/await',
      'DOM events, form validation and localStorage caching',
      'React foundations: Components, props, hooks (useState, useEffect)',
      'Consuming REST APIs and building responsive portfolio web apps'
    ],
    learningOutcomes: [
      'Ability to design and code modern responsive websites from scratch',
      'Real-world portfolio of live web applications hosted online',
      'Readiness for junior frontend developer roles or internships'
    ],
    certificationNote: 'OpenFrame Full-Stack Web Development Certificate issued',
    duration: '12–16 Weeks',
    level: 'Intermediate',
    isFeatured: true
  },
  {
    id: 'cat-tech-ai-prompt',
    name: 'Artificial Intelligence & Prompt Engineering',
    categoryGroup: 'Technology',
    badge: 'Generative AI',
    ageBracket: 'Classes 7–12 & College',
    targetGrades: 'Classes 7th – College+',
    iconName: 'Sparkles',
    imageUrl: '/assets/images/artificial_intelligence.jpg',
    shortDesc: 'Generative AI concepts, prompt architecture, AI tools for study and work, and ethical usage.',
    fullDesc: 'Demystifies artificial intelligence for students and professionals. Teaches how large language models work, advanced prompting frameworks (role-based, few-shot, chain-of-thought), AI tools for research, coding assistants, and ethical boundaries.',
    officialFee: '₹1,200 (Skill Course) or ₹499/mo Subscription',
    feeType: 'skill',
    modules: [
      'Foundations of Artificial Intelligence, neural nets & LLMs',
      'Structured prompt engineering methodologies for maximum accuracy',
      'Leveraging AI for academic research, drafting & study revision',
      'AI coding assistants, visual generation tools & workflow automation',
      'Critical thinking, bias detection, hallucination audits & ethics'
    ],
    learningOutcomes: [
      '10x productivity enhancement using modern AI platforms',
      'Ability to write precise prompts for complex enterprise workflows',
      'Ethical, safe, and academically honest AI utilization'
    ],
    certificationNote: 'OpenFrame AI & Prompt Engineering Certificate issued',
    duration: '6–8 Weeks',
    level: 'All Levels',
    isPopular: true
  },
  {
    id: 'cat-tech-ml-data',
    name: 'Machine Learning & Predictive Modeling',
    categoryGroup: 'Technology',
    badge: 'Advanced Tech',
    ageBracket: 'Classes 11–12 & College',
    targetGrades: 'Classes 11th – College+',
    iconName: 'Cpu',
    imageUrl: '/assets/images/artificial_intelligence.jpg',
    shortDesc: 'Supervised and unsupervised learning, regression, classification, clustering, and Scikit-Learn.',
    fullDesc: 'Comprehensive introduction to mathematical and applied machine learning. Covers data preprocessing with Pandas, feature engineering, linear regression, decision trees, random forests, clustering algorithms, and model evaluation metrics.',
    officialFee: '₹1,200 (Skill Course) or ₹999/mo Premium Plan',
    feeType: 'skill',
    modules: [
      'Linear algebra and statistics for machine learning',
      'Data wrangling, cleaning and exploratory analysis with Pandas',
      'Supervised learning: Linear & logistic regression, decision trees',
      'Unsupervised learning: K-Means clustering and PCA dimensionality',
      'Model validation, confusion matrix, precision/recall & tuning',
      'Building an end-to-end predictive machine learning capstone project'
    ],
    learningOutcomes: [
      'Ability to train, evaluate, and deploy predictive ML models',
      'Practical competence with Python ML libraries (Scikit-Learn)',
      'Understanding of real-world AI pipelines in healthcare and finance'
    ],
    certificationNote: 'OpenFrame Machine Learning Practitioner Certificate issued',
    duration: '12 Weeks',
    level: 'Advanced'
  },

  // 17 to 20: Emerging Technologies & Cloud
  {
    id: 'cat-tech-data-science',
    name: 'Data Science & Visual Analytics',
    categoryGroup: 'Technology',
    badge: 'Analytics',
    ageBracket: 'Classes 9–12 & College',
    targetGrades: 'Classes 9th – College+',
    iconName: 'BarChart3',
    imageUrl: '/assets/images/technology_digital_skills.jpg',
    shortDesc: 'Data wrangling, statistical charts, dashboards, business insights, and decision intelligence.',
    fullDesc: 'Equips students with the ability to turn messy data into actionable visual stories. Uses Python, Matplotlib, Seaborn, and modern dashboard tools to extract patterns, test hypotheses, and create executive reports.',
    officialFee: '₹1,200 (Skill Course) or ₹499/mo Subscription',
    feeType: 'skill',
    modules: [
      'Data lifecycle, collection methods and dataset integrity',
      'Data manipulation and filtering with Python Pandas',
      'Statistical charts: Histograms, scatter plots, box plots & heatmaps',
      'Storytelling with data: Designing clean executive dashboards',
      'Real-world case study: Analyzing consumer and education metrics'
    ],
    learningOutcomes: [
      'Capability to clean and analyze complex numerical datasets',
      'Creation of visually compelling charts and statistical presentations',
      'Sharp quantitative reasoning and data-driven judgment'
    ],
    certificationNote: 'OpenFrame Data Analytics Certificate issued',
    duration: '8–10 Weeks',
    level: 'Intermediate'
  },
  {
    id: 'cat-tech-cloud',
    name: 'Cloud Computing & Digital Infrastructure',
    categoryGroup: 'Technology',
    badge: 'Cloud Tech',
    ageBracket: 'Classes 10–12 & College',
    targetGrades: 'Classes 10th – College+',
    iconName: 'Zap',
    imageUrl: '/assets/images/technology_digital_skills.jpg',
    shortDesc: 'Virtual servers, cloud storage, serverless hosting, API gateways, and DevOps fundamentals.',
    fullDesc: 'Introduction to how modern internet applications scale. Explores cloud architecture fundamentals, virtualization, object storage, serverless functions, database hosting, and CI/CD deployment pipelines.',
    officialFee: '₹1,200 (Skill Course) or ₹499/mo Subscription',
    feeType: 'skill',
    modules: [
      'Core concepts of cloud computing (IaaS, PaaS, SaaS)',
      'Compute instances, virtual machines and containers',
      'Object storage, block storage and cloud databases',
      'Deploying web applications to modern cloud hosting platforms',
      'Security groups, identity access management & cost management'
    ],
    learningOutcomes: [
      'Hands-on deployment of web applications to live cloud infrastructure',
      'Solid architectural foundation in cloud scalability',
      'Preparation for foundational cloud certifications'
    ],
    certificationNote: 'OpenFrame Cloud Practitioner Certificate issued',
    duration: '8 Weeks',
    level: 'Intermediate'
  },
  {
    id: 'cat-tech-arvr',
    name: 'AR / VR / XR Immersive Technologies',
    categoryGroup: 'STEM',
    badge: 'Immersive Tech',
    ageBracket: 'Classes 8–12 & College',
    targetGrades: 'Classes 8th – College+',
    iconName: 'Sparkles',
    imageUrl: '/assets/images/robotics_stem.jpg',
    shortDesc: 'Augmented reality, virtual environments, 3D spatial computing, and interactive experiences.',
    fullDesc: 'Takes students into the next frontier of human-computer interaction. Covers spatial geometry, WebXR basics, AR mobile filters, immersive 3D simulations, and educational applications.',
    officialFee: '₹1,200 (Skill Course) or From ₹499 (Advanced Special)',
    feeType: 'special',
    modules: [
      'Foundations of Augmented Reality (AR) & Virtual Reality (VR)',
      '3D spatial coordinates, cameras and lighting in virtual spaces',
      'Building simple AR mobile experiences with target tracking',
      'WebXR fundamentals for browser-based interactive 3D worlds',
      'Use cases in healthcare, architecture, education & gaming'
    ],
    learningOutcomes: [
      'Ability to build and deploy simple interactive AR experiences',
      'Spatial thinking and interactive user experience intuition',
      'Familiarity with emerging extended reality hardware ecosystems'
    ],
    certificationNote: 'OpenFrame Immersive Tech Certificate issued',
    duration: '8 Weeks',
    level: 'Intermediate'
  },
  {
    id: 'cat-tech-blockchain',
    name: 'Blockchain & Emerging Web3 Technologies',
    categoryGroup: 'Technology',
    badge: 'Web3 & Security',
    ageBracket: 'Classes 10–12 & College',
    targetGrades: 'Classes 10th – College+',
    iconName: 'ShieldCheck',
    imageUrl: '/assets/images/technology_digital_skills.jpg',
    shortDesc: 'Distributed ledgers, cryptographic hashing, smart contracts, and decentralized systems.',
    fullDesc: 'Demystifies blockchain technology through computer science first principles. Explores cryptography (SHA-256, public-private keypairs), consensus protocols, smart contract logic, digital identities, and real-world enterprise supply chain applications.',
    officialFee: '₹1,200 (Skill Course) or From ₹499 (Advanced Special)',
    feeType: 'special',
    modules: [
      'Cryptographic hashes, digital signatures and public-private keys',
      'Distributed ledger architecture and peer-to-peer networking',
      'Consensus algorithms (Proof of Work vs Proof of Stake)',
      'Introduction to smart contract logic and verification',
      'Real-world applications in supply chain, land registry & credentials'
    ],
    learningOutcomes: [
      'Objective understanding of decentralized technology mechanics',
      'Ability to differentiate real-world enterprise use cases from hype',
      'Strong conceptual grounding in modern cryptographic security'
    ],
    certificationNote: 'OpenFrame Emerging Tech Certificate issued',
    duration: '8 Weeks',
    level: 'Advanced'
  },

  // 21 to 25: STEM, Robotics & Design
  {
    id: 'cat-stem-robotics',
    name: 'Robotics, Microcontrollers & IoT Automation',
    categoryGroup: 'STEM',
    badge: 'Hardware & IoT',
    ageBracket: 'Classes 6–12',
    targetGrades: 'Classes 6th – 12th',
    iconName: 'Cpu',
    imageUrl: '/assets/images/robotics_stem.jpg',
    shortDesc: 'Electronic circuits, sensors, Arduino / ESP32 simulations, motors, and smart automated devices.',
    fullDesc: 'Brings physical engineering to life. Students learn circuit design on breadboards, interface digital and analog sensors (ultrasonic, temperature, light), control DC motors and servos, and write embedded code for smart automated machines.',
    officialFee: '₹1,200 (Skill Course) or From ₹499 (Advanced Special)',
    feeType: 'special',
    modules: [
      'Voltage, current, resistance and breadboard wiring fundamentals',
      'Microcontroller architecture (Arduino / ESP32 logic)',
      'Digital and analog sensors: Ultrasonic, infrared, DHT11 & LDR',
      'Actuators, motor drivers, relays and LED displays',
      'Building 3 smart automation projects (Obstacle avoider, smart garden)'
    ],
    learningOutcomes: [
      'Confidence in designing and troubleshooting physical electronic circuits',
      'Firm grasp of embedded programming and sensor data acquisition',
      'Readiness for school science fairs, hackathons, and maker contests'
    ],
    certificationNote: 'OpenFrame Robotics & Maker Certificate issued',
    duration: '10 Weeks',
    level: 'Beginner',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'cat-stem-3d-design',
    name: '3D Design, Modelling & Prototyping',
    categoryGroup: 'STEM',
    badge: 'Engineering CAD',
    ageBracket: 'Classes 6–12 & College',
    targetGrades: 'Classes 6th – College+',
    iconName: 'Layers',
    imageUrl: '/assets/images/robotics_stem.jpg',
    shortDesc: 'Computer-aided design (CAD), 3D spatial modelling, product rendering, and rapid prototyping.',
    fullDesc: 'Teaches students how to conceptualize and model 3D physical objects. Covers geometric dimensions, boolean unions, parametric sketches, 3D printing slicing software, and industrial product prototyping.',
    officialFee: '₹1,200 (Skill Course) or ₹499/mo Subscription',
    feeType: 'skill',
    modules: [
      'Introduction to 3D coordinate planes and CAD environments',
      'Parametric 2D sketching, constraints and dimensioning',
      'Extrusion, revolving, fillets, chamfers and shell operations',
      'Assembly of multi-part objects and motion visualization',
      'Exporting STL files, slicing software parameters & prototyping'
    ],
    learningOutcomes: [
      'Ability to design custom 3D models for printing and product prototyping',
      'Spatial reasoning and mechanical visualization skills',
      'Engineering portfolio of original physical product models'
    ],
    certificationNote: 'OpenFrame 3D CAD Design Certificate issued',
    duration: '8 Weeks',
    level: 'Intermediate'
  },
  {
    id: 'cat-creative-graphic-design',
    name: 'Graphic Design, Canva & Visual Branding',
    categoryGroup: 'Creative',
    badge: 'Visual Design',
    ageBracket: 'Classes 5–12 & Adults',
    targetGrades: 'All Ages',
    iconName: 'Palette',
    imageUrl: '/assets/images/graphic_design_media.jpg',
    shortDesc: 'Typography, color theory, Canva mastery, poster and social media design, and brand identity kits.',
    fullDesc: 'A practical, creativity-unleashing graphic design course. Teaches visual hierarchy, contrast, color psychology, font pairing, composition rules, and how to create stunning posters, flyers, book covers, and social media creatives.',
    officialFee: '₹1,200 (Skill Course) or ₹300/mo Subscription',
    feeType: 'skill',
    modules: [
      'Principles of design: Hierarchy, balance, contrast, alignment & white space',
      'Color wheels, palette harmony and psychological impact',
      'Typography: Serif, sans-serif, kerning and font pairing',
      'Mastering Canva Pro workflows, templates and custom dimensions',
      'Photoshop / digital raster editor essentials: Layers and masks',
      'Creating a complete brand identity package (Logo, card, banners)'
    ],
    learningOutcomes: [
      'Creation of visually stunning promotional and academic graphics',
      'Deep understanding of commercial graphic design standards',
      'Polished portfolio of brand designs and marketing assets'
    ],
    certificationNote: 'OpenFrame Graphic Designer Certificate issued',
    duration: '8 Weeks',
    level: 'Beginner',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'cat-creative-video-editing',
    name: 'Video Editing, Motion Graphics & Creative Media',
    categoryGroup: 'Creative',
    badge: 'Media Production',
    ageBracket: 'Classes 7–12 & College',
    targetGrades: 'Classes 7th – College+',
    iconName: 'Video',
    imageUrl: '/assets/images/graphic_design_media.jpg',
    shortDesc: 'Timeline sequencing, cuts, pacing, audio mixing, color correction, and short-form video creation.',
    fullDesc: 'Master modern digital video editing. Students learn timeline navigation, cutting rhythms, multi-track audio leveling, title typography, transitions, b-roll placement, and publishing for YouTube and educational reels.',
    officialFee: '₹1,200 (Skill Course) or ₹499/mo Subscription',
    feeType: 'skill',
    modules: [
      'Video aspect ratios, frame rates, resolutions and codecs',
      'Timeline assembly, rough cut, pacing and narrative rhythm',
      'Audio cleanup, background score balancing & sound effects',
      'Text titles, lower thirds, callouts and kinetic typography',
      'Color grading, speed ramps and professional export presets'
    ],
    learningOutcomes: [
      'Ability to produce engaging, broadcast-ready video content',
      'Mastery of digital storytelling and rhythm in media',
      'Reels and long-form video portfolio published online'
    ],
    certificationNote: 'OpenFrame Creative Media Certificate issued',
    duration: '8 Weeks',
    level: 'Intermediate',
    isPopular: true
  },
  {
    id: 'cat-creative-uiux',
    name: 'UI / UX Design Fundamentals & User Research',
    categoryGroup: 'Creative',
    badge: 'Product Design',
    ageBracket: 'Classes 9–12 & College',
    targetGrades: 'Classes 9th – College+',
    iconName: 'Palette',
    imageUrl: '/assets/images/graphic_design_media.jpg',
    shortDesc: 'User personas, wireframes, Figma prototyping, usability testing, and mobile app design.',
    fullDesc: 'Learn how user-friendly digital products are built. Covers user empathy interviews, problem statements, low-fidelity wireframing, component design systems, Figma interactive prototypes, and usability evaluations.',
    officialFee: '₹1,200 (Skill Course) or ₹499/mo Subscription',
    feeType: 'skill',
    modules: [
      'Difference between User Experience (UX) and User Interface (UI)',
      'Conducting user research, creating personas and empathy maps',
      'Information architecture, user flows and low-fidelity wireframing',
      'Figma basics: Frames, shapes, auto-layout and reusable components',
      'High-fidelity interactive mobile app prototypes & micro-interactions',
      'Usability testing, feedback incorporation and presentation deck'
    ],
    learningOutcomes: [
      'End-to-end design of a clickable mobile app or website prototype',
      'User-centric problem solving and empathy mindset',
      'Industry-standard Figma portfolio piece ready for review'
    ],
    certificationNote: 'OpenFrame UI/UX Designer Certificate issued',
    duration: '10 Weeks',
    level: 'Intermediate'
  },

  // 26 to 29: Communication, Personality, Leadership & Emotional Development
  {
    id: 'cat-soft-comm-public-speaking',
    name: 'Public Speaking, Articulation & Presentation Skills',
    categoryGroup: 'Professional',
    badge: 'Communication',
    ageBracket: 'Classes 4–12 & Adults',
    targetGrades: 'All Ages',
    iconName: 'Users',
    imageUrl: '/assets/images/communication_personality.jpg',
    shortDesc: 'Overcoming stage fear, vocal modulation, body language, storytelling, and compelling presentation delivery.',
    fullDesc: 'Eliminates stage fright and equips learners with commanding vocal delivery, structured persuasive speeches, slide presentations, and extempore confidence in school debates and conferences.',
    officialFee: '₹1,200 (Skill Course) or ₹300/mo Subscription',
    feeType: 'skill',
    modules: [
      'Overcoming stage anxiety through breathwork and positive reframing',
      'Vocal variety: Tone, pitch, pace, pauses and volume modulation',
      'Body language: Eye contact, hand gestures, posture and movement',
      'The 3-act narrative structure for speeches and school debates',
      'Live recorded speech drills with individual mentor critiques'
    ],
    learningOutcomes: [
      'Absolute ease and poise when speaking before groups',
      'Clear, persuasive vocal delivery without filler words',
      'Readiness for school debates, competitions, and presentations'
    ],
    certificationNote: 'OpenFrame Oratory & Public Speaking Certificate issued',
    duration: '6–8 Weeks',
    level: 'All Levels',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'cat-soft-personality-leadership',
    name: 'Personality Development, Ethics & Leadership',
    categoryGroup: 'Professional',
    badge: 'Executive Skills',
    ageBracket: 'Classes 6–12 & College',
    targetGrades: 'Classes 6th – College+',
    iconName: 'Award',
    imageUrl: '/assets/images/communication_personality.jpg',
    shortDesc: 'Self-discipline, executive grooming, time architecture, situational leadership, and ethical decision-making.',
    fullDesc: 'Builds character, integrity, and proactive leadership habits. Explores habit formation, morning routines, personal grooming, ethical principles, team collaboration, and resolving disputes calmly.',
    officialFee: '₹1,200 (Skill Course) or ₹300/mo Subscription',
    feeType: 'skill',
    modules: [
      'Self-awareness: Identifying strengths, blind spots and values',
      'Time architecture: Overcoming procrastination with timeboxing',
      'Professional grooming, personal etiquette and positive body language',
      'Team leadership: Listening, delegating and motivating peers',
      'Conflict management, empathy and constructive negotiation'
    ],
    learningOutcomes: [
      'High self-discipline, punctuality, and personal accountability',
      'Respectful, assertive communication and conflict resolution',
      'Visible leadership initiative in academic and extracurricular roles'
    ],
    certificationNote: 'OpenFrame Leadership Milestone Certificate issued',
    duration: '8 Weeks',
    level: 'All Levels'
  },
  {
    id: 'cat-intel-iq-eq-sq',
    name: 'IQ, EQ & SQ Student Holistic Development',
    categoryGroup: 'Intelligence',
    badge: 'Cognitive Quotient',
    ageBracket: 'Classes 1–12',
    targetGrades: 'Classes 1st – 12th',
    iconName: 'Brain',
    imageUrl: '/assets/images/iq_eq_sq_development.jpg',
    shortDesc: 'Continuous development assessing and cultivating Intelligence, Emotional Quotient, and Social Quotient.',
    fullDesc: 'Our signature holistic child development programme featured in both official brochures. Tracks and strengthens logical memory (IQ), emotional self-regulation (EQ), and teamwork/empathy (SQ) through weekly activities and monthly parent reports.',
    officialFee: '₹300 Per Month (Student Development Programme)',
    feeType: 'mentoring',
    modules: [
      'IQ Focus: Logical deduction, pattern series, spatial memory & numerical aptitude',
      'EQ Focus: Emotional awareness, stress regulation, resilience & empathy mapping',
      'SQ Focus: Positive communication, teamwork, peer cooperation & social values',
      'Weekly diagnostic cognitive assessments and gamified mental drills',
      'Comprehensive monthly parent progress report and counselor summary'
    ],
    learningOutcomes: [
      'Balanced emotional maturity and reduced academic stress',
      'Sharpened logical deduction and speed problem solving',
      'Compassionate, cooperative social behavior and strong value foundation'
    ],
    certificationNote: 'OpenFrame Holistic Development Record issued quarterly',
    duration: 'Continuous Monthly Subscription (₹300/mo)',
    level: 'All Levels',
    isPopular: true,
    isFeatured: true
  },
  {
    id: 'cat-career-mentoring-guidance',
    name: 'Career Exploration, Stream Selection & Mentoring',
    categoryGroup: 'Professional',
    badge: 'Career Roadmap',
    ageBracket: 'Classes 8–12 & College',
    targetGrades: 'Classes 8th – College+',
    iconName: 'Compass',
    imageUrl: '/assets/images/career_development.jpg',
    shortDesc: 'Aptitude mapping, Class 9–12 stream selection (Science/Commerce/Arts), college planning, and 1-on-1 counseling.',
    fullDesc: 'Helps students and parents navigate critical career crossroads with scientific clarity. Uses psychometric aptitude assessments, industry exploration sessions, and 1-on-1 counseling to chart higher education roadmaps.',
    officialFee: '₹500 / Session or ₹300–₹999 / Month (Mentoring Plans)',
    feeType: 'mentoring',
    modules: [
      'Aptitude and interest mapping diagnostics for students',
      'Class 9–11 stream guidance: Science vs Commerce vs Humanities',
      'Overview of 50+ modern career paths and emerging industry roles',
      'College entrance exams overview (JEE, NEET, CUET, KCET, CLAT)',
      '1-to-1 mentoring sessions with personalized action timetable'
    ],
    learningOutcomes: [
      'Clarity on personal strengths and suitable academic streams',
      'Elimination of confusion regarding college admissions and careers',
      'Personalized multi-year education and skill development roadmap'
    ],
    certificationNote: 'OpenFrame Career Advisory Dossier provided',
    duration: 'By Appointment or Monthly Mentoring Subscription',
    level: 'All Levels',
    isPopular: true,
    isFeatured: true
  },

  // 30 to 33: Business, Finance, Wellbeing & Rural
  {
    id: 'cat-biz-entrepreneurship',
    name: 'Entrepreneurship, E-commerce & Business Basics',
    categoryGroup: 'Business',
    badge: 'Enterprise',
    ageBracket: 'Classes 9–12 & College',
    targetGrades: 'Classes 9th – College+',
    iconName: 'TrendingUp',
    imageUrl: '/assets/images/entrepreneurship_finance.jpg',
    shortDesc: 'Business model canvas, customer validation, product pricing, online storefronts, and sales fundamentals.',
    fullDesc: 'Inspires the next generation of founders. Teaches students how to spot real-world problems, build minimum viable products (MVPs), calculate unit economics, launch online storefronts, and market products ethically.',
    officialFee: '₹1,200 (Skill Course) or ₹499/mo Subscription',
    feeType: 'skill',
    modules: [
      'Identifying market problems and conducting customer discovery',
      'Unit economics: Cost of goods, gross margin, pricing and profit',
      'The Lean Business Model Canvas framework',
      'Setting up an online e-commerce storefront and payment gateways',
      'Sales prospecting, pitching to customers and handling objections'
    ],
    learningOutcomes: [
      'Creation of a validated business model and pricing strategy',
      'Hands-on experience launching an online digital or physical storefront',
      'Entrepreneurial problem-solving and resilience mindset'
    ],
    certificationNote: 'OpenFrame Young Entrepreneur Certificate issued',
    duration: '8–10 Weeks',
    level: 'Intermediate',
    isPopular: true
  },
  {
    id: 'cat-biz-digital-marketing',
    name: 'Digital Marketing, SEO & Social Media Campaigns',
    categoryGroup: 'Business',
    badge: 'Marketing',
    ageBracket: 'Classes 9–12 & College',
    targetGrades: 'Classes 9th – College+',
    iconName: 'BarChart3',
    imageUrl: '/assets/images/entrepreneurship_finance.jpg',
    shortDesc: 'Search Engine Optimization (SEO), content strategy, paid advertising, and social media brand building.',
    fullDesc: 'Hands-on digital growth marketing. Students learn keyword research, on-page SEO, social media calendar creation, performance advertising concepts, email marketing, and web analytics tracking.',
    officialFee: '₹1,200 (Skill Course) or ₹499/mo Subscription',
    feeType: 'skill',
    modules: [
      'Fundamentals of digital marketing and inbound vs outbound funnels',
      'SEO mastery: Keywords, meta tags, content structure & backlinks',
      'Social media marketing for Instagram, LinkedIn and YouTube',
      'Paid ads strategy: Understanding CPC, CTR, ROAS and targeting',
      'Google Analytics and web performance conversion metrics'
    ],
    learningOutcomes: [
      'Ability to plan, execute, and measure digital marketing campaigns',
      'Real-world portfolio of marketing campaigns and content strategies',
      'High-demand freelance and agency-ready digital marketing skills'
    ],
    certificationNote: 'OpenFrame Digital Marketing Specialist Certificate issued',
    duration: '8 Weeks',
    level: 'Intermediate'
  },
  {
    id: 'cat-fin-literacy',
    name: 'Financial Literacy, Money Management & Investing',
    categoryGroup: 'Business',
    badge: 'Life Skill',
    ageBracket: 'Classes 8–12 & Young Adults',
    targetGrades: 'Classes 8th – College+',
    iconName: 'TrendingUp',
    imageUrl: '/assets/images/entrepreneurship_finance.jpg',
    shortDesc: 'Budgeting, compound interest, banking, digital payments, mutual funds, and smart financial habits.',
    fullDesc: 'Crucial life skills every young adult needs. Teaches the power of compound interest, bank accounts, UPI, debit/credit cards, budgeting using the 50/30/20 rule, inflation, mutual funds, and avoiding debt traps.',
    officialFee: '₹1,200 (Skill Course) or Included in ₹300/mo Subscription',
    feeType: 'skill',
    modules: [
      'The psychology of money, needs vs wants, and delayed gratification',
      'Banking fundamentals, UPI, digital safety and credit scores',
      'The power of compound interest and starting investments early',
      'Budgeting blueprints: 50/30/20 rule and tracking monthly expenses',
      'Introduction to savings schemes, index funds and mutual funds'
    ],
    learningOutcomes: [
      'Lifelong prudent budgeting and money management habits',
      'Clear understanding of banking, taxes, and digital payment security',
      'Confidence to make informed financial choices without impulse spending'
    ],
    certificationNote: 'OpenFrame Financial Literacy Certificate issued',
    duration: '6 Weeks',
    level: 'Beginner',
    isPopular: true
  },
  {
    id: 'cat-rural-agri-innovation',
    name: 'Agriculture, Rural Innovation & Grassroots Livelihoods',
    categoryGroup: 'Wellbeing',
    badge: 'HopeNest Collaboration',
    ageBracket: 'Youth & Adults',
    targetGrades: 'Community & College',
    iconName: 'HeartHandshake',
    imageUrl: '/assets/images/agriculture_rural_innovation.jpg',
    shortDesc: 'Smart agriculture tools, organic farming, rural entrepreneurship, and community self-reliance.',
    fullDesc: 'Delivered in proud institutional collaboration with HopeNest Global Foundation (Section 8 Non-Profit). Empowers rural youth, self-help groups, and women with digital tools, sustainable agriculture practices, local micro-enterprises, and government scheme awareness.',
    officialFee: 'Community Institutional Access / Subsidized',
    feeType: 'special',
    modules: [
      'Smart agricultural practices and water conservation techniques',
      'Organic farming methods, soil health and bio-fertilizers',
      'Setting up rural micro-enterprises and local value-addition',
      'Digital onboarding: Online banking, e-commerce & government portals',
      'Community self-help group financial literacy and record keeping'
    ],
    learningOutcomes: [
      'Adoption of productive modern agricultural and enterprise practices',
      'Digital empowerment of rural self-help groups and women',
      'Strengthened local economic resilience and sustainable livelihoods'
    ],
    certificationNote: 'OpenFrame & HopeNest Rural Skill Certificate issued',
    duration: '8 Weeks',
    level: 'Beginner'
  }
];
