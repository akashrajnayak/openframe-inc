import {
  SchoolBoardDefinition,
  SchoolBoardId,
  SchoolClassDefinition,
  SchoolClassId,
  SchoolLanguage,
  SchoolStreamId,
  SchoolSubject,
  SchoolChapter,
  SchoolConcept,
  SchoolTimetableSlot,
} from '../types';

export const SCHOOL_ACADEMIC_YEARS = ['2026-2027', '2025-2026', '2024-2025'];

export const SCHOOL_LANGUAGES: Array<{
  id: SchoolLanguage;
  nativeLabel: string;
  speechCode: string;
}> = [
  { id: 'English', nativeLabel: 'English', speechCode: 'en-IN' },
  { id: 'Kannada', nativeLabel: 'ಕನ್ನಡ (Kannada)', speechCode: 'kn-IN' },
  { id: 'Hindi', nativeLabel: 'हिन्दी (Hindi)', speechCode: 'hi-IN' },
];

export const SCHOOL_BOARDS: SchoolBoardDefinition[] = [
  {
    id: 'KAR_STATE',
    name: 'Karnataka State Board (KTBS / DSERT / KSEAB)',
    shortName: 'Karnataka State',
    authority: 'Dept. of School Education & Literacy, Govt. of Karnataka',
    description:
      'Official Karnataka state syllabus covering Nali-Kali (1–3), KTBS/DSERT textbooks (4–10 SSLC), and 1st/2nd PUC Senior Secondary streams.',
    supportedMediums: ['Kannada Medium', 'English Medium', 'Urdu Medium', 'Marathi Medium'],
    gradingRuleSummary: 'KSEAB SSLC & PUC bands: A+ (90–100%), A (80–89%), B+ (70–79%), B (60–69%), C+ (50–59%), C (35–49%), NC (<35%).',
    gradingBands: [
      { grade: 'A+', minPercent: 90, maxPercent: 100, points: 10, remark: 'Distinction' },
      { grade: 'A', minPercent: 80, maxPercent: 89.99, points: 9, remark: 'First Class Exemplary' },
      { grade: 'B+', minPercent: 70, maxPercent: 79.99, points: 8, remark: 'First Class' },
      { grade: 'B', minPercent: 60, maxPercent: 69.99, points: 7, remark: 'High Second Class' },
      { grade: 'C+', minPercent: 50, maxPercent: 59.99, points: 6, remark: 'Second Class' },
      { grade: 'C', minPercent: 35, maxPercent: 49.99, points: 5, remark: 'Pass Class' },
      { grade: 'NC', minPercent: 0, maxPercent: 34.99, points: 0, remark: 'Needs Improvement' },
    ],
  },
  {
    id: 'CBSE',
    name: 'CBSE – Central Board of Secondary Education (NCERT)',
    shortName: 'CBSE / NCERT',
    authority: 'Central Board of Secondary Education, New Delhi',
    description:
      'NEP 2020 & NCF-SE aligned NCERT syllabus covering Foundational, Preparatory, Middle, and Secondary/Senior Secondary stages.',
    supportedMediums: ['English Medium', 'Hindi Medium', 'Bilingual (EN + HI)'],
    gradingRuleSummary: 'CBSE 8-Point Grading Scale: A1 (91–100), A2 (81–90), B1 (71–80), B2 (61–70), C1 (51–60), C2 (41–50), D (33–40), E (<33).',
    gradingBands: [
      { grade: 'A1', minPercent: 91, maxPercent: 100, points: 10, remark: 'Outstanding' },
      { grade: 'A2', minPercent: 81, maxPercent: 90.99, points: 9, remark: 'Excellent' },
      { grade: 'B1', minPercent: 71, maxPercent: 80.99, points: 8, remark: 'Very Good' },
      { grade: 'B2', minPercent: 61, maxPercent: 70.99, points: 7, remark: 'Good' },
      { grade: 'C1', minPercent: 51, maxPercent: 60.99, points: 6, remark: 'Above Average' },
      { grade: 'C2', minPercent: 41, maxPercent: 50.99, points: 5, remark: 'Average' },
      { grade: 'D', minPercent: 33, maxPercent: 40.99, points: 4, remark: 'Qualifying Pass' },
      { grade: 'E', minPercent: 0, maxPercent: 32.99, points: 0, remark: 'Essential Repeat / Remedial' },
    ],
  },
  {
    id: 'ICSE',
    name: 'ICSE / ISC – CISCE Curriculum',
    shortName: 'ICSE / CISCE',
    authority: 'Council for the Indian School Certificate Examinations',
    description:
      'Application-focused CISCE framework known for rich English literature, analytical sciences, and structured project-based assessments.',
    supportedMediums: ['English Medium'],
    gradingRuleSummary: 'CISCE Bands: 1–2 Very Good (80–100%), 3–5 Pass with Credit (50–79%), 6–7 Pass (35–49%), 8–9 Unsuccessful (<35%).',
    gradingBands: [
      { grade: '1 (A+)', minPercent: 90, maxPercent: 100, points: 10, remark: 'Distinction' },
      { grade: '2 (A)', minPercent: 80, maxPercent: 89.99, points: 9, remark: 'Very Good' },
      { grade: '3 (B+)', minPercent: 70, maxPercent: 79.99, points: 8, remark: 'Credit' },
      { grade: '4 (B)', minPercent: 60, maxPercent: 69.99, points: 7, remark: 'Credit' },
      { grade: '5 (C+)', minPercent: 50, maxPercent: 59.99, points: 6, remark: 'Credit' },
      { grade: '6 (C)', minPercent: 40, maxPercent: 49.99, points: 5, remark: 'Pass' },
      { grade: '7 (D)', minPercent: 35, maxPercent: 39.99, points: 4, remark: 'Pass' },
      { grade: '8 (E)', minPercent: 0, maxPercent: 34.99, points: 0, remark: 'Needs Support' },
    ],
  },
  {
    id: 'OTHER_STATE',
    name: 'Other Indian State Boards (SCERT Mapped)',
    shortName: 'State Boards',
    authority: 'State SCERT & State Boards of Secondary Education',
    description:
      'Structured SCERT-compatible framework supporting regional language options alongside Science, Mathematics, and Humanities.',
    supportedMediums: ['English Medium', 'Hindi Medium', 'Kannada Medium'],
    gradingRuleSummary: 'State SCERT Grading: A+ (90–100%), A (75–89%), B (60–74%), C (45–59%), D (35–44%), E (<35%).',
    gradingBands: [
      { grade: 'A+', minPercent: 90, maxPercent: 100, remark: 'Distinction' },
      { grade: 'A', minPercent: 75, maxPercent: 89.99, remark: 'First Division' },
      { grade: 'B', minPercent: 60, maxPercent: 74.99, remark: 'Second Division' },
      { grade: 'C', minPercent: 45, maxPercent: 59.99, remark: 'Third Division' },
      { grade: 'D', minPercent: 35, maxPercent: 44.99, remark: 'Pass' },
      { grade: 'E', minPercent: 0, maxPercent: 34.99, remark: 'Needs Revision' },
    ],
  },
  {
    id: 'OTHER_RECOGNIZED',
    name: 'Other Recognized School Curricula (NIOS / International Bridge)',
    shortName: 'Recognized Curricula',
    authority: 'NIOS & Accredited Global/Bridge Academic Councils',
    description:
      'Flexible recognized school track emphasizing competency mastery, skill electives, STEM labs, and modular assessments.',
    supportedMediums: ['English Medium', 'Hindi Medium', 'Kannada Medium'],
    gradingRuleSummary: 'Competency Bands: Mastery (85–100%), Proficient (65–84%), Developing (40–64%), Emerging (<40%).',
    gradingBands: [
      { grade: 'A+ (Mastery)', minPercent: 85, maxPercent: 100, remark: 'Mastery Achieved' },
      { grade: 'A (Proficient)', minPercent: 65, maxPercent: 84.99, remark: 'Proficient' },
      { grade: 'B (Developing)', minPercent: 40, maxPercent: 64.99, remark: 'Developing' },
      { grade: 'C (Emerging)', minPercent: 0, maxPercent: 39.99, remark: 'Foundational Support' },
    ],
  },
];

