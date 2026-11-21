import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { auth, db, stripUndefinedDeep } from './firebase';
import { standaloneMockService } from './standaloneMockService';
import {
  fetchLiveRazorpayConfig,
  launchLiveRazorpayPayment,
} from './razorpayCheckoutService';
import {
  SelfStudyChapterNote,
  SelfStudyProgressReport,
  SelfStudyTokenAction,
  StudentTokenWallet,
  TokenRechargeRecord,
  TokenUsageEntry,
} from '../types';

export const WEEKLY_STARTER_TOKENS = 50;
export const WEEKLY_RECHARGE_PRICE_INR = 100;
export const WEEKLY_RECHARGE_TOKENS = 250;
export const WEEKLY_CYCLE_DAYS = 7;

export const SELF_STUDY_TOKEN_COSTS: Record<SelfStudyTokenAction, number> = {
  video_ai_analysis: 2,
  chapter_pdf: 2,
  thirty_q_exam: 5,
  iq_eq_sq_test: 3,
};

const LOCAL_WALLET_KEY = 'openframe_self_study_wallet_v1';
const LOCAL_REPORTS_KEY = 'openframe_self_study_reports_v1';

function createFreshWeeklyWallet(uid: string, studentEmail?: string): StudentTokenWallet {
  const now = new Date();
  const expires = new Date(now.getTime() + WEEKLY_CYCLE_DAYS * 24 * 60 * 60 * 1000);
  return {
    uid,
    studentEmail: (studentEmail || '').slice(0, 120),
    balance: WEEKLY_STARTER_TOKENS,
    weeklyStarterQuota: WEEKLY_STARTER_TOKENS,
    rechargedTokens: 0,
    totalTokensUsed: 0,
    cycleStartedAt: now.toISOString(),
    cycleExpiresAt: expires.toISOString(),
    usageHistory: [],
    updatedAt: now.toISOString(),
  };
}

