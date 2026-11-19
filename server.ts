import 'dotenv/config';
import express from 'express';
import http from 'http';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  ALL_90_CATEGORIES,
  ALL_MARKETPLACE_CATEGORIES,
  getCategoryFallbackImage,
  synthesizeBaseCourse,
  extractYouTubeIdentifiers,
  matchesDurationFilter,
} from './src/data/marketplaceCatalogData';
import { inferCorporateContentType } from './src/data/corporateTrainingTaxonomy';
import {
  youtubeDiscoveryEngine,
  parseIsoDuration,
} from './server/youtubeDiscoveryEngine';
import {
  detectQueryLanguage,
  normalizeAndExpandQuery,
  parseEducationalIntent,
  scoreSearchMatch,
  matchesWordBoundary,
} from './src/utils/searchIntelligence';
import { EDUCATION_CATEGORY_BY_CODE } from './src/data/educationClassificationData';
import { compute90PercentCoursePricing } from './src/utils/pricingEngine';
import {
  LKG_TO_PG_CURRICULUM_COURSES,
  LKG_TO_PG_YOUTUBE_SEEDS,
} from './src/data/lkgToPgCurriculumData';
import type {
  MarketplaceCourse,
  MarketplaceAutocompleteSuggestion,
  AssessmentDimension,
} from './src/types';
import {
  getQuestionBank,
  stripQuestionAnswers,
  evaluateIqEqSqResponses,
  NON_CLINICAL_EDUCATIONAL_DISCLAIMER,
  type IqEqSqGradeBand,
} from './src/data/iqEqSqQuestionsData';
import {
  buildDeterministicChapterNote,
  buildDeterministic30QuestionExam,
  buildSubjectContextualIqEqSqBank,
} from './src/data/selfStudyMasterCatalog';

const geminiTelemetry = {
  dateKey: new Date().toISOString().slice(0, 10),
  totalCallsToday: 0,
  errorsToday: 0,
  lastCallAt: undefined as string | undefined,
  lastEndpoint: undefined as string | undefined,
};

const searchTelemetry = {
  dateKey: new Date().toISOString().slice(0, 10),
  totalSearchesToday: 0,
  recentQueries: [] as Array<{
    query: string;
    detectedLanguage: string;
    resultCount: number;
    searchedAt: string;
  }>,
};

function trackGeminiCall(endpoint: string, failed = false) {
  const today = new Date().toISOString().slice(0, 10);
  if (geminiTelemetry.dateKey !== today) {
    geminiTelemetry.dateKey = today;
    geminiTelemetry.totalCallsToday = 0;
    geminiTelemetry.errorsToday = 0;
  }
  geminiTelemetry.totalCallsToday++;
  if (failed) geminiTelemetry.errorsToday++;
  geminiTelemetry.lastCallAt = new Date().toISOString();
  geminiTelemetry.lastEndpoint = endpoint;
}

