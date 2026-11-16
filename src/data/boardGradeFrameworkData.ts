import {
  AllIndiaBoardRecord,
  AcademicStageMapping,
  BoardGradeFramework,
  BoardGradingBandSpec,
  BoardStreamSpec,
  CurriculumVersionSpec,
  SchoolClassId,
} from '../types';
import { ALL_INDIA_BOARDS } from './allIndiaBoardsData';
import { SCHOOL_CLASSES } from './schoolCurriculumData';

const CLASS_ORDER: SchoolClassId[] = [
  'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
];

const CBSE_8_POINT_BANDS: BoardGradingBandSpec[] = [
  { grade: 'A1', minPercent: 91, maxPercent: 100, points: 10, descriptor: 'Outstanding (Top 1/8th & Distinction)' },
  { grade: 'A2', minPercent: 81, maxPercent: 90.99, points: 9, descriptor: 'Excellent' },
  { grade: 'B1', minPercent: 71, maxPercent: 80.99, points: 8, descriptor: 'Very Good' },
  { grade: 'B2', minPercent: 61, maxPercent: 70.99, points: 7, descriptor: 'Good' },
  { grade: 'C1', minPercent: 51, maxPercent: 60.99, points: 6, descriptor: 'Above Average' },
  { grade: 'C2', minPercent: 41, maxPercent: 50.99, points: 5, descriptor: 'Average' },
  { grade: 'D', minPercent: 33, maxPercent: 40.99, points: 4, descriptor: 'Qualifying Pass' },
  { grade: 'E', minPercent: 0, maxPercent: 32.99, points: 0, descriptor: 'Essential Repeat / Remedial Support' },
];

const CISCE_9_POINT_BANDS: BoardGradingBandSpec[] = [
  { grade: '1', minPercent: 90, maxPercent: 100, points: 10, descriptor: 'Very Good · Highest Distinction' },
  { grade: '2', minPercent: 80, maxPercent: 89.99, points: 9, descriptor: 'Very Good' },
  { grade: '3', minPercent: 70, maxPercent: 79.99, points: 8, descriptor: 'Pass with Credit' },
  { grade: '4', minPercent: 60, maxPercent: 69.99, points: 7, descriptor: 'Pass with Credit' },
  { grade: '5', minPercent: 50, maxPercent: 59.99, points: 6, descriptor: 'Pass with Credit' },
  { grade: '6', minPercent: 40, maxPercent: 49.99, points: 5, descriptor: 'Pass' },
  { grade: '7', minPercent: 35, maxPercent: 39.99, points: 4, descriptor: 'Minimum Pass Standard' },
  { grade: '8–9', minPercent: 0, maxPercent: 34.99, points: 0, descriptor: 'Needs Improvement / Fail' },
];

const KSEAB_BANDS: BoardGradingBandSpec[] = [
  { grade: 'A+', minPercent: 90, maxPercent: 100, points: 10, descriptor: 'Distinction (SSLC / PUC)' },
  { grade: 'A', minPercent: 80, maxPercent: 89.99, points: 9, descriptor: 'First Class Exemplary' },
  { grade: 'B+', minPercent: 70, maxPercent: 79.99, points: 8, descriptor: 'First Class' },
  { grade: 'B', minPercent: 60, maxPercent: 69.99, points: 7, descriptor: 'High Second Class' },
  { grade: 'C+', minPercent: 50, maxPercent: 59.99, points: 6, descriptor: 'Second Class' },
  { grade: 'C', minPercent: 35, maxPercent: 49.99, points: 5, descriptor: 'Pass Class' },
  { grade: 'NC', minPercent: 0, maxPercent: 34.99, points: 0, descriptor: 'Not Completed / Supplementary' },
];

