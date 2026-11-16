import React, { useEffect, useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  Edit2,
  ExternalLink,
  FileSpreadsheet,
  GraduationCap,
  Landmark,
  Loader2,
  Megaphone,
  Plus,
  RefreshCw,
  Upload,
  Users,
  X,
} from 'lucide-react';
import {
  SCHOOL_BOARDS,
  SCHOOL_CLASSES,
} from '../../data/schoolCurriculumData';
import { ALL_INDIA_BOARDS } from '../../data/allIndiaBoardsData';
import {
  AllIndiaBoardRecord,
  BoardAffiliationMode,
  BoardCategory,
  BoardGradeFramework,
  SchoolAnnouncement,
  SchoolBoardId,
  SchoolClassId,
  SchoolExamination,
  SchoolFeeRecord,
  SchoolMarkEntry,
  SchoolMarksCategory,
  SchoolStudentEnrollment,
  SchoolSubject,
} from '../../types';
import {
  createSchoolAnnouncement,
  getAllIndiaBoards,
  getAllSchoolEnrollments,
  getBoardGradeFramework,
  getCustomSchoolSubjects,
  getSchoolAnnouncements,
  getSchoolExaminations,
  getSchoolFees,
  getSchoolMarks,
  importParsedCurriculumRowsToFirestore,
  parseCurriculumImportFile,
  recordSchoolMark,
  saveBoardGradeFramework,
  saveSchoolBoardDirectoryDoc,
  saveSchoolExamination,
  saveSchoolFeeRecord,
  saveSchoolTimetableSlot,
  seedAllIndiaBoardsToFirestore,
} from '../../services/schoolService';

const MARKS_CATEGORIES: SchoolMarksCategory[] = [
  'Quiz',
  'Chapter Test',
  'Assignment',
  'Monthly Test',
  'Quarterly Exam',
  'Half-Yearly Exam',
  'Annual Exam',
  'Practical',
  'Project',
  'Presentation',
];

