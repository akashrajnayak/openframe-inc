import React, { useState, useEffect } from 'react';
import { Link } from '../router/RouterContext';
import { HopeNestSubNav } from '../components/hopenest/HopeNestSubNav';
import { storageService } from '../services/storageService';
import { HopeNestProgram, HopeNestCategory } from '../types';
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  Laptop,
  Wrench,
  Heart,
  Activity,
  Brain,
  TreePine,
  ShieldAlert,
  PawPrint,
  Users,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Sparkles,
  BookOpen,
  GraduationCap,
  Laptop,
  Wrench,
  Heart,
  Activity,
  Brain,
  TreePine,
  ShieldAlert,
  PawPrint,
  Users,
};

export const HopeNestProgrammesPage: React.FC = () => {
  const [programs, setPrograms] = useState<HopeNestProgram[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<HopeNestCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<HopeNestProgram | null>(null);

  useEffect(() => {
    setPrograms(storageService.getHopeNestPrograms());
  }, []);

  const categories: HopeNestCategory[] = [
    'All',
    'Women & Livelihood',
    'Education & Literacy',
    'Skill Development',
    'Health & Wellbeing',
    'Environment & Relief',
    'Community Welfare',
  ];

  const filteredPrograms = programs.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HopeNestSubNav />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#021f24] to-[#06333a] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-teal-900">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wider uppercase">
            <Layers className="w-3.5 h-3.5" />
            Foundation Initiatives Catalogue
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Our Foundation Programmes & Community Activities
          </h1>
          <p className="text-sm sm:text-base text-teal-100 max-w-3xl leading-relaxed">
            Transparent grassroots initiatives designed to promote practical vocational skills, fundamental digital literacy, health awareness, and inclusive welfare across underprivileged communities.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1">
        
        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search programmes or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{filteredPrograms.length}</span> programmes
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Programme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map((prog) => {
            const IconComponent = (prog.iconName && iconMap[prog.iconName]) || Sparkles;
            return (
              <div
                key={prog.id}
                className={`bg-white rounded-xl border p-6 flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                  prog.isFlagship
                    ? 'border-teal-400 ring-2 ring-teal-500/10'
                    : 'border-slate-200 hover:border-teal-300'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {prog.isFlagship && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wider">
                          Flagship
                        </span>
                      )}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {prog.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                      {prog.category}
                    </span>
                    <h3 className="font-heading font-bold text-base text-slate-900 mt-1 leading-snug">
                      {prog.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {prog.shortDesc}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-semibold text-slate-700">Key Objectives:</div>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {prog.objectives.slice(0, 2).map((obj, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedProgram(prog)}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                  >
                    <span>View Curriculum & Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {prog.slug === 'asha-welfare-programme' ? (
                    <Link
                      to="/hopenest/asha-welfare-programme"
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-colors shadow-sm"
                    >
                      ASHA Page
                    </Link>
                  ) : (
                    <Link
                      to={`/hopenest/participate?prog=${encodeURIComponent(prog.title)}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-800 hover:text-teal-800 text-xs font-semibold transition-colors"
                    >
                      Enrol / Inquire
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal for Full Programme Details */}
        {selectedProgram && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                    {selectedProgram.category}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 mt-1">
                    {selectedProgram.title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProgram(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Detailed Programme Overview
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {selectedProgram.description}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Core Objectives
                </h4>
                <ul className="text-xs text-slate-700 space-y-2">
                  {selectedProgram.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Key Hands-on Activities & Workshops
                </h4>
                <ul className="text-xs text-slate-700 space-y-2">
                  {selectedProgram.keyActivities.map((act, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0 mt-1.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs text-slate-600">
                <span className="font-bold text-slate-800">Target Beneficiaries:</span> {selectedProgram.beneficiaries}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedProgram(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Close
                </button>
                <Link
                  to={`/hopenest/participate?prog=${encodeURIComponent(selectedProgram.title)}`}
                  className="px-5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold tracking-wide uppercase transition-colors"
                >
                  Register as Beneficiary / Inquire
                </Link>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
