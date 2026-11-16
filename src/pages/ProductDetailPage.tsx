import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  Layers,
  Users,
  Target,
  ExternalLink,
  Laptop,
  Smartphone,
  CreditCard,
  Cpu,
  BookOpen,
  Send,
  Lock,
  ArrowRight,
  Share2,
  QrCode,
  Radio
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { DigitalProduct } from '../types';
import { ProductEnquiryModal } from '../components/products/ProductEnquiryModal';

interface ProductDetailPageProps {
  slug?: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ slug: propSlug }) => {
  const { currentPath, navigate } = useRouter();

  // Extract slug from URL if not passed directly
  // URL structure: /products/life-smart-card, /products/studynotepro, etc.
  const resolvedSlug = propSlug || (() => {
    const clean = currentPath.split('?')[0].replace(/\/+$/, '');
    const parts = clean.split('/');
    return parts[parts.length - 1] || 'life-smart-card';
  })();

  const [product, setProduct] = useState<DigitalProduct | undefined>(() =>
    storageService.getProductBySlug(resolvedSlug)
  );

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const found = storageService.getProductBySlug(resolvedSlug);
    setProduct(found);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [resolvedSlug, currentPath]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (!product) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-2xl mb-4 border border-amber-200">
          !
        </div>
        <h1 className="text-2xl font-heading font-bold text-slate-900">
          Product Not Found
        </h1>
        <p className="text-xs text-slate-500 mt-2 max-w-md">
          The requested product specification (<code className="text-blue-600 font-mono">{resolvedSlug}</code>) was not found in the current OpenFrame catalogue.
        </p>
        <Link
          to="/products"
          className="mt-6 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wide transition-colors"
        >
          Return to Products Catalogue
        </Link>
      </div>
    );
  }

  // Visual status badge helper
  const getStatusBadge = (status: DigitalProduct['status']) => {
    switch (status) {
      case 'Available':
        return {
          label: 'Available Now',
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500'
        };
      case 'In Development':
        return {
          label: 'In Active Development',
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500'
        };
      case 'Coming Soon':
      default:
        return {
          label: 'Coming Soon / Pilot Stage',
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500'
        };
    }
  };

  const statusBadge = getStatusBadge(product.status);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* 1. PRODUCT HEADER BANNER */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-blue-950 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          
          {/* Breadcrumb & Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Products Catalogue</span>
            </Link>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-950/80 border border-blue-800/80 text-slate-300 hover:text-white text-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Product'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              
              {/* Category & Status Row */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                  {product.category}
                </span>
                <span className="text-slate-500">·</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadge.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`}></span>
                  <span>{statusBadge.label}</span>
                </span>
              </div>

              {/* Product Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight">
                {product.name}
              </h1>

              {/* Tagline */}
              <p className="text-base sm:text-lg font-medium text-sky-200">
                {product.tagline}
              </p>

              {/* Short Summary */}
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {product.shortDesc}
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsEnquiryModalOpen(true)}
                  className="px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Enquire Now</span>
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('how-it-works');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-5 py-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  How It Works
                </button>
              </div>
            </div>

            {/* Visual Icon / Card Badge */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-gradient-to-br from-blue-900/60 to-slate-900 border border-blue-800/60 flex flex-col items-center justify-center p-6 text-center shadow-xl relative group">
                <div className="w-20 h-20 rounded-2xl bg-blue-600/20 text-sky-400 flex items-center justify-center mb-3 border border-blue-500/30 group-hover:scale-105 transition-transform">
                  {product.slug === 'life-smart-card' ? (
                    <CreditCard className="w-10 h-10" />
                  ) : product.slug === 'studynotepro' ? (
                    <BookOpen className="w-10 h-10" />
                  ) : product.slug === 'learnxcel' ? (
                    <Laptop className="w-10 h-10" />
                  ) : product.slug === 'talenthub' ? (
                    <Users className="w-10 h-10" />
                  ) : product.slug === 'linkx' ? (
                    <QrCode className="w-10 h-10" />
                  ) : (
                    <Cpu className="w-10 h-10" />
                  )}
                </div>
                <div className="font-heading font-bold text-white text-sm">
                  {product.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Official OpenFrame Platform
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. MAIN BODY CONTENT */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
        
        {/* SECTION A: PRODUCT OVERVIEW & PROBLEM IT ADDRESSES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Detailed Overview */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
              Product Overview
            </span>
            <h2 className="text-2xl font-heading font-bold text-slate-900">
              Architected for Real-World Utility
            </h2>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {product.description}
            </p>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Platform Category</span>
                <span className="font-medium text-slate-900">{product.category}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Deployment Model</span>
                <span className="font-medium text-slate-900">Cloud Web & Dual-NFC/QR Hardware</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Availability</span>
                <span className="font-medium text-blue-600">{product.status}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Engineering Status</span>
                <span className="font-medium text-slate-900">Production / Internal Standard</span>
              </div>
            </div>
          </div>

          {/* Problem It Addresses Box */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-[#0B1930] rounded-2xl border border-slate-800 p-8 text-white shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
              <AlertCircle className="w-4 h-4" />
              <span>The Problem It Solves</span>
            </div>
            
            <h3 className="text-lg font-heading font-bold text-white">
              Why We Engineered {product.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {product.problemSolved}
            </p>

            <div className="pt-3 border-t border-slate-800 text-xs text-slate-400">
              <strong className="text-slate-200">Impact Focus:</strong> Designed to eliminate operational friction and save critical turnaround time for organizations and everyday users.
            </div>
          </div>

        </div>

        {/* SECTION B: SCREENSHOT / INTERACTIVE UI MOCKUP PLACEHOLDER */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Visual Interface & Architecture
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 mt-0.5">
                {product.name} Workflow Preview
              </h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 self-start sm:self-auto">
              Simulated UI Mockup
            </span>
          </div>

          {/* Interactive UI Mockup Frame */}
          <div className="mt-8 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            {/* Window bar */}
            <div className="bg-slate-950 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                <span className="text-[11px] font-mono text-slate-400 ml-2">
                  openframe-platform://{product.slug}.app
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                STATUS: {product.status.toUpperCase()}
              </span>
            </div>

            {/* Inner Mockup View based on Product */}
            <div className="p-6 sm:p-10 text-white">
              {product.slug === 'life-smart-card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Physical Card Representation */}
                  <div className="aspect-[1.58/1] rounded-2xl bg-gradient-to-tr from-blue-900 via-sky-800 to-indigo-900 p-6 flex flex-col justify-between border border-sky-400/30 shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between">
                      <span className="font-heading font-extrabold text-white text-base tracking-wider">
                        LIFE SMART CARD
                      </span>
                      <Radio className="w-6 h-6 text-sky-300" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-sky-200 uppercase tracking-wider">EMERGENCY ACCESS TOKEN</div>
                      <div className="font-mono text-xs tracking-widest text-white">OF-9948 • NFC / QR ENABLED</div>
                    </div>
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-sky-300 uppercase">Emergency Profile</div>
                        <div className="font-bold text-xs text-white">Tap / Scan for Paramedic Info</div>
                      </div>
                      <div className="w-10 h-10 bg-white rounded-lg p-1 flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-slate-900" />
                      </div>
                    </div>
                  </div>

                  {/* Emergency View Preview */}
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Instant Emergency View (No App Required)</span>
                    </div>
                    <div className="bg-red-950/60 border border-red-800/80 p-3 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-red-200">Critical Medical Disclosures</div>
                      <div className="text-red-300 text-[11px]">Blood Group: O+ Positive · Penicillin Allergy</div>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg text-xs space-y-1">
                      <div className="font-semibold text-slate-300">Verified Guardian Contacts</div>
                      <div className="text-slate-400 text-[11px] font-mono">Father: +91 98450 XXXXX · Auto-Alert Activated</div>
                    </div>
                  </div>
                </div>
              ) : product.slug === 'studynotepro' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-sky-400 uppercase block">1. Syllabus Tree</span>
                    <div className="p-2 bg-slate-900 rounded text-slate-300 font-medium">Physics 101</div>
                    <div className="p-2 bg-slate-900/60 rounded text-slate-400 pl-4">↳ Unit 2: Thermodynamics</div>
                    <div className="p-2 bg-blue-950/80 rounded text-sky-300 pl-6 border border-blue-800">↳ Carnot Cycle Notes</div>
                  </div>
                  <div className="md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
                      <span>Carnot Engine Efficiency · LaTeX Formula</span>
                      <span className="text-sky-400 font-mono">η = 1 - (T_C / T_H)</span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Active summary automatically derived from highlight notes. Spaced repetition flashcard scheduled in 48 hours before class examination.
                    </p>
                    <div className="flex items-center gap-2 pt-2">
                      <span className="px-2.5 py-1 rounded bg-blue-900/60 text-sky-300 text-[11px] font-semibold border border-blue-700/60">
                        Recall Flashcard Active
                      </span>
                      <span className="px-2.5 py-1 rounded bg-slate-900 text-slate-400 text-[11px]">
                        Sync: Up-to-date
                      </span>
                    </div>
                  </div>
                </div>
              ) : product.slug === 'learnxcel' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span className="text-sky-400 font-bold">Course: Enterprise Python & Data Architecture</span>
                    <span className="font-mono">Batch 2026-A · 84% Completed</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Interactive Video Lab</div>
                      <div className="font-semibold text-white mt-1">Lesson 6: Asynchronous Workers</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Coding Sandbox</div>
                      <div className="font-semibold text-emerald-400 mt-1">8/8 Test Cases Passing</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">Faculty Gradebook</div>
                      <div className="font-semibold text-sky-400 mt-1">Grade: A+ (Verified)</div>
                    </div>
                  </div>
                </div>
              ) : product.slug === 'talenthub' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                    <span className="text-sky-400 font-bold">Campus Drive Pipeline Board</span>
                    <span className="font-mono">Visiting: Apex Cloud Technologies</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase">Eligible Candidates</div>
                      <div className="font-bold text-white text-base">142 Students</div>
                      <div className="text-[11px] text-slate-400">Criteria: CGPA &gt; 7.5</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase">Aptitude Cleared</div>
                      <div className="font-bold text-sky-400 text-base">48 Shortlisted</div>
                      <div className="text-[11px] text-slate-400">Proctored Code Benchmark</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase">Interview Scheduling</div>
                      <div className="font-bold text-emerald-400 text-base">16 Slots Booked</div>
                      <div className="text-[11px] text-slate-400">Rounds 1 & 2 Live</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
                    <div className="text-xs font-bold text-sky-400 uppercase">LinkX Contact Card Preview</div>
                    <div className="font-heading font-bold text-base text-white">Ananya Sharma</div>
                    <div className="text-xs text-slate-400">Senior Systems Architect · OpenFrame IT Solutions</div>
                    <div className="pt-2 flex gap-2">
                      <span className="px-3 py-1 bg-blue-600 rounded text-xs font-semibold">Save Contact (.vcf)</span>
                      <span className="px-3 py-1 bg-slate-800 rounded text-xs text-slate-300">LinkedIn</span>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs space-y-2 text-slate-300">
                    <div className="font-bold text-white uppercase text-[11px]">Paperless NFC Networking</div>
                    <p className="leading-relaxed text-slate-400">
                      Dynamic business profile with instant vCard synchronization. Any smartphone can save full contacts with one tap, requiring zero app downloads.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION C: FEATURES AND BENEFITS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Key Features */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h3 className="font-heading font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Key Features</span>
            </h3>

            <div className="space-y-4">
              {product.keyFeatures.map((feat, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 font-mono text-[11px] font-bold">
                    ✓
                  </div>
                  <span className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    {feat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h3 className="font-heading font-bold text-xl text-slate-900 mb-6 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Measurable Benefits</span>
            </h3>

            <div className="space-y-4">
              {product.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SECTION D: HOW IT WORKS (3-STEP ROADMAP) */}
        <div id="how-it-works" className="bg-slate-100/70 rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Operational Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-1">
              How {product.name} Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Step-by-step architecture from onboarding to live execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {product.howItWorks.map((step) => (
              <div
                key={step.step}
                className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 relative flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-mono font-bold text-sm flex items-center justify-center mb-4 shadow-sm">
                    0{step.step}
                  </div>
                  <h3 className="font-heading font-bold text-slate-900 text-base">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION E: TARGET USERS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-heading font-bold text-xl text-slate-900">
              Intended & Target Users
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            {product.name} is specifically engineered to meet the operational demands of the following stakeholders:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {product.targetUsers.map((user, i) => (
              <div
                key={i}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span className="text-xs text-slate-800 font-medium leading-relaxed">
                  {user}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION F: FREQUENTLY ASKED QUESTIONS */}
        {product.faqs && product.faqs.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl font-heading font-bold text-slate-900 mt-1">
                Questions Regarding {product.name}
              </h2>
            </div>

            <div className="space-y-3 max-w-3xl mx-auto">
              {product.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full px-5 py-4 text-left font-semibold text-xs sm:text-sm text-slate-900 bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-blue-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 py-4 text-xs sm:text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION G: FINAL ENQUIRY CALL TO ACTION */}
        <div className="bg-gradient-to-r from-[#071326] via-[#0B1930] to-[#0D234A] rounded-3xl p-8 sm:p-12 text-white border border-blue-900 shadow-xl text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-blue-900/60 px-3 py-1 rounded-full border border-blue-700/60 inline-block">
            {product.status === 'Available' ? 'Ready for Deployment' : 'Register Early Interest'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-white">
            Interested in {product.name}?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Speak directly with the OpenFrame product engineering team. Request a tailored demonstration, pilot testing schedule, or institutional onboarding briefing.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setIsEnquiryModalOpen(true)}
              className="px-8 py-3.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Enquire About {product.name}</span>
            </button>

            <Link
              to="/products"
              className="px-6 py-3.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700"
            >
              Browse Other Products
            </Link>
          </div>
        </div>

      </div>

      {/* Product Enquiry Modal */}
      <ProductEnquiryModal
        isOpen={isEnquiryModalOpen}
        onClose={() => setIsEnquiryModalOpen(false)}
        preselectedProduct={product}
      />
    </div>
  );
};
