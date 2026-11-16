import React from 'react';
import { Shield, Lock, FileText, CheckCircle2, Mail, MapPin } from 'lucide-react';
import { Link } from '../router/RouterContext';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-4">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800">Privacy Policy</span>
        </div>

        {/* Hero Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-4">
            <Shield className="w-3.5 h-3.5" />
            <span>Corporate Governance &amp; Data Protection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Privacy Policy &amp; Data Protection Framework
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Effective Date: November 2026 &bull; OpenFrame IT Solutions Private Limited (CIN: U62099KA2023PTC180260)
          </p>
          <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
            <strong>Legal Notice:</strong> This policy represents standard corporate data protection practices under the Information Technology Act, 2000 (and applicable Digital Personal Data Protection Act regulations). All provisions are subject to continuous review by our corporate legal counsel.
          </div>
        </div>

        {/* Policy Content Sections */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
              <span>Information We Collect</span>
            </h2>
            <p>
              When you interact with the OpenFrame website, submit inquiries, register for training batches, or apply for career opportunities, we collect information necessary to fulfill your request:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>Contact Coordinates:</strong> Full name, corporate or personal email address, mobile contact number, city, and state.</li>
              <li><strong>Commercial &amp; Project Inquiries:</strong> Organization name, required IT service, estimated project budget, and technical scope.</li>
              <li><strong>Academic Registrations:</strong> Educational institution, course preferences, and preferred learning mode.</li>
              <li><strong>Employment &amp; Internship Applications:</strong> Academic credentials, years of experience, key competencies, portfolio links, and uploaded resume documents.</li>
              <li><strong>HopeNest Foundation Registrations:</strong> Volunteer areas of interest, donation intent categories, and community engagement preferences.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</span>
              <span>How We Use Your Information</span>
            </h2>
            <p>
              Data collected across public gateways is utilized strictly for legitimate corporate and educational communication:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li>Evaluating and responding to software development quotation requests.</li>
              <li>Processing student admissions and scheduling academic counseling sessions.</li>
              <li>Evaluating applicant profiles for verified recruitment openings and internship cohorts.</li>
              <li>Communicating with institutional representatives for school or NGO partnership proposals.</li>
              <li>Dispatching requested corporate technology bulletins (with clear opt-out mechanisms).</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</span>
              <span>Legal Independence of HopeNest Global Foundation</span>
            </h2>
            <p>
              OpenFrame IT Solutions Private Limited and HopeNest Global Foundation maintain distinct legal and administrative boundaries. Records submitted through HopeNest dedicated channels (e.g., volunteer enrollment or social initiative participation) are managed independently under autonomous charitable governance.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</span>
              <span>Security &amp; Storage</span>
            </h2>
            <p>
              We implement industry-standard administrative, physical, and technical safeguards. All form transactions are transmitted over encrypted TLS/HTTPS connections. Data records are stored in secure cloud infrastructure (Google Cloud Firestore &amp; Storage) protected by granular Role-Based Access Control (RBAC). We do not sell, rent, or lease applicant or client data to third parties.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold">5</span>
              <span>Your Data Rights &amp; Contact</span>
            </h2>
            <p>
              You have the right to request access to the personal data we hold about you, request corrections, or request deletion of your records from our systems. For data privacy inquiries or requests, please contact our grievance team:
            </p>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 font-mono text-xs text-slate-800">
              <div><strong>OpenFrame IT Solutions Private Limited</strong></div>
              <div>Grievance Officer: Corporate Compliance Desk</div>
              <div>Email: <a href="mailto:privacy@openframeitsolutions.com" className="text-blue-600 underline">privacy@openframeitsolutions.com</a></div>
              <div>Headquarters: Bengaluru, Karnataka, India</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