function trackSearchQuery(query: string, detectedLanguage: string, resultCount: number) {
  const clean = (query || '').trim();
  if (!clean) return;
  const today = new Date().toISOString().slice(0, 10);
  if (searchTelemetry.dateKey !== today) {
    searchTelemetry.dateKey = today;
    searchTelemetry.totalSearchesToday = 0;
    searchTelemetry.recentQueries = [];
  }
  searchTelemetry.totalSearchesToday++;
  searchTelemetry.recentQueries.unshift({
    query: clean.slice(0, 160),
    detectedLanguage,
    resultCount,
    searchedAt: new Date().toISOString(),
  });
  if (searchTelemetry.recentQueries.length > 50) {
    searchTelemetry.recentQueries = searchTelemetry.recentQueries.slice(0, 50);
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_TEXT = 'gemini-4-hydrogen';

let geminiQuotaExhaustedUntilMs = 0;
const organizeCourseCache = new Map<string, { ts: number; path: any }>();
const ORGANIZE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

function extractGeminiRetrySeconds(err: any): number {
  const msg = typeof err?.message === 'string' ? err.message : JSON.stringify(err || '');
  const retryDelayMatch = msg.match(/"retryDelay"\s*:\s*"(\d+)s"/i);
  if (retryDelayMatch?.[1]) {
    return Math.min(3600, Math.max(60, Number(retryDelayMatch[1])));
  }
  return 900;
}

function classifyGeminiError(err: any): {
  status: number;
  errorCode: string;
  message: string;
  retryAfterSeconds?: number;
} {
  const raw = typeof err?.message === 'string' ? err.message : JSON.stringify(err || '');
  const lower = raw.toLowerCase();
  const httpStatus = Number(err?.status || err?.code || 0);

  if (httpStatus === 429 || lower.includes('resource_exhausted') || lower.includes('quota')) {
    const retryAfterSeconds = extractGeminiRetrySeconds(err);
    geminiQuotaExhaustedUntilMs = Date.now() + retryAfterSeconds * 1000;
    return {
      status: 429,
      errorCode: 'RESOURCE_EXHAUSTED',
      retryAfterSeconds,
      message:
        'Gemini API daily free-tier quota has been reached. Use Settings > Secrets to select a billing-enabled API key for higher limits, or try again after the quota resets.',
    };
  }

  if (httpStatus === 400 || httpStatus === 401 || httpStatus === 403 || lower.includes('api_key_invalid') || lower.includes('permission_denied')) {
    return {
      status: httpStatus === 400 ? 400 : 403,
      errorCode: 'GEMINI_AUTH_ERROR',
      message: 'Gemini API authentication failed. Please verify the API key in Settings > Secrets.',
    };
  }

  if (httpStatus === 404 || lower.includes('not_found')) {
    return {
      status: 404,
      errorCode: 'MODEL_NOT_FOUND',
      message: `Requested Gemini model (${MODEL_TEXT}) is unavailable.`,
    };
  }

  return {
    status: 502,
    errorCode: 'GEMINI_UPSTREAM_ERROR',
    message: 'Unable to complete Gemini request right now. Please try again shortly.',
  };
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (Date.now() < geminiQuotaExhaustedUntilMs) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 30000,
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function withGeminiTimeout<T>(
  runner: (abortSignal: AbortSignal) => Promise<T>,
  timeoutMs = 15000,
  label = 'Gemini request'
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | null = null;
  try {
    const result = await Promise.race([
      runner(controller.signal),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new Error(`${label} timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
    trackGeminiCall(label, false);
    return result;
  } catch (err) {
    trackGeminiCall(label, true);
    classifyGeminiError(err);
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

interface CuratedVideoSeed {
  id: string;
  videoId: string;
  title: string;
  channelTitle: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  subject: string;
  recommendedReason: string;
}

const VERIFIED_EDUCATIONAL_VIDEO_POOL: CuratedVideoSeed[] = [
  {
    id: 'yt-ai-1',
    videoId: 'JMUxmLyrhSk',
    title: 'MIT 6.034 Artificial Intelligence: Intelligent Agents & Search',
    channelTitle: 'MIT OpenCourseWare',
    duration: '49:22',
    level: 'Beginner',
    subject: 'artificial intelligence ai search agents',
    recommendedReason: 'Foundational lecture establishing problem formulation, heuristics, and intelligent agent architectures.',
  },
  {
    id: 'yt-ai-2',
    videoId: 'wjZofJX0v4U',
    title: 'Intro to Large Language Models & Generative AI Systems',
    channelTitle: 'Andrej Karpathy',
    duration: '1:00:23',
    level: 'Intermediate',
    subject: 'generative ai llm prompt engineering artificial intelligence',
    recommendedReason: 'Explains pretraining, RLHF alignment, tool use, and security risks inside modern foundation models.',
  },
  {
    id: 'yt-ai-3',
    videoId: 'kCc8FmEb1nY',
    title: "Let's Build GPT from Scratch in Code — Transformer Architecture",
    channelTitle: 'Andrej Karpathy',
    duration: '1:56:00',
    level: 'Advanced',
    subject: 'generative ai transformers deep learning pytorch',
    recommendedReason: 'Production-level architectural walkthrough implementing self-attention and decoder blocks.',
  },
  {
    id: 'yt-ml-1',
    videoId: 'i_LwzRVP7bg',
    title: 'Stanford CS229 Machine Learning — Supervised Learning & Cost Functions',
    channelTitle: 'Stanford Online',
    duration: '1:16:48',
    level: 'Beginner',
    subject: 'machine learning regression data science',
    recommendedReason: 'Rigorous mathematical introduction to hypothesis spaces, gradient descent, and linear models.',
  },
  {
    id: 'yt-ml-2',
    videoId: 'IHZwWFHWa-w',
    title: 'Gradient Descent & Backpropagation Visually Explained',
    channelTitle: '3Blue1Brown',
    duration: '21:05',
    level: 'Intermediate',
    subject: 'machine learning neural networks deep learning math',
    recommendedReason: 'Builds clear geometric intuition for multivariate optimization and chain-rule backpropagation.',
  },
  {
    id: 'yt-py-1',
    videoId: '_uQrJ0TkZlc',
    title: 'Python Programming Full Course for Beginners',
    channelTitle: 'Programming with Mosh',
    duration: '1:00:14',
    level: 'Beginner',
    subject: 'python coding programming software development',
    recommendedReason: 'Structured introduction to variables, control flow, modular functions, and OOP in Python.',
  },
  {
    id: 'yt-py-2',
    videoId: 'vmEHCJofslg',
    title: 'Python Pandas & Data Science Pipeline Complete Tutorial',
    channelTitle: 'freeCodeCamp.org',
    duration: '2:15:30',
    level: 'Intermediate',
    subject: 'python data analytics pandas numpy data science',
    recommendedReason: 'Hands-on tabular cleaning, aggregation pipelines, and exploratory statistics on real datasets.',
  },
  {
    id: 'yt-web-1',
    videoId: 'PkZNo7MFNFg',
    title: 'Modern JavaScript Full Course — Async, DOM & ES6+',
    channelTitle: 'freeCodeCamp.org',
    duration: '3:26:00',
    level: 'Beginner',
    subject: 'web development javascript frontend html css',
    recommendedReason: 'Essential language mechanics covering asynchronous execution, closures, and interactive interfaces.',
  },
  {
    id: 'yt-web-2',
    videoId: 'bMknfKXIFA8',
    title: 'React & TypeScript Component Engineering Complete Guide',
    channelTitle: 'freeCodeCamp.org',
    duration: '3:45:00',
    level: 'Intermediate',
    subject: 'web development react typescript frontend',
    recommendedReason: 'Covers component composition, hooks, state isolation, and scalable web architecture.',
  },
  {
    id: 'yt-web-3',
    videoId: 'Oe421EPjeBE',
    title: 'Node.js & Express Backend API Systems Architecture',
    channelTitle: 'freeCodeCamp.org',
    duration: '8:16:00',
    level: 'Advanced',
    subject: 'web development backend nodejs express api full stack',
    recommendedReason: 'End-to-end REST engineering, middleware pipelines, validation, and authentication security.',
  },
  {
    id: 'yt-cloud-1',
    videoId: 'ulprqHHWlng',
    title: 'Cloud Computing Architecture Fundamentals — Compute, IAM & Storage',
    channelTitle: 'freeCodeCamp.org',
    duration: '4:18:20',
    level: 'Beginner',
    subject: 'cloud computing aws devops infrastructure',
    recommendedReason: 'Complete blueprint of virtual networking, identity permissions, object storage, and cloud resilience.',
  },
  {
    id: 'yt-cloud-2',
    videoId: 'pg19Z8LL06w',
    title: 'Docker & Kubernetes Container Orchestration Workshop',
    channelTitle: 'TechWorld with Nana',
    duration: '3:05:00',
    level: 'Advanced',
    subject: 'cloud devops docker kubernetes deployment',
    recommendedReason: 'Production deployment workflow covering container images, service discovery, and rolling updates.',
  },
  {
    id: 'yt-sec-1',
    videoId: '3Kq1MIfTWCE',
    title: 'Cybersecurity & Threat Modeling Complete Foundations',
    channelTitle: 'freeCodeCamp.org',
    duration: '4:10:00',
    level: 'Beginner',
    subject: 'cybersecurity networking security ethical hacking',
    recommendedReason: 'Core security posture covering encryption, OWASP vulnerabilities, and defense-in-depth.',
  },
  {
    id: 'yt-dm-1',
    videoId: 'bixR-KIJKYM',
    title: 'Digital Marketing Strategy, SEO & Social Media Funnels',
    channelTitle: 'Simplilearn',
    duration: '54:12',
    level: 'Beginner',
    subject: 'digital marketing business seo social media campaign',
    recommendedReason: 'Covers audience segmentation, conversion funnels, paid ad targeting, and ROI analytics.',
  },
  {
    id: 'yt-ux-1',
    videoId: 'c9Wg6Cb_YlU',
    title: 'UI / UX Design Systems & Prototyping Complete Course',
    channelTitle: 'freeCodeCamp.org',
    duration: '2:12:00',
    level: 'Beginner',
    subject: 'ui ux design product figma creative',
    recommendedReason: 'Structured design workflow from user research and typography scales to interactive prototypes.',
  },
  {
    id: 'yt-cs-1',
    videoId: '30tCG5BMydA',
    title: 'Harvard CS50 Computational Thinking & Computer Science Foundations',
    channelTitle: 'CS50',
    duration: '2:25:00',
    level: 'Beginner',
    subject: 'computer science stem academic education engineering bca btech',
    recommendedReason: 'Gold-standard introduction to algorithmic thinking, abstraction, and problem decomposition.',
  },
  {
    id: 'yt-econ-1',
    videoId: '3ez10ADR_gM',
    title: 'Intro to Economics & Microeconomics — Supply, Demand & Scarcity',
    channelTitle: 'CrashCourse',
    duration: '12:08',
    level: 'Beginner',
    subject: 'microeconomics economics supply demand commerce puc bcom ba',
    recommendedReason: 'Clear foundational explanation of microeconomic decision-making, scarcity, incentives, and market equilibrium.',
  },
  {
    id: 'yt-acc-1',
    videoId: 'yYX4bvQSqbo',
    title: 'Accounting Basics Explained Through Story — Debits, Credits & Balance Sheet',
    channelTitle: 'Accounting Stuff',
    duration: '18:05',
    level: 'Beginner',
    subject: 'accounting commerce puc bcom finance bookkeeping ledger gst',
    recommendedReason: 'Step-by-step introduction to double-entry bookkeeping, income statements, and balance sheets for PUC & BCom learners.',
  },
  {
    id: 'yt-fin-1',
    videoId: 'WEDIj9JBTC8',
    title: 'Finance & Investing Valuation — Cash Flow, Time Value of Money & Capital',
    channelTitle: 'Ackman Finance Lecture',
    duration: '43:39',
    level: 'Intermediate',
    subject: 'finance corporate finance mba bcom valuation investing',
    recommendedReason: 'Practical framework for financial modeling, discounted cash flow, capital allocation, and business risk.',
  },
  {
    id: 'yt-math-1',
    videoId: 'fNk_zzaMoSs',
    title: 'Essence of Mathematics — Vectors, Algebraic Structures & Geometric Reasoning',
    channelTitle: '3Blue1Brown',
    duration: '9:52',
    level: 'Beginner',
    subject: 'mathematics class 5 class 10 puc bsc engineering algebra geometry fractions',
    recommendedReason: 'Builds visual intuition for foundational mathematical structures applicable from school to university engineering.',
  },
  {
    id: 'yt-sci-1',
    videoId: 'bHIhgxav9LY',
    title: 'Physics & Science Principles Explained Clearly — Energy, Circuits & Forces',
    channelTitle: 'Veritasium',
    duration: '14:15',
    level: 'Beginner',
    subject: 'science physics chemistry biology class 10 secondary puc',
    recommendedReason: 'Demystifies physical laws, energy transfer, and real-world scientific reasoning with clear visual demonstrations.',
  },
  {
    id: 'yt-comm-1',
    videoId: 'HAnw168huqA',
    title: 'Think Fast, Talk Smart: Communication Skills & Confident Speaking',
    channelTitle: 'Stanford Graduate School of Business',
    duration: '58:18',
    level: 'Beginner',
    subject: 'communication skills spoken english public speaking career professional personality',
    recommendedReason: 'Practical communication framework for structured speaking, confidence, active listening, and workplace persuasion.',
  },
  {
    id: 'yt-res-1',
    videoId: '2_wM2R-x6oI',
    title: 'Research Methodology Complete Guide — Quantitative, Qualitative & Literature Review',
    channelTitle: 'Scribbr',
    duration: '15:24',
    level: 'Intermediate',
    subject: 'research methodology phd postgraduate doctoral academic writing thesis mba msc',
    recommendedReason: 'Covers research design, sampling methods, data collection validity, and peer-reviewed academic writing standards.',
  },
  {
    id: 'yt-excel-1',
    videoId: 'wbJcJCkBcMg',
    title: 'Microsoft Excel for Beginners — Complete Course from Scratch',
    channelTitle: 'Kevin Stratvert / OpenFrame Curated',
    duration: '54:20',
    level: 'Beginner',
    subject: 'microsoft excel spreadsheet spreadsheets workbook cells formulas beginner tutorial',
    recommendedReason: 'Hands-on walkthrough of Excel ribbons, data entry, formatting, basic formulas, and worksheet organization.',
  },
  {
    id: 'yt-excel-2',
    videoId: '7QNgqq154gE',
    title: 'Complete Microsoft Excel Tutorial for Data Analysis (Formulas, VLOOKUP & Pivot Tables)',
    channelTitle: 'Data Analytics Academy',
    duration: '4:00:00',
    level: 'Intermediate',
    subject: 'microsoft excel data analysis vlookup xlookup formulas pivot tables spreadsheet analytics',
    recommendedReason: 'Covers IF, SUMIFS, XLOOKUP/VLOOKUP, PivotTables, and cleaning business datasets in Excel.',
  },
  {
    id: 'yt-excel-3',
    videoId: 'WV6X0rol5To',
    title: 'How to Build Interactive Dashboards & Reports in Microsoft Excel',
    channelTitle: 'Excel BI & Reporting',
    duration: '38:15',
    level: 'Advanced',
    subject: 'microsoft excel dashboard dashboards pivot charts slicers reporting kpi',
    recommendedReason: 'Teaches end-to-end KPI dashboard architecture, dynamic PivotCharts, and executive reporting.',
  },
  {
    id: 'yt-web-build-1',
    videoId: '-W9F__D3oY4',
    title: 'How to Build a Website from Scratch — Complete HTML5 & CSS3 Course',
    channelTitle: 'freeCodeCamp / Web Mastery',
    duration: '2:30:00',
    level: 'Beginner',
    subject: 'how to build a website create website web development html css webpage beginner',
    recommendedReason: 'Step-by-step tutorial on building your first responsive website with clean HTML5 semantics and CSS3 layout.',
  },
  {
    id: 'yt-web-build-2',
    videoId: 'l1EssrLxt7E',
    title: 'Responsive Website Design & Flexbox/Grid Architecture Complete Guide',
    channelTitle: 'Web Dev Simplified / Curated',
    duration: '1:45:00',
    level: 'Intermediate',
    subject: 'website design responsive layout flexbox grid web development build website',
    recommendedReason: 'Demonstrates mobile-first grids, navigation bars, landing page sections, and modern styling workflows.',
  },
  {
    id: 'yt-web-build-3',
    videoId: 'tVzUXW6siu0',
    title: 'Modern Website Engineering: Tailwind CSS, JavaScript & Production Launch',
    channelTitle: 'Frontend Engineering Lab',
    duration: '2:10:00',
    level: 'Advanced',
    subject: 'website full stack frontend tailwind javascript deploy hosting seo build website',
    recommendedReason: 'Guides learners from component styling and interactive JavaScript to deploying a live website.',
  },
  ...LKG_TO_PG_YOUTUBE_SEEDS,
];

function selectCuratedFallbackVideos(queryText: string, category = ''): any[] {
  const combinedQuery = `${queryText} ${category}`.trim();
  const scored = VERIFIED_EDUCATIONAL_VIDEO_POOL.map((vid) => {
    const score = combinedQuery
      ? scoreSearchMatch(
          {
            title: vid.title,
            category: vid.subject,
            keywords: vid.subject.split(/\s+/),
            shortDesc: vid.recommendedReason,
            youtubeChannelName: vid.channelTitle,
          },
          combinedQuery
        )
      : 10;
    return { vid, score };
  }).sort((a, b) => b.score - a.score);

  // If we have genuine topic matches, NEVER dilute them with unrelated AI fallback videos
  const topicMatched = scored[0]?.score > 0 ? scored.filter((s) => s.score > 0) : scored;

  const beginner = topicMatched.find((s) => s.vid.level === 'Beginner')?.vid || topicMatched[0]?.vid || VERIFIED_EDUCATIONAL_VIDEO_POOL[0];
  const intermediate = topicMatched.find((s) => s.vid.level === 'Intermediate')?.vid || topicMatched[1]?.vid || beginner;
  const advanced = topicMatched.find((s) => s.vid.level === 'Advanced')?.vid || topicMatched[2]?.vid || intermediate;

  const unique: CuratedVideoSeed[] = [];
  for (const cand of [beginner, intermediate, advanced, ...topicMatched.map((s) => s.vid)]) {
    if (cand && !unique.some((u) => u.videoId === cand.videoId)) {
      unique.push(cand);
    }
    if (unique.length >= 3) break;
  }

  return unique.map((v) => ({
    id: v.id,
    videoId: v.videoId,
    youtubeId: v.videoId,
    youtubeUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
    title: v.title,
    channelTitle: v.channelTitle,
    thumbnail: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
    thumbnailUrl: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
    duration: v.duration,
    level: v.level,
    difficultyLevel: v.level,
    recommendedReason: v.recommendedReason,
    rationale: v.recommendedReason,
    embedUrl: `https://www.youtube-nocookie.com/embed/${v.videoId}`,
    source: 'curated_library',
  }));
}

interface IndexedBaseCourse {
  course: MarketplaceCourse;
  searchBlob: string;
}

interface BaseCatalogIndex {
  items: IndexedBaseCourse[];
  byId: Map<string, MarketplaceCourse>;
  categoryCounts: Record<string, number>;
  subcategories: Array<{ name: string; category: string; count: number }>;
  instructors: Array<{ name: string; count: number }>;
  channels: Array<{ name: string; count: number }>;
  languages: Array<{ name: string; count: number }>;
}

let cachedBaseIndex: BaseCatalogIndex | null = null;

function normalizeLoadedCourse(raw: any): MarketplaceCourse {
  const recVideos = Array.isArray(raw.recommendedVideos) ? raw.recommendedVideos : [];
  const firstVid = recVideos[0];
  const rawYtId =
    raw.youtubeVideoId ||
    (firstVid && (firstVid.youtubeId || firstVid.videoId)) ||
    undefined;
  const rawPlId = raw.youtubePlaylistId || undefined;
  const extracted = extractYouTubeIdentifiers(
    raw.youtubePlaylistUrl || raw.youtubeUrl || rawYtId || firstVid?.embedUrl
  );

  const isRealYtId = (v?: string) =>
    Boolean(v && /^[A-Za-z0-9_-]{11}$/.test(v) && !v.startsWith('yt_ai_') && v !== 'dQw4w9WgXcQ');

  let youtubeVideoId = isRealYtId(raw.youtubeVideoId)
    ? raw.youtubeVideoId
    : isRealYtId(firstVid?.youtubeId)
    ? firstVid.youtubeId
    : isRealYtId(firstVid?.videoId)
    ? firstVid.videoId
    : isRealYtId(extracted.videoId)
    ? extracted.videoId
    : undefined;

  // Map synthetic yt_ai_* base catalog video entries to matched verified educational videos
  let normalizedRecVideos = recVideos;
  if (!youtubeVideoId && (recVideos.length > 0 || rawYtId)) {
    const topicText = `${raw.title || ''} ${raw.category || ''} ${raw.subcategory || ''}`;
    const rankedSeeds = VERIFIED_EDUCATIONAL_VIDEO_POOL.map((seed) => ({
      seed,
      score: scoreSearchMatch(
        { title: seed.title, category: seed.subject, keywords: seed.subject.split(/\s+/) },
        topicText
      ),
    })).sort((a, b) => b.score - a.score);
    const matchedSeed = (rankedSeeds[0]?.score > 0 ? rankedSeeds[0].seed : undefined) || VERIFIED_EDUCATIONAL_VIDEO_POOL[0];
    youtubeVideoId = matchedSeed.videoId;
    if (recVideos.length > 0) {
      normalizedRecVideos = recVideos.map((v: any, idx: number) => {
        const seed =
          (rankedSeeds[idx]?.score > 0 ? rankedSeeds[idx].seed : undefined) ||
          matchedSeed;
        const existingValid = isRealYtId(v.youtubeId) || isRealYtId(v.videoId);
        if (existingValid) return v;
        return {
          ...v,
          videoId: seed.videoId,
          youtubeId: seed.videoId,
          embedUrl: `https://www.youtube-nocookie.com/embed/${seed.videoId}`,
          thumbnail: v.thumbnail?.startsWith('http') ? v.thumbnail : `https://i.ytimg.com/vi/${seed.videoId}/hqdefault.jpg`,
          thumbnailUrl: `https://i.ytimg.com/vi/${seed.videoId}/hqdefault.jpg`,
          channelTitle: v.channelTitle || seed.channelTitle,
        };
      });
    }
  }

  const youtubePlaylistId = rawPlId || extracted.playlistId;

  const courseType =
    raw.courseType ||
    (youtubePlaylistId
      ? 'youtube_playlist'
      : youtubeVideoId
      ? 'youtube_video'
      : 'standard');

  const priced = compute90PercentCoursePricing({
    rawPrice: raw.price,
    category: raw.category,
    categoryGroup: raw.categoryGroup,
    level: raw.level,
    pricingTier: raw.pricingTier,
    educationLevel: Array.isArray(raw.educationLevels) ? raw.educationLevels[0] : undefined,
    degreeOrClass: Array.isArray(raw.degreeProgrammes) ? raw.degreeProgrammes[0] : raw.gradeLevel,
    title: raw.title,
  });
  const price = priced.finalPriceInr;
  const marketBenchmarkPrice = priced.marketBenchmarkPrice;
  const discountPercent = priced.discountPercent;
  const isFree = false;
  const pricingTier = priced.pricingTier;
  const instructorName =
    raw.instructorName ||
    raw.instructor?.name ||
    'OpenFrame Academic Faculty';
  const youtubeChannelName =
    raw.youtubeChannelName ||
    (normalizedRecVideos[0] && normalizedRecVideos[0].channelTitle) ||
    undefined;
  const language = raw.language || 'English';
  const categories =
    Array.isArray(raw.categories) && raw.categories.length > 0
      ? raw.categories
      : [raw.category || 'Artificial Intelligence'];
  const keywords =
    Array.isArray(raw.keywords) && raw.keywords.length > 0
      ? raw.keywords
      : [raw.category, raw.subcategory, ...(raw.skillsAcquired || [])].filter(Boolean);

  const rawThumb = String(raw.thumbnailUrl || raw.imageUrl || '').trim();
  const resolvedThumbnail =
    rawThumb && !rawThumb.endsWith('.svg') && !rawThumb.includes('/of_ai_')
      ? rawThumb
      : youtubeVideoId
      ? `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`
      : getCategoryFallbackImage(raw.category || '', raw.categoryGroup || '');

  const reviewCount = Number(raw.reviewCount || 0);
  const hasVerifiedReviews = Boolean(raw.hasVerifiedReviews && reviewCount > 0);

  return {
    ...raw,
    recommendedVideos: normalizedRecVideos,
    categories,
    pricingTier,
    price,
    marketBenchmarkPrice,
    discountPercent,
    isFree,
    reviewCount,
    hasVerifiedReviews,
    courseType,
    contentType: raw.contentType,
    topic: raw.topic,
    libraryCollection: raw.libraryCollection,
    durationMinutes: raw.durationMinutes,
    sourceVerificationStatus: raw.sourceVerificationStatus,
    youtubeVideoId,
    youtubeUrl:
      raw.youtubeUrl ||
      (youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : undefined),
    youtubePlaylistId,
    youtubePlaylistUrl:
      raw.youtubePlaylistUrl ||
      (youtubePlaylistId ? `https://www.youtube.com/playlist?list=${youtubePlaylistId}` : undefined),
    youtubeChannelName,
    instructorName,
    language,
    keywords,
    imageUrl: resolvedThumbnail,
    thumbnailUrl: resolvedThumbnail,
    isCustomAdded: false,
  } as MarketplaceCourse;
}

function getBaseCatalogIndex(): BaseCatalogIndex {
  if (cachedBaseIndex) return cachedBaseIndex;

  const TARGET_BASE = 15000;
  let loadedRaw: any[] = [];

  // Prefer compressed server-only catalog (all 15,000 courses without bloating public/dist)
  const gzCatalogPath = path.resolve(__dirname, 'server', 'data', 'catalog_15k.json.gz');
  try {
    if (fs.existsSync(gzCatalogPath)) {
      const parsed = JSON.parse(zlib.gunzipSync(fs.readFileSync(gzCatalogPath)).toString('utf8'));
      if (Array.isArray(parsed)) {
        loadedRaw = parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read server/data/catalog_15k.json.gz, falling back:', err);
    loadedRaw = [];
  }

  // Fallback to enriched 15-batch catalog in public/data/catalog_15k if present
  if (loadedRaw.length === 0) {
    const batchDir = path.resolve(__dirname, 'public', 'data', 'catalog_15k');
    try {
      if (fs.existsSync(batchDir)) {
        const files = fs
          .readdirSync(batchDir)
          .filter((f) => /^batch_\d+\.json$/i.test(f))
          .sort();
        for (const file of files) {
          const chunk = JSON.parse(fs.readFileSync(path.join(batchDir, file), 'utf8'));
          if (Array.isArray(chunk)) {
            loadedRaw.push(...chunk);
          }
        }
      }
    } catch (err) {
      console.warn('Could not read public/data/catalog_15k batches, falling back:', err);
      loadedRaw = [];
    }
  }

  if (loadedRaw.length === 0) {
    const jsonPath = path.resolve(__dirname, 'public', 'data', 'marketplace_courses.json');
    try {
      if (fs.existsSync(jsonPath)) {
        const content = fs.readFileSync(jsonPath, 'utf8');
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          loadedRaw = parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read public/data/marketplace_courses.json, synthesizing base:', err);
    }
  }

  const normalizedList: MarketplaceCourse[] = loadedRaw.map(normalizeLoadedCourse);
  const startIdx = normalizedList.length + 1;
  for (let i = startIdx; i <= TARGET_BASE; i++) {
    normalizedList.push(synthesizeBaseCourse(i));
  }

  // Append Corporate Management & Employee Skill Development Library (500 verified videos across 20 categories x 25)
  const gzCorpPath = path.resolve(__dirname, 'server', 'data', 'corporate_training_courses.json.gz');
  const corpJsonPath = path.resolve(__dirname, 'public', 'data', 'corporate_training_courses.json');
  try {
    let corpParsed: any = null;
    if (fs.existsSync(gzCorpPath)) {
      corpParsed = JSON.parse(zlib.gunzipSync(fs.readFileSync(gzCorpPath)).toString('utf8'));
    } else if (fs.existsSync(corpJsonPath)) {
      corpParsed = JSON.parse(fs.readFileSync(corpJsonPath, 'utf8'));
    }
    if (Array.isArray(corpParsed)) {
      for (const rawCorp of corpParsed) {
        normalizedList.push(normalizeLoadedCourse(rawCorp));
      }
    }
  } catch (err) {
    console.warn('Could not read corporate_training_courses catalog:', err);
  }

  // Inject Featured Ramotion Swift UI Animations, Graphs & Charts Course Pack (with downloadable ZIPs)
  const animationMasterCourses: any[] = [
    {
      id: 'OF-CRS-ANIM-001',
      aliasId: 'swift-ui-animation-components-and-libraries',
      title: 'Swift UI Animation Components, Graphs & Charts Masterclass (ZIP + Interactive Lab)',
      category: 'Animation',
      categories: ['Animation', 'iOS Development', 'UI/UX Design', 'Data Analytics'],
      categoryGroup: 'Creative',
      subcategory: 'UI Motion, Charts & Swift Components',
      level: 'All Levels',
      duration: '14h 30m',
      estimatedHours: 14.5,
      pricingTier: 'Academic Access',
      price: 0,
      status: 'Published',
      courseType: 'standard',
      contentType: 'Full course',
      topic: 'Swift UI Animation Components, Interactive Graphs & Charts',
      instructorName: 'Ramotion Open-Source & OpenFrame Design Faculty',
      language: 'English',
      rating: 4.9,
      enrolledCount: 98500,
      isPopular: true,
      isTrending: true,
      isNew: true,
      isRecommended: true,
      certificateEligibility: true,
      thumbnailUrl: '/assets/images/swift_animation_course_hero.jpg',
      imageUrl: '/assets/images/swift_animation_course_hero.jpg',
      shortDesc: 'Complete downloadable ZIP course pack from Ramotion/swift-ui-animation-components-and-libraries plus 12 animated graphs & charts and all 17 interactive Swift UI animation components.',
      description: 'Includes the full source ZIP archives (AppDelegate.swift, README.md, LICENSE, 17 Swift UI animation libraries, 12 interactive animated graphs & charts, and Spring Physics solvers).',
      learningObjectives: [
        'Download and integrate all 17 Ramotion Swift UI animation components (Folding Cell, Circle Menu, Fluid Slider, Paper Switch, Garland View, and more)',
        'Build 12 interactive animated graphs & charts (Line, Area, Bar, Stacked Bar, Donut/Pie, Radial Rings, Radar, Scatter, Candlestick, Heatmap, Funnel, Treemap, Oscilloscope)',
        'Master damped harmonic spring physics, cubic-bezier easing curves, and 60fps compositor transitions',
        'Install UI animation modules via CocoaPods, Carthage, and Swift Package Manager'
      ],
      skillsAcquired: ['Swift UI Animation', 'Animated Graphs & Charts', 'CoreAnimation', 'Spring Physics', 'iOS UIKit', 'Interactive Data Visualization'],
      practicalProjects: [
        'Interactive 12-Chart Telemetry & Financial Analytics Dashboard',
        'Ramotion Folding Cell & Circle Menu iOS Prototype (from Course ZIP)',
        'Harmonic Spring Motion & Fluid Slider Control Component'
      ],
      modules: [
        { moduleNumber: 1, title: 'Course ZIP Setup, AppDelegate & Package Managers', duration: '1h 45m', lessons: ['Repository Structure & MIT License', 'CocoaPods, Carthage & SPM Setup', 'AppDelegate.swift & Project Scaffolding'] },
        { moduleNumber: 2, title: 'All 12 Animated Graphs & Charts Masterclass', duration: '4h 30m', lessons: ['Line, Gradient Area & Grouped/Stacked Bars', 'Donut, Pie & Radial Activity Rings', 'Radar Web, Scatter Bubble & Candlestick OHLC', 'Heatmap Matrix, Funnel, Treemap & Live Waveform'] },
        { moduleNumber: 3, title: '17 Ramotion Swift UI Animation Components', duration: '6h 15m', lessons: ['Circular Carousel, CardSlider, Gliding Collection & Garland View', 'Folding Cell, Expanding Collection & Elongation Preview', 'Animated Tab Bar, Adaptive Tab Bar, Navigation Toolbar & Stack', 'Circle Menu, Paper Switch, Paper Onboarding, Reel Search & Fluid Slider'] },
        { moduleNumber: 4, title: 'Spring Physics & 60fps Compositor Optimization', duration: '2h 00m', lessons: ['Harmonic Damped Spring Solver', 'Cubic-Bezier Timing Curves & GPU Transforms'] }
      ],
      assessmentMethod: 'Interactive Studio Simulation + Quinn AI Quiz + Capstone Submission',
      certificateNote: 'Verified OpenFrame Education Certificate eligible upon completing quiz and practical capstone.',
      keywords: ['swift', 'animation', 'zip', 'ramotion', 'graphs', 'charts', 'folding cell', 'fluid slider', 'circle menu', 'ios', 'ui'],
      publishedDate: '2026-11-15',
    },
    {
      id: 'OF-CRS-ANIM-002',
      title: 'Interactive Data Visualization: All 12 Graphs & Charts Animation Studio',
      category: 'Data Analytics',
      categories: ['Data Analytics', 'Animation', 'UI/UX Design'],
      categoryGroup: 'Technology',
      subcategory: 'Animated Charts & Graphs',
      level: 'Intermediate',
      duration: '8h 20m',
      estimatedHours: 8.3,
      pricingTier: 'Academic Access',
      price: 0,
      status: 'Published',
      courseType: 'standard',
      contentType: 'Workshop',
      topic: 'Animated Charts & Graphs',
      instructorName: 'OpenFrame Visualization Faculty',
      language: 'English',
      rating: 4.9,
      enrolledCount: 84200,
      isPopular: true,
      isTrending: true,
      isNew: true,
      certificateEligibility: true,
      thumbnailUrl: '/assets/images/charts_graphs_showcase.jpg',
      imageUrl: '/assets/images/charts_graphs_showcase.jpg',
      shortDesc: 'Hands-on workshop covering Line, Area, Bar, Pie/Donut, Radial Rings, Radar, Scatter, Candlestick, Heatmap, Funnel, Treemap, and Live Waveform animations with downloadable ZIP pack.',
      learningObjectives: [
        'Animate SVG & Swift Charts paths using spring, elastic, and cubic-out easing curves',
        'Build interactive tooltips, stacked/grouped toggles, and real-time 60fps waveform streams'
      ],
      skillsAcquired: ['Line & Area Charts', 'Candlestick OHLC', 'Radar Plots', 'Heatmaps & Treemaps', 'SVG Motion'],
      practicalProjects: ['Live Multi-Dataset Animated Analytics Studio'],
      modules: [
        { moduleNumber: 1, title: 'Time Series, Bars & Proportional Charts', duration: '4h 10m', lessons: ['Multi-Series Line & Area Reveal', 'Grouped vs Stacked Bars & Donut Arcs'] },
        { moduleNumber: 2, title: 'Financial, Spatial & Streaming Charts', duration: '4h 10m', lessons: ['OHLC Candlestick, Heatmap & Treemap', '60fps Oscilloscope & Funnel Transitions'] }
      ],
      assessmentMethod: 'Practical Chart Lab + Quiz',
      certificateNote: 'Verified OpenFrame Education Certificate eligible.',
      keywords: ['graphs', 'charts', 'animation', 'candlestick', 'radar', 'heatmap', 'treemap', 'zip'],
      publishedDate: '2026-11-15',
    },
  ];
  for (const animCourse of animationMasterCourses) {
    if (!normalizedList.some((c) => c.id === animCourse.id)) {
      normalizedList.unshift(normalizeLoadedCourse(animCourse));
    }
  }

  // Inject LKG to Post-Graduation & All-India Boards (Karnataka KSEAB/DPUE, NCERT, CBSE, ICSE, NIOS, State Boards, UG/PG/PhD)
  for (let i = LKG_TO_PG_CURRICULUM_COURSES.length - 1; i >= 0; i--) {
    const lkgCourse = LKG_TO_PG_CURRICULUM_COURSES[i];
    if (!normalizedList.some((c) => c.id === lkgCourse.id)) {
      normalizedList.unshift(normalizeLoadedCourse(lkgCourse));
    }
  }

  const byId = new Map<string, MarketplaceCourse>();
  const categoryCounts: Record<string, number> = {};
  const subMap = new Map<string, { name: string; category: string; count: number }>();
  const instMap = new Map<string, number>();
  const chanMap = new Map<string, number>();
  const langMap = new Map<string, number>();

  const items: IndexedBaseCourse[] = normalizedList.map((course) => {
    byId.set(course.id.toLowerCase(), course);
    if (course.aliasId) {
      byId.set(course.aliasId.toLowerCase(), course);
    }

    const cats = course.categories && course.categories.length > 0 ? course.categories : [course.category];
    for (const c of cats) {
      categoryCounts[c] = (categoryCounts[c] || 0) + 1;
    }

    if (course.subcategory) {
      const key = `${course.category}::${course.subcategory}`;
      const existing = subMap.get(key);
      if (existing) existing.count++;
      else subMap.set(key, { name: course.subcategory, category: course.category, count: 1 });
    }

    const inst = course.instructorName || course.instructor?.name;
    if (inst) instMap.set(inst, (instMap.get(inst) || 0) + 1);

    if (course.youtubeChannelName) {
      chanMap.set(course.youtubeChannelName, (chanMap.get(course.youtubeChannelName) || 0) + 1);
    }

    const lang = course.language || 'English';
    langMap.set(lang, (langMap.get(lang) || 0) + 1);

    const searchBlob = [
      course.id,
      course.aliasId || '',
      course.title,
      course.category,
      ...(course.categories || []),
      course.subcategory,
      course.topic || '',
      course.contentType || '',
      course.categoryGroup,
      course.shortDesc,
      course.instructorName || '',
      course.youtubeChannelName || '',
      lang,
      ...(course.keywords || []),
      ...(course.skillsAcquired || []),
      ...(course.educationLevels || []),
      ...(course.degreeProgrammes || []),
      course.board || '',
      ...(course.boards || []),
      course.gradeLevel || '',
      ...(course.supportedLanguages || []),
    ]
      .join(' ')
      .toLowerCase();

    return { course, searchBlob };
  });

  cachedBaseIndex = {
    items,
    byId,
    categoryCounts,
    subcategories: Array.from(subMap.values()).sort((a, b) => b.count - a.count),
    instructors: Array.from(instMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    channels: Array.from(chanMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
    languages: Array.from(langMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count),
  };

  youtubeDiscoveryEngine.seedKnownDeduplicationSet({
    videoIds: items.map((i) => i.course.youtubeVideoId).filter((v): v is string => Boolean(v)),
    playlistIds: items.map((i) => i.course.youtubePlaylistId).filter((p): p is string => Boolean(p)),
    titles: items.map((i) => i.course.title),
  });

  console.log(`[Marketplace Index] Indexed ${items.length} base courses across ${Object.keys(categoryCounts).length} categories.`);
  return cachedBaseIndex;
}

function computeBaseStats(excludeSet: Set<string>) {
  const index = getBaseCatalogIndex();
  let totalBase = 0;
  let published = 0;
  let readyToPublish = 0;
  let inDevelopment = 0;
  let planned = 0;
  let paidCourses = 0;
  let youtubeCourses = 0;
  let videoPlaylists = 0;
  const categoryCounts: Record<string, number> = {};

  for (const { course } of index.items) {
    if (excludeSet.has(course.id)) continue;
    if (course.status === 'Draft' || course.status === 'Archived' || course.status === 'Unavailable') continue;

    totalBase++;
    if (course.status === 'Published') published++;
    else if (course.status === 'Ready to Publish') readyToPublish++;
    else if (course.status === 'Content Development' || course.status === 'Instructor Assigned') inDevelopment++;
    else if (course.status === 'Planned') planned++;

    if (course.price > 0) paidCourses++;

    if (course.courseType === 'youtube_playlist' || course.youtubePlaylistId) {
      videoPlaylists++;
      youtubeCourses++;
    } else if (course.courseType === 'youtube_video' || course.youtubeVideoId) {
      youtubeCourses++;
    }

    const cats = course.categories && course.categories.length > 0 ? course.categories : [course.category];
    for (const c of cats) {
      categoryCounts[c] = (categoryCounts[c] || 0) + 1;
    }
  }

  return {
    totalBase,
    published,
    readyToPublish,
    inDevelopment,
    planned,
    paidCourses,
    youtubeCourses,
    videoPlaylists,
    categoryCounts,
    languages: index.languages,
  };
}

function filterBaseIndex(params: any, excludeSet: Set<string>): MarketplaceCourse[] {
  const index = getBaseCatalogIndex();
  const q = typeof params.query === 'string' ? params.query.toLowerCase().trim() : '';
  const expanded = q ? normalizeAndExpandQuery(q) : { tokens: [] as string[], expandedTerms: [] as string[] };
  const terms = expanded.tokens;
  const tab = params.tab || 'all';
  const category = params.category && params.category !== 'All' ? String(params.category) : null;
  const subcategory = params.subcategory && params.subcategory !== 'All' ? String(params.subcategory).toLowerCase() : null;
  const categoryGroup = params.categoryGroup && params.categoryGroup !== 'All' ? String(params.categoryGroup) : null;
  const pricingTier = params.pricingTier && params.pricingTier !== 'All' ? String(params.pricingTier) : null;
  const courseType = params.courseType && params.courseType !== 'all' ? String(params.courseType) : null;
  const language = params.language && params.language !== 'All' ? String(params.language).toLowerCase() : null;
  const level = params.level && params.level !== 'All' ? String(params.level) : null;
  const publicationDate = params.publicationDate && params.publicationDate !== 'all' ? String(params.publicationDate) : null;
  const certificateOnly = params.certificateOnly === true || params.certificateOnly === 'true';
  const status = params.status && params.status !== 'All' ? String(params.status) : null;
  const instructorFilter = typeof params.instructor === 'string' ? params.instructor.trim().toLowerCase() : '';
  const channelFilter = typeof params.channel === 'string' ? params.channel.trim().toLowerCase() : '';

  const matchedEntries: Array<{ course: MarketplaceCourse; score: number }> = [];
  const nowMs = Date.now();
  const pubCutoffMs =
    publicationDate === 'week'
      ? nowMs - 7 * 86400000
      : publicationDate === 'month'
      ? nowMs - 30 * 86400000
      : publicationDate === 'year'
      ? nowMs - 365 * 86400000
      : 0;

  for (const { course, searchBlob } of index.items) {
    if (excludeSet.has(course.id)) continue;
    // Public / standard listings never treat Draft/Archived as public unless explicitly requested
    if (!status && (course.status === 'Draft' || course.status === 'Archived')) continue;

    if (tab !== 'all') {
      if (tab === 'popular' && !course.isPopular && course.enrolledCount < 200) continue;
      if (tab === 'trending' && !course.isTrending) continue;
      if (tab === 'new' && !course.isNew) continue;
      if (tab === 'beginner' && course.level !== 'Beginner' && course.level !== 'All Levels') continue;
      if (tab === 'professional' && course.level !== 'Advanced' && course.pricingTier !== 'Professional' && course.pricingTier !== 'Advanced') continue;
      if (tab === 'premium' && course.price < 999) continue;
      if (tab === 'recommended' && !course.isRecommended && course.rating < 4.8) continue;
      if (tab === 'career' && !course.isCareerTrack && course.categoryGroup !== 'Professional' && course.categoryGroup !== 'Business') continue;
      if (tab === 'youtube' && course.courseType !== 'youtube_video' && course.courseType !== 'youtube_playlist' && !course.youtubeVideoId && !course.youtubePlaylistId) continue;
      if (tab === 'playlists' && course.courseType !== 'youtube_playlist' && !course.youtubePlaylistId) continue;
    }

    let relevanceScore = 0;
    if (q.length > 0) {
      relevanceScore = scoreSearchMatch(
        {
          id: course.id,
          aliasId: course.aliasId,
          title: course.title,
          category: course.category,
          categories: course.categories,
          subcategory: course.subcategory,
          topic: course.topic,
          keywords: course.keywords,
          skills: course.skillsAcquired,
          shortDesc: course.shortDesc,
          instructorName: course.instructorName || course.instructor?.name,
          youtubeChannelName: course.youtubeChannelName,
          language: course.language,
        },
        q
      );
      if (relevanceScore <= 0) continue;
    }

    if (category) {
      const cats = course.categories && course.categories.length > 0 ? course.categories : [course.category];
      if (!cats.includes(category) && course.category !== category) continue;
    }
    if (subcategory && !course.subcategory.toLowerCase().includes(subcategory)) continue;
    if (categoryGroup && course.categoryGroup !== categoryGroup) continue;
    if (pricingTier && course.pricingTier !== pricingTier) continue;
    if (courseType && course.courseType !== courseType) continue;
    if (params.contentType && params.contentType !== 'all' && params.contentType !== 'All') {
      const targetCt = String(params.contentType);
      const isPl = course.courseType === 'youtube_playlist' || Boolean(course.youtubePlaylistId);
      const isYt = course.courseType === 'youtube_video' || Boolean(course.youtubeVideoId);
      const effectiveCt =
        course.contentType ||
        (isPl
          ? 'Playlist'
          : isYt
          ? inferCorporateContentType({
              title: course.title,
              description: course.shortDesc,
              durationMinutes: course.durationMinutes,
              hasPlaylistId: false,
            })
          : undefined);
      if (effectiveCt !== targetCt) continue;
    }
    if (params.libraryCollection && params.libraryCollection !== 'all') {
      if ((course.libraryCollection || 'standard') !== params.libraryCollection) continue;
    }
    if (language) {
      const courseLang = (course.language || 'English').toLowerCase();
      const supported = (course.supportedLanguages || []).map((l) => l.toLowerCase());
      if (courseLang !== language && !courseLang.includes(language) && !supported.some((l) => l === language || l.includes(language))) {
        continue;
      }
    }
    if (level && course.level !== level && course.level !== 'All Levels') continue;
    if (params.duration && params.duration !== 'all' && !matchesDurationFilter(course, String(params.duration))) continue;
    if (certificateOnly && !course.certificateEligibility) continue;
    if (pubCutoffMs > 0) {
      const dateStr = course.publishedDate || course.createdAt || course.updatedAt;
      const ms = dateStr ? Date.parse(dateStr) : 0;
      if (!ms || ms < pubCutoffMs) continue;
    }
    if (instructorFilter) {
      const instr = (course.instructorName || course.instructor?.name || '').toLowerCase();
      if (!instr.includes(instructorFilter)) continue;
    }
    if (channelFilter) {
      const ch = (course.youtubeChannelName || '').toLowerCase();
      if (!ch.includes(channelFilter)) continue;
    }
    if (params.accessType === 'free' && course.price > 799) continue;
    if (params.accessType === 'paid' && course.price <= 0) continue;
    if (params.priceBand === 'school_300_799' && (course.price < 300 || course.price > 799)) continue;
    if (params.priceBand === 'degree_800_1499' && (course.price < 800 || course.price > 1499)) continue;
    if (params.priceBand === 'pg_1500_2500' && (course.price < 1500 || course.price > 2500)) continue;
    if (params.board && params.board !== 'All') {
      const targetBoard = String(params.board).toLowerCase();
      const courseBoards = [course.board, ...(course.boards || [])].filter(Boolean).map((b) => String(b).toLowerCase());
      if (!courseBoards.some((b) => b.includes(targetBoard)) && !searchBlob.includes(targetBoard)) continue;
    }
    if (params.educationLevel && params.educationLevel !== 'All') {
      const targetLvl = String(params.educationLevel).toLowerCase();
      const levels = (course.educationLevels || []).map((l) => l.toLowerCase());
      const blobMatch = searchBlob.includes(targetLvl);
      if (levels.length > 0 && !levels.some((l) => l.includes(targetLvl)) && !blobMatch) continue;
    }
    if (params.degree && params.degree !== 'All') {
      const targetDeg = String(params.degree).toLowerCase();
      const progs = (course.degreeProgrammes || []).map((p) => p.toLowerCase());
      if (progs.length > 0 && !progs.some((p) => p.includes(targetDeg)) && !searchBlob.includes(targetDeg)) continue;
    }
    if (params.deliveryMethod && params.deliveryMethod !== 'All' && params.deliveryMethod !== 'all') {
      const targetMethod = String(params.deliveryMethod).toLowerCase();
      const effectiveMethod = (
        course.deliveryMethod ||
        (course.courseType === 'youtube_video' || course.courseType === 'youtube_playlist'
          ? 'Self-paced online'
          : 'Self-paced online')
      ).toLowerCase();
      if (effectiveMethod !== targetMethod) continue;
    }
    if (params.subject && params.subject !== 'All') {
      const targetSub = String(params.subject).toLowerCase().trim();
      if (targetSub && !searchBlob.includes(targetSub)) continue;
    }
    if (params.skill && params.skill !== 'All') {
      const targetSkill = String(params.skill).toLowerCase().trim();
      if (targetSkill && !searchBlob.includes(targetSkill)) continue;
    }
    if (status && course.status !== status) continue;

    matchedEntries.push({ course, score: relevanceScore });
  }

  const sortBy = params.sortBy || 'popular';
  matchedEntries.sort((a, b) => {
    if (q.length > 0 && (sortBy === 'popular' || sortBy === 'recommended')) {
      const scoreDiff = b.score - a.score;
      if (scoreDiff !== 0) return scoreDiff;
    }
    if (sortBy === 'popular') return b.course.enrolledCount - a.course.enrolledCount;
    if (sortBy === 'rating') return b.course.rating - a.course.rating;
    if (sortBy === 'price_low') return a.course.price - b.course.price;
    if (sortBy === 'price_high') return b.course.price - a.course.price;
    if (sortBy === 'newest') return (b.course.isNew ? 1 : 0) - (a.course.isNew ? 1 : 0);
    return b.score - a.score;
  });

  return matchedEntries.map((m) => m.course);
}

async function startServer() {
  const app = express();
  app.use(
    express.json({
      limit: '5mb',
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  // Warm base catalog index in background
  setImmediate(() => getBaseCatalogIndex());

  // ------------------------------------------------------------------
  // Server-side Firebase ID Token Verifier (RS256 via Google Public Certs)
  // ------------------------------------------------------------------
  const firebaseAppletCfg = (() => {
    try {
      return JSON.parse(
        fs.readFileSync(path.resolve(__dirname, 'firebase-applet-config.json'), 'utf8')
      );
    } catch {
      return { projectId: '', firestoreDatabaseId: '(default)' };
    }
  })();

  let cachedCerts: Record<string, string> = {};
  let cachedCertsExpiresAt = 0;

  async function getFirebasePublicCerts(): Promise<Record<string, string>> {
    if (Date.now() < cachedCertsExpiresAt && Object.keys(cachedCerts).length > 0) {
      return cachedCerts;
    }
    const resp = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com',
      { signal: AbortSignal.timeout(5000) }
    );
    if (!resp.ok) throw new Error('Failed to fetch Firebase public certificates.');
    const cc = resp.headers.get('cache-control') || '';
    const maxAgeMatch = cc.match(/max-age=(\d+)/i);
    const maxAgeSec = maxAgeMatch ? Number(maxAgeMatch[1]) : 3600;
    cachedCerts = (await resp.json()) as Record<string, string>;
    cachedCertsExpiresAt = Date.now() + Math.max(60, maxAgeSec) * 1000;
    return cachedCerts;
  }

  interface VerifiedFirebaseUser {
    uid: string;
    email: string;
    emailVerified: boolean;
    rawToken: string;
  }

  async function verifyFirebaseBearerToken(
    req: express.Request
  ): Promise<VerifiedFirebaseUser | null> {
    const authHeader = String(req.headers.authorization || '');
    if (!authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7).trim();
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    try {
      const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
      if (header.alg !== 'RS256' || !header.kid) return null;

      const certs = await getFirebasePublicCerts();
      const certPem = certs[header.kid];
      if (!certPem) return null;

      const signedInput = `${parts[0]}.${parts[1]}`;
      const signature = Buffer.from(parts[2], 'base64url');
      const isValidSig = crypto.verify(
        'RSA-SHA256',
        Buffer.from(signedInput, 'utf8'),
        certPem,
        signature
      );
      if (!isValidSig) return null;

      const nowSec = Math.floor(Date.now() / 1000);
      const expectedAud = firebaseAppletCfg.projectId;
      if (!expectedAud || payload.aud !== expectedAud) return null;
      if (payload.iss !== `https://securetoken.google.com/${expectedAud}`) return null;
      if (typeof payload.exp !== 'number' || payload.exp <= nowSec) return null;
      if (typeof payload.sub !== 'string' || !payload.sub) return null;

      return {
        uid: payload.sub,
        email: String(payload.email || '').toLowerCase(),
        emailVerified: Boolean(payload.email_verified),
        rawToken: token,
      };
    } catch {
      return null;
    }
  }

  const SERVER_SUPER_ADMIN_EMAILS = new Set([
    'akashrajnayak@gmail.com',
    'admin@openframeitsolutions.com',
  ]);

  async function isVerifiedPlatformAdmin(user: VerifiedFirebaseUser): Promise<boolean> {
    if (user.emailVerified && SERVER_SUPER_ADMIN_EMAILS.has(user.email)) {
      return true;
    }
    if (!firebaseAppletCfg.projectId) return false;
    const dbId = firebaseAppletCfg.firestoreDatabaseId || '(default)';
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseAppletCfg.projectId}/databases/${dbId}/documents/admin_users/${encodeURIComponent(user.uid)}`;
    try {
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${user.rawToken}` },
        signal: AbortSignal.timeout(5000),
      });
      if (!resp.ok) return false;
      const doc = (await resp.json()) as any;
      const fields = doc.fields || {};
      const isActive = fields.isActive?.booleanValue === true;
      const role = fields.role?.stringValue || '';
      return isActive && (role === 'Super Admin' || role === 'Education Admin');
    } catch {
      return false;
    }
  }

  // Lightweight sliding-window per-IP rate limiter for AI, YouTube, Discovery, Payments & School Partner APIs
  const rateLimitMap = new Map<string, number[]>();
  const RATE_LIMIT_WINDOW_MS = 60_000;
  const RATE_LIMIT_MAX_REQUESTS = 90;

  app.use(['/api/youtube', '/api/discovery', '/api/quinn', '/api/school-partner', '/api/payments'], (req, res, next) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : String(forwarded || '').split(',')[0].trim()) ||
      req.socket.remoteAddress ||
      'local';
    const now = Date.now();
    const recent = (rateLimitMap.get(ip) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
      const retryAfterSec = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - recent[0])) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait briefly before making more requests.',
        retryAfterSeconds: retryAfterSec,
      });
    }
    recent.push(now);
    rateLimitMap.set(ip, recent);
    if (rateLimitMap.size > 2000) {
      for (const [key, list] of rateLimitMap.entries()) {
        if (!list.some((ts) => now - ts < RATE_LIMIT_WINDOW_MS)) {
          rateLimitMap.delete(key);
        }
      }
    }
    next();
  });

  // ------------------------------------------------------------------
  // Health & Config Status
  // ------------------------------------------------------------------
  app.get('/api/health', (_req, res) => {
    const quota = youtubeDiscoveryEngine.getQuotaStatus();
    res.json({
      ok: true,
      service: 'OpenFrame Education LMS Server',
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      youtubeApiConfigured: quota.apiKeyConfigured,
    });
  });

  app.get('/api/auth/verification-status', (_req, res) => {
    res.json({
      ok: true,
      emailVerificationAvailable: true,
      smsOtpConfigured: Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
      note: 'Email verification links are sent via Firebase Auth when activating a portal account. Phone/SMS OTP requires TWILIO_ACCOUNT_SID configuration.',
    });
  });

  app.get('/api/youtube/status', (_req, res) => {
    const quota = youtubeDiscoveryEngine.getQuotaStatus();
    res.json({
      apiKeyConfigured: quota.apiKeyConfigured,
      mode: quota.apiKeyConfigured ? 'Official YouTube Data API v3 Live Engine' : 'YouTube API Key Not Configured',
      quota,
    });
  });

  app.get('/api/system/telemetry', (_req, res) => {
    const quota = youtubeDiscoveryEngine.getQuotaStatus();
    const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    return res.json({
      youtubeQuota: quota,
      geminiUsage: {
        apiKeyConfigured: geminiConfigured,
        model: MODEL_TEXT,
        totalCallsToday: geminiTelemetry.totalCallsToday,
        errorsToday: geminiTelemetry.errorsToday,
        lastCallAt: geminiTelemetry.lastCallAt,
        lastEndpoint: geminiTelemetry.lastEndpoint,
      },
      searchStats: {
        totalSearchesToday: searchTelemetry.totalSearchesToday,
        recentQueries: searchTelemetry.recentQueries.slice(0, 30),
      },
    });
  });

  // ------------------------------------------------------------------
  // Global YouTube Data API v3 Course Discovery & Import Engine Routes
  // ------------------------------------------------------------------
  const forwardRequestReferer = (req: express.Request) => {
    const forwardedHost = req.get('x-forwarded-host');
    const inferred =
      req.get('referer') ||
      req.get('origin') ||
      (forwardedHost ? `https://${forwardedHost}/` : undefined);
    youtubeDiscoveryEngine.setRequestReferer(inferred);
    return inferred;
  };

  const mapDiscoveryErrorStatus = (code?: string) => {
    if (code === 'MISSING_API_KEY') return 503;
    if (code === 'QUOTA_EXCEEDED' || code === 'QUOTA_LIMIT_GUARD') return 429;
    if (code === 'API_KEY_REFERRER_BLOCKED' || code === 'INVALID_API_KEY' || code === 'YOUTUBE_API_DISABLED') return 403;
    return 500;
  };

  app.get('/api/discovery/status', (_req, res) => {
    const quota = youtubeDiscoveryEngine.getQuotaStatus();
    const { job, candidates } = youtubeDiscoveryEngine.getJobState();
    const baseCount = getBaseCatalogIndex().items.length;
    return res.json({
      ok: true,
      quota,
      activeJob: job,
      job,
      candidateBufferCount: candidates.length,
      recentCandidates: candidates.slice(0, 50),
      targetGoal: {
        baseCatalog: baseCount,
        targetTotal: 100000,
        newlyDiscoveredTarget: Math.max(0, 100000 - baseCount),
      },
      missingRequirement: quota.apiKeyConfigured
        ? null
        : 'YOUTUBE_API_KEY is not configured in server environment secrets.',
    });
  });

  app.post('/api/discovery/search', async (req, res) => {
    forwardRequestReferer(req);
    const {
      query = '',
      category = 'Artificial Intelligence',
      topic,
      libraryCollection,
      languageLabel,
      language = 'English',
      searchType = 'video',
      pageToken,
      maxResults = 25,
      knownVideoIds = [],
      knownPlaylistIds = [],
    } = req.body || {};

    if (!String(query).trim()) {
      return res.status(400).json({ error: 'Search query is required.' });
    }

    try {
      const result = await youtubeDiscoveryEngine.discoverPage({
        query: String(query).trim(),
        category: String(category),
        topic: topic ? String(topic) : undefined,
        libraryCollection: libraryCollection === 'corporate_training' ? 'corporate_training' : undefined,
        languageLabel: String(languageLabel || language || 'English'),
        searchType: searchType === 'playlist' || searchType === 'channel' ? searchType : 'video',
        pageToken: pageToken ? String(pageToken) : undefined,
        maxResults: Number(maxResults) || 25,
        extraKnownVideoIds: Array.isArray(knownVideoIds) ? knownVideoIds.map(String) : [],
        extraKnownPlaylistIds: Array.isArray(knownPlaylistIds) ? knownPlaylistIds.map(String) : [],
      });

      return res.json({
        ok: true,
        ...result,
        quota: youtubeDiscoveryEngine.getQuotaStatus(),
      });
    } catch (err: any) {
      const status = mapDiscoveryErrorStatus(err?.code);
      return res.status(status).json({
        ok: false,
        errorCode: err?.code || 'DISCOVERY_ERROR',
        missingRequirement: err?.code === 'MISSING_API_KEY' ? 'YOUTUBE_API_KEY' : undefined,
        error: err?.message || 'YouTube Data API v3 discovery search failed.',
        quota: youtubeDiscoveryEngine.getQuotaStatus(),
      });
    }
  });

  app.post('/api/discovery/corporate-batch', async (req, res) => {
    forwardRequestReferer(req);
    const {
      category = 'Business Management',
      topics,
      targetCount = 25,
      languageLabel = 'English',
      includePlaylists = false,
      knownVideoIds = [],
      knownPlaylistIds = [],
      jobId,
    } = req.body || {};

    try {
      const result = await youtubeDiscoveryEngine.discoverCorporateCategoryVideos({
        category: String(category),
        topics: Array.isArray(topics) ? topics.map(String) : undefined,
        targetCount: Number(targetCount) || 25,
        languageLabel: String(languageLabel || 'English'),
        includePlaylists: Boolean(includePlaylists),
        extraKnownVideoIds: Array.isArray(knownVideoIds) ? knownVideoIds.map(String) : [],
        extraKnownPlaylistIds: Array.isArray(knownPlaylistIds) ? knownPlaylistIds.map(String) : [],
        jobId: jobId ? String(jobId) : undefined,
      });

      return res.json({
        ok: true,
        ...result,
        quota: youtubeDiscoveryEngine.getQuotaStatus(),
      });
    } catch (err: any) {
      const status = mapDiscoveryErrorStatus(err?.code);
      return res.status(status).json({
        ok: false,
        errorCode: err?.code || 'CORPORATE_DISCOVERY_ERROR',
        missingRequirement: err?.code === 'MISSING_API_KEY' ? 'YOUTUBE_API_KEY' : undefined,
        error: err?.message || 'Corporate Training YouTube discovery failed.',
        quota: youtubeDiscoveryEngine.getQuotaStatus(),
      });
    }
  });

  app.post('/api/discovery/verify-videos', async (req, res) => {
    forwardRequestReferer(req);
    const { videoIds = [], playlistIds = [] } = req.body || {};
    try {
      const result = await youtubeDiscoveryEngine.verifyYouTubeResources({
        videoIds: Array.isArray(videoIds) ? videoIds.map(String) : [],
        playlistIds: Array.isArray(playlistIds) ? playlistIds.map(String) : [],
      });
      return res.json({
        ok: true,
        ...result,
        quota: youtubeDiscoveryEngine.getQuotaStatus(),
      });
    } catch (err: any) {
      const status = mapDiscoveryErrorStatus(err?.code);
      return res.status(status).json({
        ok: false,
        errorCode: err?.code || 'VERIFY_VIDEOS_ERROR',
        missingRequirement: err?.code === 'MISSING_API_KEY' ? 'YOUTUBE_API_KEY' : undefined,
        error: err?.message || 'YouTube resource verification failed.',
        quota: youtubeDiscoveryEngine.getQuotaStatus(),
      });
    }
  });

  app.post('/api/discovery/test-batch', async (req, res) => {
    forwardRequestReferer(req);
    const {
      selectedCategories = ['Artificial Intelligence', 'Web Development', 'Digital Marketing', 'Finance'],
      selectedLanguages = ['English'],
      includePlaylists = true,
      knownVideoIds = [],
      knownPlaylistIds = [],
    } = req.body || {};

    try {
      youtubeDiscoveryEngine.seedKnownDeduplicationSet({
        videoIds: Array.isArray(knownVideoIds) ? knownVideoIds.map(String) : [],
        playlistIds: Array.isArray(knownPlaylistIds) ? knownPlaylistIds.map(String) : [],
      });

      const job = youtubeDiscoveryEngine.startJob({
        mode: 'test_20',
        selectedCategories,
        selectedLanguages,
        includeVideos: true,
        includePlaylists: Boolean(includePlaylists),
        includeChannels: false,
        targetBatchLimit: 20,
      });

      const collected: any[] = [];
      let safetyLoops = 0;
      while (collected.length < 20 && safetyLoops < 3) {
        safetyLoops++;
        const step = await youtubeDiscoveryEngine.stepActiveJob(20 - collected.length + 5);
        collected.push(...step.batchItems);
        if (step.job.status === 'completed' || step.job.status === 'error') break;
      }

      return res.json({
        ok: true,
        job,
        items: collected.slice(0, 20),
        quota: youtubeDiscoveryEngine.getQuotaStatus(),
      });
    } catch (err: any) {
      const status = mapDiscoveryErrorStatus(err?.code);
      return res.status(status).json({
        ok: false,
        errorCode: err?.code || 'TEST_BATCH_ERROR',
        missingRequirement: err?.code === 'MISSING_API_KEY' ? 'YOUTUBE_API_KEY' : undefined,
        error: err?.message || 'Could not execute 20-resource YouTube verification test batch.',
        quota: youtubeDiscoveryEngine.getQuotaStatus(),
      });
    }
  });

  app.post('/api/discovery/job/start', (req, res) => {
    forwardRequestReferer(req);
    try {
      const { knownVideoIds = [], knownPlaylistIds = [], ...config } = req.body || {};
      youtubeDiscoveryEngine.seedKnownDeduplicationSet({
        videoIds: Array.isArray(knownVideoIds) ? knownVideoIds.map(String) : [],
        playlistIds: Array.isArray(knownPlaylistIds) ? knownPlaylistIds.map(String) : [],
      });
      const job = youtubeDiscoveryEngine.startJob(config);
      return res.json({ ok: true, job, quota: youtubeDiscoveryEngine.getQuotaStatus() });
    } catch (err: any) {
      const status = err?.code === 'MISSING_API_KEY' ? 503 : 400;
      return res.status(status).json({
        ok: false,
        errorCode: err?.code || 'JOB_START_ERROR',
        missingRequirement: err?.code === 'MISSING_API_KEY' ? 'YOUTUBE_API_KEY' : undefined,
        error: err?.message || 'Unable to start discovery job.',
        quota: youtubeDiscoveryEngine.getQuotaStatus(),
      });
    }
  });

  app.post('/api/discovery/job/step', async (req, res) => {
    forwardRequestReferer(req);
    const { batchSize = 25, knownVideoIds = [], knownPlaylistIds = [] } = req.body || {};
    try {
      const result = await youtubeDiscoveryEngine.stepActiveJob(Number(batchSize) || 25, {
        videoIds: Array.isArray(knownVideoIds) ? knownVideoIds.map(String) : [],
        playlistIds: Array.isArray(knownPlaylistIds) ? knownPlaylistIds.map(String) : [],
      });
      return res.json({
        ok: true,
        ...result,
        quota: youtubeDiscoveryEngine.getQuotaStatus(),
      });
    } catch (err: any) {
      const status = mapDiscoveryErrorStatus(err?.code);
      return res.status(status).json({
        ok: false,
        errorCode: err?.code || 'JOB_STEP_ERROR',
        missingRequirement: err?.code === 'MISSING_API_KEY' ? 'YOUTUBE_API_KEY' : undefined,
        error: err?.message || 'Discovery batch step failed.',
        job: youtubeDiscoveryEngine.getJobState().job,
        quota: youtubeDiscoveryEngine.getQuotaStatus(),
      });
    }
  });

  app.post('/api/discovery/job/pause', (_req, res) => {
    const job = youtubeDiscoveryEngine.pauseJob();
    return res.json({ ok: true, job });
  });

  app.post('/api/discovery/job/resume', (_req, res) => {
    try {
      const job = youtubeDiscoveryEngine.resumeJob();
      return res.json({ ok: true, job });
    } catch (err: any) {
      return res.status(503).json({
        ok: false,
        errorCode: err?.code || 'MISSING_API_KEY',
        error: err?.message || 'Cannot resume discovery job.',
      });
    }
  });

  app.post('/api/discovery/job/stop', (_req, res) => {
    const job = youtubeDiscoveryEngine.stopJob();
    return res.json({ ok: true, job });
  });

  // ------------------------------------------------------------------
  // Scalable Marketplace Base Index & YouTube Resolver APIs
  // ------------------------------------------------------------------
  app.get('/api/marketplace/base-stats', (req, res) => {
    const excludeParam = typeof req.query.excludeIds === 'string' ? req.query.excludeIds : '';
    const excludeSet = new Set(excludeParam.split(',').map((s) => s.trim()).filter(Boolean));
    return res.json(computeBaseStats(excludeSet));
  });

  app.post('/api/marketplace/base-stats', (req, res) => {
    const excludeIds = Array.isArray(req.body?.excludeIds) ? req.body.excludeIds : [];
    const excludeSet = new Set<string>(excludeIds.map(String));
    return res.json(computeBaseStats(excludeSet));
  });

  const handleBaseSearch = (params: any, res: express.Response) => {
    const excludeIds = Array.isArray(params.excludeIds)
      ? params.excludeIds.map(String)
      : typeof params.excludeIds === 'string'
      ? params.excludeIds.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];
    const excludeSet = new Set<string>(excludeIds);
    const matched = filterBaseIndex(params, excludeSet);

    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(params.pageSize) || 24));
    const total = matched.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const startIdx = (page - 1) * pageSize;
    const courses = matched.slice(startIdx, startIdx + pageSize);

    return res.json({
      courses,
      total,
      page,
      pageSize,
      totalPages,
    });
  };

  app.get('/api/marketplace/base-search', (req, res) => handleBaseSearch(req.query, res));
  app.post('/api/marketplace/base-search', (req, res) => handleBaseSearch(req.body || {}, res));

  app.get('/api/marketplace/base-autocomplete', (req, res) => {
    const q = String(req.query.q || '').toLowerCase().trim();
    const index = getBaseCatalogIndex();
    const suggestions: MarketplaceAutocompleteSuggestion[] = [];

    if (!q) {
      ALL_90_CATEGORIES.slice(0, 6).forEach((cat) => {
        suggestions.push({
          type: 'category',
          label: cat,
          sublabel: `${index.categoryCounts[cat] || 0} courses`,
          category: cat,
        });
      });
      return res.json({ suggestions });
    }

    const expanded = normalizeAndExpandQuery(q);
    const matchTerms = Array.from(new Set([expanded.corePhrase, ...expanded.tokens, ...expanded.expandedTerms]))
      .filter((t) => t.length >= 2);
    const matchesAnyTerm = (text: string) => {
      const lower = text.toLowerCase();
      return matchTerms.some((t) => matchesWordBoundary(lower, t));
    };

    // Categories
    let catAdded = 0;
    for (const cat of ALL_MARKETPLACE_CATEGORIES) {
      if (matchesAnyTerm(cat)) {
        suggestions.push({
          type: 'category',
          label: cat,
          sublabel: `${index.categoryCounts[cat] || 0} courses`,
          category: cat,
        });
        if (++catAdded >= 2) break;
      }
    }

    // Subcategories
    let subAdded = 0;
    for (const sub of index.subcategories) {
      if (matchesAnyTerm(sub.name)) {
        suggestions.push({
          type: 'subcategory',
          label: sub.name,
          sublabel: `${sub.category} · ${sub.count} courses`,
          category: sub.category,
        });
        if (++subAdded >= 2) break;
      }
    }

    // Instructors
    let instAdded = 0;
    for (const inst of index.instructors) {
      if (matchesAnyTerm(inst.name)) {
        suggestions.push({
          type: 'instructor',
          label: inst.name,
          sublabel: `Instructor · ${inst.count} courses`,
        });
        if (++instAdded >= 2) break;
      }
    }

    // YouTube Channels
    let chanAdded = 0;
    for (const chan of index.channels) {
      if (matchesAnyTerm(chan.name)) {
        suggestions.push({
          type: 'channel',
          label: chan.name,
          sublabel: `YouTube Channel · ${chan.count} courses`,
        });
        if (++chanAdded >= 2) break;
      }
    }

    // Languages
    let langAdded = 0;
    for (const lang of index.languages) {
      if (matchesAnyTerm(lang.name)) {
        suggestions.push({
          type: 'language',
          label: lang.name,
          sublabel: `Language · ${lang.count} courses`,
        });
        if (++langAdded >= 2) break;
      }
    }

    // Top-ranked Courses using shared word-boundary relevance scoring
    const topCourses = index.items
      .filter(({ course }) => course.status !== 'Draft' && course.status !== 'Archived')
      .map(({ course }) => ({
        course,
        score: scoreSearchMatch(
          {
            id: course.id,
            aliasId: course.aliasId,
            title: course.title,
            category: course.category,
            categories: course.categories,
            subcategory: course.subcategory,
            topic: course.topic,
            keywords: course.keywords,
            skills: course.skillsAcquired,
            shortDesc: course.shortDesc,
            instructorName: course.instructorName || course.instructor?.name,
            youtubeChannelName: course.youtubeChannelName,
            language: course.language,
          },
          q
        ),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.course.enrolledCount - a.course.enrolledCount)
      .slice(0, 6);

    for (const { course } of topCourses) {
      suggestions.push({
        type: 'course',
        id: course.id,
        label: course.title,
        sublabel: `${course.id} · ${course.category} · ${course.instructorName || 'OpenFrame'}`,
        category: course.category,
        courseType: course.courseType,
      });
    }

    return res.json({ suggestions });
  });

  app.get('/api/marketplace/base-course/:id', async (req, res) => {
    const rawId = String(req.params.id || '').trim();
    const id = rawId.toLowerCase();
    const index = getBaseCatalogIndex();
    const direct = index.byId.get(id);
    if (direct) return res.json({ course: direct });

    const match = id.match(/^of-crs-0*(\d+)$/);
    if (match && match[1]) {
      const idx = parseInt(match[1], 10);
      if (idx >= 1 && idx <= 16000) {
        return res.json({ course: synthesizeBaseCourse(idx) });
      }
    }

    // Resolve dynamic YouTube / discovered IDs (yt-{videoId}, disc-vid-{videoId}, disc-pl-{playlistId})
    const ytMatch = rawId.match(/^(?:yt-|disc-vid-)([A-Za-z0-9_-]{6,20})$/i);
    const plMatch = rawId.match(/^disc-pl-([A-Za-z0-9_-]{8,50})$/i);
    if (ytMatch?.[1]) {
      const videoId = ytMatch[1];
      const existingCatalog = index.items.find((i) => i.course.youtubeVideoId === videoId)?.course;
      if (existingCatalog) return res.json({ course: existingCatalog });

      const pooled = VERIFIED_EDUCATIONAL_VIDEO_POOL.find((v) => v.videoId === videoId);
      let title = pooled?.title || `YouTube Educational Course (${videoId})`;
      let channelTitle = pooled?.channelTitle || 'YouTube Educator';
      let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      if (!pooled) {
        try {
          const oRes = await fetch(
            `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
            { signal: AbortSignal.timeout(4000) }
          );
          if (oRes.ok) {
            const oJson: any = await oRes.json();
            if (oJson?.title) title = oJson.title;
            if (oJson?.author_name) channelTitle = oJson.author_name;
            if (oJson?.thumbnail_url) thumbnailUrl = oJson.thumbnail_url;
          }
        } catch {
          // Use videoId defaults
        }
      }

      const intent = parseEducationalIntent(title);
      const inferredCategory = intent.primarySubject || 'Digital Skills & Productivity';
      const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
      return res.json({
        course: normalizeLoadedCourse({
          id: rawId,
          title,
          category: inferredCategory,
          categories: [inferredCategory],
          categoryGroup: 'Technology',
          subcategory: intent.desiredSkill || inferredCategory,
          level: pooled?.level || 'Beginner',
          duration: pooled?.duration || 'Self-Paced Tutorial',
          estimatedHours: 2,
          pricingTier: 'Starter',
          status: 'Published',
          courseType: 'youtube_video',
          contentType: 'Tutorial',
          instructorName: channelTitle,
          youtubeChannelName: channelTitle,
          youtubeVideoId: videoId,
          youtubeUrl: ytUrl,
          language: intent.preferredLanguage || 'English',
          rating: 4.8,
          enrolledCount: 1200,
          isPopular: true,
          certificateEligibility: true,
          thumbnailUrl,
          imageUrl: thumbnailUrl,
          shortDesc: pooled?.recommendedReason || `Structured OpenFrame YouTube course for "${title}" taught by ${channelTitle}.`,
          learningObjectives: [
            `Master core concepts presented in ${title}`,
            `Complete structured practical exercises and verification assessment`,
          ],
          skillsAcquired: [intent.desiredSkill || inferredCategory, 'Applied Practice'],
          modules: [
            { moduleNumber: 1, partLabel: 'Part 1: Foundations', level: 'Beginner', title: 'Core Walkthrough & Setup', duration: '45m', lessons: [title, 'Concept Verification'], videoIds: [videoId] },
            { moduleNumber: 2, partLabel: 'Part 2: Application', level: 'Intermediate', title: 'Hands-On Practice & Applied Quiz', duration: '45m', lessons: ['Guided Practical Exercise', 'Knowledge Verification Quiz'], videoIds: [videoId] },
          ],
          recommendedVideos: [
            {
              id: rawId,
              videoId,
              youtubeId: videoId,
              youtubeUrl: ytUrl,
              title,
              channelTitle,
              thumbnail: thumbnailUrl,
              thumbnailUrl,
              duration: pooled?.duration || 'Tutorial',
              level: pooled?.level || 'Beginner',
              recommendedReason: pooled?.recommendedReason || `Direct YouTube tutorial for ${title}.`,
              embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
              source: 'curated_library',
            },
          ],
        }),
      });
    }

    if (plMatch?.[1]) {
      const playlistId = plMatch[1];
      const existingPl = index.items.find((i) => i.course.youtubePlaylistId === playlistId)?.course;
      if (existingPl) return res.json({ course: existingPl });
      const plUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
      return res.json({
        course: normalizeLoadedCourse({
          id: rawId,
          title: `YouTube Course Playlist (${playlistId})`,
          category: 'Digital Skills & Productivity',
          categoryGroup: 'Technology',
          subcategory: 'Playlist Series',
          level: 'All Levels',
          duration: 'Playlist Series',
          estimatedHours: 6,
          pricingTier: 'Academic Access',
          price: 0,
          isFree: true,
          status: 'Published',
          courseType: 'youtube_playlist',
          contentType: 'Playlist',
          youtubePlaylistId: playlistId,
          youtubePlaylistUrl: plUrl,
          language: 'English',
          rating: 4.8,
          enrolledCount: 850,
          certificateEligibility: true,
          shortDesc: `Multi-part OpenFrame YouTube playlist series (${playlistId}).`,
          modules: [
            { moduleNumber: 1, title: 'Playlist Curriculum Overview', duration: '2h', lessons: ['Series Introduction & Core Lessons'] },
          ],
        }),
      });
    }

    return res.status(404).json({ error: 'Base course not found' });
  });

  app.post('/api/youtube/resolve-course', async (req, res) => {
    const { url = '' } = req.body || {};
    const parsed = extractYouTubeIdentifiers(String(url));
    if (!parsed.videoId && !parsed.playlistId) {
      return res.status(400).json({ error: 'Invalid YouTube video or playlist URL.' });
    }

    const canonicalVideoUrl = parsed.videoId ? `https://www.youtube.com/watch?v=${parsed.videoId}` : undefined;
    const canonicalPlaylistUrl = parsed.playlistId ? `https://www.youtube.com/playlist?list=${parsed.playlistId}` : undefined;

    const apiKey = (process.env.YOUTUBE_API_KEY || '').trim();
    const ytHeaders: Record<string, string> = {};
    const inferredRef = forwardRequestReferer(req);
    if (inferredRef) ytHeaders['Referer'] = inferredRef;

    if (apiKey && apiKey !== 'MY_YOUTUBE_API_KEY') {
      try {
        if (parsed.playlistId) {
          const plRes = await fetch(
            `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${encodeURIComponent(parsed.playlistId)}&key=${encodeURIComponent(apiKey)}`,
            { headers: ytHeaders, signal: AbortSignal.timeout(6000) }
          );
          if (plRes.ok) {
            const plData: any = await plRes.json();
            const plItem = plData?.items?.[0];
            if (plItem) {
              const itemsRes = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${encodeURIComponent(parsed.playlistId)}&maxResults=12&key=${encodeURIComponent(apiKey)}`,
                { headers: ytHeaders, signal: AbortSignal.timeout(6000) }
              );
              const itemsData: any = itemsRes.ok ? await itemsRes.json() : { items: [] };
              const playlistVideos = (itemsData.items || [])
                .map((it: any) => ({
                  videoId: it?.contentDetails?.videoId || it?.snippet?.resourceId?.videoId || '',
                  title: it?.snippet?.title || '',
                  description: it?.snippet?.description || '',
                  channelTitle: it?.snippet?.videoOwnerChannelTitle || plItem.snippet?.channelTitle || '',
                  thumbnailUrl: it?.snippet?.thumbnails?.high?.url || it?.snippet?.thumbnails?.medium?.url || '',
                }))
                .filter((x: any) => x.videoId);
              const firstVidId = parsed.videoId || playlistVideos[0]?.videoId;
              return res.json({
                resolved: true,
                source: 'youtube_data_api_v3',
                courseType: 'youtube_playlist',
                youtubeVideoId: firstVidId,
                youtubeUrl: firstVidId ? `https://www.youtube.com/watch?v=${firstVidId}` : undefined,
                youtubePlaylistId: parsed.playlistId,
                youtubePlaylistUrl: canonicalPlaylistUrl,
                title: plItem.snippet?.title || '',
                description: plItem.snippet?.description || '',
                youtubeChannelName: plItem.snippet?.channelTitle || '',
                thumbnailUrl: plItem.snippet?.thumbnails?.high?.url || plItem.snippet?.thumbnails?.medium?.url || '',
                itemCount: plItem.contentDetails?.itemCount || playlistVideos.length,
                playlistVideos,
              });
            }
          }
        } else if (parsed.videoId) {
          const vidRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(parsed.videoId)}&key=${encodeURIComponent(apiKey)}`,
            { headers: ytHeaders, signal: AbortSignal.timeout(6000) }
          );
          if (vidRes.ok) {
            const vidData: any = await vidRes.json();
            const vItem = vidData?.items?.[0];
            if (vItem) {
              const dur = parseIsoDuration(vItem.contentDetails?.duration);
              return res.json({
                resolved: true,
                source: 'youtube_data_api_v3',
                courseType: 'youtube_video',
                youtubeVideoId: parsed.videoId,
                youtubeUrl: canonicalVideoUrl,
                title: vItem.snippet?.title || '',
                description: vItem.snippet?.description || '',
                youtubeChannelName: vItem.snippet?.channelTitle || '',
                thumbnailUrl:
                  vItem.snippet?.thumbnails?.maxres?.url ||
                  vItem.snippet?.thumbnails?.high?.url ||
                  `https://i.ytimg.com/vi/${parsed.videoId}/hqdefault.jpg`,
                duration: dur.label,
                keywords: Array.isArray(vItem.snippet?.tags) ? vItem.snippet.tags.slice(0, 8) : [],
                playlistVideos: [],
              });
            }
          }
        }
      } catch (apiErr) {
        console.warn('YouTube Data API v3 resolve fallback to oEmbed:', apiErr);
      }
    }

    // Fallback: Resolve via official public YouTube oEmbed endpoint
    const targetOembedUrl = canonicalVideoUrl || canonicalPlaylistUrl || String(url);
    try {
      const oembedRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(targetOembedUrl)}&format=json`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (oembedRes.ok) {
        const oembedJson: any = await oembedRes.json();
        return res.json({
          resolved: true,
          source: 'youtube_oembed',
          courseType: parsed.courseType,
          youtubeVideoId: parsed.videoId,
          youtubeUrl: canonicalVideoUrl,
          youtubePlaylistId: parsed.playlistId,
          youtubePlaylistUrl: canonicalPlaylistUrl,
          title: oembedJson.title || '',
          youtubeChannelName: oembedJson.author_name || '',
          thumbnailUrl:
            oembedJson.thumbnail_url ||
            (parsed.videoId ? `https://i.ytimg.com/vi/${parsed.videoId}/hqdefault.jpg` : ''),
          playlistVideos: [],
        });
      }
    } catch (err) {
      console.warn('YouTube oEmbed lookup warning:', err);
    }

    return res.json({
      resolved: true,
      source: 'url_parser',
      courseType: parsed.courseType,
      youtubeVideoId: parsed.videoId,
      youtubeUrl: canonicalVideoUrl,
      youtubePlaylistId: parsed.playlistId,
      youtubePlaylistUrl: canonicalPlaylistUrl,
      title: '',
      youtubeChannelName: '',
      thumbnailUrl: parsed.videoId ? `https://i.ytimg.com/vi/${parsed.videoId}/hqdefault.jpg` : '',
      playlistVideos: [],
    });
  });

  // ------------------------------------------------------------------
  // Module 2: Educational Video Search & Quinn AI Recommendations
  // ------------------------------------------------------------------
  app.post('/api/youtube/search', async (req, res) => {
    forwardRequestReferer(req);
    const {
      query = '',
      category = '',
      language = '',
      searchType = 'video',
      pageToken = '',
      duration = 'any',
      publicationDate = 'all',
      channel = '',
      maxResults = 9,
    } = req.body || {};
    const cleanQuery = String(query || '').trim();
    const cleanChannel = String(channel || '').trim();
    const detected = detectQueryLanguage(cleanQuery);
    const effectiveLang =
      language && language !== 'auto' && language !== 'Auto-Detect Language'
        ? String(language)
        : detected.label;

    const ytDuration: 'any' | 'short' | 'medium' | 'long' =
      duration === 'short'
        ? 'short'
        : duration === 'medium'
        ? 'medium'
        : duration === 'long'
        ? 'long'
        : 'any';

    const nowMs = Date.now();
    const publishedAfter =
      publicationDate === 'week'
        ? new Date(nowMs - 7 * 86400000).toISOString()
        : publicationDate === 'month'
        ? new Date(nowMs - 30 * 86400000).toISOString()
        : publicationDate === 'year'
        ? new Date(nowMs - 365 * 86400000).toISOString()
        : undefined;

    const intent = parseEducationalIntent(cleanQuery);
    const inferredCategory = String(category || intent.primarySubject || 'Education');

    if (cleanQuery || cleanChannel) {
      try {
        const page = await youtubeDiscoveryEngine.discoverPage({
          query: `${cleanQuery} ${cleanChannel} ${category}`.trim(),
          category: inferredCategory,
          languageLabel: effectiveLang,
          searchType: searchType === 'playlist' ? 'playlist' : 'video',
          pageToken: pageToken ? String(pageToken) : undefined,
          videoDuration: ytDuration,
          publishedAfter,
          maxResults: Number(maxResults) || 9,
        });
        let filteredItems = page.items;
        if (cleanChannel) {
          const lc = cleanChannel.toLowerCase();
          const chMatches = filteredItems.filter((item) =>
            (item.youtubeChannelName || '').toLowerCase().includes(lc)
          );
          if (chMatches.length > 0) filteredItems = chMatches;
        }
        if (filteredItems.length > 0) {
          const videos = filteredItems.map((item) => {
            const vid = item.youtubeVideoId || '';
            const plId = item.youtubePlaylistId;
            return {
              id: vid || plId || item.id,
              videoId: vid,
              youtubeId: vid,
              youtubeUrl: plId
                ? `https://www.youtube.com/playlist?list=${plId}`
                : vid
                ? `https://www.youtube.com/watch?v=${vid}`
                : undefined,
              playlistId: plId,
              playlistInfo: item.playlistInfo,
              title: item.title,
              description: item.description,
              channelTitle: item.youtubeChannelName,
              channelThumbnail: item.channelThumbnailUrl,
              thumbnail: item.thumbnailUrl,
              thumbnailUrl: item.thumbnailUrl,
              duration: item.duration || 'Tutorial',
              publishedAt: item.publishedAt,
              viewCount: item.viewCount,
              embeddable: item.embeddable !== false,
              detectedLanguage: item.language || effectiveLang,
              level: item.level === 'All Levels' ? 'Beginner' : item.level,
              difficultyLevel: item.level,
              recommendedReason: item.learningObjectives[0] || item.title,
              rationale: item.learningObjectives[0] || item.title,
              embedUrl: plId
                ? `https://www.youtube-nocookie.com/embed/videoseries?list=${plId}`
                : `https://www.youtube-nocookie.com/embed/${vid}`,
              source: item.id?.startsWith('disc-vid-') && !process.env.YOUTUBE_API_KEY
                ? 'youtube_public_search'
                : 'youtube_data_api',
            };
          });
          trackSearchQuery(cleanQuery || cleanChannel, effectiveLang, videos.length);
          return res.json({
            source: videos[0]?.source || 'youtube_data_api',
            detectedLanguage: effectiveLang,
            nextPageToken: page.nextPageToken || null,
            totalResults: page.totalResults || videos.length,
            videos,
          });
        }
      } catch (err: any) {
        console.warn('Live YouTube search fallback to curated index:', err?.message || err);
      }
    }
    const fallback = selectCuratedFallbackVideos(cleanQuery || cleanChannel, String(category)).map((v) => ({
      ...v,
      detectedLanguage: effectiveLang,
      embeddable: true,
    }));
    trackSearchQuery(cleanQuery || cleanChannel, effectiveLang, fallback.length);
    return res.json({
      source: 'curated_library',
      retryable: false,
      detectedLanguage: effectiveLang,
      nextPageToken: null,
      videos: fallback,
    });
  });

  app.post('/api/quinn/recommend-videos', async (req, res) => {
    const { courseTitle = '', category = '', lessonTopic = '', level = 'All Levels', maxVideos = 3 } = req.body || {};
    const searchTopic = `${lessonTopic} ${courseTitle}`.trim();
    const candidateVideos = selectCuratedFallbackVideos(searchTopic, category);

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        source: candidateVideos[0]?.source || 'curated_library',
        videos: candidateVideos.slice(0, Number(maxVideos) || 3),
      });
    }

    try {
      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `You are Quinn AI, the academic learning advisor for OpenFrame Education.
Course: "${courseTitle}" (Category: "${category}", Target Level: "${level}")
Lesson Topic: "${lessonTopic}"

Below are candidate YouTube educational videos. Select the best 3 videos (one Beginner, one Intermediate, one Advanced if possible) and write a crisp, insightful 1-sentence recommendation rationale explaining WHY each video accelerates mastery of "${lessonTopic}". Preserve the exact videoId, title, channelTitle, thumbnail, and duration from the candidate list.

Candidates:
${JSON.stringify(
  candidateVideos.map((v) => ({
    videoId: v.videoId,
    title: v.title,
    channelTitle: v.channelTitle,
    duration: v.duration,
    thumbnail: v.thumbnail,
  })),
  null,
  2
)}`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    videoId: { type: Type.STRING },
                    level: { type: Type.STRING },
                    recommendedReason: { type: Type.STRING },
                  },
                  required: ['videoId', 'level', 'recommendedReason'],
                },
              },
            },
          }),
        15000,
        'recommend-videos'
      );

      const ranked = JSON.parse((response.text ?? '[]').trim());
      if (Array.isArray(ranked) && ranked.length > 0) {
        const merged = ranked
          .map((item: any, idx: number) => {
            const match = candidateVideos!.find((c) => c.videoId === item.videoId) || candidateVideos![idx];
            if (!match) return null;
            const normalizedLevel: 'Beginner' | 'Intermediate' | 'Advanced' =
              item.level === 'Advanced' || item.level === 'Intermediate' ? item.level : 'Beginner';
            return {
              ...match,
              level: normalizedLevel,
              difficultyLevel: normalizedLevel,
              recommendedReason: item.recommendedReason || match.recommendedReason,
              rationale: item.recommendedReason || match.rationale,
            };
          })
          .filter(Boolean);

        if (merged.length > 0) {
          return res.json({
            source: candidateVideos[0]?.source || 'gemini_ranked',
            videos: merged.slice(0, Number(maxVideos) || 3),
          });
        }
      }
    } catch (err) {
      console.warn('Gemini video ranking warning:', err);
    }

    return res.json({
      source: candidateVideos[0]?.source || 'curated_library',
      videos: candidateVideos.slice(0, Number(maxVideos) || 3),
    });
  });

  // ------------------------------------------------------------------
  // Module 3: AI Learning Verification Quiz Generation & Rubric Evaluation
  // ------------------------------------------------------------------
  app.post('/api/quinn/generate-quiz', async (req, res) => {
    const {
      courseTitle = 'OpenFrame Course',
      lessonTopic = 'Core Foundations',
      category = 'Technology',
      learningObjectives = [],
      learningMaterials = '',
      basicCount = 5,
      intermediateCount = 5,
      advancedCount = 5,
    } = req.body || {};

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        fallbackRequired: true,
      });
    }

    try {
      const totalRequested = Number(basicCount) + Number(intermediateCount) + Number(advancedCount);
      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `You are Quinn AI, Chief Assessment Architect at OpenFrame Education.
Generate a rigorous ${totalRequested}-question learning verification assessment for:
- Course: "${courseTitle}" (Category: ${category})
- Lesson Topic: "${lessonTopic}"
- Learning Objectives: ${JSON.stringify(learningObjectives)}
${learningMaterials ? `- Approved Materials Summary: ${String(learningMaterials).slice(0, 1200)}` : ''}

Distribution Requirements:
- Exactly ${basicCount} questions with difficulty "basic" (5 points each)
- Exactly ${intermediateCount} questions with difficulty "intermediate" (7 points each)
- Exactly ${advancedCount} questions with difficulty "advanced" (10 points each)

Mix these 5 question types evenly across every difficulty tier:
- "multiple_choice" (provide 4 realistic options; correctAnswer MUST match one option verbatim)
- "true_false" (options must be ["True", "False"]; correctAnswer must be "True" or "False")
- "fill_in_blank" (options must be empty []; questionText contains "________"; correctAnswer is the concise missing technical term)
- "short_answer" (options must be empty []; correctAnswer is the model rubric answer)
- "practical_application" (provide a real-world scenario; options can be 4 choices OR empty [] for scenario response)

Each question must include a clear rubricExplanation explaining why the correct answer is right.`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    questionText: { type: Type.STRING },
                    type: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                    rubricExplanation: { type: Type.STRING },
                    points: { type: Type.NUMBER },
                  },
                  required: ['id', 'questionText', 'type', 'difficulty', 'correctAnswer', 'rubricExplanation', 'points'],
                },
              },
            },
          }),
        20000,
        'generate-quiz'
      );

      const questions = JSON.parse((response.text ?? '[]').trim());
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(502).json({ error: 'Quinn AI returned an empty quiz payload.' });
      }

      const normalized = questions.map((q: any, i: number) => ({
        id: q.id || `q-${i + 1}`,
        questionText: q.questionText,
        type: q.type || 'multiple_choice',
        format: String(q.type || 'multiple_choice').replace(/_/g, ' ').toUpperCase(),
        difficulty: ['basic', 'intermediate', 'advanced'].includes(String(q.difficulty).toLowerCase())
          ? String(q.difficulty).toLowerCase()
          : i < basicCount
          ? 'basic'
          : i < basicCount + intermediateCount
          ? 'intermediate'
          : 'advanced',
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: String(q.correctAnswer || ''),
        rubricExplanation: String(q.rubricExplanation || ''),
        points: Number(q.points) || (i < basicCount ? 5 : i < basicCount + intermediateCount ? 7 : 10),
      }));

      return res.json({ questions: normalized });
    } catch (err: any) {
      console.error('Gemini quiz generation error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to generate verification quiz.' });
    }
  });

  app.post('/api/quinn/evaluate-quiz', async (req, res) => {
    const {
      questions = [],
      studentAnswers = {},
      studentId = '',
      courseId = '',
      lessonId = '',
      passingScorePercent = 70,
    } = req.body || {};

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions array is required.' });
    }

    const ai = getGeminiClient();
    const subjectiveItems = questions.filter(
      (q: any) =>
        (q.type === 'short_answer' || (q.type === 'practical_application' && (!q.options || q.options.length === 0)))
    );

    let subjectiveGrades: Record<string, { scoreAwarded: number; isCorrect: boolean; feedback: string }> = {};

    if (ai && subjectiveItems.length > 0) {
      try {
        const evalPrompt = `You are Quinn AI grading student open-ended responses against the rubric.
Grade each question fairly from 0 to maxScore. Mark isCorrect true if scoreAwarded >= 70% of maxScore. Provide constructive 1-2 sentence explanation referencing the rubric.

Items:
${JSON.stringify(
  subjectiveItems.map((q: any) => ({
    questionId: q.id,
    questionText: q.questionText,
    modelAnswer: q.correctAnswer,
    rubric: q.rubricExplanation,
    maxScore: q.points,
    studentAnswer: (studentAnswers[q.id] || '').trim(),
  })),
  null,
  2
)}`;

        const evalRes = await withGeminiTimeout(
          (abortSignal) =>
            ai.models.generateContent({
              model: MODEL_TEXT,
              contents: evalPrompt,
              config: {
                abortSignal,
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionId: { type: Type.STRING },
                      scoreAwarded: { type: Type.NUMBER },
                      isCorrect: { type: Type.BOOLEAN },
                      feedback: { type: Type.STRING },
                    },
                    required: ['questionId', 'scoreAwarded', 'isCorrect', 'feedback'],
                  },
                },
              },
            }),
          15000,
          'evaluate-quiz'
        );

        const parsed = JSON.parse((evalRes.text ?? '[]').trim());
        for (const item of parsed) {
          subjectiveGrades[item.questionId] = item;
        }
      } catch (err) {
        console.warn('Gemini subjective evaluation warning, using heuristic fallback:', err);
      }
    }

    const responses: any[] = [];
    let totalScore = 0;
    let maxScore = 0;
    const revisionTopics: string[] = [];

    for (const q of questions) {
      const studentAns = String(studentAnswers[q.id] || '').trim();
      const qMax = Number(q.points) || 5;
      maxScore += qMax;

      let isCorrect = false;
      let scoreAwarded = 0;
      let feedback = '';

      if (q.type === 'multiple_choice' || q.type === 'true_false' || (q.options && q.options.length > 0)) {
        isCorrect = studentAns.toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
        scoreAwarded = isCorrect ? qMax : 0;
        feedback = isCorrect
          ? `Correct! ${q.rubricExplanation}`
          : `Incorrect. Expected "${q.correctAnswer}". ${q.rubricExplanation}`;
      } else if (q.type === 'fill_in_blank') {
        const expected = String(q.correctAnswer).trim().toLowerCase();
        isCorrect =
          studentAns.length > 0 &&
          (studentAns.toLowerCase() === expected || studentAns.toLowerCase().includes(expected));
        scoreAwarded = isCorrect ? qMax : 0;
        feedback = isCorrect
          ? `Accurate response. ${q.rubricExplanation}`
          : `Expected "${q.correctAnswer}". ${q.rubricExplanation}`;
      } else if (subjectiveGrades[q.id]) {
        const g = subjectiveGrades[q.id];
        scoreAwarded = Math.max(0, Math.min(qMax, Math.round(Number(g.scoreAwarded) || 0)));
        isCorrect = Boolean(g.isCorrect);
        feedback = g.feedback || q.rubricExplanation;
      } else {
        const keyTerms = String(q.correctAnswer || '')
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 4);
        const matches = keyTerms.filter((t) => studentAns.toLowerCase().includes(t)).length;
        if (studentAns.length >= 35 && matches >= Math.min(2, keyTerms.length)) {
          isCorrect = true;
          scoreAwarded = qMax;
          feedback = `Strong conceptual response covering key rubric points. ${q.rubricExplanation}`;
        } else if (studentAns.length >= 15) {
          isCorrect = false;
          scoreAwarded = Math.round(qMax * 0.5);
          feedback = `Partially complete. Model benchmark: ${q.rubricExplanation}`;
        } else {
          isCorrect = false;
          scoreAwarded = 0;
          feedback = `Incomplete response. Expected concept: ${q.rubricExplanation}`;
        }
      }

      if (!isCorrect) {
        revisionTopics.push(String(q.questionText).slice(0, 72));
      }

      totalScore += scoreAwarded;
      responses.push({
        questionId: q.id,
        studentAnswer: studentAns || '(No response provided)',
        isCorrect,
        scoreAwarded,
        maxScore: qMax,
        feedback,
      });
    }

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= Number(passingScorePercent);

    const quinnFeedback = passed
      ? `Excellent verification performance! You scored ${percentage}% (${totalScore}/${maxScore}), surpassing the ${passingScorePercent}% benchmark. Your Practical Project brief is now unlocked.`
      : `You scored ${percentage}% (${totalScore}/${maxScore}), below the ${passingScorePercent}% passing threshold. Review the explanations below and revisit the recommended video lectures before retaking the verification quiz.`;

    return res.json({
      id: `attempt-${Date.now()}`,
      attemptId: `attempt-${Date.now()}`,
      studentId,
      courseId,
      lessonId,
      submittedAt: new Date().toISOString(),
      score: totalScore,
      maxScore,
      percentage,
      percentageScore: percentage,
      passed,
      responses,
      quinnFeedback,
      recommendedRevisionTopics: [...new Set(revisionTopics)].slice(0, 5),
    });
  });

  // ------------------------------------------------------------------
  // Module 4: AI Practical Project Generator (with Anti-Copying Variations)
  // ------------------------------------------------------------------
  app.post('/api/quinn/generate-project', async (req, res) => {
    const {
      courseId = '',
      courseTitle = 'OpenFrame Course',
      lessonTopic = 'Core Principles',
      category = 'Technology',
      variationSeed = Date.now().toString(36),
    } = req.body || {};

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        fallbackRequired: true,
      });
    }

    try {
      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `You are Quinn AI, Practical Project Architect for OpenFrame Education.
Create a unique practical capstone project assignment tailored to:
- Course: "${courseTitle}" (Category: ${category})
- Focus Lesson/Module: "${lessonTopic}"
- Anti-Copying Student Variation Seed: "${variationSeed}" (pick a distinct real-world industry scenario/domain, e.g., healthcare clinic, local retail business, fintech startup, logistics fleet, agritech cooperative, or edtech campus so every student gets a non-identical project variation).

Include:
- title (specific to the chosen industry scenario)
- description & problemStatement
- 3-4 clear objectives
- 5 step-by-step instructions
- 4-6 structured deliverables (each with title, description, and allowed fileTypes like ["PDF", "DOCX", "PPTX", "PNG", "Link", "MP4"])
- expectedOutput summary
- submissionDeadlineDays (number, e.g. 14)
- difficultyLevel ("Beginner", "Intermediate", or "Advanced")
- maxMarks: 100`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  problemStatement: { type: Type.STRING },
                  objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                  instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  requiredDeliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
                  deliverables: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        fileTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
                      },
                      required: ['title', 'description', 'fileTypes'],
                    },
                  },
                  expectedOutput: { type: Type.STRING },
                  submissionDeadlineDays: { type: Type.NUMBER },
                  difficultyLevel: { type: Type.STRING },
                },
                required: [
                  'title',
                  'description',
                  'problemStatement',
                  'objectives',
                  'instructions',
                  'deliverables',
                  'expectedOutput',
                  'submissionDeadlineDays',
                  'difficultyLevel',
                ],
              },
            },
          }),
        20000,
        'generate-project'
      );

      const generated = JSON.parse((response.text ?? '{}').trim());
      return res.json({
        project: {
          id: `proj-${Date.now()}`,
          projectId: `proj-${Date.now()}`,
          courseId: courseId || courseTitle,
          lessonId: lessonTopic,
          variationSeed,
          ...generated,
          requiredDeliverables:
            generated.requiredDeliverables ||
            (Array.isArray(generated.deliverables) ? generated.deliverables.map((d: any) => d.title) : []),
          evaluationCriteria: [
            { name: 'Subject Knowledge', maxMarks: 20, description: 'Depth of understanding of theoretical principles and standards.' },
            { name: 'Understanding of Concepts', maxMarks: 20, description: 'Correct application of methodologies and architectural design.' },
            { name: 'Practical Implementation', maxMarks: 20, description: 'Working deliverables, completeness, and technical execution.' },
            { name: 'Creativity & Innovation', maxMarks: 15, description: 'Original thinking and practical refinements.' },
            { name: 'Presentation Skills', maxMarks: 15, description: 'Clarity, slide structure, and demonstration quality.' },
            { name: 'Communication Skills', maxMarks: 10, description: 'Terminology precision and clear articulation.' },
          ],
          maxMarks: 100,
        },
      });
    } catch (err: any) {
      console.error('Gemini project generation error:', err);
      return res.status(500).json({ error: err?.message || 'Failed to generate practical project.' });
    }
  });

  // ------------------------------------------------------------------
  // Module 7: AI Performance Analysis
  // ------------------------------------------------------------------
  app.post('/api/quinn/analyze-performance', async (req, res) => {
    const {
      quizAttempts = [],
      evaluation = null,
      completedLessons = 0,
      totalLessons = 1,
      courseTitle = 'OpenFrame Course',
    } = req.body || {};

    const progressPercentage = Math.min(100, Math.round((Number(completedLessons) / Math.max(1, Number(totalLessons))) * 100));
    const quizAverage =
      Array.isArray(quizAttempts) && quizAttempts.length > 0
        ? Math.round(
            quizAttempts.reduce((acc: number, q: any) => acc + (Number(q.percentageScore ?? q.percentage) || 0), 0) /
              quizAttempts.length
          )
        : 0;

    const scores = evaluation?.scores || evaluation?.rubricScores;
    const projectScore = scores
      ? Math.round(
          ((Number(scores.subjectKnowledge || 0) +
            Number(scores.conceptUnderstanding ?? scores.conceptsMastery ?? 0) +
            Number(scores.practicalImplementation || 0)) /
            60) *
            100
        )
      : 0;

    const presentationScore = scores
      ? Math.round(
          ((Number(scores.creativityInnovation || 0) +
            Number(scores.presentationSkills ?? scores.presentationQuality ?? 0) +
            Number(scores.communicationSkills || 0)) /
            40) *
            100
        )
      : 0;

    const activeMetrics = [quizAverage, projectScore, presentationScore].filter((n) => n > 0);
    const skillDevelopmentScore =
      activeMetrics.length > 0
        ? Math.round(activeMetrics.reduce((a, b) => a + b, 0) / activeMetrics.length)
        : Math.max(15, progressPercentage);

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        analysis: {
          progressPercentage,
          quizAverage,
          projectScore,
          presentationScore,
          skillDevelopmentScore,
          strengths: quizAverage >= 70 ? ['Consistent engagement with lesson modules and verification assessments.'] : ['Getting started with foundational course modules.'],
          weaknesses: quizAverage > 0 && quizAverage < 70 ? ['Assessment verification score below 70% threshold.'] : [],
          areasForImprovement: ['Complete all recommended YouTube lectures and submit the practical capstone deliverables.'],
          personalizedRecommendation: `Continue progressing through ${courseTitle} step-by-step to unlock teacher evaluation and official certification.`,
          lastAnalyzedAt: new Date().toISOString(),
        },
      });
    }

    try {
      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `You are Quinn AI analyzing a student's real metrics in "${courseTitle}":
- Lesson Progress: ${progressPercentage}% (${completedLessons}/${totalLessons} lessons)
- Quiz Average: ${quizAverage}% (${Array.isArray(quizAttempts) ? quizAttempts.length : 0} attempts)
- Project Evaluation Score: ${projectScore}%
- Presentation Score: ${presentationScore}%
- Skill Development Index: ${skillDevelopmentScore}%

Provide honest, specific strengths, weaknesses, areasForImprovement, and a personalizedRecommendation grounded strictly in these real metrics (do not fabricate achievements not reflected above).`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
                  personalizedRecommendation: { type: Type.STRING },
                },
                required: ['strengths', 'weaknesses', 'areasForImprovement', 'personalizedRecommendation'],
              },
            },
          }),
        15000,
        'analyze-performance'
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json({
        analysis: {
          progressPercentage,
          quizAverage,
          projectScore,
          presentationScore,
          skillDevelopmentScore,
          strengths: parsed.strengths || [],
          weaknesses: parsed.weaknesses || [],
          areasForImprovement: parsed.areasForImprovement || [],
          personalizedRecommendation: parsed.personalizedRecommendation || '',
          lastAnalyzedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
      console.warn('Gemini analysis warning:', err);
      return res.json({
        analysis: {
          progressPercentage,
          quizAverage,
          projectScore,
          presentationScore,
          skillDevelopmentScore,
          strengths: ['Steady progression through structured OpenFrame Education modules.'],
          weaknesses: quizAverage > 0 && quizAverage < 70 ? ['Quiz verification accuracy requires revision.'] : [],
          areasForImprovement: ['Complete all mandatory video lessons, quiz verification, and capstone submission.'],
          personalizedRecommendation: `Stay focused on ${courseTitle} practical deliverables for faculty rubric evaluation.`,
          lastAnalyzedAt: new Date().toISOString(),
        },
      });
    }
  });

  // ------------------------------------------------------------------
  // Built-In Zero-Token AI Course Organizer (Transforms query + catalog + YouTube into Parts & Modules)
  // ------------------------------------------------------------------
  app.post('/api/quinn/organize-course', async (req, res) => {
    const { query = '', language = 'English', videos = [], moduleCount, mode = 'builtin' } = req.body || {};
    const topic = String(query || '').trim();
    if (!topic) {
      return res.status(400).json({ error: 'Search query is required to organize a learning path.' });
    }

    const intent = parseEducationalIntent(topic);
    const expanded = normalizeAndExpandQuery(topic);
    const displayTopicRaw = intent.desiredSkill || expanded.corePhrase || topic;
    const displayTopic = displayTopicRaw
      .split(/\s+/)
      .map((w) => (w.length <= 3 && /^(ai|ml|ui|ux|sql|css|seo|ppt|bi)$/i.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
      .join(' ');

    const isExcelTopic = /\b(excel|spreadsheet|spreadsheets|pivot|vlookup|xlookup)\b/i.test(topic);
    const isWebsiteTopic = /\b(website|websites|web\s*dev|web\s*design|html|css|wordpress|landing\s*page|webpage|full\s*stack)\b/i.test(topic);
    const parsedModuleCount = Number(moduleCount);
    const targetModuleCount =
      Number.isFinite(parsedModuleCount) && parsedModuleCount >= 3 && parsedModuleCount <= 9
        ? Math.round(parsedModuleCount)
        : isExcelTopic
        ? 6
        : 3;

    const detected = detectQueryLanguage(topic);
    const targetLanguage =
      language && language !== 'Auto-Detect Language' && language !== 'auto'
        ? String(language)
        : detected.label;

    const index = getBaseCatalogIndex();
    const matchedCatalog = index.items
      .filter(({ course }) => course.status !== 'Draft' && course.status !== 'Archived')
      .map(({ course }) => ({
        course,
        score: scoreSearchMatch(
          {
            id: course.id,
            aliasId: course.aliasId,
            title: course.title,
            category: course.category,
            categories: course.categories,
            subcategory: course.subcategory,
            topic: course.topic,
            keywords: course.keywords,
            skills: course.skillsAcquired,
            shortDesc: course.shortDesc,
            instructorName: course.instructorName || course.instructor?.name,
            youtubeChannelName: course.youtubeChannelName,
            language: course.language,
          },
          topic
        ),
      }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || b.course.enrolledCount - a.course.enrolledCount)
      .slice(0, 4)
      .map((x) => x.course);

    let incomingVideos = Array.isArray(videos) ? videos.filter(Boolean) : [];
    if (incomingVideos.length === 0) {
      try {
        const ytPage = await youtubeDiscoveryEngine.discoverPage({
          query: `${expanded.corePhrase || topic} tutorial`,
          category: intent.primarySubject || 'Education',
          languageLabel: targetLanguage,
          searchType: 'video',
          maxResults: 6,
        });
        if (ytPage.items.length > 0) {
          incomingVideos = ytPage.items.map((item) => ({
            id: item.youtubeVideoId || item.id,
            videoId: item.youtubeVideoId || '',
            youtubeId: item.youtubeVideoId || '',
            youtubeUrl: item.youtubeVideoId ? `https://www.youtube.com/watch?v=${item.youtubeVideoId}` : undefined,
            title: item.title,
            channelTitle: item.youtubeChannelName,
            thumbnail: item.thumbnailUrl,
            thumbnailUrl: item.thumbnailUrl,
            duration: item.duration || 'Tutorial',
            level: item.level === 'All Levels' ? 'Beginner' : item.level,
            description: item.description || item.learningObjectives?.[0] || '',
          }));
        }
      } catch {
        // Fallback cleanly below
      }
    }
    if (incomingVideos.length === 0) {
      incomingVideos = selectCuratedFallbackVideos(expanded.corePhrase || topic, intent.primarySubject || '');
    }

    const videoMetadataList = incomingVideos.slice(0, 9).map((v: any) => {
      const vid = v.videoId || v.youtubeId || v.id || '';
      return {
        id: vid,
        videoId: vid,
        youtubeId: vid,
        youtubeUrl: v.youtubeUrl || (vid ? `https://www.youtube.com/watch?v=${vid}` : undefined),
        title: String(v.title || '').slice(0, 120),
        channelTitle: String(v.channelTitle || 'YouTube Educator').slice(0, 60),
        thumbnail: v.thumbnail || v.thumbnailUrl || (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : ''),
        thumbnailUrl: v.thumbnailUrl || v.thumbnail || (vid ? `https://i.ytimg.com/vi/${vid}/hqdefault.jpg` : ''),
        duration: v.duration || 'Tutorial',
        level: v.level || 'Beginner',
        description: String(v.description || v.recommendedReason || '').slice(0, 140),
        embedUrl: v.embedUrl || (vid ? `https://www.youtube-nocookie.com/embed/${vid}` : undefined),
      };
    });

    const videoById = new Map(videoMetadataList.map((v) => [v.videoId, v]));

    const distributeVideoIds = (idx: number, totalMods: number): string[] => {
      if (videoMetadataList.length === 0) return [];
      if (videoMetadataList.length <= totalMods) {
        const vid = videoMetadataList[idx % videoMetadataList.length]?.videoId;
        return vid ? [vid] : [];
      }
      const perModule = Math.ceil(videoMetadataList.length / Math.max(1, totalMods));
      const start = idx * perModule;
      const chunk = videoMetadataList
        .slice(start, start + perModule)
        .map((v) => v.videoId)
        .filter(Boolean);
      if (chunk.length > 0) return chunk;
      const fallbackVid = videoMetadataList[idx % videoMetadataList.length]?.videoId;
      return fallbackVid ? [fallbackVid] : [];
    };

    const aiDisclaimer =
      'Built-In OpenFrame AI Curriculum Engine modeled this course from verified OpenFrame catalog programmes and real YouTube tutorials at zero AI token cost.';

    const buildBuiltInStructuredCoursePath = () => {
      const partTitles = isExcelTopic
        ? [
            'Part 1: Excel Foundations & Core Formulas',
            'Part 2: Analytics, Pivot Tables & Dashboards',
            'Part 3: Real-World Projects & Interview Mastery',
          ]
        : isWebsiteTopic
        ? [
            'Part 1: Web Foundations, Structure & Responsive Styling',
            'Part 2: Interactive Frontend, Components & Content Workflows',
            'Part 3: Hosting, SEO Optimization & Production Launch',
          ]
        : [
            `Part 1: ${displayTopic} Foundations & Core Concepts`,
            `Part 2: Guided Workflows & Practical Application`,
            `Part 3: Capstone Projects & Assessment Readiness`,
          ];

      const excelSixTemplates = [
        {
          partIdx: 0,
          level: 'Beginner' as const,
          title: 'Beginner Tutorials & Workbook Navigation',
          summary: 'Master Excel ribbons, cell referencing, data entry formatting, and clean worksheet structure.',
          objectives: [
            'Navigate workbooks, ranges, rows/columns, and structured Excel tables confidently',
            'Apply conditional formatting, data validation, and keyboard productivity shortcuts',
          ],
          exercise: 'Create a formatted monthly expense tracker using relative & absolute ($) cell references.',
        },
        {
          partIdx: 0,
          level: 'Beginner' as const,
          title: 'Essential Formulas & Logical Functions',
          summary: 'Automate calculations using SUMIFS, COUNTIFS, IF, and modern XLOOKUP / VLOOKUP formulas.',
          objectives: [
            'Write nested IF, AND/OR, SUMIFS, and text-cleaning formulas without errors',
            'Merge multi-sheet datasets accurately using XLOOKUP, VLOOKUP, and INDEX-MATCH',
          ],
          exercise: 'Join a product price list with a sales log using XLOOKUP and flag low-margin orders with IF.',
        },
        {
          partIdx: 1,
          level: 'Intermediate' as const,
          title: 'Dashboards, Charts & Pivot Tables',
          summary: 'Summarize thousands of rows instantly with PivotTables, PivotCharts, timelines, and interactive slicers.',
          objectives: [
            'Group, filter, and calculate % of total revenue inside dynamic PivotTables',
            'Connect slicers to multi-chart KPI dashboards for executive reporting',
          ],
          exercise: 'Build a 3-KPI regional sales dashboard driven by a PivotTable and interactive region slicer.',
        },
        {
          partIdx: 1,
          level: 'Intermediate' as const,
          title: 'Data Analysis & Power Query Cleanup',
          summary: 'Clean messy CSV imports, remove duplicates, split columns, and run what-if sensitivity analysis.',
          objectives: [
            'Standardize inconsistent dates, currencies, and text using Power Query transformations',
            'Use Goal Seek and Scenario Manager for business forecasting',
          ],
          exercise: 'Import an unformatted sales CSV, deduplicate rows, and generate a clean summary sheet.',
        },
        {
          partIdx: 2,
          level: 'Advanced' as const,
          title: 'Practical Business Projects & Case Study',
          summary: 'Deliver an end-to-end financial budget and inventory tracking workbook ready for review.',
          objectives: [
            'Combine raw data, transformation logic, and executive presentation tabs cleanly',
            'Add error-proofing checks with IFERROR and audit formulas',
          ],
          exercise: 'Complete a multi-sheet Financial & Inventory Control workbook ready for LMS submission.',
        },
        {
          partIdx: 2,
          level: 'Advanced' as const,
          title: 'Interview Preparation & Speed Benchmarks',
          summary: 'Practice timed Excel assessment tests covering lookups, PivotTables, and business case reasoning.',
          objectives: [
            'Solve common analyst & finance Excel test scenarios under time constraints',
            'Explain formula trade-offs clearly during technical interviews',
          ],
          exercise: 'Complete the timed 6-task Excel case drill and verify your score on the module quiz.',
        },
      ];

      const websiteTemplates = [
        {
          partIdx: 0,
          level: 'Beginner' as const,
          title: 'Semantic HTML5 & Website Blueprinting',
          summary: 'Structure accessible pages with semantic landmarks, navigation, media, and forms.',
          objectives: [
            'Plan page wireframes, header/main/footer hierarchy, and accessible semantic HTML tags',
            'Embed responsive images, links, and structured contact forms cleanly',
          ],
          exercise: 'Create a complete 3-section landing page skeleton in clean semantic HTML5.',
        },
        {
          partIdx: 0,
          level: 'Beginner' as const,
          title: 'Modern CSS3, Flexbox & Responsive Grid Layout',
          summary: 'Style layouts, typography scales, cards, and mobile breakpoints using Flexbox and CSS Grid.',
          objectives: [
            'Build responsive navigation bars and multi-column feature grids for desktop and mobile',
            'Apply consistent color contrast, spacing tokens, and interactive hover states',
          ],
          exercise: 'Make your landing page adapt cleanly from 375px mobile to 1280px desktop.',
        },
        {
          partIdx: 1,
          level: 'Intermediate' as const,
          title: 'Interactive JavaScript & DOM Workflows',
          summary: 'Add mobile drawers, form validation, dynamic filtering, and interactive UI state.',
          objectives: [
            'Handle DOM events cleanly for search bars, tabs, modals, and form validation',
            'Fetch and render dynamic data into reusable UI cards',
          ],
          exercise: 'Add an interactive filterable showcase grid and validated inquiry form to your website.',
        },
        {
          partIdx: 1,
          level: 'Intermediate' as const,
          title: 'Multi-Page Components & Routing Architecture',
          summary: 'Organize reusable header/footer templates, detail views, and scalable component folders.',
          objectives: [
            'Separate shared layout chrome from page content and data services',
            'Optimize navigation speed and clean URL routes across views',
          ],
          exercise: 'Refactor your site into Home, Services, and Contact views sharing reusable components.',
        },
        {
          partIdx: 2,
          level: 'Advanced' as const,
          title: 'SEO, Performance & Accessibility Audits',
          summary: 'Optimize page metadata, Core Web Vitals, image loading, and Lighthouse accessibility scores.',
          objectives: [
            'Configure semantic titles, meta descriptions, OpenGraph tags, and alt attributes',
            'Minimize layout shift and optimize asset delivery',
          ],
          exercise: 'Run an accessibility & metadata checklist achieving full semantic coverage.',
        },
        {
          partIdx: 2,
          level: 'Advanced' as const,
          title: 'Custom Domain Deployment & Portfolio Capstone',
          summary: 'Publish your live website with HTTPS, DNS configuration, and documentation for clients.',
          objectives: [
            'Deploy production static or full-stack builds with environment safety checks',
            'Present your live website project for OpenFrame faculty evaluation',
          ],
          exercise: 'Package and deploy your responsive multi-page website and submit the live showcase brief.',
        },
      ];

      let rawModuleSpecs: Array<{
        partIdx: number;
        level: 'Beginner' | 'Intermediate' | 'Advanced';
        title: string;
        summary: string;
        objectives: string[];
        exercise: string;
      }> = [];

      if (isExcelTopic && targetModuleCount === 6) {
        rawModuleSpecs = excelSixTemplates;
      } else if (isWebsiteTopic && targetModuleCount === 6) {
        rawModuleSpecs = websiteTemplates;
      } else {
        const templates = isWebsiteTopic ? websiteTemplates : [];
        for (let i = 0; i < targetModuleCount; i++) {
          const partIdx = Math.min(2, Math.floor((i * 3) / targetModuleCount));
          const level: 'Beginner' | 'Intermediate' | 'Advanced' =
            partIdx === 0 ? 'Beginner' : partIdx === 1 ? 'Intermediate' : 'Advanced';
          if (templates.length >= targetModuleCount) {
            const picked = templates[Math.floor((i * templates.length) / targetModuleCount)];
            rawModuleSpecs.push({ ...picked, partIdx, level });
          } else {
            const vidHint = videoMetadataList[i % Math.max(1, videoMetadataList.length)]?.title;
            const modTitle =
              partIdx === 0
                ? i === 0
                  ? `${displayTopic}: Core Concepts & Foundations`
                  : `${displayTopic}: Environment Setup & Essential Rules`
                : partIdx === 1
                ? i % 2 === 0
                  ? `${displayTopic}: Guided Workflows & Pattern Practice`
                  : `${displayTopic}: Applied Scenarios & Diagnostics`
                : i === targetModuleCount - 1
                ? `${displayTopic}: Capstone Project & Assessment Defense`
                : `${displayTopic}: Real-World Optimization & Case Study`;
            rawModuleSpecs.push({
              partIdx,
              level,
              title: modTitle,
              summary: vidHint
                ? `Structured module anchored by "${vidHint.slice(0, 68)}" for step-by-step ${displayTopic} mastery.`
                : `Progressive ${level.toLowerCase()} study module covering essential ${displayTopic} workflows.`,
              objectives: [
                `Master ${level.toLowerCase()} ${displayTopic} principles and repeatable techniques`,
                `Apply module lessons inside a hands-on practical exercise ready for verification`,
              ],
              exercise: `Apply "${modTitle}" inside a small reproducible deliverable and verify key outputs.`,
            });
          }
        }
      }

      const modules = rawModuleSpecs.map((spec, idx) => {
        const vidIds = distributeVideoIds(idx, rawModuleSpecs.length);
        const modRecVideos = vidIds.map((id) => videoById.get(id)).filter(Boolean);
        const partLabel = partTitles[spec.partIdx];
        const includeQuiz = idx === 0 || idx === rawModuleSpecs.length - 1 || idx === Math.floor(rawModuleSpecs.length / 2);
        return {
          moduleNumber: idx + 1,
          partLabel,
          level: spec.level,
          title: spec.title,
          objectives: spec.objectives,
          summary: spec.summary,
          practiceExercises: [spec.exercise],
          videoIds: vidIds,
          recommendedVideos: modRecVideos,
          ...(includeQuiz
            ? {
                miniQuizQuestion:
                  idx === 0
                    ? {
                        question: `Which approach gives you the fastest real-world foundation in ${displayTopic}?`,
                        options: [
                          'Watching the guided walkthrough while building a small hands-on example step by step',
                          'Memorizing terms passively without practicing workflows',
                          'Skipping foundational basics to attempt production capstones immediately',
                          'Avoiding error verification after practice exercises',
                        ],
                        correctAnswer: 'Watching the guided walkthrough while building a small hands-on example step by step',
                        explanation: 'Pairing guided demonstrations with immediate hands-on practice builds durable skill retention.',
                      }
                    : idx === rawModuleSpecs.length - 1
                    ? {
                        question: `Before enrolling or submitting your ${displayTopic} capstone, what proves practical readiness?`,
                        options: [
                          'A working deliverable tested against real inputs plus clear verification metrics',
                          'Copying slide titles without testing outcomes',
                          'Skipping edge-case checks',
                          'Ignoring user or stakeholder requirements',
                        ],
                        correctAnswer: 'A working deliverable tested against real inputs plus clear verification metrics',
                        explanation: 'Tested deliverables with verified metrics prepare you cleanly for certification and interviews.',
                      }
                    : {
                        question: `When troubleshooting an intermediate ${displayTopic} task, what should you check first?`,
                        options: [
                          'Validate core inputs, structure, and step-by-step assumptions',
                          'Delete the project and guess randomly',
                          'Ignore warning indicators',
                          'Skip testing intermediate outputs',
                        ],
                        correctAnswer: 'Validate core inputs, structure, and step-by-step assumptions',
                        explanation: 'Systematic input and structure validation catches root errors quickly.',
                      },
              }
            : {}),
        };
      });

      const partGroups = partTitles
        .map((pTitle, pIdx) => ({
          partNumber: pIdx + 1,
          title: pTitle,
          moduleNumbers: modules
            .filter((_, mIdx) => rawModuleSpecs[mIdx].partIdx === pIdx)
            .map((m) => m.moduleNumber),
        }))
        .filter((pg) => pg.moduleNumbers.length > 0);

      const primaryCourseMatch = matchedCatalog[0];
      const modeledPricing = compute90PercentCoursePricing({
        rawPrice: primaryCourseMatch?.price,
        category: primaryCourseMatch?.category || intent.primarySubject,
        title: topic,
        educationLevel: intent.educationLevelCode,
        degreeOrClass: intent.degreeOrClass,
      });
      return {
        id: `ai-path-${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28) || 'course'}-${targetModuleCount}`,
        topic,
        language: targetLanguage,
        price: modeledPricing.finalPriceInr,
        marketBenchmarkPrice: modeledPricing.marketBenchmarkPrice,
        discountPercent: modeledPricing.discountPercent,
        educationLevel: intent.educationLevelCode,
        board: primaryCourseMatch?.board || (/\bkarnataka|sslc|puc|kseab|dpue\b/i.test(topic) ? 'Karnataka State Board (KSEAB / DPUE)' : /\bcbse|ncert\b/i.test(topic) ? 'CBSE / NCERT' : undefined),
        title: primaryCourseMatch
          ? `${displayTopic}: Complete Modeled Course & Enrollment Path`
          : `${displayTopic} — Structured ${partGroups.length}-Part, ${modules.length}-Module Course`,
        overview: primaryCourseMatch
          ? `Recommended OpenFrame programme paired with "${primaryCourseMatch.title}" and ${videoMetadataList.length} live YouTube tutorials, organized into ${partGroups.length} progressive parts and ${modules.length} hands-on modules. Fee: ₹${modeledPricing.finalPriceInr.toLocaleString('en-IN')} (90% OpenFrame Grant off ₹${modeledPricing.marketBenchmarkPrice.toLocaleString('en-IN')} market value).`
          : `Complete ${targetLanguage} learning pathway for ${displayTopic}, structured into ${partGroups.length} progressive parts and ${modules.length} actionable modules with embedded YouTube tutorials, verification quiz, and QR certification (₹${modeledPricing.finalPriceInr.toLocaleString('en-IN')} · 90% Off).`,
        aiDisclaimer,
        sourceMode: 'builtin_engine' as const,
        createdAt: new Date().toISOString(),
        partGroups,
        modules,
        matchedCatalogCourses: matchedCatalog.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          subcategory: c.subcategory,
          level: c.level,
          duration: c.duration,
          price: c.price,
          marketBenchmarkPrice: c.marketBenchmarkPrice,
          discountPercent: c.discountPercent || 90,
          thumbnailUrl: c.thumbnailUrl,
          youtubeVideoId: c.youtubeVideoId,
          youtubeUrl: c.youtubeUrl,
          instructorName: c.instructorName,
          shortDesc: c.shortDesc,
        })),
      };
    };

    const cacheKey = [
      String(mode),
      topic.toLowerCase(),
      targetLanguage.toLowerCase(),
      String(targetModuleCount),
      videoMetadataList.map((v) => v.videoId).filter(Boolean).sort().join(','),
    ].join('::');

    const cachedEntry = organizeCourseCache.get(cacheKey);
    if (cachedEntry && Date.now() - cachedEntry.ts < ORGANIZE_CACHE_TTL_MS) {
      return res.json({ path: cachedEntry.path, cached: true });
    }

    // Default Built-In Zero-Token Engine: instant, accurate, $0 token cost for users
    if (mode !== 'gemini') {
      const builtInPath = buildBuiltInStructuredCoursePath();
      organizeCourseCache.set(cacheKey, { ts: Date.now(), path: builtInPath });
      if (organizeCourseCache.size > 200) {
        const oldestKey = organizeCourseCache.keys().next().value;
        if (oldestKey) organizeCourseCache.delete(oldestKey);
      }
      return res.json({ path: builtInPath });
    }

    // Optional explicit Gemini enhancement (falls back cleanly to Built-In Engine if key/quota unavailable)
    const ai = getGeminiClient();
    if (!ai || Date.now() < geminiQuotaExhaustedUntilMs) {
      const builtInPath = buildBuiltInStructuredCoursePath();
      return res.json({ path: builtInPath });
    }

    const validVideoIdSet = new Set(videoMetadataList.map((v) => v.videoId).filter(Boolean));
    const excelInstruction = isExcelTopic && targetModuleCount === 6
      ? `\nSince this is an Excel topic with 6 modules, structure the 6 modules explicitly as:
1. Beginner Tutorials
2. Formulas & Functions
3. Dashboards & Pivot Tables
4. Data Analysis
5. Practical Projects
6. Interview Preparation`
      : '';

    try {
      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `Create a clean, structured ${targetModuleCount}-module learning path (Beginner to Intermediate to Advanced) for "${topic}" in "${targetLanguage}".${excelInstruction}

RULES:
- Map videoIds ONLY to exact videoId values from Available Video Metadata. Never invent video IDs.
- Keep objectives (2 per module), summary (1 short sentence), and practiceExercises (1 per module) concise.
- Include miniQuizQuestion only on the first and last module.
- Respond in "${targetLanguage}" keeping technical terms clear.

Available Video Metadata:
${JSON.stringify(videoMetadataList)}`,
            config: {
              abortSignal,
              systemInstruction: 'You are Quinn AI, Academic Path Organizer at OpenFrame Education. Produce concise, well-structured JSON learning paths quickly without verbose filler.',
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  overview: { type: Type.STRING },
                  modules: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        moduleNumber: { type: Type.NUMBER },
                        level: { type: Type.STRING },
                        title: { type: Type.STRING },
                        objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
                        summary: { type: Type.STRING },
                        practiceExercises: { type: Type.ARRAY, items: { type: Type.STRING } },
                        videoIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                        miniQuizQuestion: {
                          type: Type.OBJECT,
                          properties: {
                            question: { type: Type.STRING },
                            options: { type: Type.ARRAY, items: { type: Type.STRING } },
                            correctAnswer: { type: Type.STRING },
                            explanation: { type: Type.STRING },
                          },
                          required: ['question', 'options', 'correctAnswer', 'explanation'],
                        },
                      },
                      required: ['moduleNumber', 'level', 'title', 'objectives', 'summary', 'practiceExercises'],
                    },
                  },
                },
                required: ['title', 'overview', 'modules'],
              },
            },
          }),
        20000,
        'organize-course'
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      if (parsed && Array.isArray(parsed.modules) && parsed.modules.length > 0) {
        const modCount = parsed.modules.length;
        const baseline = buildBuiltInStructuredCoursePath();
        const organizedPath = {
          ...baseline,
          id: `ai-path-${Date.now().toString(36)}`,
          title: parsed.title || baseline.title,
          overview: parsed.overview || baseline.overview,
          sourceMode: 'gemini' as const,
          modules: parsed.modules.map((m: any, idx: number) => {
            const rawVids = Array.isArray(m.videoIds)
              ? m.videoIds.filter((vid: any) => typeof vid === 'string' && validVideoIdSet.has(vid))
              : [];
            const finalVideoIds = rawVids.length > 0 ? rawVids : distributeVideoIds(idx, modCount);
            const lvl = m.level === 'Advanced' || m.level === 'Intermediate' ? m.level : 'Beginner';
            return {
              moduleNumber: Number(m.moduleNumber) || idx + 1,
              partLabel:
                lvl === 'Advanced'
                  ? 'Part 3: Applied Projects & Mastery'
                  : lvl === 'Intermediate'
                  ? 'Part 2: Guided Workflows & Practice'
                  : 'Part 1: Foundations & Core Concepts',
              level: lvl,
              title: m.title,
              objectives: Array.isArray(m.objectives) ? m.objectives : [],
              summary: m.summary || '',
              practiceExercises: Array.isArray(m.practiceExercises) ? m.practiceExercises : [],
              videoIds: finalVideoIds,
              recommendedVideos: finalVideoIds.map((vid: string) => videoById.get(vid)).filter(Boolean),
              miniQuizQuestion: m.miniQuizQuestion,
            };
          }),
        };

        organizeCourseCache.set(cacheKey, { ts: Date.now(), path: organizedPath });
        return res.json({ path: organizedPath });
      }
    } catch (err: any) {
      console.warn('Gemini organize-course unavailable, returning Built-In Engine path:', err?.message || err);
    }

    const fallbackPath = buildBuiltInStructuredCoursePath();
    organizeCourseCache.set(cacheKey, { ts: Date.now(), path: fallbackPath });
    return res.json({ path: fallbackPath });
  });

  // ------------------------------------------------------------------
  // Quinn AI Intelligent Education Discovery & 8-Category Recommendation + Roadmap
  // ------------------------------------------------------------------
  app.post('/api/quinn/discover-and-recommend', async (req, res) => {
    const {
      query = '',
      studentProfile = null,
      filters = {},
      maxPerGroup = 4,
    } = req.body || {};

    const rawQuery = String(query || '').trim();
    const intent = parseEducationalIntent(rawQuery, studentProfile);
    const index = getBaseCatalogIndex();
    const excludeSet = new Set<string>();
    const perGroup = Math.min(8, Math.max(2, Number(maxPerGroup) || 4));

    const intentTerms = Array.from(
      new Set([
        ...(intent.intentPriorityTerms || []).map((t) => t.toLowerCase()),
        ...(intent.searchKeywords || []).map((t) => t.toLowerCase()),
      ])
    ).filter((t) => t.length >= 2);

    const degreeLower = (intent.degreeOrClass || '').toLowerCase();
    const profileSkills = Array.isArray(studentProfile?.skills)
      ? (studentProfile.skills as string[]).map((s) => s.toLowerCase())
      : [];

    // Respect optional explicit filters while ranking by current query intent first
    const baseFiltered = filterBaseIndex(
      {
        ...filters,
        query: '', // Score ourselves so conversational sentences never return 0 strict AND hits
        status: filters.status || 'Published',
      },
      excludeSet
    );
    const candidatePool = baseFiltered.length > 0 ? baseFiltered : index.items.map((i) => i.course);

    const expandedDiscover = normalizeAndExpandQuery(rawQuery || intent.cleanedQuery || '');
    const scoreCourse = (course: MarketplaceCourse) => {
      const subjectBlob = [
        course.title,
        course.category,
        ...(course.categories || []),
        course.subcategory,
        course.shortDesc,
        ...(course.keywords || []),
        ...(course.skillsAcquired || []),
      ]
        .join(' ')
        .toLowerCase();

      const levelBlob = [
        ...(course.degreeProgrammes || []),
        ...(course.educationLevels || []),
      ]
        .join(' ')
        .toLowerCase();

      const titleLower = course.title.toLowerCase();
      const catLower = course.category.toLowerCase();
      const subLower = (course.subcategory || '').toLowerCase();

      let searchScore = 0;
      if (rawQuery.trim().length > 0) {
        searchScore += scoreSearchMatch(
          {
            id: course.id,
            aliasId: course.aliasId,
            title: course.title,
            category: course.category,
            categories: course.categories,
            subcategory: course.subcategory,
            topic: course.topic,
            keywords: course.keywords,
            skills: course.skillsAcquired,
            shortDesc: course.shortDesc,
            instructorName: course.instructorName || course.instructor?.name,
            youtubeChannelName: course.youtubeChannelName,
            language: course.language,
          },
          rawQuery
        );
      }

      const desiredLower = (intent.desiredSkill || '').toLowerCase();
      const subDesired = desiredLower
        .split(/[&,/]+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 2 && s !== 'taxation');

      if (desiredLower && desiredLower.length >= 2 && matchesWordBoundary(subjectBlob, desiredLower)) {
        searchScore += 45;
      }
      for (const sd of subDesired) {
        if (catLower === sd || matchesWordBoundary(catLower, sd)) searchScore += 55;
        else if (matchesWordBoundary(titleLower, sd)) searchScore += 45;
        else if (matchesWordBoundary(subLower, sd)) searchScore += 30;
      }

      for (const term of intentTerms) {
        if (term.length < 2) continue;
        if (catLower === term || matchesWordBoundary(catLower, term)) searchScore += 22;
        else if (matchesWordBoundary(titleLower, term)) searchScore += 18;
        else if (matchesWordBoundary(subLower, term)) searchScore += 12;
        else if (matchesWordBoundary(subjectBlob, term)) searchScore += 6;
      }

      // Bonus for core phrase match
      if (expandedDiscover.corePhrase && matchesWordBoundary(titleLower, expandedDiscover.corePhrase)) {
        searchScore += 40;
      }

      // Degree context bonus (strictly smaller than search intent so current search always wins!)
      let degreeScore = 0;
      if (degreeLower && (levelBlob.includes(degreeLower) || subjectBlob.includes(degreeLower))) {
        degreeScore += 18;
      }
      if (intent.educationLevelCode === 'A') {
        if (/(school education|spoken english|alphabet|phonics|early|kids|story|creative writing)/i.test(subjectBlob)) degreeScore += 28;
        if (course.level === 'Beginner' || course.level === 'All Levels') degreeScore += 12;
        if (/(machine learning|deep learning|distributed networks|industrial capstone|enterprise implementation|devsecops|business meeting|auth & security|high-performance system|high-impact resumes|high-impact)/i.test(titleLower)) {
          searchScore -= 150;
        }
      }
      if (intent.educationLevelCode === 'B') {
        if (/(school education|mathematics|science|spoken english|foundation|fractions)/i.test(subjectBlob)) degreeScore += 24;
        if (course.level === 'Beginner' || course.level === 'All Levels') degreeScore += 10;
        if (/(machine learning|deep learning|devsecops|enterprise implementation|business meeting|auth & security)/i.test(titleLower)) {
          searchScore -= 120;
        }
      }
      if ((intent.educationLevelCode === 'C' || intent.educationLevelCode === 'D') && /(science|math|physics|chemistry|biology|coding|school education)/i.test(subjectBlob)) degreeScore += 16;
      if (intent.educationLevelCode === 'E' && /(accounting|economics|commerce|physics|chemistry|math|puc|finance)/i.test(subjectBlob)) degreeScore += 16;
      if (degreeLower.includes('bca') && /(programming|web|software|python|digital|database|ai|it)/i.test(subjectBlob)) degreeScore += 14;
      if (degreeLower.includes('bcom') && /(accounting|finance|excel|commerce|python|analytics|gst|tally)/i.test(subjectBlob)) degreeScore += 14;
      if (degreeLower.includes('mba') && /(finance|management|leadership|strategy|marketing|analytics)/i.test(subjectBlob)) degreeScore += 14;
      if ((degreeLower.includes('btech') || degreeLower.includes('engineering')) && /(engineering|ai|machine learning|python|robotics|cloud|iot)/i.test(subjectBlob)) degreeScore += 14;
      if ((intent.educationLevelCode === 'H' || intent.educationLevelCode === 'I') && /(research|statistics|analytics|academic|writing|python|data|finance)/i.test(subjectBlob)) degreeScore += 16;

      let profileBonus = 0;
      for (const sk of profileSkills) {
        if (subjectBlob.includes(sk)) profileBonus += 5;
      }

      const popularityBoost = Math.min(6, Math.floor((course.enrolledCount || 0) / 20000));
      const totalScore = searchScore * 2 + degreeScore + profileBonus + popularityBoost;
      return { course, searchScore, degreeScore, totalScore };
    };

    const scored = candidatePool
      .map(scoreCourse)
      .sort((a, b) => b.totalScore - a.totalScore);

    const pickDistinct = (
      predicate: (s: ReturnType<typeof scoreCourse>) => boolean,
      categoryId: string,
      makeWhy: (s: ReturnType<typeof scoreCourse>) => string,
      limitCount = perGroup
    ) => {
      const seenTitles = new Set<string>();
      const items: ReturnType<typeof scoreCourse>[] = [];
      for (const s of scored) {
        if (!predicate(s)) continue;
        const normTitle = s.course.title.trim().toLowerCase();
        if (seenTitles.has(normTitle)) continue;
        seenTitles.add(normTitle);
        items.push(s);
        if (items.length >= limitCount) break;
      }
      return items.map((s) => ({
        course: s.course,
        whyRecommended: makeWhy(s),
        matchScore: s.totalScore,
        recommendationCategory: categoryId,
      }));
    };

    const topicLabel = intent.desiredSkill || intent.cleanedQuery || 'Core Foundations';
    const eduBadge = intent.degreeOrClass || intent.educationLevelLabel || 'Your Learning Goal';

    const recommendedForYou = pickDistinct(
      (s) => s.searchScore > 0 || scored.indexOf(s) < 12,
      'recommended_for_you',
      () =>
        `Prioritizes your current goal "${topicLabel}"${intent.degreeOrClass ? ` while adapting pacing for ${intent.degreeOrClass}` : ''}.`
    );

    const relatedToDegree = pickDistinct(
      (s) => s.degreeScore > 0 || (degreeLower ? s.course.categoryGroup === 'Academic' || s.course.categoryGroup === 'Business' || s.course.categoryGroup === 'Technology' : true),
      'related_to_degree',
      (s) => `Aligned with ${eduBadge} academic and practical competencies (${s.course.category}).`
    );

    const relatedToSearch = pickDistinct(
      (s) => s.searchScore > 0,
      'related_to_search',
      () => `Direct curriculum match for "${rawQuery || topicLabel}".`
    );

    const careerDevelopment = pickDistinct(
      (s) => s.course.isCareerTrack || s.course.categoryGroup === 'Professional' || s.course.categoryGroup === 'Business',
      'career_development',
      () => `Builds workplace readiness, interview confidence, and portfolio proof alongside ${topicLabel}.`
    );

    const additionalSkills = pickDistinct(
      (s) => s.searchScore > 0 || s.course.category === 'Communication Skills' || s.course.category === 'Data Analytics' || s.course.category.includes('Excel'),
      'additional_skills',
      () => `High-leverage complementary skill that multiplies your career edge with ${topicLabel}.`
    );

    const beginnerCourses = pickDistinct(
      (s) => (s.course.level === 'Beginner' || s.course.level === 'All Levels') && (s.searchScore > 0 || scored.indexOf(s) < 40),
      'beginner_courses',
      () => `Accessible entry point with step-by-step foundations in ${topicLabel}.`
    );

    const advancedCourses = pickDistinct(
      (s) => s.course.level === 'Advanced' || s.course.level === 'Intermediate',
      'advanced_courses',
      () => `Applied capstone and deeper mastery track once you finish core ${topicLabel} basics.`
    );

    // Fetch real YouTube educational videos (live YouTube discovery + curated topic fallback)
    let youtubeResources = selectCuratedFallbackVideos(`${expandedDiscover.corePhrase || topicLabel} ${intent.degreeOrClass || ''}`, '').map((v) => ({
      ...v,
      detectedLanguage: intent.preferredLanguage || 'English',
      embeddable: true,
    }));
    let youtubeSource = 'curated_library';

    if (topicLabel) {
      try {
        const ytPage = await youtubeDiscoveryEngine.discoverPage({
          query: `${expandedDiscover.corePhrase || topicLabel} ${intent.educationLevelCode === 'A' || intent.educationLevelCode === 'B' ? intent.degreeOrClass || '' : ''} tutorial`,
          category: intent.primarySubject || 'Education',
          languageLabel: intent.preferredLanguage || 'English',
          searchType: 'video',
          maxResults: 6,
        });
        if (ytPage.items.length > 0) {
          youtubeSource = process.env.YOUTUBE_API_KEY ? 'youtube_data_api' : 'youtube_public_search';
          youtubeResources = ytPage.items.map((item) => ({
            id: item.youtubeVideoId || item.id,
            videoId: item.youtubeVideoId || '',
            youtubeId: item.youtubeVideoId || '',
            youtubeUrl: item.youtubeVideoId ? `https://www.youtube.com/watch?v=${item.youtubeVideoId}` : undefined,
            title: item.title,
            channelTitle: item.youtubeChannelName,
            thumbnail: item.thumbnailUrl,
            thumbnailUrl: item.thumbnailUrl,
            duration: item.duration || 'Tutorial',
            level: item.level === 'All Levels' ? 'Beginner' : item.level,
            recommendedReason: `External YouTube lecture supporting ${topicLabel} mastery.`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${item.youtubeVideoId}`,
            source: 'External YouTube Resource',
          }));
        }
      } catch (err) {
        console.warn('Discover endpoint YouTube lookup fallback:', err);
      }
    }

    // Build 8-Stage Visual Learning Roadmap
    const stageTemplates = [
      { title: `Orientation & Foundations of ${topicLabel}`, dur: 'Week 1 · 3–4 hrs', focus: 'Core terminology, mental models, and why the discipline matters.' },
      { title: `Core Concepts & Key Principles`, dur: 'Week 2 · 4–5 hrs', focus: `Structured breakdown of essential frameworks in ${topicLabel}.` },
      { title: `Tools, Workflows & Guided Exercises`, dur: 'Week 3 · 5 hrs', focus: `Hands-on walkthroughs applying ${topicLabel} step by step.` },
      { title: `Applied Practice & Problem Solving`, dur: 'Week 4 · 5–6 hrs', focus: 'Worked examples and practice scenarios tuned to real questions.' },
      { title: `Intermediate Techniques & Strategy`, dur: 'Week 5 · 6 hrs', focus: 'Analytical workflows, optimization patterns, and edge cases.' },
      { title: `Cross-Disciplinary Application${intent.degreeOrClass ? ` for ${intent.degreeOrClass}` : ''}`, dur: 'Week 6 · 6 hrs', focus: `Connecting ${topicLabel} directly to ${eduBadge} projects.` },
      { title: `Portfolio Mini-Project & Peer Review`, dur: 'Week 7 · 6–8 hrs', focus: 'Complete an independent build or analytical report.' },
      { title: `Capstone Verification & Career Readiness`, dur: 'Week 8 · 5 hrs', focus: 'Verification quiz, presentation defense, and next-level goals.' },
    ];

    const stages = stageTemplates.map((st, idx) => {
      const courseSlice = (idx < 3 ? beginnerCourses : idx < 6 ? recommendedForYou : advancedCourses)
        .slice(idx % 2, (idx % 2) + 2)
        .map((r) => r.course.id);
      const vid = youtubeResources[idx % Math.max(1, youtubeResources.length)];
      return {
        stageNumber: idx + 1,
        title: st.title,
        focusSummary: st.focus,
        estimatedDuration: st.dur,
        topics: [
          `${topicLabel} Stage ${idx + 1} Core Ideas`,
          idx < 4 ? 'Concept Drills & Walkthroughs' : 'Applied Case Scenarios',
        ],
        milestoneAssignment: `Stage ${idx + 1} Milestone: Complete practice deliverable & 5-minute summary for "${st.title}".`,
        recommendedCourseIds: courseSlice,
        youtubeResources: vid ? [vid] : [],
      };
    });

    const relatedSkills = Array.from(
      new Set([
        topicLabel,
        ...scored.slice(0, 8).flatMap((s) => s.course.skillsAcquired || [s.course.category]),
        'Communication Skills',
        'Problem Solving',
      ])
    ).slice(0, 10);

    trackSearchQuery(rawQuery || topicLabel, intent.preferredLanguage || 'English', scored.filter((s) => s.searchScore > 0).length);

    return res.json({
      parsedIntent: intent,
      recommendationGroups: [
        { id: 'recommended_for_you', title: 'Recommended for You', subtitle: `Prioritizing "${topicLabel}" tailored to ${eduBadge}`, courses: recommendedForYou },
        { id: 'related_to_degree', title: 'Related to Your Degree / Level', subtitle: `Academic alignment for ${eduBadge}`, courses: relatedToDegree },
        { id: 'related_to_search', title: 'Related to Your Search', subtitle: `Closest curriculum matches for "${rawQuery || topicLabel}"`, courses: relatedToSearch },
        { id: 'career_development', title: 'Career Development', subtitle: 'Workplace skills, communication & interview preparation', courses: careerDevelopment },
        { id: 'additional_skills', title: 'Additional Complementary Skills', subtitle: 'Cross-functional capabilities that stand out', courses: additionalSkills },
        { id: 'beginner_courses', title: 'Beginner Courses', subtitle: 'Start cleanly with structured prerequisites', courses: beginnerCourses },
        { id: 'advanced_courses', title: 'Advanced & Applied Courses', subtitle: 'Deep specialization & real-world capstones', courses: advancedCourses },
      ],
      youtubeResources,
      youtubeSource,
      relatedSkills,
      totalMatchedCourses: scored.filter((s) => s.searchScore > 0).length || recommendedForYou.length,
      roadmap: {
        id: `roadmap-${Date.now().toString(36)}`,
        topic: topicLabel,
        targetOutcome: `Build confident practical mastery in ${topicLabel}${intent.degreeOrClass ? ` as a ${intent.degreeOrClass} learner` : ''}`,
        educationContext: eduBadge,
        totalEstimatedDuration: '8 Weeks · Self-Paced (~40 Hours)',
        stages,
        nonDegreeDisclaimer: 'Self-paced OpenFrame Skill Roadmap for guided learning & OpenFrame course certification — not an accredited university degree programme.',
        generatedBy: 'structured_engine',
        createdAt: new Date().toISOString(),
      },
    });
  });

  // ------------------------------------------------------------------
  // Quinn AI Academic & Skill Q&A Endpoint (Structured Sections A-F)
  // ------------------------------------------------------------------
  app.post('/api/quinn/qa', async (req, res) => {
    const { question = '', studentProfile = null, educationContext = '', language = 'English' } = req.body || {};
    const cleanQ = String(question || '').trim();
    if (!cleanQ) {
      return res.status(400).json({ error: 'Please provide an academic or skill question.' });
    }

    const intent = parseEducationalIntent(cleanQ, studentProfile);
    const effectiveContext = String(educationContext || intent.degreeOrClass || intent.educationLevelLabel || 'General Learner');
    const topicLabel = intent.desiredSkill || intent.primarySubject || cleanQ;
    const effectiveLang =
      language && language !== 'auto' && language !== 'Auto-Detect Language'
        ? String(language)
        : intent.preferredLanguage || 'English';

    // Match real catalog courses
    const index = getBaseCatalogIndex();
    const terms = (intent.intentPriorityTerms || []).map((t) => t.toLowerCase()).filter((t) => t.length >= 2);
    const matchedCourses = index.items
      .filter((i) => i.course.status === 'Published')
      .map((i) => {
        const score = terms.reduce((acc, term) => (i.searchBlob.includes(term) ? acc + 10 : acc), 0);
        return { course: i.course, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((m) => ({
        course: m.course,
        rationale: `Recommended to explore "${topicLabel}" through structured OpenFrame lessons and quizzes.`,
      }));

    // Real YouTube videos
    let youtubeVideos = selectCuratedFallbackVideos(cleanQ, topicLabel).map((v) => ({
      ...v,
      source: 'External YouTube Resource',
      embeddable: true,
    }));
    const quota = youtubeDiscoveryEngine.getQuotaStatus();
    if (quota.apiKeyConfigured) {
      try {
        const ytPage = await youtubeDiscoveryEngine.discoverPage({
          query: `${topicLabel} explained tutorial`,
          category: intent.primarySubject || 'Education',
          languageLabel: effectiveLang,
          maxResults: 4,
        });
        if (ytPage.items.length > 0) {
          youtubeVideos = ytPage.items.slice(0, 4).map((item) => ({
            id: item.youtubeVideoId || item.id,
            videoId: item.youtubeVideoId || '',
            youtubeId: item.youtubeVideoId || '',
            title: item.title,
            channelTitle: item.youtubeChannelName,
            thumbnail: item.thumbnailUrl,
            thumbnailUrl: item.thumbnailUrl,
            duration: item.duration || 'N/A',
            level: item.level === 'All Levels' ? 'Beginner' : item.level,
            recommendedReason: `External YouTube lecture covering ${topicLabel}.`,
            embedUrl: `https://www.youtube-nocookie.com/embed/${item.youtubeVideoId}`,
            source: 'External YouTube Resource',
          }));
        }
      } catch (err) {
        console.warn('Q&A YouTube lookup fallback:', err);
      }
    }

    const fallbackResponse = {
      question: cleanQ,
      subject: intent.primarySubject || 'General Studies',
      topic: topicLabel,
      educationContext: effectiveContext,
      language: effectiveLang,
      answer: `${topicLabel} can be understood clearly by separating its core definition, how it operates in practice, and when learners at the ${effectiveContext} level apply it. Start by anchoring the foundational vocabulary, inspect a concrete real-world example, and verify understanding with short active-recall checks.`,
      examples: [
        `Real-world application of ${topicLabel}: breaking a practical problem into clear inputs, governing rules, and measurable outcomes.`,
        `Study application for ${effectiveContext}: mapping core principles of ${topicLabel} directly onto exam problems or portfolio deliverables.`,
      ],
      keyTakeaways: [
        `Anchor core definitions and terminology of ${topicLabel} before moving to complex variations.`,
        `Verify every concept with at least one worked example or hands-on exercise.`,
        `Pair conceptual Q&A with a structured OpenFrame course for certification readiness.`,
      ],
      relatedConcepts: [
        `${topicLabel} Fundamentals`,
        `Applied ${intent.primarySubject || topicLabel}`,
        'Problem Solving & Quantitative Reasoning',
        'Practical Case Analysis',
      ],
      recommendedCourses: matchedCourses,
      youtubeVideos,
      suggestedLearningPathTitle: `${topicLabel} — Step-by-Step Study Path`,
      suggestedLearningPathSteps: [
        `Step 1: Review conceptual overview and core definitions of ${topicLabel}`,
        `Step 2: Watch the curated video lecture & write 3 summary bullets`,
        `Step 3: Enroll in a structured OpenFrame ${topicLabel} course for practice & verification`,
      ],
      practiceQuiz: [
        {
          id: 'qa-q1',
          question: `When mastering ${topicLabel} for the first time, what approach builds the strongest long-term recall?`,
          options: [
            'Combining conceptual explanation with worked examples and active self-testing',
            'Memorizing definitions without checking real examples',
            'Skipping foundational concepts to attempt advanced problems immediately',
            'Avoiding practice exercises after reading notes',
          ],
          correctIndex: 0,
          explanation: 'Connecting core intuition, real examples, and active-recall quizzes ensures transferable understanding.',
        },
        {
          id: 'qa-q2',
          question: `Which next step turns conceptual understanding of ${topicLabel} into verified competency?`,
          options: [
            'Applying the concept inside a structured lesson, quiz, or small practical project',
            'Closing the notes without testing comprehension',
            'Reading unrelated topics simultaneously',
            'Ignoring prerequisite concepts',
          ],
          correctIndex: 0,
          explanation: 'Applied exercises and verification quizzes validate practical mastery.',
        },
      ],
      generatedBy: 'structured_engine',
      honestyNote: 'Educational synthesis powered by OpenFrame Discovery Engine. External YouTube resources are linked for supplementary viewing; no external academic citations fabricated.',
    };

    const ai = getGeminiClient();
    if (!ai) {
      return res.json(fallbackResponse);
    }

    try {
      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `You are Quinn AI, the Educational Mentor for OpenFrame Education.
Answer the following learner question clearly, accurately, and at an appropriate depth for their educational level.

Learner Question: "${cleanQ}"
Learner Education Context: "${effectiveContext}"
Preferred Language: "${effectiveLang}"

STRICT GROUNDING & HONESTY RULES:
- Never invent or fabricate academic paper citations, DOIs, or external URLs.
- Give a crisp, accurate, structured educational explanation with 2 concrete real-world examples.
- Include 4 related concepts, 3 key takeaways, 3 suggested study steps, and 2 multiple-choice practice questions.`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  subject: { type: Type.STRING },
                  topic: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
                  relatedConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
                  suggestedLearningPathTitle: { type: Type.STRING },
                  suggestedLearningPathSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
                  practiceQuiz: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctIndex: { type: Type.NUMBER },
                        explanation: { type: Type.STRING },
                      },
                      required: ['question', 'options', 'correctIndex', 'explanation'],
                    },
                  },
                },
                required: ['subject', 'topic', 'answer', 'examples', 'keyTakeaways', 'relatedConcepts', 'suggestedLearningPathTitle', 'suggestedLearningPathSteps', 'practiceQuiz'],
              },
            },
          }),
        8500,
        'quinn-qa'
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      if (parsed && parsed.answer) {
        return res.json({
          ...fallbackResponse,
          subject: parsed.subject || fallbackResponse.subject,
          topic: parsed.topic || fallbackResponse.topic,
          answer: parsed.answer,
          examples: Array.isArray(parsed.examples) && parsed.examples.length > 0 ? parsed.examples : fallbackResponse.examples,
          keyTakeaways: Array.isArray(parsed.keyTakeaways) && parsed.keyTakeaways.length > 0 ? parsed.keyTakeaways : fallbackResponse.keyTakeaways,
          relatedConcepts: Array.isArray(parsed.relatedConcepts) && parsed.relatedConcepts.length > 0 ? parsed.relatedConcepts : fallbackResponse.relatedConcepts,
          suggestedLearningPathTitle: parsed.suggestedLearningPathTitle || fallbackResponse.suggestedLearningPathTitle,
          suggestedLearningPathSteps: Array.isArray(parsed.suggestedLearningPathSteps) && parsed.suggestedLearningPathSteps.length > 0 ? parsed.suggestedLearningPathSteps : fallbackResponse.suggestedLearningPathSteps,
          practiceQuiz:
            Array.isArray(parsed.practiceQuiz) && parsed.practiceQuiz.length > 0
              ? parsed.practiceQuiz.map((q: any, i: number) => ({
                  id: `qa-ai-${i + 1}`,
                  question: q.question,
                  options: Array.isArray(q.options) ? q.options.slice(0, 4) : [],
                  correctIndex: Math.max(0, Math.min(3, Number(q.correctIndex) || 0)),
                  explanation: q.explanation || '',
                }))
              : fallbackResponse.practiceQuiz,
          generatedBy: 'gemini',
        });
      }
    } catch (err) {
      console.warn('Gemini quinn-qa warning, returning structured fallback:', err);
    }

    return res.json(fallbackResponse);
  });

  // ------------------------------------------------------------------
  // AI Lesson Summary & Study Guide Generator
  // ------------------------------------------------------------------
  app.post('/api/quinn/lesson-summary', async (req, res) => {
    const {
      courseTitle = 'OpenFrame Course',
      lessonTopic = 'Lesson Concept',
      videoTitle = '',
      language = 'English',
      objectives = [],
    } = req.body || {};

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        source: 'structured_fallback',
        summary: {
          keyTakeaways: [
            `Understand the foundational workflow behind ${lessonTopic} within ${courseTitle}.`,
            `Connect conceptual principles to applied workplace or academic tasks.`,
            `Prepare core definitions and practical examples before the verification quiz.`,
          ],
          studyTips: [
            `Pause the video lecture after each sub-concept and write concise notes in your Lesson Notes tab.`,
            `Bookmark this lesson for quick pre-exam revision.`,
          ],
          disclaimer: 'Generated from lesson topic and metadata (GEMINI_API_KEY fallback summary).',
        },
      });
    }

    try {
      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `You are Quinn AI generating a crisp AI Lesson Summary & Study Guide in "${language}".
Course: "${courseTitle}"
Lesson Topic: "${lessonTopic}"
${videoTitle ? `Reference Video Title (metadata only): "${videoTitle}"` : ''}
Objectives: ${JSON.stringify(objectives)}

Provide 4 concise key takeaways and 3 actionable study/revision tips based strictly on the topic and metadata above.`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
                  studyTips: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['keyTakeaways', 'studyTips'],
              },
            },
          }),
        15000,
        'lesson-summary'
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      return res.json({
        source: 'gemini',
        summary: {
          keyTakeaways: parsed.keyTakeaways || [],
          studyTips: parsed.studyTips || [],
          disclaimer: 'AI-generated study summary created strictly from lesson metadata & topic context.',
        },
      });
    } catch (err) {
      console.warn('Gemini lesson summary warning:', err);
      return res.json({
        source: 'structured_fallback',
        summary: {
          keyTakeaways: [
            `Core concepts and practical workflow for ${lessonTopic}.`,
            `Key terminology and problem-solving patterns covered in ${courseTitle}.`,
          ],
          studyTips: [
            'Review the learning objectives and test yourself with the lesson quiz.',
          ],
          disclaimer: 'Structured fallback summary based on lesson metadata.',
        },
      });
    }
  });

  // ------------------------------------------------------------------
  // Quinn AI Course-Aware Tutor Chat (Supports all capabilities + Child-Safe Minor Mode + Multilingual)
  // ------------------------------------------------------------------
  app.post('/api/quinn/chat', async (req, res) => {
    const {
      message = '',
      courseTitle = '',
      lessonTopic = '',
      language = 'English',
      capabilityMode = 'chat',
      history = [],
      isMinor = false,
    } = req.body || {};
    const ai = getGeminiClient();

    const capabilityPrompts: Record<string, string> = {
      explain_simple: `Explain "${lessonTopic || courseTitle}" in crystal-clear, beginner-friendly language using everyday analogies.`,
      step_by_step: `Break down "${lessonTopic || courseTitle}" step-by-step from foundation to practical execution.`,
      summarize_lesson: `Summarize the essential concepts and key formulas/rules of "${lessonTopic || courseTitle}" concisely.`,
      study_notes: `Create structured bullet-point revision study notes for "${lessonTopic || courseTitle}".`,
      practice_questions: `Generate 4 practice self-check questions with hints and brief solutions for "${lessonTopic || courseTitle}".`,
      recommend_videos: `Suggest what type of YouTube tutorial topics and search phrases the student should explore next after "${lessonTopic || courseTitle}".`,
      study_plan: `Design a focused 7-day daily study schedule to master "${courseTitle || lessonTopic}".`,
      translate_explain: `Translate and clearly explain "${lessonTopic || courseTitle}" in ${language}, keeping standard English technical terms in parentheses.`,
      quiz_prep: `Outline high-yield concepts and common pitfalls to review before taking the verification quiz on "${lessonTopic || courseTitle}".`,
      project_guidance: `Provide architectural guidance and a milestone checklist for the practical capstone project on "${courseTitle}" (without doing graded work).`,
      real_world_examples: `Share 3 practical real-world Indian and global industry applications of "${lessonTopic || courseTitle}".`,
      beginner_bridge: `Identify prerequisite basics needed before diving deeper into "${lessonTopic || courseTitle}".`,
      flashcards: `Create 5 quick Q&A flashcards to memorize core ideas in "${lessonTopic || courseTitle}".`,
      concept_clarify: `Clarify the hardest or most confusing parts of "${lessonTopic || courseTitle}" clearly.`,
      motivational_coach: `Give realistic, encouraging study coaching and momentum strategy for completing "${courseTitle}".`,
      excel_formula_help: `Explain relevant Microsoft Excel / spreadsheet formulas (such as XLOOKUP, VLOOKUP, IF, SUMIFS, PivotTables, or error debugging) for "${lessonTopic || courseTitle}" with step-by-step syntax examples.`,
      code_debugging: `Walk through systematic debugging techniques, common syntax/logic bugs, and clean test verification for "${lessonTopic || courseTitle}".`,
      interview_prep: `Coach the student on likely technical/conceptual interview questions, strong answer frameworks, and common pitfalls for "${lessonTopic || courseTitle}".`,
      mock_test: `Generate a focused 5-question timed mock test (mixed conceptual + applied questions) for "${lessonTopic || courseTitle}" with an answer key separated at the end.`,
    };

    const effectivePrompt =
      capabilityMode && capabilityMode !== 'chat' && capabilityPrompts[String(capabilityMode)]
        ? `${capabilityPrompts[String(capabilityMode)]}${message ? `\nStudent note: ${message}` : ''}`
        : message;

    if (!ai) {
      return res.json({
        source: 'structured_offline_tutor',
        reply: `Quinn AI Mentor Guidance (${language}) for "${lessonTopic || courseTitle}":\n1. Review the lesson objectives and active YouTube video lecture.\n2. Capture key definitions in your Lesson Notes drawer.\n3. Test comprehension using the 15-question verification quiz before unlocking the Practical Capstone.\n*(Configure GEMINI_API_KEY in server Secrets for live conversational AI responses.)*`,
      });
    }

    const minorSafetyRule = isMinor
      ? '\n- CHILD-SAFE / MINOR LEARNER PROTECTION ACTIVE: Use strictly school-safe, encouraging, age-appropriate language suitable for learners under 18. Avoid any adult, financial-speculation, or non-academic advice and remind learners to consult parents/teachers when needed.'
      : '';

    try {
      const historyContext = Array.isArray(history)
        ? history
            .slice(-6)
            .map((m: any) => `${m.role === 'user' ? 'Student' : 'Quinn AI'}: ${m.text}`)
            .join('\n')
        : '';

      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `${historyContext ? `Conversation so far:\n${historyContext}\n\n` : ''}Student Request: ${effectivePrompt}`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              systemInstruction: `You are Quinn AI, the dedicated academic learning assistant inside OpenFrame Education.
You are mentoring a student studying "${courseTitle}", specifically "${lessonTopic}".
Preferred response language: "${language}". If "${language}" is non-English, respond fluently in "${language}" while keeping standard English technical terms clearly alongside in parentheses.
SAFETY & ACCURACY RULES:
- Maintain a supportive, age-appropriate, strictly educational tone.
- Never fabricate citations, external URLs, or unseen video transcripts. Label any conceptual assumptions honestly.
- Guide understanding on lectures, verification quizzes, practical projects, and presentations without completing graded submissions for the student.${minorSafetyRule}`,
            },
          }),
        7500,
        'quinn-chat'
      );

      return res.json({ reply: response.text || 'I am ready to help with your lesson!' });
    } catch (err: any) {
      console.warn('Quinn chat fallback warning:', err?.message || err);
      return res.json({
        source: 'contextual_fallback',
        reply: `I'm Quinn AI, your mentor for "${lessonTopic || courseTitle}". Focus on completing the recommended YouTube video modules first, review the rubric key concepts before attempting your 15-question verification quiz, and ask specific questions about any deliverable if you get stuck.`,
      });
    }
  });

  // ------------------------------------------------------------------
  // Quinn AI Practice Questions Generator (On-Demand Lesson Self-Check)
  // ------------------------------------------------------------------
  app.post('/api/quinn/practice-questions', async (req, res) => {
    const {
      courseTitle = 'Course Study',
      lessonTopic = '',
      language = 'English',
      objectives = [],
    } = req.body || {};

    const topic = String(lessonTopic || courseTitle).trim();
    const fallbackQuestions = [
      {
        question: `Define the primary workflow or problem solved by "${topic}" in practical settings.`,
        hint: `Focus on inputs, core transformation logic, and expected outcomes.`,
        sampleAnswer: `${topic} provides a repeatable methodology to translate raw inputs into structured, verifiable results in ${courseTitle}.`,
        difficulty: 'Basic',
      },
      {
        question: `What is one common mistake learners make when applying "${topic}", and how do you verify against it?`,
        hint: `Think about edge cases, validation checks, or baseline comparisons.`,
        sampleAnswer: `Skipping validation of boundary conditions or source assumptions; always test with a clean control example.`,
        difficulty: 'Intermediate',
      },
      {
        question: `Design a short real-world mini-exercise applying "${topic}" within "${courseTitle}".`,
        hint: `Identify dataset/scenario, key formula/component, and measurable evaluation metric.`,
        sampleAnswer: `Define clear acceptance criteria, implement one end-to-end sample workflow, and compare outputs against rubric benchmarks.`,
        difficulty: 'Applied',
      },
    ];

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ source: 'structured_fallback', questions: fallbackQuestions });
    }

    try {
      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `Generate 4 structured practice self-check questions for a student learning "${topic}" inside "${courseTitle}".
Respond in "${language}". Objectives: ${Array.isArray(objectives) ? objectives.join('; ') : ''}.
Do NOT invent claims about unseen video captions. Keep each question concise, educational, and provide a helpful hint + concise sample answer.`,
            config: {
              abortSignal,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  questions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: { type: Type.STRING },
                        hint: { type: Type.STRING },
                        sampleAnswer: { type: Type.STRING },
                        difficulty: { type: Type.STRING },
                      },
                      required: ['question', 'hint', 'sampleAnswer', 'difficulty'],
                    },
                  },
                },
                required: ['questions'],
              },
            },
          }),
        15000,
        'practice-questions'
      );
      const parsed = JSON.parse(response.text || '{}');
      const items = Array.isArray(parsed.questions) && parsed.questions.length > 0 ? parsed.questions : fallbackQuestions;
      return res.json({ source: 'gemini_practice_questions', questions: items });
    } catch {
      return res.json({ source: 'structured_fallback', questions: fallbackQuestions });
    }
  });

  // ------------------------------------------------------------------
  // Quinn AI Universal Category Recommendation Engine (Section 3 & Admin)
  // ------------------------------------------------------------------
  app.post('/api/quinn/recommend-category', async (req, res) => {
    const {
      title = '',
      description = '',
      availableCategories = [],
    } = req.body || {};

    const combinedText = `${title} ${description}`.toLowerCase();
    const fallbackMatch = (): { primaryCategory: string; subcategory: string; additionalCategories: string[]; reason: string } => {
      const catList = Array.isArray(availableCategories) && availableCategories.length > 0 ? availableCategories : [
        'Artificial Intelligence',
        'Information Technology',
        'Coding & Programming',
        'Business Management & Entrepreneurship',
        'Finance & Accounting',
        'Excel & Data Analytics',
        'Digital Marketing',
        'Graphic Designing & Media',
        'Communication & Personality Development',
        'School Education (Class 1–12)',
        'Robotics & STEM',
        'Parenting & Wellbeing',
      ];
      let matched = catList[0];
      if (/excel|spreadsheet|pivot|xlookup|data analy/i.test(combinedText)) matched = catList.find((c) => /excel|data/i.test(c)) || matched;
      else if (/python|react|javascript|coding|program|web dev|software/i.test(combinedText)) matched = catList.find((c) => /coding|program|information tech/i.test(c)) || matched;
      else if (/ai|machine learn|deep learn|neural|gpt|llm/i.test(combinedText)) matched = catList.find((c) => /artificial intelligence/i.test(c)) || matched;
      else if (/finance|account|tax|gst|tally|invest|microeconom/i.test(combinedText)) matched = catList.find((c) => /finance|account|business/i.test(c)) || matched;
      else if (/marketing|seo|social media|brand|sales/i.test(combinedText)) matched = catList.find((c) => /marketing/i.test(c)) || matched;
      else if (/graphic|photoshop|figma|video edit|design/i.test(combinedText)) matched = catList.find((c) => /graphic|design/i.test(c)) || matched;
      else if (/speak|english|communication|interview|personality|motivation/i.test(combinedText)) matched = catList.find((c) => /communication|personality/i.test(c)) || matched;
      else if (/class |ncert|cbse|physics|chemistry|math|school/i.test(combinedText)) matched = catList.find((c) => /school|academ/i.test(c)) || matched;
      else if (/robot|arduino|iot|stem/i.test(combinedText)) matched = catList.find((c) => /robot|stem/i.test(c)) || matched;

      return {
        primaryCategory: matched,
        subcategory: title.split(/[:\-–]/)[0].trim().slice(0, 48) || matched,
        additionalCategories: [matched],
        reason: `Matched course metadata keywords against OpenFrame's universal taxonomy.`,
      };
    };

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ source: 'keyword_heuristic', ...fallbackMatch() });
    }

    try {
      const catChoices = Array.isArray(availableCategories) && availableCategories.length > 0
        ? availableCategories.slice(0, 60)
        : ['Artificial Intelligence', 'Coding & Programming', 'Excel & Data Analytics', 'Business Management & Entrepreneurship', 'Finance & Accounting', 'Digital Marketing', 'Graphic Designing & Media', 'Communication & Personality Development', 'School Education (Class 1–12)', 'Robotics & STEM'];

      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `Classify this OpenFrame Education course into the best matching category from the list below.
Course Title: "${title}"
Description: "${description}"
Allowed Categories: ${catChoices.join(', ')}`,
            config: {
              abortSignal,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  primaryCategory: { type: Type.STRING },
                  subcategory: { type: Type.STRING },
                  additionalCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
                  reason: { type: Type.STRING },
                },
                required: ['primaryCategory', 'subcategory', 'additionalCategories', 'reason'],
              },
            },
          }),
        15000,
        'recommend-category'
      );
      const parsed = JSON.parse(response.text || '{}');
      return res.json({ source: 'gemini_category_classifier', ...fallbackMatch(), ...parsed });
    } catch {
      return res.json({ source: 'keyword_heuristic', ...fallbackMatch() });
    }
  });

  // ------------------------------------------------------------------
  // Module 11: Honest Email Notification Hook (Nodemailer SMTP / Webhook)
  // ------------------------------------------------------------------
  app.post('/api/notifications/email', async (req, res) => {
    const rawBody = req.body || {};
    const recipientEmail = String(rawBody.recipientEmail || rawBody.to || '').trim();
    const recipientName = String(rawBody.recipientName || '').trim();
    const subject = String(rawBody.subject || '').trim();
    const message = String(rawBody.message || rawBody.body || '').trim();
    const type = String(rawBody.type || 'notification');
    const actionUrl = String(rawBody.actionUrl || '');

    if (!recipientEmail || !subject) {
      return res.status(400).json({ error: 'recipientEmail and subject are required.' });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpFrom = process.env.SMTP_FROM || 'no-reply@openframeitsolutions.com';

    if (smtpHost && smtpUser && smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });
        const info = await transporter.sendMail({
          from: smtpFrom,
          to: recipientName ? `"${recipientName}" <${recipientEmail}>` : recipientEmail,
          subject,
          text: `${message}${actionUrl ? `\n\nAction Link: ${actionUrl}` : ''}`,
        });
        return res.json({
          dispatched: true,
          channel: 'smtp',
          messageId: info.messageId,
          timestamp: new Date().toISOString(),
        });
      } catch {
        return res.status(502).json({
          dispatched: false,
          channel: 'smtp_error',
          error: 'SMTP server unreachable or invalid; saved to in-app feed only.',
          timestamp: new Date().toISOString(),
        });
      }
    }

    const webhookUrl = process.env.NOTIFICATION_EMAIL_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const whResp = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientEmail, recipientName, subject, message, type, actionUrl }),
          signal: AbortSignal.timeout(5000),
        });
        return res.json({
          dispatched: whResp.ok,
          channel: 'webhook',
          timestamp: new Date().toISOString(),
        });
      } catch (err: any) {
        return res.status(502).json({
          dispatched: false,
          channel: 'webhook_error',
          error: err?.message || 'Webhook delivery failed.',
          timestamp: new Date().toISOString(),
        });
      }
    }

    return res.json({
      dispatched: false,
      channel: 'in_app_only',
      note: 'SMTP email provider not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS to enable live email delivery).',
      timestamp: new Date().toISOString(),
    });
  });

  // ------------------------------------------------------------------
  // RAZORPAY PAYMENT GATEWAY & INSTITUTIONAL SCHOOL PARTNER APIs
  // ------------------------------------------------------------------
  app.get('/api/payments/razorpay/config', (_req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    return res.json({
      ok: true,
      gateway: 'razorpay',
      configured: Boolean(keyId && keySecret),
      keyId: keyId && keySecret ? keyId : null,
      currency: 'INR',
      note: keyId && keySecret
        ? 'Razorpay server-side verification active.'
        : 'Razorpay credentials not configured. Authorized offline/bank challan ledger entry remains available.',
    });
  });

  app.post('/api/payments/razorpay/order', async (req, res) => {
    const caller = await verifyFirebaseBearerToken(req);
    if (!caller) {
      return res.status(401).json({ error: 'Valid Firebase authentication token required.' });
    }

    const { amountInr, receipt, institutionId, purpose, notes, courseId } = req.body || {};
    const numAmount = Number(amountInr);
    if (!Number.isFinite(numAmount) || numAmount <= 0 || numAmount > 10000000) {
      return res.status(400).json({ error: 'Valid positive amountInr is required.' });
    }
    const effectiveInstitutionId =
      typeof institutionId === 'string' && institutionId.trim()
        ? institutionId.trim()
        : 'OPENFRAME_MARKETPLACE';

    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!keyId || !keySecret) {
      return res.status(503).json({
        ok: false,
        configured: false,
        error: 'Razorpay credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are not configured on the server.',
      });
    }

    try {
      const authBasic = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const rzpResp = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authBasic}`,
        },
        body: JSON.stringify({
          amount: Math.round(numAmount * 100),
          currency: 'INR',
          receipt: String(receipt || `OFRCP_${Date.now()}`).slice(0, 40),
          notes: {
            institutionId: String(effectiveInstitutionId).slice(0, 80),
            courseId: courseId ? String(courseId).slice(0, 80) : undefined,
            purpose: String(purpose || 'Course Enrollment Fee').slice(0, 120),
            requestedByUid: caller.uid,
            ...(notes && typeof notes === 'object' ? notes : {}),
          },
        }),
        signal: AbortSignal.timeout(8000),
      });
      const data = (await rzpResp.json()) as any;
      if (!rzpResp.ok) {
        return res.status(rzpResp.status).json({
          ok: false,
          error: data?.error?.description || 'Failed to create Razorpay order.',
        });
      }
      return res.json({ ok: true, keyId, order: data });
    } catch (err: any) {
      return res.status(502).json({
        ok: false,
        error: err?.message || 'Razorpay gateway request failed.',
      });
    }
  });

  app.post('/api/payments/razorpay/verify', async (req, res) => {
    const caller = await verifyFirebaseBearerToken(req);
    if (!caller) {
      return res.status(401).json({ error: 'Valid Firebase authentication token required.' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        verified: false,
        error: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!keySecret) {
      return res.status(503).json({
        verified: false,
        error: 'RAZORPAY_KEY_SECRET is not configured on the server.',
      });
    }

    const expectedHex = crypto
      .createHmac('sha256', keySecret)
      .update(`${String(razorpay_order_id)}|${String(razorpay_payment_id)}`)
      .digest('hex');

    const providedBuf = Buffer.from(String(razorpay_signature).toLowerCase(), 'utf8');
    const expectedBuf = Buffer.from(expectedHex.toLowerCase(), 'utf8');
    const isMatch =
      providedBuf.length === expectedBuf.length &&
      crypto.timingSafeEqual(providedBuf, expectedBuf);

    if (!isMatch) {
      return res.status(400).json({
        verified: false,
        error: 'Razorpay payment signature verification failed.',
      });
    }

    const verifiedAt = new Date().toISOString();
    const tokenPayload = `${String(razorpay_order_id)}|${String(razorpay_payment_id)}|${caller.uid}|${verifiedAt}`;
    const enrollmentVerificationToken = crypto
      .createHmac('sha256', keySecret)
      .update(tokenPayload)
      .digest('hex');

    return res.json({
      verified: true,
      orderId: String(razorpay_order_id),
      paymentId: String(razorpay_payment_id),
      verifiedByUid: caller.uid,
      verifiedAt,
      enrollmentVerificationToken,
    });
  });

  app.post('/api/enrollments/verify-payment', async (req, res) => {
    const caller = await verifyFirebaseBearerToken(req);
    if (!caller) {
      return res.status(401).json({ ok: false, verified: false, error: 'Authentication required.' });
    }
    const { orderId, paymentId, verifiedAt, token } = req.body || {};
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
    if (!keySecret || !orderId || !paymentId || !verifiedAt || !token) {
      return res.status(400).json({ ok: false, verified: false, error: 'Missing payment verification fields.' });
    }
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${String(orderId)}|${String(paymentId)}|${caller.uid}|${String(verifiedAt)}`)
      .digest('hex');
    const a = Buffer.from(String(token).toLowerCase(), 'utf8');
    const b = Buffer.from(expected.toLowerCase(), 'utf8');
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!valid) {
      return res.status(403).json({ ok: false, verified: false, error: 'Invalid enrollment payment token.' });
    }
    return res.json({ ok: true, verified: true, orderId, paymentId, uid: caller.uid });
  });

  // ------------------------------------------------------------------
  // STUDY ON YOUR OWN SELF — Chapter PDF Notes, 30-Question Exam & IQ/EQ/SQ
  // ------------------------------------------------------------------
  app.post('/api/self-study/analyze-chapter', async (req, res) => {
    const {
      boardId = 'KAR_STATE',
      boardName = 'Karnataka State Board (KTBS/KSEAB)',
      levelLabel = '3. Middle School (Class 6 to Class 8)',
      classOrDepartment = 'Class 8 (8th Standard)',
      gradeBand = 'Middle (6-8)',
      subject = 'Science',
      chapterTitle = 'Force and Pressure',
      videoTitle = '',
      language = 'English',
      mode = 'pdf_notes',
      useAi = true,
    } = req.body || {};

    const safeChapter = String(chapterTitle || '').trim() || `${String(subject)} Core Chapter`;
    const safeSubject = String(subject || 'Science').trim();
    const safeBoardName = String(boardName || 'Karnataka State Board').trim();
    const safeClass = String(classOrDepartment || 'Class 8').trim();
    const safeLanguage = String(language || 'English').trim();

    if (mode === 'iq_eq_sq') {
      const validBand: IqEqSqGradeBand =
        gradeBand === 'Primary (1-5)' || gradeBand === 'Secondary (9-12)' ? gradeBand : 'Middle (6-8)';
      const bank = buildSubjectContextualIqEqSqBank({
        gradeBand: validBand,
        subject: safeSubject,
        chapterTitle: safeChapter,
      });
      return res.json({
        ok: true,
        mode: 'iq_eq_sq',
        bank,
        disclaimer: NON_CLINICAL_EDUCATIONAL_DISCLAIMER,
        generatedBy: 'structured_engine',
      });
    }

    if (mode === 'pdf_notes') {
      const fallbackNote = buildDeterministicChapterNote({
        boardId: String(boardId),
        boardName: safeBoardName,
        levelLabel: String(levelLabel),
        classOrDepartment: safeClass,
        subject: safeSubject,
        chapterTitle: safeChapter,
        language: safeLanguage,
      });

      const ai = useAi ? getGeminiClient() : null;
      if (!ai) {
        return res.json({ ok: true, mode: 'pdf_notes', note: fallbackNote });
      }

      try {
        trackGeminiCall('/api/self-study/analyze-chapter:pdf_notes');
        const response = await withGeminiTimeout(
          () =>
            ai.models.generateContent({
              model: MODEL_TEXT,
              contents: `Create concise, syllabus-accurate self-study chapter notes for an Indian student.
Board: ${safeBoardName}
Class / Department: ${safeClass}
Subject: ${safeSubject}
Chapter: ${safeChapter}
Language: ${safeLanguage}
Return JSON with:
- overview (3-4 sentences)
- keyDefinitions (array of 5 objects with term and definition)
- formulasOrKeyRules (array of 4 strings)
- quickRevisionChecklist (array of 5 strings)`,
              config: {
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    overview: { type: Type.STRING },
                    keyDefinitions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          term: { type: Type.STRING },
                          definition: { type: Type.STRING },
                        },
                      },
                    },
                    formulasOrKeyRules: { type: Type.ARRAY, items: { type: Type.STRING } },
                    quickRevisionChecklist: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                },
              },
            }),
          10000,
          'Self-Study Chapter PDF Notes'
        );

        const parsed = JSON.parse((response.text || '{}').trim());
        const enrichedNote = {
          ...fallbackNote,
          overview: typeof parsed.overview === 'string' && parsed.overview.length > 40 ? parsed.overview : fallbackNote.overview,
          keyDefinitions:
            Array.isArray(parsed.keyDefinitions) && parsed.keyDefinitions.length >= 3
              ? parsed.keyDefinitions.slice(0, 6)
              : fallbackNote.keyDefinitions,
          formulasOrKeyRules:
            Array.isArray(parsed.formulasOrKeyRules) && parsed.formulasOrKeyRules.length >= 2
              ? parsed.formulasOrKeyRules.slice(0, 6)
              : fallbackNote.formulasOrKeyRules,
          quickRevisionChecklist:
            Array.isArray(parsed.quickRevisionChecklist) && parsed.quickRevisionChecklist.length >= 3
              ? parsed.quickRevisionChecklist.slice(0, 6)
              : fallbackNote.quickRevisionChecklist,
          generatedBy: 'gemini' as const,
          generatedAt: new Date().toISOString(),
        };
        return res.json({ ok: true, mode: 'pdf_notes', note: enrichedNote });
      } catch (err: any) {
        const classified = classifyGeminiError(err);
        trackGeminiCall('/api/self-study/analyze-chapter:pdf_notes', true);
        if (classified.status === 429) {
          geminiQuotaExhaustedUntilMs = Date.now() + extractGeminiRetrySeconds(err) * 1000;
        }
        return res.json({ ok: true, mode: 'pdf_notes', note: fallbackNote });
      }
    }

    // Default / 'thirty_q_exam': Always deliver exactly 30 structured subject questions
    const fallbackQuestions = buildDeterministic30QuestionExam({
      boardName: safeBoardName,
      classOrDepartment: safeClass,
      subject: safeSubject,
      chapterTitle: safeChapter,
      videoTitle: String(videoTitle || ''),
    });

    const ai = useAi ? getGeminiClient() : null;
    if (!ai) {
      return res.json({
        ok: true,
        mode: 'thirty_q_exam',
        questions: fallbackQuestions,
        generatedBy: 'structured_engine',
      });
    }

    try {
      trackGeminiCall('/api/self-study/analyze-chapter:thirty_q_exam');
      const response = await withGeminiTimeout(
        () =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `Generate 10 high-quality syllabus-accurate multiple choice questions for an Indian student after watching a lecture on:
Board: ${safeBoardName}
Class/Department: ${safeClass}
Subject: ${safeSubject}
Chapter: ${safeChapter}
${videoTitle ? `Lecture Video Title: ${String(videoTitle)}` : ''}
Return a JSON array of 10 objects with: questionText, subTopic, cognitiveLevel ("Recall"|"Understanding"|"Application"|"Analysis"), options (exactly 4 strings), correctIndex (0-3), explanation.`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionText: { type: Type.STRING },
                    subTopic: { type: Type.STRING },
                    cognitiveLevel: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.INTEGER },
                    explanation: { type: Type.STRING },
                  },
                },
              },
            },
          }),
        11000,
        'Self-Study 30-Question Analysis'
      );

      const rawList = JSON.parse((response.text || '[]').trim());
      if (Array.isArray(rawList) && rawList.length > 0) {
        const aiValidated = rawList
          .filter(
            (q: any) =>
              q &&
              typeof q.questionText === 'string' &&
              Array.isArray(q.options) &&
              q.options.length === 4 &&
              Number.isInteger(q.correctIndex) &&
              q.correctIndex >= 0 &&
              q.correctIndex <= 3
          )
          .slice(0, 10)
          .map((q: any, idx: number) => ({
            id: `ss-ai-q-${idx + 1}`,
            number: idx + 1,
            questionText: q.questionText.trim(),
            subTopic: String(q.subTopic || `${safeChapter}: Core Concepts`).slice(0, 100),
            cognitiveLevel: (['Recall', 'Understanding', 'Application', 'Analysis'].includes(q.cognitiveLevel)
              ? q.cognitiveLevel
              : 'Understanding') as 'Recall' | 'Understanding' | 'Application' | 'Analysis',
            options: q.options.map((o: any) => String(o)),
            correctIndex: q.correctIndex,
            explanation: String(q.explanation || 'Verified against board syllabus principles.'),
          }));

        // Merge AI questions with remaining structured syllabus questions to guarantee exactly 30 questions
        const merged = [
          ...aiValidated,
          ...fallbackQuestions.slice(aiValidated.length).map((q, idx) => ({
            ...q,
            number: aiValidated.length + idx + 1,
          })),
        ].slice(0, 30);

        return res.json({
          ok: true,
          mode: 'thirty_q_exam',
          questions: merged,
          generatedBy: aiValidated.length > 0 ? 'gemini' : 'structured_engine',
        });
      }
    } catch (err: any) {
      const classified = classifyGeminiError(err);
      trackGeminiCall('/api/self-study/analyze-chapter:thirty_q_exam', true);
      if (classified.status === 429) {
        geminiQuotaExhaustedUntilMs = Date.now() + extractGeminiRetrySeconds(err) * 1000;
      }
    }

    return res.json({
      ok: true,
      mode: 'thirty_q_exam',
      questions: fallbackQuestions,
      generatedBy: 'structured_engine',
    });
  });

  app.post('/api/payments/razorpay/webhook', (req: any, res) => {
    const signature = String(req.headers['x-razorpay-signature'] || '');
    const webhookSecret =
      process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
    if (!webhookSecret) {
      return res.status(503).json({
        ok: false,
        error: 'Razorpay webhook secret is not configured on the server.',
      });
    }
    if (!signature) {
      return res.status(400).json({ ok: false, error: 'Missing x-razorpay-signature header.' });
    }

    const rawBytes: Buffer = Buffer.isBuffer(req.rawBody)
      ? req.rawBody
      : Buffer.from(JSON.stringify(req.body || {}), 'utf8');
    const expectedHex = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBytes)
      .digest('hex');

    const sigBuf = Buffer.from(signature.toLowerCase(), 'utf8');
    const expBuf = Buffer.from(expectedHex.toLowerCase(), 'utf8');
    const isValid = sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf);

    if (!isValid) {
      return res.status(400).json({ ok: false, error: 'Invalid webhook signature.' });
    }

    return res.json({
      ok: true,
      verified: true,
      event: req.body?.event || 'unknown',
      receivedAt: new Date().toISOString(),
    });
  });

  app.post('/api/school-partner/upload-check', async (req, res) => {
    const caller = await verifyFirebaseBearerToken(req);
    if (!caller) {
      return res.status(401).json({ ok: false, error: 'Authentication required.' });
    }

    const { fileName = '', mimeType = '', sizeBytes = 0, purpose = 'document' } = req.body || {};
    const cleanName = path
      .basename(String(fileName))
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .slice(0, 120);
    const ext = path.extname(cleanName).toLowerCase();
    const numericSize = Number(sizeBytes);

    const allowedDocs = new Set([
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);
    const allowedSpreadsheets = new Set([
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]);

    const isBulk = purpose === 'bulk_import';
    const maxBytes = isBulk ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (!cleanName || !ext) {
      return res.status(400).json({ ok: false, error: 'Valid filename with extension is required.' });
    }
    if (!Number.isFinite(numericSize) || numericSize <= 0 || numericSize > maxBytes) {
      return res.status(400).json({
        ok: false,
        error: `File size must be between 1 byte and ${isBulk ? '5 MB' : '10 MB'}.`,
      });
    }

    const extValid = isBulk
      ? ['.csv', '.xlsx', '.xls'].includes(ext)
      : ['.pdf', '.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    const mimeValid = isBulk
      ? allowedSpreadsheets.has(mimeType) || mimeType === 'application/octet-stream' || mimeType === ''
      : allowedDocs.has(mimeType);

    if (!extValid || !mimeValid) {
      return res.status(400).json({
        ok: false,
        error: isBulk
          ? 'Unsupported bulk import file. Allowed formats: CSV, XLSX.'
          : 'Unsupported document file. Allowed formats: PDF, JPG, PNG, WEBP.',
      });
    }

    return res.json({
      ok: true,
      sanitizedFileName: cleanName,
      maxAllowedBytes: maxBytes,
      validatedByUid: caller.uid,
    });
  });

  app.post('/api/school-partner/validate-registration', async (req, res) => {
    const caller = await verifyFirebaseBearerToken(req);
    if (!caller) {
      return res.status(401).json({ ok: false, error: 'Authentication required.' });
    }

    const payload = req.body || {};
    const name = String(payload.name || '').trim();
    const registrationNumber = String(payload.registrationNumber || '').trim();
    const officialEmail = String(payload.officialEmail || '').trim().toLowerCase();
    const officialPhone = String(payload.officialPhone || '').replace(/[^0-9+]/g, '');
    const city = String(payload.city || '').trim();
    const state = String(payload.state || '').trim();
    const principalName = String(payload.principalName || '').trim();
    const boardAffiliation = String(payload.boardAffiliation || '').trim();

    const errors: string[] = [];
    if (name.length < 3 || name.length > 200) errors.push('School legal name must be 3-200 characters.');
    if (!registrationNumber || registrationNumber.length < 4) {
      errors.push('UDISE Code or Board Affiliation Number is required.');
    }
    if (!officialEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(officialEmail)) {
      errors.push('Valid official school email address is required.');
    }
    if (officialPhone.replace(/\D/g, '').length < 10) {
      errors.push('Valid 10-digit school contact phone is required.');
    }
    if (city.length < 2 || state.length < 2) errors.push('City and State are required.');
    if (principalName.length < 2) errors.push('Principal or Authorized Representative name is required.');
    if (!boardAffiliation) errors.push('Education board affiliation is required.');

    if (errors.length > 0) {
      return res.status(400).json({ ok: false, errors, error: errors[0] });
    }

    return res.json({
      ok: true,
      normalized: {
        name,
        registrationNumberUpper: registrationNumber.toUpperCase(),
        officialEmail,
        officialPhone,
        city,
        state,
        principalName,
        boardAffiliation,
      },
      validatedByUid: caller.uid,
    });
  });

  app.post('/api/school-partner/admin/review', async (req, res) => {
    const caller = await verifyFirebaseBearerToken(req);
    if (!caller) {
      return res.status(401).json({ ok: false, error: 'Authentication token required.' });
    }

    const isAdmin = await isVerifiedPlatformAdmin(caller);
    if (!isAdmin) {
      return res.status(403).json({
        ok: false,
        error: 'Forbidden: Only verified Platform Admins or Education Admins can review school applications.',
      });
    }

    const { institutionId, nextStatus, reviewComment = '', schoolCode } = req.body || {};
    const validStatuses = new Set([
      'Under Review',
      'Approved',
      'Rejected',
      'More Information Required',
      'Suspended',
      'Submitted',
    ]);
    if (!institutionId || typeof institutionId !== 'string' || !validStatuses.has(nextStatus)) {
      return res.status(400).json({ ok: false, error: 'Valid institutionId and nextStatus are required.' });
    }
    if (
      (nextStatus === 'Rejected' || nextStatus === 'More Information Required' || nextStatus === 'Suspended') &&
      String(reviewComment).trim().length < 5
    ) {
      return res.status(400).json({
        ok: false,
        error: 'A review comment of at least 5 characters is required for rejection, correction request, or suspension.',
      });
    }

    const resolvedCode =
      nextStatus === 'Approved'
        ? String(schoolCode || `OF-SCH-${institutionId.slice(-5).toUpperCase()}`).replace(/[^A-Z0-9-]/g, '')
        : undefined;

    return res.json({
      ok: true,
      institutionId,
      verificationStatus: nextStatus,
      reviewComment: String(reviewComment).trim(),
      schoolCode: resolvedCode,
      reviewedByUid: caller.uid,
      reviewedByEmail: caller.email,
      reviewedAt: new Date().toISOString(),
    });
  });

  app.get('/api/school-partner/assessment-sheet', (req, res) => {
    const dim = String(req.query.dimension || 'IQ').toUpperCase();
    const dimension: AssessmentDimension = dim === 'EQ' || dim === 'SQ' ? dim : 'IQ';
    const rawBand = String(req.query.gradeBand || 'Middle (6-8)');
    const gradeBand: IqEqSqGradeBand =
      rawBand === 'Primary (1-5)' || rawBand === 'Secondary (9-12)'
        ? rawBand
        : 'Middle (6-8)';

    const questions = stripQuestionAnswers(getQuestionBank(dimension, gradeBand));
    return res.json({
      ok: true,
      dimension,
      gradeBand,
      disclaimer: NON_CLINICAL_EDUCATIONAL_DISCLAIMER,
      questions,
    });
  });

  app.post('/api/school-partner/score-assessment', async (req, res) => {
    const caller = await verifyFirebaseBearerToken(req);
    if (!caller) {
      return res.status(401).json({ ok: false, error: 'Authentication required to score assessments.' });
    }
    const { dimension = 'IQ', gradeBand = 'Middle (6-8)', answers = {}, nonClinicalDisclaimerAccepted } = req.body || {};
    if (!['IQ', 'EQ', 'SQ'].includes(dimension)) {
      return res.status(400).json({ ok: false, error: 'dimension must be IQ, EQ, or SQ.' });
    }
    if (nonClinicalDisclaimerAccepted !== true) {
      return res.status(400).json({ ok: false, error: 'Non-clinical educational disclaimer must be acknowledged.' });
    }

    const validBand: IqEqSqGradeBand =
      gradeBand === 'Primary (1-5)' || gradeBand === 'Secondary (9-12)'
        ? gradeBand
        : 'Middle (6-8)';
    const evaluation = evaluateIqEqSqResponses(dimension, validBand, answers || {});
    return res.json({
      ok: true,
      evaluatedByServer: true,
      evaluatedByUid: caller.uid,
      ...evaluation,
    });
  });

  // ------------------------------------------------------------------
  // SCHOOL EDUCATION (LKG - 12TH STD) AI & ASSESSMENT APIs
  // ------------------------------------------------------------------
  app.post('/api/school/tutor', async (req, res) => {
    const {
      message = '',
      boardName = 'Karnataka State Board / CBSE',
      className = 'Class 8',
      medium = 'English',
      language = 'English',
      subjectName = 'Mathematics',
      chapterTitle = '',
      conceptTitle = '',
      actionMode = 'chat',
      studentProgressSummary = '',
      history = [],
    } = req.body || {};

    const ai = getGeminiClient();
    const safeInstruction = `You are Quinn AI School Tutor at OpenFrame Education, teaching a student in ${className} (${boardName}, ${medium} Medium).
Preferred learning language: ${language}.
Subject: "${subjectName}"${chapterTitle ? `, Chapter: "${chapterTitle}"` : ''}${conceptTitle ? `, Concept: "${conceptTitle}"` : ''}.
STRICT PEDAGOGICAL & MULTILINGUAL SAFETY RULES:
1. Keep tone age-appropriate for ${className}, warm, patient, encouraging, and strictly academic.
2. When Preferred learning language is not English (e.g., Kannada, Hindi, Tamil, Telugu, Malayalam, Marathi, Gujarati, Bengali, Odia, Punjabi, Assamese, Urdu, or Sanskrit), write your complete explanation in the natural native script and academic style of ${language}.
3. NEVER mistranslate technical, mathematical, or scientific terms literally. Always keep standard English technical/exam terms clearly in parentheses beside the regional term (e.g. "ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis)", "ஒளிச்சேர்க்கை (Photosynthesis)", "प्रकाश संश्लेषण (Photosynthesis)", "Ohm's Law", "Pythagoras Theorem").
4. Never mix syllabuses from other education boards.
5. Guide step-by-step and foster deep conceptual understanding.`;

    const modeDirectives: Record<string, string> = {
      explain: `Explain "${conceptTitle || subjectName}" clearly for ${className} with clear structure, key definitions, and 1 worked example in ${language}.`,
      simplify: `Simplify "${conceptTitle || subjectName}" so even a younger learner in ${className} grasps it immediately using everyday analogies in ${language}.`,
      examples: `Provide 3 practical real-life Indian household/community/science examples of "${conceptTitle || subjectName}" in ${language}.`,
      practice: `Create 3 graded practice problems (1 Basic, 1 Standard, 1 Challenge) on "${conceptTitle || subjectName}" with hints and step-by-step solutions in ${language}.`,
      steps: `Show a crystal-clear step-by-step method for solving problems in "${conceptTitle || subjectName}" in ${language}.`,
      mistake: `Identify common student misconceptions on "${conceptTitle || subjectName}" and explain how to avoid them in ${language}.`,
      flashcards: `Generate 5 crisp study flashcards (Term/Prompt -> Concise Answer) for "${chapterTitle || conceptTitle || subjectName}" in ${language}.`,
      revision: `Create high-yield exam revision notes (Key Points, Formulas/Rules, Important Terms) for "${chapterTitle || conceptTitle || subjectName}" in ${language}.`,
      study_plan: `Design a balanced 7-day daily study plan for ${className} (${boardName}) prioritizing weak concepts: ${studentProgressSummary || subjectName}. Respond in ${language}.`,
      weak_detect: `Analyze the student's progress summary (${studentProgressSummary || 'starting out'}) and diagnose weak areas with a remedial action checklist in ${language}.`,
      chat: message || `Explain ${conceptTitle || subjectName} for ${className}.`,
    };

    const userPrompt = modeDirectives[String(actionMode)] || message || `Explain ${conceptTitle || subjectName}`;

    if (!ai) {
      return res.json({
        source: 'structured_offline_tutor',
        reply: `**${subjectName} · ${conceptTitle || chapterTitle || className} (${language})**\n\n• **Board & Class**: ${boardName} — ${className} (${medium} Medium)\n• **Focus Concept**: ${conceptTitle || subjectName}\n• **Key Idea**: Break this topic into core definition -> visual/numerical example -> self-check practice.\n• **Study Tip**: Review the step-by-step worked example in your lesson panel, use the Bilingual Technical Glossary for exact scientific terms, and complete at least one practice exercise before taking the concept quiz.\n\n*(Configure GEMINI_API_KEY in server Secrets to enable live multilingual Gemini tutoring.)*`,
      });
    }

    try {
      const historyBlock = Array.isArray(history)
        ? history
            .slice(-6)
            .map((h: any) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.text}`)
            .join('\n')
        : '';

      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `${historyBlock ? `Recent Conversation:\n${historyBlock}\n\n` : ''}Request (${actionMode}): ${userPrompt}${message && actionMode !== 'chat' ? `\nAdditional note: ${message}` : ''}`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              systemInstruction: safeInstruction,
            },
          }),
        8500,
        'school-tutor'
      );

      return res.json({
        source: 'gemini_school_tutor',
        reply: response.text || 'Let us explore this concept together step-by-step!',
      });
    } catch (err: any) {
      console.warn('School tutor fallback warning:', err?.message || err);
      return res.json({
        source: 'contextual_fallback',
        reply: `Let's review **${conceptTitle || subjectName}** for **${className} (${boardName})**:\n1. Start with the simple definition and real-life application in the lesson workspace.\n2. Check the bilingual glossary so scientific/mathematical terms stay exact across English, Kannada, and Hindi.\n3. Try the interactive lab or solved examples, then ask your follow-up question again.`,
      });
    }
  });

  app.post('/api/school/generate-quiz', async (req, res) => {
    const {
      boardName = 'CBSE',
      className = 'Class 8',
      subjectName = 'Science',
      chapterTitle = 'Core Chapter',
      conceptTitle = 'Core Concept',
      quizMode = 'Daily Quiz',
      language = 'English',
      formats = ['multiple_choice', 'fill_in_blank', 'true_false', 'match_following', 'short_answer'],
      questionCount = 6,
    } = req.body || {};

    const requestedFormats: string[] = Array.isArray(formats) && formats.length > 0
      ? formats
      : ['multiple_choice', 'fill_in_blank', 'true_false', 'short_answer'];

    const count = Math.max(3, Math.min(15, Number(questionCount) || 6));

    const buildFallbackQuestions = () => {
      const bank: any[] = [
        {
          id: `sq-${Date.now()}-1`,
          format: 'multiple_choice',
          difficulty: 'Basic',
          questionText: `Which statement best describes the core principle of "${conceptTitle}" in ${subjectName} (${className})?`,
          options: [
            `It connects the foundational concept of ${conceptTitle} to observable steps and evidence`,
            'It only applies without any rules or structure',
            'It cannot be verified through examples or observations',
            'It is unrelated to the prescribed board syllabus',
          ],
          correctAnswer: `It connects the foundational concept of ${conceptTitle} to observable steps and evidence`,
          explanation: `${conceptTitle} in ${boardName} ${className} ${subjectName} builds directly from definitions to verified reasoning.`,
          marks: 2,
        },
        {
          id: `sq-${Date.now()}-2`,
          format: 'true_false',
          difficulty: 'Basic',
          questionText: `True or False: Understanding prerequisite concepts in "${chapterTitle}" helps master "${conceptTitle}" in sequential order.`,
          options: ['True', 'False'],
          correctAnswer: 'True',
          explanation: 'School concepts are sequenced from basic to advanced so earlier principles support later problem solving.',
          marks: 1,
        },
        {
          id: `sq-${Date.now()}-3`,
          format: 'fill_in_blank',
          difficulty: 'Intermediate',
          questionText: `In ${className} ${subjectName}, the chapter "${chapterTitle}" introduces key principles centered around ________.`,
          correctAnswer: conceptTitle,
          explanation: `The central focus of this topic is ${conceptTitle}.`,
          marks: 2,
        },
        {
          id: `sq-${Date.now()}-4`,
          format: 'match_following',
          difficulty: 'Intermediate',
          questionText: `Match each learning pillar in "${conceptTitle}" with its correct role:`,
          matchPairs: [
            { left: 'Core Definition', right: 'Precise textbook meaning' },
            { left: 'Worked Example', right: 'Step-by-step solved model' },
            { left: 'Real-Life Application', right: 'Everyday practical use' },
          ],
          correctAnswer: 'Core Definition->Precise textbook meaning; Worked Example->Step-by-step solved model; Real-Life Application->Everyday practical use',
          explanation: 'Aligning definitions, worked steps, and real-world uses ensures concept mastery.',
          marks: 3,
        },
        {
          id: `sq-${Date.now()}-5`,
          format: 'numerical',
          difficulty: 'Intermediate',
          questionText: `Practice Numerical/Logic Check: If a learner studies "${conceptTitle}" for 15 minutes a day over 4 days, how many total study minutes are completed? (Enter number only)`,
          correctAnswer: '60',
          explanation: '15 minutes × 4 days = 60 minutes.',
          marks: 2,
        },
        {
          id: `sq-${Date.now()}-6`,
          format: 'diagram_based',
          difficulty: 'Intermediate',
          questionText: `Diagram Analysis (${conceptTitle}): Describe what the labeled stages/components in the lesson diagram demonstrate.`,
          diagramDescription: `Visual model of ${conceptTitle} showing Input/Initial State -> Core Process/Rule -> Verified Output/Result.`,
          correctAnswer: `The diagram illustrates how the initial components undergo the core rule of ${conceptTitle} to produce an accurate result.`,
          explanation: 'Diagram questions evaluate whether you can interpret labeled relationships visually.',
          marks: 3,
        },
        {
          id: `sq-${Date.now()}-7`,
          format: 'short_answer',
          difficulty: 'Intermediate',
          questionText: `Briefly explain one real-life application of "${conceptTitle}" from your ${className} ${subjectName} syllabus (2-3 sentences).`,
          correctAnswer: `${conceptTitle} helps us observe and solve everyday problems accurately using ${subjectName} principles.`,
          explanation: 'A strong short answer states the definition clearly and connects it to one real example.',
          marks: 3,
        },
        {
          id: `sq-${Date.now()}-8`,
          format: 'long_answer',
          difficulty: 'Advanced',
          questionText: `Write a structured explanation of "${conceptTitle}" covering definition, key rule/steps, and an example suitable for a ${quizMode}.`,
          correctAnswer: `Definition of ${conceptTitle}, step-by-step mechanism, and verified illustrative example.`,
          explanation: 'Long answers should present heading, clear steps, and an accurate example for teacher review.',
          marks: 5,
        },
      ];
      const filtered = bank.filter((q) => requestedFormats.includes(q.format));
      return (filtered.length >= 3 ? filtered : bank).slice(0, count);
    };

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({ source: 'structured_fallback', questions: buildFallbackQuestions() });
    }

    try {
      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `Generate ${count} age-appropriate school assessment questions for:
- Education Board: ${boardName}
- Class: ${className}
- Subject: ${subjectName}
- Chapter: ${chapterTitle}
- Concept: ${conceptTitle}
- Quiz Mode: ${quizMode}
- Language: ${language} (Write questions, options, and explanations in natural academic ${language} script if non-English, while keeping technical/scientific/mathematical symbols, units, and key English technical terms in parentheses accurately intact!)
- Requested formats (distribute across these): ${requestedFormats.join(', ')}

Format conventions:
- multiple_choice: include 4 options in "options", "correctAnswer" must exactly match one option.
- true_false: options = ["True", "False"], "correctAnswer" = "True" or "False".
- fill_in_blank: sentence with "________", "correctAnswer" = missing word/phrase.
- match_following: include 3 items in "matchPairs" [{left, right}], "correctAnswer" = "L1->R1; L2->R2; L3->R3".
- numerical: include a clear numeric calculation appropriate for ${className}, "correctAnswer" = exact number/unit.
- diagram_based: include "diagramDescription" explaining the labeled schematic, plus expected interpretation in "correctAnswer".
- short_answer / long_answer: model benchmark answer in "correctAnswer".
Set "difficulty" as "Basic", "Intermediate", or "Advanced", and "marks" (1-5).`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    format: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    questionText: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    matchPairs: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          left: { type: Type.STRING },
                          right: { type: Type.STRING },
                        },
                      },
                    },
                    diagramDescription: { type: Type.STRING },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    marks: { type: Type.NUMBER },
                  },
                  required: ['id', 'format', 'difficulty', 'questionText', 'correctAnswer', 'explanation', 'marks'],
                },
              },
            },
          }),
        9500,
        'school-generate-quiz'
      );

      const parsed = JSON.parse((response.text ?? '[]').trim());
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return res.json({ source: 'structured_fallback', questions: buildFallbackQuestions() });
      }
      return res.json({ source: 'gemini_school_quiz', questions: parsed.slice(0, count) });
    } catch (err: any) {
      console.warn('School quiz generation fallback:', err?.message || err);
      return res.json({ source: 'structured_fallback', questions: buildFallbackQuestions() });
    }
  });

  app.post('/api/school/evaluate-quiz', async (req, res) => {
    const {
      questions = [],
      studentAnswers = {},
      studentId = '',
      studentName = 'Student',
      boardId = 'CBSE',
      classId = '8',
      subjectId = '',
      subjectName = 'Subject',
      chapterId = '',
      conceptId = '',
      quizMode = 'Daily Quiz',
      language = 'English',
    } = req.body || {};

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions array is required.' });
    }

    const subjectiveFormats = new Set(['short_answer', 'long_answer', 'diagram_based']);
    const subjectiveItems = questions.filter((q: any) => subjectiveFormats.has(q.format));
    const ai = getGeminiClient();
    const aiSubjectiveMap: Record<string, { awardedMarks: number; isCorrect: boolean; feedback: string }> = {};

    if (ai && subjectiveItems.length > 0) {
      try {
        const evalRes = await withGeminiTimeout(
          (abortSignal) =>
            ai.models.generateContent({
              model: MODEL_TEXT,
              contents: `You are an encouraging school teacher reviewing ${classId} ${subjectName} subjective answers.
Award partial or full marks from 0 up to marks. Give supportive 1-2 sentence feedback. Note: a human teacher can finalize later.
Items:
${JSON.stringify(
  subjectiveItems.map((q: any) => ({
    questionId: q.id,
    format: q.format,
    questionText: q.questionText,
    modelAnswer: q.correctAnswer,
    maxMarks: Number(q.marks) || 2,
    studentAnswer: String(studentAnswers[q.id] || '').trim(),
  }))
)}`,
              config: {
                abortSignal,
                thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      questionId: { type: Type.STRING },
                      awardedMarks: { type: Type.NUMBER },
                      isCorrect: { type: Type.BOOLEAN },
                      feedback: { type: Type.STRING },
                    },
                    required: ['questionId', 'awardedMarks', 'isCorrect', 'feedback'],
                  },
                },
              },
            }),
          7500,
          'school-evaluate-quiz'
        );
        const parsed = JSON.parse((evalRes.text ?? '[]').trim());
        for (const row of parsed) {
          aiSubjectiveMap[row.questionId] = row;
        }
      } catch (err) {
        console.warn('School subjective eval fallback:', err);
      }
    }

    let totalAwarded = 0;
    let totalMax = 0;
    let hasSubjective = false;
    const itemGrades: any[] = [];

    for (const q of questions) {
      const qMax = Math.max(1, Number(q.marks) || 1);
      totalMax += qMax;
      const ans = String(studentAnswers[q.id] || '').trim();
      const expected = String(q.correctAnswer || '').trim();
      const isSubjective = subjectiveFormats.has(q.format);
      if (isSubjective) hasSubjective = true;

      let awardedMarks = 0;
      let isCorrect = false;
      let feedback = '';

      if (q.format === 'multiple_choice' || q.format === 'true_false') {
        isCorrect = ans.toLowerCase() === expected.toLowerCase();
        awardedMarks = isCorrect ? qMax : 0;
        feedback = isCorrect ? `Correct! ${q.explanation}` : `Expected "${expected}". ${q.explanation}`;
      } else if (q.format === 'fill_in_blank' || q.format === 'numerical') {
        const cleanAns = ans.toLowerCase().replace(/\s+/g, '');
        const cleanExp = expected.toLowerCase().replace(/\s+/g, '');
        isCorrect = cleanAns.length > 0 && (cleanAns === cleanExp || ans.toLowerCase().includes(expected.toLowerCase()));
        awardedMarks = isCorrect ? qMax : 0;
        feedback = isCorrect ? `Accurate! ${q.explanation}` : `Expected "${expected}". ${q.explanation}`;
      } else if (q.format === 'match_following') {
        const expectedPairs = Array.isArray(q.matchPairs) ? q.matchPairs : [];
        if (expectedPairs.length > 0) {
          let hits = 0;
          const lowerAns = ans.toLowerCase();
          for (const pair of expectedPairs) {
            const target = `${pair.left}->${pair.right}`.toLowerCase();
            if (lowerAns.includes(target) || (lowerAns.includes(String(pair.left).toLowerCase()) && lowerAns.includes(String(pair.right).toLowerCase()))) {
              hits++;
            }
          }
          awardedMarks = Math.round((hits / expectedPairs.length) * qMax);
          isCorrect = hits === expectedPairs.length;
          feedback = isCorrect ? `All pairs matched! ${q.explanation}` : `Matched ${hits}/${expectedPairs.length} pairs. ${q.explanation}`;
        } else {
          isCorrect = ans.toLowerCase() === expected.toLowerCase();
          awardedMarks = isCorrect ? qMax : 0;
          feedback = q.explanation;
        }
      } else if (aiSubjectiveMap[q.id]) {
        const aiRow = aiSubjectiveMap[q.id];
        awardedMarks = Math.max(0, Math.min(qMax, Math.round(Number(aiRow.awardedMarks) || 0)));
        isCorrect = Boolean(aiRow.isCorrect);
        feedback = `${aiRow.feedback} (Provisional AI score — teacher can finalize)`;
      } else {
        const words = expected.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
        const hits = words.filter((w) => ans.toLowerCase().includes(w)).length;
        if (ans.length >= 25 && hits >= Math.min(2, Math.max(1, words.length))) {
          awardedMarks = qMax;
          isCorrect = true;
          feedback = `Good explanation covering key points. (Teacher review available) ${q.explanation}`;
        } else if (ans.length >= 10) {
          awardedMarks = Math.max(1, Math.floor(qMax * 0.5));
          isCorrect = false;
          feedback = `Partial answer recorded. Compare with key idea: ${q.explanation}`;
        } else {
          awardedMarks = 0;
          isCorrect = false;
          feedback = `Brief or empty response. Model point: ${expected}`;
        }
      }

      totalAwarded += awardedMarks;
      itemGrades.push({
        questionId: q.id,
        isCorrect,
        awardedMarks,
        maxMarks: qMax,
        feedback,
        isSubjective,
      });
    }

    const percentage = totalMax > 0 ? Math.round((totalAwarded / totalMax) * 100) : 0;
    const now = new Date().toISOString();

    return res.json({
      id: `sqa-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId,
      studentName,
      boardId,
      classId,
      subjectId,
      subjectName,
      chapterId,
      conceptId,
      quizMode,
      language,
      questions,
      studentAnswers,
      itemGrades,
      totalAwarded,
      totalMax,
      percentage,
      pendingTeacherReview: hasSubjective,
      submittedAt: now,
      updatedAt: now,
    });
  });

  app.post('/api/school/evaluate-presentation', async (req, res) => {
    const {
      topicTitle = 'Student Presentation',
      presentationType = 'Topic Presentation',
      subjectName = 'Science',
      classId = '8',
      summaryNotes = '',
      externalUrl = '',
    } = req.body || {};

    const defaultRubric = {
      subjectKnowledge: 12,
      understanding: 12,
      communication: 12,
      creativity: 12,
      confidence: 12,
      accuracy: 12,
      presentationQuality: 8,
    };

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        rubric: defaultRubric,
        totalMarks: 80,
        aiSuggestedFeedback: `Provisional AI Evaluation for "${topicTitle}" (${presentationType}): Clear alignment with Class ${classId} ${subjectName}. Teacher has final editing control over all 7 criteria.`,
      });
    }

    try {
      const evalRes = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `Suggest a provisional 7-criteria rubric draft for a Class ${classId} ${subjectName} presentation:
- Topic: "${topicTitle}"
- Type: ${presentationType}
- Student Summary Notes: "${summaryNotes || 'Not provided'}"
- Attachment Link Present: ${externalUrl ? 'Yes' : 'No'}
Score honestly (0-15 each for subjectKnowledge, understanding, communication, creativity, confidence, accuracy; 0-10 for presentationQuality) and give constructive feedback for the teacher to review/edit.`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  subjectKnowledge: { type: Type.NUMBER },
                  understanding: { type: Type.NUMBER },
                  communication: { type: Type.NUMBER },
                  creativity: { type: Type.NUMBER },
                  confidence: { type: Type.NUMBER },
                  accuracy: { type: Type.NUMBER },
                  presentationQuality: { type: Type.NUMBER },
                  aiSuggestedFeedback: { type: Type.STRING },
                },
                required: [
                  'subjectKnowledge',
                  'understanding',
                  'communication',
                  'creativity',
                  'confidence',
                  'accuracy',
                  'presentationQuality',
                  'aiSuggestedFeedback',
                ],
              },
            },
          }),
        15000,
        'school-eval-presentation'
      );

      const parsed = JSON.parse((evalRes.text ?? '{}').trim());
      const clamp15 = (n: any) => Math.max(0, Math.min(15, Math.round(Number(n) || 11)));
      const clamp10 = (n: any) => Math.max(0, Math.min(10, Math.round(Number(n) || 7)));
      const rubric = {
        subjectKnowledge: clamp15(parsed.subjectKnowledge),
        understanding: clamp15(parsed.understanding),
        communication: clamp15(parsed.communication),
        creativity: clamp15(parsed.creativity),
        confidence: clamp15(parsed.confidence),
        accuracy: clamp15(parsed.accuracy),
        presentationQuality: clamp10(parsed.presentationQuality),
      };
      const totalMarks = Object.values(rubric).reduce((a, b) => a + b, 0);
      return res.json({
        rubric,
        totalMarks,
        aiSuggestedFeedback: parsed.aiSuggestedFeedback || 'Well-structured student presentation ready for teacher approval.',
      });
    } catch {
      return res.json({
        rubric: defaultRubric,
        totalMarks: 80,
        aiSuggestedFeedback: 'Provisional scores populated. Faculty teacher may adjust all 7 criteria marks directly.',
      });
    }
  });

  const schoolTranslationCache = new Map<string, any>();
  const cacheSchoolTranslation = (key: string, val: any) => {
    if (schoolTranslationCache.size >= 600) {
      const oldestKey = schoolTranslationCache.keys().next().value;
      if (oldestKey) schoolTranslationCache.delete(oldestKey);
    }
    schoolTranslationCache.set(key, val);
  };

  app.post('/api/school/translate-concept', async (req, res) => {
    const { text = '', targetLanguage = 'Kannada', subjectName = '', className = '' } = req.body || {};
    if (!text.trim()) {
      return res.status(400).json({ error: 'Text is required.' });
    }
    if (targetLanguage === 'English') {
      return res.json({ translatedText: text, targetLanguage, cached: true });
    }

    const cacheKey = `single::${targetLanguage}::${subjectName}::${text.slice(0, 180)}`;
    const cached = schoolTranslationCache.get(cacheKey);
    if (cached) {
      return res.json({ translatedText: cached, targetLanguage, cached: true });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        translatedText: `[${targetLanguage} Mode · ${subjectName}] ${text}`,
        targetLanguage,
        note: 'Configure GEMINI_API_KEY for live translation.',
      });
    }

    try {
      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `Translate the following ${className} ${subjectName} school explanation accurately into natural academic ${targetLanguage} (in native ${targetLanguage} script).
CRITICAL: Do NOT mistranslate technical, mathematical, or scientific terms literally. Keep standard technical terms clear and include the exact English technical term in parentheses alongside the regional term.
Text:\n${text}`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          }),
        7500,
        'school-translate'
      );
      const translatedText = response.text || text;
      cacheSchoolTranslation(cacheKey, translatedText);
      return res.json({ translatedText, targetLanguage, cached: false });
    } catch {
      return res.json({ translatedText: text, targetLanguage });
    }
  });

  app.post('/api/school/translate-concept-bundle', async (req, res) => {
    const {
      conceptId = '',
      title = '',
      simpleExplanation = '',
      detailedExplanation = '',
      revisionNotes = '',
      realLifeApplications = [],
      targetLanguage = 'Kannada',
      subjectName = '',
      className = '',
    } = req.body || {};

    if (!title && !simpleExplanation && !detailedExplanation) {
      return res.status(400).json({ error: 'Concept text fields are required.' });
    }

    if (targetLanguage === 'English') {
      return res.json({
        conceptId,
        language: 'English',
        title,
        simpleExplanation,
        detailedExplanation,
        revisionNotes,
        realLifeApplications: Array.isArray(realLifeApplications) ? realLifeApplications : [],
        source: 'cache',
        updatedAt: new Date().toISOString(),
      });
    }

    const bundleKey = `bundle::${conceptId || title}::${targetLanguage}`;
    const existing = schoolTranslationCache.get(bundleKey);
    if (existing) {
      return res.json({ ...existing, source: 'cache' });
    }

    const appsArray: string[] = Array.isArray(realLifeApplications)
      ? realLifeApplications.map((x: any) => String(x || ''))
      : [];

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        conceptId,
        language: targetLanguage,
        title: `${title} (${targetLanguage})`,
        simpleExplanation: `[${targetLanguage} · ${subjectName}] ${simpleExplanation}`,
        detailedExplanation: `[${targetLanguage} · ${subjectName}] ${detailedExplanation}`,
        revisionNotes: `[${targetLanguage}] ${revisionNotes}`,
        realLifeApplications: appsArray.map((a) => `[${targetLanguage}] ${a}`),
        source: 'glossary_fallback',
        updatedAt: new Date().toISOString(),
      });
    }

    try {
      const response = await withGeminiTimeout(
        (abortSignal) =>
          ai.models.generateContent({
            model: MODEL_TEXT,
            contents: `Translate this ${className} ${subjectName} school lesson bundle into accurate, natural academic ${targetLanguage} (using authentic native ${targetLanguage} script).
CRITICAL RULES:
1. NEVER mistranslate technical, scientific, or mathematical terms literally. Write the accurate ${targetLanguage} term followed by the exact English technical term in parentheses where helpful (e.g., "ஒளிச்சேர்க்கை (Photosynthesis)").
2. Keep numbers, mathematical equations, chemical formulas, and SI units intact.
3. Preserve array length for realLifeApplications (${appsArray.length} item(s)).

Input JSON:
${JSON.stringify({
  title,
  simpleExplanation,
  detailedExplanation,
  revisionNotes,
  realLifeApplications: appsArray,
})}`,
            config: {
              abortSignal,
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  simpleExplanation: { type: Type.STRING },
                  detailedExplanation: { type: Type.STRING },
                  revisionNotes: { type: Type.STRING },
                  realLifeApplications: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: [
                  'title',
                  'simpleExplanation',
                  'detailedExplanation',
                  'revisionNotes',
                  'realLifeApplications',
                ],
              },
            },
          }),
        9500,
        'school-translate-bundle'
      );

      const parsed = JSON.parse((response.text ?? '{}').trim());
      const result = {
        conceptId,
        language: targetLanguage,
        title: parsed.title || title,
        simpleExplanation: parsed.simpleExplanation || simpleExplanation,
        detailedExplanation: parsed.detailedExplanation || detailedExplanation,
        revisionNotes: parsed.revisionNotes || revisionNotes,
        realLifeApplications:
          Array.isArray(parsed.realLifeApplications) && parsed.realLifeApplications.length > 0
            ? parsed.realLifeApplications
            : appsArray,
        source: 'gemini_translated',
        updatedAt: new Date().toISOString(),
      };
      cacheSchoolTranslation(bundleKey, result);
      return res.json(result);
    } catch (err: any) {
      console.warn('School bundle translation fallback:', err?.message || err);
      return res.json({
        conceptId,
        language: targetLanguage,
        title,
        simpleExplanation,
        detailedExplanation,
        revisionNotes,
        realLifeApplications: appsArray,
        source: 'glossary_fallback',
        updatedAt: new Date().toISOString(),
      });
    }
  });

  app.post('/api/school/youtube-lessons', async (req, res) => {
    forwardRequestReferer(req);
    const {
      boardName = 'CBSE',
      classId = '8',
      subjectName = 'Science',
      chapterTitle = '',
      conceptTitle = '',
      language = 'English',
    } = req.body || {};

    const searchQuery = [classId === 'LKG' || classId === 'UKG' ? classId : `Class ${classId}`, boardName, subjectName, chapterTitle, conceptTitle]
      .filter(Boolean)
      .join(' ');
    const safeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

    const quota = youtubeDiscoveryEngine.getQuotaStatus();
    if (!quota.apiKeyConfigured) {
      return res.json({
        ok: true,
        apiKeyConfigured: false,
        source: 'search_gateway',
        searchQuery,
        safeSearchUrl,
        videos: [],
        message: 'YouTube Data API v3 is not configured with YOUTUBE_API_KEY. Use the safe curriculum search link below or ask your teacher to attach a verified lesson video.',
      });
    }

    try {
      const result = await youtubeDiscoveryEngine.discoverPage({
        query: searchQuery,
        category: 'Academic Education',
        topic: conceptTitle || chapterTitle || subjectName,
        languageLabel: String(language || 'English'),
        searchType: 'video',
        maxResults: 6,
      });

      const videos = (result.items || []).map((item: any) => ({
        videoId: item.youtubeVideoId,
        title: item.title,
        channelTitle: item.youtubeChannelName || 'Educational Channel',
        duration: item.duration || '10:00',
        thumbnailUrl: item.thumbnailUrl,
        embedUrl: `https://www.youtube-nocookie.com/embed/${item.youtubeVideoId}`,
        watchUrl: `https://www.youtube.com/watch?v=${item.youtubeVideoId}`,
      }));

      return res.json({
        ok: true,
        apiKeyConfigured: true,
        source: 'youtube_data_api_v3',
        searchQuery,
        safeSearchUrl,
        videos,
      });
    } catch (err: any) {
      return res.json({
        ok: true,
        apiKeyConfigured: true,
        source: 'search_gateway_fallback',
        searchQuery,
        safeSearchUrl,
        videos: [],
        message: err?.message || 'YouTube API search temporarily unavailable; open the safe curriculum search link.',
      });
    }
  });

  const httpServer = http.createServer(app);

  // ------------------------------------------------------------------
  // Vite Dev Middleware or Production Static Assets
  // ------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const disableHmr = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ...(disableHmr
          ? { hmr: false, ws: false }
          : { ws: { server: httpServer } }),
      },
      appType: 'spa',
    });

    if (disableHmr) {
      app.get('/@vite/client', async (_req, res, next) => {
        try {
          const transformed = await vite.transformRequest('/@vite/client');
          if (!transformed?.code) return next();
          const patched = transformed.code
            .replace(
              /transport\.connect\([^;]+\);/g,
              '/* HMR WebSocket disabled */'
            )
            .replace(/setupForwardConsoleHandler\([^;]+\);/g, '')
            .replace(/throw new SendBeforeConnectError\([^)]*\);/g, 'return;');
          res.type('application/javascript').send(patched);
        } catch {
          next();
        }
      });
    }

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`OpenFrame Education & Corporate Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
