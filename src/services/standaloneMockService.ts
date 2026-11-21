import type { CourseEnrollment, MarketplaceCourse } from '../types';
import { getAll7008GitHubYouTubeCourses } from '../data/githubYoutubeCoursesCatalog';
import { LKG_TO_PG_CURRICULUM_COURSES } from '../data/lkgToPgCurriculumData';
import { EDUCATIONAL_YOUTUBE_CHANNELS } from '../data/educationalYouTubeChannelsData';
import { parseEducationalIntent } from '../utils/searchIntelligence';
import { buildDeterministicChapterNote } from '../data/selfStudyMasterCatalog';
import {
  getCatalogSegmentCounts,
  getFullCatalogIndex,
  hydrateCatalogEntry,
  resolveCatalogCourseById,
} from './catalogDirectoryService';

// ---------------------------------------------------------------------------
// LocalStorage Keys (100% Self-Contained Browser Storage)
// ---------------------------------------------------------------------------
const KEYS = {
  PAYMENTS: 'openframe_standalone_payments_v1',
  ORDERS: 'openframe_standalone_orders_v1',
  ENROLLMENTS: 'openframe_standalone_enrollments_v1',
  RESERVATIONS: 'openframe_standalone_reservations_v1',
  USERS: 'openframe_standalone_users_v1',
  ACTIVE_LEARNER: 'openframe_standalone_active_learner_v1',
  NOTIFICATIONS: 'openframe_standalone_notifications_v1',
  SCHOOL_REVIEWS: 'openframe_standalone_school_reviews_v1',
  DISCOVERY_JOB: 'openframe_standalone_discovery_job_v1',
} as const;

export interface StandalonePaymentRecord {
  id: string;
  orderId: string;
  paymentId: string;
  signature: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  courseId?: string;
  courseTitle?: string;
  institutionId?: string;
  purpose: string;
  amountInr: number;
  currency: 'INR';
  method: 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
  gateway: 'Razorpay';
  status: 'Paid';
  verifiedServerSide: true;
  verifiedAt: string;
  createdAt: string;
  notes?: Record<string, string>;
}

export interface StandaloneOrderRecord {
  id: string;
  amount: number;
  amountInr: number;
  currency: 'INR';
  receipt: string;
  status: 'created' | 'paid';
  courseId?: string;
  institutionId?: string;
  purpose: string;
  notes: Record<string, string>;
  createdAt: string;
}

export interface StandaloneReservationRecord {
  id: string;
  userId: string;
  studentName: string;
  email: string;
  phone: string;
  courseId?: string;
  courseTitle: string;
  courseCategory?: string;
  departmentOrLevel?: string;
  status: 'Confirmed';
  createdAt: string;
  notes?: string;
}

export interface StandaloneUserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  educationLevel?: string;
  degreeOrClass?: string;
  institution?: string;
  city?: string;
  address?: Record<string, string | undefined>;
  updatedAt: string;
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors cleanly
  }
}

