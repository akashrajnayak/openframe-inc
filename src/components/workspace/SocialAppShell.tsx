import React, { useState, useEffect } from 'react';
import {
  Search,
  Home,
  BookOpen,
  Bot,
  Award,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ExternalLink,
  Compass,
} from 'lucide-react';
import { useRouter, Link } from '../../router/RouterContext';
import { marketplaceService } from '../../services/marketplaceService';
import { MarketplaceCourse } from '../../types';
import { compute90PercentCoursePricing, formatInr } from '../../utils/pricingEngine';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../../services/firebase';

export interface WorkspaceNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export interface WorkspaceNotificationItem {
  id: string;
  title: string;
  message: string;
  time?: string;
  read?: boolean;
}

interface SocialAppShellProps {
  roleLabel: string;
  userName: string;
  userEmail: string;
  registrationId?: string;
  navItems: WorkspaceNavItem[];
  activeNavId: string;
  onSelectNav: (id: string) => void;
  notifications?: WorkspaceNotificationItem[];
  onLogout: () => void;
  showRightRail?: boolean;
  rightRailExtra?: React.ReactNode;
  children: React.ReactNode;
}

export const SocialAppShell: React.FC<SocialAppShellProps> = ({
  roleLabel,
  userName,
  userEmail,
  registrationId,
  navItems,
  activeNavId,
  onSelectNav,
  notifications = [],
  onLogout,
  showRightRail = true,
  rightRailExtra,
  children,
}) => {
  const { navigate } = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState<MarketplaceCourse[]>([]);
  const [announcements, setAnnouncements] = useState<Array<{ id: string; title: string; message: string; date: string }>>([]);

  useEffect(() => {
    if (!showRightRail) return;
    let active = true;
    marketplaceService
      .filterCourses({ page: 1, pageSize: 3, sortBy: 'popular' })
      .then((res) => {
        if (active) setRecommendedCourses(res.courses || []);
      })
      .catch(() => {});

    getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(2)))
      .then((snap) => {
        if (!active) return;
        const rows = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) }))
          .filter((a) => a.title)
          .map((a) => ({
            id: a.id,
            title: a.title,
            message: a.message || a.description || 'Official platform notice',
            date: a.createdAt ? String(a.createdAt).slice(0, 10) : 'Recent',
          }));
        setAnnouncements(rows);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [showRightRail]);

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      navigate('/marketplace');
      return;
    }
    navigate(`/marketplace?q=${encodeURIComponent(q)}`);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const userInitial = (userName || userEmail || 'O').charAt(0).toUpperCase();
  const mobileBottomNav = navItems.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F5F5F2] text-[#18221F] flex flex-col pb-16 lg:pb-0">
      {/* Facebook-Inspired Top App Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Left: Brand + Global Search */}
          <div className="flex items-center gap-3 min-w-0 flex-1 max-w-md">
            <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="OpenFrame Home">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
                <img
                  src="/openframe_official_logo.jpg"
                  alt="OpenFrame"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <span className="hidden sm:inline font-editorial font-semibold text-lg text-[#18221F]">
                OpenFrame
              </span>
            </Link>

            <form onSubmit={handleGlobalSearch} className="relative flex-1 max-w-xs hidden md:block">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search OpenFrame courses..."
                className="w-full pl-9 pr-3 py-2 rounded-full bg-[#F5F5F2] border border-transparent focus:border-[#2563EB] focus:bg-white text-xs text-[#18221F] placeholder-[#64748B] focus:outline-none transition-colors"
              />
            </form>
          </div>

          {/* Center: Quick Ecosystem Tabs */}
          <div className="hidden lg:flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelectNav(navItems[0]?.id || 'overview')}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#123D32] bg-[#123D32]/8 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Home className="w-4 h-4" />
              <span>Workspace</span>
            </button>
            <Link
              to="/marketplace"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#18221F] hover:bg-[#F5F5F2] flex items-center gap-1.5 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              <span>Courses</span>
            </Link>
            <Link
              to="/chatbot"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#18221F] hover:bg-[#F5F5F2] flex items-center gap-1.5 whitespace-nowrap"
            >
              <Bot className="w-4 h-4" />
              <span>Quinn AI</span>
            </Link>
            <Link
              to="/verify-certificate"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#18221F] hover:bg-[#F5F5F2] flex items-center gap-1.5 whitespace-nowrap"
            >
              <Award className="w-4 h-4" />
              <span>Certificates</span>
            </Link>
          </div>

          {/* Right: Notifications, User Identity & Logout */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                className="w-9 h-9 rounded-full bg-[#F5F5F2] hover:bg-slate-200 flex items-center justify-center text-[#18221F] relative cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-3 space-y-2">
                  <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-100">
                    <span className="text-xs font-bold text-[#18221F]">Notifications</span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-[11px] text-[#64748B] hover:text-[#18221F] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="text-xs text-[#64748B] py-4 text-center">
                      You’re all caught up.
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {notifications.slice(0, 6).map((n) => (
                        <div key={n.id} className="py-2.5 px-1 space-y-0.5">
                          <div className="text-xs font-semibold text-[#18221F]">{n.title}</div>
                          <div className="text-[11px] text-[#64748B] line-clamp-2">{n.message}</div>
                          {n.time && <div className="text-[10px] text-slate-400">{n.time}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-[#123D32] text-white text-xs font-bold flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <div className="text-left leading-tight max-w-[140px]">
                <div className="text-xs font-semibold text-[#18221F] truncate">{userName}</div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-[#123D32] truncate">
                  {roleLabel}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              title="Sign Out"
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-[#18221F] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="hidden md:inline">Sign Out</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-[#F5F5F2] text-[#18221F] cursor-pointer"
              aria-label="Toggle workspace menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-2 max-h-[75vh] overflow-y-auto">
            <div className="pb-2 border-b border-slate-100 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-[#18221F]">{userName}</div>
                <div className="text-[#64748B]">{roleLabel}{registrationId ? ` · ${registrationId}` : ''}</div>
              </div>
              <Link to="/" className="text-[#2563EB] font-semibold">
                Website →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeNavId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectNav(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer ${
                      active ? 'bg-[#123D32] text-white' : 'text-[#18221F] hover:bg-[#F5F5F2]'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                    {item.badge !== undefined && Number(item.badge) > 0 && (
                      <span className="text-[11px] font-bold tabular-nums opacity-80">{item.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main 3-Zone Facebook-Inspired App Container */}
      <div className="max-w-[1440px] mx-auto w-full flex-1 px-3 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 xl:col-span-2 sticky top-22 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#123D32] text-white font-bold text-sm flex items-center justify-center shrink-0">
                {userInitial}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#18221F] truncate">{userName}</div>
                <div className="text-[11px] font-semibold text-[#123D32] truncate">{roleLabel}</div>
                {registrationId && (
                  <div className="text-[10px] text-[#64748B] truncate tabular-nums">{registrationId}</div>
                )}
              </div>
            </div>
          </div>

          <nav className="bg-white rounded-2xl border border-slate-200/80 p-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeNavId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectNav(item.id)}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer text-left ${
                    active
                      ? 'bg-[#123D32] text-white'
                      : 'text-[#18221F]/85 hover:bg-[#FAF7F2] hover:text-[#18221F]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge !== undefined && Number(item.badge) > 0 && (
                    <span
                      className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                        active ? 'bg-white/20 text-white' : 'bg-[#F5F5F2] text-[#18221F]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 space-y-1 text-xs">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
              Shortcuts
            </div>
            <Link
              to="/marketplace"
              className="flex items-center justify-between px-2.5 py-2 rounded-xl text-[#18221F] hover:bg-[#FAF7F2]"
            >
              <span className="flex items-center gap-2 font-medium">
                <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Explore Catalog</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              to="/chatbot"
              className="flex items-center justify-between px-2.5 py-2 rounded-xl text-[#18221F] hover:bg-[#FAF7F2]"
            >
              <span className="flex items-center gap-2 font-medium">
                <Bot className="w-3.5 h-3.5 text-[#123D32]" />
                <span>Quinn AI Mentor</span>
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </Link>
            <Link
              to="/"
              className="flex items-center justify-between px-2.5 py-2 rounded-xl text-[#64748B] hover:text-[#18221F] hover:bg-[#FAF7F2]"
            >
              <span>Public Homepage</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </aside>

        {/* Center Main Workspace Content */}
        <main className={showRightRail ? 'lg:col-span-9 xl:col-span-7 space-y-6 min-w-0' : 'lg:col-span-9 xl:col-span-10 space-y-6 min-w-0'}>
          {children}
        </main>

        {/* Right Contextual Sidebar (Real Recommendations + Live Announcements) */}
        {showRightRail && (
          <aside className="hidden xl:block xl:col-span-3 sticky top-22 space-y-5">
            {rightRailExtra}

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#123D32]">
                  Recommended Courses
                </h3>
                <Link to="/marketplace" className="text-[11px] font-semibold text-[#2563EB] hover:underline">
                  See all
                </Link>
              </div>
              {recommendedCourses.length === 0 ? (
                <div className="text-xs text-[#64748B]">Catalog updates sync automatically.</div>
              ) : (
                <div className="space-y-3">
                  {recommendedCourses.map((course) => (
                    <Link
                      key={course.id}
                      to={`/marketplace/${course.id}`}
                      className="block p-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F5F5F2] border border-slate-200/60 transition-colors"
                    >
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-[#123D32]">
                        {course.category}
                      </div>
                      <div className="text-xs font-bold text-[#18221F] mt-0.5 line-clamp-2">
                        {course.title}
                      </div>
                      {(() => {
                        const p = compute90PercentCoursePricing({
                          category: course.category,
                          title: course.title,
                          level: course.level,
                          educationLevels: course.educationLevels,
                          existingPrice: course.price,
                        });
                        return (
                          <div className="text-[11px] text-[#64748B] mt-1 tabular-nums">
                            {course.duration} · <span className="font-semibold text-[#18221F]">{formatInr(p.finalPriceInr)}</span>{' '}
                            <span className="line-through text-slate-400">{formatInr(p.marketBenchmarkPriceInr)}</span> · 90% Off
                          </div>
                        );
                      })()}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#14213D]">
                Platform Announcements
              </h3>
              {announcements.length === 0 ? (
                <p className="text-xs text-[#64748B]">
                  No new administrative notices at this moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {announcements.map((a) => (
                    <div key={a.id} className="pb-2.5 border-b border-slate-100 last:border-b-0 last:pb-0">
                      <div className="text-xs font-bold text-[#18221F]">{a.title}</div>
                      <div className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">{a.message}</div>
                      <div className="text-[10px] text-slate-400 mt-1 tabular-nums">{a.date}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon;
          const active = activeNavId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectNav(item.id)}
              className={`flex flex-col items-center justify-center px-2 py-1 rounded-xl text-[10px] font-semibold cursor-pointer min-w-[60px] ${
                active ? 'text-[#123D32]' : 'text-[#64748B]'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="truncate max-w-[64px]">{item.label.replace(/^\d+\.\s*/, '')}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center px-2 py-1 rounded-xl text-[10px] font-semibold text-[#64748B] cursor-pointer min-w-[60px]"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span>More</span>
        </button>
      </nav>
    </div>
  );
};
