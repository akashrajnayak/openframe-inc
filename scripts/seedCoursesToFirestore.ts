#!/usr/bin/env node

/**
 * OpenFrame Education - Firestore 15,000-Course Data Migration Utility
 *
 * Systematically seeds 15,000 distinct course records into the Firebase Firestore database
 * (ai-studio-openframeitsolut-6d1feef7-d189-4082-b3a7-60946669f3e7), ensuring each course has:
 *  - Unique ID (OF-CRS-00001 through OF-CRS-15000, with OF-AI-001..OF-AI-100 aliases)
 *  - 90 specialized categories with domain groups
 *  - Full metadata, learning objectives, 8 curriculum modules, and practical capstone projects
 *  - Atomic writeBatch operations (up to 500 records per batch)
 *
 * Usage:
 *   npx tsx scripts/seedCoursesToFirestore.ts [options]
 *
 * Options:
 *   --start=<num>       Starting index (default: 1)
 *   --end=<num>         Ending index (default: 15000)
 *   --count=<num>       Alternative to end (e.g., --count=100)
 *   --batch-size=<num>  Batch size per write (default: 200, max: 500)
 *   --throttle=<ms>     Pacing delay between batches in ms (default: 100)
 *   --dry-run           Simulate generation & validation without writing to DB
 *   --verify-only       Check existing document count in Firestore and exit
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  doc,
  writeBatch,
  collection,
  getCountFromServer,
  getDoc
} from 'firebase/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load firebase-applet-config.json
const configPath = path.resolve(__dirname, '../firebase-applet-config.json');
if (!fs.existsSync(configPath)) {
  console.error('❌ Error: firebase-applet-config.json not found at:', configPath);
  process.exit(1);
}

const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Parse CLI flags
const args = process.argv.slice(2);
function getArgValue(name: string, defaultValue: string): string {
  const prefix = `--${name}=`;
  const found = args.find((a) => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : defaultValue;
}

const hasFlag = (name: string) => args.includes(`--${name}`);

const TARGET_TOTAL_COURSES = 15000;
let startIndex = parseInt(getArgValue('start', '1'), 10);
let endIndex = parseInt(getArgValue('end', String(TARGET_TOTAL_COURSES)), 10);
const countArg = getArgValue('count', '');
if (countArg) {
  endIndex = startIndex + parseInt(countArg, 10) - 1;
}

const batchSize = Math.max(10, Math.min(500, parseInt(getArgValue('batch-size', '200'), 10)));
const throttleDelayMs = parseInt(getArgValue('throttle', '100'), 10);
const isDryRun = hasFlag('dry-run');
const verifyOnly = hasFlag('verify-only');

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Category definitions
const ALL_90_CATEGORIES = [
  "Artificial Intelligence", "Generative AI", "Machine Learning", "Deep Learning", "Data Science",
  "Data Analytics", "Python Programming", "Java Programming", "C Programming", "C++ Programming",
  "JavaScript", "Web Development", "Full Stack Development", "App Development", "Android Development",
  "iOS Development", "Cybersecurity", "Ethical Hacking", "Cloud Computing", "AWS", "Microsoft Azure",
  "Google Cloud", "Networking", "Blockchain", "Cryptocurrency Technology", "Robotics", "Internet of Things",
  "Electronics", "UI/UX Design", "Graphic Design", "Photoshop", "Video Editing", "Animation",
  "Digital Marketing", "SEO", "Social Media Marketing", "Content Creation", "Business Management",
  "Entrepreneurship", "Startup Development", "Financial Literacy", "Accounting", "Banking",
  "Stock Market Education", "Project Management", "Human Resource Management", "Communication Skills",
  "Spoken English", "Personality Development", "Leadership", "Career Development", "Interview Preparation",
  "Mathematics", "Science", "Physics", "Chemistry", "Biology", "Environmental Science",
  "Agriculture Technology", "Rural Entrepreneurship", "Healthcare Education", "Nutrition", "Psychology",
  "Emotional Intelligence", "IQ Development", "SQ Development", "Parenting Education", "Teaching Skills",
  "Teacher Training", "School Education", "Competitive Exam Preparation", "Creative Writing",
  "Foreign Languages", "Photography", "Music", "Interior Design", "Fashion Design",
  "Hospitality Management", "Tourism", "Legal Awareness", "Sustainability", "Renewable Energy",
  "Solar Technology", "Manufacturing Technology", "Automobile Technology", "Career and Vocational Skills",
  "Agriculture and Food Processing", "Women Entrepreneurship", "Life Skills", "Personal Productivity"
];

const DOMAIN_GROUPS_BY_CATEGORY: Record<string, string> = {
  "Artificial Intelligence": "Technology",
  "Generative AI": "Technology",
  "Machine Learning": "Technology",
  "Deep Learning": "Technology",
  "Data Science": "Technology",
  "Data Analytics": "Technology",
  "Python Programming": "Technology",
  "Java Programming": "Technology",
  "C Programming": "Technology",
  "C++ Programming": "Technology",
  "JavaScript": "Technology",
  "Web Development": "Technology",
  "Full Stack Development": "Technology",
  "App Development": "Technology",
  "Android Development": "Technology",
  "iOS Development": "Technology",
  "Cybersecurity": "Technology",
  "Ethical Hacking": "Technology",
  "Cloud Computing": "Technology",
  "AWS": "Technology",
  "Microsoft Azure": "Technology",
  "Google Cloud": "Technology",
  "Networking": "Technology",
  "Blockchain": "Technology",
  "Cryptocurrency Technology": "Technology",
  "Robotics": "STEM",
  "Internet of Things": "STEM",
  "Electronics": "STEM",
  "UI/UX Design": "Creative",
  "Graphic Design": "Creative",
  "Photoshop": "Creative",
  "Video Editing": "Creative",
  "Animation": "Creative",
  "Digital Marketing": "Business",
  "SEO": "Business",
  "Social Media Marketing": "Business",
  "Content Creation": "Creative",
  "Business Management": "Business",
  "Entrepreneurship": "Business",
  "Startup Development": "Business",
  "Financial Literacy": "Business",
  "Accounting": "Business",
  "Banking": "Business",
  "Stock Market Education": "Business",
  "Project Management": "Business",
  "Human Resource Management": "Business",
  "Communication Skills": "Professional",
  "Spoken English": "Professional",
  "Personality Development": "Professional",
  "Leadership": "Professional",
  "Career Development": "Professional",
  "Interview Preparation": "Professional",
  "Mathematics": "Academic",
  "Science": "Academic",
  "Physics": "Academic",
  "Chemistry": "Academic",
  "Biology": "Academic",
  "Environmental Science": "Academic",
  "Agriculture Technology": "Wellbeing",
  "Rural Entrepreneurship": "Wellbeing",
  "Healthcare Education": "Wellbeing",
  "Nutrition": "Wellbeing",
  "Psychology": "Wellbeing",
  "Emotional Intelligence": "Intelligence",
  "IQ Development": "Intelligence",
  "SQ Development": "Intelligence",
  "Parenting Education": "Intelligence",
  "Teaching Skills": "Intelligence",
  "Teacher Training": "Intelligence",
  "School Education": "Academic",
  "Competitive Exam Preparation": "Academic",
  "Creative Writing": "Creative",
  "Foreign Languages": "Academic",
  "Photography": "Creative",
  "Music": "Creative",
  "Interior Design": "Creative",
  "Fashion Design": "Creative",
  "Hospitality Management": "Business",
  "Tourism": "Business",
  "Legal Awareness": "Academic",
  "Sustainability": "Wellbeing",
  "Renewable Energy": "STEM",
  "Solar Technology": "STEM",
  "Manufacturing Technology": "STEM",
  "Automobile Technology": "STEM",
  "Career and Vocational Skills": "Professional",
  "Agriculture and Food Processing": "Wellbeing",
  "Women Entrepreneurship": "Wellbeing",
  "Life Skills": "Professional",
  "Personal Productivity": "Professional"
};

const FOCUS_AREAS = [
  "Core Architecture & Foundations",
  "Applied Enterprise Implementation",
  "Production Pipelines & Workflows",
  "High-Performance System Scaling",
  "Zero-to-Hero Engineering Track",
  "Industrial Capstone & Defense",
  "Security Hardening & Best Practices",
  "Automated Workflows & Tooling",
  "Real-Time Optimization & Telemetry",
  "Advanced Algorithm Design & Patterns",
  "Practical Lab & Debugging Suite",
  "Portfolio Project & Verified Certification"
];

const SPECIALIZATIONS = [
  "Enterprise Cloud",
  "Financial Systems",
  "HealthTech & Bio",
  "E-Commerce Scalability",
  "Smart Cities & IoT",
  "Autonomous Systems",
  "Big Data Infrastructure",
  "Mobile & Edge Devices",
  "DevSecOps & SRE",
  "Distributed Networks"
];

function generateCourseDocument(index: number, batchNumber = 1) {
  const catIndex = (index - 1) % ALL_90_CATEGORIES.length;
  const category = ALL_90_CATEGORIES[catIndex];
  const categoryGroup = DOMAIN_GROUPS_BY_CATEGORY[category] || 'Technology';
  const focus = FOCUS_AREAS[(index * 7) % FOCUS_AREAS.length];
  const spec = SPECIALIZATIONS[(index * 3) % SPECIALIZATIONS.length];
  const subcategory = `${category} - ${spec}`;

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
  const level = levels[(index * 13) % levels.length];

  const durations = [
    '16 Hours (Fast Track)',
    '24 Hours (Full Course)',
    '36 Hours (Comprehensive)',
    '45 Hours (Masterclass)',
    '60 Hours (Deep Dive Bootcamp)'
  ];
  const duration = durations[(index * 11) % durations.length];
  const estimatedHours = 16 + ((index * 9) % 45);

  const pricingTiers = ['Free', 'Starter', 'Basic', 'Professional', 'Advanced', 'Specialised'];
  const pricingTier = pricingTiers[(index * 17) % pricingTiers.length];
  const priceValues: Record<string, number> = {
    Free: 0,
    Starter: 199,
    Basic: 499,
    Professional: 999,
    Advanced: 1499,
    Specialised: 2499
  };
  const price = priceValues[pricingTier] ?? 499;

  const rating = Number((4.65 + ((index % 35) / 100)).toFixed(2));
  const enrolledCount = 95 + ((index * 83) % 2400);

  let imageUrl = '/assets/images/academic_education.jpg';
  if (categoryGroup === 'Creative') imageUrl = '/assets/images/graphic_design_media.jpg';
  else if (categoryGroup === 'Business') imageUrl = '/assets/images/entrepreneurship_finance.jpg';
  else if (categoryGroup === 'STEM') imageUrl = '/assets/images/robotics_stem.jpg';
  else if (categoryGroup === 'Wellbeing') imageUrl = '/assets/images/agriculture_rural_innovation.jpg';
  else if (categoryGroup === 'Professional') imageUrl = '/assets/images/career_development.jpg';
  else if (categoryGroup === 'Intelligence') imageUrl = '/assets/images/iq_eq_sq_development.jpg';
  else if (category.includes('Programming') || category.includes('Development') || category.includes('AI'))
    imageUrl = '/assets/images/artificial_intelligence.jpg';

  const id = `OF-CRS-${String(index).padStart(5, '0')}`;
  const title = `${category}: ${focus} [${spec}]`;
  const nowIso = new Date().toISOString();

  let aliasId: string | undefined;
  if (index <= 100) {
    aliasId = `OF-AI-${String(index).padStart(3, '0')}`;
  }

  const modules = Array.from({ length: 8 }, (_, mIdx) => ({
    moduleNumber: mIdx + 1,
    title: `Module ${mIdx + 1}: ${category} ${focus.split(' ')[0]} - Stage ${mIdx + 1}`,
    duration: `${Math.floor(estimatedHours / 8)} Hours`
  }));

  return {
    id,
    aliasId,
    title: title.slice(0, 200),
    category: category.slice(0, 100),
    categoryGroup: categoryGroup.slice(0, 80),
    subcategory: subcategory.slice(0, 100),
    level,
    duration: duration.slice(0, 80),
    estimatedHours,
    pricingTier,
    price,
    status: index % 15 === 0 ? 'Ready to Publish' : 'Published',
    rating,
    enrolledCount,
    imageUrl,
    tags: [category, spec, 'OpenFrame Education', 'Certification 2026-27'],
    shortDesc: `Master ${category} with a disciplined focus on ${focus} and enterprise ${spec} architectures. Includes guided labs and verified certification.`,
    description: `Comprehensive professional curriculum in ${category} authored and evaluated by OpenFrame Education in association with HopeNest Global Foundation.`,
    overview: {
      whySubjectMatters: `${category} is rapidly reshaping industry requirements. Hands-on competence in ${spec} unlocks certified career opportunities.`,
      topicsCovered: `${category} foundations, tooling, pipeline architecture, debugging, and production capstone defense.`,
      practicalSkillsDeveloped: `System design, implementation, performance benchmarking, real-time analytics, and rubric defense.`,
      whoShouldEnrol: `School students, college engineering candidates, career switchers, and working technical professionals.`,
      achieveAfterCompletion: `Build verified artifacts, earn an authentic OpenFrame verification certificate, and qualify for placement referrals.`
    },
    learningObjectives: [
      `Master core formal theories and practical syntax of ${category}`,
      `Design and deploy robust ${spec} implementations`,
      `Analyze performance bottlenecks and enforce security best practices`,
      `Deliver and defend a verified capstone project`
    ],
    modulesCount: modules.length,
    modulesSummary: modules,
    practicalProjects: [
      `Capstone 1: Industrial ${category} Setup & Architecture`,
      `Capstone 2: Real-World ${spec} Implementation Lab`,
      `Capstone 3: Production Deployment & Rubric Defense`
    ],
    assessmentMethod: `15-Question Verification Quiz + Capstone Project Review + Teacher Rubric Evaluation (100 Marks)`,
    certificateEligibility: true,
    certificateNote: `Verified OpenFrame Education & HopeNest Global Foundation Certificate issued upon completing all 8 stages.`,
    source: 'openframe_education_seed_v1',
    metadata: {
      batchNumber,
      seededAt: nowIso,
      catalogTotalTarget: TARGET_TOTAL_COURSES,
      schemaVersion: '1.0.0'
    },
    createdAt: nowIso,
    updatedAt: nowIso
  };
}

async function run() {
  console.log('============================================================');
  console.log('🚀 OPENFRAME EDUCATION: 15,000-COURSE FIRESTORE MIGRATION');
  console.log('============================================================');
  console.log(`📌 Project ID     : ${firebaseConfig.projectId}`);
  console.log(`📌 Database ID    : ${firebaseConfig.firestoreDatabaseId}`);
  console.log(`📌 Collection     : "courses"`);
  console.log(`📌 Range to Seed  : #${startIndex} to #${endIndex} (${endIndex - startIndex + 1} courses)`);
  console.log(`📌 Batch Size     : ${batchSize} documents/write`);
  console.log(`📌 Throttle Delay : ${throttleDelayMs} ms`);
  console.log(`📌 Dry-Run Mode   : ${isDryRun ? 'YES (Simulation Only)' : 'NO (Live Firestore Writes)'}`);
  console.log('============================================================\n');

  if (verifyOnly) {
    console.log('🔍 Checking current document count in Firestore...');
    try {
      const snap = await getCountFromServer(collection(db, 'courses'));
      console.log(`✅ Current Firestore Courses Count: ${snap.data().count.toLocaleString()} documents.`);
      
      const sample = await getDoc(doc(db, 'courses', 'OF-CRS-00001'));
      if (sample.exists()) {
        console.log(`📄 Sample document OF-CRS-00001 exists: "${sample.data()?.title}"`);
      } else {
        console.log(`ℹ️ Document OF-CRS-00001 not yet seeded.`);
      }
    } catch (e: any) {
      console.error('❌ Verification failed:', e.message || e);
    }
    process.exit(0);
  }

  const totalToSeed = Math.max(0, endIndex - startIndex + 1);
  const totalBatches = Math.ceil(totalToSeed / batchSize);

  console.log(`⏳ Commencing migration across ${totalBatches} batches...\n`);

  const startTime = Date.now();
  let totalCommitted = 0;
  let totalFailed = 0;

  for (let b = 0; b < totalBatches; b++) {
    const batchStartIndex = startIndex + b * batchSize;
    const batchEndIndex = Math.min(endIndex, batchStartIndex + batchSize - 1);
    const batchNumber = b + 1;

    // Generate batch documents
    const batchDocuments: ReturnType<typeof generateCourseDocument>[] = [];
    for (let idx = batchStartIndex; idx <= batchEndIndex; idx++) {
      batchDocuments.push(generateCourseDocument(idx, batchNumber));
    }

    const firstId = batchDocuments[0].id;
    const lastId = batchDocuments[batchDocuments.length - 1].id;

    if (!isDryRun) {
      const batchInstance = writeBatch(db);
      for (const course of batchDocuments) {
        const docRef = doc(db, 'courses', course.id);
        batchInstance.set(docRef, course, { merge: true });
      }

      try {
        await batchInstance.commit();
        totalCommitted += batchDocuments.length;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = Math.round(totalCommitted / elapsed);
        const percent = Math.round((totalCommitted / totalToSeed) * 100);

        console.log(
          `  ✅ [Batch ${String(batchNumber).padStart(3, ' ')}/${totalBatches}] Committed ${batchDocuments.length} docs (${firstId} → ${lastId}) | Progress: ${percent}% (${totalCommitted}/${totalToSeed}) @ ${speed} docs/s`
        );
      } catch (err: any) {
        totalFailed += batchDocuments.length;
        console.error(`  ❌ [Batch ${batchNumber}/${totalBatches}] Write failed:`, err.message || err);
      }
    } else {
      totalCommitted += batchDocuments.length;
      console.log(
        `  🧪 [DRY-RUN] [Batch ${String(batchNumber).padStart(3, ' ')}/${totalBatches}] Validated ${batchDocuments.length} docs (${firstId} → ${lastId})`
      );
    }

    if (throttleDelayMs > 0 && b < totalBatches - 1) {
      await new Promise((resolve) => setTimeout(resolve, throttleDelayMs));
    }
  }

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n============================================================');
  console.log(`🎉 MIGRATION PROCESS FINISHED in ${totalDuration}s`);
  console.log(`   - Successfully Processed : ${totalCommitted.toLocaleString()} courses`);
  console.log(`   - Failed Records         : ${totalFailed.toLocaleString()} courses`);
  console.log(`   - Target Collection      : "courses"`);
  console.log('============================================================\n');

  process.exit(totalFailed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('\n❌ Fatal Migration Error:', err);
  process.exit(1);
});
