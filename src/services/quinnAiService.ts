import {
  QuizQuestion,
  QuizAttempt,
  QuizResponseItem,
  PracticalProjectDefinition,
  QuinnPerformanceAnalysis,
  YouTubeVideoRecommendation,
  TeacherEvaluationRubricScores,
  AiLearningPath,
  StudentProfile,
  MarketplaceFilterParams,
  QuinnDiscoveryResponse,
  QaStructuredResult,
} from '../types';
import { youtubeVideoService } from './youtubeVideoService';
import { parseEducationalIntent } from '../utils/searchIntelligence';

/**
 * Quinn AI - Educational Intelligence Client Service
 * Communicates with server-side Gemini (@google/genai) endpoints (/api/quinn/*)
 * for video curation, verification quizzes, rubric grading, project synthesis, and performance analysis.
 */
export class QuinnAiService {
  async recommendVideos(params: {
    courseTitle: string;
    category: string;
    lessonTopic: string;
    level?: string;
    maxVideos?: number;
  }): Promise<YouTubeVideoRecommendation[]> {
    try {
      const res = await fetch('/api/quinn/recommend-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.videos) && data.videos.length > 0) {
          return data.videos;
        }
      }
    } catch (err) {
      console.warn('Quinn AI video recommendation fallback triggered:', err);
    }

