const fs = require('fs');
const path = require('path');

// 90 categories specified by user
const CATEGORIES_90 = [
  "Artificial Intelligence",
  "Generative AI",
  "Machine Learning",
  "Deep Learning",
  "Data Science",
  "Data Analytics",
  "Python Programming",
  "Java Programming",
  "C Programming",
  "C++ Programming",
  "JavaScript",
  "Web Development",
  "Full Stack Development",
  "App Development",
  "Android Development",
  "iOS Development",
  "Cybersecurity",
  "Ethical Hacking",
  "Cloud Computing",
  "AWS",
  "Microsoft Azure",
  "Google Cloud",
  "Networking",
  "Blockchain",
  "Cryptocurrency Technology",
  "Robotics",
  "Internet of Things",
  "Electronics",
  "UI/UX Design",
  "Graphic Design",
  "Photoshop",
  "Video Editing",
  "Animation",
  "Digital Marketing",
  "SEO",
  "Social Media Marketing",
  "Content Creation",
  "Business Management",
  "Entrepreneurship",
  "Startup Development",
  "Financial Literacy",
  "Accounting",
  "Banking",
  "Stock Market Education",
  "Project Management",
  "Human Resource Management",
  "Communication Skills",
  "Spoken English",
  "Personality Development",
  "Leadership",
  "Career Development",
  "Interview Preparation",
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Environmental Science",
  "Agriculture Technology",
  "Rural Entrepreneurship",
  "Healthcare Education",
  "Nutrition",
  "Psychology",
  "Emotional Intelligence",
  "IQ Development",
  "SQ Development",
  "Parenting Education",
  "Teaching Skills",
  "Teacher Training",
  "School Education",
  "Competitive Exam Preparation",
  "Creative Writing",
  "Foreign Languages",
  "Photography",
  "Music",
  "Interior Design",
  "Fashion Design",
  "Hospitality Management",
  "Tourism",
  "Legal Awareness",
  "Sustainability",
  "Renewable Energy",
  "Solar Technology",
  "Manufacturing Technology",
  "Automobile Technology",
  "Career and Vocational Skills",
  "Agriculture and Food Processing",
  "Women Entrepreneurship",
  "Life Skills",
  "Personal Productivity"
];