export const SCHOOL_CLASSES: SchoolClassDefinition[] = [
  { id: 'LKG', label: 'LKG', shortLabel: 'LKG', stage: 'Pre-Primary', ageRange: '3.5 – 4.5 yrs', description: 'Phonics, pre-math, rhymes, drawing & joyful activity learning.', hasStreams: false, accentColor: 'from-amber-500 to-orange-500' },
  { id: 'UKG', label: 'UKG', shortLabel: 'UKG', stage: 'Pre-Primary', ageRange: '4.5 – 5.5 yrs', description: 'Early reading, two-digit counting, strokes, nature & communication.', hasStreams: false, accentColor: 'from-orange-500 to-rose-500' },
  { id: '1', label: '1st Standard', shortLabel: 'Class 1', stage: 'Primary', ageRange: '6 – 7 yrs', description: 'Foundational literacy, numeracy, EVS & creative expression.', hasStreams: false, accentColor: 'from-emerald-500 to-teal-500' },
  { id: '2', label: '2nd Standard', shortLabel: 'Class 2', stage: 'Primary', ageRange: '7 – 8 yrs', description: 'Sentences, place value, time, living surroundings & basic computing.', hasStreams: false, accentColor: 'from-teal-500 to-cyan-500' },
  { id: '3', label: '3rd Standard', shortLabel: 'Class 3', stage: 'Primary', ageRange: '8 – 9 yrs', description: 'Multiplication, fractions intro, earth & science curiosity.', hasStreams: false, accentColor: 'from-cyan-500 to-sky-500' },
  { id: '4', label: '4th Standard', shortLabel: 'Class 4', stage: 'Primary', ageRange: '9 – 10 yrs', description: 'Geometry basics, plant systems, civic awareness & coding logic.', hasStreams: false, accentColor: 'from-sky-500 to-blue-500' },
  { id: '5', label: '5th Standard', shortLabel: 'Class 5', stage: 'Primary', ageRange: '10 – 11 yrs', description: 'Decimals, percentages, human body, heritage & primary bridge.', hasStreams: false, accentColor: 'from-blue-500 to-indigo-500' },
  { id: '6', label: '6th Standard', shortLabel: 'Class 6', stage: 'Middle', ageRange: '11 – 12 yrs', description: 'Integers, algebra basics, magnets, ancient history & Python intro.', hasStreams: false, accentColor: 'from-indigo-500 to-violet-500' },
  { id: '7', label: '7th Standard', shortLabel: 'Class 7', stage: 'Middle', ageRange: '12 – 13 yrs', description: 'Linear equations, acids & bases, nutrition, medieval India & web skills.', hasStreams: false, accentColor: 'from-violet-500 to-purple-500' },
  { id: '8', label: '8th Standard', shortLabel: 'Class 8', stage: 'Middle', ageRange: '13 – 14 yrs', description: 'Exponents, force & pressure, cell biology, civics & career readiness.', hasStreams: false, accentColor: 'from-blue-600 to-cyan-600' },
  { id: '9', label: '9th Standard', shortLabel: 'Class 9', stage: 'Secondary', ageRange: '14 – 15 yrs', description: 'Polynomials, laws of motion, atomic structure, democracy & applications.', hasStreams: false, accentColor: 'from-slate-700 to-blue-700' },
  { id: '10', label: '10th Standard', shortLabel: 'Class 10', stage: 'Secondary', ageRange: '15 – 16 yrs', description: 'Board Exam Foundation: Quadratics, optics, genetics, economics & mock exams.', hasStreams: false, accentColor: 'from-blue-700 to-indigo-800' },
  { id: '11', label: '11th Standard', shortLabel: 'Class 11', stage: 'Senior Secondary', ageRange: '16 – 17 yrs', description: 'Science, Commerce, Arts/Humanities & Vocational specializations.', hasStreams: true, accentColor: 'from-indigo-700 to-purple-800' },
  { id: '12', label: '12th Standard', shortLabel: 'Class 12', stage: 'Senior Secondary', ageRange: '17 – 18 yrs', description: 'Final Board Mastery, Practical Labs, Presentations & University Pathways.', hasStreams: true, accentColor: 'from-[#0B1930] to-blue-800' },
];

interface SubjectSpec {
  code: string;
  name: { English: string; Kannada: string; Hindi: string };
  category: string;
  colorTheme: string;
  stream: SchoolStreamId;
}

const PRE_PRIMARY_SUBJECTS: SubjectSpec[] = [
  { code: 'ENG', name: { English: 'English', Kannada: 'ಇಂಗ್ಲಿಷ್ (English)', Hindi: 'अंग्रेजी (English)' }, category: 'Languages', colorTheme: 'blue', stream: 'General' },
  { code: 'KAN', name: { English: 'Kannada', Kannada: 'ಕನ್ನಡ (Kannada)', Hindi: 'कन्नड़ (Kannada)' }, category: 'Languages', colorTheme: 'amber', stream: 'General' },
  { code: 'HIN', name: { English: 'Hindi', Kannada: 'ಹಿಂದಿ (Hindi)', Hindi: 'हिन्दी (Hindi)' }, category: 'Languages', colorTheme: 'orange', stream: 'General' },
  { code: 'MATH', name: { English: 'Mathematics', Kannada: 'ಗಣಿತ (Mathematics)', Hindi: 'गणित (Mathematics)' }, category: 'Numeracy', colorTheme: 'indigo', stream: 'General' },
  { code: 'ENV', name: { English: 'Environmental Awareness', Kannada: 'ಪರಿಸರ ಅರಿವು', Hindi: 'पर्यावरण जागरूकता' }, category: 'Discovery', colorTheme: 'emerald', stream: 'General' },
  { code: 'GK', name: { English: 'General Knowledge', Kannada: 'ಸಾಮಾನ್ಯ ಜ್ಞಾನ', Hindi: 'सामान्य ज्ञान' }, category: 'Awareness', colorTheme: 'cyan', stream: 'General' },
  { code: 'RHY', name: { English: 'Rhymes', Kannada: 'ಶಿಶುಗೀತೆಗಳು (Rhymes)', Hindi: 'बालगीत (Rhymes)' }, category: 'Expression', colorTheme: 'rose', stream: 'General' },
  { code: 'DRW', name: { English: 'Drawing', Kannada: 'ಚಿತ್ರಕಲೆ (Drawing)', Hindi: 'चित्रकला (Drawing)' }, category: 'Creative Arts', colorTheme: 'violet', stream: 'General' },
  { code: 'HND', name: { English: 'Handwriting', Kannada: 'ಬರವಣಿಗೆ ಅಭ್ಯಾಸ', Hindi: 'सुलेख अभ्यास' }, category: 'Motor Skills', colorTheme: 'teal', stream: 'General' },
  { code: 'COM', name: { English: 'Basic Communication', Kannada: 'ಮೂಲ ಸಂವಹನ', Hindi: 'बुनियादी संवाद' }, category: 'Life Skills', colorTheme: 'sky', stream: 'General' },
  { code: 'ACT', name: { English: 'Activity Learning', Kannada: 'ಚಟುವಟಿಕೆ ಆಧಾರಿತ ಕಲಿಕೆ', Hindi: 'गतिविधि आधारित शिक्षा' }, category: 'Play & Learn', colorTheme: 'amber', stream: 'General' },
];

const PRIMARY_1_TO_5_SUBJECTS: SubjectSpec[] = [
  { code: 'ENG', name: { English: 'English', Kannada: 'ಇಂಗ್ಲಿಷ್ (English)', Hindi: 'अंग्रेजी (English)' }, category: 'Languages', colorTheme: 'blue', stream: 'General' },
  { code: 'KAN', name: { English: 'Kannada', Kannada: 'ಕನ್ನಡ', Hindi: 'कन्नड़' }, category: 'Languages', colorTheme: 'amber', stream: 'General' },
  { code: 'HIN', name: { English: 'Hindi', Kannada: 'ಹಿಂದಿ', Hindi: 'हिन्दी' }, category: 'Languages', colorTheme: 'orange', stream: 'General' },
  { code: 'MATH', name: { English: 'Mathematics', Kannada: 'ಗಣಿತ (Mathematics)', Hindi: 'गणित (Mathematics)' }, category: 'Core STEM', colorTheme: 'indigo', stream: 'General' },
  { code: 'EVS', name: { English: 'Environmental Studies', Kannada: 'ಪರಿಸರ ಅಧ್ಯಯನ (EVS)', Hindi: 'पर्यावरण अध्ययन (EVS)' }, category: 'Core Studies', colorTheme: 'emerald', stream: 'General' },
  { code: 'SCI', name: { English: 'Science Concepts', Kannada: 'ವಿಜ್ಞಾನ ಪರಿಕಲ್ಪನೆಗಳು', Hindi: 'विज्ञान अवधारणाएँ' }, category: 'Core STEM', colorTheme: 'cyan', stream: 'General' },
  { code: 'SOC', name: { English: 'Social Studies Concepts', Kannada: 'ಸಮಾಜ ಪರಿಚಯ', Hindi: 'सामाजिक अध्ययन' }, category: 'Humanities', colorTheme: 'sky', stream: 'General' },
  { code: 'CMP', name: { English: 'Computer Fundamentals', Kannada: 'ಕಂಪ್ಯೂಟರ್ ಮೂಲಭೂತ ಅಂಶಗಳು', Hindi: 'कंप्यूटर के मूल सिद्धांत' }, category: 'Technology', colorTheme: 'violet', stream: 'General' },
  { code: 'GK', name: { English: 'General Knowledge', Kannada: 'ಸಾಮಾನ್ಯ ಜ್ಞಾನ', Hindi: 'सामान्य ज्ञान' }, category: 'Awareness', colorTheme: 'teal', stream: 'General' },
  { code: 'ART', name: { English: 'Art and Craft', Kannada: 'ಕಲೆ ಮತ್ತು ಕರಕುಶಲ', Hindi: 'कला और शिल्प' }, category: 'Creative Arts', colorTheme: 'rose', stream: 'General' },
  { code: 'MOR', name: { English: 'Moral Education', Kannada: 'ನೈತಿಕ ಶಿಕ್ಷಣ', Hindi: 'नैतिक शिक्षा' }, category: 'Values', colorTheme: 'emerald', stream: 'General' },
];

const MIDDLE_6_TO_8_SUBJECTS: SubjectSpec[] = [
  { code: 'MATH', name: { English: 'Mathematics', Kannada: 'ಗಣಿತ (Mathematics)', Hindi: 'गणित (Mathematics)' }, category: 'Core STEM', colorTheme: 'indigo', stream: 'General' },
  { code: 'SCI', name: { English: 'Science', Kannada: 'ವಿಜ್ಞಾನ (Science)', Hindi: 'विज्ञान (Science)' }, category: 'Core STEM', colorTheme: 'cyan', stream: 'General' },
  { code: 'SSCI', name: { English: 'Social Science', Kannada: 'ಸಮಾಜ ವಿಜ್ಞಾನ (Social Science)', Hindi: 'सामाजिक विज्ञान' }, category: 'Humanities', colorTheme: 'amber', stream: 'General' },
  { code: 'ENG', name: { English: 'English', Kannada: 'ಇಂಗ್ಲಿಷ್', Hindi: 'अंग्रेजी' }, category: 'Languages', colorTheme: 'blue', stream: 'General' },
  { code: 'KAN', name: { English: 'Kannada', Kannada: 'ಕನ್ನಡ', Hindi: 'कन्नड़' }, category: 'Languages', colorTheme: 'orange', stream: 'General' },
  { code: 'HIN', name: { English: 'Hindi', Kannada: 'ಹಿಂದಿ', Hindi: 'हिन्दी' }, category: 'Languages', colorTheme: 'rose', stream: 'General' },
  { code: 'CS', name: { English: 'Computer Science', Kannada: 'ಕಂಪ್ಯೂಟರ್ ವಿಜ್ಞಾನ', Hindi: 'कंप्यूटर विज्ञान' }, category: 'Technology', colorTheme: 'violet', stream: 'General' },
  { code: 'EVS', name: { English: 'Environmental Studies', Kannada: 'ಪರಿಸರ ಅಧ್ಯಯನ', Hindi: 'पर्यावरण अध्ययन' }, category: 'Sustainability', colorTheme: 'emerald', stream: 'General' },
  { code: 'GK', name: { English: 'General Knowledge', Kannada: 'ಸಾಮಾನ್ಯ ಜ್ಞಾನ', Hindi: 'सामान्य ज्ञान' }, category: 'Awareness', colorTheme: 'teal', stream: 'General' },
  { code: 'SKL', name: { English: 'Skill Development', Kannada: 'ಕೌಶಲ್ಯ ಅಭಿವೃದ್ಧಿ', Hindi: 'कौशल विकास' }, category: 'Vocational', colorTheme: 'sky', stream: 'General' },
];

