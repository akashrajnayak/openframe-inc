import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Globe,
  Languages,
  Mic,
  Search,
  ShieldCheck,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { AllIndiaBoardRecord, SchoolLanguage } from '../../types';
import {
  ALL_INDIA_LANGUAGE_PACKS,
  ALL_INDIA_TECH_GLOSSARY,
  getBoardRecommendedLanguages,
  getLanguagePack,
} from '../../data/allIndiaLanguagesData';
import { VoiceLearningControls } from './VoiceLearningControls';

interface MultilingualLanguagePanelProps {
  activeLanguage: SchoolLanguage;
  selectedDirectoryBoard: AllIndiaBoardRecord | null;
  activeConceptTitle?: string;
  onSelectLanguage: (lang: SchoolLanguage) => void;
  onTranslateActiveConcept?: (lang: SchoolLanguage) => void;
}

export const MultilingualLanguagePanel: React.FC<MultilingualLanguagePanelProps> = ({
  activeLanguage,
  selectedDirectoryBoard,
  activeConceptTitle,
  onSelectLanguage,
  onTranslateActiveConcept,
}) => {
  const [glossarySearch, setGlossarySearch] = useState('');
  const [glossarySubject, setGlossarySubject] = useState('All');
  const [availableVoiceLangs, setAvailableVoiceLangs] = useState<string[]>([]);
  const [voicePracticeInput, setVoicePracticeInput] = useState('');

  const activePack = useMemo(() => getLanguagePack(activeLanguage), [activeLanguage]);
  const recommendedLanguages = useMemo(
    () => getBoardRecommendedLanguages(selectedDirectoryBoard),
    [selectedDirectoryBoard]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const syncVoices = () => {
      try {
        const list = window.speechSynthesis.getVoices() || [];
        setAvailableVoiceLangs(list.map((v) => v.lang.toLowerCase()));
      } catch {
        setAvailableVoiceLangs([]);
      }
    };
    syncVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', syncVoices);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', syncVoices);
  }, []);

  const hasOsVoice = (bcp47: string) => {
    const lower = bcp47.toLowerCase();
    const prefix = lower.split('-')[0];
    return availableVoiceLangs.some((v) => v === lower || v.startsWith(prefix));
  };

  const glossarySubjects = useMemo(() => {
    const set = new Set<string>(['All']);
    ALL_INDIA_TECH_GLOSSARY.forEach((g) => set.add(g.subject));
    return Array.from(set);
  }, []);

  const filteredGlossary = useMemo(() => {
    const q = glossarySearch.trim().toLowerCase();
    return ALL_INDIA_TECH_GLOSSARY.filter((entry) => {
      if (glossarySubject !== 'All' && entry.subject !== glossarySubject) return false;
      if (!q) return true;
      const regional = (entry.translations[activeLanguage] || '').toLowerCase();
      return (
        entry.english.toLowerCase().includes(q) ||
        entry.definition.toLowerCase().includes(q) ||
        entry.subject.toLowerCase().includes(q) ||
        regional.includes(q)
      );
    });
  }, [glossarySearch, glossarySubject, activeLanguage]);

  return (
    <div className="space-y-6">
      {/* Header Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <Languages className="w-4 h-4" />
              <span>All-India 14-Language Learning &amp; Voice Studio</span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 mt-1">
              Active Learning Language: {activePack.nativeLabel}
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">
              Switch seamlessly between 14 recognized Indian education languages without losing concept mastery,
              quizzes, XP, or attendance progress. Technical terms are always paired with exact English exam terminology.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onTranslateActiveConcept && activeConceptTitle && activeLanguage !== 'English' && (
              <button
                type="button"
                onClick={() => onTranslateActiveConcept(activeLanguage)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Translate &quot;{activeConceptTitle}&quot;</span>
              </button>
            )}
          </div>
        </div>

        {/* Board-Recommended Mediums Strip */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-bold text-slate-800 block">
              Recommended for {selectedDirectoryBoard?.shortName || 'Selected Board'}:
            </span>
            <span className="text-slate-500">
              {selectedDirectoryBoard
                ? `Official mediums: ${selectedDirectoryBoard.supportedMediums.join(', ')}`
                : 'National & State Board Multilingual Mediums'}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendedLanguages.map((recLang) => {
              const pack = getLanguagePack(recLang);
              const isActive = activeLanguage === recLang;
              return (
                <button
                  key={recLang}
                  type="button"
                  onClick={() => onSelectLanguage(recLang)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border whitespace-nowrap shrink-0 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#0B1930] text-white border-[#0B1930]'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-blue-500 hover:text-blue-700'
                  }`}
                >
                  {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
                  <span>{pack.nativeLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 14-Language All-India Matrix */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Select Medium / Explanation Language (14 Official Indian Scripts)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Supports concept explanations, AI Tutor Q&amp;A, 8-format quizzes, Web Speech Text-to-Speech, and voice dictation.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {ALL_INDIA_LANGUAGE_PACKS.map((pack) => {
            const isSelected = pack.id === activeLanguage;
            const voiceReady = hasOsVoice(pack.bcp47Code);
            const isBoardMatch = recommendedLanguages.includes(pack.id);
            return (
              <button
                key={pack.id}
                type="button"
                onClick={() => onSelectLanguage(pack.id)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600'
                    : 'bg-slate-50/60 border-slate-200 hover:border-blue-400 hover:bg-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-heading font-extrabold text-slate-900">
                      {pack.nativeLabel}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-600">
                    Script: {pack.scriptName} · Code: {pack.bcp47Code}
                    {pack.rtl ? ' · RTL' : ''}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {pack.primaryRegions.slice(0, 3).join(', ')}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/70 text-[10px] font-bold">
                  <span className={voiceReady ? 'text-emerald-700' : 'text-slate-500'}>
                    {voiceReady ? 'OS Voice Ready' : 'Web Speech + AI Ready'}
                  </span>
                  {isBoardMatch && (
                    <span className="text-blue-700">Board Medium</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Regional Voice Read-Aloud & Dictation Practice */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <Volume2 className="w-4 h-4" />
            <span>Text-to-Speech Reading Practice ({activePack.bcp47Code})</span>
          </div>
          <p
            dir={activePack.rtl ? 'rtl' : 'ltr'}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 leading-relaxed font-medium"
          >
            {activePack.sampleSentence}
          </p>
          <VoiceLearningControls
            textToRead={activePack.sampleSentence}
            language={activeLanguage}
          />
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <Mic className="w-4 h-4" />
            <span>Speech-to-Text Voice Answer Practice ({activePack.name})</span>
          </div>
          <textarea
            dir={activePack.rtl ? 'rtl' : 'ltr'}
            rows={2}
            value={voicePracticeInput}
            onChange={(e) => setVoicePracticeInput(e.target.value)}
            placeholder={`Click Speak (${activePack.name}) and read a science or math answer aloud...`}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white text-slate-900"
          />
          <VoiceLearningControls
            language={activeLanguage}
            onVoiceTranscript={(t) =>
              setVoicePracticeInput((prev) => (prev ? `${prev} ${t}` : t))
            }
          />
        </div>
      </div>

      {/* All-India Technical Terminology Guard Dictionary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Technical Terminology Preservation Guard</span>
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 mt-0.5">
              Accurate Scientific &amp; Exam Terms ({activePack.name} &amp; English)
            </h3>
            <p className="text-xs text-slate-500">
              Standard technical terms are never mistranslated literally — English exam keywords remain paired in parentheses.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={glossarySearch}
                onChange={(e) => setGlossarySearch(e.target.value)}
                placeholder="Search concept or term..."
                className="pl-8 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 w-48"
              />
            </div>
            <select
              value={glossarySubject}
              onChange={(e) => setGlossarySubject(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              {glossarySubjects.map((s) => (
                <option key={s} value={s}>
                  {s === 'All' ? 'All Subjects' : s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredGlossary.map((item) => {
            const localizedTerm =
              item.translations[activeLanguage] || item.english;
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{item.subject}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    EN: {item.english}
                  </span>
                </div>
                <div
                  dir={activePack.rtl ? 'rtl' : 'ltr'}
                  className="text-sm font-heading font-bold text-slate-900"
                >
                  {localizedTerm}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.definition}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
