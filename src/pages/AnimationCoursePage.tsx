import React, { useState } from 'react';
import { Link } from '../router/RouterContext';
import {
  Download,
  FileArchive,
  FolderOpen,
  FileCode2,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  GraduationCap,
  BarChart3,
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import {
  ANIMATION_COURSE_ZIP_PACKS,
  ARCHIVE_PREVIEW_FILES,
  ArchivePreviewFile
} from '../data/animationCourseData';
import { AnimatedChartsGallery } from '../components/animation/AnimatedChartsGallery';
import { SwiftUIComponentsPlayground } from '../components/animation/SwiftUIComponentsPlayground';
import { StudentRegistrationModal } from '../components/common/StudentRegistrationModal';

type SectionView = 'all' | 'charts' | 'components' | 'zips';

export const AnimationCoursePage: React.FC = () => {
  const [sectionView, setSectionView] = useState<SectionView>('all');
  const [selectedFile, setSelectedFile] = useState<ArchivePreviewFile>(ARCHIVE_PREVIEW_FILES[0]);
  const [copiedFile, setCopiedFile] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState(false);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const handleCopyFile = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadSingleFile = (file: ArchivePreviewFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'course-file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* ================================================================= */}
      {/* HERO SECTION                                                      */}
      {/* ================================================================= */}
      <section className="bg-gradient-to-b from-[#071326] via-[#0B1930] to-[#0F2342] text-white pt-16 pb-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link to="/" className="hover:text-cyan-300">Home</Link>
            <span aria-hidden="true">/</span>
            <Link to="/education" className="hover:text-cyan-300">Education</Link>
            <span aria-hidden="true">/</span>
            <Link to="/marketplace" className="hover:text-cyan-300">Course Marketplace</Link>
          </div>

          {/* 2-Column Hero Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-4">
                <div className="text-xs font-medium text-cyan-300">
                  OpenFrame Education · Ramotion Swift UI Course Pack · MIT Licensed
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight leading-[1.12] text-balance">
                  Swift UI Animations, Graphs &amp; Charts Course
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Complete downloadable course ZIP packages paired with live interactive browser sandboxes for all 17 Ramotion Swift UI animation components, 12 animated data visualization charts, and damped spring physics solvers.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="/downloads/animation-course/swift-ui-animation-components-master-pack.zip"
                  download
                  className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Master Course ZIP (31 KB)</span>
                </a>

                <Link
                  to="/learn/OF-CRS-ANIM-001"
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Open in Quinn AI LMS</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsRegOpen(true)}
                  className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold text-sm transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <GraduationCap className="w-4 h-4 text-cyan-300" />
                  <span>Enroll &amp; Get Certificate</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative h-full min-h-[260px] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-2xl">
                {!heroImgFailed ? (
                  <img
                    src="/assets/images/swift_animation_course_hero.jpg"
                    alt="Swift UI Animation Components and Animated Charts Course"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center">
                    <BarChart3 className="w-12 h-12 text-cyan-400 mb-2" />
                    <div className="text-sm font-bold text-white">Swift UI Motion &amp; Charts Studio</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071326]/90 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-left">
                  <div className="text-xs font-semibold text-cyan-300">
                    Source Repository: Ramotion / swift-ui-animation-components-and-libraries
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Includes AppDelegate.swift, README.md, 17 iOS modules, 12 chart types &amp; spring physics
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column KPI Strip Below Hero Split */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-800 text-left">
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-2xl font-extrabold text-white tabular-nums">17</div>
              <div className="text-xs text-slate-400 mt-0.5">Ramotion Swift UI Components</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-2xl font-extrabold text-cyan-300 tabular-nums">12</div>
              <div className="text-xs text-slate-400 mt-0.5">Interactive Animated Chart Types</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-2xl font-extrabold text-white tabular-nums">5</div>
              <div className="text-xs text-slate-400 mt-0.5">Ready-to-Download Course ZIPs</div>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
              <div className="text-2xl font-extrabold text-emerald-400 tabular-nums">60 fps</div>
              <div className="text-xs text-slate-400 mt-0.5">Hardware-Accelerated Motion</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* STICKY SECTION FILTER BAR                                         */}
      {/* ================================================================= */}
      <div className="bg-white border-b border-slate-200 sticky top-[68px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 overflow-x-auto">
            {[
              { id: 'all', label: 'Everything (Full Course)' },
              { id: 'zips', label: 'Course ZIP Downloads (5)' },
              { id: 'charts', label: 'Graphs & Charts (12)' },
              { id: 'components', label: 'Swift UI Animations (17)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSectionView(tab.id as SectionView)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  sectionView === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="https://github.com/Ramotion/swift-ui-animation-components-and-libraries.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-blue-700 font-semibold flex items-center gap-1 whitespace-nowrap"
            >
              <span>GitHub Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <span className="text-slate-300" aria-hidden="true">·</span>
            <Link
              to="/marketplace/OF-CRS-ANIM-001"
              className="text-blue-700 hover:underline font-semibold flex items-center gap-1 whitespace-nowrap"
            >
              <span>Course Syllabus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* MAIN STUDIO WORKSPACE                                             */}
      {/* ================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
        {/* 1. COURSE ZIP PACKAGES & INTERACTIVE ARCHIVE INSPECTOR */}
        {(sectionView === 'all' || sectionView === 'zips') && (
          <section id="zip-downloads" className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-left">
              <div>
                <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                  Downloadable Course Materials &amp; Source Code
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                  Animation Course ZIP Files &amp; Repository Archive
                </h2>
                <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                  Download the complete master bundle or individual topic ZIP packs directly from OpenFrame, or fetch the raw upstream GitHub archive.
                </p>
              </div>
              <a
                href="https://github.com/Ramotion/swift-ui-animation-components-and-libraries/archive/refs/heads/master.zip"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-300" />
                <span>GitHub Upstream master.zip</span>
              </a>
            </div>

            {/* 5 ZIP Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {ANIMATION_COURSE_ZIP_PACKS.map((pack, idx) => (
                <div
                  key={pack.id}
                  className={`rounded-2xl p-6 border flex flex-col justify-between text-left transition-colors ${
                    idx === 0
                      ? 'md:col-span-2 lg:col-span-3 bg-slate-900 text-white border-slate-800 shadow-lg'
                      : 'bg-white text-slate-800 border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className={`font-semibold ${idx === 0 ? 'text-cyan-300' : 'text-blue-700'}`}>
                        {pack.badge}
                      </span>
                      <span className={`font-mono tabular-nums ${idx === 0 ? 'text-slate-300' : 'text-slate-500'}`}>
                        {pack.fileCount} files · {pack.sizeLabel}
                      </span>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        idx === 0 ? 'bg-blue-600/30 text-cyan-300' : 'bg-blue-50 text-blue-700'
                      }`}>
                        <FileArchive className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`text-base sm:text-lg font-bold ${idx === 0 ? 'text-white' : 'text-slate-900'}`}>
                          {pack.title}
                        </h3>
                        <p className={`text-xs mt-1 ${idx === 0 ? 'text-slate-300' : 'text-slate-600'}`}>
                          {pack.subtitle}
                        </p>
                      </div>
                    </div>

                    <ul className={`space-y-1 pt-2 border-t text-xs ${
                      idx === 0 ? 'border-slate-800 text-slate-300' : 'border-slate-100 text-slate-600'
                    }`}>
                      {pack.contents.map((line) => (
                        <li key={line} className="truncate">
                          · {line}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-5 flex flex-wrap items-center justify-between gap-3">
                    <span className={`font-mono text-[11px] truncate ${idx === 0 ? 'text-slate-400' : 'text-slate-500'}`}>
                      {pack.filename}
                    </span>
                    <a
                      href={pack.downloadUrl}
                      download={pack.filename}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                        idx === 0
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-slate-900 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download ZIP</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive ZIP Archive File Explorer */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
                <div className="flex items-center gap-2 text-xs font-bold">
                  <FolderOpen className="w-4 h-4 text-cyan-400" />
                  <span>ZIP Archive Contents Inspector — Preview Source Files Before Downloading</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  swift-ui-animation-components-master-pack.zip
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* File Tree Sidebar */}
                <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 p-3 space-y-1 bg-slate-50 text-left">
                  {ARCHIVE_PREVIEW_FILES.map((file) => {
                    const active = selectedFile.path === file.path;
                    return (
                      <button
                        key={file.path}
                        type="button"
                        onClick={() => setSelectedFile(file)}
                        className={`w-full px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer flex items-start gap-2.5 ${
                          active ? 'bg-slate-900 text-white' : 'hover:bg-slate-200/70 text-slate-800'
                        }`}
                      >
                        <FileCode2 className={`w-4 h-4 shrink-0 mt-0.5 ${active ? 'text-cyan-400' : 'text-blue-600'}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-mono font-semibold truncate">{file.path}</div>
                          <div className={`text-[11px] truncate ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                            {file.folder}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* File Content Viewer */}
                <div className="lg:col-span-8 flex flex-col text-left">
                  <div className="px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-white">
                    <div>
                      <div className="text-xs font-mono font-bold text-slate-900">{selectedFile.path}</div>
                      <div className="text-[11px] text-slate-500">{selectedFile.description}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyFile}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedFile ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadSingleFile(selectedFile)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download File</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-5 bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-80 leading-relaxed flex-1">
                    <code>{selectedFile.content}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. ALL 12 ANIMATED GRAPHS & CHARTS GALLERY */}
        {(sectionView === 'all' || sectionView === 'charts') && <AnimatedChartsGallery />}

        {/* 3. ALL 17 RAMOTION SWIFT UI ANIMATION COMPONENTS + PHYSICS LAB */}
        {(sectionView === 'all' || sectionView === 'components') && <SwiftUIComponentsPlayground />}

        {/* 4. COURSE CERTIFICATION & LMS ENROLMENT CTA */}
        <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 sm:p-8 text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 text-left">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
              Verified OpenFrame Certification · Course ID OF-CRS-ANIM-001
            </div>
            <h2 className="text-2xl font-bold">
              Complete the Practical Capstone &amp; Earn Your Certificate
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Take the Quinn AI verification quiz, submit an interactive chart or Swift animation project inside the LMS workspace, and earn a publicly verifiable OpenFrame certificate.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/learn/OF-CRS-ANIM-001"
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4" />
              <span>Launch LMS Workspace</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsRegOpen(true)}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 cursor-pointer whitespace-nowrap"
            >
              Enroll for Mentored Track
            </button>
          </div>
        </section>
      </main>

      <StudentRegistrationModal
        isOpen={isRegOpen}
        onClose={() => setIsRegOpen(false)}
        courseTitle="Swift UI Animation Components, Graphs & Charts Masterclass"
        courseId="OF-CRS-ANIM-001"
        courseCategory="Animation"
      />
    </div>
  );
};
