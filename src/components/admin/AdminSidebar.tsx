import React from 'react';
import {
  LayoutDashboard,
  Mail,
  Cpu,
  Building2,
  Package,
  GraduationCap,
  School,
  Briefcase,
  FileCheck,
  Users,
  Award,
  HeartHandshake,
  Heart,
  BookOpen,
  FileText,
  BellRing,
  MapPin,
  Send,
  ShieldCheck,
  ClipboardList,
  Settings,
  ChevronRight,
  Sparkles,
  X,
  LogOut,
  ExternalLink
} from 'lucide-react';
import { AdminRole } from '../../types';
import { Link } from '../../router/RouterContext';

export type AdminModuleKey =
  | 'dashboard'
  | 'general_enquiries'
  | 'software_enquiries'
  | 'business_enquiries'
  | 'product_enquiries'
  | 'students'
  | 'teachers'
  | 'internships'
  | 'jobs'
  | 'professionals'
  | 'school_partners'
  | 'ngo_partners'
  | 'hopenest_management'
  | 'courses'
  | 'corporate_training'
  | 'products'
  | 'blog'
  | 'announcements'
  | 'branches'
  | 'subscribers'
  | 'corporate_documents'
  | 'admin_users'
  | 'activity_logs'
  | 'lms_management'
  | 'school_management'
  | 'settings';

interface SidebarProps {
  activeModule: AdminModuleKey;
  onSelectModule: (key: AdminModuleKey) => void;
  counts: Record<string, number>;
  role: AdminRole;
  isSuperAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  canAccess: (module: AdminModuleKey) => boolean;
  onLogout: () => void;
}

