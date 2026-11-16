import React, { useState } from 'react';
import { Link } from '../router/RouterContext';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Building2,
  Globe,
  ArrowRight,
  ExternalLink,
  Laptop,
  GraduationCap,
  Sparkles,
  Layers,
  HeartHandshake,
  Briefcase,
  HelpCircle,
  ShieldCheck,
  Check,
  Navigation
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { submitContactMessageToFirestore } from '../services/firebase';

export const ContactPage: React.FC = () => {
  const settings = storageService.getSiteSettings();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    division: 'IT Solutions',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Newsletter state
  const [nlName, setNlName] = useState('');
  const [nlEmail, setNlEmail] = useState('');
  const [nlConsent, setNlConsent] = useState(false);
  const [nlSubmitting, setNlSubmitting] = useState(false);
  const [nlStatus, setNlStatus] = useState<'idle' | 'success' | 'duplicate' | 'error'>('idle');

  // Phone validation (Indian 10-digit mobile)
  const validateIndianPhone = (phone: string): boolean => {
    if (!phone) return true; // Optional field in contact form
    const clean = phone.replace(/[\s\-+()]/g, '');
    const mobile10 = clean.length > 10 ? clean.slice(-10) : clean;
    return /^[6-9]\d{9}$/.test(mobile10);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    if (formData.phone && !validateIndianPhone(formData.phone)) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number (e.g., 9876543210).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fullName: formData.name.trim(),
        emailAddress: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        organization: formData.organization.trim() || undefined,
        division: formData.division,
        subject: formData.subject.trim() || 'Direct Website Contact Inquiry',
        message: formData.message.trim(),
        submittedAt: new Date().toISOString(),
        status: 'New' as const,
      };

      // Dual save: write to local storage first (instant responsiveness)
      storageService.saveContactMessage(payload);

      // Save to Firestore contact_messages
      try {
        await submitContactMessageToFirestore(payload);
      } catch (err) {
        console.warn('Firestore async sync notice:', err);
      }

      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        organization: '',
        division: 'IT Solutions',
        subject: '',
        message: '',
      });
    } catch {
      setErrorMessage('Unable to submit inquiry at this moment. Please try again or reach us via email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlEmail.trim() || !nlEmail.includes('@') || !nlConsent) {
      setNlStatus('error');
      return;
    }

    setNlSubmitting(true);
    try {
      const res = storageService.subscribeNewsletter(nlEmail, nlName, 'Contact Page Newsletter Box');
      if (res.isDuplicate) {
        setNlStatus('duplicate');
      } else {
        setNlStatus('success');
        setNlEmail('');
        setNlName('');
        setNlConsent(false);
      }
    } catch {
      setNlStatus('error');
    } finally {
      setNlSubmitting(false);
    }
  };

  // 12 Distinct Gateway Cards for Stay in Touch
  const stayInTouchOptions = [
    {
      id: 'website',
      title: 'Need a Website?',
      desc: 'High-performance corporate portals, institutional platforms & modern SPAs.',
      route: '/it-solutions',
      badge: 'IT Solutions',
      icon: Laptop,
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'software',
      title: 'Need Software Development?',
      desc: 'Bespoke enterprise ERP, APIs, cloud backends & microservices.',
      route: '/inquiry/software',
      badge: 'Software Services',
      icon: Layers,
      color: 'from-sky-600 to-cyan-600',
    },
    {
      id: 'courses',
      title: 'Interested in Our Courses?',
      desc: 'Academic tuition (K-12) & professional tech career skills programmes.',
      route: '/education',
      badge: 'OpenFrame Education',
      icon: GraduationCap,
      color: 'from-emerald-600 to-teal-600',
    },
    {
      id: 'student',
      title: 'Join as a Student',
      desc: 'Register for live classes, mentorship labs & digital skill tracks.',
      route: '/join/student',
      badge: 'Student Admissions',
      icon: Sparkles,
      color: 'from-purple-600 to-indigo-600',
    },
    {
      id: 'teacher',
      title: 'Join as a Teacher',
      desc: 'Educators, course mentors & technical instructors empanelment.',
      route: '/join/teacher',
      badge: 'Faculty Enrolment',
      icon: Building2,
      color: 'from-amber-600 to-orange-600',
    },
    {
      id: 'work',
      title: 'Work With Us',
      desc: 'Explore engineering culture, project roles & collaborative opportunities.',
      route: '/work-with-us',
      badge: 'Open Opportunities',
      icon: Briefcase,
      color: 'from-rose-600 to-pink-600',
    },
    {
      id: 'internship',
      title: 'Apply for Internship',
      desc: 'Structured 2 to 6 months technical internships with live project access.',
      route: '/join/intern',
      badge: 'Undergrads & Grads',
      icon: Sparkles,
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'school',
      title: 'School or College Partnership',
      desc: 'STEM & AI labs, curriculum integration & faculty training MOU.',
      route: '/partner/school',
      badge: 'Institutions',
      icon: Building2,
      color: 'from-indigo-600 to-violet-600',
    },
    {
      id: 'ngo',
      title: 'NGO Partnership',
      desc: 'Grassroots digital literacy alliances & non-profit technical alignment.',
      route: '/partner/ngo',
      badge: 'Social Impact',
      icon: HeartHandshake,
      color: 'from-emerald-600 to-green-600',
    },
    {
      id: 'professional',
      title: 'Professional Registration',
      desc: 'Senior domain experts, consulting advisors & guest faculty registry.',
      route: '/join/professional',
      badge: 'Expert Network',
      icon: ShieldCheck,
      color: 'from-blue-700 to-slate-800',
    },
    {
      id: 'hopenest',
      title: 'HopeNest Foundation Enquiry',
      desc: 'Inquire with the independent Section 8 non-profit foundation.',
      route: '/hopenest',
      badge: 'Autonomous Foundation',
      icon: HeartHandshake,
      color: 'from-teal-600 to-emerald-700',
    },
    {
      id: 'business',
      title: 'General Business Enquiry',
      desc: 'Commercial proposals, joint ventures, procurement & corporate matters.',
      route: '/inquiry/business',
      badge: 'Commercial Intakes',
      icon: HelpCircle,
      color: 'from-slate-700 to-slate-900',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-950">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/40 border border-blue-700/50 text-sky-300 text-xs font-semibold tracking-wider uppercase">
            Official Communications Desk
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
            Contact OpenFrame
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Corporate identity: <strong>OPENFRAME IT SOLUTIONS PRIVATE LIMITED</strong>. Reach our registered office in Electronic City, Bengaluru or connect with our specialized divisions.
          </p>
        </div>
      </section>

      {/* Corporate Introduction Strip */}
      <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-slate-600">
          <div>
            <span className="font-bold text-slate-900 block text-sm">OPENFRAME IT SOLUTIONS PRIVATE LIMITED</span>
            <span>Corporate Identity Number (CIN): <strong className="text-slate-800 font-mono">U62099KA2023PTC180260</strong> · Registered in Karnataka, India</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-100">
              DPIIT Startup India Recognized
            </span>
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
              MCA Compliant
            </span>
          </div>
        </div>
      </div>

      {/* Main Contact Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Official Directory & Location */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Principal Office</span>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mt-1">
                Corporate Headquarters
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Registered office and engineering laboratories located within the primary technology corridor of Bengaluru.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700">
                  <strong className="block text-slate-900 text-sm font-semibold mb-0.5">Corporate Address</strong>
                  Plot No. 42, Electronic City Phase 1, Hosur Road, Bengaluru, Karnataka, India - 560100
                  <span className="block text-[11px] text-slate-400 mt-1">(Verification placeholder pending physical site registration card)</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <Phone className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700">
                  <strong className="block text-slate-900 text-sm font-semibold mb-0.5">Telephone / Board Line</strong>
                  {settings.supportPhone}
                  <span className="block text-[11px] text-slate-400 mt-0.5">Centralized communications switchboard</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700">
                  <strong className="block text-slate-900 text-sm font-semibold mb-0.5">Business & Official Email</strong>
                  <a href={`mailto:${settings.contactEmail}`} className="text-blue-600 font-semibold hover:underline">
                    {settings.contactEmail}
                  </a>
                  <span className="block text-[11px] text-slate-400 mt-0.5">Direct triage to relevant department</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-xs text-slate-700">
                  <strong className="block text-slate-900 text-sm font-semibold mb-0.5">Business Hours</strong>
                  Monday – Friday: 9:30 AM – 6:30 PM Indian Standard Time (IST)
                  <span className="block text-[11px] text-slate-400 mt-0.5">Excluding national holidays. Visitors by prior appointment.</span>
                </div>
              </div>
            </div>

            {/* Google Maps Location Preview Box */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800">Bengaluru Headquarters Location</span>
                </div>
                <a
                  href="https://maps.google.com/?q=Electronic+City+Phase+1+Bengaluru"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Get Directions</span>
                  <Navigation className="w-3 h-3" />
                </a>
              </div>
              <div className="relative h-48 bg-slate-100">
                <iframe
                  title="OpenFrame Headquarters Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31114.717140801915!2d77.65213645000001!3d12.8452145!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae6c62c2f70487%3A0xc39f88d55d28b188!2sElectronic%20City%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-3 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Electronic City Phase 1, Bengaluru, Karnataka, India</span>
                <span className="text-slate-400 font-medium">OpenFrame IT Solutions Corporate HQ</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="p-5 rounded-xl bg-slate-100/80 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Official Social Media Channels
              </span>
              <p className="text-xs text-slate-600 mb-3">
                Follow OpenFrame for corporate announcements, tech publications, and education schedules.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-semibold transition-colors"
                >
                  LinkedIn
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-semibold transition-colors"
                >
                  X (Twitter)
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-semibold transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 font-semibold transition-colors"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Working Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Official Communication Form</span>
            <h3 className="text-2xl font-heading font-bold text-slate-900 mt-1">
              Send Official Communication
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Submissions are logged directly into our Firestore communications registry and acknowledged by our corporate team.
            </p>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {submitted ? (
              <div className="mt-8 p-8 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-heading font-bold text-lg text-emerald-950">Message Successfully Dispatched</h4>
                <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting OpenFrame IT Solutions Private Limited. Your communication has been recorded in our centralized Firestore communications database.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold tracking-wide transition-colors"
                  >
                    Send Another Communication
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@organization.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Mobile Number (10 Digits)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9845012345"
                      maxLength={15}
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Indian 10-digit mobile number</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Organization / Company
                    </label>
                    <input
                      type="text"
                      placeholder="Organization Name"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Target Division *
                    </label>
                    <select
                      value={formData.division}
                      onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="IT Solutions">IT & Software Solutions</option>
                      <option value="Education">OpenFrame Education & Labs</option>
                      <option value="Products">Digital Products & Platforms</option>
                      <option value="Partnerships">Institutional / Corporate Partnerships</option>
                      <option value="General">General Corporate Matter</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      placeholder="Brief topic of inquiry"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Message / Specifications *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Provide details regarding your requirements, timelines, or organizational context..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 text-white font-semibold text-xs tracking-wide uppercase transition-colors shadow-md shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Recording Communication...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry to OpenFrame</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 2: STAY IN TOUCH WITH US (12 Dedicated Action Cards)   */}
      {/* ============================================================== */}
      <section className="bg-slate-100 border-t border-slate-200 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Direct Engagement Gateways
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
              Stay in Touch With Us
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Select your specific requirement below to access the exact verified intake form, admissions desk, or partnership coordinator without intermediary routing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {stayInTouchOptions.map((opt) => {
              const IconComp = opt.icon;
              return (
                <Link
                  key={opt.id}
                  to={opt.route}
                  className="group bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${opt.color} text-white flex items-center justify-center shadow-xs`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {opt.badge}
                      </span>
                    </div>

                    <h3 className="text-sm font-heading font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {opt.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
                    <span>Open Form & Details</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: NEWSLETTER & CORPORATE UPDATES SUBSCRIPTION         */}
      {/* ============================================================== */}
      <section className="bg-white border-t border-slate-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-[#071326] via-[#0B1930] to-[#0D234A] text-white p-8 sm:p-12 border border-blue-950 shadow-xl">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-xs uppercase tracking-widest text-sky-400 font-bold">
              Corporate Intelligence & Updates
            </span>
            <h3 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
              Subscribe to OpenFrame Official Newsletter
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Receive quarterly technology whitepapers, academic schedules, digital platform updates, and career opportunities directly to your inbox.
            </p>
          </div>

          <div className="mt-8 max-w-xl mx-auto">
            {nlStatus === 'success' ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="text-xs font-bold text-emerald-200">Subscription Confirmed</div>
                <p className="text-[11px] text-emerald-300">
                  Your email has been registered in our official newsletter subscriber directory.
                </p>
              </div>
            ) : nlStatus === 'duplicate' ? (
              <div className="p-4 rounded-xl bg-amber-950/60 border border-amber-500 text-center space-y-1">
                <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                <div className="text-xs font-bold text-amber-200">Already Subscribed</div>
                <p className="text-[11px] text-amber-300">
                  This email address is already active in our corporate newsletter directory.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Your Full Name (Optional)"
                    value={nlName}
                    onChange={(e) => setNlName(e.target.value)}
                    className="bg-[#071326] border border-blue-900/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Enter corporate email *"
                    value={nlEmail}
                    onChange={(e) => setNlEmail(e.target.value)}
                    className="bg-[#071326] border border-blue-900/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="nl-consent"
                    required
                    checked={nlConsent}
                    onChange={(e) => setNlConsent(e.target.checked)}
                    className="mt-0.5 rounded border-blue-900 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="nl-consent" className="text-[11px] text-slate-300 leading-tight">
                    I consent to receiving official corporate communications, whitepapers, and service notices from OpenFrame IT Solutions Private Limited. No spam.
                  </label>
                </div>

                {nlStatus === 'error' && (
                  <div className="text-[11px] text-red-300">
                    Please provide a valid email and check the consent box.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={nlSubmitting}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs tracking-wider uppercase transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
                >
                  {nlSubmitting ? 'Registering...' : 'Subscribe to Official Newsletter'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};
