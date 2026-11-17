import React, { useEffect, useState } from 'react';
import {
  Brain,
  Plus,
  Play,
  Download,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  AssessmentDimension,
  SchoolAssessmentAssignment,
  SchoolInstitution,
  SchoolIqEqSqResult,
  SchoolTenantClass,
  SchoolTenantStudent,
} from '../../types';
import {
  IqEqSqGradeBand,
  NON_CLINICAL_EDUCATIONAL_DISCLAIMER,
} from '../../data/iqEqSqQuestionsData';
import { SchoolAuditActor, schoolPartnerService } from '../../services/schoolPartnerService';

interface SchoolAssessmentsPanelProps {
  institution: SchoolInstitution;
  classes: SchoolTenantClass[];
  students: SchoolTenantStudent[];
  assignments: SchoolAssessmentAssignment[];
  results: SchoolIqEqSqResult[];
  actor: SchoolAuditActor;
  isApproved: boolean;
  onRefresh: () => Promise<void>;
}

export const SchoolAssessmentsPanel: React.FC<SchoolAssessmentsPanelProps> = ({
  institution,
  classes,
  students,
  assignments,
  results,
  actor,
  isApproved,
  onRefresh,
}) => {
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dimension, setDimension] = useState<AssessmentDimension>('IQ');
  const [gradeBand, setGradeBand] = useState<IqEqSqGradeBand>('Middle (6-8)');
  const [targetClassIds, setTargetClassIds] = useState<string[]>([]);
  const [durationMinutes, setDurationMinutes] = useState('20');
  const [allowRetakes, setAllowRetakes] = useState(false);
  const [instructions, setInstructions] = useState(
    'Answer thoughtfully in a calm classroom setting. This is a guided educational reflection.'
  );
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Interactive Runner Modal
  const [runnerAssignment, setRunnerAssignment] = useState<SchoolAssessmentAssignment | null>(null);
  const [runnerStudentId, setRunnerStudentId] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [disclaimerText, setDisclaimerText] = useState(NON_CLINICAL_EDUCATIONAL_DISCLAIMER);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(1200);
  const [submitting, setSubmitting] = useState(false);
  const [latestResult, setLatestResult] = useState<SchoolIqEqSqResult | null>(null);

  useEffect(() => {
    if (!started || latestResult) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [started, latestResult]);

  useEffect(() => {
    if (runnerAssignment && runnerStudentId && started) {
      localStorage.setItem(
        `of_asg_draft_${runnerAssignment.id}_${runnerStudentId}`,
        JSON.stringify(answers)
      );
    }
  }, [answers, runnerAssignment, runnerStudentId, started]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter an assessment title.');
      return;
    }
    setSaving(true);
    setErrorMsg('');
    try {
      const targetLabels =
        targetClassIds.length > 0
          ? classes
              .filter((c) => targetClassIds.includes(c.id))
              .map((c) => `${c.gradeName} - ${c.section}`)
          : ['All Classes'];

      const assignedTeacherUids = Array.from(
        new Set(
          classes
            .filter((c) => targetClassIds.length === 0 || targetClassIds.includes(c.id))
            .flatMap((c) => c.assignedTeacherUids || [])
        )
      );

      await schoolPartnerService.createAssessmentAssignment(
        {
          institutionId: institution.id,
          institutionAdminUid: institution.adminUid,
          assignedTeacherUids,
          title: title.trim(),
          dimension,
          gradeBand,
          targetClassIds,
          targetClassLabels: targetLabels,
          instructions: instructions.trim(),
          durationMinutes: Math.max(5, Number(durationMinutes) || 20),
          allowRetakes,
          scheduledStart: new Date().toISOString().slice(0, 10),
          scheduledEnd: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          status: 'Active',
          createdByUid: actor.uid,
          createdByName: actor.email,
        },
        actor
      );
      setScheduleOpen(false);
      setTitle('');
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to schedule assessment.');
    } finally {
      setSaving(false);
    }
  };

  const openRunner = (asg: SchoolAssessmentAssignment) => {
    setRunnerAssignment(asg);
    setRunnerStudentId(students[0]?.id || '');
    setDisclaimerAccepted(false);
    setStarted(false);
    setQuestions([]);
    setAnswers({});
    setLatestResult(null);
    setErrorMsg('');
    setSecondsLeft((asg.durationMinutes || 20) * 60);
  };

  const handleStartRunner = async () => {
    if (!runnerAssignment || !runnerStudentId) {
      setErrorMsg('Please select a student before launching the evaluation.');
      return;
    }
    if (!disclaimerAccepted) {
      setErrorMsg('Please acknowledge the non-clinical educational notice before starting.');
      return;
    }
    setErrorMsg('');
    try {
      const sheet = await schoolPartnerService.fetchStrippedAssessmentSheet(
        runnerAssignment.dimension,
        runnerAssignment.gradeBand
      );
      setDisclaimerText(sheet.disclaimer);
      setQuestions(sheet.questions);
      const savedRaw = localStorage.getItem(
        `of_asg_draft_${runnerAssignment.id}_${runnerStudentId}`
      );
      if (savedRaw) {
        try {
          setAnswers(JSON.parse(savedRaw));
        } catch {
          setAnswers({});
        }
      }
      setStarted(true);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load assessment questions.');
    }
  };

  const handleSubmitRunner = async () => {
    if (!runnerAssignment || !runnerStudentId) return;
    const student = students.find((s) => s.id === runnerStudentId);
    if (!student) return;

    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await schoolPartnerService.submitAssessmentAttempt({
        institution,
        assignment: runnerAssignment,
        student,
        answers,
        nonClinicalDisclaimerAccepted: disclaimerAccepted,
        existingResults: results,
        actor,
      });
      setLatestResult(res);
      await onRefresh();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-heading font-bold text-[#14213D]">
            IQ / EQ / SQ Educational Assessments
          </h1>
          <p className="text-xs text-[#64748B]">
            Schedule grade-banded cognitive, emotional, and social-values reflections with authoritative server-side scoring and PDF reports.
          </p>
        </div>
        {isApproved && (
          <button
            type="button"
            onClick={() => setScheduleOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Assessment</span>
          </button>
        )}
      </div>

      {/* Mandatory Educational Disclaimer Banner */}
      <div className="bg-[#EFF6FF] border border-blue-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-[#14213D]">
        <AlertCircle className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <p>{NON_CLINICAL_EDUCATIONAL_DISCLAIMER}</p>
      </div>

      {/* Scheduled Assignments */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h2 className="text-base font-heading font-bold text-[#14213D]">
          Scheduled School Assessments ({assignments.length})
        </h2>

        {assignments.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl text-xs text-[#64748B]">
            <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No IQ, EQ, or SQ assessments scheduled yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#2563EB] font-bold">
                    <span>{asg.dimension} · {asg.gradeBand}</span>
                    <span>{asg.durationMinutes} min</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#14213D]">{asg.title}</h3>
                  <p className="text-xs text-[#64748B]">
                    Classes: {asg.targetClassLabels.join(', ')} · Retakes:{' '}
                    {asg.allowRetakes ? 'Allowed' : 'Single Attempt'}
                  </p>
                </div>

                {isApproved && (
                  <button
                    type="button"
                    disabled={students.length === 0}
                    onClick={() => openRunner(asg)}
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-[#14213D] hover:bg-[#0D172B] text-white text-xs font-semibold disabled:opacity-40"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Launch Session for Student</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Results Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <h2 className="text-base font-heading font-bold text-[#14213D]">
          Completed Assessment Results ({results.length})
        </h2>
        {results.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-slate-200 rounded-xl text-xs text-[#64748B]">
            No completed student evaluations yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 pr-3">Student</th>
                  <th className="py-2.5 px-3">Assessment & Dimension</th>
                  <th className="py-2.5 px-3">Score & Band</th>
                  <th className="py-2.5 pl-3 text-right">PDF Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {results.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 pr-3">
                      <div className="font-semibold text-[#14213D]">{r.studentName}</div>
                      <div className="text-[11px] font-mono text-slate-500">
                        {r.studentCode} · {r.className}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{r.assignmentTitle}</div>
                      <div className="text-[11px] text-[#64748B]">{r.dimension} Reflection</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-mono font-bold text-[#2563EB]">{r.scorePercent}%</div>
                      <div className="text-[11px] text-slate-600">{r.bandLabel}</div>
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <button
                        type="button"
                        onClick={() => schoolPartnerService.downloadAssessmentReportPdf(institution, r)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-[#14213D]"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSchedule}
            className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl"
          >
            <h2 className="text-base font-heading font-bold text-[#14213D]">
              Schedule IQ / EQ / SQ Assessment
            </h2>
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Term-1 Logical Aptitude & Reflection"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dimension</label>
                <select
                  value={dimension}
                  onChange={(e) => setDimension(e.target.value as AssessmentDimension)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  <option value="IQ">IQ — Cognitive & Reasoning</option>
                  <option value="EQ">EQ — Emotional Intelligence</option>
                  <option value="SQ">SQ — Social & Ethical Growth</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Grade Band</label>
                <select
                  value={gradeBand}
                  onChange={(e) => setGradeBand(e.target.value as IqEqSqGradeBand)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                >
                  <option value="Primary (1-5)">Primary (1-5)</option>
                  <option value="Middle (6-8)">Middle (6-8)</option>
                  <option value="Secondary (9-12)">Secondary (9-12)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowRetakes}
                    onChange={(e) => setAllowRetakes(e.target.checked)}
                  />
                  <span>Allow multiple retakes</span>
                </label>
              </div>
            </div>
            {classes.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Target Classes (leave unchecked for All Classes)
                </label>
                <div className="flex flex-wrap gap-2">
                  {classes.map((c) => {
                    const checked = targetClassIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs cursor-pointer ${
                          checked ? 'border-[#2563EB] bg-[#EFF6FF] font-semibold' : 'border-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mr-1.5"
                          checked={checked}
                          onChange={() =>
                            setTargetClassIds((prev) =>
                              prev.includes(c.id) ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                            )
                          }
                        />
                        {c.gradeName}-{c.section}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setScheduleOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
              >
                {saving ? 'Scheduling...' : 'Save Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Interactive Assessment Runner Modal */}
      {runnerAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="text-[11px] font-mono font-bold text-[#2563EB]">
                  {runnerAssignment.dimension} ASSESSMENT · {runnerAssignment.gradeBand}
                </div>
                <h2 className="text-base font-heading font-bold text-[#14213D]">
                  {runnerAssignment.title}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {started && !latestResult && (
                  <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#14213D] bg-slate-100 px-3 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-[#2563EB]" />
                    {formatTimer(secondsLeft)}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setRunnerAssignment(null)}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}

            {latestResult ? (
              <div className="space-y-4">
                <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Evaluation Scored & Saved</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#14213D]">
                    {latestResult.scorePercent}% — {latestResult.bandLabel}
                  </div>
                  <p className="text-xs text-slate-700">{latestResult.educationalSummary}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(latestResult.subScores || {}).map(([domain, val]) => (
                    <div key={domain} className="border border-slate-200 rounded-xl p-3 flex justify-between text-xs">
                      <span className="font-medium text-slate-700">{domain}</span>
                      <span className="font-mono font-bold text-[#2563EB]">{val}%</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      schoolPartnerService.downloadAssessmentReportPdf(institution, latestResult)
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#14213D] text-white text-xs font-semibold"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Report</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRunnerAssignment(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : !started ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Select Student Taking Assessment *
                  </label>
                  <select
                    value={runnerStudentId}
                    onChange={(e) => setRunnerStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  >
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.studentCode} · {s.className}-{s.section})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="border border-blue-200 bg-[#EFF6FF] rounded-xl p-4 space-y-2 text-xs text-[#14213D]">
                  <div className="font-bold">Mandatory Educational Notice</div>
                  <p>{disclaimerText}</p>
                  <label className="flex items-start gap-2 pt-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={disclaimerAccepted}
                      onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                      className="mt-0.5"
                    />
                    <span>
                      I understand this assessment is an educational guidance tool only (not a clinical or medical diagnosis).
                    </span>
                  </label>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRunnerAssignment(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleStartRunner()}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
                  >
                    Start Evaluation
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {questions.map((q, idx) => (
                  <div key={q.id} className="border border-slate-200 rounded-xl p-4 space-y-2.5">
                    <div className="text-[11px] font-mono text-[#2563EB] font-semibold">
                      Question {idx + 1} · {q.domain}
                    </div>
                    <div className="text-xs font-semibold text-[#14213D]">{q.prompt}</div>
                    <div className="space-y-1.5">
                      {(q.options || []).map((opt: string, optIdx: number) => {
                        const selected = answers[q.id] === optIdx;
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs cursor-pointer ${
                              selected
                                ? 'border-[#2563EB] bg-[#EFF6FF] font-semibold text-[#14213D]'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${q.id}`}
                              checked={selected}
                              onChange={() =>
                                setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                              }
                            />
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-xs text-[#64748B]">
                    Answered {Object.keys(answers).length} of {questions.length}
                  </span>
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleSubmitRunner()}
                    className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold disabled:opacity-50"
                  >
                    {submitting ? 'Evaluating...' : 'Submit Responses'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
