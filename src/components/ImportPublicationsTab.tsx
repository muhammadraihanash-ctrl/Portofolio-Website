import React, { useState, useEffect, useMemo } from 'react';
import {
  DownloadCloud,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  FileCheck,
  CheckSquare,
  Square,
  RefreshCw,
  ExternalLink,
  Download,
  Trash2,
  ChevronDown,
  Info,
  Layers,
  BookOpen,
  GraduationCap,
  Sparkles,
  Database,
  ArrowRight,
  ShieldCheck,
  Clock,
  Upload,
  Code,
  Eye,
  X
} from 'lucide-react';
import {
  ScrapedPublicationItem,
  ScraperFetchParams,
  ImportBatchRecord,
  PublicationType
} from '../types';
import { academicService } from '../services/academicService';

interface ImportPublicationsTabProps {
  onImportComplete?: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const ImportPublicationsTab: React.FC<ImportPublicationsTabProps> = ({
  onImportComplete,
  showToast
}) => {
  // Source Selection (defaulting to digilib per user request)
  const [sourceType, setSourceType] = useState<'digilib' | 'file_upload' | 'custom_html' | 'sinta'>('digilib');
  const [sintaView, setSintaView] = useState<'iprs' | 'scopus' | 'garuda' | 'googlescholar' | 'researches'>('iprs');
  const [targetUrl, setTargetUrl] = useState<string>('https://sinta.kemdiktisaintek.go.id/authors/profile/6765487/?view=iprs');
  const [rawHtmlInput, setRawHtmlInput] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('Nughthoh Arfawi Kurdhi');

  // Scraping / Fetching State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [fetchStats, setFetchStats] = useState<{
    totalFound: number;
    extractedCount: number;
    failedCount: number;
    duplicatesCount: number;
    mode?: string;
  } | null>(null);

  // Scraped Items in preview table
  const [items, setItems] = useState<ScrapedPublicationItem[]>([]);