const SECONDARY_9_TO_10_SUBJECTS: SubjectSpec[] = [
  { code: 'MATH', name: { English: 'Mathematics', Kannada: 'ಗಣಿತ (Mathematics)', Hindi: 'गणित' }, category: 'Core STEM', colorTheme: 'indigo', stream: 'General' },
  { code: 'SCI', name: { English: 'Science', Kannada: 'ವಿಜ್ಞಾನ (Science)', Hindi: 'विज्ञान' }, category: 'Core STEM', colorTheme: 'cyan', stream: 'General' },
  { code: 'PHY', name: { English: 'Physics', Kannada: 'ಭೌತಶಾಸ್ತ್ರ (Physics)', Hindi: 'भौतिक विज्ञान' }, category: 'Sciences', colorTheme: 'blue', stream: 'General' },
  { code: 'CHM', name: { English: 'Chemistry', Kannada: 'ರಸಾಯನಶಾಸ್ತ್ರ (Chemistry)', Hindi: 'रसायन विज्ञान' }, category: 'Sciences', colorTheme: 'emerald', stream: 'General' },
  { code: 'BIO', name: { English: 'Biology', Kannada: 'ಜೀವಶಾಸ್ತ್ರ (Biology)', Hindi: 'जीव विज्ञान' }, category: 'Sciences', colorTheme: 'teal', stream: 'General' },
  { code: 'HIS', name: { English: 'History', Kannada: 'ಇತಿಹಾಸ (History)', Hindi: 'इतिहास' }, category: 'Social Sciences', colorTheme: 'amber', stream: 'General' },
  { code: 'GEO', name: { English: 'Geography', Kannada: 'ಭೂಗೋಳಶಾಸ್ತ್ರ (Geography)', Hindi: 'भूगोल' }, category: 'Social Sciences', colorTheme: 'emerald', stream: 'General' },
  { code: 'POL', name: { English: 'Political Science', Kannada: 'ರಾಜ್ಯಶಾಸ್ತ್ರ (Political Science)', Hindi: 'राजनीति विज्ञान' }, category: 'Social Sciences', colorTheme: 'sky', stream: 'General' },
  { code: 'ECO', name: { English: 'Economics', Kannada: 'ಅರ್ಥಶಾಸ್ತ್ರ (Economics)', Hindi: 'अर्थशास्त्र' }, category: 'Social Sciences', colorTheme: 'violet', stream: 'General' },
  { code: 'ENG', name: { English: 'English', Kannada: 'ಇಂಗ್ಲಿಷ್', Hindi: 'अंग्रेजी' }, category: 'Languages', colorTheme: 'blue', stream: 'General' },
  { code: 'KAN', name: { English: 'Kannada', Kannada: 'ಕನ್ನಡ', Hindi: 'कन्नड़' }, category: 'Languages', colorTheme: 'orange', stream: 'General' },
  { code: 'HIN', name: { English: 'Hindi', Kannada: 'ಹಿಂದಿ', Hindi: 'हिन्दी' }, category: 'Languages', colorTheme: 'rose', stream: 'General' },
  { code: 'CA', name: { English: 'Computer Applications', Kannada: 'ಕಂಪ್ಯೂಟರ್ ಅಪ್ಲಿಕೇಶನ್ಸ್', Hindi: 'कंप्यूटर अनुप्रयोग' }, category: 'Technology', colorTheme: 'indigo', stream: 'General' },
  { code: 'VOC', name: { English: 'Vocational Subjects', Kannada: 'ವೃತ್ತಿಪರ ವಿಷಯಗಳು', Hindi: 'व्यावसायिक विषय' }, category: 'Vocational', colorTheme: 'teal', stream: 'Vocational' },
];

const SENIOR_SECONDARY_11_12_SUBJECTS: SubjectSpec[] = [
  // Science Stream
  { code: 'PHY', name: { English: 'Physics', Kannada: 'ಭೌತಶಾಸ್ತ್ರ (Physics)', Hindi: 'भौतिक विज्ञान (Physics)' }, category: 'Science Stream', colorTheme: 'blue', stream: 'Science' },
  { code: 'CHM', name: { English: 'Chemistry', Kannada: 'ರಸಾಯನಶಾಸ್ತ್ರ (Chemistry)', Hindi: 'रसायन विज्ञान (Chemistry)' }, category: 'Science Stream', colorTheme: 'emerald', stream: 'Science' },
  { code: 'MATH', name: { English: 'Mathematics', Kannada: 'ಗಣಿತ (Mathematics)', Hindi: 'गणित (Mathematics)' }, category: 'Science Stream', colorTheme: 'indigo', stream: 'Science' },
  { code: 'BIO', name: { English: 'Biology', Kannada: 'ಜೀವಶಾಸ್ತ್ರ (Biology)', Hindi: 'जीव विज्ञान (Biology)' }, category: 'Science Stream', colorTheme: 'teal', stream: 'Science' },
  { code: 'CS', name: { English: 'Computer Science', Kannada: 'ಕಂಪ್ಯೂಟರ್ ವಿಜ್ಞಾನ', Hindi: 'कंप्यूटर विज्ञान' }, category: 'Science Stream', colorTheme: 'violet', stream: 'Science' },
  { code: 'IP', name: { English: 'Informatics Practices', Kannada: 'ಇನ್ಫರ್ಮ್ಯಾಟಿಕ್ಸ್ ಪ್ರಾಕ್ಟೀಸಸ್', Hindi: 'सूचना विज्ञान अभ्यास' }, category: 'Science Stream', colorTheme: 'cyan', stream: 'Science' },

  // Commerce Stream
  { code: 'ACC', name: { English: 'Accountancy', Kannada: 'ಲೆಕ್ಕಶಾಸ್ತ್ರ (Accountancy)', Hindi: 'लेखाशास्त्र (Accountancy)' }, category: 'Commerce Stream', colorTheme: 'indigo', stream: 'Commerce' },
  { code: 'BST', name: { English: 'Business Studies', Kannada: 'ವ್ಯವಹಾರ ಅಧ್ಯಯನ', Hindi: 'व्यवसाय अध्ययन' }, category: 'Commerce Stream', colorTheme: 'blue', stream: 'Commerce' },
  { code: 'ECO', name: { English: 'Economics', Kannada: 'ಅರ್ಥಶಾಸ್ತ್ರ (Economics)', Hindi: 'अर्थशास्त्र (Economics)' }, category: 'Commerce Stream', colorTheme: 'emerald', stream: 'Commerce' },
  { code: 'MATH', name: { English: 'Mathematics', Kannada: 'ಗಣಿತ (Mathematics)', Hindi: 'गणित' }, category: 'Commerce Stream', colorTheme: 'violet', stream: 'Commerce' },
  { code: 'ENT', name: { English: 'Entrepreneurship', Kannada: 'ಉದ್ಯಮಶೀಲತೆ (Entrepreneurship)', Hindi: 'उद्यमिता' }, category: 'Commerce Stream', colorTheme: 'amber', stream: 'Commerce' },
  { code: 'APPMATH', name: { English: 'Applied Mathematics', Kannada: 'ಅನ್ವಯಿಕ ಗಣಿತ', Hindi: 'अनुप्रयुक्त गणित' }, category: 'Commerce Stream', colorTheme: 'sky', stream: 'Commerce' },

  // Arts / Humanities Stream
  { code: 'HIS', name: { English: 'History', Kannada: 'ಇತಿಹಾಸ (History)', Hindi: 'इतिहास' }, category: 'Arts / Humanities', colorTheme: 'amber', stream: 'Arts' },
  { code: 'GEO', name: { English: 'Geography', Kannada: 'ಭೂಗೋಳಶಾಸ್ತ್ರ', Hindi: 'भूगोल' }, category: 'Arts / Humanities', colorTheme: 'emerald', stream: 'Arts' },
  { code: 'POL', name: { English: 'Political Science', Kannada: 'ರಾಜ್ಯಶಾಸ್ತ್ರ', Hindi: 'राजनीति विज्ञान' }, category: 'Arts / Humanities', colorTheme: 'blue', stream: 'Arts' },
  { code: 'SOC', name: { English: 'Sociology', Kannada: 'ಸಮಾಜಶಾಸ್ತ್ರ (Sociology)', Hindi: 'समाजशास्त्र' }, category: 'Arts / Humanities', colorTheme: 'teal', stream: 'Arts' },
  { code: 'PSY', name: { English: 'Psychology', Kannada: 'ಮನೋವಿಜ್ಞಾನ (Psychology)', Hindi: 'मनोविज्ञान' }, category: 'Arts / Humanities', colorTheme: 'violet', stream: 'Arts' },
  { code: 'ECO', name: { English: 'Economics', Kannada: 'ಅರ್ಥಶಾಸ್ತ್ರ', Hindi: 'अर्थशास्त्र' }, category: 'Arts / Humanities', colorTheme: 'cyan', stream: 'Arts' },
  { code: 'ENG', name: { English: 'English Core / Elective', Kannada: 'ಇಂಗ್ಲಿಷ್', Hindi: 'अंग्रेजी' }, category: 'Arts / Humanities', colorTheme: 'indigo', stream: 'Arts' },
  { code: 'LANG', name: { English: 'Languages (Kannada / Hindi)', Kannada: 'ಭಾಷೆಗಳು (ಕನ್ನಡ / ಹಿಂದಿ)', Hindi: 'भाषाएँ (कन्नड़ / हिन्दी)' }, category: 'Arts / Humanities', colorTheme: 'orange', stream: 'Arts' },

  // Vocational & Skill-Based
  { code: 'VOC', name: { English: 'Vocational & Skill Electives (AI & FinTech)', Kannada: 'ವೃತ್ತಿಪರ ಮತ್ತು ಕೌಶಲ್ಯ ವಿಷಯಗಳು', Hindi: 'व्यावसायिक और कौशल विषय' }, category: 'Vocational', colorTheme: 'cyan', stream: 'Vocational' },
];