const IB_7_POINT_BANDS: BoardGradingBandSpec[] = [
  { grade: '7', minPercent: 88, maxPercent: 100, points: 7, descriptor: 'Excellent · Consistent analytical synthesis (DP/MYP 7)' },
  { grade: '6', minPercent: 76, maxPercent: 87.99, points: 6, descriptor: 'Very Good · Strong conceptual understanding' },
  { grade: '5', minPercent: 64, maxPercent: 75.99, points: 5, descriptor: 'Good · Generally thorough understanding' },
  { grade: '4', minPercent: 50, maxPercent: 63.99, points: 4, descriptor: 'Satisfactory · Standard Diploma pass level' },
  { grade: '3', minPercent: 36, maxPercent: 49.99, points: 3, descriptor: 'Mediocre · Basic conceptual recall' },
  { grade: '2', minPercent: 20, maxPercent: 35.99, points: 2, descriptor: 'Poor · Limited achievement' },
  { grade: '1', minPercent: 0, maxPercent: 19.99, points: 1, descriptor: 'Very Poor · Minimal evidence' },
];

const CAMBRIDGE_IGCSE_BANDS: BoardGradingBandSpec[] = [
  { grade: 'A*', minPercent: 90, maxPercent: 100, points: 10, descriptor: 'Outstanding Distinction (90+ PUM)' },
  { grade: 'A', minPercent: 80, maxPercent: 89.99, points: 9, descriptor: 'Excellent (80–89 PUM)' },
  { grade: 'B', minPercent: 70, maxPercent: 79.99, points: 8, descriptor: 'Very Good (70–79 PUM)' },
  { grade: 'C', minPercent: 60, maxPercent: 69.99, points: 7, descriptor: 'Good Credit Pass (60–69 PUM)' },
  { grade: 'D', minPercent: 50, maxPercent: 59.99, points: 6, descriptor: 'Satisfactory (50–59 PUM)' },
  { grade: 'E', minPercent: 40, maxPercent: 49.99, points: 5, descriptor: 'Pass Foundation Tier (40–49 PUM)' },
  { grade: 'F–G', minPercent: 20, maxPercent: 39.99, points: 3, descriptor: 'Core Pass Below Standard' },
  { grade: 'U', minPercent: 0, maxPercent: 19.99, points: 0, descriptor: 'Ungraded' },
];

const NIOS_BANDS: BoardGradingBandSpec[] = [
  { grade: 'A (Distinction)', minPercent: 80, maxPercent: 100, points: 10, descriptor: 'Mastery & Distinction' },
  { grade: 'B (First Class)', minPercent: 60, maxPercent: 79.99, points: 8, descriptor: 'Proficient Pass' },
  { grade: 'C (Second Class)', minPercent: 45, maxPercent: 59.99, points: 6, descriptor: 'Satisfactory Pass' },
  { grade: 'D (Pass)', minPercent: 33, maxPercent: 44.99, points: 5, descriptor: 'Qualifying Pass (Min 33% TMA + Theory)' },
  { grade: 'NC', minPercent: 0, maxPercent: 32.99, points: 0, descriptor: 'Eligible for On-Demand Examination (ODE)' },
];

const STATE_STANDARD_BANDS: BoardGradingBandSpec[] = [
  { grade: 'A1 / Distinction', minPercent: 90, maxPercent: 100, points: 10, descriptor: 'State Merit / Distinction' },
  { grade: 'A / First Div', minPercent: 75, maxPercent: 89.99, points: 9, descriptor: 'First Division with Honour' },
  { grade: 'B+ / First Div', minPercent: 60, maxPercent: 74.99, points: 8, descriptor: 'First Division' },
  { grade: 'B / Second Div', minPercent: 45, maxPercent: 59.99, points: 6, descriptor: 'Second Division' },
  { grade: 'C / Pass', minPercent: 35, maxPercent: 44.99, points: 5, descriptor: 'Third Division / Qualifying Pass' },
  { grade: 'E / Needs Support', minPercent: 0, maxPercent: 34.99, points: 0, descriptor: 'Supplementary / Remedial Improvement' },
];

interface BoardStageNomenclature {
  pattern: string;
  prePrimary: string;
  primary1to5: string;
  middle6to8: string;
  sec9to10: string;
  srSec11to12: string;
  exam10: string;
  exam12: string;
}

