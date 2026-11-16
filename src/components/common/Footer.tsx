import React, { useState } from 'react';
import { Link } from '../../router/RouterContext';
import {
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Shield,
  ExternalLink,
  CheckCircle2,
  Lock,
  Sparkles,
  Brain
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { subscribeNewsletter } from '../../services/firebase';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribeNotice, setSubscribeNotice] = useState<string | null>(null);
  const settings = storageService.getSiteSettings();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@') || isSubscribing) return;

    setIsSubscribing(true);
    setSubscribeNotice(null);
    storageService.subscribeNewsletter(trimmed, undefined, 'Global Footer Subscription Box');
    try {
      const res = await subscribeNewsletter(trimmed, undefined, 'Global Footer Subscription Box');
      if (res?.duplicate) {
        setSubscribeNotice('This email is already subscribed to corporate updates.');
      }
      setSubscribed(true);
      setEmail('');
    } catch {
      setSubscribed(true);
      setEmail('');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="bg-[#071326] text-slate-400 text-sm border-t border-blue-950">
      {/* Top Value Strip */}
      <div className="border-b border-blue-950/80 bg-[#0A192F]/60 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold">Corporate Mission</span>
            <h3 className="text-xl font-heading font-bold text-white mt-1">
              Technology | Education | Innovation
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
              OpenFrame IT Solutions Private Limited delivers modern software systems, digital platforms, and professional technology education initiatives.
            </p>
          </div>

          <div className="bg-[#0B1E3F]/80 p-5 rounded-xl border border-blue-900/40">
            <span className="text-xs text-slate-400 block font-medium">Have a project or partnership inquiry?</span>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-white">{settings.contactEmail}</span>
              <Link
                to="/contact"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 group"
              >
                <span>Inquire</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Stay in Touch with Us */}
          <div className="bg-[#0B1E3F]/80 p-5 rounded-xl border border-blue-900/40">
            <span className="text-xs text-slate-400 block font-medium">Stay in Touch With Us</span>
            {subscribed ? (
              <div className="mt-2 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{subscribeNotice || 'Thank you. You have been registered for official corporate updates.'}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your corporate email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#071326] border border-blue-900/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full"
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                  >
                    {isSubscribing ? 'Saving...' : 'Subscribe'}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <input
                    type="checkbox"
                    id="footer-consent"
                    defaultChecked
                    required
                    className="rounded border-blue-900 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="footer-consent" className="cursor-pointer">
                    I agree to receive official quarterly technology publications.
                  </label>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Corporate Profile */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5" aria-label="OpenFrame IT Solutions">
              <div className="w-9 h-9 rounded-lg bg-white p-0.5 border border-blue-500/40 shadow-sm flex items-center justify-center overflow-hidden">
                <img
                  src="/openframe_official_logo.jpg"
                  alt="OpenFrame IT Solutions"
                  className="w-full h-full object-contain rounded"
                />
              </div>
              <div>
                <span className="font-heading font-bold text-white text-base">OpenFrame</span>
                <span className="text-[11px] block text-blue-400 -mt-1 font-medium">IT Solutions Private Limited</span>
              </div>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              An Indian technology and education company operating under disciplined engineering and pedagogy standards. Architecting enterprise software, digital products, and practical technical talent development.
            </p>

            <div className="space-y-1.5 text-xs text-slate-400 pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-400 mt-0.5 shrink-0" />
                <span>Headquarters: Bengaluru, Karnataka, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{settings.supportPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{settings.contactEmail}</span>
              </div>
            </div>
          </div>

          {/* Col 2: IT Solutions */}
          <div>
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-wider mb-3">
              IT Solutions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/it-solutions" className="hover:text-white transition-colors">Enterprise Software</Link>
              </li>
              <li>
                <Link to="/it-solutions" className="hover:text-white transition-colors">Cloud & DevOps Systems</Link>
              </li>
              <li>
                <Link to="/it-solutions" className="hover:text-white transition-colors">Web & Mobile Platforms</Link>
              </li>
              <li>
                <Link to="/it-solutions" className="hover:text-white transition-colors">Data Systems & Analytics</Link>
              </li>
              <li>
                <Link to="/it-solutions" className="hover:text-white transition-colors">Technology Advisory</Link>
              </li>
              <li>
                <Link to="/it-solutions" className="hover:text-white transition-colors">Quality Engineering</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Education & Products */}
          <div>
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Education & Platforms
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/marketplace" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>15,500+ Course Catalog</span>
                </Link>
              </li>
              <li>
                <Link to="/chatbot" className="text-cyan-300 hover:text-white font-bold transition-colors flex items-center gap-1">
                  <Brain className="w-3 h-3 text-cyan-400" />
                  <span>Qwen AI Assistant</span>
                </Link>
              </li>
              <li>
                <Link to="/education" className="hover:text-white transition-colors">OpenFrame Education</Link>
              </li>
              <li>
                <Link to="/animation-course" className="text-sky-400 hover:text-sky-300 font-medium transition-colors">
                  Swift UI Animations &amp; Charts (ZIP)
                </Link>
              </li>
              <li>
                <Link to="/student/dashboard" className="hover:text-white transition-colors">Student LMS Portal</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">All Digital Products</Link>
              </li>
              <li>
                <Link to="/products/life-smart-card" className="hover:text-white transition-colors">Life Smart Card</Link>
              </li>
              <li>
                <Link to="/products/studynotepro" className="hover:text-white transition-colors">StudyNotePro</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Corporate & Independent Organizations */}
          <div>
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Corporate & Foundation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about-us" className="hover:text-white transition-colors">About OpenFrame</Link>
              </li>
              <li>
                <Link to="/documents" className="hover:text-sky-300 transition-colors font-medium">Official Corporate Documents</Link>
              </li>
              <li>
                <Link to="/verification-checklist" className="hover:text-sky-300 transition-colors font-medium">Verification Checklist</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-white transition-colors">Careers & Culture</Link>
              </li>
              <li>
                <Link to="/careers/jobs" className="hover:text-sky-300 transition-colors">Verified Job Openings</Link>
              </li>
              <li>
                <Link to="/careers/apply" className="hover:text-white transition-colors">Job Application Form</Link>
              </li>
              <li>
                <Link to="/join/intern" className="hover:text-sky-300 transition-colors">Internship Registration</Link>
              </li>
              <li>
                <Link to="/join/professional" className="hover:text-white transition-colors">Senior Expert Network</Link>
              </li>
              <li>
                <Link to="/partner/school" className="hover:text-sky-300 transition-colors">School Partnerships</Link>
              </li>
              <li>
                <Link to="/partner/ngo" className="hover:text-white transition-colors">NGO Alliances</Link>
              </li>
              <li>
                <Link to="/work-with-us" className="hover:text-white transition-colors">Work With Us Hub</Link>
              </li>
              <li>
                <Link to="/hopenest" className="hover:text-white transition-colors">HopeNest Foundation</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">Insights & Blog</Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-sky-400 transition-colors flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Admin Console</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Legal Distinction Notice for HopeNest Foundation */}
        <div className="mt-10 pt-6 border-t border-blue-950/80 text-[11px] text-slate-500 leading-relaxed">
          <p>
            <strong className="text-slate-400">Legal Disclosure & Independent Governance:</strong> OpenFrame IT Solutions Private Limited and HopeNest Global Foundation are two distinct, legally separate organizations. OpenFrame IT Solutions Private Limited is a registered private commercial technology company. HopeNest Global Foundation operates independently under autonomous non-profit governance. Collaboration between OpenFrame and HopeNest is conducted strictly under distinct institutional agreements for technical advisory and education access.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 pt-6 border-t border-blue-950/60 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} OpenFrame IT Solutions Private Limited. All rights reserved.
          </div>
          
          {/* Social Media Placeholders */}
          <div className="flex items-center gap-4 text-slate-400">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Connect:</span>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors">
              LinkedIn
            </a>
            <span className="text-slate-700">·</span>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors">
              X (Twitter)
            </a>
            <span className="text-slate-700">·</span>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors">
              GitHub
            </a>
            <span className="text-slate-700">·</span>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors">
              YouTube
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 font-mono">CIN: U62099KA2023PTC180260</span>
            <span className="text-slate-700">&bull;</span>
            <Link to="/privacy-policy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <span className="text-slate-700">&bull;</span>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Use</Link>
            <span className="text-slate-700">&bull;</span>
            <Link to="/disclaimer" className="hover:text-slate-300 transition-colors">Disclaimer</Link>
            <span className="text-slate-700">&bull;</span>
            <Link to="/cookie-policy" className="hover:text-slate-300 transition-colors">Cookies</Link>
            <span className="text-slate-700">&bull;</span>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact Office</Link>
            <span className="text-slate-700">&bull;</span>
            <Link to="/admin/login" className="hover:text-sky-400 transition-colors">Portal Access</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
