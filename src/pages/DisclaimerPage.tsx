import React from 'react';
import { AlertTriangle, ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react';
import { Link } from '../router/RouterContext';

export const DisclaimerPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-4">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800">Legal Disclaimer</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold mb-4">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Corporate Disclosure &amp; Advisory Notice</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Official Corporate Disclaimer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Effective Date: November 2026 &bull; OpenFrame IT Solutions Private Limited (CIN: U62099KA2023PTC180260)
          </p>
          <div className="mt-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs leading-relaxed">
            <strong>Draft Language for Statutory Legal Review:</strong> The statements on this website are provided for institutional information and general corporate presentation. They are subject to formal confirmation by authorized company signatories.
          </div>
        </div>

        {/* Disclaimer Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>General Information Notice</span>
            </h2>
            <p>
              The information published on this website by OpenFrame IT Solutions Private Limited (&ldquo;OpenFrame&rdquo;) is for general informational and educational purposes only. While we endeavor to keep the information up-to-date, accurate, and aligned with standard corporate presentation standards, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, or suitability of the information, software products, or related graphics contained on the website.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>No Unverified Employment or Salary Guarantees</span>
            </h2>
            <p>
              OpenFrame conducts vocational training, practical technical education, and candidate mentorship. Participation in any training program, workshop, or internship does not guarantee recruitment, placement, specific remuneration packages, or permanent hiring by OpenFrame or its client network unless explicitly stipulated in a legally executed agreement.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <span>Legal Independence of HopeNest Global Foundation</span>
            </h2>
            <p>
              Visitors are explicitly notified that HopeNest Global Foundation is a separate, autonomous Section 8 company registered under the Companies Act, 2013, and is not a subsidiary, branch, or commercial department of OpenFrame IT Solutions Private Limited. Any joint educational or skill development activities represent mutually agreed institutional collaborations, maintaining distinct legal obligations, accounts, and records.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>Third-Party Links &amp; Software Products</span>
            </h2>
            <p>
              Through this website, you may encounter links to external websites, payment portals, or third-party tools that are not under the direct technical control of OpenFrame. The inclusion of any external link does not imply a formal endorsement of the views expressed within them.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">5</span>
              <span>Contact for Clarifications</span>
            </h2>
            <p>
              If you have any questions or require formal verification regarding the statements on this corporate portal, please direct inquiries to:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-xs text-slate-800">
              <div><strong>OpenFrame IT Solutions Private Limited</strong></div>
              <div>Attention: Corporate Legal &amp; Compliance Office</div>
              <div>Email: <a href="mailto:contact@openframeitsolutions.com" className="text-blue-600 underline">contact@openframeitsolutions.com</a></div>
              <div>Registered Office: Bengaluru, Karnataka, India</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
