import {
  SolutionItem,
  EducationProgram,
  DigitalProduct,
  BlogPost,
  CareerOpening,
  OfficeLocation,
  SiteSettings,
  EducationCourse,
  HopeNestProgram,
  HopeNestUpdate,
} from '../types';

export const initialSiteSettings: SiteSettings = {
  announcementText: 'OpenFrame releases next-generation modular cloud platforms for enterprise and higher education institutions.',
  showAnnouncement: true,
  contactEmail: 'contact@openframeitsolutions.com',
  supportPhone: '+91 (080) 4123-8900',
  headquartersCity: 'Bengaluru, Karnataka, India',
};

export const initialSolutions: SolutionItem[] = [
  {
    id: 'enterprise-software',
    title: 'Enterprise Software Engineering',
    shortDesc: 'End-to-end custom business systems, automated workflows, and high-performance microservices architecture.',
    fullDesc: 'We architect and build tailored software systems that align directly with your operational objectives. From distributed microservices to centralized enterprise resource frameworks, our engineering delivers reliability, maintainability, and clean code standards.',
    iconName: 'Cpu',
    capabilities: [
      'Custom ERP & CRM Architecture',
      'Microservices & Distributed Systems',
      'High-Throughput REST & GraphQL APIs',
      'Legacy System Modernization',
      'Role-Based Enterprise Access Systems'
    ],
    deliverables: [
      'Production-Ready Enterprise Codebase',
      'System Architecture Blueprints',
      'Comprehensive API Documentation',
      'Automated Test Suites & CI/CD Pipelines'
    ],
    technologies: ['TypeScript', 'Node.js', 'Go', 'React', 'PostgreSQL', 'Docker']
  },
  {
    id: 'cloud-devops',
    title: 'Cloud Infrastructure & DevOps',
    shortDesc: 'Resilient cloud migration, container orchestration, automated delivery pipelines, and 24/7 observability.',
    fullDesc: 'Empower your systems with automated, scalable infrastructure. We deploy cloud-native configurations designed for zero-downtime deployments, high availability across multi-cloud environments, and strict network security postures.',
    iconName: 'Cloud',
    capabilities: [
      'Kubernetes & Container Orchestration',
      'Terraform Infrastructure as Code (IaC)',
      'Automated CI/CD Deployment Pipelines',
      'Cloud Cost Optimization & Monitoring',
      'Zero-Trust Network Configurations'
    ],
    deliverables: [
      'Automated Deployment Workflows',
      'Secure Cloud VPC & Subnet Configurations',
      'Centralized Log & Metric Dashboards',
      'Disaster Recovery Protocols'
    ],
    technologies: ['AWS', 'Google Cloud', 'Kubernetes', 'Terraform', 'Prometheus', 'Grafana']
  },
  {
    id: 'web-mobile-platforms',
    title: 'Web & Mobile Digital Platforms',
    shortDesc: 'Fluid, cross-platform mobile apps and high-responsiveness web portals engineered for scale.',
    fullDesc: 'Deliver seamless user experiences across devices with modern web and mobile frameworks. We engineer robust progressive web applications and native cross-platform mobile software optimized for performance and security.',
    iconName: 'Smartphone',
    capabilities: [
      'Progressive Web Applications (PWA)',
      'Cross-Platform iOS & Android Apps',
      'Real-Time Collaborative Interfaces',
      'Offline-First Data Synchronization',
      'Accessibility & WCAG Compliance'
    ],
    deliverables: [
      'Compiled Native & Web Builds',
      'Design System Component Libraries',
      'Performance Optimization Audits',
      'Security Compliance Reports'
    ],
    technologies: ['React', 'React Native', 'TypeScript', 'Tailwind CSS', 'Vite', 'Node.js']
  },
  {
    id: 'data-systems',
    title: 'Data Systems & Analytics Pipelines',
    shortDesc: 'Structured data pipelines, business intelligence dashboards, and secure relational database architectures.',
    fullDesc: 'Transform operational records into structured business intelligence. We design normalized database schemas, secure ETL data pipelines, and responsive analytics cockpits that empower operational decision making.',
    iconName: 'Database',
    capabilities: [
      'Relational & Document Database Design',
      'Automated ETL / ELT Data Pipelines',
      'Real-Time Operational Dashboards',
      'Data Warehousing & Query Optimization',
      'Data Governance & Compliance Audits'
    ],
    deliverables: [
      'Normalized Database Schemas',
      'Automated Ingestion Scripts',
      'Custom BI Dashboard Views',
      'Query Optimization Benchmark Reports'
    ],
    technologies: ['PostgreSQL', 'ClickHouse', 'Redis', 'Python', 'Apache Kafka', 'DuckDB']
  },
  {
    id: 'it-advisory',
    title: 'Technology Advisory & Architecture',
    shortDesc: 'Strategic technical roadmaps, technology stack evaluation, code quality audits, and digital transformation.',
    fullDesc: 'Independent technical guidance for executive leadership and engineering teams. We evaluate technology viability, perform deep code audits, and build phased digital transformation roadmaps tailored to organizational goals.',
    iconName: 'Compass',
    capabilities: [
      'Technology Stack Evaluation',
      'System Architecture Peer Review',
      'Code Quality & Security Vulnerability Audits',
      'Digital Transformation Strategic Roadmaps',
      'Technical Due Diligence'
    ],
    deliverables: [
      'Architecture Evaluation Dossier',
      'Risk & Vulnerability Assessment Report',
      'Phased Engineering Roadmap',
      'Recommended Technology Matrix'
    ],
    technologies: ['Enterprise Architecture', 'TOGAF', 'Threat Modeling', 'Code Governance']
  },
  {
    id: 'quality-assurance',
    title: 'Systems Quality & Security Verification',
    shortDesc: 'Automated end-to-end testing, performance load testing, regression suites, and vulnerability verification.',
    fullDesc: 'Ensure critical business applications run reliably under peak operational conditions. Our quality engineering practices cover automated end-to-end verification, load stress benchmarks, and continuous security regression checks.',
    iconName: 'ShieldCheck',
    capabilities: [
      'Automated E2E & Integration Testing',
      'Performance Stress & Load Benchmarking',
      'API Contract & Schema Testing',
      'Static Code Security Analysis',
      'Continuous Quality Gate Integration'
    ],
    deliverables: [
      'Automated Test Automation Repositories',
      'Load Testing Performance Metrics',
      'Security Verification Checklists',
      'CI/CD Gate Integration Scripts'
    ],
    technologies: ['Playwright', 'Jest', 'k6 Load Testing', 'SonarQube', 'GitHub Actions']
  }
];

export const initialEducationPrograms: EducationProgram[] = [
  {
    id: 'fullstack-software-engineering',
    title: 'Enterprise Full-Stack Software Engineering',
    level: 'Professional Diploma / Career Transition',
    duration: '24 Weeks (Intensive)',
    format: 'Hybrid / Live Interactive & Lab Practicum',
    summary: 'A comprehensive curriculum designed to prepare software engineers with production-grade skills in TypeScript, modern frontend frameworks, backend microservices, and database systems.',
    curriculum: [
      'Module 1: Advanced TypeScript & Modern JavaScript Internals',
      'Module 2: Component Architecture & State Management (React)',
      'Module 3: Server Engineering with Node.js, Express & REST/GraphQL',
      'Module 4: Relational Database Modeling & SQL with PostgreSQL',
      'Module 5: Docker Containerization, CI/CD, and Cloud Deployment',
      'Module 6: Capstone Project: Production Multi-Tenant Platform'
    ],
    targetAudience: 'Aspiring software engineers, computing graduates, and technical professionals transitioning into full-stack engineering.',
    highlights: [
      'Code reviews by practicing industry software engineers',
      'Hands-on laboratory sessions simulating corporate sprints',
      'Production deployment of real-world capstone software',
      'Comprehensive software architecture foundation'
    ]
  },
  {
    id: 'cloud-devops-mastery',
    title: 'Cloud Infrastructure & DevOps Engineering',
    level: 'Intermediate to Advanced',
    duration: '16 Weeks',
    format: 'Live Weekend Sessions & Cloud Sandbox Labs',
    summary: 'Master modern cloud deployment, infrastructure as code, Kubernetes cluster orchestration, and automated CI/CD pipelines on standard enterprise cloud environments.',
    curriculum: [
      'Module 1: Linux System Administration & Shell Automation',
      'Module 2: Containerization with Docker & Multi-Stage Builds',
      'Module 3: Kubernetes Cluster Deployment, Pods, Services & Ingress',
      'Module 4: Infrastructure as Code (IaC) with Terraform',
      'Module 5: Continuous Integration & Delivery with GitHub Actions',
      'Module 6: Enterprise Observability: Prometheus, Grafana & ELK Stack'
    ],
    targetAudience: 'Software developers, system administrators, and infrastructure engineers looking to specialize in DevOps and cloud systems.',
    highlights: [
      'Hands-on access to provisioned cloud sandbox environments',
      'Infrastructure as Code template repository creation',
      'Real-world incident simulation and troubleshooting labs',
      'Practical security and zero-trust configuration drills'
    ]
  },
  {
    id: 'data-systems-analytics',
    title: 'Applied Data Engineering & Systems Analytics',
    level: 'Professional Specialization',
    duration: '16 Weeks',
    format: 'Live Online Labs & Practical Data Projects',
    summary: 'Focused training on building scalable data ingestion pipelines, warehouse modeling, and business intelligence reporting for modern data-driven organizations.',
    curriculum: [
      'Module 1: Relational Data Modeling & Advanced SQL Optimization',
      'Module 2: Python for Data Engineering & Automated ETL Scripts',
      'Module 3: Streaming Data Architectures & Message Queues',
      'Module 4: Modern Data Warehousing & Dimensional Modeling',
      'Module 5: Building Interactive BI Dashboards & KPIs',
      'Module 6: Production Data Pipeline Deployment & Scheduling'
    ],
    targetAudience: 'Data analysts, business intelligence practitioners, and software engineers aiming to build enterprise data platforms.',
    highlights: [
      'End-to-end data pipeline construction from raw data to dashboard',
      'Performance tuning on large-scale analytical queries',
      'Real-world data schema architecture blueprints',
      'Guided mentorship on production data hygiene and governance'
    ]
  },
  {
    id: 'institutional-partnerships',
    title: 'Institutional & Academic Tech Lab Enablement',
    level: 'Institutional Curriculum Integration',
    duration: 'Semester / Multi-Year Academic Alignment',
    format: 'On-Campus Laboratory Setup & Faculty Enablement',
    summary: 'Collaborative curriculum alignment for universities and engineering colleges to equip academic laboratories with contemporary industry workflows and software development tooling.',
    curriculum: [
      'Curriculum Harmonization with Industry Engineering Practices',
      'Faculty Enablement & Contemporary Tooling Masterclasses',
      'Student Innovation Sandbox & Hackathon Organization',
      'Structured Industry Practicum & Project Evaluation Mentorship'
    ],
    targetAudience: 'Universities, polytechnics, autonomous engineering institutions, and educational consortia seeking practical technical alignment.',
    highlights: [
      'Standardized software engineering development environment setups',
      'Direct faculty professional upskilling workshops',
      'Continuous student coding challenges and guided labs',
      'Transparent academic advisory and curriculum enhancement'
    ]
  }
];

