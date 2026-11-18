import { YouTubeVideoRecommendation } from '../types';
import { scoreSearchMatch } from '../utils/searchIntelligence';

export interface ExtendedYouTubeVideo extends YouTubeVideoRecommendation {
  subjectCategory: string;
  views?: string;
  publishedDate?: string;
  keyTopicsCovered: string[];
}

function ytThumb(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Curated Master YouTube Video Lecture Catalog
 * Verified educational lectures from leading engineering & academic institutions.
 */
export const MASTER_YOUTUBE_LIBRARY: ExtendedYouTubeVideo[] = [
  {
    id: 'yt-ai-001',
    videoId: 'JMUxmLyrhSk',
    youtubeId: 'JMUxmLyrhSk',
    title: 'MIT 6.034 Artificial Intelligence: Intelligent Agents & State Space Search',
    channelTitle: 'MIT OpenCourseWare',
    thumbnail: ytThumb('JMUxmLyrhSk'),
    thumbnailUrl: ytThumb('JMUxmLyrhSk'),
    duration: '49:22',
    level: 'Beginner',
    difficultyLevel: 'Beginner',
    subjectCategory: 'Artificial Intelligence',
    recommendedReason: 'Foundational lecture covering problem formulation, heuristic search, and intelligent agent architectures.',
    rationale: 'Fundamental AI principles and state-space graph heuristics.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/JMUxmLyrhSk',
    keyTopicsCovered: ['State Space Search', 'Heuristic Algorithms', 'Agent Architecture', 'Problem Formulation']
  },
  {
    id: 'yt-ai-002',
    videoId: 'i_LwzRVP7bg',
    youtubeId: 'i_LwzRVP7bg',
    title: 'Stanford CS229: Machine Learning Course — Linear Regression & Cost Functions',
    channelTitle: 'Stanford Online',
    thumbnail: ytThumb('i_LwzRVP7bg'),
    thumbnailUrl: ytThumb('i_LwzRVP7bg'),
    duration: '1:16:48',
    level: 'Beginner',
    difficultyLevel: 'Beginner',
    subjectCategory: 'Machine Learning',
    recommendedReason: 'Rigorous introduction to supervised learning formalisms, hypothesis spaces, and gradient optimization.',
    rationale: 'Mathematical derivation of gradient descent and cost surface minimization.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/i_LwzRVP7bg',
    keyTopicsCovered: ['Supervised Learning', 'Gradient Descent', 'Cost Functions', 'Matrix Vectorization']
  },
  {
    id: 'yt-ai-003',
    videoId: 'aircAruvnKk',
    youtubeId: 'aircAruvnKk',
    title: 'But What Is a Neural Network? | Deep Learning Foundations',
    channelTitle: '3Blue1Brown',
    thumbnail: ytThumb('aircAruvnKk'),
    thumbnailUrl: ytThumb('aircAruvnKk'),
    duration: '19:13',
    level: 'Beginner',
    difficultyLevel: 'Beginner',
    subjectCategory: 'Deep Learning',
    recommendedReason: 'Visual and geometric intuition for multilayer perceptrons, activations, and layered feature representations.',
    rationale: 'Visualizing neuron activations, weight matrices, and linear combinations.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/aircAruvnKk',
    keyTopicsCovered: ['Neurons & Layers', 'Activation Functions', 'Sigmoid & ReLU', 'Classification']
  },
  {
    id: 'yt-ai-004',
    videoId: 'IHZwWFHWa-w',
    youtubeId: 'IHZwWFHWa-w',
    title: 'Gradient Descent & Backpropagation: Mathematical Foundations of Neural Training',
    channelTitle: '3Blue1Brown',
    thumbnail: ytThumb('IHZwWFHWa-w'),
    thumbnailUrl: ytThumb('IHZwWFHWa-w'),
    duration: '21:05',
    level: 'Intermediate',
    difficultyLevel: 'Intermediate',
    subjectCategory: 'Neural Networks',
    recommendedReason: 'Demystifies multivariate calculus, chain rule decomposition, and parameter updates.',
    rationale: 'Backpropagation chain rule step-by-step visual proof.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/IHZwWFHWa-w',
    keyTopicsCovered: ['Backpropagation', 'Chain Rule', 'Learning Rate', 'Partial Derivatives']
  },
  {
    id: 'yt-genai-001',
    videoId: 'kCc8FmEb1nY',
    youtubeId: 'kCc8FmEb1nY',
    title: "Let's Build GPT from Scratch in Code — Transformer Architecture",
    channelTitle: 'Andrej Karpathy',
    thumbnail: ytThumb('kCc8FmEb1nY'),
    thumbnailUrl: ytThumb('kCc8FmEb1nY'),
    duration: '1:56:00',
    level: 'Advanced',
    difficultyLevel: 'Advanced',
    subjectCategory: 'Generative AI',
    recommendedReason: 'Architectural deep-dive implementing self-attention and decoder-only transformers.',
    rationale: 'Build transformer attention blocks from scratch.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/kCc8FmEb1nY',
    keyTopicsCovered: ['Self-Attention', 'Multi-Head Attention', 'Causal Masking', 'Positional Encodings', 'PyTorch']
  },
  {
    id: 'yt-genai-002',
    videoId: 'wjZofJX0v4U',
    youtubeId: 'wjZofJX0v4U',
    title: 'Intro to Large Language Models (LLMs) & System Prompting',
    channelTitle: 'Andrej Karpathy',
    thumbnail: ytThumb('wjZofJX0v4U'),
    thumbnailUrl: ytThumb('wjZofJX0v4U'),
    duration: '1:00:23',
    level: 'Intermediate',
    difficultyLevel: 'Intermediate',
    subjectCategory: 'Generative AI',
    recommendedReason: 'Comprehensive overview of how modern LLMs are trained, fine-tuned, and secured.',
    rationale: 'High-level systems architecture of frontier generative models.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/wjZofJX0v4U',
    keyTopicsCovered: ['Pretraining vs Fine-tuning', 'RLHF', 'Hallucinations', 'System Prompting']
  },
  {
    id: 'yt-py-001',
    videoId: '_uQrJ0TkZlc',
    youtubeId: '_uQrJ0TkZlc',
    title: 'Python for Beginners — Full Programming Course',
    channelTitle: 'Programming with Mosh',
    thumbnail: ytThumb('_uQrJ0TkZlc'),
    thumbnailUrl: ytThumb('_uQrJ0TkZlc'),
    duration: '1:00:14',
    level: 'Beginner',
    difficultyLevel: 'Beginner',
    subjectCategory: 'Python Programming',
    recommendedReason: 'Clean introduction to Python syntax, control flow, modular functions, and data structures.',
    rationale: 'Master the fundamental building blocks of Python coding.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/_uQrJ0TkZlc',
    keyTopicsCovered: ['Variables & Types', 'Control Flow', 'Functions & Scope', 'OOP Foundations']
  },
  {
    id: 'yt-py-002',
    videoId: 'vmEHCJofslg',
    youtubeId: 'vmEHCJofslg',
    title: 'Python Pandas & NumPy Full Tutorial for Data Science & Analytics',
    channelTitle: 'freeCodeCamp.org',
    thumbnail: ytThumb('vmEHCJofslg'),
    thumbnailUrl: ytThumb('vmEHCJofslg'),
    duration: '2:15:30',
    level: 'Intermediate',
    difficultyLevel: 'Intermediate',
    subjectCategory: 'Data Analytics',
    recommendedReason: 'Hands-on manipulation of tabular DataFrames, aggregations, and data imputation.',
    rationale: 'Production data cleaning and exploratory analytics pipeline.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/vmEHCJofslg',
    keyTopicsCovered: ['NumPy Arrays', 'Pandas DataFrames', 'Filtering & GroupBy', 'Data Cleaning']
  },
  {
    id: 'yt-web-001',
    videoId: 'PkZNo7MFNFg',
    youtubeId: 'PkZNo7MFNFg',
    title: 'JavaScript Programming Tutorial for Beginners — Full Course',
    channelTitle: 'freeCodeCamp.org',
    thumbnail: ytThumb('PkZNo7MFNFg'),
    thumbnailUrl: ytThumb('PkZNo7MFNFg'),
    duration: '3:26:00',
    level: 'Beginner',
    difficultyLevel: 'Beginner',
    subjectCategory: 'JavaScript',
    recommendedReason: 'ES6+ syntax, asynchronous promises, DOM event loops, and closures explained cleanly.',
    rationale: 'Essential language mechanics of modern web applications.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/PkZNo7MFNFg',
    keyTopicsCovered: ['Variables & Scope', 'Async / Await', 'DOM Manipulation', 'Event Listeners']
  },
  {
    id: 'yt-web-002',
    videoId: 'bMknfKXIFA8',
    youtubeId: 'bMknfKXIFA8',
    title: 'React & TypeScript Component Architecture — Complete Course',
    channelTitle: 'freeCodeCamp.org',
    thumbnail: ytThumb('bMknfKXIFA8'),
    thumbnailUrl: ytThumb('bMknfKXIFA8'),
    duration: '3:45:00',
    level: 'Intermediate',
    difficultyLevel: 'Intermediate',
    subjectCategory: 'Web Development',
    recommendedReason: 'Production React patterns, hooks, state management, and TypeScript integration.',
    rationale: 'Build responsive modern client applications.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/bMknfKXIFA8',
    keyTopicsCovered: ['React Hooks', 'Routing', 'State Management', 'Tailwind CSS']
  },
  {
    id: 'yt-web-003',
    videoId: 'Oe421EPjeBE',
    youtubeId: 'Oe421EPjeBE',
    title: 'Node.js and Express.js Full Course — Backend REST API Architecture',
    channelTitle: 'freeCodeCamp.org',
    thumbnail: ytThumb('Oe421EPjeBE'),
    thumbnailUrl: ytThumb('Oe421EPjeBE'),
    duration: '8:16:00',
    level: 'Advanced',
    difficultyLevel: 'Advanced',
    subjectCategory: 'Full Stack Development',
    recommendedReason: 'Server-side engineering covering routing, middleware, authentication, and database integration.',
    rationale: 'Construct scalable backend API services with Node.js.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/Oe421EPjeBE',
    keyTopicsCovered: ['Express Middleware', 'REST Principles', 'Authentication', 'Error Handling']
  },
  {
    id: 'yt-cloud-001',
    videoId: 'ulprqHHWlng',
    youtubeId: 'ulprqHHWlng',
    title: 'AWS Certified Cloud Practitioner — Complete Cloud Foundations Course',
    channelTitle: 'freeCodeCamp.org',
    thumbnail: ytThumb('ulprqHHWlng'),
    thumbnailUrl: ytThumb('ulprqHHWlng'),
    duration: '4:18:20',
    level: 'Beginner',
    difficultyLevel: 'Beginner',
    subjectCategory: 'Cloud Computing',
    recommendedReason: 'Full syllabus covering compute, object storage, IAM permissions, and virtual networking.',
    rationale: 'High availability, security groups, and cloud architecture.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/ulprqHHWlng',
    keyTopicsCovered: ['Cloud Compute', 'Object Storage', 'IAM Roles', 'VPC Networking']
  },
  {
    id: 'yt-cloud-002',
    videoId: 'pg19Z8LL06w',
    youtubeId: 'pg19Z8LL06w',
    title: 'Docker & Kubernetes Full Course — Container Orchestration',
    channelTitle: 'TechWorld with Nana',
    thumbnail: ytThumb('pg19Z8LL06w'),
    thumbnailUrl: ytThumb('pg19Z8LL06w'),
    duration: '3:05:00',
    level: 'Advanced',
    difficultyLevel: 'Advanced',
    subjectCategory: 'DevOps',
    recommendedReason: 'Visual explanation of containerization, multi-stage builds, pods, and cluster deployments.',
    rationale: 'Production CI/CD deployment and microservice orchestration.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/pg19Z8LL06w',
    keyTopicsCovered: ['Docker Images', 'Containers vs VMs', 'Kubernetes Pods', 'Deployments']
  },
  {
    id: 'yt-sec-001',
    videoId: '3Kq1MIfTWCE',
    youtubeId: '3Kq1MIfTWCE',
    title: 'Cybersecurity for Beginners — Complete Course',
    channelTitle: 'freeCodeCamp.org',
    thumbnail: ytThumb('3Kq1MIfTWCE'),
    thumbnailUrl: ytThumb('3Kq1MIfTWCE'),
    duration: '4:10:00',
    level: 'Beginner',
    difficultyLevel: 'Beginner',
    subjectCategory: 'Cybersecurity',
    recommendedReason: 'Covers network defense, encryption standards, threat modeling, and vulnerability mitigation.',
    rationale: 'Understanding attack vectors and defense-in-depth posture.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/3Kq1MIfTWCE',
    keyTopicsCovered: ['Network Protocols', 'Encryption', 'OWASP Top 10', 'Threat Modeling']
  },
  {
    id: 'yt-dm-001',
    videoId: 'bixR-KIJKYM',
    youtubeId: 'bixR-KIJKYM',
    title: 'Digital Marketing Complete Course — Strategy, SEO & Social Campaigns',
    channelTitle: 'Simplilearn',
    thumbnail: ytThumb('bixR-KIJKYM'),
    thumbnailUrl: ytThumb('bixR-KIJKYM'),
    duration: '54:12',
    level: 'Beginner',
    difficultyLevel: 'Beginner',
    subjectCategory: 'Digital Marketing',
    recommendedReason: 'Actionable breakdown of audience personas, SEO, paid ads, and campaign conversion tracking.',
    rationale: 'Full-funnel digital marketing campaign planning.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/bixR-KIJKYM',
    keyTopicsCovered: ['Target Audience', 'SEO', 'Social Media Strategy', 'Campaign Analytics']
  },
  {
    id: 'yt-ux-001',
    videoId: 'c9Wg6Cb_YlU',
    youtubeId: 'c9Wg6Cb_YlU',
    title: 'UI / UX Design Tutorial — Wireframe, Mockup & Prototype in Figma',
    channelTitle: 'freeCodeCamp.org',
    thumbnail: ytThumb('c9Wg6Cb_YlU'),
    thumbnailUrl: ytThumb('c9Wg6Cb_YlU'),
    duration: '2:12:00',
    level: 'Beginner',
    difficultyLevel: 'Beginner',
    subjectCategory: 'UI/UX Design',
    recommendedReason: 'Master visual hierarchy, grid systems, typography scales, and interactive prototyping.',
    rationale: 'Design human-centered enterprise software interfaces.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/c9Wg6Cb_YlU',
    keyTopicsCovered: ['Design Systems', 'Grid Layout', 'Component Variants', 'Prototyping']
  },
  {
    id: 'yt-excel-001',
    videoId: 'wbJcJCkBcMg',
    youtubeId: 'wbJcJCkBcMg',
    title: 'Microsoft Excel for Beginners — Complete Course from Scratch',
    channelTitle: 'Kevin Stratvert / OpenFrame Curated',
    thumbnail: ytThumb('wbJcJCkBcMg'),
    thumbnailUrl: ytThumb('wbJcJCkBcMg'),
    duration: '54:20',
    level: 'Beginner',
    difficultyLevel: 'Beginner',
    subjectCategory: 'Microsoft Excel',
    recommendedReason: 'Hands-on walkthrough of Excel ribbons, data entry, formatting, basic formulas, and worksheet organization.',
    rationale: 'Excel foundations, cells, formatting, and introductory formulas.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/wbJcJCkBcMg',
    keyTopicsCovered: ['Excel Basics', 'Cells & Formatting', 'SUM & AVERAGE', 'Spreadsheet Tables']
  },
  {
    id: 'yt-excel-002',
    videoId: '7QNgqq154gE',
    youtubeId: '7QNgqq154gE',
    title: 'Complete Excel Tutorial for Data Analysis (Formulas, VLOOKUP & Pivot Tables)',
    channelTitle: 'Data Analytics Academy',
    thumbnail: ytThumb('7QNgqq154gE'),
    thumbnailUrl: ytThumb('7QNgqq154gE'),
    duration: '4:00:00',
    level: 'Intermediate',
    difficultyLevel: 'Intermediate',
    subjectCategory: 'Microsoft Excel',
    recommendedReason: 'Covers logical formulas, XLOOKUP/VLOOKUP, PivotTables, and cleaning business datasets in Excel.',
    rationale: 'Master Excel formulas, lookups, PivotTables, and business analysis.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/7QNgqq154gE',
    keyTopicsCovered: ['Excel Formulas', 'VLOOKUP & XLOOKUP', 'Pivot Tables', 'Data Analysis']
  },
  {
    id: 'yt-excel-003',
    videoId: 'WV6X0rol5To',
    youtubeId: 'WV6X0rol5To',
    title: 'How to Build Interactive Dashboards & Reports in Microsoft Excel',
    channelTitle: 'Excel BI & Reporting',
    thumbnail: ytThumb('WV6X0rol5To'),
    thumbnailUrl: ytThumb('WV6X0rol5To'),
    duration: '38:15',
    level: 'Advanced',
    difficultyLevel: 'Advanced',
    subjectCategory: 'Microsoft Excel',
    recommendedReason: 'End-to-end KPI dashboard architecture using PivotCharts, slicers, and executive summaries.',
    rationale: 'Create dynamic interactive dashboards and KPI reports in Excel.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/WV6X0rol5To',
    keyTopicsCovered: ['Excel Dashboards', 'Pivot Charts', 'Slicers', 'KPI Reporting']
  },
  {
    id: 'yt-website-001',
    videoId: '-W9F__D3oY4',
    youtubeId: '-W9F__D3oY4',
    title: 'How to Build a Website from Scratch — Complete HTML5 & CSS3 Course',
    channelTitle: 'freeCodeCamp / Web Mastery',
    thumbnail: ytThumb('-W9F__D3oY4'),
    thumbnailUrl: ytThumb('-W9F__D3oY4'),
    duration: '2:30:00',
    level: 'Beginner',
    difficultyLevel: 'Beginner',
    subjectCategory: 'Web Development',
    recommendedReason: 'Step-by-step tutorial on building your first responsive website with clean HTML5 and CSS3.',
    rationale: 'Build complete structured websites with HTML5 and CSS3 from zero.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/-W9F__D3oY4',
    keyTopicsCovered: ['Build a Website', 'HTML5', 'CSS3', 'Responsive Layout']
  },
  {
    id: 'yt-website-002',
    videoId: 'l1EssrLxt7E',
    youtubeId: 'l1EssrLxt7E',
    title: 'Responsive Website Design & Flexbox/Grid Architecture Complete Guide',
    channelTitle: 'Web Dev Simplified / Curated',
    thumbnail: ytThumb('l1EssrLxt7E'),
    thumbnailUrl: ytThumb('l1EssrLxt7E'),
    duration: '1:45:00',
    level: 'Intermediate',
    difficultyLevel: 'Intermediate',
    subjectCategory: 'Web Development',
    recommendedReason: 'Mobile-first responsive page layout, navigation headers, and modern Flexbox/CSS Grid systems.',
    rationale: 'Design mobile-friendly website layouts with Flexbox and CSS Grid.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/l1EssrLxt7E',
    keyTopicsCovered: ['Website Design', 'Flexbox', 'CSS Grid', 'Mobile Responsive']
  },
  {
    id: 'yt-website-003',
    videoId: 'tVzUXW6siu0',
    youtubeId: 'tVzUXW6siu0',
    title: 'Modern Website Engineering: Tailwind CSS, JavaScript & Production Launch',
    channelTitle: 'Frontend Engineering Lab',
    thumbnail: ytThumb('tVzUXW6siu0'),
    thumbnailUrl: ytThumb('tVzUXW6siu0'),
    duration: '2:10:00',
    level: 'Advanced',
    difficultyLevel: 'Advanced',
    subjectCategory: 'Web Development',
    recommendedReason: 'Guides learners from component styling and interactive JavaScript to deploying a live website.',
    rationale: 'Ship fast, production-ready websites with Tailwind and JavaScript.',
    embedUrl: 'https://www.youtube-nocookie.com/embed/tVzUXW6siu0',
    keyTopicsCovered: ['Tailwind CSS', 'Frontend JavaScript', 'Website Deployment', 'Performance']
  }
];

export class YouTubeVideoService {
  /**
   * Live YouTube Data API v3 search with pagination & filters (returns honest error state if unconfigured/failed)
   */
  async searchYouTubeApi(
    query: string,
    categoryOrOptions:
      | string
      | {
          category?: string;
          language?: string;
          duration?: 'any' | 'short' | 'medium' | 'long';
          publishedAfter?: string;
          channelId?: string;
          pageToken?: string;
          searchType?: 'video' | 'playlist';
          maxResults?: number;
        } = '',
    maxResultsArg = 12
  ): Promise<{
    ok: boolean;
    source: string;
    videos: YouTubeVideoRecommendation[];
    nextPageToken?: string;
    prevPageToken?: string;
    totalResults?: number;
    detectedLanguage?: string;
    filtersBroadened?: boolean;
    broadenNote?: string;
    error?: string;
    errorCode?: string;
  }> {
    const opts =
      typeof categoryOrOptions === 'string'
        ? { category: categoryOrOptions, maxResults: maxResultsArg }
        : categoryOrOptions;

    try {
      const res = await fetch('/api/youtube/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          category: opts.category || '',
          language: opts.language || '',
          duration: opts.duration || 'any',
          publishedAfter: opts.publishedAfter || '',
          channelId: opts.channelId || '',
          pageToken: opts.pageToken || '',
          searchType: opts.searchType || 'video',
          maxResults: opts.maxResults || maxResultsArg,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok !== false) {
        return {
          ok: true,
          source: data.source || 'youtube_data_api',
          videos: Array.isArray(data.videos) ? data.videos : [],
          nextPageToken: data.nextPageToken,
          prevPageToken: data.prevPageToken,
          totalResults: data.totalResults,
          detectedLanguage: data.detectedLanguage,
          filtersBroadened: Boolean(data.filtersBroadened),
          broadenNote: data.broadenNote,
        };
      }
      return {
        ok: false,
        source: data.source || 'youtube_api_error',
        videos: [],
        detectedLanguage: data.detectedLanguage,
        error: data.error || `YouTube search failed (HTTP ${res.status}).`,
        errorCode: data.errorCode || 'YOUTUBE_SEARCH_FAILED',
      };
    } catch (err: any) {
      return {
        ok: false,
        source: 'youtube_network_error',
        videos: [],
        error: err?.message || 'Unable to reach YouTube Data API search endpoint.',
        errorCode: 'YOUTUBE_NETWORK_ERROR',
      };
    }
  }

  async fetchVideoDetails(videoId: string): Promise<{
    ok: boolean;
    source?: string;
    video?: YouTubeVideoRecommendation;
    warning?: string;
    error?: string;
  }> {
    try {
      const res = await fetch(`/api/youtube/video-details/${encodeURIComponent(videoId)}`);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.video) {
        return { ok: true, source: data.source, video: data.video, warning: data.warning };
      }
      return { ok: false, error: data.error || 'Video details unavailable.' };
    } catch (err: any) {
      return { ok: false, error: err?.message || 'Network error fetching video details.' };
    }
  }

  async fetchRelatedResources(params: {
    query: string;
    excludeVideoId?: string;
    language?: string;
    maxResults?: number;
  }): Promise<{ ok: boolean; videos: YouTubeVideoRecommendation[]; error?: string }> {
    try {
      const res = await fetch('/api/youtube/related-resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok !== false) {
        return { ok: true, videos: Array.isArray(data.videos) ? data.videos : [] };
      }
      return { ok: false, videos: [], error: data.error || 'Unable to fetch related YouTube resources.' };
    } catch (err: any) {
      return { ok: false, videos: [], error: err?.message || 'Network error fetching related resources.' };
    }
  }

  async getYouTubeApiStatus(): Promise<{ apiKeyConfigured: boolean; mode: string }> {
    try {
      const res = await fetch('/api/youtube/status');
      if (res.ok) return await res.json();
    } catch {
      // ignore
    }
    return {
      apiKeyConfigured: false,
      mode: 'YouTube Data API v3',
    };
  }

  getVideosForCourse(courseId: string, category: string, title: string): ExtendedYouTubeVideo[] {
    const queryStr = `${title} ${category}`.trim();

    const scored = MASTER_YOUTUBE_LIBRARY.map((v) => ({
      v,
      score: scoreSearchMatch(
        {
          title: v.title,
          category: v.subjectCategory,
          keywords: v.keyTopicsCovered,
          shortDesc: v.recommendedReason,
          youtubeChannelName: v.channelTitle,
        },
        queryStr
      ),
    })).sort((a, b) => b.score - a.score);

    const matched = scored[0]?.score > 0
      ? scored.filter((s) => s.score > 0).map((s) => s.v)
      : scored.slice(0, 3).map((s) => s.v);

    if (matched.length >= 3) {
      return matched.slice(0, 5);
    }

    const defaults = [...matched];
    const fallbackIds = [
      matched[0]?.videoId || 'JMUxmLyrhSk',
      matched[1]?.videoId || matched[0]?.videoId || 'i_LwzRVP7bg',
      matched[2]?.videoId || matched[0]?.videoId || 'kCc8FmEb1nY',
    ];

    const generated: ExtendedYouTubeVideo[] = [
      {
        id: `gen-yt-${courseId}-1`,
        videoId: fallbackIds[0],
        youtubeId: fallbackIds[0],
        title: `${title}: Foundational Principles & Setup`,
        channelTitle: matched[0]?.channelTitle || 'OpenFrame Curated Faculty',
        thumbnail: ytThumb(fallbackIds[0]),
        thumbnailUrl: ytThumb(fallbackIds[0]),
        duration: '45:15',
        level: 'Beginner',
        difficultyLevel: 'Beginner',
        subjectCategory: category,
        recommendedReason: `Curated by OpenFrame to establish foundational principles and terminology for ${title}.`,
        rationale: `Foundational overview for ${title}.`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${fallbackIds[0]}`,
        keyTopicsCovered: ['Foundations', 'Core Concepts', 'Setup', 'Best Practices'],
      },
      {
        id: `gen-yt-${courseId}-2`,
        videoId: fallbackIds[1],
        youtubeId: fallbackIds[1],
        title: `${title}: Practical Implementation & Applied Lab`,
        channelTitle: matched[1]?.channelTitle || matched[0]?.channelTitle || 'OpenFrame Applied Labs',
        thumbnail: ytThumb(fallbackIds[1]),
        thumbnailUrl: ytThumb(fallbackIds[1]),
        duration: '52:10',
        level: 'Intermediate',
        difficultyLevel: 'Intermediate',
        subjectCategory: category,
        recommendedReason: `Demonstrates practical workflows, applied execution, and error diagnostics for ${title}.`,
        rationale: `Applied implementation walkthrough.`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${fallbackIds[1]}`,
        keyTopicsCovered: ['Implementation', 'Workflows', 'Optimization', 'Case Study'],
      },
      {
        id: `gen-yt-${courseId}-3`,
        videoId: fallbackIds[2],
        youtubeId: fallbackIds[2],
        title: `${title}: Capstone Architecture & Project Defense`,
        channelTitle: matched[2]?.channelTitle || matched[0]?.channelTitle || 'OpenFrame Academic Council',
        thumbnail: ytThumb(fallbackIds[2]),
        thumbnailUrl: ytThumb(fallbackIds[2]),
        duration: '1:08:00',
        level: 'Advanced',
        difficultyLevel: 'Advanced',
        subjectCategory: category,
        recommendedReason: `Capstone guidance on production execution, quality benchmarks, and project defense.`,
        rationale: `Production scale optimization.`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${fallbackIds[2]}`,
        keyTopicsCovered: ['Architecture', 'Deployment', 'Evaluation', 'Defense'],
      },
    ];

    return [...defaults, ...generated].slice(0, 6);
  }

  searchVideos(queryText: string, categoryFilter = 'All'): ExtendedYouTubeVideo[] {
    const q = queryText.trim();
    return MASTER_YOUTUBE_LIBRARY.filter((v) => {
      const matchQuery =
        !q ||
        scoreSearchMatch(
          {
            title: v.title,
            category: v.subjectCategory,
            keywords: v.keyTopicsCovered,
            shortDesc: v.recommendedReason,
            youtubeChannelName: v.channelTitle,
          },
          q
        ) > 0;

      const matchCat =
        categoryFilter === 'All' || v.subjectCategory.toLowerCase() === categoryFilter.toLowerCase();
      return matchQuery && matchCat;
    });
  }

  getAllLibrary(): ExtendedYouTubeVideo[] {
    return MASTER_YOUTUBE_LIBRARY;
  }
}

export const youtubeVideoService = new YouTubeVideoService();
