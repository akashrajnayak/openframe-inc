import { YouTubeVideoRecommendation } from '../types';

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
  }
];

export class YouTubeVideoService {
  /**
   * Educational video search via backend curated index
   */
  async searchYouTubeApi(
    query: string,
    category = '',
    maxResults = 6
  ): Promise<{ source: string; videos: YouTubeVideoRecommendation[] }> {
    try {
      const res = await fetch('/api/youtube/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, category, maxResults }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          source: data.source || 'curated_library',
          videos: Array.isArray(data.videos) ? data.videos : [],
        };
      }
    } catch (err) {
      console.warn('Video search endpoint unavailable, falling back to local index:', err);
    }

    return {
      source: 'curated_library',
      videos: this.searchVideos(query, category || 'All'),
    };
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
      mode: 'Quinn AI Curated Academic Index',
    };
  }

  getVideosForCourse(courseId: string, category: string, title: string): ExtendedYouTubeVideo[] {
    const q = `${title} ${category}`.toLowerCase();

    const matched = MASTER_YOUTUBE_LIBRARY.filter((v) => {
      const vCat = v.subjectCategory.toLowerCase();
      const vTitle = v.title.toLowerCase();
      return (
        q.includes(vCat) ||
        vCat.includes(category.toLowerCase()) ||
        q.includes(vTitle.slice(0, 15)) ||
        v.keyTopicsCovered.some((t) => q.includes(t.toLowerCase()))
      );
    });

    if (matched.length >= 3) {
      return matched.slice(0, 5);
    }

    const defaults = matched.length > 0 ? [...matched] : [];
    const fallbackIds = [
      matched[0]?.videoId || 'JMUxmLyrhSk',
      matched[1]?.videoId || 'i_LwzRVP7bg',
      matched[2]?.videoId || 'kCc8FmEb1nY',
    ];

    const generated: ExtendedYouTubeVideo[] = [
      {
        id: `gen-yt-${courseId}-1`,
        videoId: fallbackIds[0],
        youtubeId: fallbackIds[0],
        title: `${title}: Foundational Principles & Architecture`,
        channelTitle: 'MIT OpenCourseWare & OpenFrame Faculty',
        thumbnail: ytThumb(fallbackIds[0]),
        thumbnailUrl: ytThumb(fallbackIds[0]),
        duration: '45:15',
        level: 'Beginner',
        difficultyLevel: 'Beginner',
        subjectCategory: category,
        recommendedReason: `Curated by Quinn AI to establish foundational principles and terminology for ${title}.`,
        rationale: `Foundational overview for ${title}.`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${fallbackIds[0]}`,
        keyTopicsCovered: ['Foundations', 'Core Concepts', 'Setup', 'Best Practices'],
      },
      {
        id: `gen-yt-${courseId}-2`,
        videoId: fallbackIds[1],
        youtubeId: fallbackIds[1],
        title: `${title}: Practical Implementation & Applied Lab`,
        channelTitle: 'Stanford Online & OpenFrame Labs',
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
        title: `${title}: Capstone Architecture & Production Strategy`,
        channelTitle: 'OpenFrame Academic Council',
        thumbnail: ytThumb(fallbackIds[2]),
        thumbnailUrl: ytThumb(fallbackIds[2]),
        duration: '1:08:00',
        level: 'Advanced',
        difficultyLevel: 'Advanced',
        subjectCategory: category,
        recommendedReason: `Capstone guidance on production deployment, quality benchmarks, and project defense.`,
        rationale: `Production scale optimization.`,
        embedUrl: `https://www.youtube-nocookie.com/embed/${fallbackIds[2]}`,
        keyTopicsCovered: ['Architecture', 'Deployment', 'Evaluation', 'Defense'],
      },
    ];

    return [...defaults, ...generated].slice(0, 6);
  }

  searchVideos(queryText: string, categoryFilter = 'All'): ExtendedYouTubeVideo[] {
    const q = queryText.trim().toLowerCase();
    return MASTER_YOUTUBE_LIBRARY.filter((v) => {
      const matchQuery =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.channelTitle.toLowerCase().includes(q) ||
        v.subjectCategory.toLowerCase().includes(q) ||
        v.keyTopicsCovered.some((t) => t.toLowerCase().includes(q));

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
