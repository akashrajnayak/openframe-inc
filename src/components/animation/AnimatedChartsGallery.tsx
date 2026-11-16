import React, { useState, useEffect, useMemo } from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  Layers,
  Shuffle
} from 'lucide-react';

type EasingPreset = 'spring' | 'cubic' | 'elastic' | 'linear';
type DatasetPreset = 'edtech' | 'telemetry' | 'markets';

interface ChartDataset {
  label: string;
  lineA: number[];
  lineB: number[];
  months: string[];
  bars: { label: string; primary: number; secondary: number }[];
  donut: { label: string; value: number; color: string }[];
  rings: { label: string; pct: number; color: string }[];
  radar: { axis: string; v1: number; v2: number }[];
  scatter: { x: number; y: number; r: number; label: string; color: string }[];
  candles: { label: string; o: number; h: number; l: number; c: number }[];
  funnel: { stage: string; count: number; color: string }[];
  treemap: { name: string; value: number; color: string }[];
}

const DATASETS: Record<DatasetPreset, ChartDataset> = {
  edtech: {
    label: 'EdTech Growth',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    lineA: [28, 42, 39, 58, 66, 74, 86, 94],
    lineB: [18, 25, 34, 41, 49, 57, 63, 72],
    bars: [
      { label: 'SwiftUI', primary: 88, secondary: 62 },
      { label: 'Charts', primary: 76, secondary: 54 },
      { label: 'AI Lab', primary: 92, secondary: 70 },
      { label: 'Motion', primary: 68, secondary: 48 },
      { label: 'STEM', primary: 81, secondary: 59 },
      { label: 'UIKit', primary: 64, secondary: 44 },
    ],
    donut: [
      { label: 'Animations', value: 34, color: '#0284C7' },
      { label: 'Charts', value: 28, color: '#059669' },
      { label: 'Gestures', value: 21, color: '#4F46E5' },
      { label: 'Physics', value: 17, color: '#D97706' },
    ],
    rings: [
      { label: 'Course Completion', pct: 88, color: '#0284C7' },
      { label: '60fps Frame Budget', pct: 95, color: '#059669' },
      { label: 'Lab Exercises', pct: 74, color: '#6366F1' },
    ],
    radar: [
      { axis: 'Fluidity', v1: 92, v2: 76 },
      { axis: 'Clarity', v1: 86, v2: 81 },
      { axis: 'Speed', v1: 95, v2: 68 },
      { axis: 'A11y', v1: 88, v2: 74 },
      { axis: 'Depth', v1: 84, v2: 65 },
      { axis: 'Touch', v1: 91, v2: 79 },
    ],
    scatter: [
      { x: 18, y: 34, r: 9, label: 'Paper Switch', color: '#0284C7' },
      { x: 35, y: 62, r: 13, label: 'Folding Cell', color: '#059669' },
      { x: 48, y: 45, r: 10, label: 'Fluid Slider', color: '#6366F1' },
      { x: 64, y: 78, r: 15, label: 'Circular Carousel', color: '#0284C7' },
      { x: 78, y: 58, r: 11, label: 'Circle Menu', color: '#D97706' },
      { x: 86, y: 88, r: 14, label: 'Garland View', color: '#059669' },
    ],
    candles: [
      { label: 'W1', o: 42, h: 55, l: 38, c: 51 },
      { label: 'W2', o: 51, h: 61, l: 47, c: 49 },
      { label: 'W3', o: 49, h: 68, l: 46, c: 65 },
      { label: 'W4', o: 65, h: 74, l: 60, c: 71 },
      { label: 'W5', o: 71, h: 76, l: 62, c: 64 },
      { label: 'W6', o: 64, h: 83, l: 63, c: 80 },
      { label: 'W7', o: 80, h: 91, l: 77, c: 88 },
    ],
    funnel: [
      { stage: 'Visited Studio', count: 10000, color: '#0284C7' },
      { stage: 'Played Demos', count: 7400, color: '#0EA5E9' },
      { stage: 'Downloaded ZIP', count: 5200, color: '#10B981' },
      { stage: 'Built Project', count: 3400, color: '#4F46E5' },
      { stage: 'Certified', count: 2150, color: '#0F172A' },
    ],
    treemap: [
      { name: 'Carousels', value: 32, color: '#0284C7' },
      { name: 'Charts', value: 26, color: '#059669' },
      { name: 'Navigation', value: 18, color: '#4F46E5' },
      { name: 'Controls', value: 14, color: '#0EA5E9' },
      { name: 'Physics', value: 10, color: '#D97706' },
    ],
  },
  telemetry: {
    label: 'App Telemetry',
    months: ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h'],
    lineA: [45, 38, 52, 79, 91, 84, 96, 89],
    lineB: [22, 19, 31, 55, 62, 58, 71, 64],
    bars: [
      { label: 'CPU', primary: 42, secondary: 28 },
      { label: 'GPU', primary: 68, secondary: 49 },
      { label: 'Metal', primary: 85, secondary: 61 },
      { label: 'RAM', primary: 53, secondary: 37 },
      { label: 'FPS', primary: 98, secondary: 88 },
      { label: 'Net', primary: 61, secondary: 41 },
    ],
    donut: [
      { label: 'Render', value: 42, color: '#0284C7' },
      { label: 'Layout', value: 24, color: '#6366F1' },
      { label: 'Compositor', value: 22, color: '#059669' },
      { label: 'Idle', value: 12, color: '#64748B' },
    ],
    rings: [
      { label: 'GPU Efficiency', pct: 94, color: '#059669' },
      { label: 'Cache Hit Rate', pct: 86, color: '#0284C7' },
      { label: 'Frame Stability', pct: 98, color: '#4F46E5' },
    ],
    radar: [
      { axis: 'Latency', v1: 94, v2: 70 },
      { axis: 'Throughput', v1: 89, v2: 75 },
      { axis: 'Memory', v1: 81, v2: 85 },
      { axis: 'Battery', v1: 90, v2: 64 },
      { axis: 'Thermal', v1: 87, v2: 72 },
      { axis: 'Uptime', v1: 99, v2: 88 },
    ],
    scatter: [
      { x: 15, y: 82, r: 10, label: 'Idle Frame', color: '#059669' },
      { x: 28, y: 74, r: 12, label: 'Tab Switch', color: '#0284C7' },
      { x: 46, y: 69, r: 14, label: 'List Scroll', color: '#6366F1' },
      { x: 61, y: 58, r: 11, label: '3D Fold', color: '#D97706' },
      { x: 77, y: 84, r: 13, label: 'Chart Draw', color: '#0284C7' },
      { x: 89, y: 92, r: 9, label: 'GPU Offload', color: '#059669' },
    ],
    candles: [
      { label: 'T1', o: 58, h: 66, l: 52, c: 64 },
      { label: 'T2', o: 64, h: 72, l: 59, c: 61 },
      { label: 'T3', o: 61, h: 79, l: 58, c: 76 },
      { label: 'T4', o: 76, h: 84, l: 70, c: 73 },
      { label: 'T5', o: 73, h: 88, l: 71, c: 86 },
      { label: 'T6', o: 86, h: 95, l: 82, c: 92 },
      { label: 'T7', o: 92, h: 97, l: 85, c: 89 },
    ],
    funnel: [
      { stage: 'App Launch', count: 12000, color: '#0F172A' },
      { stage: 'Home Feed', count: 10800, color: '#0284C7' },
      { stage: 'Chart View', count: 8200, color: '#0EA5E9' },
      { stage: 'Filter Action', count: 5900, color: '#059669' },
      { stage: 'Export Report', count: 3100, color: '#4F46E5' },
    ],
    treemap: [
      { name: 'Metal Shaders', value: 36, color: '#0F172A' },
      { name: 'CoreAnim', value: 24, color: '#0284C7' },
      { name: 'SwiftCharts', value: 19, color: '#059669' },
      { name: 'Layout', value: 12, color: '#4F46E5' },
      { name: 'Audio/Haptic', value: 9, color: '#D97706' },
    ],
  },
  markets: {
    label: 'Financial Markets',
    months: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8'],
    lineA: [52, 64, 59, 73, 82, 77, 91, 98],
    lineB: [48, 51, 56, 61, 68, 72, 79, 85],
    bars: [
      { label: 'EQ', primary: 84, secondary: 52 },
      { label: 'FI', primary: 62, secondary: 49 },
      { label: 'FX', primary: 75, secondary: 63 },
      { label: 'CMD', primary: 58, secondary: 39 },
      { label: 'ETF', primary: 91, secondary: 72 },
      { label: 'OPT', primary: 79, secondary: 55 },
    ],
    donut: [
      { label: 'Equities', value: 40, color: '#059669' },
      { label: 'Bonds', value: 25, color: '#0284C7' },
      { label: 'Index ETF', value: 22, color: '#4F46E5' },
      { label: 'Cash', value: 13, color: '#D97706' },
    ],
    rings: [
      { label: 'Target Yield', pct: 82, color: '#059669' },
      { label: 'Risk Hedge', pct: 76, color: '#0284C7' },
      { label: 'Liquidity', pct: 91, color: '#D97706' },
    ],
    radar: [
      { axis: 'Alpha', v1: 88, v2: 66 },
      { axis: 'Sharpe', v1: 91, v2: 74 },
      { axis: 'Liquidity', v1: 94, v2: 81 },
      { axis: 'Low Vol', v1: 79, v2: 84 },
      { axis: 'Growth', v1: 93, v2: 70 },
      { axis: 'Yield', v1: 82, v2: 77 },
    ],
    scatter: [
      { x: 20, y: 40, r: 10, label: 'Treasury', color: '#0284C7' },
      { x: 38, y: 58, r: 12, label: 'Muni Bond', color: '#059669' },
      { x: 52, y: 69, r: 14, label: 'Index Fund', color: '#4F46E5' },
      { x: 68, y: 81, r: 15, label: 'Tech Growth', color: '#059669' },
      { x: 82, y: 74, r: 11, label: 'Emerging', color: '#D97706' },
      { x: 90, y: 92, r: 13, label: 'AI Leaders', color: '#0284C7' },
    ],
    candles: [
      { label: 'Mon', o: 46, h: 59, l: 42, c: 56 },
      { label: 'Tue', o: 56, h: 63, l: 50, c: 52 },
      { label: 'Wed', o: 52, h: 69, l: 51, c: 67 },
      { label: 'Thu', o: 67, h: 78, l: 64, c: 75 },
      { label: 'Fri', o: 75, h: 80, l: 68, c: 70 },
      { label: 'Sat', o: 70, h: 86, l: 69, c: 84 },
      { label: 'Sun', o: 84, h: 94, l: 81, c: 91 },
    ],
    funnel: [
      { stage: 'Screeners', count: 5000, color: '#0F172A' },
      { stage: 'Watchlist', count: 3400, color: '#0284C7' },
      { stage: 'Backtested', count: 1900, color: '#0EA5E9' },
      { stage: 'Allocated', count: 920, color: '#059669' },
      { stage: 'Rebalanced', count: 640, color: '#4F46E5' },
    ],
    treemap: [
      { name: 'Large Cap', value: 38, color: '#059669' },
      { name: 'Fixed Inc', value: 24, color: '#0284C7' },
      { name: 'Global ETF', value: 18, color: '#4F46E5' },
      { name: 'Small Cap', value: 12, color: '#0EA5E9' },
      { name: 'Commodities', value: 8, color: '#D97706' },
    ],
  },
};

