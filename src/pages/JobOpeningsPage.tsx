import React, { useState } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { CareerOpening } from '../types';

export const JobOpeningsPage: React.FC = () => {
  const { navigate } = useRouter();
  const [openings] = useState<CareerOpening[]>(() => storageService.getCareerOpenings());
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const departments = ['All', 'Engineering', 'Education & Training', 'Operations'];

  const filteredJobs = openings
    .filter(j => j.isActive)
    .filter(j => selectedDept === 'All' || j.department === selectedDept)
    .filter(j => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.requirements.some(r => r.toLowerCase().includes(q))
      );
    });

  const toggleExpand = (id: string) => {
    setExpandedJobId(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-950">
        <div className="max-w-6xl mx-auto space-y-4">
          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Careers & Work Culture
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-sky-300 text-xs font-semibold tracking-wider uppercase mb-3">
                <Briefcase className="w-3.5 h-3.5" />
                Current Vacancies
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
                Verified Job Openings
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-2 leading-relaxed">
                Explore open engineering, curriculum development, and technical operations roles at OpenFrame IT Solutions Private Limited across Bengaluru, Hyderabad, and Pune.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 text-xs max-w-sm">
              <div className="flex items-center gap-2 text-sky-300 font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                Official Admin Verification
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Only active openings reviewed and approved by authorized corporate administrators are published on this portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Listings */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role title, technology (e.g. React, Node, DevOps), or location..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-500 hover:text-slate-800 whitespace-nowrap px-2"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mr-1">
                <Filter className="w-3.5 h-3.5" /> Department:
              </span>
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedDept === dept
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{filteredJobs.length}</strong> active position{filteredJobs.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="space-y-5">
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                No Matching Openings Found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We do not have open roles matching your current search criteria. You are welcome to submit an open general profile.
              </p>
              <Link
                to="/careers/apply?job=open-general"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Submit General Profile
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isExpanded = expandedJobId === job.id;
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 transition-all p-6 sm:p-7 shadow-sm space-y-5"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          {job.department}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {job.type}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {job.experience}
                        </span>
                      </div>

                      <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                        {job.title}
                      </h2>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleExpand(job.id)}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            <span>Hide Details</span>
                            <ChevronUp className="w-3.5 h-3.5" />
                          </>
                        ) : (
                          <>
                            <span>View Requirements</span>
                            <ChevronDown className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>

                      <Link
                        to={`/careers/apply?job=${job.id}`}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        Apply Now
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {job.description}
                  </p>

                  {/* Expanded Requirements and Responsibilities */}
                  {isExpanded && (
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-xl">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-blue-600" />
                          Key Responsibilities
                        </h4>
                        <ul className="text-xs text-slate-600 space-y-2">
                          {job.responsibilities.map((resp, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5 flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-indigo-600" />
                          Candidate Requirements
                        </h4>
                        <ul className="text-xs text-slate-600 space-y-2">
                          {job.requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                              <span className="leading-relaxed">{req}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* General Application Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-heading font-extrabold text-white">
              Don't see your specific specialization?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              We frequently hire for seasonal technical projects, curriculum advisory, and product implementations. Submit your CV for future technical considerations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/careers/apply?job=open-general"
              className="px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
            >
              Submit General Profile
            </Link>
            <Link
              to="/join/intern"
              className="px-6 py-3 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-sky-200 text-xs font-bold uppercase tracking-wider border border-blue-600 transition-colors"
            >
              Internship Portal
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
