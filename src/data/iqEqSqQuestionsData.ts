import { AssessmentDimension, IqEqSqQuestionItem } from '../types';

export type IqEqSqGradeBand = 'Primary (1-5)' | 'Middle (6-8)' | 'Secondary (9-12)';

export const NON_CLINICAL_EDUCATIONAL_DISCLAIMER =
  'Educational Self-Reflection & Aptitude Notice: This OpenFrame IQ / EQ / SQ assessment is designed strictly for educational guidance, learning-habit reflection, and holistic student skill benchmarking. It is NOT a clinical psychological evaluation, medical diagnosis, or standardized psychometric IQ test.';

export interface IqEqSqEvaluatedScore {
  scorePercent: number;
  bandLabel: string;
  educationalSummary: string;
  subScores: Record<string, number>;
  disclaimer: string;
}

const IQ_BANK: Record<IqEqSqGradeBand, IqEqSqQuestionItem[]> = {
  'Primary (1-5)': [
    {
      id: 'iq-p-1',
      prompt: 'Look at the number pattern: 3, 6, 9, 12, ___. Which number comes next?',
      domain: 'Numerical Pattern',
      questionType: 'mcq',
      options: ['13', '14', '15', '18'],
      correctOptionIndex: 2,
    },
    {
      id: 'iq-p-2',
      prompt: 'If every triangle has 3 sides and every square has 4 sides, how many total sides do 2 triangles and 1 square have?',
      domain: 'Quantitative Logic',
      questionType: 'mcq',
      options: ['8', '9', '10', '12'],
      correctOptionIndex: 2,
    },
    {
      id: 'iq-p-3',
      prompt: 'Which word does NOT belong in this group: Mango, Apple, Carrot, Banana?',
      domain: 'Verbal Classification',
      questionType: 'mcq',
      options: ['Mango', 'Apple', 'Carrot', 'Banana'],
      correctOptionIndex: 2,
    },
    {
      id: 'iq-p-4',
      prompt: 'Riya stands 3rd from the front in a line of 7 students. How many students are behind her?',
      domain: 'Spatial & Ordering',
      questionType: 'mcq',
      options: ['3', '4', '5', '6'],
      correctOptionIndex: 1,
    },
    {
      id: 'iq-p-5',
      prompt: 'Book is to Reading as Fork is to ___?',
      domain: 'Analogical Reasoning',
      questionType: 'mcq',
      options: ['Writing', 'Eating', 'Drawing', 'Sleeping'],
      correctOptionIndex: 1,
    },
    {
      id: 'iq-p-6',
      prompt: 'A clock shows 2:00. What time will it show after 90 minutes?',
      domain: 'Quantitative Logic',
      questionType: 'mcq',
      options: ['3:00', '3:15', '3:30', '4:00'],
      correctOptionIndex: 2,
    },
  ],
  'Middle (6-8)': [
    {
      id: 'iq-m-1',
      prompt: 'Find the missing term in the sequence: 2, 5, 11, 23, 47, ___?',
      domain: 'Numerical Pattern',
      questionType: 'mcq',
      options: ['71', '89', '94', '95'],
      correctOptionIndex: 3,
    },
    {
      id: 'iq-m-2',
      prompt: 'If NORTH is coded as OPSUI (each letter shifted +1), how is SOUTH coded?',
      domain: 'Symbolic Coding',
      questionType: 'mcq',
      options: ['TPVUI', 'TPVTI', 'RPVUI', 'TPUVI'],
      correctOptionIndex: 0,
    },
    {
      id: 'iq-m-3',
      prompt: 'All rectangles are parallelograms. All squares are rectangles. Which conclusion MUST be true?',
      domain: 'Deductive Logic',
      questionType: 'mcq',
      options: [
        'All parallelograms are squares',
        'All squares are parallelograms',
        'No square is a parallelogram',
        'Rectangles have unequal opposite sides',
      ],
      correctOptionIndex: 1,
    },
    {
      id: 'iq-m-4',
      prompt: 'A cyclist rides 6 km East, turns North for 8 km. What is the straight-line distance from the start?',
      domain: 'Spatial & Geometry',
      questionType: 'mcq',
      options: ['10 km', '12 km', '14 km', '48 km'],
      correctOptionIndex: 0,
    },
    {
      id: 'iq-m-5',
      prompt: 'If 4 students can organize 120 library books in 3 hours, how many books can 2 students organize in 3 hours at the same pace?',
      domain: 'Quantitative Logic',
      questionType: 'mcq',
      options: ['30', '40', '60', '80'],
      correctOptionIndex: 2,
    },
    {
      id: 'iq-m-6',
      prompt: 'Architect is to Blueprint as Composer is to ___?',
      domain: 'Analogical Reasoning',
      questionType: 'mcq',
      options: ['Orchestra', 'Musical Score', 'Microphone', 'Stage'],
      correctOptionIndex: 1,
    },
  ],
  'Secondary (9-12)': [
    {
      id: 'iq-s-1',
      prompt: 'Consider the series: 1, 4, 9, 16, 25, 36, 49, ___. Which number completes it?',
      domain: 'Numerical Pattern',
      questionType: 'mcq',
      options: ['56', '60', '64', '81'],
      correctOptionIndex: 2,
    },
    {
      id: 'iq-s-2',
      prompt: 'Statement 1: Every algorithm in Library X runs in O(n log n). Statement 2: SortA is in Library X. Which statement follows necessarily?',
      domain: 'Deductive Logic',
      questionType: 'mcq',
      options: [
        'Only SortA runs in O(n log n)',
        'SortA runs in O(n log n)',
        'Every O(n log n) algorithm is in Library X',
        'SortA uses O(n^2) memory',
      ],
      correctOptionIndex: 1,
    },
    {
      id: 'iq-s-3',
      prompt: 'A cube painted blue on all faces is cut into 27 equal smaller cubes. How many smaller cubes have exact 2 faces painted blue?',
      domain: 'Spatial Reasoning',
      questionType: 'mcq',
      options: ['6', '8', '12', '18'],
      correctOptionIndex: 2,
    },
    {
      id: 'iq-s-4',
      prompt: 'Two trains 180 km apart travel toward each other at 40 km/h and 50 km/h. After how long do they meet?',
      domain: 'Quantitative Logic',
      questionType: 'mcq',
      options: ['1.5 hours', '2.0 hours', '2.25 hours', '3.0 hours'],
      correctOptionIndex: 1,
    },
    {
      id: 'iq-s-5',
      prompt: 'Which pair shares the same relationship as Hypothesis : Experiment?',
      domain: 'Analogical Reasoning',
      questionType: 'mcq',
      options: [
        'Theorem : Proof',
        'Clock : Pendulum',
        'Chapter : Cover',
        'Keyboard : Monitor',
      ],
      correctOptionIndex: 0,
    },
    {
      id: 'iq-s-6',
      prompt: 'In a lab, Test A passes only if Sensor 1 is active OR Sensor 2 is calibrated. If Test A failed, what is definitely true?',
      domain: 'Boolean Logic',
      questionType: 'mcq',
      options: [
        'Sensor 1 was active and Sensor 2 was not calibrated',
        'Neither Sensor 1 was active nor Sensor 2 was calibrated',
        'Sensor 1 was inactive, Sensor 2 was calibrated',
        'Both sensors were active',
      ],
      correctOptionIndex: 1,
    },
  ],
};

