import React, { useState, useEffect } from 'react';
import { HopeNestSubNav } from '../components/hopenest/HopeNestSubNav';
import { storageService } from '../services/storageService';
import { HopeNestUpdate } from '../types';
import {
  BellRing,
  Calendar,
  MapPin,
  Tag,
  ArrowRight,
  Filter,
  FileText
} from 'lucide-react';

export const HopeNestUpdatesPage: React.FC = () => {
  const [updates, setUpdates] = useState<HopeNestUpdate[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('All');

  useEffect(() => {
    setUpdates(storageService.getHopeNestUpdates());
  }, []);

  const categories = ['All', 'ASHA Programme', 'Animal Welfare', 'Health & Wellbeing', 'Educational Support', 'Digital Literacy'];

  const filtered = updates.filter(u => {
    if (filterCategory === 'All') return true;
    return u.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HopeNestSubNav />

      {/* Hero */}
      <section className="bg-gradient-to-b from-[#021f24] to-[#06333a] text-white py-14 px-4 sm:px-6 lg:px-8 border-b border-teal-900">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold tracking-wider uppercase">
            <BellRing className="w-3.5 h-3.5" />
            Field Reports & Activities
          </div>
          <h1 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            Foundation Updates & Community Bulletin
          </h1>
          <p className="text-sm sm:text-base text-teal-100 max-w-3xl leading-relaxed">
            Transparent records of our recent workshops, grassroots camps, animal hydration drives, and educational support activities.
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1">
        
        {/* Category Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1 hidden sm:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                filterCategory === cat
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Updates Feed */}
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200 text-slate-500 text-xs">
              No updates currently recorded under this category.
            </div>
          ) : (
            filtered.map((item) => (
              <article
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm hover:border-teal-300 transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center gap-1.5 font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60">
                      <Tag className="w-3.5 h-3.5" />
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(item.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  {item.location && (
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.location}
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs text-slate-400">
                  <span>HopeNest Ground Team Field Record</span>
                  <span className="text-teal-700 font-semibold">Verified Activity</span>
                </div>
              </article>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
