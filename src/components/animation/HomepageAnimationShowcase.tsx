import React, { useState } from 'react';
import { Link } from '../../router/RouterContext';
import {
  Download,
  FileArchive,
  BarChart3,
  Layers,
  ArrowRight,
  RotateCcw,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import {
  ANIMATION_COURSE_ZIP_PACKS,
  SWIFT_ANIMATION_COMPONENTS
} from '../../data/animationCourseData';

type PreviewChartType = 'line' | 'area' | 'bar' | 'donut' | 'radar' | 'candlestick';

const SERIES_POINTS = [28, 46, 39, 68, 57, 84, 76, 94];
const SERIES_SECOND = [18, 29, 34, 44, 48, 62, 58, 75];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
const DONUT_SLICES = [
  { label: 'CoreAnimation', value: 34, color: '#0284c7' },
  { label: 'Charts SVG', value: 28, color: '#0ea5e9' },
  { label: 'Spring Physics', value: 22, color: '#6366f1' },
  { label: 'Transitions', value: 16, color: '#10b981' },
];
const CANDLE_DATA = [
  { o: 42, c: 56, h: 61, l: 38 },
  { o: 56, c: 49, h: 60, l: 45 },
  { o: 49, c: 68, h: 72, l: 47 },
  { o: 68, c: 63, h: 74, l: 59 },
  { o: 63, c: 82, h: 86, l: 61 },
  { o: 82, c: 77, h: 88, l: 73 },
  { o: 77, c: 91, h: 95, l: 75 },
];

export const HomepageAnimationShowcase: React.FC = () => {
  const [chartTab, setChartTab] = useState<PreviewChartType>('line');
  const [animKey, setAnimKey] = useState(0);
  const [foldingOpen, setFoldingOpen] = useState(false);
  const [paperOn, setPaperOn] = useState(true);
  const [sliderVal, setSliderVal] = useState(68);

  const replay = (nextTab?: PreviewChartType) => {
    if (nextTab) setChartTab(nextTab);
    setAnimKey((k) => k + 1);
  };

  // Build SVG smooth path for line / area
  const width = 460;
  const height = 185;
  const padX = 28;
  const padY = 20;
  const coords = SERIES_POINTS.map((v, idx) => {
    const x = padX + (idx / (SERIES_POINTS.length - 1)) * (width - padX * 2);
    const y = height - padY - (v / 100) * (height - padY * 2);
    return { x, y, v };
  });
  const coords2 = SERIES_SECOND.map((v, idx) => {
    const x = padX + (idx / (SERIES_SECOND.length - 1)) * (width - padX * 2);
    const y = height - padY - (v / 100) * (height - padY * 2);
    return { x, y, v };
  });

  const toLinePath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');

  const areaPath = `${toLinePath(coords)} L ${coords[coords.length - 1].x.toFixed(1)} ${height - padY} L ${coords[0].x.toFixed(1)} ${height - padY} Z`;

  return (
    <section className="py-16 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl text-left">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Featured Source Pack · Ramotion Swift UI + Data Visualization
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight">
              Swift UI Animation Components, Graphs &amp; Charts Course (ZIP + Live Studio)
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Download the complete course ZIP bundles with all 17 Ramotion Swift UI animation libraries, 12 interactive chart &amp; graph engines, damped spring physics solvers, and MIT-licensed iOS source scaffolding.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="/downloads/animation-course/swift-ui-animation-components-master-pack.zip"
              download
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-600/20 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Master ZIP (31 KB)</span>
            </a>

            <Link
              to="/animation-course"
              className="px-5 py-3 rounded-xl bg-[#0B1930] hover:bg-[#13294d] text-white font-bold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Open Full Interactive Studio</span>
              <ArrowRight className="w-4 h-4 text-cyan-300" />
            </Link>
          </div>
        </div>

        {/* 2-Column Live Interactive Preview + Course ZIP Packs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 7 Cols: Interactive Animated Charts & Swift UI Mini Sandbox */}
          <div className="lg:col-span-7 bg-[#0B1930] text-white rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-bold text-white">Live Animated Graphs &amp; Charts Preview</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'line', label: 'Line' },
                    { id: 'area', label: 'Area' },
                    { id: 'bar', label: 'Bars' },
                    { id: 'donut', label: 'Donut' },
                    { id: 'radar', label: 'Radar' },
                    { id: 'candlestick', label: 'OHLC' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => replay(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      chartTab === item.id
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => replay()}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 cursor-pointer"
                  aria-label="Replay chart animation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive SVG Chart Stage */}
            <div
              key={`${chartTab}-${animKey}`}
              className="bg-[#071326] border border-blue-900/50 rounded-xl p-4 flex items-center justify-center min-h-[210px]"
            >
              {(chartTab === 'line' || chartTab === 'area') && (
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
                  <defs>
                    <linearGradient id="homeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {[25, 50, 75].map((pct) => {
                    const y = height - padY - (pct / 100) * (height - padY * 2);
                    return (
                      <line
                        key={pct}
                        x1={padX}
                        y1={y}
                        x2={width - padX}
                        y2={y}
                        stroke="#1e293b"
                        strokeDasharray="3 3"
                      />
                    );
                  })}
                  {chartTab === 'area' && (
                    <path d={areaPath} fill="url(#homeAreaGrad)" />
                  )}
                  <path
                    d={toLinePath(coords2)}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d={toLinePath(coords)}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {coords.map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="4" fill="#071326" stroke="#38bdf8" strokeWidth="2.5" />
                      <text
                        x={pt.x}
                        y={height - 3}
                        textAnchor="middle"
                        className="fill-slate-400 text-[10px]"
                      >
                        {MONTHS[idx]}
                      </text>
                    </g>
                  ))}
                </svg>
              )}

              {chartTab === 'bar' && (
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44">
                  {SERIES_POINTS.map((v, idx) => {
                    const slotW = (width - padX * 2) / SERIES_POINTS.length;
                    const x = padX + idx * slotW + 6;
                    const barH = (v / 100) * (height - padY * 2);
                    const secH = (SERIES_SECOND[idx] / 100) * (height - padY * 2);
                    return (
                      <g key={idx}>
                        <rect
                          x={x}
                          y={height - padY - barH}
                          width={slotW * 0.36}
                          height={barH}
                          rx="3"
                          fill="#0ea5e9"
                        />
                        <rect
                          x={x + slotW * 0.42}
                          y={height - padY - secH}
                          width={slotW * 0.36}
                          height={secH}
                          rx="3"
                          fill="#6366f1"
                        />
                        <text x={x + slotW * 0.38} y={height - 3} textAnchor="middle" className="fill-slate-400 text-[10px]">
                          {MONTHS[idx]}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {chartTab === 'donut' && (
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center">
                  <svg viewBox="0 0 140 140" className="w-36 h-36 -rotate-90">
                    {(() => {
                      const r = 50;
                      const c = 2 * Math.PI * r;
                      let offset = 0;
                      return DONUT_SLICES.map((s) => {
                        const dash = (s.value / 100) * c;
                        const el = (
                          <circle
                            key={s.label}
                            cx="70"
                            cy="70"
                            r={r}
                            fill="none"
                            stroke={s.color}
                            strokeWidth="16"
                            strokeDasharray={`${dash} ${c - dash}`}
                            strokeDashoffset={-offset}
                          />
                        );
                        offset += dash;
                        return el;
                      });
                    })()}
                  </svg>
                  <div className="space-y-1.5 text-xs">
                    {DONUT_SLICES.map((s) => (
                      <div key={s.label} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-2 text-slate-200">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                          <span>{s.label}</span>
                        </span>
                        <span className="font-bold text-cyan-300 tabular-nums">{s.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {chartTab === 'radar' && (
                <svg viewBox="0 0 220 190" className="w-56 h-44">
                  {[0.33, 0.66, 1].map((scale) => {
                    const poly = Array.from({ length: 6 }, (_, i) => {
                      const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                      return `${110 + Math.cos(a) * 68 * scale},${95 + Math.sin(a) * 68 * scale}`;
                    }).join(' ');
                    return <polygon key={scale} points={poly} fill="none" stroke="#1e293b" strokeWidth="1" />;
                  })}
                  <polygon
                    points={[0.88, 0.74, 0.92, 0.68, 0.85, 0.79]
                      .map((val, i) => {
                        const a = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                        return `${110 + Math.cos(a) * 68 * val},${95 + Math.sin(a) * 68 * val}`;
                      })
                      .join(' ')}
                    fill="#0ea5e9"
                    fillOpacity="0.28"
                    stroke="#38bdf8"
                    strokeWidth="2.5"
                  />
                </svg>
              )}

              {chartTab === 'candlestick' && (
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44">
                  {CANDLE_DATA.map((d, idx) => {
                    const slotW = (width - padX * 2) / CANDLE_DATA.length;
                    const cx = padX + idx * slotW + slotW / 2;
                    const toY = (val: number) => height - padY - (val / 100) * (height - padY * 2);
                    const up = d.c >= d.o;
                    const bodyTop = toY(Math.max(d.o, d.c));
                    const bodyBot = toY(Math.min(d.o, d.c));
                    return (
                      <g key={idx}>
                        <line x1={cx} y1={toY(d.h)} x2={cx} y2={toY(d.l)} stroke={up ? '#10b981' : '#f43f5e'} strokeWidth="2" />
                        <rect
                          x={cx - 10}
                          y={bodyTop}
                          width="20"
                          height={Math.max(5, bodyBot - bodyTop)}
                          rx="2"
                          fill={up ? '#10b981' : '#f43f5e'}
                        />
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            {/* Live Mini Interactive Swift UI Controls Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setFoldingOpen((v) => !v)}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-left transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                  <span>Folding Cell</span>
                  <span className="text-[10px] text-slate-400">{foldingOpen ? 'Expanded' : 'Tap to unfold'}</span>
                </div>
                <div className="text-[11px] text-slate-300 mt-1">
                  {foldingOpen ? 'Detail view unfolded (0.6s spring)' : 'Ramotion/folding-cell preview'}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaperOn((v) => !v)}
                className={`p-3 rounded-xl border text-left transition-colors duration-300 cursor-pointer ${
                  paperOn ? 'bg-sky-700 border-sky-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Paper Switch</span>
                  <span className={`w-8 h-4 rounded-full p-0.5 flex items-center transition-colors ${paperOn ? 'bg-white justify-end' : 'bg-slate-700 justify-start'}`}>
                    <span className={`w-3 h-3 rounded-full ${paperOn ? 'bg-sky-600' : 'bg-slate-400'}`} />
                  </span>
                </div>
                <div className="text-[11px] opacity-90 mt-1">
                  Radial ripple fill {paperOn ? 'ON' : 'OFF'}
                </div>
              </button>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 text-left">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1.5">
                  <span>Fluid Slider</span>
                  <span className="text-cyan-300 tabular-nums">{sliderVal}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderVal}
                  onChange={(e) => setSliderVal(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right 5 Cols: All 5 Downloadable ZIP Archives + 17 Components Summary */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-5 text-left">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileArchive className="w-4 h-4 text-blue-600" />
                  <span>Included Course ZIP Archives (5 Packs)</span>
                </h3>
                <span className="text-xs font-semibold text-blue-600 tabular-nums">17 Modules · 12 Charts</span>
              </div>

              <div className="space-y-2.5">
                {ANIMATION_COURSE_ZIP_PACKS.map((pack) => (
                  <a
                    key={pack.id}
                    href={pack.downloadUrl}
                    download={pack.filename}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-colors group"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate">
                        {pack.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {pack.filename} · {pack.sizeLabel} · {pack.fileCount} files
                      </div>
                    </div>
                    <span className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white text-[11px] font-bold flex items-center gap-1 shrink-0 whitespace-nowrap">
                      <Download className="w-3 h-3" />
                      <span>ZIP</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                All {SWIFT_ANIMATION_COMPONENTS.length} Ramotion Components Inside
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Circular Carousel, Folding Cell, Animated Tab Bar, Paper Onboarding, CardSlider, Navigation Toolbar, Expanding Collection, Circle Menu, Paper Switch, Reel Search, Navigation Stack, Adaptive Tab Bar, Preview Transition, Gliding Collection, Fluid Slider, Elongation Preview &amp; Garland View.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Link
                  to="/animation-course"
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Inspect Files &amp; Run All 12 Charts</span>
                </Link>
                <Link
                  to="/learn/OF-CRS-ANIM-001"
                  className="px-3.5 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Enroll Free in LMS</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
