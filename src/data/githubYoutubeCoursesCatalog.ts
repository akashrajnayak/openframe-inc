/**
 * OpenFrame 7,008 GitHub-Indexed YouTube Certified Skill Development Course Catalog
 * Sourced from 190 curated educational YouTube channels in:
 * https://github.com/wpacademy/educational-youtube-channels (MIT License)
 *
 * Pricing Structure (OpenFrame Certified Skill Development):
 * - Basics (Beginner): ₹300 (90% Grant off ₹3,000 benchmark)
 * - Intermediate: ₹950 – ₹1,450
 * - Advanced: ₹2,500 (90% Grant off ₹25,000 benchmark)
 *
 * Post-Enrollment Certification Pipeline on Every Course:
 * 1. Embedded YouTube Video Lessons & Guided Modules
 * 2. Auto-Graded Verification Quiz
 * 3. Hands-On Capstone Projects
 * 4. Project Submission & Faculty/AI Review
 * 5. Live Final Score & OpenFrame QR-Verified Skill Development Certificate
 */

import type { MarketplaceCourse, MarketplacePricingTier } from '../types';
import {
  EDUCATIONAL_YOUTUBE_CHANNELS,
  EDUCATIONAL_YOUTUBE_CHANNEL_CATEGORIES,
  EducationalYouTubeChannel,
} from './educationalYouTubeChannelsData';

export const GITHUB_YOUTUBE_COURSE_COUNT = 7008;

interface CategoryCurriculumSpec {
  domainGroup: string;
  videoIds: string[];
  topics: string[];
  projects: string[];
  skills: string[];
}

