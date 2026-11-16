import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Loader2,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';
import {
  SchoolBoardId,
  SchoolClassId,
  SchoolLanguage,
  SchoolQuestionFormat,
  SchoolQuizAttempt,
  SchoolQuizMode,
  SchoolQuizQuestion,
} from '../../types';
import { evaluateSchoolQuiz, generateSchoolQuiz } from '../../services/schoolAiService';
import {
  awardSchoolXpAndBadge,
  saveSchoolQuizAttempt,
  upsertSchoolConceptProgress,
} from '../../services/schoolService';
import { VoiceLearningControls } from './VoiceLearningControls';

const ALL_MODES: SchoolQuizMode[] = [
  'Daily Quiz',
  'Weekly Quiz',
  'Chapter Test',
  'Subject Test',
  'Monthly Assessment',
  'Revision Test',
  'Mock Examination',
];

const ALL_FORMATS: Array<{ id: SchoolQuestionFormat; label: string }> = [
  { id: 'multiple_choice', label: 'MCQ' },
  { id: 'fill_in_blank', label: 'Fill in Blank' },
  { id: 'true_false', label: 'True / False' },
  { id: 'match_following', label: 'Match Following' },
  { id: 'short_answer', label: 'Short Answer' },
  { id: 'long_answer', label: 'Long Answer' },
  { id: 'numerical', label: 'Numerical' },
  { id: 'diagram_based', label: 'Diagram-Based' },
];

interface SchoolQuizEngineProps {
  studentUid?: string;
  studentName?: string;
  boardId: SchoolBoardId;
  boardName: string;
  classId: SchoolClassId;
  classNameLabel: string;
  subjectId: string;
  subjectName: string;
  chapterId?: string;
  chapterTitle: string;
  conceptId?: string;
  conceptTitle: string;
  language: SchoolLanguage;
  onAttemptSaved?: (attempt: SchoolQuizAttempt) => void;
}

