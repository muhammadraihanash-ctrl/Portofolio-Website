import React, { useRef, useState, useEffect } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  School,
  User,
  ShieldCheck,
  Edit2,
  Save,
  Upload,
  ExternalLink,
  Tag,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Maximize2,
  Trash2,
  Database,
  Eye,
  BookOpen,
  Briefcase,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { GraduateStudent, ThesisInfographic, Publication } from '../types';
import { academicService } from '../services/academicService';

interface StudentThesisInfographicModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: GraduateStudent | null;
  onStudentUpdated?: (updated: GraduateStudent) => void;
  publications?: Publication[];
  onSelectPublication?: (pub: Publication) => void;
}

export const StudentThesisInfographicModal: React.FC<StudentThesisInfographicModalProps> = ({
  isOpen,
  onClose,
  student,
  onStudentUpdated,
  publications = [],
  onSelectPublication
}) => {
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Local state for the infographic
  const [infographic, setInfographic] = useState<ThesisInfographic | null>(() => {
    return student?.infographic || null;
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state whenever student changes
  useEffect(() => {
    if (student) {
      if (student.infographic) {
        setInfographic(student.infographic);
      } else {
        setInfographic(createDefaultInfographic(student));
      }
      setIsEditingMetadata(false);
      setFeedbackMsg(null);
      setShowUrlInput(false);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const isAdmin = academicService.isAdmin();
  const currentInfo: ThesisInfographic = infographic || createDefaultInfographic(student);
  const hasUploadedImage = Boolean(currentInfo.customImageUrl || currentInfo.customImageBase64);
  const imageSource = currentInfo.customImageUrl || currentInfo.customImageBase64;

  function createDefaultInfographic(std: GraduateStudent): ThesisInfographic {
    const title = std.thesisTitle || std.researchTopic || 'Skripsi Program Studi Matematika';
    const kwList = std.kataKunci
      ? std.kataKunci.split(/[,;]/).map(s => s.trim()).filter(Boolean)
      : ['Optimasi', 'Riset Operasi', 'Pemodelan Matematika'];

    const sentences = (std.thesisAbstract || '').split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
    const problem = sentences[0] || `Penelitian tugas akhir ini memecahkan tantangan formulasi matematis dan efisiensi algoritma komputasi pada topik ${kwList[0] || 'terkait'}.`;
    const objective = sentences[1] || `Merumuskan model analitis teruji dan metode komputasi untuk menyelesaikan persoalan pada ${title}.`;
    const finding = sentences[2] || `Pengujian empiris dan komparatif membuktikan performa solusi optimal serta stabilitas algoritma.`;

    return {
      studentId: std.id,
      studentName: std.name,
      nim: std.nim,
      degree: std.degree,
      pembimbing: std.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.',
      penguji: std.penguji || 'Tim Penguji Jurusan Matematika FMIPA UNS',
      programStudi: std.programStudi || 'Matematika',
      fakultas: std.fakultas || 'FMIPA UNS',
      title,
      problemStatement: problem,
      objectives: objective,
      methodology: [
        'Formulasi model matematis dan perumusan fungsi objektif kendala sistem',
        'Pengembangan algoritma pencarian solusi berbasis optimasi dan komputasi',
        'Analisis sensitivitas parameter, validasi data, dan simulasi numerik'
      ],
      dataAndObject: 'Data studi kasus dan parameter sistem terverifikasi dari arsip tugas akhir mahasiswa.',
      keyFindings: [
        finding,
        'Algoritma yang dirancang mampu mencapai konvergensi solusi lebih efisien',
        'Model terbukti kokoh dan aplikatif terhadap variasi parameter nyata'
      ],
      conclusions: 'Skripsi ini memberikan kontribusi ilmiah bagi bidang matematika terapan serta solusi aplikatif bagi permasalahan industri dan sains data.',
      highlightMetric: {
        label: 'Capaian Riset',
        value: 'Optimal & Tervalidasi'
      },
      keywords: kwList,
      theme: 'navy',
      status: 'Published',
      generatedByAi: false,
      lastUpdated: new Date().toISOString()
    };
  }

  // Handle direct file upload by admin
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedbackMsg({ text: 'Pilih berkas gambar yang valid (.png, .jpg, .jpeg, .webp, .svg).', type: 'error' });
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFeedbackMsg({ text: 'Ukuran file gambar maksimal 15 MB.', type: 'error' });
      return;
    }

    setIsUploadingImage(true);
    setFeedbackMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;

        const updatedInfo: ThesisInfographic = {
          ...currentInfo,
          customImageUrl: base64Data,
          customImageBase64: base64Data,
          generatedByAi: false,
          lastUpdated: new Date().toISOString()
        };

        setInfographic(updatedInfo);

        // Persist directly to SQL database (digilib_documents table in MySQL)
        const ok = await academicService.saveStudentInfographic(student.id, updatedInfo);
        setIsUploadingImage(false);

        if (ok) {
          setFeedbackMsg({
            text: `Poster infografik "${file.name}" berhasil diunggah dan disimpan ke database MySQL (digilib_documents)!`,
            type: 'success'
          });
          if (onStudentUpdated) {
            onStudentUpdated({
              ...student,
              infographic: updatedInfo,
              hasInfographic: true
            });
          }
        } else {
          setFeedbackMsg({
            text: 'Gagal menyimpan infografik ke database MySQL. Periksa koneksi backend API.',
            type: 'error'
          });
        }
      };

      reader.onerror = () => {
        setIsUploadingImage(false);
        setFeedbackMsg({ text: 'Gagal membaca berkas gambar yang dipilih.', type: 'error' });
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingImage(false);
      setFeedbackMsg({ text: 'Terjadi kesalahan saat mengunggah gambar: ' + (err.message || 'Error'), type: 'error' });
    }
  };

  // Handle saving external URL as infographic
  const handleSaveUrl = async () => {
    if (!customUrlInput.trim()) return;
    setIsSaving(true);
    setFeedbackMsg(null);

    const updatedInfo: ThesisInfographic = {
      ...currentInfo,
      customImageUrl: customUrlInput.trim(),
      customImageBase64: undefined,
      generatedByAi: false,
      lastUpdated: new Date().toISOString()
    };

    setInfographic(updatedInfo);
    const ok = await academicService.saveStudentInfographic(student.id, updatedInfo);
    setIsSaving(false);

    if (ok) {
      setShowUrlInput(false);
      setCustomUrlInput('');
      setFeedbackMsg({
        text: 'Tautan poster infografik berhasil disimpan ke database MySQL (digilib_documents)!',
        type: 'success'
      });
      if (onStudentUpdated) {
        onStudentUpdated({
          ...student,
          infographic: updatedInfo,
          hasInfographic: true
        });
      }
    } else {
      setFeedbackMsg({ text: 'Gagal menyimpan tautan infografik ke server MySQL.', type: 'error' });
    }
  };

  // Handle remove infographic poster
  const handleRemoveInfographic = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar poster infografik skripsi ini dari database MySQL?')) {
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const updatedInfo: ThesisInfographic = {
        ...currentInfo,
        customImageUrl: undefined,
        customImageBase64: undefined,
        lastUpdated: new Date().toISOString()
      };

      setInfographic(updatedInfo);

      const ok = await academicService.saveStudentInfographic(student.id, updatedInfo);
      setIsSaving(false);

      if (ok) {
        setFeedbackMsg({
          text: 'Gambar poster infografik berhasil dihapus dari database MySQL.',
          type: 'success'
        });
        if (onStudentUpdated) {
          onStudentUpdated({
            ...student,
            infographic: updatedInfo,
            hasInfographic: false
          });
        }
      } else {
        setFeedbackMsg({ text: 'Gagal menghapus poster infografik dari database.', type: 'error' });
      }
    } catch (err: any) {
      setIsSaving(false);
      setFeedbackMsg({ text: 'Gagal menghapus gambar: ' + (err.message || 'Error'), type: 'error' });
    }
  };

  // Handle save metadata updates
  const handleSaveMetadata = async () => {
    if (!infographic) return;
    setIsSaving(true);
    setFeedbackMsg(null);
    try {
      const ok = await academicService.saveStudentInfographic(student.id, infographic);
      setIsSaving(false);
      if (ok) {
        setIsEditingMetadata(false);
        setFeedbackMsg({
          text: 'Informasi akademik dan ringkasan skripsi berhasil disimpan ke database MySQL!',
          type: 'success'
        });
        if (onStudentUpdated) {
          onStudentUpdated({
            ...student,
            thesisTitle: infographic.title,
            researchTopic: infographic.title,
            infographic,
            hasInfographic: Boolean(infographic.customImageUrl || infographic.customImageBase64)
          });
        }
      } else {
        setFeedbackMsg({ text: 'Gagal menyimpan perubahan ke database MySQL.', type: 'error' });
      }
    } catch (err: any) {
      setIsSaving(false);
      setFeedbackMsg({ text: err?.message || 'Gagal menyimpan data.', type: 'error' });
    }
  };

  // Download high-resolution image
  const handleDownloadImage = () => {
    if (!imageSource) return;
    const a = document.createElement('a');
    a.href = imageSource;
    const cleanNim = student.nim.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanName = student.name.replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `Infografik_Skripsi_${cleanNim}_${cleanName}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Copy text summary
  const handleCopyText = () => {
    const text = `INFORMASI MAHASISWA & SKRIPSI / TUGAS AKHIR
UNIVERSITAS SEBELAS MARET (UNS) - FMIPA JURUSAN MATEMATIKA

Nama Mahasiswa: ${student.name}
NIM: ${student.nim}
Jenjang / Prodi: ${student.degree} • ${student.programStudi || 'Matematika'} (${student.fakultas || 'FMIPA UNS'})
Status: ${student.status === 'Active' ? 'Penelitian Aktif' : `Lulus (${student.graduationYear || student.startYear + 4})`}
Dosen Pembimbing: ${student.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.'}
Dosen Penguji: ${student.penguji || currentInfo.penguji || '-'}

Judul Skripsi: "${student.thesisTitle || student.researchTopic}"
Topik Riset: ${student.researchTopic}

Ringkasan / Abstrak:
${student.thesisAbstract || currentInfo.problemStatement}

Kata Kunci: ${student.kataKunci || (currentInfo.keywords || []).join(', ')}
${student.currentAffiliation ? `Karir / Posisi: ${student.currentAffiliation}\n` : ''}
Sumber: Basis Data Terpadu Dokumen Digilib UNS (MySQL digilib_documents)
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const studentPhoto = student.photoBase64 || student.photoUrl;

  // Linked publications
  const linkedPubs = publications.filter(p =>
    p.authors?.some(a => a.studentId === student.id || a.name?.toLowerCase() === student.name.toLowerCase()) ||
    student.linkedPublicationIds?.includes(p.id)
  );

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs">
        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-sky-100 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header Bar */}
          <div className="px-5 py-3.5 bg-gradient-to-r from-[#004b87] via-[#003865] to-sky-950 text-white flex items-center justify-between gap-3 shrink-0 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                <GraduationCap className="w-5 h-5 text-sky-200" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-sky-200 uppercase tracking-widest">
                    Informasi Mahasiswa &amp; Poster Infografik
                  </span>
                  <span className="text-[11px] text-sky-200/80 font-mono hidden sm:inline">•</span>
                  <span className="text-[11px] text-sky-100 font-mono font-semibold bg-white/15 px-2 py-0.5 rounded">
                    NIM: {student.nim}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 flex items-center gap-1">
                    <Database className="w-2.5 h-2.5" />
                    <span>MySQL: digilib_documents</span>
                  </span>
                </div>
                <h2 className="font-serif-academic text-base sm:text-lg font-bold text-white leading-tight truncate mt-0.5">
                  {student.name} — <span className="text-sky-200 font-sans font-normal text-xs sm:text-sm">{student.degree}</span>
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {hasUploadedImage && (
                <>
                  <button
                    onClick={() => setIsFullscreenPreview(true)}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 cursor-pointer hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5"
                    title="Perbesar Poster Layar Penuh"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-sky-200" />
                    <span>Perbesar Poster</span>
                  </button>

                  <button
                    onClick={handleDownloadImage}
                    className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 cursor-pointer flex items-center gap-1 text-xs font-semibold px-2.5"
                    title="Unduh Poster Infografik (Resolusi Penuh)"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-200" />
                    <span className="hidden sm:inline">Unduh</span>
                  </button>
                </>
              )}

              <button
                onClick={handleCopyText}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 cursor-pointer"
                title="Salin Data Mahasiswa & Skripsi"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-sky-200" />}
              </button>

              <button
                onClick={onClose}
                className="p-1.5 text-sky-200 hover:text-white hover:bg-white/15 rounded-lg transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feedback Notice Alert */}
          {feedbackMsg && (
            <div
              className={`px-5 py-2 text-xs flex items-center justify-between gap-2 border-b shrink-0 ${
                feedbackMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {feedbackMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-medium">{feedbackMsg.text}</span>
              </div>
              <button
                onClick={() => setFeedbackMsg(null)}
                className="text-slate-500 hover:text-slate-800 text-[11px] font-semibold underline cursor-pointer"
              >
                Tutup
              </button>
            </div>
          )}

          {/* Admin Toolbar (Upload Poster / Update Infographic Image directly to MySQL) */}
          <div className="px-5 py-2 bg-sky-50/80 border-b border-sky-100 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <label className="px-3 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer text-xs">
                <Upload className="w-3.5 h-3.5 text-sky-200" />
                <span>
                  {isUploadingImage
                    ? 'Menyimpan ke MySQL...'
                    : hasUploadedImage
                    ? 'Ganti Poster Infografik'
                    : 'Upload Poster Infografik (Admin)'}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={handleFileUpload}
                  disabled={isUploadingImage}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-2.5 py-1.5 bg-white hover:bg-sky-50 text-slate-700 border border-slate-300 rounded-lg font-medium flex items-center gap-1 transition-colors cursor-pointer text-xs"
              >
                <span>Tautan URL Gambar</span>
              </button>

              {hasUploadedImage && (
                <button
                  type="button"
                  onClick={handleRemoveInfographic}
                  disabled={isSaving}
                  className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer text-xs"
                  title="Hapus gambar poster ini dari database MySQL"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Poster</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-slate-600 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Data &amp; Poster tersimpan di MySQL <code>digilib_documents</code></span>
            </div>
          </div>

          {/* External URL Input Drawer if opened */}
          {showUrlInput && (
            <div className="px-5 py-2.5 bg-white border-b border-sky-100 flex items-center gap-2 shrink-0">
              <input
                type="url"
                value={customUrlInput}
                onChange={e => setCustomUrlInput(e.target.value)}
                placeholder="Masukkan URL langsung gambar poster: https://example.com/poster-skripsi.png"
                className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-[#004b87]"
              />
              <button
                type="button"
                onClick={handleSaveUrl}
                disabled={isSaving || !customUrlInput.trim()}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan URL ke SQL'}
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 text-xs"
              >
                Batal
              </button>
            </div>
          )}

          {/* Modal Main Content: UNIFIED 2-COLUMN VIEW (Student Information + Poster Infographic) */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/40">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* ======================================================== */}
              {/* LEFT COLUMN (5 of 12): COMPLETE STUDENT ACADEMIC INFO   */}
              {/* ======================================================== */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Student Profile Card */}
                <div className="p-4 bg-white rounded-2xl border border-sky-100 shadow-xs space-y-3">
                  <div className="flex items-start gap-3.5">
                    {/* Avatar */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden border-2 border-sky-200 bg-sky-50 shadow-2xs shrink-0 flex items-center justify-center">
                      {studentPhoto ? (
                        <img
                          src={studentPhoto}
                          alt={student.name}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#004b87] to-sky-700 text-white flex flex-col items-center justify-center text-center p-1">
                          <span className="font-bold text-base font-serif-academic tracking-wider">
                            {student.name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('')}
                          </span>
                          <span className="text-[9px] uppercase tracking-tighter opacity-80 font-mono">UNS</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#004b87] bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          {student.nim}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            student.status === 'Active'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {student.status === 'Active' ? 'Active Research' : `Graduated (${student.graduationYear || student.startYear + 4})`}
                        </span>
                      </div>

                      <h3 className="font-serif-academic text-lg font-bold text-slate-900 leading-snug">
                        {student.name}
                      </h3>

                      <p className="text-xs text-slate-600 font-medium">
                        {student.degree} • {student.programStudi || 'Program Studi Matematika'}
                      </p>
                    </div>
                  </div>

                  {/* Academic Affiliation & Supervisors */}
                  <div className="space-y-2 pt-2 border-t border-sky-50 text-xs">
                    <div className="flex items-start gap-2 text-slate-700">
                      <School className="w-4 h-4 text-[#004b87] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 block text-[11px] font-semibold uppercase">Fakultas &amp; Kampus:</span>
                        <span className="font-semibold text-slate-800">{student.fakultas || 'FMIPA Universitas Sebelas Maret (UNS)'}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-slate-700">
                      <User className="w-4 h-4 text-[#004b87] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-500 block text-[11px] font-semibold uppercase">Dosen Pembimbing:</span>
                        <strong className="text-slate-900 font-serif">{student.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.'}</strong>
                      </div>
                    </div>

                    {(student.penguji || currentInfo.penguji) && (
                      <div className="flex items-start gap-2 text-slate-700">
                        <GraduationCap className="w-4 h-4 text-[#004b87] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-500 block text-[11px] font-semibold uppercase">Dosen Penguji:</span>
                          <span className="text-slate-800 font-medium">{student.penguji || currentInfo.penguji}</span>
                        </div>
                      </div>
                    )}

                    {student.currentAffiliation && (
                      <div className="flex items-start gap-2 text-slate-700 bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                        <Briefcase className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-emerald-800 block text-[10px] font-bold uppercase tracking-wider">Karir / Alumni Affiliation:</span>
                          <span className="text-slate-900 font-semibold">{student.currentAffiliation}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thesis Information Card */}
                <div className="p-4 bg-white rounded-2xl border border-sky-100 shadow-xs space-y-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Judul Tugas Akhir / Skripsi:
                    </span>
                    <h4 className="font-serif-academic text-sm sm:text-base font-bold text-slate-900 leading-snug mt-1">
                      "{student.thesisTitle || student.researchTopic || currentInfo.title}"
                    </h4>
                  </div>

                  {student.researchTopic && student.researchTopic !== student.thesisTitle && (
                    <div className="text-xs text-slate-600 bg-sky-50/50 p-2 rounded-lg border border-sky-100">
                      <span className="font-semibold text-slate-500">Fokus Topik:</span>{' '}
                      <span className="font-medium text-slate-800">{student.researchTopic}</span>
                    </div>
                  )}

                  {/* Abstract / Ringkasan Skripsi */}
                  <div className="space-y-1.5 pt-2 border-t border-sky-50">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#004b87]" />
                        <span>Abstrak / Ringkasan Skripsi</span>
                      </span>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setIsEditingMetadata(!isEditingMetadata)}
                          className="text-[11px] text-[#004b87] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{isEditingMetadata ? 'Batal' : 'Edit Abstrak'}</span>
                        </button>
                      )}
                    </div>

                    {isEditingMetadata ? (
                      <div className="space-y-2">
                        <textarea
                          rows={4}
                          value={currentInfo.problemStatement}
                          onChange={e => setInfographic({ ...currentInfo, problemStatement: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs leading-relaxed"
                          placeholder="Tuliskan rumusan masalah / abstrak skripsi..."
                        />
                        <button
                          type="button"
                          onClick={handleSaveMetadata}
                          disabled={isSaving}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                        >
                          <Save className="w-3 h-3" />
                          <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Abstrak'}</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-700 leading-relaxed text-justify bg-slate-50/70 p-3 rounded-xl border border-slate-200/70 max-h-48 overflow-y-auto">
                        {student.thesisAbstract || currentInfo.problemStatement || 'Abstrak dan ringkasan skripsi telah terverifikasi dan tersimpan dalam basis data.'}
                      </p>
                    )}
                  </div>

                  {/* Keywords / Kata Kunci */}
                  {(student.kataKunci || (currentInfo.keywords && currentInfo.keywords.length > 0)) && (
                    <div className="pt-2 border-t border-sky-50 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#004b87]" />
                        <span>Kata Kunci:</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(student.kataKunci ? student.kataKunci.split(/[,;]/) : currentInfo.keywords || []).map((k, i) => k.trim() && (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-md bg-sky-50 text-[#004b87] border border-sky-200 text-[11px] font-mono"
                          >
                            {k.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Digilib UNS link if available */}
                  {student.digilibUrl && (
                    <div className="pt-2">
                      <a
                        href={student.digilibUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#004b87]" />
                        <span>Buka Halaman Resmi Digilib UNS</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Co-authored Publications (if any) */}
                {linkedPubs.length > 0 && (
                  <div className="p-4 bg-white rounded-2xl border border-sky-100 shadow-xs space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#004b87]" />
                      <span>Publikasi Bersama ({linkedPubs.length}):</span>
                    </span>
                    <div className="space-y-2">
                      {linkedPubs.map(pub => (
                        <div
                          key={pub.id}
                          onClick={() => onSelectPublication && onSelectPublication(pub)}
                          className="p-2.5 rounded-xl bg-sky-50/50 hover:bg-sky-100/70 border border-sky-100 cursor-pointer transition-colors space-y-1"
                        >
                          <div className="text-xs font-semibold text-slate-900 line-clamp-2">
                            "{pub.title}"
                          </div>
                          <div className="text-[11px] text-[#004b87] italic">
                            {pub.venue} ({pub.year})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ======================================================== */}
              {/* RIGHT COLUMN (7 of 12): THESIS INFOGRAPHIC POSTER IMAGE */}
              {/* ======================================================== */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white rounded-2xl border border-sky-100 shadow-sm p-4 sm:p-5 flex flex-col space-y-3">
                  
                  {/* Poster Box Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-sky-50 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-[#004b87]/10 flex items-center justify-center text-[#004b87]">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif-academic text-sm sm:text-base font-bold text-slate-900 leading-tight">
                          Poster Infografik Skripsi
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {hasUploadedImage
                            ? 'Poster visual resmi tugas akhir mahasiswa'
                            : 'Unggahan gambar resmi oleh admin / dosen pembimbing'}
                        </span>
                      </div>
                    </div>

                    {hasUploadedImage && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsFullscreenPreview(true)}
                          className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#004b87] rounded-lg text-xs font-semibold flex items-center gap-1 border border-sky-200 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Perbesar</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDownloadImage}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* POSTER DISPLAY / UPLOAD VIEW */}
                  {hasUploadedImage && imageSource ? (
                    <div className="space-y-3">
                      {/* Image Preview Box with Zoom Effect */}
                      <div
                        onClick={() => setIsFullscreenPreview(true)}
                        className="relative bg-slate-950/5 rounded-xl border border-sky-100 overflow-hidden flex items-center justify-center p-2 group cursor-zoom-in min-h-[360px] max-h-[65vh]"
                        title="Klik untuk memperbesar tampilan poster"
                      >
                        <img
                          src={imageSource}
                          alt={`Poster Infografik Skripsi ${student.name}`}
                          className="max-h-[62vh] w-auto max-w-full object-contain rounded-lg shadow-sm group-hover:scale-[1.01] transition-transform duration-200"
                        />
                        
                        {/* Hover Overlay Hint */}
                        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                          <span className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>Klik untuk Resolusi Penuh</span>
                          </span>
                        </div>
                      </div>

                      {/* Poster Footer Info */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tersimpan di tabel MySQL: <code>digilib_documents</code></span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Format: Gambar Digital (PNG/JPG/WEBP)
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* EMPTY POSTER / UPLOAD CALLOUT */
                    <div className="py-12 px-6 rounded-2xl border-2 border-dashed border-sky-200 bg-sky-50/30 text-center space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-white text-[#004b87] flex items-center justify-center border border-sky-100 shadow-xs">
                        <ImageIcon className="w-8 h-8 text-[#004b87]" />
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-serif-academic text-base font-bold text-slate-900">
                          Poster Infografik Belum Tersedia
                        </h4>
                        <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                          Infografik skripsi mahasiswa ini menampilkan poster visual beresolusi tinggi yang diunggah oleh Administrator / Dosen Pembimbing ke database MySQL (<code>digilib_documents</code>).
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                        <label className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer">
                          <Upload className="w-4 h-4 text-sky-200" />
                          <span>{isUploadingImage ? 'Mengunggah ke SQL...' : 'Upload Poster (.png / .jpg / .webp)'}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={handleFileUpload}
                            disabled={isUploadingImage}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setShowUrlInput(true)}
                          className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-colors"
                        >
                          Gunakan URL Gambar
                        </button>
                      </div>

                      <div className="pt-2 text-[11px] text-slate-400 font-mono">
                        Dukungan file: PNG, JPG, JPEG, WEBP hingga 15 MB
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Image Modal */}
      {isFullscreenPreview && imageSource && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/95 flex flex-col items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setIsFullscreenPreview(false)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={handleDownloadImage}
              className="px-3.5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-sky-200" />
              <span>Unduh Resolusi Asli</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreenPreview(false)}
              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
              title="Tutup Pratinjau Layar Penuh"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-6xl max-h-[90vh] overflow-auto p-2" onClick={e => e.stopPropagation()}>
            <img
              src={imageSource}
              alt={currentInfo.title}
              className="max-h-[85vh] w-auto max-w-full object-contain mx-auto rounded-lg shadow-2xl"
            />
          </div>
          <p className="text-xs text-sky-200 mt-2 font-mono text-center">
            {student.name} ({student.nim}) • Poster Infografik Skripsi • Klik di luar atau tombol silang untuk menutup
          </p>
        </div>
      )}
    </>
  );
};
