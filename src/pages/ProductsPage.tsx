import React, { useState, useMemo } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import {
  Layers,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Cpu,
  Search,
  Filter,
  Send,
  Sparkles,
  CreditCard,
  BookOpen,
  Laptop,
  Users,
  QrCode,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { DigitalProduct } from '../types';
import { ProductEnquiryModal } from '../components/products/ProductEnquiryModal';

export const ProductsPage: React.FC = () => {
  const { navigate } = useRouter();

  const [products, setProducts] = useState<DigitalProduct[]>(() => storageService.getProducts());
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [selectedProductForEnquiry, setSelectedProductForEnquiry] = useState<DigitalProduct | undefined>(undefined);

  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchStatus =
        selectedStatusFilter === 'All' || prod.status === selectedStatusFilter;

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        prod.name.toLowerCase().includes(query) ||
        prod.shortDesc.toLowerCase().includes(query) ||
        prod.intendedUsers.toLowerCase().includes(query) ||
        prod.keyFeatures.some(f => f.toLowerCase().includes(query));

      return matchStatus && matchSearch;
    });
  }, [products, selectedStatusFilter, searchQuery]);

  const handleOpenEnquiry = (prod: DigitalProduct) => {
    setSelectedProductForEnquiry(prod);
    setEnquiryModalOpen(true);
  };

  const getStatusBadge = (status: DigitalProduct['status']) => {
    switch (status) {
      case 'Available':
        return {
          label: 'Available',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500'
        };
      case 'In Development':
        return {
          label: 'In Development',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          dotClass: 'bg-amber-500'
        };
      case 'Coming Soon':
      default:
        return {
          label: 'Coming Soon',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          dotClass: 'bg-blue-500'
        };
    }
  };

  const getProductIcon = (slug: string) => {
    switch (slug) {
      case 'life-smart-card':
        return <CreditCard className="w-6 h-6" />;
      case 'studynotepro':
        return <BookOpen className="w-6 h-6" />;
      case 'learnxcel':
        return <Laptop className="w-6 h-6" />;
      case 'talenthub':
        return <Users className="w-6 h-6" />;
      case 'linkx':
        return <QrCode className="w-6 h-6" />;
      default:
        return <Cpu className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* 1. HERO BANNER */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white pt-20 pb-20 px-4 sm:px-6 lg:px-8 border-b border-blue-950 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-900/60 border border-blue-700/60 text-sky-300 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>OpenFrame Digital Platforms & Hardware</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white tracking-tight leading-tight">
            Our Proprietary Products
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Purpose-built technology solutions engineered by OpenFrame IT Solutions: smart contactless emergency cards, intelligent academic revision tools, adaptive learning portals, campus recruitment boards, and paperless digital identity platforms.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('catalogue-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>Explore Products Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                setSelectedProductForEnquiry(products[0]);
                setEnquiryModalOpen(true);
              }}
              className="px-6 py-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider transition-colors"
            >
              General Product Enquiry
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRODUCTS CATALOGUE */}
      <section id="catalogue-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Filter and Search Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm mb-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, feature, or keyword..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Segmented Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
              {['All', 'Available', 'In Development', 'Coming Soon'].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    selectedStatusFilter === st
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No products matching your search</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Try adjusting your search terms or resetting the availability filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatusFilter('All');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((prod) => {
              const status = getStatusBadge(prod.status);
              const icon = getProductIcon(prod.slug);

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Row: Icon + Status Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                        {icon}
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${status.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dotClass}`} />
                        <span>{status.label}</span>
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 className="font-heading font-bold text-xl text-slate-900 group-hover:text-blue-600 transition-colors">
                      {prod.name}
                    </h3>

                    {/* Tagline */}
                    <div className="text-xs font-semibold text-blue-600 mt-1">
                      {prod.tagline}
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                      {prod.shortDesc}
                    </p>

                    {/* Key Features */}
                    <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Key Features:
                      </span>
                      <ul className="space-y-1.5">
                        {prod.keyFeatures.slice(0, 3).map((feat, i) => (
                          <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Intended Users */}
                    <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <strong className="text-slate-700">Intended Users:</strong> {prod.intendedUsers}
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <Link
                      to={`/products/${prod.slug}`}
                      className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors text-center inline-flex items-center justify-center gap-1.5"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenEnquiry(prod)}
                      className="px-3.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs text-center inline-flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3 h-3" />
                      <span>Enquire Now</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </section>

      {/* 3. PLATFORM ARCHITECTURE & TRANSPARENCY NOTICE */}
      <section className="py-16 bg-[#0B1930] text-white border-t border-blue-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-900/60 text-sky-400 flex items-center justify-center mb-3 border border-blue-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-white text-base">Verified Architecture</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Platforms adhere to strict security benchmarks, encrypted identity tokens, and multi-tenant cloud isolation standards.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-900/60 text-sky-400 flex items-center justify-center mb-3 border border-blue-800">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-white text-base">Transparent Development</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Products marked 'In Development' or 'Coming Soon' are strictly reflected as non-launched with early pilot registration open for partners.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-blue-900/60 text-sky-400 flex items-center justify-center mb-3 border border-blue-800">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-bold text-white text-base">Institutional Partnerships</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Schools, universities, and enterprise fleets can arrange bespoke pilot deployments and localized technical walkthroughs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry Modal */}
      <ProductEnquiryModal
        isOpen={enquiryModalOpen}
        onClose={() => setEnquiryModalOpen(false)}
        preselectedProduct={selectedProductForEnquiry}
      />
    </div>
  );
};