// Curated verified syllabus topics mapped by subject code & stage (avoiding fabricated official chapter indices)
const CURATED_TOPIC_BANK: Record<string, Record<string, Array<{
  chapterTitle: { English: string; Kannada: string; Hindi: string };
  refLabel: string;
  diagramType: SchoolConcept['diagramType'];
  subtopic: string;
  simpleEn: string;
  simpleKn: string;
  simpleHi: string;
  detailedEn: string;
  exampleTitle: string;
  exampleSteps: string[];
  glossaryTerm: { term: string; kannadaMeaning: string; hindiMeaning: string; definition: string };
  formulaHint: string;
}>>> = {
  MATH: {
    PRE_PRIMARY: [
      {
        chapterTitle: { English: 'Numbers 1 to 20 & Counting Objects', Kannada: '1 ರಿಂದ 20 ಸಂಖ್ಯೆಗಳು ಮತ್ತು ಎಣಿಕೆ', Hindi: '1 से 20 संख्याएँ और गिनती' },
        refLabel: 'Foundational Numeracy Unit',
        diagramType: 'number_line',
        subtopic: 'One-to-One Counting Correspondence',
        simpleEn: 'Counting tells us how many objects are in front of us by matching one number word to one object.',
        simpleKn: 'ಎಣಿಕೆಯು ನಮ್ಮ ಮುಂದಿರುವ ವಸ್ತುಗಳು ಎಷ್ಟಿವೆ ಎಂಬುದನ್ನು ಪ್ರತಿ ವಸ್ತುವಿಗೆ ಒಂದು ಸಂಖ್ಯೆಯನ್ನು ಜೋಡಿಸಿ ತಿಳಿಸುತ್ತದೆ.',
        simpleHi: 'गिनती हमें बताती है कि हमारे सामने कितनी वस्तुएँ हैं, जहाँ हर वस्तु को एक संख्या से मिलाया जाता है।',
        detailedEn: 'Start from left to right and touch each apple, block, or pencil once as you say 1, 2, 3, 4, 5. The last number you say is the total count of the group.',
        exampleTitle: 'Counting 5 Colour Pencils',
        exampleSteps: ['Line up the pencils in a row.', 'Touch the first pencil and say "1".', 'Continue touching one by one up to "5".', 'Total pencils = 5.'],
        glossaryTerm: { term: 'Number Line', kannadaMeaning: 'ಸಂಖ್ಯಾ ರೇಖೆ (Number Line)', hindiMeaning: 'संख्या रेखा (Number Line)', definition: 'A straight line with numbers placed at equal steps.' },
        formulaHint: 'Next Number = Current Number + 1',
      },
    ],
    PRIMARY: [
      {
        chapterTitle: { English: 'Place Value, Addition & Fractions Introduction', Kannada: 'ಸ್ಥಾನಬೆಲೆ, ಸಂಕಲನ ಮತ್ತು ಭಿನ್ನರಾಶಿ ಪರಿಚಯ', Hindi: 'स्थानीय मान, जोड़ और भिन्न परिचय' },
        refLabel: 'Primary Mathematics Competency Map',
        diagramType: 'fraction_bars',
        subtopic: 'Equal Parts of a Whole (Fractions)',
        simpleEn: 'A fraction shows equal parts of one whole item, like half a roti or one-quarter of a chocolate bar.',
        simpleKn: 'ಭಿನ್ನರಾಶಿಯು (Fraction) ಒಂದು ಪೂರ್ಣ ವಸ್ತುವಿನ ಸಮಾನ ಭಾಗಗಳನ್ನು ತೋರಿಸುತ್ತದೆ.',
        simpleHi: 'भिन्न (Fraction) किसी एक पूरी वस्तु के बराबर भागों को दर्शाता है।',
        detailedEn: 'When a whole shape is divided into equal parts, the bottom number (Denominator) counts total equal parts, and the top number (Numerator) counts the shaded or chosen parts.',
        exampleTitle: 'Sharing 1 Pizza Equally Among 4 Friends',
        exampleSteps: ['Cut 1 whole circle into 4 equal slices.', 'Each friend takes 1 slice.', 'Shaded/chosen = 1 (Numerator), total equal slices = 4 (Denominator).', 'Each share = 1/4.'],
        glossaryTerm: { term: 'Numerator / Denominator', kannadaMeaning: 'ಅಂಶ / ಛೇದ (Numerator / Denominator)', hindiMeaning: 'अंश / हर (Numerator / Denominator)', definition: 'Top number (parts taken) over bottom number (total equal parts).' },
        formulaHint: 'Fraction = Numerator / Denominator',
      },
    ],
    MIDDLE: [
      {
        chapterTitle: { English: 'Algebraic Expressions, Linear Equations & Geometry', Kannada: 'ಬೀಜಗಣಿತೀಯ ಪದಗಳು ಮತ್ತು ರೇಖೀಯ ಸಮೀಕರಣಗಳು', Hindi: 'बीजीय व्यंजक और रैखिक समीकरण' },
        refLabel: 'Middle Stage Mathematics Syllabus',
        diagramType: 'pythagoras',
        subtopic: 'Right-Angled Triangles & Balance Equations',
        simpleEn: 'Equations keep both sides balanced like a weighing scale, while right triangles follow a fixed relationship between their sides.',
        simpleKn: 'ಸಮೀಕರಣಗಳು ತಕ್ಕಡಿಯ ಎರಡು ಬದಿಗಳಂತೆ ಸಮತೋಲನವನ್ನು ಕಾಯ್ದುಕೊಳ್ಳುತ್ತವೆ.',
        simpleHi: 'समीकरण तराजू के दोनों पलड़ों की तरह बराबर संतुलन बनाए रखते हैं।',
        detailedEn: 'In any right-angled triangle, the square on the longest side (Hypotenuse) equals the sum of the squares on the other two perpendicular sides: a² + b² = c². Similarly, whatever operation you perform on the LHS of an equation must also be performed on the RHS.',
        exampleTitle: 'Finding Hypotenuse of a 3 cm by 4 cm Triangle',
        exampleSteps: ['Identify legs a = 3 cm and b = 4 cm.', 'Compute a² + b² = 3² + 4² = 9 + 16 = 25.', 'Take square root: c = √25 = 5 cm.', 'Check: 5 cm > 4 cm and 3 cm.'],
        glossaryTerm: { term: 'Hypotenuse (Pythagoras Theorem)', kannadaMeaning: 'ವಿಕರ್ಣ — ಪೈಥಾಗರಸ್ ಪ್ರಮೇಯ (Hypotenuse)', hindiMeaning: 'कर्ण — पाइथागोरस प्रमेय (Hypotenuse)', definition: 'Longest side opposite the 90° angle in a right triangle.' },
        formulaHint: 'a² + b² = c² | Linear: ax + b = c',
      },
    ],
    SECONDARY: [
      {
        chapterTitle: { English: 'Quadratic Equations, Trigonometry & Coordinate Geometry', Kannada: 'ವರ್ಗ ಸಮೀಕರಣಗಳು ಮತ್ತು ತ್ರಿಕೋನಮಿತಿ', Hindi: 'द्विघात समीकरण और त्रिकोणमिति' },
        refLabel: 'Secondary Board Curriculum Unit',
        diagramType: 'pythagoras',
        subtopic: 'Discriminant & Roots of ax² + bx + c = 0',
        simpleEn: 'A quadratic equation has degree 2 and produces a parabolic curve whose solutions are found via factorization or the Quadratic Formula.',
        simpleKn: 'ವರ್ಗ ಸಮೀಕರಣವು (Quadratic Equation) ಘಾತ 2 ಹೊಂದಿದ್ದು, ಸೂತ್ರದ ಮೂಲಕ ಎರಡು ಮೂಲಗಳನ್ನು ನೀಡುತ್ತದೆ.',
        simpleHi: 'द्विघात समीकरण (Quadratic Equation) की अधिकतम घात 2 होती है और इसके मूल द्विघात सूत्र से मिलते हैं।',
        detailedEn: 'For ax² + bx + c = 0 (a ≠ 0), the discriminant Δ = b² - 4ac determines root nature: Δ > 0 gives two distinct real roots, Δ = 0 gives equal real roots, and Δ < 0 yields no real roots.',
        exampleTitle: 'Solve x² - 5x + 6 = 0',
        exampleSteps: ['Compare with ax² + bx + c = 0: a = 1, b = -5, c = 6.', 'Calculate Δ = (-5)² - 4(1)(6) = 25 - 24 = 1.', 'Apply x = (-b ± √Δ) / 2a = (5 ± 1) / 2.', 'Roots are x = 3 and x = 2.'],
        glossaryTerm: { term: 'Discriminant (b² - 4ac)', kannadaMeaning: 'ವಿವೇಚಕ (Discriminant)', hindiMeaning: 'विविक्तकर (Discriminant)', definition: 'Value inside the square root determining the nature of quadratic roots.' },
        formulaHint: 'x = (-b ± √(b² - 4ac)) / 2a',
      },
    ],
    SENIOR: [
      {
        chapterTitle: { English: 'Differential & Integral Calculus Foundations', Kannada: 'ಅವಕಲನ ಮತ್ತು ಸಮಾಕಲನ ಕಲನಶಾಸ್ತ್ರ (Calculus)', Hindi: 'अवकलन और समाकलन कलन (Calculus)' },
        refLabel: 'Senior Secondary Core Mathematics',
        diagramType: 'number_line',
        subtopic: 'Derivatives as Instantaneous Rate of Change',
        simpleEn: 'Differentiation measures exact speed or slope at any single instant, whereas integration accumulates tiny pieces into a total area.',
        simpleKn: 'ಅವಕಲನವು (Differentiation) ಒಂದು ಕ್ಷಣದ ಬದಲಾವಣೆಯ ದರವನ್ನು ಅಳೆಯುತ್ತದೆ.',
        simpleHi: 'अवकलन (Differentiation) किसी क्षण पर परिवर्तन की तात्कालिक दर को मापता है।',
        detailedEn: 'Using limits, f′(x) = lim(h→0) [f(x+h) - f(x)] / h. For power functions, d/dx(xⁿ) = n·xⁿ⁻¹. Applications include maxima/minima optimization, tangent slopes, and kinematics.',
        exampleTitle: 'Find Instantaneous Velocity from s(t) = 5t² + 3t',
        exampleSteps: ['Differentiate distance s(t) with respect to time t.', 'Apply power rule: d/dt(5t²) = 10t and d/dt(3t) = 3.', 'Velocity v(t) = 10t + 3 m/s.', 'At t = 2 s, v(2) = 23 m/s.'],
        glossaryTerm: { term: 'Derivative (Differentiation)', kannadaMeaning: 'ವ್ಯುತ್ಪನ್ನ / ಅವಕಲನ (Derivative)', hindiMeaning: 'अवकलज (Derivative)', definition: 'Instantaneous slope of a curve with respect to an independent variable.' },
        formulaHint: 'd/dx(xⁿ) = n·xⁿ⁻¹ | ∫xⁿ dx = xⁿ⁺¹/(n+1) + C',
      },
    ],
  },
  SCI: {
    PRIMARY: [
      {
        chapterTitle: { English: 'Water Cycle, Plants & Living Habitats', Kannada: 'ಜಲಚಕ್ರ, ಸಸ್ಯಗಳು ಮತ್ತು ಜೀವಾವರಣ', Hindi: 'जल चक्र, पौधे और जीव आवास' },
        refLabel: 'Primary Science & EVS Syllabus',
        diagramType: 'water_cycle',
        subtopic: 'Evaporation, Condensation & Precipitation',
        simpleEn: 'The Sun warms Earth’s water into vapor (Evaporation), cools it into clouds (Condensation), and returns it as rain (Precipitation).',
        simpleKn: 'ಸೂರ್ಯನ ಶಾಖದಿಂದ ನೀರು ಆವಿಯಾಗಿ (Evaporation), ಮೋಡವಾಗಿ (Condensation), ಮಳೆಯಾಗಿ (Precipitation) ಭೂಮಿಗೆ ಮರಳುತ್ತದೆ.',
        simpleHi: 'सूर्य की गर्मी से पानी वाष्प बनकर ऊपर उठता है (Evaporation), बादल बनता है (Condensation) और वर्षा (Precipitation) के रूप में लौटता है।',
        detailedEn: 'The Water Cycle continuously recycles freshwater across oceans, atmosphere, and land without losing matter. Green plants also release vapor through leaf stomata via transpiration.',
        exampleTitle: 'Observing Condensation on a Cold Steel Glass',
        exampleSteps: ['Pour chilled water into a dry metal glass.', 'Wait 3 minutes at room temperature.', 'Tiny water droplets form on the outer surface.', 'Invisible water vapor in warm air cooled and condensed into liquid droplets.'],
        glossaryTerm: { term: 'Condensation', kannadaMeaning: 'ಸಾಂದ್ರೀಕರಣ (Condensation)', hindiMeaning: 'संघनन (Condensation)', definition: 'Change of water vapor gas back into liquid droplets upon cooling.' },
        formulaHint: 'Liquid Water --(Heat)--> Vapor --(Cooling)--> Clouds/Rain',
      },
    ],
    MIDDLE: [
      {
        chapterTitle: { English: 'Plant Cell Structure & Photosynthesis', Kannada: 'ಸಸ್ಯ ಕೋಶ ರಚನೆ ಮತ್ತು ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ', Hindi: 'पादप कोशिका और प्रकाश संश्लेषण' },
        refLabel: 'Middle Stage Science Map',
        diagramType: 'plant_cell',
        subtopic: 'Chloroplasts, Cell Wall & Food Synthesis',
        simpleEn: 'Green leaves act like solar kitchens: chloroplasts capture sunlight to turn carbon dioxide and water into glucose and oxygen.',
        simpleKn: 'ಹಸಿರು ಎಲೆಗಳಲ್ಲಿರುವ ಕ್ಲೋರೊಪ್ಲಾಸ್ಟ್ (Chloroplast) ಸೂರ್ಯನ ಬೆಳಕನ್ನು ಬಳಸಿ ಆಹಾರ ತಯಾರಿಸುತ್ತದೆ.',
        simpleHi: 'हरी पत्तियों में क्लोरोप्लास्ट (Chloroplast) सूर्य के प्रकाश से भोजन तैयार करते हैं।',
        detailedEn: 'Inside plant cells, a rigid cellulose Cell Wall gives structural support, a large Central Vacuole maintains turgor pressure, and Chloroplasts carry out photosynthesis: 6CO₂ + 6H₂O --(Sunlight + Chlorophyll)--> C₆H₁₂O₆ + 6O₂.',
        exampleTitle: 'Why Leaves Kept in Darkness Lose Starch',
        exampleSteps: ['Place a potted green plant in darkness for 48 hours.', 'Test a leaf with dilute iodine solution.', 'No blue-black color appears because photosynthesis stopped without light.', 'Conclude sunlight is essential for glucose/starch synthesis.'],
        glossaryTerm: { term: 'Photosynthesis', kannadaMeaning: 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis)', hindiMeaning: 'प्रकाश संश्लेषण (Photosynthesis)', definition: 'Process by which green plants convert light energy, CO₂, and water into glucose and oxygen.' },
        formulaHint: '6CO₂ + 6H₂O -> C₆H₁₂O₆ + 6O₂',
      },
    ],
    SECONDARY: [
      {
        chapterTitle: { English: 'Electricity, Ohm’s Law & Chemical Reactions', Kannada: 'ವಿದ್ಯುತ್, ಓಮ್ ನಿಯಮ ಮತ್ತು ರಾಸಾಯನಿಕ ಕ್ರಿಯೆಗಳು', Hindi: 'विद्युत, ओम का नियम और रासायनिक अभिक्रियाएँ' },
        refLabel: 'Secondary Science / Physics Board Unit',
        diagramType: 'electric_circuit',
        subtopic: 'Voltage, Current & Resistance Relationship',
        simpleEn: 'At constant temperature, electric current flowing through a metallic conductor is directly proportional to the potential difference across its ends.',
        simpleKn: 'ಸ್ಥಿರ ತಾಪಮಾನದಲ್ಲಿ ವಾಹಕದ ಮೂಲಕ ಹರಿಯುವ ವಿದ್ಯುತ್ ಪ್ರವಾಹವು (Current) ವೋಲ್ಟೇಜ್‌ಗೆ ನೇರ ಅನುಪಾತದಲ್ಲಿರುತ್ತದೆ.',
        simpleHi: 'नियत ताप पर किसी चालक में प्रवाहित विद्युत धारा (Current) विभवांतर के अनुक्रमानुपाती होती है।',
        detailedEn: 'Ohm’s Law states V = I × R, where V is potential difference in Volts (V), I is electric current in Amperes (A), and R is resistance in Ohms (Ω). Series circuits add resistances (R₁ + R₂), while parallel circuits reduce total resistance.',
        exampleTitle: 'Calculate Current When 12V Drives a 4Ω Resistor',
        exampleSteps: ['Write given values: V = 12 V, R = 4 Ω.', 'Apply Ohm’s Law: I = V / R.', 'Compute I = 12 / 4 = 3 A.', 'Power dissipated P = V × I = 36 W.'],
        glossaryTerm: { term: "Ohm's Law (V = IR)", kannadaMeaning: 'ಓಮ್ ನಿಯಮ (Ohm’s Law)', hindiMeaning: 'ओम का नियम (Ohm’s Law)', definition: 'Proportional relationship linking Voltage (V), Current (I), and Resistance (R).' },
        formulaHint: 'V = I × R | P = V × I = I²R',
      },
    ],
  },
};

