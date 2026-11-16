export interface DiscoveryFieldDefinition {
  name: string;
  domainGroup: string;
  subcategories: string[];
  querySynonyms: string[];
}

export const DISCOVERY_COURSE_MODIFIERS: string[] = [
  'Complete course',
  'Complete video course',
  'Professional training',
  'Beginner tutorial',
  'Advanced training',
  'Masterclass',
  'Full playlist',
  'Certification preparation',
  'Practical training',
  'Project-based learning',
  'Job-oriented course',
  'Diploma-level learning',
  'University-level lectures',
  'Industry training',
  'Skills development',
  'Career development',
];

export interface DiscoveryLanguageOption {
  label: string;
  isoCode: string;
  localizedTerms: string[];
}

export const DISCOVERY_LANGUAGES: DiscoveryLanguageOption[] = [
  { label: 'English', isoCode: 'en', localizedTerms: ['full course', 'complete tutorial'] },
  { label: 'Hindi', isoCode: 'hi', localizedTerms: ['hindi', 'full course in hindi', 'हिन्दी'] },
  { label: 'Kannada', isoCode: 'kn', localizedTerms: ['kannada', 'in kannada', 'ಕನ್ನಡ'] },
  { label: 'Tamil', isoCode: 'ta', localizedTerms: ['tamil', 'in tamil', 'தமிழ்'] },
  { label: 'Telugu', isoCode: 'te', localizedTerms: ['telugu', 'in telugu', 'తెలుగు'] },
  { label: 'Marathi', isoCode: 'mr', localizedTerms: ['marathi', 'in marathi', 'मराठी'] },
  { label: 'Bengali', isoCode: 'bn', localizedTerms: ['bengali', 'in bengali', 'বাংলা'] },
  { label: 'Spanish', isoCode: 'es', localizedTerms: ['espanol', 'curso completo'] },
  { label: 'French', isoCode: 'fr', localizedTerms: ['francais', 'cours complet'] },
];