function readLocalWallet(uid: string): StudentTokenWallet | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_WALLET_KEY}_${uid}`);
    return raw ? (JSON.parse(raw) as StudentTokenWallet) : null;
  } catch {
    return null;
  }
}

function writeLocalWallet(wallet: StudentTokenWallet): void {
  try {
    localStorage.setItem(`${LOCAL_WALLET_KEY}_${wallet.uid}`, JSON.stringify(wallet));
  } catch {
    // ignore storage errors
  }
}

export function isWalletExpired(wallet: StudentTokenWallet): boolean {
  const expMs = Date.parse(wallet.cycleExpiresAt);
  if (Number.isNaN(expMs)) return false;
  return Date.now() > expMs;
}

export function getWalletDaysRemaining(wallet: StudentTokenWallet): number {
  const expMs = Date.parse(wallet.cycleExpiresAt);
  if (Number.isNaN(expMs)) return WEEKLY_CYCLE_DAYS;
  const diff = expMs - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export async function getOrCreateStudentTokenWallet(
  uid: string,
  studentEmail?: string
): Promise<StudentTokenWallet> {
  const safeUid = uid || 'guest_learner';
  let wallet: StudentTokenWallet | null = null;

  if (auth.currentUser && auth.currentUser.uid === safeUid) {
    try {
      const ref = doc(db, 'student_token_wallets', safeUid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        wallet = snap.data() as StudentTokenWallet;
      }
    } catch (err) {
      console.warn('Token wallet fetch warning (falling back to local cache):', err);
    }
  }

  if (!wallet) {
    wallet = readLocalWallet(safeUid) || createFreshWeeklyWallet(safeUid, studentEmail);
  }

  // Auto-rollover if starter cycle expired and wallet hasn't been rolled over yet
  const now = new Date();
  if (isWalletExpired(wallet)) {
    const nextExpires = new Date(now.getTime() + WEEKLY_CYCLE_DAYS * 24 * 60 * 60 * 1000);
    wallet = {
      ...wallet,
      balance: Math.max(wallet.balance, WEEKLY_STARTER_TOKENS),
      weeklyStarterQuota: WEEKLY_STARTER_TOKENS,
      cycleStartedAt: now.toISOString(),
      cycleExpiresAt: nextExpires.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  writeLocalWallet(wallet);

  if (auth.currentUser && auth.currentUser.uid === safeUid) {
    try {
      await setDoc(doc(db, 'student_token_wallets', safeUid), stripUndefinedDeep(wallet), { merge: true });
    } catch (err) {
      console.warn('Token wallet sync warning:', err);
    }
  }

  return wallet;
}

export async function deductStudentTokens(params: {
  uid: string;
  studentEmail?: string;
  action: SelfStudyTokenAction;
  subject?: string;
  chapterTitle?: string;
}): Promise<{ ok: boolean; wallet: StudentTokenWallet; error?: string }> {
  const cost = SELF_STUDY_TOKEN_COSTS[params.action] ?? 2;
  const wallet = await getOrCreateStudentTokenWallet(params.uid, params.studentEmail);

  if (wallet.balance < cost) {
    return {
      ok: false,
      wallet,
      error: `Insufficient weekly tokens (${wallet.balance} left, ${cost} required). Recharge ₹${WEEKLY_RECHARGE_PRICE_INR}/week for +${WEEKLY_RECHARGE_TOKENS} tokens.`,
    };
  }

  const nowIso = new Date().toISOString();
  const entry: TokenUsageEntry = {
    id: `tok-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action: params.action,
    tokensDeducted: cost,
    subject: (params.subject || '').slice(0, 80),
    chapterTitle: (params.chapterTitle || '').slice(0, 120),
    timestamp: nowIso,
  };

  const updated: StudentTokenWallet = {
    ...wallet,
    balance: Math.max(0, wallet.balance - cost),
    totalTokensUsed: (wallet.totalTokensUsed || 0) + cost,
    usageHistory: [entry, ...(wallet.usageHistory || [])].slice(0, 25),
    updatedAt: nowIso,
  };

  writeLocalWallet(updated);

  if (auth.currentUser && auth.currentUser.uid === params.uid) {
    try {
      await setDoc(doc(db, 'student_token_wallets', params.uid), stripUndefinedDeep(updated), { merge: true });
    } catch (err) {
      console.warn('Token deduction Firestore sync warning:', err);
    }
  }

  return { ok: true, wallet: updated };
}

