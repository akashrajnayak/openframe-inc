import React, { useMemo, useState } from 'react';
import {
  Users,
  Plus,
  Upload,
  Download,
  Search,
  Pencil,
  CalendarCheck,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  SchoolInstitution,
  SchoolIqEqSqResult,
  SchoolProgramEnrollment,
  SchoolStudentEnrollmentStatus,
  SchoolTenantAttendanceRecord,
  SchoolTenantCertificate,
  SchoolTenantClass,
  SchoolTenantStudent,
} from '../../types';
import {
  BulkStudentParseResult,
  SchoolAuditActor,
  schoolPartnerService,
} from '../../services/schoolPartnerService';

interface SchoolStudentsPanelProps {
  institution: SchoolInstitution;
  classes: SchoolTenantClass[];
  students: SchoolTenantStudent[];
  attendance: SchoolTenantAttendanceRecord[];
  programEnrollments: SchoolProgramEnrollment[];
  assessmentResults: SchoolIqEqSqResult[];
  certificates: SchoolTenantCertificate[];
  actor: SchoolAuditActor;
  isSchoolAdmin: boolean;
  isApproved: boolean;
  onRefresh: () => Promise<void>;
}

const ENROLLMENT_STATUSES: SchoolStudentEnrollmentStatus[] = [
  'Active',
  'On Leave',
  'Transferred',
  'Graduated',
  'Withdrawn',
];