// Map board-specific textbook authority strings cleanly
export function getBoardTextbookSource(boardId: SchoolBoardId, classId: SchoolClassId): string {
  if (boardId === 'KAR_STATE') {
    return Number(classId) >= 11 ? 'Karnataka Dept. of Pre-University Education (DPUE)' : 'KTBS / DSERT Karnataka Syllabus';
  }
  if (boardId === 'CBSE') {
    return 'NCERT / CBSE Prescribed Curriculum Framework';
  }
  if (boardId === 'ICSE') {
    return Number(classId) >= 11 ? 'CISCE — ISC Prescribed Curriculum' : 'CISCE — ICSE Prescribed Curriculum';
  }
  if (boardId === 'OTHER_STATE') {
    return 'SCERT State Board Core Curriculum';
  }
  return 'NIOS / Recognized School Academic Framework';
}

function getStageBucket(classId: SchoolClassId): 'PRE_PRIMARY' | 'PRIMARY' | 'MIDDLE' | 'SECONDARY' | 'SENIOR' {
  if (classId === 'LKG' || classId === 'UKG') return 'PRE_PRIMARY';
  const num = Number(classId);
  if (num <= 5) return 'PRIMARY';
  if (num <= 8) return 'MIDDLE';
  if (num <= 10) return 'SECONDARY';
  return 'SENIOR';
}

function resolveCuratedSeed(code: string, classId: SchoolClassId) {
  const bucket = getStageBucket(classId);
  const direct = CURATED_TOPIC_BANK[code]?.[bucket]?.[0];
  if (direct) return direct;
  if (['PHY', 'CHM', 'BIO', 'EVS'].includes(code)) {
    return CURATED_TOPIC_BANK.SCI[bucket === 'SENIOR' || bucket === 'SECONDARY' ? 'SECONDARY' : bucket === 'PRE_PRIMARY' ? 'PRIMARY' : bucket]?.[0];
  }
  if (['APPMATH'].includes(code)) {
    return CURATED_TOPIC_BANK.MATH.SENIOR[0];
  }
  return null;
}