export const DISCOVERY_EDUCATION_FIELDS: DiscoveryFieldDefinition[] = [
  { name: 'MBA and Business Management', domainGroup: 'Business', subcategories: ['Strategic Management', 'Operations', 'Organizational Behavior'], querySynonyms: ['MBA course', 'Business Administration'] },
  { name: 'Digital Marketing', domainGroup: 'Business', subcategories: ['SEO', 'Performance Ads', 'Content Funnels'], querySynonyms: ['Digital Marketing', 'Google Ads SEO'] },
  { name: 'Field Marketing', domainGroup: 'Business', subcategories: ['Retail Activation', 'Territory Sales', 'BTL Campaigns'], querySynonyms: ['Field Marketing', 'B2B Field Sales'] },
  { name: 'Sales Management', domainGroup: 'Business', subcategories: ['B2B Sales', 'CRM Pipelines', 'Negotiation'], querySynonyms: ['Sales Management', 'B2B Sales Training'] },
  { name: 'Entrepreneurship', domainGroup: 'Business', subcategories: ['Startup Launch', 'Venture Strategy', 'Business Models'], querySynonyms: ['Entrepreneurship', 'Startup Founders'] },
  { name: 'Artificial Intelligence', domainGroup: 'Technology', subcategories: ['Intelligent Agents', 'Generative AI', 'LLMs'], querySynonyms: ['Artificial Intelligence', 'AI Engineering'] },
  { name: 'Machine Learning', domainGroup: 'Technology', subcategories: ['Supervised Learning', 'Neural Networks', 'MLOps'], querySynonyms: ['Machine Learning', 'Scikit-learn PyTorch'] },
  { name: 'Data Science', domainGroup: 'Technology', subcategories: ['Python Data Science', 'Statistical Modeling', 'Big Data'], querySynonyms: ['Data Science', 'Pandas Analytics'] },
  { name: 'Computer Science', domainGroup: 'Technology', subcategories: ['Algorithms', 'Operating Systems', 'Computer Architecture'], querySynonyms: ['Computer Science', 'CS50 Algorithms'] },
  { name: 'Programming', domainGroup: 'Technology', subcategories: ['Python', 'Java', 'C++'], querySynonyms: ['Programming', 'Coding Bootcamp'] },
  { name: 'Web Development', domainGroup: 'Technology', subcategories: ['React & TypeScript', 'Node.js Backend', 'Full Stack'], querySynonyms: ['Web Development', 'Full Stack React Node'] },
  { name: 'App Development', domainGroup: 'Technology', subcategories: ['Android Kotlin', 'iOS Swift', 'Flutter'], querySynonyms: ['Mobile App Development', 'Flutter React Native'] },
  { name: 'Cybersecurity', domainGroup: 'Technology', subcategories: ['Network Security', 'Ethical Hacking', 'SOC Analyst'], querySynonyms: ['Cybersecurity', 'Penetration Testing'] },
  { name: 'Cloud Computing', domainGroup: 'Technology', subcategories: ['AWS', 'Microsoft Azure', 'Kubernetes & DevOps'], querySynonyms: ['Cloud Computing', 'AWS Azure GCP'] },
  { name: 'Finance', domainGroup: 'Business', subcategories: ['Corporate Finance', 'Financial Modeling', 'Valuation'], querySynonyms: ['Corporate Finance', 'Financial Analysis'] },
  { name: 'Accounting', domainGroup: 'Business', subcategories: ['Financial Accounting', 'Tally & GST', 'Auditing'], querySynonyms: ['Accounting', 'Bookkeeping Tally GST'] },
  { name: 'Banking', domainGroup: 'Business', subcategories: ['Commercial Banking', 'Credit Risk', 'FinTech'], querySynonyms: ['Banking Operations', 'Credit Risk Management'] },
  { name: 'Stock Market Education', domainGroup: 'Business', subcategories: ['Technical Analysis', 'Fundamental Analysis', 'Portfolio Strategy'], querySynonyms: ['Stock Market', 'Equity Investing Analysis'] },
  { name: 'Human Resource Management', domainGroup: 'Business', subcategories: ['HR Analytics', 'Compensation', 'Employee Relations'], querySynonyms: ['Human Resource Management', 'HR Generalist'] },
  { name: 'Recruitment', domainGroup: 'Business', subcategories: ['Talent Acquisition', 'Technical Recruiting', 'Employer Branding'], querySynonyms: ['Talent Acquisition', 'IT Recruitment Training'] },
  { name: 'Graphic Design', domainGroup: 'Creative', subcategories: ['Brand Identity', 'Photoshop & Illustrator', 'Typography'], querySynonyms: ['Graphic Design', 'Photoshop Illustrator'] },
  { name: 'UI/UX Design', domainGroup: 'Creative', subcategories: ['Figma Systems', 'User Research', 'Wireframing'], querySynonyms: ['UI UX Design', 'Figma Product Design'] },
  { name: 'Video Editing', domainGroup: 'Creative', subcategories: ['Premiere Pro', 'DaVinci Resolve', 'Color Grading'], querySynonyms: ['Video Editing', 'Premiere Pro DaVinci Resolve'] },
  { name: 'Animation', domainGroup: 'Creative', subcategories: ['2D Motion Graphics', '3D Blender', 'Character Rigging'], querySynonyms: ['3D Animation', 'Blender After Effects'] },
  { name: 'Engineering', domainGroup: 'STEM', subcategories: ['CAD/CAM', 'Systems Engineering', 'Thermodynamics'], querySynonyms: ['Engineering Lectures', 'CAD Design'] },
  { name: 'Mechanical Engineering', domainGroup: 'STEM', subcategories: ['SolidWorks', 'Fluid Mechanics', 'Manufacturing'], querySynonyms: ['Mechanical Engineering', 'Thermodynamics SolidWorks'] },
  { name: 'Civil Engineering', domainGroup: 'STEM', subcategories: ['Structural Analysis', 'AutoCAD Civil', 'Construction Tech'], querySynonyms: ['Civil Engineering', 'Structural Design AutoCAD'] },
  { name: 'Electrical Engineering', domainGroup: 'STEM', subcategories: ['Power Systems', 'Control Systems', 'Machines'], querySynonyms: ['Electrical Engineering', 'Power Systems Circuits'] },
  { name: 'Electronics', domainGroup: 'STEM', subcategories: ['Embedded Systems', 'VLSI & PCB', 'Microcontrollers'], querySynonyms: ['Electronics Engineering', 'Arduino Embedded Systems'] },
  { name: 'Robotics', domainGroup: 'STEM', subcategories: ['ROS2', 'Kinematics', 'Autonomous Navigation'], querySynonyms: ['Robotics Engineering', 'ROS Robotics'] },
  { name: 'Mathematics', domainGroup: 'Academic', subcategories: ['Linear Algebra', 'Calculus', 'Probability & Statistics'], querySynonyms: ['Mathematics', 'Linear Algebra Calculus'] },
  { name: 'Physics', domainGroup: 'Academic', subcategories: ['Classical Mechanics', 'Electromagnetism', 'Quantum Physics'], querySynonyms: ['Physics Lectures', 'Mechanics Electromagnetism'] },
  { name: 'Chemistry', domainGroup: 'Academic', subcategories: ['Organic Chemistry', 'Inorganic', 'Physical Chemistry'], querySynonyms: ['Chemistry Course', 'Organic Physical Chemistry'] },
  { name: 'Biology', domainGroup: 'Academic', subcategories: ['Molecular Biology', 'Genetics', 'Biotechnology'], querySynonyms: ['Biology', 'Genetics Cell Biology'] },
  { name: 'Healthcare', domainGroup: 'Wellbeing', subcategories: ['Hospital Administration', 'Health Informatics', 'Public Health'], querySynonyms: ['Healthcare Management', 'Public Health'] },
  { name: 'Nursing', domainGroup: 'Wellbeing', subcategories: ['Clinical Nursing', 'Critical Care', 'Patient Assessment'], querySynonyms: ['Nursing Education', 'Clinical Nursing Skills'] },
  { name: 'Medical Education', domainGroup: 'Wellbeing', subcategories: ['Anatomy & Physiology', 'Pathology', 'Pharmacology'], querySynonyms: ['Medical Education', 'Anatomy Physiology Lectures'] },
  { name: 'Pharmacy', domainGroup: 'Wellbeing', subcategories: ['Pharmacology', 'Clinical Pharmacy', 'Drug Regulatory'], querySynonyms: ['Pharmacy Course', 'Pharmacology Lectures'] },
  { name: 'Agriculture', domainGroup: 'Wellbeing', subcategories: ['Precision Farming', 'Soil Science', 'AgriTech'], querySynonyms: ['Modern Agriculture', 'Agronomy Smart Farming'] },
  { name: 'Dairy Farming', domainGroup: 'Wellbeing', subcategories: ['Dairy Herd Management', 'Milk Processing', 'Feed Nutrition'], querySynonyms: ['Dairy Farming', 'Dairy Management Training'] },
  { name: 'Animal Husbandry', domainGroup: 'Wellbeing', subcategories: ['Livestock Health', 'Poultry Management', 'Veterinary Care'], querySynonyms: ['Animal Husbandry', 'Livestock Poultry Farming'] },
  { name: 'Food Processing', domainGroup: 'Wellbeing', subcategories: ['Food Safety HACCP', 'Packaging Tech', 'Value Addition'], querySynonyms: ['Food Processing', 'Food Technology Safety'] },
  { name: 'Renewable Energy', domainGroup: 'STEM', subcategories: ['Solar PV Design', 'Wind Power', 'Battery Storage'], querySynonyms: ['Renewable Energy', 'Solar Panel Installation Design'] },
  { name: 'Teaching', domainGroup: 'Intelligence', subcategories: ['Pedagogy', 'Classroom Tech', 'Instructional Design'], querySynonyms: ['Teacher Training', 'Pedagogy Instructional Design'] },
  { name: 'Education Management', domainGroup: 'Intelligence', subcategories: ['Academic Leadership', 'LMS Governance', 'Curriculum Planning'], querySynonyms: ['Education Management', 'School Administration'] },
  { name: 'Competitive Exams', domainGroup: 'Academic', subcategories: ['Aptitude & Reasoning', 'General Studies', 'Interview Prep'], querySynonyms: ['Competitive Exam Preparation', 'Quantitative Aptitude'] },
  { name: 'UPSC', domainGroup: 'Academic', subcategories: ['UPSC CSE Prelims', 'UPSC Mains GS', 'Indian Polity & Economy'], querySynonyms: ['UPSC CSE', 'UPSC Civil Services Preparation'] },
  { name: 'KPSC', domainGroup: 'Academic', subcategories: ['KAS Prelims & Mains', 'Karnataka History & Polity', 'FDA SDA'], querySynonyms: ['KPSC KAS', 'Karnataka PSC Preparation'] },
  { name: 'SSC', domainGroup: 'Academic', subcategories: ['SSC CGL', 'SSC CHSL', 'Reasoning & Maths'], querySynonyms: ['SSC CGL', 'SSC Exam Preparation'] },
  { name: 'Banking Exams', domainGroup: 'Academic', subcategories: ['IBPS PO & Clerk', 'SBI PO', 'RBI Grade B'], querySynonyms: ['IBPS PO SBI', 'Banking Exam Preparation'] },
  { name: 'Law', domainGroup: 'Academic', subcategories: ['Constitutional Law', 'Corporate Law', 'Contract Law'], querySynonyms: ['Law Lectures', 'Constitutional Corporate Law'] },
  { name: 'Legal Studies', domainGroup: 'Academic', subcategories: ['Legal Drafting', 'IP Rights', 'Cyber Law'], querySynonyms: ['Legal Studies', 'Legal Awareness Cyber Law'] },
  { name: 'Hospitality', domainGroup: 'Business', subcategories: ['Guest Relations', 'Food & Beverage', 'Event Operations'], querySynonyms: ['Hospitality Management', 'Front Office Service'] },
  { name: 'Hotel Management', domainGroup: 'Business', subcategories: ['Culinary Arts', 'Housekeeping', 'Revenue Management'], querySynonyms: ['Hotel Management', 'Hospitality Operations'] },
  { name: 'Tourism', domainGroup: 'Business', subcategories: ['Travel Operations', 'Eco-Tourism', 'Destination Marketing'], querySynonyms: ['Tourism Management', 'Travel Agency Operations'] },
  { name: 'Logistics', domainGroup: 'Business', subcategories: ['Freight Forwarding', 'Warehouse Ops', 'Fleet Management'], querySynonyms: ['Logistics Management', 'Warehouse Operations'] },
  { name: 'Supply Chain Management', domainGroup: 'Business', subcategories: ['Procurement', 'Inventory Optimization', 'SAP SCM'], querySynonyms: ['Supply Chain Management', 'SCM Operations'] },
  { name: 'Manufacturing', domainGroup: 'STEM', subcategories: ['Lean Six Sigma', 'CNC & Automation', 'Industrial Safety'], querySynonyms: ['Manufacturing Engineering', 'Lean Manufacturing'] },
  { name: 'Quality Management', domainGroup: 'Business', subcategories: ['ISO 9001 QMS', 'Six Sigma Green Belt', 'QA Testing'], querySynonyms: ['Quality Management', 'Six Sigma ISO 9001'] },
  { name: 'Export and Import', domainGroup: 'Business', subcategories: ['International Trade', 'Customs Documentation', 'Incoterms'], querySynonyms: ['Export Import Business', 'International Trade EXIM'] },
  { name: 'E-commerce', domainGroup: 'Business', subcategories: ['Shopify & D2C', 'Marketplace Growth', 'Fulfillment'], querySynonyms: ['Ecommerce Business', 'D2C Store Growth'] },
  { name: 'Retail Management', domainGroup: 'Business', subcategories: ['Merchandising', 'Store Operations', 'POS Analytics'], querySynonyms: ['Retail Management', 'Visual Merchandising'] },
  { name: 'Communication Skills', domainGroup: 'Professional', subcategories: ['Business Writing', 'Public Speaking', 'Executive Presence'], querySynonyms: ['Communication Skills', 'Public Speaking Presentation'] },
  { name: 'Spoken English', domainGroup: 'Professional', subcategories: ['Fluency & Pronunciation', 'Grammar', 'Workplace English'], querySynonyms: ['Spoken English', 'English Speaking Course'] },
  { name: 'Foreign Languages', domainGroup: 'Academic', subcategories: ['German A1-B2', 'Japanese JLPT', 'Spanish & French'], querySynonyms: ['Learn Foreign Language', 'German Spanish Japanese'] },
  { name: 'Personal Development', domainGroup: 'Professional', subcategories: ['Time Management', 'Habit Systems', 'Critical Thinking'], querySynonyms: ['Personal Development', 'Productivity Time Management'] },
  { name: 'Leadership', domainGroup: 'Professional', subcategories: ['Team Leadership', 'Decision Making', 'Change Management'], querySynonyms: ['Leadership Training', 'Executive Management'] },
  { name: 'Project Management', domainGroup: 'Business', subcategories: ['PMP Certification', 'Agile & Scrum', 'Jira Workflows'], querySynonyms: ['Project Management', 'Agile Scrum PMP'] },
  { name: 'Digital Transformation', domainGroup: 'Technology', subcategories: ['Enterprise Automation', 'Cloud Migration', 'AI Strategy'], querySynonyms: ['Digital Transformation', 'Enterprise Innovation'] },
  { name: 'Computer Applications', domainGroup: 'Technology', subcategories: ['MS Office & Excel', 'Database Basics', 'DCA & Tally'], querySynonyms: ['Computer Applications', 'MS Excel Office Complete Course'] },
];

