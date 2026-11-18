import {
  MarketplaceCourse,
  MarketplacePricingTier,
  MarketplaceCourseStatus,
  MarketplaceCourseType,
} from '../types';
import { DISCOVERY_EDUCATION_FIELDS } from './discoveryTaxonomy';
import { CORPORATE_TRAINING_CATEGORIES } from './corporateTrainingTaxonomy';
import { compute90PercentCoursePricing } from '../utils/pricingEngine';

export const ALL_90_CATEGORIES = [
  'Artificial Intelligence', 'Generative AI', 'Machine Learning', 'Deep Learning', 'Data Science',
  'Data Analytics', 'Python Programming', 'Java Programming', 'C Programming', 'C++ Programming',
  'JavaScript', 'Web Development', 'Full Stack Development', 'App Development', 'Android Development',
  'iOS Development', 'Cybersecurity', 'Ethical Hacking', 'Cloud Computing', 'AWS',
  'Microsoft Azure', 'Google Cloud', 'Networking', 'Blockchain', 'Cryptocurrency Technology',
  'Robotics', 'Internet of Things', 'Electronics', 'UI/UX Design', 'Graphic Design',
  'Photoshop', 'Video Editing', 'Animation', 'Digital Marketing', 'SEO',
  'Social Media Marketing', 'Content Creation', 'Business Management', 'Entrepreneurship', 'Startup Development',
  'Financial Literacy', 'Accounting', 'Banking', 'Stock Market Education', 'Project Management',
  'Human Resource Management', 'Communication Skills', 'Spoken English', 'Personality Development', 'Leadership',
  'Career Development', 'Interview Preparation', 'Mathematics', 'Science', 'Physics',
  'Chemistry', 'Biology', 'Environmental Science', 'Agriculture Technology', 'Rural Entrepreneurship',
  'Healthcare Education', 'Nutrition', 'Psychology', 'Emotional Intelligence', 'IQ Development',
  'SQ Development', 'Parenting Education', 'Teaching Skills', 'Teacher Training', 'School Education',
  'Competitive Exam Preparation', 'Creative Writing', 'Foreign Languages', 'Photography', 'Music',
  'Interior Design', 'Fashion Design', 'Hospitality Management', 'Tourism', 'Legal Awareness',
  'Sustainability', 'Renewable Energy', 'Solar Technology', 'Manufacturing Technology', 'Automobile Technology',
  'Career and Vocational Skills', 'Agriculture and Food Processing', 'Women Entrepreneurship', 'Life Skills', 'Personal Productivity',
];

export const MARKETPLACE_STATUSES: MarketplaceCourseStatus[] = [
  'Published',
  'Draft',
  'Ready to Publish',
  'Instructor Assigned',
  'Content Development',
  'Planned',
  'Unavailable',
];

export const MARKETPLACE_PRICING_TIERS: MarketplacePricingTier[] = [
  'Academic Access',
  'Starter',
  'Basic',
  'Professional',
  'Advanced',
  'Specialised',
];

export const SUPPORTED_COURSE_LANGUAGES = [
  'English',
  'Hindi',
  'Bilingual (English / Hindi)',
  'Kannada',
  'Tamil',
  'Telugu',
  'Marathi',
  'Bengali',
  'Spanish',
  'French',
];

