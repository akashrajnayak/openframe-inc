import React, { useMemo, useState } from 'react';
import { Layers, Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import {
  SchoolInstitution,
  SchoolStaffMember,
  SchoolTenantClass,
  SchoolTenantStudent,
} from '../../types';
import { SchoolAuditActor, schoolPartnerService } from '../../services/schoolPartnerService';

interface SchoolClassesPanelProps {
  institution: SchoolInstitution;
  classes: SchoolTenantClass[];
  staff: SchoolStaffMember[];
  students: SchoolTenantStudent[];
  actor: SchoolAuditActor;
  isSchoolAdmin: boolean;
  isApproved: boolean;
  onRefresh: () => Promise<void>;
}

export const SchoolClassesPanel: React.FC<SchoolClassesPanelProps> = ({
  institution,
  classes,
  staff,
  students,
  actor,
  isSchoolAdmin,
  isApproved,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editing, setEditing] = useState<SchoolTenantClass | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [gradeName, setGradeName] = useState('');
  const [section, setSection] = useState('A');
  const [academicYear, setAcademicYear] = useState('2026-27');
  const [classTeacherUid, setClassTeacherUid] = useState('');
  const [capacity, setCapacity] = useState('45');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const openCreate = () => {
    setEditing(null);
    setGradeName('');
    setSection('A');
    setAcademicYear('2026-27');
    setClassTeacherUid('');
    setCapacity('45');
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEdit = (cls: SchoolTenantClass) => {
    setEditing(cls);
    setGradeName(cls.gradeName);
    setSection(cls.section);
    setAcademicYear(cls.academicYear);
    setClassTeacherUid(cls.classTeacherUid || '');
    setCapacity(String(cls.capacity || 45));
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradeName.trim()) {
      setErrorMsg('Please enter a class / grade name (e.g. Class 8 or Grade 10).');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const selectedTeacher = staff.find(
        (s) => (s.staffUid && s.staffUid === classTeacherUid) || s.id === classTeacherUid
      );
      const teacherAuthUid = selectedTeacher?.staffUid || classTeacherUid.trim() || undefined;
      await schoolPartnerService.saveSchoolClass(
        {
          id: editing?.id,
          institutionId: institution.id,
          institutionAdminUid: institution.adminUid,
          gradeName: gradeName.trim(),
          section: section.trim() || 'A',
          academicYear: academicYear.trim() || '2026-27',
          classTeacherUid: teacherAuthUid,
          classTeacherName: selectedTeacher?.fullName || undefined,
          capacity: Number(capacity) || 45,
          assignedTeacherUids: teacherAuthUid ? [teacherAuthUid] : editing?.assignedTeacherUids || [],
        },
        actor
      );
      setModalOpen(false);
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to save class.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cls: SchoolTenantClass) => {
    setSaving(true);
    try {
      await schoolPartnerService.deleteSchoolClass(cls, actor);
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to delete class.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return classes;
    return classes.filter(
      (c) =>
        c.gradeName.toLowerCase().includes(q) ||
        c.section.toLowerCase().includes(q) ||
        (c.classTeacherName || '').toLowerCase().includes(q)
    );
  }, [classes, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-heading font-bold text-[#14213D]">
            Classes & Academic Sections
          </h1>
          <p className="text-xs text-[#64748B]">
            Configure grades, sections, capacities, and class teacher assignments for {institution.name}.
          </p>
        </div>
        {isSchoolAdmin && isApproved && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Create Class / Section</span>
          </button>
        )}
      </div>

      {!isApproved && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
          Your school application is currently <strong>{institution.verificationStatus}</strong>. Creating or editing classes unlocks automatically upon approval.
        </div>
      )}

      {errorMsg && !modalOpen && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800">
          {errorMsg}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter classes or teachers..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl space-y-2 text-xs text-[#64748B]">
            <Layers className="w-8 h-8 text-slate-300 mx-auto" />
            <p>No classes created yet. Add grades (e.g., Class 6 - A, Class 10 - B) to organize rosters and assessments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((cls) => {
              const count = students.filter((s) => s.classId === cls.id).length;
              return (
                <div
                  key={cls.id}
                  className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-4 hover:border-blue-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-[#14213D]">
                        {cls.gradeName} — Section {cls.section}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">{cls.academicYear}</span>
                    </div>
                    <div className="text-xs text-[#64748B]">
                      Class Teacher: {cls.classTeacherName || 'Unassigned'}
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono tabular-nums font-semibold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-[#2563EB]" />
                      {count} / {cls.capacity || 45} Students
                    </span>
                    {isSchoolAdmin && isApproved && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEdit(cls)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                          aria-label="Edit class"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void handleDelete(cls)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 text-rose-600"
                          aria-label="Delete class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl"
          >
            <h2 className="text-base font-heading font-bold text-[#14213D]">
              {editing ? 'Update Class & Section' : 'Create New Class / Section'}
            </h2>
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Class / Grade *
                </label>
                <input
                  type="text"
                  value={gradeName}
                  onChange={(e) => setGradeName(e.target.value)}
                  placeholder="e.g. Class 8"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Section *
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value.toUpperCase())}
                  placeholder="A"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Academic Year
                </label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2026-27"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Seat Capacity
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Assign Class Teacher (from Active Staff)
              </label>
              <select
                value={classTeacherUid}
                onChange={(e) => setClassTeacherUid(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="">-- Unassigned --</option>
                {staff
                  .filter((s) => s.status === 'Active')
                  .map((t) => (
                    <option key={t.id} value={t.staffUid || t.id}>
                      {t.fullName} ({t.role})
                    </option>
                  ))}
              </select>
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
                {saving ? 'Saving...' : 'Save Class'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
