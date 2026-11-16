import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ExternalLink,
  Filter,
  Globe,
  Info,
  Landmark,
  Search,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ALL_INDIA_BOARDS,
  ALL_INDIA_BOARD_STATS,
  ALL_INDIA_LANGUAGES,
} from '../../data/allIndiaBoardsData';
import { AllIndiaBoardRecord, BoardCategory } from '../../types';
import { getAllIndiaBoards } from '../../services/schoolService';

interface AllIndiaBoardDirectoryProps {
  selectedDirectoryBoardId?: string;
  onSelectBoard: (board: AllIndiaBoardRecord) => void;
  compact?: boolean;
}

type CategoryFilter = 'All' | BoardCategory;
type StructureFilter = 'all' | 'separate_board' | 'cbse_scert';

export const AllIndiaBoardDirectory: React.FC<AllIndiaBoardDirectoryProps> = ({
  selectedDirectoryBoardId,
  onSelectBoard,
  compact = false,
}) => {
  const [boards, setBoards] = useState<AllIndiaBoardRecord[]>(ALL_INDIA_BOARDS);
  const [syncedCount, setSyncedCount] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [structureFilter, setStructureFilter] = useState<StructureFilter>('all');
  const [mediumFilter, setMediumFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [detailBoard, setDetailBoard] = useState<AllIndiaBoardRecord | null>(null);

  useEffect(() => {
    let mounted = true;
    getAllIndiaBoards().then((res) => {
      if (!mounted) return;
      setBoards(res.boards);
      setSyncedCount(res.syncedCount);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const activeBoards = useMemo(() => boards.filter((b) => b.isActive), [boards]);

  const filteredBoards = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activeBoards.filter((b) => {
      if (categoryFilter !== 'All' && b.category !== categoryFilter) return false;
      if (structureFilter === 'separate_board' && !b.hasSeparateStateBoard) return false;
      if (structureFilter === 'cbse_scert' && b.hasSeparateStateBoard) return false;
      if (mediumFilter !== 'All') {
        const hasMed = b.supportedMediums.some((m) =>
          m.toLowerCase().includes(mediumFilter.toLowerCase())
        );
        if (!hasMed) return false;
      }
      if (!q) return true;
      return (
        b.officialName.toLowerCase().includes(q) ||
        b.shortName.toLowerCase().includes(q) ||
        b.stateOrUt.toLowerCase().includes(q) ||
        b.scertBody.toLowerCase().includes(q) ||
        (b.secondaryBoardName || '').toLowerCase().includes(q) ||
        (b.seniorSecondaryBoardName || '').toLowerCase().includes(q)
      );
    });
  }, [activeBoards, categoryFilter, structureFilter, mediumFilter, searchQuery]);

  const categoryCounts = useMemo(
    () => ({
      All: activeBoards.length,
      National: activeBoards.filter((b) => b.category === 'National').length,
      International: activeBoards.filter((b) => b.category === 'International').length,
      State: activeBoards.filter((b) => b.category === 'State').length,
      'Union Territory': activeBoards.filter((b) => b.category === 'Union Territory').length,
    }),
    [activeBoards]
  );

  return (
    <div className="space-y-6">
      {/* Editorial Directory Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-widest text-blue-700 flex items-center gap-1.5">
              <Landmark className="w-4 h-4" />
              <span>Phase 1 · Official All-India Education Board Directory</span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
              National, International, 28 States &amp; 8 Union Territory Curricula
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
              Each jurisdiction is mapped strictly to its official statutory board (including split Class 10 / Class 12 authorities, Assam&apos;s unified ASSEB, Karnataka KSEAB, or CBSE/SCERT where no separate exam board exists).
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-bold tabular-nums shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
              {activeBoards.length} Active Authorities
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {syncedCount > 0
                  ? `${syncedCount} Synced in Firestore`
                  : `${ALL_INDIA_BOARD_STATS.total} Canonical Baseline`}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Counters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-100">
          {[
            { label: 'Total Authorities', value: categoryCounts.All, sub: 'India + Int\'l' },
            { label: 'National Boards', value: categoryCounts.National, sub: 'CBSE · CISCE · NIOS' },
            { label: 'International', value: categoryCounts.International, sub: 'IB · Cambridge' },
            { label: 'Indian States', value: categoryCounts.State, sub: 'All 28 States' },
            { label: 'Union Territories', value: categoryCounts['Union Territory'], sub: 'All 8 UTs' },
            { label: 'Mediums Tracked', value: ALL_INDIA_LANGUAGES.length, sub: 'EN · HI · KN + 12' },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {stat.label}
              </div>
              <div className="font-heading font-extrabold text-xl text-slate-900 mt-0.5 tabular-nums">
                {stat.value}
              </div>
              <div className="text-[11px] text-slate-500 truncate">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Tabs + Search + Medium Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              [
                { id: 'All', label: `All Boards (${categoryCounts.All})` },
                { id: 'National', label: `National (${categoryCounts.National})` },
                { id: 'International', label: `International (${categoryCounts.International})` },
                { id: 'State', label: `28 States (${categoryCounts.State})` },
                { id: 'Union Territory', label: `8 UTs (${categoryCounts['Union Territory']})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  categoryFilter === tab.id
                    ? 'bg-[#0B1930] text-white border-[#0B1930]'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-500 tabular-nums">
            Showing {filteredBoards.length} of {activeBoards.length} authorities
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search state, UT, board acronym (e.g., ASSEB, KSEAB, CBSE, IB, Maharashtra)..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={mediumFilter}
              onChange={(e) => setMediumFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="All">All Mediums of Instruction</option>
              {ALL_INDIA_LANGUAGES.slice(0, 14).map((l) => (
                <option key={l.id} value={l.name}>
                  {l.name} ({l.nativeScript})
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={structureFilter}
              onChange={(e) => setStructureFilter(e.target.value as StructureFilter)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg bg-white text-slate-800"
            >
              <option value="all">All Statutory Structures</option>
              <option value="separate_board">Own Examination Board</option>
              <option value="cbse_scert">CBSE / SCERT (No Separate Board)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Directory Grid */}
      {filteredBoards.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-2">
          <div className="font-heading font-bold text-slate-900 text-sm">
            No education board matched your current filters.
          </div>
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('All');
              setStructureFilter('all');
              setMediumFilter('All');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
          >
            Reset Directory Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBoards.map((board) => {
            const isSelected = selectedDirectoryBoardId === board.id;
            return (
              <div
                key={board.id}
                className={`bg-white border rounded-2xl p-5 flex flex-col justify-between transition-all ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-100 shadow-sm'
                    : 'border-slate-200 hover:border-blue-400'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Metadata Line (no pills/dots) */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                      {board.category} · {board.stateOrUt}
                    </div>
                    <span
                      className={`text-[11px] font-bold shrink-0 ${
                        board.verificationStatus === 'Verified'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {board.verificationStatus === 'Verified'
                        ? 'Verified'
                        : board.verificationStatus}
                    </span>
                  </div>

                  {/* Official Name & Acronym */}
                  <div>
                    <div className="font-heading font-extrabold text-base text-slate-900 leading-snug">
                      {board.shortName}
                    </div>
                    <div className="text-xs font-medium text-slate-600 mt-0.5 line-clamp-2">
                      {board.officialName}
                    </div>
                  </div>

                  {/* Statutory Breakdown */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-[11px] text-slate-700">
                    <div>
                      <span className="font-bold text-slate-900">Structure: </span>
                      <span>{board.affiliationMode}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Academic / SCERT: </span>
                      <span className="line-clamp-1">{board.scertBody}</span>
                    </div>
                    {board.secondaryBoardName && (
                      <div>
                        <span className="font-bold text-slate-900">Class 10: </span>
                        <span>{board.secondaryBoardName}</span>
                      </div>
                    )}
                    {board.seniorSecondaryBoardName && (
                      <div>
                        <span className="font-bold text-slate-900">Class 12: </span>
                        <span>{board.seniorSecondaryBoardName}</span>
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-slate-900">Grades: </span>
                      <span>{board.gradeRangeSummary}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Mediums: </span>
                      <span>{board.supportedMediums.join(', ')}</span>
                    </div>
                  </div>

                  {!compact && board.subProgrammes.length > 0 && (
                    <div className="text-[11px] text-slate-500 line-clamp-2">
                      <span className="font-semibold text-slate-700">Programmes: </span>
                      {board.subProgrammes.join(' · ')}
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDetailBoard(board)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-700 whitespace-nowrap cursor-pointer"
                    >
                      <Info className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                    <a
                      href={board.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 whitespace-nowrap"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectBoard(board)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#0B1930] hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active Board</span>
                      </>
                    ) : (
                      <>
                        <span>Select Board</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* All-India Mediums of Instruction Reference */}
      {!compact && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                <span>All-India Regional Mediums &amp; Script Coverage</span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                Live AI Concept Explanations, Voice TTS &amp; Speech-to-Text are active in English, Kannada &amp; Hindi; additional regional media layers connect across upcoming Phases 3–4.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 tabular-nums shrink-0">
              {ALL_INDIA_LANGUAGES.length} Language Tracks
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {ALL_INDIA_LANGUAGES.map((lang) => (
              <div
                key={lang.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-0.5"
              >
                <div className="font-bold text-slate-900 flex items-center justify-between gap-1">
                  <span>{lang.name}</span>
                  {lang.aiTutorSupported && (
                    <Sparkles className="w-3 h-3 text-blue-600 shrink-0" />
                  )}
                </div>
                <div className="text-blue-700 font-semibold">{lang.nativeScript}</div>
                <div className="text-[11px] text-slate-500 truncate">{lang.regionHint}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Authority Details Modal */}
      {detailBoard && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  {detailBoard.category} · {detailBoard.stateOrUt}
                </div>
                <h3 className="font-heading font-extrabold text-xl text-slate-900 mt-1">
                  {detailBoard.officialName}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Curriculum Track Group: {detailBoard.curriculumGroupId} · Record ID: {detailBoard.id}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailBoard(null)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                aria-label="Close board details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-500 uppercase text-[10px]">Statutory Structure</div>
                <div className="font-bold text-slate-900 mt-1">{detailBoard.affiliationMode}</div>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-500 uppercase text-[10px]">SCERT / Academic Authority</div>
                <div className="font-bold text-slate-900 mt-1">{detailBoard.scertBody}</div>
              </div>
              {detailBoard.secondaryBoardName && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-500 uppercase text-[10px]">Secondary Board (Class 10)</div>
                  <div className="font-bold text-slate-900 mt-1">{detailBoard.secondaryBoardName}</div>
                </div>
              )}
              {detailBoard.seniorSecondaryBoardName && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-500 uppercase text-[10px]">Sr. Secondary Board (Class 12)</div>
                  <div className="font-bold text-slate-900 mt-1">{detailBoard.seniorSecondaryBoardName}</div>
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>Official Grade Levels ({detailBoard.officialGradeLevels.length} Classes)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {detailBoard.officialGradeLevels.map((cls) => (
                  <span
                    key={cls}
                    className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-bold text-slate-800"
                  >
                    {cls === 'LKG' || cls === 'UKG' ? cls : `Class ${cls}`}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Grading &amp; Assessment System</span>
              </div>
              <p className="text-slate-700 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl p-3">
                {detailBoard.gradingSummary}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-slate-900">Verification &amp; Source Notes</div>
              <p className="text-slate-600 leading-relaxed">{detailBoard.sourceNote}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
              <div className="flex flex-wrap gap-3">
                <a
                  href={detailBoard.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline"
                >
                  <span>Official Board Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                {detailBoard.officialSyllabusUrl && (
                  <a
                    href={detailBoard.officialSyllabusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:underline"
                  >
                    <span>Official Syllabus / SCERT Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectBoard(detailBoard);
                  setDetailBoard(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0B1930] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
              >
                <span>Open {detailBoard.shortName} Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
