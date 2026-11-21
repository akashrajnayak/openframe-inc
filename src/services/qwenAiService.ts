import { ExtendedYouTubeVideo, youtubeVideoService } from './youtubeVideoService';
import { standaloneApiFetch } from './standaloneMockService';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'qwen' | 'system';
  text: string;
  timestamp: string;
  courseSuggestions?: Array<{
    id: string;
    title: string;
    category: string;
    level: string;
    duration: string;
  }>;
  videoSuggestions?: ExtendedYouTubeVideo[];
  actionPrompt?: {
    type: 'apply' | 'learn' | 'expert_call' | 'browse_courses';
    label: string;
    payload?: string;
  };
}

export interface QuickPrompt {
  label: string;
  prompt: string;
  category: 'courses' | 'admissions' | 'it_solutions' | 'study_plan' | 'tech_help';
}

export const QWEN_QUICK_PROMPTS: QuickPrompt[] = [
  {
    label: 'Explore 15,500+ Courses',
    prompt: 'Which courses do you recommend for learning AI, Corporate Management, and Full-Stack Development from scratch?',
    category: 'courses'
  },
  {
    label: 'How does Course Pricing & Counseling work?',
    prompt: 'Can you explain the course fee policy, expert consultation call, and scholarships?',
    category: 'admissions'
  },
  {
    label: 'Generate a 4-Week Python & AI Roadmap',
    prompt: 'Create a structured 4-week learning roadmap for mastering Python, NumPy, and Deep Learning.',
    category: 'study_plan'
  },
  {
    label: 'Enterprise IT Solutions',
    prompt: 'What software development and cloud engineering services does OpenFrame IT Solutions offer?',
    category: 'it_solutions'
  },
  {
    label: 'Recommend YouTube Lectures (Play on Site)',
    prompt: 'Show me top curated video lectures from MIT and Stanford on Neural Networks and Transformers.',
    category: 'courses'
  },
  {
    label: 'HopeNest Foundation Alliance',
    prompt: 'What is the partnership between OpenFrame IT Solutions and HopeNest Global Foundation?',
    category: 'admissions'
  }
];

class QwenAiService {
  private chatHistoryKey = 'openframe_qwen_ai_chat_v1';