interface NavItem {
  key: AdminModuleKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: string;
  badgeColor?: string;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  counts,
  role,
  isSuperAdmin,
  isOpen,
  onClose,
  canAccess,
  onLogout
}) => {
  const navGroups: NavGroup[] = [
    {
      groupName: 'Core Operations',
      items: [
        { key: 'dashboard', label: '1. Dashboard Overview', icon: LayoutDashboard }
      ]
    },
    {
      groupName: 'Enquiries & Solutions',
      items: [
        { key: 'general_enquiries', label: '2. General Enquiries', icon: Mail, countKey: 'general_enquiries' },
        { key: 'software_enquiries', label: '3. Software Enquiries', icon: Cpu, countKey: 'software_enquiries', badgeColor: 'bg-blue-500' },
        { key: 'business_enquiries', label: '4. Business Enquiries', icon: Building2, countKey: 'business_enquiries' },
        { key: 'product_enquiries', label: '5. Product Enquiries', icon: Package, countKey: 'product_enquiries' }
      ]
    },
    {
      groupName: 'Academic & Education',
      items: [
        { key: 'students', label: '6. Student Management', icon: GraduationCap, countKey: 'students', badgeColor: 'bg-emerald-500' },
        { key: 'teachers', label: '7. Teacher Management', icon: School, countKey: 'teachers' },
        { key: 'courses', label: '14. Course Management', icon: BookOpen, countKey: 'courses' },
        { key: 'corporate_training', label: 'Corporate Training Library', icon: Briefcase },
        { key: 'lms_management', label: 'Quinn AI & LMS Control', icon: Sparkles, badgeColor: 'bg-blue-600' },
        { key: 'school_management', label: 'School System (LKG–12)', icon: GraduationCap, badgeColor: 'bg-sky-600' }
      ]
    },
    {
      groupName: 'HR & Recruitment',
      items: [
        { key: 'internships', label: '8. Internship Management', icon: Award, countKey: 'internships' },
        { key: 'jobs', label: '9. Job Applications', icon: Briefcase, countKey: 'jobs', badgeColor: 'bg-indigo-500' },
        { key: 'professionals', label: '10. Professional Reg.', icon: Users, countKey: 'professionals' }
      ]
    },
    {
      groupName: 'Strategic Partnerships',
      items: [
        { key: 'school_partners', label: '11. School Partnerships', icon: School, countKey: 'school_partners' },
        { key: 'ngo_partners', label: '12. NGO Partnerships', icon: HeartHandshake, countKey: 'ngo_partners' }
      ]
    },
    {
      groupName: 'HopeNest Foundation (Sec 8)',
      items: [
        { key: 'hopenest_management', label: '13. HopeNest Management', icon: Heart, countKey: 'hopenest', badgeColor: 'bg-teal-500' }
      ]
    },
    {
      groupName: 'Platform & Content',
      items: [
        { key: 'products', label: '15. Product Management', icon: Package, countKey: 'products' },
        { key: 'blog', label: '16. Blog Management', icon: FileText, countKey: 'blog' },
        { key: 'announcements', label: '17. Website Announcements', icon: BellRing },
        { key: 'branches', label: '18. Branch Management', icon: MapPin, countKey: 'branches' },
        { key: 'corporate_documents', label: '19. Corporate Documents', icon: FileCheck, countKey: 'corporate_documents' },
        { key: 'subscribers', label: '20. Newsletter Subscribers', icon: Send, countKey: 'subscribers' }
      ]
    },
    {
      groupName: 'System & Governance',
      items: [
        { key: 'admin_users', label: '20. Admin User Management', icon: ShieldCheck, countKey: 'admin_users', badgeColor: 'bg-purple-500' },
        { key: 'activity_logs', label: '21. Activity Logs', icon: ClipboardList, countKey: 'activity_logs' },
        { key: 'settings', label: '22. Website Settings', icon: Settings }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-72 bg-[#071326] text-slate-300 border-r border-blue-950 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-blue-950 flex items-center justify-between bg-[#050E1C]">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-blue-500/40 shadow-sm flex items-center justify-center overflow-hidden">
              <img
                src="/openframe_official_logo.jpg"
                alt="OpenFrame"
                className="w-full h-full object-contain rounded"
              />
            </div>
            <div>
              <div className="font-heading font-bold text-white text-xs tracking-tight">
                OpenFrame Console
              </div>
              <div className="text-[10px] text-sky-400 font-medium">
                Enterprise Admin Hub
              </div>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="p-3.5 mx-3 my-3 rounded-xl bg-blue-950/40 border border-blue-900/60">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Security Clearance</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                role === 'Super Admin'
                  ? 'bg-purple-900/50 text-purple-300 border-purple-600/50'
                  : role === 'HR Admin'
                  ? 'bg-emerald-900/50 text-emerald-300 border-emerald-600/50'
                  : role === 'Sales Admin'
                  ? 'bg-blue-900/50 text-blue-300 border-blue-600/50'
                  : role === 'Education Admin'
                  ? 'bg-amber-900/50 text-amber-300 border-amber-600/50'
                  : role === 'HopeNest Admin'
                  ? 'bg-teal-900/50 text-teal-300 border-teal-600/50'
                  : 'bg-indigo-900/50 text-indigo-300 border-indigo-600/50'
              }`}
            >
              {role}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {isSuperAdmin ? 'Full Access Principal' : `${role} Operations`}
          </div>
        </div>

        {/* Module Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-5 text-xs scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group) => {
            // Filter items user can access
            const accessibleItems = group.items.filter((item) => canAccess(item.key));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.groupName} className="space-y-1">
                <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                  {group.groupName}
                </div>

                <div className="space-y-0.5">
                  {accessibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeModule === item.key;
                    const count = item.countKey ? counts[item.countKey] : undefined;

                    return (
                      <button
                        key={item.key}
                        onClick={() => {
                          onSelectModule(item.key);
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all group ${
                          isActive
                            ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/30'
                            : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon
                            className={`w-4 h-4 shrink-0 transition-colors ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-sky-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {typeof count === 'number' && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : item.badgeColor
                                ? `${item.badgeColor} text-white`
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-blue-950 bg-[#050E1C] space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Live Website</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-950/40 transition-colors font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Console</span>
          </button>
        </div>
      </aside>
    </>
  );
};