const BOARD_NOMENCLATURE_OVERRIDES: Record<string, BoardStageNomenclature> = {
  NAT_CBSE: {
    pattern: 'NEP 2020 5+3+3+4 Academic Continuum',
    prePrimary: 'Balvatika 1–3 (Foundational Years)',
    primary1to5: 'Foundational (1–2) & Preparatory Stage (3–5)',
    middle6to8: 'Middle Stage (NCERT Rationalized)',
    sec9to10: 'Secondary Stage (AISSE Track)',
    srSec11to12: 'Senior Secondary Stage (AISSCE Track)',
    exam10: 'CBSE Class X All-India Secondary Exam',
    exam12: 'CBSE Class XII Senior School Certificate Exam',
  },
  NAT_CISCE: {
    pattern: 'CISCE Pre-Primary → Primary → ICSE → ISC',
    prePrimary: 'CISCE Preschool (Foundational)',
    primary1to5: 'Primary Curriculum (Classes I–V)',
    middle6to8: 'Upper Primary (Classes VI–VIII)',
    sec9to10: 'ICSE (Indian Certificate of Secondary Education)',
    srSec11to12: 'ISC (Indian School Certificate)',
    exam10: 'ICSE Board Public Examination',
    exam12: 'ISC Class XII Public Examination',
  },
  NAT_NIOS: {
    pattern: 'NIOS Open Basic Education (OBE) + Secondary & Sr. Secondary',
    prePrimary: 'Early Childhood Care Bridge (Non-Exam)',
    primary1to5: 'OBE Level A (Class 3 eq.) & Level B (Class 5 eq.)',
    middle6to8: 'OBE Level C (Class 8 eq.)',
    sec9to10: 'NIOS Secondary Course (Class 10 Equivalent)',
    srSec11to12: 'NIOS Senior Secondary + NSQF Vocational',
    exam10: 'NIOS Secondary Public / On-Demand Exam',
    exam12: 'NIOS Senior Secondary Public / On-Demand Exam',
  },
  INT_IB: {
    pattern: 'IB World Continuum (PYP · MYP · DP / CP)',
    prePrimary: 'PYP Early Years (Age 3–5)',
    primary1to5: 'Primary Years Programme (PYP Years 1–5)',
    middle6to8: 'Middle Years Programme (MYP Years 1–3)',
    sec9to10: 'Middle Years Programme (MYP Years 4–5)',
    srSec11to12: 'IB Diploma Programme (DP Years 1–2) / CP',
    exam10: 'IB MYP Personal Project & Optional eAssessment',
    exam12: 'IB Diploma External Examinations (45 pts max)',
  },
  INT_CAMBRIDGE: {
    pattern: 'Cambridge Pathway (Primary → Lower Secondary → IGCSE → AS & A Level)',
    prePrimary: 'Cambridge Early Years (Bridge)',
    primary1to5: 'Cambridge Primary (Stages 1–6)',
    middle6to8: 'Cambridge Lower Secondary (Stages 7–9)',
    sec9to10: 'Cambridge IGCSE (Upper Secondary)',
    srSec11to12: 'Cambridge International AS & A Level',
    exam10: 'Cambridge IGCSE (India March / June Series)',
    exam12: 'Cambridge International AS & A Level (AIU Class 12 eq.)',
  },
  STATE_KA: {
    pattern: 'Karnataka DSERT / KSEAB (Nali-Kali → SSLC → 1st/2nd PUC)',
    prePrimary: 'Pre-Primary (LKG / UKG)',
    primary1to5: 'Nali-Kali (1–3) & Lower Primary (4–5)',
    middle6to8: 'Higher Primary Stage (KTBS)',
    sec9to10: 'High School · SSLC Stage',
    srSec11to12: 'Pre-University (1st PUC & 2nd PUC)',
    exam10: 'KSEAB SSLC State Board Examination',
    exam12: 'KSEAB 2nd PUC State Board Examination',
  },
  STATE_MH: {
    pattern: 'Maharashtra SCERT (Balbharati) + MSBSHSE (SSC & HSC Junior College)',
    prePrimary: 'Pre-Primary (Balwadi / KG)',
    primary1to5: 'Lower Primary (Std I–V · Balbharati)',
    middle6to8: 'Upper Primary (Std VI–VIII)',
    sec9to10: 'Secondary School Certificate (SSC · Std IX–X)',
    srSec11to12: 'Higher Secondary / Junior College (HSC · FYJC & SYJC)',
    exam10: 'MSBSHSE SSC Class 10 Public Examination',
    exam12: 'MSBSHSE HSC Class 12 Public Examination',
  },
  STATE_TN: {
    pattern: 'Tamil Nadu Samacheer Kalvi (Primary → High School SSLC → Higher Secondary +1/+2)',
    prePrimary: 'Pre-Primary (KG)',
    primary1to5: 'Primary Stage (Samacheer Kalvi I–V)',
    middle6to8: 'Upper Primary / Middle (Std VI–VIII)',
    sec9to10: 'High School · SSLC Stage',
    srSec11to12: 'Higher Secondary (+1 & +2)',
    exam10: 'DGE Tamil Nadu SSLC Public Examination',
    exam12: 'DGE Tamil Nadu +2 HSC Public Examination',
  },
  STATE_WB: {
    pattern: 'West Bengal 4+4+2+2 Structure (Primary → Madhyamik → Uchcha Madhyamik)',
    prePrimary: 'Pre-Primary (Prak-Prathamik)',
    primary1to5: 'Primary (Classes I–IV) & Upper Primary Start (V)',
    middle6to8: 'Upper Primary (Classes VI–VIII)',
    sec9to10: 'Madhyamik Pariksha Track (WBBSE IX–X)',
    srSec11to12: 'Uchcha Madhyamik (HS Semester System XI–XII · WBCHSE)',
    exam10: 'WBBSE Madhyamik Class 10 Exam',
    exam12: 'WBCHSE Uchcha Madhyamik (Sem III & IV)',
  },
  STATE_KL: {
    pattern: 'Kerala SCERT (LP → UP → High School SSLC → Higher Secondary +1/+2)',
    prePrimary: 'Pre-Primary',
    primary1to5: 'Lower Primary (LP 1–4) & UP Start (5)',
    middle6to8: 'Upper Primary (UP 6–7) & High School Entry (8)',
    sec9to10: 'High School (SSLC Track)',
    srSec11to12: 'Higher Secondary / VHSE (+1 & +2)',
    exam10: 'Kerala Pareeksha Bhavan SSLC Public Exam',
    exam12: 'DHSE / VHSE Plus Two (+2) Public Exam',
  },
  STATE_AS: {
    pattern: 'Assam Unified ASSEB Structure (Pre-Primary → HSLC Div I → HS Div II)',
    prePrimary: 'Ka-Shreni / Pre-Primary',
    primary1to5: 'Lower Primary (LP 1–5)',
    middle6to8: 'Upper Primary / ME Stage (6–8)',
    sec9to10: 'Secondary Stage (HSLC · ASSEB Div I)',
    srSec11to12: 'Higher Secondary Stage (HS · ASSEB Div II)',
    exam10: 'ASSEB HSLC Class 10 Examination',
    exam12: 'ASSEB HS Final Class 12 Examination',
  },
};

