import React, { useState, useEffect } from 'react';
import { Link } from '../router/RouterContext';
import {
  BookOpen,
  ArrowRight,
  Search,
  Calendar,
  Clock,
  User,
  Tag,
  Sparkles,
  TrendingUp,
  Filter,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { BlogPost, BlogCategory } from '../types';

export const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Only published articles appear for visitors
    const published = storageService.getPublishedBlogPosts();
    setPosts(published);
    document.title = 'OpenFrame Blog, News & Knowledge Centre | Official Corporate Insights';
  }, []);

  const categories: string[] = [
    'All',
    'Technology',
    'Software Development',
    'Artificial Intelligence',
    'Digital Transformation',
    'Education',
    'Skill Development',
    'Career Guidance',
    'Entrepreneurship',
    'Company News',
    'HopeNest Foundation Updates'
  ];

  // Filtering logic
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      post.category.toLowerCase() === selectedCategory.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      (post.shortDescription && post.shortDescription.toLowerCase().includes(q)) ||
      post.author.toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q));

    return matchesCategory && matchesSearch;
  });

  const featuredPost = posts.find((p) => p.isFeatured) || posts[0];
  const popularPosts = posts.filter((p) => p.isPopular).slice(0, 3);
  const regularPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id || selectedCategory !== 'All' || searchQuery !== '');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0D234A] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/60 border border-blue-600/40 text-sky-300 text-xs font-semibold tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Knowledge Centre & Corporate Bulletin</span>
          </div>
          
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white tracking-tight leading-tight">
              OpenFrame Blog, News & Technical Insights
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              In-depth engineering blueprints, modern software architecture, practical pedagogy perspectives, and updates from across our corporate divisions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
        
        {/* 1. Featured Article Hero (When no category filter or search active) */}
        {selectedCategory === 'All' && searchQuery.trim() === '' && featuredPost && (
          <section aria-labelledby="featured-article-heading" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:border-blue-400 transition-all group">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Featured Analysis
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      {featuredPost.category}
                    </span>
                    <span className="text-xs text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-600" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <h2 id="featured-article-heading" className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                    <Link to={`/blog/${featuredPost.slug}`}>
                      {featuredPost.title}
                    </Link>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {featuredPost.tags.map((tag, idx) => (
                      <span key={idx} className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                      {featuredPost.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{featuredPost.author}</div>
                      <div className="text-[11px] text-slate-600">{featuredPost.authorRole}</div>
                    </div>
                  </div>

                  <Link
                    to={`/blog/${featuredPost.slug}`}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Read Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 bg-slate-100 relative min-h-[260px] lg:min-h-full overflow-hidden">
                <img
                  src={featuredPost.featuredImageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80'}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            </div>
          </section>
        )}

        {/* 2. Popular Reads Carousel / Grid */}
        {selectedCategory === 'All' && searchQuery.trim() === '' && popularPosts.length > 0 && (
          <section aria-labelledby="popular-articles-heading" className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 id="popular-articles-heading" className="text-sm font-heading font-bold text-slate-900 uppercase tracking-wider">
                Popular in Engineering & Pedagogy
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {post.category}
                      </span>
                      <span>{post.readTime}</span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-600">{post.author}</span>
                    <Link
                      to={`/blog/${post.slug}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Read</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Search and Category Filters Bar */}
        <section aria-labelledby="filter-section-heading" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search articles, keywords, or authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-600 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-600 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="text-xs text-slate-600 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredPosts.length}</span> published article{filteredPosts.length === 1 ? '' : 's'}
            </div>
          </div>

          {/* 10 Category Segment Filter Chips */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <Filter className="w-3.5 h-3.5 text-slate-600 shrink-0 mr-1 hidden sm:block" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Article Grid */}
        <section aria-labelledby="all-articles-heading" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 id="all-articles-heading" className="text-base sm:text-lg font-heading font-bold text-slate-900">
              {selectedCategory === 'All' ? 'Latest Publications & Analysis' : `${selectedCategory} Articles`}
            </h3>
            {searchQuery && (
              <span className="text-xs text-slate-600">
                Matches for "<strong className="text-slate-800">{searchQuery}</strong>"
              </span>
            )}
          </div>

          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-600 space-y-3">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No articles match your search criteria</p>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Try clearing your search query or selecting a different category filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="mt-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
                >
                  {/* Article Thumbnail Image */}
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={post.featuredImageUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[#0B1930]/90 text-sky-300 backdrop-blur-xs shadow-xs">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          {new Date(post.publishedDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-600" />
                          {post.readTime}
                        </span>
                      </div>

                      <h4 className="font-heading font-bold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                        <Link to={`/blog/${post.slug}`}>
                          {post.title}
                        </Link>
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-700">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                            {post.author.charAt(0)}
                          </div>
                          <span className="text-[11px] font-medium truncate max-w-[120px]">{post.author}</span>
                        </div>

                        <Link
                          to={`/blog/${post.slug}`}
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 group/btn"
                        >
                          <span>Read More</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Knowledge Centre Transparency Note */}
        <section className="bg-slate-100 rounded-xl p-5 border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>OpenFrame Editorial Disclosure:</strong> All articles represent technical perspectives, architecture analyses, and curriculum updates created by OpenFrame IT Solutions team members.
            </span>
          </div>
          <Link
            to="/admin"
            className="text-blue-700 hover:text-blue-900 font-semibold shrink-0"
          >
            Author / Admin Portal →
          </Link>
        </section>

      </main>
    </div>
  );
};
