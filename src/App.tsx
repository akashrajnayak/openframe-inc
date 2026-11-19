import React from 'react';
import { RouterProvider, useRouter } from './router/RouterContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ItSolutionsPage } from './pages/ItSolutionsPage';
import { EducationPage } from './pages/EducationPage';
import { CourseMarketplacePage } from './pages/CourseMarketplacePage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { HopeNestPage } from './pages/HopeNestPage';
import { BlogPage } from './pages/BlogPage';
import { CareersPage } from './pages/CareersPage';
import { WorkWithUsPage } from './pages/WorkWithUsPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { StudentRegistrationPage } from './pages/StudentRegistrationPage';
import { TeacherRegistrationPage } from './pages/TeacherRegistrationPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { BlogPostDetailPage } from './pages/BlogPostDetailPage';
import { HopeNestProgrammesPage } from './pages/HopeNestProgrammesPage';
import { HopeNestAshaPage } from './pages/HopeNestAshaPage';
import { HopeNestUpdatesPage } from './pages/HopeNestUpdatesPage';
import { HopeNestVolunteerPage } from './pages/HopeNestVolunteerPage';
import { HopeNestDonatePage } from './pages/HopeNestDonatePage';
import { HopeNestParticipatePage } from './pages/HopeNestParticipatePage';
import { JobOpeningsPage } from './pages/JobOpeningsPage';
import { JobApplyPage } from './pages/JobApplyPage';
import { InternshipRegisterPage } from './pages/InternshipRegisterPage';
import { ProfessionalRegisterPage } from './pages/ProfessionalRegisterPage';
import { SchoolPartnerPage } from './pages/SchoolPartnerPage';
import { NgoPartnerPage } from './pages/NgoPartnerPage';
import { GeneralInquiryPage } from './pages/GeneralInquiryPage';
import { SoftwareInquiryPage } from './pages/SoftwareInquiryPage';
import { BusinessInquiryPage } from './pages/BusinessInquiryPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { DisclaimerPage } from './pages/DisclaimerPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { CompanyDocumentsPage } from './pages/CompanyDocumentsPage';
import { VerificationChecklistPage } from './pages/VerificationChecklistPage';
import { CourseLearningPage } from './pages/CourseLearningPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { ParentDashboardPage } from './pages/ParentDashboardPage';
import { PortalLoginPage } from './pages/PortalLoginPage';
import { CertificateVerificationPage } from './pages/CertificateVerificationPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { QaLearningPage } from './pages/QaLearningPage';
import { SchoolEducationHubPage } from './pages/SchoolEducationHubPage';
import { NgoDashboardPage } from './pages/NgoDashboardPage';
import { FieldExecutiveDashboardPage } from './pages/FieldExecutiveDashboardPage';
import { ProfessionalDashboardPage } from './pages/ProfessionalDashboardPage';
import { GlobalChatbotWidget } from './components/common/GlobalChatbotWidget';
import { testFirestoreConnection } from './services/firebase';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { currentPath, navigate } = useRouter();
  const { currentUser, lmsUser, schoolEnrollment, authorizedDashboardPath, loading } = useAuth();
  const [isStandalonePwa, setIsStandalonePwa] = React.useState(false);
  const autoRestoredTabRef = React.useRef(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(display-mode: standalone)');
    const update = () => {
      setIsStandalonePwa(Boolean(mq.matches || (window.navigator as any)?.standalone));
    };
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);

  React.useEffect(() => {
    testFirestoreConnection().catch(() => {});
  }, []);

  // Keep logged-in student account open automatically in the same browser tab
  React.useEffect(() => {
    if (loading || !currentUser || !lmsUser) return;
    const activeRole = lmsUser.role;
    if (activeRole !== 'student' && activeRole !== 'professional') return;

    const clean = currentPath.split('?')[0] || '/';
    const qp = new URLSearchParams(currentPath.split('?')[1] || '');
    const stayOnPublic = qp.get('stay') === '1' || qp.get('switch') === '1';

    // Persist last active student workspace route so refresh / tab reopen restores exact spot
    if (
      clean === '/school' ||
      clean.startsWith('/school/') ||
      clean === '/student/dashboard' ||
      clean === '/student-portal' ||
      clean.startsWith('/learn/')
    ) {
      try {
        localStorage.setItem('openframe_student_active_uid', currentUser.uid);
        localStorage.setItem('openframe_student_active_route', currentPath);
      } catch {
        // ignore storage errors
      }
      autoRestoredTabRef.current = true;
      return;
    }

    // When a logged-in student reopens the browser tab at `/` (initial load), open their account automatically
    if (!autoRestoredTabRef.current && clean === '/' && !stayOnPublic) {
      autoRestoredTabRef.current = true;
      let targetRoute = authorizedDashboardPath || '/school?tab=self_study';
      try {
        const savedUid = localStorage.getItem('openframe_student_active_uid');
        const savedRoute = localStorage.getItem('openframe_student_active_route');
        if (savedUid === currentUser.uid && savedRoute && savedRoute.startsWith('/')) {
          targetRoute = savedRoute;
        }
      } catch {
        // ignore storage errors
      }
      navigate(targetRoute, { replace: true });
    }
  }, [loading, currentUser, lmsUser, currentPath, authorizedDashboardPath, navigate]);

  // Dynamic SEO page titles & meta tags
  React.useEffect(() => {
    const clean = currentPath.split('?')[0] || '/';
    let pageTitle = 'OpenFrame IT Solutions Private Limited | Technology, Education & Innovation';
    let isNoIndex = false;

    if (clean === '/about-us' || clean === '/about') {
      pageTitle = 'About Us | OpenFrame IT Solutions Private Limited';
    } else if (clean === '/it-solutions' || clean === '/solutions') {
      pageTitle = 'Enterprise IT & Software Solutions | OpenFrame IT Solutions';
    } else if (clean === '/marketplace' || clean === '/courses' || clean === '/education/marketplace') {
      pageTitle = '15,500+ Online Course Marketplace | OpenFrame Education';
    } else if (clean === '/chatbot' || clean === '/qwen-ai' || clean === '/quinn-ai' || clean === '/ai-assistant') {
      pageTitle = 'Quinn AI • Dedicated Learning & Corporate Assistant | OpenFrame';
    } else if (clean === '/qa' || clean === '/ask') {
      pageTitle = 'Ask Quinn Q&A • Academic & Skill Intelligence | OpenFrame Education';
    } else if (clean.startsWith('/marketplace/') || clean.startsWith('/course/')) {
      pageTitle = 'Course Curriculum & Enrolment | OpenFrame Education';
    } else if (clean === '/education') {
      pageTitle = 'OpenFrame Education | Learn. Develop. Achieve. | 15,500+ Courses & 110+ Categories';
    } else if (clean === '/school' || clean.startsWith('/school/')) {
      pageTitle = 'School Education (LKG – Class 12) | Karnataka State, CBSE, ICSE | OpenFrame Education';
    } else if (clean === '/products') {
      pageTitle = 'Proprietary Software Products | OpenFrame IT Solutions';
    } else if (clean.startsWith('/products/')) {
      pageTitle = 'Product Details | OpenFrame IT Solutions';
    } else if (clean.startsWith('/hopenest')) {
      pageTitle = 'HopeNest Global Foundation | Section 8 Non-Profit Organisation';
    } else if (clean === '/blog') {
      pageTitle = 'Blog, News & Knowledge Centre | OpenFrame IT Solutions';
    } else if (clean.startsWith('/blog/')) {
      pageTitle = 'Knowledge Article | OpenFrame IT Solutions';
    } else if (clean === '/careers') {
      pageTitle = 'Careers & Corporate Culture | OpenFrame IT Solutions';
    } else if (clean === '/careers/jobs') {
      pageTitle = 'Verified Job Openings | OpenFrame IT Solutions';
    } else if (clean === '/careers/apply') {
      pageTitle = 'Apply for Position | OpenFrame IT Solutions';
    } else if (clean === '/work-with-us') {
      pageTitle = 'Work With Us | OpenFrame IT Solutions';
    } else if (clean.startsWith('/join/')) {
      pageTitle = 'Join Our Network | OpenFrame IT Solutions';
    } else if (clean.startsWith('/partner/')) {
      pageTitle = 'Institutional Partnerships | OpenFrame IT Solutions';
    } else if (clean === '/contact' || clean === '/contact-us') {
      pageTitle = 'Contact Corporate Office | OpenFrame IT Solutions Private Limited';
    } else if (clean === '/privacy-policy') {
      pageTitle = 'Privacy Policy & Data Protection | OpenFrame IT Solutions';
    } else if (clean === '/terms' || clean === '/terms-and-conditions') {
      pageTitle = 'Terms & Conditions of Use | OpenFrame IT Solutions';
    } else if (clean === '/disclaimer') {
      pageTitle = 'Official Legal Disclaimer | OpenFrame IT Solutions';
    } else if (clean === '/cookie-policy' || clean === '/cookies') {
      pageTitle = 'Cookie & Local Storage Policy | OpenFrame IT Solutions';
    } else if (clean.startsWith('/documents') || clean.startsWith('/official-documents')) {
      pageTitle = 'Official Corporate Documents Repository | OpenFrame IT Solutions';
    } else if (clean.startsWith('/learn/')) {
      pageTitle = 'Quinn AI Interactive Learning Workspace | OpenFrame Education';
    } else if (
      clean === '/portal' ||
      clean === '/login' ||
      clean === '/student/login' ||
      clean === '/login/student' ||
      clean === '/student-login' ||
      clean.startsWith('/portal/')
    ) {
      pageTitle = 'Portal Sign In Hub | OPENFRAME';
    } else if (clean === '/student/dashboard' || clean === '/student-portal') {
      pageTitle = 'Student Learning & Certification Dashboard | OPENFRAME';
    } else if (clean === '/teacher/dashboard' || clean === '/teacher-portal') {
      pageTitle = 'Faculty Evaluation & Academic Dashboard | OPENFRAME';
    } else if (clean === '/parent/dashboard' || clean === '/parent-portal') {
      pageTitle = 'Parent Progress & Engagement Portal | OPENFRAME';
    } else if (clean === '/ngo/dashboard' || clean === '/ngo-portal') {
      pageTitle = 'NGO Partner Hub & Impact Portal | OPENFRAME';
    } else if (clean === '/field/dashboard' || clean === '/field-portal') {
      pageTitle = 'Field Executive Outreach Workspace | OPENFRAME';
    } else if (clean === '/professional/dashboard' || clean === '/professional-portal') {
      pageTitle = 'Working Professional Upskilling Portal | OPENFRAME';
    } else if (clean.startsWith('/verify-certificate') || clean.startsWith('/certificate/')) {
      pageTitle = 'Official Certificate Public Verification | OpenFrame IT Solutions';
    } else if (clean === '/verification-checklist' || clean === '/checklist') {
      pageTitle = 'Corporate Verification & Compliance Checklist | OpenFrame IT Solutions';
    } else if (clean.startsWith('/admin') || clean === '/super-admin/dashboard') {
      pageTitle = 'Corporate Admin Console | OpenFrame IT Solutions';
      isNoIndex = true;
    }

    document.title = pageTitle;

    // Check or create robots meta tag
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', isNoIndex ? 'noindex, nofollow' : 'index, follow');
  }, [currentPath]);

  // Route matching
  const renderRoute = () => {
    // Strip query strings and trailing slashes for routing
    const cleanPath = currentPath.split('?')[0] || '/';
    const path = cleanPath.length > 1 && cleanPath.endsWith('/')
      ? cleanPath.slice(0, -1)
      : cleanPath;

    // LMS & Interactive Learning Routes
    if (path.startsWith('/learn/')) {
      return <CourseLearningPage />;
    }

    if (path === '/portal/admin') {
      return <AdminLoginPage />;
    }

    if (
      path === '/portal' ||
      path === '/login' ||
      path === '/student/login' ||
      path === '/login/student' ||
      path === '/student-login' ||
      path.startsWith('/portal/')
    ) {
      return <PortalLoginPage />;
    }

    if (path === '/student/dashboard' || path === '/student-portal') {
      return <StudentDashboardPage />;
    }

    if (path === '/teacher/dashboard' || path === '/teacher-portal') {
      return <TeacherDashboardPage />;
    }

    if (path === '/parent/dashboard' || path === '/parent-portal') {
      return <ParentDashboardPage />;
    }

    if (path === '/ngo/dashboard' || path === '/ngo-portal') {
      return <NgoDashboardPage />;
    }

    if (path === '/field/dashboard' || path === '/field-portal') {
      return <FieldExecutiveDashboardPage />;
    }

    if (path === '/professional/dashboard' || path === '/professional-portal') {
      return <ProfessionalDashboardPage />;
    }

    if (path.startsWith('/verify-certificate') || path.startsWith('/certificate/')) {
      return <CertificateVerificationPage />;
    }

    if (path === '/marketplace' || path === '/courses' || path === '/education/marketplace') {
      return <CourseMarketplacePage />;
    }

    if (path.startsWith('/marketplace/') || path.startsWith('/course/')) {
      return <CourseDetailPage />;
    }

    if (path === '/school' || path.startsWith('/school/class/') || path.startsWith('/school/subject/')) {
      return <SchoolEducationHubPage />;
    }

    if (path.startsWith('/education')) {
      return <EducationPage />;
    }

    if (path.startsWith('/products/')) {
      return <ProductDetailPage />;
    }

    if (path.startsWith('/blog/')) {
      return <BlogPostDetailPage />;
    }

    // HopeNest Section Routes
    if (path === '/hopenest/programmes') {
      return <HopeNestProgrammesPage />;
    }
    if (path === '/hopenest/asha-welfare-programme' || path === '/hopenest/asha') {
      return <HopeNestAshaPage />;
    }
    if (path === '/hopenest/updates') {
      return <HopeNestUpdatesPage />;
    }
    if (path === '/hopenest/volunteer') {
      return <HopeNestVolunteerPage />;
    }
    if (path === '/hopenest/donate' || path === '/hopenest/support') {
      return <HopeNestDonatePage />;
    }
    if (path === '/hopenest/participate' || path === '/hopenest/beneficiary') {
      return <HopeNestParticipatePage />;
    }

    switch (path) {
      case '/':
        return <HomePage />;
      case '/qa':
      case '/ask':
        return <QaLearningPage />;
      case '/chatbot':
      case '/qwen-ai':
      case '/quinn-ai':
      case '/ai-assistant':
        return <ChatbotPage />;
      case '/about-us':
      case '/about':
        return <AboutPage />;
      case '/it-solutions':
      case '/solutions':
        return <ItSolutionsPage />;
      case '/inquiry/software':
      case '/it-solutions/quotation':
        return <SoftwareInquiryPage />;
      case '/inquiry/general':
      case '/general-enquiry':
        return <GeneralInquiryPage />;
      case '/inquiry/business':
      case '/business-enquiry':
        return <BusinessInquiryPage />;
      case '/products':
      case '/our-products':
        return <ProductsPage />;
      case '/hopenest':
      case '/hopenest-foundation':
        return <HopeNestPage />;
      case '/blog':
        return <BlogPage />;
      case '/careers':
        return <CareersPage />;
      case '/careers/jobs':
      case '/careers/openings':
        return <JobOpeningsPage />;
      case '/careers/apply':
        return <JobApplyPage />;
      case '/join/intern':
      case '/internship':
      case '/join/internship':
        return <InternshipRegisterPage />;
      case '/join/professional':
      case '/join/expert':
      case '/join/advisor':
        return <ProfessionalRegisterPage />;
      case '/partner/school':
      case '/partner/school/dashboard':
      case '/partner/school/register':
      case '/partner/institution':
      case '/partner/college':
        return <SchoolPartnerPage />;
      case '/partner/ngo':
      case '/partner/non-profit':
      case '/partner/trust':
        return <NgoPartnerPage />;
      case '/work-with-us':
        return <WorkWithUsPage />;
      case '/contact':
      case '/contact-us':
        return <ContactPage />;
      case '/join/student':
      case '/student-registration':
        return <StudentRegistrationPage />;
      case '/join/teacher':
      case '/join/faculty':
      case '/teacher-registration':
        return <TeacherRegistrationPage />;
      case '/privacy-policy':
      case '/privacy':
        return <PrivacyPolicyPage />;
      case '/terms':
      case '/terms-and-conditions':
        return <TermsPage />;
      case '/disclaimer':
        return <DisclaimerPage />;
      case '/cookie-policy':
      case '/cookies':
        return <CookiePolicyPage />;
      case '/documents':
      case '/official-documents':
      case '/corporate-documents':
        return <CompanyDocumentsPage />;
      case '/verification-checklist':
      case '/checklist':
      case '/compliance-checklist':
        return <VerificationChecklistPage />;
      case '/admin/login':
        return <AdminLoginPage />;
      case '/admin':
      case '/admin/dashboard':
      case '/super-admin/dashboard':
        return <AdminPage />;
      default:
        return (
          <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center font-heading font-black text-3xl mb-5 border border-blue-200 shadow-sm">
              404
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 tracking-tight">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              The requested corporate route (<code className="text-blue-600 font-mono bg-blue-50 px-1.5 py-0.5 rounded">{currentPath}</code>) does not exist, has been archived, or was moved.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20"
              >
                Return to Homepage
              </button>
              <button
                type="button"
                onClick={() => navigate('/it-solutions')}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Explore Solutions
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="px-5 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Contact Us
              </button>
            </div>
          </div>
        );
    }
  };

  const rawCleanPath = currentPath.split('?')[0] || '/';
  const cleanCurrentPath =
    rawCleanPath.length > 1 && rawCleanPath.endsWith('/')
      ? rawCleanPath.slice(0, -1)
      : rawCleanPath;
  const isAdminRoute = cleanCurrentPath.startsWith('/admin') || cleanCurrentPath === '/super-admin/dashboard';
  const isSchoolPartnerShell =
    Boolean(currentUser) &&
    (cleanCurrentPath === '/partner/school/dashboard' ||
      cleanCurrentPath === '/partner/school/register');
  const isSchoolStandaloneShell =
    isStandalonePwa &&
    Boolean(currentUser && schoolEnrollment) &&
    (cleanCurrentPath === '/school' || cleanCurrentPath.startsWith('/school/class/'));
  const isWorkspaceShellRoute =
    isAdminRoute ||
    isSchoolPartnerShell ||
    isSchoolStandaloneShell ||
    [
      '/student/dashboard',
      '/student-portal',
      '/teacher/dashboard',
      '/teacher-portal',
      '/parent/dashboard',
      '/parent-portal',
      '/ngo/dashboard',
      '/ngo-portal',
      '/field/dashboard',
      '/field-portal',
      '/professional/dashboard',
      '/professional-portal',
    ].includes(cleanCurrentPath);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased">
      {!isWorkspaceShellRoute && <Header />}
      <main className="flex-1">
        {renderRoute()}
      </main>
      {!isWorkspaceShellRoute && <Footer />}
      {!isAdminRoute && <GlobalChatbotWidget />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppContent />
      </RouterProvider>
    </AuthProvider>
  );
}