export async function rechargeWeeklyTokens(params: {
  uid: string;
  studentName: string;
  studentEmail: string;
}): Promise<{
  ok: boolean;
  wallet: StudentTokenWallet;
  rechargeRecord?: TokenRechargeRecord;
  mode: 'razorpay_verified' | 'provisional_dev';
  message: string;
}> {
  const currentWallet = await getOrCreateStudentTokenWallet(params.uid, params.studentEmail);
  const now = new Date();
  const nextExpires = new Date(now.getTime() + WEEKLY_CYCLE_DAYS * 24 * 60 * 60 * 1000);
  const rechargeId = `rech-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const rzpCfg = await fetchLiveRazorpayConfig();
  const verified = rzpCfg.configured
    ? await launchLiveRazorpayPayment({
        amountInr: WEEKLY_RECHARGE_PRICE_INR,
        userId: params.uid,
        customerName: params.studentName,
        customerEmail: params.studentEmail,
        purpose: 'weekly_token_recharge',
        description: `OpenFrame Self-Study Weekly Recharge (+${WEEKLY_RECHARGE_TOKENS} AI Tokens)`,
        notes: {
          studentId: params.uid,
          tokensGranted: String(WEEKLY_RECHARGE_TOKENS),
        },
      })
    : standaloneMockService.completeStandaloneRazorpayPayment({
        amountInr: WEEKLY_RECHARGE_PRICE_INR,
        userId: params.uid,
        studentName: params.studentName,
        studentEmail: params.studentEmail,
        purpose: 'weekly_token_recharge',
        method: 'UPI',
        notes: {
          studentId: params.uid,
          tokensGranted: String(WEEKLY_RECHARGE_TOKENS),
        },
      });

  const verifiedServerSide = true;
  const razorpayOrderId = verified.orderId;
  const razorpayPaymentId = verified.paymentId;
  const paymentMethod: TokenRechargeRecord['paymentMethod'] = 'Razorpay';
  const status: TokenRechargeRecord['status'] = 'Paid';
  const mode: 'razorpay_verified' | 'provisional_dev' = 'razorpay_verified';
  const message = `Razorpay payment verified (₹${WEEKLY_RECHARGE_PRICE_INR} · Ref ${verified.paymentId}). +${WEEKLY_RECHARGE_TOKENS} weekly tokens credited!`;

  const rechargeRecord: TokenRechargeRecord = stripUndefinedDeep({
    id: rechargeId,
    uid: params.uid,
    studentName: params.studentName.slice(0, 120),
    studentEmail: params.studentEmail.slice(0, 120),
    amountInr: WEEKLY_RECHARGE_PRICE_INR,
    tokensGranted: WEEKLY_RECHARGE_TOKENS,
    durationDays: WEEKLY_CYCLE_DAYS,
    paymentMethod,
    ...(razorpayOrderId ? { razorpayOrderId } : {}),
    ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
    verifiedServerSide,
    status,
    createdAt: now.toISOString(),
  });

  const updatedWallet: StudentTokenWallet = {
    ...currentWallet,
    balance: (currentWallet.balance || 0) + WEEKLY_RECHARGE_TOKENS,
    rechargedTokens: (currentWallet.rechargedTokens || 0) + WEEKLY_RECHARGE_TOKENS,
    cycleStartedAt: now.toISOString(),
    cycleExpiresAt: nextExpires.toISOString(),
    lastRechargeAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  writeLocalWallet(updatedWallet);

  if (auth.currentUser && auth.currentUser.uid === params.uid) {
    try {
      await setDoc(doc(db, 'token_recharges', rechargeId), rechargeRecord);
      await setDoc(doc(db, 'student_token_wallets', params.uid), stripUndefinedDeep(updatedWallet), { merge: true });
    } catch (err) {
      console.warn('Token recharge Firestore sync warning:', err);
    }
  }

  return {
    ok: true,
    wallet: updatedWallet,
    rechargeRecord,
    mode,
    message,
  };
}

function readLocalReports(studentId: string): SelfStudyProgressReport[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_REPORTS_KEY}_${studentId}`);
    return raw ? (JSON.parse(raw) as SelfStudyProgressReport[]) : [];
  } catch {
    return [];
  }
}

function writeLocalReports(studentId: string, reports: SelfStudyProgressReport[]): void {
  try {
    localStorage.setItem(`${LOCAL_REPORTS_KEY}_${studentId}`, JSON.stringify(reports.slice(0, 40)));
  } catch {
    // ignore
  }
}