  /**
   * Get stored chat history
   */
  getStoredMessages(): ChatMessage[] {
    try {
      const data = localStorage.getItem(this.chatHistoryKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Could not read chat history:', e);
    }

    // Default welcome message
    return [
      {
        id: 'msg-welcome-001',
        sender: 'qwen',
        text: `Hello! I am **Quinn AI**, your dedicated intelligent Academic & Career Assistant at OpenFrame Education and OpenFrame IT Solutions.

I can help you:
1. **Explore 15,500+ Courses** across 110+ specialized categories (AI, Corporate Management & Employee Skill Development, Excel, Robotics, Full-Stack, Cloud, Data Science, Academic K–12, etc.).
2. **Schedule 1-on-1 Academic Counseling** to finalize your customized curriculum, fee structure, and scholarships.
3. **Stream Curated YouTube Video Lectures** from world-class educators and universities directly on our site.
4. **Discover Enterprise IT Solutions** (Custom Software, Cloud ERP, Mobile Apps, Cybersecurity).
5. **Generate Customized Study Roadmaps, Summaries & Quizzes**.

How can I assist your learning or technology goals today?`,
        timestamp: new Date().toISOString(),
        actionPrompt: {
          type: 'browse_courses',
          label: 'Explore 15,500+ Courses Catalog'
        }
      }
    ];
  }

  /**
   * Save messages
   */
  saveMessages(messages: ChatMessage[]): void {
    try {
      localStorage.setItem(this.chatHistoryKey, JSON.stringify(messages.slice(-50)));
    } catch (e) {
      console.warn('Could not save chat history:', e);
    }
  }

  /**
   * Clear chat history
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.chatHistoryKey);
    } catch (e) {}
  }

  /**
   * Generate an intelligent domain-grounded response from Qwen AI
   */
  async generateResponse(userInput: string): Promise<ChatMessage> {
    const q = userInput.trim().toLowerCase();
    const id = `msg-quinn-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Try live Gemini AI backend first while preserving rich contextual action prompts
    try {
      const apiRes = await standaloneApiFetch('/api/quinn/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          courseTitle: 'OpenFrame Education Universal Catalog (15,500+ Courses)',
          lessonTopic: 'Universal Academic Guidance & Course Discovery',
          language: 'English',
          capabilityMode: 'chat',
        }),
      });
      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data?.reply && data.source !== 'structured_offline_tutor' && data.source !== 'contextual_fallback') {
          const wantsVideos = q.includes('youtube') || q.includes('video') || q.includes('lecture');
          const wantsFee = q.includes('fee') || q.includes('price') || q.includes('counsel') || q.includes('admission');
          return {
            id,
            sender: 'qwen',
            text: data.reply,
            timestamp,
            videoSuggestions: wantsVideos ? youtubeVideoService.getAllLibrary().slice(0, 4) : undefined,
            actionPrompt: wantsFee
              ? { type: 'expert_call', label: 'Apply for 1-on-1 Expert Call (Pop-up Form)' }
              : wantsVideos
              ? { type: 'learn', label: 'Launch Video Player Pop-Up' }
              : { type: 'browse_courses', label: 'Explore 15,500+ Courses Catalog' },
          };
        }
      }
    } catch {
      // Fall through cleanly to offline domain-grounded fallback
    }

    // 1. Fee / Pricing / Payment queries
    if (
      q.includes('fee') ||
      q.includes('price') ||
      q.includes('cost') ||
      q.includes('pricing') ||
      q.includes('pay') ||
      q.includes('how much')
    ) {
      return {
        id,
        sender: 'qwen',
        text: `### Official Course Fee & Counseling Policy

At **OpenFrame Education**, course fees are **never fixed or decided via website checkout**.

Here is how our official admissions and fee structure works:
- **1-on-1 Expert Consultation Call**: Every prospective student receives a dedicated consultation call from a Senior Academic Counselor.
- **Customized Curriculum**: We tailor the syllabus and practical capstone projects to your existing skills and career aspirations.
- **Scholarship & Financial Aid**: Meritorious students, women in tech, and candidates associated with **HopeNest Global Foundation** can receive substantial scholarship concessions.
- **Zero Upfront Payment on Website**: You don't make any payments online today. Simply apply, and our counselor will discuss all batch schedules and customized fee plans with you.

Would you like to schedule your expert counseling call right now?`,
        timestamp,
        actionPrompt: {
          type: 'expert_call',
          label: 'Apply for 1-on-1 Expert Call (Pop-up Form)'
        }
      };
    }

    // 2. 15,500 Courses exploration queries
    if (
      q.includes('15500') ||
      q.includes('15,500') ||
      q.includes('15000') ||
      q.includes('15,000') ||
      q.includes('courses') ||
      q.includes('catalog') ||
      q.includes('how many course') ||
      q.includes('all course')
    ) {
      return {
        id,
        sender: 'qwen',
        text: `### OpenFrame 15,500+ Online Course Marketplace

OpenFrame Education hosts an expansive marketplace of **15,500 individually cataloged courses** (15,000 core courses + 500 Corporate Management & Employee Skill Development YouTube training courses) covering **110+ specialized categories**:

- **Corporate Management & Employee Skill Development (500 Verified YouTube Courses)**: Business Management, HR, Marketing, Field Sales, Telecalling, Office Administration, Leadership, Finance, Project Ops, Procurement, CRM, Data & IT Ops, Legal/Compliance, Sales Ops, QA/Lean, Retail/E-Commerce, and Executive Productivity.
- **Artificial Intelligence & Generative AI**: LLMs, Prompt Engineering, Agentic Workflows, Neural Networks, PyTorch, TensorFlow.
- **Full-Stack & Cloud Architecture**: React, Next.js, Node.js, Python, Java, AWS, Azure, Google Cloud, Docker, Kubernetes.
- **Data Science & Analytics**: Pandas, NumPy, SQL, Big Data, PowerBI, Tableau, Predictive Modeling.
- **Cybersecurity & Ethical Hacking**: Penetration Testing, Kali Linux, OWASP Top 10, Network Defense.
- **Academic & STEM**: Class 1st to 12th tuition, Mathematics, Science, Robotics, IoT.

All courses include **practical capstones, verified OpenFrame certificates, and curated YouTube video lectures** embedded right on our site.`,
        timestamp,
        courseSuggestions: [
          {
            id: 'OF-AI-001',
            title: 'Complete AI Systems: From Fundamentals to Autonomous Agents',
            category: 'Artificial Intelligence',
            level: 'All Levels',
            duration: '32 Hours'
          },
          {
            id: 'OF-CRS-0018',
            title: 'Complete Prompt Engineering: Architecture, Few-Shot & RAG',
            category: 'Generative AI',
            level: 'Beginner',
            duration: '14 Hours'
          },
          {
            id: 'OF-CRS-0035',
            title: 'Supervised Learning & Regression Systems in Python',
            category: 'Machine Learning',
            level: 'Intermediate',
            duration: '32 Hours'
          },
          {
            id: 'OF-CRS-0145',
            title: 'Cloud DevOps Engineering with Docker & Kubernetes',
            category: 'Cloud Computing',
            level: 'Advanced',
            duration: '40 Hours'
          }
        ],
        actionPrompt: {
          type: 'browse_courses',
          label: 'Open 15,500 Course Marketplace'
        }
      };
    }

    // 3. YouTube videos / Lecture requests
    if (
      q.includes('youtube') ||
      q.includes('video') ||
      q.includes('lecture') ||
      q.includes('watch') ||
      q.includes('play on site')
    ) {
      const vids = youtubeVideoService.getAllLibrary().slice(0, 4);
      return {
        id,
        sender: 'qwen',
        text: `### Play Educational YouTube Lectures On Site

You can stream verified educational lectures from world-class engineering institutions directly inside OpenFrame without external redirects!

Here are top recommended lectures from our **10,000+ lecture index**:
- **MIT 6.034**: Intelligent Agents & State Space Search (MIT OpenCourseWare)
- **Stanford CS229**: Machine Learning by Andrew Ng
- **Andrej Karpathy**: Let's build GPT from scratch in code
- **Harvard CS50**: Introduction to Computer Science
- **freeCodeCamp**: React, Next.js, Node.js and AWS Cloud Certification

Click below to launch the video player modal right inside the page!`,
        timestamp,
        videoSuggestions: vids,
        actionPrompt: {
          type: 'learn',
          label: 'Launch Video Player Pop-Up'
        }
      };
    }

    // 4. Study Roadmap / Plan queries
    if (
      q.includes('roadmap') ||
      q.includes('study plan') ||
      q.includes('schedule') ||
      q.includes('how to start') ||
      q.includes('curriculum') ||
      q.includes('4-week') ||
      q.includes('guide')
    ) {
      return {
        id,
        sender: 'qwen',
        text: `### Customized 4-Week Learning Roadmap (AI & Full-Stack Track)

Here is a structured, project-driven roadmap recommended by Quinn AI:

#### **Week 1: Core Fundamentals & Python Programming**
- **Topics**: Clean syntax, data structures, list comprehensions, OOP principles, Git version control.
- **Practical Lab**: Build an automated data ingestion script and CLI utility.
- **Recommended Video**: Python for Beginners (MIT / freeCodeCamp).

#### **Week 2: Data Engineering & Machine Learning Basics**
- **Topics**: NumPy matrix operations, Pandas DataFrames, Scikit-Learn pipelines, cost functions, gradient descent.
- **Practical Lab**: Train and evaluate predictive regression models on real enterprise datasets.
- **Recommended Video**: Stanford CS229 Supervised Learning.

#### **Week 3: Deep Learning, PyTorch & Large Language Models**
- **Topics**: Multilayer perceptrons, backpropagation, attention mechanisms, HuggingFace Transformers, prompt engineering.
- **Practical Lab**: Construct a Retrieval-Augmented Generation (RAG) assistant using vector embeddings.
- **Recommended Video**: 3Blue1Brown Neural Networks + Andrej Karpathy GPT.

#### **Week 4: Production Deployment & Verified Certification**
- **Topics**: FastAPIs, Docker containerization, cloud deployment, unit testing, rubric defense.
- **Practical Capstone**: Full-stack intelligent web application deployed with verified OpenFrame Certification!

Would you like to enroll with expert mentorship for this exact roadmap?`,
        timestamp,
        actionPrompt: {
          type: 'expert_call',
          label: 'Apply for Mentorship in this Roadmap'
        }
      };
    }

    // 5. IT Solutions & Enterprise services
    if (
      q.includes('it solutions') ||
      q.includes('software') ||
      q.includes('development') ||
      q.includes('enterprise') ||
      q.includes('product') ||
      q.includes('company')
    ) {
      return {
        id,
        sender: 'qwen',
        text: `### OpenFrame IT Solutions Private Limited

**OpenFrame IT Solutions Private Limited** is an official corporate technology company delivering high-performance digital infrastructure:

- **Enterprise Software Development**: Custom web, desktop, and mobile systems built with high-throughput architectures.
- **Cloud & DevOps Engineering**: AWS, Microsoft Azure, and Google Cloud infrastructure, Kubernetes container orchestration, CI/CD automation.
- **Proprietary Digital Products**:
  - **CoreERP**: Modular enterprise resource planning for operations, finance, and supply chain.
  - **EduLMS**: Comprehensive learning management system with AI assessments and certificate verification.
  - **CloudPulse**: Real-time cloud infrastructure monitoring and analytics.
  - **CollabFlow**: Secure multi-team communication and workflow automation.
- **HopeNest Global Foundation Alliance**: Implementing technology for social impact, rural literacy, and women entrepreneurship.

Contact our solution architects for enterprise consultation or technical RFPs!`,
        timestamp,
        actionPrompt: {
          type: 'expert_call',
          label: 'Request Corporate IT Consultation'
        }
      };
    }

    // 6. HopeNest Foundation queries
    if (q.includes('hopenest') || q.includes('foundation') || q.includes('ngo') || q.includes('charity')) {
      return {
        id,
        sender: 'qwen',
        text: `### HopeNest Global Foundation

**HopeNest Global Foundation** is a Section 8 Non-Profit Organisation affiliated with OpenFrame IT Solutions Private Limited.

Key Initiatives:
- **Project Asha**: Digital empowerment and vocational training for underprivileged students and women.
- **Rural STEM & Computer Labs**: Setting up hardware and internet-enabled study centers in underserved districts across Odisha and Eastern India.
- **Subsidized Tech Education**: OpenFrame Education partners with HopeNest to provide zero-cost or heavily subsidized training and laptops to deserving learners.
- **Volunteer & Community Support**: Engaging youth and industry professionals in mentorship drives.`,
        timestamp,
        actionPrompt: {
          type: 'expert_call',
          label: 'Get Involved with HopeNest'
        }
      };
    }

    // 7. General AI Assistant / Default Fallback
    return {
      id,
      sender: 'qwen',
      text: `### Quinn AI Academic & Technical Analysis

Thank you for your question regarding **"${userInput}"**.

As your dedicated OpenFrame AI Assistant:
- **15,500 Courses**: We offer targeted hands-on modules across 110+ categories including the 500-video Corporate Management & Employee Skill Development library.
- **Learning Path**: We can connect you with an academic mentor who will evaluate your background, customize your milestones, and finalize your fee schedule via phone call.
- **Curated Video Lectures**: You can watch curated video lectures from MIT, Stanford, Harvard, and Corporate Training channels embedded directly on our site.

Would you like me to recommend specific courses, create a study timetable, or help you schedule a 1-on-1 counseling call with our senior academic advisor?`,
      timestamp,
      actionPrompt: {
        type: 'browse_courses',
        label: 'Explore 15,500 Courses'
      }
    };
  }
}

export const qwenAiService = new QwenAiService();