export const initialProducts: DigitalProduct[] = [
  {
    id: 'life-smart-card',
    slug: 'life-smart-card',
    name: 'Life Smart Card',
    tagline: 'Next-Generation Contactless Emergency & Identity Card',
    category: 'Smart Hardware & Identity',
    status: 'Coming Soon',
    shortDesc: 'A secure, contactless smart card delivering immediate emergency medical data, verified identity profiles, and instant guardian notifications upon tap or scan.',
    description: 'Life Smart Card bridges physical card technology with cloud-synchronized emergency records. Built with dual-interface NFC and tamper-resistant dynamic QR codes, it allows paramedics, hospital staff, or campus security to instantly access life-saving health disclosures and contact next of kin without requiring unlocked smartphones or complex apps.',
    problemSolved: 'In vehicular accidents, medical crises, or student emergencies, first responders face critical delays identifying blood groups, chronic allergies, or next-of-kin contacts when individuals are disoriented, unconscious, or have password-locked phones.',
    keyFeatures: [
      'Dual-interface NFC chip & high-contrast dynamic QR matrix',
      'Zero battery or charging requirement with durable, waterproof polycarbonate card',
      'Instant SMS / WhatsApp notification to emergency contacts when card is tapped or scanned',
      'Granular privacy controls: emergency medical data visible to anyone; comprehensive records PIN-protected',
      'Cloud-synchronized profile updates with instant lost-card remote kill switch'
    ],
    benefits: [
      'Saves critical minutes during golden-hour medical emergencies',
      'Works seamlessly with any standard NFC-enabled or camera-equipped smartphone',
      'Affordable, non-intrusive personal safety assurance for schools, elders, and commuters',
      'Centralized institutional administration for schools, fleets, and corporate teams'
    ],
    howItWorks: [
      { step: 1, title: 'Profile Setup & Card Linking', description: 'Create your secure account, specify emergency contacts, blood group, medical alerts, and pair your unique physical card.' },
      { step: 2, title: 'Instant Tap or Scan in Emergency', description: 'In any critical situation, first responders simply tap the NFC card against any smartphone or scan the printed QR code.' },
      { step: 3, title: 'Instant Medical View & Guardian Alert', description: 'Vital medical guidelines display immediately on screen while automated geo-tagged alerts dispatch to family guardians.' }
    ],
    targetUsers: [
      'School & college students',
      'Senior citizens & patients with chronic conditions',
      'Motorists, delivery executives & daily commuters',
      'Industrial site workers & logistics personnel'
    ],
    intendedUsers: 'Students, senior citizens, motorists, and industrial workforces',
    faqs: [
      { question: 'Does the Life Smart Card require battery or charging?', answer: 'No. The card utilizes passive NFC induction and optical QR technology, requiring no batteries, cords, or periodic recharging.' },
      { question: 'What happens if my Life Smart Card is lost or stolen?', answer: 'You can immediately log in to your OpenFrame dashboard and lock the card with a single click, preventing any further data access, and order a linked replacement.' },
      { question: 'Is my personal health information publicly exposed?', answer: 'No. You have absolute control. Only vital first-aid details (such as blood group, critical allergies, and emergency phone numbers) are visible on scan. Comprehensive medical documents require your secure PIN.' },
      { question: 'Can educational institutions or enterprises issue cards in bulk?', answer: 'Yes. OpenFrame offers an institutional onboarding portal where schools, universities, and corporate fleets can batch-provision cards for their entire student or employee base.' }
    ],
    modules: ['Emergency Medical Directory', 'NFC / Dynamic QR Pairing', 'Guardian Emergency Alerts', 'Card Deactivation Switch'],
    idealFor: 'Schools, colleges, families with elderly members, fleet operators, and industrial enterprises.'
  },
  {
    id: 'studynotepro',
    slug: 'studynotepro',
    name: 'StudyNotePro',
    tagline: 'Intelligent Academic Notebook & Exam Revision Companion',
    category: 'EdTech & Student Productivity',
    status: 'Available',
    shortDesc: 'A structured digital note-taking and revision workspace enabling students to organize course materials, generate flashcards, and systematically master exam syllabi.',
    description: 'StudyNotePro transforms disorganized study habits into a disciplined revision workflow. Engineered specifically for academic syllabi, it organizes class notes by subject, semester, and unit, while providing automated formula sheets, active-recall flashcard decks, and revision schedules that improve long-term retention.',
    problemSolved: 'Students frequently lose critical revision time searching through scattered physical notebooks, disjointed PDFs, and chat screenshots, leading to pre-exam anxiety and poor conceptual retention.',
    keyFeatures: [
      'Hierarchical syllabus-aligned notebook structure (Subject -> Unit -> Chapter)',
      'Active-recall flashcard generator with spaced repetition intervals',
      'Built-in LaTeX mathematical formula rendering and code block syntax highlighting',
      'Offline-first architecture with instant cross-device synchronization (Web & Tablet)',
      'Automated pre-exam summary sheets and keyword index generators'
    ],
    benefits: [
      'Reduces exam revision preparation time by over 40%',
      'Keeps complete academic history organized across semesters in one searchable cloud vault',
      'Fosters active retrieval practice rather than passive, ineffective re-reading',
      'Enables educators to publish read-only master syllabus notebooks directly to student cohorts'
    ],
    howItWorks: [
      { step: 1, title: 'Organize by Syllabus', description: 'Create subject notebooks tailored to your school board, university semester, or competitive exam syllabus.' },
      { step: 2, title: 'Capture Lectures & Highlights', description: 'Type notes, attach diagrams, write formulas with LaTeX, and highlight high-yield examination concepts.' },
      { step: 3, title: 'Revise with Active Recall', description: 'Generate interactive flashcards and timed concept quizzes with automatic spaced-repetition reminders before tests.' }
    ],
    targetUsers: [
      'High school & secondary students (Classes 9–12)',
      'Undergraduate engineering & medical aspirants',
      'University degree students',
      'Competitive exam candidates (UPSC, GATE, JEE, NEET)'
    ],
    intendedUsers: 'K-12 students, college undergraduates, and competitive exam aspirants',
    faqs: [
      { question: 'Can I access my study notes when I am offline without internet?', answer: 'Yes. StudyNotePro is built offline-first. You can view and edit your complete notes without an internet connection; changes sync automatically once you are reconnected.' },
      { question: 'Does StudyNotePro support complex mathematical formulas and diagrams?', answer: 'Yes. Full LaTeX formula rendering, chemistry equation formatting, and high-resolution diagram attachments are natively supported.' },
      { question: 'Can teachers share revision notebooks with their batches?', answer: 'Yes. Tutors and school teachers can publish verified batch notebooks that students can subscribe to for standardized class notes.' }
    ],
    modules: ['Hierarchical Subject Organizer', 'LaTeX Formula Formatter', 'Spaced-Repetition Flashcards', 'Offline Cloud Sync'],
    idealFor: 'School and college learners, self-paced certification students, and coaching batches.'
  },
  {
    id: 'learnxcel',
    slug: 'learnxcel',
    name: 'LearnXcel',
    tagline: 'Adaptive Learning Management & Practical Skill Acceleration',
    category: 'Enterprise EdTech Platform',
    status: 'Available',
    shortDesc: 'An enterprise-grade digital learning platform powering structured university coursework, live cohort training, automated coding evaluations, and competency verification.',
    description: 'LearnXcel delivers end-to-end digital pedagogy for educational institutions, corporate training centers, and skill bootcamps. Featuring role-based access for students, instructors, and deans, it combines interactive video lessons, timed lab evaluations, automated grading rubrics, and real-time student engagement analytics.',
    problemSolved: 'Traditional academic learning management portals suffer from clunky user interfaces, poor mobile responsiveness, low course completion rates, and an absence of hands-on coding and assessment sandboxes.',
    keyFeatures: [
      'Interactive curriculum pacing with video, PDF, and live webinar integrations',
      'Automated coding lab sandbox supporting Python, JavaScript, Java, and C++',
      'Comprehensive faculty gradebook with assignment submission and audit logs',
      'Institutional dean analytics tracking cohort drop-off rates and completion timelines',
      'OpenFrame Course Certificate generation with cryptographic verification QR'
    ],
    benefits: [
      'Dramatically elevates learner completion rates through interactive checkpoints',
      'Eliminates hundreds of hours of manual grading with automated assessment engines',
      'Equips academic universities with modern, corporate-grade technical infrastructure',
      'Multi-tenant cloud architecture that scales from 50 to 50,000+ active learners'
    ],
    howItWorks: [
      { step: 1, title: 'Curriculum Publication', description: 'Instructors structure modules, upload lecture resources, and establish assignment milestones and passing criteria.' },
      { step: 2, title: 'Interactive Learning & Lab Practicum', description: 'Students progress through lessons on mobile or desktop, completing weekly quizzes and hands-on coding challenges.' },
      { step: 3, title: 'Grading, Analytics & Certification', description: 'Automated test runners grade student work, update faculty gradebooks, and generate verified performance credentials.' }
    ],
    targetUsers: [
      'Engineering colleges & polytechnic institutions',
      'Corporate talent upskilling academies',
      'Private coaching institutes & training consortia',
      'Autonomous university departments'
    ],
    intendedUsers: 'Universities, colleges, corporate academies, and faculty instructors',
    faqs: [
      { question: 'Can LearnXcel integrate with our university student information system?', answer: 'Yes. LearnXcel includes standard REST API endpoints and CSV batch import tooling for seamless synchronization with existing college ERPs.' },
      { question: 'Does LearnXcel support coding challenges and technical labs?', answer: 'Yes. LearnXcel features an integrated browser-based coding sandbox with unit-test runners for Python, JavaScript, Java, and C++.' },
      { question: 'Can institutions host both live virtual lectures and recorded courses?', answer: 'Yes. LearnXcel accommodates live virtual classroom links, interactive webinars, and archived self-paced lecture libraries in one schedule.' }
    ],
    modules: ['Curriculum Management', 'Automated Lab Sandboxes', 'Faculty Gradebook', 'Institutional Analytics'],
    idealFor: 'Engineering colleges, skill centers, and corporate development programs.'
  },
  {
    id: 'talenthub',
    slug: 'talenthub',
    name: 'TalentHub',
    tagline: 'Campus Placement & Verified Talent Acquisition Ecosystem',
    category: 'HR Tech & Campus Placement',
    status: 'In Development',
    shortDesc: 'An integrated recruitment and placement portal connecting college placement cells, graduating candidates, and corporate recruiters through verified skill credentials.',
    description: 'TalentHub streamlines campus placement seasons and early-career recruitment. It replaces fragmented spreadsheets with verified student skill profiles, standardized online aptitude and coding assessments, automated drive eligibility filtering, and transparent interview pipeline tracking.',
    problemSolved: 'College placement officers endure severe administrative overhead managing simultaneous company placement drives, while corporate recruiters receive piles of unverified resumes with misleading skill claims.',
    keyFeatures: [
      'Standardized technical, logical reasoning, and communication assessment tests',
      'Automated eligibility filtering based on GPA, backlog history, and skill scores',
      'Campus placement drive management with multi-stage interview scheduling',
      'Corporate recruiter candidate pipeline board with verified code repositories',
      'Placement statistics dashboard tracking hiring percentages, CTC tiers, and industry distribution'
    ],
    benefits: [
      'Cuts corporate candidate shortlisting time by up to 60%',
      'Eliminates placement cell spreadsheet errors and schedule clashes',
      'Provides every graduating student an equal, meritocratic platform to showcase verified projects',
      'Equips colleges with verifiable placement track records for NIRF and NBA accreditation'
    ],
    howItWorks: [
      { step: 1, title: 'Student Profile & Benchmark Testing', description: 'Candidates build verified profiles including academic credentials, projects, and standardized aptitude/coding scores.' },
      { step: 2, title: 'Company Drive Posting & Auto-Shortlisting', description: 'Recruiters configure job criteria; eligible candidates receive instant notifications and can apply with one click.' },
      { step: 3, title: 'Interview Workflow & Offer Tracking', description: 'Placement coordinators manage interview rounds, recruiter feedback, and track final offers on a unified dashboard.' }
    ],
    targetUsers: [
      'University & college placement departments (TPOs)',
      'Corporate talent acquisition & campus hiring teams',
      'Graduating engineering, management, and degree students',
      'Skill training academies'
    ],
    intendedUsers: 'College placement cells, campus recruiters, and graduating students',
    faqs: [
      { question: 'When will TalentHub be available for college deployment?', answer: 'TalentHub is currently under active development and pilot testing with select institutional partners in Karnataka. Institutions can register early interest to join the beta cohort.' },
      { question: 'How are candidate technical skills verified?', answer: 'Through standardized proctored coding assessments, time-limited aptitude tests, and peer-reviewed project code evaluations hosted on the platform.' },
      { question: 'Can placement cells set custom eligibility rules for different companies?', answer: 'Yes. Placement officers can customize CGPA cutoffs, maximum backlogs, department filters, and minimum test scores for each visiting company.' }
    ],
    modules: ['Placement Drive Automation', 'Candidate Skill Benchmarking', 'Recruiter Pipeline Tracker', 'Accreditation Reports'],
    idealFor: 'University training & placement offices, campus recruitment teams, and graduates.'
  },
  {
    id: 'linkx',
    slug: 'linkx',
    name: 'LinkX',
    tagline: 'Smart Digital Business Card & Enterprise Institutional Directory',
    category: 'Digital Identity & Networking',
    status: 'Coming Soon',
    shortDesc: 'A modern contactless digital profile and corporate directory platform enabling one-tap contact sharing, verified executive credentials, and paperless business networking.',
    description: 'LinkX replaces disposable paper business cards with a dynamic, always-updated digital networking card. Powered by NFC hardware and dynamic QR codes, professionals can exchange contact information, corporate portfolios, social channels, and payment details with a single tap against any smartphone.',
    problemSolved: 'Over 88% of paper business cards are discarded within a week, contact details quickly become outdated after job changes or phone updates, and companies struggle to maintain cohesive corporate branding across employee business cards.',
    keyFeatures: [
      'Contactless NFC business card pairing & dynamic high-resolution QR profile',
      'One-tap direct address book saving (.vcf) with zero app download required for recipients',
      'Centralized corporate admin console to provision branded employee cards and enforce email/brand templates',
      'Granular privacy toggles: decide which phone numbers, WhatsApp, and social handles to expose',
      'Engagement analytics: track profile views, contact saves, and link click-throughs'
    ],
    benefits: [
      'Eco-friendly, 100% paperless networking that elevates corporate brand impression',
      'Always up to date: change phone numbers or job titles once, and all recipients see your new details',
      'No recipient app required: works seamlessly across all iOS and Android devices',
      'Seamless corporate integration for sales forces, leadership teams, and alumni associations'
    ],
    howItWorks: [
      { step: 1, title: 'Customize Digital Card', description: 'Select your corporate theme, add verified contact numbers, portfolio links, and company brand marks.' },
      { step: 2, title: 'Tap or Scan at Any Meeting', description: 'Tap your physical LinkX NFC card on any smartphone or share your dynamic QR code.' },
      { step: 3, title: 'Instant Contact Exchange', description: 'Your complete verified profile opens instantly in the browser; the recipient saves your contact with one tap.' }
    ],
    targetUsers: [
      'Corporate executives & sales professionals',
      'Conference attendees & business travellers',
      'Real estate, consulting, and legal practitioners',
      'University alumni associations and university faculty'
    ],
    intendedUsers: 'Business professionals, corporate sales forces, and university alumni',
    faqs: [
      { question: 'Does the other person need an app to view or save my LinkX profile?', answer: 'No. LinkX profiles open instantly in any standard mobile browser (Chrome, Safari, etc.) with a single tap or QR scan. The recipient can download your verified contact (.vcf) directly into their smartphone contacts with one click.' },
      { question: 'Can our company deploy LinkX across our entire sales and executive team?', answer: 'Yes. LinkX Enterprise provides a centralized administrative console where company administrators can enforce branding, assign employee subdomains, and instantly update contact cards when employees change roles.' },
      { question: 'Can I choose which contact information is publicly visible?', answer: 'Yes. You have granular privacy control to display or hide personal mobile numbers, WhatsApp links, LinkedIn, or corporate portfolios at any time.' }
    ],
    modules: ['NFC Profile Linking', 'Instant vCard Download', 'Corporate Brand Enforcement', 'Networking Analytics'],
    idealFor: 'Enterprise sales teams, startup founders, alumni associations, and consultants.'
  },
  {
    id: 'openframe-core-erp',
    slug: 'core-erp',
    name: 'OpenFrame CoreERP',
    tagline: 'Modular Business Operations & Resource Planning',
    category: 'Enterprise SaaS',
    status: 'Available',
    shortDesc: 'A modular cloud ERP platform consolidating inventory, billing, procurement, payroll, and asset management in one unified system.',
    description: 'An enterprise-grade, modular web platform designed for small-to-mid enterprises to consolidate inventory, billing, procurement, payroll, and asset management in one unified system.',
    problemSolved: 'Mid-sized businesses run into data silos and operational lag when managing separate tools for accounting, inventory, and staff management.',
    keyFeatures: [
      'Financial Accounting & GST Invoicing',
      'Inventory & Multi-Warehouse Tracking',
      'Procurement & Vendor Evaluation Management',
      'Human Resources & Biometric Attendance Sync',
      'Role-Based Granular Access Control'
    ],
    benefits: [
      'Single pane of glass across multi-branch enterprise operations',
      'Audited financial workflows meeting statutory reporting standards',
      'Scalable modular activation: enable modules as your business expands'
    ],
    howItWorks: [
      { step: 1, title: 'Data Migration & Configuration', description: 'Import charts of accounts, vendors, products, and employee rosters into secure cloud databases.' },
      { step: 2, title: 'Role Provisioning', description: 'Assign granular department permissions for billing clerks, warehouse managers, and accountants.' },
      { step: 3, title: 'Unified Daily Operations', description: 'Generate invoices, reconcile inventory movements, and export executive financial summaries in real-time.' }
    ],
    targetUsers: ['Manufacturing firms', 'Wholesale distributors', 'Supply chain operators', 'Mid-market trading businesses'],
    intendedUsers: 'Manufacturing firms, trading enterprises, distributors, and growing mid-market companies',
    faqs: [
      { question: 'Can CoreERP be hosted on our on-premise servers?', answer: 'Yes. OpenFrame provides both managed private cloud deployment and on-premise containerized setups for strict data sovereignty requirements.' },
      { question: 'Does it support Indian GST and e-way billing?', answer: 'Yes. CoreERP generates GST-compliant tax invoices, GSTR summary reconciliation reports, and JSON payload exports.' }
    ],
    modules: ['Financial Accounting', 'Inventory Tracking', 'Vendor Procurement', 'HR Management'],
    idealFor: 'Manufacturing firms, trading enterprises, distributors, and growing mid-market service companies.'
  }
];

