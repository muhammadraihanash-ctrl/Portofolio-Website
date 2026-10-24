import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Printer,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Award,
  Layers,
  Sparkles,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Mail,
  School,
  CheckCircle2
} from 'lucide-react';
import { ProfessorProfile } from '../types';
import { UNSLogo } from './UNSLogo';

interface CVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfessorProfile;
}

export const CVPreviewModal: React.FC<CVPreviewModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  const [viewMode, setViewMode] = useState<'interactive' | 'pdf'>('interactive');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const pdfUrl = profile.cvPdfUrl || '/api/profile/cv-pdf';
  const downloadUrl = '/api/profile/cv-pdf/download';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className={`relative w-full ${
          isFullscreen ? 'max-w-7xl h-[96vh]' : 'max-w-5xl max-h-[92vh]'
        } bg-white rounded-2xl shadow-2xl border border-sky-200 overflow-hidden my-auto flex flex-col transition-all duration-300`}
      >
        {/* Top Header & Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-900 via-[#003865] to-[#004b87] text-white shrink-0 border-b border-sky-900/50 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-white/10 rounded-xl border border-white/15 shrink-0">
              <FileText className="w-5 h-5 text-sky-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-sky-200">
                  Official Academic Document
                </span>
                <span className="text-white/40">•</span>
                <span className="text-[11px] bg-sky-400/20 text-sky-200 border border-sky-300/30 px-2 py-0.5 rounded-full font-mono">
                  FMIPA UNS
                </span>
              </div>
              <h3 className="font-serif-academic text-base sm:text-lg font-bold text-white truncate">
                Curriculum Vitae — {profile.name}
              </h3>
            </div>
          </div>

          {/* Mode Switcher & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Direct Official Link */}
            <a
              href={profile.cvPdfUrl || 'https://expert.uns.ac.id/researcher/1091?export=cv'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              title="Open Official UNS Expert CV Export"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">UNS Export CV</span>
            </a>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-black/25 p-1 rounded-xl border border-white/15 text-xs">
              <button
                onClick={() => setViewMode('interactive')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  viewMode === 'interactive'
                    ? 'bg-white text-[#004b87] font-bold shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Interactive
              </button>
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                  viewMode === 'pdf'
                    ? 'bg-white text-[#004b87] font-bold shadow-xs'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <span>PDF Document</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              </button>
            </div>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
              title="Print CV"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-lg transition-colors border border-white/10"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-3 sm:p-6 flex justify-center">
          {viewMode === 'pdf' ? (
            /* PDF Direct Embedded Viewer / Fallback */
            <div className="w-full h-[70vh] bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden flex flex-col">
              <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span className="font-mono text-[11px] text-slate-500">
                  Target Berkas: {profile.cvPdfFileName || 'CV_Nughthoh_Arfawi_Kurdhi_UNS.pdf'}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#004b87] hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Buka Tab Baru</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                title="CV PDF Preview"
                className="w-full flex-1 border-0"
              />
            </div>
          ) : (
            /* Academic Curated Interactive Document Sheet (A4 Proportion) */
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg border border-slate-300 p-6 sm:p-10 text-slate-900 space-y-8 font-sans">
              {/* Document Official UNS Header */}
              <div className="border-b-2 border-slate-900 pb-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <UNSLogo className="w-12 h-12 shrink-0 drop-shadow-xs" />
                    <div>
                      <div className="text-[11px] font-bold tracking-widest text-[#004b87] uppercase font-mono">
                        SEBELAS MARET UNIVERSITY (UNS)
                      </div>
                      <div className="text-xs font-semibold text-slate-700">
                        {profile.faculty} • {profile.department}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Study Program: {profile.programStudi}
                      </div>
                    </div>
                  </div>

                  {/* Photo & Document Stamp */}
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-300 shadow-xs shrink-0 bg-slate-100">
                      <img
                        src={profile.photoBase64 || profile.photoUrl || '/nughthoh_photo.webp'}
                        alt={profile.name}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (!img.src.includes('/nughthoh_photo.webp') && !img.src.includes('/nughthoh_photo.jpg')) {
                            img.src = '/nughthoh_photo.webp';
                          } else if (!img.src.includes('/nughthoh_photo.jpg')) {
                            img.src = '/nughthoh_photo.jpg';
                          }
                        }}
                      />
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-mono hidden sm:block">
                      <div className="font-bold text-slate-800">PORTAL AKADEMIK</div>
                      <div>Diverifikasi Digital</div>
                      <div className="text-[#004b87] font-semibold">FMIPA UNS 2026</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200">
                  <div className="text-center">
                    <h1 className="font-serif-academic text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                      CURRICULUM VITAE
                    </h1>
                    <p className="font-serif text-sm font-semibold text-[#004b87] mt-0.5">
                      {profile.name}
                    </p>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">
                      Email: {profile.email} • Lokasi: {profile.location}
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Academic Biography / Personal Profile */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-mono flex items-center justify-between">
                  <span>I. Personal Profile & Bio</span>
                  <span className="text-[10px] text-slate-400 font-normal">Authentic Faculty Bio</span>
                </h2>
                <div className="text-xs leading-relaxed text-slate-700 space-y-2 text-justify">
                  {profile.bio.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* 2. Research Interests */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-mono">
                  II. Research Interests (Bidang Penelitian)
                </h2>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.researchInterests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-sky-50 text-[#004b87] border border-sky-200 rounded text-[11px] font-semibold"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3. Education History */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-mono flex items-center justify-between">
                  <span>III. Education History (Riwayat Pendidikan)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Tertiary Education</span>
                </h2>
                <div className="space-y-3 pt-1">
                  {profile.education.map((edu, idx) => (
                    <div key={edu.id || idx} className="text-xs border-l-2 border-[#004b87] pl-3 py-0.5">
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span className="text-[#004b87] font-bold">
                          {edu.year} — {edu.degree}, {edu.field}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Lulus {edu.year}
                        </span>
                      </div>
                      <div className="text-slate-700 font-medium">{edu.institution}</div>
                      {edu.thesisTitle && (
                        <div className="text-[11px] text-slate-500 italic mt-0.5">
                          Disertasi/Tesis: "{edu.thesisTitle}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Work History */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-mono flex items-center justify-between">
                  <span>IV. Work History (Pengalaman Kerja & Peneliti)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Academic Appointments</span>
                </h2>
                <div className="space-y-3 pt-1">
                  {profile.workHistory.map((work, idx) => (
                    <div key={work.id || idx} className="text-xs border-l-2 border-sky-600 pl-3 py-0.5">
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span className="text-slate-900 font-bold">
                          {work.period} — {work.role}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {work.period}
                        </span>
                      </div>
                      <div className="text-[#004b87] font-medium">{work.institution}</div>
                      {work.description && (
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          {work.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Academic Performance & Research Metrics */}
              <div className="space-y-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 font-mono flex items-center justify-between">
                  <span>V. Academic Achievements & Research Metrics</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {profile.achievements.notes}
                  </span>
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 pt-1 text-center">
                  <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="text-base font-extrabold text-[#004b87] font-mono">
                      {profile.achievements.penelitian}
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold mt-0.5">Penelitian</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="text-base font-extrabold text-[#004b87] font-mono">
                      {profile.achievements.p2m}
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold mt-0.5">P2M</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="text-base font-extrabold text-[#004b87] font-mono">
                      {profile.achievements.scopus}
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold mt-0.5">Scopus</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="text-base font-extrabold text-[#004b87] font-mono">
                      {profile.achievements.nonScopus}
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold mt-0.5">Non-Scopus</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="text-base font-extrabold text-[#004b87] font-mono">
                      {profile.achievements.prosiding}
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold mt-0.5">Prosiding</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="text-base font-extrabold text-[#004b87] font-mono">
                      {profile.achievements.buku}
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold mt-0.5">Buku</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="text-base font-extrabold text-[#004b87] font-mono">
                      {profile.achievements.paten}
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold mt-0.5">Paten</div>
                  </div>
                  <div className="p-2 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="text-base font-extrabold text-[#004b87] font-mono">
                      {profile.achievements.hki}
                    </div>
                    <div className="text-[9px] text-slate-600 uppercase font-bold mt-0.5">HKI</div>
                  </div>
                </div>
              </div>

              {/* 6. External Profiles & Verification Footer */}
              <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <a
                    href={profile.googleScholarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#004b87] underline"
                  >
                    Google Scholar
                  </a>
                  <span>•</span>
                  <a
                    href={profile.scopusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#004b87] underline"
                  >
                    Scopus
                  </a>
                  <span>•</span>
                  <a
                    href={profile.orcidUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#004b87] underline"
                  >
                    ORCID
                  </a>
                  <span>•</span>
                  <a
                    href={profile.sintaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#004b87] underline"
                  >
                    SINTA UNS
                  </a>
                </div>
                <div className="text-[11px] font-mono text-slate-400">
                  Dokumen dicetak: {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Format Dokumen Standar Akademik Dikti & Universitas Sebelas Maret (UNS).</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="text-[#004b87] hover:underline font-medium flex items-center gap-1"
            >
              <Printer className="w-3 h-3" />
              <span>Cetak / Cetak ke PDF</span>
            </button>
            <span>•</span>
            <button
              onClick={onClose}
              className="text-slate-600 hover:text-slate-900 font-medium"
            >
              Tutup Pratinjau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
