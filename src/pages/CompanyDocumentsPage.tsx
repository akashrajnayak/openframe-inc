import React, { useState } from 'react';
import {
  FileText,
  Download,
  Shield,
  CheckCircle2,
  Lock,
  ExternalLink,
  Search,
  Filter,
  Eye,
  Building2,
  Calendar,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Link } from '../router/RouterContext';
import { storageService } from '../services/storageService';
import { CorporateDocument, DocumentCategory } from '../types';

export const CompanyDocumentsPage: React.FC = () => {
  const [documents] = useState<CorporateDocument[]>(() => storageService.getPublicCorporateDocuments());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Corporate Profile',
    'Corporate Brochure',
    'Product Catalogue',
    'Incorporation Certificate',
    'DPIIT Recognition',
    'Startup India Recognition'
  ];

  const filteredDocs = documents.filter((doc) => {
    if (selectedCategory !== 'All' && doc.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleDownload = (doc: CorporateDocument) => {
    // Generate a formal institutional summary text document for public viewing
    const content = `=====================================================
OPENFRAME IT SOLUTIONS PRIVATE LIMITED
CIN: U62099KA2023PTC180260
Headquarters: Bengaluru, Karnataka, India
Official Corporate Document Repository
=====================================================

Document Title: ${doc.title}
Category: ${doc.category}
Version: ${doc.version}
Approval Date: ${doc.approvedDate}
Classification: ${doc.status}

Document Summary:
${doc.description}

Institutional Governance & Disclosures:
- OpenFrame IT Solutions Private Limited is a registered corporate technology solutions and professional skill development company.
- HopeNest Global Foundation is an independent Section 8 company and separate legal entity.
- This document is released under formal corporate verification. For questions, contact: contact@openframeitsolutions.com
=====================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-4">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/about-us" className="hover:text-blue-600 transition-colors">Corporate</Link>
          <span>/</span>
          <span className="text-slate-800">Approved Documents</span>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-[#071326] via-[#0B1E3F] to-blue-900 rounded-3xl p-6 sm:p-10 text-white border border-blue-900/60 shadow-xl mb-8 relative overflow-hidden">
          <div className="max-w-3xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-sky-300 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Official Corporate Documents Repository</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-extrabold tracking-tight text-white">
              Approved Corporate Documents &amp; Catalogues
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Access official public profiles, technology catalogues, and academic prospectuses approved by the executive management of OpenFrame IT Solutions Private Limited.
            </p>
          </div>
        </div>

        {/* Legal & Privacy Safeguard Notice */}
        <div className="p-4 sm:p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 text-xs leading-relaxed mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Public Document Transparency Standard:</span> In compliance with corporate governance and privacy regulations, only non-confidential company literature, catalogues, and vetted profiles are made accessible for direct public download. Statutory certificates (e.g., RoC incorporation charter, DPIIT filing, Startup India records) undergo redaction of bank coordinates and personal identification numbers before release.
          </div>
        </div>

        {/* Controls: Search and Filter */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search approved documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Document Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                    {doc.category}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {doc.fileFormat} &bull; {doc.fileSize}
                  </span>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold transition-transform group-hover:scale-105">
                  <FileText className="w-6 h-6" />
                </div>

                <h3 className="font-heading font-bold text-slate-900 text-base leading-snug">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {doc.description}
                </p>

                <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span>Approved Version:</span>
                    <span className="font-mono font-semibold text-slate-700">{doc.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Approval Date:</span>
                    <span className="font-mono text-slate-600">{doc.approvedDate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <button
                  onClick={() => handleDownload(doc)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Approved Document</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Institutional Verification Footer Box */}
        <div className="mt-12 p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Need Certified Physical Copies or Statutory Filings?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized institutional partners, financial auditors, or empanelment boards may request digitally certified documents.
            </p>
          </div>
          <Link
            to="/contact"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shrink-0"
          >
            Request Official Records
          </Link>
        </div>
      </div>
    </div>
  );
};