function getDiagramForSubjectCode(code: string): SchoolConcept['diagramType'] {
  if (code === 'MATH' || code === 'APPMATH') return 'pythagoras';
  if (code === 'PHY') return 'electric_circuit';
  if (code === 'CHM') return 'periodic_atom';
  if (code === 'BIO' || code === 'SCI') return 'plant_cell';
  if (code === 'EVS' || code === 'ENV' || code === 'GEO') return 'water_cycle';
  if (code === 'CS' || code === 'IP' || code === 'CMP' || code === 'CA') return 'logic_gate';
  if (code === 'ECO' || code === 'ACC' || code === 'BST' || code === 'ENT') return 'supply_demand';
  return 'general_concept';
}

function getImageForSubjectCategory(category: string): string {
  const c = category.toLowerCase();
  if (c.includes('technology') || c.includes('computer')) return '/assets/images/coding_programming.jpg';
  if (c.includes('stem') || c.includes('science')) return '/assets/images/robotics_stem.jpg';
  if (c.includes('commerce') || c.includes('vocational')) return '/assets/images/entrepreneurship_finance.jpg';
  if (c.includes('creative')) return '/assets/images/graphic_design_media.jpg';
  if (c.includes('language') || c.includes('life')) return '/assets/images/communication_personality.jpg';
  return '/assets/images/academic_education.jpg';
}

function buildSubjectChapters(
  boardId: SchoolBoardId,
  classId: SchoolClassId,
  spec: SubjectSpec,
  subjectId: string
): SchoolChapter[] {
  const classDef = SCHOOL_CLASSES.find((c) => c.id === classId)!;
  const textbookReference = getBoardTextbookSource(boardId, classId);
  const curated = resolveCuratedSeed(spec.code, classId);

  const ch1Id = `${subjectId}-ch1`;
  const ch2Id = `${subjectId}-ch2`;

  const concept1TitleEn = curated
    ? curated.subtopic
    : `Core Foundations of ${spec.name.English} (${classDef.shortLabel})`;

  const ch1Concepts: SchoolConcept[] = [
    {
      id: `${ch1Id}-c1`,
      subjectId,
      chapterId: ch1Id,
      topicId: `${ch1Id}-t1`,
      subtopicTitle: curated ? curated.subtopic : `Foundational Principle in ${spec.name.English}`,
      order: 1,
      title: {
        English: concept1TitleEn,
        Kannada: curated ? `${curated.subtopic} (${spec.name.Kannada})` : `${spec.name.Kannada} — ಮೂಲ ಪರಿಕಲ್ಪನೆ`,
        Hindi: curated ? `${curated.subtopic} (${spec.name.Hindi})` : `${spec.name.Hindi} — मूल अवधारणा`,
      },
      simpleExplanation: curated
        ? {
            English: curated.simpleEn,
            Kannada: curated.simpleKn,
            Hindi: curated.simpleHi,
          }
        : {
            English: `In ${classDef.label} ${spec.name.English}, this foundational concept establishes the key vocabulary, core rules, and everyday observations prescribed by the ${boardId} curriculum.`,
            Kannada: `${classDef.label} ${spec.name.Kannada} ಪಠ್ಯಕ್ರಮದ ಮೊದಲ ಹಂತದಲ್ಲಿ ಮೂಲ ನಿಯಮಗಳು ಮತ್ತು ದೈನಂದಿನ ಉದಾಹರಣೆಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಕಲಿಯಲಾಗುತ್ತದೆ.`,
            Hindi: `${classDef.label} ${spec.name.Hindi} में यह बुनियादी अवधारणा मुख्य नियमों और रोज़मर्रा के उदाहरणों को सरलता से समझाती है।`,
          },
      detailedExplanation: {
        English: curated
          ? `${curated.detailedEn} Always verify your work against ${textbookReference} standards before moving to the next advanced concept.`
          : `Students in ${classDef.label} (${textbookReference}) begin with foundational definitions, identify standard patterns, and apply structured reasoning step-by-step without skipping prerequisite rules.`,
        Kannada: curated
          ? `${curated.simpleKn} ವಿವರಣೆ: ${curated.detailedEn}`
          : `${classDef.label} ವಿದ್ಯಾರ್ಥಿಗಳು ಮೂಲ ವ್ಯಾಖ್ಯಾನಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಂಡು ಹಂತ-ಹಂತವಾಗಿ ಅಭ್ಯಾಸ ಮಾಡಬೇಕು (Technical terms kept exact for board exams).`,
        Hindi: curated
          ? `${curated.simpleHi} विस्तृत व्याख्या: ${curated.detailedEn}`
          : `${classDef.label} के विद्यार्थी पहले मूल परिभाषाओं को समझते हैं और फिर क्रमिक अभ्यास से दक्षता प्राप्त करते हैं।`,
      },
      learningObjectives: [
        `Define the key principles of ${spec.name.English} accurately for ${classDef.shortLabel}`,
        'Solve structured worked examples step-by-step from basic to intermediate level',
        'Connect textbook principles to real-life Indian classroom and community scenarios',
      ],
      examples: [
        {
          title: curated ? curated.exampleTitle : `Worked Example: ${spec.name.English} Core Method`,
          content: `Step-by-step demonstration aligned to ${textbookReference}.`,
          stepByStep: curated
            ? curated.exampleSteps
            : [
                `Read the problem statement carefully and identify the ${spec.name.English} principle involved.`,
                'Write down known facts or values cleanly.',
                'Apply the standard rule step-by-step and verify units/logic.',
                'Summarize the final verified conclusion.',
              ],
        },
      ],
      realLifeApplications: [
        {
          English: `Used daily in measurement, reasoning, communication, and community problem-solving across ${spec.category}.`,
          Kannada: `ದೈನಂದಿನ ಜೀವನ, ಅಳತೆ, ತಾರ್ಕಿಕ ಚಿಂತನೆ ಮತ್ತು ಸಮುದಾಯದ ಸಮಸ್ಯೆ ಬಗೆಹರಿಸುವಲ್ಲಿ ಇದರ ನೇರ ಬಳಕೆಯಿದೆ.`,
          Hindi: `दैनिक जीवन, मापन, तार्किक सोच और व्यावहारिक समस्याओं को हल करने में इसका सीधा उपयोग होता है।`,
        },
      ],
      illustrationUrl: getImageForSubjectCategory(spec.category),
      diagramType: curated ? curated.diagramType : getDiagramForSubjectCode(spec.code),
      diagramCaption: curated
        ? `Interactive Visual Schematic: ${curated.subtopic} (${classDef.shortLabel})`
        : `Visual Concept Map: ${spec.name.English} Core Building Blocks`,
      technicalTermsGlossary: [
        curated
          ? curated.glossaryTerm
          : {
              term: `${spec.name.English} Core Principle`,
              kannadaMeaning: `${spec.name.Kannada} ಮೂಲ ತತ್ವ`,
              hindiMeaning: `${spec.name.Hindi} मुख्य सिद्धांत`,
              definition: `Prescribed foundational concept from ${textbookReference}.`,
            },
      ],
      importantQuestions: [
        {
          question: `State the main idea of "${concept1TitleEn}" with one everyday example.`,
          answer: curated ? curated.simpleEn : `Clear definition followed by one accurate real-world classroom example from ${spec.name.English}.`,
          marks: 2,
        },
        {
          question: `Explain the step-by-step reasoning used in ${spec.name.English} (${classDef.shortLabel}).`,
          answer: curated ? curated.detailedEn : 'Identify inputs, apply the core textbook rule systematically, and verify the result.',
          marks: 4,
        },
      ],
      practiceExercises: [
        {
          prompt: `Try solving or explaining "${concept1TitleEn}" in your own words, including 1 example.`,
          hint: curated ? `Remember the key rule: ${curated.formulaHint}` : 'Break your explanation into Definition -> Example -> Application.',
          solution: curated ? curated.exampleSteps.join(' → ') : 'Check your steps against the Worked Example panel above.',
        },
      ],
      homeworkTask: `Prepare a short 5-point revision card and solve 2 practice questions on "${concept1TitleEn}" in your notebook.`,
      revisionNotes: {
        English: `Key Rule: ${curated ? curated.formulaHint : spec.name.English + ' Foundation'} · Always link definitions with verified examples.`,
        Kannada: `ಮುಖ್ಯ ಸೂತ್ರ/ನಿಯಮ: ${curated ? curated.formulaHint : spec.name.Kannada} · ಪ್ರತಿದಿನ 10 ನಿಮಿಷ ಪುನರಾವರ್ತನೆ ಮಾಡಿ.`,
        Hindi: `मुख्य सूत्र/नियम: ${curated ? curated.formulaHint : spec.name.Hindi} · परिभाषा को उदाहरण के साथ दोहराएँ।`,
      },
      flashcards: [
        {
          front: `${spec.name.English}: What is ${concept1TitleEn}?`,
          back: curated ? curated.simpleEn : `Core ${classDef.shortLabel} concept aligned to ${textbookReference}.`,
        },
        {
          front: 'Key Formula / Rule',
          back: curated ? curated.formulaHint : 'Definition → Worked Model → Real-Life Verification',
        },
      ],
      estimatedMinutes: 20,
      difficulty: 'Basic',
    },
    {
      id: `${ch1Id}-c2`,
      subjectId,
      chapterId: ch1Id,
      topicId: `${ch1Id}-t2`,
      subtopicTitle: `Applied Problem Solving in ${spec.name.English}`,
      order: 2,
      title: {
        English: `Applied Practice & Analytical Thinking: ${spec.name.English}`,
        Kannada: `ಅನ್ವಯಿಕ ಅಭ್ಯಾಸ ಮತ್ತು ವಿಶ್ಲೇಷಣೆ: ${spec.name.Kannada}`,
        Hindi: `व्यावहारिक अभ्यास और विश्लेषण: ${spec.name.Hindi}`,
      },
      simpleExplanation: {
        English: `Once the core rule of ${spec.name.English} is clear, this concept guides you through multi-step board-style questions and practical situations.`,
        Kannada: `ಮೂಲ ನಿಯಮ ಸ್ಪಷ್ಟವಾದ ನಂತರ, ಬಹು-ಹಂತದ ಪ್ರಶ್ನೆಗಳನ್ನು ಹೇಗೆ ಬಿಡಿಸಬೇಕು ಎಂಬುದನ್ನು ಇಲ್ಲಿ ಕಲಿಯಲಾಗುತ್ತದೆ.`,
        Hindi: `मूल नियम समझने के बाद यह अवधारणा बहु-चरणीय प्रश्नों को हल करने की विधि सिखाती है।`,
      },
      detailedExplanation: {
        English: `Board examinations (${boardId}) evaluate not just recall, but application, interpretation of diagrams/data, and avoiding common calculation or terminology errors.`,
        Kannada: `ಪರೀಕ್ಷೆಗಳಲ್ಲಿ ಕೇವಲ ಕಂಠಪಾಠವಲ್ಲದೆ, ಅನ್ವಯಿಕ ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಚಿತ್ರ/ದತ್ತಾಂಶ ವಿಶ್ಲೇಷಣೆಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ.`,
        Hindi: `बोर्ड और विद्यालय परीक्षाओं में केवल याद करने के बजाय अनुप्रयोग और तार्किक व्याख्या का मूल्यांकन होता है।`,
      },
      learningObjectives: [
        'Solve intermediate and application-based questions independently',
        'Spot and correct common conceptual mistakes before assessments',
      ],
      examples: [
        {
          title: `Board-Style Application Scenario (${classDef.shortLabel})`,
          content: `Structured problem solving aligned with ${boardId} pattern.`,
          stepByStep: [
            'Underline key terms and constraints in the question.',
            'Select the appropriate theorem, rule, or grammar structure.',
            'Present intermediate steps cleanly for full method marks.',
          ],
        },
      ],
      realLifeApplications: [
        {
          English: 'Supports olympiads, school projects, science exhibitions, and presentation demonstrations.',
          Kannada: 'ಶಾಲಾ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು, ವಿಜ್ಞಾನ ಪ್ರದರ್ಶನಗಳು ಮತ್ತು ಪ್ರಸ್ತುತಿಗಳಲ್ಲಿ ಉಪಯುಕ್ತವಾಗಿದೆ.',
          Hindi: 'स्कूल प्रोजेक्ट, विज्ञान प्रदर्शनी और कक्षा प्रस्तुतियों में उपयोगी।',
        },
      ],
      illustrationUrl: getImageForSubjectCategory(spec.category),
      diagramType: getDiagramForSubjectCode(spec.code),
      diagramCaption: `Application Workflow · ${spec.name.English}`,
      technicalTermsGlossary: [
        {
          term: 'Analytical Reasoning',
          kannadaMeaning: 'ವಿಶ್ಲೇಷಣಾತ್ಮಕ ಚಿಂತನೆ (Analytical Reasoning)',
          hindiMeaning: 'विश्लेषणात्मक तर्क (Analytical Reasoning)',
          definition: 'Breaking a complex school problem into verifiable logical steps.',
        },
      ],
      importantQuestions: [
        {
          question: `What common mistake should students avoid when answering ${spec.name.English} application questions?`,
          answer: 'Skipping units, omitting steps, or mixing rules from unrelated topics.',
          marks: 3,
        },
      ],
      practiceExercises: [
        {
          prompt: `Complete an 8-format quiz check for ${spec.name.English} and write down one real-world insight you learned.`,
          hint: 'Use the AI Tutor Step-by-Step mode if any step feels tricky.',
          solution: 'Review each step with the automated concept feedback after submitting.',
        },
      ],
      homeworkTask: `Submit a brief summary note or visual diagram on "${spec.name.English} in Everyday Life".`,
      revisionNotes: {
        English: 'Always verify units, label diagrams neatly, and write step-by-step reasoning.',
        Kannada: 'ಯಾವಾಗಲೂ ಏಕಮಾನಗಳನ್ನು (units) ಮತ್ತು ಚಿತ್ರದ ಭಾಗಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಗುರುತಿಸಿ.',
        Hindi: 'हमेशा इकाइयों (units) की जांच करें और चित्रों को स्पष्ट रूप से नामांकित करें।',
      },
      flashcards: [
        {
          front: 'Why show intermediate steps?',
          back: 'Step-marking rewards clear reasoning and makes error checking easy.',
        },
      ],
      estimatedMinutes: 25,
      difficulty: 'Intermediate',
    },
  ];

  const chapters: SchoolChapter[] = [
    {
      id: ch1Id,
      boardId,
      classId,
      subjectId,
      chapterNumber: 1,
      title: curated
        ? curated.chapterTitle
        : {
            English: `${spec.name.English} Unit 1: Core Foundations`,
            Kannada: `${spec.name.Kannada} ಘಟಕ 1: ಮೂಲಭೂತ ಪರಿಕಲ್ಪನೆಗಳು`,
            Hindi: `${spec.name.Hindi} इकाई 1: बुनियादी सिद्धांत`,
          },
      textbookReference,
      summary: `Board-aligned unit structured in order from foundational literacy/principles to applied problem solving (${textbookReference}).`,
      topics: [
        {
          id: `${ch1Id}-t1`,
          title: curated ? curated.subtopic : `Core Concepts of ${spec.name.English}`,
          subtopics: ['Definitions & Rules', 'Worked Examples', 'Real-Life Uses'],
        },
        {
          id: `${ch1Id}-t2`,
          title: 'Applied Practice & Board Readiness',
          subtopics: ['Multi-Step Questions', 'Common Misconceptions', 'Revision & Quiz'],
        },
      ],
      concepts: ch1Concepts,
    },
    {
      id: ch2Id,
      boardId,
      classId,
      subjectId,
      chapterNumber: 2,
      title: {
        English: `${spec.name.English} Unit 2: Synthesis, Projects & Mastery`,
        Kannada: `${spec.name.Kannada} ಘಟಕ 2: ಪ್ರಾಯೋಗಿಕ ಕಲಿಕೆ ಮತ್ತು ಪ್ರಾಜೆಕ್ಟ್`,
        Hindi: `${spec.name.Hindi} इकाई 2: प्रायोगिक अभ्यास और प्रोजेक्ट`,
      },
      textbookReference,
      summary: `Reinforces mastery through experiments, presentations, and higher-order exercises prescribed for ${classDef.label}.`,
      topics: [
        {
          id: `${ch2Id}-t1`,
          title: `Higher-Order Reasoning in ${spec.name.English}`,
          subtopics: ['Comparative Analysis', 'Presentation & Communication'],
        },
      ],
      concepts: [
        {
          ...ch1Concepts[1],
          id: `${ch2Id}-c1`,
          chapterId: ch2Id,
          topicId: `${ch2Id}-t1`,
          order: 1,
          difficulty: 'Advanced',
          title: {
            English: `Mastery Synthesis & Project Thinking in ${spec.name.English}`,
            Kannada: `${spec.name.Kannada} — ಪ್ರೌಢ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಪ್ರಾಜೆಕ್ಟ್`,
            Hindi: `${spec.name.Hindi} — उच्च स्तरीय अभ्यास एवं प्रोजेक्ट`,
          },
        },
      ],
    },
  ];

  return chapters;
}