export const initialBlogPosts: BlogPost[] = [
  {
    id: 'post-tech-1',
    slug: 'architecting-resilient-enterprise-systems-2026',
    title: 'Architecting Resilient Enterprise Systems in 2026: Design Patterns for Scale',
    category: 'Technology',
    publishedDate: '2026-11-02',
    createdDate: '2026-10-28',
    updatedDate: '2026-11-02',
    readTime: '6 min read',
    author: 'Vikramaditya Rao',
    authorRole: 'Principal Systems Architect, OpenFrame',
    excerpt: 'Key strategies for building modern enterprise software that maintains zero-downtime reliability through defensive decoupling, circuit breakers, and disciplined data modeling.',
    shortDescription: 'Key architectural strategies for building modern enterprise software that maintains zero-downtime reliability.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'Architecting Resilient Enterprise Systems in 2026 | OpenFrame Knowledge Centre',
    seoMetaDescription: 'Discover enterprise design patterns for building zero-downtime microservices, event-driven decoupling, and fault-tolerant architectures in 2026.',
    status: 'Published',
    isFeatured: true,
    isPopular: true,
    tags: ['Architecture', 'Cloud', 'Microservices', 'Resilience'],
    content: [
      'In modern enterprise software engineering, resiliency is not merely about surviving infrastructure failures—it is about designing systems that gracefully degrade while keeping critical operational loops functional.',
      'Defensive decoupling between user-facing services and asynchronous background processing ensures that transactional operations are never bottlenecked by external dependencies or scheduled analytical jobs.',
      'By implementing circuit breakers, idempotency keys across all transactional APIs, and centralized distributed tracing, engineering teams can detect regressions long before end-users experience degradation.',
      'As organizations expand their digital footprint, prioritizing clean domain boundaries and strict contract testing yields faster release velocities and significantly reduced technical debt over multi-year horizons.',
      'At OpenFrame, our architectural advisory emphasizes immutable infrastructure, observable health telemetry, and incremental migration strategies that avoid catastrophic rewrite cycles.'
    ]
  },
  {
    id: 'post-dev-2',
    slug: 'clean-code-and-contract-testing-in-modern-teams',
    title: 'Clean Code & Contract Testing: Maintaining Velocity in Growing Engineering Teams',
    category: 'Software Development',
    publishedDate: '2026-10-25',
    createdDate: '2026-10-20',
    updatedDate: '2026-10-25',
    readTime: '5 min read',
    author: 'Sunita Deshmukh',
    authorRole: 'Engineering Lead, OpenFrame IT Solutions',
    excerpt: 'How strict schema contracts, automated linting pipelines, and pragmatic domain-driven design prevent code rot and maintain developer velocity.',
    shortDescription: 'How strict schema contracts and pragmatic domain-driven design prevent code rot in growing engineering teams.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'Clean Code & Contract Testing in Modern Teams | OpenFrame Blog',
    seoMetaDescription: 'Learn how contract testing, TypeScript schema validation, and automated CI/CD practices maintain developer velocity as engineering teams grow.',
    status: 'Published',
    isFeatured: false,
    isPopular: true,
    tags: ['Software Development', 'TypeScript', 'Testing', 'Clean Code'],
    content: [
      'Maintaining engineering velocity across distributed product squads requires deliberate architectural hygiene rather than simply adding more developers to a codebase.',
      'Contract testing through shared interface definitions and schema validators ensures that backend API modifications never unintentionally break client interfaces or web consumers.',
      'Pairing typed contracts with automated test harnesses allows engineering teams to refactor foundational modules with total confidence.',
      'Investing in automated linting, atomic git pull requests, and continuous integration audits builds a culture of craft where code maintainability is treated as a first-class deliverable.'
    ]
  },
  {
    id: 'post-ai-3',
    slug: 'pragmatic-ai-integration-enterprise-workflows',
    title: 'Pragmatic AI Integration: Enhancing Enterprise Workflows Without Black-Box Fragility',
    category: 'Artificial Intelligence',
    publishedDate: '2026-10-18',
    createdDate: '2026-10-12',
    updatedDate: '2026-10-18',
    readTime: '7 min read',
    author: 'Karthik Narayanan',
    authorRole: 'AI & Data Platforms Lead',
    excerpt: 'A pragmatic framework for adopting generative and machine learning models in enterprise operations while enforcing strict auditing, latency SLAs, and human verification.',
    shortDescription: 'A pragmatic framework for adopting AI models in enterprise operations while enforcing strict auditing and data privacy.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'Pragmatic AI Integration in Enterprise Workflows | OpenFrame Insights',
    seoMetaDescription: 'Understand how enterprises can incorporate generative AI and machine learning tools reliably with human-in-the-loop workflows.',
    status: 'Published',
    isFeatured: true,
    isPopular: true,
    tags: ['Artificial Intelligence', 'Machine Learning', 'Enterprise AI', 'Automation'],
    content: [
      'Artificial intelligence in 2026 is shifting away from speculative chat prototypes toward purposeful, deterministic workflow enhancements embedded directly inside enterprise systems.',
      'The most successful enterprise implementations do not replace human judgment; they augment domain experts by handling unstructured document parsing, preliminary anomaly detection, and automated ticket classification.',
      'Enterprises must enforce strict boundaries: prompt engineering should be backed by deterministic schema validators, sensitive PII must never leave secure network VPCs, and every automated action requires clear rollback controls.',
      'By focusing on measurable ROI and verifiable outcomes, organizations can adopt artificial intelligence safely and sustainably.'
    ]
  },
  {
    id: 'post-dt-4',
    slug: 'modernizing-legacy-enterprise-systems-strangler-pattern',
    title: 'Modernizing Legacy Systems: Incremental Strangler Fig Patterns for Enterprises',
    category: 'Digital Transformation',
    publishedDate: '2026-10-09',
    createdDate: '2026-10-05',
    updatedDate: '2026-10-09',
    readTime: '8 min read',
    author: 'Vikramaditya Rao',
    authorRole: 'Principal Systems Architect, OpenFrame',
    excerpt: 'Why wholesale software rewrites frequently fail, and how progressive modernization through API facades and micro-frontends delivers continuous business value.',
    shortDescription: 'Why big-bang software rewrites fail and how progressive strangler modernization delivers continuous business value.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'Modernizing Legacy Systems via Strangler Pattern | OpenFrame',
    seoMetaDescription: 'Practical guide to enterprise digital transformation through progressive strangler fig architecture and API abstraction.',
    status: 'Published',
    isFeatured: false,
    isPopular: false,
    tags: ['Digital Transformation', 'Legacy Modernization', 'Cloud Migration'],
    content: [
      'Wholesale, big-bang software replacement projects remain notoriously prone to multi-year budget overruns and operational gridlock.',
      'The Strangler Fig pattern provides a proven, lower-risk alternative: engineering teams place an API gateway facade in front of legacy monoliths and carve out modular services one domain at a time.',
      'This phased methodology ensures that business stakeholders experience immediate improvements in responsiveness, while operations teams maintain continuity with zero abrupt downtime.',
      'Digital transformation succeeds when it is treated as a continuous operational habit rather than a one-off corporate spectacle.'
    ]
  },
  {
    id: 'post-edu-5',
    slug: 'beyond-memorization-project-led-pedagogy',
    title: 'Beyond Memorization: Project-Led Pedagogy and Industry Sandbox Environments',
    category: 'Education',
    publishedDate: '2026-09-29',
    createdDate: '2026-09-24',
    updatedDate: '2026-09-29',
    readTime: '5 min read',
    author: 'Dr. Archana Kulkarni',
    authorRole: 'Head of Pedagogy & Learning Design',
    excerpt: 'Examining why traditional lecture-based rote learning fails technology students, and how hands-on development sandboxes foster genuine analytical thinking.',
    shortDescription: 'Examining why hands-on development sandboxes and project-led curricula foster genuine analytical thinking.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'Project-Led Pedagogy in Modern Education | OpenFrame Education',
    seoMetaDescription: 'How OpenFrame Education structures hands-on coding labs, peer code reviews, and project-based curricula for 21st-century students.',
    status: 'Published',
    isFeatured: false,
    isPopular: true,
    tags: ['Education', 'Pedagogy', 'STEM', 'Hands-On Learning'],
    content: [
      'In a world where generative tools can write syntax on demand, memorizing programming definitions or algorithmic boilerplate is no longer sufficient for aspiring engineers.',
      'True computer science competency lies in problem decomposition, edge-case evaluation, system debugging, and understanding data trade-offs.',
      'At OpenFrame Education, our student platforms provide containerized cloud sandboxes where learners build real projects—from school management portals to dynamic e-commerce stores—under simulated team conditions.',
      'When students see their code deployed and serving real users, their intrinsic motivation and conceptual clarity skyrocket.'
    ]
  },
  {
    id: 'post-skill-6',
    slug: 'foundational-digital-literacy-grassroots-communities',
    title: 'Foundational Code Competency: What Grassroots Learners Teach Us About Tech Literacy',
    category: 'Skill Development',
    publishedDate: '2026-09-18',
    createdDate: '2026-09-15',
    updatedDate: '2026-09-18',
    readTime: '6 min read',
    author: 'Manjunath Hegde',
    authorRole: 'Community Skills Coordinator',
    excerpt: 'Lessons learned from conducting regional digital literacy and introductory coding clinics across semi-urban and rural student cohorts.',
    shortDescription: 'Lessons from conducting grassroots digital literacy and introductory programming clinics across rural student cohorts.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'Foundational Code Competency at the Grassroots | OpenFrame',
    seoMetaDescription: 'Insights into grassroots technical skill building, localized instruction, and digital empowerment in Tier-2 and rural India.',
    status: 'Published',
    isFeatured: false,
    isPopular: false,
    tags: ['Skill Development', 'Digital Literacy', 'Grassroots', 'Empowerment'],
    content: [
      'Digital literacy cannot begin with abstract syntax; it begins with agency—showing individuals how technology directly simplifies their daily livelihoods and communications.',
      'In our community workshops, teaching first-generation learners how to navigate secure web browsers, recognize online financial scams, and inspect spreadsheet tables precedes formal coding languages.',
      'Once basic operational confidence is established, transitioning to visual block logic and Python scripts feels intuitive rather than intimidating.',
      'Building digital capability across India requires localized curriculum, multilingual audio explanations, and genuine empathy from educators.'
    ]
  },
  {
    id: 'post-career-7',
    slug: 'navigating-tech-careers-t-shaped-engineer',
    title: 'Navigating Tech Careers in 2026: Developing T-Shaped Engineering Capabilities',
    category: 'Career Guidance',
    publishedDate: '2026-09-08',
    createdDate: '2026-09-02',
    updatedDate: '2026-09-08',
    readTime: '5 min read',
    author: 'Pooja Venkatesh',
    authorRole: 'Talent & Human Capital Advisory',
    excerpt: 'Why modern employers look beyond narrow language syntax to hire engineers with deep core competence paired with broad architectural curiosity.',
    shortDescription: 'Why employers prioritize T-shaped engineers with deep core competence paired with broad architectural understanding.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'Navigating Tech Careers: The T-Shaped Engineer | OpenFrame Careers',
    seoMetaDescription: 'Strategic career advice for software developers and tech graduates preparing for high-impact software engineering roles in 2026.',
    status: 'Published',
    isFeatured: false,
    isPopular: true,
    tags: ['Career Guidance', 'Engineering Careers', 'Professional Development', 'Mentorship'],
    content: [
      'The modern technology employment landscape demands more than one-dimensional specialists. High-performing engineering teams value "T-shaped" individuals.',
      'The vertical bar of the T represents deep expertise in a chosen domain—such as distributed backend systems, mobile native development, or database optimization.',
      'The horizontal bar represents broad operational fluency—understanding cloud networking basics, UX empathy, automated CI/CD pipelines, and clear written communication.',
      'Engineers who cultivate both depth and cross-functional empathy consistently lead high-impact technical initiatives throughout their careers.'
    ]
  },
  {
    id: 'post-biz-8',
    slug: 'unit-economics-first-building-sustainable-tech-ventures',
    title: 'Unit Economics First: Building Sustainable Tech Ventures in India’s Ecosystem',
    category: 'Entrepreneurship',
    publishedDate: '2026-08-28',
    createdDate: '2026-08-22',
    updatedDate: '2026-08-28',
    readTime: '6 min read',
    author: 'OpenFrame Strategy Desk',
    authorRole: 'Enterprise Innovation Advisory',
    excerpt: 'An analysis of sustainable business modeling, customer acquisition discipline, and capital efficiency for technology entrepreneurs in India.',
    shortDescription: 'Analyzing sustainable business modeling, customer acquisition discipline, and capital efficiency for tech entrepreneurs.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'Unit Economics First: Sustainable Tech Ventures | OpenFrame',
    seoMetaDescription: 'Practical entrepreneurship insights on building capital-efficient software ventures with positive gross margins and customer retention.',
    status: 'Published',
    isFeatured: false,
    isPopular: false,
    tags: ['Entrepreneurship', 'Startups', 'Unit Economics', 'Business Strategy'],
    content: [
      'The era of growth-at-all-costs vanity metrics has conclusively passed. Today, enduring software enterprises are forged on disciplined unit economics and genuine product utility.',
      'Sustainable technology ventures evaluate every feature through its contribution to customer retention, reduced churn, and positive gross margins.',
      'Early-stage founders must resist premature scaling; talking directly to your first 50 enterprise customers yields insights that no marketing spend can substitute.',
      'Focusing on organic referral loops, high software reliability, and predictable cash flows builds enterprise resilience from day one.'
    ]
  },
  {
    id: 'post-news-9',
    slug: 'openframe-expands-technical-advisory-and-education-initiatives',
    title: 'Company Update: OpenFrame Expands Technical Advisory & Education Initiatives',
    category: 'Company News',
    publishedDate: '2026-08-15',
    createdDate: '2026-08-10',
    updatedDate: '2026-08-15',
    readTime: '4 min read',
    author: 'Corporate Communications Desk',
    authorRole: 'OpenFrame IT Solutions Secretariat',
    excerpt: 'An overview of OpenFrame’s recent progress in expanding enterprise software development solutions and curriculum collaborations across Karnataka.',
    shortDescription: 'Official update on OpenFrame’s expansion of technical advisory solutions and educational curriculum collaborations.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'OpenFrame Expands Technical Advisory & Education Initiatives | News',
    seoMetaDescription: 'Official corporate news from OpenFrame IT Solutions Private Limited on enterprise development and institutional training expansion.',
    status: 'Published',
    isFeatured: false,
    isPopular: false,
    tags: ['Company News', 'Milestone', 'Corporate', 'Bengaluru'],
    content: [
      'OpenFrame IT Solutions Private Limited (CIN: U62099KA2023PTC180260) is pleased to announce the phased rollout of our next-generation software development and technical advisory frameworks.',
      'Incorporated in Karnataka and recognized under DPIIT Startup India, our enterprise division continues to engineer custom software, web platforms, and business automation systems for regional and national clients.',
      'Concurrently, the OpenFrame Education division is introducing upgraded laboratory practicum modules covering cloud engineering, Python development, and applied digital literacy for academic institutions.',
      'We remain steadfastly committed to our founding mission: Technology | Education | Innovation.'
    ]
  },
  {
    id: 'post-hn-10',
    slug: 'hopenest-foundation-field-diary-grassroots-cohorts',
    title: 'HopeNest Foundation Field Diary: Empowering Beneficiaries in Grassroots Cohorts',
    category: 'HopeNest Foundation Updates',
    publishedDate: '2026-08-01',
    createdDate: '2026-07-28',
    updatedDate: '2026-08-01',
    readTime: '5 min read',
    author: 'HopeNest Field Secretariat',
    authorRole: 'Community Outreach Wing',
    excerpt: 'A review of recent grassroots workshops, tailoring training modules under the ASHA Programme, and community animal welfare activities conducted by HopeNest.',
    shortDescription: 'Field update from HopeNest Global Foundation on recent grassroots tailoring cohorts and community activities.',
    featuredImageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80',
    seoTitle: 'HopeNest Foundation Field Diary: Grassroots Cohorts | Foundation Updates',
    seoMetaDescription: 'Field reports and activity updates from HopeNest Global Foundation’s autonomous non-profit community initiatives.',
    status: 'Published',
    isFeatured: true,
    isPopular: false,
    tags: ['HopeNest Foundation Updates', 'ASHA Programme', 'Community Welfare', 'Field Diary'],
    content: [
      'HopeNest Global Foundation, an independent Section 8 non-profit organization operating in Karnataka, continues its mission to promote inclusive literacy, women’s self-reliance, and humanitarian aid.',
      'Recent field sessions under the flagship ASHA Welfare Programme concluded hands-on workshops in machine sewing, household craft production, and basic UPI digital payment operations for women learners.',
      'Additionally, foundation volunteers coordinated community animal hydration drives and distributed study reference materials to students preparing for secondary examinations.',
      'HopeNest and OpenFrame maintain distinct legal identities, collaborating under formal institutional advisory terms to advance digital literacy and practical empowerment.'
    ]
  }
];