function getStreamStructureForBoard(board: AllIndiaBoardRecord): BoardStreamSpec[] {
  if (board.id === 'STATE_KA') {
    return [
      {
        streamId: 'Science',
        boardStreamTitle: 'Science PUC (PCMB / PCMC / PCME / PCMS)',
        coreSubjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology / Computer Science / Electronics'],
        minClassId: '11',
      },
      {
        streamId: 'Commerce',
        boardStreamTitle: 'Commerce PUC (CEBA / HEBA / MEBA / SEBA)',
        coreSubjects: ['Accountancy', 'Business Studies', 'Economics', 'Computer Science / Basic Math / Statistics'],
        minClassId: '11',
      },
      {
        streamId: 'Arts',
        boardStreamTitle: 'Arts PUC (HEPS / HEPP / HESP)',
        coreSubjects: ['History', 'Economics', 'Political Science', 'Sociology / Psychology / Geography'],
        minClassId: '11',
      },
      {
        streamId: 'Vocational',
        boardStreamTitle: 'Vocational & Skill Electives (IT / Retail / Tourism)',
        coreSubjects: ['English', 'Applied Computing / FinTech', 'Employability Skills'],
        minClassId: '11',
      },
    ];
  }

  if (board.id === 'INT_IB') {
    return [
      {
        streamId: 'Science',
        boardStreamTitle: 'IB DP Group 4 & 5 STEM Focus (HL Physics / Chem / Bio + Math AA/AI)',
        coreSubjects: ['Physics HL/SL', 'Chemistry HL/SL', 'Biology HL/SL', 'Mathematics AA/AI', 'TOK / EE / CAS'],
        minClassId: '11',
      },
      {
        streamId: 'Commerce',
        boardStreamTitle: 'IB DP Group 3 Business & Economics Focus (HL Econ / Business Mgmt)',
        coreSubjects: ['Economics HL/SL', 'Business Management', 'Mathematics AI/AA', 'Global Politics', 'TOK / EE / CAS'],
        minClassId: '11',
      },
      {
        streamId: 'Arts',
        boardStreamTitle: 'IB DP Humanities & Arts Focus (History / Psychology / Group 6)',
        coreSubjects: ['History HL/SL', 'Psychology', 'Visual Arts / Theatre', 'Literature & Language A', 'TOK / EE / CAS'],
        minClassId: '11',
      },
      {
        streamId: 'Vocational',
        boardStreamTitle: 'IB Career-related Programme (IBCP)',
        coreSubjects: ['2–4 DP Courses', 'Reflective Project', 'Service Learning', 'Career Study'],
        minClassId: '11',
      },
    ];
  }

  if (board.id === 'INT_CAMBRIDGE') {
    return [
      {
        streamId: 'Science',
        boardStreamTitle: 'Cambridge International AS & A Level — Sciences',
        coreSubjects: ['Physics (9702)', 'Chemistry (9701)', 'Biology (9700)', 'Mathematics (9709)', 'Computer Science (9618)'],
        minClassId: '11',
      },
      {
        streamId: 'Commerce',
        boardStreamTitle: 'Cambridge International AS & A Level — Commerce & Finance',
        coreSubjects: ['Accounting (9706)', 'Business (9609)', 'Economics (9708)', 'Mathematics (9709)'],
        minClassId: '11',
      },
      {
        streamId: 'Arts',
        boardStreamTitle: 'Cambridge International AS & A Level — Humanities',
        coreSubjects: ['History (9489)', 'Psychology (9990)', 'Sociology (9699)', 'English Literature (9695)'],
        minClassId: '11',
      },
      {
        streamId: 'Vocational',
        boardStreamTitle: 'Cambridge IT & Applied Digital Skills',
        coreSubjects: ['Information Technology (9626)', 'Global Perspectives & Research (9239)'],
        minClassId: '11',
      },
    ];
  }

  return [
    {
      streamId: 'Science',
      boardStreamTitle: 'Science Stream (PCM / PCB / PCMC)',
      coreSubjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology / Computer Science / Informatics'],
      minClassId: '11',
    },
    {
      streamId: 'Commerce',
      boardStreamTitle: 'Commerce Stream (Accountancy, Business & Economics)',
      coreSubjects: ['Accountancy', 'Business Studies', 'Economics', 'Mathematics / Applied Math / Entrepreneurship'],
      minClassId: '11',
    },
    {
      streamId: 'Arts',
      boardStreamTitle: 'Arts / Humanities Stream',
      coreSubjects: ['History', 'Geography', 'Political Science', 'Sociology / Psychology / Economics'],
      minClassId: '11',
    },
    {
      streamId: 'Vocational',
      boardStreamTitle: 'Vocational / NSQF Skill Electives',
      coreSubjects: ['IT & Coding Skills', 'Financial Literacy', 'Communication & Employability'],
      minClassId: '11',
    },
  ];
}

