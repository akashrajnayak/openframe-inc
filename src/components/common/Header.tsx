import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import {
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  LogOut,
  Sparkles,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleSignInButton } from './GoogleSignInButton';

export const Header: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const { currentUser, lmsUser, authorizedDashboardPath, logout } = useAuth();
  const cleanPath = currentPath.split('?')[0] || '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [programsOpen, setProgramsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setProgramsOpen(false);
  }, [currentPath]);

  const primaryLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore Courses', path: '/marketplace' },
    { label: 'Ask Q&A', path: '/qa' },
    { label: 'Learning Programs', path: '/education', hasDropdown: true },
    { label: 'For Schools', path: '/partner/school' },
    { label: 'For Teachers', path: '/teacher/dashboard' },
    { label: 'About Us', path: '/about-us' },
    { label: 'HopeNest Foundation', path: '/hopenest' },
    { label: 'Contact', path: '/contact' },
  ];

  const userInitial = (lmsUser?.displayName || currentUser?.displayName || currentUser?.email || 'O')
    .charAt(0)
    .toUpperCase();

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
        isScrolled
          ? 'bg-[#FAF7F2]/95 backdrop-blur-md border-slate-200/90 shadow-sm py-3'
          : 'bg-[#FAF7F2] border-slate-200/70 py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Left: OpenFrame Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="OpenFrame Education">
            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200/90 p-0.5 shadow-xs flex items-center justify-center overflow-hidden">
              <img
                src="/openframe_official_logo.jpg"
                alt="OpenFrame Education"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-editorial font-semibold text-[#18221F] text-lg leading-none tracking-tight group-hover:text-[#123D32] transition-colors">
                OpenFrame
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-[0.14em] text-[#123D32] mt-1">
                Education &amp; IT
              </span>
            </div>
          </Link>

          {/* Center: Clean Editorial Links */}
          <nav className="hidden lg:flex items-center gap-0.5 text-[13px] font-medium text-[#18221F]/80">
            {primaryLinks.map((item) => {
              const isActive =
                cleanPath === item.path ||
                (item.path !== '/' && cleanPath.startsWith(item.path));

              if (item.hasDropdown) {
                return (
                  <div
                    key={item.path}
                    className="relative"
                    onMouseEnter={() => setProgramsOpen(true)}
                    onMouseLeave={() => setProgramsOpen(false)}
                  >
                    <Link
                      to={item.path}
                      className={`px-2.5 py-2 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
                        isActive
                          ? 'text-[#123D32] font-semibold bg-[#123D32]/8'
                          : 'hover:text-[#18221F] hover:bg-black/4'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                    </Link>

                    {programsOpen && (
                      <div className="absolute top-full left-0 w-72 pt-2 z-50">
                        <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-2 space-y-0.5">
                          <Link
                            to="/education"
                            className="block p-3 rounded-xl hover:bg-[#FAF7F2] transition-colors"
                          >
                            <div className="text-sm font-semibold text-[#18221F]">OpenFrame Education</div>
                            <div className="text-xs text-[#64748B] mt-0.5">
                              Structured fellowships &amp; certification tracks
                            </div>
                          </Link>
                          <Link
                            to="/school"
                            className="block p-3 rounded-xl hover:bg-[#FAF7F2] transition-colors"
                          >
                            <div className="text-sm font-semibold text-[#18221F]">School Education (LKG–12)</div>
                            <div className="text-xs text-[#64748B] mt-0.5">
                              CBSE, ICSE &amp; State Board interactive learning
                            </div>
                          </Link>
                          <Link
                            to="/chatbot"
                            className="block p-3 rounded-xl hover:bg-[#FAF7F2] transition-colors"
                          >
                            <div className="text-sm font-semibold text-[#123D32] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                              <span>Quinn AI Personal Tutor</span>
                            </div>
                            <div className="text-xs text-[#64748B] mt-0.5">
                              Multilingual 24/7 mentor, notes &amp; study guides
                            </div>
                          </Link>
                          <div className="my-1 border-t border-slate-100" />
                          <Link
                            to="/it-solutions"
                            className="block p-3 rounded-xl hover:bg-[#FAF7F2] transition-colors"
                          >
                            <div className="text-sm font-semibold text-[#18221F]">Enterprise IT Solutions</div>
                            <div className="text-xs text-[#64748B] mt-0.5">
                              Custom software engineering &amp; cloud platforms
                            </div>
                          </Link>
                          <Link
                            to="/products"
                            className="block p-3 rounded-xl hover:bg-[#FAF7F2] transition-colors"
                          >
                            <div className="text-sm font-semibold text-[#18221F]">Digital Products Suite</div>
                            <div className="text-xs text-[#64748B] mt-0.5">
                              CoreERP, EduLMS &amp; enterprise tools
                            </div>
                          </Link>
                          <Link
                            to="/verify-certificate"
                            className="block p-3 rounded-xl hover:bg-[#FAF7F2] transition-colors"
                          >
                            <div className="text-sm font-semibold text-[#18221F] flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#123D32]" />
                              <span>Verify Certificate</span>
                            </div>
                            <div className="text-xs text-[#64748B] mt-0.5">
                              Public QR &amp; credential ID lookup
                            </div>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-2.5 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-[#123D32] font-semibold bg-[#123D32]/8'
                      : 'hover:text-[#18221F] hover:bg-black/4'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Auth Actions & Mobile Trigger */}
          <div className="flex items-center gap-2.5 shrink-0">
            {currentUser && lmsUser ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate(authorizedDashboardPath)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#123D32] hover:bg-[#0e3027] text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                >
                  <span className="w-5 h-5 rounded-full bg-white/20 text-[11px] font-bold flex items-center justify-center">
                    {userInitial}
                  </span>
                  <span>My Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  title="Sign Out"
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <GoogleSignInButton
                  role="student"
                  label="Google Login"
                  variant="compact"
                  showInlineError={false}
                  onError={() => navigate('/portal/student')}
                />
                <Link
                  to="/portal"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#18221F] hover:bg-black/5 border border-slate-300/80 bg-white/80 transition-colors whitespace-nowrap"
                >
                  Portals
                </Link>
                <Link
                  to="/portal?mode=register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 shadow-sm transition-colors whitespace-nowrap"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[#18221F] hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F2] border-t border-slate-200 shadow-xl px-4 py-5 space-y-2 max-h-[82vh] overflow-y-auto">
          <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-3 pb-1">
            Explore OpenFrame
          </div>
          {primaryLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2.5 rounded-xl text-sm font-medium ${
                cleanPath === item.path
                  ? 'bg-[#123D32]/10 text-[#123D32] font-semibold'
                  : 'text-[#18221F] hover:bg-black/5'
              }`}
            >
              {item.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
            <Link to="/school" className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-medium text-[#18221F] whitespace-nowrap">
              School (LKG–12)
            </Link>
            <Link to="/qa" className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-medium text-[#2563EB] whitespace-nowrap">
              Ask Quinn Q&amp;A
            </Link>
            <Link to="/chatbot" className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-medium text-[#123D32] whitespace-nowrap">
              Quinn AI Tutor
            </Link>
            <Link to="/verify-certificate" className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-medium text-[#18221F] whitespace-nowrap">
              Verify Certificate
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
            {currentUser && lmsUser ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(authorizedDashboardPath)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#123D32] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Open My Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full py-2 px-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-medium text-xs cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2.5">
                <GoogleSignInButton
                  role="student"
                  label="Continue with Google"
                  variant="dark"
                  onSuccess={() => setMobileMenuOpen(false)}
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    to="/portal"
                    className="py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-[#18221F] font-semibold text-sm text-center"
                  >
                    All 8 Portals
                  </Link>
                  <Link
                    to="/portal?mode=register"
                    className="py-2.5 px-4 rounded-xl bg-[#2563EB] text-white font-semibold text-sm text-center"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
