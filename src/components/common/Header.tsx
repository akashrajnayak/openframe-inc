import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../../router/RouterContext';
import {
  Menu,
  X,
  ChevronDown,
  Globe,
  Lock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  PhoneCall,
  Brain
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export const Header: React.FC = () => {
  const { currentPath } = useRouter();
  const cleanPath = currentPath.split('?')[0] || '/';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [siteSettings, setSiteSettings] = useState(storageService.getSiteSettings());

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSolutionsDropdownOpen(false);
  }, [currentPath]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/about-us' },
    { label: 'IT Solutions', path: '/it-solutions', hasDropdown: true },
    { label: 'Education', path: '/education' },
    { label: 'School (LKG–12)', path: '/school' },
    { label: 'Courses (15.5k+)', path: '/marketplace' },
    { label: 'Qwen AI', path: '/chatbot' },
    { label: 'Products', path: '/products' },
    { label: 'HopeNest', path: '/hopenest' },
    { label: 'Blog', path: '/blog' },
    { label: 'Careers', path: '/careers' },
    { label: 'Work With Us', path: '/work-with-us' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Top Corporate Strip / Announcement */}
      {siteSettings.showAnnouncement && (
        <div className="bg-[#071326] text-slate-300 text-xs border-b border-blue-950/60 py-1.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-blue-400 font-semibold tracking-wide uppercase text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Official Corporate Portal
              </span>
              <span className="hidden sm:inline text-slate-400">|</span>
              <span className="hidden sm:inline text-slate-300 truncate max-w-xl">
                {siteSettings.announcementText}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-[11px]">
              <Link to="/chatbot" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-cyan-400" />
                <span>Qwen AI</span>
              </Link>
              <span className="text-slate-600">·</span>
              <Link to="/student/dashboard" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Student LMS</span>
              </Link>
              <span className="text-slate-600">·</span>
              <Link to="/animation-course" className="text-cyan-300 hover:text-white font-semibold transition-colors">
                <span>Animations &amp; Charts (ZIP)</span>
              </Link>
              <span className="text-slate-600">·</span>
              <Link to="/teacher/dashboard" className="hover:text-blue-300 transition-colors">
                <span>Teacher Portal</span>
              </Link>
              <span className="text-slate-600">·</span>
              <Link to="/parent/dashboard" className="hover:text-blue-300 transition-colors">
                <span>Parent Portal</span>
              </Link>
              <span className="text-slate-600">·</span>
              <Link to="/portal" className="hover:text-white transition-colors">
                <span>Portal Sign In</span>
              </Link>
              <span className="text-slate-600">·</span>
              <Link to="/verify-certificate" className="hover:text-white transition-colors">
                <span>Verify Certificate</span>
              </Link>
              <span className="text-slate-600">·</span>
              <Link to="/admin/login" className="hover:text-blue-300 transition-colors flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <nav
        className={`w-full transition-all duration-200 border-b ${
          isScrolled
            ? 'bg-[#0B1930]/95 backdrop-blur-md border-blue-900/40 shadow-lg shadow-black/20 py-3'
            : 'bg-[#0B1930] border-blue-950/80 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* Zone 1: Brand Wordmark */}
            <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="OpenFrame IT Solutions">
              <div className="w-10 h-10 rounded-lg bg-white p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow flex items-center justify-center overflow-hidden border border-blue-500/40">
                <img
                  src="/openframe_official_logo.jpg"
                  alt="OpenFrame IT Solutions"
                  className="w-full h-full object-contain rounded-md"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-white text-lg tracking-tight leading-none group-hover:text-sky-300 transition-colors">
                  OpenFrame
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-widest text-blue-400 mt-1">
                  IT Solutions Pvt Ltd
                </span>
              </div>
            </Link>

            {/* Zone 2: Navigation Links (Desktop) */}
            <div className="hidden xl:flex items-center gap-0.5 text-[12px] font-medium text-slate-300">
              {navLinks.map((item) => {
                const isActive =
                  cleanPath === item.path ||
                  (item.path !== '/' && cleanPath.startsWith(item.path));

                if (item.hasDropdown) {
                  return (
                    <div
                      key={item.path}
                      className="relative"
                      onMouseEnter={() => setSolutionsDropdownOpen(true)}
                      onMouseLeave={() => setSolutionsDropdownOpen(false)}
                    >
                      <Link
                        to={item.path}
                        className={`px-3 py-2 rounded-md transition-colors flex items-center gap-1 ${
                          isActive
                            ? 'text-sky-400 font-semibold bg-white/5'
                            : 'hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span>{item.label}</span>
                        <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                      </Link>

                      {solutionsDropdownOpen && (
                        <div className="absolute top-full left-0 w-72 pt-2 z-50">
                          <div className="bg-[#0F2042] border border-blue-800/50 rounded-xl shadow-2xl p-2.5 backdrop-blur-xl">
                            <Link
                              to="/it-solutions"
                              className="block p-2.5 rounded-lg hover:bg-blue-900/50 transition-colors group"
                            >
                              <div className="text-white font-medium text-sm group-hover:text-sky-300">
                                All IT & Software Solutions
                              </div>
                              <div className="text-slate-400 text-xs mt-0.5">
                                Enterprise systems, cloud, web and mobile platforms
                              </div>
                            </Link>
                            <div className="my-1 border-t border-blue-900/60"></div>
                            <Link
                              to="/products"
                              className="block p-2.5 rounded-lg hover:bg-blue-900/50 transition-colors group"
                            >
                              <div className="text-white font-medium text-sm group-hover:text-sky-300">
                                Proprietary Digital Products
                              </div>
                              <div className="text-slate-400 text-xs mt-0.5">
                                CoreERP, EduLMS, CloudPulse & CollabFlow
                              </div>
                            </Link>
                            <Link
                              to="/education"
                              className="block p-2.5 rounded-lg hover:bg-blue-900/50 transition-colors group"
                            >
                              <div className="text-white font-medium text-sm group-hover:text-sky-300">
                                OpenFrame Education
                              </div>
                              <div className="text-slate-400 text-xs mt-0.5">
                                Industry-aligned tech training & campus labs
                              </div>
                            </Link>
                            <Link
                              to="/school"
                              className="block p-2.5 rounded-lg hover:bg-blue-900/50 transition-colors group"
                            >
                              <div className="text-white font-medium text-sm group-hover:text-sky-300">
                                School Education (LKG–12)
                              </div>
                              <div className="text-slate-400 text-xs mt-0.5">
                                Karnataka State, CBSE &amp; ICSE multilingual learning
                              </div>
                            </Link>
                            <Link
                              to="/animation-course"
                              className="block p-2.5 rounded-lg hover:bg-blue-900/50 transition-colors group"
                            >
                              <div className="text-white font-medium text-sm group-hover:text-sky-300">
                                Swift UI Animation &amp; Charts Studio
                              </div>
                              <div className="text-slate-400 text-xs mt-0.5">
                                17 Ramotion UI components, 12 chart types &amp; ZIP packs
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
                    className={`px-2 py-2 rounded-md transition-colors whitespace-nowrap ${
                      isActive
                        ? 'text-sky-400 font-semibold bg-white/5'
                        : 'hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Zone 3: Actions & Mobile Hamburger */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/chatbot"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-cyan-300 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 shadow-sm transition-all whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Qwen AI</span>
              </Link>

              <Link
                to="/contact"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-md shadow-blue-600/30 transition-all whitespace-nowrap"
              >
                <span>Contact Us</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0B1930] border-b border-blue-900/60 shadow-2xl px-4 py-4 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
            Menu Navigation
          </div>
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-3 py-2 rounded-md text-sm font-medium ${
                cleanPath === item.path
                  ? 'bg-blue-600/20 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-blue-900/60 flex flex-col gap-2">
            <Link
              to="/student/dashboard"
              className="px-3 py-2 rounded-md text-xs font-semibold text-sky-400 bg-sky-950/40 hover:text-white flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Student Learning Portal (Quinn AI)</span>
            </Link>
            <Link
              to="/teacher/dashboard"
              className="px-3 py-2 rounded-md text-xs text-slate-300 hover:text-white flex items-center gap-2"
            >
              <span>Faculty Evaluation Dashboard</span>
            </Link>
            <Link
              to="/parent/dashboard"
              className="px-3 py-2 rounded-md text-xs text-slate-300 hover:text-white flex items-center gap-2"
            >
              <span>Parent Progress Portal</span>
            </Link>
            <Link
              to="/portal"
              className="px-3 py-2 rounded-md text-xs text-slate-300 hover:text-white flex items-center gap-2"
            >
              <span>Unified Portal Sign In</span>
            </Link>
            <Link
              to="/verify-certificate"
              className="px-3 py-2 rounded-md text-xs text-slate-300 hover:text-white flex items-center gap-2"
            >
              <span>Public Certificate Verification</span>
            </Link>
            <Link
              to="/admin/login"
              className="px-3 py-2 rounded-md text-xs text-slate-400 hover:text-sky-300 flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Admin Portal Login</span>
            </Link>
            <Link
              to="/contact"
              className="mt-2 w-full text-center py-2.5 px-4 rounded-lg bg-blue-600 text-white font-medium text-sm shadow-md"
            >
              Contact Corporate Office
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