function getCurriculumVersionsForBoard(board: AllIndiaBoardRecord): CurriculumVersionSpec[] {
  if (board.id === 'INT_IB') {
    return [
      {
        id: 'IB_CONTINUUM_2026',
        label: 'IB Continuum 2026–27 (Updated DP Subject Guides)',
        academicYears: ['2026-2027', '2025-2026'],
        isDefault: true,
        status: 'Active',
        description: 'Active IBO PYP transdisciplinary themes, MYP criteria, and revised DP subject syllabi.',
      },
      {
        id: 'IB_LEGACY_2024',
        label: 'IB 2024–25 Transition Edition',
        academicYears: ['2024-2025'],
        isDefault: false,
        status: 'Legacy',
        description: 'Prior assessment cycle syllabus retained for retrospective reference.',
      },
    ];
  }

  if (board.id === 'INT_CAMBRIDGE') {
    return [
      {
        id: 'CAMBRIDGE_2026',
        label: 'Cambridge 2026–28 Syllabus Window (March / June Series)',
        academicYears: ['2026-2027', '2025-2026'],
        isDefault: true,
        status: 'Active',
        description: 'Aligned with CAIE India March examination series and 2026–2028 IGCSE / A-Level syllabus codes.',
      },
      {
        id: 'CAMBRIDGE_2024',
        label: 'Cambridge 2023–25 Syllabus Archive',
        academicYears: ['2024-2025'],
        isDefault: false,
        status: 'Legacy',
        description: 'Previous syllabus cycle archived for comparison and past-paper alignment.',
      },
    ];
  }

  if (board.id === 'NAT_CISCE') {
    return [
      {
        id: 'CISCE_2026',
        label: 'CISCE 2026–27 Regulations & Revised Syllabi',
        academicYears: ['2026-2027', '2025-2026'],
        isDefault: true,
        status: 'Active',
        description: 'Current CISCE competency-based question structure for ICSE (Class 10) and ISC (Class 12).',
      },
      {
        id: 'CISCE_2024',
        label: 'CISCE 2024–25 Curriculum Archive',
        academicYears: ['2024-2025'],
        isDefault: false,
        status: 'Legacy',
        description: 'Archived CISCE topic structure for previous academic batch reference.',
      },
    ];
  }

  if (board.id === 'NAT_NIOS') {
    return [
      {
        id: 'NIOS_NEP_2026',
        label: 'NIOS 2026–27 Modular & NSQF Blended Curriculum',
        academicYears: ['2026-2027', '2025-2026'],
        isDefault: true,
        status: 'Active',
        description: 'Includes OBE Levels A–C, TMA + Theory bifurcated Secondary/Sr. Secondary syllabi, and Skill electives.',
      },
    ];
  }

  const isCbseOrAdopted =
    board.id === 'NAT_CBSE' ||
    !board.hasSeparateStateBoard ||
    board.affiliationMode === 'CBSE / NCERT Affiliated State/UT System';

  if (isCbseOrAdopted) {
    return [
      {
        id: 'NEP_2020_NCF_2023',
        label: 'NEP 2020 / NCF-SE 2023 (Latest NCERT Rationalized)',
        academicYears: ['2026-2027', '2025-2026'],
        isDefault: true,
        status: 'Active',
        description: 'Current NCF-SE 2023 competency framework & new NCERT textbook editions (Classes LKG–12).',
      },
      {
        id: 'NCERT_RATIONALIZED_2024',
        label: 'NCERT 2024–25 Pre-Transition Edition',
        academicYears: ['2024-2025'],
        isDefault: false,
        status: 'Legacy',
        description: 'Earlier chapter sequence retained for multi-year student cohort continuity.',
      },
    ];
  }

  return [
    {
      id: 'STATE_SCERT_CURRENT',
      label: `${board.shortName} Latest SCERT / State Textbook Edition (2026–27)`,
      academicYears: ['2026-2027', '2025-2026'],
      isDefault: true,
      status: 'Active',
      description: `State-prescribed syllabus curated by ${board.scertBody} with NEP competency alignment.`,
    },
    {
      id: 'STATE_LEGACY_TRANSITION',
      label: `${board.shortName} Pre-Revision State Syllabus (2024–25)`,
      academicYears: ['2024-2025'],
      isDefault: false,
      status: 'Transitional',
      description: 'Previous textbook chapter numbering & evaluation scheme for multi-year tracking.',
    },
  ];
}