function randomToken(len = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Lazy In-Memory Course Catalog Index (Zero Backend Dependency)
// ---------------------------------------------------------------------------
let cachedCatalog: MarketplaceCourse[] | null = null;
let cachedCatalogById: Map<string, MarketplaceCourse> | null = null;

function getStandaloneCatalog(): MarketplaceCourse[] {
  if (cachedCatalog) return cachedCatalog;
  const map = new Map<string, MarketplaceCourse>();

  const addCourse = (raw: any) => {
    if (!raw || !raw.id) return;
    const id = String(raw.id);
    if (map.has(id.toLowerCase())) return;
    const normalized: MarketplaceCourse = {
      id,
      title: String(raw.title || 'OpenFrame Certified Course'),
      category: String(raw.category || 'Programming'),
      categories: Array.isArray(raw.categories) && raw.categories.length > 0 ? raw.categories : [String(raw.category || 'Programming')],
      categoryGroup: raw.categoryGroup || 'Technology',
      subcategory: raw.subcategory || raw.topic || raw.category || 'Skill Development',
      level: raw.level || 'Beginner',
      duration: raw.duration || '6h 30m',
      estimatedHours: Number(raw.estimatedHours || 6.5),
      pricingTier: raw.pricingTier || 'Subsidized Grant',
      price: typeof raw.price === 'number' ? raw.price : 300,
      status: raw.status || 'Published',
      courseType: raw.courseType || 'standard',
      contentType: raw.contentType || 'Full course',
      topic: raw.topic || raw.category || 'Core Curriculum',
      instructorName: raw.instructorName || 'OpenFrame Academic Faculty',
      language: raw.language || 'English',
      rating: Number(raw.rating || 4.8),
      enrolledCount: Number(raw.enrolledCount || 1240),
      isPopular: Boolean(raw.isPopular),
      isTrending: Boolean(raw.isTrending),
      isNew: Boolean(raw.isNew),
      isRecommended: Boolean(raw.isRecommended),
      certificateEligibility: raw.certificateEligibility !== false,
      thumbnailUrl: raw.thumbnailUrl || raw.imageUrl || '/assets/images/coding_programming.jpg',
      imageUrl: raw.imageUrl || raw.thumbnailUrl || '/assets/images/coding_programming.jpg',
      shortDesc: raw.shortDesc || raw.description || `Structured OpenFrame course on ${raw.title || 'Skill Development'}.`,
      description: raw.description || raw.shortDesc || `Complete curriculum, assessments, and QR-verified certification.`,
      learningObjectives: Array.isArray(raw.learningObjectives) && raw.learningObjectives.length > 0
        ? raw.learningObjectives
        : ['Master foundational concepts', 'Build applied real-world projects', 'Pass verification quiz for certification'],
      skillsAcquired: Array.isArray(raw.skillsAcquired) && raw.skillsAcquired.length > 0
        ? raw.skillsAcquired
        : [String(raw.category || 'Digital Skills'), 'Problem Solving', 'Project Delivery'],
      practicalProjects: Array.isArray(raw.practicalProjects) && raw.practicalProjects.length > 0
        ? raw.practicalProjects
        : [`Applied Capstone: ${raw.title || 'OpenFrame Project'}`],
      modules: Array.isArray(raw.modules) && raw.modules.length > 0
        ? raw.modules
        : [
            { moduleNumber: 1, title: 'Foundations & Setup', duration: '2h 00m', lessons: ['Core Concepts', 'Guided Walkthrough'] },
            { moduleNumber: 2, title: 'Applied Workshop & Practice', duration: '2h 30m', lessons: ['Hands-on Lab', 'Quiz Preparation'] },
            { moduleNumber: 3, title: 'Capstone & Certification', duration: '2h 00m', lessons: ['Project Build', 'Verification Test'] },
          ],
      assessmentMethod: raw.assessmentMethod || 'Quinn AI Quiz + Capstone Project',
      certificateNote: raw.certificateNote || 'Verified OpenFrame Education Certificate eligible.',
      keywords: Array.isArray(raw.keywords) ? raw.keywords : [],
      publishedDate: raw.publishedDate || '2026-01-15',
      youtubeVideoId: raw.youtubeVideoId,
      youtubeUrl: raw.youtubeUrl,
      youtubePlaylistUrl: raw.youtubePlaylistUrl,
      youtubeChannelName: raw.youtubeChannelName || raw.channelName,
      educationLevels: raw.educationLevels,
      board: raw.board,
      gradeLevel: raw.gradeLevel,
      libraryCollection: raw.libraryCollection,
      aliasId: raw.aliasId,
      targetAudience: Array.isArray(raw.targetAudience) ? raw.targetAudience : ['Students', 'Self-Paced Learners', 'Professionals'],
      updatedAt: raw.updatedAt || raw.publishedDate || '2026-01-15T00:00:00.000Z',
    };
    map.set(id.toLowerCase(), normalized);
    if (normalized.aliasId) {
      map.set(normalized.aliasId.toLowerCase(), normalized);
    }
  };

  for (const c of LKG_TO_PG_CURRICULUM_COURSES) addCourse(c);
  for (const c of getAll7008GitHubYouTubeCourses()) addCourse(c);

  const unique: MarketplaceCourse[] = [];
  const seen = new Set<string>();
  for (const c of map.values()) {
    if (!seen.has(c.id)) {
      seen.add(c.id);
      unique.push(c);
    }
  }

  cachedCatalog = unique;
  cachedCatalogById = map;
  return unique;
}

function getStandaloneCatalogMap(): Map<string, MarketplaceCourse> {
  if (!cachedCatalogById) getStandaloneCatalog();
  return cachedCatalogById!;
}

// ---------------------------------------------------------------------------
// Public Standalone Mock Service (Payments, Enrollments, Reservations, Users)
// ---------------------------------------------------------------------------
export const standaloneMockService = {
  // --- Active Learner / User Data ---
  getActiveLearner(): StandaloneUserProfile {
    const existing = readJson<StandaloneUserProfile | null>(KEYS.ACTIVE_LEARNER, null);
    if (existing?.uid) return existing;
    const created: StandaloneUserProfile = {
      uid: `local_learner_${randomToken(8).toLowerCase()}`,
      fullName: 'OpenFrame Learner',
      email: 'learner@openframe.local',
      updatedAt: new Date().toISOString(),
    };
    writeJson(KEYS.ACTIVE_LEARNER, created);
    return created;
  },

  saveUserData(uid: string, profile: Partial<StandaloneUserProfile>): StandaloneUserProfile {
    const all = readJson<Record<string, StandaloneUserProfile>>(KEYS.USERS, {});
    const prev = all[uid] || {
      uid,
      fullName: 'OpenFrame Learner',
      email: 'learner@openframe.local',
      updatedAt: new Date().toISOString(),
    };
    const next: StandaloneUserProfile = {
      ...prev,
      ...profile,
      uid,
      updatedAt: new Date().toISOString(),
    };
    all[uid] = next;
    writeJson(KEYS.USERS, all);
    if (uid.startsWith('local_learner_')) {
      writeJson(KEYS.ACTIVE_LEARNER, next);
    }
    return next;
  },

  getUserData(uid: string): StandaloneUserProfile | null {
    const all = readJson<Record<string, StandaloneUserProfile>>(KEYS.USERS, {});
    return all[uid] || null;
  },

  // --- Orders & Razorpay Client-Side Verification ---
  createMockRazorpayOrder(params: {
    amountInr: number;
    courseId?: string;
    institutionId?: string;
    purpose?: string;
    receipt?: string;
    notes?: Record<string, unknown>;
  }): { ok: true; keyId: string; order: StandaloneOrderRecord } {
    const amountInr = Math.max(1, Math.round(Number(params.amountInr) || 300));
    const orderId = `order_OF${Date.now().toString(36).toUpperCase()}${randomToken(6)}`;
    const cleanNotes: Record<string, string> = {};
    if (params.notes && typeof params.notes === 'object') {
      for (const [k, v] of Object.entries(params.notes)) {
        if (v !== undefined && v !== null) {
          cleanNotes[String(k).slice(0, 60)] = String(v).slice(0, 200);
        }
      }
    }
    const order: StandaloneOrderRecord = {
      id: orderId,
      amount: amountInr * 100,
      amountInr,
      currency: 'INR',
      receipt: String(params.receipt || `OFRCP_${Date.now()}`).slice(0, 40),
      status: 'created',
      courseId: params.courseId,
      institutionId: params.institutionId || 'OPENFRAME_MARKETPLACE',
      purpose: params.purpose || 'OpenFrame Course Enrollment',
      notes: cleanNotes,
      createdAt: new Date().toISOString(),
    };
    const orders = readJson<StandaloneOrderRecord[]>(KEYS.ORDERS, []);
    orders.unshift(order);
    writeJson(KEYS.ORDERS, orders.slice(0, 200));
    return { ok: true, keyId: 'rzp_standalone_local', order };
  },

  verifyMockRazorpayPayment(params: {
    razorpay_order_id: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    userId?: string;
    studentName?: string;
    studentEmail?: string;
    courseId?: string;
    courseTitle?: string;
    institutionId?: string;
    purpose?: string;
    amountInr?: number;
    method?: 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
  }): {
    verified: true;
    orderId: string;
    paymentId: string;
    signature: string;
    verifiedAt: string;
    enrollmentVerificationToken: string;
    paymentRecord: StandalonePaymentRecord;
  } {
    const orders = readJson<StandaloneOrderRecord[]>(KEYS.ORDERS, []);
    const matchedOrder = orders.find((o) => o.id === params.razorpay_order_id);
    if (matchedOrder) {
      matchedOrder.status = 'paid';
      writeJson(KEYS.ORDERS, orders);
    }

    const paymentId = params.razorpay_payment_id || `pay_OF${Date.now().toString(36).toUpperCase()}${randomToken(6)}`;
    const signature = params.razorpay_signature || `sig_local_${randomToken(24)}`;
    const verifiedAt = new Date().toISOString();
    const learner = this.getActiveLearner();
    const record: StandalonePaymentRecord = {
      id: `pay_${Date.now().toString(36)}_${randomToken(4)}`,
      orderId: params.razorpay_order_id,
      paymentId,
      signature,
      userId: params.userId || learner.uid,
      studentName: params.studentName || matchedOrder?.notes?.studentName || learner.fullName,
      studentEmail: params.studentEmail || learner.email,
      courseId: params.courseId || matchedOrder?.courseId,
      courseTitle: params.courseTitle || matchedOrder?.notes?.courseTitle,
      institutionId: params.institutionId || matchedOrder?.institutionId || 'OPENFRAME_MARKETPLACE',
      purpose: params.purpose || matchedOrder?.purpose || 'Course Enrollment Fee',
      amountInr: params.amountInr || matchedOrder?.amountInr || 300,
      currency: 'INR',
      method: params.method || 'UPI',
      gateway: 'Razorpay',
      status: 'Paid',
      verifiedServerSide: true,
      verifiedAt,
      createdAt: verifiedAt,
      notes: matchedOrder?.notes,
    };

    const payments = readJson<StandalonePaymentRecord[]>(KEYS.PAYMENTS, []);
    payments.unshift(record);
    writeJson(KEYS.PAYMENTS, payments.slice(0, 300));

    return {
      verified: true,
      orderId: record.orderId,
      paymentId: record.paymentId,
      signature,
      verifiedAt,
      enrollmentVerificationToken: `tok_local_${randomToken(20)}`,
      paymentRecord: record,
    };
  },

  completeStandaloneRazorpayPayment(params: {
    amountInr: number;
    userId?: string;
    studentName?: string;
    studentEmail?: string;
    courseId?: string;
    courseTitle?: string;
    institutionId?: string;
    purpose?: string;
    method?: 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
    notes?: Record<string, unknown>;
  }) {
    const { order } = this.createMockRazorpayOrder({
      amountInr: params.amountInr,
      courseId: params.courseId,
      institutionId: params.institutionId,
      purpose: params.purpose,
      notes: params.notes,
    });
    return this.verifyMockRazorpayPayment({
      razorpay_order_id: order.id,
      userId: params.userId,
      studentName: params.studentName,
      studentEmail: params.studentEmail,
      courseId: params.courseId,
      courseTitle: params.courseTitle,
      institutionId: params.institutionId,
      purpose: params.purpose,
      amountInr: params.amountInr,
      method: params.method,
    });
  },

  getPayments(userId?: string): StandalonePaymentRecord[] {
    const list = readJson<StandalonePaymentRecord[]>(KEYS.PAYMENTS, []);
    if (!userId) return list;
    return list.filter((p) => p.userId === userId);
  },

  // --- Enrollments (localStorage) ---
  getEnrollments(studentId?: string): CourseEnrollment[] {
    const list = readJson<CourseEnrollment[]>(KEYS.ENROLLMENTS, []);
    if (!studentId) return list;
    return list.filter((e) => e.studentId === studentId);
  },

  saveEnrollment(enrollment: CourseEnrollment): CourseEnrollment {
    const list = readJson<CourseEnrollment[]>(KEYS.ENROLLMENTS, []);
    const idx = list.findIndex(
      (e) =>
        e.studentId === enrollment.studentId &&
        e.courseId.toLowerCase() === enrollment.courseId.toLowerCase()
    );
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...enrollment };
    } else {
      list.unshift(enrollment);
    }
    writeJson(KEYS.ENROLLMENTS, list.slice(0, 500));
    return enrollment;
  },

  // --- Reservations (localStorage) ---
  getReservations(userId?: string): StandaloneReservationRecord[] {
    const list = readJson<StandaloneReservationRecord[]>(KEYS.RESERVATIONS, []);
    if (!userId) return list;
    return list.filter((r) => r.userId === userId);
  },

  saveReservation(
    input: Omit<StandaloneReservationRecord, 'id' | 'status' | 'createdAt'>
  ): StandaloneReservationRecord {
    const record: StandaloneReservationRecord = {
      ...input,
      id: `res_${Date.now().toString(36)}_${randomToken(5)}`,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };
    const list = readJson<StandaloneReservationRecord[]>(KEYS.RESERVATIONS, []);
    list.unshift(record);
    writeJson(KEYS.RESERVATIONS, list.slice(0, 300));
    return record;
  },

  // --- Notifications (localStorage) ---
  recordNotification(payload: Record<string, unknown>) {
    const list = readJson<any[]>(KEYS.NOTIFICATIONS, []);
    const entry = {
      id: `notif_${Date.now().toString(36)}_${randomToken(4)}`,
      ...payload,
      dispatched: true,
      channel: 'standalone_local_storage',
      timestamp: new Date().toISOString(),
    };
    list.unshift(entry);
    writeJson(KEYS.NOTIFICATIONS, list.slice(0, 200));
    return entry;
  },
};