export const initialCareerOpenings: CareerOpening[] = [
  {
    id: 'job-1',
    title: 'Senior Full-Stack Engineer (TypeScript / Node.js / React)',
    department: 'Engineering',
    location: 'Bengaluru (Hybrid / On-site)',
    type: 'Full-Time',
    experience: '4 - 7 Years',
    description: 'We are seeking an experienced Full-Stack Engineer to lead the design and development of enterprise web applications and scalable API services for our corporate clients.',
    responsibilities: [
      'Architect robust web applications using React, TypeScript, and modern Node.js backends.',
      'Design clean RESTful and GraphQL APIs integrated with relational databases (PostgreSQL).',
      'Conduct code reviews, mentor junior developers, and enforce engineering best practices.',
      'Collaborate with product leads and technical advisors to refine technical specifications.'
    ],
    requirements: [
      'Strong proficiency in TypeScript, modern JavaScript, React, and Node.js.',
      'Deep understanding of relational database schema design, indexing, and SQL queries.',
      'Familiarity with Docker, automated CI/CD pipelines, and cloud environments (AWS/GCP).',
      'Demonstrated experience building and maintaining production web applications.'
    ],
    isActive: true
  },
  {
    id: 'job-2',
    title: 'Cloud Infrastructure & DevOps Engineer',
    department: 'Engineering',
    location: 'Bengaluru / Hyderabad',
    type: 'Full-Time',
    experience: '3 - 6 Years',
    description: 'Join our cloud engineering team to build, automate, and monitor reliable multi-tenant cloud platforms and deployment pipelines.',
    responsibilities: [
      'Manage containerized infrastructure utilizing Kubernetes and Docker.',
      'Author and maintain reusable Infrastructure as Code (IaC) modules using Terraform.',
      'Implement automated monitoring, metric alerting, and centralized logging systems.',
      'Participate in architecture reviews to optimize cloud cost, security, and uptime.'
    ],
    requirements: [
      'Hands-on experience with AWS or Google Cloud Platform in production.',
      'Proficiency in Linux administration, Bash scripting, and Git workflows.',
      'Practical experience with Kubernetes clusters, Helm charts, and CI/CD tools.',
      'Knowledge of network security protocols, SSL/TLS, and VPC configurations.'
    ],
    isActive: true
  },
  {
    id: 'job-3',
    title: 'Technical Curriculum Specialist & Lead Trainer',
    department: 'Education & Training',
    location: 'Bengaluru / Pune',
    type: 'Full-Time',
    experience: '3 - 5 Years',
    description: 'Lead the development and delivery of practical software engineering curriculum for OpenFrame Education programs and university laboratory partnerships.',
    responsibilities: [
      'Design comprehensive, lab-oriented coursework covering full-stack development and cloud tools.',
      'Conduct interactive training sessions, live coding demonstrations, and project reviews.',
      'Evaluate student project repositories and provide constructive technical feedback.',
      'Collaborate with engineering teams to keep curriculum aligned with real industry practices.'
    ],
    requirements: [
      'Strong technical background in software development (web, backend, databases).',
      'Passion for teaching, mentorship, and communicating complex technical concepts simply.',
      'Excellent verbal and written communication skills in professional English.',
      'Prior experience in software training, bootcamp instruction, or academic faculty roles.'
    ],
    isActive: true
  },
  {
    id: 'job-4',
    title: 'Technical Project Coordinator',
    department: 'Operations',
    location: 'Bengaluru',
    type: 'Full-Time',
    experience: '2 - 4 Years',
    description: 'Coordinate project milestones, client communications, and sprint deliverables across OpenFrame IT solutions and digital platform implementations.',
    responsibilities: [
      'Track project sprint deliverables, deadlines, and technical documentation.',
      'Facilitate regular communication between client stakeholders and engineering teams.',
      'Prepare structured milestone reports, meeting agendas, and release notes.',
      'Ensure prompt resolution of administrative queries and project schedule updates.'
    ],
    requirements: [
      'Experience in technical project coordination or IT business analysis.',
      'Proficiency with project tracking tools, documentation platforms, and spreadsheets.',
      'Strong organizational, multi-tasking, and professional communication skills.',
      'Familiarity with Agile and iterative software delivery methodologies.'
    ],
    isActive: true
  }
];

