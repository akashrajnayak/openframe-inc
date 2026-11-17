import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  School,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Send,
  ShieldCheck,
  ArrowRight,
  Lock,
  Building2,
  Users,
  Brain,
  Award,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { submitSchoolPartnerEnquiry, triggerAdminNotification } from '../services/firebase';
import { schoolPartnerService, SchoolAuditActor } from '../services/schoolPartnerService';
import {
  SchoolAssessmentAssignment,
  SchoolInstitution,
  SchoolIqEqSqResult,
  SchoolTenantAnnouncement,
  SchoolProgramEnrollment,
  SchoolStaffMember,
  SchoolTenantAttendanceRecord,
  SchoolTenantAuditLog,
  SchoolTenantCertificate,
  SchoolTenantClass,
  SchoolTenantPayment,
  SchoolTenantStudent,
} from '../types';
import { SchoolPartnerLayout, SchoolPortalSection } from '../components/school-partner/SchoolPartnerLayout';
import { SchoolRegistrationWizard } from '../components/school-partner/SchoolRegistrationWizard';
import { SchoolPartnerDashboard } from '../components/school-partner/SchoolPartnerDashboard';
import { SchoolClassesPanel } from '../components/school-partner/SchoolClassesPanel';
import { SchoolTeachersPanel } from '../components/school-partner/SchoolTeachersPanel';
import { SchoolStudentsPanel } from '../components/school-partner/SchoolStudentsPanel';
import { SchoolProgramsPanel } from '../components/school-partner/SchoolProgramsPanel';
import { SchoolAssessmentsPanel } from '../components/school-partner/SchoolAssessmentsPanel';
import { SchoolFinancePanel } from '../components/school-partner/SchoolFinancePanel';
import { SchoolCertificatesPanel } from '../components/school-partner/SchoolCertificatesPanel';
import { SchoolCommunicationsPanel } from '../components/school-partner/SchoolCommunicationsPanel';
import { SchoolAuditLogsPanel } from '../components/school-partner/SchoolAuditLogsPanel';