// ---------------------------------------------------------------------------
// Self-Contained Client-Side /api/* Router (Replaces ALL External Backend Calls)
// ---------------------------------------------------------------------------
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseBody(init?: RequestInit): any {
  if (!init?.body) return {};
  if (typeof init.body === 'string') {
    try {
      return JSON.parse(init.body);
    } catch {
      return {};
    }
  }
  return {};
}

function searchStandaloneCatalog(params: any) {
  const index = getFullCatalogIndex();
  const excludeSet = new Set<string>(
    Array.isArray(params.excludeIds) ? params.excludeIds.map((x: string) => String(x).toLowerCase()) : []
  );
  const q = String(params.query || '').trim().toLowerCase();
  const queryWords = q ? q.split(/\s+/).filter(Boolean) : [];
  const cat = String(params.category || 'All');
  const group = String(params.group || 'All');
  const level = String(params.level || 'All');
  const lang = String(params.language || 'All');
  const channel = String(params.channel || '').trim().toLowerCase();
  const lib = String(params.libraryCollection || '');
  const edLevel = String(params.educationLevel || 'All');
  const courseType = String(params.courseType || 'all');
  const contentType = String(params.contentType || 'all');
  const tab = String(params.tab || 'all');
  const priceBand = String(params.priceBand || 'all');
  const sortBy = String(params.sortBy || 'popular');

  const filtered = index.filter((c) => {
    if (excludeSet.has(c.id.toLowerCase())) return false;
    if (lib === 'github_youtube_7008' && c.source !== 'github_yt') return false;
    if (tab === 'github_youtube_7008' && c.source !== 'github_yt') return false;
    if (tab === 'youtube' && !c.isYouTube) return false;
    if (tab === 'playlists' && !c.isPlaylist) return false;
    if (tab === 'professional' && !c.isProfessional) return false;
    if (tab === 'beginner' && c.level !== 'Beginner' && c.price > 500) return false;
    if (tab === 'popular' && !c.isPopular) return false;
    if (tab === 'trending' && !c.isTrending) return false;
    if (tab === 'new' && !c.isNew) return false;
    if (tab === 'career' && !c.isProfessional) return false;
    if (courseType === 'youtube_playlist' && !c.isPlaylist) return false;
    if (courseType === 'youtube_video' && !c.isYouTube) return false;
    if (courseType === 'standard' && c.isYouTube) return false;
    if (contentType !== 'all' && contentType !== 'All' && c.contentType.toLowerCase() !== contentType.toLowerCase()) {
      return false;
    }
    if (cat !== 'All' && c.category !== cat) return false;
    if (group !== 'All' && c.categoryGroup !== group) return false;
    if (level !== 'All' && c.level !== level) return false;
    if (lang !== 'All' && !c.language.toLowerCase().includes(lang.toLowerCase())) return false;
    if (channel && !(c.youtubeChannelName || c.instructorName || '').toLowerCase().includes(channel)) return false;
    if (edLevel !== 'All' && !(c.educationLevels || []).includes(edLevel)) return false;
    if (priceBand === 'school_300_799' && c.price > 799) return false;
    if (priceBand === 'degree_800_1499' && (c.price < 800 || c.price > 1499)) return false;
    if (priceBand === 'pg_1500_2500' && c.price < 1500) return false;
    if (queryWords.length > 0 && !queryWords.every((w) => c.searchHaystack.includes(w))) return false;
    return true;
  });

  if (sortBy === 'price_low') {
    filtered.sort((a, b) => a.price - b.price || b.enrolledCount - a.enrolledCount);
  } else if (sortBy === 'price_high') {
    filtered.sort((a, b) => b.price - a.price || b.rating - a.rating);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating || b.enrolledCount - a.enrolledCount);
  } else {
    filtered.sort((a, b) => Number(b.isPopular) - Number(a.isPopular) || b.enrolledCount - a.enrolledCount);
  }

  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.min(60, Math.max(1, Number(params.pageSize || 24)));
  const start = (page - 1) * pageSize;
  return {
    ok: true,
    total: filtered.length,
    page,
    pageSize,
    courses: filtered.slice(start, start + pageSize).map(hydrateCatalogEntry),
  };
}

function searchStandaloneYouTube(queryText: string, maxResults = 12) {
  const q = (queryText || 'Programming').trim().toLowerCase();
  const catalog = getStandaloneCatalog();
  const matchedCourses = catalog.filter((c) => {
    if (!c.youtubeVideoId) return false;
    const hay = `${c.title} ${c.category} ${c.subcategory || ''} ${c.youtubeChannelName || ''}`.toLowerCase();
    return q.split(/\s+/).some((w) => w.length >= 2 && hay.includes(w));
  });

  const sourceList = matchedCourses.length > 0 ? matchedCourses : catalog.filter((c) => Boolean(c.youtubeVideoId));
  const videos = sourceList.slice(0, maxResults).map((c) => {
    const vid = c.youtubeVideoId || 'rfscVS0vtbw';
    return {
      id: `yt-${vid}-${c.id}`,
      videoId: vid,
      youtubeId: vid,
      title: c.title,
      channelTitle: c.youtubeChannelName || c.instructorName || 'OpenFrame Educational Channel',
      thumbnail: c.thumbnailUrl || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
      thumbnailUrl: c.thumbnailUrl || `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
      duration: c.duration || '45m',
      publishedAt: c.publishedDate || '2026-01-10',
      viewCount: `${(c.enrolledCount || 12000).toLocaleString()} views`,
      description: c.shortDesc,
      youtubeUrl: `https://www.youtube.com/watch?v=${vid}`,
      embedUrl: `https://www.youtube.com/embed/${vid}?rel=0`,
      category: c.category,
      language: c.language || 'English',
      level: c.level || 'Beginner',
    };
  });

  return {
    ok: true,
    source: 'standalone_catalog',
    apiKeyConfigured: true,
    query: queryText,
    videos,
    items: videos,
    nextPageToken: null,
    note: 'Loaded from self-contained local educational catalog.',
  };
}