export const SchoolQuizEngine: React.FC<SchoolQuizEngineProps> = ({
  studentUid,
  studentName = 'Student Learner',
  boardId,
  boardName,
  classId,
  classNameLabel,
  subjectId,
  subjectName,
  chapterId,
  chapterTitle,
  conceptId,
  conceptTitle,
  language,
  onAttemptSaved,
}) => {
  const [quizMode, setQuizMode] = useState<SchoolQuizMode>('Daily Quiz');
  const [selectedFormats, setSelectedFormats] = useState<SchoolQuestionFormat[]>([
    'multiple_choice',
    'true_false',
    'fill_in_blank',
    'match_following',
    'numerical',
    'short_answer',
  ]);
  const [questions, setQuestions] = useState<SchoolQuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matchSelections, setMatchSelections] = useState<Record<string, Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SchoolQuizAttempt | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const toggleFormat = (fmt: SchoolQuestionFormat) => {
    setSelectedFormats((prev) =>
      prev.includes(fmt)
        ? prev.length > 1
          ? prev.filter((f) => f !== fmt)
          : prev
        : [...prev, fmt]
    );
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    setErrorMsg('');
    setResult(null);
    setAnswers({});
    setMatchSelections({});
    try {
      const res = await generateSchoolQuiz({
        boardName,
        className: classNameLabel,
        subjectName,
        chapterTitle,
        conceptTitle,
        quizMode,
        language,
        formats: selectedFormats,
        questionCount: Math.max(5, Math.min(8, selectedFormats.length + 1)),
      });
      setQuestions(res.questions || []);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to load quiz questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (qId: string, leftItem: string, rightItem: string) => {
    setMatchSelections((prev) => {
      const nextForQ = { ...(prev[qId] || {}), [leftItem]: rightItem };
      const serialized = Object.entries(nextForQ)
        .map(([l, r]) => `${l}->${r}`)
        .join('; ');
      setAnswers((aPrev) => ({ ...aPrev, [qId]: serialized }));
      return { ...prev, [qId]: nextForQ };
    });
  };

  const handleSubmitQuiz = async () => {
    if (questions.length === 0) return;
    setSubmitting(true);
    setErrorMsg('');
    try {
      const evaluated = await evaluateSchoolQuiz({
        questions,
        studentAnswers: answers,
        studentId: studentUid || 'guest-learner',
        studentName,
        boardId,
        classId,
        subjectId,
        subjectName,
        chapterId,
        conceptId,
        quizMode,
        language,
      });
      setResult(evaluated);

      if (studentUid) {
        await saveSchoolQuizAttempt(evaluated).catch(() => {});
        if (conceptId && chapterId) {
          await upsertSchoolConceptProgress({
            studentId: studentUid,
            boardId,
            classId,
            subjectId,
            chapterId,
            conceptId,
            conceptTitle,
            updates: {
              quizPassed: evaluated.percentage >= 60,
              latestQuizScore: evaluated.percentage,
              status: evaluated.percentage >= 70 ? 'Mastered' : 'Needs Revision',
              needsSupport: evaluated.percentage < 50,
            },
          }).catch(() => {});
        }
        await awardSchoolXpAndBadge({
          studentUid,
          xpDelta: evaluated.percentage >= 70 ? 25 : 10,
          badgeName: evaluated.percentage >= 90 ? 'Quiz Distinction' : undefined,
        }).catch(() => {});
      }

      onAttemptSaved?.(evaluated);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Quiz evaluation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <ClipboardCheck className="w-4 h-4" />
            <span>AI Multilingual Quiz &amp; Exam Engine</span>
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900 mt-0.5">
            {subjectName} · {conceptTitle}
          </h3>
          <p className="text-xs text-slate-500">
            Supports 8 question formats · Objective auto-grading · Subjective answers marked pending teacher review
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartQuiz}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-200" />}
          <span>{questions.length > 0 ? 'Generate Fresh Set' : `Start ${quizMode}`}</span>
        </button>
      </div>

      {/* Quiz Mode & Format Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Assessment Mode
          </label>
          <select
            value={quizMode}
            onChange={(e) => setQuizMode(e.target.value as SchoolQuizMode)}
            className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-800"
          >
            {ALL_MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Question Formats Included ({selectedFormats.length}/8)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ALL_FORMATS.map((f) => {
              const active = selectedFormats.includes(f.id);
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFormat(f.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer transition-all ${
                    active
                      ? 'bg-[#0B1930] text-white border-[#0B1930]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
          {errorMsg}
        </div>
      )}

      {/* Active Questions */}
      {questions.length > 0 && !result && (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-slate-500">
                <span>
                  Question {idx + 1} · {q.format.replace(/_/g, ' ').toUpperCase()} · {q.difficulty}
                </span>
                <span className="font-bold text-slate-800 tabular-nums">{q.marks} Marks</span>
              </div>

              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">{q.questionText}</p>
                <VoiceLearningControls textToRead={q.questionText} language={language} compact />
              </div>

              {q.format === 'diagram_based' && q.diagramDescription && (
                <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900">
                  <strong className="block mb-1">Diagram Reference:</strong>
                  {q.diagramDescription}
                </div>
              )}

              {(q.format === 'multiple_choice' || q.format === 'true_false') && q.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                        answers[q.id] === opt
                          ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.id}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => setAnswers((p) => ({ ...p, [q.id]: opt }))}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {(q.format === 'fill_in_blank' || q.format === 'numerical') && (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                    placeholder={q.format === 'numerical' ? 'Enter numeric value...' : 'Fill in the blank...'}
                    className="flex-1 min-w-[220px] px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <VoiceLearningControls
                    language={language}
                    compact
                    onVoiceTranscript={(t) => setAnswers((p) => ({ ...p, [q.id]: t }))}
                  />
                </div>
              )}

              {q.format === 'match_following' && q.matchPairs && (
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {q.matchPairs.map((pair) => {
                    const rightChoices = q.matchPairs!.map((mp) => mp.right).sort();
                    return (
                      <div key={pair.left} className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center text-xs">
                        <div className="font-semibold text-slate-800 bg-white px-3 py-2 rounded border border-slate-200">
                          {pair.left}
                        </div>
                        <select
                          value={matchSelections[q.id]?.[pair.left] || ''}
                          onChange={(e) => handleMatchSelect(q.id, pair.left, e.target.value)}
                          className="px-3 py-2 bg-white border border-slate-300 rounded text-slate-800"
                        >
                          <option value="">-- Select Matching Role --</option>
                          {rightChoices.map((rc) => (
                            <option key={rc} value={rc}>{rc}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>
              )}

              {(q.format === 'short_answer' || q.format === 'long_answer' || q.format === 'diagram_based') && (
                <div className="space-y-2">
                  <textarea
                    rows={q.format === 'long_answer' ? 4 : 2}
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value }))}
                    placeholder={`Write your explanation in ${language}...`}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                  <VoiceLearningControls
                    language={language}
                    compact
                    onVoiceTranscript={(t) =>
                      setAnswers((p) => ({ ...p, [q.id]: p[q.id] ? `${p[q.id]} ${t}` : t }))
                    }
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Submit &amp; Evaluate Answers</span>
            </button>
          </div>
        </div>
      )}

      {/* Results View */}
      {result && (
        <div className="space-y-4">
          <div className="bg-[#0B1930] text-white rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-sky-300">
                {result.quizMode} Completed
              </div>
              <div className="text-2xl font-heading font-extrabold mt-1 tabular-nums">
                Score: {result.totalAwarded} / {result.totalMax} ({result.percentage}%)
              </div>
              {result.pendingTeacherReview && (
                <div className="mt-1.5 text-xs text-amber-300 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Subjective answers include provisional AI score — teacher can review &amp; edit final marks.</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={handleStartQuiz}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold cursor-pointer hover:bg-sky-50"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practice Another Quiz</span>
            </button>
          </div>

          <div className="space-y-3">
            {result.questions.map((q, idx) => {
              const g = result.itemGrades.find((ig) => ig.questionId === q.id);
              return (
                <div
                  key={q.id}
                  className={`p-4 rounded-xl border ${
                    g?.isCorrect ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs font-bold text-slate-900">
                      Q{idx + 1}. {q.questionText}
                    </div>
                    <div className="shrink-0 flex items-center gap-1 text-xs font-bold tabular-nums">
                      {g?.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-600" />
                      )}
                      <span>
                        {g?.awardedMarks ?? 0}/{g?.maxMarks ?? q.marks}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1.5 text-xs text-slate-600">
                    <strong>Your Answer:</strong> {result.studentAnswers[q.id] || '(Blank)'}
                  </div>
                  <div className="mt-1 text-xs text-slate-800">{g?.feedback}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