export const ALL_70_DISCOVERY_CATEGORY_NAMES: string[] = DISCOVERY_EDUCATION_FIELDS.map((f) => f.name);

export function getDomainGroupForField(category: string): string {
  const exact = DISCOVERY_EDUCATION_FIELDS.find(
    (f) => f.name.toLowerCase() === category.toLowerCase()
  );
  if (exact) return exact.domainGroup;
  return 'Technology';
}

export function detectEmergingSubjectsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const candidates: Array<[string, string[]]> = [
    ['Quantum Computing', ['quantum computing', 'qiskit', 'qubit']],
    ['Blockchain & Web3', ['blockchain', 'solidity', 'smart contract', 'web3']],
    ['Green Hydrogen & EV Tech', ['electric vehicle', 'ev battery', 'green hydrogen']],
    ['Prompt Engineering & AI Agents', ['prompt engineering', 'ai agent', 'langchain', 'rag']],
    ['FinTech & Digital Payments', ['fintech', 'upi', 'payment gateway']],
    ['Biotechnology & Bioinformatics', ['bioinformatics', 'crispr', 'genomics']],
    ['Drone & UAV Engineering', ['drone', 'uav', 'quadcopter']],
    ['ESG & Sustainability Reporting', ['esg', 'carbon accounting', 'sustainability']],
  ];
  const matched: string[] = [];
  for (const [label, patterns] of candidates) {
    if (patterns.some((p) => lower.includes(p))) {
      matched.push(label);
    }
  }
  return matched;
}