export const initialLocations: OfficeLocation[] = [
  {
    id: 'bengaluru-hq',
    name: 'OpenFrame Corporate Headquarters',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: 'Plot No. 42, Electronic City Phase 1, Hosur Road',
    pincode: '560100',
    phone: '+91 (080) 4123-8900',
    email: 'bengaluru@openframeitsolutions.com',
    hours: 'Monday – Friday: 9:30 AM – 6:30 PM IST',
    isHeadquarters: true,
    coordinates: { lat: 12.8452, lng: 77.6602 }
  },
  {
    id: 'hyderabad-tech-center',
    name: 'Regional Technology & Development Center',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Level 4, HITEC City Cyber Towers, Madhapur',
    pincode: '500081',
    phone: '+91 (040) 6789-2300',
    email: 'hyderabad@openframeitsolutions.com',
    hours: 'Monday – Friday: 9:30 AM – 6:30 PM IST',
    isHeadquarters: false,
    coordinates: { lat: 17.4504, lng: 78.3808 }
  },
  {
    id: 'pune-education-hub',
    name: 'Education & Institutional Practicum Hub',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'ICC Tech Park, Senapati Bapat Road, Shivajinagar',
    pincode: '411016',
    phone: '+91 (020) 2567-4400',
    email: 'pune@openframeitsolutions.com',
    hours: 'Monday – Friday: 9:30 AM – 6:30 PM IST',
    isHeadquarters: false,
    coordinates: { lat: 18.5314, lng: 73.8296 }
  }
];

