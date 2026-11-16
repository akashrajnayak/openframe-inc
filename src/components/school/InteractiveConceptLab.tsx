import React, { useEffect, useRef, useState } from 'react';
import {
  Beaker,
  Calculator,
  Code2,
  Eraser,
  FlaskConical,
  PenTool,
  Play,
  RotateCcw,
  SpellCheck,
  Volume2,
} from 'lucide-react';
import { SchoolClassId, SchoolConcept, SchoolLanguage } from '../../types';
import { getLanguagePack } from '../../data/allIndiaLanguagesData';

interface InteractiveConceptLabProps {
  concept?: SchoolConcept;
  classId: SchoolClassId;
  language: SchoolLanguage;
  initialTab?: 'diagram' | 'science' | 'math' | 'code' | 'handwriting' | 'spelling';
}

export const InteractiveConceptLab: React.FC<InteractiveConceptLabProps> = ({
  concept,
  classId,
  language,
  initialTab = 'diagram',
}) => {
  const isEarlyGrades = ['LKG', 'UKG', '1', '2', '3', '4', '5'].includes(classId);
  const [activeTab, setActiveTab] = useState<'diagram' | 'science' | 'math' | 'code' | 'handwriting' | 'spelling'>(initialTab);

  // Interactive Science Lab states
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(4);
  const [phValue, setPhValue] = useState(7);

  // Interactive Math states
  const [fracNum, setFracNum] = useState(1);
  const [fracDen, setFracDen] = useState(4);
  const [sideA, setSideA] = useState(3);
  const [sideB, setSideB] = useState(4);

  // Coding Sandbox state
  const [codeText, setCodeText] = useState(
    `// Try modifying variables or loops below and click Run\nconst className = "Class ${classId}";\nlet sum = 0;\nfor (let i = 1; i <= 5; i++) {\n  sum += i;\n}\nreturn "Hello from " + className + "! Sum of 1..5 = " + sum;`
  );
  const [codeOutput, setCodeOutput] = useState<string>('Click "Run Program" to see live output.');

  const langPack = getLanguagePack(language);
  const tracePalette = langPack.traceCharacters.length > 0 ? langPack.traceCharacters : ['A', 'B', '5', 'ಅ', 'अ'];

  // Handwriting Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [traceChar, setTraceChar] = useState(tracePalette[0]);

  useEffect(() => {
    setTraceChar(tracePalette[0]);
  }, [language]);

  // Spelling Drill State
  const spellingWords = [
    { word: 'Photosynthesis', hint: 'Process by which green plants make food using sunlight' },
    { word: 'Denominator', hint: 'Bottom number showing total equal parts in a fraction' },
    { word: 'Electricity', hint: 'Flow of electric charge through a closed circuit' },
    { word: 'Constitution', hint: 'Supreme foundational rulebook of a democratic nation' },
    { word: 'Environment', hint: 'Natural surroundings of air, water, soil, and living things' },
  ];
  const [spellIdx, setSpellIdx] = useState(0);
  const [spellInput, setSpellInput] = useState('');
  const [spellFeedback, setSpellFeedback] = useState('');

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, concept?.id]);

  const currentAmps = (voltage / Math.max(0.5, resistance)).toFixed(2);
  const phColor =
    phValue < 5
      ? '#ef4444'
      : phValue < 7
      ? '#f59e0b'
      : phValue === 7
      ? '#10b981'
      : phValue < 10
      ? '#06b6d4'
      : '#6366f1';

  const hypotenuse = Math.sqrt(sideA * sideA + sideB * sideB).toFixed(2);

  const runSandboxCode = () => {
    try {
      const fn = new Function(codeText);
      const res = fn();
      setCodeOutput(res !== undefined ? String(res) : 'Program executed cleanly (no return value).');
    } catch (err: any) {
      setCodeOutput(`Syntax / Runtime Note: ${err?.message || String(err)}`);
    }
  };

  // Canvas drawing handlers
  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const pronounceWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-IN';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  };

  const checkSpelling = () => {
    const target = spellingWords[spellIdx].word;
    if (spellInput.trim().toLowerCase() === target.toLowerCase()) {
      setSpellFeedback(`Correct! "${target}" is spelled accurately.`);
    } else {
      setSpellFeedback(`Almost! Check the letters: ${target[0]}...${target.slice(-1)} (${target.length} letters).`);
    }
  };

  const renderConceptDiagramSvg = () => {
    const dtype = concept?.diagramType || 'general_concept';
    if (dtype === 'electric_circuit') {
      return (
        <svg viewBox="0 0 420 180" className="w-full max-w-md mx-auto bg-slate-50 rounded-xl border border-slate-200 p-2">
          <rect x="40" y="30" width="340" height="120" rx="12" fill="none" stroke="#1e293b" strokeWidth="3" />
          <rect x="26" y="70" width="28" height="40" rx="4" fill="#2563eb" />
          <text x="40" y="94" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">{voltage}V</text>
          <rect x="170" y="16" width="80" height="28" rx="6" fill="#0f172a" />
          <text x="210" y="34" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">R = {resistance}Ω</text>
          <circle cx="210" cy="150" r="18" fill="#fef08a" stroke="#ca8a04" strokeWidth="2.5" />
          <text x="210" y="154" textAnchor="middle" fill="#854d0e" fontSize="11" fontWeight="bold">{currentAmps}A</text>
          <text x="210" y="92" textAnchor="middle" fill="#334155" fontSize="12" fontWeight="bold">
            Ohm&apos;s Law: I = V / R = {currentAmps} A
          </text>
        </svg>
      );
    }

    if (dtype === 'fraction_bars' || dtype === 'number_line') {
      const den = Math.max(2, Math.min(8, fracDen));
      const num = Math.max(0, Math.min(den, fracNum));
      const segW = 320 / den;
      return (
        <svg viewBox="0 0 400 150" className="w-full max-w-md mx-auto bg-slate-50 rounded-xl border border-slate-200 p-2">
          <text x="200" y="28" textAnchor="middle" fill="#0f172a" fontSize="13" fontWeight="bold">
            Visual Fraction Model: {num} / {den} ({Math.round((num / den) * 100)}%)
          </text>
          {Array.from({ length: den }).map((_, i) => (
            <rect
              key={i}
              x={40 + i * segW}
              y={50}
              width={segW - 3}
              height={46}
              rx={4}
              fill={i < num ? '#2563eb' : '#e2e8f0'}
              stroke="#1e293b"
              strokeWidth="1.5"
            />
          ))}
          <text x="200" y="126" textAnchor="middle" fill="#475569" fontSize="11">
            Shaded parts = {num} (Numerator) · Total equal parts = {den} (Denominator)
          </text>
        </svg>
      );
    }

    if (dtype === 'pythagoras') {
      return (
        <svg viewBox="0 0 400 180" className="w-full max-w-md mx-auto bg-slate-50 rounded-xl border border-slate-200 p-2">
          <polygon points="100,140 280,140 100,45" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="3" />
          <rect x="100" y="126" width="14" height="14" fill="none" stroke="#1d4ed8" strokeWidth="2" />
          <text x="72" y="96" fill="#0f172a" fontSize="12" fontWeight="bold">a = {sideA}</text>
          <text x="190" y="160" textAnchor="middle" fill="#0f172a" fontSize="12" fontWeight="bold">b = {sideB}</text>
          <text x="210" y="84" fill="#1d4ed8" fontSize="12" fontWeight="bold">c = {hypotenuse}</text>
          <text x="285" y="100" fill="#334155" fontSize="11" fontWeight="bold">
            {sideA}² + {sideB}² = {hypotenuse}²
          </text>
        </svg>
      );
    }

    if (dtype === 'water_cycle') {
      return (
        <svg viewBox="0 0 420 170" className="w-full max-w-md mx-auto bg-sky-50 rounded-xl border border-sky-200 p-2">
          <circle cx="60" cy="40" r="22" fill="#fbbf24" />
          <ellipse cx="220" cy="42" rx="58" ry="20" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
          <text x="220" y="46" textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="bold">Condensation</text>
          <rect x="20" y="130" width="380" height="30" rx="6" fill="#0284c7" />
          <text x="105" y="150" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">Collection / Ocean</text>
          <line x1="120" y1="125" x2="175" y2="62" stroke="#ea580c" strokeWidth="2.5" strokeDasharray="4" />
          <text x="112" y="96" fill="#c2410c" fontSize="11" fontWeight="bold">Evaporation ↑</text>
          <line x1="255" y1="64" x2="310" y2="124" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="4" />
          <text x="325" y="96" fill="#1d4ed8" fontSize="11" fontWeight="bold">↓ Precipitation</text>
        </svg>
      );
    }

    if (dtype === 'plant_cell') {
      return (
        <svg viewBox="0 0 420 175" className="w-full max-w-md mx-auto bg-emerald-50 rounded-xl border border-emerald-200 p-2">
          <rect x="55" y="20" width="310" height="135" rx="22" fill="#dcfce7" stroke="#15803d" strokeWidth="5" />
          <ellipse cx="240" cy="88" rx="68" ry="38" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
          <text x="240" y="92" textAnchor="middle" fill="#0369a1" fontSize="11" fontWeight="bold">Central Vacuole</text>
          <circle cx="115" cy="70" r="22" fill="#a855f7" opacity="0.85" />
          <text x="115" y="74" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">Nucleus</text>
          <ellipse cx="120" cy="122" rx="20" ry="10" fill="#16a34a" />
          <text x="165" y="126" fill="#14532d" fontSize="10" fontWeight="bold">Chloroplast (Photosynthesis)</text>
          <text x="210" y="168" textAnchor="middle" fill="#166534" fontSize="10" fontWeight="bold">Rigid Cellulose Cell Wall (Outer Boundary)</text>
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 420 150" className="w-full max-w-md mx-auto bg-slate-50 rounded-xl border border-slate-200 p-2">
        <rect x="20" y="45" width="110" height="54" rx="10" fill="#1d4ed8" />
        <text x="75" y="76" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">1. Core Idea</text>
        <line x1="130" y1="72" x2="155" y2="72" stroke="#475569" strokeWidth="2.5" />
        <rect x="155" y="45" width="110" height="54" rx="10" fill="#0284c7" />
        <text x="210" y="76" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">2. Worked Steps</text>
        <line x1="265" y1="72" x2="290" y2="72" stroke="#475569" strokeWidth="2.5" />
        <rect x="290" y="45" width="110" height="54" rx="10" fill="#059669" />
        <text x="345" y="76" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold">3. Mastery</text>
      </svg>
    );
  };

  const tabs = [
    { id: 'diagram' as const, label: 'Concept Diagram', icon: FlaskConical },
    { id: 'science' as const, label: 'Virtual Science Lab', icon: Beaker },
    { id: 'math' as const, label: 'Math Lab', icon: Calculator },
    { id: 'code' as const, label: 'Coding Sandbox', icon: Code2 },
    ...(isEarlyGrades ? [{ id: 'handwriting' as const, label: 'Handwriting Pad (LKG–5)', icon: PenTool }] : [{ id: 'handwriting' as const, label: 'Sketch / Writing Pad', icon: PenTool }]),
    { id: 'spelling' as const, label: 'Spelling & Reading', icon: SpellCheck },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-[#0B1930] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-5">
        {activeTab === 'diagram' && (
          <div className="space-y-4">
            <div className="text-xs font-bold text-slate-800">{concept?.diagramCaption || 'Interactive Curriculum Visual Diagram'}</div>
            {renderConceptDiagramSvg()}
          </div>
        )}

        {activeTab === 'science' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Experiment 1 · Ohm&apos;s Law Circuit Simulator
              </div>
              <div className="space-y-2 text-xs">
                <label className="flex justify-between font-semibold text-slate-700">
                  <span>Voltage (V): {voltage} V</span>
                  <input type="range" min={1} max={24} value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} className="w-36" />
                </label>
                <label className="flex justify-between font-semibold text-slate-700">
                  <span>Resistance (R): {resistance} Ω</span>
                  <input type="range" min={1} max={20} value={resistance} onChange={(e) => setResistance(Number(e.target.value))} className="w-36" />
                </label>
              </div>
              <div className="p-3 rounded-lg bg-white border border-blue-200 text-xs font-mono text-blue-800 font-bold tabular-nums">
                Current I = V / R = {currentAmps} A · Power = {(voltage * Number(currentAmps)).toFixed(1)} W
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Experiment 2 · Acid-Base Litmus pH Indicator
              </div>
              <label className="flex justify-between items-center text-xs font-semibold text-slate-700">
                <span>Solution pH: {phValue}</span>
                <input type="range" min={1} max={14} value={phValue} onChange={(e) => setPhValue(Number(e.target.value))} className="w-40" />
              </label>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200">
                <div className="w-10 h-10 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: phColor }} />
                <div className="text-xs text-slate-700">
                  <div className="font-bold">
                    {phValue < 7 ? 'Acidic (Turns Blue Litmus Red)' : phValue === 7 ? 'Neutral (Pure Water)' : 'Basic / Alkaline (Turns Red Litmus Blue)'}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {phValue <= 3 ? 'Examples: Lemon juice, Vinegar' : phValue === 7 ? 'Examples: Distilled water' : 'Examples: Baking soda, Soap solution'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'math' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fraction Bar Explorer</div>
              <div className="space-y-2 text-xs">
                <label className="flex justify-between font-semibold">
                  <span>Numerator: {fracNum}</span>
                  <input type="range" min={1} max={fracDen} value={fracNum} onChange={(e) => setFracNum(Number(e.target.value))} />
                </label>
                <label className="flex justify-between font-semibold">
                  <span>Denominator: {fracDen}</span>
                  <input type="range" min={2} max={8} value={fracDen} onChange={(e) => { const d = Number(e.target.value); setFracDen(d); if (fracNum > d) setFracNum(d); }} />
                </label>
              </div>
              <div className="text-xs font-bold text-blue-700 tabular-nums">
                Fraction = {fracNum}/{fracDen} · Percentage = {Math.round((fracNum / fracDen) * 100)}%
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Right Triangle &amp; Pythagoras Explorer</div>
              <div className="space-y-2 text-xs">
                <label className="flex justify-between font-semibold">
                  <span>Side a: {sideA} cm</span>
                  <input type="range" min={2} max={12} value={sideA} onChange={(e) => setSideA(Number(e.target.value))} />
                </label>
                <label className="flex justify-between font-semibold">
                  <span>Side b: {sideB} cm</span>
                  <input type="range" min={2} max={12} value={sideB} onChange={(e) => setSideB(Number(e.target.value))} />
                </label>
              </div>
              <div className="text-xs font-bold text-indigo-700 tabular-nums">
                Hypotenuse c = √({sideA}² + {sideB}²) = {hypotenuse} cm
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-slate-800">Interactive Coding Sandbox (Algorithm &amp; JS Runner)</div>
              <button
                type="button"
                onClick={runSandboxCode}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Program</span>
              </button>
            </div>
            <textarea
              value={codeText}
              onChange={(e) => setCodeText(e.target.value)}
              rows={6}
              className="w-full font-mono text-xs bg-slate-900 text-sky-300 rounded-xl p-3 border border-slate-700 focus:outline-hidden"
            />
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 font-mono text-xs text-slate-800">
              <span className="font-bold text-slate-500 mr-2">Output:</span>
              {codeOutput}
            </div>
          </div>
        )}

        {activeTab === 'handwriting' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-800">Trace Character ({langPack.scriptName}):</span>
                {tracePalette.map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => { setTraceChar(ch); clearCanvas(); }}
                    className={`w-7 h-7 rounded border font-bold cursor-pointer ${
                      traceChar === ch ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={clearCanvas}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>Clear Pad</span>
              </button>
            </div>
            <div className="relative bg-amber-50/40 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden select-none">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[130px] font-bold text-slate-200/75">
                {traceChar}
              </div>
              <canvas
                ref={canvasRef}
                width={560}
                height={180}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="relative z-10 w-full h-44 cursor-crosshair touch-none"
              />
            </div>
          </div>
        )}

        {activeTab === 'spelling' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800">Listen &amp; Spell Challenge ({spellIdx + 1}/{spellingWords.length})</div>
                <p className="text-xs text-slate-500 mt-0.5">Clue: {spellingWords[spellIdx].hint}</p>
              </div>
              <button
                type="button"
                onClick={() => pronounceWord(spellingWords[spellIdx].word)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Word</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={spellInput}
                onChange={(e) => setSpellInput(e.target.value)}
                placeholder="Type the spelling you hear..."
                className="flex-1 min-w-[200px] px-3 py-2 text-xs border border-slate-300 rounded-lg"
              />
              <button
                type="button"
                onClick={checkSpelling}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                Check Spelling
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpellIdx((i) => (i + 1) % spellingWords.length);
                  setSpellInput('');
                  setSpellFeedback('');
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Next Word</span>
              </button>
            </div>
            {spellFeedback && <div className="text-xs font-bold text-blue-700">{spellFeedback}</div>}
          </div>
        )}
      </div>
    </div>
  );
};
