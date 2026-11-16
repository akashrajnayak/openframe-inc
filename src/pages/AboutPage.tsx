import React, { useState } from 'react';
import { Link } from '../router/RouterContext';
import {
  Building2,
  Calendar,
  FileCheck2,
  Award,
  Globe2,
  Cpu,
  GraduationCap,
  Layers,
  Lightbulb,
  Smartphone,
  BookOpen,
  Settings2,
  Compass,
  ArrowRight,
  CheckCircle2,
  User,
  Users,
  ShieldCheck,
  Eye,
  Target,
  Rocket,
  Code2,
  Briefcase,
  ExternalLink,
  X,
  FileText,
  BadgeCheck,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  // Certificate Modal State
  const [activeCert, setActiveCert] = useState<{
    title: string;
    authority: string;
    refNumber: string;
    date: string;
    description: string;
    scope: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* ========================================================= */}
      {/* 1. HERO & COMPANY INTRODUCTION                            */}
      {/* ========================================================= */}
      <section className="relative bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-blue-950 overflow-hidden">
        {/* Subtle geometric pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38BDF8 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative max-w-6xl mx-auto space-y-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700/50 text-sky-300 text-xs font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              Corporate Profile & Statutory Information
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
              About OpenFrame IT Solutions
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed text-pretty">
              OpenFrame IT Solutions Private Limited is a registered Indian technology and education company operating under disciplined engineering and pedagogy standards. We architect scalable enterprise software solutions and deliver practical, industry-aligned skill development.
            </p>
          </div>

          {/* Official Statutory Dossier Card */}
          <div className="bg-[#0B1E3F]/90 backdrop-blur-md rounded-2xl border border-blue-800/60 p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-blue-900/60 gap-4">
              <div>
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest">
                  Statutory Identification
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-white mt-0.5">
                  OpenFrame IT Solutions Private Limited
                </h2>
                <div className="text-xs text-slate-300 mt-1">
                  Tagline: <span className="text-sky-300 font-semibold">"Technology | Education | Innovation"</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs font-semibold">
                  <BadgeCheck className="w-4 h-4 text-emerald-400" />
                  <span>DPIIT Recognized Startup</span>
                </span>
              </div>
            </div>

            {/* Statutory Parameters Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-6 text-xs">
              <div className="space-y-1 p-3 rounded-lg bg-[#071326]/60 border border-blue-900/40">
                <span className="text-slate-400 block text-[11px] font-medium">Incorporation Date</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" />
                  25 October 2023
                </span>
              </div>

              <div className="space-y-1 p-3 rounded-lg bg-[#071326]/60 border border-blue-900/40">
                <span className="text-slate-400 block text-[11px] font-medium">Corporate ID (CIN)</span>
                <span className="text-sky-300 font-mono font-semibold tracking-tight text-[11px] break-all">
                  U62099KA2023PTC180260
                </span>
              </div>

              <div className="space-y-1 p-3 rounded-lg bg-[#071326]/60 border border-blue-900/40">
                <span className="text-slate-400 block text-[11px] font-medium">Company Structure</span>
                <span className="text-white font-semibold">Private Limited</span>
              </div>

              <div className="space-y-1 p-3 rounded-lg bg-[#071326]/60 border border-blue-900/40">
                <span className="text-slate-400 block text-[11px] font-medium">Registered State</span>
                <span className="text-white font-semibold flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                  Karnataka, India
                </span>
              </div>

              <div className="space-y-1 p-3 rounded-lg bg-[#071326]/60 border border-blue-900/40">
                <span className="text-slate-400 block text-[11px] font-medium">Startup India</span>
                <span className="text-white font-semibold">DPIIT Recognized</span>
              </div>

              <div className="space-y-1 p-3 rounded-lg bg-[#071326]/60 border border-blue-900/40">
                <span className="text-slate-400 block text-[11px] font-medium">Core Industry</span>
                <span className="text-white font-semibold">IT, Software & EdTech</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400 leading-relaxed">
              <div>
                <strong>Statutory Disclosure:</strong> OpenFrame IT Solutions Private Limited is duly incorporated under the Companies Act, 2013 (Ministry of Corporate Affairs, Government of India) and operates in accordance with standard statutory corporate governance norms.
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  to="/documents"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Public Documents</span>
                </Link>
                <Link
                  to="/verification-checklist"
                  className="px-3 py-1.5 rounded-lg bg-[#071326] hover:bg-blue-950 border border-blue-800/80 text-sky-300 font-semibold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Corporate Checklist</span>
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 2 & 3. VISION & MISSION                                    */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* OUR VISION */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#0B1930] to-[#0F2042] text-white rounded-2xl p-8 sm:p-10 shadow-xl border border-blue-900/60 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-900/60 text-sky-300 text-xs font-semibold uppercase tracking-wider mb-6">
                <Eye className="w-4 h-4 text-sky-400" />
                <span>Our Vision</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white leading-tight">
                Empowering Minds, Advancing Systems
              </h2>

              <blockquote className="mt-6 p-5 rounded-xl bg-[#071326]/80 border border-blue-800/40 text-base sm:text-lg text-slate-200 font-medium leading-relaxed italic">
                "To empower individuals, businesses and institutions through innovative technology, accessible education and practical digital solutions."
              </blockquote>

              <p className="mt-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
                We envision a technology ecosystem where enterprise-grade software quality and accessible, practical computing education converge—enabling both organizations and ambitious professionals to build sustainable digital capability.
              </p>
            </div>

            <div className="pt-6 border-t border-blue-900/60 flex items-center justify-between text-xs text-slate-400">
              <span>Future-Facing Technology</span>
              <span>Practical Pedagogy</span>
            </div>
          </div>

          {/* OUR MISSION */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 sm:p-10 border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider mb-4">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Our Mission</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
                Action-Oriented Commitments
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Our operations are guided by six defined organizational commitments:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 text-xs sm:text-sm">
                      Innovative Software Solutions
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Develop innovative software and technology solutions engineered for resilience and maintainability.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 text-xs sm:text-sm">
                      Accessible Quality Education
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Make high-standard technical education accessible through structured curricula and sandbox labs.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 text-xs sm:text-sm">
                      Digital Literacy & Skills
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Promote digital literacy and skill development across students and working software professionals.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 text-xs sm:text-sm">
                      Scalable Digital Platforms
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Build scalable digital platforms that solve operational bottlenecks for modern organizations.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    5
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 text-xs sm:text-sm">
                      Support for Institutions
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Support businesses and educational institutions with dedicated technical guidance and laboratory tools.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    6
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-slate-900 text-xs sm:text-sm">
                      Innovation & Entrepreneurship
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      Encourage technological innovation and entrepreneurship through practical project mentorship.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Established under Companies Act, 2013</span>
              <span className="font-medium text-blue-600">6 Strategic Pillars</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. WHAT WE DO (6 Professional Service Cards)              */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Capabilities</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
              What We Do
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              End-to-end technology solutions, custom software engineering, and industry-oriented educational curricula.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-lg">
                  IT & Software Development
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Architecting and developing custom business software, distributed backend architectures, microservices, and database systems engineered for production resilience.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span>Microservices & REST/GraphQL APIs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    <span>Relational Data Modeling & PostgreSQL</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100">
                <Link to="/it-solutions" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <span>Explore Software Solutions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-lg">
                  Web & Mobile App Development
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Engineering fluid, responsive web applications and cross-platform mobile experiences utilizing React, React Native, TypeScript, and modern state architectures.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                    <span>Progressive Web Applications (PWA)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                    <span>Cross-Platform iOS & Android Deployments</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100">
                <Link to="/it-solutions" className="text-xs font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1">
                  <span>View Mobile & Web Specs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-lg">
                  Digital Education Platforms
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Deploying modular learning management portals, interactive programming sandboxes, faculty analytics cockpits, and student gradebook infrastructures.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>OpenFrame EduLMS Suite</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>Automated Code Evaluation Engines</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100">
                <Link to="/products" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  <span>Discover EduLMS Platform</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-lg">
                  Skill Development & Certification
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Rigorous, practicum-oriented training programs in full-stack software development, cloud computing, and DevOps engineering designed for industry readiness.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    <span>Enterprise Software Fellowships</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    <span>Simulated Agile Sprint Cycles</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100">
                <Link to="/education" className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1">
                  <span>Explore Certifications</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Settings2 className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-lg">
                  Business Automation Solutions
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Streamlining operational bottlenecks through automated document dispatch, workflow approval routing, resource planning (ERP), and multi-channel system integrations.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>OpenFrame CoreERP & CollabFlow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span>Automated Invoicing & Warehouse Sync</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100">
                <Link to="/products" className="text-xs font-semibold text-amber-600 hover:text-amber-800 flex items-center gap-1">
                  <span>Explore ERP Suites</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 6 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <Compass className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-slate-900 text-lg">
                  Technology Consulting
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Independent architectural evaluation, technical due diligence, legacy codebase modernization roadmaps, and cloud infrastructure cost optimization.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Architecture Audits & Threat Modeling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>Cloud Migration Feasibility Dossiers</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-100">
                <Link to="/contact" className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                  <span>Schedule Consultation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. OUR BUSINESS DIVISIONS                                 */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Organizational Structure</span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
            Our Business Divisions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Structured operational divisions delivering dedicated focus across software delivery, education, digital platforms, and technical innovation.
          </p>
        </div>

        <div className="space-y-8">
          
          {/* Division A: OpenFrame IT Solutions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Division A</span>
              </div>
              <h3 className="text-2xl font-heading font-bold text-slate-900">
                OpenFrame IT Solutions
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The commercial software engineering arm of OpenFrame. Focused on designing, engineering, and deploying custom software systems, scalable microservice architectures, and enterprise cloud migrations for commercial businesses across India.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Enterprise Software Engineering</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Cloud DevOps & Observability</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Cross-Platform Web & Mobile</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Independent Architecture Reviews</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Focus</span>
              <div className="text-sm font-bold text-slate-900">Enterprise Commercial Delivery</div>
              <p className="text-xs text-slate-600">
                Bespoke development contracts, dedicated agile engineering squads, and continuous support.
              </p>
              <Link to="/it-solutions" className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors">
                <span>View IT Capabilities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Division B: OpenFrame Education */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>Division B</span>
              </div>
              <h3 className="text-2xl font-heading font-bold text-slate-900">
                OpenFrame Education
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Dedicated to bridging the gap between theoretical computing degrees and real software engineering practices. We conduct intensive professional fellowships, corporate talent development programs, and partner directly with academic institutions for on-campus laboratory enablement.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Enterprise Full-Stack Fellowships</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Cloud & DevOps Masterclasses</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>University Laboratory Setup & Tooling</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  <span>Faculty Professional Development</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Focus</span>
              <div className="text-sm font-bold text-slate-900">Practical Computing Pedagogy</div>
              <p className="text-xs text-slate-600">
                Hands-on sandboxes, actual pull request code reviews, and industry-standard tooling.
              </p>
              <Link to="/education" className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors">
                <span>View Education Curricula</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Division C: Digital Products & Platforms */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
                <Layers className="w-4 h-4" />
                <span>Division C</span>
              </div>
              <h3 className="text-2xl font-heading font-bold text-slate-900">
                Digital Products & Platforms
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The product innovation division responsible for architecting and maintaining OpenFrame's proprietary platform suites, including OpenFrame CoreERP for resource management, OpenFrame EduLMS for academic coursework, and CloudPulse systems monitor.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>OpenFrame CoreERP (Modular Enterprise Suite)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>OpenFrame EduLMS (Academic Learning Portal)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>OpenFrame CloudPulse (Telemetry & Uptime)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>OpenFrame CollabFlow (Task & Document Dispatch)</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Focus</span>
              <div className="text-sm font-bold text-slate-900">Proprietary Software Suites</div>
              <p className="text-xs text-slate-600">
                Self-hosted or managed deployments ensuring complete customer data sovereignty.
              </p>
              <Link to="/products" className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors">
                <span>View Products Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Division D: Technology Innovation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider">
                <Lightbulb className="w-4 h-4" />
                <span>Division D</span>
              </div>
              <h3 className="text-2xl font-heading font-bold text-slate-900">
                Technology Innovation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                The research and applied technology division exploring modern distributed system patterns, developer experience tooling, automated software verification, and high-efficiency algorithmic models.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Distributed Consensus & Data Caching Research</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Developer Sandbox Containerization</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Automated Code Quality Verification Gates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Open Engineering Standards Exploration</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 bg-slate-50 p-6 rounded-xl border border-slate-200 text-center space-y-3">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Focus</span>
              <div className="text-sm font-bold text-slate-900">Applied Engineering Research</div>
              <p className="text-xs text-slate-600">
                Internal technology incubation feeding back into OpenFrame products and curricula.
              </p>
              <Link to="/blog" className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition-colors">
                <span>Read Research Insights</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>


      {/* ========================================================= */}
      {/* 7. COMPANY RECOGNITION (MCA & DPIIT Startup India)        */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Statutory Accreditation</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
              Company Recognition
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Official statutory credentials registered with Indian regulatory and startup development authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            
            {/* Recognition 1: Ministry of Corporate Affairs */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="p-6 sm:p-8 space-y-4">
                
                {/* Certificate Placeholder Visual Frame */}
                <div
                  onClick={() =>
                    setActiveCert({
                      title: 'Certificate of Incorporation',
                      authority: 'Ministry of Corporate Affairs (MCA), Government of India',
                      refNumber: 'U62099KA2023PTC180260',
                      date: '25 October 2023',
                      description: 'Issued by Registrar of Companies, Karnataka under Section 7 of the Companies Act, 2013 and rule 18 of the Companies (Incorporation) Rules, 2014.',
                      scope: 'Private Limited Company incorporated to carry on business in Information Technology, Software Development, Education and Allied Digital Platforms.'
                    })
                  }
                  className="cursor-pointer bg-slate-50 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-xl p-6 text-center space-y-2 group transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-heading font-bold text-slate-900">
                    Certificate of Incorporation
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    CIN: U62099KA2023PTC180260
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold flex items-center justify-center gap-1">
                    <span>Click to View Certificate Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="text-xs font-bold text-slate-900">
                    Ministry of Corporate Affairs (MCA)
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Duly incorporated on <strong>25 October 2023</strong> in Karnataka as a Private Limited Company under the Companies Act, 2013.
                  </p>
                </div>

                <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div><strong>ROC:</strong> Registrar of Companies, Bengaluru, Karnataka</div>
                  <div><strong>Company Category:</strong> Company limited by Shares</div>
                  <div><strong>Registration Status:</strong> Active / In Good Standing</div>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">MCA Verification Standard</span>
                <span className="font-semibold text-blue-600">Verified CIN</span>
              </div>
            </div>

            {/* Recognition 2: DPIIT Startup India Recognition */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div className="p-6 sm:p-8 space-y-4">
                
                {/* Certificate Placeholder Visual Frame */}
                <div
                  onClick={() =>
                    setActiveCert({
                      title: 'Startup India Recognition Certificate',
                      authority: 'Department for Promotion of Industry and Internal Trade (DPIIT), Ministry of Commerce and Industry',
                      refNumber: 'DPIIT Startup India ID: [Official Recognition ID]',
                      date: 'Recognized Entity',
                      description: 'Recognized as an innovative startup working in the Information Technology and Educational Technology domains under the Startup India initiative.',
                      scope: 'Building scalable software solutions, skill development pathways, and indigenous digital learning infrastructure.'
                    })
                  }
                  className="cursor-pointer bg-slate-50 border-2 border-dashed border-emerald-200 hover:border-emerald-400 rounded-xl p-6 text-center space-y-2 group transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-heading font-bold text-slate-900">
                    DPIIT Startup India Recognition
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Govt. of India Initiative
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                    <span>Click to View Recognition Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <div className="text-xs font-bold text-slate-900">
                    Startup India · DPIIT
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Recognized startup by the <strong>Department for Promotion of Industry and Internal Trade</strong>, fostering indigenous digital products and technical talent.
                  </p>
                </div>

                <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div><strong>Initiative:</strong> Startup India Scheme</div>
                  <div><strong>Ministry:</strong> Ministry of Commerce and Industry</div>
                  <div><strong>Focus Domain:</strong> Technology, Software & Skill Development</div>
                </div>
              </div>

              <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">National Startup Initiative</span>
                <span className="font-semibold text-emerald-600">DPIIT Recognized</span>
              </div>
            </div>

          </div>

          <div className="text-center text-xs text-slate-500 max-w-xl mx-auto pt-2">
            * OpenFrame IT Solutions Private Limited maintains transparent records. Additional unverified government claims or third-party endorsements are strictly prohibited under our corporate governance constitution.
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 8. WHY CHOOSE OPENFRAME? (6 Points)                       */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Value Proposition</span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
            Why Choose OpenFrame?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Disciplined software engineering, practical computing pedagogy, and transparent enterprise delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-base">
              1. Technology-Driven Approach
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              We engineer systems utilizing contemporary design patterns, strict TypeScript typing, defensive modularity, and automated verification rather than brittle legacy shortcuts.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-base">
              2. Practical Learning Solutions
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Our educational programs center around live sandbox laboratories, real code reviews, and simulated corporate sprint cycles that build authentic engineering competence.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-base">
              3. Custom Software Development
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Every business problem has distinct operational parameters. We build tailored ERP modules, cloud microservices, and mobile platforms configured to your specific workflows.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-base">
              4. Innovation & Improvement
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              We continually audit and refine our codebase architectures, automated test suites, and curricula to incorporate modern cloud-native standards and developer tools.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-base">
              5. Institutional Collaboration
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              We partner with universities, autonomous institutions, and polytechnics to equip campus laboratories with modern development tools and faculty enablement workshops.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-heading font-bold text-slate-900 text-base">
              6. Customer-Focused Services
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Transparent milestone scoping, proactive communication, zero vendor lock-in, and full customer ownership of codebases and deployment environments.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* 9. CALL TO ACTION                                         */}
      {/* ========================================================= */}
      <section className="py-20 bg-gradient-to-r from-[#071326] via-[#0B1930] to-[#0D234A] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Get In Touch
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
            Let's Build Something Together.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Whether you require enterprise software engineering, campus laboratory enablement, proprietary ERP suites, or custom technological advisory—our team is ready.
          </p>

          {/* 3 Requested Prominent Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/it-solutions"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <span>Explore Our Services</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/work-with-us"
              className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-blue-600/40 text-sky-200 font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
            >
              <span>Partner With Us</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2"
            >
              <span>Contact Our Team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MODAL 1: CERTIFICATE DOSSIER PREVIEW                      */}
      {/* ========================================================= */}
      {activeCert && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-200 text-slate-900">
            <button
              type="button"
              onClick={() => setActiveCert(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              <BadgeCheck className="w-4 h-4 text-blue-600" />
              <span>Official Regulatory Dossier</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900">
              {activeCert.title}
            </h3>

            <div className="mt-4 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Issuing Authority:</span>
                <span className="text-slate-900 font-bold">{activeCert.authority}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block font-medium">Registration / Reference:</span>
                  <span className="text-blue-700 font-mono font-bold">{activeCert.refNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">Issue / Status:</span>
                  <span className="text-slate-900 font-semibold">{activeCert.date}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Statutory Scope:</span>
                <span className="text-slate-700 leading-relaxed block mt-0.5">{activeCert.scope}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Provisions:</span>
                <span className="text-slate-600 leading-relaxed block mt-0.5">{activeCert.description}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4">
              <span>OpenFrame IT Solutions Pvt Ltd</span>
              <button
                type="button"
                onClick={() => setActiveCert(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800"
              >
                Close Certificate View
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
};