export const initialEducationCourses: EducationCourse[] = [
  // 1. Academic Education
  {
    id: 'course-acad-1',
    name: 'Academic Mastery: Classes 9–10 Board Foundation',
    category: 'Academic',
    shortDesc: 'Comprehensive subject-based tuition in Mathematics and Science with structured conceptual problem-solving.',
    duration: '24 Weeks (Academic Session)',
    level: 'Beginner',
    fee: 'Batch Fee Available on Enquiry',
    isFeatured: true,
    isPopular: true,
    highlights: ['Weekly concept tests', 'Doubt clearing clinics', 'Board pattern practice sheets'],
    curriculumOutline: [
      'Algebra, Geometry and Trigonometric Applications',
      'Physics: Light, Electricity and Magnetic Effects',
      'Chemistry: Chemical Reactions, Periodic Classification',
      'Biology: Life Processes, Heredity and Ecosystems'
    ],
    learningMode: 'Live Interactive Classes & Recorded Revisions',
    certificationNote: 'OpenFrame Academic Milestone Record issued upon completion'
  },
  {
    id: 'course-acad-2',
    name: 'Primary & Middle School Foundations (Classes 1–8)',
    category: 'Academic',
    shortDesc: 'Activity-based foundation classes building strong arithmetic intuition, language fluency, and scientific curiosity.',
    duration: '16 Weeks',
    level: 'Beginner',
    fee: 'Batch Fee Available on Enquiry',
    isFeatured: false,
    isPopular: true,
    highlights: ['Fun visual worksheets', 'Bilingual explanations', 'Regular parent progress updates'],
    curriculumOutline: [
      'Foundational Number Systems & Mental Math',
      'Reading Comprehension & Grammar Essentials',
      'Introductory Natural Sciences & Environmental Studies',
      'Logical Puzzles & Spatial Reasoning'
    ],
    learningMode: 'Live Online Sessions & Worksheets',
    certificationNote: 'OpenFrame Foundation Certificate issued upon completion'
  },
  {
    id: 'course-acad-3',
    name: 'Senior Secondary Science & Commerce (Classes 11–12)',
    category: 'Academic',
    shortDesc: 'In-depth academic support for Physics, Chemistry, Mathematics, Accountancy, and Economics.',
    duration: '28 Weeks',
    level: 'Intermediate',
    fee: 'Batch Fee Available on Enquiry',
    isFeatured: true,
    isPopular: false,
    highlights: ['Subject specialist educators', 'Numerical problem-solving focus', 'Structured mock tests'],
    curriculumOutline: [
      'Calculus, Vectors, and Three-Dimensional Geometry',
      'Electrostatics, Magnetism, and Modern Physics',
      'Organic & Physical Chemistry Reaction Mechanisms',
      'Corporate Accounting Principles & Economic Analysis'
    ],
    learningMode: 'Live Online Batches & Doubt Resolution',
    certificationNote: 'OpenFrame Senior Academic Record issued upon completion'
  },

  // 2. Technology & Digital Skills
  {
    id: 'course-tech-1',
    name: 'Full-Stack Web Development (HTML, CSS, JS & React)',
    category: 'Technology',
    shortDesc: 'Hands-on programming from core web standards to responsive React components and API integration.',
    duration: '16 Weeks (Practical Labs)',
    level: 'Intermediate',
    fee: 'Contact for Batch Schedule',
    isFeatured: true,
    isPopular: true,
    highlights: ['Interactive browser sandboxes', 'Git & GitHub workflows', '3 portfolio web projects'],
    curriculumOutline: [
      'Modern HTML5 Semantic Markup & Accessibility',
      'CSS3 Flexbox, Grid, and Tailwind CSS Layouts',
      'Modern JavaScript (ES6+), DOM Manipulation & Async/Await',
      'React Components, Hooks, State, and API Fetching'
    ],
    learningMode: 'Live Classes & Hands-on Code Labs',
    certificationNote: 'OpenFrame Certificate of Course Completion issued after project evaluation'
  },
  {
    id: 'course-tech-2',
    name: 'Python Programming & Algorithmic Problem Solving',
    category: 'Technology',
    shortDesc: 'Learn Python syntax, structured data types, automation scripts, and foundational algorithmic thinking.',
    duration: '12 Weeks',
    level: 'Beginner',
    fee: 'Contact for Batch Schedule',
    isFeatured: false,
    isPopular: true,
    highlights: ['Zero-prior-coding friendly', 'Automation mini-projects', 'Weekly coding assignments'],
    curriculumOutline: [
      'Variables, Control Structures, and Functional Logic',
      'Lists, Dictionaries, Sets, and File I/O Operations',
      'Object-Oriented Programming (OOP) in Python',
      'Automating Workflows with Python Standard Library'
    ],
    learningMode: 'Live Online Labs & Code Sandboxes',
    certificationNote: 'OpenFrame Certificate of Course Completion issued after project evaluation'
  },
  {
    id: 'course-tech-3',
    name: 'Applied Artificial Intelligence & Machine Learning',
    category: 'Technology',
    shortDesc: 'Core machine learning algorithms, model training workflows, and practical generative AI integration.',
    duration: '16 Weeks',
    level: 'Advanced',
    fee: 'Contact for Batch Schedule',
    isFeatured: true,
    isPopular: false,
    highlights: ['Hands-on model training', 'Vector databases and LLM APIs', 'Real-world data capstone'],
    curriculumOutline: [
      'Linear Algebra, Probability, and NumPy/Pandas',
      'Supervised & Unsupervised Learning Architectures',
      'Deep Learning Foundations & Neural Networks',
      'Integrating Pre-Trained AI Models into Web Apps'
    ],
    learningMode: 'Live Interactive Labs & Project Sprints',
    certificationNote: 'OpenFrame Certificate of Course Completion issued after project evaluation'
  },
  {
    id: 'course-tech-4',
    name: 'Robotics & Hardware Automation Fundamentals',
    category: 'Technology',
    shortDesc: 'Sensors, microcontrollers, basic electronics, and embedded logic programming for budding hardware enthusiasts.',
    duration: '10 Weeks',
    level: 'Beginner',
    fee: 'Contact for Batch Schedule',
    isFeatured: false,
    isPopular: false,
    highlights: ['Simulated circuit boards', 'Sensor interfacing labs', 'Beginner-friendly hardware concepts'],
    curriculumOutline: [
      'Electrical Circuits, Voltage, Current, and Breadboards',
      'Microcontroller Basics (Arduino / ESP32 Simulation)',
      'Digital and Analog Sensor Integration',
      'Motor Control, Actuators, and Logic Flows'
    ],
    learningMode: 'Hybrid Live & Simulation Lab Practicum',
    certificationNote: 'OpenFrame Certificate of Course Completion issued upon capstone completion'
  },

  // 3. Professional Skills
  {
    id: 'course-prof-1',
    name: 'Business English & Executive Communication',
    category: 'Professional',
    shortDesc: 'Master corporate email drafting, confident stakeholder presentations, active listening, and articulation.',
    duration: '8 Weeks',
    level: 'All Levels',
    fee: 'Nominal Professional Fee',
    isFeatured: true,
    isPopular: true,
    highlights: ['1-on-1 speech coaching', 'Simulated corporate presentations', 'Email etiquette audits'],
    curriculumOutline: [
      'Clarity, Tone, and Grammar in Business Communication',
      'Structuring Persuasive Presentations & Deck Narratives',
      'Professional Email, Memo, and Slack/Teams Etiquette',
      'Cross-Cultural Workplace Interactions & Negotiations'
    ],
    learningMode: 'Live Interactive Practice Pods',
    certificationNote: 'OpenFrame Professional Skills Certificate issued upon assessment'
  },
  {
    id: 'course-prof-2',
    name: 'Interview Preparation & Employability Mastery',
    category: 'Professional',
    shortDesc: 'Resume architecture, behavioral interview drills, portfolio reviews, and corporate situational judgment.',
    duration: '6 Weeks',
    level: 'Intermediate',
    fee: 'Nominal Professional Fee',
    isFeatured: false,
    isPopular: true,
    highlights: ['Mock interview panels', 'Resume optimization clinic', 'LinkedIn profile positioning'],
    curriculumOutline: [
      'Crafting High-Impact ATS-Compliant Resumes',
      'STAR Method for Behavioral & Situational Questions',
      'Handling Technical & Managerial Round Discrepancies',
      'Salary Negotiation and Professional Onboarding'
    ],
    learningMode: 'Live Workshops & Mock Interview Panels',
    certificationNote: 'OpenFrame Employability Workshop Record issued'
  },
  {
    id: 'course-prof-3',
    name: 'Leadership Development & Problem Solving',
    category: 'Professional',
    shortDesc: 'Team facilitation, conflict resolution, structured root-cause analysis, and agile leadership principles.',
    duration: '8 Weeks',
    level: 'Intermediate',
    fee: 'Nominal Professional Fee',
    isFeatured: false,
    isPopular: false,
    highlights: ['Real case studies', 'Decision matrix exercises', 'Peer leadership simulations'],
    curriculumOutline: [
      'First-Principles Thinking & Root Cause Analysis',
      'Emotional Intelligence in Team Leadership',
      'Agile Frameworks and Sprint Facilitation',
      'Constructive Feedback & Conflict Management'
    ],
    learningMode: 'Interactive Executive Seminars',
    certificationNote: 'OpenFrame Leadership Workshop Record issued'
  },

  // 4. Creative Skills
  {
    id: 'course-creat-1',
    name: 'Digital Graphic Design & Visual Identity',
    category: 'Creative',
    shortDesc: 'Typography, layout theory, color harmony, and digital design tools for social, print, and UI assets.',
    duration: '10 Weeks',
    level: 'Beginner',
    fee: 'Contact for Batch Schedule',
    isFeatured: true,
    isPopular: true,
    highlights: ['Figma and design tool workflows', 'Brand asset creation', 'Portfolio showcase'],
    curriculumOutline: [
      'Design Fundamentals: Contrast, Hierarchy, Balance & Space',
      'Typography Selection and Color Theory Principles',
      'Vector Graphics, Iconography, and Digital Illustration',
      'Creating Marketing Creatives and Social Media Assets'
    ],
    learningMode: 'Live Demonstrations & Guided Design Labs',
    certificationNote: 'OpenFrame Certificate of Course Completion issued after portfolio review'
  },
  {
    id: 'course-creat-2',
    name: 'Digital Video Editing & Creative Media Production',
    category: 'Creative',
    shortDesc: 'Timeline storytelling, pacing, audio balancing, color correction, and exporting for multi-channel platforms.',
    duration: '10 Weeks',
    level: 'Intermediate',
    fee: 'Contact for Batch Schedule',
    isFeatured: false,
    isPopular: true,
    highlights: ['Raw footage editing labs', 'Audio mixing techniques', 'Short-form & long-form video exports'],
    curriculumOutline: [
      'Video Formats, Codecs, Aspect Ratios, and Project Setup',
      'Cut Types, Narrative Pacing, and Transition Principles',
      'Audio Enhancement, Voiceover Leveling & Background Music',
      'Color Grading, Title Typography, and Multi-Platform Rendering'
    ],
    learningMode: 'Hands-on Video Labs & Project Critiques',
    certificationNote: 'OpenFrame Certificate of Course Completion issued after project evaluation'
  },

  // 5. Intelligence Development
  {
    id: 'course-intel-1',
    name: 'Logical Reasoning & Aptitude Development',
    category: 'Intelligence',
    shortDesc: 'Systematic techniques for quantitative aptitude, analytical deductions, syllogisms, and pattern recognition.',
    duration: '8 Weeks',
    level: 'All Levels',
    fee: 'Nominal Batch Fee',
    isFeatured: true,
    isPopular: true,
    highlights: ['Speed-math shortcuts', 'Pattern recognition drills', 'Weekly timed aptitude tests'],
    curriculumOutline: [
      'Data Interpretation: Tables, Bar Graphs, and Pie Charts',
      'Verbal & Non-Verbal Deductive Reasoning',
      'Arithmetic Series, Permutations, and Combinations',
      'Critical Thinking and Fallacy Detection'
    ],
    learningMode: 'Live Timed Drills & Explanation Clinics',
    certificationNote: 'OpenFrame Aptitude Assessment Record issued'
  },
  {
    id: 'course-intel-2',
    name: 'Cognitive EQ & Critical Thinking Masterclass',
    category: 'Intelligence',
    shortDesc: 'Cultivating emotional intelligence, cognitive resilience, stress regulation, and structured decision making.',
    duration: '6 Weeks',
    level: 'Beginner',
    fee: 'Nominal Batch Fee',
    isFeatured: false,
    isPopular: false,
    highlights: ['Self-assessment diagnostics', 'Situational judgment drills', 'Reflective journaling guides'],
    curriculumOutline: [
      'Self-Awareness and Emotional Regulation Mechanics',
      'Cognitive Biases & Mental Models for Sound Choices',
      'Empathy, Social Perceptiveness, and Active Listening',
      'Resilience Under Pressure & Constructive Problem Reframing'
    ],
    learningMode: 'Interactive Seminars & Facilitated Discussions',
    certificationNote: 'OpenFrame Intelligence Workshop Record issued'
  },

  // 6. Business & Entrepreneurship
  {
    id: 'course-biz-1',
    name: 'Digital Marketing & Growth Fundamentals',
    category: 'Business',
    shortDesc: 'SEO essentials, search and social performance campaigns, content marketing, and conversion metrics.',
    duration: '10 Weeks',
    level: 'Beginner',
    fee: 'Contact for Batch Schedule',
    isFeatured: true,
    isPopular: true,
    highlights: ['Live ad budget simulations', 'Keyword research tooling', 'Analytics dashboard reading'],
    curriculumOutline: [
      'Search Engine Optimization (SEO) On-Page & Off-Page',
      'Paid Search Campaigns & Social Media Advertising',
      'Email Marketing Automation and Lead Nurturing',
      'Web Analytics, Conversion Tracking & ROI Measurement'
    ],
    learningMode: 'Live Interactive Masterclasses & Case Studies',
    certificationNote: 'OpenFrame Certificate of Course Completion issued after campaign assignment'
  },
  {
    id: 'course-biz-2',
    name: 'Entrepreneurship & E-commerce Fundamentals',
    category: 'Business',
    shortDesc: 'From ideation and unit economics to supplier sourcing, store setup, dropshipping basics, and customer retention.',
    duration: '8 Weeks',
    level: 'Intermediate',
    fee: 'Contact for Batch Schedule',
    isFeatured: false,
    isPopular: true,
    highlights: ['Business model canvas drills', 'Digital storefront walkthrough', 'Supply chain basics'],
    curriculumOutline: [
      'Market Opportunity Validation & Customer Discovery',
      'Unit Economics, Gross Margins, and Pricing Models',
      'Setting Up E-commerce Storefronts and Payment Gateways',
      'Inventory Logistics, Fulfillment, and Customer Service Systems'
    ],
    learningMode: 'Live Case Studies & Business Model Labs',
    certificationNote: 'OpenFrame Entrepreneurship Workshop Record issued'
  },

  // 7. STEM Education
  {
    id: 'course-stem-1',
    name: 'Junior STEM: Practical Science & Mathematics Labs',
    category: 'STEM',
    shortDesc: 'Hands-on experiments, intuitive physics models, geometry puzzles, and real-world science observations.',
    duration: '12 Weeks',
    level: 'Beginner',
    fee: 'Contact for Batch Schedule',
    isFeatured: true,
    isPopular: true,
    highlights: ['Home-friendly experiment guides', 'Visual mathematical models', 'Curiosity-led explorations'],
    curriculumOutline: [
      'Simple Machines: Levers, Pulleys, and Mechanical Advantage',
      'Light, Sound, and Wave Propagation Experiments',
      'Geometry in Architecture and Nature',
      'Scientific Method: Hypothesis, Observation, and Deduction'
    ],
    learningMode: 'Interactive Live Demos & Guided Home Labs',
    certificationNote: 'OpenFrame Junior STEM Explorer Certificate issued'
  },
  {
    id: 'course-stem-2',
    name: 'Applied Engineering & Mathematical Foundations',
    category: 'STEM',
    shortDesc: 'Bridge secondary school science with core engineering physics, structural concepts, and applied calculus.',
    duration: '14 Weeks',
    level: 'Intermediate',
    fee: 'Contact for Batch Schedule',
    isFeatured: false,
    isPopular: false,
    highlights: ['Engineering problem sets', 'Calculus applications in dynamics', 'Computer-aided models'],
    curriculumOutline: [
      'Classical Mechanics: Force Vectors, Statics & Kinematics',
      'Thermodynamics and Energy Transfer Systems',
      'Differential Equations Modeling Physical Systems',
      'Introduction to Computational Engineering Logic'
    ],
    learningMode: 'Live Problem-Solving Clinics & Conceptual Labs',
    certificationNote: 'OpenFrame Applied STEM Certificate issued upon assessment'
  }
];

