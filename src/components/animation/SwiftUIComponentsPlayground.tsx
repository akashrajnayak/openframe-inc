import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
  Home,
  Search,
  Heart,
  User,
  BarChart2,
  Plus,
  X,
  Compass,
  Layers,
  Sparkles,
  Camera,
  Bookmark,
  Settings,
  Bell,
  Play,
  ArrowUpRight,
  Sliders
} from 'lucide-react';
import {
  SWIFT_ANIMATION_COMPONENTS,
  SwiftAnimationComponentItem
} from '../../data/animationCourseData';

const CATEGORIES = [
  'All (17)',
  'Carousels & Feeds',
  'Cards & Lists',
  'Navigation',
  'Controls & Switches',
  'Onboarding & Media',
] as const;

/* ========================================================================= */
/* Individual Live Interactive Simulators for All 17 Ramotion Components     */
/* ========================================================================= */
const ComponentLiveSimulator: React.FC<{ componentId: string }> = ({ componentId }) => {
  // 1. Circular Carousel state
  const [carouselIdx, setCarouselIdx] = useState(2);

  // 2. Folding Cell state
  const [foldedOpen, setFoldedOpen] = useState(false);

  // 3. Animated Tab Bar state
  const [animTab, setAnimTab] = useState(0);

  // 4. Paper Onboarding state
  const [onboardIdx, setOnboardIdx] = useState(0);

  // 5. CardSlider state
  const [deckIdx, setDeckIdx] = useState(0);

  // 6. Navigation Toolbar state
  const [navToolbarOpen, setNavToolbarOpen] = useState(true);
  const [navToolbarTab, setNavToolbarTab] = useState(0);

  // 7. Expanding Collection state
  const [expandingOpen, setExpandingOpen] = useState(false);

  // 8. Circle Menu state
  const [circleOpen, setCircleOpen] = useState(true);
  const [circlePicked, setCirclePicked] = useState('Motion');

  // 9. Paper Switch state
  const [paperOn, setPaperOn] = useState(false);

  // 10. Reel Search state
  const [reelQuery, setReelQuery] = useState('');
  const [reelPicked, setReelPicked] = useState('Folding Cell');

  // 11. Navigation Stack state
  const [stackOverview, setStackOverview] = useState(true);
  const [stackActive, setStackActive] = useState(2);

  // 12. Adaptive Tab Bar state
  const [usageMastery, setUsageMastery] = useState(25);

  // 13. Preview Transition state
  const [previewExpanded, setPreviewExpanded] = useState<number | null>(null);

  // 14. Gliding Collection state
  const [glidingCat, setGlidingCat] = useState(0);

  // 15. Fluid Slider state
  const [fluidVal, setFluidVal] = useState(64);

  // 16. Elongation Preview state
  const [elongated, setElongated] = useState(false);

  // 17. Garland View state
  const [garlandIdx, setGarlandIdx] = useState(1);

  switch (componentId) {
    case 'circular-carousel': {
      const items = [
        { title: 'Charts Kit', sub: '12 Graphs', bg: 'from-sky-600 to-blue-800' },
        { title: 'Folding Cell', sub: '3D Origami', bg: 'from-indigo-600 to-violet-800' },
        { title: 'Fluid Slider', sub: 'Liquid Bubble', bg: 'from-cyan-600 to-teal-800' },
        { title: 'Circle Menu', sub: 'Radial Polar', bg: 'from-emerald-600 to-green-800' },
        { title: 'Paper Switch', sub: 'Flood Mask', bg: 'from-amber-600 to-orange-800' },
      ];
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-5 py-4">
          <div className="flex items-center justify-center gap-3 overflow-hidden py-4 w-full">
            {items.map((item, idx) => {
              const dist = Math.abs(idx - carouselIdx);
              const scale = dist === 0 ? 1.05 : dist === 1 ? 0.84 : 0.68;
              const opacity = dist === 0 ? 1 : dist === 1 ? 0.78 : 0.45;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setCarouselIdx(idx)}
                  style={{ transform: `scale(${scale})`, opacity }}
                  className={`w-36 h-44 rounded-2xl bg-gradient-to-br ${item.bg} text-white p-4 flex flex-col justify-between shadow-xl transition-all duration-300 cursor-pointer shrink-0 text-left`}
                >
                  <span className="text-[10px] font-mono opacity-80">0{idx + 1}</span>
                  <div>
                    <div className="text-sm font-bold">{item.title}</div>
                    <div className="text-[11px] opacity-80">{item.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCarouselIdx((i) => Math.max(0, i - 1))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              aria-label="Previous carousel item"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono tabular-nums text-slate-300">
              Center: {items[carouselIdx].title} ({carouselIdx + 1}/{items.length})
            </span>
            <button
              type="button"
              onClick={() => setCarouselIdx((i) => Math.min(items.length - 1, i + 1))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
              aria-label="Next carousel item"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }

    case 'folding-cell':
      return (
        <div className="flex flex-col items-center justify-center h-full py-4 space-y-4">
          <div className="w-full max-w-sm perspective-[1000px]">
            {/* Top summary bar (always visible) */}
            <div
              onClick={() => setFoldedOpen((o) => !o)}
              className="bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer border border-slate-200 transition-all duration-300"
            >
              <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
                <div>
                  <div className="text-[11px] opacity-80">Module 02 · Swift UI</div>
                  <div className="text-base font-bold">BLR → SFO Flight Card</div>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-white/15 text-xs font-bold">
                  {foldedOpen ? 'Fold Up' : 'Unfold'}
                </span>
              </div>

              {/* Unfolding Origami Panels */}
              <div
                className="transition-all duration-500 origin-top overflow-hidden"
                style={{
                  maxHeight: foldedOpen ? '260px' : '0px',
                  transform: foldedOpen ? 'rotateX(0deg)' : 'rotateX(-85deg)',
                  opacity: foldedOpen ? 1 : 0,
                }}
              >
                <div className="p-4 space-y-3 bg-slate-50 border-t border-slate-200 text-left">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <div className="text-slate-400">GATE</div>
                      <div className="font-bold text-slate-900">A-14</div>
                    </div>
                    <div>
                      <div className="text-slate-400">SEAT</div>
                      <div className="font-bold text-slate-900">12F</div>
                    </div>
                    <div>
                      <div className="text-slate-400">DURATION</div>
                      <div className="font-bold text-slate-900">14h 20m</div>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600">
                    Sequential 3D CATransform3D fold panels reveal rich secondary details without pushing to a new screen.
                  </div>
                </div>
              </div>

              {!foldedOpen && (
                <div className="px-4 py-3 text-xs text-slate-500 flex items-center justify-between">
                  <span>Tap card to trigger 3D paper unfold</span>
                  <span className="font-mono font-semibold text-indigo-600">₹4,990</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );

    case 'animated-tab-bar': {
      const tabs = [
        { label: 'Home', icon: Home, anim: 'scale-125 -translate-y-1', color: 'text-sky-400' },
        { label: 'Charts', icon: BarChart2, anim: 'rotate-12 scale-125', color: 'text-emerald-400' },
        { label: 'Explore', icon: Compass, anim: 'rotate-180 scale-115', color: 'text-indigo-400' },
        { label: 'Saved', icon: Heart, anim: 'scale-125 -translate-y-1.5', color: 'text-rose-400' },
        { label: 'Profile', icon: User, anim: 'scale-120', color: 'text-amber-400' },
      ];
      return (
        <div className="flex flex-col items-center justify-between h-full py-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Active Tab: {tabs[animTab].label}
            </div>
            <div className="text-lg font-bold text-white">
              Tap any iOS Tab Item below to trigger keyframe icon motion
            </div>
          </div>
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-2 grid grid-cols-5 gap-1 shadow-2xl">
            {tabs.map((t, idx) => {
              const Icon = t.icon;
              const active = animTab === idx;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setAnimTab(idx)}
                  className={`py-3 rounded-xl flex flex-col items-center gap-1 cursor-pointer transition-all duration-300 ${
                    active ? 'bg-slate-800/90' : 'hover:bg-slate-900'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform duration-300 ${
                      active ? `${t.anim} ${t.color}` : 'text-slate-400'
                    }`}
                  />
                  <span className={`text-[10px] font-semibold ${active ? 'text-white' : 'text-slate-500'}`}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    case 'paper-onboarding': {
      const slides = [
        { title: 'Fluid Data Charts', desc: 'Animate multi-series lines, bars, and rings at 60fps.', bg: 'bg-sky-600' },
        { title: 'Tactile Material Motion', desc: 'Circular flood transitions guide user focus effortlessly.', bg: 'bg-indigo-600' },
        { title: 'Export & Ship Fast', desc: 'Install via Swift Package Manager or download the ZIP kit.', bg: 'bg-emerald-600' },
      ];
      const active = slides[onboardIdx];
      return (
        <div className={`relative w-full h-64 rounded-2xl ${active.bg} text-white p-6 flex flex-col justify-between transition-colors duration-500 overflow-hidden shadow-xl`}>
          <div className="text-xs font-mono opacity-80">Step 0{onboardIdx + 1} / 03</div>
          <div className="space-y-2 max-w-sm">
            <h4 className="text-2xl font-bold">{active.title}</h4>
            <p className="text-xs sm:text-sm text-white/90">{active.desc}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {slides.map((s, idx) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setOnboardIdx(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    onboardIdx === idx ? 'w-8 bg-white' : 'w-2.5 bg-white/40'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setOnboardIdx((i) => (i + 1) % slides.length)}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold cursor-pointer hover:bg-slate-100"
            >
              Next Slide
            </button>
          </div>
        </div>
      );
    }

    case 'cardslider': {
      const cards = [
        { title: 'Kyoto Motion Study', sub: 'Parallax Depth Stack', color: 'from-sky-500 to-blue-700' },
        { title: 'Swiss Typography Grid', sub: 'Spring Snap Deck', color: 'from-emerald-500 to-teal-700' },
        { title: 'iOS Telemetry UI', sub: 'Gesture Driven Flow', color: 'from-indigo-500 to-purple-700' },
        { title: 'Material Surfaces', sub: 'Z-Order Elevation', color: 'from-amber-500 to-orange-700' },
      ];
      return (
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative w-64 h-44">
            {cards.map((c, idx) => {
              const offset = (idx - deckIdx + cards.length) % cards.length;
              const isFront = offset === 0;
              return (
                <div
                  key={c.title}
                  onClick={() => setDeckIdx((i) => (i + 1) % cards.length)}
                  style={{
                    transform: `translateX(${offset * 16}px) scale(${1 - offset * 0.08})`,
                    zIndex: cards.length - offset,
                    opacity: offset > 2 ? 0 : 1 - offset * 0.15,
                  }}
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${c.color} text-white p-5 shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between text-left`}
                >
                  <span className="text-[11px] font-mono opacity-85">
                    {isFront ? 'Tap card to swipe →' : `Stacked +${offset}`}
                  </span>
                  <div>
                    <div className="text-lg font-bold">{c.title}</div>
                    <div className="text-xs opacity-85">{c.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setDeckIdx((i) => (i + 1) % cards.length)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer"
          >
            Swipe Next Card ({deckIdx + 1}/{cards.length})
          </button>
        </div>
      );
    }

    case 'navigation-toolbar': {
      const items = ['Overview', 'Charts', 'Components', 'Downloads'];
      return (
        <div className="w-full max-w-md mx-auto bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl text-left">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold">Navigation Toolbar</span>
            <button
              type="button"
              onClick={() => setNavToolbarOpen((o) => !o)}
              className="px-2.5 py-1 rounded-lg bg-sky-600 text-xs font-semibold cursor-pointer"
            >
              {navToolbarOpen ? 'Slide Up' : 'Slide Down'}
            </button>
          </div>
          <div
            className="bg-sky-700 text-white transition-all duration-300 overflow-hidden"
            style={{ maxHeight: navToolbarOpen ? '64px' : '0px', opacity: navToolbarOpen ? 1 : 0 }}
          >
            <div className="p-2 grid grid-cols-4 gap-1">
              {items.map((it, idx) => (
                <button
                  key={it}
                  type="button"
                  onClick={() => setNavToolbarTab(idx)}
                  className={`py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    navToolbarTab === idx ? 'bg-white text-slate-900' : 'text-sky-100 hover:bg-sky-600'
                  }`}
                >
                  {it}
                </button>
              ))}
            </div>
          </div>
          <div className="p-5 text-xs text-slate-600">
            Selected view: <strong className="text-slate-900">{items[navToolbarTab]}</strong> — smoothly slides out of the top navigation bar.
          </div>
        </div>
      );
    }

    case 'expanding-collection':
      return (
        <div className="flex items-center justify-center py-4">
          <div className="relative w-72 text-left">
            <div
              className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-lg transition-all duration-300 ${
                expandingOpen ? 'pt-28 translate-y-4' : 'pt-20'
              }`}
            >
              <div className="text-xs font-semibold text-slate-500">Peek &amp; Pop Detail</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">Bengaluru Design Lab</div>
              {expandingOpen && (
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Front layer lifted upward while the backdrop sheet expanded to reveal full metadata and actions.
                </p>
              )}
              <button
                type="button"
                onClick={() => setExpandingOpen((o) => !o)}
                className="mt-3 w-full py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                {expandingOpen ? 'Collapse Card' : 'Peek / Pop Expand'}
              </button>
            </div>
            <div
              onClick={() => setExpandingOpen((o) => !o)}
              className={`absolute left-3 right-3 top-0 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-700 text-white p-4 shadow-xl cursor-pointer transition-transform duration-300 ${
                expandingOpen ? '-translate-y-4 scale-105' : 'translate-y-0'
              }`}
            >
              <div className="text-[11px] font-mono opacity-80">HERO COVER</div>
              <div className="text-sm font-bold">Tap to Peek / Pop</div>
            </div>
          </div>
        </div>
      );

    case 'circle-menu': {
      const actions = [
        { label: 'Camera', icon: Camera, angle: -90, color: 'bg-sky-500' },
        { label: 'Search', icon: Search, angle: -18, color: 'bg-emerald-500' },
        { label: 'Saved', icon: Bookmark, angle: 54, color: 'bg-indigo-500' },
        { label: 'Alerts', icon: Bell, angle: 126, color: 'bg-amber-500' },
        { label: 'Config', icon: Settings, angle: 198, color: 'bg-rose-500' },
      ];
      return (
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative w-56 h-56 flex items-center justify-center">
            {actions.map((act, idx) => {
              const Icon = act.icon;
              const rad = (act.angle * Math.PI) / 180;
              const dist = circleOpen ? 80 : 0;
              const x = Math.cos(rad) * dist;
              const y = Math.sin(rad) * dist;
              return (
                <button
                  key={act.label}
                  type="button"
                  onClick={() => {
                    setCirclePicked(act.label);
                    setCircleOpen(false);
                  }}
                  style={{
                    transform: `translate(${x}px, ${y}px) scale(${circleOpen ? 1 : 0.2})`,
                    opacity: circleOpen ? 1 : 0,
                    transitionDelay: `${idx * 35}ms`,
                  }}
                  className={`absolute w-11 h-11 rounded-full ${act.color} text-white flex items-center justify-center shadow-lg transition-all duration-300 cursor-pointer`}
                  aria-label={act.label}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setCircleOpen((o) => !o)}
              className="relative z-10 w-14 h-14 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl cursor-pointer transition-transform duration-300 hover:scale-105"
              aria-label="Toggle circle menu"
            >
              {circleOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </button>
          </div>
          <div className="text-xs text-slate-300">
            Last selected radial action: <strong className="text-cyan-300">{circlePicked}</strong>
          </div>
        </div>
      );
    }

    case 'paper-switch':
      return (
        <div className="relative w-full h-60 rounded-2xl bg-white border border-slate-200 overflow-hidden flex items-center justify-between p-6 shadow-xl">
          {/* Expanding radial color flood */}
          <div
            className="absolute right-12 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-sky-600 transition-transform duration-500 ease-out pointer-events-none"
            style={{ transform: `scale(${paperOn ? 22 : 0})` }}
          />
          <div className={`relative z-10 text-left transition-colors duration-300 ${paperOn ? 'text-white' : 'text-slate-900'}`}>
            <div className="text-xs font-mono uppercase tracking-wider opacity-75">RAMPaperSwitch</div>
            <div className="text-xl font-bold mt-1">{paperOn ? 'Flood State: Active' : 'Flood State: Off'}</div>
            <p className="text-xs opacity-80 mt-1 max-w-xs">
              Toggle the switch to paint across the entire parent container radially.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={paperOn}
            onClick={() => setPaperOn((v) => !v)}
            className={`relative z-10 w-16 h-9 rounded-full p-1 transition-colors cursor-pointer ${
              paperOn ? 'bg-white' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-full transition-transform duration-300 shadow ${
                paperOn ? 'translate-x-7 bg-sky-600' : 'translate-x-0 bg-white'
              }`}
            />
          </button>
        </div>
      );

    case 'reel-search': {
      const options = [
        'Circular Carousel',
        'Folding Cell',
        'Animated Tab Bar',
        'Paper Onboarding',
        'Fluid Slider',
        'Circle Menu',
        'Garland View',
        'Elongation Preview',
      ];
      const filtered = options.filter((o) => o.toLowerCase().includes(reelQuery.toLowerCase()));
      return (
        <div className="w-full max-w-sm mx-auto bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-left">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
            <input
              type="text"
              value={reelQuery}
              onChange={(e) => setReelQuery(e.target.value)}
              placeholder="Filter reel options..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-cyan-400"
            />
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
            {filtered.map((opt, idx) => {
              const active = reelPicked === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setReelPicked(opt)}
                  className={`w-full px-3 py-2 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                    active
                      ? 'bg-cyan-600 text-white font-bold scale-[1.02]'
                      : idx % 2 === 0
                      ? 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                      : 'bg-slate-900/40 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>{opt}</span>
                  {active && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    case 'navigation-stack': {
      const screens = ['Root Feed', 'Component List', 'Chart Inspector', 'ZIP Export'];
      return (
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative w-64 h-44">
            {screens.map((scr, idx) => {
              const active = idx === stackActive;
              const yOffset = stackOverview ? idx * 18 : active ? 0 : 120;
              const scale = stackOverview ? 0.86 + idx * 0.04 : active ? 1 : 0.9;
              return (
                <button
                  key={scr}
                  type="button"
                  onClick={() => {
                    setStackActive(idx);
                    setStackOverview(false);
                  }}
                  style={{
                    transform: `translateY(${yOffset}px) scale(${scale})`,
                    zIndex: idx + 1,
                    opacity: !stackOverview && !active ? 0 : 1,
                  }}
                  className="absolute inset-x-0 top-0 h-28 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 text-white p-4 shadow-2xl transition-all duration-300 cursor-pointer text-left flex flex-col justify-between"
                >
                  <span className="text-[10px] font-mono text-cyan-400">Layer 0{idx + 1}</span>
                  <span className="text-sm font-bold">{scr}</span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setStackOverview((s) => !s)}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
          >
            {stackOverview ? `Focus "${screens[stackActive]}"` : 'Show 3D Navigation Stack'}
          </button>
        </div>
      );
    }

    case 'adaptive-tab-bar': {
      const stage = usageMastery < 35 ? 'Novice (Full Labels)' : usageMastery < 75 ? 'Familiar (Compact)' : 'Expert (Icon Only)';
      const items = [
        { icon: Home, label: 'Dashboard' },
        { icon: BarChart2, label: 'Analytics' },
        { icon: Layers, label: 'Library' },
        { icon: User, label: 'Account' },
      ];
      return (
        <div className="w-full max-w-md mx-auto space-y-5 py-4">
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>User Familiarity: <strong className="text-cyan-300">{stage}</strong></span>
              <span className="font-mono tabular-nums">{usageMastery} sessions</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={usageMastery}
              onChange={(e) => setUsageMastery(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 flex items-center justify-around">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <div key={it.label} className="flex flex-col items-center gap-1 transition-all duration-300">
                  <Icon className={`transition-all duration-300 text-cyan-400 ${usageMastery >= 75 ? 'w-6 h-6' : 'w-5 h-5'}`} />
                  {usageMastery < 75 && (
                    <span className={`text-slate-300 transition-all duration-300 ${usageMastery >= 35 ? 'text-[9px]' : 'text-[11px]'}`}>
                      {usageMastery >= 35 ? it.label.slice(0, 5) : it.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    case 'preview-transition': {
      const photos = [
        { title: 'Alpine Motion Grid', sub: 'Shared Element Parallax', bg: 'from-sky-700 to-slate-900' },
        { title: 'Architectural Curves', sub: 'Hero Title Morph', bg: 'from-indigo-700 to-slate-900' },
      ];
      return (
        <div className="w-full max-w-md mx-auto space-y-2.5 py-2">
          {photos.map((p, idx) => {
            const isExp = previewExpanded === idx;
            return (
              <div
                key={p.title}
                onClick={() => setPreviewExpanded(isExp ? null : idx)}
                className={`rounded-2xl bg-gradient-to-r ${p.bg} text-white p-4 cursor-pointer transition-all duration-300 text-left border border-white/10 ${
                  isExp ? 'h-40' : 'h-20'
                } flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">{p.title}</span>
                  <ArrowUpRight className={`w-4 h-4 transition-transform ${isExp ? 'rotate-90' : ''}`} />
                </div>
                {isExp && (
                  <p className="text-xs text-slate-200">
                    {p.sub} — Expanded gallery container seamlessly transitions thumbnail bounds into full detail view.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    case 'gliding-collection': {
      const cats = ['Animations', 'Charts', 'Physics'];
      const sets = [
        ['Folding Cell', 'Circle Menu', 'Paper Switch'],
        ['Line Graph', 'Radar Web', 'Candlestick'],
        ['Spring Curve', 'Bezier Ease', 'Metaball'],
      ];
      return (
        <div className="w-full max-w-md mx-auto space-y-4 py-3 text-left">
          <div className="flex items-center gap-3">
            {cats.map((c, idx) => (
              <button
                key={c}
                type="button"
                onClick={() => setGlidingCat(idx)}
                className={`text-sm font-bold cursor-pointer transition-all ${
                  glidingCat === idx ? 'text-white scale-110' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {sets[glidingCat].map((item, i) => (
              <div
                key={item}
                style={{ transitionDelay: `${i * 50}ms` }}
                className="h-28 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 p-3 flex flex-col justify-between text-white animate-fade-in"
              >
                <span className="text-[10px] font-mono text-cyan-400">0{i + 1}</span>
                <span className="text-xs font-bold">{item}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'fluid-slider':
      return (
        <div className="w-full max-w-md mx-auto py-10 px-4 space-y-6">
          <div className="relative pt-10">
            <div
              style={{ left: `calc(${fluidVal}% - 22px)` }}
              className="absolute top-0 w-11 h-10 rounded-xl bg-cyan-500 text-slate-950 font-mono tabular-nums text-xs font-extrabold flex items-center justify-center shadow-lg transition-all duration-75"
            >
              {fluidVal}%
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={fluidVal}
              onChange={(e) => setFluidVal(Number(e.target.value))}
              className="w-full h-3 rounded-full bg-slate-800 accent-cyan-400 cursor-pointer"
            />
          </div>
          <div className="text-xs text-slate-400 text-center">
            Drag the slider to watch the floating liquid value bubble track horizontally.
          </div>
        </div>
      );

    case 'elongation-preview':
      return (
        <div className="flex items-center justify-center py-4">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xl text-left transition-all duration-300">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-cyan-400 font-mono">PUSH-POP CONTAINER</div>
                <div className="text-sm font-bold">Elongation Preview Card</div>
              </div>
              <button
                type="button"
                onClick={() => setElongated((e) => !e)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold cursor-pointer"
              >
                {elongated ? 'Compress' : 'Elongate'}
              </button>
            </div>
            <div
              className="transition-all duration-300 overflow-hidden bg-slate-50"
              style={{ maxHeight: elongated ? '180px' : '44px' }}
            >
              <div className="p-4 text-xs text-slate-600 space-y-2">
                <div className="font-semibold text-slate-900">Decoupled Lower Detail Sheet</div>
                {elongated && (
                  <p>
                    Top header and bottom detail sheet separate smoothly along the Y axis with zero layout jitter.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );

    case 'garland-view': {
      const lists = [
        { name: 'Swift UI', cards: ['Folding Cell', 'Circle Menu'] },
        { name: 'Charts Pack', cards: ['Line & Area', 'Radar & Pie'] },
        { name: 'Physics', cards: ['Spring Solver', 'Bezier Curves'] },
      ];
      return (
        <div className="w-full max-w-md mx-auto space-y-4 py-3">
          <div className="flex items-center justify-center gap-2">
            {lists.map((l, idx) => (
              <button
                key={l.name}
                type="button"
                onClick={() => setGarlandIdx(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all duration-300 ${
                  garlandIdx === idx
                    ? 'bg-cyan-500 text-slate-950 -translate-y-1 shadow-lg'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {l.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {lists[garlandIdx].cards.map((c) => (
              <div key={c} className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold text-left">
                {c}
              </div>
            ))}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
};

/* ========================================================================= */
/* Interactive Spring & Cubic-Bezier Physics Lab                             */
/* ========================================================================= */
const SpringPhysicsMiniLab: React.FC = () => {
  const [stiffness, setStiffness] = useState(180);
  const [damping, setDamping] = useState(14);
  const [mass, setMass] = useState(1);
  const [raceTick, setRaceTick] = useState(0);

  const curvePoints = useMemo(() => {
    const dt = 1 / 60;
    let pos = 0;
    let vel = 0;
    const pts: string[] = [];
    for (let i = 0; i <= 75; i++) {
      const x = 16 + (i / 75) * 288;
      const y = 110 - pos * 72;
      pts.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
      const accel = (-stiffness * (pos - 1) - damping * vel) / mass;
      vel += accel * dt;
      pos += vel * dt;
    }
    return pts.join(' ');
  }, [stiffness, damping, mass]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
            Interactive Motion Physics Lab
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            Harmonic Damped Spring Curve &amp; Timing Solver
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setRaceTick((t) => t + 1)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5" />
          <span>Test Spring Motion</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl p-4 border border-slate-800">
          <svg viewBox="0 0 320 135" className="w-full h-36">
            <line x1="16" y1="38" x2="304" y2="38" stroke="#334155" strokeDasharray="4 4" />
            <line x1="16" y1="110" x2="304" y2="110" stroke="#1E293B" />
            <path d={curvePoints} fill="none" stroke="#38BDF8" strokeWidth="2.8" strokeLinecap="round" />
            <text x="16" y="28" className="fill-slate-400 text-[9px] font-mono">Target = 1.0</text>
            <text x="16" y="125" className="fill-slate-500 text-[9px] font-mono">0.0s → 1.25s</text>
          </svg>
          {/* Animated comparison track */}
          <div key={raceTick} className="mt-3 pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] text-slate-400 flex justify-between">
              <span>Live Spring Translation Preview</span>
              <span className="font-mono tabular-nums text-cyan-300">
                k={stiffness} · c={damping} · m={mass}
              </span>
            </div>
            <div className="h-3 bg-slate-900 rounded-full p-0.5 overflow-hidden">
              <div
                className="h-2 w-12 rounded-full bg-cyan-400 animate-[pulse_1.1s_ease-in-out_1]"
                style={{
                  transform: raceTick % 2 === 0 ? 'translateX(0%)' : 'translateX(340%)',
                  transition: `transform ${Math.max(0.25, 1.4 - stiffness / 400).toFixed(2)}s cubic-bezier(0.34, ${Math.min(1.85, 1.1 + (28 - damping) * 0.03).toFixed(2)}, 0.64, 1)`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Stiffness (k)</span>
              <span className="font-mono tabular-nums text-blue-700">{stiffness} N/m</span>
            </div>
            <input
              type="range"
              min="60"
              max="360"
              value={stiffness}
              onChange={(e) => setStiffness(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Damping (c)</span>
              <span className="font-mono tabular-nums text-blue-700">{damping} N·s/m</span>
            </div>
            <input
              type="range"
              min="4"
              max="34"
              value={damping}
              onChange={(e) => setDamping(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Mass (m)</span>
              <span className="font-mono tabular-nums text-blue-700">{mass.toFixed(1)} kg</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={mass}
              onChange={(e) => setMass(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================= */
/* Main All-17 Swift UI Animation Components Interactive Playground          */
/* ========================================================================= */
export const SwiftUIComponentsPlayground: React.FC = () => {
  const [categoryFilter, setCategoryFilter] = useState<string>('All (17)');
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<SwiftAnimationComponentItem>(SWIFT_ANIMATION_COMPONENTS[1]); // Folding Cell default
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredComponents = useMemo(() => {
    return SWIFT_ANIMATION_COMPONENTS.filter((c) => {
      if (categoryFilter !== 'All (17)' && c.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [categoryFilter, searchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="swift-components-lab" className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 text-left">
          <div>
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Ramotion Swift UI Animation Components &amp; Libraries (All 17 Modules)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
              Interactive Swift UI Component Studio
            </h2>
          </div>

          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all 17 components..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Zone Sandbox Layout: Component Selector + Live Interactive Stage & Code Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List (All 17 Components) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-3 shadow-xs max-h-[600px] overflow-y-auto space-y-1.5 text-left">
          {filteredComponents.map((comp) => {
            const isActive = selected.id === comp.id;
            return (
              <button
                key={comp.id}
                type="button"
                onClick={() => setSelected(comp)}
                className={`w-full p-3 rounded-xl text-left transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-800 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold truncate">
                    {String(comp.number).padStart(2, '0')}. {comp.name}
                  </span>
                  <span className={`text-[10px] font-medium shrink-0 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {comp.category.split(' ')[0]}
                  </span>
                </div>
                <p className={`text-[11px] mt-1 line-clamp-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  {comp.tagline}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Interactive Stage + Swift Code & Specs */}
        <div className="lg:col-span-8 space-y-6">
          {/* Interactive Simulation Stage */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800 text-left">
              <div>
                <div className="text-[11px] font-mono text-cyan-400">
                  Component {String(selected.number).padStart(2, '0')} · {selected.category}
                </div>
                <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{selected.description}</p>
              </div>
              <a
                href={selected.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
              >
                <span>GitHub Repo</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Live Stage */}
            <div className="min-h-[270px] flex items-center justify-center py-4">
              <ComponentLiveSimulator key={selected.id} componentId={selected.id} />
            </div>

            {/* Motion Physics Footer */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
              <span>Physics: <strong className="text-slate-200">{selected.animationPhysics}</strong></span>
              <span className="font-mono text-cyan-300">{selected.easingCurve}</span>
            </div>
          </div>

          {/* Installation, Requirements & Swift Code */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Requirements</div>
                <div className="font-bold text-slate-900 mt-0.5">
                  {selected.requirements.ios} · {selected.requirements.swift} · {selected.requirements.xcode}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">CocoaPods</div>
                <div className="font-mono font-semibold text-blue-700 mt-0.5 truncate">
                  {selected.installation.cocoapods}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] text-slate-500">Carthage</div>
                <div className="font-mono font-semibold text-slate-800 mt-0.5 truncate">
                  {selected.installation.carthage}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
              <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <span className="font-mono">{selected.name.replace(/\s+/g, '')}.swift</span>
                <button
                  type="button"
                  onClick={() => handleCopy(selected.swiftCode, selected.id)}
                  className="flex items-center gap-1 text-cyan-300 hover:text-cyan-200 font-semibold cursor-pointer"
                >
                  {copiedId === selected.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === selected.id ? 'Copied' : 'Copy Swift'}</span>
                </button>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                <code>{selected.swiftCode}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Spring Physics Mini-Lab */}
      <SpringPhysicsMiniLab />
    </section>
  );
};