export const DOMAIN_GROUPS_BY_CATEGORY: Record<string, string> = {
  'Artificial Intelligence': 'Technology',
  'Generative AI': 'Technology',
  'Machine Learning': 'Technology',
  'Deep Learning': 'Technology',
  'Data Science': 'Technology',
  'Data Analytics': 'Technology',
  'Python Programming': 'Technology',
  'Java Programming': 'Technology',
  'C Programming': 'Technology',
  'C++ Programming': 'Technology',
  'JavaScript': 'Technology',
  'Web Development': 'Technology',
  'Full Stack Development': 'Technology',
  'App Development': 'Technology',
  'Android Development': 'Technology',
  'iOS Development': 'Technology',
  'Cybersecurity': 'Technology',
  'Ethical Hacking': 'Technology',
  'Cloud Computing': 'Technology',
  'AWS': 'Technology',
  'Microsoft Azure': 'Technology',
  'Google Cloud': 'Technology',
  'Networking': 'Technology',
  'Blockchain': 'Technology',
  'Cryptocurrency Technology': 'Technology',
  'Robotics': 'STEM',
  'Internet of Things': 'STEM',
  'Electronics': 'STEM',
  'UI/UX Design': 'Creative',
  'Graphic Design': 'Creative',
  'Photoshop': 'Creative',
  'Video Editing': 'Creative',
  'Animation': 'Creative',
  'Digital Marketing': 'Business',
  'SEO': 'Business',
  'Social Media Marketing': 'Business',
  'Content Creation': 'Creative',
  'Business Management': 'Business',
  'Entrepreneurship': 'Business',
  'Startup Development': 'Business',
  'Financial Literacy': 'Business',
  'Accounting': 'Business',
  'Banking': 'Business',
  'Stock Market Education': 'Business',
  'Project Management': 'Business',
  'Human Resource Management': 'Business',
  'Communication Skills': 'Professional',
  'Spoken English': 'Professional',
  'Personality Development': 'Professional',
  'Leadership': 'Professional',
  'Career Development': 'Professional',
  'Interview Preparation': 'Professional',
  'Mathematics': 'Academic',
  'Science': 'Academic',
  'Physics': 'Academic',
  'Chemistry': 'Academic',
  'Biology': 'Academic',
  'Environmental Science': 'Academic',
  'Agriculture Technology': 'Wellbeing',
  'Rural Entrepreneurship': 'Wellbeing',
  'Healthcare Education': 'Wellbeing',
  'Nutrition': 'Wellbeing',
  'Psychology': 'Wellbeing',
  'Emotional Intelligence': 'Intelligence',
  'IQ Development': 'Intelligence',
  'SQ Development': 'Intelligence',
  'Parenting Education': 'Intelligence',
  'Teaching Skills': 'Intelligence',
  'Teacher Training': 'Intelligence',
  'School Education': 'Academic',
  'Competitive Exam Preparation': 'Academic',
  'Creative Writing': 'Creative',
  'Foreign Languages': 'Academic',
  'Photography': 'Creative',
  'Music': 'Creative',
  'Interior Design': 'Creative',
  'Fashion Design': 'Creative',
  'Hospitality Management': 'Business',
  'Tourism': 'Business',
  'Legal Awareness': 'Academic',
  'Sustainability': 'Wellbeing',
  'Renewable Energy': 'STEM',
  'Solar Technology': 'STEM',
  'Manufacturing Technology': 'STEM',
  'Automobile Technology': 'STEM',
  'Career and Vocational Skills': 'Professional',
  'Agriculture and Food Processing': 'Wellbeing',
  'Women Entrepreneurship': 'Wellbeing',
  'Life Skills': 'Professional',
  'Personal Productivity': 'Professional',
  ...Object.fromEntries(DISCOVERY_EDUCATION_FIELDS.map((f) => [f.name, f.domainGroup])),
  ...Object.fromEntries(CORPORATE_TRAINING_CATEGORIES.map((c) => [c.name, c.domainGroup])),
};

export const ALL_MARKETPLACE_CATEGORIES: string[] = Array.from(
  new Set([
    ...ALL_90_CATEGORIES,
    ...DISCOVERY_EDUCATION_FIELDS.map((f) => f.name),
    ...CORPORATE_TRAINING_CATEGORIES.map((c) => c.name),
  ])
);

export function getCategoryFallbackImage(category = '', categoryGroup = ''): string {
  const cat = category.toLowerCase();
  if (cat.includes('programming') || cat.includes('javascript') || cat.includes('development')) {
    return '/assets/images/coding_programming.jpg';
  }
  if (cat.includes('communication') || cat.includes('english') || cat.includes('personality')) {
    return '/assets/images/communication_personality.jpg';
  }
  if (cat.includes('parenting')) {
    return '/assets/images/parenting_wellbeing.jpg';
  }
  if (cat.includes('cloud') || cat.includes('aws') || cat.includes('azure') || cat.includes('cyber') || cat.includes('network')) {
    return '/assets/images/technology_digital_skills.jpg';
  }
  if (categoryGroup === 'Creative') return '/assets/images/graphic_design_media.jpg';
  if (categoryGroup === 'Business') return '/assets/images/entrepreneurship_finance.jpg';
  if (categoryGroup === 'Academic') return '/assets/images/academic_education.jpg';
  if (categoryGroup === 'STEM') return '/assets/images/robotics_stem.jpg';
  if (categoryGroup === 'Wellbeing') return '/assets/images/agriculture_rural_innovation.jpg';
  if (categoryGroup === 'Professional') return '/assets/images/career_development.jpg';
  if (categoryGroup === 'Intelligence') return '/assets/images/iq_eq_sq_development.jpg';
  return '/assets/images/artificial_intelligence.jpg';
}

