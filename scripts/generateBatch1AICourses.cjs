const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🤖 GENERATING BATCH 1: COURSES OF-AI-001 TO OF-AI-100');
console.log('CATEGORY: Artificial Intelligence, Generative AI & ML');
console.log('====================================================\n');

const SUB_SUBJECTS = [
  { name: "Artificial Intelligence Fundamentals", domain: "Foundations", icon: "cpu", hue: 215 },
  { name: "Generative AI", domain: "GenAI", icon: "sparkles", hue: 270 },
  { name: "ChatGPT", domain: "Language Models", icon: "message-square", hue: 160 },
  { name: "Google Gemini AI", domain: "Multimodal AI", icon: "zap", hue: 220 },
  { name: "Microsoft Copilot", domain: "Workplace AI", icon: "briefcase", hue: 200 },
  { name: "Prompt Engineering", domain: "Cognitive AI", icon: "terminal", hue: 280 },
  { name: "AI Automation", domain: "Enterprise AI", icon: "workflow", hue: 185 },
  { name: "AI Agents", domain: "Autonomous Systems", icon: "bot", hue: 250 },
  { name: "Machine Learning", domain: "Algorithms", icon: "activity", hue: 230 },
  { name: "Deep Learning", domain: "Deep Neural Nets", icon: "layers", hue: 260 },
  { name: "Neural Networks", domain: "Architectures", icon: "share-2", hue: 240 },
  { name: "Natural Language Processing", domain: "NLP", icon: "file-text", hue: 175 },
  { name: "Computer Vision", domain: "Vision Systems", icon: "eye", hue: 195 },
  { name: "AI Image Generation", domain: "Diffusion & Media", icon: "image", hue: 310 },
  { name: "AI Video Generation", domain: "Generative Video", icon: "video", hue: 330 },
  { name: "AI Audio Generation", domain: "Audio Synthesis", icon: "volume-2", hue: 140 },
  { name: "AI for Business", domain: "Commercial AI", icon: "trending-up", hue: 150 },
  { name: "AI for Education", domain: "EdTech AI", icon: "book-open", hue: 45 },
  { name: "AI for Healthcare", domain: "Clinical AI", icon: "heart", hue: 350 },
  { name: "AI for Marketing", domain: "Growth & Media", icon: "target", hue: 30 },
  { name: "AI for Finance", domain: "FinTech AI", icon: "dollar-sign", hue: 130 },
  { name: "AI for Entrepreneurship", domain: "Venture AI", icon: "rocket", hue: 20 },
  { name: "AI for Agriculture", domain: "AgriTech AI", icon: "feather", hue: 110 },
  { name: "AI for Data Analytics", domain: "Analytics AI", icon: "bar-chart-2", hue: 210 },
  { name: "Python for AI", domain: "AI Programming", icon: "code", hue: 40 },
  { name: "TensorFlow", domain: "Deep Learning Frameworks", icon: "box", hue: 25 },
  { name: "PyTorch", domain: "Deep Learning Frameworks", icon: "flame", hue: 15 },
  { name: "OpenAI API Development", domain: "Developer Platforms", icon: "cloud", hue: 170 },
  { name: "AI Chatbot Development", domain: "Conversational AI", icon: "message-circle", hue: 190 },
  { name: "AI Application Development", domain: "Full-Stack AI", icon: "smartphone", hue: 225 }
];

// YouTube curation templates for video learning system
const YOUTUBE_CHANNELS = [
  "Google Cloud Tech", "DeepLearning.AI", "TensorFlow", "MIT OpenCourseWare",
  "Stanford Online", "freeCodeCamp.org", "IBM Technology", "StatQuest with Josh Starmer",
  "Two Minute Papers", "OpenAI", "Microsoft Developer", "Andrej Karpathy"
];