const CATEGORY_SPECS: Record<string, CategoryCurriculumSpec> = {
  'Programming & Coding': {
    domainGroup: 'Technology',
    videoIds: ['_uQrJ0TkZlc', 'PkZNo7MFNFg', 'bMknfKXIFA8', 'Oe421EPjeBE', '-W9F__D3oY4', 'l1EssrLxt7E', 'tVzUXW6siu0'],
    topics: [
      'Python Programming & Problem Solving',
      'JavaScript ES6+ & Async Architecture',
      'TypeScript & Scalable Frontend Engineering',
      'React Component Patterns & Hooks',
      'Node.js, Express & REST API Systems',
      'Data Structures & Algorithms Mastery',
      'Full-Stack Web Application Engineering',
      'SQL, Relational Modeling & Query Tuning',
      'Git, GitHub & Collaborative Engineering',
      'HTML5, Modern CSS Grid & Responsive UI',
      'Object-Oriented Design & Clean Code',
      'System Design & Scalable Microservices',
      'Backend Authentication & Security Patterns',
      'Testing, Debugging & Code Quality Labs',
      'API Integrations & Webhook Workflows',
      'C++ Competitive Coding & Memory Models',
      'Java Enterprise & Spring Architecture',
      'Go Concurrency & High-Throughput Services',
      'Rust Systems Programming Essentials',
      'Next.js Full-Stack Server Rendering',
      'GraphQL API Schema & Resolvers',
      'PostgreSQL Indexing & Transactions',
      'Software Architecture & Design Patterns',
      'Linux CLI & Developer Productivity',
      'Web Performance & Core Web Vitals',
      'Browser Internals & DOM Optimization',
      'State Management & Data Fetching',
      'Progressive Web Apps & Offline Sync',
      'Automated End-to-End Testing Suites',
      'Open-Source Contribution Workflow',
      'Technical Interview Problem Patterns',
      'Caching, Queues & Event-Driven Apps',
      'Serverless Functions & Edge Computing',
      'Production Logging & Observability',
      'Code Refactoring & Legacy Modernization',
      'Developer Portfolio & Live Deployment',
      'Real-Time WebSockets & Collaborative Apps',
    ],
    projects: [
      'Build & Deploy a Full-Stack Task & Analytics Web Application',
      'Design a RESTful API with Role-Based Authentication & Automated Tests',
      'Solve 15 Structured Algorithm Benchmarks with Time/Space Analysis',
    ],
    skills: ['Software Engineering', 'Algorithms', 'Full-Stack Web', 'API Design', 'Clean Architecture'],
  },
  'AI & Automation': {
    domainGroup: 'Technology',
    videoIds: ['JMUxmLyrhSk', 'kCc8FmEb1nY', 'wjZofJX0v4U', 'aircAruvnKk', 'i_LwzRVP7bg'],
    topics: [
      'Generative AI & Large Language Models',
      'Prompt Engineering & Structured Outputs',
      'AI Workflow Automation & No-Code Agents',
      'Building Multi-Step Autonomous AI Agents',
      'Retrieval-Augmented Generation (RAG) Systems',
      'Vector Databases & Semantic Search Pipelines',
      'Voice AI & Conversational Assistants',
      'AI Productivity Systems for Business Teams',
      'Document Parsing & Intelligent OCR Pipelines',
      'Function Calling & Tool-Using AI Workflows',
      'Fine-Tuning & Evaluating Foundation Models',
      'AI Safety, Guardrails & Hallucination Control',
      'Automated Email, CRM & Support AI Pipelines',
      'Multimodal AI Vision & Audio Applications',
      'Deploying AI Microservices to Production',
      'AI Code Assistants & Automated QA Reviews',
      'Knowledge Base Chatbots for Enterprise',
      'Agentic Research & Report Generation',
      'Cost Optimization & Token Caching in LLMs',
      'AI Ethics, Governance & Compliance Frameworks',
      'Real-Time Streaming AI Interfaces',
      'Synthetic Dataset Creation & Benchmarking',
      'Custom AI Copilots for Domain Workflows',
      'End-to-End AI SaaS Product Architecture',
      'Automated Data Extraction & Enrichment',
      'AI Evaluation Rubrics & Regression Testing',
      'Edge AI & Local Model Inference',
      'Context Window Engineering & Memory Graphs',
      'Workflow Orchestration with Webhooks & APIs',
      'AI Analytics Dashboards & Executive Briefs',
      'Human-in-the-Loop AI Approval Pipelines',
      'Scaling AI Automation for SMEs & Startups',
      'Multilingual AI Translation & Localization',
      'AI Content Operations & Verification',
      'Automated Testing with Vision-Language Models',
      'Enterprise AI Adoption Roadmap',
      'Capstone Autonomous Agent Deployment',
    ],
    projects: [
      'Build a Domain-Grounded RAG Study & Support Assistant with Evaluation Rubric',
      'Create an Automated Multi-Step AI Workflow with Structured JSON Validation',
      'Benchmark Prompt & Model Accuracy Across 25 Real-World Test Cases',
    ],
    skills: ['Generative AI', 'AI Agents', 'Prompt Engineering', 'Workflow Automation', 'RAG Systems'],
  },
  'Machine Learning & Data Science': {
    domainGroup: 'Technology',
    videoIds: ['i_LwzRVP7bg', 'aircAruvnKk', 'IHZwWFHWa-w', 'vmEHCJofslg', '7QNgqq154gE', 'WV6X0rol5To'],
    topics: [
      'Python for Data Science: NumPy & Pandas',
      'Exploratory Data Analysis & Visualization',
      'Supervised Machine Learning & Regression',
      'Classification, Trees & Ensemble Models',
      'Deep Learning & Neural Network Foundations',
      'Gradient Descent & Backpropagation Math',
      'Natural Language Processing (NLP) Systems',
      'Computer Vision & Convolutional Networks',
      'Transformer Architectures from Scratch',
      'Probability & Applied Statistics for ML',
      'Feature Engineering & Model Selection',
      'Time Series Forecasting & Anomaly Detection',
      'Unsupervised Clustering & Dimensionality Reduction',
      'PyTorch Deep Learning Engineering',
      'Scikit-Learn Production ML Pipelines',
      'MLOps, Model Tracking & Drift Monitoring',
      'Recommendation Systems & Ranking Models',
      'SQL Analytics & Business Intelligence',
      'Executive KPI Dashboards & Data Storytelling',
      'A/B Testing & Causal Inference Labs',
      'Hyperparameter Tuning & Cross-Validation',
      'Imbalanced Datasets & Metric Engineering',
      'Reinforcement Learning Fundamentals',
      'Graph Neural Networks & Relational Data',
      'Big Data Processing & Feature Stores',
      'Model Explainability (SHAP & Interpretability)',
      'Healthcare & Financial Predictive Modeling',
      'Deploying Fast ML Inference APIs',
      'Spreadsheet & BI Modeling for Analysts',
      'Data Cleaning & Imputation Strategies',
      'Bayesian Thinking & Probabilistic Models',
      'Speech Recognition & Audio ML Pipelines',
      'Transfer Learning & Pretrained Embeddings',
      'Bias Auditing & Responsible Data Science',
      'End-to-End Kaggle-Grade Modeling Workflow',
      'Statistical Hypothesis Testing Workshop',
      'Capstone Production ML System Deployment',
    ],
    projects: [
      'Train, Cross-Validate & Explain a Real-World Predictive ML Pipeline',
      'Build an Interactive Exploratory Data & KPI Dashboard from Raw CSV Data',
      'Implement & Evaluate a Neural Classifier with Confusion Matrix Report',
    ],
    skills: ['Machine Learning', 'Data Science', 'Python Analytics', 'Deep Learning', 'Statistical Modeling'],
  },
  'Game Development': {
    domainGroup: 'Creative',
    videoIds: ['PkZNo7MFNFg', 'bMknfKXIFA8', 'c9Wg6Cb_YlU', '_uQrJ0TkZlc'],
    topics: [
      'Game Design Foundations & Core Mechanics',
      '2D Platformer & Physics Engine Engineering',
      '3D World Building, Lighting & Shaders',
      'C# Scripting for Interactive Game Systems',
      'Godot Engine Open-Source Game Architecture',
      'Unreal Engine Blueprints & Level Design',
      'Character Controllers, Animation & State Machines',
      'Game AI, Pathfinding & Behavior Trees',
      'Procedural Level Generation Algorithms',
      'Game Audio, Soundscapes & Feedback Polish',
      'Multiplayer Networking & State Synchronization',
      'UI/HUD Design & Inventory Architecture',
      'Shader Math, Particle Effects & Post-Processing',
      'Mobile & WebGL Game Performance Tuning',
      'Storyboarding, Narrative Design & Quests',
      'Physics Collisions, Raycasting & Rigidbodies',
      'Save Systems, Serialization & Progression',
      'Playtesting, Balancing & Telemetry Loops',
      'Pixel Art Pipelines & Tilemap Automation',
      '3D Rigging, Blend Trees & Inverse Kinematics',
      'Camera Systems, Cinematics & Cutscenes',
      'Combat Feel, Hitboxes & Juice Mechanics',
      'VR & Spatial Interaction Prototyping',
      'Indie Game Publishing & Store Readiness',
      'Asset Optimization & Frame-Rate Profiling',
      'Turn-Based Strategy & Card Game Logic',
      'Top-Down Action RPG Systems Architecture',
      'Physics Puzzles & Interactive Environments',
      'Custom Editor Tooling & Level Workflows',
      'Cross-Platform Input & Controller Mapping',
      'Procedural Audio & Dynamic Music Layers',
      'Economy Design & Fair Progression Systems',
      'Dialogue Trees & Localization Pipelines',
      'Debugging Game Loops & Deterministic Replays',
      'Rapid Game Jam Prototyping Bootcamp',
      'Monetization Ethics & Player Retention',
      'Playable Vertical Slice Capstone Build',
    ],
    projects: [
      'Ship a Playable 2D/3D Mini-Game with Scoring, Physics & Sound Feedback',
      'Design a Finite State Machine Enemy AI with Pathfinding Demo',
      'Deliver a Complete Game Design Document & Playtest Report',
    ],
    skills: ['Game Engineering', 'Level Design', 'Physics Simulation', 'Shaders', 'Interactive Systems'],
  },
  'Mobile App Development': {
    domainGroup: 'Technology',
    videoIds: ['bMknfKXIFA8', 'PkZNo7MFNFg', 'Oe421EPjeBE', 'c9Wg6Cb_YlU'],
    topics: [
      'Flutter Cross-Platform App Foundations',
      'Android Engineering with Kotlin & Jetpack Compose',
      'iOS App Development with Swift & SwiftUI',
      'React Native Production App Architecture',
      'Mobile Navigation, Deep Links & Tab Flows',
      'Offline-First Storage & Local Sync Databases',
      'Mobile REST APIs, Caching & Pagination',
      'Firebase Auth, Push Notifications & Analytics',
      'Smooth 60fps Mobile Animations & Gestures',
      'Responsive Adaptive Layouts for Phones & Tablets',
      'Camera, GPS & Native Device Sensor APIs',
      'Mobile State Management & Clean Architecture',
      'Secure Token Storage & Biometric Login',
      'Mobile Payment Gateways & Subscription Flows',
      'Accessibility & Multilingual Mobile UX',
      'Automated Widget, Unit & Integration Testing',
      'Play Store & App Store Release Pipelines',
      'Battery, Memory & Startup Speed Profiling',
      'Real-Time Chat & Presence in Mobile Apps',
      'Background Sync & Scheduled Tasks',
      'Maps, Geolocation & Delivery Tracking UI',
      'Audio/Video Streaming Players on Mobile',
      'Custom Canvas Charts & Micro-Interactions',
      'Dark Mode & Dynamic Theming Architecture',
      'Crash Reporting & Release Monitoring',
      'Modular Feature-First Codebases',
      'Wearable & Companion App Interfaces',
      'QR Code Scanning & Verification Workflows',
      'Form Validation & Multi-Step Onboarding',
      'Image Compression & Media Upload Pipelines',
      'App Security Hardening & Code Obfuscation',
      'A/B Feature Flags & Remote Config',
      'E-Commerce Cart & Checkout Mobile Studio',
      'EdTech & Learning Companion Mobile Build',
      'Healthcare & Habit Tracker App Workshop',
      'CI/CD Fastlane Mobile Build Automation',
      'Production Mobile App Capstone Release',
    ],
    projects: [
      'Build a Cross-Platform Mobile App with Auth, Offline Persistence & API Sync',
      'Implement Smooth Gesture & Transition Animations at 60fps',
      'Prepare Store-Ready App Screenshots, Privacy Checklist & QA Report',
    ],
    skills: ['Flutter', 'Kotlin Android', 'SwiftUI iOS', 'React Native', 'Mobile Architecture'],
  },
  'UI/UX Design': {
    domainGroup: 'Creative',
    videoIds: ['c9Wg6Cb_YlU', 'l1EssrLxt7E', '-W9F__D3oY4', 'tVzUXW6siu0'],
    topics: [
      'UI/UX Foundations & Human-Centered Design',
      'Figma Interface, Auto Layout & Constraints',
      'Design Systems, Tokens & Component Libraries',
      'User Research, Personas & Journey Mapping',
      'Wireframing & Information Architecture',
      'Interactive Prototyping & Micro-Interactions',
      'Typography Scales, Grids & Visual Hierarchy',
      'Color Systems & WCAG Accessibility Audits',
      'Mobile App UX Patterns & Thumb Ergonomics',
      'SaaS Dashboard & Data Visualization UX',
      'E-Commerce Conversion & Checkout UX',
      'Usability Testing & Heuristic Evaluation',
      'Responsive Web Layout & Breakpoint Craft',
      'Design-to-Developer Handoff & Specs',
      'UX Writing, Microcopy & Error Prevention',
      'Onboarding Flows & Empty-State Craft',
      'Forms, Filters & Complex Table UX',
      'Motion Principles for Digital Interfaces',
      'Portfolio Case Study Storytelling',
      'Design Critiques & Stakeholder Alignment',
      'Multi-Platform Design (Web, iOS, Android)',
      'Dark Mode Surface & Contrast Systems',
      'EdTech & Learning Platform UX Design',
      'FinTech Trust & Clarity Interface Patterns',
      'Healthcare & Inclusive Accessible Design',
      'Rapid Design Sprints & Concept Validation',
      'Component Variants & Interactive States',
      'Iconography Systems & Optical Alignment',
      'Landing Page Hierarchy & Editorial Rhythm',
      'Navigation Patterns for Large Products',
      'Quantitative UX Metrics & Funnel Analysis',
      'AI-Assisted Ideation & Wireframe Workflows',
      'Cross-Cultural & Multilingual UI Design',
      'Redesigning Legacy Enterprise Workflows',
      'Interactive Design Token Automation',
      'Live Design Review & Usability Lab',
      'End-to-End Product UI/UX Capstone Portfolio',
    ],
    projects: [
      'Design a Complete Multi-Screen Figma Prototype with Reusable Component Library',
      'Conduct a 5-User Usability Audit with Heuristic Fixes & Before/After Screens',
      'Publish a Full Design System Spec (Typography, Colors, Spacing & Accessibility)',
    ],
    skills: ['Figma', 'Design Systems', 'User Research', 'Wireframing', 'Interactive Prototyping'],
  },
  'Graphic & Design': {
    domainGroup: 'Creative',
    videoIds: ['c9Wg6Cb_YlU', 'l1EssrLxt7E', 'tVzUXW6siu0', 'bixR-KIJKYM'],
    topics: [
      'Graphic Design Composition & Visual Balance',
      'Brand Identity, Logo Grids & Guidelines',
      'Typography Pairing & Editorial Layout Craft',
      'Photo Manipulation & Color Grading Studio',
      'Vector Illustration & Scalable Icon Design',
      'Social Media Visual Systems & Templates',
      'Poster, Print & Packaging Production Prep',
      'Motion Graphics & Kinetic Typography',
      '3D Modeling, Materials & Studio Lighting',
      'Thumbnail Psychology & High-CTR Layouts',
      'Color Theory, Harmony & Visual Storytelling',
      'Pitch Deck & Executive Presentation Design',
      'Infographics & Complex Visual Communication',
      'Digital Illustration & Character Foundations',
      'Video Editing Pacing, Cuts & Sound Sync',
      'Brand Refresh & Visual Consistency Systems',
      'Editorial Magazine & Book Cover Craft',
      'Packaging Dielines & Print Color Profiles',
      'UI Asset Export & Web-Optimized Graphics',
      'Creative Direction & Moodboard Systems',
      'Architectural & Isometric Graphic Renders',
      'Custom Brushwork, Textures & Gradients',
      'Event Branding & Signage Systems',
      'Freelance Creative Briefs & Client Workflow',
      'Portfolio Curation & Visual Case Studies',
      'Stop-Motion & Frame-by-Frame Fundamentals',
      'Compositing, Masking & Visual Effects',
      'Product Photography Retouching Essentials',
      'Newsletter & Digital Editorial Systems',
      'Accessible Graphic Contrast & Readability',
      'Batch Asset Production & Style Templates',
      'Cultural Motifs & Modern Indian Typography',
      'Merchandise & Apparel Print Graphics',
      'Animated Explainer & Promo Graphics',
      'Creative Critique & Iteration Workshop',
      'Design Pricing, Licensing & Deliverables',
      'Complete Brand Identity Capstone Showcase',
    ],
    projects: [
      'Create a Full Brand Identity Kit (Logo Grid, Color Palette, Typography & 5 Mockups)',
      'Produce a 6-Piece Editorial & Campaign Visual System Ready for Print & Web',
      'Build a Curated Graphic Design Portfolio with Process Breakdowns',
    ],
    skills: ['Brand Identity', 'Visual Design', 'Typography', 'Illustration', 'Motion Graphics'],
  },
  Cybersecurity: {
    domainGroup: 'Technology',
    videoIds: ['3Kq1MIfTWCE', 'ulprqHHWlng', 'pg19Z8LL06w', 'Oe421EPjeBE'],
    topics: [
      'Cybersecurity Foundations & Threat Landscape',
      'Computer Networking, TCP/IP & Packet Analysis',
      'Linux Security Administration & Hardening',
      'Ethical Hacking Methodology & Lab Setup',
      'OWASP Top 10 Web Application Security',
      'Cryptography, TLS & Public Key Infrastructure',
      'Network Defense, Firewalls & IDS/IPS',
      'SOC Operations, SIEM & Log Investigation',
      'Vulnerability Assessment & Risk Scoring',
      'Identity, Access Management & Zero Trust',
      'Cloud Security Posture & IAM Auditing',
      'Malware Analysis & Reverse Engineering Basics',
      'Incident Response & Digital Forensics',
      'API Security, OAuth2 & JWT Hardening',
      'Wireless & IoT Security Essentials',
      'Capture-the-Flag (CTF) Problem Solving',
      'Active Directory Defense & Privilege Audits',
      'Secure Coding & Static Analysis Workflows',
      'Threat Modeling & Security Architecture',
      'Phishing Defense & Human Factor Security',
      'Container & Kubernetes Security Hardening',
      'Penetration Testing Reporting & Remediation',
      'Compliance Frameworks (ISO 27001, SOC 2, DPDP)',
      'Python Scripting for Security Automation',
      'DNS, HTTP/S & Browser Security Headers',
      'Endpoint Detection & Response Workflows',
      'OSINT & Defensive Reconnaissance Labs',
      'Database Security & Injection Prevention',
      'Backup Resilience & Ransomware Recovery',
      'DevSecOps & CI/CD Security Gates',
      'Binary Exploitation Concepts & Mitigations',
      'Blue Team Detection Engineering',
      'Red Team Emulation & Purple Team Drills',
      'Supply Chain & Dependency Security',
      'Mobile Application Security Testing',
      'Security Career & Certification Prep Lab',
      'Full Enterprise Security Audit Capstone',
    ],
    projects: [
      'Complete an OWASP Web Security Checklist & Remediation Report on a Test App',
      'Analyze Network Packet Captures & Author an Incident Response Playbook',
      'Design a Zero-Trust IAM & Network Hardening Blueprint',
    ],
    skills: ['Network Security', 'Ethical Hacking', 'OWASP', 'SOC Analysis', 'Cloud Security'],
  },
  'DevOps & Cloud Computing': {
    domainGroup: 'Technology',
    videoIds: ['ulprqHHWlng', 'pg19Z8LL06w', 'Oe421EPjeBE', '3Kq1MIfTWCE'],
    topics: [
      'Cloud Computing Foundations (AWS, Azure, GCP)',
      'Docker Containers & Multi-Stage Image Builds',
      'Kubernetes Architecture, Pods & Services',
      'CI/CD Pipelines & Automated Deployments',
      'Infrastructure as Code with Terraform',
      'Linux Server Administration & Shell Scripting',
      'Cloud Networking, VPCs, DNS & Load Balancing',
      'Monitoring, Prometheus, Grafana & Alerting',
      'Site Reliability Engineering (SRE) & SLOs',
      'Serverless Cloud Architectures & Event Buses',
      'GitOps Workflows & Progressive Rollouts',
      'Cloud Cost Governance & FinOps Optimization',
      'High Availability & Disaster Recovery Design',
      'Secrets Management & Cloud IAM Policies',
      'Helm Charts & Kubernetes Production Security',
      'Ansible Configuration & Fleet Automation',
      'Database Operations & Cloud Backups',
      'Container Registries & Supply Chain Signing',
      'Reverse Proxies, Nginx & TLS Automation',
      'Distributed Tracing & Centralized Logging',
      'Microservices Service Mesh Fundamentals',
      'Auto-Scaling & Load Testing Benchmarks',
      'Blue-Green & Canary Deployment Strategies',
      'Hybrid & Multi-Cloud Architecture Patterns',
      'Cloud Storage Tiers, CDN & Edge Caching',
      'Message Brokers (Kafka, RabbitMQ, Pub/Sub)',
      'Chaos Engineering & Resilience Testing',
      'DevOps Security Gates & Policy as Code',
      'Developer Platforms & Internal Tooling',
      'Cloud Migration Planning & Execution',
      'Virtualization, VMs & Bare-Metal Fundamentals',
      'Automated Compliance & Drift Detection',
      'Production Incident Postmortems & Runbooks',
      'Build Caching & Fast Monorepo Pipelines',
      'Cloud Architect Certification Exam Prep',
      'Kubernetes Troubleshooting Deep Lab',
      'End-to-End Automated Cloud Platform Capstone',
    ],
    projects: [
      'Containerize a Multi-Service App with Docker Compose & CI/CD Pipeline',
      'Author Reusable Terraform Modules with Health Checks & Monitoring Alerts',
      'Create a Production High-Availability Architecture & Disaster Recovery Plan',
    ],
    skills: ['Cloud Architecture', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform & SRE'],
  },
  'Blockchain & Web3': {
    domainGroup: 'Technology',
    videoIds: ['Oe421EPjeBE', 'PkZNo7MFNFg', '3Kq1MIfTWCE', 'JMUxmLyrhSk'],
    topics: [
      'Blockchain Architecture & Distributed Ledgers',
      'Cryptographic Hashing, Merkle Trees & Consensus',
      'Ethereum Virtual Machine & Smart Contracts',
      'Solidity Programming & Contract Patterns',
      'Decentralized Finance (DeFi) Mechanics',
      'Token Standards (ERC-20, ERC-721, ERC-1155)',
      'Web3 Frontend Integration & Wallet Flows',
      'Smart Contract Security & Audit Checklists',
      'Layer-2 Scaling, Rollups & Zero-Knowledge Proofs',
      'Decentralized Storage (IPFS & Content Addressing)',
      'Digital Identity & Verifiable Credentials',
      'DAO Governance & Treasury Transparency',
      'Oracles & Real-World Data Feeds',
      'Gas Optimization & Efficient Storage Layouts',
      'Automated Smart Contract Testing Suites',
      'Cross-Chain Bridges & Interoperability',
      'Tokenomics & Incentive Mechanism Design',
      'Indexing Blockchain Events & Subgraphs',
      'Enterprise Supply Chain Ledger Use Cases',
      'Regulatory Landscape & Digital Asset Compliance',
      'Hardware Wallets & Key Custody Security',
      'NFT Metadata Standards & Provenance Systems',
      'Automated Market Makers & Liquidity Math',
      'Upgradeable Proxy Patterns & Timelocks',
      'Public Goods Funding & Impact Verification',
      'Account Abstraction & Better Web3 UX',
      'Mempool Mechanics & Transaction Lifecycle',
      'Validator Economics & Proof-of-Stake',
      'Privacy Protocols & Cryptographic Primitives',
      'Decentralized Certificate Verification Labs',
      'Testnet Deployment & Contract Verification',
      'Web3 Analytics & On-Chain Forensics',
      'Real-World Asset Tokenization Concepts',
      'Open-Source Protocol Architecture Review',
      'Multi-Sig Workflows & Operational Safety',
      'Building Resilient DApp Frontends',
      'Verified Credential & Smart Contract Capstone',
    ],
    projects: [
      'Design & Test a Verifiable Academic Certificate Smart Contract on Testnet',
      'Perform a Security Checklist Audit Covering Reentrancy & Access Controls',
      'Build a Web3 Read-Only Explorer Interface for Transparent Record Verification',
    ],
    skills: ['Blockchain Architecture', 'Smart Contracts', 'Cryptography', 'Web3 Security', 'DApp Design'],
  },
  'Digital Marketing & SEO': {
    domainGroup: 'Business',
    videoIds: ['bixR-KIJKYM', 'wbJcJCkBcMg', '7QNgqq154gE', 'WV6X0rol5To'],
    topics: [
      'Digital Marketing Strategy & Funnel Design',
      'Search Engine Optimization (On-Page & Technical)',
      'Keyword Research & Search Intent Mapping',
      'Content Marketing & Editorial Authority',
      'Google Analytics 4 & Conversion Attribution',
      'Performance Marketing & Paid Search Basics',
      'Social Media Growth & Community Systems',
      'Email Automation, Segmentation & Retention',
      'Copywriting & High-Converting Landing Pages',
      'Local SEO & Google Business Optimization',
      'YouTube SEO & Video Audience Growth',
      'Link Building & Digital PR Fundamentals',
      'E-Commerce Growth & Marketplace Optimization',
      'Conversion Rate Optimization (CRO) & A/B Tests',
      'Marketing Dashboards & ROI Reporting',
      'B2B Lead Generation & LinkedIn Funnels',
      'Brand Positioning & Audience Research',
      'AI-Assisted Content Research & Workflows',
      'Core Web Vitals & Technical Crawl Audits',
      'Influencer & Creator Partnership Strategy',
      'WhatsApp & Omnichannel Customer Journeys',
      'Startup Go-To-Market Launch Playbook',
      'Schema Markup & Rich Search Snippets',
      'Customer Lifetime Value & Churn Analysis',
      'Media Planning & Budget Allocation',
      'Podcast, Webinar & Event Lead Funnels',
      'Competitor Intelligence & Gap Analysis',
      'Multilingual Regional Marketing in India',
      'App Store Optimization (ASO) Essentials',
      'Marketing Ethics, Consent & Privacy Compliance',
      'CRM Automation & Lead Scoring Models',
      'Storytelling for Non-Profits & Education',
      'Visual Ad Creatives & Hook Testing',
      'Affiliate & Referral Growth Loops',
      'Agency Proposal & Client Reporting Craft',
      'Seasonal Campaign Planning & Execution',
      'Full-Funnel Growth & SEO Audit Capstone',
    ],
    projects: [
      'Conduct a Complete Technical & On-Page SEO Audit with 90-Day Action Roadmap',
      'Build a Full-Funnel Campaign Plan with KPI Dashboard & Budget Model',
      'Craft a High-Converting Landing Page Wireframe & Email Nurture Sequence',
    ],
    skills: ['SEO', 'Performance Marketing', 'Content Strategy', 'Analytics & CRO', 'Growth Funnels'],
  },
  'Electronics & IoT': {
    domainGroup: 'STEM',
    videoIds: ['JMUxmLyrhSk', '_uQrJ0TkZlc', 'ulprqHHWlng', 'aircAruvnKk'],
    topics: [
      'Basic Electronics: Voltage, Current & Circuits',
      'Microcontrollers & Arduino Programming Lab',
      'Raspberry Pi Linux & GPIO Hardware Projects',
      'Sensors, Actuators & Signal Conditioning',
      'IoT Architecture, MQTT & Cloud Telemetry',
      'PCB Design, Schematics & Soldering Craft',
      'Embedded C/C++ Firmware Foundations',
      'Power Electronics, Batteries & Solar Systems',
      'Robotics Kinematics, Motors & Servo Control',
      'ESP32 Wi-Fi & Bluetooth Low Energy Projects',
      'Digital Logic, Gates & Timing Circuits',
      'Oscilloscope, Multimeter & Hardware Debugging',
      'Smart Home & Energy Monitoring Automation',
      'Agricultural & Environmental IoT Monitoring',
      'Edge AI & TinyML on Microcontrollers',
      'Serial Protocols: I2C, SPI & UART Deep Dive',
      'RF Communications, LoRaWAN & Long-Range IoT',
      'Industrial Automation & PLC Concepts',
      'Wearable Electronics & Low-Power Sleep Modes',
      'Audio Amplifiers & Analog Filter Design',
      '3D-Printed Enclosures & Mechanical Integration',
      'IoT Device Security & OTA Firmware Updates',
      'Real-Time Operating Systems (RTOS) Basics',
      'Display Interfacing (OLED, TFT & E-Ink)',
      'Autonomous Line-Follower & Obstacle Robots',
      'Thermal Management & Circuit Protection',
      'Data Logging & Real-Time IoT Dashboards',
      'Computer Architecture & CPU Fundamentals',
      'Drone Flight Controllers & Telemetry Basics',
      'Assistive Technology Hardware Prototyping',
      'EMC, Grounding & Clean Signal Layout',
      'Component Selection & BOM Costing',
      'Automated Weather Station IoT Build',
      'Smart Classroom & Lab Attendance Hardware',
      'Hardware Testing & Reliability Engineering',
      'From Breadboard Prototype to Product',
      'Connected IoT Telemetry System Capstone',
    ],
    projects: [
      'Design a Sensor-to-Cloud IoT Telemetry Architecture with Alert Thresholds',
      'Simulate & Document a Complete Microcontroller Circuit Schematic & Firmware Flow',
      'Build an Energy/Environment Monitoring Dashboard Specification & BOM',
    ],
    skills: ['Circuit Design', 'Arduino & ESP32', 'Raspberry Pi', 'IoT Telemetry', 'Embedded Systems'],
  },
  'Science & Mathematics': {
    domainGroup: 'Academic',
    videoIds: ['aircAruvnKk', 'IHZwWFHWa-w', 'JMUxmLyrhSk', 'i_LwzRVP7bg'],
    topics: [
      'Visual Linear Algebra: Vectors & Matrices',
      'Essence of Calculus: Derivatives & Integrals',
      'Classical Mechanics: Motion, Forces & Energy',
      'Electricity, Magnetism & Wave Optics',
      'Probability, Combinatorics & Number Theory',
      'Algebra Foundations: Equations & Functions',
      'Geometry, Trigonometry & Spatial Proofs',
      'Modern Physics: Relativity & Quantum Intuition',
      'Thermodynamics, Heat & Statistical Physics',
      'Cell Biology, Genetics & Human Physiology',
      'Ecology, Climate Systems & Earth Science',
      'Astronomy, Astrophysics & Space Exploration',
      'Differential Equations & Dynamical Systems',
      'Discrete Mathematics & Graph Theory',
      'Scientific Method & Experimental Design',
      'NCERT & State Board Science Mastery Lab',
      'Fourier Transforms & Signal Intuition',
      'Mathematical Puzzles & Olympiad Reasoning',
      'Fluid Mechanics & Aerodynamics Visualized',
      'Evolutionary Biology & Biodiversity Systems',
      'Neuroscience & How the Brain Learns',
      'Matrices, Eigenvalues & Transformations',
      'Multivariable Calculus & Vector Fields',
      'Statistics, Distributions & Data Literacy',
      'Optics, Lenses & Laser Physics Explained',
      'Acoustics, Sound Waves & Resonance',
      'Microbiology & Immune System Science',
      'Renewable Energy & Physics of Sustainability',
      'Cryptography Math & Prime Numbers',
      'Game Theory & Decision Mathematics',
      'Problem Solving for Board & Competitive Exams',
      'Scientific Computing & Simulation Models',
      'Planetary Science & Orbital Mechanics',
      'Botany, Plant Physiology & Soil Science',
      'Error Analysis, Units & Lab Measurements',
      'Quantitative Reasoning & Analytical Aptitude',
      'Interdisciplinary STEM Investigation Capstone',
    ],
    projects: [
      'Author an Illustrated Concept Guide & Solved 15-Problem Set with Step Proofs',
      'Model a Real Physical or Mathematical Phenomenon with Data Plots & Analysis',
      'Complete a Structured Lab Experiment Report with Hypothesis & Error Margins',
    ],
    skills: ['Mathematics', 'Physics Intuition', 'Scientific Reasoning', 'Problem Solving', 'Analytical Thinking'],
  },
  Chemistry: {
    domainGroup: 'Academic',
    videoIds: ['IHZwWFHWa-w', 'aircAruvnKk', 'JMUxmLyrhSk'],
    topics: [
      'Atomic Structure, Orbitals & Periodic Trends',
      'Chemical Bonding & Molecular Geometry',
      'Stoichiometry, Moles & Reaction Balancing',
      'Organic Chemistry Foundations & Hydrocarbons',
      'Acids, Bases, pH & Buffer Equilibria',
      'Chemical Thermodynamics & Enthalpy',
      'Reaction Kinetics & Catalysis Mechanisms',
      'Electrochemistry, Batteries & Corrosion',
      'Functional Groups & Organic Synthesis',
      'Spectroscopy & Analytical Identification',
      'States of Matter & Gas Laws Mastery',
      'Solutions, Molarity & Colligative Properties',
      'Redox Reactions & Titration Lab Methods',
      'Coordination Chemistry & Transition Metals',
      'Polymers, Biomolecules & Materials Chemistry',
      'Green Chemistry & Environmental Processes',
      'Stereochemistry & Isomerism Visualized',
      'Laboratory Safety & Experimental Precision',
      'Medicinal Chemistry & Molecular Interactions',
      'Surface Chemistry, Colloids & Nanomaterials',
      'Nuclear Chemistry & Radioactivity Basics',
      'Industrial Chemistry & Process Engineering',
      'Food Chemistry & Everyday Reactions',
      'Water Quality Testing & Analytical Labs',
      'Aromatic Compounds & Substitution Pathways',
      'Carbonyl Chemistry: Aldehydes & Ketones',
      'Chemical Equilibrium & Le Chatelier Principle',
      'Solid State Lattices & Crystal Structures',
      'Atmospheric Chemistry & Air Quality Science',
      'Metallurgy & Extraction Principles',
      'Biochemistry: Enzymes, Proteins & Metabolism',
      'Photochemistry & Energy Conversion',
      'Computational Chemistry Concepts',
      'Board & Competitive Chemistry Problem Drills',
      'Qualitative Salt Analysis & Lab Reasoning',
      'Pharmaceutical Formulation Foundations',
      'Applied Chemistry Investigation Capstone',
    ],
    projects: [
      'Build a Reaction Mechanism & Stoichiometry Workbook with 20 Verified Solutions',
      'Prepare an Environmental Water/pH Analytical Chemistry Case Report',
      'Design a Safety-First Virtual Lab Protocol & Molecular Bonding Portfolio',
    ],
    skills: ['Organic Chemistry', 'Inorganic & Physical Chemistry', 'Stoichiometry', 'Lab Analysis', 'Molecular Reasoning'],
  },
};

const TIER_CYCLE: Array<{
  tierName: 'Basics' | 'Intermediate' | 'Advanced';
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  pricingTier: MarketplacePricingTier;
  duration: string;
  estimatedHours: number;
}> = [
  { tierName: 'Basics', level: 'Beginner', price: 300, pricingTier: 'Starter', duration: '6h 30m', estimatedHours: 6.5 },
  { tierName: 'Basics', level: 'Beginner', price: 300, pricingTier: 'Starter', duration: '8h 15m', estimatedHours: 8.2 },
  { tierName: 'Intermediate', level: 'Intermediate', price: 950, pricingTier: 'Professional', duration: '14h 00m', estimatedHours: 14 },
  { tierName: 'Intermediate', level: 'Intermediate', price: 1450, pricingTier: 'Advanced', duration: '18h 30m', estimatedHours: 18.5 },
  { tierName: 'Advanced', level: 'Advanced', price: 2500, pricingTier: 'Specialised', duration: '28h 00m', estimatedHours: 28 },
];

export interface GitHubInterestCategoryStat {
  category: string;
  courseCount: number;
  channelCount: number;
  basicsPrice: number;
  advancedPrice: number;
}

/**
 * Deterministic allocation table mapping each of the 7,008 course indices (1..7008)
 * to one of the 190 GitHub channels + topic + Basics(₹300)..Advanced(₹2500) tier.
 */
interface SlotDescriptor {
  channel: EducationalYouTubeChannel;
  topicIdx: number;
  variantIdx: number;
}

let cachedSlots: SlotDescriptor[] | null = null;
let cachedAllCourses: MarketplaceCourse[] | null = null;
let cachedInterestStats: GitHubInterestCategoryStat[] | null = null;

function buildSlotTable(): SlotDescriptor[] {
  if (cachedSlots) return cachedSlots;
  const totalChannels = EDUCATIONAL_YOUTUBE_CHANNELS.length; // 190
  const basePerChannel = Math.floor(GITHUB_YOUTUBE_COURSE_COUNT / totalChannels); // 36
  const remainder = GITHUB_YOUTUBE_COURSE_COUNT % totalChannels; // 168

  const slots: SlotDescriptor[] = [];
  // Interleave across channels round-robin so page 1 immediately showcases diverse channels & interests
  const maxRounds = basePerChannel + 1;
  for (let round = 0; round < maxRounds; round++) {
    for (let cIdx = 0; cIdx < totalChannels; cIdx++) {
      const channelQuota = basePerChannel + (cIdx < remainder ? 1 : 0);
      if (round < channelQuota) {
        slots.push({
          channel: EDUCATIONAL_YOUTUBE_CHANNELS[cIdx],
          topicIdx: round,
          variantIdx: (round + cIdx) % TIER_CYCLE.length,
        });
      }
    }
  }
  cachedSlots = slots;
  return slots;
}

export function getGitHubInterestCategoryStats(): GitHubInterestCategoryStat[] {
  if (cachedInterestStats) return cachedInterestStats;
  const slots = buildSlotTable();
  const courseCounts = new Map<string, number>();
  const channelCounts = new Map<string, number>();

  for (const ch of EDUCATIONAL_YOUTUBE_CHANNELS) {
    channelCounts.set(ch.category, (channelCounts.get(ch.category) || 0) + 1);
  }
  for (const slot of slots) {
    courseCounts.set(slot.channel.category, (courseCounts.get(slot.channel.category) || 0) + 1);
  }

  cachedInterestStats = EDUCATIONAL_YOUTUBE_CHANNEL_CATEGORIES.map((category) => ({
    category,
    courseCount: courseCounts.get(category) || 0,
    channelCount: channelCounts.get(category) || 0,
    basicsPrice: 300,
    advancedPrice: 2500,
  }));
  return cachedInterestStats;
}

/**
 * Deterministically synthesizes any of the 7,008 GitHub-indexed YouTube Certified Skill Courses (1..7008).
 */
export function synthesizeGitHubYouTubeCourse(index1Based: number): MarketplaceCourse {
  const slots = buildSlotTable();
  const safeIdx = Math.max(1, Math.min(GITHUB_YOUTUBE_COURSE_COUNT, index1Based));
  const slot = slots[safeIdx - 1];
  const ch = slot.channel;
  const spec = CATEGORY_SPECS[ch.category] || CATEGORY_SPECS['Programming & Coding'];
  const tier = TIER_CYCLE[slot.variantIdx];

  const topic = spec.topics[slot.topicIdx % spec.topics.length];
  const videoId = spec.videoIds[(safeIdx + slot.topicIdx) % spec.videoIds.length];
  const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  const id = `OF-YT-${String(safeIdx).padStart(4, '0')}`;

  const tierTitleSuffix =
    tier.tierName === 'Basics'
      ? 'Basics Certification'
      : tier.tierName === 'Intermediate'
      ? 'Applied Skill Track'
      : 'Advanced Mastery Certification';

  const title = `${topic} — ${tierTitleSuffix} (${ch.name})`;
  const benchmark = tier.price * 10;
  const rating = Number((4.6 + ((safeIdx % 4) * 0.1)).toFixed(1));
  const enrolledCount = 420 + ((safeIdx * 73) % 4800);
  const viewCount = Math.max(12000, Math.round(ch.subscriberCount * 0.08) + ((safeIdx * 1319) % 45000));

  return {
    id,
    aliasId: `github-yt-${safeIdx}`,
    title,
    category: ch.category,
    categories: [ch.category, 'Certified Skill Development'],
    categoryGroup: spec.domainGroup,
    subcategory: topic,
    level: tier.level,
    duration: tier.duration,
    estimatedHours: tier.estimatedHours,
    pricingTier: tier.pricingTier,
    price: tier.price,
    marketBenchmarkPrice: benchmark,
    discountPercent: 90,
    isFree: false,
    status: 'Published',
    courseType: 'youtube_video',
    contentType: 'Full course',
    topic,
    libraryCollection: 'github_youtube_7008',
    instructorName: ch.name,
    youtubeChannelName: ch.name,
    youtubeChannelUrl: ch.url,
    youtubeVideoId: videoId,
    youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
    language: ch.language === 'English/Hindi' ? 'English' : ch.language,
    supportedLanguages: ch.language === 'English/Hindi' ? ['English', 'Hindi'] : [ch.language],
    rating,
    reviewCount: 38 + (safeIdx % 210),
    hasVerifiedReviews: true,
    enrolledCount,
    viewCount,
    isPopular: safeIdx <= 240 || ch.subscriberCount >= 2_000_000,
    isTrending: safeIdx % 7 === 0,
    isNew: true,
    isRecommended: safeIdx % 5 === 0 || ch.subscriberCount >= 3_000_000,
    isCareerTrack: true,
    certificateEligibility: true,
    thumbnailUrl: thumb,
    imageUrl: thumb,
    shortDesc: `Certified Skill Development Course by OpenFrame indexed from ${ch.name} (${ch.subscribers} subscribers). Includes YouTube lessons, Quiz, Practical Projects, Submission, Live Score & OpenFrame Certificate.`,
    description: `Structured OpenFrame Certified Skill Development pathway in ${topic} curated with ${ch.name} (${ch.category}, ${ch.subscribers} subscribers). Complete guided YouTube lectures, pass the auto-graded Verification Quiz, build and submit practical capstone projects, receive your combined performance Score, and unlock your QR-verified OpenFrame Skill Development Certificate.`,
    learningObjectives: [
      `Master ${tier.tierName.toLowerCase()}-level ${topic} concepts via curated ${ch.name} lectures`,
      `Pass the OpenFrame Verification Quiz and achieve a certified competency score`,
      `Build and submit hands-on ${ch.category} practical projects for evaluation`,
      `Earn a QR-verified Certified Skill Development Course certificate by OpenFrame`,
    ],
    targetAudience: `Students, self-learners, and professionals pursuing certified ${ch.category} skills (${tier.tierName} · ₹${tier.price}).`,
    skillsAcquired: [topic, ch.category, ...spec.skills.slice(0, 3)],
    practicalProjects: spec.projects,
    modules: [
      {
        moduleNumber: 1,
        title: `Module 1: ${topic} — Foundations & Guided Video Walkthrough`,
        duration: `${Math.max(1.5, Number((tier.estimatedHours * 0.25).toFixed(1)))}h`,
        lessons: [
          `${topic}: Core Principles & Mental Models`,
          `Guided Lecture with ${ch.name}`,
          'Concept Check & Quick Practice',
        ],
        videoIds: [videoId],
      },
      {
        moduleNumber: 2,
        title: `Module 2: Hands-On Implementation & Real-World Workflows`,
        duration: `${Math.max(2, Number((tier.estimatedHours * 0.3).toFixed(1)))}h`,
        lessons: [
          `Step-by-Step Practical Build in ${ch.category}`,
          'Debugging, Optimization & Best Practices',
          'Guided Lab Exercise',
        ],
        videoIds: [spec.videoIds[(safeIdx + 1) % spec.videoIds.length]],
      },
      {
        moduleNumber: 3,
        title: `Module 3: Verification Quiz & Competency Scoring`,
        duration: `${Math.max(1.5, Number((tier.estimatedHours * 0.2).toFixed(1)))}h`,
        lessons: [
          'Timed Verification Quiz (Auto-Graded Score)',
          'Weak-Area Diagnostics & Revision Notes',
        ],
        videoIds: [spec.videoIds[(safeIdx + 2) % spec.videoIds.length]],
      },
      {
        moduleNumber: 4,
        title: `Module 4: Practical Project Submission & OpenFrame Certification`,
        duration: `${Math.max(1.5, Number((tier.estimatedHours * 0.25).toFixed(1)))}h`,
        lessons: [
          spec.projects[0],
          'Project URL / Portfolio Submission & Scoring',
          'Claim QR-Verified OpenFrame Skill Development Certificate',
        ],
        videoIds: [videoId],
      },
    ],
    recommendedVideos: [
      {
        id: `yt-${id}-1`,
        videoId,
        youtubeId: videoId,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        title: `${topic} (${ch.name})`,
        channelTitle: ch.name,
        thumbnail: thumb,
        thumbnailUrl: thumb,
        duration: tier.duration,
        level: tier.level,
        recommendedReason: `Indexed from ${ch.name} (${ch.subscribers} subscribers) for OpenFrame ${ch.category} certification.`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        source: 'github_youtube_channels',
      },
    ],
    assessmentMethod: 'Auto-Graded Quiz + Practical Project Submission + Final Score + OpenFrame Certificate',
    certificateNote: 'Certified Skill Development Course by OpenFrame — QR-verified certificate issued after completing lectures, Quiz, and Project Submission.',
    instructor: {
      name: ch.name,
      role: `${ch.category} Educator (${ch.subscribers} Subscribers)`,
      organization: `${ch.name} · OpenFrame Certified Skill Track`,
    },
    keywords: [
      ch.category,
      ch.name,
      topic,
      tier.tierName,
      'youtube',
      'github',
      'certified skill development',
      'openframe',
      ch.language,
      ...spec.skills,
    ],
    publishedDate: '2026-02-15',
    createdAt: '2026-02-15T00:00:00.000Z',
    updatedAt: '2026-02-15T00:00:00.000Z',
  };
}

export function getAll7008GitHubYouTubeCourses(): MarketplaceCourse[] {
  if (cachedAllCourses) return cachedAllCourses;
  const list: MarketplaceCourse[] = new Array(GITHUB_YOUTUBE_COURSE_COUNT);
  for (let i = 1; i <= GITHUB_YOUTUBE_COURSE_COUNT; i++) {
    list[i - 1] = synthesizeGitHubYouTubeCourse(i);
  }
  cachedAllCourses = list;
  return list;
}

export function resolveGitHubYouTubeCourseById(id: string): MarketplaceCourse | null {
  const m = String(id || '').trim().toLowerCase().match(/^of-yt-0*(\d+)$/);
  if (!m?.[1]) return null;
  const idx = parseInt(m[1], 10);
  if (idx >= 1 && idx <= GITHUB_YOUTUBE_COURSE_COUNT) {
    return synthesizeGitHubYouTubeCourse(idx);
  }
  return null;
}

export function queryGitHubYouTubeCourses(params: {
  category?: string;
  tier?: 'All' | 'Basics' | 'Intermediate' | 'Advanced';
  language?: string;
  query?: string;
  channel?: string;
  page?: number;
  pageSize?: number;
}): {
  courses: MarketplaceCourse[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  const all = getAll7008GitHubYouTubeCourses();
  const cat = params.category && params.category !== 'All' ? params.category.toLowerCase() : '';
  const tier = params.tier && params.tier !== 'All' ? params.tier : '';
  const lang = params.language && params.language !== 'All' ? params.language.toLowerCase() : '';
  const chFilter = (params.channel || '').trim().toLowerCase();
  const q = (params.query || '').trim().toLowerCase();

  const filtered = all.filter((c) => {
    if (cat && c.category.toLowerCase() !== cat) return false;
    if (tier === 'Basics' && c.price !== 300) return false;
    if (tier === 'Intermediate' && (c.price <= 300 || c.price >= 2500)) return false;
    if (tier === 'Advanced' && c.price !== 2500) return false;
    if (lang && !(c.language || '').toLowerCase().includes(lang) && !(c.supportedLanguages || []).some((l) => l.toLowerCase().includes(lang))) {
      return false;
    }
    if (chFilter && !(c.youtubeChannelName || '').toLowerCase().includes(chFilter)) return false;
    if (q) {
      const hay = `${c.id} ${c.title} ${c.category} ${c.subcategory} ${c.youtubeChannelName || ''} ${(c.keywords || []).join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(60, params.pageSize || 12));
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;

  return {
    courses: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}