export function getPrescribedSpecsForSelection(
  classId: SchoolClassId,
  stream: SchoolStreamId
): SubjectSpec[] {
  if (classId === 'LKG' || classId === 'UKG') return PRE_PRIMARY_SUBJECTS;
  const num = Number(classId);
  if (num >= 1 && num <= 5) return PRIMARY_1_TO_5_SUBJECTS;
  if (num >= 6 && num <= 8) return MIDDLE_6_TO_8_SUBJECTS;
  if (num >= 9 && num <= 10) return SECONDARY_9_TO_10_SUBJECTS;

  // Classes 11-12 filter cleanly by chosen stream (or return all streams if stream === 'General')
  if (stream === 'General') return SENIOR_SECONDARY_11_12_SUBJECTS;
  const matched = SENIOR_SECONDARY_11_12_SUBJECTS.filter((s) => s.stream === stream || s.stream === 'Vocational');
  return matched.length > 0 ? matched : SENIOR_SECONDARY_11_12_SUBJECTS;
}

export function getSubjectsForSelection(params: {
  boardId: SchoolBoardId;
  classId: SchoolClassId;
  stream?: SchoolStreamId;
  academicYear?: string;
  medium?: string;
  customSubjects?: SchoolSubject[];
}): SchoolSubject[] {
  const {
    boardId,
    classId,
    stream = Number(classId) >= 11 ? 'Science' : 'General',
    academicYear = '2026-2027',
    medium = 'English Medium',
    customSubjects = [],
  } = params;

  const board = SCHOOL_BOARDS.find((b) => b.id === boardId) || SCHOOL_BOARDS[0];
  const specs = getPrescribedSpecsForSelection(classId, stream);

  // Build strict board-isolated subjects
  const built: SchoolSubject[] = specs.map((spec) => {
    // Include boardId & classId in unique ID so Karnataka State Class 10 Math != CBSE Class 10 Math
    const subjectId = `${boardId}_CLS_${classId}_${spec.stream}_${spec.code}`.toUpperCase();
    return {
      id: subjectId,
      boardId,
      classId,
      stream: spec.stream,
      code: spec.code,
      name: spec.name,
      category: spec.category,
      colorTheme: spec.colorTheme,
      textbookSource: getBoardTextbookSource(boardId, classId),
      academicYear,
      mediums: board.supportedMediums.includes(medium) ? [medium, ...board.supportedMediums] : board.supportedMediums,
      chapters: buildSubjectChapters(boardId, classId, spec, subjectId),
    };
  });

  // Merge custom/imported subjects ONLY if they strictly match the exact selected boardId and classId (never mix boards!)
  const customFiltered = customSubjects.filter(
    (cs) =>
      cs.boardId === boardId &&
      cs.classId === classId &&
      (Number(classId) < 11 || stream === 'General' || cs.stream === stream)
  );

  const byId = new Map<string, SchoolSubject>();
  for (const s of built) byId.set(s.id, s);
  for (const cs of customFiltered) byId.set(cs.id, cs);

  return Array.from(byId.values());
}

