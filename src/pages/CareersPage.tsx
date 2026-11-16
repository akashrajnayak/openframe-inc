import React, { useState } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  Laptop,
  Compass,
  Home,
  Target,
  Award,
  BookOpen,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { CareerOpening } from '../types';

export const CareersPage: React.FC = () => {
  const { navigate } = useRouter();
  const [openings] = useState<CareerOpening[]>(() => storageService.getCareerOpenings());
  const [selectedDept, setSelectedDept] = useState<string>('All');

  const departments = ['All', 'Engineering', 'Education & Training', 'Operations'];

  const activeJobs = openings.filter(j => j.isActive);
  const filteredJobs = activeJobs.filter(
    j => selectedDept === 'All' || j.department === selectedDept
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-blue-950 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/60 text-sky-300 text-xs font-semibold tracking-wider uppercase">
            <Briefcase className="w-3.5 h-3.5" />
            Careers at OpenFrame IT Solutions
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight">
            Build Software. Teach Builders.<br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-indigo-300">
              Innovate for Real Impact.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            At OpenFrame, our engineers and educators build modern cloud software, scalable web platforms, and transformative digital learning systems across Bengaluru, Hyderabad, and Pune.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/careers/jobs"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Explore Open Positions ({activeJobs.length})
            </Link>
            <Link
              to="/careers/apply?job=open-general"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-colors flex items-center gap-2"
            >
              Direct Application Form
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Corporate Compliance Note */}
          <div className="pt-6">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 max-w-xl mx-auto">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>
                Verified corporate recruitment: All openings and evaluation criteria are officially approved by OpenFrame executive management. No placement or application fees are charged.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* SECTION 1: WHY WORK WITH OPENFRAME */}
        <section className="space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Our Value Proposition
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              Why Build Your Career at OpenFrame?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We bridge production-grade enterprise software development with mission-driven education and skill development across India.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Laptop className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Modern Software Standards
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Work with TypeScript, React, Node.js microservices, PostgreSQL relational schemas, Docker containers, and automated CI/CD pipelines. No legacy bloat.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Strict code review & design patterns</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Test-driven development & documentation</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Dual Tech & Education Impact
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every team member has the opportunity to mentor learners, develop curriculum modules, and influence practical technology training for thousands of students.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Teach & mentor junior coding cohorts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Shape digital literacy in rural communities</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:border-blue-300 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                Meritocracy & Direct Ownership
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We reward architectural clarity, velocity, and craftsmanship. Your contributions directly shape proprietary platforms like StudyNotePro and CoreERP.
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Flat engineering communication</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Continuous technical advancement</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 2: WORK CULTURE */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Company Ethos
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
              The OpenFrame Work Culture
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our cultural principles are rooted in engineering discipline, honest accountability, and continuous intellectual curiosity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h4 className="font-heading font-bold text-slate-900 text-sm">
                Sustainable Sprint Rhythm
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Structured two-week sprint cadences, realistic delivery commitments, and deep respect for personal rest and work-life balance.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h4 className="font-heading font-bold text-slate-900 text-sm">
                Radical Candor & Feedback
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Blameless post-mortems, transparent pull request discussions, and clear peer performance appraisals without corporate politics.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h4 className="font-heading font-bold text-slate-900 text-sm">
                Dedicated Innovation Time
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Allocated sprint hours to experiment with new developer tools, open-source libraries, and internal tooling automations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                04
              </div>
              <h4 className="font-heading font-bold text-slate-900 text-sm">
                Open Knowledge Sharing
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bi-weekly internal tech talks, architectural white-boarding sessions, and co-authoring tech articles for the OpenFrame Blog.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: 4 OPPORTUNITY STREAMS */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Multiple Engagement Pathways
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              Opportunities Tailored to Your Career Stage
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Whether you are an experienced software engineer, a college student, an academic specialist, or a remote contributor, find your pathway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stream 1 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                  Full-Time & Hybrid
                </div>
                <h3 className="text-base font-heading font-bold text-slate-900">
                  Core Engineering & Operations
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Permanent corporate roles in Bengaluru, Hyderabad, and Pune across full-stack engineering, cloud infrastructure, and technical management.
                </p>
              </div>
              <Link
                to="/careers/jobs"
                className="pt-2 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 group"
              >
                <span>View Full-Time Openings</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Stream 2 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-sky-400 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
                  Student & Graduate
                </div>
                <h3 className="text-base font-heading font-bold text-slate-900">
                  Technical Internships
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Structured 2 to 6-month practicums for engineering, BCA, MCA, and design students to build real features with senior developer code reviews.
                </p>
              </div>
              <Link
                to="/join/intern"
                className="pt-2 text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1.5 group"
              >
                <span>Internship Registration</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Stream 3 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-indigo-400 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Community & Education
                </div>
                <h3 className="text-base font-heading font-bold text-slate-900">
                  Field & Campus Outreach
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  On-ground academic coordinators, campus lab trainers, school relationship managers, and grassroots digital literacy mission officers.
                </p>
              </div>
              <Link
                to="/work-with-us"
                className="pt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 group"
              >
                <span>Explore Field Roles</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Stream 4 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-teal-400 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-teal-600">
                  Remote & Flexible
                </div>
                <h3 className="text-base font-heading font-bold text-slate-900">
                  Work-From-Home & Advisory
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Senior consulting advisory, guest faculty lecturing, remote contract software development, and technical curriculum content authors.
                </p>
              </div>
              <Link
                to="/join/professional"
                className="pt-2 text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1.5 group"
              >
                <span>Professional Network</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* SECTION 4: CURRENT OPENINGS SHOWCASE */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Official Vacancies
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
                Current Openings
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Displaying {filteredJobs.length} active position{filteredJobs.length !== 1 ? 's' : ''} approved by corporate administration.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {departments.map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setSelectedDept(dept)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedDept === dept
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-white p-10 text-center rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-500">No active positions in this department at present.</p>
                <Link to="/careers/apply?job=open-general" className="text-xs font-bold text-blue-600 mt-2 inline-block underline">
                  Submit an open profile for future considerations
                </Link>
              </div>
            ) : (
              filteredJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-500">
                      <span className="text-blue-700 font-bold">{job.department}</span>
                      <span>·</span>
                      <span className="text-slate-700">{job.type}</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium">{job.experience}</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900">
                      {job.title}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      to="/careers/jobs"
                      className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/careers/apply?job=${job.id}`}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center pt-2">
            <Link
              to="/careers/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs uppercase tracking-wider border border-slate-300 transition-colors shadow-xs"
            >
              <span>Explore All Verified Openings & Requirements</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </Link>
          </div>
        </section>

        {/* SECTION 5: OPPORTUNITY PORTALS DIRECTORY */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Registration Hub
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Dedicated Registration Gateways
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every collaborative role has its own dedicated application portal. Select the right channel to submit your credentials:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/careers/apply"
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400/50 hover:bg-white/10 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-sky-300">
                <Briefcase className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="font-heading font-bold text-white text-sm">Job Application Form</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct employment form for active engineering, operations, and management positions.
              </p>
            </Link>

            <Link
              to="/join/intern"
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400/50 hover:bg-white/10 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-sky-300">
                <GraduationCap className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="font-heading font-bold text-white text-sm">Internship Registration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                For current college and university students seeking guided software development internships.
              </p>
            </Link>

            <Link
              to="/join/professional"
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400/50 hover:bg-white/10 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-sky-300">
                <Users className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="font-heading font-bold text-white text-sm">Professional & Advisor Network</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Register as an enterprise systems architect, guest faculty, or technical advisory consultant.
              </p>
            </Link>

            <Link
              to="/join/student"
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400/50 hover:bg-white/10 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-sky-300">
                <BookOpen className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="font-heading font-bold text-white text-sm">Student Course Enrollment</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enroll for OpenFrame academic coaching, programming courses, and digital literacy training.
              </p>
            </Link>

            <Link
              to="/join/teacher"
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400/50 hover:bg-white/10 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-sky-300">
                <Award className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="font-heading font-bold text-white text-sm">Faculty & Teacher Registration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Join our teaching faculty for live online lectures, campus labs, or weekend masterclasses.
              </p>
            </Link>

            <Link
              to="/work-with-us"
              className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-sky-400/50 hover:bg-white/10 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between text-sky-300">
                <Sparkles className="w-5 h-5" />
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <h4 className="font-heading font-bold text-white text-sm">Work With Us & Partnerships</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Institutional collaborations for schools, colleges, NGOs, and enterprise technology clients.
              </p>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};
