import {
  SchoolBoardId,
  SchoolClassId,
  SchoolLanguage,
  SchoolQuestionFormat,
  SchoolQuizAttempt,
  SchoolQuizMode,
  SchoolQuizQuestion,
  TranslatedConceptBundle,
} from '../types';

export interface SchoolTutorRequest {
  message: string;
  boardName: string;
  className: string;
  medium: string;
  language: SchoolLanguage;
  subjectName: string;
  chapterTitle?: string;
  conceptTitle?: string;
  actionMode?:
    | 'explain'
    | 'simplify'
    | 'examples'
    | 'doubt'
    | 'practice'
    | 'steps'
    | 'mistake'
    | 'flashcards'
    | 'revision'
    | 'study_plan'
    | 'weak_detect'
    | 'chat';
  studentProgressSummary?: string;
  history?: Array<{ role: 'user' | 'ai'; text: string }>;
}

export async function askSchoolTutor(payload: SchoolTutorRequest): Promise<{ reply: string; source: string }> {
  try {
    const res = await fetch('/api/school/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Tutor service unavailable');
    return await res.json();
  } catch {
    return {
      source: 'client_fallback',
      reply: `Reviewing **${payload.conceptTitle || payload.subjectName}** (${payload.className} · ${payload.language}): Focus on the simple explanation, inspect the multilingual technical glossary for accurate exam terms, and test your understanding with worked examples.`,
    };
  }
}

export async function generateSchoolQuiz(params: {
  boardName: string;
  className: string;
  subjectName: string;
  chapterTitle: string;
  conceptTitle: string;
  quizMode: SchoolQuizMode;
  language: SchoolLanguage;
  formats: SchoolQuestionFormat[];
  questionCount?: number;
}): Promise<{ questions: SchoolQuizQuestion[]; source: string }> {
  const res = await fetch('/api/school/generate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('Could not generate school quiz.');
  }
  return await res.json();
}

export async function evaluateSchoolQuiz(params: {
  questions: SchoolQuizQuestion[];
  studentAnswers: Record<string, string>;
  studentId: string;
  studentName: string;
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  subjectId: string;
  subjectName: string;
  chapterId?: string;
  conceptId?: string;
  quizMode: SchoolQuizMode;
  language: SchoolLanguage;
}): Promise<SchoolQuizAttempt> {
  const res = await fetch('/api/school/evaluate-quiz', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('Could not evaluate quiz answers.');
  }
  return await res.json();
}

export async function evaluatePresentationWithAI(params: {
  topicTitle: string;
  presentationType: string;
  subjectName: string;
  classId: SchoolClassId;
  summaryNotes: string;
  externalUrl?: string;
}) {
  const res = await fetch('/api/school/evaluate-presentation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Presentation rubric assistant unavailable');
  return await res.json();
}

const MEMORY_BUNDLE_CACHE = new Map<string, TranslatedConceptBundle>();

export function getCachedConceptTranslation(
  conceptId: string,
  language: SchoolLanguage
): TranslatedConceptBundle | null {
  const key = `${conceptId}::${language}`;
  if (MEMORY_BUNDLE_CACHE.has(key)) {
    return MEMORY_BUNDLE_CACHE.get(key) || null;
  }
  try {
    const raw = localStorage.getItem(`openframe_lang_bundle_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw) as TranslatedConceptBundle;
      if (parsed && parsed.conceptId === conceptId && parsed.language === language) {
        MEMORY_BUNDLE_CACHE.set(key, parsed);
        return parsed;
      }
    }
  } catch {
    // ignore storage access issues
  }
  return null;
}

export async function translateSchoolConcept(params: {
  text: string;
  targetLanguage: SchoolLanguage;
  subjectName: string;
  className: string;
}): Promise<{ translatedText: string; targetLanguage: SchoolLanguage }> {
  const res = await fetch('/api/school/translate-concept', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    return { translatedText: params.text, targetLanguage: params.targetLanguage };
  }
  return await res.json();
}

export async function translateSchoolConceptBundle(params: {
  conceptId: string;
  title: string;
  simpleExplanation: string;
  detailedExplanation: string;
  revisionNotes: string;
  realLifeApplications: string[];
  targetLanguage: SchoolLanguage;
  subjectName: string;
  className: string;
  forceRefresh?: boolean;
}): Promise<TranslatedConceptBundle> {
  if (!params.forceRefresh) {
    const cached = getCachedConceptTranslation(params.conceptId, params.targetLanguage);
    if (cached) return cached;
  }

  try {
    const res = await fetch('/api/school/translate-concept-bundle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Translation bundle endpoint error');
    const data = (await res.json()) as TranslatedConceptBundle;
    const key = `${params.conceptId}::${params.targetLanguage}`;
    MEMORY_BUNDLE_CACHE.set(key, data);
    try {
      localStorage.setItem(`openframe_lang_bundle_${key}`, JSON.stringify(data));
    } catch {
      // ignore quota error
    }
    return data;
  } catch {
    return {
      conceptId: params.conceptId,
      language: params.targetLanguage,
      title: params.title,
      simpleExplanation: params.simpleExplanation,
      detailedExplanation: params.detailedExplanation,
      revisionNotes: params.revisionNotes,
      realLifeApplications: params.realLifeApplications,
      source: 'glossary_fallback',
      updatedAt: new Date().toISOString(),
    };
  }
}

export interface SchoolYouTubeVideoResult {
  videoId: string;
  title: string;
  channelTitle: string;
  duration: string;
  thumbnailUrl: string;
  embedUrl: string;
  watchUrl: string;
}

export async function fetchSchoolYouTubeLessons(params: {
  boardName: string;
  classId: SchoolClassId;
  subjectName: string;
  chapterTitle?: string;
  conceptTitle?: string;
  language?: SchoolLanguage;
}): Promise<{
  ok: boolean;
  apiKeyConfigured: boolean;
  source: string;
  searchQuery: string;
  safeSearchUrl: string;
  videos: SchoolYouTubeVideoResult[];
  message?: string;
}> {
  const res = await fetch('/api/school/youtube-lessons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('Could not query YouTube lessons.');
  }
  return await res.json();
}
