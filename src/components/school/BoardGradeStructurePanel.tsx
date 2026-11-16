import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  GitBranch,
  GraduationCap,
  Layers,
  Sliders,
} from 'lucide-react';
import {
  BoardGradeFramework,
  SchoolClassId,
  SchoolStreamId,
} from '../../types';
import { computePercentageWithFramework } from '../../data/boardGradeFrameworkData';
import { SCHOOL_ACADEMIC_YEARS } from '../../data/schoolCurriculumData';

interface BoardGradeStructurePanelProps {
  framework: BoardGradeFramework;
  selectedClassId: SchoolClassId;
  selectedAcademicYear: string;
  selectedVersionId: string;
  selectedStream: SchoolStreamId;
  onSelectClass: (classId: SchoolClassId) => void;
  onSelectAcademicYear: (year: string) => void;
  onSelectVersionId: (versionId: string) => void;
  onSelectStream: (stream: SchoolStreamId) => void;
  onOpenSubjectsWorkspace: () => void;
}

export const BoardGradeStructurePanel: React.FC<BoardGradeStructurePanelProps> = ({
  framework,
  selectedClassId,
  selectedAcademicYear,
  selectedVersionId,
  selectedStream,
  onSelectClass,
  onSelectAcademicYear,
  onSelectVersionId,
  onSelectStream,
  onOpenSubjectsWorkspace,
}) => {
  const [simulatedScore, setSimulatedScore] = useState<number>(84);

  const simulatedResult = useMemo(
    () => computePercentageWithFramework(framework, simulatedScore),
    [framework, simulatedScore]
  );

  const activeStage = useMemo(
    () =>
      framework.stages.find((s) => s.classId === selectedClassId) ||
      framework.stages[0],
    [framework.stages, selectedClassId]
  );

  const activeVersion = useMemo(
    () =>
      framework.curriculumVersions.find((v) => v.id === selectedVersionId) ||
      framework.curriculumVersions[0],
    [framework.curriculumVersions, selectedVersionId]
  );

  return (
    <div className="space-y-6">
      {/* Architecture Header + Academic Year & Curriculum Version Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Phase 2 · Class, Stage &amp; Curriculum Version Management</span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
              {framework.boardShortName} · {framework.structurePattern}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Official grade progression from Pre-Primary (LKG/UKG) through Class 12, board-authentic assessment milestones, curriculum versions, and grading scale conversions.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenSubjectsWorkspace}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B1930] hover:bg-blue-700 text-white text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open {activeStage?.boardLevelTitle || selectedClassId} Subjects</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Academic Year & Curriculum Version Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4 border-t border-slate-100">
          <div className="lg:col-span-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Academic Year Cohort</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SCHOOL_ACADEMIC_YEARS.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => onSelectAcademicYear(yr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tabular-nums whitespace-nowrap cursor-pointer border transition-colors ${
                    selectedAcademicYear === yr
                      ? 'bg-[#0B1930] text-white border-[#0B1930]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-slate-500">
              Active Stage: <strong className="text-slate-800">{activeStage?.officialStageName}</strong>
            </div>
          </div>

          <div className="lg:col-span-8 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                <span>Board Curriculum Version</span>
              </div>
              {activeVersion && (
                <span className="text-[11px] font-bold text-emerald-700">
                  {activeVersion.status} Version
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {framework.curriculumVersions.map((ver) => {
                const isSelected = selectedVersionId === ver.id || (!selectedVersionId && ver.isDefault);
                return (
                  <button
                    key={ver.id}
                    type="button"
                    onClick={() => onSelectVersionId(ver.id)}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-blue-600 ring-1 ring-blue-200'
                        : 'bg-white/70 border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-xs text-slate-900">{ver.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {ver.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 14-Level Grade & Stage Progression Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              All 14 School Grade Levels · {framework.boardShortName} Mapping
            </h3>
            <p className="text-xs text-slate-500">
              Select any grade level below to inspect its board-specific stage nomenclature and switch your active study workspace.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 tabular-nums shrink-0">
            {framework.stages.filter((s) => s.availableInBoard).length} Direct · {framework.stages.filter((s) => !s.availableInBoard).length} Bridge
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {framework.stages.map((stage) => {
            const isActive = stage.classId === selectedClassId;
            return (
              <button
                key={stage.classId}
                type="button"
                onClick={() => onSelectClass(stage.classId)}
                className={`text-left p-3.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B1930] text-white border-[#0B1930] shadow-sm'
                    : stage.availableInBoard
                    ? 'bg-slate-50/70 hover:bg-white border-slate-200 hover:border-blue-500 text-slate-900'
                    : 'bg-slate-50/40 border-dashed border-slate-300 text-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-1 text-[10px] font-bold uppercase tracking-wider">
                    <span className={isActive ? 'text-sky-300' : 'text-blue-700'}>
                      {stage.classId === 'LKG' || stage.classId === 'UKG' ? stage.classId : `Std ${stage.classId}`}
                    </span>
                    <span className={isActive ? 'text-slate-300' : 'text-slate-500'}>
                      {stage.availableInBoard ? 'Official' : 'Bridge'}
                    </span>
                  </div>
                  <div className="font-heading font-bold text-xs leading-snug">
                    {stage.boardLevelTitle}
                  </div>
                  <div className={`text-[11px] leading-snug line-clamp-2 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                    {stage.officialStageName}
                  </div>
                </div>

                {stage.boardExamMilestone && (
                  <div
                    className={`mt-2.5 pt-2 border-t text-[10px] font-bold leading-snug ${
                      isActive
                        ? 'border-blue-800 text-amber-300'
                        : 'border-slate-200 text-indigo-700'
                    }`}
                  >
                    Milestone: {stage.boardExamMilestone}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {activeStage && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-slate-900">
                Selected Level: {activeStage.boardLevelTitle} ({activeStage.officialStageName})
              </div>
              <div className="text-slate-600">
                Assessment Structure: {activeStage.assessmentMode}
                {activeStage.boardExamMilestone ? ` · ${activeStage.boardExamMilestone}` : ''}
              </div>
            </div>
            {!activeStage.availableInBoard && (
              <span className="text-xs font-bold text-amber-800 shrink-0">
                Pre-entry readiness track (Full board registration begins at Class 1)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Interactive Board Grading Calculator + Senior Secondary Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Grading Simulator & Official Bands */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Board Grading Scale &amp; Score Converter</span>
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 mt-0.5">
                {framework.gradingScaleName}
              </h3>
            </div>
          </div>

          {/* Interactive Percentage Slider */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs">
              <label htmlFor="board-score-sim" className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                <span>Simulated Assessment Percentage (%)</span>
              </label>
              <span className="font-mono font-extrabold text-sm text-blue-700 tabular-nums">
                {simulatedScore}%
              </span>
            </div>
            <input
              id="board-score-sim"
              type="range"
              min={0}
              max={100}
              value={simulatedScore}
              onChange={(e) => setSimulatedScore(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">Converted Grade: </span>
                <strong className="text-slate-900 text-sm font-heading">{simulatedResult.grade}</strong>
                {typeof simulatedResult.points === 'number' && (
                  <span className="text-slate-600 tabular-nums"> · {simulatedResult.points} Grade Points</span>
                )}
              </div>
              <div className="font-semibold text-blue-800">{simulatedResult.remark}</div>
            </div>
          </div>

          <div className="text-xs text-slate-600">
            <strong>Passing Standard:</strong> {framework.passingRule}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs tabular-nums">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase">
                  <th className="py-2 pr-3">Grade</th>
                  <th className="py-2 pr-3">Score Range</th>
                  <th className="py-2 pr-3">Points</th>
                  <th className="py-2">Official Descriptor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {framework.gradingBands.map((b) => (
                  <tr key={b.grade} className="hover:bg-slate-50/70">
                    <td className="py-2 pr-3 font-bold text-slate-900">{b.grade}</td>
                    <td className="py-2 pr-3 text-slate-600">
                      {Math.round(b.minPercent)}% – {Math.round(b.maxPercent)}%
                    </td>
                    <td className="py-2 pr-3 text-slate-600">
                      {typeof b.points === 'number' ? b.points : '—'}
                    </td>
                    <td className="py-2 text-slate-700">{b.descriptor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Senior Secondary Stream Combinations (Classes 11-12) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>Senior Secondary Stream Matrix (Classes 11–12)</span>
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 mt-0.5">
                {framework.boardShortName} Prescribed Subject Tracks
              </h3>
            </div>

            <div className="space-y-2.5">
              {framework.streamStructure.map((st) => {
                const isSelected = selectedStream === st.streamId;
                return (
                  <button
                    key={st.streamId}
                    type="button"
                    onClick={() => onSelectStream(st.streamId)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading font-bold text-xs">{st.boardStreamTitle}</span>
                      <span className={`text-[11px] font-bold ${isSelected ? 'text-sky-300' : 'text-blue-700'}`}>
                        {isSelected ? 'Selected' : st.streamId}
                      </span>
                    </div>
                    <div className={`text-[11px] mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-600'}`}>
                      Core: {st.coreSubjects.join(' · ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Selecting a stream automatically updates Class 11–12 subject combinations and timetable templates without mixing tracks across boards.
          </div>
        </div>
      </div>
    </div>
  );
};