export async function standaloneApiFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const rawUrl = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const parsedUrl = new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  const pathname = parsedUrl.pathname;
  const body = parseBody(init);

  // 1. Payments (Razorpay Client-Side Mock & LocalStorage Verification)
  if (pathname === '/api/payments/razorpay/config') {
    return jsonResponse({
      ok: true,
      gateway: 'razorpay',
      configured: true,
      standalone: true,
      keyId: 'rzp_standalone_local',
      currency: 'INR',
      note: 'Standalone client-side checkout active (localStorage persistence).',
    });
  }

  if (pathname === '/api/payments/razorpay/order') {
    const amountInr = Number(body.amountInr || 300);
    if (!Number.isFinite(amountInr) || amountInr <= 0) {
      return jsonResponse({ ok: false, error: 'Valid positive amountInr is required.' }, 400);
    }
    const created = standaloneMockService.createMockRazorpayOrder({
      amountInr,
      courseId: body.courseId,
      institutionId: body.institutionId,
      purpose: body.purpose,
      receipt: body.receipt,
      notes: body.notes,
    });
    return jsonResponse({ ...created, standalone: true });
  }

  if (pathname === '/api/payments/razorpay/verify') {
    const orderId = String(body.razorpay_order_id || '');
    if (!orderId) {
      return jsonResponse({ verified: false, error: 'razorpay_order_id is required.' }, 400);
    }
    const verified = standaloneMockService.verifyMockRazorpayPayment({
      razorpay_order_id: orderId,
      razorpay_payment_id: body.razorpay_payment_id,
      razorpay_signature: body.razorpay_signature,
      userId: body.userId,
      studentName: body.studentName,
      studentEmail: body.studentEmail,
      courseId: body.courseId,
      courseTitle: body.courseTitle,
      amountInr: body.amountInr,
      method: body.method,
    });
    return jsonResponse(verified);
  }

  if (pathname === '/api/enrollments/verify-payment') {
    return jsonResponse({
      ok: true,
      verified: true,
      orderId: body.orderId || '',
      paymentId: body.paymentId || '',
      verifiedAt: body.verifiedAt || new Date().toISOString(),
    });
  }

  // 2. Marketplace Catalog APIs
  if (pathname === '/api/marketplace/base-stats') {
    const fullIndex = getFullCatalogIndex();
    const segmentCounts = getCatalogSegmentCounts();
    const excludeCount = Array.isArray(body.excludeIds) ? body.excludeIds.length : 0;
    const categoryCounts: Record<string, number> = {};
    for (const c of fullIndex) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }
    const totalBase = Math.max(0, segmentCounts.all - excludeCount);
    return jsonResponse({
      ok: true,
      totalBase,
      published: Math.max(0, totalBase - 120),
      paidCourses: segmentCounts.professional,
      youtubeCourses: segmentCounts.youtube,
      videoPlaylists: segmentCounts.youtube_playlist,
      readyToPublish: 45,
      instructorAssigned: 35,
      contentDevelopment: 25,
      planned: 15,
      categoryCounts,
    });
  }

  if (pathname === '/api/marketplace/base-search') {
    return jsonResponse(searchStandaloneCatalog(body));
  }

  if (pathname === '/api/marketplace/base-autocomplete') {
    const q = (parsedUrl.searchParams.get('q') || '').trim().toLowerCase();
    const fullIndex = getFullCatalogIndex();
    const suggestions: any[] = [];
    const seen = new Set<string>();
    for (const c of fullIndex) {
      if (suggestions.length >= 10) break;
      if (!q || c.searchHaystack.includes(q)) {
        if (!seen.has(c.id)) {
          seen.add(c.id);
          suggestions.push({
            type: 'course',
            id: c.id,
            label: c.title,
            sublabel: `${c.category} · ${c.level}`,
            category: c.category,
            courseType: c.courseType,
          });
        }
      }
    }
    return jsonResponse({ ok: true, suggestions });
  }

  if (pathname.startsWith('/api/marketplace/base-course/')) {
    const rawId = decodeURIComponent(pathname.replace('/api/marketplace/base-course/', '')).trim();
    const found = resolveCatalogCourseById(rawId) || getStandaloneCatalogMap().get(rawId.toLowerCase()) || null;
    return jsonResponse({ ok: Boolean(found), course: found }, found ? 200 : 404);
  }

  // 3. YouTube Video Search & Resolution APIs
  if (pathname === '/api/youtube/status') {
    return jsonResponse({
      ok: true,
      configured: true,
      apiKeyConfigured: true,
      mode: 'standalone_catalog',
      channelsCount: EDUCATIONAL_YOUTUBE_CHANNELS.length,
    });
  }

  if (pathname === '/api/youtube/search') {
    const queryText = String(body.query || body.q || parsedUrl.searchParams.get('q') || 'Technology');
    const maxResults = Number(body.maxResults || parsedUrl.searchParams.get('maxResults') || 12);
    return jsonResponse(searchStandaloneYouTube(queryText, maxResults));
  }

  if (pathname.startsWith('/api/youtube/video-details/')) {
    const vid = decodeURIComponent(pathname.replace('/api/youtube/video-details/', ''));
    const match = getStandaloneCatalog().find((c) => c.youtubeVideoId === vid);
    const thumb = `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`;
    const video = {
      id: `yt-${vid}`,
      videoId: vid,
      youtubeId: vid,
      title: match?.title || 'OpenFrame Educational Lecture',
      channelTitle: match?.youtubeChannelName || 'OpenFrame Academic Channel',
      duration: match?.duration || '45m',
      description: match?.shortDesc || 'Curated OpenFrame educational lecture video.',
      thumbnail: thumb,
      thumbnailUrl: thumb,
      embedUrl: `https://www.youtube-nocookie.com/embed/${vid}`,
      youtubeUrl: `https://www.youtube.com/watch?v=${vid}`,
      level: match?.level || 'Beginner',
      category: match?.category || 'Education',
      language: match?.language || 'English',
    };
    return jsonResponse({
      ok: true,
      source: 'standalone_catalog',
      video,
      ...video,
    });
  }

  if (pathname === '/api/youtube/related-resources') {
    const topic = String(body.topic || body.title || 'Learning');
    return jsonResponse(searchStandaloneYouTube(topic, 6));
  }

  if (pathname === '/api/youtube/resolve-course') {
    const rawLink = String(body.url || '').trim();
    const vidMatch = rawLink.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    const videoId = vidMatch?.[1] || 'rfscVS0vtbw';
    return jsonResponse({
      ok: true,
      videoId,
      title: 'Curated YouTube Educational Course',
      channelName: 'OpenFrame Verified Educator',
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      duration: '3h 30m',
      youtubeUrl: rawLink || `https://www.youtube.com/watch?v=${videoId}`,
    });
  }

  // 4. Self-Study Chapter Analysis
  if (pathname === '/api/self-study/analyze-chapter') {
    const chapter = String(body.chapterTitle || body.chapter || body.topic || 'Core Chapter');
    const subject = String(body.subject || 'General Studies');
    const className = String(body.classOrDepartment || body.className || body.grade || 'School Curriculum');
    const language = String(body.language || 'English');
    const note = buildDeterministicChapterNote({
      boardId: String(body.boardId || 'karnataka_state'),
      boardName: String(body.boardName || 'Karnataka State Board'),
      levelLabel: String(body.levelLabel || 'School Education'),
      classOrDepartment: className,
      subject,
      chapterTitle: chapter,
      language,
    });
    return jsonResponse({
      ok: true,
      note,
      generatedBy: 'structured_engine',
    });
  }

  // 5. School AI Local Endpoints (/api/school/*)
  if (pathname.startsWith('/api/school/')) {
    const topic = String(body.conceptTitle || body.chapterTitle || body.subjectName || body.topic || 'School Curriculum');
    const subjectName = String(body.subjectName || 'General Studies');
    const className = String(body.className || body.classId || 'Class 10');
    const language = String(body.targetLanguage || body.language || 'English');

    if (pathname.endsWith('/tutor')) {
      const msg = String(body.message || '');
      return jsonResponse({
        ok: true,
        source: 'standalone_local',
        reply: `**Quinn AI School Tutor (${topic} · ${className})**\n\n${msg ? `Regarding "${msg.slice(0, 120)}":\n\n` : ''}1. **Core Concept**: Master the exact textbook definitions and key rules for ${topic} in ${subjectName}.\n2. **Worked Steps**: Break every question into given facts, core principle/formula, and verified answer.\n3. **Exam Tip**: Revise your short bullet notes and attempt the practice quiz to confirm 70%+ mastery.`,
      });
    }

    if (pathname.endsWith('/generate-quiz')) {
      const count = Math.min(20, Math.max(4, Number(body.questionCount || 6)));
      const questions = Array.from({ length: count }, (_, idx) => {
        const difficulty = idx < Math.ceil(count / 3) ? 'Basic' : idx < Math.ceil((2 * count) / 3) ? 'Intermediate' : 'Advanced';
        const isTf = idx % 3 === 1;
        return {
          id: `sch_q_${idx + 1}`,
          format: isTf ? 'True / False' : 'MCQ',
          difficulty,
          questionText: isTf
            ? `True or False: Understanding core principles of ${topic} in ${subjectName} helps solve applied ${className} exam questions accurately.`
            : `Question ${idx + 1}: Which approach best explains and applies ${topic} (${subjectName})?`,
          options: isTf
            ? ['True', 'False']
            : [
                `Apply core ${topic} concepts step-by-step and verify the result`,
                'Skip intermediate steps and guess the final answer',
                'Ignore definitions and standard units',
                'Memorize unrelated topics instead',
              ],
          correctAnswer: isTf ? 'True' : `Apply core ${topic} concepts step-by-step and verify the result`,
          explanation: `Structured step-by-step reasoning is essential for mastering ${topic} in ${className}.`,
          marks: difficulty === 'Advanced' ? 3 : difficulty === 'Intermediate' ? 2 : 1,
        };
      });
      return jsonResponse({ ok: true, questions, source: 'standalone_local' });
    }

    if (pathname.endsWith('/evaluate-quiz')) {
      const questions: any[] = Array.isArray(body.questions) ? body.questions : [];
      const answers: Record<string, string> = body.studentAnswers || {};
      let totalAwarded = 0;
      let totalMax = 0;
      const itemGrades = questions.map((q) => {
        const maxMarks = Number(q.marks || 1);
        totalMax += maxMarks;
        const ans = String(answers[q.id] || '').trim();
        const isCorrect = ans.length > 0 && ans.toLowerCase() === String(q.correctAnswer || '').trim().toLowerCase();
        const awardedMarks = isCorrect ? maxMarks : 0;
        totalAwarded += awardedMarks;
        return {
          questionId: q.id,
          isCorrect,
          awardedMarks,
          maxMarks,
          feedback: isCorrect ? `Correct! ${q.explanation || ''}` : `Correct answer: ${q.correctAnswer}. ${q.explanation || ''}`,
          isSubjective: false,
        };
      });
      const percentage = totalMax > 0 ? Math.round((totalAwarded / totalMax) * 100) : 0;
      return jsonResponse({
        id: `sch_att_${Date.now().toString(36)}`,
        studentId: body.studentId || 'local_student',
        studentName: body.studentName || 'Student Learner',
        boardId: body.boardId || 'CBSE',
        classId: body.classId || 'class_10',
        subjectId: body.subjectId || 'subject',
        subjectName,
        chapterId: body.chapterId,
        conceptId: body.conceptId,
        quizMode: body.quizMode || 'concept_check',
        language,
        questions,
        studentAnswers: answers,
        itemGrades,
        totalAwarded,
        totalMax,
        percentage,
        pendingTeacherReview: false,
        weakConcepts: percentage < 70 ? [topic] : [],
        aiFeedback:
          percentage >= 70
            ? `Great score (${percentage}%)! You demonstrated strong understanding of ${topic}.`
            : `You scored ${percentage}%. Review ${topic} key definitions and retry.`,
        submittedAt: new Date().toISOString(),
      });
    }

    if (pathname.endsWith('/evaluate-presentation')) {
      return jsonResponse({
        ok: true,
        scorePercent: 86,
        totalScore: 86,
        passed: true,
        feedback: `Well-structured presentation on ${body.topicTitle || topic} for ${subjectName}. Clear key points and strong organization.`,
        strengths: ['Clear topic coverage', 'Structured explanation'],
        improvements: ['Include one additional worked real-life example'],
      });
    }

    if (pathname.endsWith('/translate-concept')) {
      return jsonResponse({
        ok: true,
        translatedText: String(body.text || topic),
        targetLanguage: language,
      });
    }

    if (pathname.endsWith('/translate-concept-bundle')) {
      return jsonResponse({
        conceptId: String(body.conceptId || 'concept'),
        language,
        title: String(body.title || topic),
        simpleExplanation: String(body.simpleExplanation || `Clear study explanation of ${topic} in ${language}.`),
        detailedExplanation: String(body.detailedExplanation || `Detailed textbook-aligned overview of ${topic} for ${className}.`),
        revisionNotes: String(body.revisionNotes || `Key revision points for ${topic}.`),
        realLifeApplications: Array.isArray(body.realLifeApplications) ? body.realLifeApplications : [`Practical everyday application of ${topic}.`],
        source: 'standalone_local',
        updatedAt: new Date().toISOString(),
      });
    }

    if (pathname.endsWith('/youtube-lessons')) {
      const searchQuery = `${body.boardName || ''} ${body.classId || ''} ${subjectName} ${body.chapterTitle || ''} ${body.conceptTitle || ''}`.trim();
      const yt = searchStandaloneYouTube(searchQuery || subjectName, 6);
      return jsonResponse({
        ok: true,
        apiKeyConfigured: true,
        source: 'standalone_catalog',
        searchQuery,
        safeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery || subjectName)}`,
        videos: yt.videos.map((v) => ({
          videoId: v.videoId,
          title: v.title,
          channelTitle: v.channelTitle,
          duration: v.duration,
          thumbnailUrl: v.thumbnailUrl,
          embedUrl: v.embedUrl,
          watchUrl: v.youtubeUrl,
        })),
      });
    }
  }

  // 6. Quinn AI Local Endpoints (/api/quinn/*)
  if (pathname.startsWith('/api/quinn/')) {
    const topic = String(body.lessonTopic || body.topic || body.courseTitle || body.subject || body.query || 'OpenFrame Curriculum');
    const message = String(body.message || body.question || '');

    if (pathname.endsWith('/chat')) {
      return jsonResponse({
        ok: true,
        source: 'standalone_local',
        reply: `**Quinn AI Study Guide (${topic})**\n\nGreat question${message ? ` about "${message.slice(0, 120)}"` : ''}!\n\n1. **Core Concept**: Focus on understanding the fundamental principles of ${topic} first and connect each concept to a real-world example.\n2. **Step-by-Step Approach**: Break the problem down into inputs, rules/methods, and expected outcomes.\n3. **Next Action**: Watch the lesson video, review your notes, and test yourself with the module quiz to unlock your OpenFrame certificate.`,
      });
    }

    if (pathname.endsWith('/recommend-videos')) {
      const yt = searchStandaloneYouTube(topic, Number(body.maxVideos || 6));
      return jsonResponse({ ok: true, videos: yt.videos });
    }

    if (pathname.endsWith('/practice-questions')) {
      return jsonResponse({
        ok: true,
        questions: [
          {
            question: `Explain the core workflow and primary outcome of "${topic}".`,
            hint: 'Focus on inputs, transformations, and verification.',
            sampleAnswer: `${topic} transforms structured inputs into reliable, verifiable outputs using disciplined steps.`,
            difficulty: 'Basic',
          },
          {
            question: `Describe one common mistake when applying "${topic}" and how to prevent it.`,
            hint: 'Think about edge cases, validation, and testing.',
            sampleAnswer: 'Skipping upfront requirements validation; prevent it with clear checklists and test cases.',
            difficulty: 'Intermediate',
          },
          {
            question: `How would you measure quality and performance in a real-world "${topic}" project?`,
            hint: 'Use measurable KPIs and review criteria.',
            sampleAnswer: 'Define baseline metrics, track accuracy/efficiency after implementation, and document trade-offs.',
            difficulty: 'Advanced',
          },
        ],
      });
    }

    if (pathname.endsWith('/generate-quiz')) {
      const bCount = Number(body.basicCount ?? 5);
      const iCount = Number(body.intermediateCount ?? 5);
      const aCount = Number(body.advancedCount ?? 5);
      const total = Math.min(20, Math.max(5, bCount + iCount + aCount));
      const questions = Array.from({ length: total }, (_, idx) => {
        const difficulty: 'basic' | 'intermediate' | 'advanced' =
          idx < bCount ? 'basic' : idx < bCount + iCount ? 'intermediate' : 'advanced';
        const isTf = idx % 3 === 1;
        const correct = isTf ? 'True' : `Apply structured ${topic} principles step-by-step and verify outcomes`;
        return {
          id: `q_${idx + 1}`,
          questionText: isTf
            ? `Validating intermediate results in ${topic} (Concept ${idx + 1}) prevents compounding errors in final deliverables.`
            : `Question ${idx + 1}: Which best describes a core best practice when applying ${topic} (Concept ${idx + 1})?`,
          type: isTf ? 'true_false' : 'multiple_choice',
          format: isTf ? 'TRUE / FALSE' : 'MULTIPLE CHOICE',
          difficulty,
          options: isTf
            ? ['True', 'False']
            : [
                correct,
                'Skip foundational concepts and guess final results',
                'Ignore validation and testing guidelines',
                'Avoid reviewing core documentation or examples',
              ],
          correctAnswer: correct,
          rubricExplanation: `Structured understanding and verification is essential for mastering ${topic}.`,
          points: difficulty === 'advanced' ? 10 : difficulty === 'intermediate' ? 7 : 5,
        };
      });
      return jsonResponse({ ok: true, questions });
    }

    if (pathname.endsWith('/evaluate-quiz')) {
      const questions: any[] = Array.isArray(body.questions) ? body.questions : [];
      const studentAnswers: Record<string, string> = body.studentAnswers || {};
      let totalScore = 0;
      let maxScore = 0;
      const revisionTopics: string[] = [];
      const responses = questions.map((q) => {
        const pts = Number(q.points || 5);
        maxScore += pts;
        const ans = String(studentAnswers[q.id] || '').trim();
        const expected = String(q.correctAnswer || '').trim();
        const isCorrect =
          ans.length > 0 &&
          (ans.toLowerCase() === expected.toLowerCase() ||
            (q.type === 'short_answer' && ans.length >= 20));
        const scoreAwarded = isCorrect ? pts : 0;
        totalScore += scoreAwarded;
        if (!isCorrect && q.questionText) {
          revisionTopics.push(String(q.questionText).slice(0, 68));
        }
        return {
          questionId: q.id,
          studentAnswer: ans || '(No response provided)',
          isCorrect,
          scoreAwarded,
          maxScore: pts,
          feedback: isCorrect
            ? `Correct! ${q.rubricExplanation || ''}`
            : `Expected: "${expected}". ${q.rubricExplanation || ''}`,
        };
      });
      const passing = Number(body.passingScorePercent ?? 70);
      const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
      const passed = percentage >= passing;
      const attemptId = `attempt-${Date.now()}`;
      return jsonResponse({
        id: attemptId,
        attemptId,
        studentId: body.studentId || 'local_learner',
        courseId: body.courseId || 'OF-COURSE',
        lessonId: body.lessonId || 'lesson-1',
        submittedAt: new Date().toISOString(),
        score: totalScore,
        maxScore,
        percentage,
        percentageScore: percentage,
        passed,
        responses,
        quinnFeedback: passed
          ? `Great job! You scored ${percentage}%, meeting the ${passing}% threshold. Your Practical Project brief is unlocked.`
          : `You scored ${percentage}% (passing threshold: ${passing}%). Review the explanations below and retry.`,
        recommendedRevisionTopics: [...new Set(revisionTopics)].slice(0, 5),
      });
    }

    if (pathname.endsWith('/generate-project')) {
      const projId = `proj-${Date.now()}`;
      return jsonResponse({
        ok: true,
        project: {
          id: projId,
          projectId: projId,
          courseId: body.courseId || 'OF-COURSE',
          lessonId: topic,
          variationSeed: body.variationSeed,
          title: `Applied Capstone Project: ${topic}`,
          description: `Design, build, and submit a practical deliverable demonstrating applied mastery of ${topic}.`,
          problemStatement: `As an applied specialist in ${body.category || 'Skill Development'}, create a structured end-to-end solution demonstrating mastery of ${topic} with measurable outcomes.`,
          objectives: [
            `Apply core ${topic} concepts to a real-world problem`,
            'Document architecture, steps, and key outcomes clearly',
            'Submit your completed project link or PDF for certification review',
          ],
          instructions: [
            '1. Define your problem statement, users, and measurable scope',
            '2. Build and test your working solution thoroughly',
            '3. Document verification steps and key metrics',
            '4. Upload your summary report or repository link in the submission tab',
          ],
          deliverables: [
            { title: '1. Executive Summary & Scope', description: 'Problem context and objectives', fileTypes: ['PDF', 'DOCX'] },
            { title: '2. Core Implementation Deliverable', description: 'Working prototype, workbook, or codebase', fileTypes: ['GitHub', 'PDF', 'ZIP'] },
            { title: '3. Verification & Presentation Deck', description: 'Test results and visual walkthrough', fileTypes: ['PDF', 'PPTX', 'Link'] },
          ],
          requiredDeliverables: [
            'Executive Summary & Scope Document (PDF/Word)',
            'Working Deliverable / Repository Link',
            'Presentation Slides or Recorded Demo Link',
          ],
          expectedOutput: `A complete, verifiable ${topic} deliverable package ready for 100-mark faculty review.`,
          submissionDeadlineDays: 14,
          evaluationCriteria: [
            { name: 'Subject Knowledge', maxMarks: 20, description: 'Depth of understanding of theoretical principles.' },
            { name: 'Understanding of Concepts', maxMarks: 20, description: 'Accurate application of core methodologies.' },
            { name: 'Practical Implementation', maxMarks: 20, description: 'Working deliverable and quality verification.' },
            { name: 'Creativity & Innovation', maxMarks: 15, description: 'Original thinking and practical refinements.' },
            { name: 'Presentation Skills', maxMarks: 15, description: 'Clarity, structure, and visual presentation.' },
            { name: 'Communication Skills', maxMarks: 10, description: 'Articulate terminology and defense clarity.' },
          ],
          maxMarks: 100,
          difficultyLevel: body.level || 'Intermediate',
        },
      });
    }

    if (pathname.endsWith('/lesson-summary')) {
      return jsonResponse({
        ok: true,
        summary: {
          keyTakeaways: [
            `Core concepts, principles, and terminology of "${topic}".`,
            `Step-by-step practical workflow for applying "${topic}" in real projects.`,
            'Verification checklist to score 70%+ on the assessment and unlock certification.',
          ],
          studyTips: [
            'Capture short bullet notes in the Notes panel while watching each lecture.',
            'Complete the verification quiz right after finishing the video while concepts are fresh.',
          ],
          disclaimer: 'Structured OpenFrame study summary generated from lesson objectives and curriculum metadata.',
        },
      });
    }

    if (pathname.endsWith('/organize-course')) {
      const moduleCount = Math.min(9, Math.max(3, Number(body.moduleCount || 4)));
      const yt = searchStandaloneYouTube(topic, moduleCount * 2);
      const modules = Array.from({ length: moduleCount }, (_, idx) => {
        const modNum = idx + 1;
        const level: 'Beginner' | 'Intermediate' | 'Advanced' =
          modNum <= Math.ceil(moduleCount / 3)
            ? 'Beginner'
            : modNum <= Math.ceil((2 * moduleCount) / 3)
            ? 'Intermediate'
            : 'Advanced';
        const modVideos = yt.videos.slice(idx * 2, idx * 2 + 2);
        const phaseLabel =
          modNum === 1
            ? 'Foundations & Core Terminology'
            : modNum === moduleCount
            ? 'Applied Capstone & Exam Mastery'
            : `Core Concepts & Guided Practice — Part ${modNum}`;
        return {
          moduleNumber: modNum,
          partLabel: `Module ${modNum} · ${level}`,
          level,
          title: `${topic}: ${phaseLabel}`,
          objectives: [
            `Master key concepts in Module ${modNum} of ${topic}`,
            'Apply structured examples and verify understanding with practice questions',
          ],
          summary: `Structured ${level.toLowerCase()}-level learning module covering ${phaseLabel.toLowerCase()} for ${topic}.`,
          practiceExercises: [`Complete guided practice worksheet and short self-check for Module ${modNum}`],
          videoIds: modVideos.map((v) => v.videoId),
          recommendedVideos: modVideos,
        };
      });
      return jsonResponse({
        ok: true,
        path: {
          id: `OF-AI-${Date.now().toString(36)}`,
          topic,
          language: String(body.language || 'English'),
          title: `${topic} — Structured Learning Path`,
          overview: `Step-by-step OpenFrame curriculum organized into ${moduleCount} progressive modules with curated video lectures and practice exercises.`,
          aiDisclaimer: 'Structured OpenFrame skill roadmap organized from verified educational curriculum metadata.',
          sourceMode: 'builtin_engine',
          modules,
          createdAt: new Date().toISOString(),
        },
      });
    }

    if (pathname.endsWith('/discover-and-recommend')) {
      const rawQuery = String(body.query || '').trim();
      const parsedIntent = parseEducationalIntent(rawQuery, body.studentProfile);
      const effectiveTopic = parsedIntent.desiredSkill || parsedIntent.primarySubject || rawQuery || 'Skill Development';
      const searchRes = searchStandaloneCatalog({
        query: rawQuery,
        educationLevel: body.filters?.educationLevel || 'All',
        category: body.filters?.category || 'All',
        language: body.filters?.language || 'All',
        page: 1,
        pageSize: 18,
      });
      const fallbackCourses =
        searchRes.courses.length > 0
          ? searchRes.courses
          : searchStandaloneCatalog({ page: 1, pageSize: 12 }).courses;
      const yt = searchStandaloneYouTube(effectiveTopic, 8);

      const toRecCards = (list: MarketplaceCourse[], catId: any, reasonPrefix: string) =>
        list.map((course, idx) => ({
          course,
          whyRecommended: `${reasonPrefix}: aligned with "${effectiveTopic}" (${course.level}).`,
          matchScore: Math.max(76, 98 - idx * 3),
          recommendationCategory: catId,
        }));

      const recommendationGroups = [
        {
          id: 'recommended_for_you',
          title: 'Recommended For You',
          subtitle: `Top verified OpenFrame courses matching "${effectiveTopic}"`,
          courses: toRecCards(fallbackCourses.slice(0, 6), 'recommended_for_you', 'Direct topic match'),
        },
        {
          id: 'beginner_courses',
          title: 'Foundations & Beginner Tracks',
          subtitle: 'Start smoothly from fundamentals with structured video modules',
          courses: toRecCards(
            fallbackCourses.filter((c) => c.level === 'Beginner' || c.level === 'All Levels').slice(0, 6).length > 0
              ? fallbackCourses.filter((c) => c.level === 'Beginner' || c.level === 'All Levels').slice(0, 6)
              : fallbackCourses.slice(3, 9),
            'beginner_courses',
            'Foundation track'
          ),
        },
        {
          id: 'career_development',
          title: 'Career & Certification Pathways',
          subtitle: 'Job-ready skill development with Quiz, Projects & OpenFrame Certificate',
          courses: toRecCards(fallbackCourses.slice(6, 12), 'career_development', 'Certification track'),
        },
      ].filter((g) => g.courses.length > 0);

      const stageTitles = [
        'Foundations & Core Terminology',
        'Essential Tools & Environment Setup',
        'Core Concepts & Guided Walkthroughs',
        'Applied Problem Solving & Drills',
        'Intermediate Workflows & Patterns',
        'Real-World Case Studies & Analysis',
        'Capstone Project Build & Review',
        'Verification Quiz & Certification Readiness',
      ];
      const stages = stageTitles.map((stTitle, idx) => ({
        stageNumber: idx + 1,
        title: `${effectiveTopic}: ${stTitle}`,
        focusSummary: `Build practical fluency in ${stTitle.toLowerCase()} for ${effectiveTopic}.`,
        estimatedDuration: `Week ${idx + 1} · 3–4 hrs`,
        topics: [`${effectiveTopic} ${stTitle}`, 'Guided Examples', 'Quick Self-Assessment'],
        milestoneAssignment: `Complete Stage ${idx + 1} applied exercise and review checklist for ${effectiveTopic}.`,
        recommendedCourseIds: fallbackCourses.slice(idx % Math.max(1, fallbackCourses.length), (idx % Math.max(1, fallbackCourses.length)) + 2).map((c) => c.id),
        recommendedCourses: fallbackCourses.slice(idx % Math.max(1, fallbackCourses.length), (idx % Math.max(1, fallbackCourses.length)) + 2),
        youtubeResources: yt.videos.slice(idx % Math.max(1, yt.videos.length), (idx % Math.max(1, yt.videos.length)) + 2),
      }));

      return jsonResponse({
        ok: true,
        parsedIntent,
        recommendationGroups,
        youtubeResources: yt.videos,
        relatedSkills: [
          `${effectiveTopic} Fundamentals`,
          'Applied Problem Solving',
          'Project Documentation',
          'Data & Analytical Thinking',
          'Communication & Presentation',
          'Career Interview Readiness',
        ],
        totalMatchedCourses: searchRes.total || fallbackCourses.length,
        youtubeSource: 'standalone_catalog',
        roadmap: {
          id: `roadmap-${Date.now().toString(36)}`,
          topic: effectiveTopic,
          targetOutcome: `Master ${effectiveTopic} from fundamentals to certified capstone delivery`,
          educationContext: parsedIntent.degreeOrClass || parsedIntent.educationLevelLabel || 'All Levels',
          totalEstimatedDuration: '8 Weeks · Self-Paced',
          stages,
          nonDegreeDisclaimer: 'Self-paced OpenFrame Skill Roadmap — structured skill certification track.',
          generatedBy: 'structured_engine',
          createdAt: new Date().toISOString(),
        },
      });
    }

    if (pathname.endsWith('/qa')) {
      const qText = String(body.question || topic);
      const intent = parseEducationalIntent(qText, body.studentProfile);
      const effectiveTopic = intent.desiredSkill || intent.primarySubject || qText;
      const yt = searchStandaloneYouTube(effectiveTopic, 4);
      const matched = searchStandaloneCatalog({ query: effectiveTopic, page: 1, pageSize: 4 }).courses;
      return jsonResponse({
        ok: true,
        question: qText,
        subject: intent.primarySubject || 'General Studies',
        topic: effectiveTopic,
        educationContext: String(body.educationContext || intent.degreeOrClass || 'Self-Paced Learner'),
        language: String(body.language || intent.preferredLanguage || 'English'),
        answer: `**${effectiveTopic}** centers on understanding core principles clearly, applying them step-by-step to practical problems, and validating your outputs against known rules.\n\nStart with the foundational definition, trace a simple worked example, and then attempt a short quiz or mini-project to lock in mastery.`,
        examples: [
          `Worked Example 1: Break a real-world ${effectiveTopic} task into clear inputs, steps, and verified output.`,
          `Worked Example 2: Compare a beginner mistake in ${effectiveTopic} with the structured best-practice approach.`,
        ],
        keyTakeaways: [
          `Master core terminology and structure of ${effectiveTopic}`,
          'Verify understanding using worked examples before scaling up',
          'Reinforce recall with short quizzes and practical projects',
        ],
        relatedConcepts: [`${effectiveTopic} Basics`, 'Applied Case Studies', 'Verification Assessment'],
        recommendedCourses: matched,
        youtubeVideos: yt.videos,
        suggestedLearningPathTitle: `${effectiveTopic} Mastery Roadmap`,
        suggestedLearningPathSteps: [
          `1. Learn core foundations of ${effectiveTopic}`,
          '2. Watch curated educational video lectures',
          '3. Complete verification quiz and practical project',
        ],
        practiceQuiz: [
          {
            id: 'qa-pq-1',
            question: `Which habit accelerates mastery of ${effectiveTopic} the most?`,
            options: [
              'Combining conceptual review with worked examples and self-testing',
              'Skipping definitions and memorizing random outputs',
              'Avoiding practice exercises altogether',
              'Ignoring feedback on mistakes',
            ],
            correctIndex: 0,
            explanation: 'Active recall paired with practical examples builds durable understanding.',
          },
        ],
        generatedBy: 'structured_engine',
      });
    }

    if (pathname.endsWith('/recommend-category')) {
      const primary = Array.isArray(body.availableCategories) && body.availableCategories[0]
        ? String(body.availableCategories[0])
        : 'Programming';
      return jsonResponse({
        ok: true,
        primaryCategory: primary,
        subcategory: String(body.title || topic).slice(0, 48),
        additionalCategories: [primary],
        reason: 'Classified using OpenFrame local curriculum taxonomy.',
      });
    }

    if (pathname.endsWith('/analyze-performance')) {
      const completed = Number(body.completedLessons || 0);
      const total = Math.max(1, Number(body.totalLessons || 1));
      const progressPercentage = Math.min(100, Math.round((completed / total) * 100));
      return jsonResponse({
        ok: true,
        analysis: {
          progressPercentage,
          quizAverage: 82,
          projectScore: 85,
          presentationScore: 84,
          skillDevelopmentScore: Math.max(progressPercentage, 82),
          strengths: ['Consistent progression across structured curriculum lessons'],
          weaknesses: [],
          areasForImprovement: ['Complete remaining module lessons, verification quiz, and practical project submission.'],
          personalizedRecommendation: `Great momentum in ${topic}! Complete your verification quiz and capstone submission to unlock your certificate.`,
          lastAnalyzedAt: new Date().toISOString(),
        },
      });
    }

    return jsonResponse({
      ok: true,
      recommendedCategory: 'Programming',
      readinessScore: 84,
      summary: `Progress on ${topic} is strong. Keep completing modules and assessments.`,
      recommendations: ['Complete remaining module lessons', 'Submit your practical project'],
    });
  }

  // 7. School Partner & Institutional Validation Endpoints (LocalStorage)
  if (pathname.startsWith('/api/school-partner/')) {
    if (pathname.endsWith('/upload-check')) {
      return jsonResponse({ ok: true, allowed: true, scanned: true, safe: true });
    }
    if (pathname.endsWith('/validate-registration')) {
      return jsonResponse({ ok: true, valid: true, issues: [], normalized: body });
    }
    if (pathname.endsWith('/admin/review')) {
      const reviews = readJson<any[]>(KEYS.SCHOOL_REVIEWS, []);
      const entry = { ...body, reviewedAt: new Date().toISOString(), status: body.decision || 'Approved' };
      reviews.unshift(entry);
      writeJson(KEYS.SCHOOL_REVIEWS, reviews.slice(0, 100));
      return jsonResponse({ ok: true, review: entry });
    }
    if (pathname.endsWith('/assessment-sheet')) {
      const dimension = parsedUrl.searchParams.get('dimension') || 'IQ';
      const gradeBand = parsedUrl.searchParams.get('gradeBand') || 'Middle';
      return jsonResponse({
        ok: true,
        dimension,
        gradeBand,
        questions: Array.from({ length: 10 }, (_, idx) => ({
          id: `${dimension.toLowerCase()}_${idx + 1}`,
          prompt: `${dimension} Assessment (${gradeBand}) — Item ${idx + 1}: Choose the strongest reasoned response.`,
          options: ['Analytical & balanced approach', 'Quick guess', 'Avoid decision', 'Random option'],
          correctIndex: 0,
        })),
      });
    }
    if (pathname.endsWith('/score-assessment')) {
      return jsonResponse({
        ok: true,
        scorePercent: 86,
        band: 'Proficient',
        summary: 'Strong balanced performance recorded locally.',
      });
    }
  }

  // 8. Discovery Admin Endpoints
  if (pathname.startsWith('/api/discovery/')) {
    const defaultQuota = {
      apiKeyConfigured: true,
      dailyLimit: 10000,
      usedToday: 120,
      remainingToday: 9880,
      dateKey: new Date().toISOString().slice(0, 10),
      exhausted: false,
    };
    if (pathname.endsWith('/status')) {
      const activeJob = readJson<any>(KEYS.DISCOVERY_JOB, null);
      return jsonResponse({
        ok: true,
        quota: defaultQuota,
        activeJob,
        candidateBufferCount: 0,
        targetGoal: {
          baseCatalog: 22529,
          targetTotal: 50000,
          newlyDiscoveredTarget: 27471,
        },
      });
    }
    if (pathname.endsWith('/search') || pathname.endsWith('/corporate-batch') || pathname.endsWith('/test-batch')) {
      const yt = searchStandaloneYouTube(body.query || body.topic || body.category || 'Corporate Skills', 12);
      const nowIso = new Date().toISOString();
      const items = yt.videos.map((v, i) => ({
        id: `disc_${v.videoId}_${i}`,
        title: v.title,
        description: v.description || v.title,
        category: body.category || v.category || 'Programming',
        language: body.languageLabel || v.language || 'English',
        youtubeVideoId: v.videoId,
        youtubeUrl: v.youtubeUrl,
        youtubeChannelName: v.channelTitle,
        thumbnailUrl: v.thumbnailUrl,
        duration: v.duration,
        reviewStatus: 'Pending Review',
        sourceVerificationStatus: 'Verified YouTube Resource',
        certificateEligibility: true,
        discoveredAt: nowIso,
      }));
      return jsonResponse({
        ok: true,
        items,
        duplicatesSkipped: 0,
        queriesExecuted: 1,
        topicsCovered: [body.category || body.query || 'General'],
        quota: defaultQuota,
        job: {
          id: `job_${Date.now().toString(36)}`,
          status: 'completed',
          discoveredCount: items.length,
          importedCount: 0,
          duplicateCount: 0,
          failedCount: 0,
          updatedAt: nowIso,
        },
      });
    }
    if (pathname.endsWith('/verify-videos')) {
      const vIds: string[] = Array.isArray(body.videoIds) ? body.videoIds : [];
      const pIds: string[] = Array.isArray(body.playlistIds) ? body.playlistIds : [];
      const verifiedVideos: Record<string, any> = {};
      const verifiedPlaylists: Record<string, any> = {};
      for (const id of vIds) verifiedVideos[id] = { valid: true };
      for (const id of pIds) verifiedPlaylists[id] = { valid: true };
      return jsonResponse({ ok: true, verifiedVideos, verifiedPlaylists, quota: defaultQuota });
    }
    if (pathname.includes('/job/')) {
      const status = pathname.endsWith('/stop')
        ? 'stopped'
        : pathname.endsWith('/pause')
        ? 'paused'
        : 'running';
      const job = {
        id: `job_${Date.now().toString(36)}`,
        status,
        discoveredCount: 10,
        importedCount: 0,
        duplicateCount: 0,
        failedCount: 0,
        updatedAt: new Date().toISOString(),
      };
      writeJson(KEYS.DISCOVERY_JOB, job);
      return jsonResponse({ ok: true, job, batchItems: [], quota: defaultQuota });
    }
  }

  // 9. Auth Status, Email Notifications, System Telemetry
  if (pathname === '/api/auth/verification-status') {
    return jsonResponse({
      ok: true,
      emailVerificationAvailable: true,
      smsOtpConfigured: false,
      note: 'Standalone local verification active.',
      emailVerificationRequired: false,
      mode: 'standalone_local',
      verified: true,
    });
  }

  if (pathname === '/api/notifications/email') {
    const saved = standaloneMockService.recordNotification(body);
    return jsonResponse({ ok: true, ...saved });
  }

  if (pathname === '/api/system/telemetry') {
    return jsonResponse({
      ok: true,
      status: 'healthy',
      mode: 'standalone_client_localstorage',
      timestamp: new Date().toISOString(),
    });
  }

  return jsonResponse({ ok: true, standalone: true, endpoint: pathname });
}

// ---------------------------------------------------------------------------
// Note: Callers invoke standaloneApiFetch directly instead of mutating
// window.fetch (which is a getter-only property in sandboxed environments).
// ---------------------------------------------------------------------------
export function installStandaloneApiInterceptor(): void {
  // Intentionally a no-op; all /api/* callers route directly to standaloneApiFetch.
}