  // Filters for preview table
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCompleteness, setFilterCompleteness] = useState<string>('all');
  const [filterDuplicate, setFilterDuplicate] = useState<'all' | 'new_only' | 'duplicate_only'>('all');
  const [filterKurdhiOnly, setFilterKurdhiOnly] = useState<boolean>(false);

  // Detail Modal
  const [selectedDetailItem, setSelectedDetailItem] = useState<ScrapedPublicationItem | null>(null);

  // Import History
  const [history, setHistory] = useState<ImportBatchRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Update URL whenever source or sub-view changes
  useEffect(() => {
    if (sourceType === 'sinta') {
      setTargetUrl(`https://sinta.kemdiktisaintek.go.id/authors/profile/6765487/?view=${sintaView}`);
    } else if (sourceType === 'digilib') {
      setTargetUrl(`https://digilib.uns.ac.id/dokumen/search?q=${encodeURIComponent(searchQuery || 'Nughthoh Arfawi Kurdhi')}`);
    }
  }, [sourceType, sintaView, searchQuery]);

  // Load import history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const records = await academicService.getImportHistory();
      setHistory(records);
    } catch {
      // ignore
    } finally {
      setHistoryLoading(false);
    }
  };

  // Start scraping / fetching
  const handleStartFetch = async () => {
    setIsLoading(true);
    setWarningMessage(null);

    const params: ScraperFetchParams = {
      source: sourceType,
      url: targetUrl,
      rawHtml: (sourceType === 'custom_html' || sourceType === 'file_upload') ? rawHtmlInput : undefined,
      sintaView: sourceType === 'sinta' ? sintaView : undefined,
      searchQuery: sourceType === 'digilib' ? searchQuery : undefined
    };

    try {
      const result = await academicService.scrapePublications(params);

      if (result.success && result.items.length > 0) {
        setItems(result.items);
        setFetchStats({
          totalFound: result.totalFound,
          extractedCount: result.extractedCount,
          failedCount: result.failedCount,
          duplicatesCount: result.duplicatesCount,
          mode: result.mode
        });

        if (result.warning) {
          setWarningMessage(result.warning);
        }

        showToast(`Berhasil mengambil ${result.items.length} publikasi dari ${result.source}!`);
      } else {
        setItems([]);
        setFetchStats(null);
        showToast(result.message || 'Tidak ada data publikasi yang ditemukan.', 'error');
        if (result.warning) {
          setWarningMessage(result.warning);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Gagal menghubungi scraper server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Re-validate against database
  const handleValidateData = async () => {
    if (items.length === 0) return;
    setIsValidating(true);
    try {
      const { items: revalidated, duplicatesCount } = await academicService.validateScrapedPublications(items);
      setItems(revalidated);
      setFetchStats(prev => prev ? { ...prev, duplicatesCount } : null);
      showToast(`Validasi selesai. Ditemukan ${duplicatesCount} duplikasi dari total ${items.length} publikasi.`);
    } catch {
      showToast('Gagal memvalidasi metadata.', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  // In-app confirmation dialog for import tab
  const [tabConfirmDialog, setTabConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    isDestructive?: boolean;
    onConfirm: () => Promise<void> | void;
  } | null>(null);
  const [isTabConfirmLoading, setIsTabConfirmLoading] = useState(false);

  // Import Selected
  const handleImportSelected = async () => {
    const selected = items.filter(it => it.selected);
    if (selected.length === 0) {
      showToast('Pilih setidaknya 1 publikasi untuk diimpor.', 'error');
      return;
    }

    const confirmMsg = `Impor ${selected.length} publikasi ke database portofolio akademik? Data akan langsung terintegrasi dan tersimpan secara permanen di database.`;
    setTabConfirmDialog({
      isOpen: true,
      title: `Konfirmasi Impor ${selected.length} Publikasi`,
      message: confirmMsg,
      confirmText: 'Ya, Impor Sekarang',
      isDestructive: false,
      onConfirm: async () => {
        setIsImporting(true);
        try {
          const sourceLabel = sourceType === 'sinta'
            ? `SINTA Kemdiktisaintek (${sintaView})`
            : sourceType === 'digilib'
            ? 'Digilib UNS'
            : sourceType === 'custom_html'
            ? 'Manual HTML Import'
            : 'File Upload';

          const res = await academicService.importScrapedPublications(
            selected,
            sourceLabel,
            targetUrl,
            `Diimpor ${selected.length} publikasi (${selected.filter(s => s.isKurdhiVerified).length} terverifikasi Kurdhi)`
          );

          if (res.success) {
            showToast(res.message);
            // Deselect or remove imported items from view, or mark them
            setItems(prev => prev.map(item => selected.some(s => s.tempId === item.tempId) ? { ...item, isDuplicate: true, duplicateMatchReason: 'Baru saja diimpor' } : item));
            loadHistory();
            if (onImportComplete) onImportComplete();
          } else {
            showToast(res.message, 'error');
          }
        } catch (err: any) {
          showToast(err.message || 'Gagal mengimpor publikasi.', 'error');
        } finally {
          setIsImporting(false);
        }
      }
    });
  };

  // Download CSV
  const handleDownloadCsv = async () => {
    const listToExport = filteredItems.length > 0 ? filteredItems : items;
    if (listToExport.length === 0) {
      showToast('Tidak ada data publikasi untuk diunduh.', 'error');
      return;
    }

    try {
      const csvContent = await academicService.exportScrapedCsv(listToExport);
      if (!csvContent) {
        showToast('Gagal menghasilkan berkas CSV.', 'error');
        return;
      }

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `publikasi_${sourceType}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Berhasil mengunduh dataset CSV (${listToExport.length} publikasi).`);
    } catch (err: any) {
      showToast('Gagal mengekspor CSV.', 'error');
    }
  };

  // Toggle single item selection
  const toggleItemSelection = (tempId: string) => {
    setItems(prev => prev.map(it => it.tempId === tempId ? { ...it, selected: !it.selected } : it));
  };

  // Select all / Deselect all
  const selectAll = (val: boolean) => {
    setItems(prev => prev.map(it => ({ ...it, selected: val })));
  };

  // Delete import history batch
  const handleDeleteHistory = (batchId: string, rollback: boolean) => {
    const promptText = rollback
      ? 'Hapus catatan riwayat ini dan BATALKAN (hapus) seluruh publikasi yang diimpor pada batch ini dari database?'
      : 'Hapus catatan riwayat impor ini? (Publikasi yang sudah tersimpan di database tidak akan terpengaruh)';

    setTabConfirmDialog({
      isOpen: true,
      title: rollback ? 'Batalkan & Hapus Publikasi Impor' : 'Hapus Catatan Riwayat',
      message: promptText,
      confirmText: rollback ? 'Ya, Hapus & Batalkan' : 'Ya, Hapus Catatan',
      isDestructive: true,
      onConfirm: async () => {
        try {
          const ok = await academicService.deleteImportHistory(batchId, rollback);
          if (ok) {
            showToast('Catatan riwayat impor berhasil dihapus.');
            loadHistory();
            if (rollback && onImportComplete) onImportComplete();
          } else {
            showToast('Gagal menghapus riwayat impor.', 'error');
          }
        } catch {
          showToast('Terjadi kesalahan saat menghapus.', 'error');
        }
      }
    });
  };

  // Filtered preview items
  const filteredItems = useMemo(() => {
    return items.filter(it => {
      // Search
      if (previewSearch.trim()) {
        const q = previewSearch.toLowerCase().trim();
        const matchesTitle = it.title.toLowerCase().includes(q);
        const matchesAuthors = it.authorsText.toLowerCase().includes(q);
        const matchesVenue = it.venue.toLowerCase().includes(q);
        const matchesKeywords = it.keywords.some(k => k.toLowerCase().includes(q));
        if (!matchesTitle && !matchesAuthors && !matchesVenue && !matchesKeywords) return false;
      }

      // Year
      if (filterYear !== 'all' && it.year !== Number(filterYear)) {
        return false;
      }

      // Type
      if (filterType !== 'all' && it.type !== filterType) {
        return false;
      }

      // Completeness
      if (filterCompleteness !== 'all' && it.completeness !== filterCompleteness) {
        return false;
      }

      // Duplicate
      if (filterDuplicate === 'new_only' && it.isDuplicate) return false;
      if (filterDuplicate === 'duplicate_only' && !it.isDuplicate) return false;

      // Kurdhi only
      if (filterKurdhiOnly && !it.isKurdhiVerified) return false;

      return true;
    });
  }, [items, previewSearch, filterYear, filterType, filterCompleteness, filterDuplicate, filterKurdhiOnly]);

  // Unique years in preview
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    items.forEach(it => { if (it.year) set.add(it.year); });
    return Array.from(set).sort((a, b) => b - a);
  }, [items]);

  const selectedCount = items.filter(it => it.selected).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003366] to-[#005599] rounded-2xl p-6 text-white shadow-sm border border-sky-900/30">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-sky-400/20 text-sky-200 border border-sky-300/30 text-[11px] font-mono px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <DownloadCloud className="w-3.5 h-3.5" />
                Automated Metadata Harvester
              </span>
              <span className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] font-mono px-2.5 py-0.5 rounded-full font-semibold">
                Digilib UNS &amp; Scopus
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-academic tracking-tight">
              Import Publikasi
            </h2>
            <p className="text-xs sm:text-sm text-sky-100/90 mt-1 max-w-2xl">
              Tarik otomatis data karya ilmiah, skripsi mahasiswa, dan publikasi penelitian langsung dari repositori Digilib Universitas Sebelas Maret (UNS), data Scopus, atau berkas dataset ke database portfolio Anda.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/10 text-xs">
            <div className="text-right">
              <div className="text-[10px] text-sky-200 uppercase font-mono font-semibold">Profil Dosen Terhubung</div>
              <div className="font-bold text-white text-xs">Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.</div>
              <div className="text-[11px] text-sky-100 font-mono">NIDN: 0617078501 • Scopus ID: 55851190200</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-base text-white border border-white/20">
              NAK
            </div>
          </div>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#004b87] flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pilih Sumber Data &amp; Konfigurasi Pencarian</h3>
              <p className="text-xs text-slate-500">Tentukan repositori target untuk penarikan metadata</p>
            </div>
          </div>

          {/* Source Tabs */}
          <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setSourceType('digilib')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sourceType === 'digilib'
                  ? 'bg-white text-[#004b87] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Digilib UNS (Repositori Kampus)
            </button>
            <button
              onClick={() => setSourceType('sinta')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sourceType === 'sinta'
                  ? 'bg-white text-[#004b87] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scopus &amp; Publikasi Ilmiah
            </button>
            <button
              onClick={() => setSourceType('custom_html')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sourceType === 'custom_html'
                  ? 'bg-white text-[#004b87] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tempel Kode HTML
            </button>
            <button
              onClick={() => setSourceType('file_upload')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sourceType === 'file_upload'
                  ? 'bg-white text-[#004b87] shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Unggah File Dataset
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Source 1: Scopus & Publikasi Ilmiah */}
          {sourceType === 'sinta' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori / Dataset Publikasi:
                  </label>
                  <select
                    value={sintaView}
                    onChange={e => setSintaView(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#004b87] focus:bg-white"
                  >
                    <option value="scopus">Scopus Index Publications</option>
                    <option value="garuda">Publikasi Jurnal Ilmiah (Garuda/Nasional)</option>
                    <option value="iprs">IPR / Hak Cipta &amp; Paten Resmi</option>
                    <option value="googlescholar">Google Scholar Citations</option>
                    <option value="researches">Hibah Riset &amp; Penelitian</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>URL Sumber / Profil Publikasi:</span>
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#004b87] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Buka Tautan di Tab Baru</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-[#004b87] focus:bg-white"
                    placeholder="https://sinta.kemdiktisaintek.go.id/authors/profile/6765487/?view=iprs"
                  />
                </div>
              </div>

              <div className="bg-sky-50/60 border border-sky-200/70 rounded-xl p-3 text-xs text-sky-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <div className="font-semibold text-sky-950">Data Scopus &amp; Publikasi Ilmiah Terverifikasi</div>
                  <p className="text-slate-600">
                    Sistem menarik metadata terstruktur (Judul, Author, Tahun, Nomor HKI/Paten, Jurnal, DOI, Volume, Halaman). Jika koneksi live ke repositori dibatasi oleh firewall, sistem otomatis memuat dataset terverifikasi publikasi Nughthoh Arfawi Kurdhi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Source 2: Digilib UNS */}
          {sourceType === 'digilib' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Kunci Pencarian:
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#004b87] focus:bg-white"
                    placeholder="Nughthoh Arfawi Kurdhi"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>URL Pencarian Digilib UNS:</span>
                    <a
                      href={targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#004b87] hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <span>Buka Pencarian Digilib di Tab Baru</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </label>
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-[#004b87] focus:bg-white"
                    placeholder="https://digilib.uns.ac.id/dokumen/search?q=Nughthoh+Arfawi+Kurdhi"
                  />
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1 leading-relaxed">
                  <div className="font-semibold text-amber-950">Target Repositori: 74 Dokumen Akademik Digilib UNS</div>
                  <p className="text-slate-600">
                    Mencakup karya skripsi sarjana dan tesis magister bimbingan Nughthoh Arfawi Kurdhi, laporan penelitian hibah PNBP UNS, dan artikel ilmiah perpustakaan. Apabila server perpustakaan UNS berada di balik intranet/firewall, sistem langsung memuat ke-74 dokumen terverifikasi lengkap dengan abstrak dan kata kunci.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Source 3: Custom HTML */}
          {sourceType === 'custom_html' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempel Kode HTML Halaman (View Source / Ctrl+U):
                </label>
                <textarea
                  value={rawHtmlInput}
                  onChange={e => setRawHtmlInput(e.target.value)}
                  rows={6}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-[#004b87] focus:bg-white"
                  placeholder="<!DOCTYPE html><html>... tempelkan source code HTML halaman Digilib UNS atau SINTA di sini ..."
                />
              </div>
              <p className="text-xs text-slate-500">
                Fitur ini sangat berguna jika Anda membuka halaman SINTA atau Digilib UNS langsung di browser lokal Anda dan ingin mem-bypass segala bentuk proteksi CAPTCHA atau intranet.
              </p>
            </div>
          )}

          {/* Source 4: File Upload */}
          {sourceType === 'file_upload' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unggah Berkas CSV / BibTeX / JSON Publikasi:
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Pilih berkas dataset dari komputer Anda</p>
                  <p className="text-[11px] text-slate-500 mt-1">Mendukung format .csv, .bib, .json</p>
                  <input
                    type="file"
                    accept=".csv,.bib,.json,.txt"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setRawHtmlInput(reader.result as string);
                          showToast(`Berkas "${file.name}" siap diproses!`);
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="mt-3 text-xs mx-auto"
                  />
                </div>
              </div>
              {rawHtmlInput && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between">
                  <span>Berkas dataset terdeteksi ({rawHtmlInput.length} karakter)</span>
                  <button
                    onClick={() => setRawHtmlInput('')}
                    className="text-emerald-700 hover:text-red-700 font-semibold"
                  >
                    Hapus
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action Row: Start Scraping */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Proses scraping dilakukan secara aman melalui backend proxy server.</span>
            </div>

            <button
              onClick={handleStartFetch}
              disabled={isLoading}
              className={`px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-white transition-all flex items-center gap-2 ${
                isLoading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-[#004b87] hover:bg-[#003866] shadow-sm hover:shadow'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sedang Mengambil Data...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="w-4 h-4" />
                  <span>Mulai Pengambilan Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Warning / Notification Banner if Network Failover Happened */}
      {warningMessage && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-950">Status Koneksi Harvester</div>
            <p className="text-slate-700 leading-relaxed">{warningMessage}</p>
          </div>
        </div>
      )}

      {/* Summary Metrics Bar if Data Extracted */}
      {fetchStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
            <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Ditemukan</div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{fetchStats.totalFound}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Dokumen teridentifikasi</div>
          </div>
          <div className="bg-white border border-emerald-200/80 rounded-xl p-3.5 shadow-2xs">
            <div className="text-[11px] font-medium text-emerald-700 uppercase tracking-wider">Berhasil Diekstrak</div>
            <div className="text-xl font-bold text-emerald-700 mt-0.5">{fetchStats.extractedCount}</div>
            <div className="text-[11px] text-emerald-600 mt-0.5">Siap diverifikasi</div>
          </div>
          <div className="bg-white border border-amber-200/80 rounded-xl p-3.5 shadow-2xs">
            <div className="text-[11px] font-medium text-amber-700 uppercase tracking-wider">Duplikat Terdeteksi</div>
            <div className="text-xl font-bold text-amber-700 mt-0.5">{fetchStats.duplicatesCount}</div>
            <div className="text-[11px] text-amber-600 mt-0.5">Sudah ada di database</div>
          </div>
          <div className="bg-white border border-sky-200/80 rounded-xl p-3.5 shadow-2xs">
            <div className="text-[11px] font-medium text-[#004b87] uppercase tracking-wider">Terpilih Untuk Impor</div>
            <div className="text-xl font-bold text-[#004b87] mt-0.5">{selectedCount}</div>
            <div className="text-[11px] text-sky-700 mt-0.5">Dari {items.length} item</div>
          </div>
        </div>
      )}

      {/* Preview Table Section */}
      {items.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Table Header & Primary Actions */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Tabel Pratinjau & Verifikasi Metadata ({items.length} Dokumen)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Periksa kelengkapan metadata sebelum mengimpor ke portfolio resmi.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleValidateData}
                disabled={isValidating}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isValidating ? 'animate-spin' : ''}`} />
                <span>Validasi Data</span>
              </button>

              <button
                onClick={handleDownloadCsv}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Dataset CSV</span>
              </button>

              <button
                onClick={handleImportSelected}
                disabled={isImporting || selectedCount === 0}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 ${
                  isImporting || selectedCount === 0
                    ? 'bg-emerald-300 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800 shadow-xs'
                }`}
              >
                {isImporting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengimpor ke Database...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Impor Publikasi Terpilih ({selectedCount})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="p-4 border-b border-slate-200 bg-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
            <div className="lg:col-span-2 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={previewSearch}
                onChange={e => setPreviewSearch(e.target.value)}
                placeholder="Cari judul, penulis, kata kunci..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-[#004b87]"
              />
            </div>

            <div>
              <select
                value={filterYear}
                onChange={e => setFilterYear(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
              >
                <option value="all">Semua Tahun</option>
                {availableYears.map(y => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
              >
                <option value="all">Semua Tipe Dokumen</option>
                <option value="Journal Article">Journal Article</option>
                <option value="Student Thesis">Student Thesis (Skripsi/Tesis)</option>
                <option value="Conference Paper">Conference Paper</option>
                <option value="Book Chapter">Book Chapter / IPR</option>
              </select>
            </div>

            <div>
              <select
                value={filterCompleteness}
                onChange={e => setFilterCompleteness(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
              >
                <option value="all">Semua Kelengkapan</option>
                <option value="complete">Lengkap (&gt;= 80%)</option>
                <option value="moderate">Cukup (60 - 79%)</option>
                <option value="minimal">Kurang (&lt; 60%)</option>
              </select>
            </div>

            <div>
              <select
                value={filterDuplicate}
                onChange={e => setFilterDuplicate(e.target.value as any)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
              >
                <option value="all">Semua Status</option>
                <option value="new_only">Hanya Karya Baru</option>
                <option value="duplicate_only">Hanya Duplikat</option>
              </select>
            </div>
          </div>

          {/* Quick Selection & Verification Bar */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => selectAll(true)}
                className="text-[#004b87] hover:underline font-semibold flex items-center gap-1"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Pilih Semua ({items.length})</span>
              </button>
              <button
                onClick={() => selectAll(false)}
                className="text-slate-500 hover:underline font-semibold flex items-center gap-1"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Batal Pilih Semua</span>
              </button>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-semibold">
              <input
                type="checkbox"
                checked={filterKurdhiOnly}
                onChange={e => setFilterKurdhiOnly(e.target.checked)}
                className="rounded border-slate-300 text-[#004b87] focus:ring-[#004b87]"
              />
              <span className="text-[#004b87]">Hanya Karya Terverifikasi Nughthoh Arfawi Kurdhi</span>
            </label>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-semibold">
                  <th className="py-2.5 px-3 w-10 text-center">Pilih</th>
                  <th className="py-2.5 px-3">Judul Publikasi & Dokumen</th>
                  <th className="py-2.5 px-3 w-48">Penulis / Pembimbing</th>
                  <th className="py-2.5 px-3 w-16 text-center">Tahun</th>
                  <th className="py-2.5 px-3 w-36">Jurnal / Repositori</th>
                  <th className="py-2.5 px-3 w-28 text-center">Tipe</th>
                  <th className="py-2.5 px-3 w-28 text-center">Kelengkapan</th>
                  <th className="py-2.5 px-3 w-24 text-center">Status Duplikasi</th>
                  <th className="py-2.5 px-3 w-16 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => {
                  return (
                    <tr
                      key={item.tempId}
                      className={`hover:bg-sky-50/50 transition-colors ${
                        item.selected ? 'bg-sky-50/30' : ''
                      } ${item.isDuplicate ? 'opacity-85' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={!!item.selected}
                          onChange={() => toggleItemSelection(item.tempId)}
                          className="rounded border-slate-300 text-[#004b87] focus:ring-[#004b87] cursor-pointer"
                        />
                      </td>

                      {/* Title */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 leading-snug line-clamp-2">
                          {item.title}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-mono text-slate-400">ID: {item.tempId}</span>
                          {item.doi && (
                            <span className="text-sky-700 font-mono">DOI: {item.doi}</span>
                          )}
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-sky-700 flex items-center gap-0.5"
                            >
                              <span>Tautan</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Authors */}
                      <td className="py-3 px-3">
                        <div className="text-slate-700 line-clamp-2 leading-relaxed">
                          {item.authorsText}
                        </div>
                        <div className="mt-1">
                          {item.isKurdhiVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Kurdhi Terverifikasi</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                              <AlertCircle className="w-3 h-3" />
                              <span>Non-Kurdhi / Luar</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Year */}
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                        {item.year || '-'}
                      </td>

                      {/* Venue */}
                      <td className="py-3 px-3 text-slate-600 line-clamp-2">
                        {item.venue}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 text-[10px] rounded-full font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.documentTypeOriginal || item.type}
                        </span>
                      </td>

                      {/* Completeness */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              item.completeness === 'complete'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.completeness === 'moderate'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.completenessScore}%
                          </span>
                          {item.missingFields.length > 0 && (
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Tanpa: {item.missingFields.join(', ')}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duplicate Status */}
                      <td className="py-3 px-3 text-center">
                        {item.isDuplicate ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                              Duplikat
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5 max-w-[120px] truncate" title={item.duplicateMatchReason}>
                              {item.duplicateMatchReason}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                            Baru
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => setSelectedDetailItem(item)}
                          className="p-1 text-slate-400 hover:text-[#004b87] rounded hover:bg-slate-100"
                          title="Lihat Detail Metadata"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      Tidak ada publikasi yang cocok dengan kriteria filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Import History Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-slate-900 text-sm">Riwayat Proses Impor Sebelumnya</h3>
          </div>
          <button
            onClick={loadHistory}
            disabled={historyLoading}
            className="text-xs text-[#004b87] hover:underline font-semibold flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${historyLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan Riwayat</span>
          </button>
        </div>

        <div className="p-4">
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map(batch => (
                <div
                  key={batch.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{batch.source}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {batch.status}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px]">ID: {batch.id}</span>
                    </div>
                    <div className="text-slate-600">
                      {batch.notes || `Berhasil mengimpor ${batch.totalImported} publikasi.`}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Waktu: {new Date(batch.timestamp).toLocaleString('id-ID')} • Oleh: {batch.adminEmail}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDeleteHistory(batch.id, false)}
                      className="px-2.5 py-1 text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-slate-200"
                      title="Hapus riwayat log saja"
                    >
                      Hapus Log
                    </button>
                    <button
                      onClick={() => handleDeleteHistory(batch.id, true)}
                      className="px-2.5 py-1 text-red-600 hover:text-white hover:bg-red-700 rounded-lg transition-colors border border-red-200"
                      title="Hapus publikasi yang diimpor pada batch ini dari database"
                    >
                      Batalkan Batch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              Belum ada riwayat impor yang tercatat.
            </div>
          )}
        </div>
      </div>

      {/* Metadata Detail Preview Modal */}
      {selectedDetailItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                  {selectedDetailItem.source} • {selectedDetailItem.type}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {selectedDetailItem.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500 block">Penulis:</span>
                <p className="text-slate-800 font-medium">{selectedDetailItem.authorsText}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="font-semibold text-slate-500 block">Tahun Publikasi:</span>
                  <p className="text-slate-800">{selectedDetailItem.year}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block">Verifikasi Kurdhi:</span>
                  <p className={selectedDetailItem.isKurdhiVerified ? 'text-emerald-700 font-bold' : 'text-amber-700'}>
                    {selectedDetailItem.isKurdhiVerified ? 'Terverifikasi (Author/Supervisor)' : 'Non-Kurdhi'}
                  </p>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-500 block">Jurnal / Repositori / Penerbit:</span>
                <p className="text-slate-800">{selectedDetailItem.venue}</p>
              </div>

              {selectedDetailItem.abstract && (
                <div>
                  <span className="font-semibold text-slate-500 block">Abstrak Dokumen:</span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1">
                    {selectedDetailItem.abstract}
                  </p>
                </div>
              )}

              {selectedDetailItem.keywords && selectedDetailItem.keywords.length > 0 && (
                <div>
                  <span className="font-semibold text-slate-500 block">Kata Kunci:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {selectedDetailItem.keywords.map((k, i) => (
                      <span key={i} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDetailItem.url && (
                <div>
                  <span className="font-semibold text-slate-500 block">Tautan Dokumen:</span>
                  <a
                    href={selectedDetailItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#004b87] hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>{selectedDetailItem.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedDetailItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-app confirmation dialog for import tab actions */}
      {tabConfirmDialog && tabConfirmDialog.isOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in fade-in zoom-in-95 duration-150 relative z-[10000]">
            <div className="flex items-start gap-4 mb-5">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                  tabConfirmDialog.isDestructive
                    ? 'bg-red-100 text-red-600 ring-4 ring-red-50'
                    : 'bg-sky-100 text-[#004b87] ring-4 ring-sky-50'
                }`}
              >
                {tabConfirmDialog.isDestructive ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <DownloadCloud className="w-5 h-5" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {tabConfirmDialog.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {tabConfirmDialog.message}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTabConfirmDialog(null)}
                disabled={isTabConfirmLoading}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsTabConfirmLoading(true);
                  try {
                    await tabConfirmDialog.onConfirm();
                  } catch (e: any) {
                    showToast(e?.message || 'Gagal memproses aksi.', 'error');
                  } finally {
                    setIsTabConfirmLoading(false);
                    setTabConfirmDialog(null);
                  }
                }}
                disabled={isTabConfirmLoading}
                className={`px-5 py-2 text-xs sm:text-sm font-semibold text-white rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer ${
                  tabConfirmDialog.isDestructive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#004b87] hover:bg-[#003865]'
                }`}
              >
                {isTabConfirmLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>{tabConfirmDialog.confirmText || 'Lanjutkan'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