export function matchesDurationFilter(course: MarketplaceCourse, durationFilter?: string): boolean {
  if (!durationFilter || durationFilter === 'All' || durationFilter === 'all') return true;
  if (durationFilter === 'playlist') {
    return course.courseType === 'youtube_playlist' || Boolean(course.youtubePlaylistId);
  }
  const mins =
    typeof course.durationMinutes === 'number' && course.durationMinutes > 0
      ? course.durationMinutes
      : typeof course.estimatedHours === 'number' && course.estimatedHours > 0
      ? course.estimatedHours * 60
      : (() => {
          const d = String(course.duration || '').toLowerCase();
          const hMatch = d.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/);
          const mMatch = d.match(/(\d+)\s*(?:m|min|mins|minute|minutes)/);
          let total = 0;
          if (hMatch) total += parseFloat(hMatch[1]) * 60;
          if (mMatch) total += parseInt(mMatch[1], 10);
          return total || 0;
        })();

  if (durationFilter === 'short') return mins > 0 && mins <= 120;
  if (durationFilter === 'medium') return mins > 120 && mins <= 600;
  if (durationFilter === 'long') return mins > 600;
  return true;
}

const FOCUS_AREAS = [
  'Core Architecture & Foundations',
  'Applied Enterprise Implementation',
  'Production Pipelines & Workflows',
  'High-Performance System Scaling',
  'Zero-to-Hero Engineering Track',
  'Industrial Capstone & Defense',
  'Security Hardening & Best Practices',
  'Automated Workflows & Tooling',
  'Real-Time Optimization & Telemetry',
  'Advanced Algorithm Design & Patterns',
  'Practical Lab & Debugging Suite',
  'Portfolio Project & Verified Certification',
];

const SPECIALIZATIONS = [
  'Enterprise Cloud',
  'Financial Systems',
  'HealthTech & Bio',
  'E-Commerce Scalability',
  'Smart Cities & IoT',
  'Autonomous Systems',
  'Big Data Infrastructure',
  'Mobile & Edge Devices',
  'DevSecOps & SRE',
  'Distributed Networks',
];

const FACULTY_AUTHORS = [
  'Dr. Aarav Sharma',
  'Prof. Meera Nair',
  'Vikramaditya Rao',
  'Ananya Deshmukh',
  'Siddharth Kulkarni',
  'OpenFrame Academic Council',
];

export function slugifyCategory(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\+\+/g, '_plus_plus')
    .replace(/#/g, '_sharp')
    .replace(/&/g, '_and_')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);
}

/**
 * Extracts canonical YouTube Video ID and/or Playlist ID from any YouTube URL format.
 */
export function extractYouTubeIdentifiers(rawUrl?: string): {
  videoId?: string;
  playlistId?: string;
  courseType: MarketplaceCourseType;
} {
  if (!rawUrl || !rawUrl.trim()) {
    return { courseType: 'standard' };
  }
  const input = rawUrl.trim();

  // Direct 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return { videoId: input, courseType: 'youtube_video' };
  }

  let videoId: string | undefined;
  let playlistId: string | undefined;

  try {
    const parsed = new URL(input.startsWith('http') ? input : `https://${input}`);
    const listParam = parsed.searchParams.get('list');
    if (listParam && /^[a-zA-Z0-9_-]{10,80}$/.test(listParam)) {
      playlistId = listParam;
    }

    const vParam = parsed.searchParams.get('v');
    if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
      videoId = vParam;
    } else if (parsed.hostname.includes('youtu.be')) {
      const seg = parsed.pathname.split('/').filter(Boolean)[0];
      if (seg && /^[a-zA-Z0-9_-]{11}$/.test(seg)) videoId = seg;
    } else if (parsed.pathname.includes('/embed/') || parsed.pathname.includes('/shorts/') || parsed.pathname.includes('/live/')) {
      const parts = parsed.pathname.split('/').filter(Boolean);
      const idx = parts.findIndex((p) => ['embed', 'shorts', 'live'].includes(p));
      if (idx >= 0 && parts[idx + 1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[idx + 1])) {
        videoId = parts[idx + 1];
      }
    }
  } catch {
    // Fallback regex parsing
    const listMatch = input.match(/[?&]list=([a-zA-Z0-9_-]{10,80})/);
    if (listMatch) playlistId = listMatch[1];
    const vMatch = input.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/);
    if (vMatch) videoId = vMatch[1];
  }

  const courseType: MarketplaceCourseType = playlistId
    ? 'youtube_playlist'
    : videoId
    ? 'youtube_video'
    : 'standard';

  return { videoId, playlistId, courseType };
}

