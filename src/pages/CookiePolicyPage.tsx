import React from 'react';
import { Cookie, Shield, CheckCircle2, Info } from 'lucide-react';
import { Link } from '../router/RouterContext';

export const CookiePolicyPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-4">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800">Cookie Policy</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
            <Cookie className="w-3.5 h-3.5 text-blue-600" />
            <span>Browser Storage &amp; Cookie Disclosure</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Cookie &amp; Local Storage Policy
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Effective Date: November 2026 &bull; OpenFrame IT Solutions Private Limited (CIN: U62099KA2023PTC180260)
          </p>
          <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed">
            <strong>Draft Disclosure:</strong> Explains how cookies, local web storage, and session tokens are utilized to deliver a responsive, secure corporate experience.
          </div>
        </div>

        {/* Cookie Policy Content */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>What Are Cookies and Local Storage?</span>
            </h2>
            <p>
              Cookies and local browser storage are small text files and key-value entries stored on your browser or device when you visit our website. They enable the website to remember your session, preserve administrative authentication, and maintain preferences across page loads without compromising user security.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>Categories of Storage We Employ</span>
            </h2>
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">A. Strictly Necessary &amp; Security Cookies</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Required for essential portal functionality, such as Firebase Authentication tokens for authorized administrator access, session encryption, and cross-site request forgery prevention.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">B. Functional &amp; Preference Storage</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Allows our portal to remember user-dismissed announcement ticker strips, filter preferences on course catalogues, and local draft form states to prevent accidental data loss during connection drops.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide">C. Zero Invasive Tracking</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We do not deploy invasive third-party ad-tracking cookies, behavioural retargeting pixels, or surveillance scripts.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <span>Managing Your Browser Preferences</span>
            </h2>
            <p>
              Most web browsers automatically accept cookies, but you can modify your browser settings to decline cookies or alert you when a cookie is placed. Note that disabling strictly necessary session tokens may impact your ability to log in to the administrative portal.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>Policy Inquiries</span>
            </h2>
            <p>
              For questions regarding our cookie practices, please contact our web administration team at <a href="mailto:support@openframeitsolutions.com" className="text-blue-600 underline">support@openframeitsolutions.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