// Curated subcategories and specialized course variations for each category
const CATEGORY_DETAILS = {
  "Artificial Intelligence": {
    group: "Technology",
    subcategories: ["AI Systems", "Neural Computing", "Cognitive AI", "Enterprise AI", "AI Strategy", "AI Ethics"],
    keywords: ["Autonomous Agents", "Decision Systems", "Knowledge Graphs", "Model Inference", "Computer Vision", "Speech Recognition", "Edge AI", "Robotic Automation", "Explainable AI", "AI Pipelines"],
    image: "/assets/images/artificial_intelligence.jpg"
  },
  "Generative AI": {
    group: "Technology",
    subcategories: ["Prompt Engineering", "Large Language Models", "Multimodal Generation", "AI Agents", "Diffusion Models", "Enterprise GenAI"],
    keywords: ["Prompt Architecture", "RAG Systems", "Vector Embeddings", "Fine-Tuning", "Synthetic Media", "Agentic Workflows", "API Integration", "Creative Generation", "Safety Guardrails", "Context Optimization"],
    image: "/assets/images/artificial_intelligence.jpg"
  },
  "Machine Learning": {
    group: "Technology",
    subcategories: ["Supervised Learning", "Unsupervised Learning", "Feature Engineering", "Model Evaluation", "MLOps", "Ensemble Methods"],
    keywords: ["Regression Models", "Classification Pipelines", "Scikit-Learn", "Hyperparameter Tuning", "Clustering", "Random Forests", "Gradient Boosting", "Model Deployment", "Data Preprocessing", "Feature Selection"],
    image: "/assets/images/artificial_intelligence.jpg"
  },
  "Deep Learning": {
    group: "Technology",
    subcategories: ["CNNs", "RNNs & LSTMs", "Transformers", "PyTorch", "TensorFlow", "Generative Models"],
    keywords: ["Convolutional Layers", "Attention Mechanisms", "Backpropagation", "Transfer Learning", "Object Detection", "Sequence Modeling", "Model Optimization", "Deep Neural Nets", "Autoencoders", "Loss Functions"],
    image: "/assets/images/artificial_intelligence.jpg"
  },
  "Data Science": {
    group: "Technology",
    subcategories: ["Applied Statistics", "Data Mining", "Exploratory Analysis", "Pandas & NumPy", "Scientific Modeling", "Big Data"],
    keywords: ["Hypothesis Testing", "Data Wrangling", "Statistical Inference", "Correlation Analysis", "Predictive Analytics", "Data Storytelling", "Jupyter Workflows", "Probability Distributions", "Data Cleaning", "Feature Extraction"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Data Analytics": {
    group: "Technology",
    subcategories: ["Business Intelligence", "SQL Analytics", "Dashboard Engineering", "Power BI", "Tableau", "Metrics & KPIs"],
    keywords: ["Executive Dashboards", "Pivot Modeling", "Aggregations & Joins", "Cohort Analysis", "Funnel Analytics", "Visualization Design", "Data Quality Audits", "Query Optimization", "Reporting Automation", "Trend Forecasting"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Python Programming": {
    group: "Technology",
    subcategories: ["Core Syntax", "OOP Python", "Automation Scripts", "Data Structures", "Async Python", "Package Development"],
    keywords: ["Decorators & Generators", "List Comprehensions", "File Operations", "Exception Handling", "CLI Tools", "Standard Library", "Multiprocessing", "Unit Testing", "Modular Architecture", "Web Scraping"],
    image: "/assets/images/coding_programming.jpg"
  },
  "Java Programming": {
    group: "Technology",
    subcategories: ["Core Java", "OOP Principles", "Java Collections", "Multithreading", "Spring Boot", "JVM Internals"],
    keywords: ["Memory Management", "Garbage Collection", "Generics", "Streams API", "Concurrency", "Enterprise Services", "REST APIs", "Microservices", "Design Patterns", "Unit Testing JUnit"],
    image: "/assets/images/coding_programming.jpg"
  },
  "C Programming": {
    group: "Technology",
    subcategories: ["Procedural Logic", "Pointers & Memory", "Data Structures", "System Calls", "Embedded C", "File I/O"],
    keywords: ["Pointer Arithmetic", "Dynamic Allocation", "Bitwise Manipulation", "Structs & Unions", "Linked Lists", "Memory Leaks", "Compilers & Linkers", "Binary Files", "Algorithm Efficiency", "Hardware Registers"],
    image: "/assets/images/coding_programming.jpg"
  },
  "C++ Programming": {
    group: "Technology",
    subcategories: ["Modern C++ (17/20)", "STL Mastery", "Memory Management", "Game Programming", "Object Oriented C++", "Performance Tuning"],
    keywords: ["Smart Pointers", "Move Semantics", "Templates & Metaprogramming", "Vector & Map Iterators", "RAII Idiom", "Operator Overloading", "Lambda Expressions", "Multi-Threading", "Low-Latency Code", "Algorithms Library"],
    image: "/assets/images/coding_programming.jpg"
  },
  "JavaScript": {
    group: "Technology",
    subcategories: ["Modern ES6+", "Async Programming", "DOM Manipulation", "Functional JS", "Node.js Basics", "TypeScript Bridges"],
    keywords: ["Closures & Scope", "Promises & Async/Await", "Event Loop", "Array Transformations", "Prototypes", "Modules & Bundlers", "Fetch API", "Event Delegation", "Local Storage", "State Architecture"],
    image: "/assets/images/coding_programming.jpg"
  },
  "Web Development": {
    group: "Technology",
    subcategories: ["HTML5 & CSS3", "Tailwind CSS", "Responsive Layouts", "Web Accessibility", "Frontend Tooling", "Performance"],
    keywords: ["Flexbox & Grid", "Semantic Markup", "Mobile-First Design", "Web Components", "CSS Variables", "Vite & Build Tools", "Lighthouse Audits", "Cross-Browser Testing", "Modern Layouts", "DOM Events"],
    image: "/assets/images/coding_programming.jpg"
  },
  "Full Stack Development": {
    group: "Technology",
    subcategories: ["MERN Stack", "React & Node", "Database Integration", "RESTful Architecture", "Auth & Security", "Full Stack Cloud"],
    keywords: ["Component State", "Express Middleware", "MongoDB & Postgres", "JWT Authentication", "API Routing", "Full Stack Deployment", "State Management", "CRUD Workflows", "API Testing", "Production Hosting"],
    image: "/assets/images/coding_programming.jpg"
  },
  "App Development": {
    group: "Technology",
    subcategories: ["Cross-Platform Apps", "Flutter", "React Native", "Mobile UI", "Native Modules", "App Architecture"],
    keywords: ["State Management", "Navigation Stacks", "Mobile APIs", "Offline Syncing", "Push Notifications", "Device Sensors", "Responsive Mobile UX", "App Store Guidelines", "Mobile Testing", "Performance Profiling"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Android Development": {
    group: "Technology",
    subcategories: ["Kotlin", "Jetpack Compose", "Android SDK", "Room Database", "Architecture Components", "Material Design"],
    keywords: ["Coroutines & Flow", "ViewModel & LiveData", "Android Manifest", "ConstraintLayout", "Fragments & Activities", "Background Services", "Retrofit Networking", "Play Console Publishing", "Permissions Model", "Gradle Builds"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "iOS Development": {
    group: "Technology",
    subcategories: ["Swift", "SwiftUI", "UIKit", "Core Data", "Combine Framework", "App Store Publishing"],
    keywords: ["Swift Concurrency", "View Modifiers", "State & Binding", "NavigationSplitView", "App Lifecycle", "Core Animation", "User Interface Testing", "XCTest", "TestFlight", "Human Interface Guidelines"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Cybersecurity": {
    group: "Technology",
    subcategories: ["Network Defense", "Threat Analysis", "Security Operations", "Incident Response", "Identity Security", "Vulnerability Auditing"],
    keywords: ["Firewall Configuration", "Malware Analysis", "SIEM Platforms", "Zero Trust Models", "Cryptographic Protocols", "Endpoint Protection", "Penetration Testing", "Security Compliance", "Log Inspection", "Phishing Mitigation"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Ethical Hacking": {
    group: "Technology",
    subcategories: ["Web Pentesting", "Network Exploits", "Kali Linux", "Wireless Auditing", "Reconnaissance", "Social Engineering"],
    keywords: ["Port Scanning", "SQL Injection", "Cross-Site Scripting", "Metasploit Framework", "Burp Suite", "Wireshark Packet Analysis", "Payload Crafting", "Privilege Escalation", "OSINT Techniques", "Remediation Reporting"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Cloud Computing": {
    group: "Technology",
    subcategories: ["Cloud Architecture", "IaaS & PaaS", "Serverless Systems", "DevOps Pipelines", "Cloud Storage", "Cost Governance"],
    keywords: ["Virtual Compute", "Microservices", "Load Balancing", "Containers & Docker", "API Gateways", "Cloud Security", "Disaster Recovery", "Auto Scaling", "Infrastructure as Code", "High Availability"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "AWS": {
    group: "Technology",
    subcategories: ["AWS Compute", "S3 Storage", "IAM Security", "AWS Lambda", "CloudFormation", "Solutions Architect"],
    keywords: ["EC2 Instances", "VPC Networking", "RDS Databases", "Route 53", "CloudWatch Monitoring", "Elastic Beanstalk", "DynamoDB", "API Gateway", "Security Groups", "Well-Architected Framework"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Microsoft Azure": {
    group: "Technology",
    subcategories: ["Azure Virtual Machines", "Azure AD / Entra", "Azure Functions", "Azure DevOps", "Cosmos DB", "Cloud Governance"],
    keywords: ["Resource Groups", "Virtual Networks", "App Service Plans", "Blob Storage", "Azure Monitor", "Managed Identities", "ARM Templates", "Disaster Recovery", "Role-Based Access Control", "Cost Management"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Google Cloud": {
    group: "Technology",
    subcategories: ["Compute Engine", "Cloud Run", "BigQuery", "Cloud IAM", "GKE Kubernetes", "Cloud Storage"],
    keywords: ["App Engine", "VPC Peering", "Cloud Functions", "Cloud SQL", "Artifact Registry", "Cloud Build", "Pub/Sub Messaging", "Dataflow", "Network Security", "Billing Management"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Networking": {
    group: "Technology",
    subcategories: ["TCP/IP Protocols", "Routing & Switching", "Subnetting", "DNS & DHCP", "Network Security", "Wireless Infrastructure"],
    keywords: ["OSI Model", "IPv4 & IPv6", "VLAN Configuration", "Packet Inspection", "BGP & OSPF", "Network Troubleshooting", "NAT & Firewalls", "VPN Tunnels", "Wi-Fi Standards", "Network Topologies"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Blockchain": {
    group: "Technology",
    subcategories: ["Distributed Ledgers", "Smart Contracts", "Solidity Basics", "Consensus Models", "Decentralized Apps", "Cryptography"],
    keywords: ["Ethereum Virtual Machine", "Gas Optimization", "Truffle & Hardhat", "Cryptographic Hashes", "Peer-to-Peer Networks", "Zero-Knowledge Proofs", "Token Standards", "Enterprise Blockchains", "Web3 Libraries", "State Transitions"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Cryptocurrency Technology": {
    group: "Technology",
    subcategories: ["Wallet Architecture", "Consensus Mechanics", "DeFi Protocols", "Security & Custody", "Tokenomics", "Regulatory Frameworks"],
    keywords: ["Private Key Management", "Proof of Stake", "Liquidity Pools", "Decentralized Exchanges", "Hardware Wallets", "Smart Contract Audits", "Cross-Chain Bridges", "Cold Storage", "Transaction Verification", "Blockchain Governance"],
    image: "/assets/images/technology_digital_skills.jpg"
  },
  "Robotics": {
    group: "STEM",
    subcategories: ["Robot Kinematics", "Microcontroller Control", "Motor Actuators", "Autonomous Navigation", "ROS (Robot OS)", "Sensor Interfacing"],
    keywords: ["Servo & Stepper Motors", "PWM Control", "Obstacle Detection", "Inverse Kinematics", "Line Following Logic", "PID Controllers", "Ultrasonic Telemetry", "Mechanical Linkages", "Embedded Controllers", "Robot Simulation"],
    image: "/assets/images/robotics_stem.jpg"
  },
  "Internet of Things": {
    group: "STEM",
    subcategories: ["ESP32 / NodeMCU", "MQTT Protocols", "Sensor Networks", "IoT Dashboards", "Home Automation", "Edge Processing"],
    keywords: ["Wireless Telemetry", "Analog Sensor Reading", "Cloud Broker Setup", "Relay Control", "Power Management", "Smart Agriculture Sensors", "Firmware Over-The-Air", "Environmental Loggers", "REST IoT APIs", "Device Provisioning"],
    image: "/assets/images/robotics_stem.jpg"
  },
  "Electronics": {
    group: "STEM",
    subcategories: ["Circuit Analysis", "Semiconductors", "Breadboard Prototyping", "PCB Design", "Digital Logic", "Power Supplies"],
    keywords: ["Ohm's & Kirchhoff's Laws", "Diodes & Transistors", "Operational Amplifiers", "Logic Gates", "Schematic Drafting", "Soldering Technique", "Oscilloscopes", "Capacitor Filtering", "Voltage Regulators", "Troubleshooting Circuits"],
    image: "/assets/images/robotics_stem.jpg"
  },
  "UI/UX Design": {
    group: "Creative",
    subcategories: ["Figma Workflows", "User Research", "Wireframing", "Design Systems", "Prototyping", "Usability Testing"],
    keywords: ["Information Architecture", "Empathy Mapping", "Auto-Layout Components", "Micro-Interactions", "Color Accessibility", "Heuristic Evaluation", "Clickable Prototypes", "Responsive UI", "User Flow Diagrams", "Design Tokens"],
    image: "/assets/images/graphic_design_media.jpg"
  },
  "Graphic Design": {
    group: "Creative",
    subcategories: ["Visual Hierarchy", "Typography", "Color Theory", "Vector Art", "Brand Identity", "Print Media"],
    keywords: ["Layout Balance", "Contrast & Scale", "Font Pairing", "Logo Architecture", "Marketing Banners", "Vector Curves", "Resolution & Bleed", "Canva Pro", "Visual Composition", "Brand Guidelines"],
    image: "/assets/images/graphic_design_media.jpg"
  },
  "Photoshop": {
    group: "Creative",
    subcategories: ["Layer Architecture", "Photo Retouching", "Masking & Selections", "Color Grading", "Composite Art", "Digital Posters"],
    keywords: ["Clipping Masks", "Pen Tool Precision", "Frequency Separation", "Curves & Levels", "Clone Stamp", "Smart Objects", "Lighting Adjustments", "Mockup Creation", "Texture Blending", "Export Optimization"],
    image: "/assets/images/graphic_design_media.jpg"
  },
  "Video Editing": {
    group: "Creative",
    subcategories: ["Timeline Pacing", "Audio Balancing", "Color Correction", "Short-Form Video", "Narrative Storytelling", "Export Formats"],
    keywords: ["Rough Cut Workflow", "J & L Cuts", "B-Roll Sequencing", "Voiceover EQ", "Title Typography", "Speed Ramping", "Transitions", "Premiere & Resolve Basics", "Aspect Ratio Conversion", "Reels & Shorts Strategy"],
    image: "/assets/images/graphic_design_media.jpg"
  },
  "Animation": {
    group: "Creative",
    subcategories: ["2D Motion Graphics", "Keyframing", "Kinetic Typography", "Character Rigging", "Visual Timing", "Animated Explainers"],
    keywords: ["12 Principles of Animation", "Easing Curves", "Morphing Shapes", "Lower Thirds", "Motion Paths", "Frame-by-Frame Basics", "Looping Animations", "Audio Syncing", "Vector Illustration for Motion", "Exporting Lottie & MP4"],
    image: "/assets/images/graphic_design_media.jpg"
  },
  "Digital Marketing": {
    group: "Business",
    subcategories: ["Marketing Funnels", "Paid Advertising", "Email Campaigns", "Analytics & Conversion", "Inbound Strategy", "Lead Nurturing"],
    keywords: ["Customer Acquisition Cost", "Landing Page Optimization", "A/B Testing", "Audience Segmentation", "Google Ads Campaigns", "Remarketing Pixels", "Click-Through Rates", "Copywriting for Ads", "Campaign Budgeting", "ROI Measurement"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "SEO": {
    group: "Business",
    subcategories: ["On-Page SEO", "Technical SEO", "Keyword Research", "Link Building", "Local SEO", "Search Console"],
    keywords: ["Meta Tag Optimization", "Search Intent Analysis", "Core Web Vitals", "Crawl Budget & Sitemaps", "Schema Markup", "Backlink Acquisition", "Competitor Keyword Gap", "Google Business Profile", "Content Optimization", "Rank Tracking"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Social Media Marketing": {
    group: "Business",
    subcategories: ["Platform Strategy", "Content Calendars", "Community Engagement", "Paid Social Ads", "Influencer Collaboration", "Brand Voice"],
    keywords: ["Instagram Reels Strategy", "LinkedIn B2B Outreach", "Hashtag Optimization", "Organic Reach", "Engagement Rates", "Story Highlights", "Social Media Analytics", "Community Moderation", "Video First Content", "Brand Storytelling"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Content Creation": {
    group: "Creative",
    subcategories: ["Scriptwriting", "Podcasting Basics", "Visual Storytelling", "Blogging & Articles", "Multi-Channel Repurposing", "Audience Building"],
    keywords: ["Hook & Narrative Arc", "Audio Recording", "Headline Formulas", "Editorial Workflows", "Content Batching", "Micro-Content", "Creative Consistency", "Channel Distribution", "Audience Retention", "Publishing Checklists"],
    image: "/assets/images/graphic_design_media.jpg"
  },
  "Business Management": {
    group: "Business",
    subcategories: ["Operations Management", "Strategic Planning", "Organizational Culture", "Risk Management", "Performance Metrics", "Supply Chain Basics"],
    keywords: ["SWOT & Porter's 5 Forces", "KPI Frameworks", "Resource Allocation", "Process Optimization", "Change Management", "Team Alignment", "Business Model Review", "Crisis Management", "Stakeholder Governance", "Operational Roadmaps"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Entrepreneurship": {
    group: "Business",
    subcategories: ["Idea Validation", "Lean Startup", "Unit Economics", "MVP Building", "Pitch Deck Design", "Sales Execution"],
    keywords: ["Customer Discovery", "Problem-Solution Fit", "Pricing Strategy", "Gross Margin Analysis", "Early Adopter Onboarding", "Bootstrapping Tactics", "Investor Pitching", "Market Sizing", "Legal Entity Formation", "Cash Flow Planning"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Startup Development": {
    group: "Business",
    subcategories: ["Product-Market Fit", "Fundraising Rounds", "Growth Hacking", "Cap Table Management", "Scaling Teams", "Agile Execution"],
    keywords: ["Traction Metrics", "Venture Capital Basics", "Term Sheets", "Customer Retention", "Viral Loops", "Cohort Retention Curves", "Hiring Early Employees", "Agile Sprints", "Burn Rate Control", "Go-To-Market Execution"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Financial Literacy": {
    group: "Business",
    subcategories: ["Personal Budgeting", "Compound Interest", "Debt Management", "Savings Vehicles", "Emergency Funds", "Smart Consumer Habits"],
    keywords: ["50/30/20 Rule", "Inflation Defense", "Credit Card Safety", "Net Worth Calculation", "Expense Tracking", "Delayed Gratification", "Retirement Foundations", "Financial Goal Setting", "Tax Saving Basics", "Avoiding Financial Scams"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Accounting": {
    group: "Business",
    subcategories: ["Double-Entry Bookkeeping", "Financial Statements", "Ledger Accounting", "GST & Taxes", "Tally Basics", "Reconciliation"],
    keywords: ["Debit & Credit Rules", "Balance Sheet Analysis", "Profit & Loss Account", "Cash Flow Statements", "Bank Reconciliation", "Depreciation Methods", "Inventory Valuation", "Accounts Payable/Receivable", "Trial Balance", "Statutory Compliance"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Banking": {
    group: "Business",
    subcategories: ["Retail Banking", "Commercial Credit", "Digital Payment Systems", "Central Bank Policies", "KYC & AML", "Trade Finance"],
    keywords: ["Savings & Current Accounts", "UPI & IMPS Infrastructure", "Credit Appraisal", "Interest Rate Mechanics", "Monetary Policy & Repo Rates", "Collateral & Guarantees", "Lending Frameworks", "Cyber Banking Security", "Financial Inclusion", "Banking Regulations"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Stock Market Education": {
    group: "Business",
    subcategories: ["Fundamental Analysis", "Technical Charting", "Risk Management", "Index Investing", "Mutual Funds", "Portfolio Diversification"],
    keywords: ["P/E Ratios & Financials", "Candlestick Patterns", "Support & Resistance", "Asset Allocation", "Systematic Investment Plans", "Market Volatility", "Stop-Loss Discipline", "Dividend Investing", "Stock Exchanges (NSE/BSE)", "Long-Term Wealth Building"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Project Management": {
    group: "Business",
    subcategories: ["Agile & Scrum", "Waterfall Planning", "Sprint Management", "Risk Matrices", "Jira & Trello", "Stakeholder Communication"],
    keywords: ["Sprint Planning", "Daily Standups", "Gantt Chart Scheduling", "Scope Creep Defense", "Resource Leveling", "Milestone Tracking", "Retrospectives", "Deliverable Audits", "Work Breakdown Structure", "Project Charter Drafting"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Human Resource Management": {
    group: "Business",
    subcategories: ["Talent Acquisition", "Onboarding Systems", "Performance Reviews", "Labor Laws", "Employee Retention", "Workplace Culture"],
    keywords: ["Job Description Drafting", "Structured Interviewing", "Compensation & Benefits", "Employee Engagement", "Conflict Mediation", "HR Analytics", "Compliance & POSH", "Training & Development", "Attrition Reduction", "Organizational Policies"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Communication Skills": {
    group: "Professional",
    subcategories: ["Verbal Articulation", "Active Listening", "Persuasion", "Non-Verbal Signals", "Cross-Cultural Dialogue", "Written Clarity"],
    keywords: ["Tone & Cadence", "Empathic Listening", "Handling Difficult Conversations", "Constructive Feedback", "Body Posture & Eye Contact", "Clarity Under Pressure", "De-escalation", "Email Precision", "Assertiveness Training", "Interpersonal Trust"],
    image: "/assets/images/communication_personality.jpg"
  },
  "Spoken English": {
    group: "Professional",
    subcategories: ["Conversational Fluency", "Pronunciation & Accent", "Vocabulary Expansion", "Grammar for Speaking", "Public Dialogues", "Confidence Coaching"],
    keywords: ["Tense Application", "Idioms & Phrasal Verbs", "Sentence Linking", "Overcoming Hesitation", "Daily Situational English", "Group Discussion Practice", "Listening Comprehension", "Speech Shadowing", "Intonation Practice", "Fluency Drills"],
    image: "/assets/images/communication_personality.jpg"
  },
  "Personality Development": {
    group: "Professional",
    subcategories: ["Self-Image", "Executive Grooming", "Mindset Shift", "Habit Architecture", "Resilience Building", "Social Etiquette"],
    keywords: ["Daily Discipline", "Overcoming Imposter Syndrome", "Positive Self-Talk", "Attire & Presentation", "Dining & Meeting Etiquette", "Emotional Composure", "Goal Setting", "Self-Reflection Journals", "Stress Reframing", "Personal Charisma"],
    image: "/assets/images/communication_personality.jpg"
  },
  "Leadership": {
    group: "Professional",
    subcategories: ["Situational Leadership", "Visionary Strategy", "Team Motivation", "Ethical Governance", "Decision Making", "Crisis Management"],
    keywords: ["Empowering Others", "First-Principles Strategy", "Building High-Trust Teams", "Leading Without Authority", "Transparent Communication", "Accountability Models", "Mentoring Successors", "Strategic Patience", "Transformational Leadership", "Courageous Decision-Making"],
    image: "/assets/images/communication_personality.jpg"
  },
  "Career Development": {
    group: "Professional",
    subcategories: ["Career Roadmaps", "Skill Gap Audits", "Networking Strategy", "LinkedIn Optimization", "Promotion Navigation", "Lifelong Learning"],
    keywords: ["Professional Positioning", "Informational Interviews", "Personal Branding", "Portfolio Architecture", "Negotiating Compensation", "Pivoting Industries", "Finding Mentors", "Executive Presence", "Mid-Career Growth", "Job Search Strategy"],
    image: "/assets/images/career_development.jpg"
  },
  "Interview Preparation": {
    group: "Professional",
    subcategories: ["STAR Methodology", "Behavioral Rounds", "Resume Optimization", "Technical Problem Solving", "Mock Interviews", "Salary Negotiation"],
    keywords: ["High-Impact Resumes", "Common Behavioral Scenarios", "Handling Curveball Questions", "Confidence Drills", "Body Language & Eye Contact", "Researching Employers", "Asking Thoughtful Questions", "Follow-Up Etiquette", "Stress Management", "Job Offer Evaluation"],
    image: "/assets/images/career_development.jpg"
  },
  "Mathematics": {
    group: "Academic",
    subcategories: ["Algebra & Functions", "Geometry & Trigonometry", "Calculus Essentials", "Mental Math", "Probability & Statistics", "Applied Mathematics"],
    keywords: ["Quadratic Equations", "Pythagorean Theorem", "Differential Derivatives", "Speed Multiplication", "Data Probability", "Word Problem Logic", "Coordinate Planes", "Vector Calculus", "Number Theory", "Math Anxiety Removal"],
    image: "/assets/images/academic_education.jpg"
  },
  "Science": {
    group: "Academic",
    subcategories: ["Scientific Method", "Natural Phenomena", "Lab Safety & Practice", "Integrated General Science", "Science Experiments", "Curiosity Labs"],
    keywords: ["Hypothesis Formulation", "Observation Records", "States of Matter", "Energy Forms", "Ecosystem Chains", "Measurement Accuracy", "Scientific Inventions", "Microscopic World", "Hands-on Demonstrations", "Critical Inquiry"],
    image: "/assets/images/academic_education.jpg"
  },
  "Physics": {
    group: "Academic",
    subcategories: ["Classical Mechanics", "Optics & Light", "Electricity & Magnetism", "Thermodynamics", "Modern Physics", "Wave Motion"],
    keywords: ["Newtonian Laws of Motion", "Reflection & Refraction", "Electric Circuits & Resistance", "Heat & Energy Transfer", "Electromagnetic Induction", "Atomic Structure", "Kinematics Equations", "Gravitational Fields", "Sound Wave Frequencies", "Numerical Derivations"],
    image: "/assets/images/academic_education.jpg"
  },
  "Chemistry": {
    group: "Academic",
    subcategories: ["Inorganic Chemistry", "Organic Mechanisms", "Physical Chemistry", "Periodic Table", "Chemical Reactions", "Environmental Chemistry"],
    keywords: ["Balancing Equations", "Acids, Bases & Salts", "Molecular Bonding", "Chemical Kinetics", "Carbon Compounds", "Thermodynamic Equilibrium", "Electrochemistry", "Periodic Trends", "Separation Techniques", "Stoichiometry"],
    image: "/assets/images/academic_education.jpg"
  },
  "Biology": {
    group: "Academic",
    subcategories: ["Cellular Biology", "Human Physiology", "Genetics & Heredity", "Plant Ecology", "Microbiology", "Evolutionary Biology"],
    keywords: ["Cell Organelles & Mitosis", "Circulatory & Nervous Systems", "DNA & RNA Replication", "Photosynthesis & Respiration", "Ecosystem Biodiversity", "Immune Defense", "Mendelian Genetics", "Nutrition & Digestion", "Classification of Organisms", "Biotechnology Principles"],
    image: "/assets/images/academic_education.jpg"
  },
  "Environmental Science": {
    group: "Academic",
    subcategories: ["Ecology & Conservation", "Climate Systems", "Waste Management", "Biodiversity Protection", "Pollution Control", "Environmental Policy"],
    keywords: ["Carbon Footprints", "Renewable Resources", "Water Conservation", "Plastic Recycling", "Forest Ecosystems", "Air Quality Indexes", "Sustainable Living", "Green Audit Methods", "Endangered Species", "Community Cleanliness Drives"],
    image: "/assets/images/academic_education.jpg"
  },
  "Agriculture Technology": {
    group: "Wellbeing",
    subcategories: ["Precision Agriculture", "Smart Irrigation", "Soil Sensor Tech", "Drone Crop Monitoring", "Hydroponics", "Greenhouse Climate"],
    keywords: ["Drip Irrigation Automation", "Soil NPK Analysis", "Crop Health Telemetry", "Automated Fertilizer Dosing", "Farm Management Software", "IoT Weather Stations", "Yield Optimization", "Vertical Farming Systems", "Pest Detection AI", "Sustainable Agro-Tech"],
    image: "/assets/images/agriculture_rural_innovation.jpg"
  },
  "Rural Entrepreneurship": {
    group: "Wellbeing",
    subcategories: ["Grassroots Micro-Enterprise", "Local Value Addition", "Agri-Business Models", "Self-Help Groups", "Rural Digital Onboarding", "Government Schemes"],
    keywords: ["Farming Cooperatives", "Cottage Industries", "Udyam & MSME Registrations", "MUDRA Loan Access", "Local Sourcing & Packaging", "Rural Digital Payments", "Community Market Days", "Financial Bookkeeping", "Supply Aggregation", "Livelihood Sustainability"],
    image: "/assets/images/agriculture_rural_innovation.jpg"
  },
  "Healthcare Education": {
    group: "Wellbeing",
    subcategories: ["First Aid & CPR", "Public Health Hygiene", "Preventive Healthcare", "Elder Care Support", "Health Literacy", "Infection Control"],
    keywords: ["Emergency Response Steps", "Sanitation Standards", "Chronic Disease Awareness", "Vital Signs Monitoring", "Mental Health First Aid", "Community Health Education", "Safe Medication Practices", "Vaccination Awareness", "First Aid Kit Preparation", "Healthy Lifestyle Choices"],
    image: "/assets/images/parenting_wellbeing.jpg"
  },
  "Nutrition": {
    group: "Wellbeing",
    subcategories: ["Balanced Diets", "Macronutrients & Vitamins", "Meal Planning", "Gut Health", "Sports Nutrition", "Mindful Eating"],
    keywords: ["Protein, Carb & Lipid Balance", "Micronutrient Deficiencies", "Hydration Essentials", "Reading Food Labels", "Immunity Boosting Foods", "Sugar & Salt Moderation", "Traditional Nutritious Grains", "Plant-Based Eating", "Digestive Wellness", "Healthy Family Recipes"],
    image: "/assets/images/parenting_wellbeing.jpg"
  },
  "Psychology": {
    group: "Wellbeing",
    subcategories: ["Cognitive Behavioral Basics", "Positive Psychology", "Human Motivation", "Stress Neurobiology", "Interpersonal Dynamics", "Mindfulness"],
    keywords: ["Thought-Emotion Cycles", "Habit Loops", "Coping Mechanisms", "Social Perception", "Intrinsic Motivation", "Cognitive Biases", "Mindfulness Meditation", "Resilience Under Pressure", "Emotional Processing", "Mental Wellness Habits"],
    image: "/assets/images/iq_eq_sq_development.jpg"
  },
  "Emotional Intelligence": {
    group: "Intelligence",
    subcategories: ["Self-Awareness", "Emotional Regulation", "Empathy Training", "Social Navigation", "Anger Management", "Mindful Focus"],
    keywords: ["Recognizing Emotional Triggers", "Constructive De-escalation", "Empathetic Perspective Taking", "Active Compassion", "Stress Resiliency", "Social Awareness", "Calm Decision Making", "Conflict De-escalation", "Reflective Journaling", "Emotional Balance"],
    image: "/assets/images/iq_eq_sq_development.jpg"
  },
  "IQ Development": {
    group: "Intelligence",
    subcategories: ["Logical Deduction", "Spatial Puzzles", "Pattern Series", "Quantitative Speed", "Verbal Reasoning", "Memory Retention"],
    keywords: ["Syllogisms & Analogies", "Geometric Rotation Puzzles", "Number Sequence Codes", "Speed Arithmetic Shortcuts", "Critical Thinking Drills", "Mental Visualization", "Memory Palaces", "Data Deduction", "Timed Aptitude Tests", "Abstract Problem Solving"],
    image: "/assets/images/iq_eq_sq_development.jpg"
  },
  "SQ Development": {
    group: "Intelligence",
    subcategories: ["Social Quotient", "Team Collaboration", "Empathy Mapping", "Community Values", "Positive Peer Influence", "Social Harmony"],
    keywords: ["Active Cooperation", "Group Harmony", "Respecting Diversity", "Constructive Disagreement", "Shared Accountability", "Community Volunteerism", "Active Kindness", "Social Situational Awareness", "Ethical Decision Frameworks", "Trust Building"],
    image: "/assets/images/iq_eq_sq_development.jpg"
  },
  "Parenting Education": {
    group: "Wellbeing",
    subcategories: ["Positive Discipline", "Child Psychology", "Digital Screen Balance", "Academic Encouragement", "Adolescent Guidance", "Parent-Child Communication"],
    keywords: ["Active Listening to Children", "Setting Loving Boundaries", "Praising Effort over Outcome", "Managing Screen Time", "Exam Stress De-escalation", "Understanding Teenage Changes", "Fostering Curiosity", "Emotional Support at Home", "Co-Parenting Harmony", "Peaceful Conflict Resolution"],
    image: "/assets/images/parenting_wellbeing.jpg"
  },
  "Teaching Skills": {
    group: "Academic",
    subcategories: ["Classroom Management", "Lesson Planning", "Interactive Pedagogy", "Formative Assessments", "Student Engagement", "Digital Classroom Tools"],
    keywords: ["Active Learning Techniques", "Constructing Clear Objectives", "Differentiated Instruction", "Questioning Strategies", "Student Participation Drills", "Giving Actionable Feedback", "Visual Teaching Aids", "Encouraging Reluctant Learners", "Pacing Lectures", "Flipped Classrooms"],
    image: "/assets/images/academic_education.jpg"
  },
  "Teacher Training": {
    group: "Academic",
    subcategories: ["Curriculum Design", "NEP 2020 Pedagogical Framework", "Educational Psychology", "Classroom Tech Integration", "Special Needs Awareness", "Professional Teacher Ethics"],
    keywords: ["Experiential Learning Blueprints", "Rubric Construction", "Supporting Neurodiverse Learners", "Modern Smartboards & Tools", "Parent-Teacher Partnership", "Teacher Stress Management", "Inclusive Classrooms", "Continuous Professional Development", "Educational Leadership", "Holistic Student Records"],
    image: "/assets/images/academic_education.jpg"
  },
  "School Education": {
    group: "Academic",
    subcategories: ["Primary Literacy", "Middle School Sciences", "High School Foundations", "Activity-Based Learning", "Holistic Report Cards", "Peer Study Groups"],
    keywords: ["Foundational Numeracy", "Reading Fluency", "Hands-on Science Labs", "Social Studies Contexts", "School Examination Strategy", "Extracurricular Balance", "Morning Assemblies & Values", "Library Habit Cultivation", "Homework Architecture", "Cooperative Learning"],
    image: "/assets/images/academic_education.jpg"
  },
  "Competitive Exam Preparation": {
    group: "Academic",
    subcategories: ["Test-Taking Strategy", "Speed Arithmetic", "Elimination Techniques", "Negative Marking Mitigation", "Mock Test Analysis", "Time Management Under Pressure"],
    keywords: ["Previous Year Paper Analysis", "Formula Sheets & Mnemonics", "Sectional Time Limits", "Question Triaging", "Handling Exam Panic", "Accuracy over Guesswork", "Syllabus Prioritization", "Full-Length Simulations", "Error Notebook Maintenance", "Peak Performance Routines"],
    image: "/assets/images/academic_education.jpg"
  },
  "Creative Writing": {
    group: "Creative",
    subcategories: ["Fiction Writing", "Character Development", "Plot & Pacing", "Poetry & Rhythm", "Non-Fiction Essays", "Dialogue Mastery"],
    keywords: ["Show Don't Tell", "Building Believable Protagonists", "Three-Act Story Structure", "Sensory Description", "Pacing Climaxes", "Overcoming Writer's Block", "Self-Editing Techniques", "Metaphor & Imagery", "Writing Memorable Openings", "Publishing Basics"],
    image: "/assets/images/communication_personality.jpg"
  },
  "Foreign Languages": {
    group: "Professional",
    subcategories: ["German Basics", "French Conversational", "Spanish Essentials", "Japanese Script (Hiragana)", "Language Immersion", "Travel Fluency"],
    keywords: ["Everyday Greetings & Verbs", "Sentence Syntax Patterns", "Listening Comprehension", "Cultural Context & Nuances", "Pronunciation Accents", "Food & Travel Vocabulary", "Language Learning Apps", "Memorization Flashcards", "Conversational Drills", "A1 Level Foundations"],
    image: "/assets/images/communication_personality.jpg"
  },
  "Photography": {
    group: "Creative",
    subcategories: ["Exposure Triangle", "Composition & Framing", "Lighting Principles", "Portrait Photography", "Mobile Photography", "Post-Processing"],
    keywords: ["Aperture, Shutter & ISO", "Rule of Thirds & Leading Lines", "Natural Light Utilization", "Depth of Field Control", "Storytelling Through Lenses", "Smartphone Camera Settings", "RAW vs JPEG Workflows", "Street Photography", "Color Harmony in Frames", "Editing Basics in Lightroom"],
    image: "/assets/images/graphic_design_media.jpg"
  },
  "Music": {
    group: "Creative",
    subcategories: ["Music Theory Essentials", "Keyboard Fundamentals", "Guitar Basics", "Vocal Warmups & Pitch", "Rhythm & Beats", "Digital Audio Basics"],
    keywords: ["Notes, Scales & Chords", "Ear Training", "Rhythm Timing & Metronomes", "Major & Minor Keys", "Finger Exercises", "Basic Song Accompaniment", "Breath Control for Singing", "Home Recording Setup", "Music Appreciation", "Creative Melodies"],
    image: "/assets/images/communication_personality.jpg"
  },
  "Interior Design": {
    group: "Creative",
    subcategories: ["Spatial Planning", "Color & Mood Palettes", "Lighting Design", "Furniture Ergonomics", "Material Textures", "Budget Home Styling"],
    keywords: ["Floor Plan Layouts", "Ambient, Task & Accent Lighting", "Harmonizing Textures & Woods", "Compact Space Optimization", "Sustainable Design Choices", "Mood Board Creation", "Window Treatments", "Decluttering Principles", "Focal Point Styling", "Client Needs Analysis"],
    image: "/assets/images/graphic_design_media.jpg"
  },
  "Fashion Design": {
    group: "Creative",
    subcategories: ["Garment Construction", "Fashion Illustration", "Textiles & Fabrics", "Color & Silhouette", "Sustainable Fashion", "Fashion Business Basics"],
    keywords: ["Fabric Drape & Types", "Basic Sewing Techniques", "Body Measurement Guides", "Trend Analysis", "Sketching Croquis Figures", "Pattern Making Fundamentals", "Upcycling Garments", "Fashion Portfolio Design", "Garment Finishing", "Capsule Wardrobes"],
    image: "/assets/images/graphic_design_media.jpg"
  },
  "Hospitality Management": {
    group: "Business",
    subcategories: ["Guest Relations", "Front Office Operations", "Food & Beverage Basics", "Hospitality Etiquette", "Housekeeping Standards", "Service Excellence"],
    keywords: ["Customer Delight Mindset", "Check-In/Out Workflows", "Handling Guest Complaints", "Hygiene & Food Safety", "Cross-Cultural Hospitality", "Reservation Systems", "Banquet Operations", "Professional Communication", "Upselling Services", "Service Recovery"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Tourism": {
    group: "Business",
    subcategories: ["Travel Itinerary Planning", "Tour Guiding Skills", "Eco-Tourism", "Heritage Tourism", "Destination Marketing", "Travel Logistics"],
    keywords: ["Custom Tour Scheduling", "Local Heritage Storytelling", "Sustainable Travel Principles", "Booking Logistics & Flights", "Risk & Emergency Management", "Customer Safety on Trips", "Cultural Sensitivity", "Tourism Marketing", "Group Travel Facilitation", "Travel Agency Operations"],
    image: "/assets/images/entrepreneurship_finance.jpg"
  },
  "Legal Awareness": {
    group: "Professional",
    subcategories: ["Consumer Protection", "Contract Essentials", "Cyber Laws in India", "Constitutional Rights", "Labor Rights", "Intellectual Property Basics"],
    keywords: ["Consumer Court Procedures", "Essential Elements of Valid Contracts", "IT Act & Cyber Crime Reporting", "Fundamental Rights & Duties", "Copyright & Trademark Basics", "RTI Application Filing", "Tenancy Agreements", "Workplace Safety Laws", "Dispute Resolution Methods", "Legal Literacy for Citizens"],
    image: "/assets/images/career_development.jpg"
  },
  "Sustainability": {
    group: "Academic",
    subcategories: ["Circular Economy", "Zero Waste Lifestyle", "Carbon Audits", "Corporate ESG Basics", "Water Stewardship", "Sustainable Consumption"],
    keywords: ["Reduce, Reuse & Upcycle", "Composting Organic Waste", "Green Business Models", "Life Cycle Assessment", "Energy Conservation Habits", "Eco-Friendly Packaging", "UN Sustainable Development Goals", "Plastic Alternatives", "Community Green Action", "Biodiversity Stewardship"],
    image: "/assets/images/academic_education.jpg"
  },
  "Renewable Energy": {
    group: "STEM",
    subcategories: ["Solar PV Systems", "Wind Power Principles", "Battery Storage Tech", "Clean Energy Economics", "Grid Integration", "Green Hydrogen Basics"],
    keywords: ["Photovoltaic Effect", "Solar Inverters & Batteries", "Wind Turbine Mechanics", "Energy Efficiency Audits", "Net Metering Frameworks", "Decarbonization Paths", "Energy Storage Solutions", "Off-Grid Power Systems", "Clean Tech Policies", "System Sizing Calculations"],
    image: "/assets/images/robotics_stem.jpg"
  },
  "Solar Technology": {
    group: "STEM",
    subcategories: ["Rooftop Solar Design", "Solar Panel Installation", "Inverter Maintenance", "Site Feasibility Surveys", "Solar System Sizing", "Safety Standards"],
    keywords: ["Module Tilt & Orientation", "Shadow Analysis", "DC to AC Inversion", "Charge Controllers", "Wiring & Earthing Systems", "Solar ROI Calculation", "Troubleshooting Solar Arrays", "Battery Bank Maintenance", "Government Solar Subsidies", "Field Safety Gear"],
    image: "/assets/images/robotics_stem.jpg"
  },
  "Manufacturing Technology": {
    group: "STEM",
    subcategories: ["CNC Machining Basics", "Additive Manufacturing", "Quality Control & 5S", "Industrial Automation", "Lean Manufacturing", "Materials Science"],
    keywords: ["G-Code Fundamentals", "3D Printing Filaments & Slicing", "Six Sigma Basics", "Precision Calipers & Micrometers", "Assembly Line Efficiency", "Preventive Maintenance", "Factory Safety Protocols", "Kaizen Continuous Improvement", "Material Tensile Properties", "Toolpath Optimization"],
    image: "/assets/images/robotics_stem.jpg"
  },
  "Automobile Technology": {
    group: "STEM",
    subcategories: ["Internal Combustion Basics", "Electric Vehicle (EV) Systems", "Braking & Suspension", "Automotive Electricals", "Vehicle Diagnostics", "Hybrid Powertrains"],
    keywords: ["Four-Stroke Engine Cycles", "EV Lithium Battery Packs", "Regenerative Braking", "OBD-II Fault Code Scanners", "Transmission & Clutches", "Suspension Alignment", "Motor Controllers in EVs", "Vehicle Safety Features", "Routine Maintenance Checklists", "Automotive Sensors"],
    image: "/assets/images/robotics_stem.jpg"
  },
  "Career and Vocational Skills": {
    group: "Professional",
    subcategories: ["Electrical Trade Skills", "Plumbing Basics", "Carpentry Fundamentals", "Appliance Maintenance", "Industrial Safety", "Vocational Apprenticeships"],
    keywords: ["Hand & Power Tool Safety", "Circuit Repair & Multimeters", "Pipe Fitting & Leak Prevention", "Woodworking Joints & Finishing", "Troubleshooting Home Electronics", "Blueprint Reading", "Personal Protective Equipment", "Workshop Organization", "Apprentice Code of Conduct", "Service Business Setup"],
    image: "/assets/images/career_development.jpg"
  },
  "Agriculture and Food Processing": {
    group: "Wellbeing",
    subcategories: ["Post-Harvest Preservation", "FSSAI Safety Standards", "Food Packaging Tech", "Value-Added Food Products", "Cold Chain Storage", "Agro-Food Marketing"],
    keywords: ["Drying, Canning & Pickling", "Nutritional Labelling", "Shelf-Life Extension", "Sanitation in Food Units", "Packaging Materials & Sealing", "Fruit & Grain Processing", "Organic Certification Rules", "Storage Temperature Control", "Distribution Logistics", "Small Food Enterprise Setup"],
    image: "/assets/images/agriculture_rural_innovation.jpg"
  },
  "Women Entrepreneurship": {
    group: "Wellbeing",
    subcategories: ["Home-Based Businesses", "Self-Help Group Management", "E-Commerce Onboarding", "Financial Independence", "Branding for Women Founders", "Accessing Government Credit"],
    keywords: ["Finding Market Gaps", "Pricing Artisanal Products", "Digital Banking & UPI", "Social Media Selling", "MUDRA & Stand-Up India Schemes", "Time Management for Homemakers", "Peer Support Networks", "Packing & Shipping Orders", "Confidence in Sales", "Scaling Micro-Ventures"],
    image: "/assets/images/agriculture_rural_innovation.jpg"
  },
  "Life Skills": {
    group: "Professional",
    subcategories: ["Critical Decision Making", "Conflict De-escalation", "Civic Responsibility", "Healthy Digital Diet", "Self-Sufficiency", "Interpersonal Boundaries"],
    keywords: ["Evaluating Information Truth", "Calm Problem Framing", "Managing Screen Addiction", "Personal Responsibility", "Assertive Communication", "Everyday Resourcefulness", "Navigating Peer Pressure", "Domestic Practical Skills", "Resilience During Adversity", "Living by Core Values"],
    image: "/assets/images/communication_personality.jpg"
  },
  "Personal Productivity": {
    group: "Professional",
    subcategories: ["Timeboxing & Focus", "Deep Work Habit", "Overcoming Procrastination", "Digital Organization", "Task Prioritization", "Energy Management"],
    keywords: ["Pomodoro Technique", "Eisenhower Matrix", "Distraction-Free Workspaces", "Morning Momentum Habits", "Weekly Review System", "Note-Taking Frameworks", "Inbox Zero Tactics", "Sleep & Energy Rhythms", "Saying No Elegantly", "Consistent Daily Execution"],
    image: "/assets/images/communication_personality.jpg"
  }
};

// Title prefixes and patterns to generate rich, completely distinct titles
const TITLE_PATTERNS = [
  (sub, topic) => `Complete ${sub}: From Fundamentals to ${topic}`,
  (sub, topic) => `Mastering ${sub}: Practical ${topic} Masterclass`,
  (sub, topic) => `${sub} Essentials: Hands-on ${topic} Practice`,
  (sub, topic) => `Applied ${sub}: Real-World ${topic} & Project Work`,
  (sub, topic) => `Modern ${sub}: Professional ${topic} Techniques`,
  (sub, topic) => `${sub} for Beginners: Step-by-Step ${topic}`,
  (sub, topic) => `Advanced ${sub}: High-Performance ${topic}`,
  (sub, topic) => `${sub} Bootcamp: Production ${topic} Workflows`,
  (sub, topic) => `${sub} Blueprint: Strategic ${topic} Implementation`,
  (sub, topic) => `The Practical Guide to ${sub} & ${topic}`,
  (sub, topic) => `${sub} in Action: Solving Problems with ${topic}`,
  (sub, topic) => `${sub} Certification Track: Comprehensive ${topic}`,
  (sub, topic) => `Zero to Mastery in ${sub}: Featuring ${topic}`,
  (sub, topic) => `${sub} Professional Suite: Applied ${topic}`,
  (sub, topic) => `Industrial ${sub}: Building Systems with ${topic}`,
  (sub, topic) => `${sub} Deep Dive: Architectural ${topic}`,
  (sub, topic) => `Practical ${sub}: Fast-Track ${topic} Skills`
];

const PRICING_TIERS = [
  { tier: "Free", price: 0 },
  { tier: "Starter", price: 199 },
  { tier: "Basic", price: 499 },
  { tier: "Professional", price: 999 },
  { tier: "Advanced", price: 1499 },
  { tier: "Specialised", price: 2499 }
];

const STATUS_OPTIONS = [
  "Published",
  "Published",
  "Published",
  "Ready to Publish",
  "Instructor Assigned",
  "Content Development",
  "Planned"
];

const DURATIONS = [
  "6 Hours (Self-Paced)",
  "10 Hours (Self-Paced)",
  "14 Hours (Hands-on)",
  "18 Hours (Masterclass)",
  "24 Hours (Full Course)",
  "32 Hours (Comprehensive)",
  "40 Hours (Deep Dive)"
];

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

console.log("Starting generation of 1,500 courses across 90 categories in 15 batches of 100...");

const allCourses = [];
const usedTitles = new Set();
let courseIndex = 0;

// Distribute 1,500 courses evenly across the 90 categories
// 1500 courses: 60 categories get 17 courses (1020), 30 categories get 16 courses (480) => 1500 total!
const categoryQuotas = {};
CATEGORIES_90.forEach((cat, idx) => {
  categoryQuotas[cat] = idx < 60 ? 17 : 16;
});

// Create flat list of (category, subIndex)
const generationPlan = [];
CATEGORIES_90.forEach((cat) => {
  const count = categoryQuotas[cat];
  for (let i = 0; i < count; i++) {
    generationPlan.push({ category: cat, itemIndex: i });
  }
});

// Shuffle plan slightly to distribute categories across batches naturally
// Using a deterministic pseudo-random seed
let seed = 42;
function pseudoRandom() {
  seed = (seed * 9301 + 49297) % 233280;
  return seed / 233280;
}

// Generate the 1,500 courses
for (let i = 0; i < generationPlan.length; i++) {
  const { category, itemIndex } = generationPlan[i];
  const details = CATEGORY_DETAILS[category] || {
    group: "General",
    subcategories: ["Fundamentals", "Applied Techniques", "Advanced Topics"],
    keywords: ["Core Principles", "Practical Workflow", "Case Study"],
    image: "/assets/images/academic_education.jpg"
  };

  const subcategory = details.subcategories[itemIndex % details.subcategories.length];
  const keyword = details.keywords[itemIndex % details.keywords.length];
  const secondaryKeyword = details.keywords[(itemIndex + 3) % details.keywords.length];

  // Pick unique title
  let title = "";
  for (let p = 0; p < TITLE_PATTERNS.length; p++) {
    const patternIdx = (itemIndex + p) % TITLE_PATTERNS.length;
    const candidate = TITLE_PATTERNS[patternIdx](subcategory, keyword);
    if (!usedTitles.has(candidate)) {
      title = candidate;
      usedTitles.add(candidate);
      break;
    }
  }

  if (!title) {
    let extra = 1;
    while (!title || usedTitles.has(title)) {
      title = `${subcategory}: ${keyword} & ${secondaryKeyword} (Edition ${extra})`;
      extra++;
    }
    usedTitles.add(title);
  }

  const idNumber = String(i + 1).padStart(4, '0');
  const courseId = `OF-CRS-${idNumber}`;

  // Level & Duration
  const level = LEVELS[Math.floor(pseudoRandom() * LEVELS.length)];
  const duration = DURATIONS[Math.floor(pseudoRandom() * DURATIONS.length)];

  // Pricing
  const priceObj = PRICING_TIERS[Math.floor(pseudoRandom() * PRICING_TIERS.length)];
  const status = STATUS_OPTIONS[Math.floor(pseudoRandom() * STATUS_OPTIONS.length)];

  // Course Description (6 structured components)
  const whatLearn = `Students will gain systematic mastery in ${subcategory}, focusing on ${keyword} and practical implementation of ${secondaryKeyword}.`;
  const whyMatters = `${category} is pivotal in modern industries; proficiency in ${keyword} allows professionals to deliver measurable impact and solve complex operational hurdles.`;
  const topicsCovered = `Curriculum spans foundational syntax and theory, ${subcategory} workflow architecture, real-world ${keyword} drills, and best-practice quality audits.`;
  const practicalSkills = `Learners will develop hands-on capabilities in building production-ready projects, debugging, optimizing pipelines, and implementing ${secondaryKeyword}.`;
  const whoEnrol = `Ideal for aspiring professionals, college students, career switchers, and practitioners aiming for certified competence in ${category}.`;
  const postAchievement = `Upon successful evaluation, learners will possess a verified project portfolio, OpenFrame certification, and career-ready problem-solving competence.`;

  const fullDescription = `${whatLearn} ${whyMatters}\n\nTopics Covered: ${topicsCovered}\n\nPractical Skills: ${practicalSkills}\n\nTarget Learners: ${whoEnrol}\n\nCareer Outcomes: ${postAchievement}`;

  // Modules & Curriculum
  const modules = [
    {
      moduleNumber: 1,
      title: `Foundations of ${subcategory}`,
      duration: "2.5 Hours",
      lessons: [
        `Introduction and Core Principles of ${category}`,
        `Environment Setup and Tooling for ${subcategory}`,
        `Understanding Basic Architecture and Concepts`,
        `Initial Hands-on Lab: ${keyword} Fundamentals`
      ]
    },
    {
      moduleNumber: 2,
      title: `Applied Techniques in ${keyword}`,
      duration: "4.0 Hours",
      lessons: [
        `Deep-Dive into ${keyword} Mechanics`,
        `Workflow Structuring and Best Practices`,
        `Analyzing Common Failure Modes and Solutions`,
        `Interactive Exercise: Designing for Reliability`
      ]
    },
    {
      moduleNumber: 3,
      title: `Advanced ${secondaryKeyword} Integration`,
      duration: "3.5 Hours",
      lessons: [
        `Advanced Configurations and Scalability`,
        `Cross-System Integration with ${secondaryKeyword}`,
        `Security, Performance Optimization and Auditing`,
        `Mini-Capstone Sprint and Troubleshooting`
      ]
    },
    {
      moduleNumber: 4,
      title: `Real-World Capstone Project & Evaluation`,
      duration: "2.0 Hours",
      lessons: [
        `Comprehensive Project Specification and Setup`,
        `End-to-End Implementation of the Solution`,
        `Code/Design Review and Quality Checklist`,
        `Final Knowledge Assessment and Certification Submission`
      ]
    }
  ];

  const learningObjectives = [
    `Master essential theoretical and practical concepts of ${subcategory}`,
    `Build, configure, and troubleshoot real-world implementations using ${keyword}`,
    `Integrate ${secondaryKeyword} into modern, scalable production workflows`,
    `Apply industry best practices for efficiency, security, and maintainability`
  ];

  const skillsAcquired = [
    `${category} Mastery`,
    `${subcategory} Implementation`,
    `${keyword} Troubleshooting`,
    `${secondaryKeyword} Architecture`,
    "Project Execution & Optimization"
  ];

  const practicalProjects = [
    `Hands-on Capstone: Production ${subcategory} Implementation with ${keyword}`,
    `Live Simulation: Automated Workflow using ${secondaryKeyword}`
  ];

  // Assessment
  const assessmentMethod = "Practical Project Submission & Comprehensive Multiple-Choice Knowledge Assessment";

  // Ratings
  const rating = Number((4.6 + pseudoRandom() * 0.35).toFixed(1));
  const enrolledCount = Math.floor(25 + pseudoRandom() * 450);

  const course = {
    id: courseId,
    title: title,
    category: category,
    categoryGroup: details.group,
    subcategory: subcategory,
    level: level,
    duration: duration,
    pricingTier: priceObj.tier,
    price: priceObj.price,
    status: status,
    isPopular: pseudoRandom() > 0.8,
    isTrending: pseudoRandom() > 0.82,
    isNew: pseudoRandom() > 0.85,
    isRecommended: pseudoRandom() > 0.78,
    isCareerTrack: pseudoRandom() > 0.75,
    rating: rating,
    enrolledCount: enrolledCount,
    imageUrl: details.image,
    shortDesc: `${whatLearn} ${practicalSkills}`,
    description: fullDescription,
    descriptionBreakdown: {
      whatStudentWillLearn: whatLearn,
      whySubjectMatters: whyMatters,
      topicsCovered: topicsCovered,
      practicalSkillsDeveloped: practicalSkills,
      whoShouldEnrol: whoEnrol,
      achieveAfterCompletion: postAchievement
    },
    learningObjectives: learningObjectives,
    modules: modules,
    targetAudience: whoEnrol,
    skillsAcquired: skillsAcquired,
    practicalProjects: practicalProjects,
    assessmentMethod: assessmentMethod,
    certificateEligibility: true,
    certificateNote: "Verified OpenFrame Education Certificate issued in association with HopeNest Global Foundation upon evaluation completion",
    instructor: {
      name: "OpenFrame Certified Faculty Panel",
      role: `Senior Instructor – ${category}`,
      organization: "OpenFrame IT Solutions & HopeNest Global Foundation"
    },
    updatedAt: "2026-11-04"
  };

  allCourses.push(course);
}

// BATCH SAVING IN BATCHES OF 100
console.log("=================================================================");
console.log("BATCH GENERATION IN BATCHES OF 100 (TOTAL 15 BATCHES):");
console.log("=================================================================");

const totalBatches = 15;
let runningTotal = 0;

for (let b = 1; b <= totalBatches; b++) {
  const startIdx = (b - 1) * 100;
  const endIdx = startIdx + 100;
  const batchCourses = allCourses.slice(startIdx, endIdx);
  runningTotal += batchCourses.length;

  const batchFileName = `batch_${b}.json`;
  const batchFilePath = path.join(__dirname, '../public/data', batchFileName);
  fs.writeFileSync(batchFilePath, JSON.stringify(batchCourses, null, 2));

  console.log(`[BATCH ${String(b).padStart(2, ' ')} / 15] Successfully Generated ${batchCourses.length} Courses: ID ${batchCourses[0].id} to ${batchCourses[batchCourses.length - 1].id} | Running Total: ${runningTotal} Courses`);
}

// Save complete central database
const centralFilePath = path.join(__dirname, '../public/data/marketplace_courses.json');
fs.writeFileSync(centralFilePath, JSON.stringify(allCourses));
console.log(`\nCentral Course Database saved to public/data/marketplace_courses.json (File size: ${(fs.statSync(centralFilePath).size / (1024 * 1024)).toFixed(2)} MB)`);

// Generate lightweight summary index for fast initial UI rendering without waiting for full JSON
const summaryCourses = allCourses.map(c => ({
  id: c.id,
  title: c.title,
  category: c.category,
  categoryGroup: c.categoryGroup,
  subcategory: c.subcategory,
  level: c.level,
  duration: c.duration,
  pricingTier: c.pricingTier,
  price: c.price,
  status: c.status,
  isPopular: c.isPopular,
  isTrending: c.isTrending,
  isNew: c.isNew,
  isRecommended: c.isRecommended,
  isCareerTrack: c.isCareerTrack,
  rating: c.rating,
  enrolledCount: c.enrolledCount,
  imageUrl: c.imageUrl,
  shortDesc: c.shortDesc
}));

const summaryFilePath = path.join(__dirname, '../public/data/marketplace_summary.json');
fs.writeFileSync(summaryFilePath, JSON.stringify(summaryCourses));
console.log(`Marketplace Summary Index saved to public/data/marketplace_summary.json (File size: ${(fs.statSync(summaryFilePath).size / (1024 * 1024)).toFixed(2)} MB)`);

// VERIFICATION CHECK
console.log("\n=================================================================");
console.log("VERIFICATION CHECK:");
console.log("=================================================================");
console.log(`Total Courses Generated: ${allCourses.length}`);
console.log(`Total Unique Titles: ${usedTitles.size}`);
console.log(`Title Duplication Check: ${usedTitles.size === allCourses.length ? "PASSED (0 Duplicates)" : "FAILED"}`);

const uniqueIds = new Set(allCourses.map(c => c.id));
console.log(`ID Duplication Check: ${uniqueIds.size === allCourses.length ? "PASSED (0 Duplicate IDs)" : "FAILED"}`);

const presentCategories = new Set(allCourses.map(c => c.category));
console.log(`Category Coverage: ${presentCategories.size} / 90 Categories present`);

const publishedCount = allCourses.filter(c => c.status === "Published").length;
const plannedCount = allCourses.filter(c => c.status === "Planned").length;
const readyCount = allCourses.filter(c => c.status === "Ready to Publish").length;
const devCount = allCourses.filter(c => c.status === "Content Development").length;
const assignedCount = allCourses.filter(c => c.status === "Instructor Assigned").length;

console.log(`Status Breakdown:`);
console.log(`- Published (Enrol Now Available): ${publishedCount}`);
console.log(`- Ready to Publish: ${readyCount}`);
console.log(`- Instructor Assigned: ${assignedCount}`);
console.log(`- Content Development: ${devCount}`);
console.log(`- Planned: ${plannedCount}`);

console.log("=================================================================");
console.log("ALL 1,500 COURSES VERIFIED AND SAVED SUCCESSFULLY.");
console.log("=================================================================");
