import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  LayoutDashboard,
  BookOpen,
  Award,
  Bot,
  ArrowRight,
  Send,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../router/RouterContext';
import { lmsService } from '../services/lmsService';
import { marketplaceService } from '../services/marketplaceService';
import { quinnAiService } from '../services/quinnAiService';
import { SocialAppShell, WorkspaceNavItem } from '../components/workspace/SocialAppShell';
import { DonutRingChart, MiniBarChart } from '../components/workspace/DashboardCharts';
import { CourseThumbnail } from '../components/common/CourseThumbnail';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import {
  CourseEnrollment,
  IssuedCertificate,
  MarketplaceCourse,
  StudentProgressRecord,
} from '../types';

type ProfNavId = 'overview' | 'tracks' | 'certificates' | 'quinn';

export const ProfessionalDashboardPage: React.FC = () => {
  const { currentUser, lmsUser, isSuperAdmin, logout, loading: authLoading } = useAuth();
  const { navigate } = useRouter();

  const isAuthorized = Boolean(
    currentUser &&
      (lmsUser?.role === 'professional' ||
        lmsUser?.roles?.includes('professional') ||
        lmsUser?.role === 'student' ||
        lmsUser?.role === 'admin' ||
        isSuperAdmin)
  );

  const [activeNav, setActiveNav] = useState<ProfNavId>('overview');
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [progressList, setProgressList] = useState<StudentProgressRecord[]>([]);
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [careerCourses, setCareerCourses] = useState<MarketplaceCourse[]>([]);

  // Inline Quinn AI Career Assistant
  const [aiInput, setAiInput] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'model'; text: string }>>([
    {
      role: 'model',
      text: 'Welcome! I am Quinn AI, your career & executive skill mentor. Ask me for technical interview prep, Advanced Excel formulas, system design reviews, or custom upskilling plans.',
    },
  ]);

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser || !isAuthorized) {
      setLoading(false);
      return;
    }

    let active = true;
    async function loadProfData() {
      setLoading(true);
      try {
        const uid = currentUser!.uid;
        const [enr, prog, certs, corpCatalog] = await Promise.all([
          lmsService.getStudentEnrollments(uid).catch(() => []),
          lmsService.getAllStudentProgress(uid).catch(() => []),
          lmsService.getCertificatesForStudent(uid).catch(() => []),
          marketplaceService.filterCourses({ page: 1, pageSize: 8, sortBy: 'popular' }).then((r) => r.courses).catch(() => []),
        ]);
        if (!active) return;
        setEnrollments(enr);
        setProgressList(prog);
        setCertificates(certs);
        setCareerCourses(corpCatalog);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfData();
    return () => {
      active = false;
    };
  }, [currentUser?.uid, authLoading, isAuthorized]);

  const handleAskQuinn = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = aiInput.trim();
    if (!prompt || aiBusy) return;
    const nextHist = [...aiMessages, { role: 'user' as const, text: prompt }];
    setAiMessages(nextHist);
    setAiInput('');
    setAiBusy(true);
    try {
      const reply = await quinnAiService.chatWithAssistant({
        message: prompt,
        courseTitle: 'Working Professional Career & Upskilling Track',
        lessonTopic: 'Executive Career & Technical Coaching',
        language: 'English',
        history: nextHist.slice(-6),
      });
      setAiMessages([...nextHist, { role: 'model', text: reply }]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: 'model', text: 'Unable to reach Quinn AI right now. Please try again shortly.' },
      ]);
    } finally {
      setAiBusy(false);
    }
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
          <div className="w-12 h-12 rounded-2xl bg-indigo-700 text-white flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-editorial font-semibold text-[#18221F]">Professional Portal</h1>
          <p className="text-xs text-[#64748B]">
            Sign in to access AI upskilling pathways, corporate training libraries, certificates, and Quinn AI interview mentoring.
          </p>
          <div className="space-y-2.5 pt-1">
            <GoogleSignInButton
              role="professional"
              label="Continue with Google (Professional)"
              variant="dark"
            />
            <button
              type="button"
              onClick={() => navigate('/portal/professional?redirect=/professional/dashboard')}
              className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
            >
              Email / Portal Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const navItems: WorkspaceNavItem[] = [
    { id: 'overview', label: 'Career Overview', icon: LayoutDashboard },
    { id: 'tracks', label: 'Upskilling Tracks', icon: BookOpen, badge: careerCourses.length },
    { id: 'certificates', label: 'Verified Credentials', icon: Award, badge: certificates.length },
    { id: 'quinn', label: 'Quinn AI Career Coach', icon: Bot },
  ];

  const avgProgress =
    progressList.length > 0
      ? Math.round(
          progressList.reduce((acc, p) => acc + (p.overallProgressPercent || 0), 0) / progressList.length
        )
      : 0;

  return (
    <SocialAppShell
      roleLabel="Professional"
      userName={lmsUser?.displayName || currentUser.displayName || 'Professional Learner'}
      userEmail={currentUser.email || ''}
      registrationId={lmsUser?.registrationNumber}
      navItems={navItems}
      activeNavId={activeNav}
      onSelectNav={(id) => setActiveNav(id as ProfNavId)}
      onLogout={async () => {
        await logout();
        navigate('/portal');
      }}
    >
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700">
            Executive Upskilling &amp; Certifications
          </div>
          <h1 className="text-2xl font-editorial font-semibold text-[#18221F] mt-0.5">
            Welcome, {lmsUser?.displayName || currentUser.displayName || 'Professional'}
          </h1>
        </div>
        <Link
          to="/marketplace"
          className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
        >
          <span>Explore All Career Courses</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activeNav === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="text-xs text-[#64748B]">Enrolled Programmes</div>
              <div className="text-3xl font-heading font-extrabold text-[#18221F] mt-1 tabular-nums">
                {enrollments.length}
              </div>
              <div className="text-[11px] text-[#123D32] mt-1">Active LMS records</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="text-xs text-[#64748B]">Mean Track Completion</div>
              <div className="text-3xl font-heading font-extrabold text-[#2563EB] mt-1 tabular-nums">
                {avgProgress}%
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">Across active learning tracks</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
              <div className="text-xs text-[#64748B]">Verified Credentials</div>
              <div className="text-3xl font-heading font-extrabold text-[#123D32] mt-1 tabular-nums">
                {certificates.length}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">QR-verifiable certificates</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
              <h2 className="text-sm font-heading font-bold text-[#18221F] mb-4">Skill Track Momentum</h2>
              <DonutRingChart
                percent={avgProgress}
                color="#2563EB"
                label="Overall Track Completion"
                sublabel={
                  enrollments.length > 0
                    ? `Active across ${enrollments.length} enrolled programmes.`
                    : 'Enroll in a course from Upskilling Tracks to begin tracking completion.'
                }
              />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
              <h2 className="text-sm font-heading font-bold text-[#18221F] mb-4">Course Progress Breakdown</h2>
              <MiniBarChart
                items={progressList.slice(0, 4).map((p) => ({
                  label: p.courseTitle || p.courseId,
                  value: p.overallProgressPercent || 0,
                  maxValue: 100,
                  color: '#123D32',
                  suffix: '%',
                }))}
                emptyMessage="Start a course to view per-course completion percentages."
              />
            </div>
          </div>
        </div>
      )}

      {activeNav === 'tracks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {careerCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video bg-slate-100 overflow-hidden">
                  <CourseThumbnail
                    src={course.thumbnailUrl || course.imageUrl}
                    alt={course.title}
                    category={course.category}
                    categoryGroup={course.categoryGroup}
                    youtubeVideoId={course.youtubeVideoId}
                  />
                </div>
                <div className="p-5 space-y-1.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#123D32]">
                    {course.category} · {course.level}
                  </div>
                  <h3 className="font-heading font-bold text-sm text-[#18221F] line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-[#64748B] line-clamp-2">{course.shortDesc}</p>
                </div>
              </div>
              <div className="px-5 py-3.5 bg-[#FAF7F2] border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-[#18221F]">{course.duration}</span>
                <Link
                  to={`/marketplace/${course.id}`}
                  className="font-semibold text-[#2563EB] flex items-center gap-1"
                >
                  <span>Open Course</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeNav === 'certificates' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <h2 className="font-heading font-bold text-base text-[#18221F]">
            Earned &amp; Verified Credentials
          </h2>
          {certificates.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#64748B] space-y-2">
              <p>Complete course lessons, quizzes, and rubric evaluations to unlock your first verified credential.</p>
              <Link to="/student/dashboard" className="text-[#2563EB] font-semibold inline-block">
                Open 8-Stage Learning Workspace →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {certificates.map((c) => (
                <div key={c.certificateId} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-[#18221F]">{c.courseName || c.courseTitle}</div>
                    <div className="text-[#64748B] tabular-nums">ID: {c.certificateId} · Grade: {c.grade}</div>
                  </div>
                  <Link
                    to={`/verify-certificate/${c.certificateId}`}
                    className="font-semibold text-[#123D32] underline"
                  >
                    Verify QR
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeNav === 'quinn' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#123D32]" />
            <h2 className="font-heading font-bold text-base text-[#18221F]">Quinn AI Career Mentor</h2>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto p-3 rounded-2xl bg-[#FAF7F2]">
            {aiMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#2563EB] text-white ml-8'
                    : 'bg-white border border-slate-200 text-[#18221F] mr-8'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <form onSubmit={handleAskQuinn} className="flex items-center gap-2">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ask Quinn about Excel formulas, interview prep, AI architecture..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <button
              type="submit"
              disabled={aiBusy}
              className="px-4 py-2.5 rounded-xl bg-[#123D32] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{aiBusy ? 'Thinking...' : 'Ask'}</span>
            </button>
          </form>
        </div>
      )}
    </SocialAppShell>
  );
};
