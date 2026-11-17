import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  Layers,
  Users,
  UserCheck,
  BookOpen,
  Brain,
  CreditCard,
  Award,
  Megaphone,
  Shield,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronRight,
  Lock,
  ExternalLink,
  Search,
} from 'lucide-react';
import { SchoolInstitution } from '../../types';
import { Link } from '../../router/RouterContext';

export type SchoolPortalSection =
  | 'overview'
  | 'onboarding'
  | 'classes'
  | 'students'
  | 'teachers'
  | 'programs'
  | 'assessments'
  | 'finance'
  | 'certificates'
  | 'communications'
  | 'audit';

interface SchoolPartnerLayoutProps {
  institution: SchoolInstitution | null;
  activeSection: SchoolPortalSection;
  onSelectSection: (section: SchoolPortalSection) => void;
  userEmail: string;
  userName: string;
  isSchoolAdmin: boolean;
  isApproved: boolean;
  unreadNotifications?: Array<{ id: string; title: string; message: string; createdAt: string }>;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

interface NavItem {
  key: SchoolPortalSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresApproval?: boolean;
  adminOnly?: boolean;
}

const NAV_GROUPS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Workspace',
    items: [
      { key: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
      { key: 'onboarding', label: 'School Onboarding & Docs', icon: FileCheck2 },
    ],
  },
  {
    title: 'School Operations',
    items: [
      { key: 'classes', label: 'Classes & Sections', icon: Layers, requiresApproval: true },
      { key: 'students', label: 'Students & Bulk Import', icon: Users, requiresApproval: true },
      { key: 'teachers', label: 'Teachers & Allocation', icon: UserCheck, requiresApproval: true },
    ],
  },
  {
    title: 'Programs & Assessments',
    items: [
      { key: 'programs', label: 'OpenFrame Programs', icon: BookOpen, requiresApproval: true },
      { key: 'assessments', label: 'IQ / EQ / SQ Assessments', icon: Brain, requiresApproval: true },
    ],
  },
  {
    title: 'Credentials & Finance',
    items: [
      { key: 'certificates', label: 'Certificates & QR Proof', icon: Award, requiresApproval: true },
      { key: 'finance', label: 'Payments & Invoices', icon: CreditCard, requiresApproval: true, adminOnly: true },
    ],
  },
  {
    title: 'Governance',
    items: [
      { key: 'communications', label: 'Announcements & Alerts', icon: Megaphone, requiresApproval: true },
      { key: 'audit', label: 'Audit Logs & Settings', icon: Shield, adminOnly: true },
    ],
  },
];

export const SchoolPartnerLayout: React.FC<SchoolPartnerLayoutProps> = ({
  institution,
  activeSection,
  onSelectSection,
  userEmail,
  userName,
  isSchoolAdmin,
  isApproved,
  unreadNotifications = [],
  searchQuery = '',
  onSearchChange,
  onLogout,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const statusText = institution?.verificationStatus || 'Not Submitted';
  const statusDotClass =
    statusText === 'Approved'
      ? 'bg-emerald-500'
      : statusText === 'Submitted' || statusText === 'Under Review'
      ? 'bg-blue-500'
      : statusText === 'More Information Required'
      ? 'bg-amber-500'
      : statusText === 'Rejected' || statusText === 'Suspended'
      ? 'bg-rose-500'
      : 'bg-slate-400';

  const activeLabel =
    NAV_GROUPS.flatMap((g) => g.items).find((i) => i.key === activeSection)?.label || 'Overview';

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900">
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
        />
      )}

      {/* Persistent Left Sidebar (#0D172B / #14213D) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-68 bg-[#0D172B] text-slate-200 border-r border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Block */}
        <div className="h-16 px-5 border-b border-slate-800/90 flex items-center justify-between bg-[#14213D]">
          <Link to="/" className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0">
              <img
                src="/openframe_official_logo.jpg"
                alt="OpenFrame"
                className="w-full h-full object-contain rounded"
              />
            </div>
            <div className="min-w-0">
              <div className="font-heading font-bold text-white text-xs tracking-tight truncate">
                OpenFrame Partner
              </div>
              <div className="text-[11px] text-blue-300 truncate">
                School Management SaaS
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* School Identity Summary */}
        <div className="px-4 py-3.5 border-b border-slate-800/80 bg-[#14213D]/50 space-y-1">
          <div className="text-xs font-semibold text-white truncate">
            {institution?.name || 'New School Onboarding'}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-mono tabular-nums">
              {institution?.institutionCode || institution?.applicationRef || 'DRAFT'}
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-200">
              <span className={`w-1.5 h-1.5 rounded-full ${statusDotClass}`} />
              <span>{statusText}</span>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => !item.adminOnly || isSchoolAdmin);
            if (visibleItems.length === 0) return null;
            return (
              <div key={group.title} className="space-y-1">
                <div className="px-2.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {group.title}
                </div>
                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.key;
                    const isLocked = Boolean(item.requiresApproval && !isApproved);
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          onSelectSection(item.key);
                          setMobileOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                          isActive
                            ? 'bg-[#2563EB] text-white font-semibold'
                            : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        {isLocked && (
                          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 space-y-1.5 bg-[#0D172B]">
          <Link
            to="/education"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800/70 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Course Catalog</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          </Link>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/50 font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-68 flex flex-col min-w-0">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Open navigation menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                <span>School Partner</span>
                <span>/</span>
                <span className="font-medium text-slate-800 truncate">{activeLabel}</span>
              </div>
              <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-2">
                <span>{institution?.boardAffiliation || 'All-India Partner Portal'}</span>
                <span>·</span>
                <span>{isSchoolAdmin ? 'School Administrator' : 'Assigned Faculty'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSearchChange && (
              <div className="relative hidden md:block w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Quick search..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((p) => !p)}
                className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-lg p-4 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">Portal Alerts</span>
                    <button
                      type="button"
                      onClick={() => setNotifOpen(false)}
                      className="text-[11px] text-slate-500 hover:text-slate-800"
                    >
                      Close
                    </button>
                  </div>
                  {unreadNotifications.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">No new notifications.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {unreadNotifications.map((n) => (
                        <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                          <div className="font-semibold text-slate-900">{n.title}</div>
                          <p className="text-slate-600 mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-[#14213D] text-white text-xs font-bold flex items-center justify-center">
                {(userName || userEmail || 'S').slice(0, 1).toUpperCase()}
              </div>
              <div className="text-xs leading-tight max-w-36 truncate">
                <div className="font-semibold text-slate-900 truncate">{userName || 'Partner User'}</div>
                <div className="text-[11px] text-slate-500 truncate">{userEmail}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
