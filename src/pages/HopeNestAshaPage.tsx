import React from 'react';
import { Link } from '../router/RouterContext';
import { HopeNestSubNav } from '../components/hopenest/HopeNestSubNav';
import {
  Sparkles,
  Scissors,
  Package,
  Store,
  Smartphone,
  FileCheck2,
  Landmark,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Users,
  Heart,
  HelpCircle
} from 'lucide-react';

export const HopeNestAshaPage: React.FC = () => {
  const modules = [
    {
      number: '01',
      title: 'Sewing, Tailoring & Garment Making',
      desc: 'Hands-on training from fundamentals of machine operation to commercial garment production.',
      icon: Scissors,
      topics: [
        'Pedal and motorized sewing machine maintenance and threading',
        'Fabric measurement, body dimensional charting, and paper pattern drafting',
        'Stitching basic cotton kurtis, children wear, blouses, and alteration skills',
        'Production of reusable fabric shopping bags and home textiles for local retail'
      ]
    },
    {
      number: '02',
      title: 'Home Product Crafting & Artisanal Goods',
      desc: 'Formulation and sanitary packaging of high-turnover household FMCG products.',
      icon: Package,
      topics: [
        'Non-toxic bio-enzyme floor cleaners and surface detergents',
        'Handmade cold-process soap bars and natural herbal bath powders',
        'Clean paraffin and beeswax decorative candles',
        'Hygienic batch packaging, label preparation, and batch dating'
      ]
    },
    {
      number: '03',
      title: 'Retail, Shopkeeper & Micro-Business Skills',
      desc: 'Foundational commercial literacy to manage a home kiosk, corner stall, or tailoring counter.',
      icon: Store,
      topics: [
        'Daily cash book maintenance, cost calculating, and unit profit margin analysis',
        'Inventory stock registers and raw material purchase planning',
        'Customer greeting, price negotiation, and dispute handling',
        'Visual merchandise presentation for small counters and pop-up stalls'
      ]
    },
    {
      number: '04',
      title: 'Online Selling & Digital Payment Operations',
      desc: 'Utilizing everyday smartphones to take orders, receive UPI payments, and market locally.',
      icon: Smartphone,
      topics: [
        'Setting up Google Pay, PhonePe, and Paytm merchant soundboxes / QR codes',
        'WhatsApp Business app setup: creating digital catalogues and auto-greetings',
        'Smartphone product photography with clean lighting and background composition',
        'Customer order tracking and regional courier / parcel delivery basics'
      ]
    },
    {
      number: '05',
      title: 'Udyam Registration & Legal Enterprise Identity',
      desc: 'Demystifying official MSME registration so women gain formal recognition as business owners.',
      icon: FileCheck2,
      topics: [
        'Guided voluntary registration on the official Government of India Udyam portal',
        'Understanding zero-cost Aadhaar-linked MSME certification without middleman fees',
        'Opening dedicated current or business bank accounts for enterprise income',
        'Preservation of statutory digital receipts and registration documents'
      ]
    },
    {
      number: '06',
      title: 'Government Scheme Guidance & Credit Literacy',
      desc: 'Impartial information on legitimate government micro-credit schemes and application steps.',
      icon: Landmark,
      topics: [
        'Pradhan Mantri Mudra Yojana (PMMY) categories: Shishu (up to ₹50,000), Kishor, and Tarun',
        'Stand-Up India and State Self-Help Group (SHG) revolving fund frameworks',
        'Realistic bank document checklists: KYC, address proofs, and quotation invoices',
        'Recognizing fraudulent agents, unauthorized fee demands, and predatory loan apps'
      ]
    }
  ];

  const stepsToEnrol = [
    {
      step: '1',
      title: 'Community Application',
      desc: 'Submit beneficiary details online or visit an active HopeNest community workshop center.'
    },
    {
      step: '2',
      title: 'Skills Readiness Dialogue',
      desc: 'An informal chat with our women mentors to understand your schedule, interests, and home constraints.'
    },
    {
      step: '3',
      title: 'Hands-on Workshop Cohort',
      desc: 'Join a 4-to-6 week cohort with practical equipment, raw material kits, and patient peer mentoring.'
    },
    {
      step: '4',
      title: 'Micro-Enterprise Launch',
      desc: 'Set up your Udyam profile, generate your UPI QR code, and receive ongoing peer guidance.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HopeNestSubNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#021f24] via-[#053138] to-[#09424a] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-teal-800 relative">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-400/10 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Flagship Women Empowerment Initiative
          </div>

          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
              ASHA Welfare Programme
            </h1>
            <p className="text-base sm:text-lg text-teal-100 font-medium">
              Advancement & Skill-building for Holistic Autonomy: Equipping undereducated women with self-reliant trade skills, retail know-how, and digital enterprise literacy.
            </p>
            <p className="text-xs sm:text-sm text-teal-200/80 leading-relaxed max-w-2xl">
              Too often, undereducated women and female household heads are excluded from modern economic growth due to lack of practical vocational skills and digital confidence. The ASHA programme provides structured, hands-on guidance so every woman can foster dignity and household self-reliance.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/hopenest/participate?prog=asha"
              className="px-6 py-3 rounded-lg bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all duration-150 shadow-md inline-flex items-center gap-2"
            >
              <span>Enrol Beneficiary In ASHA</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/hopenest/volunteer?area=asha"
              className="px-5 py-3 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-teal-200 hover:text-white border border-teal-700/50 font-semibold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <span>Volunteer as Skill Trainer</span>
            </Link>
          </div>
        </div>
      </section>

      {/* MANDATORY STATUTORY DISCLAIMER / ADVISORY BANNER */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-teal-300 shadow-md space-y-3">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Important Advisory & Transparency Notice</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="text-slate-900 font-semibold">HopeNest Global Foundation</strong> provides foundational skill training, entrepreneurship guidance, and information on government-supported schemes. <span className="font-semibold text-slate-900">We do NOT guarantee loan sanctioning, government grants, or fixed employment.</span> Loan sanctions, credit limits, and welfare disbursements remain at the sole discretion of respective public/private banks, lending institutions, and government bodies based on their statutory eligibility evaluations. HopeNest does not collect any commission or liaison fees for scheme applications.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* 6 Comprehensive Modules */}
        <div className="space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Curriculum & Practical Training</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
              Six Comprehensive Training Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Engineered specifically for women with limited formal schooling, focusing on tangible physical practice and simple pictorial guides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((mod, idx) => {
              const Icon = mod.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-teal-400 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-mono font-bold text-slate-300">
                        {mod.number}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading font-bold text-base text-slate-900">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {mod.desc}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-semibold text-slate-700">What Participants Learn:</div>
                      <ul className="text-xs text-slate-600 space-y-1.5">
                        {mod.topics.map((t, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* How The ASHA Enrolment Flow Works */}
        <section className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-800 space-y-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">Step-by-Step Pathway</span>
            <h3 className="text-2xl font-heading font-bold text-white mt-1">
              How Beneficiaries Journey Through ASHA
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Designed with flexibility and respect for domestic duties, workshops take place in safe, welcoming neighborhood centers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stepsToEnrol.map((step, idx) => (
              <div key={idx} className="bg-slate-800/70 p-5 rounded-xl border border-slate-700 space-y-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 flex items-center justify-center font-mono font-bold text-xs">
                  {step.step}
                </div>
                <h4 className="font-heading font-bold text-white text-sm">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <div className="text-xs text-slate-400">
              Training cohorts are organized in localized batches of 15 to 25 women to ensure close individual guidance.
            </div>
            <Link
              to="/hopenest/participate?prog=asha"
              className="px-5 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
            >
              Sign Up or Recommend a Beneficiary
            </Link>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="space-y-6">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Clarifications</span>
            <h2 className="text-2xl font-heading font-bold text-slate-900 mt-1">
              Frequently Asked Questions About ASHA
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                Is there any fee to join the ASHA Programme?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Foundational workshops, basic material practice kits, and digital literacy drills provided by HopeNest are free of charge for eligible women from low-income households.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                Can women with no schooling participate?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Yes. The programme is intentionally designed for individuals with limited or no formal education. Visual symbols, voice notes, practical hands-on demonstrations, and regional language instruction are used throughout.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                Does HopeNest sanction Mudra or business loans directly?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                No. HopeNest is a non-profit foundation, not a bank or non-banking financial company (NBFC). We provide unbiased informational guidance on scheme requirements and assist participants in compiling paperwork for bank presentations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-600" />
                How can local women's Self-Help Groups (SHGs) connect?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                SHG leaders and community organizers can submit an application via our Beneficiary Sign-Up portal or contact our outreach desk to schedule a localized workshop batch.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