/**
 * Builds deterministic search tokens (<= 45 tokens) for Firestore `array-contains` indexing
 * so search across 100k–1M documents executes cleanly on the DB side without loading all docs.
 */
export function buildCourseSearchTokens(course: Partial<MarketplaceCourse>): string[] {
  const fields = [
    course.id,
    course.aliasId,
    course.title,
    course.category,
    ...(course.categories || []),
    course.subcategory,
    course.categoryGroup,
    course.instructorName,
    course.instructor?.name,
    course.youtubeChannelName,
    course.language,
    course.topic,
    course.contentType,
    ...(course.keywords || []),
    ...(course.skillsAcquired || []),
  ];

  const tokens = new Set<string>();
  for (const raw of fields) {
    if (!raw || typeof raw !== 'string') continue;
    const cleaned = raw.toLowerCase().replace(/[^a-z0-9\s_-]/g, ' ').trim();
    if (!cleaned) continue;
    if (cleaned.length >= 2 && cleaned.length <= 48) {
      tokens.add(cleaned);
    }
    const words = cleaned.split(/\s+/);
    for (const w of words) {
      if (w.length >= 2 && w.length <= 40) {
        tokens.add(w);
        // Add 3-char & 4-char prefixes for fast autocomplete `array-contains`
        if (w.length >= 4) tokens.add(w.slice(0, 3));
        if (w.length >= 5) tokens.add(w.slice(0, 4));
      }
    }
  }
  return Array.from(tokens).slice(0, 48);
}

/**
 * Deterministically builds a course record for any base index 1..15,000.
 */
