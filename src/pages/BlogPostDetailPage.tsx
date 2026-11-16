import React, { useState, useEffect } from 'react';
import { useRouter, Link } from '../router/RouterContext';
import { storageService } from '../services/storageService';
import { BlogPost } from '../types';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Check,
  Copy,
  ExternalLink,
  BookOpen,
  Sparkles,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const BlogPostDetailPage: React.FC = () => {
  const { currentPath, navigate } = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [copied, setCopied] = useState(false);

  // Extract slug from /blog/some-slug
  const slug = currentPath.replace(/^\/blog\//, '').split('?')[0].split('#')[0];

  useEffect(() => {
    if (!slug) return;
    const found = storageService.getBlogPostBySlug(slug);
    if (found) {
      setPost(found);

      // Set Document Title and SEO Meta dynamically per Applet SEO skill
      const pageTitle = found.seoTitle || `${found.title} | OpenFrame Knowledge Centre`;
      document.title = pageTitle;

      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute(
        'content',
        found.seoMetaDescription || found.excerpt || found.title
      );

      // Find related posts (same category or popular, excluding current)
      const allPublished = storageService.getPublishedBlogPosts();
      const related = allPublished
        .filter((p) => p.id !== found.id)
        .sort((a, b) => {
          if (a.category === found.category && b.category !== found.category) return -1;
          if (b.category === found.category && a.category !== found.category) return 1;
          return 0;
        })
        .slice(0, 3);
      setRelatedPosts(related);
    } else {
      setPost(null);
      document.title = 'Article Not Found | OpenFrame Knowledge Centre';
    }
  }, [slug]);

  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    } else {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const encodedShareUrl = encodeURIComponent(shareUrl);
  const twitterShareHref = post
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${post.title} — via OpenFrame IT Solutions`)}&url=${encodedShareUrl}`
    : '#';
  const linkedInShareHref = post
    ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodedShareUrl}`
    : '#';
  const whatsappShareHref = post
    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(`Read this article on OpenFrame: ${post.title} ${shareUrl}`)}`
    : '#';

  if (!post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-slate-50">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-2xl mb-4 border border-blue-200">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-slate-900">
          Article Not Found
        </h1>
        <p className="text-xs text-slate-500 mt-2 max-w-md">
          The requested article (<code className="text-blue-600 font-mono">{slug}</code>) may have been relocated, unpublished, or has not yet been approved.
        </p>
        <Link
          to="/blog"
          className="mt-6 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs uppercase tracking-wide transition-colors"
        >
          ← Return to Blog & Knowledge Centre
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation & Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8 sticky top-16 z-20 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            to="/blog"
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
              {post.category}
            </span>
          </div>
        </div>
      </nav>

      {/* Article Header & Main Area */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8 w-full">
        
        {/* Header Details */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Published: {new Date(post.publishedDate).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
            {post.updatedDate && post.updatedDate !== post.publishedDate && (
              <>
                <span>·</span>
                <span className="text-slate-400">
                  Updated: {new Date(post.updatedDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </>
            )}
            <span>·</span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-slate-900 leading-tight tracking-tight">
            {post.title}
          </h1>

          {/* Author Block & Social Share Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                {post.author.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{post.author}</div>
                <div className="text-xs text-slate-500">{post.authorRole}</div>
              </div>
            </div>

            {/* Social Share Bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1 hidden sm:inline">Share:</span>
              
              <button
                type="button"
                onClick={handleCopyLink}
                title="Copy Article Link"
                className={`p-2 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                  copied
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span className="text-[11px]">{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={linkedInShareHref}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on LinkedIn"
                className="p-2 rounded-lg bg-white border border-slate-200 text-[#0077b5] hover:bg-blue-50 transition-colors"
                aria-label="Share on LinkedIn"
              >
                <Share2 className="w-4 h-4" />
              </a>

              <a
                href={twitterShareHref}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on X / Twitter"
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors"
                aria-label="Share on Twitter"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={whatsappShareHref}
                target="_blank"
                rel="noopener noreferrer"
                title="Share on WhatsApp"
                className="p-2 rounded-lg bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 transition-colors"
                aria-label="Share on WhatsApp"
              >
                <span className="font-bold text-xs">WA</span>
              </a>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featuredImageUrl && (
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100 max-h-[460px]">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover max-h-[460px]"
            />
          </div>
        )}

        {/* Key Takeaways Callout Card */}
        <div className="bg-blue-50/60 rounded-2xl p-6 sm:p-7 border border-blue-200/80 space-y-2">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Executive Summary</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {post.excerpt}
          </p>
        </div>

        {/* Main Article Content */}
        <section className="space-y-6 text-sm sm:text-base text-slate-800 leading-relaxed pt-2">
          {post.content.map((paragraph, index) => (
            <p key={index} className="leading-relaxed">
              {paragraph}
            </p>
          ))}
        </section>

        {/* Tags */}
        <div className="pt-6 border-t border-slate-200 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Categorized Topics
          </div>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-3 py-1 rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Author Bio Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-14 h-14 rounded-xl bg-[#0B1930] text-sky-400 font-bold flex items-center justify-center text-lg shrink-0">
            {post.author.charAt(0)}
          </div>
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-base text-slate-900">
              Published by {post.author}
            </h4>
            <p className="text-xs text-slate-600 font-medium">
              {post.authorRole} · OpenFrame IT Solutions Private Limited
            </p>
            <p className="text-xs text-slate-500 leading-relaxed pt-1">
              Contributing technical analyses, engineering architecture best practices, and learning design perspectives from Bengaluru, Karnataka.
            </p>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="pt-8 border-t border-slate-200 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Knowledge Network</span>
                <h3 className="text-xl font-heading font-bold text-slate-900 mt-1">
                  Related Analysis & Articles
                </h3>
              </div>
              <Link
                to="/blog"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View All Articles</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {rel.category}
                      </span>
                      <span>{rel.readTime}</span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-slate-900 leading-snug line-clamp-2 hover:text-blue-600 transition-colors">
                      <Link to={`/blog/${rel.slug}`}>
                        {rel.title}
                      </Link>
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {rel.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-500 truncate max-w-[120px]">{rel.author}</span>
                    <Link
                      to={`/blog/${rel.slug}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Read Article</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back to Blog Button */}
        <div className="pt-6 flex justify-center">
          <Link
            to="/blog"
            className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Knowledge Centre Homepage</span>
          </Link>
        </div>

      </article>
    </div>
  );
};