function getBandsAndPassingForBoard(board: AllIndiaBoardRecord): {
  gradingScaleName: string;
  passingRule: string;
  gradingBands: BoardGradingBandSpec[];
} {
  if (board.id === 'NAT_CBSE' || !board.hasSeparateStateBoard) {
    return {
      gradingScaleName: 'CBSE 8-Point Relative & Absolute Grading Scale',
      passingRule: 'Minimum 33% in both internal assessment and board examination (Grade D or higher).',
      gradingBands: CBSE_8_POINT_BANDS,
    };
  }
  if (board.id === 'NAT_CISCE') {
    return {
      gradingScaleName: 'CISCE 1–9 Point Numeric Achievement Scale',
      passingRule: 'Minimum 35% (Grade 7 or better in ICSE; 35% overall in ISC).',
      gradingBands: CISCE_9_POINT_BANDS,
    };
  }
  if (board.id === 'NAT_NIOS') {
    return {
      gradingScaleName: 'NIOS Competency Grading & Percentage System',
      passingRule: 'Minimum 33% aggregate (Theory + Practical + Tutor Marked Assignment TMA).',
      gradingBands: NIOS_BANDS,
    };
  }
  if (board.id === 'INT_IB') {
    return {
      gradingScaleName: 'IB 1–7 Criterion-Referenced Scale (45 Points Max in DP)',
      passingRule: 'DP Award requires 24+ total points out of 45 with TOK, Extended Essay & CAS satisfied.',
      gradingBands: IB_7_POINT_BANDS,
    };
  }
  if (board.id === 'INT_CAMBRIDGE') {
    return {
      gradingScaleName: 'Cambridge Percentage Uniform Mark (PUM) & A*–G / A*–E Scale',
      passingRule: 'IGCSE pass A*–G (Credit C or above recommended); A-Level pass A*–E.',
      gradingBands: CAMBRIDGE_IGCSE_BANDS,
    };
  }
  if (board.id === 'STATE_KA') {
    return {
      gradingScaleName: 'KSEAB SSLC & PUC 7-Band State Grading Scale',
      passingRule: 'Minimum 35% aggregate (Internal + External Board Exam) to qualify.',
      gradingBands: KSEAB_BANDS,
    };
  }
  return {
    gradingScaleName: `${board.shortName} State Percentage & Division Grading Scale`,
    passingRule: 'Minimum 33%–35% qualifying pass across theory, internal, and practical evaluations.',
    gradingBands: STATE_STANDARD_BANDS,
  };
}

