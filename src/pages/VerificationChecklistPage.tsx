import React from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  FileText,
  Building,
  Scale,
  MapPin,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Link } from '../router/RouterContext';

export const VerificationChecklistPage: React.FC = () => {
  const verifiedItems = [
    {
      category: 'Legal Identity',
      item: 'Corporate Legal Name',
      value: 'OpenFrame IT Solutions Private Limited',
      status: 'Verified',
      note: 'Registered private limited company under the Companies Act.'
    },
    {
      category: 'Legal Identity',
      item: 'Corporate Identification Number (CIN)',
      value: 'U62099KA2023PTC180260',
      status: 'Verified',
      note: 'RoC Karnataka registration record confirmed.'
    },
    {
      category: 'Legal Separation',
      item: 'HopeNest Global Foundation Structure',
      value: 'Independent Section 8 Company',
      status: 'Verified',
      note: 'Autonomous non-profit entity. Zero CSR terminology or agency status; institutional collaboration only.'
    },
    {
      category: 'Digital Infrastructure',
      item: 'Cloud Firestore & Storage Security',
      value: 'ai-studio-openframeitsolut-6d1feef7-d189-4082-b3a7-60946669f3e7',
      status: 'Verified',
      note: 'Live database with strict RBAC rules and audit trail logging.'
    },
    {
      category: 'Digital Infrastructure',
      item: 'Corporate Email Routing',
      value: 'contact@openframeitsolutions.com / support@openframeitsolutions.com',
      status: 'Verified',
      note: 'Dedicated corporate domain mailboxes configured.'
    },
    {
      category: 'Branding & Identity',
      item: 'Official Corporate Tagline',
      value: 'Technology | Education | Innovation',
      status: 'Verified',
      note: 'Applied uniformly across headers, footers, and meta tags.'
    }
  ];

  const pendingVerificationItems = [
    {
      category: 'Telecom & Voice',
      item: 'Direct Corporate Landline',
      currentPlaceholder: '+91 80 4123 4567 [Awaiting Telecom Carrier Activation]',
      actionRequired: 'Verify official landline number once telecom PRI line installation is certified.'
    },
    {
      category: 'Statutory Documents',
      item: 'RoC Incorporation Certificate Scan',
      currentPlaceholder: 'Charter Record [Awaiting Sign-Off for Public Repository]',
      actionRequired: 'Redact sensitive PAN/bank details and upload certified public scan.'
    },
    {
      category: 'Statutory Documents',
      item: 'DPIIT Recognition Certificate',
      currentPlaceholder: '[DPIIT Reference Number Under Verification]',
      actionRequired: 'Upload official DPIIT certificate once application processing is completed.'
    },
    {
      category: 'Statutory Documents',
      item: 'Startup India Certificate',
      currentPlaceholder: '[Startup India ID Pending Statutory Certification]',
      actionRequired: 'Upload certificate copy post portal evaluation.'
    },
    {
      category: 'Physical Branches',
      item: 'Regional Center Lease Agreements',
      currentPlaceholder: 'Bengaluru Head Office, Hubballi & Mangaluru Training Centers',
      actionRequired: 'Confirm local office hours and Google Maps verification pins.'
    },
    {
      category: 'Legal Content',
      item: 'Statutory Policies Review',
      currentPlaceholder: 'Privacy Policy, Terms of Use, Disclaimer, Cookie Policy',
      actionRequired: 'Complete formal legal counsel review before commercial contract execution.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-4">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-slate-800">Verification &amp; Governance Checklist</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Official Corporate Verification Status</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
            Corporate Presentation &amp; Information Checklist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed max-w-2xl">
            This live compliance ledger tracks verified corporate facts versus items under statutory confirmation, ensuring transparency for partners, regulators, and public stakeholders.
          </p>
        </div>

        {/* Section 1: Verified Company Facts */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>1. Verified Corporate Facts (Active &amp; Certified)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Officially validated attributes operating across all website components
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
              {verifiedItems.length} Verified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Attribute</th>
                  <th className="py-3 px-4">Verified Value</th>
                  <th className="py-3 px-4">Verification Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {verifiedItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.category}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{item.item}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-blue-700 font-bold">{item.value}</td>
                    <td className="py-3 px-4 text-slate-500">{item.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Items Awaiting Approval or Confirmation */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <span>2. Items Awaiting Formal Confirmation &amp; Upload</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Clearly labelled placeholders retained to prevent invention of facts
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
              {pendingVerificationItems.length} In Progress
            </span>
          </div>

          <div className="space-y-4">
            {pendingVerificationItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[10px] uppercase">
                    {item.category}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Awaiting Statutory Sign-Off</span>
                  </span>
                </div>

                <div className="font-bold text-slate-900 text-sm">
                  {item.item}
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-mono text-[11px]">
                  <span className="text-slate-400 block text-[10px] uppercase">Current Displayed Placeholder:</span>
                  {item.currentPlaceholder}
                </div>

                <p className="text-slate-600 leading-relaxed">
                  <strong className="text-slate-800">Action Required:</strong> {item.actionRequired}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Management Link */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-[#071326] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <h4 className="font-heading font-bold text-base text-white">Authorized Administrator Updates</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Authorized executives can update verified facts, upload certificates, and modify office hours in the Admin Console.
            </p>
          </div>
          <Link
            to="/admin"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Admin Console</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
