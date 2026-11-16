import React from 'react';
import { Link, useRouter } from '../../router/RouterContext';
import { 
  Building2, 
  Sparkles, 
  HeartHandshake, 
  Layers, 
  BellRing, 
  Users, 
  Heart,
  UserCheck
} from 'lucide-react';

export const HopeNestSubNav: React.FC = () => {
  const { currentPath } = useRouter();

  const navItems = [
    { label: 'Foundation Overview', path: '/hopenest', icon: Building2 },
    { label: 'Our Programmes', path: '/hopenest/programmes', icon: Layers },
    { label: 'ASHA Programme', path: '/hopenest/asha-welfare-programme', icon: Sparkles, badge: 'Flagship' },
    { label: 'Activities & Updates', path: '/hopenest/updates', icon: BellRing },
    { label: 'Volunteer With Us', path: '/hopenest/volunteer', icon: Users },
    { label: 'Support & Donate', path: '/hopenest/donate', icon: Heart },
    { label: 'Beneficiary Sign-Up', path: '/hopenest/participate', icon: UserCheck },
  ];

  const isActive = (path: string) => {
    if (path === '/hopenest') {
      return currentPath === '/hopenest' || currentPath === '/hopenest/';
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="bg-slate-900 border-b border-teal-900/60 sticky top-16 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2.5 overflow-x-auto no-scrollbar gap-2">
          <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-slate-800 text-teal-400 font-bold text-xs uppercase tracking-wider">
            <HeartHandshake className="w-4 h-4 text-teal-400" />
            <span className="hidden sm:inline">HopeNest Desk</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-150 shrink-0 ${
                    active
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-teal-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
