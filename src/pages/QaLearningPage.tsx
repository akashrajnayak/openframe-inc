import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Search,
  Sparkles,
  BookOpen,
  Youtube,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  Trash2,
  ExternalLink,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { quinnAiService } from '../services/quinnAiService';
import { lmsService } from '../services/lmsService';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/RouterContext';
import {
  QaStructuredResult,
  QaSavedRecord,
  MarketplaceCourse,
  EducationCategoryCode,
} from '../types';
import { EDUCATION_CLASSIFICATION_CATEGORIES } from '../data/educationClassificationData';
import { SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES } from '../utils/searchIntelligence';
import { CourseEnrollmentModal } from '../components/common/CourseEnrollmentModal';

const SAMPLE_QA_PROMPTS = [
  'What is Microeconomics and how does supply and demand work?',
  'Class 10 Science: How do chemical equations balance?',
  'PUC Commerce: What is the difference between journal and ledger in accounting?',
  'BCom student: Why should commerce students learn Python and Excel automation?',
  'Postgraduate Research Methodology: Quantitative vs Qualitative research design',
  'How to improve English communication skills for job interviews?',
];

export const QaLearningPage: React.FC = () => {
  const { currentUser, studentProfile } = useAuth();
  const { navigate, currentPath } = useRouter();
  const initialQuery = new URLSearchParams(currentPath.split('?')[1] || '').get('q') || '';

  const [question, setQuestion] = useState(initialQuery);
  const [educationCategory, setEducationCategory] = useState<string>(studentProfile?.educationLevel || '');
  const [language, setLanguage] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QaStructuredResult | null>(null);
  const [quizSelections, setQuizSelections] = useState<Record<string, number>>({});
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [savedHistory, setSavedHistory] = useState<QaSavedRecord[]>([]);
  const [enrollCourse, setEnrollCourse] = useState<MarketplaceCourse | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser?.uid) {
      lmsService.getQaHistory(currentUser.uid, 20).then(setSavedHistory).catch(() => {});
    }
  }, [currentUser]);

  const handleAsk = async (qOverride?: string) => {
    const clean = (qOverride ?? question).trim();
    if (!clean) return;
    if (qOverride) setQuestion(qOverride);

    setLoading(true);
    setSaveNotice(null);
    setQuizSelections({});

    const catObj = EDUCATION_CLASSIFICATION_CATEGORIES.find((c) => c.code === (educationCategory as EducationCategoryCode));
    const contextLabel = catObj
      ? `${catObj.title}${studentProfile?.degreeOrClass ? ` (${studentProfile.degreeOrClass})` : ''}`
      : studentProfile?.degreeOrClass || '';

    try {
      const response = await quinnAiService.askQuinnQa({
        question: clean,
        studentProfile,
        educationContext: contextLabel,
        language,
      });
      setResult(response);
      await lmsService.logDiscoveryAnalyticsEvent({
        userId: currentUser?.uid,
        eventType: 'qa_ask',
        query: clean,
        educationLevelCode: educationCategory || studentProfile?.educationLevel,
        degreeOrClass: studentProfile?.degreeOrClass,
        subject: response.subject,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery && initialQuery.trim().length >= 3 && !result) {
      handleAsk(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSaveResult = async () => {
    if (!result) return;
    if (!currentUser?.uid) {
      navigate('/login/student');
      return;
    }
    setSavingAnswer(true);
    setSaveNotice(null);
    try {
      const saved = await lmsService.saveQaEntry({
        studentId: currentUser.uid,
        studentName: studentProfile?.fullName || currentUser.displayName || 'Learner',
        question: result.question,
        subject: result.subject,
        topic: result.topic,
        educationContext: result.educationContext,
        answer: result.answer,
        relatedConcepts: result.relatedConcepts,
        recommendedCourseIds: result.recommendedCourses.map((c) => c.course.id),
        youtubeVideoIds: result.youtubeVideos.map((v) => v.videoId).filter(Boolean),
      });
      setSavedHistory((prev) => [saved, ...prev]);
      setSaveNotice('Saved to your Q&A Study Notebook in Student Dashboard.');
    } catch (err: any) {
      setSaveNotice(err?.message || 'Unable to save Q&A answer.');
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleDeleteSaved = async (id: string) => {
    await lmsService.deleteQaEntry(id);
    setSavedHistory((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Hero Header */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#123D32] mb-2">
              Quinn AI Academic & Skill Q&A Studio
            </p>
            <h1 className="font-editorial text-3xl sm:text-5xl font-bold text-[#18221F] tracking-tight leading-tight">
              Ask any academic question, concept doubt, or career skill topic.
            </h1>
            <p className="text-base text-slate-600 mt-3 leading-relaxed">
              Receive a clear, structured explanation from LKG to Doctoral level along with real OpenFrame courses, curated external YouTube lectures, a study path, and active-recall practice questions.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="mt-6 space-y-3"
          >
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask anything... e.g. What is Microeconomics? or Explain Python functions for BCom"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F] placeholder:text-slate-400 focus:outline-none focus:border-[#123D32]"
                />
              </div>
              <select
                value={educationCategory}
                onChange={(e) => setEducationCategory(e.target.value)}
                aria-label="Education level context"
                className="px-3.5 py-3.5 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
              >
                <option value="">All Levels (Auto-Detect)</option>
                {EDUCATION_CLASSIFICATION_CATEGORIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code}: {c.shortTitle}
                  </option>
                ))}
              </select>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Response language"
                className="px-3.5 py-3.5 bg-[#FAF7F2] border border-slate-300 rounded-xl text-sm text-[#18221F]"
              >
                {SUPPORTED_MULTILINGUAL_SEARCH_LANGUAGES.slice(0, 8).map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2563EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-60"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Analyzing...' : 'Ask Quinn AI'}
              </button>
            </div>
          </form>

          {/* Example Prompts */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
              Try Sample Academic & Skill Questions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {SAMPLE_QA_PROMPTS.map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => handleAsk(sample)}
                  className="text-left px-3.5 py-2.5 bg-[#FAF7F2] border border-slate-200 rounded-xl text-xs font-medium text-[#18221F] hover:border-[#123D32] hover:bg-white transition-colors line-clamp-2"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Structured Result Sections A-F */}
        {result && (
          <div className="space-y-6">
            {/* Section A: Clear Direct Answer + Examples */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#123D32]">
                    Section A · Direct Answer ({result.subject} · {result.educationContext})
                  </p>
                  <h2 className="font-editorial text-2xl font-bold text-[#18221F] mt-1">
                    {result.question}
                  </h2>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSaveResult}
                    disabled={savingAnswer}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#123D32] text-white text-xs font-semibold rounded-xl hover:bg-[#0D2E25] whitespace-nowrap"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    {savingAnswer ? 'Saving...' : 'Save Answer'}
                  </button>
                </div>
              </div>

              {saveNotice && (
                <div className="mt-4 px-4 py-2.5 bg-[#FAF7F2] border border-[#123D32]/25 rounded-xl text-xs font-medium text-[#123D32]">
                  {saveNotice}
                </div>
              )}

              <p className="mt-5 text-base text-[#18221F] leading-relaxed whitespace-pre-line">
                {result.answer}
              </p>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-[#FAF7F2] border border-slate-200 rounded-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#123D32] mb-2">
                    Concrete Examples
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                    {result.examples.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-[#FAF7F2] border border-slate-200 rounded-xl">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#123D32] mb-2">
                    Key Takeaways
                  </p>
                  <ul className="space-y-2 text-sm text-slate-700 list-disc pl-4">
                    {result.keyTakeaways.map((kt, i) => (
                      <li key={i}>{kt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Section B: Related Concepts */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#123D32] mb-2">
                Section B · Related Concepts to Explore Next
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {result.relatedConcepts.map((concept) => (
                  <button
                    key={concept}
                    type="button"
                    onClick={() => handleAsk(`Explain ${concept}`)}
                    className="p-3.5 bg-[#FAF7F2] border border-slate-200 rounded-xl text-left text-sm font-semibold text-[#18221F] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="line-clamp-2">{concept}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </button>
                ))}
              </div>
            </section>

            {/* Section C: Recommended OpenFrame Courses */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#123D32]">
                    Section C · Recommended OpenFrame Courses
                  </p>
                  <h3 className="font-heading text-lg font-bold text-[#18221F]">
                    Structured courses matching "{result.topic}"
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/marketplace?q=${encodeURIComponent(result.topic)}`)}
                  className="text-xs font-semibold text-[#2563EB] hover:underline whitespace-nowrap"
                >
                  Explore Full Discovery Page
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.recommendedCourses.map(({ course, rationale }) => (
                  <div
                    key={course.id}
                    className="p-4 bg-[#FAF7F2] border border-slate-200 rounded-xl flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-heading text-base font-bold text-[#18221F] line-clamp-2">
                          {course.title}
                        </h4>
                        <span className="text-sm font-bold text-[#123D32] tabular-nums shrink-0">
                          {course.price === 0 ? 'Free' : `₹${course.price.toLocaleString('en-IN')}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {course.category} · {course.level} · {course.duration} · {course.language || 'English'}
                      </p>
                      <p className="text-xs text-slate-600 mt-2">{rationale}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEnrollCourse(course)}
                        className="px-4 py-2 bg-[#2563EB] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 whitespace-nowrap"
                      >
                        Enroll Now
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/marketplace/${encodeURIComponent(course.id)}`)}
                        className="px-3.5 py-2 bg-white border border-slate-300 text-xs font-semibold text-[#18221F] rounded-lg hover:border-[#123D32] whitespace-nowrap"
                      >
                        Course Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section D: External YouTube Video Resources */}
            <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                  Section D · Curated External YouTube Lectures
                </p>
                <h3 className="font-heading text-lg font-bold text-[#18221F]">
                  Visual explanations (External YouTube Resource — separate from OpenFrame certification)
                </h3>
              </div>

              {activeVideoId && (
                <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-200 bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideoId}`}
                    title="YouTube Lecture Player"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {result.youtubeVideos.map((vid) => (
                  <div
                    key={vid.videoId}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-[#FAF7F2] flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={vid.thumbnailUrl || vid.thumbnail}
                        alt={vid.title}
                        className="w-full h-36 object-cover bg-slate-200"
                      />
                      <div className="p-3.5 space-y-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-red-700">
                          External YouTube Resource · {vid.level}
                        </p>
                        <h4 className="text-sm font-bold text-[#18221F] line-clamp-2">{vid.title}</h4>
                        <p className="text-xs text-slate-500">
                          {vid.channelTitle} · {vid.duration}
                        </p>
                      </div>
                    </div>
                    <div className="px-3.5 pb-3.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveVideoId(vid.videoId);
                          lmsService.logDiscoveryAnalyticsEvent({
                            userId: currentUser?.uid,
                            eventType: 'youtube_watch',
                            query: result.question,
                            videoId: vid.videoId,
                            subject: result.subject,
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#123D32] text-white text-xs font-semibold rounded-lg hover:bg-[#0D2E25] whitespace-nowrap"
                      >
                        <Youtube className="w-3.5 h-3.5" /> Watch Video
                      </button>
                      <a
                        href={`https://www.youtube.com/watch?v=${vid.videoId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 text-xs font-medium text-slate-700 rounded-lg"
                      >
                        YouTube <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Sections E & F: Suggested Learning Path + Active Recall Practice Quiz */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#123D32]">
                      Section E · Suggested Learning Path
                    </p>
                    <h3 className="font-heading text-lg font-bold text-[#18221F] mt-0.5">
                      {result.suggestedLearningPathTitle}
                    </h3>
                  </div>
                  <Layers className="w-5 h-5 text-[#123D32] shrink-0" />
                </div>
                <ol className="space-y-2.5">
                  {result.suggestedLearningPathSteps.map((st, idx) => (
                    <li
                      key={idx}
                      className="p-3 bg-[#FAF7F2] border border-slate-200 rounded-xl text-sm text-[#18221F]"
                    >
                      {st}
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  onClick={() => navigate(`/marketplace?q=${encodeURIComponent(result.topic)}&view=roadmap`)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#123D32] text-white text-xs font-semibold rounded-xl hover:bg-[#0D2E25]"
                >
                  Open Full 8-Stage Visual Roadmap <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </section>

              <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#123D32]">
                      Section F · Quick Practice Quiz
                    </p>
                    <h3 className="font-heading text-lg font-bold text-[#18221F] mt-0.5">
                      Check your understanding
                    </h3>
                  </div>
                  <HelpCircle className="w-5 h-5 text-[#123D32] shrink-0" />
                </div>

                <div className="space-y-4">
                  {result.practiceQuiz.map((pq, qIdx) => {
                    const selected = quizSelections[pq.id];
                    const isAnswered = selected !== undefined;
                    return (
                      <div key={pq.id} className="p-4 bg-[#FAF7F2] border border-slate-200 rounded-xl space-y-2.5">
                        <p className="text-sm font-semibold text-[#18221F]">
                          {qIdx + 1}. {pq.question}
                        </p>
                        <div className="space-y-1.5">
                          {pq.options.map((opt, optIdx) => {
                            const isSelected = selected === optIdx;
                            const isRight = optIdx === pq.correctIndex;
                            let cls = 'bg-white border-slate-200 text-slate-700 hover:border-[#123D32]';
                            if (isAnswered) {
                              if (isRight) cls = 'bg-emerald-50 border-[#123D32] text-[#123D32] font-semibold';
                              else if (isSelected) cls = 'bg-red-50 border-red-400 text-red-700';
                            }
                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => setQuizSelections((prev) => ({ ...prev, [pq.id]: optIdx }))}
                                className={`w-full text-left px-3 py-2 border rounded-lg text-xs transition-colors ${cls}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {isAnswered && (
                          <p className="text-xs text-slate-600 pt-1">
                            {selected === pq.correctIndex ? 'Correct — ' : 'Explanation: '}
                            {pq.explanation}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {result.honestyNote && (
              <p className="text-xs text-slate-500 text-center">{result.honestyNote}</p>
            )}
          </div>
        )}

        {/* Saved Q&A Notebook */}
        {currentUser && savedHistory.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-[#18221F]">
                Your Saved Q&A Study Notebook ({savedHistory.length})
              </h3>
              <button
                type="button"
                onClick={() => navigate('/student/dashboard')}
                className="text-xs font-semibold text-[#2563EB] hover:underline"
              >
                Open Student Dashboard
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {savedHistory.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#FAF7F2] border border-slate-200 rounded-xl flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => handleAsk(item.question)}
                      className="text-sm font-bold text-[#18221F] hover:text-[#2563EB] text-left line-clamp-1"
                    >
                      {item.question}
                    </button>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.subject} · Saved {new Date(item.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSaved(item.id)}
                    aria-label="Delete saved Q&A"
                    className="p-1.5 text-slate-400 hover:text-red-600 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <CourseEnrollmentModal
        isOpen={Boolean(enrollCourse)}
        onClose={() => setEnrollCourse(null)}
        course={enrollCourse}
      />
    </div>
  );
};
