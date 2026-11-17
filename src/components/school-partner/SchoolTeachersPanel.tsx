import React, { useMemo, useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Pencil,
  Power,
  CalendarCheck,
} from 'lucide-react';
import {
  SchoolInstitution,
  SchoolStaffMember,
  SchoolStaffRole,
  SchoolTenantAttendanceRecord,
  SchoolTenantClass,
} from '../../types';
import { SchoolAuditActor, schoolPartnerService } from '../../services/schoolPartnerService';

interface SchoolTeachersPanelProps {
  institution: SchoolInstitution;
  staff: SchoolStaffMember[];
  classes: SchoolTenantClass[];
  attendance: SchoolTenantAttendanceRecord[];
  actor: SchoolAuditActor;
  isSchoolAdmin: boolean;
  isApproved: boolean;
  onRefresh: () => Promise<void>;
}

const STAFF_ROLES: SchoolStaffRole[] = [
  'Teacher',
  'Class Teacher',
  'Subject Coordinator',
  'Academic Counselor',
  'School Admin Staff',
  'Support Staff',
];

export const SchoolTeachersPanel: React.FC<SchoolTeachersPanelProps> = ({
  institution,
  staff,
  classes,
  attendance,
  actor,
  isSchoolAdmin,
  isApproved,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Suspended'>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolStaffMember | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [role, setRole] = useState<SchoolStaffRole>('Teacher');
  const [qualification, setQualification] = useState('B.Ed / Graduate');
  const [subjectsText, setSubjectsText] = useState('');
  const [staffUid, setStaffUid] = useState('');
  const [assignedClassIds, setAssignedClassIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const todayStr = new Date().toISOString().slice(0, 10);

  const openCreate = () => {
    setEditing(null);
    setFullName('');
    setEmail('');
    setMobileNumber('');
    setRole('Teacher');
    setQualification('B.Ed / Graduate');
    setSubjectsText('');
    setStaffUid('');
    setAssignedClassIds([]);
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEdit = (member: SchoolStaffMember) => {
    setEditing(member);
    setFullName(member.fullName);
    setEmail(member.email);
    setMobileNumber(member.mobileNumber);
    setRole(member.role);
    setQualification(member.qualification);
    setSubjectsText((member.subjects || []).join(', '));
    setStaffUid(member.staffUid || '');
    setAssignedClassIds(member.assignedClassIds || []);
    setErrorMsg('');
    setModalOpen(true);
  };

  const toggleClassPick = (clsId: string) => {
    setAssignedClassIds((prev) =>
      prev.includes(clsId) ? prev.filter((id) => id !== clsId) : [...prev, clsId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.includes('@')) {
      setErrorMsg('Please enter staff full name and a valid email address.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const assignedLabels = classes
        .filter((c) => assignedClassIds.includes(c.id))
        .map((c) => `${c.gradeName} - ${c.section}`);
      await schoolPartnerService.saveSchoolStaff(
        {
          id: editing?.id,
          staffCode: editing?.staffCode,
          joinedAt: editing?.joinedAt,
          institutionId: institution.id,
          institutionAdminUid: institution.adminUid,
          staffUid: staffUid.trim() || undefined,
          fullName: fullName.trim(),
          email: email.trim(),
          mobileNumber: mobileNumber.trim(),
          role,
          qualification: qualification.trim(),
          subjects: subjectsText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          assignedClassIds,
          assignedClassLabels: assignedLabels,
          status: editing?.status || 'Active',
        },
        institution,
        actor
      );
      setModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to save staff profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (member: SchoolStaffMember) => {
    const next = member.status === 'Active' ? 'Inactive' : 'Active';
    setSaving(true);
    try {
      await schoolPartnerService.toggleSchoolStaffStatus(member, next, actor);
      await onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const handleMarkStaffAttendance = async (
    member: SchoolStaffMember,
    status: 'Present' | 'Absent' | 'Late'
  ) => {
    setSaving(true);
    try {
      await schoolPartnerService.saveAttendanceBatch(
        [
          {
            institutionId: institution.id,
            institutionAdminUid: institution.adminUid,
            personId: member.id,
            personName: member.fullName,
            personType: 'Staff',
            date: todayStr,
            status,
            markedByUid: actor.uid,
            markedByName: actor.email,
          },
        ],
        actor
      );
      setToastMsg(`Marked ${member.fullName} as ${status} for ${todayStr}.`);
      await onRefresh();
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return staff.filter((m) => {
      const matchStatus = statusFilter === 'All' || m.status === statusFilter;
      const matchQuery =
        !q ||
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.staffCode.toLowerCase().includes(q) ||
        m.subjects.join(' ').toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [staff, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-heading font-bold text-[#14213D]">
            Teachers & Staff Directory
          </h1>
          <p className="text-xs text-[#64748B]">
            Onboard teachers, assign classes/subjects, log daily staff attendance, and deactivate without erasing academic history.
          </p>
        </div>
        {isSchoolAdmin && isApproved && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Teacher / Staff</span>
          </button>
        )}
      </div>

      {toastMsg && (
        <div className="bg-[#EFF6FF] border border-blue-200 rounded-2xl px-4 py-3 text-xs text-[#14213D] flex items-center justify-between">
          <span>{toastMsg}</span>
          <button type="button" onClick={() => setToastMsg('')} className="text-[#2563EB] font-semibold">
            Dismiss
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search teacher name, code, subject, or email..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl space-y-2 text-xs text-[#64748B]">
            <UserCheck className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No teachers or staff added yet. Add faculty members and link their Firebase UID if they sign in to manage assigned classes.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 pr-3">Faculty / Staff</th>
                  <th className="py-2.5 px-3">Role & Subjects</th>
                  <th className="py-2.5 px-3">Assigned Classes</th>
                  <th className="py-2.5 px-3">Today ({todayStr})</th>
                  <th className="py-2.5 px-3">Status</th>
                  {isSchoolAdmin && isApproved && <th className="py-2.5 pl-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((member) => {
                  const todayAtt = attendance.find(
                    (a) => a.personType === 'Staff' && a.personId === member.id && a.date === todayStr
                  );
                  return (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-3">
                        <div className="font-bold text-[#14213D]">{member.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {member.staffCode} · {member.email}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{member.role}</div>
                        <div className="text-[11px] text-[#64748B]">
                          {member.subjects.length > 0 ? member.subjects.join(', ') : member.qualification}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {member.assignedClassLabels.length > 0
                          ? member.assignedClassLabels.join(', ')
                          : 'Unassigned'}
                      </td>
                      <td className="py-3 px-3">
                        {todayAtt ? (
                          <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                            <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{todayAtt.status}</span>
                          </span>
                        ) : isSchoolAdmin && isApproved ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void handleMarkStaffAttendance(member, 'Present')}
                              className="px-2 py-1 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 text-[11px] font-semibold"
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void handleMarkStaffAttendance(member, 'Absent')}
                              className="px-2 py-1 rounded border border-slate-200 text-slate-600 text-[11px]"
                            >
                              Absent
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400">Not Marked</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              member.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{member.status}</span>
                        </span>
                      </td>
                      {isSchoolAdmin && isApproved && (
                        <td className="py-3 pl-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEdit(member)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                              aria-label="Edit teacher"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void handleToggleStatus(member)}
                              title={member.status === 'Active' ? 'Deactivate' : 'Reactivate'}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-base font-heading font-bold text-[#14213D]">
              {editing ? 'Update Teacher / Staff Profile' : 'Add Teacher / Staff Member'}
            </h2>
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as SchoolStaffRole)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mobile *</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Qualification</label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Firebase UID (Optional portal login)
                </label>
                <input
                  type="text"
                  value={staffUid}
                  onChange={(e) => setStaffUid(e.target.value)}
                  placeholder="Teacher Firebase UID"
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Subjects (comma-separated)
              </label>
              <input
                type="text"
                value={subjectsText}
                onChange={(e) => setSubjectsText(e.target.value)}
                placeholder="Mathematics, Computer Science, AI"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            {classes.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  Assign Classes / Sections
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {classes.map((c) => {
                    const checked = assignedClassIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border text-xs cursor-pointer ${
                          checked
                            ? 'border-[#2563EB] bg-[#EFF6FF] text-[#14213D] font-semibold'
                            : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleClassPick(c.id)}
                        />
                        <span className="truncate">
                          {c.gradeName}-{c.section}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

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
                {saving ? 'Saving...' : 'Save Staff Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