export function buildDefaultGradeFrameworkForBoard(board: AllIndiaBoardRecord): BoardGradeFramework {
  const override = BOARD_NOMENCLATURE_OVERRIDES[board.id];
  const defaultNomenclature: BoardStageNomenclature = override || {
    pattern: board.hasSeparateStateBoard
      ? `${board.shortName} 5+3+2+2 / State SCERT Stage Pattern`
      : `${board.shortName} · NEP 2020 5+3+3+4 Stage Pattern`,
    prePrimary: 'Pre-Primary (LKG / UKG / Balvatika)',
    primary1to5: 'Primary Stage (Classes 1–5)',
    middle6to8: 'Upper Primary / Middle Stage (Classes 6–8)',
    sec9to10: board.secondaryBoardName || 'Secondary Stage (Classes 9–10)',
    srSec11to12: board.seniorSecondaryBoardName || 'Senior Secondary / +2 Stage (Classes 11–12)',
    exam10: board.secondaryBoardName || `${board.shortName} Class 10 Public Exam`,
    exam12: board.seniorSecondaryBoardName || `${board.shortName} Class 12 Public Exam`,
  };

  const stages: AcademicStageMapping[] = CLASS_ORDER.map((classId) => {
    const clsMeta = SCHOOL_CLASSES.find((c) => c.id === classId)!;
    const available = board.officialGradeLevels.includes(classId);

    let officialStageName = defaultNomenclature.primary1to5;
    let boardLevelTitle = clsMeta.label;
    let boardExamMilestone: string | undefined;
    let assessmentMode = 'Continuous Formative + Term Exams';

    if (classId === 'LKG' || classId === 'UKG') {
      officialStageName = defaultNomenclature.prePrimary;
      boardLevelTitle =
        board.id === 'INT_IB'
          ? `PYP Early Years (${classId})`
          : board.id === 'NAT_CBSE'
          ? `Balvatika (${classId})`
          : !available
          ? `Bridge / Not Offered Directly (${classId})`
          : `${classId} Foundational`;
      assessmentMode = available
        ? 'Activity, Phonics, Drawing & Observation'
        : 'Foundational Bridge Readiness';
    } else {
      const n = Number(classId);
      if (n >= 1 && n <= 5) {
        officialStageName = defaultNomenclature.primary1to5;
        boardLevelTitle =
          board.id === 'INT_CAMBRIDGE'
            ? `Cambridge Primary Stage ${n}`
            : board.id === 'NAT_NIOS'
            ? n <= 3
              ? `NIOS OBE Level A (Class ${n} eq.)`
              : `NIOS OBE Level B (Class ${n} eq.)`
            : clsMeta.label;
        assessmentMode = 'Continuous Assessment + Mastery Checkpoints';
      } else if (n >= 6 && n <= 8) {
        officialStageName = defaultNomenclature.middle6to8;
        boardLevelTitle =
          board.id === 'INT_CAMBRIDGE'
            ? `Cambridge Lower Secondary Stage ${n + 1}`
            : board.id === 'NAT_NIOS'
            ? `NIOS OBE Level C (Class ${n} eq.)`
            : board.id === 'INT_IB'
            ? `IB MYP Year ${n - 5}`
            : clsMeta.label;
        if (n === 8) {
          boardExamMilestone =
            board.id === 'INT_CAMBRIDGE'
              ? 'Cambridge Lower Secondary Checkpoint'
              : 'Middle-Stage Summative & Transition Assessment';
        }
        assessmentMode = 'Unit Quizzes, Projects & Term Exams';
      } else if (n === 9 || n === 10) {
        officialStageName = defaultNomenclature.sec9to10;
        boardLevelTitle =
          board.id === 'INT_IB'
            ? `IB MYP Year ${n - 5}`
            : board.id === 'INT_CAMBRIDGE'
            ? `Cambridge IGCSE Year ${n - 8}`
            : clsMeta.label;
        if (n === 10) boardExamMilestone = defaultNomenclature.exam10;
        assessmentMode =
          n === 10
            ? 'Board Exam Simulation + Practical / Internal Marks'
            : 'Pre-Board Foundations + Practicals';
      } else {
        officialStageName = defaultNomenclature.srSec11to12;
        boardLevelTitle =
          board.id === 'STATE_KA'
            ? n === 11
              ? '1st PUC'
              : '2nd PUC'
            : board.id === 'INT_IB'
            ? n === 11
              ? 'IB DP Year 1'
              : 'IB DP Year 2'
            : board.id === 'INT_CAMBRIDGE'
            ? n === 11
              ? 'Cambridge International AS Level'
              : 'Cambridge International A Level'
            : clsMeta.label;
        if (n === 12) boardExamMilestone = defaultNomenclature.exam12;
        assessmentMode =
          n === 12
            ? 'Final Board Theory + Practicals + Viva / Presentations'
            : 'Stream Specialization + Lab Practicals';
      }
    }

    return {
      classId,
      classLabel: clsMeta.label,
      officialStageName,
      boardLevelTitle,
      availableInBoard: available,
      boardExamMilestone,
      assessmentMode,
    };
  });

  const { gradingScaleName, passingRule, gradingBands } = getBandsAndPassingForBoard(board);

  return {
    id: board.id,
    directoryBoardId: board.id,
    boardShortName: board.shortName,
    structurePattern: defaultNomenclature.pattern,
    gradingScaleName,
    passingRule,
    gradingBands,
    curriculumVersions: getCurriculumVersionsForBoard(board),
    stages,
    streamStructure: getStreamStructureForBoard(board),
    updatedAt: board.updatedAt,
  };
}

export function getBoardGradeFrameworkSpec(directoryBoardId?: string): BoardGradeFramework {
  const board =
    ALL_INDIA_BOARDS.find((b) => b.id === directoryBoardId) || ALL_INDIA_BOARDS[0];
  return buildDefaultGradeFrameworkForBoard(board);
}

export function computePercentageWithFramework(
  framework: BoardGradeFramework,
  percentage: number
): { grade: string; remark: string; points?: number } {
  const pct = Math.max(0, Math.min(100, Number(percentage) || 0));
  const matched =
    framework.gradingBands.find((b) => pct >= b.minPercent && pct <= b.maxPercent) ||
    framework.gradingBands[framework.gradingBands.length - 1];
  return {
    grade: matched?.grade || 'B',
    remark: matched?.descriptor || 'Satisfactory',
    points: matched?.points,
  };
}
