import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  Activity,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
  Share2,
  ImageIcon,
  FileText
} from 'lucide-react';
import { ResearchInfographic, Publication } from '../types';

interface ResearchInfographicModalProps {
  isOpen: boolean;
  onClose: () => void;
  infographic: ResearchInfographic;
  publication?: Publication;
}

export const ResearchInfographicModal: React.FC<ResearchInfographicModalProps> = ({
  isOpen,
  onClose,
  infographic,
  publication
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const posterImage =
    infographic.customImageUrl ||
    infographic.customImageBase64 ||
    publication?.infographicImageUrl ||
    publication?.infographicImageBase64 ||
    '';

  const [activeView, setActiveView] = useState<'poster' | 'details'>(() => (posterImage ? 'poster' : 'details'));

  if (!isOpen) return null;

  const handleCopyText = () => {
    const text = `SCIENTIFIC RESEARCH INFOGRAPHIC
Title: ${infographic.title}
Authors: ${infographic.authorsText}

RESEARCH PROBLEM & BACKGROUND:
${infographic.problemStatement}

OBJECTIVES:
${infographic.objectives}

METHODOLOGY & ALGORITHMS:
${infographic.methodology.map((m, i) => `${i + 1}. ${m}`).join('\n')}

DATA & RESEARCH OBJECT:
${infographic.dataAndObject}

KEY FINDINGS:
${infographic.keyFindings.map((f, i) => `• ${f}`).join('\n')}

CONCLUSIONS & SCIENTIFIC CONTRIBUTION:
${infographic.conclusions}

SOURCE:
${infographic.doiOrSource}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // High-resolution Canvas PNG Export
  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 1200;
      canvas.height = 1600;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Banner
      ctx.fillStyle = '#0f172a'; // Deep Slate Navy
      ctx.fillRect(40, 40, canvas.width - 80, 200);

      // University Identity
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.fillText('SEBELAS MARET UNIVERSITY • FMIPA • DEPARTMENT OF MATHEMATICS', 70, 85);

      // Infographic Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px Newsreader, serif';
      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
        const words = text.split(' ');
        let line = '';
        let currentY = y;
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + ' ';
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, currentY);
        return currentY;
      };

      wrapText(infographic.title, 70, 130, canvas.width - 140, 36);

      // Authors
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '16px Inter, sans-serif';
      ctx.fillText(`Authors: ${infographic.authorsText}`, 70, 215);

      // Body Section 1: Problem & Objective
      let curY = 280;
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText('1. BACKGROUND & RESEARCH OBJECTIVES', 60, curY);

      curY += 30;
      ctx.fillStyle = '#334155';
      ctx.font = '17px Inter, sans-serif';
      curY = wrapText(`Problem: ${infographic.problemStatement}`, 60, curY, canvas.width - 120, 26);

      curY += 25;
      curY = wrapText(`Objective: ${infographic.objectives}`, 60, curY, canvas.width - 120, 26);

      // Body Section 2: Methodology
      curY += 45;
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText('2. METHODOLOGY & ALGORITHMIC FORMULATION', 60, curY);

      curY += 30;
      ctx.fillStyle = '#334155';
      ctx.font = '16px Inter, sans-serif';
      infographic.methodology.forEach((m, idx) => {
        curY = wrapText(`[Phase ${idx + 1}] ${m}`, 70, curY, canvas.width - 140, 25);
        curY += 10;
      });

      // Body Section 3: Data & Key Findings
      curY += 35;
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText('3. KEY FINDINGS & VALIDATION', 60, curY);

      curY += 30;
      ctx.fillStyle = '#334155';
      ctx.font = '16px Inter, sans-serif';
      curY = wrapText(`Object/Dataset: ${infographic.dataAndObject}`, 60, curY, canvas.width - 120, 25);

      curY += 20;
      infographic.keyFindings.forEach((f) => {
        curY = wrapText(`• ${f}`, 70, curY, canvas.width - 140, 25);
        curY += 10;
      });

      // Highlight Box
      if (infographic.highlightMetric) {
        curY += 20;
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(60, curY, canvas.width - 120, 70);
        ctx.strokeStyle = '#cbd5e1';
        ctx.strokeRect(60, curY, canvas.width - 120, 70);

        ctx.fillStyle = '#047857';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.fillText(infographic.highlightMetric.value, 90, curY + 45);

        ctx.fillStyle = '#475569';
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText(`— ${infographic.highlightMetric.label}`, 300, curY + 45);
        curY += 90;
      }

      // Conclusion & Footer Source
      curY += 25;
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText('4. CONCLUSIONS & SCIENTIFIC CONTRIBUTION', 60, curY);

      curY += 30;
      ctx.fillStyle = '#334155';
      ctx.font = '16px Inter, sans-serif';
      curY = wrapText(infographic.conclusions, 60, curY, canvas.width - 120, 25);

      // Watermark / Source line at bottom
      ctx.fillStyle = '#64748b';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(infographic.doiOrSource, 60, canvas.height - 50);
      ctx.fillText(`Synthesized & Verified via Academic Portfolio of Nughthoh Arfawi Kurdhi, UNS`, 60, canvas.height - 30);

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Infographic_${(infographic.title || 'Research').slice(0, 30).replace(/\W+/g, '_')}.png`;
      a.click();
    } catch (err) {
      console.error('PNG export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-stone-50 border-b border-stone-200 shrink-0 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-sky-100 text-[#004b87] rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900">
                Infografik Publikasi Ilmiah &amp; Riset
              </h4>
              <p className="text-[11px] text-stone-500 font-mono">
                Status: {infographic.status === 'Published' ? 'Terverifikasi & Publik' : 'Draft Peneliti'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher if poster exists */}
            {posterImage && (
              <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setActiveView('poster')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    activeView === 'poster' ? 'bg-white text-[#004b87] shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Poster Gambar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('details')}
                  className={`px-3 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                    activeView === 'details' ? 'bg-white text-[#004b87] shadow-2xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Rincian &amp; Metrik</span>
                </button>
              </div>
            )}

            <button
              onClick={handleCopyText}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Copy Summary Text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={() => {
                if (posterImage && activeView === 'poster') {
                  const a = document.createElement('a');
                  a.href = posterImage;
                  a.download = `Infografik_Kurdhi_${(infographic.title || 'Paper').slice(0, 30).replace(/\W+/g, '_')}.png`;
                  a.click();
                } else {
                  handleExportPNG();
                }
              }}
              disabled={isExporting}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Download Graphic"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{isExporting ? 'Processing...' : 'Download PNG'}</span>
            </button>

            <button
              onClick={handlePrintPdf}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-900 hover:bg-stone-200/80 rounded-lg transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable & Scrollable Academic Canvas Area */}
        <div
          id="printable-infographic-area"
          ref={containerRef}
          className="p-6 sm:p-10 overflow-y-auto space-y-8 bg-stone-50/30 text-stone-900 flex-1"
        >
          {activeView === 'poster' && posterImage ? (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white p-2 flex items-center justify-center">
                <img
                  src={posterImage}
                  alt={infographic.title}
                  className="max-h-[75vh] w-auto object-contain rounded-xl"
                />
              </div>
              <div className="text-center">
                <span className="text-xs text-slate-500 font-mono">
                  {infographic.doiOrSource || 'Arsip Publikasi FMIPA Universitas Sebelas Maret (UNS)'}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Institutional Header Banner */}
              <div className="border-b-2 border-stone-900 pb-6 space-y-3">
                <div className="flex items-center justify-between text-xs tracking-wider uppercase text-stone-500 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#004b87]" />
                    <span>Universitas Sebelas Maret • FMIPA</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#004b87]">
                    Department of Mathematics • Mathematical Modelling & Optimization
                  </span>
                </div>

            <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold leading-tight text-stone-950">
              {infographic.title}
            </h2>

            <div className="text-sm text-stone-700 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-stone-900">Authors:</span>
              <span>{infographic.authorsText}</span>
            </div>

            <div className="flex items-center gap-3 pt-1 text-xs text-stone-500">
              <span className="flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Scientific Integrity</span>
              </span>
              <span>•</span>
              <span className="font-mono">{infographic.doiOrSource}</span>
            </div>
          </div>

          {/* Grid Layout: 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Problem & Objectives */}
            <div className="space-y-6">
              {/* Problem Statement Card */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs tracking-wider uppercase">
                  <Activity className="w-4 h-4 text-amber-600" />
                  <span>1. Background & Research Problem</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans text-justify">
                  {infographic.problemStatement}
                </p>
              </div>

              {/* Research Objectives Card */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs tracking-wider uppercase">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <span>2. Research Objectives</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans text-justify">
                  {infographic.objectives}
                </p>
              </div>

              {/* Data & Object Card */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs tracking-wider uppercase">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>3. Research Object & Data Parameters</span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans text-justify">
                  {infographic.dataAndObject}
                </p>
              </div>
            </div>

            {/* Right Column: Methodology & Key Findings */}
            <div className="space-y-6">
              {/* Methodology Flow */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs tracking-wider uppercase">
                  <Layers className="w-4 h-4 text-stone-700" />
                  <span>4. Methodology & Algorithms</span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  {infographic.methodology.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2 rounded-lg bg-stone-50 border border-stone-100"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#004b87] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-stone-700 leading-snug">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Findings */}
              <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-semibold text-xs tracking-wider uppercase">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>5. Key Research Findings</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
                  {infographic.keyFindings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span className="leading-relaxed">{finding}</span>
                    </li>
                  ))}
                </ul>

                {/* Highlight Metric Callout */}
                {infographic.highlightMetric && (
                  <div className="mt-4 p-3.5 rounded-lg bg-[#004b87] text-white flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-sky-200 uppercase tracking-wider font-medium">
                        {infographic.highlightMetric.label}
                      </div>
                      <div className="font-serif-academic text-xl sm:text-2xl font-bold text-amber-300">
                        {infographic.highlightMetric.value}
                      </div>
                    </div>
                    <Award className="w-8 h-8 text-sky-200 shrink-0" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full-width Conclusions Card */}
          <div className="bg-stone-100/80 p-5 rounded-xl border border-stone-300 space-y-2">
            <div className="font-semibold text-xs tracking-wider uppercase text-stone-900">
              6. Conclusions & Scientific Contribution
            </div>
            <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans text-justify">
              {infographic.conclusions}
            </p>
          </div>

            {/* Official Source & Verification Footnote */}
            <div className="pt-4 border-t border-stone-200 text-xs text-stone-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="font-semibold text-stone-700">Primary Document Source:</span>{' '}
                <span>{infographic.doiOrSource}</span>
              </div>
              <div className="text-[11px] font-mono">
                Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D. • Universitas Sebelas Maret
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
