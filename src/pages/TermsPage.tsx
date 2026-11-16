import React from 'react';
import { FileText, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from '../router/RouterContext';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-4">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800">Terms &amp; Conditions</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
            <FileText className="w-3.5 h-3.5" />
            <span>Website Terms of Use</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Terms &amp; Conditions of Website Use
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Effective Date: November 2026 &bull; OpenFrame IT Solutions Private Limited (CIN: U62099KA2023PTC180260)
          </p>
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <strong>Editable Content Notice:</strong> These terms govern the use of the OpenFrame official corporate web portal. They are drafted for operational clarity and must undergo formal statutory legal review prior to commercial contract execution.
          </div>
        </div>

        {/* Terms Content Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>Acceptance of Terms</span>
            </h2>
            <p>
              By accessing, browsing, or utilizing the web portal of OpenFrame IT Solutions Private Limited, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any of these provisions, you should refrain from using this website.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>Intellectual Property</span>
            </h2>
            <p>
              All trademarks, software architecture diagrams, course syllabi, corporate logos, text, graphics, and proprietary software interfaces displayed on this website are the intellectual property of OpenFrame IT Solutions Private Limited or its licensors. Unauthorized reproduction, modification, or distribution is strictly prohibited.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <span>Training Programs &amp; Placement Disclaimer</span>
            </h2>
            <p>
              OpenFrame IT Solutions Private Limited provides professional skill development, technology courses, and practical internship programs. While we provide career mentoring and interview preparation, enrollment in any training program does not constitute a legal guarantee of employment or specific salary packages unless explicitly stated in a signed formal agreement.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>HopeNest Global Foundation Separation</span>
            </h2>
            <p>
              Visitors are explicitly advised that HopeNest Global Foundation is a separate Section 8 entity. OpenFrame IT Solutions Private Limited is not liable for independent foundation operations, and HopeNest Global Foundation is not liable for commercial IT contracts of OpenFrame.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">5</span>
              <span>Governing Law &amp; Jurisdiction</span>
            </h2>
            <p>
              These Terms of Use shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or related to website usage shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
