import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Compass,
  Globe,
  GraduationCap,
  Landmark,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Link } from '../../router/RouterContext';
import { SCHOOL_BOARDS, SCHOOL_CLASSES } from '../../data/schoolCurriculumData';
import { ALL_INDIA_BOARD_STATS } from '../../data/allIndiaBoardsData';
import { SchoolBoardId } from '../../types';

export const HomepageSchoolSection: React.FC = () => {
  const [selectedBoard, setSelectedBoard] = useState<SchoolBoardId>('KAR_STATE');
  const activeBoard = SCHOOL_BOARDS.find((b) => b.id === selectedBoard) || SCHOOL_BOARDS[0];

  return (
    <section
      id="school-education-section"
      className="py-20 bg-[#FAF7F2] border-b border-slate-200/80 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-3xl space-y-2.5">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#123D32]">
              <GraduationCap className="w-4 h-4 text-[#123D32]" />
              <span>OpenFrame School Academic System</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-editorial font-semibold text-[#18221F] tracking-tight">
              School Education <span className="text-[#123D32]">· LKG – Class 12</span>
            </h2>
            <p className="text-base sm:text-lg text-[#18221F]/80 font-medium leading-relaxed">
              Complete School Learning – From Basic Concepts to Advanced Education.
            </p>
            <p className="text-xs sm:text-sm text-[#64748B]">
              Dedicated class dashboards with board-isolated syllabi across {ALL_INDIA_BOARD_STATS.total} verified authorities (National CBSE/CISCE/NIOS, IB &amp; Cambridge, all {ALL_INDIA_BOARD_STATS.stateCount} Indian States &amp; {ALL_INDIA_BOARD_STATS.utCount} Union Territories), multilingual learning in Kannada, English &amp; Hindi, AI Tutor, 8-format quizzes, and Virtual Labs.
            </p>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-3">
            <Link
              to="/school?tab=boards"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-slate-300 hover:border-[#123D32] text-[#18221F] font-semibold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0"
            >
              <Landmark className="w-4 h-4 text-[#123D32]" />
              <span>All-India Boards ({ALL_INDIA_BOARD_STATS.total})</span>
            </Link>
            <Link
              to={`/school?board=${selectedBoard}`}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#123D32] hover:bg-[#0e3027] text-white font-semibold text-sm shadow-sm transition-all group whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Explore School Education</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Education Board Switcher Bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#123D32] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#123D32]" />
                <span>Select Curriculum Board (Strictly Isolated Syllabi)</span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                {activeBoard.name} — Supported Mediums: {activeBoard.supportedMediums.join(' · ')}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SCHOOL_BOARDS.map((b) => {
                const isSelected = b.id === selectedBoard;
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBoard(b.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#123D32] text-white border-[#123D32] shadow-xs'
                        : 'bg-[#FAF7F2] text-[#18221F] border-slate-200 hover:border-[#123D32]'
                    }`}
                  >
                    {b.shortName}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B]">
            <span className="flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#123D32]" />
              <span>Multilingual Mode: English · ಕನ್ನಡ (Kannada) · हिन्दी (Hindi) with Voice TTS &amp; STT</span>
            </span>
            <span>{activeBoard.gradingRuleSummary}</span>
          </div>
        </div>

        {/* Dedicated 14 Class Cards Grid (LKG to 12th Standard) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
          {SCHOOL_CLASSES.map((cls) => (
            <Link
              key={cls.id}
              to={`/school/class/${cls.id}?board=${selectedBoard}`}
              className="group bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-500 rounded-xl p-4 flex flex-col justify-between transition-all shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cls.accentColor} text-white font-heading font-extrabold text-xs flex items-center justify-center shadow-xs`}
                  >
                    {cls.id === 'LKG' || cls.id === 'UKG' ? cls.id : `${cls.id}`}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {cls.stage}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                  {cls.label}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-snug">
                  {cls.description}
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-600">
                <span>{cls.hasStreams ? 'Streams' : cls.ageRange}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Capabilities Summary Strip */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">Chapter → Concept Mastery</div>
              <p className="text-slate-600 mt-0.5">
                Every concept carries simple &amp; detailed notes, worked examples, interactive SVG diagrams, video lessons, and revision sheets.
              </p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">AI Tutor &amp; 8-Format Quizzes</div>
              <p className="text-slate-600 mt-0.5">
                Daily learning plans, MCQ, Fill-in-Blank, True/False, Match, Numerical, Diagram &amp; Short/Long answers with teacher rubric control.
              </p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <Compass className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">Labs, Parents &amp; Career Prep</div>
              <p className="text-slate-600 mt-0.5">
                Virtual Science &amp; Math labs, LKG–5 Handwriting Pad, Parent Progress tracking, and Class 8–12 career pathways.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
