import React from 'react';
import { Link } from '../router/RouterContext';
import { HopeNestSubNav } from '../components/hopenest/HopeNestSubNav';
import {
  ShieldAlert,
  Sparkles,
  BookOpen,
  GraduationCap,
  Laptop,
  Wrench,
  Heart,
  Activity,
  Brain,
  TreePine,
  ArrowRight,
  PawPrint,
  Users,
  Compass,
  Building,
  Mail,
  MapPin,
  FileCheck2,
  Phone,
  CheckCircle2
} from 'lucide-react';

export const HopeNestPage: React.FC = () => {
  const corePillars = [
    {
      title: 'Women & Livelihood Autonomy',
      desc: 'Market-viable vocational craft, tailoring, micro-trade bookkeeping, and independent household earning skills.',
      icon: Sparkles,
      link: '/hopenest/asha-welfare-programme',
      badge: 'Flagship ASHA Initiative'
    },
    {
      title: 'Digital & Foundational Literacy',
      desc: 'Demystifying computers, smartphone e-governance tools, and safe cyber transactions for first-generation users.',
      icon: Laptop,
      link: '/hopenest/programmes'
    },
    {
      title: 'Academic Bridging & Student Aid',
      desc: 'Remedial coaching, learning materials, and targeted merit-cum-need fee assistance for vulnerable school students.',
      icon: GraduationCap,
      link: '/hopenest/programmes'
    },
    {
      title: 'Health, Wellbeing & Compassion',
      desc: 'Preventive health screening camps, mental wellbeing dialogues, and community animal welfare hydration drives.',
      icon: Heart,
      link: '/hopenest/programmes'
    }
  ];

  const legalSafeguards = [
    'Autonomous Section 8 Non-Profit Corporation registered under the Companies Act.',
    'Independent Board of Directors and autonomous institutional governance.',
    'Collaboration with OpenFrame IT Solutions is strictly institutional, technical, advisory, and educational.',
    'Zero commercial intermediaries or broker status; operated as a genuine grassroots foundation.',
    'No government funding or department affiliation; fully compliant non-profit entity.'
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HopeNestSubNav />

      {/* Hero Banner inspired by the executive navy design */}
      <section className="bg-gradient-to-b from-[#021f24] via-[#042d33] to-[#083b42] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-teal-800/60 relative overflow-hidden">
        {/* Subtle geometric background accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/30 text-teal-300 text-xs font-semibold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Autonomous Section 8 Non-Profit Organization
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
              HopeNest Global Foundation
            </h1>
            <p className="text-base sm:text-lg text-teal-100 font-medium">
              Empowering communities through practical skill development, inclusive digital literacy, women's self-reliance, and humanitarian welfare.
            </p>
            <p className="text-xs sm:text-sm text-teal-200/80 leading-relaxed max-w-2xl">
              HopeNest Global Foundation is established to create sustainable socio-economic upliftment across grassroots communities, providing learners, women, and marginalized households with actionable tools to thrive.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/hopenest/asha-welfare-programme"
              className="px-5 py-2.5 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-lg hover:shadow-teal-500/20 inline-flex items-center gap-2"
            >
              <span>Explore ASHA Programme</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/hopenest/programmes"
              className="px-5 py-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-teal-200 hover:text-white border border-teal-700/50 font-semibold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <span>View All 10 Programmes</span>
            </Link>
            <Link
              to="/hopenest/volunteer"
              className="px-5 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-semibold text-xs uppercase tracking-wider transition-colors border border-white/20"
            >
              <span>Volunteer With Us</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 1. MANDATORY LEGAL IDENTITY & INSTITUTIONAL SEPARATION DISCLOSURE */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-amber-200 shadow-md space-y-4">
          <div className="flex items-center gap-2.5 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Statutory Legal Separation & Governance Disclosure</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-lg sm:text-xl font-heading font-bold text-slate-900">
                Independent Section 8 Not-For-Profit Corporate Entity
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-800 font-semibold">HopeNest Global Foundation</strong> is a completely separate not-for-profit company registered under Section 8 of the Companies Act, 2013 (India). It is <strong className="text-slate-900 font-semibold">NOT</strong> a department, subsidiary, holding division, or branch of OpenFrame IT Solutions Private Limited.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                OpenFrame IT Solutions Private Limited is a registered private commercial IT enterprise. Both entities maintain independent board governance, separate accounting, autonomous statutory registrations, and distinct legal liabilities.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Where OpenFrame IT Solutions collaborates with HopeNest Global Foundation, such cooperation is strictly limited to technical advisory, educational curriculum design, voluntary software assistance, and institutional knowledge sharing.
              </p>
            </div>

            <div className="bg-amber-50/70 rounded-xl p-4 sm:p-5 border border-amber-200/80 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Statutory Governance Principles
              </span>
              <ul className="text-xs text-amber-950 space-y-2">
                {legalSafeguards.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VISION & MISSION */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-teal-400 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-6">
              <Compass className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Our North Star</span>
            <h3 className="text-2xl font-heading font-bold text-slate-900 mt-1 mb-3">
              Foundation Vision
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To build a compassionate, inclusive society where every individual—regardless of economic standing, educational background, or geographical location—has access to practical skills, digital literacy, self-reliant livelihood avenues, and dignity of life.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group hover:border-teal-400 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-6">
              <Building className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Our Ground Work</span>
            <h3 className="text-2xl font-heading font-bold text-slate-900 mt-1 mb-3">
              Foundation Mission
            </h3>
            <ul className="text-xs sm:text-sm text-slate-600 space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Deliver grassroots vocational training to undereducated women and marginalized youth.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Demystify basic digital technology, smartphone utilities, and safe digital financial transactions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Facilitate remedial academic coaching and educational aid for deserving students from low-income households.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Conduct community healthcare awareness camps, environmental drives, and compassionate animal welfare.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. FOUR CORE PROGRAMME PILLARS */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Action Framework</span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
                Core Areas of Grassroots Engagement
              </h2>
            </div>
            <Link
              to="/hopenest/programmes"
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 shrink-0"
            >
              <span>Explore all 10 Foundation Programmes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {corePillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    {item.badge && (
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase tracking-wide">
                        {item.badge}
                      </span>
                    )}
                    <h3 className="font-heading font-bold text-base text-slate-900">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <Link
                      to={item.link}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                    >
                      <span>Read Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. QUALITATIVE COMMUNITY IMPACT (NO INVENTED METRICS) */}
        <section className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-800 space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Verifiable Action</span>
            <h3 className="text-2xl font-heading font-bold text-white mt-1">
              Community Impact & Grassroots Approach
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              HopeNest measures progress through direct qualitative transformation in households rather than exaggerated claims. Our team works hand-in-hand with community volunteers, civic bodies, and regional institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/60 space-y-2">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Methodology</span>
              <h4 className="font-heading font-semibold text-white text-sm">
                Hands-on Practicums Over Classroom Lectures
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Workshops emphasize actual machine stitching, physical component crafting, real smartphone drills, and practical mock sales rather than passive listening.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/60 space-y-2">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Independence</span>
              <h4 className="font-heading font-semibold text-white text-sm">
                Self-Reliance Without Dependency
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                By imparting accounting, digital bookkeeping, and product packaging know-how, beneficiaries are empowered to operate small home businesses independently.
              </p>
            </div>

            <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700/60 space-y-2">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Transparency</span>
              <h4 className="font-heading font-semibold text-white text-sm">
                Clean Non-Profit Integrity
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                We make no false promises of government loan sanctioning or guaranteed job placements. Information on government schemes is provided strictly as verified educational guidance.
              </p>
            </div>
          </div>
        </section>

        {/* 5. ASHA WELFARE PROGRAMME CALLOUT */}
        <section className="bg-gradient-to-r from-teal-50 via-emerald-50 to-blue-50 rounded-2xl p-8 sm:p-10 border border-teal-200 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-200 text-teal-900 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Flagship Initiative
              </div>
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
                ASHA Welfare Programme: Women Empowerment & Livelihood
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                A dedicated, multi-tier initiative empowering undereducated women with tailoring mastery, home product manufacturing, small shopkeeping skills, online selling, and voluntary Udyam registration assistance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <Link
                to="/hopenest/asha-welfare-programme"
                className="px-6 py-3 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md text-center"
              >
                View Full ASHA Programme
              </Link>
              <Link
                to="/hopenest/participate?prog=asha"
                className="px-6 py-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs uppercase tracking-wider transition-colors text-center"
              >
                Enrol Beneficiary
              </Link>
            </div>
          </div>
        </section>

        {/* 6. FOUNDATION SECRETARIAT & CONTACT INFORMATION */}
        <section className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Institutional Contact</span>
            <h3 className="text-2xl font-heading font-bold text-slate-900 mt-1">
              HopeNest Secretariat & Community Helpdesk
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              For volunteer applications, community center collaborations, or non-profit inquiries, please reach out to our dedicated foundation desk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase">
                <Building className="w-4 h-4" />
                <span>Registered Entity</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">HopeNest Global Foundation</p>
              <p className="text-xs text-slate-600">
                Section 8 Non-Profit Corporation (Incorporated in Karnataka, India)
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase">
                <MapPin className="w-4 h-4" />
                <span>Secretariat Office</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">Community Outreach Wing</p>
              <p className="text-xs text-slate-600">
                Outer Ring Road Tech & Education Hub, Bengaluru, Karnataka, 560103
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase">
                <Mail className="w-4 h-4" />
                <span>Foundation Desk</span>
              </div>
              <p className="text-xs font-semibold text-slate-900">Email: foundation@hopenest.org</p>
              <p className="text-xs text-slate-600">
                Helpdesk: +91 (080) 4123-8915 (Mon - Sat, 10 AM - 5 PM IST)
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
