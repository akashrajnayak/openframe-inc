import React, { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  UserCheck,
  FileUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Save,
  Send,
  Trash2,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { ALL_INDIA_BOARDS } from '../../data/allIndiaBoardsData';
import {
  SchoolApplicationStatus,
  SchoolDocumentUpload,
  SchoolInstitution,
  SchoolPartnerInstitutionType,
} from '../../types';
import { SchoolAuditActor, schoolPartnerService } from '../../services/schoolPartnerService';
import { auth } from '../../services/firebase';
import { sendEmailVerification } from 'firebase/auth';

interface SchoolRegistrationWizardProps {
  existingInstitution: SchoolInstitution | null;
  actor: SchoolAuditActor;
  actorName: string;
  onSaved: (inst: SchoolInstitution) => void;
}

const TIMELINE_ORDER: SchoolApplicationStatus[] = [
  'Draft',
  'Submitted',
  'Under Review',
  'Approved',
];

export const SchoolRegistrationWizard: React.FC<SchoolRegistrationWizardProps> = ({
  existingInstitution,
  actor,
  actorName,
  onSaved,
}) => {
  const draftStorageKey = `of_school_draft_${actor.uid}`;

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [institutionType, setInstitutionType] =
    useState<SchoolPartnerInstitutionType>('K-12 School');
  const [boardAffiliation, setBoardAffiliation] = useState('CBSE');
  const [udiseCode, setUdiseCode] = useState('');
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [website, setWebsite] = useState('');
  const [studentCountEstimate, setStudentCountEstimate] = useState('450');
  const [teacherCountEstimate, setTeacherCountEstimate] = useState('25');

  const [principalName, setPrincipalName] = useState(actorName || '');
  const [principalDesignation, setPrincipalDesignation] = useState('Principal');
  const [principalMobile, setPrincipalMobile] = useState('');
  const [principalEmail, setPrincipalEmail] = useState(actor.email || '');
  const [emailVerificationNote, setEmailVerificationNote] = useState<string | null>(null);

  const [documents, setDocuments] = useState<SchoolDocumentUpload[]>([]);
  const [selectedDocType, setSelectedDocType] =
    useState<SchoolDocumentUpload['docType']>('Board Affiliation Letter');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [consentAccepted, setConsentAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load existing institution OR local recovery draft
  useEffect(() => {
    if (existingInstitution) {
      setName(existingInstitution.name || '');
      setInstitutionType(existingInstitution.institutionType || 'K-12 School');
      setBoardAffiliation(existingInstitution.boardAffiliation || 'CBSE');
      setUdiseCode(existingInstitution.udiseCode || '');
      setAddress(existingInstitution.address || '');
      setState(existingInstitution.state || 'Karnataka');
      setDistrict(existingInstitution.district || '');
      setCity(existingInstitution.city || '');
      setPinCode(existingInstitution.pinCode || '');
      setWebsite(existingInstitution.website || '');
      setStudentCountEstimate(String(existingInstitution.studentCountEstimate || 0));
      setTeacherCountEstimate(String(existingInstitution.teacherCountEstimate || 0));
      setPrincipalName(existingInstitution.principalName || actorName || '');
      setPrincipalDesignation(existingInstitution.principalDesignation || 'Principal');
      setPrincipalMobile(existingInstitution.principalMobile || '');
      setPrincipalEmail(existingInstitution.principalEmail || actor.email || '');
      setDocuments(existingInstitution.documents || []);
      setConsentAccepted(Boolean(existingInstitution.consentAccepted));
      return;
    }

    try {
      const savedDraft = localStorage.getItem(draftStorageKey);
      if (savedDraft) {
        const d = JSON.parse(savedDraft);
        if (d.name) setName(d.name);
        if (d.institutionType) setInstitutionType(d.institutionType);
        if (d.boardAffiliation) setBoardAffiliation(d.boardAffiliation);
        if (d.udiseCode) setUdiseCode(d.udiseCode);
        if (d.address) setAddress(d.address);
        if (d.state) setState(d.state);
        if (d.district) setDistrict(d.district);
        if (d.city) setCity(d.city);
        if (d.pinCode) setPinCode(d.pinCode);
        if (d.website) setWebsite(d.website);
        if (d.studentCountEstimate) setStudentCountEstimate(String(d.studentCountEstimate));
        if (d.teacherCountEstimate) setTeacherCountEstimate(String(d.teacherCountEstimate));
        if (d.principalName) setPrincipalName(d.principalName);
        if (d.principalDesignation) setPrincipalDesignation(d.principalDesignation);
        if (d.principalMobile) setPrincipalMobile(d.principalMobile);
        if (d.principalEmail) setPrincipalEmail(d.principalEmail);
      }
    } catch {
      // ignore storage read error
    }
  }, [existingInstitution, actor.uid]);

  // Auto-backup unsaved draft locally for slow networks
  useEffect(() => {
    if (existingInstitution?.verificationStatus === 'Approved') return;
    try {
      localStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          name,
          institutionType,
          boardAffiliation,
          udiseCode,
          address,
          state,
          district,
          city,
          pinCode,
          website,
          studentCountEstimate,
          teacherCountEstimate,
          principalName,
          principalDesignation,
          principalMobile,
          principalEmail,
        })
      );
    } catch {
      // ignore quota error
    }
  }, [
    name,
    institutionType,
    boardAffiliation,
    udiseCode,
    address,
    state,
    district,
    city,
    pinCode,
    website,
    studentCountEstimate,
    teacherCountEstimate,
    principalName,
    principalDesignation,
    principalMobile,
    principalEmail,
    draftStorageKey,
    existingInstitution?.verificationStatus,
  ]);

  const boardOptions = useMemo(() => {
    const names = ALL_INDIA_BOARDS.map((b) => b.shortName);
    return Array.from(new Set([...names, 'State Board (Other)', 'Autonomous / University']));
  }, []);

  const currentStatus: SchoolApplicationStatus =
    existingInstitution?.verificationStatus || 'Draft';

  const isEmailVerified = Boolean(auth.currentUser?.emailVerified);

  const handleSendEmailVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setEmailVerificationNote(
        `Verification link dispatched to ${auth.currentUser.email}. Refresh after confirming.`
      );
    } catch (err: any) {
      setEmailVerificationNote(err?.message || 'Unable to send verification link right now.');
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');
    setUploadingDoc(true);
    try {
      const docMeta = await schoolPartnerService.uploadSchoolDocument(file, selectedDocType);
      setDocuments((prev) => [...prev, docMeta]);
      setSuccessMsg(`Uploaded "${docMeta.fileName}" (${(docMeta.sizeBytes / 1024).toFixed(1)} KB).`);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to upload document.');
    } finally {
      setUploadingDoc(false);
      e.target.value = '';
    }
  };

  const handleSaveOrSubmit = async (submitNow: boolean) => {
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);
    try {
      const saved = await schoolPartnerService.saveOrSubmitSchoolApplication(
        {
          id: existingInstitution?.id,
          applicationRef: existingInstitution?.applicationRef,
          institutionCode: existingInstitution?.institutionCode,
          name,
          institutionType,
          boardAffiliation,
          udiseCode,
          address,
          state,
          district,
          city,
          pinCode,
          website,
          studentCountEstimate: Number(studentCountEstimate) || 0,
          teacherCountEstimate: Number(teacherCountEstimate) || 0,
          principalName,
          principalDesignation,
          principalMobile,
          principalMobileVerified: Boolean(principalMobile.replace(/\D/g, '').length >= 10),
          principalEmail,
          principalEmailVerified: isEmailVerified,
          documents,
          consentAccepted,
          verificationStatus: existingInstitution?.verificationStatus,
        },
        submitNow,
        actor
      );
      setSuccessMsg(
        submitNow
          ? `Application ${saved.applicationRef} submitted for OpenFrame Admin review.`
          : `Draft ${saved.applicationRef} saved securely.`
      );
      onSaved(saved);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save application.');
    } finally {
      setSaving(false);
    }
  };

  const canResubmitOrEdit =
    !existingInstitution ||
    currentStatus === 'Draft' ||
    currentStatus === 'More Information Required' ||
    currentStatus === 'Rejected' ||
    currentStatus === 'Approved';

  return (
    <div className="space-y-6">
      {/* Status Banner & Application Timeline */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-slate-500">
              Application Reference ·{' '}
              <span className="font-mono text-slate-900">
                {existingInstitution?.applicationRef || 'Not Assigned Yet'}
              </span>
              {existingInstitution?.institutionCode && (
                <>
                  {' '}
                  · Code:{' '}
                  <span className="font-mono font-semibold text-[#2563EB]">
                    {existingInstitution.institutionCode}
                  </span>
                </>
              )}
            </div>
            <h1 className="text-xl font-bold text-[#14213D] mt-1">
              School Partner Onboarding & Verification
            </h1>
          </div>

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800">
            <span
              className={`w-2 h-2 rounded-full ${
                currentStatus === 'Approved'
                  ? 'bg-emerald-500'
                  : currentStatus === 'Submitted' || currentStatus === 'Under Review'
                  ? 'bg-[#2563EB]'
                  : currentStatus === 'More Information Required'
                  ? 'bg-amber-500'
                  : currentStatus === 'Rejected' || currentStatus === 'Suspended'
                  ? 'bg-rose-500'
                  : 'bg-slate-400'
              }`}
            />
            <span>Current Status: {currentStatus}</span>
          </div>
        </div>

        {/* 4-Step Lifecycle Timeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {TIMELINE_ORDER.map((stage, idx) => {
            const reached =
              currentStatus === stage ||
              (currentStatus === 'Approved' && idx <= 3) ||
              (currentStatus === 'Under Review' && idx <= 2) ||
              (currentStatus === 'Submitted' && idx <= 1);
            return (
              <div
                key={stage}
                className={`p-3 rounded-xl border text-xs ${
                  reached
                    ? 'bg-[#EFF6FF] border-blue-200 text-[#14213D]'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <div className="font-mono text-[11px] font-semibold">Step {idx + 1}</div>
                <div className="font-semibold mt-0.5">{stage}</div>
              </div>
            );
          })}
        </div>

        {/* Reviewer Feedback Alert (when corrections requested / rejected / suspended) */}
        {existingInstitution?.reviewerNotes && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
              currentStatus === 'Approved'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : currentStatus === 'More Information Required'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold">
                Reviewer Note ({existingInstitution.reviewedBy || 'OpenFrame Academic Board'})
              </div>
              <p className="mt-1">{existingInstitution.reviewerNotes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Wizard Form */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {/* Step Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200 bg-slate-50/70">
          {[
            { id: 1 as const, label: '1. School Identity', icon: Building2 },
            { id: 2 as const, label: '2. Principal & Contact', icon: UserCheck },
            { id: 3 as const, label: '3. Verification Docs', icon: FileUp },
            { id: 4 as const, label: '4. Review & Submit', icon: CheckCircle2 },
          ].map((t) => {
            const Icon = t.icon;
            const active = step === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setStep(t.id)}
                className={`px-4 py-3.5 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                  active
                    ? 'border-[#2563EB] text-[#2563EB] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: School Identity */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official School / Institution Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Vidyaniketan Public School"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Institution Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value as SchoolPartnerInstitutionType)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="K-12 School">K-12 School</option>
                  <option value="Primary School">Primary School (LKG–5)</option>
                  <option value="High School">High School (6–10)</option>
                  <option value="Pre-University / Junior College">Pre-University / Junior College (11–12)</option>
                  <option value="Degree College / University">Degree College / University</option>
                  <option value="Coaching / Skill Academy">Coaching / Skill Academy</option>
                  <option value="Other Institution">Other Educational Trust</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Board / Council Affiliation <span className="text-rose-500">*</span>
                </label>
                <select
                  value={boardAffiliation}
                  onChange={(e) => setBoardAffiliation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                >
                  {boardOptions.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  UDISE+ Code / Board Affiliation No. <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={udiseCode}
                  onChange={(e) => setUdiseCode(e.target.value)}
                  placeholder="e.g. 29150401201 or CBSE-830142"
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official School Website
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://school.edu.in"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Campus Street Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot / Sector / Landmark"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  City / Town <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  District <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Bengaluru Urban"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  State / UT <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Karnataka"
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="560001"
                  maxLength={10}
                  className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Estimated Enrolled Students
                </label>
                <input
                  type="number"
                  min={0}
                  value={studentCountEstimate}
                  onChange={(e) => setStudentCountEstimate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs tabular-nums border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Estimated Faculty / Teachers
                </label>
                <input
                  type="number"
                  min={0}
                  value={teacherCountEstimate}
                  onChange={(e) => setTeacherCountEstimate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs tabular-nums border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Principal / Authorized Contact */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Principal / Authorized Representative <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    placeholder="Dr. Meenakshi Kulkarni"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Official Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={principalDesignation}
                    onChange={(e) => setPrincipalDesignation(e.target.value)}
                    placeholder="Principal / Correspondent / Director"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Official Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={principalEmail}
                    onChange={(e) => setPrincipalEmail(e.target.value)}
                    placeholder="principal@school.edu.in"
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Official Contact Mobile <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={principalMobile}
                    onChange={(e) => setPrincipalMobile(e.target.value)}
                    placeholder="+91 98450 12345"
                    className="w-full px-3.5 py-2.5 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-semibold text-slate-900">
                    Account Email Verification:{' '}
                    <span className={isEmailVerified ? 'text-emerald-700' : 'text-amber-700'}>
                      {isEmailVerified ? 'Verified via Firebase Auth' : 'Pending Verification'}
                    </span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Portal account: {actor.email}. Phone SMS OTP requires server Twilio activation; contact format is validated automatically.
                  </p>
                  {emailVerificationNote && (
                    <p className="text-[#2563EB] mt-1 font-medium">{emailVerificationNote}</p>
                  )}
                </div>
                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendEmailVerification}
                    className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 shrink-0"
                  >
                    Send Verification Email
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Supporting Document Uploads */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#EFF6FF] border border-blue-200 text-xs text-slate-800 space-y-1">
                <div className="font-semibold text-[#14213D]">Accepted Institutional Proof</div>
                <p>
                  Upload PDF, JPG, PNG, or WEBP files (max 10 MB each). Files undergo server-side extension and MIME verification before storage.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Document Category
                  </label>
                  <select
                    value={selectedDocType}
                    onChange={(e) => setSelectedDocType(e.target.value as SchoolDocumentUpload['docType'])}
                    className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50"
                  >
                    <option value="Board Affiliation Letter">Board Affiliation Letter</option>
                    <option value="UDISE Certificate">UDISE+ Registration Extract</option>
                    <option value="Registration Certificate">Trust / Society Registration Certificate</option>
                    <option value="Principal Authorization">Principal / Management Authorization Letter</option>
                    <option value="Other">Other Supporting Document</option>
                  </select>
                </div>
                <label className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer inline-flex items-center justify-center gap-2 shrink-0">
                  {uploadingDoc ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileUp className="w-3.5 h-3.5" />}
                  <span>{uploadingDoc ? 'Validating & Uploading...' : 'Choose File & Upload'}</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    onChange={handleDocumentUpload}
                    disabled={uploadingDoc}
                    className="hidden"
                  />
                </label>
              </div>

              {documents.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl text-xs text-slate-500">
                  No documents uploaded yet. You may save a draft now and attach documents prior to final verification.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl">
                  {documents.map((d) => (
                    <div key={d.id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{d.fileName}</div>
                        <div className="text-slate-500">
                          {d.docType} · {(d.sizeBytes / 1024).toFixed(1)} KB · {d.status}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#2563EB]"
                          title="Open document"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setDocuments((prev) => prev.filter((item) => item.id !== d.id))}
                          className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50"
                          title="Remove document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review & Submit */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-500">Institution</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{name || '—'}</div>
                  <div className="text-slate-600">
                    {institutionType} · {boardAffiliation}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">UDISE / Affiliation</div>
                  <div className="font-mono font-semibold text-slate-900 mt-0.5">{udiseCode || '—'}</div>
                  <div className="text-slate-600">
                    {city || '—'}, {district || '—'}, {state || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Authorized Representative</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {principalName || '—'} ({principalDesignation})
                  </div>
                  <div className="text-slate-600">
                    {principalEmail} · {principalMobile || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Documents Attached</div>
                  <div className="font-semibold text-slate-900 mt-0.5 tabular-nums">
                    {documents.length} file(s)
                  </div>
                  <div className="text-slate-600">
                    {studentCountEstimate || 0} students · {teacherCountEstimate || 0} faculty est.
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 bg-white cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(e) => setConsentAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#2563EB]"
                />
                <span>
                  I confirm that I am an authorized official of the school named above and that all registration identifiers and documents submitted for OpenFrame School Partnership onboarding are accurate.
                </span>
              </label>
            </div>
          )}

          {/* Footer Navigation & Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : 1))}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Previous Step
                </button>
              )}
              {step < 4 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s < 4 ? ((s + 1) as 1 | 2 | 3 | 4) : 4))}
                  className="px-4 py-2 rounded-xl bg-[#14213D] hover:bg-[#0D172B] text-white text-xs font-semibold"
                >
                  Next Step
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saving || !name.trim()}
                onClick={() => handleSaveOrSubmit(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              {canResubmitOrEdit && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveOrSubmit(true)}
                  className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {currentStatus === 'More Information Required' || currentStatus === 'Rejected'
                      ? 'Resubmit Application'
                      : currentStatus === 'Approved'
                      ? 'Update School Profile'
                      : 'Submit for Review'}
                  </span>
                </button>
              )}

              {(currentStatus === 'Submitted' || currentStatus === 'Under Review') && (
                <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Awaiting OpenFrame Admin Review</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
