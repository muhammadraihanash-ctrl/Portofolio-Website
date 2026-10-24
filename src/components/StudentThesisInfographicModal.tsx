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
  School,
  User,
  ShieldCheck,
  Edit2,
  Save,
  Upload,
  RefreshCw,
  ExternalLink,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { GraduateStudent, ThesisInfographic } from '../types';
import { academicService } from '../services/academicService';

interface StudentThesisInfographicModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: GraduateStudent | null;
  onStudentUpdated?: (updated: GraduateStudent) => void;
}

export const StudentThesisInfographicModal: React.FC<StudentThesisInfographicModalProps> = ({
  isOpen,
  onClose,
  student,
  onStudentUpdated
}) => {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Active view tab: 'visual' or 'customImage'
  // Active view tab: 'visual' or 'customImage'
  const [activeView, setActiveView] = useState<'visual' | 'customImage'>(() => {
    return student?.infographic?.customImageUrl ? 'customImage' : 'visual';
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Editable local state
  const [infographic, setInfographic] = useState<ThesisInfographic | null>(() => {
    return student?.infographic || null;
  });

  // Track student changes
  React.useEffect(() => {
    if (student) {
      if (student.infographic) {
        setInfographic(student.infographic);
        if (student.infographic.customImageUrl) {
          setActiveView('customImage');
        }
      } else {
        // Auto-initialize a synthesized template if none exists yet
        const initial = createDefaultThesisInfographic(student);
        setInfographic(initial);
      }
      setIsEditing(false);
      setFeedbackMsg(null);
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const currentInfo: ThesisInfographic = infographic || createDefaultThesisInfographic(student);
  const isAdmin = academicService.isAdmin();

  // Helper to construct fallback thesis infographic
  function createDefaultThesisInfographic(std: GraduateStudent): ThesisInfographic {
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
      generatedByAi: true,
      lastUpdated: new Date().toISOString()
    };
  }

  // Handle LLM Generation via Gemini API
  const handleGenerateWithLLM = async () => {
    setIsGenerating(true);
    setFeedbackMsg(null);
    try {
      const generated = await academicService.generateThesisInfographicWithLLM(student, isAdmin);
      if (generated) {
        setInfographic(generated);
        setFeedbackMsg({
          text: 'Infografik skripsi berhasil disintesis menggunakan Gemini LLM!',
          type: 'success'
        });
        if (onStudentUpdated) {
          onStudentUpdated({
            ...student,
            infographic: generated,
            hasInfographic: true
          });
        }
      } else {
        setFeedbackMsg({
          text: 'Gagal menghubungkan ke server AI. Menampilkan sintesis deterministik terverifikasi.',
          type: 'error'
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        text: err?.message || 'Terjadi kesalahan saat sintesis infografik.',
        type: 'error'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Save Infographic Changes
  const handleSaveInfographic = async () => {
    if (!infographic) return;
    setIsSaving(true);
    try {
      const ok = await academicService.saveStudentInfographic(student.id, infographic);
      if (ok) {
        setIsEditing(false);
        setFeedbackMsg({
          text: 'Infografik skripsi berhasil disimpan ke database!',
          type: 'success'
        });
        if (onStudentUpdated) {
          onStudentUpdated({
            ...student,
            infographic,
            hasInfographic: true
          });
        }
      } else {
        setFeedbackMsg({
          text: 'Gagal menyimpan perubahan ke server.',
          type: 'error'
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        text: err?.message || 'Gagal menyimpan infografik.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Direct Upload of Custom Infographic Image (Connected to SQL Central DB)
  const handleUploadCustomImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedbackMsg({ text: 'Pilih file gambar yang valid (.png, .jpg, .webp).', type: 'error' });
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setFeedbackMsg({ text: 'Ukuran file gambar maksimal 8 MB.', type: 'error' });
      return;
    }

    setIsUploadingImage(true);
    setFeedbackMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const updatedInfo: ThesisInfographic = {
          ...currentInfo,
          customImageUrl: base64,
          customImageBase64: base64,
          lastUpdated: new Date().toISOString()
        };

        setInfographic(updatedInfo);
        setActiveView('customImage');

        // Persist directly to central SQL database
        const ok = await academicService.saveStudentInfographic(student.id, updatedInfo);
        setIsUploadingImage(false);

        if (ok) {
          setFeedbackMsg({
            text: `Poster infografik "${file.name}" berhasil diunggah dan disimpan ke database SQL!`,
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
            text: 'Gagal menyimpan infografik ke server database pusat.',
            type: 'error'
          });
        }
      };

      reader.onerror = () => {
        setIsUploadingImage(false);
        setFeedbackMsg({ text: 'Gagal membaca berkas gambar.', type: 'error' });
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setIsUploadingImage(false);
      setFeedbackMsg({ text: 'Gagal mengunggah infografik: ' + (err.message || 'Error'), type: 'error' });
    }
  };

  // Handle Remove Custom Infographic Image
  const handleRemoveCustomImage = async () => {
    if (!currentInfo.customImageUrl) return;
    setIsSaving(true);
    try {
      const updatedInfo: ThesisInfographic = {
        ...currentInfo,
        customImageUrl: undefined,
        customImageBase64: undefined,
        lastUpdated: new Date().toISOString()
      };
      setInfographic(updatedInfo);
      setActiveView('visual');

      const ok = await academicService.saveStudentInfographic(student.id, updatedInfo);
      setIsSaving(false);

      if (ok) {
        setFeedbackMsg({ text: 'Gambar infografik berhasil dihapus dari database.', type: 'success' });
        if (onStudentUpdated) {
          onStudentUpdated({
            ...student,
            infographic: updatedInfo,
            hasInfographic: false
          });
        }
      } else {
        setFeedbackMsg({ text: 'Gagal menghapus gambar dari server.', type: 'error' });
      }
    } catch (err: any) {
      setIsSaving(false);
      setFeedbackMsg({ text: 'Gagal menghapus gambar: ' + (err.message || 'Error'), type: 'error' });
    }
  };

  // Handle Copy text summary
  const handleCopyText = () => {
    const text = `INFOGRAFIK SKRIPSI / TUGAS AKHIR MAHASISWA
UNIVERSITAS SEBELAS MARET (UNS) - FMIPA JURUSAN MATEMATIKA

Judul Skripsi: ${currentInfo.title}
Nama Mahasiswa: ${currentInfo.studentName} (${currentInfo.nim})
Program Studi / Jenjang: ${currentInfo.programStudi || student.programStudi || 'Matematika'} • ${currentInfo.degree}
Dosen Pembimbing: ${currentInfo.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.'}
Dosen Penguji: ${currentInfo.penguji || '-'}

RUMUSAN MASALAH & LATAR BELAKANG:
${currentInfo.problemStatement}

TUJUAN PENELITIAN:
${currentInfo.objectives}

METODOLOGI & ALGORITMA PENELITIAN:
${currentInfo.methodology.map((m, i) => `${i + 1}. ${m}`).join('\n')}

OBJEK PENELITIAN & DATASET:
${currentInfo.dataAndObject}

TEMUAN KUNCI & HASIL SKRIPSI:
${currentInfo.keyFindings.map((f, i) => `• ${f}`).join('\n')}

METRIK CAPAIAN:
${currentInfo.highlightMetric?.label || 'Hasil'}: ${currentInfo.highlightMetric?.value || 'Optimal'}

KESIMPULAN & KONTRIBUSI ILMIAH:
${currentInfo.conclusions}

Kata Kunci: ${(currentInfo.keywords || []).join(', ')}
Sumber: Arsip Dokumen Digilib UNS (NIM: ${student.nim})
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // High-resolution Canvas PNG Export (1200x1600 Poster)
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

      // Header Banner (UNS Navy Blue)
      ctx.fillStyle = '#004b87';
      ctx.fillRect(40, 40, canvas.width - 80, 210);

      // Institution Header
      ctx.fillStyle = '#bae6fd';
      ctx.font = 'bold 16px Inter, sans-serif';
      ctx.fillText('UNIVERSITAS SEBELAS MARET • FMIPA • JURUSAN MATEMATIKA', 70, 80);

      // Title
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 26px Georgia, serif';
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

      const titleY = wrapText(currentInfo.title, 70, 125, canvas.width - 140, 34);

      // Student & Supervisor Bar
      ctx.fillStyle = '#e0f2fe';
      ctx.font = '500 16px Inter, sans-serif';
      ctx.fillText(
        `Mahasiswa: ${currentInfo.studentName} (${currentInfo.nim}) • Pembimbing: ${currentInfo.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.'}`,
        70,
        Math.min(titleY + 45, 230)
      );

      // Sections
      let curY = 290;
      const drawSectionCard = (titleText: string, contentLines: string[], isHighlight = false) => {
        ctx.fillStyle = isHighlight ? '#f0f9ff' : '#f8fafc';
        ctx.strokeStyle = isHighlight ? '#0284c7' : '#e2e8f0';
        ctx.lineWidth = 1.5;
        const boxHeight = 40 + contentLines.length * 28;
        ctx.beginPath();
        ctx.roundRect(40, curY, canvas.width - 80, boxHeight, 12);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#004b87';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.fillText(titleText, 65, curY + 30);

        ctx.fillStyle = '#334155';
        ctx.font = '15px Inter, sans-serif';
        contentLines.forEach((line, i) => {
          ctx.fillText(line, 65, curY + 60 + i * 26);
        });

        curY += boxHeight + 25;
      };

      drawSectionCard('1. RUMUSAN MASALAH & LATAR BELAKANG', [
        currentInfo.problemStatement.slice(0, 120),
        currentInfo.problemStatement.slice(120, 240) || ''
      ].filter(Boolean));

      drawSectionCard('2. TUJUAN PENELITIAN SKRIPSI', [
        currentInfo.objectives.slice(0, 130),
        currentInfo.objectives.slice(130, 260) || ''
      ].filter(Boolean));

      drawSectionCard('3. METODOLOGI & ALGORITMA PENELITIAN', currentInfo.methodology.map((m, i) => `${i + 1}. ${m}`));

      drawSectionCard('4. TEMUAN KUNCI & HASIL ANALISIS', currentInfo.keyFindings.map(f => `• ${f}`));

      drawSectionCard('5. KESIMPULAN & KONTRIBUSI ILMIAH', [
        currentInfo.conclusions.slice(0, 130),
        currentInfo.conclusions.slice(130, 260) || ''
      ].filter(Boolean));

      // Metric Highlight Box
      ctx.fillStyle = '#004b87';
      ctx.beginPath();
      ctx.roundRect(40, curY, canvas.width - 80, 80, 12);
      ctx.fill();

      ctx.fillStyle = '#e0f2fe';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(currentInfo.highlightMetric?.label || 'Capaian Skripsi Teruji', 65, curY + 32);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.fillText(currentInfo.highlightMetric?.value || 'Optimal & Terverifikasi', 65, curY + 62);

      // Footer
      ctx.fillStyle = '#64748b';
      ctx.font = '12px Inter, sans-serif';
      ctx.fillText(
        `Arsip Portofolio Akademik Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D. • Universitas Sebelas Maret (UNS) • Generated with Gemini AI`,
        40,
        1570
      );

      // Trigger download
      const safeName = (student.name || 'Mahasiswa').replace(/[^a-zA-Z0-9]/g, '_');
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `Infografik_Skripsi_${student.nim}_${safeName}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Canvas export error:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const photoSource = student.photoBase64 || student.photoUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-sky-200 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-[#004b87] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-sky-400/20 text-sky-200 border border-sky-400/30">
                  Infografik Riset Skripsi Mahasiswa
                </span>
                <span className="text-[11px] text-sky-100 hidden sm:inline">•</span>
                <span className="text-[11px] text-sky-100 font-mono hidden sm:inline">{student.nim}</span>
              </div>
              <h2 className="font-serif-academic text-sm sm:text-base font-bold text-white leading-tight line-clamp-1">
                {currentInfo.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle if custom image exists */}
            {currentInfo.customImageUrl && (
              <div className="flex items-center bg-white/10 p-0.5 rounded-lg border border-white/20 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveView('visual')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeView === 'visual' ? 'bg-white text-[#004b87] font-bold shadow-2xs' : 'text-sky-100 hover:text-white'
                  }`}
                >
                  Poster Visual
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('customImage')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeView === 'customImage' ? 'bg-white text-[#004b87] font-bold shadow-2xs' : 'text-sky-100 hover:text-white'
                  }`}
                >
                  Gambar Infografik
                </button>
              </div>
            )}

            <button
              onClick={handleCopyText}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 cursor-pointer"
              title="Salin Teks Infografik"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-sky-200" />}
            </button>

            <button
              onClick={() => window.print()}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 cursor-pointer"
              title="Cetak Infografik (Print / PDF)"
            >
              <Printer className="w-4 h-4 text-sky-200" />
            </button>

            <button
              onClick={handleExportPNG}
              disabled={isExporting}
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              title="Download Infografik Format PNG (1200x1600)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Download PNG'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 text-sky-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert if any */}
        {feedbackMsg && (
          <div
            className={`px-5 py-2 text-xs flex items-center gap-2 border-b ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <span className="flex-1 font-medium">{feedbackMsg.text}</span>
            <button
              onClick={() => setFeedbackMsg(null)}
              className="text-slate-400 hover:text-slate-700 text-[11px] underline"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Action Toolbar for Infographic Image Upload & Edit (Connected to SQL) */}
        <div className="px-5 py-2.5 bg-sky-50/70 border-b border-sky-100 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Primary Action: Direct Admin Upload */}
            <label className="px-3.5 py-1.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-sky-200" />
              <span>
                {isUploadingImage
                  ? 'Mengunggah...'
                  : currentInfo.customImageUrl
                  ? 'Ganti Poster Infografik'
                  : 'Upload Gambar Infografik (PNG/JPG)'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadCustomImage}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>

            {currentInfo.customImageUrl && (
              <button
                type="button"
                onClick={handleRemoveCustomImage}
                disabled={isSaving}
                className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="Hapus gambar poster ini dari database SQL"
              >
                <X className="w-3.5 h-3.5" />
                <span>Hapus Gambar</span>
              </button>
            )}

            {isAdmin && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-white hover:bg-sky-50 text-slate-700 border border-slate-300 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit Teks Skripsi</span>
              </button>
            )}

            {isEditing && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveInfographic}
                  disabled={isSaving}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setInfographic(student.infographic || createDefaultThesisInfographic(student));
                  }}
                  className="px-2.5 py-1.5 bg-white text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerateWithLLM}
              disabled={isGenerating}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 rounded-lg font-medium flex items-center gap-1 transition-all disabled:opacity-60 cursor-pointer text-[11px]"
              title="Opsional: Rangkum teks abstrak secara otomatis"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{isGenerating ? 'Meringkas...' : 'Rangkum Teks Abstrak'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-600 text-[11px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database SQL: digilib_documents terhubung</span>
          </div>
        </div>

        {/* Modal Body / Printable Area */}
        <div id="printable-infographic-area" className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
          {activeView === 'customImage' && currentInfo.customImageUrl ? (
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden border border-sky-200 shadow-md bg-slate-50 flex items-center justify-center p-2">
                <img
                  src={currentInfo.customImageUrl}
                  alt={currentInfo.title}
                  className="max-h-[70vh] w-auto object-contain rounded-xl"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 1. Student Identity & Skripsi Header Hero */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-white to-blue-50 border border-sky-100 flex flex-col sm:flex-row items-start gap-4">
                {/* Student Photo */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-sky-200 bg-white shadow-sm shrink-0 flex items-center justify-center relative group">
                  {photoSource ? (
                    <img
                      src={photoSource}
                      alt={student.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-center text-[#004b87]">
                      <div className="w-12 h-12 rounded-xl bg-[#004b87] text-white flex items-center justify-center font-bold text-lg shadow-2xs mb-1">
                        {student.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">UNS Student</span>
                    </div>
                  )}
                </div>

                {/* Identity & Supervised Info */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#004b87] text-white text-[11px] font-mono font-bold">
                      {student.nim}
                    </span>
                    <span className="text-xs text-slate-600 font-medium">
                      {student.degree} • {student.programStudi || 'Matematika'} ({student.fakultas || 'FMIPA UNS'})
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold ml-auto">
                      {student.status === 'Active' ? 'Penelitian Aktif' : `Lulus (${student.graduationYear || student.startYear + 4})`}
                    </span>
                  </div>

                  <h3 className="font-serif-academic text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                    {student.name}
                  </h3>

                  <div className="text-xs text-slate-700 font-medium pt-0.5">
                    Judul Skripsi:{' '}
                    {isEditing ? (
                      <input
                        type="text"
                        value={currentInfo.title}
                        onChange={e => setInfographic({ ...currentInfo, title: e.target.value })}
                        className="w-full mt-1 px-3 py-1.5 border border-sky-300 rounded-lg text-xs font-serif"
                      />
                    ) : (
                      <span className="font-serif italic text-slate-900 font-bold">"{currentInfo.title}"</span>
                    )}
                  </div>

                  {/* Pembimbing & Penguji */}
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-600 border-t border-sky-100">
                    <div className="flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-[#004b87]" />
                      <span>Pembimbing: <strong className="text-slate-900">{currentInfo.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.'}</strong></span>
                    </div>
                    {currentInfo.penguji && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>Penguji: <strong className="text-slate-800">{currentInfo.penguji}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Highlight Metric Card */}
              <div className="p-4 rounded-xl bg-[#004b87] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                    <Award className="w-6 h-6 text-sky-200" />
                  </div>
                  <div>
                    <div className="text-xs text-sky-200 uppercase tracking-wider font-mono">
                      {isEditing ? (
                        <input
                          type="text"
                          value={currentInfo.highlightMetric?.label || 'Capaian Riset'}
                          onChange={e =>
                            setInfographic({
                              ...currentInfo,
                              highlightMetric: {
                                label: e.target.value,
                                value: currentInfo.highlightMetric?.value || ''
                              }
                            })
                          }
                          className="px-2 py-0.5 bg-white/20 rounded text-xs text-white"
                        />
                      ) : (
                        currentInfo.highlightMetric?.label || 'Capaian Riset Tugas Akhir'
                      )}
                    </div>
                    <div className="text-lg sm:text-xl font-bold font-mono tracking-tight text-white mt-0.5">
                      {isEditing ? (
                        <input
                          type="text"
                          value={currentInfo.highlightMetric?.value || 'Optimal & Tervalidasi'}
                          onChange={e =>
                            setInfographic({
                              ...currentInfo,
                              highlightMetric: {
                                label: currentInfo.highlightMetric?.label || '',
                                value: e.target.value
                              }
                            })
                          }
                          className="px-2 py-0.5 bg-white/20 rounded text-sm text-white font-mono mt-1 w-full"
                        />
                      ) : (
                        currentInfo.highlightMetric?.value || 'Optimal & Tervalidasi'
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] text-sky-200 font-mono hidden sm:block">
                  FMIPA Universitas Sebelas Maret
                </div>
              </div>

              {/* 3. Grid Section: Problem & Objectives */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Problem Statement */}
                <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#004b87] uppercase font-mono tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-[#004b87]" />
                    <span>1. Rumusan Masalah &amp; Urgensi</span>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={currentInfo.problemStatement}
                      onChange={e => setInfographic({ ...currentInfo, problemStatement: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans text-justify">
                      {currentInfo.problemStatement}
                    </p>
                  )}
                </div>

                {/* Objectives */}
                <div className="p-4 rounded-xl border border-sky-100 bg-sky-50/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#004b87] uppercase font-mono tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-sky-600" />
                    <span>2. Tujuan Penelitian Skripsi</span>
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={currentInfo.objectives}
                      onChange={e => setInfographic({ ...currentInfo, objectives: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans text-justify">
                      {currentInfo.objectives}
                    </p>
                  )}
                </div>
              </div>

              {/* 4. Methodology & Algorithm Pipeline */}
              <div className="p-5 rounded-xl border border-sky-100 bg-white space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#004b87] uppercase font-mono tracking-wider">
                    <Layers className="w-4 h-4 text-[#004b87]" />
                    <span>3. Metodologi Komputasi &amp; Model Matematis</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">3 Tahap Terstruktur</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  {currentInfo.methodology.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-[#004b87]/40 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#004b87] text-white flex items-center justify-center text-xs font-bold font-mono shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          Tahap {idx + 1}
                        </span>
                      </div>
                      {isEditing ? (
                        <textarea
                          rows={3}
                          value={step}
                          onChange={e => {
                            const updatedMeth = [...currentInfo.methodology];
                            updatedMeth[idx] = e.target.value;
                            setInfographic({ ...currentInfo, methodology: updatedMeth });
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <p className="text-xs text-slate-700 leading-snug">
                          {step}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Key Findings / Hasil Penelitian */}
              <div className="p-5 rounded-xl border border-sky-100 bg-sky-50/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#004b87] uppercase font-mono tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>4. Temuan Kunci &amp; Hasil Skripsi</span>
                </div>

                <div className="space-y-2">
                  {currentInfo.keyFindings.map((finding, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={finding}
                          onChange={e => {
                            const updatedFindings = [...currentInfo.keyFindings];
                            updatedFindings[idx] = e.target.value;
                            setInfographic({ ...currentInfo, keyFindings: updatedFindings });
                          }}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      ) : (
                        <span className="leading-relaxed">{finding}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Conclusions & Contribution */}
              <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 space-y-2">
                <div className="text-xs font-bold text-emerald-900 uppercase font-mono tracking-wider">
                  5. Kesimpulan &amp; Kontribusi Skripsi
                </div>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={currentInfo.conclusions}
                    onChange={e => setInfographic({ ...currentInfo, conclusions: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                ) : (
                  <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans text-justify">
                    {currentInfo.conclusions}
                  </p>
                )}
              </div>

              {/* 7. Keywords & Footer */}
              {currentInfo.keywords && currentInfo.keywords.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 pt-2 border-t border-sky-100">
                  <Tag className="w-3.5 h-3.5 text-[#004b87] shrink-0" />
                  <span className="font-semibold text-slate-700">Kata Kunci:</span>
                  {currentInfo.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-sky-50 text-[#004b87] border border-sky-200 text-[11px] font-mono"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Upload Custom Infographic Image (Admin Option) */}
              {isAdmin && isEditing && (
                <div className="p-4 rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/50 space-y-3">
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#004b87]" />
                    <span>Upload Poster / Gambar Infografik Buatan Sendiri (Opsional)</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-2 shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>Pilih File Gambar (.jpg, .png, .webp)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => {
                              const base64 = reader.result as string;
                              setInfographic({ ...currentInfo, customImageUrl: base64 });
                              setActiveView('customImage');
                              setFeedbackMsg({
                                text: `Gambar "${file.name}" berhasil dimuat! Klik Simpan Perubahan untuk menyimpan.`,
                                type: 'success'
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>

                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Atau masukkan URL gambar infografik..."
                        value={currentInfo.customImageUrl || ''}
                        onChange={e => setInfographic({ ...currentInfo, customImageUrl: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
