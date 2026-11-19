import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  LayoutDashboard,
  Users,
  BookOpen,
  UserCheck,
  Plus,
  CheckCircle2,
  MapPin,
  Sparkles,
  Building2,
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
import { db, stripUndefinedDeep } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../router/RouterContext';
import { SocialAppShell, WorkspaceNavItem } from '../components/workspace/SocialAppShell';
import { DonutRingChart, MiniBarChart } from '../components/workspace/DashboardCharts';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';

type NgoNavId = 'overview' | 'programmes' | 'beneficiaries' | 'volunteers' | 'hopenest';

export const NgoDashboardPage: React.FC = () => {
  const { currentUser, lmsUser, isSuperAdmin, logout, loading: authLoading } = useAuth();
  const { navigate } = useRouter();

  const isAuthorized = Boolean(
    currentUser &&
      (lmsUser?.role === 'ngo_partner' ||
        lmsUser?.roles?.includes('ngo_partner') ||
        lmsUser?.role === 'admin' ||
        isSuperAdmin)
  );

  const [activeNav, setActiveNav] = useState<NgoNavId>('overview');
  const [loading, setLoading] = useState(true);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [programmes, setProgrammes] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Forms
  const [progTitle, setProgTitle] = useState('');
  const [progArea, setProgArea] = useState('Digital Literacy & Youth Skills');
  const [progDistrict, setProgDistrict] = useState('');
  const [progTarget, setProgTarget] = useState('100');

  const [benName, setBenName] = useState('');
  const [benPhone, setBenPhone] = useState('');
  const [benLocation, setBenLocation] = useState('');
  const [benTrack, setBenTrack] = useState('Digital Literacy');

  const [volName, setVolName] = useState('');
  const [volEmail, setVolEmail] = useState('');
  const [volRole, setVolRole] = useState('Field Mentor');

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || !isAuthorized) {
      setLoading(false);
      return;
    }

    let active = true;
    async function loadNgoData() {
      setLoading(true);
      try {
        const uid = currentUser!.uid;
        const [partnerSnap, progSnap, benSnap, volSnap] = await Promise.all([
          getDoc(doc(db, 'ngo_partners', uid)).catch(() => null),
          getDocs(query(collection(db, 'ngo_programmes'), where('partnerUid', '==', uid))).catch(() => null),
          getDocs(query(collection(db, 'ngo_beneficiaries'), where('partnerUid', '==', uid))).catch(() => null),
          getDocs(query(collection(db, 'ngo_volunteers'), where('partnerUid', '==', uid))).catch(() => null),
        ]);
        if (!active) return;
        if (partnerSnap && partnerSnap.exists()) {
          setPartnerProfile(partnerSnap.data());
        }
        setProgrammes(progSnap ? progSnap.docs.map((d) => ({ id: d.id, ...d.data() })) : []);
        setBeneficiaries(benSnap ? benSnap.docs.map((d) => ({ id: d.id, ...d.data() })) : []);
        setVolunteers(volSnap ? volSnap.docs.map((d) => ({ id: d.id, ...d.data() })) : []);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadNgoData();
    return () => {
      active = false;
    };
  }, [currentUser?.uid, authLoading, isAuthorized]);

  const handleCreateProgramme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !progTitle.trim()) return;
    const id = `ngoprog_${currentUser.uid.slice(0, 6)}_${Date.now()}`;
    const payload = stripUndefinedDeep({
      id,
      partnerUid: currentUser.uid,
      title: progTitle.trim(),
      focusArea: progArea,
      district: progDistrict.trim() || 'Karnataka',
      targetCount: Number(progTarget) || 50,
      status: 'Active',
      createdAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'ngo_programmes', id), payload);
    setProgrammes((prev) => [payload, ...prev]);
    setProgTitle('');
    setProgDistrict('');
    setStatusMsg('NGO programme added to Firestore.');
  };

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !benName.trim()) return;
    const id = `ngoben_${currentUser.uid.slice(0, 6)}_${Date.now()}`;
    const payload = stripUndefinedDeep({
      id,
      partnerUid: currentUser.uid,
      fullName: benName.trim(),
      mobileNumber: benPhone.trim() || '—',
      location: benLocation.trim() || 'Rural Outreach Center',
      skillTrack: benTrack,
      status: 'Enrolled',
      enrolledAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'ngo_beneficiaries', id), payload);
    setBeneficiaries((prev) => [payload, ...prev]);
    setBenName('');
    setBenPhone('');
    setBenLocation('');
    setStatusMsg('Beneficiary enrolled cleanly.');
  };

  const handleAddVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !volName.trim()) return;
    const id = `ngovol_${currentUser.uid.slice(0, 6)}_${Date.now()}`;
    const payload = stripUndefinedDeep({
      id,
      partnerUid: currentUser.uid,
      fullName: volName.trim(),
      email: volEmail.trim(),
      role: volRole,
      status: 'Active',
      joinedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'ngo_volunteers', id), payload);
    setVolunteers((prev) => [payload, ...prev]);
    setVolName('');
    setVolEmail('');
    setStatusMsg('Volunteer added to roster.');
  };

  const handleMarkProgrammeComplete = async (id: string) => {
    await updateDoc(doc(db, 'ngo_programmes', id), { status: 'Completed' });
    setProgrammes((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Completed' } : p)));
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
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center mx-auto">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-editorial font-semibold text-[#18221F]">NGO Partner Portal</h1>
          <p className="text-xs text-[#64748B]">
            Sign in with your NGO Partner account to coordinate digital literacy drives, volunteers, and community beneficiaries.
          </p>
          <div className="space-y-2.5 pt-1">
            <GoogleSignInButton
              role="ngo_partner"
              label="Continue with Google (NGO Partner)"
              variant="dark"
            />
            <button
              type="button"
              onClick={() => navigate('/portal/ngo?redirect=/ngo/dashboard')}
              className="w-full py-2.5 rounded-xl bg-[#123D32] hover:bg-[#0e3027] text-white text-xs font-semibold cursor-pointer"
            >
              Email / Portal Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: WorkspaceNavItem[] = [
    { id: 'overview', label: 'Impact Overview', icon: LayoutDashboard },
    { id: 'programmes', label: 'Programmes', icon: BookOpen, badge: programmes.length },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: Users, badge: beneficiaries.length },
    { id: 'volunteers', label: 'Volunteers', icon: UserCheck, badge: volunteers.length },
    { id: 'hopenest', label: 'HopeNest Alliance', icon: HeartHandshake },
  ];

  const totalTarget = programmes.reduce((acc, p) => acc + (Number(p.targetCount) || 0), 0);
  const progressRatio = totalTarget > 0 ? Math.min(100, Math.round((beneficiaries.length / totalTarget) * 100)) : 0;

  return (
    <SocialAppShell
      roleLabel="NGO Partner"
      userName={partnerProfile?.organizationName || lmsUser?.displayName || currentUser.displayName || 'NGO Partner'}
      userEmail={currentUser.email || ''}
      registrationId={lmsUser?.registrationNumber}
      navItems={navItems}
      activeNavId={activeNav}
      onSelectNav={(id) => setActiveNav(id as NgoNavId)}
      onLogout={async () => {
        await logout();
        navigate('/portal');
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#123D32]">
              Community Impact &amp; Outreach
            </div>
            <h1 className="text-2xl font-editorial font-semibold text-[#18221F] mt-0.5">
              {partnerProfile?.organizationName || lmsUser?.displayName || 'NGO Partner Workspace'}
            </h1>
          </div>
          <div className="text-xs font-semibold text-[#123D32] bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-slate-200">
            Status: {partnerProfile?.verificationStatus || 'Active Partner'}
          </div>
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
              <div className="text-xs text-[#64748B] font-medium">Active Programmes</div>
              <div className="text-3xl font-heading font-extrabold text-[#18221F] mt-1 tabular-nums">
                {programmes.length}
              </div>
              <div className="text-[11px] text-[#123D32] mt-1">Recorded in Firestore</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="text-xs text-[#64748B] font-medium">Enrolled Beneficiaries</div>
              <div className="text-3xl font-heading font-extrabold text-[#2563EB] mt-1 tabular-nums">
                {beneficiaries.length}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1 tabular-nums">
                Out of {totalTarget.toLocaleString()} target seats
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="text-xs text-[#64748B] font-medium">Community Volunteers</div>
              <div className="text-3xl font-heading font-extrabold text-[#123D32] mt-1 tabular-nums">
                {volunteers.length}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Active mentors &amp; coordinators</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
              <h2 className="text-sm font-heading font-bold text-[#18221F] mb-4">
                Beneficiary Reach Progress
              </h2>
              <DonutRingChart
                percent={progressRatio}
                color="#123D32"
                label="Enrollment vs Target"
                sublabel={
                  totalTarget > 0
                    ? `${beneficiaries.length} learners onboarded across ${programmes.length} initiatives.`
                    : 'Create your first NGO programme to begin tracking outreach capacity.'
                }
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
              <h2 className="text-sm font-heading font-bold text-[#18221F] mb-4">
                Programme Capacity Breakdown
              </h2>
              <MiniBarChart
                items={programmes.slice(0, 4).map((p) => ({
                  label: p.title,
                  value: Number(p.targetCount) || 0,
                  color: '#2563EB',
                  suffix: ' seats',
                }))}
                emptyMessage="Add a community programme in the Programmes tab to view capacity metrics."
              />
            </div>
          </div>
        </div>
      )}

      {activeNav === 'programmes' && (
        <div className="space-y-6">
          <form onSubmit={handleCreateProgramme} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <h2 className="text-sm font-heading font-bold text-[#18221F] flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#123D32]" />
              <span>Launch New Community Programme</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Programme Name (e.g. Rural Digital Literacy Camp)"
                value={progTitle}
                onChange={(e) => setProgTitle(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="text"
                placeholder="Focus Area"
                value={progArea}
                onChange={(e) => setProgArea(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="text"
                placeholder="District / Region (e.g. Mysuru, Karnataka)"
                value={progDistrict}
                onChange={(e) => setProgDistrict(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="number"
                min={1}
                placeholder="Target Beneficiaries"
                value={progTarget}
                onChange={(e) => setProgTarget(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#123D32] hover:bg-[#0e3027] text-white text-xs font-semibold cursor-pointer"
            >
              Create Programme
            </button>
          </form>

          <div className="grid grid-cols-1 gap-4">
            {programmes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-xs text-[#64748B]">
                No community programmes recorded yet. Use the form above to launch your first initiative.
              </div>
            ) : (
              programmes.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#123D32]">
                      {p.focusArea} · {p.status}
                    </div>
                    <h3 className="font-heading font-bold text-base text-[#18221F]">{p.title}</h3>
                    <div className="text-xs text-[#64748B] flex items-center gap-3 tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {p.district}
                      </span>
                      <span>Target: {p.targetCount} learners</span>
                    </div>
                  </div>
                  {p.status !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => handleMarkProgrammeComplete(p.id)}
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:border-[#123D32] text-xs font-semibold text-[#18221F] cursor-pointer whitespace-nowrap"
                    >
                      Mark Completed
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeNav === 'beneficiaries' && (
        <div className="space-y-6">
          <form onSubmit={handleAddBeneficiary} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <h2 className="text-sm font-heading font-bold text-[#18221F]">Register Community Beneficiary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Learner Full Name *"
                value={benName}
                onChange={(e) => setBenName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={benPhone}
                onChange={(e) => setBenPhone(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="text"
                placeholder="Village / Ward / City"
                value={benLocation}
                onChange={(e) => setBenLocation(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="text"
                placeholder="Training Track (e.g. Basic Computer, Spoken English)"
                value={benTrack}
                onChange={(e) => setBenTrack(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
            >
              Enroll Beneficiary
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
            {beneficiaries.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">No beneficiaries registered yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {beneficiaries.map((b) => (
                  <div key={b.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-[#18221F]">{b.fullName}</div>
                      <div className="text-[#64748B]">{b.skillTrack} · {b.location}</div>
                    </div>
                    <span className="font-semibold text-[#123D32]">{b.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeNav === 'volunteers' && (
        <div className="space-y-6">
          <form onSubmit={handleAddVolunteer} className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
            <h2 className="text-sm font-heading font-bold text-[#18221F]">Onboard Volunteer / Mentor</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                required
                placeholder="Volunteer Name *"
                value={volName}
                onChange={(e) => setVolName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="email"
                placeholder="Email"
                value={volEmail}
                onChange={(e) => setVolEmail(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
              <input
                type="text"
                placeholder="Assigned Role"
                value={volRole}
                onChange={(e) => setVolRole(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-[#FAF7F2]/60"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#123D32] text-white text-xs font-semibold cursor-pointer"
            >
              Add Volunteer
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-slate-200/80 divide-y divide-slate-100">
            {volunteers.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B]">No volunteers added yet.</div>
            ) : (
              volunteers.map((v) => (
                <div key={v.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#18221F]">{v.fullName}</div>
                    <div className="text-[#64748B]">{v.role} {v.email ? `· ${v.email}` : ''}</div>
                  </div>
                  <span className="font-semibold text-[#123D32]">{v.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeNav === 'hopenest' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-[#123D32]" />
            <div>
              <h2 className="font-heading font-bold text-base text-[#18221F]">
                HopeNest Global Foundation Collaboration
              </h2>
              <p className="text-xs text-[#64748B]">
                Legally autonomous Section 8 Non-Profit partnering with OpenFrame Education.
              </p>
            </div>
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Access community literacy kits, ASHA welfare programmes, and joint field outreach documentation directly via the HopeNest portal.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/hopenest"
              className="px-4 py-2.5 rounded-xl bg-[#123D32] text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Visit HopeNest Programmes</span>
            </Link>
            <Link
              to="/partner/ngo"
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#18221F]"
            >
              Submit Formal MoU Request
            </Link>
          </div>
        </div>
      )}
    </SocialAppShell>
  );
};
