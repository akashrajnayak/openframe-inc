import React, { useState } from 'react';
import {
  Bot,
  Calendar,
  FlipHorizontal,
  Loader2,
  Send,
  Sparkles,
} from 'lucide-react';
import { SchoolConcept, SchoolLanguage } from '../../types';
import { getLanguagePack, getLocalizedText } from '../../data/allIndiaLanguagesData';
import { askSchoolTutor, SchoolTutorRequest } from '../../services/schoolAiService';
import { VoiceLearningControls } from './VoiceLearningControls';

interface AiTutorDrawerProps {
  boardName: string;
  classNameLabel: string;
  medium: string;
  language: SchoolLanguage;
  subjectName: string;
  chapterTitle?: string;
  concept?: SchoolConcept;
  progressSummary?: string;
}

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({
  boardName,
  classNameLabel,
  medium,
  language,
  subjectName,
  chapterTitle,
  concept,
  progressSummary,
}) => {
  const langPack = getLanguagePack(language);
  const localizedConceptTitle = getLocalizedText(concept?.title, language) || subjectName;
  const [subTab, setSubTab] = useState<'tutor' | 'flashcards' | 'study_plan'>('tutor');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([
    {
      role: 'ai',
      text: `Namaste! I am your OpenFrame AI Personal Tutor for ${classNameLabel} (${boardName}). Ask any doubt on "${localizedConceptTitle}" in ${language}, or use a quick action below!`,
    },
  ]);

  // Flashcard state
  const flashcards = concept?.flashcards || [
    { front: `${subjectName} Key Principle`, back: 'Connect textbook definition -> worked example -> practical application.' },
  ];
  const [cardIdx, setCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  // Study plan state
  const [studyPlanText, setStudyPlanText] = useState('');

  const triggerTutor = async (
    actionMode: SchoolTutorRequest['actionMode'],
    customPrompt: string
  ) => {
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', text: customPrompt }]);
    try {
      const res = await askSchoolTutor({
        message: customPrompt,
        boardName,
        className: classNameLabel,
        medium,
        language,
        subjectName,
        chapterTitle,
        conceptTitle: concept?.title.English || subjectName,
        actionMode,
        studentProgressSummary: progressSummary,
        history: messages,
      });
      setMessages((prev) => [...prev, { role: 'ai', text: res.reply }]);
      if (actionMode === 'study_plan') {
        setStudyPlanText(res.reply);
      }
    } finally {
      setLoading(false);
    }
  };

  const quickActions: Array<{ mode: SchoolTutorRequest['actionMode']; label: string }> = [
    { mode: 'explain', label: 'Explain Concept' },
    { mode: 'simplify', label: 'Simplify More' },
    { mode: 'examples', label: 'Real-Life Examples' },
    { mode: 'steps', label: 'Step-by-Step Method' },
    { mode: 'practice', label: 'Practice Problems' },
    { mode: 'mistake', label: 'Explain Common Mistakes' },
    { mode: 'revision', label: 'Revision Sheet' },
    { mode: 'weak_detect', label: 'Detect Weak Areas' },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const txt = input.trim();
    setInput('');
    triggerTutor('chat', txt);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      {/* Header Tabs */}
      <div className="bg-[#0B1930] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-sky-400/40 flex items-center justify-center">
            <Bot className="w-4 h-4 text-sky-300" />
          </div>
          <div>
            <div className="text-xs font-bold">AI Personal School Tutor · {langPack.nativeLabel}</div>
            <div className="text-[11px] text-slate-300">{classNameLabel} · {subjectName}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSubTab('tutor')}
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === 'tutor' ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Tutor Chat
          </button>
          <button
            type="button"
            onClick={() => setSubTab('flashcards')}
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === 'flashcards' ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Flashcards
          </button>
          <button
            type="button"
            onClick={() => {
              setSubTab('study_plan');
              if (!studyPlanText) {
                triggerTutor('study_plan', `Create my personalized 7-day study & revision plan for ${classNameLabel}`);
              }
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer whitespace-nowrap shrink-0 ${
              subTab === 'study_plan' ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            Study Planner
          </button>
        </div>
      </div>

      {subTab === 'tutor' && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Quick Pedagogical Actions */}
          <div className="flex flex-wrap gap-1.5">
            {quickActions.map((qa) => (
              <button
                key={qa.mode}
                type="button"
                disabled={loading}
                onClick={() => triggerTutor(qa.mode, `${qa.label} for ${concept?.title.English || subjectName}`)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-800 text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* Chat Feed */}
          <div className="h-72 overflow-y-auto space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-blue-600 text-white ml-10'
                    : 'bg-white border border-slate-200 text-slate-800 mr-6'
                }`}
              >
                <div dir={m.role === 'ai' && langPack.rtl ? 'rtl' : 'ltr'}>{m.text}</div>
                {m.role === 'ai' && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <VoiceLearningControls textToRead={m.text} language={language} compact />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-blue-600 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Preparing {language} explanation...</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask your doubt about ${concept?.title.English || subjectName} in ${language}...`}
                className="flex-1 px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Ask</span>
              </button>
            </div>
            <VoiceLearningControls
              language={language}
              compact
              onVoiceTranscript={(t) => setInput((prev) => (prev ? `${prev} ${t}` : t))}
            />
          </form>
        </div>
      )}

      {subTab === 'flashcards' && (
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Flashcard {cardIdx + 1} of {flashcards.length}</span>
            <span>Click card to flip</span>
          </div>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="w-full min-h-[160px] p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-blue-200 hover:border-blue-400 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-all"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
              <FlipHorizontal className="w-3.5 h-3.5" />
              <span>{flipped ? 'Answer / Summary' : 'Concept Prompt'}</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-slate-900">
              {flipped ? flashcards[cardIdx].back : flashcards[cardIdx].front}
            </div>
          </button>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setFlipped(false);
                setCardIdx((i) => (i - 1 + flashcards.length) % flashcards.length);
              }}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
            >
              Previous Card
            </button>
            <button
              type="button"
              onClick={() => {
                setFlipped(false);
                setCardIdx((i) => (i + 1) % flashcards.length);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white cursor-pointer"
            >
              Next Card
            </button>
          </div>
        </div>
      )}

      {subTab === 'study_plan' && (
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>AI 7-Day Balanced Study &amp; Revision Planner</span>
            </div>
            <button
              type="button"
              onClick={() =>
                triggerTutor('study_plan', `Refresh my 7-day study & revision plan for ${classNameLabel} ${subjectName}`)
              }
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate Plan</span>
            </button>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed min-h-[160px]">
            {loading ? 'Building personalized study plan...' : studyPlanText || 'Click Regenerate Plan to generate your schedule.'}
          </div>
        </div>
      )}
    </div>
  );
};