export const SchoolStudentsPanel: React.FC<SchoolStudentsPanelProps> = ({
  institution,
  classes,
  students,
  attendance,
  programEnrollments,
  assessmentResults,
  certificates,
  actor,
  isSchoolAdmin,
  isApproved,
  onRefresh,
}) => {
  const [subTab, setSubTab] = useState<'roster' | 'attendance' | 'bulk'>('roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // Individual Student Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolTenantStudent | null>(null);
  const [fullName, setFullName] = useState('');
  const [classId, setClassId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Prefer not to say');
  const [dob, setDob] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Parent');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState<SchoolStudentEnrollmentStatus>('Active');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Profile Drawer
  const [profileStudent, setProfileStudent] = useState<SchoolTenantStudent | null>(null);

  // Bulk Import State
  const [bulkResult, setBulkResult] = useState<BulkStudentParseResult | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  // Batch Attendance State
  const [attDate, setAttDate] = useState(new Date().toISOString().slice(0, 10));
  const [attClassId, setAttClassId] = useState<string>('All');
  const [attDraft, setAttDraft] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'>>({});

  const filteredStudents = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return students.filter((s) => {
      const matchClass = classFilter === 'All' || s.classId === classFilter;
      const matchStatus = statusFilter === 'All' || s.enrollmentStatus === statusFilter;
      const matchQ =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.studentCode.toLowerCase().includes(q) ||
        s.guardianName.toLowerCase().includes(q) ||
        s.guardianPhone.includes(q);
      return matchClass && matchStatus && matchQ;
    });
  }, [students, searchTerm, classFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const pagedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  const openCreateStudent = () => {
    setEditing(null);
    setFullName('');
    setClassId(classes[0]?.id || '');
    setRollNumber('');
    setGender('Prefer not to say');
    setDob('');
    setGuardianName('');
    setGuardianRelation('Parent');
    setGuardianPhone('');
    setGuardianEmail('');
    setEnrollmentStatus('Active');
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditStudent = (stu: SchoolTenantStudent) => {
    setEditing(stu);
    setFullName(stu.fullName);
    setClassId(stu.classId);
    setRollNumber(stu.rollNumber || '');
    setGender(stu.gender || 'Prefer not to say');
    setDob(stu.dob || '');
    setGuardianName(stu.guardianName);
    setGuardianRelation(stu.guardianRelation || 'Parent');
    setGuardianPhone(stu.guardianPhone);
    setGuardianEmail(stu.guardianEmail || '');
    setEnrollmentStatus(stu.enrollmentStatus);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2 || !guardianName.trim() || guardianPhone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please provide valid student name, guardian name, and 10-digit guardian phone.');
      return;
    }
    const matchedClass = classes.find((c) => c.id === classId);
    const resolvedClassName = matchedClass?.gradeName || editing?.className || 'Class 1';
    const resolvedSection = matchedClass?.section || editing?.section || 'A';

    setSaving(true);
    setErrorMsg('');
    try {
      await schoolPartnerService.saveSchoolStudent(
        {
          id: editing?.id,
          studentCode: editing?.studentCode,
          createdAt: editing?.createdAt,
          institutionId: institution.id,
          institutionAdminUid: institution.adminUid,
          assignedTeacherUids: matchedClass?.assignedTeacherUids || editing?.assignedTeacherUids || [],
          fullName: fullName.trim(),
          classId: matchedClass?.id || classId || 'unassigned',
          className: resolvedClassName,
          section: resolvedSection,
          rollNumber: rollNumber.trim() || undefined,
          gender,
          dob: dob || undefined,
          guardianName: guardianName.trim(),
          guardianRelation: guardianRelation.trim() || 'Parent',
          guardianPhone: guardianPhone.trim(),
          guardianEmail: guardianEmail.trim() || undefined,
          enrollmentStatus,
          enrolledPrograms: editing?.enrolledPrograms || [],
          admissionDate: editing?.admissionDate || new Date().toISOString().slice(0, 10),
        },
        institution,
        students.length + 1,
        actor
      );
      setModalOpen(false);
      setToastMsg(`Saved student record for ${fullName.trim()}.`);
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to save student record.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkBusy(true);
    setErrorMsg('');
    try {
      const parsed = await schoolPartnerService.parseBulkStudentsSpreadsheet(file, students, classes);
      setBulkResult(parsed);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Could not parse spreadsheet file.');
    } finally {
      setBulkBusy(false);
      e.target.value = '';
    }
  };

  const handleCommitBulk = async () => {
    if (!bulkResult || bulkResult.validRows.length === 0) return;
    setBulkBusy(true);
    setErrorMsg('');
    try {
      const created = await schoolPartnerService.commitBulkStudentsImport(
        institution,
        bulkResult.validRows,
        students.length,
        classes,
        actor
      );
      setToastMsg(`Successfully imported ${created.length} student record(s).`);
      setBulkResult(null);
      setSubTab('roster');
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Bulk import failed.');
    } finally {
      setBulkBusy(false);
    }
  };

  const handleExportStudentsCsv = () => {
    const rows = [
      ['StudentCode', 'FullName', 'Class', 'Section', 'RollNumber', 'Status', 'GuardianName', 'GuardianPhone', 'GuardianEmail'],
      ...filteredStudents.map((s) => [
        s.studentCode,
        s.fullName,
        s.className,
        s.section,
        s.rollNumber || '',
        s.enrollmentStatus,
        s.guardianName,
        s.guardianPhone,
        s.guardianEmail || '',
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    schoolPartnerService.downloadCsvFile(
      `${institution.institutionCode || 'school'}_students_roster.csv`,
      csv
    );
  };

  const attStudents = useMemo(
    () =>
      students.filter(
        (s) => s.enrollmentStatus === 'Active' && (attClassId === 'All' || s.classId === attClassId)
      ),
    [students, attClassId]
  );

  const handleSaveAttendanceBatch = async () => {
    if (attStudents.length === 0) return;
    setSaving(true);
    setErrorMsg('');
    try {
      const records = attStudents.map((stu) => {
        const existing = attendance.find(
          (a) => a.personId === stu.id && a.date === attDate && a.personType === 'Student'
        );
        const status = attDraft[stu.id] || existing?.status || 'Present';
        return {
          institutionId: institution.id,
          institutionAdminUid: institution.adminUid,
          assignedTeacherUids: stu.assignedTeacherUids || [],
          personId: stu.id,
          personName: stu.fullName,
          personType: 'Student' as const,
          classId: stu.classId,
          classLabel: `${stu.className} - ${stu.section}`,
          date: attDate,
          status,
          markedByUid: actor.uid,
          markedByName: actor.email,
        };
      });
      await schoolPartnerService.saveAttendanceBatch(records, actor);
      setToastMsg(`Saved attendance for ${records.length} student(s) on ${attDate}.`);
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-heading font-bold text-[#14213D]">
            Students Roster, Attendance & Bulk Import
          </h1>
          <p className="text-xs text-[#64748B]">
            Manage {students.length} enrolled student profiles, mark daily class attendance, or batch-import spreadsheets with duplicate checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-slate-200 rounded-xl bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setSubTab('roster')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                subTab === 'roster' ? 'bg-[#14213D] text-white' : 'text-[#64748B]'
              }`}
            >
              Roster ({students.length})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                subTab === 'attendance' ? 'bg-[#14213D] text-white' : 'text-[#64748B]'
              }`}
            >
              Attendance
            </button>
            {isSchoolAdmin && isApproved && (
              <button
                type="button"
                onClick={() => setSubTab('bulk')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                  subTab === 'bulk' ? 'bg-[#14213D] text-white' : 'text-[#64748B]'
                }`}
              >
                Bulk CSV / XLSX
              </button>
            )}
          </div>
          {isApproved && (
            <button
              type="button"
              onClick={openCreateStudent}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Student</span>
            </button>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="bg-[#EFF6FF] border border-blue-200 rounded-2xl px-4 py-3 text-xs text-[#14213D] flex items-center justify-between">
          <span>{toastMsg}</span>
          <button type="button" onClick={() => setToastMsg('')} className="text-[#2563EB] font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && !modalOpen && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      {subTab === 'roster' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search student name, ID, guardian..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <select
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="All">All Classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.gradeName} - {c.section}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="All">All Statuses</option>
                {ENROLLMENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleExportStudentsCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {pagedStudents.length === 0 ? (
            <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl space-y-2 text-xs text-[#64748B]">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No student records found. Add a student manually or use Bulk CSV / XLSX import.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      <th className="py-2.5 pr-3">Student & ID</th>
                      <th className="py-2.5 px-3">Class / Roll</th>
                      <th className="py-2.5 px-3">Parent / Guardian</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 pl-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {pagedStudents.map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-50">
                        <td className="py-3 pr-3">
                          <div className="font-bold text-[#14213D]">{stu.fullName}</div>
                          <div className="text-[11px] font-mono text-slate-500">{stu.studentCode}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {stu.className} - {stu.section}
                          {stu.rollNumber ? (
                            <span className="text-slate-400 font-mono"> · #{stu.rollNumber}</span>
                          ) : null}
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-800">
                            {stu.guardianName} ({stu.guardianRelation})
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">{stu.guardianPhone}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                stu.enrollmentStatus === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            <span>{stu.enrollmentStatus}</span>
                          </span>
                        </td>
                        <td className="py-3 pl-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setProfileStudent(stu)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 hover:border-[#2563EB] text-[11px] font-semibold text-[#14213D]"
                            >
                              360 Profile
                            </button>
                            {isApproved && (
                              <button
                                type="button"
                                onClick={() => openEditStudent(stu)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                                aria-label="Edit student"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <span>
                    Page {page} of {totalPages} ({filteredStudents.length} students)
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {subTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Attendance Date
                </label>
                <input
                  type="date"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Filter Class
                </label>
                <select
                  value={attClassId}
                  onChange={(e) => setAttClassId(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  <option value="All">All Active Students</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.gradeName} - {c.section}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {isApproved && attStudents.length > 0 && (
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveAttendanceBatch()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{saving ? 'Saving...' : `Save Attendance (${attStudents.length})`}</span>
              </button>
            )}
          </div>

          {attStudents.length === 0 ? (
            <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl text-xs text-[#64748B]">
              No active students found in this filter to mark attendance.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="py-2.5 pr-3">Student</th>
                    <th className="py-2.5 px-3">Class</th>
                    <th className="py-2.5 pl-3">Status on {attDate}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {attStudents.map((stu) => {
                    const existing = attendance.find(
                      (a) => a.personId === stu.id && a.date === attDate && a.personType === 'Student'
                    );
                    const current = attDraft[stu.id] || existing?.status || 'Present';
                    return (
                      <tr key={stu.id}>
                        <td className="py-2.5 pr-3 font-semibold text-[#14213D]">
                          {stu.fullName}{' '}
                          <span className="font-mono text-[11px] text-slate-400">({stu.studentCode})</span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {stu.className} - {stu.section}
                        </td>
                        <td className="py-2.5 pl-3">
                          <div className="flex flex-wrap gap-1.5">
                            {(['Present', 'Absent', 'Late', 'Excused'] as const).map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setAttDraft((prev) => ({ ...prev, [stu.id]: opt }))}
                                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                                  current === opt
                                    ? 'bg-[#14213D] border-[#14213D] text-white'
                                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {subTab === 'bulk' && isSchoolAdmin && isApproved && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-heading font-bold text-[#14213D]">
                Bulk CSV / Excel (XLSX) Student Import Wizard
              </h2>
              <p className="text-xs text-[#64748B]">
                Validates required fields, detects duplicates by Student Name + Guardian Phone, and exports failed rows cleanly.
              </p>
            </div>
            <button
              type="button"
              onClick={() => schoolPartnerService.downloadBulkStudentTemplateCsv()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#14213D]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template CSV</span>
            </button>
          </div>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-[#2563EB] hover:bg-[#EFF6FF]/40 transition-colors">
            <Upload className="w-8 h-8 text-[#2563EB] mb-2" />
            <span className="text-xs font-bold text-[#14213D]">
              {bulkBusy ? 'Validating spreadsheet...' : 'Select .CSV, .XLSX, or .XLS Student Sheet (max 10 MB)'}
            </span>
            <span className="text-[11px] text-[#64748B] mt-1">
              Columns supported: fullName, className, section, rollNumber, gender, dob, guardianName, guardianRelation, guardianPhone, guardianEmail
            </span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => void handleFileUpload(e)}
              className="hidden"
            />
          </label>

          {bulkResult && (
            <div className="space-y-4 border-t border-slate-200 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-slate-200 rounded-xl p-4">
                  <div className="text-[11px] text-[#64748B]">Total Rows Read</div>
                  <div className="text-xl font-bold font-mono tabular-nums text-[#14213D]">
                    {bulkResult.totalRows}
                  </div>
                </div>
                <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4">
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Valid & Ready to Import</span>
                  </div>
                  <div className="text-xl font-bold font-mono tabular-nums text-emerald-800">
                    {bulkResult.validRows.length}
                  </div>
                </div>
                <div className="border border-rose-200 bg-rose-50/40 rounded-xl p-4">
                  <div className="text-[11px] text-rose-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Failed Validation / Duplicates</span>
                  </div>
                  <div className="text-xl font-bold font-mono tabular-nums text-rose-800">
                    {bulkResult.failedRows.length}
                  </div>
                </div>
              </div>

              {bulkResult.failedRows.length > 0 && (
                <div className="border border-rose-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-900">
                      Validation Errors ({bulkResult.failedRows.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        schoolPartnerService.downloadCsvFile(
                          'student_import_errors.csv',
                          bulkResult.errorCsvText
                        )
                      }
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Error CSV</span>
                    </button>
                  </div>
                  <div className="max-h-40 overflow-y-auto text-[11px] text-rose-800 space-y-1">
                    {bulkResult.failedRows.slice(0, 12).map((f) => (
                      <div key={`${f.rowNumber}-${f.rawName}`}>
                        Row {f.rowNumber}: <strong>{f.rawName}</strong> — {f.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkResult(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Clear Preview
                </button>
                <button
                  type="button"
                  disabled={bulkBusy || bulkResult.validRows.length === 0}
                  onClick={() => void handleCommitBulk()}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {bulkBusy
                    ? 'Importing...'
                    : `Import ${bulkResult.validRows.length} Valid Student(s)`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStudent}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-base font-heading font-bold text-[#14213D]">
              {editing ? 'Update Student Record' : 'Admit / Register Student'}
            </h2>
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Student Full Name *
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Class & Section
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  {classes.length === 0 ? (
                    <option value="unassigned">Class 1 - A (Default)</option>
                  ) : (
                    classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.gradeName} - {c.section}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Parent / Guardian Name *
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Guardian Phone *
                </label>
                <input
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Guardian Email
                </label>
                <input
                  type="email"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Enrollment Status
                </label>
                <select
                  value={enrollmentStatus}
                  onChange={(e) => setEnrollmentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  {ENROLLMENT_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Student'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Student 360 Profile Drawer */}
      {profileStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex justify-end">
          <div className="bg-white w-full max-w-lg h-full overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-heading font-bold text-[#14213D]">
                  {profileStudent.fullName}
                </h2>
                <div className="text-xs text-[#64748B] font-mono">
                  {profileStudent.studentCode} · {profileStudent.className} - {profileStudent.section}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setProfileStudent(null)}
                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                schoolPartnerService.downloadStudentPerformancePdf({
                  institution,
                  student: profileStudent,
                  attendance,
                  programs: programEnrollments.filter((p) => p.studentId === profileStudent.id),
                  assessments: assessmentResults.filter((a) => a.studentId === profileStudent.id),
                  certificates: certificates.filter((c) => c.studentId === profileStudent.id),
                })
              }
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#14213D] hover:bg-[#0D172B] text-white text-xs font-semibold"
            >
              <FileText className="w-4 h-4" />
              <span>Download Performance Report PDF</span>
            </button>

            <div className="space-y-4 text-xs">
              <div className="border border-slate-200 rounded-xl p-4 space-y-1.5">
                <div className="font-bold text-[#14213D]">Guardian & Admission</div>
                <div className="text-slate-600">
                  Guardian: {profileStudent.guardianName} ({profileStudent.guardianRelation})
                </div>
                <div className="text-slate-600 font-mono">
                  Phone: {profileStudent.guardianPhone} · Email: {profileStudent.guardianEmail || 'N/A'}
                </div>
                <div className="text-slate-600">
                  Admission Date: {profileStudent.admissionDate} · Status: {profileStudent.enrollmentStatus}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="font-bold text-[#14213D]">OpenFrame Program Enrollments</div>
                {programEnrollments.filter((p) => p.studentId === profileStudent.id).length === 0 ? (
                  <p className="text-[#64748B]">No program enrollments yet.</p>
                ) : (
                  programEnrollments
                    .filter((p) => p.studentId === profileStudent.id)
                    .map((enr) => (
                      <div key={enr.id} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                        <span className="font-medium text-slate-800">{enr.programTitle}</span>
                        <span className="font-mono font-bold text-[#2563EB]">{enr.progressPercent}%</span>
                      </div>
                    ))
                )}
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="font-bold text-[#14213D]">IQ / EQ / SQ Educational Assessments</div>
                {assessmentResults.filter((a) => a.studentId === profileStudent.id).length === 0 ? (
                  <p className="text-[#64748B]">No submitted evaluations yet.</p>
                ) : (
                  assessmentResults
                    .filter((a) => a.studentId === profileStudent.id)
                    .map((res) => (
                      <div key={res.id} className="py-1 border-b border-slate-100 last:border-0">
                        <div className="flex items-center justify-between font-semibold text-slate-800">
                          <span>
                            [{res.dimension}] {res.assignmentTitle}
                          </span>
                          <span className="font-mono text-[#2563EB]">{res.scorePercent}%</span>
                        </div>
                        <div className="text-[11px] text-[#64748B]">{res.bandLabel}</div>
                      </div>
                    ))
                )}
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="font-bold text-[#14213D]">Certificates Issued</div>
                {certificates.filter((c) => c.studentId === profileStudent.id).length === 0 ? (
                  <p className="text-[#64748B]">No school certificates issued yet.</p>
                ) : (
                  certificates
                    .filter((c) => c.studentId === profileStudent.id)
                    .map((cert) => (
                      <div key={cert.id} className="flex items-center justify-between py-1">
                        <div>
                          <div className="font-medium text-slate-800">{cert.programTitle}</div>
                          <div className="font-mono text-[11px] text-slate-500">{cert.certificateId}</div>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-700">{cert.status}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
