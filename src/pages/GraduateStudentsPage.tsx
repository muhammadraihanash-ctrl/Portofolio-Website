import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  ExternalLink,
  Briefcase,
  Calendar,
  CheckCircle2,
  FileText,
  Download,
  Search,
  School,
  Tag,
  Sparkles,
  User,
  Image as ImageIcon
} from 'lucide-react';
import { GraduateStudent, Publication } from '../types';
import { StudentThesisPdfModal } from '../components/StudentThesisPdfModal';
import { StudentThesisInfographicModal } from '../components/StudentThesisInfographicModal';

interface GraduateStudentsPageProps {
  students: GraduateStudent[];
  publications: Publication[];
  onSelectPublication: (pub: Publication) => void;
  onStudentUpdated?: (updated: GraduateStudent) => void;
}

export const GraduateStudentsPage: React.FC<GraduateStudentsPageProps> = ({
  students,
  publications,
  onSelectPublication,
  onStudentUpdated
}) => {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Active' | 'Graduated'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPdfStudent, setSelectedPdfStudent] = useState<GraduateStudent | null>(null);
  const [selectedInfographicStudent, setSelectedInfographicStudent] = useState<GraduateStudent | null>(null);

  const filteredStudents = students.filter(s => {
    if (filterStatus !== 'All' && s.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (s.name || '').toLowerCase().includes(q);
      const matchNim = (s.nim || '').toLowerCase().includes(q);
      const matchThesis = (s.thesisTitle || s.researchTopic || '').toLowerCase().includes(q);
      const matchKeywords = (s.kataKunci || '').toLowerCase().includes(q);
      const matchDegree = (s.degree || s.programStudi || '').toLowerCase().includes(q);
      if (!matchName && !matchNim && !matchThesis && !matchKeywords && !matchDegree) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-10 pb-20 max-w-4xl">
      {/* Header */}
      <div className="border-b border-sky-100 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
              Supervised Theses &amp; Research
            </span>
            <span className="text-[11px] font-mono font-bold bg-[#004b87]/10 text-[#004b87] px-2 py-0.5 rounded-full">
              {students.length} Mahasiswa
            </span>
          </div>
          <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            Graduate &amp; Undergraduate Students
          </h1>
          <p className="text-sm text-slate-600 mt-2 font-serif italic">
            Undergraduate and graduate students supervised by Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D. in mathematics, optimization, and data science. Data terhubung langsung ke basis data relasional MySQL (digilib_documents). Pengunjung dapat membaca langsung soft file skripsi dan artikel tugas akhir mahasiswa.
          </p>
        </div>

        {/* Filter toggle */}
        <div className="flex items-center bg-sky-50/80 p-1 rounded-xl text-xs font-medium self-start sm:self-auto border border-sky-100 shrink-0">
          {(['All', 'Active', 'Graduated'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === tab
                  ? 'bg-[#004b87] text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-[#004b87]'
              }`}
            >
              {tab === 'All' ? 'All Students' : tab === 'Active' ? 'Active' : 'Graduated / Alumni'}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Cari nama mahasiswa, NIM, judul skripsi/tesis, topik, atau kata kunci..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-sky-100 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#004b87]/30 focus:border-[#004b87] shadow-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-sky-200 rounded-2xl bg-sky-50/30 text-slate-600 text-sm space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-sky-100 text-[#004b87] flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div className="font-serif-academic text-base font-bold text-slate-800">
            Belum Ada Data Mahasiswa Bimbingan yang Terdaftar
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Seluruh data dummy mahasiswa telah dibersihkan. Halaman ini siap menampilkan arsip naskah skripsi dan tesis mahasiswa bimbingan yang valid melalui sinkronisasi database atau penambahan via panel admin.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredStudents.map(student => {
            // Find linked publications
            const linkedPubs = publications.filter(p =>
              p.authors.some(a => a.studentId === student.id || a.name.toLowerCase() === student.name.toLowerCase()) ||
              student.linkedPublicationIds?.includes(p.id)
            );
            const studentPhoto = student.photoBase64 || student.photoUrl;

            return (
              <div
                key={student.id}
                className="p-6 border border-sky-100 rounded-2xl bg-white hover:border-[#004b87]/40 shadow-xs transition-colors space-y-4"
              >
                {/* Header with Student Photo Avatar */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-sky-50 pb-3">
                  <div className="flex items-start gap-3.5">
                    {/* Student Profile Photo */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-sky-100 bg-sky-50/50 shadow-2xs shrink-0 flex items-center justify-center relative">
                      {studentPhoto ? (
                        <img
                          src={studentPhoto}
                          alt={student.name}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#004b87] to-sky-700 text-white flex flex-col items-center justify-center text-center p-1">
                          <span className="font-bold text-sm sm:text-base font-serif-academic tracking-wider">
                            {student.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('')}
                          </span>
                          <span className="text-[8px] uppercase tracking-tighter opacity-80 font-mono">UNS</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <h2 className="font-serif-academic text-xl font-bold text-slate-900 leading-snug">
                        {student.name}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono text-[#004b87] font-semibold">{student.nim}</span>
                        <span>•</span>
                        <span>{student.degree}</span>
                        {student.programStudi && (
                          <>
                            <span>•</span>
                            <span className="text-slate-600">{student.programStudi}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    {Boolean(student.hasInfographic || student.infographic) && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-indigo-500" />
                        <span>Infografik AI Ready</span>
                      </span>
                    )}

                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        student.status === 'Active'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-sky-50 text-[#004b87] border border-sky-200'
                      }`}
                    >
                      {student.status === 'Active' ? 'Active Research' : `Graduated (${student.graduationYear || student.startYear + 4})`}
                    </span>
                  </div>
                </div>

                {/* Research Topic / Thesis */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Research Topic / Thesis Title:
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-slate-900 leading-snug font-sans">
                    "{student.thesisTitle || student.researchTopic}"
                  </p>
                </div>

                {/* Supervisor & Academic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-sky-50/40 p-2.5 rounded-xl border border-sky-100">
                  <div className="flex items-center gap-1.5 truncate">
                    <School className="w-3.5 h-3.5 text-[#004b87] shrink-0" />
                    <span className="truncate">Pembimbing: <strong className="text-slate-800">{student.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <GraduationCap className="w-3.5 h-3.5 text-[#004b87] shrink-0" />
                    <span className="truncate">Prodi: <strong className="text-slate-800">{student.programStudi || student.degree}</strong> ({student.fakultas || 'FMIPA UNS'})</span>
                  </div>
                </div>

                {/* Kata Kunci / Keywords */}
                {student.kataKunci && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500">
                    <Tag className="w-3 h-3 text-[#004b87] shrink-0" />
                    <span className="font-semibold text-slate-600">Kata Kunci:</span>
                    {student.kataKunci.split(/[,;]/).map((k, i) => k.trim() && (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-mono">
                        {k.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Alumni Affiliation */}
                {student.currentAffiliation && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 bg-emerald-50/50 px-3 py-2 rounded-lg border border-emerald-100">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Current Position &amp; Career: <strong className="text-slate-800">{student.currentAffiliation}</strong></span>
                  </div>
                )}

                {/* Notes */}
                {student.notes && (
                  <p className="text-xs text-slate-500 italic">
                    Notes: {student.notes}
                  </p>
                )}

                {/* Soft File PDF & Infografik Actions Card */}
                <div className="pt-2 p-3 bg-sky-50/50 rounded-xl border border-sky-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <div className="w-8 h-8 rounded-lg bg-[#004b87]/10 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[#004b87]" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">
                        {student.pdfFileName || `Skripsi_${student.nim}_${student.name.split(' ')[0]}.pdf`}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Naskah Soft File Skripsi / Artikel Digital • Terverifikasi
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {student.digilibUrl && (
                      <a
                        href={student.digilibUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white hover:bg-sky-50 text-[#004b87] border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                        title="Buka Halaman Resmi Digilib UNS"
                      >
                        <ExternalLink className="w-3 h-3 text-[#004b87]" />
                        <span>Arsip Digilib</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedPdfStudent(student)}
                      className="px-3.5 py-1.5 bg-white hover:bg-sky-50 text-[#004b87] border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs hover:shadow cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#004b87]" />
                      <span>Baca Soft File (PDF)</span>
                    </button>

                    {/* Infografik Skripsi LLM Button */}
                    <button
                      type="button"
                      onClick={() => setSelectedInfographicStudent(student)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                        student.hasInfographic || student.infographic
                          ? 'bg-gradient-to-r from-[#004b87] to-indigo-700 hover:from-[#003865] hover:to-indigo-800 text-white shadow-xs'
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200'
                      }`}
                      title="Lihat & Sintesis Infografik Skripsi dengan LLM (Gemini 3.8 Flash)"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${student.hasInfographic || student.infographic ? 'text-amber-300' : 'text-indigo-600'}`} />
                      <span>{student.hasInfographic || student.infographic ? 'Infografik Skripsi' : 'Generate Infografik AI'}</span>
                    </button>
                  </div>
                </div>

                {/* Linked Publications */}
                {linkedPubs.length > 0 && (
                  <div className="pt-2 border-t border-sky-50 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#004b87]" />
                      <span>Co-authored Publications ({linkedPubs.length}):</span>
                    </span>
                    <div className="space-y-1.5">
                      {linkedPubs.map(pub => (
                        <div
                          key={pub.id}
                          onClick={() => onSelectPublication(pub)}
                          className="p-2.5 rounded-xl bg-sky-50/40 hover:bg-sky-50 border border-sky-100 cursor-pointer transition-colors flex items-start justify-between gap-3 group"
                        >
                          <div className="text-xs space-y-0.5">
                            <div className="font-semibold text-slate-900 group-hover:text-[#004b87]">
                              "{pub.title}"
                            </div>
                            <div className="text-[11px] text-[#004b87] italic">
                              {pub.venue} ({pub.year})
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#004b87] shrink-0 mt-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Soft File PDF Modal */}
      <StudentThesisPdfModal
        isOpen={!!selectedPdfStudent}
        onClose={() => setSelectedPdfStudent(null)}
        student={selectedPdfStudent}
      />

      {/* Interactive Thesis Infographic Modal with LLM Connection */}
      <StudentThesisInfographicModal
        isOpen={!!selectedInfographicStudent}
        onClose={() => setSelectedInfographicStudent(null)}
        student={selectedInfographicStudent}
        onStudentUpdated={updated => {
          if (onStudentUpdated) onStudentUpdated(updated);
          setSelectedInfographicStudent(updated);
        }}
      />
    </div>
  );
};
