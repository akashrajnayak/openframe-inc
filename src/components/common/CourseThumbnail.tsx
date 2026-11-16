import React, { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { getCategoryFallbackImage } from '../../data/marketplaceCatalogData';

interface CourseThumbnailProps {
  src?: string;
  alt: string;
  category?: string;
  categoryGroup?: string;
  youtubeVideoId?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * Optimized, fault-tolerant course thumbnail renderer for desktop and mobile.
 * Rejects legacy SVG placeholders, gracefully falls back across YouTube thumbnail
 * resolutions -> local category JPG -> styled gradient fallback (zero broken images).
 */
export const CourseThumbnail: React.FC<CourseThumbnailProps> = ({
  src,
  alt,
  category = 'Artificial Intelligence',
  categoryGroup = 'Technology',
  youtubeVideoId,
  className = 'w-full h-full object-cover',
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
}) => {
  const localFallback = getCategoryFallbackImage(category, categoryGroup);

  const normalizeInitialSrc = (raw?: string): string => {
    const clean = (raw || '').trim();
    if (clean && !clean.endsWith('.svg') && !clean.includes('/of_ai_')) {
      return clean;
    }
    if (youtubeVideoId && /^[A-Za-z0-9_-]{11}$/.test(youtubeVideoId)) {
      return `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;
    }
    return localFallback;
  };

  const [currentSrc, setCurrentSrc] = useState<string>(() => normalizeInitialSrc(src));
  const [stage, setStage] = useState<'primary' | 'yt_hq' | 'local' | 'css_fallback'>('primary');

  useEffect(() => {
    setCurrentSrc(normalizeInitialSrc(src));
    setStage('primary');
  }, [src, youtubeVideoId, category, categoryGroup]);

  const handleError = () => {
    if (
      stage === 'primary' &&
      youtubeVideoId &&
      /^[A-Za-z0-9_-]{11}$/.test(youtubeVideoId) &&
      !currentSrc.includes(`/vi/${youtubeVideoId}/hqdefault.jpg`)
    ) {
      setStage('yt_hq');
      setCurrentSrc(`https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`);
      return;
    }
    if ((stage === 'primary' || stage === 'yt_hq') && currentSrc !== localFallback) {
      setStage('local');
      setCurrentSrc(localFallback);
      return;
    }
    setStage('css_fallback');
  };

  if (stage === 'css_fallback') {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 text-cyan-300/80 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <BookOpen className="w-8 h-8 mb-1 opacity-75" />
        <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-300 px-3 text-center line-clamp-1">
          {category}
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      referrerPolicy="no-referrer"
      onError={handleError}
      className={className}
    />
  );
};
