import React, { useState } from 'react';
import {
  ExternalLink,
  Filter,
  Info,
  Calendar,
  FileText,
  Search,
  Check,
  Copy,
  Layers,
  Sparkles,
  BookOpen,
  ArrowRight,
  Sliders,
  Link2
} from 'lucide-react';
import { AnnualPerformanceIndexEntry, Publication, P2MActivity } from '../types';

interface AnnualPerformanceSectionProps {
  performance: AnnualPerformanceIndexEntry[];
  publications?: Publication[];
  p2mActivities?: P2MActivity[];
  onOpenDetail?: (pub: Publication) => void;
  onNavigateToPublications?: (year?: number) => void;
}

export const AnnualPerformanceSection: React.FC<AnnualPerformanceSectionProps> = ({
  performance,
  publications = [],
  p2mActivities = [],
  onOpenDetail,
  onNavigateToPublications
}) => {
  // Table filters
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Interactive IRIS Inquiry State
  const [inquiryYear, setInquiryYear] = useState<number>(2026);
  const [inquiryIndicator, setInquiryIndicator] = useState<string>('scopus');
  const [submittedInquiry, setSubmittedInquiry] = useState<{ year: number; indicator: string }>({
    year: 2026,
    indicator: 'scopus'
  });
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Dynamic P2M database state loaded from backend database_p2m_mysql.sql / MySQL integration
  const [liveP2MActivities, setLiveP2MActivities] = useState<P2MActivity[]>(p2mActivities);
  const [liveAnnualMetrics, setLiveAnnualMetrics] = useState<Record<number, { penelitian: number; pengabdian: number; total: number }>>({});
  const [dbP2MStatus, setDbP2MStatus] = useState<any>(null);

  React.useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch('/api/p2m/kegiatan').then(r => r.json()).catch(() => null),
      fetch('/api/p2m/annual-metrics').then(r => r.json()).catch(() => null)
    ]).then(([kegiatanRes, metricsRes]) => {
      if (!isMounted) return;
      if (kegiatanRes && kegiatanRes.success && Array.isArray(kegiatanRes.data) && kegiatanRes.data.length > 0) {
        const mapped: P2MActivity[] = kegiatanRes.data.map((row: any) => ({
          id: `p2m-sql-${row.id}`,
          year: row.tahun,
          title: row.judul,
          role: row.peran,
          status: row.status_usulan,
          jenis: row.jenis,
          groupRiset: row.group_riset,
          skema: row.skema,
          dana: row.skema?.includes('KEMDIKTISAINTEK')
            ? 'BIMA Kemdiktisaintek RI'
            : row.skema?.includes('UNS')
            ? 'Dana Hibah Internal UNS'
            : 'Sumber Dana Riset Nasional'
        }));
        setLiveP2MActivities(mapped);
        if (kegiatanRes.status) setDbP2MStatus(kegiatanRes.status);
      }
      if (metricsRes && metricsRes.success && metricsRes.data) {
        setLiveAnnualMetrics(metricsRes.data);
      }
    });

    return () => { isMounted = false; };
  }, []);

  const categories = [
    { key: 'p2m', label: 'Community Service & Research (P2M)', link: 'https://iris1103.uns.ac.id/profil-0617078501.asm#tab_1_11' },
    { key: 'scopus', label: 'Scopus Publications', link: 'https://iris1103.uns.ac.id/profil-0617078501.asm#scopus' },
    { key: 'jurnal', label: 'Journals', link: 'https://iris1103.uns.ac.id/profil-0617078501.asm#tab_1_22' },
    { key: 'prosiding', label: 'Proceedings', link: 'https://iris1103.uns.ac.id/profil-0617078501.asm#tab_1_23' },
    { key: 'paten', label: 'Patents', link: 'https://iris1103.uns.ac.id/profil-0617078501.asm#tab_1_24' },
    { key: 'buku', label: 'Books', link: 'https://iris1103.uns.ac.id/profil-0617078501.asm#tab_1_25' },
    { key: 'hki', label: 'Copyrights / IPR', link: 'https://iris1103.uns.ac.id/profil-0617078501.asm#tab_1_26' }
  ];

  const safePerformance = performance || [];
  const filteredYears = safePerformance.filter(p => {
    if (selectedYear !== 'All' && String(p.year) !== selectedYear) return false;
    return true;
  });

  const handleRunInquiry = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmittedInquiry({
      year: inquiryYear,
      indicator: inquiryIndicator
    });
  };

  const handleQuickJump = (year: number, indicatorKey: string) => {
    setInquiryYear(year);
    setInquiryIndicator(indicatorKey);
    setSubmittedInquiry({ year, indicator: indicatorKey });
    const targetEl = document.getElementById('iris-inquiry-results');
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Filter inquiry items based on submitted state
  const activeYear = submittedInquiry.year;
  const activeIndicator = submittedInquiry.indicator;

  // Publications for this year strictly linked to Annual IRIS
  const yearPubs = publications.filter(p => p.year === activeYear && p.connectToAnnual === true);
  const scopusPubs = yearPubs.filter(
    p => p.annualCategory === 'scopus' || p.type === 'Scopus Publications'
  );
  const journalPubs = yearPubs.filter(
    p => p.annualCategory === 'jurnal' || p.type === 'Journals (Jurnal)'
  );
  const prosidingPubs = yearPubs.filter(
    p => p.annualCategory === 'prosiding' || p.type === 'Proceedings (Prosiding)'
  );
  const bukuPubs = yearPubs.filter(
    p => p.annualCategory === 'buku' || p.type === 'Books (Buku)'
  );
  const patenPubs = yearPubs.filter(
    p => p.annualCategory === 'paten' || p.annualCategory === 'hki' || p.type === 'Patents & Copyrights (Paten & HKI)'
  );

  // Active publication list for the chosen indicator
  const activeCategoryPubs =
    activeIndicator === 'scopus'
      ? scopusPubs
      : activeIndicator === 'jurnal'
      ? journalPubs
      : activeIndicator === 'prosiding'
      ? prosidingPubs
      : activeIndicator === 'buku'
      ? bukuPubs
      : activeIndicator === 'paten'
      ? patenPubs
      : [];

  // Effective P2M dataset: dynamically derived from database_p2m_mysql.sql
  const effectiveP2MList = liveP2MActivities.length > 0 ? liveP2MActivities : p2mActivities;
  const yearP2Ms = effectiveP2MList.filter(p => p.year === activeYear);
  const ketuaP2Ms = yearP2Ms.filter(p => p.role === 'Ketua');
  const anggotaP2Ms = yearP2Ms.filter(p => p.role === 'Anggota');

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <section className="space-y-6" id="annual-performance-section">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-sky-100 pb-3">
        <div>
          <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
            Annual Performance Tracking & IRIS1103 Integration
          </span>
          <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Annual Personal Performance Index
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Indeks rekam jejak capaian tahunan resmi. Data P2M bersumber dinamis dari <strong className="text-slate-800">database_p2m_mysql.sql</strong> ({effectiveP2MList.length} kegiatan: 47 Penelitian, 13 Pengabdian), dan data publikasi terhubung terpisah khusus artikel Scopus dan jurnal ilmiah.
          </p>
        </div>
        <div className="flex flex-col sm:items-end gap-1">
          <div className="text-xs text-slate-500 font-mono bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100 text-left sm:text-right shrink-0">
            Source: IRIS 1103 UNS • Terhubung Dinamis
          </div>
          <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            Database P2M: {dbP2MStatus?.source === 'mysql_live_connection' ? 'MySQL Server (Live)' : 'database_p2m_mysql.sql (60 Kegiatan)'}
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 1. INTERACTIVE IRIS INQUIRY FORM (REQUESTED BY USER) */}
      {/* ======================================================= */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 via-white to-blue-50/40 border-2 border-sky-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-[#004b87] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-[#004b87]" />
              Official IRIS1103 Performance Index References Explorer
            </span>
            <p className="text-xs text-slate-600 mt-0.5">
              Pilih tahun (2024–2026) dan kategori indikator untuk melihat rincian resmi data Scopus atau P2M secara transparan.
            </p>
          </div>

          {/* Quick Year Chips */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <span className="text-[11px] text-slate-500 font-semibold mr-1">Tahun Cepat:</span>
            {[2026, 2025, 2024].map(y => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setInquiryYear(y);
                  setSubmittedInquiry(prev => ({ ...prev, year: y }));
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                  inquiryYear === y
                    ? 'bg-[#004b87] text-white shadow-2xs'
                    : 'bg-white hover:bg-sky-100 text-slate-700 border border-slate-300'
                }`}
              >
                {y}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Input Form */}
        <form onSubmit={handleRunInquiry} className="flex flex-wrap items-center gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#004b87]" />
            <label className="text-xs font-bold text-slate-700">Pilih Tahun:</label>
            <select
              value={inquiryYear}
              onChange={e => setInquiryYear(Number(e.target.value))}
              className="bg-white px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-xs font-bold text-[#004b87] focus:ring-2 focus:ring-[#004b87] focus:outline-none shadow-2xs"
            >
              <option value={2026}>Tahun 2026</option>
              <option value={2025}>Tahun 2025</option>
              <option value={2024}>Tahun 2024</option>
              <option value={2023}>Tahun 2023</option>
              <option value={2022}>Tahun 2022</option>
              <option value={2021}>Tahun 2021</option>
              <option value={2020}>Tahun 2020</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#004b87]" />
            <label className="text-xs font-bold text-slate-700">Indikator Kinerja:</label>
            <select
              value={inquiryIndicator}
              onChange={e => setInquiryIndicator(e.target.value)}
              className="bg-white px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#004b87] focus:outline-none shadow-2xs"
            >
              <option value="scopus">Scopus Publications</option>
              <option value="p2m">Community Service (P2M) & Research</option>
              <option value="jurnal">Journals (Jurnal)</option>
              <option value="prosiding">Proceedings (Prosiding)</option>
              <option value="buku">Books (Buku)</option>
              <option value="paten">Patents & Copyrights (Paten & HKI)</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm hover:shadow"
          >
            <Search className="w-3.5 h-3.5 text-sky-200" />
            <span>Submit / Tampilkan Daftar</span>
          </button>
        </form>

        {/* RESULTS CONTAINER */}
        <div id="iris-inquiry-results" className="pt-2">
          {/* A. SCOPUS PUBLICATIONS VIEW (EXACT FORMAT FROM USER PROMPT) */}
          {activeIndicator === 'scopus' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Daftar Publikasi Scopus Tahun {activeYear}</span>
                  <span className="font-mono text-[11px] text-[#004b87] font-semibold bg-sky-100/70 px-2 py-0.5 rounded">
                    {scopusPubs.length} publikasi ditemukan
                  </span>
                </div>
                {onNavigateToPublications && (
                  <button
                    type="button"
                    onClick={() => onNavigateToPublications(activeYear)}
                    className="text-xs text-[#004b87] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Buka Semua di Menu Publications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {scopusPubs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-white rounded-xl border border-dashed border-sky-200 space-y-2">
                  <div className="font-semibold text-slate-700">Belum ada publikasi Scopus tercatat untuk tahun {activeYear}.</div>
                  <p className="text-[11px] text-slate-500">Data dikosongkan untuk pengisian manual sesuai kebutuhan Anda melalui Portal Admin.</p>
                  <a
                    href="?portal=admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-[#004b87] text-[#004b87] hover:text-white rounded-lg text-xs font-semibold border border-sky-200 transition-colors shadow-2xs"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Input / Kelola di Portal Admin</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {scopusPubs.map((pub, idx) => {
                    const rawText = `${pub.year} : ${pub.title}
Nama Jurnal : ${pub.venue}
Published : ${pub.venue}
Link : ${pub.url || `https://doi.org/${pub.doi}`}
DoI : ${pub.doi ? (pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`) : '-'}
Author : ${pub.authors
  .map(
    a =>
      `${a.nidn || '0617078501'} - ${a.name} - ( Author ke-${a.order}) (${a.role || (a.isMainAuthor ? 'Corresponding Author' : 'Co-Author')})`
  )
  .join('\n')}`;

                    return (
                      <div
                        key={pub.id}
                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#004b87] transition-all shadow-2xs space-y-2 group"
                      >
                        {/* Title line */}
                        <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                          <span className="text-[#004b87]">{pub.year}</span> : {pub.title}
                        </div>

                        {/* Metadata fields */}
                        <div className="space-y-1 text-slate-700 text-[11px] sm:text-xs">
                          <div>
                            <span className="font-semibold text-slate-500">Nama Jurnal :</span> {pub.venue}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500">Published :</span> {pub.venue}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500">Link :</span>{' '}
                            <a
                              href={pub.url || `https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#004b87] hover:underline break-all"
                            >
                              {pub.url || `https://doi.org/${pub.doi}`}
                            </a>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500">DoI :</span>{' '}
                            {pub.doi ? (
                              <a
                                href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#004b87] hover:underline break-all"
                              >
                                {pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`}
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </div>

                        {/* Authors breakdown */}
                        <div className="pt-1.5 border-t border-slate-100 text-[11px] space-y-0.5">
                          <span className="font-semibold text-slate-500 block mb-1">Author :</span>
                          {pub.authors.map(author => (
                            <div key={author.order} className="text-slate-800 pl-2 border-l-2 border-sky-300">
                              <span className="text-[#004b87] font-semibold">{author.nidn || '0617078501'}</span>
                              {' - '}
                              <strong className="text-slate-900">{author.name}</strong>
                              {' - '}
                              <span className="text-slate-600">( Author ke-{author.order})</span>
                              {' '}
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-sans font-semibold ${
                                  author.role === 'Corresponding Author' || author.isMainAuthor
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                ({author.role || (author.isMainAuthor ? 'Corresponding Author' : 'Co-Author')})
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 font-sans text-xs">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rawText, idx)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#004b87] rounded border border-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>Salin Format IRIS</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            {onOpenDetail && (
                              <button
                                type="button"
                                onClick={() => onOpenDetail(pub)}
                                className="px-2.5 py-1 bg-sky-50 hover:bg-[#004b87] text-[#004b87] hover:text-white rounded border border-sky-200 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Lihat Detail & Abstrak</span>
                              </button>
                            )}
                            <a
                              href={pub.url || `https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 rounded border border-slate-200 text-[11px] font-semibold flex items-center gap-1"
                            >
                              <span>Buka Jurnal</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* B. COMMUNITY SERVICE & RESEARCH (P2M) VIEW - EXCLUSIVELY FROM database_p2m_mysql.sql */}
          {activeIndicator === 'p2m' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#004b87]"></span>
                  <span>Daftar Community Service (P2M) &amp; Research Tahun {activeYear}</span>
                  <span className="font-mono text-[11px] text-[#004b87] font-semibold bg-sky-100/70 px-2 py-0.5 rounded border border-sky-200">
                    {yearP2Ms.length} kegiatan • Sumber: {dbP2MStatus?.source === 'mysql_live_connection' ? 'MySQL Live' : 'database_p2m_mysql.sql'}
                  </span>
                </div>
              </div>

              {yearP2Ms.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-white rounded-xl border border-dashed border-sky-200 space-y-2">
                  <div className="font-semibold text-slate-700">Tidak ada kegiatan P2M maupun penelitian terdaftar untuk tahun {activeYear}.</div>
                  <p className="text-[11px] text-slate-500">Data P2M dikelola terpisah dari publikasi melalui tabel kegiatan_p2m (database_p2m_mysql.sql).</p>
                </div>
              ) : (
                <div className="space-y-6 text-xs">
                  {/* DAFTAR USULAN & AKTIVITAS HIBAH P2M (PENGABDIAN & RISET DARI database_p2m_mysql.sql) */}
                  <div className="space-y-4 font-sans">
                    <div className="text-xs font-bold text-[#004b87] uppercase tracking-wider font-mono border-b border-sky-100/60 pb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#004b87]"></span>
                        <span>Daftar Hibah &amp; Kegiatan P2M Resmi (database_p2m_mysql.sql):</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {yearP2Ms.length} kegiatan
                      </span>
                    </div>

                      {/* Role: Ketua */}
                      {ketuaP2Ms.length > 0 && (
                        <div className="space-y-3">
                          <div className="text-xs font-bold text-[#004b87] uppercase tracking-wider font-mono">
                            Peran Usulan Sebagai Ketua:
                          </div>

                          <div className="space-y-3">
                            {ketuaP2Ms.map((item, idx) => (
                              <div
                                key={item.id}
                                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#004b87] transition-all shadow-2xs space-y-1.5"
                              >
                                <h4 className="font-bold text-slate-900 text-sm leading-snug">
                                  {item.title}
                                </h4>
                                <div className="text-slate-700 text-xs space-y-1 font-mono">
                                  <div>
                                    <span className="font-semibold text-slate-500">Status Usulan :</span>{' '}
                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      {item.status}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-600">
                                    <span className="font-semibold text-slate-500">Jenis :</span> {item.jenis} /{' '}
                                    <span className="font-semibold text-slate-500">Tahun:</span> {item.year} /{' '}
                                    <span className="font-semibold text-slate-500">Group Riset :</span> {item.groupRiset}
                                  </div>
                                  <div className="text-[11px] text-slate-800">
                                    <span className="font-semibold text-slate-500">Skema Penelitian :</span>{' '}
                                    <strong className="text-[#004b87]">{item.skema}</strong>
                                  </div>
                                  {item.dana && (
                                    <div className="text-[10px] text-slate-500">
                                      Pendanaan: {item.dana}
                                    </div>
                                  )}
                                  {item.linkedPublicationTitle && (
                                    <div className="pt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] font-sans border-t border-slate-100 mt-1">
                                      <div className="flex items-center gap-1.5 text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 min-w-0">
                                        <Link2 className="w-3 h-3 text-[#004b87] shrink-0" />
                                        <span className="font-semibold text-slate-600">Publikasi Terhubung:</span>
                                        <span className="italic truncate max-w-xs sm:max-w-md">{item.linkedPublicationTitle}</span>
                                      </div>
                                      {item.linkedPublicationDoi && (
                                        <a
                                          href={item.linkedPublicationDoi.startsWith('http') ? item.linkedPublicationDoi : `https://doi.org/${item.linkedPublicationDoi}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[11px] font-semibold text-[#004b87] hover:underline flex items-center gap-0.5 ml-auto"
                                        >
                                          <span>DOI</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Role: Anggota */}
                      {anggotaP2Ms.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
                            Peran Usulan Sebagai Anggota:
                          </div>

                          <div className="space-y-3">
                            {anggotaP2Ms.map((item) => (
                              <div
                                key={item.id}
                                className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#004b87] transition-all shadow-2xs space-y-1.5"
                              >
                                <h4 className="font-bold text-slate-900 text-sm leading-snug">
                                  {item.title}
                                </h4>
                                <div className="text-slate-700 text-xs space-y-1 font-mono">
                                  <div>
                                    <span className="font-semibold text-slate-500">Status Usulan :</span>{' '}
                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                      {item.status}
                                    </span>
                                  </div>
                                  <div className="text-[11px] text-slate-600">
                                    <span className="font-semibold text-slate-500">Jenis :</span> {item.jenis} /{' '}
                                    <span className="font-semibold text-slate-500">Tahun:</span> {item.year} /{' '}
                                    <span className="font-semibold text-slate-500">Group Riset :</span> {item.groupRiset}
                                  </div>
                                  <div className="text-[11px] text-slate-800">
                                    <span className="font-semibold text-slate-500">Skema Penelitian :</span>{' '}
                                    <strong className="text-[#004b87]">{item.skema}</strong>
                                  </div>
                                  {item.dana && (
                                    <div className="text-[10px] text-slate-500">
                                      Pendanaan: {item.dana}
                                    </div>
                                  )}
                                  {item.linkedPublicationTitle && (
                                    <div className="pt-1.5 flex flex-wrap items-center justify-between gap-1 text-[11px] font-sans border-t border-slate-100 mt-1">
                                      <div className="flex items-center gap-1.5 text-sky-900 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 min-w-0">
                                        <Link2 className="w-3 h-3 text-[#004b87] shrink-0" />
                                        <span className="font-semibold text-slate-600">Publikasi Terhubung:</span>
                                        <span className="italic truncate max-w-xs sm:max-w-md">{item.linkedPublicationTitle}</span>
                                      </div>
                                      {item.linkedPublicationDoi && (
                                        <a
                                          href={item.linkedPublicationDoi.startsWith('http') ? item.linkedPublicationDoi : `https://doi.org/${item.linkedPublicationDoi}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-[11px] font-semibold text-[#004b87] hover:underline flex items-center gap-0.5 ml-auto"
                                        >
                                          <span>DOI</span>
                                          <ExternalLink className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                </div>
              )}
            </div>
          )}

          {/* C. JOURNALS / PROCEEDINGS / BOOKS / PATENTS & COPYRIGHTS VIEW */}
          {activeIndicator !== 'scopus' && activeIndicator !== 'p2m' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#004b87]"></span>
                  <span>Daftar {categories.find(c => c.key === activeIndicator)?.label} Tahun {activeYear}</span>
                  <span className="font-mono text-[11px] text-[#004b87] font-semibold bg-sky-100/70 px-2 py-0.5 rounded">
                    {activeCategoryPubs.length} dokumen ditemukan
                  </span>
                </div>
                {onNavigateToPublications && (
                  <button
                    type="button"
                    onClick={() => onNavigateToPublications(activeYear)}
                    className="text-xs text-[#004b87] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Buka Semua di Menu Publications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {activeCategoryPubs.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs bg-white rounded-xl border border-dashed border-sky-200 space-y-2">
                  <div className="font-semibold text-slate-700">
                    Belum ada data {categories.find(c => c.key === activeIndicator)?.label} tercatat untuk tahun {activeYear}.
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Data dikosongkan untuk pengisian manual sesuai kebutuhan Anda melalui Portal Admin.
                  </p>
                  <a
                    href="?portal=admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-[#004b87] text-[#004b87] hover:text-white rounded-lg text-xs font-semibold border border-sky-200 transition-colors shadow-2xs"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Input / Kelola di Portal Admin</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  {activeCategoryPubs.map((pub, idx) => {
                    const rawText = `${pub.year} : ${pub.title}
Nama Publikasi/Venue : ${pub.venue}
Published : ${pub.venue}
Link : ${pub.url || (pub.doi ? `https://doi.org/${pub.doi}` : '-')}
DoI : ${pub.doi ? (pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`) : '-'}
Author : ${pub.authors
  .map(
    a =>
      `${a.nidn || '0617078501'} - ${a.name} - ( Author ke-${a.order}) (${a.role || (a.isMainAuthor ? 'Corresponding Author' : 'Co-Author')})`
  )
  .join('\n')}`;

                    return (
                      <div
                        key={pub.id}
                        className="p-4 rounded-xl bg-white border border-slate-200 hover:border-[#004b87] transition-all shadow-2xs space-y-2 group"
                      >
                        <div className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                          <span className="text-[#004b87]">{pub.year}</span> : {pub.title}
                        </div>

                        <div className="space-y-1 text-slate-700 text-[11px] sm:text-xs">
                          <div>
                            <span className="font-semibold text-slate-500">Nama Publikasi/Venue :</span> {pub.venue}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500">Link :</span>{' '}
                            {pub.url || pub.doi ? (
                              <a
                                href={pub.url || `https://doi.org/${pub.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#004b87] hover:underline break-all"
                              >
                                {pub.url || `https://doi.org/${pub.doi}`}
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-500">DoI :</span>{' '}
                            {pub.doi ? (
                              <a
                                href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#004b87] hover:underline break-all"
                              >
                                {pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`}
                              </a>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-100 text-[11px] space-y-0.5">
                          <span className="font-semibold text-slate-500 block mb-1">Author :</span>
                          {pub.authors.map(author => (
                            <div key={author.order} className="text-slate-800 pl-2 border-l-2 border-sky-300">
                              <span className="text-[#004b87] font-semibold">{author.nidn || '0617078501'}</span>
                              {' - '}
                              <strong className="text-slate-900">{author.name}</strong>
                              {' - '}
                              <span className="text-slate-600">( Author ke-{author.order})</span>
                              {' '}
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-sans font-semibold ${
                                  author.role === 'Corresponding Author' || author.isMainAuthor
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                ({author.role || (author.isMainAuthor ? 'Corresponding Author' : 'Co-Author')})
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 font-sans text-xs">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(rawText, idx + 1000)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#004b87] rounded border border-slate-200 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                          >
                            {copiedIndex === idx + 1000 ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700">Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-slate-500" />
                                <span>Salin Format IRIS</span>
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            {onOpenDetail && (
                              <button
                                type="button"
                                onClick={() => onOpenDetail(pub)}
                                className="px-2.5 py-1 bg-sky-50 hover:bg-[#004b87] text-[#004b87] hover:text-white rounded border border-sky-200 text-[11px] font-semibold transition-colors flex items-center gap-1"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>Lihat Detail</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================= */}
      {/* 2. TABEL REKAPITULASI INDEKS KINERJA TAHUNAN (2014-2026) */}
      {/* ======================================================= */}
      <div className="space-y-3">
        {/* Filter Toolbar for Table */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <label className="font-semibold text-slate-700">Tabel Tahun:</label>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="bg-white px-2.5 py-1 border border-slate-300 rounded-md font-mono text-xs focus:ring-1 focus:ring-[#004b87]"
              >
                <option value="All">Semua Tahun (2014–2026)</option>
                {performance.map(p => (
                  <option key={p.year} value={String(p.year)}>{p.year}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <label className="font-semibold text-slate-700">Indikator:</label>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-white px-2.5 py-1 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-[#004b87]"
              >
                <option value="All">Semua 7 Indikator</option>
                {categories.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <span className="text-[11px] text-slate-500 italic">
            *Klik angka pada baris tabel untuk meninjau rincian dokumen
          </span>
        </div>

        {/* Table Data */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#004b87] text-white font-semibold">
                <tr>
                  <th className="px-4 py-3 font-mono">Tahun</th>
                  {(selectedCategory === 'All' || selectedCategory === 'p2m') && (
                    <th className="px-3 py-3 text-center">Community Service (P2M)</th>
                  )}
                  {(selectedCategory === 'All' || selectedCategory === 'scopus') && (
                    <th className="px-3 py-3 text-center">Scopus Papers</th>
                  )}
                  {(selectedCategory === 'All' || selectedCategory === 'jurnal') && (
                    <th className="px-3 py-3 text-center">Journals</th>
                  )}
                  {(selectedCategory === 'All' || selectedCategory === 'prosiding') && (
                    <th className="px-3 py-3 text-center">Proceedings</th>
                  )}
                  {(selectedCategory === 'All' || selectedCategory === 'paten') && (
                    <th className="px-3 py-3 text-center">Patents</th>
                  )}
                  {(selectedCategory === 'All' || selectedCategory === 'buku') && (
                    <th className="px-3 py-3 text-center">Books</th>
                  )}
                  {(selectedCategory === 'All' || selectedCategory === 'hki') && (
                    <th className="px-3 py-3 text-center">Copyrights</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filteredYears.map(item => (
                  <tr key={item.year} className="hover:bg-sky-50/50 transition-colors">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-800 bg-slate-50/50">
                      {item.year}
                    </td>

                    {(selectedCategory === 'All' || selectedCategory === 'p2m') && (
                      <td className="px-3 py-2.5 text-center font-mono">
                        {(() => {
                          const liveVal = liveAnnualMetrics[item.year]?.total;
                          const p2mDisplay = liveVal !== undefined ? (liveVal > 0 ? liveVal : null) : item.p2m;
                          return p2mDisplay !== null ? (
                            <button
                              type="button"
                              onClick={() => handleQuickJump(item.year, 'p2m')}
                              className="px-2 py-0.5 rounded font-bold text-[#004b87] hover:bg-sky-100 hover:underline transition-colors"
                              title={`Lihat rincian P2M tahun ${item.year} dari database P2M`}
                            >
                              {p2mDisplay}
                            </button>
                          ) : (
                            <span className="text-slate-300 italic">—</span>
                          );
                        })()}
                      </td>
                    )}

                    {(selectedCategory === 'All' || selectedCategory === 'scopus') && (
                      <td className="px-3 py-2.5 text-center font-mono">
                        {item.scopus !== null ? (
                          <button
                            type="button"
                            onClick={() => handleQuickJump(item.year, 'scopus')}
                            className="px-2 py-0.5 rounded font-bold text-[#004b87] hover:bg-sky-100 hover:underline transition-colors"
                            title={`Lihat rincian Scopus tahun ${item.year}`}
                          >
                            {item.scopus}
                          </button>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </td>
                    )}

                    {(selectedCategory === 'All' || selectedCategory === 'jurnal') && (
                      <td className="px-3 py-2.5 text-center font-mono">
                        {item.jurnal !== null ? (
                          <button
                            type="button"
                            onClick={() => handleQuickJump(item.year, 'jurnal')}
                            className="px-2 py-0.5 rounded font-bold text-slate-700 hover:text-[#004b87] hover:bg-sky-50"
                          >
                            {item.jurnal}
                          </button>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </td>
                    )}

                    {(selectedCategory === 'All' || selectedCategory === 'prosiding') && (
                      <td className="px-3 py-2.5 text-center font-mono">
                        {item.prosiding !== null ? (
                          <button
                            type="button"
                            onClick={() => handleQuickJump(item.year, 'prosiding')}
                            className="px-2 py-0.5 rounded font-bold text-slate-700 hover:text-[#004b87] hover:bg-sky-50"
                          >
                            {item.prosiding}
                          </button>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </td>
                    )}

                    {(selectedCategory === 'All' || selectedCategory === 'paten') && (
                      <td className="px-3 py-2.5 text-center font-mono text-slate-700">
                        {item.paten !== null ? item.paten : <span className="text-slate-300 italic">—</span>}
                      </td>
                    )}

                    {(selectedCategory === 'All' || selectedCategory === 'buku') && (
                      <td className="px-3 py-2.5 text-center font-mono text-slate-700">
                        {item.buku !== null ? item.buku : <span className="text-slate-300 italic">—</span>}
                      </td>
                    )}

                    {(selectedCategory === 'All' || selectedCategory === 'hki') && (
                      <td className="px-3 py-2.5 text-center font-mono text-slate-700">
                        {item.hki !== null ? item.hki : <span className="text-slate-300 italic">—</span>}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Direct Source Links Reference Grid */}
      <div className="pt-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
          Official IRIS1103 Performance Index References:
        </span>
        <div className="flex flex-wrap gap-2 text-xs">
          {categories.map(c => (
            <a
              key={c.key}
              href={c.link}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-[#004b87] border border-slate-200 text-[11px] flex items-center gap-1 transition-colors"
            >
              <span>{c.label}</span>
              <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