function applyEasing(t: number, preset: EasingPreset): number {
  const c = Math.max(0, Math.min(1, t));
  if (preset === 'linear') return c;
  if (preset === 'cubic') return 1 - Math.pow(1 - c, 3);
  if (preset === 'elastic') {
    if (c === 0 || c === 1) return c;
    return Math.pow(2, -10 * c) * Math.sin((c * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
  }
  // spring (slight crisp overshoot settling cleanly)
  const w = 1 - Math.exp(-6.5 * c) * Math.cos(9 * c);
  return Math.max(0, Math.min(1.08, w));
}

export const AnimatedChartsGallery: React.FC = () => {
  const [datasetKey, setDatasetKey] = useState<DatasetPreset>('edtech');
  const [easing, setEasing] = useState<EasingPreset>('spring');
  const [rawProgress, setRawProgress] = useState(0);
  const [replaySeed, setReplaySeed] = useState(1);
  const [liveStream, setLiveStream] = useState(true);
  const [wavePhase, setWavePhase] = useState(0);
  const [waveFreq, setWaveFreq] = useState(2.2);
  const [barMode, setBarMode] = useState<'grouped' | 'stacked'>('grouped');
  const [activeDonutIdx, setActiveDonutIdx] = useState<number>(0);
  const [hoveredTip, setHoveredTip] = useState<string | null>(null);
  const [jitterOffset, setJitterOffset] = useState(0);

  const data = DATASETS[datasetKey];

  // Animate 0 -> 1 on mount, dataset change, easing change, or replay click
  useEffect(() => {
    let start: number | null = null;
    let rafId = 0;
    const duration = 950;
    setRawProgress(0);

    const step = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const t = Math.min(1, elapsed / duration);
      setRawProgress(t);
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [replaySeed, datasetKey, easing]);

  // Continuous waveform animation when liveStream is enabled
  useEffect(() => {
    if (!liveStream) return;
    let rafId = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setWavePhase((p) => (p + dt * 3.2) % (Math.PI * 200));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [liveStream]);

  const anim = applyEasing(rawProgress, easing);
  const clampedAnim = Math.max(0, Math.min(1, anim));

  const heatmapCells = useMemo(() => {
    const rows = 7;
    const cols = 12;
    const out: { r: number; c: number; val: number }[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const seed = Math.abs(Math.sin((r + 1) * 3.1 + (c + 1) * 1.7 + jitterOffset + (datasetKey === 'telemetry' ? 2 : datasetKey === 'markets' ? 4 : 0)));
        out.push({ r, c, val: Math.round(seed * 100) });
      }
    }
    return out;
  }, [datasetKey, jitterOffset]);

  // Helper to build smooth SVG path
  const buildPolyline = (values: number[], width: number, height: number, padX = 24, padY = 18) => {
    const usableW = width - padX * 2;
    const usableH = height - padY * 2;
    return values
      .map((v, idx) => {
        const x = padX + (idx / Math.max(1, values.length - 1)) * usableW;
        const valScaled = Math.max(0, Math.min(100, (v + jitterOffset * (idx % 2 === 0 ? 4 : -4)) * anim));
        const y = padY + usableH - (valScaled / 100) * usableH;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  return (
    <section id="charts-gallery" className="space-y-6">
      {/* Control Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Interactive Data Visualization Suite (12 Chart Types)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            All Types of Animated Graphs &amp; Charts
          </h2>
          <p className="text-xs text-slate-600">
            Every chart renders with real-time timing curves. Switch datasets, change easing physics, or replay animations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Dataset Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            {(['edtech', 'telemetry', 'markets'] as DatasetPreset[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setDatasetKey(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  datasetKey === key
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {DATASETS[key].label}
              </button>
            ))}
          </div>

          {/* Easing Curve Selector */}
          <select
            aria-label="Animation easing curve"
            value={easing}
            onChange={(e) => setEasing(e.target.value as EasingPreset)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="spring">Physics: Spring Overshoot</option>
            <option value="cubic">Curve: Cubic Ease-Out</option>
            <option value="elastic">Curve: Elastic Bounce</option>
            <option value="linear">Curve: Linear 1:1</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setJitterOffset((j) => (j === 0 ? 1.5 : 0));
              setReplaySeed((s) => s + 1);
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Shuffle className="w-3.5 h-3.5 text-blue-600" />
            <span>Randomize</span>
          </button>

          <button
            type="button"
            onClick={() => setReplaySeed((s) => s + 1)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay All</span>
          </button>
        </div>
      </div>

      {/* Live Tooltip Strip */}
      <div className="bg-slate-900 text-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs border border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-medium text-slate-300">
            {hoveredTip || 'Hover or click any chart element below to inspect live coordinates and values.'}
          </span>
        </div>
        <span className="font-mono tabular-nums text-[11px] text-cyan-300 whitespace-nowrap shrink-0">
          Easing: {easing.toUpperCase()} · Progress {(clampedAnim * 100).toFixed(0)}%
        </span>
      </div>

      {/* 12-CHART GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* 1. Multi-Series Animated Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500">01 · Time Series</span>
              <h3 className="text-base font-bold text-slate-900">Multi-Series Line Chart</h3>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-sky-600 inline-block" />Primary</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-emerald-600 inline-block" />Baseline</span>
            </div>
          </div>
          <svg viewBox="0 0 320 170" className="w-full h-44 overflow-visible">
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1="24" x2="296" y1={18 + (1 - g) * 134} y2={18 + (1 - g) * 134} stroke="#E2E8F0" strokeDasharray="3 3" />
            ))}
            <path d={buildPolyline(data.lineB, 320, 170)} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={buildPolyline(data.lineA, 320, 170)} fill="none" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {data.lineA.map((v, idx) => {
              const x = 24 + (idx / (data.lineA.length - 1)) * 272;
              const val = Math.max(0, Math.min(100, (v + jitterOffset * (idx % 2 === 0 ? 4 : -4)) * anim));
              const y = 18 + 134 - (val / 100) * 134;
              return (
                <g key={idx}>
                  <circle
                    cx={x}
                    cy={y}
                    r="4.5"
                    fill="#ffffff"
                    stroke="#0284C7"
                    strokeWidth="2.5"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredTip(`Line Chart (${data.months[idx]}): Primary ${v} · Baseline ${data.lineB[idx]}`)}
                  />
                  <text x={x} y="166" textAnchor="middle" className="fill-slate-400 text-[9px] font-mono">
                    {data.months[idx]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 2. Stacked Gradient Area Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500">02 · Volume Flow</span>
              <h3 className="text-base font-bold text-slate-900">Gradient Area Chart</h3>
            </div>
            <TrendingUp className="w-4 h-4 text-sky-600 shrink-0" />
          </div>
          <svg viewBox="0 0 320 170" className="w-full h-44">
            <defs>
              <linearGradient id="areaGradA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284C7" stopOpacity="0.38" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="areaGradB" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1="24" x2="296" y1={18 + (1 - g) * 134} y2={18 + (1 - g) * 134} stroke="#E2E8F0" strokeDasharray="3 3" />
            ))}
            <path d={`${buildPolyline(data.lineA, 320, 170)} L 296 152 L 24 152 Z`} fill="url(#areaGradA)" />
            <path d={buildPolyline(data.lineA, 320, 170)} fill="none" stroke="#0284C7" strokeWidth="2.5" />
            <path d={`${buildPolyline(data.lineB, 320, 170)} L 296 152 L 24 152 Z`} fill="url(#areaGradB)" />
            <path d={buildPolyline(data.lineB, 320, 170)} fill="none" stroke="#4F46E5" strokeWidth="2" />
            {data.months.map((m, idx) => (
              <rect
                key={m}
                x={24 + (idx / data.months.length) * 272}
                y={18}
                width={272 / data.months.length}
                height={134}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredTip(`Area Chart (${m}): Upper ${data.lineA[idx]}k · Lower ${data.lineB[idx]}k`)}
              />
            ))}
          </svg>
        </div>

        {/* 3. Grouped / Stacked Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500">03 · Categorical Comparison</span>
              <h3 className="text-base font-bold text-slate-900">Animated Bar Chart</h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setBarMode('grouped')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${barMode === 'grouped' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                Grouped
              </button>
              <button
                type="button"
                onClick={() => setBarMode('stacked')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${barMode === 'stacked' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
              >
                Stacked
              </button>
            </div>
          </div>
          <svg viewBox="0 0 320 170" className="w-full h-44">
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line key={g} x1="18" x2="302" y1={16 + (1 - g) * 130} y2={16 + (1 - g) * 130} stroke="#E2E8F0" strokeDasharray="3 3" />
            ))}
            {data.bars.map((b, i) => {
              const slotW = 284 / data.bars.length;
              const xBase = 18 + i * slotW + slotW * 0.18;
              if (barMode === 'grouped') {
                const h1 = Math.max(2, (b.primary / 100) * 130 * anim);
                const h2 = Math.max(2, (b.secondary / 100) * 130 * anim);
                return (
                  <g
                    key={b.label}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredTip(`Bar (${b.label}): Primary ${b.primary}% · Secondary ${b.secondary}%`)}
                  >
                    <rect x={xBase} y={146 - h1} width={12} height={h1} rx="3" fill="#0284C7" />
                    <rect x={xBase + 15} y={146 - h2} width={12} height={h2} rx="3" fill="#10B981" />
                    <text x={xBase + 13} y="164" textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">
                      {b.label}
                    </text>
                  </g>
                );
              }
              const total = b.primary + b.secondary;
              const h1 = Math.max(2, (b.primary / 180) * 130 * anim);
              const h2 = Math.max(2, (b.secondary / 180) * 130 * anim);
              return (
                <g
                  key={b.label}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredTip(`Stacked Bar (${b.label}): Total ${total} (${b.primary} + ${b.secondary})`)}
                >
                  <rect x={xBase + 4} y={146 - h1} width={20} height={h1} rx="3" fill="#0284C7" />
                  <rect x={xBase + 4} y={146 - h1 - h2 - 2} width={20} height={h2} rx="3" fill="#4F46E5" />
                  <text x={xBase + 14} y="164" textAnchor="middle" className="fill-slate-500 text-[9px] font-medium">
                    {b.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 4. Interactive Donut / Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500">04 · Part-to-Whole</span>
              <h3 className="text-base font-bold text-slate-900">Donut &amp; Pie Breakdown</h3>
            </div>
            <PieChart className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <svg viewBox="0 0 160 160" className="w-36 h-36 shrink-0">
              {(() => {
                const total = data.donut.reduce((s, d) => s + d.value, 0);
                let cumulative = 0;
                const radius = 56;
                const circ = 2 * Math.PI * radius;
                return data.donut.map((slice, idx) => {
                  const frac = (slice.value / total) * clampedAnim;
                  const dash = frac * circ;
                  const offset = -(cumulative / total) * circ * clampedAnim;
                  cumulative += slice.value;
                  const isActive = activeDonutIdx === idx;
                  return (
                    <circle
                      key={slice.label}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isActive ? 22 : 17}
                      strokeDasharray={`${dash} ${circ}`}
                      strokeDashoffset={offset}
                      transform="rotate(-90 80 80)"
                      className="cursor-pointer transition-all duration-200"
                      onClick={() => setActiveDonutIdx(idx)}
                      onMouseEnter={() => {
                        setActiveDonutIdx(idx);
                        setHoveredTip(`Donut Slice: ${slice.label} (${slice.value}%)`);
                      }}
                    />
                  );
                });
              })()}
              <text x="80" y="76" textAnchor="middle" className="fill-slate-900 font-bold text-lg tabular-nums">
                {data.donut[activeDonutIdx]?.value ?? 0}%
              </text>
              <text x="80" y="94" textAnchor="middle" className="fill-slate-500 text-[10px]">
                {data.donut[activeDonutIdx]?.label}
              </text>
            </svg>

            <div className="flex-1 space-y-2">
              {data.donut.map((s, idx) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setActiveDonutIdx(idx)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                    activeDonutIdx === idx ? 'bg-slate-100 font-bold text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
                    <span>{s.label}</span>
                  </span>
                  <span className="font-mono tabular-nums">{s.value}%</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Concentric Radial Progress Rings */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500">05 · Goal Telemetry</span>
              <h3 className="text-base font-bold text-slate-900">Radial Activity Rings</h3>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">3 Rings</span>
          </div>
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 160 160" className="w-36 h-36 shrink-0">
              {data.rings.map((ring, idx) => {
                const r = 60 - idx * 16;
                const circ = 2 * Math.PI * r;
                const progressLen = (ring.pct / 100) * clampedAnim * circ;
                return (
                  <g
                    key={ring.label}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredTip(`Radial Ring: ${ring.label} at ${ring.pct}%`)}
                  >
                    <circle cx="80" cy="80" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
                    <circle
                      cx="80"
                      cy="80"
                      r={r}
                      fill="none"
                      stroke={ring.color}
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${progressLen} ${circ}`}
                      transform="rotate(-90 80 80)"
                    />
                  </g>
                );
              })}
            </svg>
            <div className="flex-1 space-y-2.5">
              {data.rings.map((ring) => (
                <div key={ring.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{ring.label}</span>
                    <span className="font-mono tabular-nums font-bold" style={{ color: ring.color }}>
                      {Math.round(ring.pct * clampedAnim)}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${ring.pct * clampedAnim}%`, backgroundColor: ring.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6. Multi-Axis Radar / Spider Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500">06 · Multivariate Profile</span>
              <h3 className="text-base font-bold text-slate-900">Radar / Spider Web Chart</h3>
            </div>
            <span className="text-[11px] font-medium text-slate-500">6 Axes</span>
          </div>
          <svg viewBox="0 0 260 175" className="w-full h-44">
            {(() => {
              const cx = 130;
              const cy = 88;
              const maxR = 62;
              const count = data.radar.length;
              const toPt = (idx: number, val: number) => {
                const angle = (Math.PI * 2 * idx) / count - Math.PI / 2;
                const r = (val / 100) * maxR;
                return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
              };
              const poly1 = data.radar.map((d, i) => toPt(i, d.v1 * anim).join(',')).join(' ');
              const poly2 = data.radar.map((d, i) => toPt(i, d.v2 * anim).join(',')).join(' ');
              return (
                <>
                  {[0.33, 0.66, 1].map((lvl) => (
                    <polygon
                      key={lvl}
                      points={data.radar.map((_, i) => toPt(i, lvl * 100).join(',')).join(' ')}
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                  ))}
                  {data.radar.map((d, i) => {
                    const [x, y] = toPt(i, 100);
                    const [lx, ly] = toPt(i, 120);
                    return (
                      <g key={d.axis}>
                        <line x1={cx} y1={cy} x2={x} y2={y} stroke="#CBD5E1" strokeWidth="1" />
                        <text x={lx} y={ly + 3} textAnchor="middle" className="fill-slate-600 text-[9px] font-semibold">
                          {d.axis}
                        </text>
                      </g>
                    );
                  })}
                  <polygon points={poly2} fill="rgba(99, 102, 241, 0.18)" stroke="#4F46E5" strokeWidth="2" />
                  <polygon points={poly1} fill="rgba(2, 132, 199, 0.24)" stroke="#0284C7" strokeWidth="2.2" />
                  {data.radar.map((d, i) => {
                    const [x, y] = toPt(i, d.v1 * anim);
                    return (
                      <circle
                        key={d.axis}
                        cx={x}
                        cy={y}
                        r="3.5"
                        fill="#0284C7"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredTip(`Radar (${d.axis}): Current ${d.v1} vs Target ${d.v2}`)}
                      />
                    );
                  })}
                </>
              );
            })()}
          </svg>
        </div>

        {/* 7. Physics Scatter & Bubble Plot */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500">07 · Correlation Distribution</span>
              <h3 className="text-base font-bold text-slate-900">Scatter &amp; Bubble Plot</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">X·Y·R</span>
          </div>
          <svg viewBox="0 0 320 170" className="w-full h-44">
            {[0.25, 0.5, 0.75].map((g) => (
              <g key={g}>
                <line x1="26" x2="298" y1={16 + g * 134} y2={16 + g * 134} stroke="#F1F5F9" />
                <line x1={26 + g * 272} x2={26 + g * 272} y1="16" y2="150" stroke="#F1F5F9" />
              </g>
            ))}
            <line x1="26" y1="150" x2="298" y2="150" stroke="#CBD5E1" />
            <line x1="26" y1="16" x2="26" y2="150" stroke="#CBD5E1" />
            {data.scatter.map((pt) => {
              const cx = 26 + (pt.x / 100) * 272 * clampedAnim;
              const cy = 150 - (pt.y / 100) * 130 * anim;
              const r = pt.r * clampedAnim;
              return (
                <g
                  key={pt.label}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredTip(`Bubble (${pt.label}): X=${pt.x}, Y=${pt.y}, Weight=${pt.r}`)}
                >
                  <circle cx={cx} cy={cy} r={r} fill={pt.color} fillOpacity="0.24" stroke={pt.color} strokeWidth="2" />
                  <circle cx={cx} cy={cy} r={Math.max(2, r * 0.28)} fill={pt.color} />
                </g>
              );
            })}
          </svg>
        </div>

        {/* 8. Financial Candlestick (OHLC) Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500">08 · Financial OHLC</span>
              <h3 className="text-base font-bold text-slate-900">Candlestick &amp; Wick Chart</h3>
            </div>
            <BarChart3 className="w-4 h-4 text-emerald-600 shrink-0" />
          </div>
          <svg viewBox="0 0 320 170" className="w-full h-44">
            {[25, 50, 75].map((lv) => {
              const y = 150 - (lv / 100) * 130;
              return <line key={lv} x1="20" x2="300" y1={y} y2={y} stroke="#F1F5F9" />;
            })}
            {data.candles.map((c, idx) => {
              const slotW = 276 / data.candles.length;
              const cx = 22 + idx * slotW + slotW / 2;
              const isBull = c.c >= c.o;
              const color = isBull ? '#059669' : '#DC2626';
              const yH = 150 - (c.h / 100) * 130 * clampedAnim;
              const yL = 150 - (c.l / 100) * 130 * clampedAnim;
              const yO = 150 - (c.o / 100) * 130 * clampedAnim;
              const yC = 150 - (c.c / 100) * 130 * clampedAnim;
              const bodyTop = Math.min(yO, yC);
              const bodyH = Math.max(4, Math.abs(yO - yC));
              return (
                <g
                  key={c.label}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredTip(`Candle ${c.label}: Open ${c.o} · High ${c.h} · Low ${c.l} · Close ${c.c}`)}
                >
                  <line x1={cx} y1={yH} x2={cx} y2={yL} stroke={color} strokeWidth="2" />
                  <rect x={cx - 8} y={bodyTop} width="16" height={bodyH} rx="2" fill={color} />
                  <text x={cx} y="165" textAnchor="middle" className="fill-slate-400 text-[9px] font-mono">
                    {c.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* 9. 7x12 Activity Heatmap Matrix */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500">09 · Density Matrix</span>
              <h3 className="text-base font-bold text-slate-900">Activity Heatmap Grid</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">7 × 12</span>
          </div>
          <svg viewBox="0 0 320 170" className="w-full h-44">
            {heatmapCells.map((cell) => {
              const cellReveal = Math.max(0, Math.min(1, clampedAnim * 1.4 - (cell.c / 12) * 0.4));
              const fill =
                cell.val > 78
                  ? '#0284C7'
                  : cell.val > 55
                  ? '#38BDF8'
                  : cell.val > 32
                  ? '#BAE6FD'
                  : '#E2E8F0';
              return (
                <rect
                  key={`${cell.r}-${cell.c}`}
                  x={16 + cell.c * 24.5}
                  y={16 + cell.r * 20}
                  width="20"
                  height="16"
                  rx="3"
                  fill={fill}
                  opacity={cellReveal}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredTip(`Heatmap [Day ${cell.r + 1}, Week ${cell.c + 1}]: Intensity ${cell.val}/100`)}
                />
              );
            })}
          </svg>
        </div>

        {/* 10. Conversion Funnel Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500">10 · Stage Pipeline</span>
              <h3 className="text-base font-bold text-slate-900">Conversion Funnel Chart</h3>
            </div>
            <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
          </div>
          <div className="space-y-2 py-1">
            {data.funnel.map((step) => {
              const max = data.funnel[0].count;
              const pct = Math.round((step.count / max) * 100);
              const w = Math.max(18, pct * clampedAnim);
              return (
                <div
                  key={step.stage}
                  className="space-y-0.5 cursor-pointer"
                  onMouseEnter={() => setHoveredTip(`Funnel Stage (${step.stage}): ${step.count.toLocaleString()} users (${pct}%)`)}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-700">{step.stage}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      {step.count.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full flex justify-center">
                    <div
                      className="h-4 rounded-md transition-all"
                      style={{ width: `${w}%`, backgroundColor: step.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 11. Proportional Treemap Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between text-left">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-slate-500">11 · Hierarchical Share</span>
              <h3 className="text-base font-bold text-slate-900">Proportional Treemap</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">100% Area</span>
          </div>
          <div className="grid grid-cols-12 grid-rows-6 gap-1.5 h-40">
            {data.treemap.map((block, idx) => {
              const spans = [
                'col-span-6 row-span-6',
                'col-span-6 row-span-3',
                'col-span-3 row-span-3',
                'col-span-3 row-span-2',
                'col-span-3 row-span-1',
              ];
              return (
                <div
                  key={block.name}
                  className={`${spans[idx] || 'col-span-3 row-span-2'} rounded-lg p-2 text-white flex flex-col justify-between cursor-pointer transition-transform`}
                  style={{
                    backgroundColor: block.color,
                    transform: `scale(${0.85 + 0.15 * clampedAnim})`,
                    opacity: clampedAnim,
                  }}
                  onMouseEnter={() => setHoveredTip(`Treemap Block (${block.name}): ${block.value}% allocation`)}
                >
                  <span className="text-[11px] font-bold leading-tight truncate">{block.name}</span>
                  <span className="text-[10px] font-mono tabular-nums opacity-90">{block.value}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 12. Real-Time 60fps Oscilloscope / Streaming Waveform */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xs flex flex-col justify-between text-left text-white">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-medium text-cyan-400">12 · Continuous 60fps Stream</span>
              <h3 className="text-base font-bold text-white">Live Oscilloscope Waveform</h3>
            </div>
            <button
              type="button"
              onClick={() => setLiveStream((v) => !v)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer border border-slate-700"
            >
              {liveStream ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{liveStream ? 'Pause' : 'Stream'}</span>
            </button>
          </div>
          <svg viewBox="0 0 320 130" className="w-full h-36">
            <line x1="12" y1="65" x2="308" y2="65" stroke="#1E293B" strokeDasharray="4 4" />
            {(() => {
              const pts = 56;
              const makeWave = (amp: number, freqMult: number, phaseShift: number) =>
                Array.from({ length: pts })
                  .map((_, i) => {
                    const x = 12 + (i / (pts - 1)) * 296;
                    const y =
                      65 +
                      Math.sin((i / pts) * Math.PI * 2 * waveFreq * freqMult + wavePhase + phaseShift) *
                        amp *
                        Math.sin((i / pts) * Math.PI);
                    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
                  })
                  .join(' ');
              return (
                <>
                  <path d={makeWave(34, 1.5, 1.2)} fill="none" stroke="#6366F1" strokeWidth="2" opacity="0.7" />
                  <path d={makeWave(46, 1, 0)} fill="none" stroke="#38BDF8" strokeWidth="2.8" strokeLinecap="round" />
                </>
              );
            })()}
          </svg>
          <div className="pt-2 flex items-center justify-between gap-3 text-[11px] text-slate-300">
            <label htmlFor="wave-freq" className="whitespace-nowrap">
              Frequency: <span className="font-mono tabular-nums text-cyan-300">{waveFreq.toFixed(1)} Hz</span>
            </label>
            <input
              id="wave-freq"
              type="range"
              min="1"
              max="5"
              step="0.2"
              value={waveFreq}
              onChange={(e) => setWaveFreq(parseFloat(e.target.value))}
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
