import { doc, writeBatch, getDocFromServer } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { MarketplaceCourse } from '../types';

/**
 * Generate or retrieve an initial batch of 100 course records
 * with unique IDs, titles, descriptions, categories, and pricing.
 */
export async function generateInitial100Courses(): Promise<MarketplaceCourse[]> {
  try {
    // Attempt to load from batch_1.json in public data
    const response = await fetch('/data/batch_1.json');
    if (response.ok) {
      const data: MarketplaceCourse[] = await response.json();
      if (Array.isArray(data) && data.length >= 100) {
        return data.slice(0, 100);
      }
    }
  } catch (err) {
    console.warn('Could not fetch /data/batch_1.json via browser fetch, generating fallback:', err);
  }

  // Programmatic generator fallback for 100 course records
  const CATEGORIES = [
    'Artificial Intelligence', 'Generative AI', 'Machine Learning', 'Deep Learning', 'Data Science',
    'Data Analytics', 'Python Programming', 'Java Programming', 'C Programming', 'C++ Programming',
    'JavaScript', 'Web Development', 'Full Stack Development', 'App Development', 'Android Development',
    'iOS Development', 'Cybersecurity', 'Ethical Hacking', 'Cloud Computing', 'AWS'
  ];

  const LEVELS: ('Beginner' | 'Intermediate' | 'Advanced' | 'All Levels')[] = [
    'Beginner', 'Intermediate', 'Advanced', 'All Levels'
  ];

  const TIERS: { tier: MarketplaceCourse['pricingTier']; price: number }[] = [
    { tier: 'Academic Access', price: 0 },
    { tier: 'Starter', price: 499 },
    { tier: 'Basic', price: 999 },
    { tier: 'Professional', price: 1499 },
    { tier: 'Advanced', price: 2499 },
    { tier: 'Specialised', price: 4999 }
  ];

  const courses: MarketplaceCourse[] = [];

  for (let i = 1; i <= 100; i++) {
    const id = `OF-CRS-${String(i).padStart(4, '0')}`;
    const category = CATEGORIES[(i - 1) % CATEGORIES.length];
    const tierConfig = TIERS[(i - 1) % TIERS.length];
    const level = LEVELS[(i - 1) % LEVELS.length];
    const durationHours = 8 + (i % 30);
    const title = `Professional ${category} Mastery: Comprehensive Applied Programme ${Math.ceil(i / 20)}`;

    courses.push({
      id,
      title,
      category,
      categoryGroup: 'Technology',
      subcategory: `${category} Engineering`,
      level,
      duration: `${durationHours} Hours`,
      pricingTier: tierConfig.tier,
      price: tierConfig.price,
      status: i <= 50 ? 'Published' : i <= 75 ? 'Ready to Publish' : 'Content Development',
      rating: +(4.6 + (i % 5) * 0.08).toFixed(1),
      enrolledCount: 50 + (i * 12),
      imageUrl: '/assets/images/academic_education.jpg',
      shortDesc: `Comprehensive practical syllabus in ${category}. Covers fundamental theory, applied implementations, laboratory exercises, and industry capstone project.`,
      description: `Master modern ${category} with industry-aligned curriculum from OpenFrame Education. This course is systematically designed to bridge academic concepts and production implementation.\n\nTopics Covered: Comprehensive exploration of core tools, architecture design, practical debugging, and performance optimization.\n\nLearning Outcomes: Students gain portfolio-grade project experience and verified OpenFrame accreditation.`,
      descriptionBreakdown: {
        whatStudentWillLearn: `Core architecture, methodologies, and practical workflows of ${category}.`,
        whySubjectMatters: `${category} is essential for contemporary enterprise systems and technical innovation.`,
        topicsCovered: `Foundations, practical implementation, system deployment, and capstone project.`,
        practicalSkillsDeveloped: `Applied engineering, debugging, testing, and production optimization.`,
        whoShouldEnrol: `Students, developers, analysts, and technology professionals seeking certified competency.`,
        achieveAfterCompletion: `Verified OpenFrame Certificate of Completion and project portfolio.`
      },
      learningObjectives: [
        `Master fundamental principles and workflows in ${category}`,
        `Configure production-ready tools and frameworks`,
        `Design and implement hands-on laboratory exercises`,
        `Build and deploy an accredited capstone project`
      ],
      modules: [
        {
          moduleNumber: 1,
          title: `Orientation and Foundations of ${category}`,
          duration: '3.0 Hours',
          lessons: ['Introduction and Core Principles', 'Development Environment Setup', 'Basic Syntax and Workflows']
        },
        {
          moduleNumber: 2,
          title: `Applied Techniques and Core Architecture`,
          duration: '4.5 Hours',
          lessons: ['Deep-Dive Architecture', 'Practical Implementation Patterns', 'Common Pitfalls and Best Practices']
        },
        {
          moduleNumber: 3,
          title: `Capstone Project and Industry Certification`,
          duration: '3.5 Hours',
          lessons: ['Project Planning and Design', 'End-to-End Build', 'Code Review and Assessment']
        }
      ],
      targetAudience: `Learners seeking industry-relevant competency in ${category}.`,
      skillsAcquired: [category, 'System Architecture', 'Applied Implementation', 'Debugging & Optimization'],
      practicalProjects: [`Capstone: Production-Grade ${category} Application`],
      assessmentMethod: 'Project Evaluation & Multiple-Choice Knowledge Assessment',
      certificateEligibility: true,
      certificateNote: 'OpenFrame Education Certificate issued upon successful completion',
      updatedAt: new Date().toISOString()
    });
  }

  return courses;
}

export interface SeedResult {
  success: boolean;
  count: number;
  collection: string;
  seededIds: string[];
  message: string;
}

/**
 * Seed an array of courses (defaults to the initial 100 course records)
 * into the Firebase Firestore database under the 'courses' collection.
 */
export async function seedCoursesToFirestore(
  customCourses?: MarketplaceCourse[]
): Promise<SeedResult> {
  const collectionName = 'courses';

  // 1. Connection check
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (err: any) {
    if (err?.message?.includes('the client is offline')) {
      console.warn('Firestore offline notice during connection probe:', err.message);
    }
  }

  // 2. Obtain batch of courses
  const coursesToSeed = customCourses && customCourses.length > 0
    ? customCourses
    : await generateInitial100Courses();

  const total = coursesToSeed.length;
  const seededIds: string[] = [];

  // 3. Batch commit in chunks (Firestore limit is 500 writes per batch, chunking by 50 for safety)
  const chunkSize = 50;
  for (let i = 0; i < total; i += chunkSize) {
    const chunk = coursesToSeed.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    for (const course of chunk) {
      const docRef = doc(db, collectionName, course.id);
      const payload = {
        ...course,
        updatedAt: new Date().toISOString()
      };
      batch.set(docRef, payload, { merge: true });
      seededIds.push(course.id);
    }

    try {
      await batch.commit();
      console.log(`[Firestore Seeder] Committed batch of ${chunk.length} courses (${i + 1} - ${Math.min(i + chunkSize, total)} of ${total})`);
    } catch (error) {
      console.error(`[Firestore Seeder] Error committing chunk ${i} - ${i + chunkSize}:`, error);
      handleFirestoreError(error, OperationType.WRITE, `${collectionName}/batch`);
    }
  }

  return {
    success: true,
    count: seededIds.length,
    collection: collectionName,
    seededIds,
    message: `Successfully seeded ${seededIds.length} course records into Firestore collection '${collectionName}'.`
  };
}