export function synthesizeBaseCourse(index: number): MarketplaceCourse {
  const catIndex = (index - 1) % ALL_90_CATEGORIES.length;
  const category = ALL_90_CATEGORIES[catIndex];
  const categoryGroup = DOMAIN_GROUPS_BY_CATEGORY[category] || 'Technology';
  const focus = FOCUS_AREAS[(index * 7) % FOCUS_AREAS.length];
  const spec = SPECIALIZATIONS[(index * 3) % SPECIALIZATIONS.length];
  const subcategory = `${category} - ${spec}`;

  const levels: Array<'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels'> = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'All Levels',
  ];
  const level = levels[(index * 13) % levels.length];

  const durations = [
    '16 Hours (Fast Track)',
    '24 Hours (Full Course)',
    '36 Hours (Comprehensive)',
    '45 Hours (Masterclass)',
    '60 Hours (Deep Dive Bootcamp)',
  ];
  const duration = durations[(index * 11) % durations.length];
  const estimatedHours = 16 + ((index * 9) % 45);

  const baseTier = MARKETPLACE_PRICING_TIERS[(index * 17) % MARKETPLACE_PRICING_TIERS.length];
  const rawPriceValues: Record<MarketplacePricingTier, number> = {
    'Academic Access': 300,
    'Corporate Track': 1999,
    Starter: 399,
    Basic: 599,
    Professional: 999,
    Advanced: 1499,
    Specialised: 2499,
  };
  const priced = compute90PercentCoursePricing({
    rawPrice: rawPriceValues[baseTier],
    category,
    categoryGroup,
    level,
    pricingTier: baseTier,
  });
  const pricingTier = priced.pricingTier;
  const price = priced.finalPriceInr;
  const marketBenchmarkPrice = priced.marketBenchmarkPrice;
  const discountPercent = priced.discountPercent;
  const isFree = false;

  const rating = Number((4.65 + ((index % 35) / 100)).toFixed(2));
  const enrolledCount = 95 + ((index * 83) % 2400);

  const imageUrl = getCategoryFallbackImage(category, categoryGroup);

  const id = `OF-CRS-${String(index).padStart(5, '0')}`;
  const title = `${category}: ${focus} [${spec}]`;
  const instructorName = FACULTY_AUTHORS[index % FACULTY_AUTHORS.length];
  const language = index % 5 === 0 ? 'Bilingual (English / Hindi)' : 'English';

  const shortDesc = `Master ${category} with a dedicated focus on ${focus} and industrial ${spec} architectures. Includes practical lab exercises, peer reviews, and verified OpenFrame certification.`;

  const modules = Array.from({ length: 8 }, (_, mIdx) => ({
    moduleNumber: mIdx + 1,
    title: `Module ${mIdx + 1}: ${category} ${focus.split(' ')[0]} - Phase ${mIdx + 1}`,
    duration: `${Math.floor(estimatedHours / 8)} Hours`,
    lessons: [
      `Introduction to ${category} Core Concepts`,
      `Applied Lab: ${spec} Architectures & Workflows`,
      `Hands-on Implementation & Debugging`,
      `Module Review & Assessment Checklist`,
    ],
  }));

  return {
    id,
    title,
    category,
    categories: [category],
    categoryGroup,
    subcategory,
    level,
    duration,
    estimatedHours,
    pricingTier,
    price,
    marketBenchmarkPrice,
    discountPercent,
    isFree,
    status: index % 15 === 0 ? 'Ready to Publish' : 'Published',
    courseType: 'standard',
    instructorName,
    language,
    keywords: [category, spec, categoryGroup, focus.split(' ')[0]],
    isPopular: index % 6 === 0,
    isTrending: index % 7 === 0,
    isNew: index % 11 === 0,
    isRecommended: index % 4 === 0,
    isCareerTrack: index % 5 === 0,
    isCustomAdded: false,
    baseIndex: index,
    rating,
    enrolledCount,
    imageUrl,
    thumbnailUrl: imageUrl,
    shortDesc,
    description: `${shortDesc}\n\nThis course is structured by OpenFrame Education faculty in association with HopeNest Global Foundation to deliver industry-standard, portfolio-grade competence.`,
    descriptionBreakdown: {
      whatStudentWillLearn: `Comprehensive mastery of ${category}, production-level ${spec} architecture, and end-to-end practical execution.`,
      whySubjectMatters: `${category} is rapidly transforming industry standards. Competence in ${spec} unlocks verified high-impact career opportunities.`,
      topicsCovered: `${category} syntax, tools, architecture, unit testing, performance benchmarking, and production capstone deployment.`,
      practicalSkillsDeveloped: `Code implementation, debugging, pipeline optimization, real-time analytics, and technical portfolio defense.`,
      whoShouldEnrol: `School students, college engineering candidates, career switchers, and IT professionals seeking verified competence.`,
      achieveAfterCompletion: `Build production-ready artifacts, earn an authentic OpenFrame verification certificate, and qualify for advanced placement referrals.`,
    },
    learningObjectives: [
      `Master core formal theories and practical syntax of ${category}`,
      `Design and deploy robust ${spec} implementations`,
      `Analyze performance bottlenecks and enforce security best practices`,
      `Deliver and defend a verified capstone project`,
    ],
    modules,
    targetAudience: `Students and professionals wanting to advance their skills in ${category}.`,
    skillsAcquired: [category, spec, 'Problem Solving', 'System Design', 'Project Defense'],
    practicalProjects: [
      `Capstone 1: Industrial ${category} Setup & Architecture`,
      `Capstone 2: Real-World ${spec} Implementation Lab`,
      `Capstone 3: Production Deployment & Rubric Defense`,
    ],
    assessmentMethod: `15-Question Verification Quiz + Capstone Project Review + Teacher Rubric Evaluation (100 Marks)`,
    certificateEligibility: true,
    certificateNote: `Verified OpenFrame Education & HopeNest Global Foundation Certificate issued upon completing all 8 stages.`,
    instructor: {
      name: instructorName,
      role: 'Senior Academic Faculty',
      organization: 'OpenFrame Education Council',
    },
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
  };
}
