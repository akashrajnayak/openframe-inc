import React, { useState, useEffect } from 'react';
import {
  Compass,
  LayoutDashboard,
  MapPin,
  School,
  UserPlus,
  Clock,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db, stripUndefinedDeep, submitStudentRegistration } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../router/RouterContext';
import { SocialAppShell, WorkspaceNavItem } from '../components/workspace/SocialAppShell';
import { DonutRingChart, MiniBarChart } from '../components/workspace/DashboardCharts';

type FieldNavId = 'overview' | 'visits' | 'lead_intake' | 'attendance';

export const FieldExecutiveDashboardPage: React.FC = () => {
  const { currentUser, lmsUser, isSuperAdmin, logout, loading: authLoading } = useAuth();
  const { navigate } = useRouter();

  const isAuthorized = Boolean(
    currentUser &&
      (lmsUser?.role === 'field_executive' ||
        lmsUser?.roles?.includes('field_executive') ||
        lmsUser?.role === 'admin' ||
        isSuperAdmin)
  );

  const [activeNav, setActiveNav] = useState<FieldNavId>('overview');
  const [loading, setLoading] = useState(true);
  const [execProfile, setExecProfile] = useState<any>(null);
  const [visits, setVisits] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Visit Form
  const [schoolName, setSchoolName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [city, setCity] = useState('');
  const [studentStrength, setStudentStrength] = useState('250');
  const [visitOutcome, setVisitOutcome] = useState('Interested');
  const [notes, setNotes] = useState('');
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Student Registration Lead Form
  const [stuName, setStuName] = useState('');
  const [stuPhone, setStuPhone] = useState('');
  const [stuEmail, setStuEmail] = useState('');
  const [stuCity, setStuCity] = useState('');
  const [stuSchool, setStuSchool] = useState('');
  const [stuCourse, setStuCourse] = useState('Artificial Intelligence & Digital Skills');

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || !isAuthorized) {
      setLoading(false);
      return;
    }

    let active = true;
    async function loadFieldData() {
      setLoading(true);
      try {
        const uid = currentUser!.uid;
        const [execSnap, visitSnap] = await Promise.all([
          getDoc(doc(db, 'field_executives', uid)).catch(() => null),
          getDocs(query(collection(db, 'school_visits'), where('executiveUid', '==', uid))).catch(() => null),
        ]);
        if (!active) return;
        if (execSnap && execSnap.exists()) setExecProfile(execSnap.data());
        setVisits(visitSnap ? visitSnap.docs.map((d) => ({ id: d.id, ...d.data() })) : []);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadFieldData();
    return () => {
      active = false;
    };
  }, [currentUser?.uid, authLoading, isAuthorized]);

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLocation({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5)),
        });
        setStatusMsg('Location coordinates tagged cleanly.');
      },
      () => {
        setStatusMsg('Location permission unavailable in browser.');
      }
    );
  };

  const handleLogVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !schoolName.trim()) return;
    const id = `visit_${currentUser.uid.slice(0, 6)}_${Date.now()}`;
    const payload = stripUndefinedDeep({
      id,
      executiveUid: currentUser.uid,
      executiveName: lmsUser?.displayName || currentUser.displayName || 'Field Executive',
      schoolName: schoolName.trim(),
      contactPerson: contactPerson.trim() || 'Principal Office',
      contactPhone: contactPhone.trim() || '—',
      city: city.trim() || 'Karnataka',
      studentStrength: Number(studentStrength) || 0,
      outcome: visitOutcome,
      notes: notes.trim(),
      ...(gpsLocation ? { coordinates: gpsLocation } : {}),
      visitedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'school_visits', id), payload);
    setVisits((prev) => [payload, ...prev]);
    setSchoolName('');
    setContactPerson('');
    setContactPhone('');
    setNotes('');
    setStatusMsg('School outreach visit logged to Firestore.');
  };

  const handleLeadRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName.trim() || !stuEmail.trim()) return;
    await submitStudentRegistration({
      fullName: stuName.trim(),
      mobileNumber: stuPhone.trim() || '0000000000',
      emailAddress: stuEmail.trim().toLowerCase(),
      dob: '2006-01-01',
      state: execProfile?.assignedRegion || 'Karnataka',
      district: stuCity.trim() || 'Bengaluru',
      city: stuCity.trim() || 'Bengaluru',
      schoolCollegeName: stuSchool.trim() || 'Field Outreach Campus',
      currentClassQualification: 'High School / Graduate',
      interestedCourse: stuCourse,
      preferredLearningMode: 'Hybrid / Practical Labs',
      consentAccepted: true,
      registeredAt: new Date().toISOString(),
      status: 'Registered',
      internalNotes: `Field Lead by ${lmsUser?.displayName || currentUser?.email}`,
    });
    setStuName('');
    setStuPhone('');
    setStuEmail('');
    setStuSchool('');
    setStatusMsg('Student registration lead submitted directly to LMS intake.');
  };

  const handleToggleShiftCheckIn = async () => {
    if (!currentUser) return;
    const nextState = execProfile?.shiftStatus === 'Checked In' ? 'Checked Out' : 'Checked In';
    const ts = new Date().toISOString();
    await updateDoc(doc(db, 'field_executives', currentUser.uid), {
      shiftStatus: nextState,
      lastCheckInAt: ts,
      updatedAt: ts,
    });
    setExecProfile((prev: any) => ({ ...prev, shiftStatus: nextState, lastCheckInAt: ts }));
    setStatusMsg(`Field shift status updated to ${nextState}.`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F2] flex items-center justify-center p-6">
        <div className="w-8 h-8 border-2 border-[#123D32] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-700 text-white flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-editorial font-semibold text-[#18221F]">Field Executive Portal</h1>
          <p className="text-xs text-[#64748B]">
            Sign in with your Field Executive credentials to log school outreach visits, check-ins, and student admissions.
          </p>
          <button
            type="button"
            onClick={() => navigate('/portal/field?redirect=/field/dashboard')}
            className="w-full py-3 rounded-xl bg-[#123D32] text-white text-xs font-semibold cursor-pointer"
          >
            Sign In to Field Portal
          </button>
        </div>
      </div>
    );
  }

  const navItems: WorkspaceNavItem[] = [
    { id: 'overview', label: 'Daily Summary', icon: LayoutDashboard },
    { id: 'visits', label: 'School Visits Log', icon: School, badge: visits.length },
    { id: 'lead_intake', label: 'Student Lead Form', icon: UserPlus },
    { id: 'attendance', label: 'Attendance & Shift', icon: Clock },
  ];

  const partneredCount = visits.filter((v) => v.outcome === 'Onboarded' || v.outcome === 'Interested').length;
  const conversionRate = visits.length > 0 ? Math.round((partneredCount / visits.length) * 100) : 0;

  return (
    <SocialAppShell
      roleLabel="Field Executive"
      userName={execProfile?.fullName || lmsUser?.displayName || currentUser.displayName || 'Field Executive'}
      userEmail={currentUser.email || ''}
      registrationId={lmsUser?.registrationNumber}
      navItems={navItems}
      activeNavId={activeNav}
      onSelectNav={(id) => setActiveNav(id as FieldNavId)}
      onLogout={async () => {
        await logout();
        navigate('/portal');
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">
              Field Outreach &amp; Institutional Expansion
            </div>
            <h1 className="text-2xl font-editorial font-semibold text-[#18221F] mt-0.5">
              {execProfile?.fullName || lmsUser?.displayName || 'Field Workspace'}
            </h1>
          </div>
          <button
            type="button"
            onClick={handleToggleShiftCheckIn}
            className="px-4 py-2 rounded-xl bg-[#123D32] hover:bg-[#0e3027] text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
          >
            {execProfile?.shiftStatus === 'Checked In' ? 'Checked In · End Shift' : 'Check In for Today'}
          </button>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>{statusMsg}</span>
            </span>
            <button type="button" onClick={() => setStatusMsg(null)} className="underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}
      </div>

      {activeNav === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="text-xs text-[#64748B]">Logged School Visits</div>
              <div className="text-3xl font-heading font-extrabold text-[#18221F] mt-1 tabular-nums">
                {visits.length}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Region: {execProfile?.assignedRegion || 'Karnataka'}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="text-xs text-[#64748B]">Interested / Onboarded</div>
              <div className="text-3xl font-heading font-extrabold text-[#123D32] mt-1 tabular-nums">
                {partneredCount}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Qualified campus pipelines</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="text-xs text-[#64748B]">Shift Attendance</div>
              <div className="text-lg font-heading font-bold text-[#2563EB] mt-2">
                {execProfile?.shiftStatus || 'Not Checked In'}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">
                {execProfile?.lastCheckInAt ? new Date(execProfile.lastCheckInAt).toLocaleString() : 'Tap Check In above'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
              <h2 className="text-sm font-heading font-bold text-[#18221F] mb-4">Visit Conversion Quality</h2>
              <DonutRingChart
                percent={conversionRate}
                color="#2563EB"
                label="Qualified Pipeline Share"
                sublabel={
                  visits.length > 0
                    ? `${partneredCount} of ${visits.length} visits advanced to follow-up or onboarding.`
                    : 'Log school outreach visits to compute qualification analytics.'
                }
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
              <h2 className="text-sm font-heading font-bold text-[#18221F] mb-4">Recent Visits Reach</h2>
              <MiniBarChart
                items={visits.slice(0, 4).map((v) => ({
                  label: v.schoolName,
                  value: Number(v.studentStrength) || 0,
                  color: '#123D32',
                  suffix: ' students',
                }))}
                emptyMessage="No school visit reports logged yet."
              />
            </div>
          </div>
        </div>
      )}

      {activeNav === 'visits' && (
        <div className="space-y-6">
          <form onSubmit={handleLogVisit} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-heading font-bold text-[#18221F] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#123D32]" />
                <span>Log School / Institution Visit</span>
              </h2>
              <button
                type="button"
                onClick={handleCaptureLocation}
                className="text-xs font-semibold text-[#2563EB] flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{gpsLocation ? `${gpsLocation.lat}, ${gpsLocation.lng}` : 'Tag GPS Location'}</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="School / Institution Name *"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="text"
                placeholder="City / Taluk"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="text"
                placeholder="Principal / Contact Person"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="tel"
                placeholder="Contact Phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="number"
                placeholder="Approx. Student Strength"
                value={studentStrength}
                onChange={(e) => setStudentStrength(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <select
                value={visitOutcome}
                onChange={(e) => setVisitOutcome(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              >
                <option value="Interested">Interested — Proposal Requested</option>
                <option value="Follow-up Scheduled">Follow-up Meeting Scheduled</option>
                <option value="Onboarded">Ready for Portal Onboarding</option>
                <option value="Not Interested">Not Interested Currently</option>
              </select>
            </div>
            <textarea
              rows={2}
              placeholder="Field notes or key discussion points..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60 text-xs"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
            >
              Save Visit Report
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100">
            {visits.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">No school visits logged yet.</div>
            ) : (
              visits.map((v) => (
                <div key={v.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-sm text-[#18221F]">{v.schoolName}</div>
                    <div className="text-[#64748B] mt-0.5">
                      {v.city} · {v.contactPerson} · Strength: {v.studentStrength}
                    </div>
                    {v.notes && <div className="text-[#18221F]/80 mt-1">{v.notes}</div>}
                  </div>
                  <span className="font-semibold text-[#123D32] shrink-0">{v.outcome}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeNav === 'lead_intake' && (
        <form onSubmit={handleLeadRegistration} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h2 className="text-sm font-heading font-bold text-[#18221F]">
            Quick Student Admission Lead Intake
          </h2>
          <p className="text-xs text-[#64748B]">
            Submits student details directly into the unified LMS admissions pipeline (`student_registrations`).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <input
              type="text"
              required
              placeholder="Student Full Name *"
              value={stuName}
              onChange={(e) => setStuName(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
            />
            <input
              type="email"
              required
              placeholder="Student / Parent Email *"
              value={stuEmail}
              onChange={(e) => setStuEmail(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
            />
            <input
              type="tel"
              placeholder="Mobile Number"
              value={stuPhone}
              onChange={(e) => setStuPhone(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
            />
            <input
              type="text"
              placeholder="City / District"
              value={stuCity}
              onChange={(e) => setStuCity(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
            />
            <input
              type="text"
              placeholder="School / College Name"
              value={stuSchool}
              onChange={(e) => setStuSchool(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
            />
            <input
              type="text"
              placeholder="Interested Course"
              value={stuCourse}
              onChange={(e) => setStuCourse(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#123D32] text-white text-xs font-semibold cursor-pointer"
          >
            Submit Student Registration
          </button>
        </form>
      )}

      {activeNav === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-[#18221F]">Daily Field Attendance Log</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-slate-200/70">
              <div className="text-[#64748B]">Employee / Field Code</div>
              <div className="font-bold text-sm text-[#18221F] mt-1 tabular-nums">
                {execProfile?.employeeCode || lmsUser?.registrationNumber}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-slate-200/70">
              <div className="text-[#64748B]">Current Shift State</div>
              <div className="font-bold text-sm text-[#123D32] mt-1">
                {execProfile?.shiftStatus || 'Not Checked In'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleShiftCheckIn}
            className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-semibold cursor-pointer"
          >
            Toggle Shift Check-In / Check-Out
          </button>
        </div>
      )}
    </SocialAppShell>
  );
};
