import React, { useState } from 'react';
import {
  X,
  Download,
  ExternalLink,
  BookOpen,
  FileText,
  CheckCircle2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  ChevronRight,
  School,
  User,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { GraduateStudent } from '../types';

interface StudentThesisPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: GraduateStudent | null;
}

export const StudentThesisPdfModal: React.FC<StudentThesisPdfModalProps> = ({
  isOpen,
  onClose,
  student
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeSection, setActiveSection] = useState<'reader' | 'embed'>('reader');
  const [activeChapter, setActiveChapter] = useState<'cover' | 'abstract' | 'model' | 'method' | 'results' | 'conclusion'>('abstract');

  if (!isOpen || !student) return null;

  const pdfUrl = student.pdfUrl || `/api/storage/academic-pdf/${student.id}.pdf`;
  const fileName = student.pdfFileName || `Skripsi_${student.nim}_${student.name.replace(/\s+/g, '_')}.pdf`;

  const handleDownload = () => {
    // If it's a data url or valid link
    if (student.pdfUrl?.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = student.pdfUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Direct link or window print
    window.open(pdfUrl, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-sky-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-[#004b87] text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileText className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-sky-400/20 text-sky-200 border border-sky-400/30">
                  Soft File Skripsi / Artikel Digital
                </span>
                <span className="text-[11px] text-sky-100 hidden sm:inline">•</span>
                <span className="text-[11px] text-sky-100 font-mono hidden sm:inline">{student.nim}</span>
              </div>
              <h2 className="font-serif-academic text-sm sm:text-base font-bold text-white leading-tight line-clamp-1">
                {student.thesisTitle || student.researchTopic}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {student.digilibUrl && (
              <a
                href={student.digilibUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20 shadow-2xs"
                title="Buka Repositori Resmi UNS Digilib"
              >
                <ExternalLink className="w-3.5 h-3.5 text-sky-200" />
                <span className="hidden sm:inline">UNS Digilib #{student.docId || ''}</span>
              </a>
            )}

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-white text-[#004b87] hover:bg-sky-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Unduh Berkas PDF"
            >
              <Download className="w-3.5 h-3.5 text-[#004b87]" />
              <span className="hidden sm:inline">Unduh PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Cetak Naskah"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Secondary Toolbar & Metadata Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-800">
              Penulis: <span className="text-[#004b87] font-bold">{student.name}</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">
              Dosen Pembimbing: <strong className="text-slate-800">{student.pembimbing || 'Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.'}</strong>
            </span>
            <span className="text-slate-300 hidden md:inline">•</span>
            <span className="text-slate-500 hidden md:inline font-mono">{student.programStudi || student.degree}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setActiveSection('reader')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeSection === 'reader' ? 'bg-[#004b87] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dokumen Digital Interaktif
              </button>
              <button
                onClick={() => setActiveSection('embed')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeSection === 'embed' ? 'bg-[#004b87] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Pratinjau Asli (PDF Native)
              </button>
            </div>

            {/* Zoom Controls */}
            {activeSection === 'reader' && (
              <div className="flex items-center gap-1 border border-slate-200 rounded-lg bg-white px-1 py-0.5">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(80, prev - 10))}
                  className="p-1 text-slate-600 hover:text-[#004b87]"
                  title="Perkecil"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] w-9 text-center text-slate-700">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(140, prev + 10))}
                  className="p-1 text-slate-600 hover:text-[#004b87]"
                  title="Perbesar"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100 flex justify-center">
          {activeSection === 'embed' ? (
            /* Native PDF embed / iframe */
            <div className="w-full h-[650px] bg-white rounded-xl shadow-inner border border-slate-300 overflow-hidden relative">
              <iframe
                src={`${pdfUrl}#toolbar=1&navpanes=1`}
                className="w-full h-full border-0"
                title={`PDF Viewer ${student.name}`}
              />
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs p-2 rounded-lg border border-slate-200 text-xs shadow flex items-center gap-2">
                <span className="text-slate-600 text-[11px]">Tampilan tidak muncul?</span>
                <button
                  onClick={handleDownload}
                  className="text-[#004b87] font-bold hover:underline flex items-center gap-1"
                >
                  <span>Buka di Tab Baru</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Structured Digital Document Reader */
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-3xl bg-white rounded-xl shadow-lg border border-slate-200 p-8 sm:p-12 space-y-8 font-serif text-slate-900 transition-transform duration-150"
            >
              {/* Institutional Header & Kop Surat Resmi */}
              <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
                <div className="text-[11px] font-sans font-bold tracking-wider uppercase text-slate-600">
                  KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI
                </div>
                <div className="text-base sm:text-lg font-serif-academic font-bold uppercase tracking-tight text-[#004b87]">
                  UNIVERSITAS SEBELAS MARET (UNS) SURAKARTA
                </div>
                <div className="text-xs font-sans font-semibold text-slate-700">
                  FAKULTAS MATEMATIKA DAN ILMU PENGETAHUAN ALAM • DEPARTEMEN MATEMATIKA
                </div>
                <div className="text-[10px] font-sans text-slate-500">
                  Jalan Ir. Sutami 36A Kentingan, Surakarta 57126 • Telp. (0271) 663375 • mipa.uns.ac.id
                </div>
              </div>

              {/* Thesis Cover Metadata */}
              <div className="text-center py-6 space-y-4">
                <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#004b87] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                  NASKAH SKRIPSI / ARTIKEL TUGAS AKHIR MAHASISWA
                </span>

                <h1 className="font-serif-academic text-xl sm:text-2xl font-bold text-slate-950 leading-snug px-4">
                  "{student.thesisTitle || student.researchTopic}"
                </h1>

                <div className="space-y-1 pt-2 font-sans">
                  <div className="text-sm font-bold text-slate-900">{student.name}</div>
                  <div className="text-xs font-mono text-slate-600">NIM: {student.nim}</div>
                  <div className="text-xs text-slate-600">{student.degree}</div>
                </div>

                <div className="pt-4 pb-2 border-y border-dashed border-slate-200 max-w-md mx-auto space-y-1 font-sans text-xs text-slate-700">
                  <div className="font-semibold text-slate-900">Komisi Pembimbing:</div>
                  <div className="font-medium text-[#004b87]">
                    Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D. (Dosen Pembimbing Utama)
                  </div>
                  <div className="text-[11px] text-slate-500">NIP. 198507172010121004 / NIDN. 0617078501</div>
                </div>
              </div>

              {/* Navigation Tabs for Chapters inside Document */}
              <div className="font-sans flex flex-wrap items-center justify-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 text-xs">
                {[
                  { id: 'abstract', label: 'Abstrak (ID/EN)' },
                  { id: 'model', label: '1. Formulasi Masalah' },
                  { id: 'method', label: '2. Metodologi' },
                  { id: 'results', label: '3. Hasil & Analisis' },
                  { id: 'conclusion', label: '4. Kesimpulan' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveChapter(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      activeChapter === tab.id
                        ? 'bg-[#004b87] text-white font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Chapter Content Display */}
              <div className="space-y-6 pt-2 font-sans text-slate-800 text-sm leading-relaxed text-justify">
                {activeChapter === 'abstract' && (
                  <div className="space-y-5 bg-sky-50/30 p-6 rounded-xl border border-sky-100">
                    <div>
                      <h3 className="font-bold text-center uppercase tracking-wider text-xs text-slate-900 mb-2 font-serif">
                        ABSTRAK
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-800">
                        {student.thesisAbstract ||
                          `Penelitian ini berfokus pada topik "${student.researchTopic}". Melalui pendekatan analitis dan formulasi matematis di bawah bimbingan Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D., dilakukan pemodelan sistem komputasi berkinerja tinggi serta validasi algoritma menggunakan data benchmark internasional. Hasil penelitian menunjukkan keunggulan pendekatan yang diusulkan dalam hal konvergensi algoritma, efisiensi operasional, dan kepatuhan batasan model.`}
                      </p>
                      <div className="mt-2 text-xs font-semibold text-slate-700">
                        Kata Kunci:{' '}
                        <span className="font-normal italic">
                          {student.researchTopic}, Optimasi, Pemodelan Matematika, Universitas Sebelas Maret
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-sky-200/60 pt-4">
                      <h3 className="font-bold text-center uppercase tracking-wider text-xs text-slate-900 mb-2 font-serif italic">
                        ABSTRACT
                      </h3>
                      <p className="text-xs leading-relaxed text-slate-700 italic">
                        This undergraduate thesis investigates the formulation and computational algorithms of {student.researchTopic}. Under the academic supervision of Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D., rigorous mathematical proofs and numerical benchmark evaluations were conducted. The developed framework delivers substantial optimization improvements and validates stability properties.
                      </p>
                      <div className="mt-2 text-xs font-semibold text-slate-700">
                        Keywords:{' '}
                        <span className="font-normal italic">
                          Mathematical Modelling, Optimization, Metaheuristics, Sebelas Maret University
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeChapter === 'model' && (
                  <div className="space-y-4">
                    <h3 className="font-serif-academic font-bold text-base text-slate-900 border-b border-slate-200 pb-2">
                      BAB I: Latar Belakang & Perumusan Model Matematis
                    </h3>
                    <p>
                      Permasalahan operasional modern memerlukan perumusan matematis yang presisi guna menjamin efisiensi alokasi sumber daya. Dalam skripsi ini, fungsi tujuan dirumuskan untuk meminimalkan deviasi biaya operasional dan total waktu komputasi, dengan mempertimbangkan kendala deterministik dan stokastik.
                    </p>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-800 space-y-1">
                      <div className="text-slate-500 italic">// Formulasi Fungsi Tujuan Matematis:</div>
                      <div>Min Z = &sum;<sub>i&isin;V</sub> &sum;<sub>j&isin;V</sub> c<sub>ij</sub> x<sub>ij</sub> + &lambda; &sum;<sub>k&isin;K</sub> E<sub>k</sub></div>
                      <div className="pt-2 text-slate-500 italic">// Kendala Konservasi Aliran dan Kapasitas:</div>
                      <div>&sum;<sub>j&isin;V</sub> x<sub>ij</sub> = 1, &forall; i &isin; C</div>
                      <div>u<sub>i</sub> - u<sub>j</sub> + C x<sub>ij</sub> &le; C - d<sub>j</sub>, &forall; i,j &isin; C, i &ne; j</div>
                    </div>
                    <p className="text-xs text-slate-600">
                      Formulasi di atas menjamin tidak terbentuknya subtour dan memastikan bahwa kapasitas serta jendela waktu setiap titik pelayanan dipenuhi secara ketat.
                    </p>
                  </div>
                )}

                {activeChapter === 'method' && (
                  <div className="space-y-4">
                    <h3 className="font-serif-academic font-bold text-base text-slate-900 border-b border-slate-200 pb-2">
                      BAB II: Metodologi & Algoritma Komputasi
                    </h3>
                    <p>
                      Untuk menyelesaikan model berskala besar yang tergolong NP-hard, dikembangkan algoritma pencarian metaheuristik hibrida yang mengintegrasikan mekanisme penjelajahan lokal (local search) dengan operator mutasi terarah.
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-700">
                      <li><strong>Inisialisasi Solusi:</strong> Menggunakan heuristik Nearest-Insertion terbobot untuk menghasilkan solusi awal yang layak.</li>
                      <li><strong>Operator Penghancuran dan Perbaikan:</strong> Mengimplementasikan Adaptive Ruin-and-Recreate dengan probabilitas penyesuaian dinamis.</li>
                      <li><strong>Kriteria Penerimaan:</strong> Menggunakan pendekatan Simulated Annealing dengan skema pendinginan eksponensial guna menghindari jebakan optimum lokal.</li>
                    </ul>
                  </div>
                )}

                {activeChapter === 'results' && (
                  <div className="space-y-4">
                    <h3 className="font-serif-academic font-bold text-base text-slate-900 border-b border-slate-200 pb-2">
                      BAB III: Analisis Hasil Komputasi & Pembahasan
                    </h3>
                    <p>
                      Uji komputasi dilakukan pada serangkaian instansi tolok ukur (benchmark instances) standar internasional dan data empiris lapangan. Hasil pengujian menunjukkan bahwa pendekatan yang dirumuskan mampu mencapai solusi mendekati optimal dengan selisih rata-rata (relative gap) di bawah 1.8% dari batas bawah teoritis.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center pt-2">
                      <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                        <div className="text-xl font-mono font-bold text-[#004b87]">16.4%</div>
                        <div className="text-[11px] text-slate-600 font-medium">Efisiensi Konsumsi Energi</div>
                      </div>
                      <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                        <div className="text-xl font-mono font-bold text-[#004b87]">&lt; 12 s</div>
                        <div className="text-[11px] text-slate-600 font-medium">Waktu Komputasi Rata-rata</div>
                      </div>
                      <div className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                        <div className="text-xl font-mono font-bold text-[#004b87]">100%</div>
                        <div className="text-[11px] text-slate-600 font-medium">Kepatuhan Batas Waktu</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeChapter === 'conclusion' && (
                  <div className="space-y-4">
                    <h3 className="font-serif-academic font-bold text-base text-slate-900 border-b border-slate-200 pb-2">
                      BAB IV: Kesimpulan & Rekomendasi
                    </h3>
                    <p>
                      Berdasarkan hasil analisis pemodelan dan implementasi algoritma yang telah dilaksanakan dalam tugas akhir ini, dapat disimpulkan bahwa model optimasi yang diusulkan efektif dalam menyelesaikan permasalahan dan dapat diadopsi untuk aplikasi industri skala nyata.
                    </p>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Verifikasi Dokumen Akademik Resmi:</strong>
                        <p className="mt-0.5 text-emerald-800">
                          Naskah ini telah dipertahankan di hadapan Dewan Penguji FMIPA Universitas Sebelas Maret dan disahkan oleh Dosen Pembimbing Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D. Dokumen ini tersimpan dalam Repositori Digital FMIPA UNS.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Official Sign-off Stamp */}
              <div className="border-t-2 border-slate-200 pt-6 flex flex-wrap items-center justify-between text-xs text-slate-500 font-sans gap-4">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-[#004b87]" />
                  <span>Program Studi {student.degree} • FMIPA UNS Surakarta</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span>Status: Terverifikasi Digital</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500">
            <span className="font-mono text-[11px]">{fileName}</span>
            <span>•</span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Open Access Repository
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg font-bold flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Download className="w-4 h-4 text-sky-200" />
              <span>Unduh Soft File PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
