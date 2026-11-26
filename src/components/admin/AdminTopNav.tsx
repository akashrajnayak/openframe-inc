import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Bell,
  Search,
  ExternalLink,
  LogOut,
  ChevronDown,
  Database,
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Shield,
  Award
} from 'lucide-react';
import { AdminModuleKey } from './AdminSidebar';
import { AdminRole } from '../../types';
import { Link } from '../../router/RouterContext';

interface RecentNotification {
  id: string;
  type: string;
  title: string;
  sender: string;
  time: string;
  moduleKey: AdminModuleKey;
}

interface AdminTopNavProps {
  activeModule: AdminModuleKey;
  onSelectModule: (key: AdminModuleKey) => void;
  onToggleMobileSidebar: () => void;
  userEmail: string | null;
  role: AdminRole;
  isSuperAdmin: boolean;
  onLogout: () => void;
  recentNotifications?: RecentNotification[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

const moduleTitles: Record<AdminModuleKey, { title: string; category: string }> = {
  dashboard: { title: 'Dashboard Overview & Real-Time Analytics', category: 'Core Operations' },
  general_enquiries: { title: 'General Corporate Enquiries', category: 'Enquiries & Solutions' },
  software_enquiries: { title: 'Software Development & IT Enquiries', category: 'Enquiries & Solutions' },
  business_enquiries: { title: 'Enterprise Business Enquiries', category: 'Enquiries & Solutions' },
  product_enquiries: { title: 'Digital Product Enquiries', category: 'Enquiries & Solutions' },
  students: { title: 'Student Management & Registrations', category: 'Academic & Education' },
  teachers: { title: 'Teacher & Instructor Network', category: 'Academic & Education' },
  courses: { title: 'Course Catalog & Curriculum', category: 'Academic & Education' },
  corporate_training: { title: 'Corporate Management & Employee Training Library', category: 'Academic & Education' },
  internships: { title: 'Internship Applications & Reviews', category: 'HR & Recruitment' },
  jobs: { title: 'Job Openings & Candidate Applications', category: 'HR & Recruitment' },
  professionals: { title: 'Professional Network Registrations', category: 'HR & Recruitment' },
  school_partners: { title: 'School & Institutional Partnerships', category: 'Strategic Partnerships' },
  ngo_partners: { title: 'NGO & Community Partnerships', category: 'Strategic Partnerships' },
  hopenest_management: { title: 'HopeNest Global Foundation (Sec 8)', category: 'Foundation Operations' },
  products: { title: 'Digital Products & Software Portfolio', category: 'Platform & Content' },
  blog: { title: 'Blog, News & Knowledge Centre Articles', category: 'Platform & Content' },
  announcements: { title: 'Website Announcements & Alert Banners', category: 'Platform & Content' },
  branches: { title: 'Branch Locations & Regional Offices', category: 'Platform & Content' },
  corporate_documents: { title: 'Official Corporate Documents Repository', category: 'Platform & Content' },
  subscribers: { title: 'Newsletter & Bulletin Subscribers', category: 'Platform & Content' },
  admin_users: { title: 'Administrator Accounts & Role-Based Access (RBAC)', category: 'System & Governance' },
  activity_logs: { title: 'Audit Trail & Activity Logs', category: 'System & Governance' },
  lms_management: { title: 'Quinn AI & LMS Control Center', category: 'Academic & Education' },
  course_approvals: { title: 'Course Approval & Certification Queue', category: 'Academic & Education' },
  school_management: { title: 'School Education Management (LKG – 12th Std)', category: 'Academic & Education' },
  payment_settings: { title: 'Payment Gateway (Razorpay)', category: 'System & Governance' },
  settings: { title: 'Website Configuration & Meta Settings', category: 'System & Governance' }
};

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  activeModule,
  onSelectModule,
  onToggleMobileSidebar,
  userEmail,
  role,
  isSuperAdmin,
  onLogout,
  recentNotifications = [],
  searchTerm,
  onSearchChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const meta = moduleTitles[activeModule] || { title: activeModule, category: 'Administration' };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation drawer"
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Admin</span>
            <span>/</span>
            <span className="text-slate-700">{meta.category}</span>
          </div>
          <h1 className="text-sm lg:text-base font-bold text-slate-900 tracking-tight leading-tight">
            {meta.title}
          </h1>
        </div>
        <div className="sm:hidden font-bold text-slate-900 text-sm truncate max-w-[180px]">
          {meta.title}
        </div>
      </div>

      {/* Right: Search, Database Beacon, Notifications, Profile */}
      <div className="flex items-center gap-2.5 lg:gap-4">
        {/* Quick Filter/Search input */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Live Firestore DB Badge */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[10px]">Cloud Firestore: Live</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View recent inbound submissions"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {recentNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Recent Inbound Submissions</h4>
                  <p className="text-[10px] text-slate-500">Live feed across all gateway forms</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
                  {recentNotifications.length} Latest
                </span>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {recentNotifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No new submissions received recently.
                  </div>
                ) : (
                  recentNotifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => {
                        onSelectModule(notif.moduleKey);
                        setShowNotifications(false);
                      }}
                      className="w-full p-3 text-left hover:bg-blue-50/50 transition-colors flex items-start gap-3"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-[11px] mb-0.5">
                          <span className="font-semibold text-slate-900 truncate">
                            {notif.sender}
                          </span>
                          <span className="text-slate-400 text-[10px] whitespace-nowrap ml-2">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 truncate">{notif.title}</p>
                        <span className="inline-block mt-1 text-[10px] text-blue-600 font-medium">
                          {notif.type} &rarr;
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {userEmail ? userEmail.charAt(0) : 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                {userEmail || 'Administrator'}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-600 inline" />
                <span>{role}</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="font-bold text-slate-900 truncate">{userEmail}</div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Role: <span className="font-bold text-blue-600">{role}</span>
                </div>
              </div>

              <Link
                to="/"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Home Page Admin Panel</span>
              </Link>

              <button
                onClick={() => {
                  onSelectModule('settings');
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Console Settings</span>
              </button>

              {isSuperAdmin && (
                <button
                  onClick={() => {
                    onSelectModule('course_approvals');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors text-left"
                >
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Course Approval Queue</span>
                </button>
              )}

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out Console</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