export const SchoolPartnerPage: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const {
    currentUser,
    lmsUser,
    portalRole,
    loginPortalGoogle,
    loginPortalEmail,
    logout,
  } = useAuth();

  const cleanPath = currentPath.split('?')[0] || '/partner/school';
  const isDashboardOrRegisterRoute =
    cleanPath === '/partner/school/dashboard' || cleanPath === '/partner/school/register';

  // Workspace state
  const [activeSection, setActiveSection] = useState<SchoolPortalSection>(
    cleanPath === '/partner/school/register' ? 'onboarding' : 'overview'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingTenant, setLoadingTenant] = useState(false);
  const [tenantError, setTenantError] = useState('');

  const [institution, setInstitution] = useState<SchoolInstitution | null>(null);
  const [classes, setClasses] = useState<SchoolTenantClass[]>([]);
  const [staff, setStaff] = useState<SchoolStaffMember[]>([]);
  const [students, setStudents] = useState<SchoolTenantStudent[]>([]);
  const [attendance, setAttendance] = useState<SchoolTenantAttendanceRecord[]>([]);
  const [programEnrollments, setProgramEnrollments] = useState<SchoolProgramEnrollment[]>([]);
  const [assignments, setAssignments] = useState<SchoolAssessmentAssignment[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<SchoolIqEqSqResult[]>([]);
  const [payments, setPayments] = useState<SchoolTenantPayment[]>([]);
  const [certificates, setCertificates] = useState<SchoolTenantCertificate[]>([]);
  const [announcements, setAnnouncements] = useState<SchoolTenantAnnouncement[]>([]);
  const [auditLogs, setAuditLogs] = useState<SchoolTenantAuditLog[]>([]);

  // Inline Quick Sign-In State (when visiting /partner/school/dashboard unauthenticated)
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authErr, setAuthErr] = useState('');

  // Public Partnership Enquiry Form State (preserved for quick enquiries)
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: '',
    contactPerson: '',
    designation: '',
    mobileNumber: '',
    emailAddress: '',
    city: '',
    state: 'Karnataka',
    institutionType: 'K-12 School' as
      | 'K-12 School'
      | 'Junior College / PUC'
      | 'Degree College / University'
      | 'Coaching / Academy'
      | 'Other Institution',
    partnershipInterest: 'Computer Science & AI Curriculum (Class 1-12)',
    studentStrength: '',
    message: '',
    consentAccepted: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [enquiryId, setEnquiryId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const actor: SchoolAuditActor = {
    uid: currentUser?.uid || '',
    email: currentUser?.email || lmsUser?.email || 'school-partner@openframe.local',
    role: portalRole,
  };

  const loadWorkspaceData = useCallback(async () => {
    if (!currentUser?.uid) return;
    setLoadingTenant(true);
    setTenantError('');
    try {
      const inst = await schoolPartnerService.getMySchoolInstitution(currentUser.uid);
      setInstitution(inst);
      if (!inst) {
        setClasses([]);
        setStaff([]);
        setStudents([]);
        setAttendance([]);
        setProgramEnrollments([]);
        setAssignments([]);
        setAssessmentResults([]);
        setPayments([]);
        setCertificates([]);
        setAnnouncements([]);
        setAuditLogs([]);
        return;
      }

      const isOwner = inst.adminUid === currentUser.uid || portalRole === 'admin';
      const teacherUidFilter = isOwner ? undefined : currentUser.uid;

      const [
        clsList,
        staffList,
        stuList,
        attList,
        progList,
        asgList,
        resList,
        payList,
        certList,
        annList,
        logList,
      ] = await Promise.all([
        schoolPartnerService.getSchoolClasses(inst.id, teacherUidFilter).catch(() => []),
        schoolPartnerService.getSchoolStaff(inst.id).catch(() => []),
        schoolPartnerService.getSchoolStudents(inst.id, teacherUidFilter).catch(() => []),
        schoolPartnerService.getSchoolAttendance(inst.id).catch(() => []),
        schoolPartnerService.getSchoolProgramEnrollments(inst.id).catch(() => []),
        schoolPartnerService.getSchoolAssessmentAssignments(inst.id).catch(() => []),
        schoolPartnerService.getSchoolAssessmentResults(inst.id).catch(() => []),
        isOwner ? schoolPartnerService.getSchoolPayments(inst.id).catch(() => []) : Promise.resolve([]),
        schoolPartnerService.getSchoolCertificates(inst.id).catch(() => []),
        schoolPartnerService.getSchoolAnnouncements(inst.id).catch(() => []),
        isOwner ? schoolPartnerService.getSchoolAuditLogs(inst.id).catch(() => []) : Promise.resolve([]),
      ]);

      setClasses(clsList);
      setStaff(staffList);
      setStudents(stuList);
      setAttendance(attList);
      setProgramEnrollments(progList);
      setAssignments(asgList);
      setAssessmentResults(resList);
      setPayments(payList);
      setCertificates(certList);
      setAnnouncements(annList);
      setAuditLogs(logList);
    } catch (err: any) {
      setTenantError(err?.message || 'Unable to load school workspace data.');
    } finally {
      setLoadingTenant(false);
    }
  }, [currentUser?.uid, portalRole]);

  useEffect(() => {
    if (currentUser?.uid && isDashboardOrRegisterRoute) {
      void loadWorkspaceData();
    }
  }, [currentUser?.uid, isDashboardOrRegisterRoute, loadWorkspaceData]);

  useEffect(() => {
    if (cleanPath === '/partner/school/register') {
      setActiveSection('onboarding');
    }
  }, [cleanPath]);

  const handleQuickLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthBusy(true);
    setAuthErr('');
    try {
      await loginPortalEmail(authEmail.trim(), authPass, 'institution_admin');
      navigate('/partner/school/dashboard');
    } catch (err: any) {
      setAuthErr(err?.message || 'Sign-in failed. Please check credentials.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleQuickLoginGoogle = async () => {
    setAuthBusy(true);
    setAuthErr('');
    try {
      await loginPortalGoogle('institution_admin');
      navigate('/partner/school/dashboard');
    } catch (err: any) {
      setAuthErr(err?.message || 'Google sign-in failed.');
    } finally {
      setAuthBusy(false);
    }
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.organizationName.trim() || !formData.contactPerson.trim() || !formData.designation.trim()) {
      setErrorMsg('Please complete school name, official contact person, and designation.');
      return;
    }
    if (!formData.emailAddress.includes('@') || formData.mobileNumber.length < 10 || !formData.city.trim()) {
      setErrorMsg('Please enter a valid institutional email, 10-digit mobile number, and city.');
      return;
    }
    if (!formData.consentAccepted) {
      setErrorMsg('Please accept the institutional enquiry terms before submitting.');
      return;
    }

    try {
      const payload = {
        organizationName: formData.organizationName.trim(),
        contactPerson: formData.contactPerson.trim(),
        designation: formData.designation.trim(),
        mobileNumber: formData.mobileNumber.trim(),
        emailAddress: formData.emailAddress.trim(),
        city: formData.city.trim(),
        state: formData.state.trim() || 'Karnataka',
        institutionType: formData.institutionType,
        partnershipInterest: formData.partnershipInterest,
        studentStrength: formData.studentStrength.trim() || undefined,
        message: formData.message.trim() || undefined,
        consentAccepted: true,
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };
      const newEnquiry = storageService.submitSchoolPartner(payload);
      try {
        await submitSchoolPartnerEnquiry(payload);
        await triggerAdminNotification({
          category: 'Partnership',
          title: `School Partnership: ${payload.organizationName}`,
          senderName: `${payload.contactPerson} (${payload.designation})`,
          senderEmail: payload.emailAddress,
          details: `Type: ${payload.institutionType} | Interest: ${payload.partnershipInterest} | Location: ${payload.city}, ${payload.state}`,
        });
      } catch {
        // Non-blocking fallback
      }
      setEnquiryId(newEnquiry.id);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setErrorMsg('Failed to submit enquiry. Please check your network connection.');
    }
  };

  // =========================================================================
  // 1. AUTHENTICATED SCHOOL PARTNER SAAS WORKSPACE (/partner/school/dashboard)
  // =========================================================================
  if (isDashboardOrRegisterRoute && currentUser) {
    const isSchoolAdmin = !institution || institution.adminUid === currentUser.uid || portalRole === 'admin';
    const isApproved = institution?.verificationStatus === 'Approved';

    const requiresApprovalSections: SchoolPortalSection[] = [
      'classes',
      'students',
      'teachers',
      'programs',
      'assessments',
      'finance',
      'certificates',
      'communications',
    ];
    const isSectionLocked =
      !isApproved && requiresApprovalSections.includes(activeSection);

    const unreadPortalAlerts = announcements.slice(0, 5).map((a) => ({
      id: a.id,
      title: a.title,
      message: a.message,
      createdAt: a.createdAt,
    }));

    return (
      <SchoolPartnerLayout
        institution={institution}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        userEmail={currentUser.email || ''}
        userName={lmsUser?.displayName || currentUser.displayName || 'School Partner'}
        isSchoolAdmin={isSchoolAdmin}
        isApproved={isApproved}
        unreadNotifications={unreadPortalAlerts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={() => {
          void logout().then(() => navigate('/partner/school'));
        }}
      >
        {tenantError && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-800">
            {tenantError}
          </div>
        )}

        {loadingTenant && !institution ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-[#64748B]">
            Loading your School Partner tenant workspace...
          </div>
        ) : isSectionLocked ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-heading font-bold text-[#14213D]">
              School Verification Required Before Operations Unlock
            </h2>
            <p className="text-xs text-[#64748B] max-w-lg mx-auto leading-relaxed">
              {institution
                ? `Your institution (${institution.name}) is currently in "${institution.verificationStatus}" status. Operational tools unlock immediately once OpenFrame Education approves your verification application.`
                : 'Complete the 4-step School Onboarding & Verification Wizard to register your institution with OpenFrame Education.'}
            </p>
            <button
              type="button"
              onClick={() => setActiveSection('onboarding')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <span>{institution ? 'View Application Status' : 'Start 4-Step School Onboarding'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {activeSection === 'overview' && (
              <SchoolPartnerDashboard
                institution={institution}
                classes={classes}
                staff={staff}
                students={students}
                attendance={attendance}
                programEnrollments={programEnrollments}
                assessmentResults={assessmentResults}
                payments={payments}
                certificates={certificates}
                announcements={announcements}
                isSchoolAdmin={isSchoolAdmin}
                isApproved={isApproved}
                onNavigate={setActiveSection}
              />
            )}

            {activeSection === 'onboarding' && (
              <SchoolRegistrationWizard
                existingInstitution={institution}
                actor={actor}
                actorName={lmsUser?.displayName || currentUser.displayName || ''}
                onSaved={(savedInst) => {
                  setInstitution(savedInst);
                  void loadWorkspaceData();
                }}
              />
            )}

            {activeSection === 'classes' && institution && (
              <SchoolClassesPanel
                institution={institution}
                classes={classes}
                staff={staff}
                students={students}
                actor={actor}
                isSchoolAdmin={isSchoolAdmin}
                isApproved={isApproved}
                onRefresh={loadWorkspaceData}
              />
            )}

            {activeSection === 'teachers' && institution && (
              <SchoolTeachersPanel
                institution={institution}
                staff={staff}
                classes={classes}
                attendance={attendance}
                actor={actor}
                isSchoolAdmin={isSchoolAdmin}
                isApproved={isApproved}
                onRefresh={loadWorkspaceData}
              />
            )}

            {activeSection === 'students' && institution && (
              <SchoolStudentsPanel
                institution={institution}
                classes={classes}
                students={students}
                attendance={attendance}
                programEnrollments={programEnrollments}
                assessmentResults={assessmentResults}
                certificates={certificates}
                actor={actor}
                isSchoolAdmin={isSchoolAdmin}
                isApproved={isApproved}
                onRefresh={loadWorkspaceData}
              />
            )}

            {activeSection === 'programs' && institution && (
              <SchoolProgramsPanel
                institution={institution}
                classes={classes}
                students={students}
                enrollments={programEnrollments}
                actor={actor}
                isApproved={isApproved}
                onRefresh={loadWorkspaceData}
              />
            )}

            {activeSection === 'assessments' && institution && (
              <SchoolAssessmentsPanel
                institution={institution}
                classes={classes}
                students={students}
                assignments={assignments}
                results={assessmentResults}
                actor={actor}
                isApproved={isApproved}
                onRefresh={loadWorkspaceData}
              />
            )}

            {activeSection === 'finance' && institution && (
              <SchoolFinancePanel
                institution={institution}
                students={students}
                payments={payments}
                actor={actor}
                isSchoolAdmin={isSchoolAdmin}
                isApproved={isApproved}
                onRefresh={loadWorkspaceData}
              />
            )}

            {activeSection === 'certificates' && institution && (
              <SchoolCertificatesPanel
                institution={institution}
                students={students}
                certificates={certificates}
                actor={actor}
                isSchoolAdmin={isSchoolAdmin}
                isApproved={isApproved}
                onRefresh={loadWorkspaceData}
              />
            )}

            {activeSection === 'communications' && institution && (
              <SchoolCommunicationsPanel
                institution={institution}
                staff={staff}
                students={students}
                announcements={announcements}
                actor={actor}
                isApproved={isApproved}
                onRefresh={loadWorkspaceData}
              />
            )}

            {activeSection === 'audit' && institution && (
              <SchoolAuditLogsPanel institution={institution} auditLogs={auditLogs} />
            )}
          </>
        )}
      </SchoolPartnerLayout>
    );
  }

  // =========================================================================
  // 2. UNAUTHENTICATED / PUBLIC SCHOOL PARTNER PORTAL LANDING PAGE
  // =========================================================================
  const partnershipOptions = [
    'Computer Science & AI Curriculum (Class 1-12)',
    'StudyNotePro Digital Study & Classroom Management Tool',
    'STEM, IoT & Robotics Practical Laboratory Setup',
    'Faculty Enablement & Digital Pedagogy Masterclasses',
    'Comprehensive Digital Campus Software & Attendance Management',
    'Campus Hackathons & Student Technology Innovation Clubs',
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Brand Deep Navy Hero */}
      <section className="bg-[#0D172B] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <Link
              to="/work-with-us"
              className="inline-flex items-center gap-1.5 text-xs text-blue-300 hover:text-white font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Work With Us
            </Link>

            <div className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              All-India K-12 & Institutional SaaS Platform
            </div>

            <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight leading-tight">
              OpenFrame School Partner Portal
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              A complete multi-tenant digital campus workspace for CBSE, ICSE, IB, NIOS, and State Board schools — featuring verified onboarding, bulk student CSV/XLSX import, attendance, IQ/EQ/SQ educational evaluations, Razorpay billing, and QR-verified certificates.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              {currentUser ? (
                <button
                  type="button"
                  onClick={() => navigate('/partner/school/dashboard')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold"
                >
                  <span>Open Partner Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  to="/portal"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold"
                >
                  <span>Register New School Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => setShowEnquiryForm((p) => !p)}
                className="px-5 py-3 rounded-xl border border-slate-600 hover:border-slate-400 text-white text-xs font-semibold"
              >
                {showEnquiryForm ? 'Hide Quick Enquiry Form' : 'Submit Quick Partnership Enquiry'}
              </button>
            </div>
          </div>

          {/* Partner Sign-In Card */}
          <div className="lg:col-span-5 bg-white text-slate-900 rounded-2xl border border-slate-200 p-6 space-y-4">
            {currentUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#14213D] text-white flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#14213D]">Signed In</div>
                    <div className="text-xs text-[#64748B] truncate">{currentUser.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/partner/school/dashboard')}
                  className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold"
                >
                  Enter School Management Workspace →
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/partner/school/register')}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#14213D] text-xs font-semibold"
                >
                  School Registration & Document Upload
                </button>
              </div>
            ) : (
              <form onSubmit={handleQuickLoginEmail} className="space-y-3">
                <div>
                  <h2 className="text-base font-heading font-bold text-[#14213D]">
                    Partner School Sign In
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Access your school onboarding status, classes, assessments, and certificates.
                  </p>
                </div>

                {authErr && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                    {authErr}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    School Admin Email
                  </label>
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="principal@school.edu.in"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={authPass}
                    onChange={(e) => setAuthPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full py-2.5 rounded-xl bg-[#14213D] hover:bg-[#0D172B] text-white text-xs font-bold disabled:opacity-50"
                >
                  {authBusy ? 'Signing In...' : 'Sign In to Partner Portal'}
                </button>

                <button
                  type="button"
                  disabled={authBusy}
                  onClick={() => void handleQuickLoginGoogle()}
                  className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  Continue with Google
                </button>

                <div className="text-[11px] text-center text-[#64748B] pt-1">
                  New institution?{' '}
                  <Link to="/portal" className="text-[#2563EB] font-semibold hover:underline">
                    Create School Partner Account
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Capabilities Showcase */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: ShieldCheck,
              title: 'Verified Multi-Tenant Onboarding',
              desc: 'CBSE, ICSE, IB, NIOS & All-India State Boards with UDISE code verification & admin review.',
            },
            {
              icon: Users,
              title: 'Bulk Roster & Class Allocation',
              desc: 'Batch CSV/XLSX student import with duplicate detection, error row export & daily attendance.',
            },
            {
              icon: Brain,
              title: 'IQ / EQ / SQ Evaluations',
              desc: 'Grade-banded educational aptitude reflections with timer, autosave & PDF reports.',
            },
            {
              icon: Award,
              title: 'QR Certificates & Razorpay',
              desc: 'Cryptographic QR credentials with minimal public PII & verified Razorpay invoicing.',
            },
          ].map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2">
                <Icon className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#14213D]">{feat.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Preserved Quick Partnership Enquiry Form */}
        {(showEnquiryForm || submitted) && (
          <div className="max-w-4xl mx-auto">
            {submitted ? (
              <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h2 className="text-xl font-heading font-bold text-[#14213D]">
                  Institutional Enquiry Registered ({enquiryId})
                </h2>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  Thank you, {formData.contactPerson}. Our outreach coordinator will contact {formData.organizationName} shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleEnquirySubmit}
                className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-5"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-heading font-bold text-[#14213D]">
                    Quick School Partnership Enquiry
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Request a demonstration or institutional onboarding consultation prior to registering.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    placeholder="School / Institution Name *"
                    className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                    required
                  />
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Contact Person Name *"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                    required
                  />
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Designation (e.g. Principal) *"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                    required
                  />
                  <input
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    placeholder="Official Email *"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                    required
                  />
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="Official Mobile Number *"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                    required
                  />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City *"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                    required
                  />
                  <select
                    value={formData.partnershipInterest}
                    onChange={(e) => setFormData({ ...formData, partnershipInterest: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                  >
                    {partnershipOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-start gap-2.5 text-xs text-[#64748B] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentAccepted}
                    onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                    className="mt-0.5"
                    required
                  />
                  <span>
                    I submit this enquiry on behalf of the institution and agree to be contacted by OpenFrame Education.
                  </span>
                </label>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Institutional Enquiry</span>
                </button>
              </form>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
