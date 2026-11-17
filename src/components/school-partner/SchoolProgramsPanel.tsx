import React, { useEffect, useState } from 'react';
import { BookOpen, Search, Users, CheckCircle2 } from 'lucide-react';
import {
  MarketplaceCourse,
  SchoolInstitution,
  SchoolProgramEnrollment,
  SchoolTenantClass,
  SchoolTenantStudent,
} from '../../types';
import { marketplaceService } from '../../services/marketplaceService';
import { SchoolAuditActor, schoolPartnerService } from '../../services/schoolPartnerService';

interface SchoolProgramsPanelProps {
  institution: SchoolInstitution;
  classes: SchoolTenantClass[];
  students: SchoolTenantStudent[];
  enrollments: SchoolProgramEnrollment[];
  actor: SchoolAuditActor;
  isApproved: boolean;
  onRefresh: () => Promise<void>;
}

export const SchoolProgramsPanel: React.FC<SchoolProgramsPanelProps> = ({
  institution,
  classes,
  students,
  enrollments,
  actor,
  isApproved,
  onRefresh,
}) => {
  const [queryText, setQueryText] = useState('');
  const [courses, setCourses] = useState<MarketplaceCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState<MarketplaceCourse | null>(null);
  const [targetClassId, setTargetClassId] = useState<string>('All');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const loadCatalog = async (q = '') => {
    setLoadingCourses(true);
    try {
      const resp = await marketplaceService.filterCourses({
        query: q,
        page: 1,
        pageSize: 12,
        sortBy: 'popular',
      });
      setCourses(resp.courses || []);
    } catch {
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    void loadCatalog('');
  }, []);

  const handleOpenEnrollModal = (course: MarketplaceCourse) => {
    setSelectedCourse(course);
    setTargetClassId('All');
    setSelectedStudentIds([]);
  };

  const candidateStudents = students.filter(
    (s) => s.enrollmentStatus === 'Active' && (targetClassId === 'All' || s.classId === targetClassId)
  );

  const toggleAllCandidates = () => {
    if (selectedStudentIds.length === candidateStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(candidateStudents.map((s) => s.id));
    }
  };

  const handleConfirmEnroll = async () => {
    if (!selectedCourse || selectedStudentIds.length === 0) return;
    setSaving(true);
    try {
      const chosen = students.filter((s) => selectedStudentIds.includes(s.id));
      await schoolPartnerService.enrollStudentsInProgram(
        institution,
        selectedCourse,
        chosen,
        actor
      );
      setToastMsg(`Enrolled ${chosen.length} student(s) in "${selectedCourse.title}".`);
      setSelectedCourse(null);
      await onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProgress = async (
    enr: SchoolProgramEnrollment,
    nextPct: number,
    nextStatus: SchoolProgramEnrollment['status']
  ) => {
    setSaving(true);
    try {
      await schoolPartnerService.updateProgramEnrollmentProgress(enr, nextPct, nextStatus, actor);
      await onRefresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-heading font-bold text-[#14213D]">
              OpenFrame Programs & Cohort Enrollment
            </h1>
            <p className="text-xs text-[#64748B]">
              Browse OpenFrame Education programs, inspect pricing & duration, and enroll full classes or selected students.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void loadCatalog(queryText);
            }}
            className="flex gap-2"
          >
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Search Python, AI, Robotics..."
                className="pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#14213D] text-white text-xs font-semibold"
            >
              Search
            </button>
          </form>
        </div>

        {toastMsg && (
          <div className="bg-[#EFF6FF] border border-blue-200 rounded-xl px-4 py-2.5 text-xs text-[#14213D] flex justify-between">
            <span>{toastMsg}</span>
            <button type="button" onClick={() => setToastMsg('')} className="text-[#2563EB] font-semibold">
              Close
            </button>
          </div>
        )}

        {loadingCourses ? (
          <div className="py-10 text-center text-xs text-slate-500">Loading OpenFrame curriculum catalog...</div>
        ) : courses.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
            No matching OpenFrame courses found for your query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1.5">
                  <div className="text-[11px] font-semibold text-[#2563EB]">{course.category}</div>
                  <h3 className="text-sm font-bold text-[#14213D] line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-[#64748B] line-clamp-2">{course.description}</p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {course.level} · {course.duration || 'Self-Paced'} ·{' '}
                    {course.price > 0 ? `₹${course.price}` : 'Complimentary'}
                  </div>
                </div>
                {isApproved && (
                  <button
                    type="button"
                    onClick={() => handleOpenEnrollModal(course)}
                    className="w-full py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    Enroll Cohort / Students
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Enrollments Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#2563EB]" />
          <h2 className="text-base font-heading font-bold text-[#14213D]">
            Active School Program Enrollments ({enrollments.length})
          </h2>
        </div>

        {enrollments.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl text-xs text-[#64748B]">
            No students enrolled in OpenFrame programs yet. Select a course above to assign students or classes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 pr-3">Student</th>
                  <th className="py-2.5 px-3">Program</th>
                  <th className="py-2.5 px-3">Progress</th>
                  <th className="py-2.5 px-3">Status</th>
                  {isApproved && <th className="py-2.5 pl-3 text-right">Update</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {enrollments.map((enr) => (
                  <tr key={enr.id}>
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-[#14213D]">{enr.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {enr.studentCode} · {enr.className}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-medium">{enr.programTitle}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#2563EB]">{enr.progressPercent}%</td>
                    <td className="py-3 px-3 text-slate-700">{enr.status}</td>
                    {isApproved && (
                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          disabled={saving || enr.status === 'Completed'}
                          onClick={() => void handleUpdateProgress(enr, 100, 'Completed')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px] font-semibold disabled:opacity-40"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{enr.status === 'Completed' ? 'Completed' : 'Mark 100%'}</span>
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div>
              <h2 className="text-base font-heading font-bold text-[#14213D]">
                Enroll Students in {selectedCourse.title}
              </h2>
              <p className="text-xs text-[#64748B]">
                Duplicates are automatically prevented via deterministic enrollment keys.
              </p>
            </div>

            <div className="flex items-center justify-between gap-2">
              <select
                value={targetClassId}
                onChange={(e) => {
                  setTargetClassId(e.target.value);
                  setSelectedStudentIds([]);
                }}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl flex-1"
              >
                <option value="All">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.gradeName} - {c.section}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={toggleAllCandidates}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
              >
                {selectedStudentIds.length === candidateStudents.length
                  ? 'Deselect All'
                  : `Select All (${candidateStudents.length})`}
              </button>
            </div>

            {candidateStudents.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-500">
                <Users className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                No active students available in this class filter. Add students first.
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                {candidateStudents.map((stu) => {
                  const checked = selectedStudentIds.includes(stu.id);
                  return (
                    <label
                      key={stu.id}
                      className="flex items-center justify-between px-3 py-2.5 text-xs cursor-pointer hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setSelectedStudentIds((prev) =>
                              prev.includes(stu.id)
                                ? prev.filter((id) => id !== stu.id)
                                : [...prev, stu.id]
                            )
                          }
                        />
                        <span className="font-medium text-slate-800">{stu.fullName}</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {stu.className}-{stu.section}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || selectedStudentIds.length === 0}
                onClick={() => void handleConfirmEnroll()}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {saving ? 'Enrolling...' : `Enroll ${selectedStudentIds.length} Student(s)`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