export const initialHopeNestPrograms: HopeNestProgram[] = [
  {
    id: 'prog-asha',
    slug: 'asha-welfare-programme',
    title: 'ASHA Welfare Programme: Women Empowerment & Livelihood Initiative',
    category: 'Women & Livelihood',
    shortDesc: 'A flagship community programme dedicated to equipping undereducated and underprivileged women with self-reliant vocational skills, micro-enterprise training, and digital trade capability.',
    description: 'The ASHA Welfare Programme (Advancement & Skill-building for Holistic Autonomy) addresses systemic barriers faced by undereducated women and female household heads. Through hands-on modules in tailoring, artisanal crafting, retail fundamentals, digital payment handling, and government MSME registration guidance, the programme nurtures dignity, financial awareness, and sustainable household independence.',
    objectives: [
      'Equip undereducated women with market-viable tailoring, stitching, and product craft skills.',
      'Teach foundational household accounting, retail sales, and micro-inventory management.',
      'Guide participants through voluntary Udyam registration and digital payment mechanisms.',
      'Provide verified informational guidance on legitimate government-supported credit initiatives without making loan approval guarantees.',
      'Foster collective support circles and local micro-producer networks.'
    ],
    keyActivities: [
      'Tailoring, garment repair, pattern drafting, and bag-stitching workshops',
      'Artisanal crafting: handmade soaps, non-toxic floor cleaners, beeswax candles, and packaged culinary spices',
      'Small shopkeeper skills: customer handling, bookkeeping, price calculation, and shelf display',
      'Digital empowerment: QR code payments (UPI), WhatsApp Business for orders, and smartphone record-keeping',
      'Assistance with free voluntary Udyam MSME registration portals',
      'Informational seminars explaining eligibility criteria for schemes such as Pradhan Mantri Mudra Yojana (PMMY) and Stand-Up India'
    ],
    beneficiaries: 'Undereducated women, rural homemakers, single mothers, and members of informal Self-Help Groups (SHGs).',
    status: 'Active',
    iconName: 'Sparkles',
    isFlagship: true,
  },
  {
    id: 'prog-edu-support',
    slug: 'educational-support-bridge-learning',
    title: 'Academic Bridging & Student Remedial Support',
    category: 'Education & Literacy',
    shortDesc: 'Supplementary academic coaching, study materials, and subject clarification clinics for primary and secondary students from economically vulnerable households.',
    description: 'Aiming to arrest school dropout rates, this initiative operates localized weekend study hubs where students receive patient tutoring in mathematics, regional languages, science, and basic English comprehension.',
    objectives: [
      'Strengthen foundational numeracy and literacy among first-generation school-goers.',
      'Distribute essential stationery, notebooks, and learning reference kits.',
      'Provide homework assistance and concept revision in friendly community spaces.'
    ],
    keyActivities: [
      'After-school doubt clearance sessions and peer study groups',
      'Distribution of educational kits and geometry sets',
      'Parental counseling sessions emphasizing regular school attendance'
    ],
    beneficiaries: 'School students from low-income urban and rural families across Classes 1 to 10.',
    status: 'Active',
    iconName: 'BookOpen',
  },
  {
    id: 'prog-scholarships',
    slug: 'student-scholarships-aid',
    title: 'Merit-Cum-Need Student Educational Assistance',
    category: 'Education & Literacy',
    shortDesc: 'Targeted educational fee assistance and exam preparation support for promising students facing acute financial crises.',
    description: 'Provides verified direct-to-institution fee sponsorships and study resources to enable deserving students to complete higher secondary education and vocational certifications without interruption.',
    objectives: [
      'Prevent talented students from discontinuing education due to sudden familial hardship.',
      'Sponsor textbook packages, board examination fees, and reference materials.',
      'Deliver academic mentorship to guide career pathway selections.'
    ],
    keyActivities: [
      'Transparent background verification and home assessment interviews',
      'Direct disbursement of examination and laboratory fees to partner educational trusts',
      'Quarterly mentor check-ins tracking student academic progress'
    ],
    beneficiaries: 'Meritorious students enrolled in government and aided schools facing economic constraints.',
    status: 'Active',
    iconName: 'GraduationCap',
  },
  {
    id: 'prog-digital-lit',
    slug: 'grassroots-digital-literacy',
    title: 'Grassroots Digital Literacy & Cyber Safety Clinics',
    category: 'Skill Development',
    shortDesc: 'Basic computer operation, smartphone utility, digital transaction safety, and online grievance portal guidance for community members.',
    description: 'Demystifying technology for citizens who have never used a computer. Participants learn mouse-and-keyboard operation, digital document preservation, online utility bill payments, and recognizing digital frauds.',
    objectives: [
      'Impart essential digital confidence to rural youth and non-technical community adults.',
      'Educate participants on cybersecurity hygiene, phishing avoidance, and OTP safety.',
      'Teach effective utilization of e-governance service kiosks.'
    ],
    keyActivities: [
      'Hands-on laptop and desktop operational training in partner community halls',
      'Cyber-fraud prevention simulations and telephone scam awareness workshops',
      'Assistance in downloading and securely navigating government DigiLocker services'
    ],
    beneficiaries: 'First-time computer learners, rural youth, small vendors, and senior citizens.',
    status: 'Active',
    iconName: 'Laptop',
  },
  {
    id: 'prog-vocational',
    slug: 'vocational-training-livelihoods',
    title: 'Vocational Training & Local Livelihood Skills',
    category: 'Skill Development',
    shortDesc: 'Short-term practical trade workshops in electric repair, plumbing maintenance, computer data entry, and mobile servicing.',
    description: 'Focussed on young adults seeking immediate livelihood opportunities, this initiative delivers practical, hand-tool intensive training modules that build entry-level technical competencies.',
    objectives: [
      'Enhance employability through localized mechanical, electrical, and technical trades.',
      'Promote safety practices and tool discipline.',
      'Facilitate apprenticeship linkages with certified local trade practitioners.'
    ],
    keyActivities: [
      'Appliance diagnosis and minor electrical repairs training',
      'Data entry, spreadsheet formatting, and documentation preparation drills',
      'Mobile phone screen and battery replacement fundamentals'
    ],
    beneficiaries: 'Unemployed youth and school leavers seeking hands-on vocational capabilities.',
    status: 'Ongoing',
    iconName: 'Wrench',
  },
  {
    id: 'prog-women-child',
    slug: 'women-child-empowerment',
    title: 'Maternal Nutrition & Girl Child Education Support',
    category: 'Women & Livelihood',
    shortDesc: 'Nutrition counseling, menstrual hygiene awareness, sanitary product distribution drives, and girl child school retention campaigns.',
    description: 'Addressing critical health and dignity challenges among adolescent girls and young mothers, this initiative combines health education with practical hygiene access.',
    objectives: [
      'Break stigmas surrounding menstrual hygiene through respectful community conversations.',
      'Distribute bio-degradable hygiene packs to rural adolescent girls.',
      'Provide dietary awareness for pregnant and lactating women.'
    ],
    keyActivities: [
      'Hygiene education workshops led by qualified female health practitioners',
      'Free distribution of sanitary pads and personal hygiene kits',
      'Anemia awareness camps with dietary counseling on iron-rich indigenous foods'
    ],
    beneficiaries: 'Adolescent girls, young mothers, and women in rural and semi-urban localities.',
    status: 'Active',
    iconName: 'Heart',
  },
  {
    id: 'prog-health-camps',
    slug: 'preventive-healthcare-camps',
    title: 'Preventive Healthcare Awareness & Free Screening Camps',
    category: 'Health & Wellbeing',
    shortDesc: 'Periodic general health screening, vision testing, blood pressure monitoring, and health awareness in underserved settlements.',
    description: 'Partnering with licensed local physicians and volunteer medical professionals to deliver basic diagnostic screenings and medical referrals to families lacking primary healthcare access.',
    objectives: [
      'Detect common lifestyle and chronic conditions (hypertension, diabetes, vision defects) early.',
      'Provide basic over-the-counter medical supplements and prescription guidance.',
      'Educate communities on potable water handling and vector-borne illness prevention.'
    ],
    keyActivities: [
      'Free eye examinations and distribution of prescription reading glasses',
      'Blood glucose testing and vitals checkups',
      'Hygiene and clean drinking water advisory distributions'
    ],
    beneficiaries: 'Elderly community residents, daily wage earners, and vulnerable families.',
    status: 'Active',
    iconName: 'Activity',
  },
  {
    id: 'prog-mental-health',
    slug: 'mental-health-awareness',
    title: 'Community Mental Health & Emotional Wellbeing Forums',
    category: 'Health & Wellbeing',
    shortDesc: 'Destigmatizing mental health, adolescent stress management, exam anxiety counseling, and empathetic listening circles.',
    description: 'Creating safe, non-judgmental community spaces where students, parents, and working youth can learn coping strategies for anxiety, burnout, domestic stress, and examination pressure.',
    objectives: [
      'Normalise seeking professional emotional counseling without societal shame.',
      'Equip educators and parents with tools to recognize signs of adolescent depression.',
      'Teach breathing, mindfulness, and healthy communication methods.'
    ],
    keyActivities: [
      'Interactive student workshops on overcoming academic anxiety and peer pressure',
      'Parenting seminars on supportive domestic environments',
      'Distribution of multilingual self-help brochures and verified crisis helpline directory'
    ],
    beneficiaries: 'Secondary school students, competitive exam aspirants, and parents.',
    status: 'Active',
    iconName: 'Brain',
  },
  {
    id: 'prog-environment',
    slug: 'environmental-conservation-drives',
    title: 'Environmental Protection, Tree Drives & Cleanliness',
    category: 'Environment & Relief',
    shortDesc: 'Community sapling plantation, native biodiversity preservation, plastic waste collection drives, and rainwater harvesting awareness.',
    description: 'Mobilizing community volunteers, youth clubs, and schools to champion local ecology, waste segregation at source, and conservation of urban green cover.',
    objectives: [
      'Increase native shade and fruit tree canopy in community spaces.',
      'Discourage single-use plastics through cloth bag swap campaigns.',
      'Educate households on simple composting and greywater reuse.'
    ],
    keyActivities: [
      'Native tree planting drives in school grounds and public community verges',
      'Cleanliness shramdaan drives in neighborhood parks and public paths',
      'Workshops on solid waste segregation and household vermicomposting'
    ],
    beneficiaries: 'Local neighborhoods, municipal communities, and eco-club student volunteers.',
    status: 'Active',
    iconName: 'TreePine',
  },
  {
    id: 'prog-disaster-relief',
    slug: 'community-disaster-relief',
    title: 'Community Disaster Relief & Emergency Humanitarian Aid',
    category: 'Environment & Relief',
    shortDesc: 'Rapid response distribution of food kits, clean drinking water, blankets, and temporary relief materials during natural calamities.',
    description: 'A standby volunteer network prepared to collaborate with local administrative bodies during urban flooding, severe water scarcity, or seasonal emergencies to distribute essential relief kits.',
    objectives: [
      'Deliver immediate humanitarian aid to stranded and displaced families.',
      'Coordinate volunteer rescue and supply logistics with civil authorities.',
      'Assist in post-calamity clean-up and sanitation material distribution.'
    ],
    keyActivities: [
      'Dry ration kit packaging and organized distribution in affected pockets',
      'Emergency distribution of halogen water purification tablets and clean water barrels',
      'Temporary tarpaulin and warm bedding assistance for displaced residents'
    ],
    beneficiaries: 'Families and daily wage earners impacted by severe weather events or local disasters.',
    status: 'Ongoing',
    iconName: 'ShieldAlert',
  },
  {
    id: 'prog-animal-welfare',
    slug: 'community-animal-welfare',
    title: 'Community Animal Care, Water Bowls & Compassion Drives',
    category: 'Community Welfare',
    shortDesc: 'Summer water bowl placement, reflective collars for community dogs, basic first aid, and feeding awareness.',
    description: 'Encouraging peaceful coexistence and compassionate care towards stray animals through community feeding spots, reflective safety collars, and summer hydration points.',
    objectives: [
      'Prevent vehicle collisions involving community animals during night hours.',
      'Provide clean drinking water bowls across localities during peak summer months.',
      'Promote anti-rabies vaccination awareness among residents.'
    ],
    keyActivities: [
      'Placement and maintenance of terracotta water bowls across neighborhoods',
      'Fitting non-choking reflective collars on street dogs to reduce road accidents',
      'Educational sessions in schools fostering kindness toward all living creatures'
    ],
    beneficiaries: 'Community animals and civic neighborhoods fostering animal harmony.',
    status: 'Active',
    iconName: 'PawPrint',
  },
  {
    id: 'prog-community-welfare',
    slug: 'inclusive-community-welfare',
    title: 'Senior Citizen Support & Barrier-Free Accessibility',
    category: 'Community Welfare',
    shortDesc: 'Assistance for elder citizens with banking paperwork, mobility aids distribution, and inclusive barrier-free community spaces.',
    description: 'Dedicated to elderly community members and individuals with mobility impairments, providing compassionate companionship, assistive walking aids, and assistance navigating official documentation.',
    objectives: [
      'Reduce social isolation among vulnerable elderly citizens.',
      'Facilitate distribution of walking canes, crutches, and mobility accessories.',
      'Support senior citizens with pension paperwork and Aadhaar verification visits.'
    ],
    keyActivities: [
      'Volunteer home-visit schedules and digital literacy assistance for senior citizens',
      'Distribution of verified assistive mobility accessories to beneficiaries',
      'Coordination of legal aid and pension grievance assistance desks'
    ],
    beneficiaries: 'Elderly citizens, persons with mobility challenges, and caregivers.',
    status: 'Active',
    iconName: 'Users',
  }
];

