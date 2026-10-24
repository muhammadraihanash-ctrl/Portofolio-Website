import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  GraduationCap,
  Sparkles,
  BookOpen,
  ArrowUpDown,
  X,
  FileText
} from 'lucide-react';
import { Publication } from '../types';
import { PublicationCard } from '../components/PublicationCard';

interface PublicationsPageProps {
  publications: Publication[];
  onOpenInfographic: (pub: Publication) => void;
  onOpenCitation: (pub: Publication) => void;
  onOpenDetail: (pub: Publication) => void;
  initialSearch?: string;
}

export const PublicationsPage: React.FC<PublicationsPageProps> = ({
  publications,
  onOpenInfographic,
  onOpenCitation,
  onOpenDetail,
  initialSearch = ''
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [studentOnly, setStudentOnly] = useState<boolean>(false);
  const [infographicOnly, setInfographicOnly] = useState<boolean>(false);
  const [kurdhiOnly, setKurdhiOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(15);

  // Extract unique categories & years
  const categories = useMemo(() => {
    const set = new Set<string>();
    publications.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [publications]);

  const years = useMemo(() => {
    const set = new Set<number>();
    publications.forEach(p => set.add(p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [publications]);

  // Filtered list
  const filtered = useMemo(() => {
    return publications.filter(p => {
      // Exclude archived publications from public view
      if (p.isArchived) return false;

      // Author filter (Nughthoh Arfawi Kurdhi)
      if (kurdhiOnly) {
        const isKurdhi = p.authors.some(a => {
          const n = (a.name || '').toLowerCase();
          return n.includes('kurdhi') || n.includes('nughthoh') || n.includes('arfawi');
        });
        if (!isKurdhi) return false;
      }

      // Search
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesVenue = p.venue.toLowerCase().includes(q);
        const matchesAbstract = p.abstract?.toLowerCase().includes(q);
        const matchesAuthors = p.authors.some(a => a.name.toLowerCase().includes(q));
        const matchesKeywords = p.keywords?.some(k => k.toLowerCase().includes(q));
        const matchesDoi = p.doi?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesVenue && !matchesAbstract && !matchesAuthors && !matchesKeywords && !matchesDoi) {
          return false;
        }
      }

      // Category
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }

      // Year
      if (selectedYear !== 'All' && p.year !== Number(selectedYear)) {
        return false;
      }

      // Type
      if (selectedType !== 'All' && p.type !== selectedType) {
        return false;
      }

      // Student only
      if (studentOnly && !p.authors.some(a => a.isStudent)) {
        return false;
      }

      // Infographic only
      if (infographicOnly && !p.hasInfographic) {
        return false;
      }

      return true;
    });
  }, [publications, search, selectedCategory, selectedYear, selectedType, studentOnly, infographicOnly, kurdhiOnly]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedYear, selectedType, studentOnly, infographicOnly, kurdhiOnly, itemsPerPage]);

  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filtered.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    if (itemsPerPage === -1) return filtered;
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedYear('All');
    setSelectedType('All');
    setStudentOnly(false);
    setInfographicOnly(false);
    setKurdhiOnly(false);
  };

  const hasActiveFilters =
    search ||
    selectedCategory !== 'All' ||
    selectedYear !== 'All' ||
    selectedType !== 'All' ||
    studentOnly ||
    infographicOnly ||
    kurdhiOnly;

  return (
    <div className="space-y-8 pb-20 max-w-4xl">
      {/* Header */}
      <div className="border-b border-sky-100 pb-8">
        <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
          Research Archive
        </span>
        <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
          Publications & Scientific Works
        </h1>
        <p className="text-sm text-slate-600 mt-2 font-serif italic">
          Comprehensive collection of international peer-reviewed journal articles (including ABS 4*), conference proceedings, and student-supervised research.
        </p>
      </div>

      {/* Filter and Search Controls in UNS Blue style */}
      <div className="space-y-4 p-5 bg-sky-50/40 border border-sky-100 rounded-2xl">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-sky-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, author, journal venue, keywords, or DOI..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-sky-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#004b87] focus:outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Author & Scope Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => {
              setKurdhiOnly(false);
              setStudentOnly(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              !kurdhiOnly && !studentOnly
                ? 'bg-[#004b87] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-sky-200 hover:bg-sky-50'
            }`}
          >
            Semua Publikasi ({publications.length})
          </button>
          <button
            onClick={() => {
              setKurdhiOnly(true);
              setStudentOnly(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              kurdhiOnly && !studentOnly
                ? 'bg-[#004b87] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-sky-200 hover:bg-sky-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Karya Nughthoh Arfawi Kurdhi Saja</span>
          </button>
          <button
            onClick={() => {
              setKurdhiOnly(false);
              setStudentOnly(true);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              studentOnly
                ? 'bg-[#004b87] text-white shadow-2xs'
                : 'bg-white text-slate-700 border border-sky-200 hover:bg-sky-50'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Karya Bimbingan Mahasiswa (Skripsi/Tesis)</span>
          </button>
        </div>

        {/* Dropdown filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Research Category:
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded-lg text-xs focus:ring-1 focus:ring-[#004b87]"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Publication Year:
            </label>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded-lg text-xs focus:ring-1 focus:ring-[#004b87]"
            >
              <option value="All">All Years</option>
              {years.map(y => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Document Type:
            </label>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-sky-200 rounded-lg text-xs focus:ring-1 focus:ring-[#004b87]"
            >
              <option value="All">All Types</option>
              <option value="Scopus Publications">Scopus Publications</option>
              <option value="Journal Article">Journal Article (Scopus / Peer-Reviewed)</option>
              <option value="Journals (Jurnal)">Journals (Jurnal)</option>
              <option value="Proceedings (Prosiding)">Proceedings (Prosiding)</option>
              <option value="Conference Paper">Conference Paper</option>
              <option value="Books (Buku)">Books (Buku)</option>
              <option value="Book Chapter">Book Chapter</option>
              <option value="Patents & Copyrights (Paten & HKI)">Patents &amp; Copyrights (Paten &amp; HKI)</option>
              <option value="Student Thesis">Student Thesis</option>
              <option value="Preprint">Preprint</option>
            </select>
          </div>
        </div>

        {/* Checkbox Toggles & Clear Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-sky-100 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={kurdhiOnly}
                onChange={e => setKurdhiOnly(e.target.checked)}
                className="rounded border-sky-300 text-[#004b87] focus:ring-[#004b87]"
              />
              <span className="flex items-center gap-1 font-semibold text-[#004b87]">
                <BookOpen className="w-3.5 h-3.5 text-[#004b87]" />
                <span>Karya Nughthoh Arfawi Kurdhi Saja</span>
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={studentOnly}
                onChange={e => setStudentOnly(e.target.checked)}
                className="rounded border-sky-300 text-[#004b87] focus:ring-[#004b87]"
              />
              <span className="flex items-center gap-1 font-semibold text-[#004b87]">
                <GraduationCap className="w-3.5 h-3.5 text-[#004b87]" />
                <span>Student-Supervised Works Only</span>
              </span>
            </label>

            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
              <input
                type="checkbox"
                checked={infographicOnly}
                onChange={e => setInfographicOnly(e.target.checked)}
                className="rounded border-sky-300 text-[#004b87] focus:ring-[#004b87]"
              />
              <span className="flex items-center gap-1 font-semibold text-[#004b87]">
                <Sparkles className="w-3.5 h-3.5 text-[#004b87]" />
                <span>With AI Research Infographics</span>
              </span>
            </label>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-slate-500 hover:text-[#004b87] underline text-xs transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count Bar & Pagination Options */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono px-1">
        <div className="flex items-center gap-2">
          <span>Menampilkan {filtered.length === 0 ? 0 : (currentPage - 1) * (itemsPerPage === -1 ? filtered.length : itemsPerPage) + 1}–{itemsPerPage === -1 ? filtered.length : Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} publikasi (Total Bank Data: {publications.length})</span>
          {hasActiveFilters && (
            <span className="text-[#004b87] font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
              Filtered
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span>Tampilkan:</span>
          <select
            value={itemsPerPage}
            onChange={e => setItemsPerPage(Number(e.target.value))}
            className="px-2 py-1 bg-white border border-sky-200 rounded font-mono text-xs text-slate-700"
          >
            <option value={15}>15 per halaman</option>
            <option value={30}>30 per halaman</option>
            <option value={50}>50 per halaman</option>
            <option value={100}>100 per halaman</option>
            <option value={-1}>Semua ({publications.length})</option>
          </select>
        </div>
      </div>

      {/* Publications Listing */}
      {publications.length === 0 ? (
        <div className="p-16 text-center border-2 border-dashed border-sky-200 rounded-2xl bg-sky-50/30 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-sky-100 text-[#004b87] flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif-academic text-lg font-bold text-slate-800">
            Data Publikasi Belum Tersedia
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Halaman ini khusus memuat artikel jurnal ilmiah dan publikasi resmi Scopus. Sumber data publikasi dipisahkan secara independen dari database kegiatan P2M (Pengabdian &amp; Penelitian), dan seluruh data dummy telah dibersihkan.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-sky-200 rounded-2xl space-y-3">
          <BookOpen className="w-8 h-8 text-sky-400 mx-auto" />
          <h3 className="font-serif-academic text-lg font-bold text-slate-800">
            No matching publications found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting search keywords or clearing active filters to browse the complete archive.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold"
          >
            Show All Publications
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="divide-y divide-sky-100">
            {paginatedList.map(pub => (
              <PublicationCard
                key={pub.id}
                publication={pub}
                onOpenInfographic={onOpenInfographic}
                onOpenCitation={onOpenCitation}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>

          {/* Pagination Navigation Bar */}
          {totalPages > 1 && (
            <div className="pt-4 border-t border-sky-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-mono">
                Halaman {currentPage} dari {totalPages}
              </span>

              <div className="flex items-center gap-1.5 font-mono">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-sky-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  &larr; Sebelumnya
                </button>

                {/* Page number buttons */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = currentPage;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#004b87] text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-sky-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-sky-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Berikutnya &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
