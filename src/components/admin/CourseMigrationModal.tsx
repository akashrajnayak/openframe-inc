import React, { useState, useEffect, useRef } from 'react';
import {
  Database,
  Play,
  Pause,
  RotateCcw,
  Square,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Server,
  Layers,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import {
  courseMigrationService,
  MigrationProgress,
  MigrationLogEntry,
  CourseFirestoreRecord,
  TOTAL_TARGET_COURSES
} from '../../services/courseMigrationService';

interface CourseMigrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMigrationComplete?: (totalSeeded: number) => void;
}

export const CourseMigrationModal: React.FC<CourseMigrationModalProps> = ({
  isOpen,
  onClose,
  onMigrationComplete
}) => {
  // Migration configuration
  const [startIndex, setStartIndex] = useState<number>(1);
  const [endIndex, setEndIndex] = useState<number>(TOTAL_TARGET_COURSES);
  const [batchSize, setBatchSize] = useState<number>(200);
  const [throttleDelayMs, setThrottleDelayMs] = useState<number>(100);
  const [isDryRun, setIsDryRun] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showSchemaPreview, setShowSchemaPreview] = useState<boolean>(false);

  // Live state
  const [progress, setProgress] = useState<MigrationProgress>({
    isRunning: false,
    isPaused: false,
    isCompleted: false,
    startIndex: 1,
    endIndex: TOTAL_TARGET_COURSES,
    currentIndex: 0,
    totalToSeed: TOTAL_TARGET_COURSES,
    seededCount: 0,
    failedCount: 0,
    currentBatch: 0,
    totalBatches: 0,
    percent: 0,
    speedPerSecond: 0,
    estimatedTimeRemainingSec: 0,
    lastSeededId: '',
    lastBatchTimestamp: ''
  });

  const [logs, setLogs] = useState<MigrationLogEntry[]>([]);
  const [liveFirestoreCount, setLiveFirestoreCount] = useState<number | null>(null);
  const [isCheckingCount, setIsCheckingCount] = useState<boolean>(false);
  const [sampleCourse, setSampleCourse] = useState<CourseFirestoreRecord | null>(null);
  const [copiedLog, setCopiedLog] = useState<boolean>(false);
  const [confirmCancel, setConfirmCancel] = useState<boolean>(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Subscribe to service events
  useEffect(() => {
    if (!isOpen) return;

    const unsubProgress = courseMigrationService.subscribeProgress((p) => {
      setProgress(p);
      if (p.isCompleted && onMigrationComplete) {
        onMigrationComplete(p.seededCount);
      }
    });

    const unsubLogs = courseMigrationService.subscribeLogs((log) => {
      setLogs((prev) => [...prev.slice(-300), log]); // keep last 300 logs
    });

    // Check for saved checkpoint
    const saved = courseMigrationService.getSavedCheckpoint();
    if (saved && saved.lastIndex < TOTAL_TARGET_COURSES && !progress.isRunning) {
      setStartIndex(saved.lastIndex + 1);
    }

    // Generate a sample document for preview
    setSampleCourse(courseMigrationService.generateCourseDocument(1));

    // Check current Firestore count on open
    fetchFirestoreCount();

    return () => {
      unsubProgress();
      unsubLogs();
    };
  }, [isOpen]);

  // Autoscroll terminal
  useEffect(() => {
    if (autoScroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const fetchFirestoreCount = async () => {
    setIsCheckingCount(true);
    try {
      const count = await courseMigrationService.getFirestoreCourseCount();
      setLiveFirestoreCount(count);
    } catch (err) {
      console.warn('Error fetching Firestore course count:', err);
    } finally {
      setIsCheckingCount(false);
    }
  };

  const handleStart = async () => {
    try {
      await courseMigrationService.runMigration({
        startIndex,
        endIndex,
        batchSize,
        throttleDelayMs,
        dryRun: isDryRun
      });
      fetchFirestoreCount();
    } catch (err) {
      console.error('Migration failed to start:', err);
    }
  };

  const handlePause = () => {
    courseMigrationService.pause();
  };

  const handleResume = () => {
    courseMigrationService.resume();
  };

  const handleCancel = () => {
    courseMigrationService.cancel();
    setConfirmCancel(false);
    fetchFirestoreCount();
  };

  const handlePreset = (preset: 'initial100' | 'first1000' | 'full15000') => {
    if (progress.isRunning) return;
    if (preset === 'initial100') {
      setStartIndex(1);
      setEndIndex(100);
      setBatchSize(50);
    } else if (preset === 'first1000') {
      setStartIndex(1);
      setEndIndex(1000);
      setBatchSize(200);
    } else if (preset === 'full15000') {
      setStartIndex(1);
      setEndIndex(TOTAL_TARGET_COURSES);
      setBatchSize(250);
    }
  };

  const handleCopyLogs = () => {
    const text = logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLog(true);
    setTimeout(() => setCopiedLog(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#0A192F] text-white flex items-center justify-between border-b border-blue-900/60 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-lg text-white">
                  Firestore 15,000-Course Data Migration Utility
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Target: 15,000 Records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Systematic batch-seeding into Firestore collection <code className="text-cyan-300 font-mono">/courses/&#123;id&#125;</code> with atomic transactions & schema validation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchFirestoreCount}
              disabled={isCheckingCount}
              className="px-3 py-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-900 border border-blue-700/50 text-xs font-semibold text-sky-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Query live document count in Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingCount ? 'animate-spin' : ''}`} />
              <span>
                Live in DB: {liveFirestoreCount !== null ? liveFirestoreCount.toLocaleString() : 'Check'}
              </span>
            </button>

            <button
              onClick={onClose}
              disabled={progress.isRunning}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-sm">
          {/* Quick Presets & Control Bar */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Step 1: Choose Migration Scope & Scope Presets
                </span>
                <span className="text-xs text-slate-600">
                  Select a predefined range or configure custom start and end course numbers.
                </span>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={progress.isRunning}
                  onClick={() => handlePreset('initial100')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-600 transition-all cursor-pointer disabled:opacity-50"
                >
                  Initial AI Batch (1–100)
                </button>
                <button
                  type="button"
                  disabled={progress.isRunning}
                  onClick={() => handlePreset('first1000')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-blue-50 border border-slate-300 hover:border-blue-400 text-slate-700 hover:text-blue-600 transition-all cursor-pointer disabled:opacity-50"
                >
                  First 1,000 Courses
                </button>
                <button
                  type="button"
                  disabled={progress.isRunning}
                  onClick={() => handlePreset('full15000')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  Full 15,000 Catalog
                </button>
              </div>
            </div>

            {/* Range Inputs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Start Course #</label>
                <input
                  type="number"
                  min={1}
                  max={TOTAL_TARGET_COURSES}
                  value={startIndex}
                  disabled={progress.isRunning}
                  onChange={(e) => setStartIndex(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">End Course #</label>
                <input
                  type="number"
                  min={1}
                  max={TOTAL_TARGET_COURSES}
                  value={endIndex}
                  disabled={progress.isRunning}
                  onChange={(e) => setEndIndex(Math.min(TOTAL_TARGET_COURSES, parseInt(e.target.value) || TOTAL_TARGET_COURSES))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Batch Size</label>
                <select
                  value={batchSize}
                  disabled={progress.isRunning}
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value={50}>50 per batch (Safe)</option>
                  <option value={100}>100 per batch (Balanced)</option>
                  <option value={200}>200 per batch (Fast)</option>
                  <option value={250}>250 per batch (High Throughput)</option>
                  <option value={500}>500 per batch (Max Firestore limit)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Pacing Throttle</label>
                <select
                  value={throttleDelayMs}
                  disabled={progress.isRunning}
                  onChange={(e) => setThrottleDelayMs(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value={0}>0ms (Immediate)</option>
                  <option value={50}>50ms delay</option>
                  <option value={100}>100ms delay</option>
                  <option value={250}>250ms delay</option>
                  <option value={500}>500ms delay (Quota Protection)</option>
                </select>
              </div>
            </div>

            {/* Dry run checkbox & Toggle details */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isDryRun}
                  disabled={progress.isRunning}
                  onChange={(e) => setIsDryRun(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Dry-Run Mode (Simulate payload generation without writing to Firestore)
                </span>
              </label>

              <button
                type="button"
                onClick={() => setShowSchemaPreview(!showSchemaPreview)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{showSchemaPreview ? 'Hide Course Schema Preview' : 'Preview Sample Course Record'}</span>
              </button>
            </div>

            {/* Schema preview collapsible */}
            {showSchemaPreview && sampleCourse && (
              <div className="mt-3 p-4 bg-slate-900 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto max-h-56 border border-slate-800">
                <div className="flex items-center justify-between mb-2 text-cyan-400 font-bold">
                  <span>Sample Generated Document ({sampleCourse.id})</span>
                  <span className="text-slate-400 font-sans text-xs">Schema: CourseFirestoreRecord</span>
                </div>
                <pre>{JSON.stringify(sampleCourse, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Action Trigger Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {!progress.isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>
                  {isDryRun ? 'Run Dry-Run Simulation' : `Start Migration (${(endIndex - startIndex + 1).toLocaleString()} Courses)`}
                </span>
              </button>
            ) : (
              <>
                {!progress.isPaused ? (
                  <button
                    type="button"
                    onClick={handlePause}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-white" />
                    <span>Pause</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleResume}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Resume</span>
                  </button>
                )}

                {confirmCancel ? (
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-3 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                    >
                      Confirm Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmCancel(false)}
                      className="px-4 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-all cursor-pointer"
                    >
                      Keep Running
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Square className="w-4 h-4 fill-white" />
                    <span>Cancel</span>
                  </button>
                )}
              </>
            )}

            {progress.isCompleted && (
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Migration Completed: {progress.seededCount.toLocaleString()} courses seeded!</span>
              </div>
            )}
          </div>

          {/* Real-time Telemetry Dashboard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Real-time Execution Telemetry
                </span>
              </div>

              <div className="text-xs font-mono text-slate-500">
                {progress.isRunning
                  ? progress.isPaused
                    ? 'State: PAUSED'
                    : 'State: WRITING TO FIRESTORE...'
                  : progress.isCompleted
                  ? 'State: COMPLETED'
                  : 'State: IDLE / READY'}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Progress: {progress.seededCount.toLocaleString()} / {progress.totalToSeed.toLocaleString()} courses
                </span>
                <span className="font-bold text-blue-600">{progress.percent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Batch Status</span>
                <span className="text-base font-extrabold text-slate-800 mt-0.5 block">
                  {progress.currentBatch} / {progress.totalBatches}
                </span>
                <span className="text-[10px] text-slate-500">Batches Committed</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Throughput</span>
                <span className="text-base font-extrabold text-blue-600 mt-0.5 block">
                  {progress.speedPerSecond} docs/s
                </span>
                <span className="text-[10px] text-slate-500">Average Write Rate</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Est. Time Remaining</span>
                <span className="text-base font-extrabold text-slate-800 mt-0.5 block">
                  {progress.estimatedTimeRemainingSec > 0
                    ? `${Math.floor(progress.estimatedTimeRemainingSec / 60)}m ${progress.estimatedTimeRemainingSec % 60}s`
                    : '--'}
                </span>
                <span className="text-[10px] text-slate-500">ETA to Completion</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Last Seeded Record</span>
                <span className="text-base font-extrabold font-mono text-cyan-700 mt-0.5 block truncate">
                  {progress.lastSeededId || '--'}
                </span>
                <span className="text-[10px] text-slate-500">Unique Document ID</span>
              </div>
            </div>
          </div>

          {/* Live Execution Logs Console */}
          <div className="bg-[#071326] rounded-2xl border border-blue-950 overflow-hidden shadow-inner flex flex-col">
            <div className="px-4 py-2.5 bg-[#0B1E3F] border-b border-blue-900/40 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-white">Migration Terminal Stream</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-950 text-blue-400 border border-blue-800">
                  {logs.length} logs
                </span>
              </div>

              <div className="flex items-center space-x-3 text-[11px]">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-500"
                  />
                  <span>Auto-scroll</span>
                </label>

                <button
                  type="button"
                  onClick={handleCopyLogs}
                  className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedLog ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedLog ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLogs([])}
                  className="hover:text-rose-400 transition-colors cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-4 font-mono text-[11px] h-56 overflow-y-auto space-y-1.5 text-slate-300 select-text">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic py-6 text-center">
                  Ready. Click "Start Migration" or choose a scope preset above to begin systematically seeding records into Firestore.
                </div>
              ) : (
                logs.map((log) => {
                  let color = 'text-slate-300';
                  if (log.type === 'success') color = 'text-emerald-400';
                  else if (log.type === 'warn') color = 'text-amber-400';
                  else if (log.type === 'error') color = 'text-rose-400';
                  else if (log.type === 'info') color = 'text-sky-300';

                  return (
                    <div key={log.id} className="leading-relaxed flex items-start gap-2">
                      <span className="text-slate-500 shrink-0 select-none">[{log.timestamp}]</span>
                      <span className={`shrink-0 font-bold uppercase text-[9px] px-1 py-0.2 rounded ${
                        log.type === 'success' ? 'bg-emerald-950 text-emerald-300' :
                        log.type === 'error' ? 'bg-rose-950 text-rose-300' :
                        log.type === 'warn' ? 'bg-amber-950 text-amber-300' : 'bg-blue-950 text-sky-300'
                      }`}>
                        {log.type}
                      </span>
                      <span className={color}>{log.message}</span>
                    </div>
                  );
                })
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>
              All 15,000 course records are seeded with unique IDs (<code className="font-mono text-slate-700">OF-CRS-00001</code> to <code className="font-mono text-slate-700">OF-CRS-15000</code>), 8 modules, capstones, and pricing tier metadata.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={progress.isRunning}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