const EQ_LIKERT_OPTIONS = [
  'Rarely / Needs Support',
  'Sometimes',
  'Usually',
  'Consistently / Strong Habit',
];
const EQ_LIKERT_WEIGHTS = [25, 55, 80, 100];

const EQ_BANK: Record<IqEqSqGradeBand, IqEqSqQuestionItem[]> = {
  'Primary (1-5)': [
    {
      id: 'eq-p-1',
      prompt: 'When a classmate looks upset or left out at lunch, I check on them or invite them to join.',
      domain: 'Empathy',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-p-2',
      prompt: 'When I feel frustrated with a difficult homework question, I take a calm breath before asking for help.',
      domain: 'Self-Regulation',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-p-3',
      prompt: 'In group activities, I listen to my teammates’ ideas before insisting on my own.',
      domain: 'Collaboration',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-p-4',
      prompt: 'I can name what I am feeling (nervous, excited, disappointed, proud) and explain why.',
      domain: 'Self-Awareness',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-p-5',
      prompt: 'When I accidentally hurt someone’s feelings or make a mistake, I apologize honestly.',
      domain: 'Accountability',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
  ],
  'Middle (6-8)': [
    {
      id: 'eq-m-1',
      prompt: 'During a disagreement with a friend, I pause to understand their perspective before reacting.',
      domain: 'Conflict Resolution',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-m-2',
      prompt: 'Before an important test or stage presentation, I use healthy routines to manage nervousness.',
      domain: 'Self-Regulation',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-m-3',
      prompt: 'I notice when someone in my peer group is silent or discouraged and offer constructive encouragement.',
      domain: 'Empathy',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-m-4',
      prompt: 'When a teacher gives critical feedback on an assignment, I use it to improve rather than feeling defeated.',
      domain: 'Growth Mindset',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-m-5',
      prompt: 'I communicate respectfully even when peers have different backgrounds or opinions.',
      domain: 'Social Awareness',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
  ],
  'Secondary (9-12)': [
    {
      id: 'eq-s-1',
      prompt: 'Under academic deadlines or exam pressure, I organize priorities calmly rather than avoiding tasks.',
      domain: 'Self-Regulation',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-s-2',
      prompt: 'In team projects, I actively mediate differences so every contributor feels heard and accountable.',
      domain: 'Collaboration & Leadership',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-s-3',
      prompt: 'I accurately recognize how my tone and stress affect classmates, teachers, and family members.',
      domain: 'Self-Awareness',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-s-4',
      prompt: 'After a setback in grades or competitions, I reflect objectively on habits I can adjust next time.',
      domain: 'Resilience',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'eq-s-5',
      prompt: 'I listen attentively without interrupting when someone shares a difficult problem.',
      domain: 'Empathy',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
  ],
};

const SQ_BANK: Record<IqEqSqGradeBand, IqEqSqQuestionItem[]> = {
  'Primary (1-5)': [
    {
      id: 'sq-p-1',
      prompt: 'You find a lost pencil box with a student’s name tag in the playground. What should you do?',
      domain: 'Integrity & Honesty',
      questionType: 'mcq',
      options: [
        'Keep it quietly because nobody saw you',
        'Leave it on the ground in the rain',
        'Return it to the student or hand it to the class teacher',
        'Give it to a friend',
      ],
      correctOptionIndex: 2,
    },
    {
      id: 'sq-p-2',
      prompt: 'I feel happy helping keep our classroom, school garden, and community clean without being asked.',
      domain: 'Stewardship & Care',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'sq-p-3',
      prompt: 'I try to treat all classmates fairly, including students who are new or shy.',
      domain: 'Compassion & Inclusion',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'sq-p-4',
      prompt: 'I express gratitude to teachers, parents, and school helpers for what they do each day.',
      domain: 'Gratitude',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'sq-p-5',
      prompt: 'Why is telling the truth important even when you worry about making a mistake?',
      domain: 'Ethical Reflection',
      questionType: 'mcq',
      options: [
        'Truth builds trust and helps us learn how to fix mistakes together',
        'It only matters if a teacher is watching',
        'Truth is unnecessary if nobody asks',
        'Because rules say so without any reason',
      ],
      correctOptionIndex: 0,
    },
  ],
  'Middle (6-8)': [
    {
      id: 'sq-m-1',
      prompt: 'I reflect on how my daily choices—like saving water, reducing waste, and kindness—impact others.',
      domain: 'Responsibility & Mindfulness',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'sq-m-2',
      prompt: 'A group of friends laughs at a classmate’s accent in a group chat. What reflects ethical courage?',
      domain: 'Ethical Courage',
      questionType: 'mcq',
      options: [
        'Join in so friends stay happy',
        'Stay silent and forward the screenshot',
        'Speak up respectfully or support the targeted classmate privately and alert a mentor if needed',
        'Leave the school club permanently',
      ],
      correctOptionIndex: 2,
    },
    {
      id: 'sq-m-3',
      prompt: 'I connect what I learn in school to how I can help my neighborhood, family, or society.',
      domain: 'Purpose & Service',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'sq-m-4',
      prompt: 'I respect diverse cultural, linguistic, and family traditions among my peers.',
      domain: 'Inclusion & Respect',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'sq-m-5',
      prompt: 'I avoid copying homework or test answers even when short on time.',
      domain: 'Academic Integrity',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
  ],
  'Secondary (9-12)': [
    {
      id: 'sq-s-1',
      prompt: 'I weigh long-term ethical impact alongside personal convenience when making academic or career choices.',
      domain: 'Ethical Judgement',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'sq-s-2',
      prompt: 'You discover an error in a science lab reading that makes your team’s project look better than it is. What is right?',
      domain: 'Scientific & Academic Integrity',
      questionType: 'mcq',
      options: [
        'Keep the flattering data so the team wins first prize',
        'Document the actual reading honestly and explain the variance',
        'Delete the lab logbook',
        'Blame the equipment in secret',
      ],
      correctOptionIndex: 1,
    },
    {
      id: 'sq-s-3',
      prompt: 'I participate meaningfully in service learning, peer mentoring, or community sustainability drives.',
      domain: 'Community Purpose',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'sq-s-4',
      prompt: 'I practice quiet reflection or journaling to align my goals with my core values.',
      domain: 'Inner Alignment & Mindfulness',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
    {
      id: 'sq-s-5',
      prompt: 'I uphold fairness and honesty even when peer pressure encourages shortcuts.',
      domain: 'Moral Resilience',
      questionType: 'likert',
      options: EQ_LIKERT_OPTIONS,
      likertWeights: EQ_LIKERT_WEIGHTS,
    },
  ],
};

export function getQuestionBank(
  dimension: AssessmentDimension,
  gradeBand: IqEqSqGradeBand
): IqEqSqQuestionItem[] {
  if (dimension === 'IQ') return IQ_BANK[gradeBand] || IQ_BANK['Middle (6-8)'];
  if (dimension === 'EQ') return EQ_BANK[gradeBand] || EQ_BANK['Middle (6-8)'];
  return SQ_BANK[gradeBand] || SQ_BANK['Middle (6-8)'];
}

/** Strips answer keys/weights before rendering interactive runner for students */
export function stripQuestionAnswers(
  questions: IqEqSqQuestionItem[]
): Array<Omit<IqEqSqQuestionItem, 'correctOptionIndex' | 'likertWeights'>> {
  return questions.map(({ correctOptionIndex: _c, likertWeights: _w, ...publicFields }) => publicFields);
}

/** Authoritative evaluation for IQ / EQ / SQ educational assessments */
export function evaluateIqEqSqResponses(
  dimension: AssessmentDimension,
  gradeBand: IqEqSqGradeBand,
  answers: Record<string, number>
): IqEqSqEvaluatedScore {
  const bank = getQuestionBank(dimension, gradeBand);
  if (!bank.length) {
    return {
      scorePercent: 0,
      bandLabel: 'Pending',
      educationalSummary: 'No assessment questions found for the selected grade band.',
      subScores: {},
      disclaimer: NON_CLINICAL_EDUCATIONAL_DISCLAIMER,
    };
  }

  let totalScore = 0;
  const domainTotals: Record<string, { earned: number; count: number }> = {};

  for (const q of bank) {
    const chosen = answers[q.id];
    let itemScore = 0;
    if (typeof chosen === 'number' && Number.isFinite(chosen)) {
      if (q.questionType === 'mcq') {
        itemScore = chosen === q.correctOptionIndex ? 100 : 0;
      } else {
        const weights = q.likertWeights || EQ_LIKERT_WEIGHTS;
        const clampedIdx = Math.max(0, Math.min(weights.length - 1, Math.round(chosen)));
        itemScore = weights[clampedIdx] ?? 0;
      }
    }

    totalScore += itemScore;
    if (!domainTotals[q.domain]) {
      domainTotals[q.domain] = { earned: 0, count: 0 };
    }
    domainTotals[q.domain].earned += itemScore;
    domainTotals[q.domain].count += 1;
  }

  const scorePercent = Math.round(totalScore / bank.length);
  const subScores: Record<string, number> = {};
  for (const [domain, stats] of Object.entries(domainTotals)) {
    subScores[domain] = Math.round(stats.earned / Math.max(1, stats.count));
  }

  const sortedDomains = Object.entries(subScores).sort((a, b) => b[1] - a[1]);
  const topDomain = sortedDomains[0]?.[0] || dimension;
  const growthDomain = sortedDomains[sortedDomains.length - 1]?.[0] || dimension;

  let bandLabel = 'Developing Foundation';
  if (scorePercent >= 85) bandLabel = 'Strong Mastery & Readiness';
  else if (scorePercent >= 70) bandLabel = 'Proficient & Growing';
  else if (scorePercent >= 50) bandLabel = 'Emerging Practice';

  const educationalSummary =
    dimension === 'IQ'
      ? `Educational Aptitude Reflection (${gradeBand}): Scored ${scorePercent}% (${bandLabel}). Strongest reasoning area: ${topDomain}. Recommended guided practice focus: ${growthDomain}.`
      : dimension === 'EQ'
      ? `Social-Emotional Learning Profile (${gradeBand}): Readiness index ${scorePercent}% (${bandLabel}). Notable strength in ${topDomain}; ongoing mentoring opportunity in ${growthDomain}.`
      : `Values & Ethical Reflection Profile (${gradeBand}): Alignment index ${scorePercent}% (${bandLabel}). Strongest pillar: ${topDomain}; reflective dialogue suggested for ${growthDomain}.`;

  return {
    scorePercent,
    bandLabel,
    educationalSummary,
    subScores,
    disclaimer: NON_CLINICAL_EDUCATIONAL_DISCLAIMER,
  };
}