    return youtubeVideoService
      .getVideosForCourse(params.courseTitle, params.category, params.lessonTopic || params.courseTitle)
      .slice(0, params.maxVideos || 3);
  }

  async generateVerificationQuestions(params: {
    courseTitle: string;
    lessonTopic: string;
    category: string;
    learningObjectives: string[];
    learningMaterials?: string;
    basicCount?: number;
    intermediateCount?: number;
    advancedCount?: number;
  }): Promise<{ questions: QuizQuestion[]; generatedBy: 'gemini' | 'curated_fallback' }> {
    try {
      const res = await fetch('/api/quinn/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          return { questions: data.questions, generatedBy: 'gemini' };
        }
      }
    } catch (err) {
      console.warn('Quinn AI quiz generator fallback triggered:', err);
    }

    return {
      questions: this.buildStructuredFallbackQuiz(params),
      generatedBy: 'curated_fallback',
    };
  }

  async evaluateQuizAttempt(params: {
    questions: QuizQuestion[];
    studentAnswers: Record<string, string>;
    studentId: string;
    courseId: string;
    lessonId: string;
    passingScorePercent?: number;
  }): Promise<QuizAttempt> {
    try {
      const res = await fetch('/api/quinn/evaluate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('Quinn AI quiz evaluation fallback triggered:', err);
    }

    return this.evaluateQuizLocally(params);
  }

  async generatePracticalProject(params: {
    courseId?: string;
    courseTitle: string;
    lessonTopic: string;
    category: string;
    variationSeed?: string;
  }): Promise<PracticalProjectDefinition> {
    try {
      const res = await fetch('/api/quinn/generate-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.project) return data.project;
      }
    } catch (err) {
      console.warn('Quinn AI project generator fallback triggered:', err);
    }

    return this.buildFallbackProject(params);
  }

  async analyzePerformance(params: {
    quizAttempts: QuizAttempt[];
    evaluation?: { scores: TeacherEvaluationRubricScores; totalScore: number };
    completedLessons: number;
    totalLessons: number;
    courseTitle: string;
  }): Promise<QuinnPerformanceAnalysis> {
    try {
      const res = await fetch('/api/quinn/analyze-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.analysis) return data.analysis;
      }
    } catch (err) {
      console.warn('Quinn AI performance analysis fallback triggered:', err);
    }

    const progressPercentage = Math.min(
      100,
      Math.round((params.completedLessons / Math.max(1, params.totalLessons)) * 100)
    );
    const quizAverage =
      params.quizAttempts.length > 0
        ? Math.round(
            params.quizAttempts.reduce((acc, q) => acc + (q.percentageScore ?? q.percentage ?? 0), 0) /
              params.quizAttempts.length
          )
        : 0;
    const projectScore = params.evaluation?.scores
      ? Math.round(
          ((params.evaluation.scores.subjectKnowledge +
            (params.evaluation.scores.conceptUnderstanding ?? params.evaluation.scores.conceptsMastery ?? 0) +
            params.evaluation.scores.practicalImplementation) /
            60) *
            100
        )
      : 0;
    const presentationScore = params.evaluation?.scores
      ? Math.round(
          ((params.evaluation.scores.creativityInnovation +
            (params.evaluation.scores.presentationSkills ?? params.evaluation.scores.presentationQuality ?? 0) +
            params.evaluation.scores.communicationSkills) /
            40) *
            100
        )
      : 0;

    const metrics = [quizAverage, projectScore, presentationScore].filter((x) => x > 0);
    const skillDevelopmentScore =
      metrics.length > 0 ? Math.round(metrics.reduce((a, b) => a + b, 0) / metrics.length) : progressPercentage;

    return {
      progressPercentage,
      quizAverage,
      projectScore,
      presentationScore,
      skillDevelopmentScore,
      strengths: [
        quizAverage >= 70
          ? 'Strong mastery of verified course assessments.'
          : 'Active progression across structured curriculum lessons.',
      ],
      weaknesses:
        quizAverage > 0 && quizAverage < 70
          ? ['Verification assessment score is currently below the passing benchmark.']
          : [],
      areasForImprovement: [
        'Complete all mandatory video lectures, pass verification quizzes, and upload practical deliverables.',
      ],
      personalizedRecommendation: `Continue advancing through ${params.courseTitle} milestones to complete your faculty defense and earn certification.`,
      lastAnalyzedAt: new Date().toISOString(),
    };
  }

  async chatWithAssistant(params: {
    message: string;
    courseTitle: string;
    lessonTopic: string;
    language?: string;
    capabilityMode?: string;
    history?: { role: 'user' | 'model'; text: string }[];
    isMinor?: boolean;
  }): Promise<string> {
    try {
      const res = await fetch('/api/quinn/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        return data.reply;
      }
      if (data.reply) return data.reply;
    } catch (err) {
      console.warn('Quinn AI chat fallback triggered:', err);
    }

    return `I'm Quinn AI, your dedicated learning mentor for "${params.lessonTopic}" in ${params.courseTitle}. Review your recommended lectures, complete the 15-question verification quiz, and ask me whenever you need clarification on a concept or project deliverable.`;
  }

  async organizeCoursePath(params: {
    query: string;
    language?: string;
    videos?: any[];
    moduleCount?: number;
  }): Promise<AiLearningPath | null> {
    try {
      const res = await fetch('/api/quinn/organize-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.path) return data.path as AiLearningPath;
      }
    } catch (err) {
      console.warn('AI Course Organizer fallback warning:', err);
    }
    return null;
  }

  async generateLessonSummary(params: {
    courseTitle: string;
    lessonTopic: string;
    videoTitle?: string;
    language?: string;
    objectives?: string[];
  }): Promise<{ keyTakeaways: string[]; studyTips: string[]; disclaimer: string }> {
    try {
      const res = await fetch('/api/quinn/lesson-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.summary) return data.summary;
      }
    } catch (err) {
      console.warn('AI Lesson Summary fallback warning:', err);
    }
    return {
      keyTakeaways: [
        `Master the foundational workflow and terminology of "${params.lessonTopic}".`,
        `Practice applying "${params.lessonTopic}" concepts to real-world deliverables in ${params.courseTitle}.`,
      ],
      studyTips: [
        'Use Lesson Notes to jot down key formulas or steps while watching the lecture.',
        'Attempt the verification quiz immediately after completing the video lecture.',
      ],
      disclaimer: 'Structured study summary generated from lesson topic and course metadata.',
    };
  }

  // ------------------------------------------------------------------
  // Deterministic Local Fallback Helpers (Only when API key absent)
  // ------------------------------------------------------------------
  private buildStructuredFallbackQuiz(params: {
    courseTitle: string;
    lessonTopic: string;
    category: string;
    basicCount?: number;
    intermediateCount?: number;
    advancedCount?: number;
  }): QuizQuestion[] {
    const topic = params.lessonTopic || params.courseTitle;
    const cat = params.category || 'Applied Disciplines';
    const bCount = params.basicCount ?? 5;
    const iCount = params.intermediateCount ?? 5;
    const aCount = params.advancedCount ?? 5;

    const baseQuestions: QuizQuestion[] = [
      // 5 BASIC
      {
        id: 'q-b-1',
        questionText: `What is the primary goal of studying "${topic}" within ${cat}?`,
        type: 'multiple_choice',
        format: 'MULTIPLE CHOICE',
        difficulty: 'basic',
        options: [
          'To apply structured, verifiable methodologies to solve real-world problems',
          'To memorize isolated terms without practical application',
          'To skip quality checks before delivering outputs',
          'To eliminate stakeholder evaluation and testing'
        ],
        correctAnswer: 'To apply structured, verifiable methodologies to solve real-world problems',
        rubricExplanation: 'Structured methodology and measurable verification underpin effective mastery.',
        points: 5,
      },
      {
        id: 'q-b-2',
        questionText: `Foundational principles in ${topic} should be verified through hands-on practice before scaling to complex deliverables.`,
        type: 'true_false',
        format: 'TRUE / FALSE',
        difficulty: 'basic',
        options: ['True', 'False'],
        correctAnswer: 'True',
        rubricExplanation: 'Iterative validation prevents compounding errors in advanced project stages.',
        points: 5,
      },
      {
        id: 'q-b-3',
        questionText: `Fill in the blank: Before building workflows in ${topic}, teams first define measurable project ________.`,
        type: 'fill_in_blank',
        format: 'FILL IN THE BLANK',
        difficulty: 'basic',
        options: [],
        correctAnswer: 'objectives',
        rubricExplanation: 'Clear objectives align implementation decisions with target outcomes.',
        points: 5,
      },
      {
        id: 'q-b-4',
        questionText: `In 1–2 sentences, explain why clear documentation matters when working on ${topic}.`,
        type: 'short_answer',
        format: 'SHORT ANSWER',
        difficulty: 'basic',
        options: [],
        correctAnswer: 'Clear documentation ensures reproducibility, improves team collaboration, and enables accurate review and maintenance.',
        rubricExplanation: 'Award marks for mentioning reproducibility, clarity, collaboration, or maintainability.',
        points: 5,
      },
      {
        id: 'q-b-5',
        questionText: `Practical Application: Which first step reduces errors when starting a new ${topic} assignment?`,
        type: 'practical_application',
        format: 'PRACTICAL APPLICATION',
        difficulty: 'basic',
        options: [
          'Reviewing requirements, validating inputs, and outlining the structure first',
          'Publishing the final output without testing or review',
          'Ignoring target audience or system constraints',
          'Copying unrelated templates without adaptation'
        ],
        correctAnswer: 'Reviewing requirements, validating inputs, and outlining the structure first',
        rubricExplanation: 'Requirements analysis and upfront validation prevent rework.',
        points: 5,
      },
      // 5 INTERMEDIATE
      {
        id: 'q-i-1',
        questionText: `When scaling workflows in ${topic}, how do structured feedback loops improve outcomes?`,
        type: 'multiple_choice',
        format: 'MULTIPLE CHOICE',
        difficulty: 'intermediate',
        options: [
          'They surface defects early and guide data-driven iteration',
          'They permanently freeze requirements so nothing can be improved',
          'They remove the need for measurable metrics',
          'They increase manual rework without insights'
        ],
        correctAnswer: 'They surface defects early and guide data-driven iteration',
        rubricExplanation: 'Feedback loops turn performance measurements into continuous improvements.',
        points: 7,
      },
      {
        id: 'q-i-2',
        questionText: `In ${topic}, balancing quality benchmarks against delivery timelines requires prioritizing core high-impact deliverables first.`,
        type: 'true_false',
        format: 'TRUE / FALSE',
        difficulty: 'intermediate',
        options: ['True', 'False'],
        correctAnswer: 'True',
        rubricExplanation: 'Prioritizing core value deliverables ensures reliability under schedule constraints.',
        points: 7,
      },
      {
        id: 'q-i-3',
        questionText: `Fill in the blank: Evaluating whether a ${topic} implementation succeeds relies on quantitative performance ________.`,
        type: 'fill_in_blank',
        format: 'FILL IN THE BLANK',
        difficulty: 'intermediate',
        options: [],
        correctAnswer: 'metrics',
        rubricExplanation: 'Quantitative metrics provide objective evidence of effectiveness.',
        points: 7,
      },
      {
        id: 'q-i-4',
        questionText: `Describe how you would diagnose why a ${topic} solution is underperforming compared to its baseline goal.`,
        type: 'short_answer',
        format: 'SHORT ANSWER',
        difficulty: 'intermediate',
        options: [],
        correctAnswer: 'Segment the workflow stages, compare telemetry against baseline metrics, isolate bottlenecks, and run controlled tests.',
        rubricExplanation: 'Look for root-cause isolation, telemetry/metrics comparison, and controlled testing.',
        points: 7,
      },
      {
        id: 'q-i-5',
        questionText: `Practical Scenario: Stakeholders report inconsistent outputs from your ${topic} process. What is the best diagnostic step?`,
        type: 'practical_application',
        format: 'PRACTICAL APPLICATION',
        difficulty: 'intermediate',
        options: [
          'Inspect intermediate inputs, verify constraints, and isolate the failing stage',
          'Discard all historical logs and restart blindly',
          'Skip quality verification to ship faster',
          'Assume the user misunderstood without inspecting evidence'
        ],
        correctAnswer: 'Inspect intermediate inputs, verify constraints, and isolate the failing stage',
        rubricExplanation: 'Systematic stage-by-stage verification identifies exact failure points.',
        points: 7,
      },
      // 5 ADVANCED
      {
        id: 'q-a-1',
        questionText: `In enterprise-grade ${topic}, which practice best ensures long-term resilience and accountability?`,
        type: 'multiple_choice',
        format: 'MULTIPLE CHOICE',
        difficulty: 'advanced',
        options: [
          'Automated validation gates, audit trails, and graceful fallback procedures',
          'Single points of failure with unmonitored manual overrides',
          'Storing unvalidated user data directly in production outputs',
          'Bypassing peer or faculty review'
        ],
        correctAnswer: 'Automated validation gates, audit trails, and graceful fallback procedures',
        rubricExplanation: 'Resilient systems combine validation gates, observability, and fallbacks.',
        points: 10,
      },
      {
        id: 'q-a-2',
        questionText: `Separating core domain logic from external delivery channels makes a ${topic} architecture easier to test and evolve.`,
        type: 'true_false',
        format: 'TRUE / FALSE',
        difficulty: 'advanced',
        options: ['True', 'False'],
        correctAnswer: 'True',
        rubricExplanation: 'Decoupled modular boundaries preserve maintainability as requirements scale.',
        points: 10,
      },
      {
        id: 'q-a-3',
        questionText: `Fill in the blank: Protecting sensitive operational records inside a ${topic} workflow requires strict role-based access ________.`,
        type: 'fill_in_blank',
        format: 'FILL IN THE BLANK',
        difficulty: 'advanced',
        options: [],
        correctAnswer: 'control',
        rubricExplanation: 'Role-Based Access Control (RBAC) enforces least-privilege boundaries.',
        points: 10,
      },
      {
        id: 'q-a-4',
        questionText: `Outline how you would evaluate ROI and quality assurance before presenting a capstone ${topic} project to leadership.`,
        type: 'short_answer',
        format: 'SHORT ANSWER',
        difficulty: 'advanced',
        options: [],
        correctAnswer: 'Benchmark before-and-after KPIs, verify edge-case reliability, document trade-offs, and prepare clear visual evidence for stakeholders.',
        rubricExplanation: 'Grade on KPI benchmarking, edge-case testing, trade-off analysis, and executive clarity.',
        points: 10,
      },
      {
        id: 'q-a-5',
        questionText: `Capstone Application: You are defending your ${topic} implementation before an evaluation panel. Which element strengthens your defense most?`,
        type: 'practical_application',
        format: 'PRACTICAL APPLICATION',
        difficulty: 'advanced',
        options: [
          'Demonstrating reproducible outputs, measurable test results, and reasoned architectural trade-offs',
          'Reading generic definitions without showing working deliverables',
          'Avoiding questions about edge cases or limitations',
          'Presenting unverified claims without supporting artifacts'
        ],
        correctAnswer: 'Demonstrating reproducible outputs, measurable test results, and reasoned architectural trade-offs',
        rubricExplanation: 'Strong technical defense pairs working evidence with transparent trade-off reasoning.',
        points: 10,
      },
    ];

    const basics = baseQuestions.filter((q) => q.difficulty === 'basic').slice(0, bCount);
    const inters = baseQuestions.filter((q) => q.difficulty === 'intermediate').slice(0, iCount);
    const advs = baseQuestions.filter((q) => q.difficulty === 'advanced').slice(0, aCount);
    return [...basics, ...inters, ...advs];
  }

  private evaluateQuizLocally(params: {
    questions: QuizQuestion[];
    studentAnswers: Record<string, string>;
    studentId: string;
    courseId: string;
    lessonId: string;
    passingScorePercent?: number;
  }): QuizAttempt {
    const responses: QuizResponseItem[] = [];
    let totalScore = 0;
    let maxScore = 0;
    const revisionTopics: string[] = [];

    for (const q of params.questions) {
      const studentAns = (params.studentAnswers[q.id] || '').trim();
      maxScore += q.points;
      let isCorrect = false;
      let scoreAwarded = 0;
      let feedback = '';

      if (q.type === 'multiple_choice' || q.type === 'true_false' || (q.options && q.options.length > 0)) {
        isCorrect = studentAns.toLowerCase() === q.correctAnswer.toLowerCase();
        scoreAwarded = isCorrect ? q.points : 0;
        feedback = isCorrect
          ? `Correct! ${q.rubricExplanation}`
          : `Incorrect. Correct answer: "${q.correctAnswer}". ${q.rubricExplanation}`;
      } else if (q.type === 'fill_in_blank') {
        isCorrect =
          studentAns.length > 0 &&
          (studentAns.toLowerCase() === q.correctAnswer.toLowerCase() ||
            studentAns.toLowerCase().includes(q.correctAnswer.toLowerCase()));
        scoreAwarded = isCorrect ? q.points : 0;
        feedback = isCorrect
          ? `Accurate response. ${q.rubricExplanation}`
          : `Expected: "${q.correctAnswer}". ${q.rubricExplanation}`;
      } else {
        const keyTerms = q.correctAnswer.toLowerCase().split(' ').filter((w) => w.length > 4);
        const matchCount = keyTerms.filter((t) => studentAns.toLowerCase().includes(t)).length;
        if (studentAns.length >= 35 && matchCount >= Math.min(2, keyTerms.length)) {
          isCorrect = true;
          scoreAwarded = q.points;
          feedback = `Strong conceptual response. ${q.rubricExplanation}`;
        } else if (studentAns.length >= 15) {
          isCorrect = false;
          scoreAwarded = Math.round(q.points * 0.5);
          feedback = `Partially answered. Expand with specifics: ${q.rubricExplanation}`;
        } else {
          isCorrect = false;
          scoreAwarded = 0;
          feedback = `Incomplete response. Model concept: ${q.rubricExplanation}`;
        }
      }

      if (!isCorrect) {
        revisionTopics.push(q.questionText.slice(0, 68));
      }

      totalScore += scoreAwarded;
      responses.push({
        questionId: q.id,
        studentAnswer: studentAns || '(No response provided)',
        isCorrect,
        scoreAwarded,
        maxScore: q.points,
        feedback,
      });
    }

    const passing = params.passingScorePercent ?? 70;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const passed = percentage >= passing;

    return {
      id: `attempt-${Date.now()}`,
      attemptId: `attempt-${Date.now()}`,
      studentId: params.studentId,
      courseId: params.courseId,
      lessonId: params.lessonId,
      submittedAt: new Date().toISOString(),
      score: totalScore,
      maxScore,
      percentage,
      percentageScore: percentage,
      passed,
      responses,
      quinnFeedback: passed
        ? `Great job! You scored ${percentage}%, meeting the ${passing}% threshold. Your Practical Project brief is unlocked.`
        : `You scored ${percentage}% (passing threshold: ${passing}%). Review the explanations below and revisit your lesson materials before retaking.`,
      recommendedRevisionTopics: [...new Set(revisionTopics)].slice(0, 5),
    };
  }

  private buildFallbackProject(params: {
    courseId?: string;
    courseTitle: string;
    lessonTopic: string;
    category: string;
    variationSeed?: string;
  }): PracticalProjectDefinition {
    const topic = params.lessonTopic || params.courseTitle;
    const scenarios = [
      'a regional multi-branch healthcare clinic',
      'a fast-growing local retail & e-commerce brand',
      'a community fintech & micro-lending platform',
      'a smart logistics & supply-chain operator',
      'an EdTech skill-assessment academy',
    ];
    const seedNum = (params.variationSeed || '0')
      .split('')
      .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const scenario = scenarios[seedNum % scenarios.length];

    return {
      id: `proj-${Date.now()}`,
      projectId: `proj-${Date.now()}`,
      courseId: params.courseId || params.courseTitle,
      lessonId: topic,
      variationSeed: params.variationSeed,
      title: `Practical Capstone: ${topic} Solution for ${scenario.replace(/^a /, '')}`,
      description: `Design, execute, and present a complete applied ${topic} deliverable tailored specifically for ${scenario}.`,
      problemStatement: `As an applied specialist in ${params.category}, build an end-to-end solution demonstrating mastery of ${topic} for ${scenario}, including measurable outcomes and verification benchmarks.`,
      objectives: [
        `Translate ${topic} theory into a structured, verifiable implementation for ${scenario}.`,
        'Document clear architecture, target metrics, and quality assurance checks.',
        'Prepare an executive slide deck or recorded walkthrough for faculty rubric evaluation.',
      ],
      instructions: [
        '1. Define the organizational context, target users, and measurable success criteria.',
        '2. Design the end-to-end strategy, workflow architecture, or implementation plan.',
        '3. Build the core solution artifact (codebase, campaign blueprint, or working prototype).',
        '4. Validate quality through sample test cases, metrics projections, or audit logs.',
        '5. Package deliverables (PDF/Word report, slide deck, links, or demo video) for evaluation.',
      ],
      deliverables: [
        { title: '1. Executive Summary & Problem Scope', description: 'Business/technical context and objectives', fileTypes: ['PDF', 'DOCX'] },
        { title: '2. Core Architecture & Implementation', description: 'Working deliverable, codebase, or strategy pack', fileTypes: ['GitHub', 'PDF', 'ZIP'] },
        { title: '3. Validation & Performance Metrics', description: 'Test outputs, KPIs, and verification results', fileTypes: ['PDF', 'PNG'] },
        { title: '4. Presentation Slide Deck / Demo', description: 'Visual deck or video demonstration', fileTypes: ['PPTX', 'MP4', 'Link'] },
      ],
      requiredDeliverables: [
        'Executive Summary & Scope Document (PDF/Word)',
        'Working Deliverable / Repository Link',
        'Performance Verification Plan',
        'Presentation Slides or Recorded Video',
      ],
      expectedOutput: `A complete, verifiable ${topic} deliverable package tailored to ${scenario} ready for 100-mark faculty defense.`,
      submissionDeadlineDays: 14,
      evaluationCriteria: [
        { name: 'Subject Knowledge', maxMarks: 20, description: 'Depth of understanding of theoretical principles and standards.' },
        { name: 'Understanding of Concepts', maxMarks: 20, description: 'Correct application of methodologies and structural design.' },
        { name: 'Practical Implementation', maxMarks: 20, description: 'Working prototype, complete deliverables, and verification.' },
        { name: 'Creativity & Innovation', maxMarks: 15, description: 'Original thinking and practical problem-solving refinements.' },
        { name: 'Presentation Skills', maxMarks: 15, description: 'Clarity, slide quality, pacing, and professional structure.' },
        { name: 'Communication Skills', maxMarks: 10, description: 'Precision of terminology and articulate defense.' },
      ],
      maxMarks: 100,
      difficultyLevel: 'Intermediate',
    };
  }

  async generatePracticeQuestions(params: {
    courseTitle: string;
    lessonTopic: string;
    language?: string;
    objectives?: string[];
  }): Promise<Array<{ question: string; hint: string; sampleAnswer: string; difficulty: string }>> {
    try {
      const res = await fetch('/api/quinn/practice-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          return data.questions;
        }
      }
    } catch {
      // fallback below
    }
    const topic = params.lessonTopic || params.courseTitle;
    return [
      {
        question: `Explain the core workflow and primary outcome of "${topic}".`,
        hint: 'Focus on inputs, transformations, and verification.',
        sampleAnswer: `${topic} transforms structured inputs into reliable, verifiable outputs.`,
        difficulty: 'Basic',
      },
      {
        question: `Describe one common error in "${topic}" and how you validate against it.`,
        hint: 'Consider edge cases and boundary assumptions.',
        sampleAnswer: 'Missing validation on assumptions; run clean unit/sanity checks against known examples.',
        difficulty: 'Intermediate',
      },
    ];
  }

  async recommendCategory(params: {
    title: string;
    description: string;
    availableCategories?: string[];
  }): Promise<{ primaryCategory: string; subcategory: string; additionalCategories: string[]; reason: string }> {
    try {
      const res = await fetch('/api/quinn/recommend-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback below
    }
    return {
      primaryCategory: params.availableCategories?.[0] || 'Artificial Intelligence',
      subcategory: params.title.slice(0, 40) || 'Applied Fundamentals',
      additionalCategories: [params.availableCategories?.[0] || 'Artificial Intelligence'],
      reason: 'Fallback keyword classification.',
    };
  }

  async discoverAndRecommend(params: {
    query: string;
    studentProfile?: Partial<StudentProfile> | null;
    filters?: Partial<MarketplaceFilterParams>;
    maxPerGroup?: number;
  }): Promise<QuinnDiscoveryResponse> {
    try {
      const res = await fetch('/api/quinn/discover-and-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return (await res.json()) as QuinnDiscoveryResponse;
      }
    } catch (err) {
      console.warn('discoverAndRecommend network fallback:', err);
    }

    const intent = parseEducationalIntent(params.query || '', params.studentProfile);
    const topic = intent.desiredSkill || intent.cleanedQuery || 'Core Foundations';
    return {
      parsedIntent: intent,
      recommendationGroups: [],
      youtubeResources: youtubeVideoService.getVideosForCourse(topic, intent.primarySubject || 'Education', topic),
      relatedSkills: [topic, 'Communication Skills', 'Problem Solving'],
      totalMatchedCourses: 0,
      youtubeSource: 'curated_library',
      roadmap: {
        id: `roadmap-${Date.now().toString(36)}`,
        topic,
        targetOutcome: `Build structured mastery in ${topic}`,
        educationContext: intent.degreeOrClass || intent.educationLevelLabel || 'Self-Paced',
        totalEstimatedDuration: '8 Weeks · Self-Paced',
        stages: [],
        nonDegreeDisclaimer: 'Self-paced OpenFrame Skill Roadmap — not an accredited university degree.',
        generatedBy: 'structured_engine',
        createdAt: new Date().toISOString(),
      },
    };
  }

  async askQuinnQa(params: {
    question: string;
    studentProfile?: Partial<StudentProfile> | null;
    educationContext?: string;
    language?: string;
  }): Promise<QaStructuredResult> {
    try {
      const res = await fetch('/api/quinn/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return (await res.json()) as QaStructuredResult;
      }
    } catch (err) {
      console.warn('askQuinnQa network fallback:', err);
    }

    const intent = parseEducationalIntent(params.question || '', params.studentProfile);
    const topic = intent.desiredSkill || intent.primarySubject || params.question;
    return {
      question: params.question,
      subject: intent.primarySubject || 'General Studies',
      topic,
      educationContext: params.educationContext || intent.degreeOrClass || 'Learner',
      language: params.language || intent.preferredLanguage || 'English',
      answer: `${topic} focuses on understanding core principles, structured examples, and practical application steps.`,
      examples: [`Apply ${topic} inside a small worked example before solving larger problems.`],
      keyTakeaways: [`Understand key definitions of ${topic}`, `Practice actively with short verification quizzes.`],
      relatedConcepts: [`${topic} Basics`, 'Applied Case Analysis'],
      recommendedCourses: [],
      youtubeVideos: youtubeVideoService.getVideosForCourse(topic, intent.primarySubject || 'Education', topic),
      suggestedLearningPathTitle: `${topic} Study Path`,
      suggestedLearningPathSteps: [`1. Clarify core terms in ${topic}`, `2. Watch guided videos`, `3. Practice & enroll`],
      practiceQuiz: [],
      generatedBy: 'structured_engine',
    };
  }
}

export const quinnAiService = new QuinnAiService();