export const initialHopeNestUpdates: HopeNestUpdate[] = [
  {
    id: 'hnu-101',
    title: 'ASHA Programme Inaugural Tailoring & Craft Workshop Batch Completed',
    date: '2026-10-24',
    category: 'ASHA Programme',
    description: 'The foundation concluded a three-week intensive tailoring, garment finishing, and product packaging workshop for 24 women participants. Attendees acquired foundational sewing and pattern cutting skills and participated in an interactive session on UPI payment safety.',
    location: 'HopeNest Community Skill Center, Mandya District',
    status: 'Published',
  },
  {
    id: 'hnu-102',
    title: 'Summer Water Bowl & Reflective Collar Distribution Drive',
    date: '2026-10-15',
    category: 'Animal Welfare',
    description: 'Foundation volunteers distributed 120 durable earthen water bowls to local shopkeepers and residential welfare associations to provide clean hydration for birds and community animals, alongside fitting reflective collars on community dogs.',
    location: 'Bengaluru Urban Peripheral Areas',
    status: 'Published',
  },
  {
    id: 'hnu-103',
    title: 'Community Eye Checkup & Vision Correction Camp',
    date: '2026-09-28',
    category: 'Health & Wellbeing',
    description: 'Conducted a free vision screening camp in collaboration with volunteer ophthalmologists. Screened 185 elderly residents and distributed 92 complimentary reading spectacles alongside dietary counseling for diabetic eye care.',
    location: 'Rural Community Hall, Ramanagara',
    status: 'Published',
  },
  {
    id: 'hnu-104',
    title: 'Student Educational Reference Kits Distribution for Classes 9 & 10',
    date: '2026-09-12',
    category: 'Educational Support',
    description: 'Distributed 140 science and mathematics reference workbooks, geometry kits, and stationery packs to students preparing for secondary school board examinations from economically modest backgrounds.',
    location: 'Government Aided High School, Nelamangala',
    status: 'Published',
  },
  {
    id: 'hnu-105',
    title: 'Cyber Awareness & Digital Payment Safety Clinic for Small Vendors',
    date: '2026-08-30',
    category: 'Digital Literacy',
    description: 'An interactive 4-hour workshop for street vendors and vegetable stall operators covering smartphone QR codes, soundbox notifications, avoiding SMS phishing links, and reporting unauthorized financial debits.',
    location: 'Town Hall Market Association Hall',
    status: 'Published',
  }
];