export const AdminSchoolManagement: React.FC = () => {
  const [subTab, setSubTab] = useState<'students' | 'boards' | 'curriculum' | 'exams' | 'timetable' | 'fees'>('students');
  const [enrollments, setEnrollments] = useState<SchoolStudentEnrollment[]>([]);
  const [allBoards, setAllBoards] = useState<AllIndiaBoardRecord[]>(ALL_INDIA_BOARDS);
  const [syncedBoardsCount, setSyncedBoardsCount] = useState(0);
  const [boardCategoryFilter, setBoardCategoryFilter] = useState<'All' | BoardCategory>('All');
  const [boardSearch, setBoardSearch] = useState('');
  const [seedingBoards, setSeedingBoards] = useState(false);
  const [editingBoard, setEditingBoard] = useState<AllIndiaBoardRecord | null>(null);
  const [savingBoardEdit, setSavingBoardEdit] = useState(false);
  const [editingFramework, setEditingFramework] = useState<BoardGradeFramework | null>(null);
  const [savingFramework, setSavingFramework] = useState(false);
  const [newVersionLabel, setNewVersionLabel] = useState('');
  const [newVersionYear, setNewVersionYear] = useState('2026-2027');

  const [customSubjects, setCustomSubjects] = useState<SchoolSubject[]>([]);
  const [marks, setMarks] = useState<SchoolMarkEntry[]>([]);
  const [exams, setExams] = useState<SchoolExamination[]>([]);
  const [fees, setFees] = useState<SchoolFeeRecord[]>([]);
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  // Importer State
  const [importing, setImporting] = useState(false);

  // Mark / Exam Creation State
  const [examTitle, setExamTitle] = useState('');
  const [examBoard, setExamBoard] = useState<SchoolBoardId>('CBSE');
  const [examClass, setExamClass] = useState<SchoolClassId>('10');
  const [examCat, setExamCat] = useState<SchoolMarksCategory>('Monthly Test');
  const [examSubject, setExamSubject] = useState('Mathematics');
  const [examDate, setExamDate] = useState('2026-12-10');
  const [examMaxMarks, setExamMaxMarks] = useState(100);

  const [markStudentUid, setMarkStudentUid] = useState('');
  const [markSubject, setMarkSubject] = useState('Mathematics');
  const [markCategory, setMarkCategory] = useState<SchoolMarksCategory>('Annual Exam');
  const [markTitle, setMarkTitle] = useState('Term Assessment');
  const [markObtained, setMarkObtained] = useState(85);
  const [markMax, setMarkMax] = useState(100);

  // Announcement State
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');

  // Fee State
  const [feeStudentUid, setFeeStudentUid] = useState('');
  const [feeTerm, setFeeTerm] = useState('Term 1 Tuition 2026-27');
  const [feeAmount, setFeeAmount] = useState(15000);
  const [feeStatus, setFeeStatus] = useState<SchoolFeeRecord['status']>('Paid');

  // Timetable State
  const [ttBoard, setTtBoard] = useState<SchoolBoardId>('KAR_STATE');
  const [ttClass, setTtClass] = useState<SchoolClassId>('8');
  const [ttDay, setTtDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [ttSubject, setTtSubject] = useState('Science');
  const [ttTime, setTtTime] = useState('09:00 AM');

  const refreshData = async () => {
    setLoading(true);
    try {
      const [enrs, subjs, mrks, exms, fs, anns, brdRes] = await Promise.all([
        getAllSchoolEnrollments(),
        getCustomSchoolSubjects(),
        getSchoolMarks(),
        getSchoolExaminations(),
        getSchoolFees(),
        getSchoolAnnouncements(),
        getAllIndiaBoards(),
      ]);
      setEnrollments(enrs);
      setCustomSubjects(subjs);
      setMarks(mrks);
      setExams(exms);
      setFees(fs);
      setAnnouncements(anns);
      setAllBoards(brdRes.boards);
      setSyncedBoardsCount(brdRes.syncedCount);
      if (enrs.length > 0 && !markStudentUid) {
        setMarkStudentUid(enrs[0].studentUid);
        setFeeStudentUid(enrs[0].studentUid);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSeedAllBoards = async (forceOverwrite = false) => {
    setSeedingBoards(true);
    setStatusMsg('');
    try {
      const res = await seedAllIndiaBoardsToFirestore(forceOverwrite);
      setStatusMsg(
        `Firestore Board Directory synced: ${res.writtenCount} records written (${res.totalCanonical} canonical All-India boards total).`
      );
      await refreshData();
    } catch (err: any) {
      setStatusMsg(`Board sync error: ${err?.message || 'Admin permission required in Firestore.'}`);
    } finally {
      setSeedingBoards(false);
    }
  };

  const handleSaveBoardEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoard) return;
    setSavingBoardEdit(true);
    try {
      await saveSchoolBoardDirectoryDoc(editingBoard);
      setStatusMsg(`Saved "${editingBoard.shortName}" (${editingBoard.stateOrUt}) to Firestore /school_boards.`);
      setEditingBoard(null);
      await refreshData();
    } catch (err: any) {
      setStatusMsg(`Failed to save board: ${err?.message || 'Check permissions.'}`);
    } finally {
      setSavingBoardEdit(false);
    }
  };

  const handleQuickBoardVerify = async (board: AllIndiaBoardRecord) => {
    const nextStatus: AllIndiaBoardRecord['verificationStatus'] =
      board.verificationStatus === 'Verified' ? 'Pending Admin Verification' : 'Verified';
    try {
      await saveSchoolBoardDirectoryDoc({ ...board, verificationStatus: nextStatus });
      setStatusMsg(`Updated ${board.shortName} verification status to "${nextStatus}".`);
      await refreshData();
    } catch (err: any) {
      setStatusMsg(`Failed to update verification status: ${err?.message || 'Error'}`);
    }
  };

  const handleOpenFrameworkEditor = async (board: AllIndiaBoardRecord) => {
    const res = await getBoardGradeFramework(board.id);
    setEditingFramework(res.framework);
    setNewVersionLabel('');
  };

  const handleSaveFramework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFramework) return;
    setSavingFramework(true);
    try {
      await saveBoardGradeFramework(editingFramework);
      setStatusMsg(
        `Saved grade structure & curriculum versions for ${editingFramework.boardShortName} to Firestore /school_grade_frameworks.`
      );
      setEditingFramework(null);
    } catch (err: any) {
      setStatusMsg(`Failed to save grade framework: ${err?.message || 'Admin permission required.'}`);
    } finally {
      setSavingFramework(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleCurriculumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setStatusMsg('');
    try {
      const parsed = await parseCurriculumImportFile(file);
      if (parsed.length === 0) {
        setStatusMsg('No valid curriculum rows found in file.');
        return;
      }
      const res = await importParsedCurriculumRowsToFirestore(parsed);
      setStatusMsg(`Imported ${res.conceptsImported} concepts across ${res.subjectsSaved} board-isolated subjects from ${file.name}.`);
      await refreshData();
    } catch (err: any) {
      setStatusMsg(`Import failed: ${err?.message || 'Unsupported format'}`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const downloadSampleCsvTemplate = () => {
    const csv = [
      'boardId,classId,stream,subjectCode,subjectName,chapterNumber,chapterTitle,conceptTitle,simpleExplanation,kannadaExplanation,hindiExplanation,textbookReference',
      'KAR_STATE,10,General,SCI,Science,1,Chemical Reactions,Balancing Equations,Atoms are conserved across reactants and products.,ಪ್ರತಿಕ್ರಿಯಕಗಳು ಮತ್ತು ಉತ್ಪನ್ನಗಳಲ್ಲಿ ಪರಮಾಣುಗಳು ಸಮನಾಗಿರುತ್ತವೆ.,अभिकारकों और उत्पादों में परमाणु बराबर रहते हैं।,KTBS SSLC Science',
      'CBSE,8,General,MATH,Mathematics,2,Linear Equations,Solving Single Variable Equations,Perform the same operation on both sides to isolate x.,ಎರಡೂ ಬದಿಗಳಲ್ಲಿ ಒಂದೇ ಕ್ರಿಯೆ ಮಾಡಿ x ಮೌಲ್ಯ ಕಂಡುಹಿಡಿಯಿರಿ.,दोनों पक्षों में समान संक्रिया करके x का मान निकालें।,NCERT Class 8 Mathematics',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'OpenFrame_School_Curriculum_Template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examTitle.trim()) return;
    await saveSchoolExamination({
      boardId: examBoard,
      classId: examClass,
      academicYear: '2026-2027',
      title: examTitle.trim(),
      category: examCat,
      subjectName: examSubject,
      examDate,
      durationMinutes: 90,
      maxMarks: Number(examMaxMarks) || 100,
      syllabusScope: `${examBoard} Class ${examClass} ${examSubject}`,
      createdBy: 'Admin Console',
    });
    setExamTitle('');
    setStatusMsg(`Scheduled examination "${examTitle}" for ${examBoard} Class ${examClass}.`);
    await refreshData();
  };

  const handleRecordMark = async (e: React.FormEvent) => {
    e.preventDefault();
    const stu = enrollments.find((s) => s.studentUid === markStudentUid);
    if (!stu) return;
    await recordSchoolMark({
      studentId: stu.studentUid,
      studentName: stu.studentName,
      boardId: stu.boardId,
      classId: stu.classId,
      academicYear: stu.academicYear,
      subjectId: `${stu.boardId}_${stu.classId}_${markSubject}`.toUpperCase(),
      subjectName: markSubject,
      category: markCategory,
      examTitle: markTitle,
      marksObtained: Number(markObtained) || 0,
      maxMarks: Number(markMax) || 100,
      recordedBy: 'School Admin',
    });
    setStatusMsg(`Recorded ${markObtained}/${markMax} (${markCategory}) for ${stu.studentName}.`);
    await refreshData();
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) return;
    await createSchoolAnnouncement({
      title: annTitle.trim(),
      body: annBody.trim(),
      boardId: 'ALL',
      classId: 'ALL',
      priority: 'Important',
      authorName: 'School Administration',
    });
    setAnnTitle('');
    setAnnBody('');
    setStatusMsg('School announcement published to student & parent dashboards.');
    await refreshData();
  };

  const handleRecordFee = async (e: React.FormEvent) => {
    e.preventDefault();
    const stu = enrollments.find((s) => s.studentUid === feeStudentUid);
    if (!stu) return;
    await saveSchoolFeeRecord({
      studentId: stu.studentUid,
      studentName: stu.studentName,
      classId: stu.classId,
      academicYear: stu.academicYear,
      termName: feeTerm,
      amount: Number(feeAmount) || 0,
      dueDate: '2026-12-31',
      status: feeStatus,
      receiptNumber: feeStatus === 'Paid' ? `OF-REC-${Date.now().toString().slice(-6)}` : undefined,
    });
    setStatusMsg(`Saved fee record (${feeStatus}) for ${stu.studentName}.`);
    await refreshData();
  };

  const handleAddTimetableSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSchoolTimetableSlot({
      boardId: ttBoard,
      classId: ttClass,
      dayOfWeek: ttDay,
      startTime: ttTime,
      endTime: '09:45 AM',
      subjectId: `${ttBoard}_CLS_${ttClass}_GEN_${ttSubject.slice(0, 3).toUpperCase()}`,
      subjectName: ttSubject,
      teacherName: 'Assigned School Faculty',
      mode: 'Live Class',
    });
    setStatusMsg(`Added ${ttDay} ${ttTime} (${ttSubject}) to ${ttBoard} Class ${ttClass} timetable.`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Summary */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            <span>School Education Management System (LKG – 12th Standard)</span>
          </div>
          <h2 className="font-heading font-extrabold text-xl text-slate-900 mt-1">
            Boards, Curriculum Importer (CSV / Excel / JSON), Exams, Marks &amp; Operations
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-bold tabular-nums">
          <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
            {enrollments.length} School Students
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            {customSubjects.length} Custom Subjects
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800">
            {marks.length} Marks Entries
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
          {statusMsg}
        </div>
      )}

      {/* Sub-navigation */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'students' as const, label: 'Students & Announcements', icon: Users },
          { id: 'boards' as const, label: `All-India Board Directory (${allBoards.length})`, icon: Landmark },
          { id: 'curriculum' as const, label: 'CSV / Excel / JSON Curriculum Import', icon: BookOpen },
          { id: 'exams' as const, label: 'Examinations & Marks (10 Categories)', icon: FileSpreadsheet },
          { id: 'timetable' as const, label: 'Timetables', icon: Calendar },
          { id: 'fees' as const, label: 'School Fees', icon: Award },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                subTab === t.id ? 'bg-[#0B1930] text-white' : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="p-10 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading School Operations Data...</span>
        </div>
      ) : (
        <>
          {subTab === 'students' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-heading font-bold text-base text-slate-900">
                  Enrolled School Students ({enrollments.length})
                </h3>
                {enrollments.length === 0 ? (
                  <p className="text-xs text-slate-500">No students have saved their LKG–12 enrollment profile yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase">
                          <th className="py-2 pr-3">Student</th>
                          <th className="py-2 pr-3">Board</th>
                          <th className="py-2 pr-3">Class</th>
                          <th className="py-2 pr-3">Medium</th>
                          <th className="py-2 pr-3">Parent Email</th>
                          <th className="py-2">XP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {enrollments.map((s) => (
                          <tr key={s.id}>
                            <td className="py-2 pr-3 font-bold text-slate-900">{s.studentName}</td>
                            <td className="py-2 pr-3">{s.boardId}</td>
                            <td className="py-2 pr-3">{s.classId} ({s.stream})</td>
                            <td className="py-2 pr-3">{s.medium}</td>
                            <td className="py-2 pr-3 text-slate-500">{s.parentEmail || '—'}</td>
                            <td className="py-2 font-bold text-blue-700 tabular-nums">{s.xpPoints}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-1.5">
                  <Megaphone className="w-4 h-4 text-blue-600" />
                  <span>Publish School Announcement</span>
                </h3>
                <form onSubmit={handlePostAnnouncement} className="space-y-2.5 text-xs">
                  <input
                    type="text"
                    required
                    value={annTitle}
                    onChange={(e) => setAnnTitle(e.target.value)}
                    placeholder="Announcement Heading"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <textarea
                    rows={3}
                    required
                    value={annBody}
                    onChange={(e) => setAnnBody(e.target.value)}
                    placeholder="Notice message for students, teachers, and parents..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                  >
                    Publish Notice
                  </button>
                </form>
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  {announcements.slice(0, 3).map((a) => (
                    <div key={a.id} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-bold">{a.title}</div>
                      <div className="text-slate-600">{a.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {subTab === 'boards' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    All-India Education Board Directory ({allBoards.length} Authorities · {syncedBoardsCount} Synced in Firestore)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Seed, verify, edit official SCERT/syllabus links, or register regional/open/Sanskrit boards into Firestore <code className="bg-slate-100 px-1 py-0.5 rounded">/school_boards</code>.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={seedingBoards}
                    onClick={() => handleSeedAllBoards(false)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0B1930] hover:bg-blue-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap disabled:opacity-60"
                  >
                    {seedingBoards ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    <span>Sync Missing Boards ({ALL_INDIA_BOARDS.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingBoard({
                        id: `SPEC_${Date.now().toString().slice(-6)}`,
                        curriculumGroupId: 'OTHER_RECOGNIZED',
                        category: 'State',
                        stateOrUt: '',
                        officialName: '',
                        shortName: '',
                        scertBody: '',
                        affiliationMode: 'Unified State Examination Board',
                        hasSeparateStateBoard: true,
                        subProgrammes: ['Secondary (Class 10)', 'Senior Secondary (Class 12)'],
                        gradeRangeSummary: 'Classes 1 to 12',
                        officialGradeLevels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
                        supportedMediums: ['English', 'Hindi'],
                        gradingSummary: 'State-prescribed grading and percentage system.',
                        officialWebsite: 'https://',
                        verificationStatus: 'Pending Admin Verification',
                        sourceNote: 'Added by OpenFrame Education Administrator.',
                        isActive: true,
                        updatedAt: new Date().toISOString(),
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Board</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap gap-1.5">
                  {(['All', 'National', 'International', 'State', 'Union Territory'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setBoardCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                        boardCategoryFilter === cat
                          ? 'bg-[#0B1930] text-white border-[#0B1930]'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={boardSearch}
                  onChange={(e) => setBoardSearch(e.target.value)}
                  placeholder="Filter by state, acronym, or SCERT..."
                  className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg w-full sm:w-64"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] text-slate-500 uppercase">
                      <th className="py-2 pr-3">Jurisdiction</th>
                      <th className="py-2 pr-3">Board / Authority</th>
                      <th className="py-2 pr-3">Structure &amp; Track</th>
                      <th className="py-2 pr-3">Mediums</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allBoards
                      .filter((b) => {
                        if (boardCategoryFilter !== 'All' && b.category !== boardCategoryFilter) return false;
                        const q = boardSearch.trim().toLowerCase();
                        if (!q) return true;
                        return (
                          b.stateOrUt.toLowerCase().includes(q) ||
                          b.shortName.toLowerCase().includes(q) ||
                          b.officialName.toLowerCase().includes(q) ||
                          b.scertBody.toLowerCase().includes(q)
                        );
                      })
                      .map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 pr-3">
                            <div className="font-bold text-slate-900">{b.stateOrUt}</div>
                            <div className="text-[11px] text-slate-500">{b.category} · {b.id}</div>
                          </td>
                          <td className="py-2.5 pr-3 max-w-xs">
                            <div className="font-bold text-slate-900">{b.shortName}</div>
                            <div className="text-[11px] text-slate-600 line-clamp-1">{b.officialName}</div>
                            <a
                              href={b.officialWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-0.5"
                            >
                              <span>Website</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                          <td className="py-2.5 pr-3">
                            <div className="text-slate-800 font-semibold">{b.affiliationMode}</div>
                            <div className="text-[11px] text-slate-500">Group: {b.curriculumGroupId}</div>
                          </td>
                          <td className="py-2.5 pr-3 max-w-[180px] text-[11px] text-slate-600">
                            {b.supportedMediums.join(', ')}
                          </td>
                          <td className="py-2.5 pr-3">
                            <button
                              type="button"
                              onClick={() => handleQuickBoardVerify(b)}
                              className={`inline-flex items-center gap-1 text-[11px] font-bold cursor-pointer ${
                                b.verificationStatus === 'Verified' ? 'text-emerald-700' : 'text-amber-700'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{b.verificationStatus}</span>
                            </button>
                          </td>
                          <td className="py-2.5 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenFrameworkEditor(b)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-blue-200 hover:border-blue-500 text-blue-700 font-bold cursor-pointer"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Grades</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingBoard(b)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-400 text-slate-700 font-bold cursor-pointer"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {editingBoard && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                  <form
                    onSubmit={handleSaveBoardEdit}
                    className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-3 text-xs shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <h4 className="font-heading font-bold text-base text-slate-900">
                        Edit Board Directory Record ({editingBoard.id})
                      </h4>
                      <button
                        type="button"
                        onClick={() => setEditingBoard(null)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Category</label>
                        <select
                          value={editingBoard.category}
                          onChange={(e) => setEditingBoard({ ...editingBoard, category: e.target.value as BoardCategory })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="National">National</option>
                          <option value="International">International</option>
                          <option value="State">State</option>
                          <option value="Union Territory">Union Territory</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Curriculum Track Group</label>
                        <select
                          value={editingBoard.curriculumGroupId}
                          onChange={(e) => setEditingBoard({ ...editingBoard, curriculumGroupId: e.target.value as SchoolBoardId })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          {SCHOOL_BOARDS.map((sb) => (
                            <option key={sb.id} value={sb.id}>{sb.shortName}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">State / UT / Jurisdiction</label>
                        <input
                          required
                          type="text"
                          value={editingBoard.stateOrUt}
                          onChange={(e) => setEditingBoard({ ...editingBoard, stateOrUt: e.target.value })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Short Name / Acronym</label>
                        <input
                          required
                          type="text"
                          value={editingBoard.shortName}
                          onChange={(e) => setEditingBoard({ ...editingBoard, shortName: e.target.value })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Official Full Name</label>
                      <input
                        required
                        type="text"
                        value={editingBoard.officialName}
                        onChange={(e) => setEditingBoard({ ...editingBoard, officialName: e.target.value })}
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">SCERT / Academic Body</label>
                      <input
                        required
                        type="text"
                        value={editingBoard.scertBody}
                        onChange={(e) => setEditingBoard({ ...editingBoard, scertBody: e.target.value })}
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Affiliation Mode</label>
                        <select
                          value={editingBoard.affiliationMode}
                          onChange={(e) => setEditingBoard({ ...editingBoard, affiliationMode: e.target.value as BoardAffiliationMode })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="National Examination Board">National Examination Board</option>
                          <option value="National Open Schooling">National Open Schooling</option>
                          <option value="International Baccalaureate Continuum">IB Continuum</option>
                          <option value="Cambridge Pathway">Cambridge Pathway</option>
                          <option value="Unified State Examination Board">Unified State Board</option>
                          <option value="Split Secondary & Higher Secondary Boards">Split 10th &amp; 12th Boards</option>
                          <option value="CBSE / NCERT Affiliated State/UT System">CBSE / SCERT System</option>
                          <option value="UT Board + CBSE Curriculum">UT Board + CBSE Curriculum</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Verification Status</label>
                        <select
                          value={editingBoard.verificationStatus}
                          onChange={(e) => setEditingBoard({ ...editingBoard, verificationStatus: e.target.value as AllIndiaBoardRecord['verificationStatus'] })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Verified">Verified</option>
                          <option value="Pending Admin Verification">Pending Admin Verification</option>
                          <option value="Needs Review">Needs Review</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Official Website URL</label>
                        <input
                          required
                          type="url"
                          value={editingBoard.officialWebsite}
                          onChange={(e) => setEditingBoard({ ...editingBoard, officialWebsite: e.target.value })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Syllabus Portal URL</label>
                        <input
                          type="url"
                          value={editingBoard.officialSyllabusUrl || ''}
                          onChange={(e) => setEditingBoard({ ...editingBoard, officialSyllabusUrl: e.target.value })}
                          className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Supported Mediums (comma-separated)</label>
                      <input
                        type="text"
                        value={editingBoard.supportedMediums.join(', ')}
                        onChange={(e) =>
                          setEditingBoard({
                            ...editingBoard,
                            supportedMediums: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Statutory Source Note</label>
                      <textarea
                        rows={2}
                        value={editingBoard.sourceNote}
                        onChange={(e) => setEditingBoard({ ...editingBoard, sourceNote: e.target.value })}
                        className="w-full px-2.5 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingBoard(null)}
                        className="px-4 py-2 rounded-lg border border-slate-200 font-bold text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingBoardEdit}
                        className="px-4 py-2 rounded-lg bg-[#0B1930] text-white font-bold cursor-pointer"
                      >
                        {savingBoardEdit ? 'Saving...' : 'Save Board Record'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {editingFramework && (
                <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
                  <form
                    onSubmit={handleSaveFramework}
                    className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs shadow-xl"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="font-heading font-bold text-base text-slate-900">
                          Grade Structure &amp; Curriculum Versions · {editingFramework.boardShortName}
                        </h4>
                        <div className="text-[11px] text-slate-500">
                          Firestore ID: /school_grade_frameworks/{editingFramework.id}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingFramework(null)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Academic Stage Pattern</label>
                      <input
                        type="text"
                        required
                        value={editingFramework.structurePattern}
                        onChange={(e) =>
                          setEditingFramework({ ...editingFramework, structurePattern: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Grading Scale Name</label>
                        <input
                          type="text"
                          required
                          value={editingFramework.gradingScaleName}
                          onChange={(e) =>
                            setEditingFramework({ ...editingFramework, gradingScaleName: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-slate-600 block mb-1">Passing Criteria</label>
                        <input
                          type="text"
                          required
                          value={editingFramework.passingRule}
                          onChange={(e) =>
                            setEditingFramework({ ...editingFramework, passingRule: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Curriculum Versions Manager */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                      <div className="font-bold text-slate-900">
                        Curriculum Versions ({editingFramework.curriculumVersions.length})
                      </div>
                      {editingFramework.curriculumVersions.map((ver, idx) => (
                        <div
                          key={ver.id}
                          className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-slate-900">{ver.label}</div>
                            <div className="text-[11px] text-slate-500">
                              Years: {ver.academicYears.join(', ')} · {ver.status}
                            </div>
                          </div>
                          {editingFramework.curriculumVersions.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditingFramework({
                                  ...editingFramework,
                                  curriculumVersions: editingFramework.curriculumVersions.filter((_, i) => i !== idx),
                                })
                              }
                              className="text-rose-600 font-bold cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2 border-t border-slate-200">
                        <input
                          type="text"
                          value={newVersionLabel}
                          onChange={(e) => setNewVersionLabel(e.target.value)}
                          placeholder="Add curriculum version label (e.g. 2026-27 Revised)..."
                          className="sm:col-span-6 px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                        />
                        <input
                          type="text"
                          value={newVersionYear}
                          onChange={(e) => setNewVersionYear(e.target.value)}
                          placeholder="2026-2027"
                          className="sm:col-span-3 px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newVersionLabel.trim()) return;
                            const id = `VER_${Date.now().toString().slice(-5)}`;
                            setEditingFramework({
                              ...editingFramework,
                              curriculumVersions: [
                                ...editingFramework.curriculumVersions,
                                {
                                  id,
                                  label: newVersionLabel.trim(),
                                  academicYears: [newVersionYear.trim() || '2026-2027'],
                                  isDefault: false,
                                  status: 'Active',
                                  description: 'Custom curriculum version configured by School Admin.',
                                },
                              ],
                            });
                            setNewVersionLabel('');
                          }}
                          className="sm:col-span-3 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold cursor-pointer"
                        >
                          Add Version
                        </button>
                      </div>
                    </div>

                    {/* Stage Nomenclature Overview */}
                    <div className="space-y-1.5">
                      <div className="font-bold text-slate-900">14-Level Grade &amp; Exam Milestone Preview</div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                        {editingFramework.stages.map((st) => (
                          <div key={st.classId} className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <div className="font-bold text-slate-900">{st.classLabel} → {st.boardLevelTitle}</div>
                            <div className="text-[11px] text-slate-500">{st.officialStageName}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setEditingFramework(null)}
                        className="px-4 py-2 rounded-lg border border-slate-200 font-bold text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={savingFramework}
                        className="px-4 py-2 rounded-lg bg-[#0B1930] text-white font-bold cursor-pointer"
                      >
                        {savingFramework ? 'Saving...' : 'Save Grade Framework'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {subTab === 'curriculum' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    Bulk Curriculum Importer (CSV, Excel .xlsx/.xls, JSON)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Imported chapters &amp; concepts remain strictly isolated by Education Board (Karnataka State / CBSE / ICSE / State / Recognized) and Class.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={downloadSampleCsvTemplate}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Sample CSV Template</span>
                  </button>
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer">
                    {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>Upload CSV / XLSX / JSON</span>
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.json"
                      className="hidden"
                      onChange={handleCurriculumUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-xs font-bold text-slate-700 mb-2">
                  Imported Custom Board Subjects in Firestore ({customSubjects.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {customSubjects.map((cs) => (
                    <div key={cs.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-bold text-blue-700">{cs.boardId} · Class {cs.classId}</div>
                      <div className="font-bold text-slate-900">{cs.name.English}</div>
                      <div className="text-slate-500">{cs.chapters.length} Chapters</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {subTab === 'exams' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-heading font-bold text-base text-slate-900">Schedule Examination</h3>
                <form onSubmit={handleCreateExam} className="space-y-2.5 text-xs">
                  <input
                    type="text"
                    required
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder="Exam Title (e.g. Half-Yearly Board Prep)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select value={examBoard} onChange={(e) => setExamBoard(e.target.value as SchoolBoardId)} className="px-3 py-2 border border-slate-300 rounded-lg bg-white">
                      {SCHOOL_BOARDS.map((b) => <option key={b.id} value={b.id}>{b.shortName}</option>)}
                    </select>
                    <select value={examClass} onChange={(e) => setExamClass(e.target.value as SchoolClassId)} className="px-3 py-2 border border-slate-300 rounded-lg bg-white">
                      {SCHOOL_CLASSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select value={examCat} onChange={(e) => setExamCat(e.target.value as SchoolMarksCategory)} className="px-3 py-2 border border-slate-300 rounded-lg bg-white">
                      {MARKS_CATEGORIES.map((mc) => <option key={mc} value={mc}>{mc}</option>)}
                    </select>
                    <input type="text" value={examSubject} onChange={(e) => setExamSubject(e.target.value)} placeholder="Subject" className="px-3 py-2 border border-slate-300 rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} className="px-3 py-2 border border-slate-300 rounded-lg" />
                    <input type="number" value={examMaxMarks} onChange={(e) => setExamMaxMarks(Number(e.target.value))} placeholder="Max Marks" className="px-3 py-2 border border-slate-300 rounded-lg" />
                  </div>
                  <button type="submit" className="w-full py-2.5 rounded-lg bg-[#0B1930] text-white font-bold cursor-pointer flex items-center justify-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Examination ({exams.length})</span>
                  </button>
                </form>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-heading font-bold text-base text-slate-900">Record Student Exam / Assessment Marks</h3>
                <form onSubmit={handleRecordMark} className="space-y-2.5 text-xs">
                  <select value={markStudentUid} onChange={(e) => setMarkStudentUid(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                    {enrollments.length === 0 && <option value="">No enrolled school students yet</option>}
                    {enrollments.map((s) => (
                      <option key={s.id} value={s.studentUid}>{s.studentName} ({s.boardId} · Class {s.classId})</option>
                    ))}
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" value={markSubject} onChange={(e) => setMarkSubject(e.target.value)} placeholder="Subject" className="px-3 py-2 border border-slate-300 rounded-lg" />
                    <select value={markCategory} onChange={(e) => setMarkCategory(e.target.value as SchoolMarksCategory)} className="px-3 py-2 border border-slate-300 rounded-lg bg-white">
                      {MARKS_CATEGORIES.map((mc) => <option key={mc} value={mc}>{mc}</option>)}
                    </select>
                  </div>
                  <input type="text" value={markTitle} onChange={(e) => setMarkTitle(e.target.value)} placeholder="Exam / Assessment Title" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={markObtained} onChange={(e) => setMarkObtained(Number(e.target.value))} placeholder="Marks Obtained" className="px-3 py-2 border border-slate-300 rounded-lg" />
                    <input type="number" value={markMax} onChange={(e) => setMarkMax(Number(e.target.value))} placeholder="Max Marks" className="px-3 py-2 border border-slate-300 rounded-lg" />
                  </div>
                  <button type="submit" disabled={enrollments.length === 0} className="w-full py-2.5 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer disabled:opacity-50">
                    Save Marks with Board Grade
                  </button>
                </form>
              </div>
            </div>
          )}

          {subTab === 'timetable' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 max-w-xl">
              <h3 className="font-heading font-bold text-base text-slate-900">Add Custom Timetable Slot</h3>
              <form onSubmit={handleAddTimetableSlot} className="space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <select value={ttBoard} onChange={(e) => setTtBoard(e.target.value as SchoolBoardId)} className="px-3 py-2 border border-slate-300 rounded-lg bg-white">
                    {SCHOOL_BOARDS.map((b) => <option key={b.id} value={b.id}>{b.shortName}</option>)}
                  </select>
                  <select value={ttClass} onChange={(e) => setTtClass(e.target.value as SchoolClassId)} className="px-3 py-2 border border-slate-300 rounded-lg bg-white">
                    {SCHOOL_CLASSES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={ttDay} onChange={(e) => setTtDay(e.target.value as any)} className="px-3 py-2 border border-slate-300 rounded-lg bg-white">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input type="text" value={ttTime} onChange={(e) => setTtTime(e.target.value)} placeholder="09:00 AM" className="px-3 py-2 border border-slate-300 rounded-lg" />
                </div>
                <input type="text" value={ttSubject} onChange={(e) => setTtSubject(e.target.value)} placeholder="Subject Name" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold cursor-pointer">Save Timetable Slot</button>
              </form>
            </div>
          )}

          {subTab === 'fees' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
                <h3 className="font-heading font-bold text-base text-slate-900">Record / Update Fee Entry</h3>
                <form onSubmit={handleRecordFee} className="space-y-2.5 text-xs">
                  <select value={feeStudentUid} onChange={(e) => setFeeStudentUid(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white">
                    {enrollments.length === 0 && <option value="">No enrolled school students yet</option>}
                    {enrollments.map((s) => (
                      <option key={s.id} value={s.studentUid}>{s.studentName} (Class {s.classId})</option>
                    ))}
                  </select>
                  <input type="text" value={feeTerm} onChange={(e) => setFeeTerm(e.target.value)} placeholder="Term Name" className="w-full px-3 py-2 border border-slate-300 rounded-lg" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={feeAmount} onChange={(e) => setFeeAmount(Number(e.target.value))} placeholder="Amount (INR)" className="px-3 py-2 border border-slate-300 rounded-lg" />
                    <select value={feeStatus} onChange={(e) => setFeeStatus(e.target.value as SchoolFeeRecord['status'])} className="px-3 py-2 border border-slate-300 rounded-lg bg-white">
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Scholarship Covered">Scholarship Covered</option>
                    </select>
                  </div>
                  <button type="submit" disabled={enrollments.length === 0} className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-bold cursor-pointer disabled:opacity-50">
                    Save Fee Record
                  </button>
                </form>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
                <h3 className="font-heading font-bold text-base text-slate-900">Fee Registry ({fees.length})</h3>
                {fees.map((f) => (
                  <div key={f.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{f.studentName} · Class {f.classId}</div>
                      <div className="text-slate-500">{f.termName} {f.receiptNumber ? `· ${f.receiptNumber}` : ''}</div>
                    </div>
                    <div className="text-right font-bold tabular-nums">
                      <div>₹{f.amount.toLocaleString('en-IN')}</div>
                      <div className="text-blue-700">{f.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