const TIERS = [
  { tier: 'Starter', price: 499 },
  { tier: 'Basic', price: 999 },
  { tier: 'Professional', price: 1499 },
  { tier: 'Advanced', price: 2499 },
  { tier: 'Specialised', price: 3999 }
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

// Generate SVG thumbnail with unique visuals
function generateSvgThumbnail(index, subject, title, level, id) {
  const hue = (subject.hue + index * 7) % 360;
  const hue2 = (hue + 45) % 360;
  const darkHue = 222;

  // Generate dynamic geometric and circuit nodes
  let nodes = '';
  for (let i = 0; i < 6; i++) {
    const cx = 100 + (i * 90) % 500;
    const cy = 60 + ((i * 47) % 180);
    const r = 4 + (i % 3) * 3;
    nodes += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="hsla(${hue}, 85%, 65%, 0.4)" />`;
    nodes += `<line x1="${cx}" y1="${cy}" x2="${cx + 60}" y2="${cy + 40}" stroke="hsla(${hue2}, 70%, 60%, 0.25)" stroke-width="1.5" stroke-dasharray="3 3"/>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="100%" height="100%">
  <defs>
    <linearGradient id="bg-${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071326"/>
      <stop offset="60%" stop-color="#0B1A33"/>
      <stop offset="100%" stop-color="hsl(${hue}, 40%, 12%)"/>
    </linearGradient>
    <linearGradient id="glow-${index}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="hsl(${hue}, 90%, 60%)"/>
      <stop offset="100%" stop-color="hsl(${hue2}, 95%, 65%)"/>
    </linearGradient>
    <radialGradient id="radial-${index}" cx="75%" cy="30%" r="60%">
      <stop offset="0%" stop-color="hsla(${hue}, 80%, 55%, 0.35)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="640" height="360" fill="url(#bg-${index})" />
  <rect width="640" height="360" fill="url(#radial-${index})" />

  <!-- Grid mesh -->
  <g opacity="0.12" stroke="#60A5FA" stroke-width="1">
    <line x1="0" y1="90" x2="640" y2="90" />
    <line x1="0" y1="180" x2="640" y2="180" />
    <line x1="0" y1="270" x2="640" y2="270" />
    <line x1="160" y1="0" x2="160" y2="360" />
    <line x1="320" y1="0" x2="320" y2="360" />
    <line x1="480" y1="0" x2="480" y2="360" />
  </g>

  <!-- Neural Nodes -->
  <g>${nodes}</g>

  <!-- Tech Accent Badge -->
  <g transform="translate(40, 36)">
    <rect width="130" height="26" rx="13" fill="hsla(${hue}, 80%, 45%, 0.2)" stroke="hsl(${hue}, 80%, 60%)" stroke-width="1"/>
    <text x="65" y="17" fill="#E2E8F0" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="700" text-anchor="middle" letter-spacing="1">OPENFRAME AI</text>
  </g>

  <!-- Level Badge -->
  <g transform="translate(180, 36)">
    <rect width="90" height="26" rx="13" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="45" y="17" fill="#93C5FD" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="600" text-anchor="middle">${level.toUpperCase()}</text>
  </g>

  <!-- Course ID Pill -->
  <g transform="translate(520, 36)">
    <rect width="80" height="26" rx="8" fill="#0F172A" stroke="#334155" stroke-width="1"/>
    <text x="40" y="17" fill="#38BDF8" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">${id}</text>
  </g>

  <!-- Decorative Hexagon Tech Emblem -->
  <g transform="translate(500, 200)" opacity="0.85">
    <polygon points="50,0 100,28 100,85 50,113 0,85 0,28" fill="hsla(${hue}, 70%, 30%, 0.25)" stroke="url(#glow-${index})" stroke-width="2.5" />
    <circle cx="50" cy="56" r="18" fill="hsl(${hue2}, 85%, 60%)" opacity="0.8" />
    <text x="50" y="61" fill="#FFFFFF" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">AI</text>
  </g>

  <!-- Main Title & Subject -->
  <text x="40" y="180" fill="hsl(${hue2}, 95%, 75%)" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="13" font-weight="700" letter-spacing="1.5">${subject.name.toUpperCase()}</text>
  <foreignObject x="40" y="195" width="440" height="90">
    <div xmlns="http://www.w3.org/1999/xhtml" style="color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; font-size: 20px; font-weight: 800; line-height: 1.25; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
      ${title}
    </div>
  </foreignObject>

  <!-- Footer Info Line -->
  <g transform="translate(40, 310)">
    <line x1="0" y1="0" x2="560" y2="0" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
    <text x="0" y="24" fill="#94A3B8" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11">OpenFrame Education • Practical Project &amp; Verified Certification</text>
    <text x="560" y="24" fill="hsl(${hue}, 90%, 65%)" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="11" font-weight="700" text-anchor="end">BATCH 1 / 100</text>
  </g>
</svg>`;

  return svg;
}

// Generate the 100 courses
const courses = [];
const imageDir = path.resolve(__dirname, '../public/assets/images/courses');
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

let imageCount = 0;

for (let i = 1; i <= 100; i++) {
  const courseNumStr = String(i).padStart(3, '0');
  const id = `OF-AI-${courseNumStr}`;
  const subjectIndex = (i - 1) % SUB_SUBJECTS.length;
  const subject = SUB_SUBJECTS[subjectIndex];
  const level = LEVELS[(i - 1) % LEVELS.length];
  const tier = TIERS[(i - 1) % TIERS.length];

  // Variations to create rich distinct titles
  const variationIndex = Math.floor((i - 1) / SUB_SUBJECTS.length);
  const prefixes = [
    "Foundations & Applied Implementation of",
    "Complete Professional Masterclass in",
    "Applied Engineering & Production Architecture for",
    "Advanced Enterprise Workflows & Solutions in"
  ];
  const suffixes = [
    ": From Core Principles to Deployment",
    ": Practical Project Portfolio & Architecture",
    ": Hands-On System Design & Capstone",
    ": Certified Professional Implementation Track"
  ];

  const prefix = prefixes[variationIndex % prefixes.length];
  const suffix = suffixes[variationIndex % suffixes.length];
  const title = `${prefix} ${subject.name}${suffix}`;

  // Unique SVG image per course
  const svgFilename = `of_ai_${courseNumStr}.svg`;
  const svgFilePath = path.join(imageDir, svgFilename);
  const svgContent = generateSvgThumbnail(i, subject, title, level, id);
  fs.writeFileSync(svgFilePath, svgContent, 'utf-8');
  imageCount++;

  const imageUrl = `/assets/images/courses/${svgFilename}`;

  // Generate 8 to 12 modules
  const moduleCount = 8 + (i % 5); // 8, 9, 10, 11, or 12 modules
  const modules = [];

  const baseLessons = [
    ["Foundations & System Architecture", ["Conceptual Overview", "Environment & Workspace Setup", "First Principles & Theoretical Bounds", "Guided Lab: Architecture Walkthrough"]],
    ["Core Mechanics & Pipeline Engineering", ["Workflow Mechanics", "Data Ingestion & Formatting", "Parameter Optimization", "Practical Debugging Session"]],
    ["Applied Implementation & Tooling", ["Tooling Integration", "State Management & Context Windows", "Handling Edge Cases", "Interactive Problem-Solving Drills"]],
    ["Production Architecture & Scalability", ["Scaling Strategies", "Latency & Cost Trade-offs", "Security & Guardrails", "Production Deployment Case Study"]],
    ["Integration with Modern Stacks", ["API Connectors", "Event-Driven Hooks", "Middleware Configuration", "End-to-End Test Suite Setup"]],
    ["Monitoring, Auditing & Evaluation", ["Performance Telemetry", "Accuracy & Quality Metrics", "Bias & Error Detection", "Audit Report Generation"]],
    ["Advanced Techniques & Emerging Patterns", ["Next-Generation Patterns", "Agentic Loops & Orchestration", "Hybrid Fallback Designs", "Optimization Deep Dive"]],
    ["Industry Capstone Planning & Execution", ["Requirement Analysis", "Design Specifications", "Milestone 1 Implementation", "Peer Code Review"]],
    ["Project Finalization & Presentation", ["Complete Build Verification", "Live Demonstration Scripting", "Submission Packaging", "Teacher Evaluation Readiness"]],
    ["Accreditation Review & Portfolio Synthesis", ["Comprehensive Knowledge Audit", "Rubric Evaluation Review", "Professional Portfolio Integration", "OpenFrame Certificate Finalization"]],
    ["Enterprise Deployment Case Studies", ["Real-World Enterprise Study", "Operational Migration Patterns", "Post-Launch Retrospectives", "Continuous Improvement Pipelines"]],
    ["Mastery Defense & Final Assessment", ["Mastery Defense Preparation", "Defending Architectural Trade-offs", "Final Live Evaluation", "Career Integration Strategy"]]
  ];

  for (let m = 0; m < moduleCount; m++) {
    const modConfig = baseLessons[m % baseLessons.length];
    modules.push({
      moduleNumber: m + 1,
      title: `Module ${m + 1}: ${modConfig[0]} in ${subject.name}`,
      duration: `${(2.5 + (m % 3) * 0.5).toFixed(1)} Hours`,
      lessons: modConfig[1].map((l, lIdx) => `Lesson ${m + 1}.${lIdx + 1}: ${l}`)
    });
  }

  const durationHours = 20 + moduleCount * 3 + (i % 7);

  // Practical project
  const practicalProjectTitle = `Capstone: Production-Ready ${subject.name} Solution`;
  const practicalProjects = [
    practicalProjectTitle,
    `Interactive Project: End-to-End Implementation of ${subject.name} for Real-World Workflows`
  ];

  // Video recommendations for LMS
  const recommendedVideos = [
    {
      id: `vid-${id}-1`,
      videoId: `yt_ai_${courseNumStr}_1`,
      title: `${subject.name} - Complete High-Yield Concept Masterclass`,
      channelTitle: YOUTUBE_CHANNELS[(i + 1) % YOUTUBE_CHANNELS.length],
      thumbnail: imageUrl,
      duration: "42:15",
      level: "Beginner",
      recommendedReason: `Fundamental theoretical grounding and environment setup for ${subject.name}.`,
      embedUrl: `https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ`
    },
    {
      id: `vid-${id}-2`,
      videoId: `yt_ai_${courseNumStr}_2`,
      title: `Applied Engineering & Hands-On Architecture: ${subject.name}`,
      channelTitle: YOUTUBE_CHANNELS[(i + 3) % YOUTUBE_CHANNELS.length],
      thumbnail: imageUrl,
      duration: "58:30",
      level: "Intermediate",
      recommendedReason: `Step-by-step code implementation and pipeline design patterns.`,
      embedUrl: `https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ`
    },
    {
      id: `vid-${id}-3`,
      videoId: `yt_ai_${courseNumStr}_3`,
      title: `Production Optimization and Industry Case Study: ${subject.name}`,
      channelTitle: YOUTUBE_CHANNELS[(i + 5) % YOUTUBE_CHANNELS.length],
      thumbnail: imageUrl,
      duration: "35:10",
      level: "Advanced",
      recommendedReason: `Production scaling, error handling, and performance optimization guidelines.`,
      embedUrl: `https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ`
    }
  ];

  const courseRecord = {
    id: id,
    aliasId: `OF-CRS-${String(i).padStart(4, '0')}`,
    title: title,
    category: "Artificial Intelligence",
    categoryGroup: "Technology",
    subcategory: subject.name,
    level: level,
    duration: `${durationHours} Hours (${moduleCount} Modules)`,
    pricingTier: tier.tier,
    price: tier.price,
    status: i <= 70 ? "Published" : i <= 90 ? "Ready to Publish" : "Content Development",
    isPopular: i % 4 === 0,
    isTrending: i % 3 === 0,
    isNew: i % 5 === 0,
    isRecommended: i % 2 === 0,
    isCareerTrack: i % 6 === 0,
    rating: +(4.7 + (i % 4) * 0.07).toFixed(1),
    enrolledCount: 85 + (i * 14),
    imageUrl: imageUrl,
    shortDesc: `Comprehensive practical syllabus in ${subject.name}. Students learn fundamental theory, pipeline design, real-world development, and complete an accredited capstone project evaluated by OpenFrame faculty.`,
    description: `Master modern ${subject.name} with an industry-aligned curriculum from OpenFrame Education, conducted in association with HopeNest Global Foundation. This course moves beyond passive video consumption to deliver hands-on technical proficiency, cognitive model verification, practical project building, and structured teacher evaluation.\n\nTopics Covered: Foundational principles, system design, modern tooling setup, error handling, performance benchmarks, and end-to-end production deployment.\n\nPractical Skills: Learners will write clean code, configure production pipelines, implement robust validation, and construct verifiable capstone projects.\n\nTarget Learners: Aspiring software engineers, data analysts, technical product leads, students, and practitioners aiming for verifiable industry certification.\n\nCareer Outcomes: Upon passing Quinn AI assessments and teacher project evaluations, students earn a verifiable OpenFrame Certificate with QR verification.`,
    descriptionBreakdown: {
      whatStudentWillLearn: `Gain rigorous hands-on proficiency in ${subject.name}, covering core algorithms, framework design, and production workflows.`,
      whySubjectMatters: `${subject.name} is transforming modern digital infrastructure and is an essential capability for competitive technical careers in 2026.`,
      topicsCovered: `System architecture, ${subject.name} mechanics, security constraints, performance optimization, and project deployment.`,
      practicalSkillsDeveloped: `Debugging, pipeline configuration, unit testing, performance optimization, and project presentation.`,
      whoShouldEnrol: `Engineers, students, technical leaders, and professionals targeting high-impact competency in ${subject.name}.`,
      achieveAfterCompletion: `Verifiable portfolio project, Quinn AI verified quiz credentials, and an accredited OpenFrame Education Certificate.`
    },
    learningObjectives: [
      `Understand foundational theory and modern paradigms of ${subject.name}`,
      `Configure and optimize real-world pipelines with industry best practices`,
      `Design and execute an end-to-end practical capstone project`,
      `Demonstrate project outcomes through structured presentation and rubric evaluation`
    ],
    modules: modules,
    targetAudience: `Software developers, college students, data professionals, and practitioners targeting certified excellence in ${subject.name}.`,
    skillsAcquired: [
      subject.name,
      "System Architecture",
      "Model Inference",
      "Production Pipeline Design",
      "Applied Debugging & Optimization"
    ],
    practicalProjects: practicalProjects,
    assessmentMethod: "Quinn AI 15-Question Verified Assessment & Teacher Rubric Evaluation (100 Marks)",
    certificateEligibility: true,
    certificateNote: "OpenFrame Education Accredited Certificate with Public QR Verification",
    instructor: {
      name: "OpenFrame Academic Faculty & AI Labs",
      role: "Lead Systems & Curriculum Specialist",
      organization: "OpenFrame Education & HopeNest Global Foundation",
      bio: `Dedicated technical mentors and curriculum engineers specialising in modern ${subject.name} development.`
    },
    recommendedVideos: recommendedVideos,
    updatedAt: new Date().toISOString()
  };

  courses.push(courseRecord);
}

// 1. Write batch_1.json
const batch1File = path.resolve(__dirname, '../public/data/batch_1.json');
fs.writeFileSync(batch1File, JSON.stringify(courses, null, 2), 'utf-8');
console.log(`✅ Saved 100 courses to ${batch1File}`);

// 2. Update marketplace_courses.json (replace first 100 or merge)
const allCoursesFile = path.resolve(__dirname, '../public/data/marketplace_courses.json');
if (fs.existsSync(allCoursesFile)) {
  try {
    const existing = JSON.parse(fs.readFileSync(allCoursesFile, 'utf-8'));
    // Replace first 100 with the newly detailed batch 1 courses
    const updated = [...courses, ...existing.slice(100)];
    fs.writeFileSync(allCoursesFile, JSON.stringify(updated, null, 2), 'utf-8');
    console.log(`✅ Updated central database ${allCoursesFile} (Total courses: ${updated.length})`);
  } catch (err) {
    console.error('Error updating marketplace_courses.json:', err);
  }
}

// 3. Verification Report
const idSet = new Set(courses.map(c => c.id));
const titleSet = new Set(courses.map(c => c.title));

console.log('\n====================================================');
console.log('📊 COMPLETION REPORT: BATCH 1 – COURSES 001 TO 100');
console.log('====================================================');
console.log(`Total courses created : ${courses.length}`);
console.log(`Images generated      : ${imageCount}`);
console.log(`Unique Course IDs     : ${idSet.size} / 100 (OF-AI-001 to OF-AI-100)`);
console.log(`Unique Course Titles  : ${titleSet.size} / 100`);
console.log(`Courses saved successfully: ${courses.length}`);
console.log(`Courses remaining     : 1,400 (Batches 2–15)`);
console.log(`First Course ID       : ${courses[0].id} - "${courses[0].title}"`);
console.log(`Last Course ID        : ${courses[99].id} - "${courses[99].title}"`);
console.log('====================================================\n');