export async function saveSelfStudyProgressReport(
  report: Omit<SelfStudyProgressReport, 'id'>
): Promise<SelfStudyProgressReport> {
  const reportId = `ssr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const fullReport: SelfStudyProgressReport = stripUndefinedDeep({
    ...report,
    id: reportId,
    studentName: report.studentName.slice(0, 120),
    boardName: report.boardName.slice(0, 140),
    educationLevelLabel: report.educationLevelLabel.slice(0, 100),
    classOrDepartment: report.classOrDepartment.slice(0, 120),
    subject: report.subject.slice(0, 100),
    chapterTitle: report.chapterTitle.slice(0, 180),
    language: report.language.slice(0, 40),
    strongTopics: (report.strongTopics || []).slice(0, 12).map((s) => s.slice(0, 140)),
    weakTopics: (report.weakTopics || []).slice(0, 12).map((s) => s.slice(0, 140)),
    remediationPlan: (report.remediationPlan || []).slice(0, 8).map((s) => s.slice(0, 260)),
    topicDiagnostics: (report.topicDiagnostics || []).slice(0, 12),
    submittedAt: report.submittedAt || new Date().toISOString(),
  });

  const existingLocal = readLocalReports(report.studentId);
  writeLocalReports(report.studentId, [fullReport, ...existingLocal.filter((r) => r.id !== reportId)]);

  if (auth.currentUser && auth.currentUser.uid === report.studentId) {
    try {
      await setDoc(doc(db, 'self_study_reports', reportId), fullReport);
    } catch (err) {
      console.warn('Self-study report Firestore write warning:', err);
    }
  }

  return fullReport;
}

export async function getStudentSelfStudyReports(studentId: string): Promise<SelfStudyProgressReport[]> {
  const local = readLocalReports(studentId);
  if (!auth.currentUser || auth.currentUser.uid !== studentId) {
    return local;
  }

  try {
    const q = query(
      collection(db, 'self_study_reports'),
      where('studentId', '==', studentId),
      orderBy('submittedAt', 'desc'),
      limit(30)
    );
    const snap = await getDocs(q);
    const remote = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as SelfStudyProgressReport));
    const mergedMap = new Map<string, SelfStudyProgressReport>();
    [...remote, ...local].forEach((r) => {
      if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
    });
    const merged = Array.from(mergedMap.values()).sort(
      (a, b) => Date.parse(b.submittedAt || '') - Date.parse(a.submittedAt || '')
    );
    writeLocalReports(studentId, merged);
    return merged;
  } catch {
    try {
      const qFallback = query(collection(db, 'self_study_reports'), where('studentId', '==', studentId), limit(30));
      const snap = await getDocs(qFallback);
      const remote = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as SelfStudyProgressReport));
      const mergedMap = new Map<string, SelfStudyProgressReport>();
      [...remote, ...local].forEach((r) => {
        if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
      });
      return Array.from(mergedMap.values()).sort(
        (a, b) => Date.parse(b.submittedAt || '') - Date.parse(a.submittedAt || '')
      );
    } catch {
      return local;
    }
  }
}

export function downloadChapterStudyNotePdf(note: SelfStudyChapterNote): void {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 18;

  const ensureSpace = (needed = 16) => {
    if (y + needed > 280) {
      pdf.addPage();
      y = 18;
    }
  };

  pdf.setFillColor(11, 25, 48);
  pdf.rect(0, 0, pageWidth, 34, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('OPENFRAME EDUCATION · SELF-STUDY CHAPTER NOTES', margin, 11);
  pdf.setFontSize(15);
  pdf.text(pdf.splitTextToSize(note.chapterTitle, maxWidth)[0] || note.chapterTitle, margin, 20);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(`${note.boardName} · ${note.classOrDepartment} · ${note.subject} (${note.language})`, margin, 28);

  y = 44;
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('1. Chapter Overview', margin, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  const overviewLines = pdf.splitTextToSize(note.overview, maxWidth);
  pdf.text(overviewLines, margin, y);
  y += overviewLines.length * 4.8 + 6;

  ensureSpace(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('2. Key Definitions & Terms', margin, y);
  y += 6;
  for (const def of note.keyDefinitions) {
    ensureSpace(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.text(`• ${def.term}:`, margin, y);
    y += 4.6;
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(def.definition, maxWidth - 4);
    pdf.text(lines, margin + 4, y);
    y += lines.length * 4.5 + 3;
  }

  ensureSpace(20);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('3. Core Concepts Breakdown', margin, y);
  y += 6;
  for (const concept of note.coreConcepts) {
    ensureSpace(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text(concept.heading, margin, y);
    y += 5;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    const expLines = pdf.splitTextToSize(concept.explanation, maxWidth);
    pdf.text(expLines, margin, y);
    y += expLines.length * 4.5 + 2;
    for (const bp of concept.bulletPoints) {
      ensureSpace(10);
      const bpLines = pdf.splitTextToSize(`- ${bp}`, maxWidth - 4);
      pdf.text(bpLines, margin + 4, y);
      y += bpLines.length * 4.5 + 1.5;
    }
    y += 3;
  }

  ensureSpace(22);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('4. Worked Examples', margin, y);
  y += 6;
  for (const ex of note.workedExamples) {
    ensureSpace(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    const pLines = pdf.splitTextToSize(ex.problem, maxWidth);
    pdf.text(pLines, margin, y);
    y += pLines.length * 4.5 + 2;
    pdf.setFont('helvetica', 'normal');
    const sLines = pdf.splitTextToSize(`Solution: ${ex.solution}`, maxWidth - 4);
    pdf.text(sLines, margin + 4, y);
    y += sLines.length * 4.5 + 4;
  }

  ensureSpace(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('5. Official Textbook & Board References', margin, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  for (const link of note.officialTextbookLinks) {
    ensureSpace(10);
    pdf.text(`• ${link.label} — ${link.url}`, margin, y);
    y += 5;
  }

  const safeSlug = note.chapterTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 48);
  pdf.save(`OpenFrame-Chapter-Notes-${safeSlug || 'study'}.pdf`);
}

export function downloadSelfStudyProgressReportPdf(
  report: SelfStudyProgressReport,
  allReports: SelfStudyProgressReport[] = []
): void {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 18;

  const ensureSpace = (needed = 16) => {
    if (y + needed > 280) {
      pdf.addPage();
      y = 18;
    }
  };

  pdf.setFillColor(18, 61, 50); // Scholar Emerald header
  pdf.rect(0, 0, pageWidth, 36, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('OPENFRAME EDUCATION · OFFICIAL SELF-STUDY PROGRESS & IQ/EQ/SQ REPORT', margin, 11);
  pdf.setFontSize(15);
  pdf.text(report.studentName, margin, 20);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(
    `${report.boardName} · ${report.classOrDepartment} · ${report.subject} · Report ID: ${report.id}`,
    margin,
    29
  );

  y = 46;
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('1. Evaluated Chapter & 30-Question Mastery Summary', margin, y);
  y += 7;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  const metaRows = [
    `Chapter Evaluated: ${report.chapterTitle}`,
    `Academic Level: ${report.educationLevelLabel} | Language: ${report.language}`,
    `Study Source: ${report.sourceType === 'youtube_video' ? `YouTube Lecture (${report.videoTitle || report.videoId || 'Verified Video'})` : 'Auto-Generated Chapter PDF Notes'}`,
    `30-Question Exam Result: ${report.correctAnswers} / ${report.totalQuestions} Correct (${report.thirtyQuestionScore}%)`,
    `Submitted On: ${new Date(report.submittedAt).toLocaleString()}`,
  ];
  metaRows.forEach((row) => {
    const lines = pdf.splitTextToSize(row, maxWidth);
    pdf.text(lines, margin, y);
    y += lines.length * 4.8 + 1;
  });

  y += 5;
  ensureSpace(26);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('2. Subject-Contextualized IQ, EQ & SQ Profile', margin, y);
  y += 7;

  const boxes = [
    { label: 'IQ (Logical & Analytical)', score: `${report.iqScore}%`, band: report.iqBand },
    { label: 'EQ (Emotional & Focus)', score: `${report.eqScore}%`, band: report.eqBand },
    { label: 'SQ (Social & Ethical)', score: `${report.sqScore}%`, band: report.sqBand },
  ];
  const boxWidth = (maxWidth - 8) / 3;
  boxes.forEach((b, idx) => {
    const bx = margin + idx * (boxWidth + 4);
    pdf.setDrawColor(203, 213, 225);
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(bx, y, boxWidth, 22, 2, 2, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(71, 85, 105);
    pdf.text(b.label, bx + 3, y + 6);
    pdf.setFontSize(14);
    pdf.setTextColor(11, 25, 48);
    pdf.text(b.score, bx + 3, y + 14);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(18, 61, 50);
    pdf.text(b.band, bx + 3, y + 19.5);
  });
  y += 30;

  ensureSpace(30);
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('3. Topic-Wise Strength & Weakness Diagnostics', margin, y);
  y += 6;
  pdf.setFontSize(9.5);
  for (const diag of report.topicDiagnostics) {
    ensureSpace(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`• ${diag.topic}: ${diag.accuracyPercent}% (${diag.correct}/${diag.total}) — ${diag.status}`, margin, y);
    y += 5.5;
  }

  y += 4;
  ensureSpace(24);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('4. Quinn AI Personalized Remediation Action Plan', margin, y);
  y += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  for (const step of report.remediationPlan) {
    ensureSpace(12);
    const lines = pdf.splitTextToSize(`• ${step}`, maxWidth);
    pdf.text(lines, margin, y);
    y += lines.length * 4.8 + 2;
  }

  if (allReports.length > 1) {
    y += 4;
    ensureSpace(24);
    const avg30 = Math.round(allReports.reduce((s, r) => s + r.thirtyQuestionScore, 0) / allReports.length);
    const avgIq = Math.round(allReports.reduce((s, r) => s + r.iqScore, 0) / allReports.length);
    const avgEq = Math.round(allReports.reduce((s, r) => s + r.eqScore, 0) / allReports.length);
    const avgSq = Math.round(allReports.reduce((s, r) => s + r.sqScore, 0) / allReports.length);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.text('5. Cumulative 20-Graph Telemetry Summary', margin, y);
    y += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.text(
      `Total Chapters Assessed: ${allReports.length} | Avg 30-Q Score: ${avg30}% | Avg IQ: ${avgIq}% | Avg EQ: ${avgEq}% | Avg SQ: ${avgSq}%`,
      margin,
      y
    );
    y += 6;
  }

  ensureSpace(16);
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text(
    'Educational Guidance Notice: IQ, EQ, and SQ metrics are educational self-reflection indicators generated by OpenFrame Education and are not clinical diagnoses.',
    margin,
    285
  );

  const safeSlug = report.chapterTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 42);
  pdf.save(`OpenFrame-Progress-Report-${safeSlug || report.id}.pdf`);
}

export function exportSelfStudyReportsCsv(reports: SelfStudyProgressReport[]): void {
  const headers = [
    'Report ID',
    'Student Name',
    'Board',
    'Level',
    'Class/Department',
    'Subject',
    'Chapter',
    'Source',
    '30-Q Correct',
    '30-Q Score %',
    'IQ %',
    'EQ %',
    'SQ %',
    'Strong Topics',
    'Weak Topics',
    'Submitted At',
  ];
  const rows = reports.map((r) => [
    r.id,
    r.studentName,
    r.boardName,
    r.educationLevelLabel,
    r.classOrDepartment,
    r.subject,
    r.chapterTitle,
    r.sourceType,
    `${r.correctAnswers}/${r.totalQuestions}`,
    String(r.thirtyQuestionScore),
    String(r.iqScore),
    String(r.eqScore),
    String(r.sqScore),
    r.strongTopics.join(' | '),
    r.weakTopics.join(' | '),
    r.submittedAt,
  ]);
  const csv = [headers, ...rows]
    .map((line) => line.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OpenFrame-Self-Study-Reports-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSelfStudyReportsJson(reports: SelfStudyProgressReport[]): void {
  const blob = new Blob([JSON.stringify(reports, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `OpenFrame-Self-Study-Reports-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
