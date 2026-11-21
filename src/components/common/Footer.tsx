import React, { useState } from 'react';
import { Link } from '../../router/RouterContext';
import { Mail, Phone, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
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
        setSubscribeNotice('This email is already subscribed to OpenFrame updates.');
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
    <footer className="bg-[#123D32] text-[#FAF7F2]/85 text-sm border-t border-[#1c5647]">
      {/* Newsletter & Institutional Inquiry Strip */}
      <div className="border-b border-white/10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-emerald-200/80 font-semibold block">
              OpenFrame Education Ecosystem
            </span>
            <h3 className="text-2xl font-editorial font-semibold text-white">
              Learning built for clarity, capability, and lifelong opportunity.
            </h3>
            <p className="text-xs text-[#FAF7F2]/75 leading-relaxed max-w-md">
              Connecting students, educators, parents, schools, NGOs, and enterprise technology under one structured platform.
            </p>
          </div>

          <div className="lg:col-span-3 bg-white/8 p-5 rounded-2xl border border-white/12">
            <span className="text-xs text-emerald-100/75 block font-medium">Institutional &amp; Corporate Inquiries</span>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-white truncate">{settings.contactEmail}</span>
              <Link
                to="/contact"
                className="text-xs font-semibold text-emerald-200 hover:text-white flex items-center gap-1 shrink-0 whitespace-nowrap"
              >
                <span>Contact</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white/8 p-5 rounded-2xl border border-white/12">
            <span className="text-xs text-emerald-100/75 block font-medium">Newsletter &amp; Curriculum Releases</span>
            {subscribed ? (
              <div className="mt-2 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{subscribeNotice || 'Subscribed to official OpenFrame updates.'}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mt-2.5 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#0b2921] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/45 focus:outline-none focus:border-emerald-300 w-full"
                  />
                  <button
                    type="submit"
                    disabled={isSubscribing}
                    className="bg-[#2563EB] hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-xl whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    {isSubscribing ? 'Saving...' : 'Subscribe'}
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-white/65">
                  <input
                    type="checkbox"
                    id="footer-consent"
                    defaultChecked
                    required
                    className="rounded border-white/30 text-[#2563EB] focus:ring-0"
                  />
                  <label htmlFor="footer-consent" className="cursor-pointer">
                    Receive academic &amp; technology updates from OpenFrame.
                  </label>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="sm:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5" aria-label="OpenFrame">
              <div className="w-9 h-9 rounded-xl bg-white p-0.5 flex items-center justify-center overflow-hidden">
                <img
                  src="/openframe_official_logo.jpg"
                  alt="OpenFrame"
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <span className="font-editorial font-semibold text-white text-lg">OpenFrame</span>
                <span className="text-[11px] block text-emerald-200/80 -mt-0.5 font-medium">
                  IT Solutions Private Limited
                </span>
              </div>
            </Link>
            <p className="text-xs text-white/70 leading-relaxed max-w-xs">
              Universal AI Course Discovery, school &amp; higher education LMS, verified credentials, and enterprise software engineering from Bengaluru, India.
            </p>
            <div className="space-y-1.5 text-xs text-white/75 pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-300 mt-0.5 shrink-0" />
                <span className="leading-relaxed">
                  3rd Floor, Akshay Plaza,<br />
                  Akshay Colony, Vidya Nagar,<br />
                  Hubballi – 580021,<br />
                  Karnataka, India.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>6362163070</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>{settings.contactEmail}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Courses &amp; Programs
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Explore Courses</Link></li>
              <li><Link to="/education" className="hover:text-white transition-colors">Learning Programmes</Link></li>
              <li><Link to="/school" className="hover:text-white transition-colors">School Education (LKG–12)</Link></li>
              <li><Link to="/chatbot" className="hover:text-white transition-colors">Quinn AI Tutor</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Portals &amp; Support
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li><Link to="/portal/student" className="hover:text-white transition-colors">Student Support &amp; LMS</Link></li>
              <li><Link to="/portal/teacher" className="hover:text-white transition-colors">Teacher Resources</Link></li>
              <li><Link to="/portal/parent" className="hover:text-white transition-colors">Parent Progress Portal</Link></li>
              <li><Link to="/portal/professional" className="hover:text-white transition-colors">Professional Upskilling</Link></li>
              <li><Link to="/verify-certificate" className="hover:text-white transition-colors">Verify Certificate</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Partnerships
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li><Link to="/partner/school" className="hover:text-white transition-colors">School Partnerships</Link></li>
              <li><Link to="/portal/ngo" className="hover:text-white transition-colors">NGO Programmes</Link></li>
              <li><Link to="/portal/field" className="hover:text-white transition-colors">Field Operations Portal</Link></li>
              <li><Link to="/hopenest" className="hover:text-white transition-colors">HopeNest Foundation</Link></li>
              <li><Link to="/work-with-us" className="hover:text-white transition-colors">Work With Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-white text-xs uppercase tracking-wider mb-3">
              Company &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs text-white/75">
              <li><Link to="/about-us" className="hover:text-white transition-colors">About OpenFrame</Link></li>
              <li><Link to="/it-solutions" className="hover:text-white transition-colors">IT Solutions</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Knowledge &amp; Blog</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/documents" className="hover:text-white transition-colors">Corporate Documents</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/12 text-[11px] text-white/65 leading-relaxed">
          <p>
            <strong className="text-white/90">Governance &amp; Legal Distinction:</strong> OpenFrame IT Solutions Private Limited (CIN: U62099KA2023PTC180260) and HopeNest Global Foundation (Section 8 Non-Profit Organisation) are legally independent entities collaborating under formal institutional agreements to expand digital literacy and skill accessibility.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-white/12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/70">
          <div>© {new Date().getFullYear()} OpenFrame IT Solutions Private Limited. All rights reserved.</div>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            <Link to="/cookie-policy" className="hover:text-white transition-colors">Cookies</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
