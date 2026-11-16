import React, { useState, useEffect, useRef } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  Globe,
  Code2,
  Smartphone,
  Layers,
  GraduationCap,
  Sparkles,
  ShoppingCart,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Clock,
  Send,
  Building,
  HeartPulse,
  Store,
  Rocket,
  Building2,
  HandHeart,
  Briefcase,
  School,
  ShieldCheck,
  Cpu,
  Database,
  Terminal,
  Server,
  Zap,
  X,
  FileCheck2,
  HelpCircle
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { SoftwareQuotationEnquiry } from '../types';

interface ServiceDetail {
  id: string;
  name: string;
  shortDesc: string;
  fullDesc: string;
  icon: React.ReactNode;
  bulletItems: string[];
  deliverables: string[];
  techStack: string[];
}

export const ItSolutionsPage: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  // Expanded / Selected Service for Detail Modal
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);

  // 8 Specific IT Services Requested
  const services: ServiceDetail[] = [
    {
      id: 'website-development',
      name: 'Website Development',
      shortDesc: 'Modern, high-performance web platforms engineered with responsive layouts, optimal Core Web Vitals, and secure architectures.',
      fullDesc: 'We architect and build bespoke corporate, institutional, and high-conversion web platforms. From dynamic CMS integrations to modular web architectures, our websites combine executive visual presentation with technical speed.',
      icon: <Globe className="w-6 h-6 text-blue-500" />,
      bulletItems: [
        'Corporate websites',
        'Business websites',
        'Educational websites',
        'E-commerce websites',
        'Dynamic websites',
        'Landing pages'
      ],
      deliverables: [
        'Responsive multi-viewport web application',
        'SEO-optimized meta and OpenGraph structures',
        'Performance-tuned bundle architecture (Vite / React)',
        'Content management integration & analytics setup'
      ],
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Node.js', 'Next.js']
    },
    {
      id: 'software-development',
      name: 'Software Development',
      shortDesc: 'Bespoke enterprise software, scalable microservices, and database systems built for operational durability and data integrity.',
      fullDesc: 'Custom business software built to handle high-throughput operations. We design normalized relational data schemas, reliable backend APIs, and distributed worker pipelines tailored to your organizational workflows.',
      icon: <Code2 className="w-6 h-6 text-sky-500" />,
      bulletItems: [
        'Custom business software',
        'Enterprise applications',
        'Management systems',
        'Workflow automation',
        'Database-driven applications'
      ],
      deliverables: [
        'Production-ready enterprise software application',
        'Modular REST / GraphQL API documentation',
        'Relational schema migrations & database indexes',
        'Comprehensive unit & integration test suites'
      ],
      techStack: ['Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'Redis', 'Express']
    },
    {
      id: 'mobile-app-development',
      name: 'Mobile Application Development',
      shortDesc: 'Cross-platform iOS and Android mobile software engineered with native performance and intuitive mobile ergonomics.',
      fullDesc: 'End-to-end mobile engineering from user interaction design to app store delivery. We develop secure, cross-platform mobile solutions supporting offline data synchronization, push notifications, and real-time backend updates.',
      icon: <Smartphone className="w-6 h-6 text-indigo-500" />,
      bulletItems: [
        'Android applications',
        'iOS applications',
        'Cross-platform applications',
        'Educational applications',
        'Business applications'
      ],
      deliverables: [
        'Production compiled iOS & Android application binaries',
        'Offline caching and resilient data synchronization',
        'Secure authentication & biometrics integration',
        'Automated release and over-the-air update pipeline'
      ],
      techStack: ['React Native', 'TypeScript', 'Android SDK', 'iOS Swift', 'SQLite']
    },
    {
      id: 'crm-erp-solutions',
      name: 'CRM & ERP Solutions',
      shortDesc: 'Integrated enterprise resource planning and client management systems designed to automate inventory, billing, and teams.',
      fullDesc: 'Eliminate departmental silos with centralized resource planning software. We implement modular solutions covering lead pipelines, employee attendance, supplier procurement, and granular financial reporting.',
      icon: <Layers className="w-6 h-6 text-amber-500" />,
      bulletItems: [
        'Customer relationship management',
        'Employee management',
        'Sales management',
        'Inventory management',
        'Business reporting'
      ],
      deliverables: [
        'Modular enterprise operations dashboard',
        'Granular role-based access control (RBAC)',
        'Automated invoicing & tax calculation engines',
        'Multi-format audit logs and data export tools'
      ],
      techStack: ['OpenFrame CoreERP', 'PostgreSQL', 'TypeScript', 'Docker', 'Python']
    },
    {
      id: 'education-technology-solutions',
      name: 'Education Technology Solutions',
      shortDesc: 'Digital learning systems, academic examination cockpits, and institutional administrative suites for schools and universities.',
      fullDesc: 'Empowering academic institutions with modern educational technology. We build responsive learning portals, automated grading engines, coding sandboxes, and student lifecycle management architectures.',
      icon: <GraduationCap className="w-6 h-6 text-teal-500" />,
      bulletItems: [
        'Learning Management Systems',
        'School management software',
        'Student management portals',
        'Online examination platforms',
        'Digital certificate management'
      ],
      deliverables: [
        'Customized OpenFrame EduLMS deployment',
        'Automated quiz and assignment assessment module',
        'Student attendance, fee, and gradebook tracking',
        'Tamper-resistant digital certificate generation'
      ],
      techStack: ['OpenFrame EduLMS', 'React', 'Node.js', 'PostgreSQL', 'WebRTC']
    },
    {
      id: 'artificial-intelligence-solutions',
      name: 'Artificial Intelligence Solutions',
      shortDesc: 'Intelligent business automation, specialized conversational agents, and natural language data extraction pipelines.',
      fullDesc: 'Practical, high-utility artificial intelligence embedded into real business workflows. We implement domain-specific assistants, automated customer support triage, and document intelligence pipelines with strict safety controls.',
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
      bulletItems: [
        'AI-powered chatbots',
        'AI assistants',
        'Business automation',
        'Intelligent data processing',
        'AI-powered educational tools'
      ],
      deliverables: [
        'Domain-tuned conversational agent interface',
        'Structured document ingestion & summarization API',
        'Automated customer support routing pipeline',
        'Safety guardrails and audit logging telemetry'
      ],
      techStack: ['Python', 'FastAPI', 'Gemini API', 'Vector Embeddings', 'Node.js']
    },
    {
      id: 'ecommerce-solutions',
      name: 'E-commerce Solutions',
      shortDesc: 'Scalable digital storefronts with seamless payment gateways, live inventory control, and multi-tier customer portals.',
      fullDesc: 'High-conversion commerce architectures engineered for rapid catalog exploration and frictionless checkout. Includes multi-currency payment gateway integrations, automated shipping dispatch, and vendor administration.',
      icon: <ShoppingCart className="w-6 h-6 text-emerald-500" />,
      bulletItems: [
        'Online stores',
        'Product management',
        'Order management',
        'Payment integration',
        'Customer dashboards'
      ],
      deliverables: [
        'High-speed digital product storefront',
        'Secure payment gateway integration (UPI, Cards, NetBanking)',
        'Inventory stock reconciliation & back-office cockpit',
        'Automated order confirmation email and SMS dispatch'
      ],
      techStack: ['React', 'Node.js', 'Stripe / Razorpay API', 'PostgreSQL', 'Redis']
    },
    {
      id: 'digital-transformation',
      name: 'Digital Transformation',
      shortDesc: 'Modernizing legacy paper and spreadsheet systems into automated, secure cloud-native business infrastructure.',
      fullDesc: 'End-to-end modernization for established organizations. We evaluate existing infrastructure, conduct security audits, author phased digital roadmaps, and migrate mission-critical data into high-availability cloud systems.',
      icon: <RefreshCw className="w-6 h-6 text-cyan-500" />,
      bulletItems: [
        'Business process automation',
        'Digital infrastructure',
        'Cloud-based applications',
        'Database management',
        'Technology consulting'
      ],
      deliverables: [
        'Comprehensive digital architecture audit dossier',
        'Phased cloud migration roadmap & timeline',
        'Containerized infrastructure deployment (Docker/K8s)',
        'Zero-downtime database cutover execution'
      ],
      techStack: ['AWS / GCP Cloud', 'Terraform', 'Kubernetes', 'CI/CD Pipelines']
    }
  ];

  // 6-Step Development Process
  const processSteps = [
    {
      step: '01',
      title: 'Understand Client Requirements',
      desc: 'In-depth consultation to map business logic, functional specifications, user personas, and technical constraints.'
    },
    {
      step: '02',
      title: 'Research and Planning',
      desc: 'Authoring architectural blueprints, database schema drafts, technology stack evaluation, and milestone timelines.'
    },
    {
      step: '03',
      title: 'UI/UX Design',
      desc: 'Creating wireframes, interactive design systems, component libraries, and responsive interface workflows.'
    },
    {
      step: '04',
      title: 'Development',
      desc: 'Disciplined sprint-based engineering following clean code standards, strict typing, and daily version-controlled commits.'
    },
    {
      step: '05',
      title: 'Testing and Quality Assurance',
      desc: 'Rigorous automated E2E testing, security vulnerability scans, cross-device verification, and performance load benchmarks.'
    },
    {
      step: '06',
      title: 'Deployment and Support',
      desc: 'Zero-downtime production deployment to cloud VPCs, monitoring setup, comprehensive documentation, and ongoing maintenance.'
    }
  ];

  // Industries We Serve (8 Cards)
  const industries = [
    { name: 'Education', icon: <School className="w-5 h-5 text-blue-600" />, desc: 'Schools, colleges, universities, and EdTech training academies.' },
    { name: 'Healthcare', icon: <HeartPulse className="w-5 h-5 text-red-500" />, desc: 'Clinics, diagnostic centers, health consultancies, and patient records.' },
    { name: 'Retail', icon: <Store className="w-5 h-5 text-amber-600" />, desc: 'Modern retail outlets, e-commerce storefronts, and distributors.' },
    { name: 'Startups', icon: <Rocket className="w-5 h-5 text-purple-600" />, desc: 'Early-stage tech startups building scalable MVPs and digital platforms.' },
    { name: 'Small & Medium Businesses', icon: <Building2 className="w-5 h-5 text-emerald-600" />, desc: 'Growing SMBs modernizing accounting, payroll, and workflow tracking.' },
    { name: 'NGOs and Foundations', icon: <HandHeart className="w-5 h-5 text-teal-600" />, desc: 'Non-profit trusts, social organizations, and charitable foundations.' },
    { name: 'Professional Services', icon: <Briefcase className="w-5 h-5 text-indigo-600" />, desc: 'Law firms, financial consultancies, architectural studios, and agencies.' },
    { name: 'Institutions', icon: <Building className="w-5 h-5 text-slate-700" />, desc: 'Autonomous statutory bodies, research councils, and trade consortia.' }
  ];

  // Software Quotation Enquiry Form State (Section 5)
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    emailAddress: '',
    companyName: '',
    industry: 'Education',
    requiredService: 'Website Development',
    projectDescription: '',
    estimatedBudget: '₹1,50,000 - ₹5,00,000',
    expectedTimeline: '1 - 3 Months',
    city: '',
    state: 'Karnataka',
    preferredContactMethod: 'Email' as 'Email' | 'Mobile Call' | 'WhatsApp',
    consentAccepted: false,
  });

  const [formSubmitted, setFormSubmitted] = useState<SoftwareQuotationEnquiry | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-scroll to form if URL is /inquiry/software
  useEffect(() => {
    if (currentPath === '/inquiry/software' || window.location.hash === '#enquiry-form') {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [currentPath]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.mobileNumber || !formData.emailAddress || !formData.projectDescription) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }

    if (!formData.consentAccepted) {
      setFormError('Please accept the consent checkbox to permit contact regarding this project.');
      return;
    }

    const saved = storageService.saveSoftwareEnquiry({
      fullName: formData.fullName,
      mobileNumber: formData.mobileNumber,
      emailAddress: formData.emailAddress,
      companyName: formData.companyName,
      industry: formData.industry,
      requiredService: formData.requiredService,
      projectDescription: formData.projectDescription,
      estimatedBudget: formData.estimatedBudget,
      expectedTimeline: formData.expectedTimeline,
      city: formData.city || 'Not Specified',
      state: formData.state,
      preferredContactMethod: formData.preferredContactMethod,
      consentAccepted: formData.consentAccepted,
    });

    setFormSubmitted(saved);
    setFormError(null);
  };

  const handleSelectServiceForQuotation = (serviceName: string) => {
    setFormData((prev) => ({ ...prev, requiredService: serviceName }));
    setSelectedService(null);
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <section className="relative bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-blue-950 overflow-hidden">
        {/* Subtle geometric grid backdrop */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38BDF8 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-700/50 text-sky-300 text-xs font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            OpenFrame IT Solutions Private Limited
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold text-white tracking-tight leading-[1.15]">
            Transforming Ideas Into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-200 to-indigo-300">
              Powerful Digital Solutions.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed text-pretty">
            We develop innovative software, websites, mobile applications and intelligent digital platforms that help businesses grow.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <span>Request Software Quotation</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/products"
              className="px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-blue-600/40 text-sky-200 font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
            >
              <span>Explore Pre-Built Products</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 1: OUR IT SERVICES (8 Separate Service Cards)     */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Services</span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
            Our IT & Software Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Comprehensive digital development capabilities engineered with disciplined design, security, and performance standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {svc.icon}
                </div>

                <h3 className="font-heading font-bold text-slate-900 text-lg">
                  {svc.name}
                </h3>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {svc.shortDesc}
                </p>

                {/* Sub-capabilities list */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  {svc.bulletItems.map((item, idx) => (
                    <div key={idx} className="text-xs text-slate-700 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedService(svc)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Explore Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectServiceForQuotation(svc.name)}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                >
                  Get Quote
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: OUR DEVELOPMENT PROCESS (6-Step Process)       */}
      {/* ========================================================= */}
      <section className="py-20 bg-[#0B1930] text-white border-y border-blue-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Methodology</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1">
              Our 6-Step Development Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Structured engineering lifecycles designed for predictability, transparent milestones, and zero architectural ambiguity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processSteps.map((step) => (
              <div
                key={step.step}
                className="bg-[#0F2042] rounded-xl p-6 border border-blue-800/60 hover:border-sky-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-heading font-extrabold text-sky-400">
                      {step.step}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-blue-900/50 px-2 py-0.5 rounded">
                      Phase
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-white text-base">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-blue-900/60 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Documented deliverable milestone</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: INDUSTRIES WE SERVE (8 Cards)                  */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Domain Expertise</span>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
            Industries We Serve
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Tailored software solutions designed for specific sector operational demands, regulatory compliance, and workflow patterns.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((ind, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mb-3">
                {ind.icon}
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-sm">
                {ind.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {ind.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 4: REQUEST A SOFTWARE QUOTATION BANNER             */}
      {/* ========================================================= */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-300">
            Project Scoping
          </span>

          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white">
            Have an Idea? Let's Build It Together.
          </h2>

          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Get an official technical proposal with transparent milestone breakdown, system architecture recommendations, and estimated delivery schedules.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3.5 rounded-xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-black/20 inline-flex items-center gap-2"
            >
              <span>Request a Technical Consultation</span>
              <ArrowRight className="w-4 h-4 text-blue-600" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 5: SOFTWARE ENQUIRY FORM (Complete & Responsive)   */}
      {/* ========================================================= */}
      <div ref={formRef} id="enquiry-form" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm">
          
          <div className="text-center max-w-xl mx-auto mb-8 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Official Project Intake
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900">
              Software Project Enquiry
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Provide project details below to receive a formal quotation and technical consultation from OpenFrame engineers.
            </p>
          </div>

          {formSubmitted ? (
            <div className="p-8 rounded-2xl bg-blue-50 border border-blue-200 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <h3 className="font-heading font-bold text-xl text-slate-900">
                Software Enquiry Registered
              </h3>

              <div className="p-4 rounded-xl bg-white border border-blue-100 text-xs text-slate-700 max-w-md mx-auto space-y-1.5 text-left">
                <div><strong>Enquiry Reference:</strong> <span className="font-mono text-blue-700">{formSubmitted.id}</span></div>
                <div><strong>Client Name:</strong> {formSubmitted.fullName}</div>
                <div><strong>Service:</strong> {formSubmitted.requiredService}</div>
                <div><strong>Industry:</strong> {formSubmitted.industry}</div>
                <div><strong>Budget Range:</strong> {formSubmitted.estimatedBudget}</div>
                <div><strong>Timeline:</strong> {formSubmitted.expectedTimeline}</div>
                <div><strong>Preferred Contact:</strong> {formSubmitted.preferredContactMethod}</div>
              </div>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Thank you for your enquiry with OpenFrame IT Solutions Private Limited. Our solutions architect will review your project description and contact you within 1 business day.
              </p>

              <button
                type="button"
                onClick={() => setFormSubmitted(null)}
                className="mt-2 text-xs font-semibold text-blue-600 underline"
              >
                Submit another project enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              {formError && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                  {formError}
                </div>
              )}

              {/* Row 1: Full Name & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: Email & Company Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={formData.emailAddress}
                    onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Company / Organization Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Enterprises Pvt Ltd"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 3: Industry & Required Service */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Industry *
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Education">Education & Universities</option>
                    <option value="Healthcare">Healthcare & Diagnostics</option>
                    <option value="Retail">Retail & E-commerce</option>
                    <option value="Startups">Tech Startups</option>
                    <option value="Small and Medium Businesses">Small & Medium Businesses</option>
                    <option value="NGOs and Foundations">NGOs and Foundations</option>
                    <option value="Professional Services">Professional Services</option>
                    <option value="Institutions">Statutory / Academic Institutions</option>
                    <option value="Other">Other Sector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Required Service *
                  </label>
                  <select
                    value={formData.requiredService}
                    onChange={(e) => setFormData({ ...formData, requiredService: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 4: Budget & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Estimated Budget *
                  </label>
                  <select
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="₹50,000 - ₹1,50,000">₹50,000 - ₹1,50,000 (Standard MVP / Site)</option>
                    <option value="₹1,50,000 - ₹5,00,000">₹1,50,000 - ₹5,00,000 (Custom Application)</option>
                    <option value="₹5,00,000 - ₹15,00,000">₹5,00,000 - ₹15,00,000 (Enterprise Solution)</option>
                    <option value="Above ₹15,00,000">Above ₹15,00,000 (Large-Scale Platform)</option>
                    <option value="Flexible / To be determined">Flexible / To be determined</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Expected Project Timeline *
                  </label>
                  <select
                    value={formData.expectedTimeline}
                    onChange={(e) => setFormData({ ...formData, expectedTimeline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="1 - 3 Months">1 - 3 Months</option>
                    <option value="3 - 6 Months">3 - 6 Months</option>
                    <option value="6+ Months">6+ Months</option>
                    <option value="Immediate / Urgent">Immediate / Urgent Requirement</option>
                  </select>
                </div>
              </div>

              {/* Row 5: City, State & Preferred Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Karnataka">Karnataka</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Other Indian State / UT">Other State / UT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Preferred Contact *
                  </label>
                  <select
                    value={formData.preferredContactMethod}
                    onChange={(e) => setFormData({ ...formData, preferredContactMethod: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Email">Email</option>
                    <option value="Mobile Call">Mobile Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Project Description */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Project Description & Specifications *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Outline key operational objectives, required features, user scale, integration needs, or current system pain points..."
                  value={formData.projectDescription}
                  onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="consentCheckbox"
                  checked={formData.consentAccepted}
                  onChange={(e) => setFormData({ ...formData, consentAccepted: e.target.checked })}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 w-4 h-4 shrink-0"
                />
                <label htmlFor="consentCheckbox" className="text-xs text-slate-600 leading-normal">
                  I authorize <strong>OpenFrame IT Solutions Private Limited</strong> to review these specifications and contact me regarding this software project quotation and technical consultation.
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Project Enquiry</span>
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center pt-1">
                Submissions are stored securely and routed directly to OpenFrame software engineering architects.
              </div>

            </form>
          )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 6: WHY CHOOSE OPENFRAME? (6 Distinct Points)      */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-100/70 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Enterprise Standards</span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1">
              Why Choose OpenFrame?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Our engineering values place software durability, maintainability, and measurable commercial value at the core.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                1. Customized Solutions
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Tailored architectures designed around your specific business processes, avoiding rigid one-size-fits-all software templates.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-3">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                2. Scalable Technology
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Built on modern cloud-native standards, microservices, and relational database paradigms that gracefully support exponential traffic expansion.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                3. User-Friendly Interfaces
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Intuitive UX workflows, zero-clutter visual hierarchies, and responsive ergonomic interfaces that maximize team adoption.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                4. Business-Focused Development
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                We measure engineering success through operational efficiency gains, reduced processing latency, and tangible ROI for leadership.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                5. Reliable Technical Support
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Clear service level commitments, continuous uptime monitoring, automated error tracking, and responsive technical maintenance squads.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:border-blue-300 transition-all">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-base">
                6. Innovation-Driven Approach
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Continuous integration of modern AI assistants, automated testing pipelines, and developer tooling into all software deliverables.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION 7: FINAL CALL TO ACTION                           */}
      {/* ========================================================= */}
      <section className="py-20 bg-gradient-to-r from-[#071326] via-[#0B1930] to-[#0D234A] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Start Your Project
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
            Your Next Digital Solution Starts Here.
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Partner with OpenFrame IT Solutions Private Limited to architect scalable software, web applications, and intelligent platforms.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2"
            >
              <span>Contact Our Team</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-blue-600/40 text-sky-200 font-semibold text-xs tracking-wider uppercase transition-all flex items-center gap-2"
            >
              <span>Request Software Development</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/products"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs tracking-wider uppercase transition-all shadow-md flex items-center gap-2"
            >
              <span>Explore Our Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MODAL: DETAILED SERVICE SPECIFICATION EXPLORER             */}
      {/* ========================================================= */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl relative border border-slate-200 text-slate-900 max-h-[90vh] overflow-y-auto">
            
            <button
              type="button"
              onClick={() => setSelectedService(null)}
              className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                {selectedService.icon}
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Service Specification
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900">
                  {selectedService.name}
                </h3>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
              {selectedService.fullDesc}
            </p>

            {/* Scope & Capabilities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 pt-4 border-t border-slate-100">
              <div>
                <h4 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Core Service Offerings
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedService.bulletItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-heading font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Standard Deliverables
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {selectedService.deliverables.map((del, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                      <span>{del}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-500 block mb-2">
                Primary Technology Stack:
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedService.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close View
              </button>

              <button
                type="button"
                onClick={() => handleSelectServiceForQuotation(selectedService.name)}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wide uppercase transition-colors shadow-md flex items-center gap-1.5"
              >
                <span>Select for Quotation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