export function getDefaultWeeklyTimetable(
  boardId: SchoolBoardId,
  classId: SchoolClassId,
  stream: SchoolStreamId
): SchoolTimetableSlot[] {
  const subjects = getSubjectsForSelection({ boardId, classId, stream });
  const days: SchoolTimetableSlot['dayOfWeek'][] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const slots: SchoolTimetableSlot[] = [];
  const timeWindows = [
    ['09:00 AM', '09:45 AM', 'Live Class'],
    ['10:00 AM', '10:45 AM', 'Self-Paced Concept'],
    ['11:15 AM', '12:00 PM', 'Lab / Practice'],
    ['04:00 PM', '04:45 PM', 'Revision'],
  ] as const;

  let cursor = 0;
  for (const day of days) {
    for (let i = 0; i < timeWindows.length; i++) {
      const subj = subjects[cursor % Math.max(1, subjects.length)];
      if (!subj) continue;
      slots.push({
        id: `tt-${boardId}-${classId}-${day}-${i}`,
        boardId,
        classId,
        dayOfWeek: day,
        startTime: timeWindows[i][0],
        endTime: timeWindows[i][1],
        subjectId: subj.id,
        subjectName: subj.name.English,
        teacherName: 'OpenFrame Subject Faculty',
        mode: timeWindows[i][2],
      });
      cursor++;
    }
  }
  return slots;
}

export const SCHOOL_FORMULA_LIBRARY: Array<{
  subject: string;
  stage: string;
  title: string;
  formula: string;
  meaning: string;
}> = [
  { subject: 'Mathematics', stage: 'Classes 4–8', title: 'Perimeter & Area of Rectangle', formula: 'P = 2(l + w)  |  Area = l × w', meaning: 'Total boundary length and interior surface area.' },
  { subject: 'Mathematics', stage: 'Classes 7–10', title: 'Pythagoras Theorem', formula: 'a² + b² = c²', meaning: 'Sum of squares of perpendicular legs equals hypotenuse squared.' },
  { subject: 'Mathematics', stage: 'Classes 9–12', title: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / 2a', meaning: 'Finds real/complex roots of ax² + bx + c = 0.' },
  { subject: 'Physics', stage: 'Classes 9–12', title: "Newton's Second Law", formula: 'F = m × a', meaning: 'Net Force (N) equals Mass (kg) times Acceleration (m/s²).' },
  { subject: 'Physics', stage: 'Classes 9–12', title: "Ohm's Law & Electric Power", formula: 'V = I × R  |  P = V × I', meaning: 'Links Potential Difference (V), Current (A), and Resistance (Ω).' },
  { subject: 'Physics', stage: 'Classes 10–12', title: 'Mirror / Lens Magnification', formula: '1/f = 1/v + 1/u (Mirror)', meaning: 'Focal length relation with object distance u and image distance v.' },
  { subject: 'Chemistry', stage: 'Classes 8–12', title: 'Molarity & Ideal Gas Law', formula: 'PV = nRT  |  M = moles / Liters', meaning: 'Relates Pressure, Volume, Moles, and Absolute Temperature.' },
  { subject: 'Biology', stage: 'Classes 6–12', title: 'Photosynthesis Equation', formula: '6CO₂ + 6H₂O + Light → C₆H₁₂O₆ + 6O₂', meaning: 'Conversion of inorganic carbon dioxide and water into glucose.' },
  { subject: 'Accountancy', stage: 'Classes 11–12', title: 'Accounting Equation', formula: 'Assets = Liabilities + Capital', meaning: 'Fundamental double-entry balance sheet identity.' },
  { subject: 'Economics', stage: 'Classes 10–12', title: 'GDP (Expenditure Method)', formula: 'GDP = C + I + G + (X - M)', meaning: 'Consumption + Investment + Govt Spending + Net Exports.' },
];

export const SCHOOL_BILINGUAL_GLOSSARY: Array<{
  subject: string;
  english: string;
  kannada: string;
  hindi: string;
  definition: string;
}> = [
  { subject: 'Science', english: 'Photosynthesis', kannada: 'ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis)', hindi: 'प्रकाश संश्लेषण (Photosynthesis)', definition: 'Process used by green plants to convert sunlight into chemical food (glucose).' },
  { subject: 'Physics', english: 'Potential Difference (Voltage)', kannada: 'ವಿಭವಾಂತರ (Voltage)', hindi: 'विभवांतर (Voltage)', definition: 'Work done per unit charge in moving a charge between two points in a circuit.' },
  { subject: 'Physics', english: 'Acceleration', kannada: 'ವೇಗೋತ್ಕರ್ಷ (Acceleration)', hindi: 'त्वरण (Acceleration)', definition: 'Rate of change of velocity per unit time (m/s²).' },
  { subject: 'Chemistry', english: 'Neutralization Reaction', kannada: 'ತಟಸ್ಥೀಕರಣ ಕ್ರಿಯೆ (Neutralization)', hindi: 'उदासीनीकरण अभिक्रिया (Neutralization)', definition: 'Reaction between an acid and a base producing salt and water.' },
  { subject: 'Mathematics', english: 'Numerator & Denominator', kannada: 'ಅಂಶ ಮತ್ತು ಛೇದ (Numerator & Denominator)', hindi: 'अंश और हर (Numerator & Denominator)', definition: 'Top count of selected parts and bottom count of total equal parts in a fraction.' },
  { subject: 'Mathematics', english: 'Quadratic Equation', kannada: 'ವರ್ಗ ಸಮೀಕರಣ (Quadratic Equation)', hindi: 'द्विघात समीकरण (Quadratic Equation)', definition: 'Polynomial equation of degree two of form ax² + bx + c = 0.' },
  { subject: 'Commerce', english: 'Depreciation', kannada: 'ಸವಕಳಿ (Depreciation)', hindi: 'मूल्यह्रास (Depreciation)', definition: 'Systematic reduction in the recorded value of a fixed asset over its useful life.' },
  { subject: 'Social Science', english: 'Federalism', kannada: 'ಒಕ್ಕೂಟ ವ್ಯವಸ್ಥೆ (Federalism)', hindi: 'संघवाद (Federalism)', definition: 'Constitutional division of power between central and state governments.' },
];

export const SCHOOL_CAREER_PATHWAYS: Array<{
  id: string;
  title: string;
  stream: string;
  minClassRecommended: string;
  keySubjects: string[];
  entrancePathways: string[];
  roles: string[];
  summary: string;
}> = [
  {
    id: 'cp-eng-ai',
    title: 'Software Engineering, AI & Robotics',
    stream: 'Science (PCM + Computer Science)',
    minClassRecommended: 'Class 8 – Class 12',
    keySubjects: ['Mathematics', 'Physics', 'Computer Science'],
    entrancePathways: ['KCET (Karnataka)', 'JEE Main & Advanced', 'BITSAT / IIIT'],
    roles: ['AI Engineer', 'Full-Stack Developer', 'Cloud Architect', 'Robotics Specialist'],
    summary: 'Strong algebra, calculus, logical coding, and physics circuits build directly toward B.Tech / B.E. and applied AI careers.',
  },
  {
    id: 'cp-med-bio',
    title: 'Medicine, Biotechnology & Life Sciences',
    stream: 'Science (PCB)',
    minClassRecommended: 'Class 8 – Class 12',
    keySubjects: ['Biology', 'Chemistry', 'Physics'],
    entrancePathways: ['NEET UG', 'KCET Medical / Allied Health', 'IAT (IISER Research)'],
    roles: ['Physician (MBBS)', 'Biotechnologist', 'Pharmacologist', 'Clinical Researcher'],
    summary: 'Master NCERT/State Board human physiology, genetics, and organic chemistry thoroughly for medical and research readiness.',
  },
  {
    id: 'cp-com-fin',
    title: 'Chartered Accountancy, FinTech & Management',
    stream: 'Commerce',
    minClassRecommended: 'Class 9 – Class 12',
    keySubjects: ['Accountancy', 'Economics', 'Business Studies', 'Mathematics / Applied Math'],
    entrancePathways: ['CA Foundation (ICAI)', 'CUET (B.Com Hons / BBA)', 'IPM IIM'],
    roles: ['Chartered Accountant', 'Financial Analyst', 'Investment Banker', 'Startup Founder'],
    summary: 'Focus on balance sheets, micro/macroeconomics, quantitative aptitude, and entrepreneurship case studies.',
  },
  {
    id: 'cp-law-gov',
    title: 'Law, Public Policy & Civil Services',
    stream: 'Arts / Humanities / Any Stream',
    minClassRecommended: 'Class 8 – Class 12',
    keySubjects: ['Political Science', 'History', 'Economics', 'English'],
    entrancePathways: ['CLAT / AILET', 'CUET Humanities', 'UPSC Foundation'],
    roles: ['Corporate / Constitutional Lawyer', 'IAS / KAS Officer', 'Policy Analyst', 'Journalist'],
    summary: 'Sharp reading comprehension, Indian Constitution knowledge, historical analysis, and debating presentations give an early edge.',
  },
  {
    id: 'cp-design-voc',
    title: 'UI/UX Design, Digital Media & Vocational Tech',
    stream: 'Vocational / Arts / Science',
    minClassRecommended: 'Class 8 – Class 12',
    keySubjects: ['Computer Applications', 'Art and Craft / Drawing', 'Vocational Electives'],
    entrancePathways: ['UCEED / NID DAT', 'NIFT', 'Skill India NSQF Certifications'],
    roles: ['Product Designer', '3D Animator', 'Digital Marketing Strategist', 'IoT Technician'],
    summary: 'Pair creative visual portfolios and student presentations with practical digital software tools.',
  },
];
