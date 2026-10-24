import React, { useState } from 'react';
import {
  ExternalLink,
  FileText,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Quote,
  Eye,
  Download,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { Publication } from '../types';

interface PublicationCardProps {
  publication: Publication;
  onOpenInfographic: (pub: Publication) => void;
  onOpenCitation: (pub: Publication) => void;
  onOpenDetail: (pub: Publication) => void;
}

export const PublicationCard: React.FC<PublicationCardProps> = ({
  publication,
  onOpenInfographic,
  onOpenCitation,
  onOpenDetail
}) => {
  const [showAbstract, setShowAbstract] = useState(false);

  // Format authors with highlighting
  const renderAuthors = () => {
    const sorted = [...publication.authors].sort((a, b) => a.order - b.order);
    return sorted.map((author, index) => {
      const isDosen =
        author.isMainAuthor ||
        author.name.toLowerCase().includes('kurdhi') ||
        author.name.toLowerCase().includes('nughthoh');
      const isStudent = author.isStudent;

      return (
        <span key={index} className="inline">
          <span
            className={
              isDosen
                ? 'font-bold text-[#004b87] underline decoration-sky-300 underline-offset-2'
                : 'text-slate-700'
            }
          >
            {author.name}
          </span>
          {isStudent && (
            <span
              className="ml-1 text-[10px] text-sky-800 bg-sky-50 px-1 py-0.2 rounded border border-sky-200 font-medium inline-flex items-center gap-0.5"
              title="Supervised Student of Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D."
            >
              <GraduationCap className="w-2.5 h-2.5 text-[#004b87]" />
              <span>Advisee</span>
            </span>
          )}
          {index < sorted.length - 1 && <span className="text-slate-400 mr-1.5">,</span>}
        </span>
      );
    });
  };

  const hasStudentAuthor = publication.authors.some(a => a.isStudent);

  return (
    <article className="py-6 border-b border-sky-100 text-slate-800 transition-all hover:bg-sky-50/40 px-2 sm:px-3 rounded-xl">
      <div className="space-y-2.5">
        {/* Meta badges: Year, Type, Category */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-[#004b87] bg-sky-50 border border-sky-200 px-2.5 py-0.5 rounded text-[11px] font-mono">
            {publication.year}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
            publication.type === 'Scopus Publications' || publication.type === 'Journal Article'
              ? 'bg-sky-50 text-[#004b87] border-sky-200'
              : publication.type === 'Journals (Jurnal)'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : publication.type === 'Proceedings (Prosiding)' || publication.type === 'Conference Paper'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : publication.type === 'Books (Buku)' || publication.type === 'Book Chapter'
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : publication.type === 'Patents & Copyrights (Paten & HKI)'
              ? 'bg-purple-50 text-purple-800 border-purple-200'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {publication.type}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-700 text-[11px]">
            {publication.category}
          </span>
          {publication.connectToAnnual === true && (
            <span
              className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 font-mono"
              title="Terhubung ke Official IRIS1103 Performance Index UNS"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"></span>
              <span>IRIS 1103 ({publication.annualCategory?.toUpperCase() || 'SCOPUS'})</span>
            </span>
          )}
          {(publication.annualCategory === 'scopus' || publication.type === 'Scopus Publications' || publication.scopusIndexed) && (
            <span
              className="text-[10px] bg-sky-50 text-sky-900 border border-sky-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 font-mono"
              title="Terindeks Scopus Resmi (Afiliasi: Universitas Sebelas Maret)"
            >
              <ShieldCheck className="w-3 h-3 text-[#004b87]" />
              <span>Scopus Indexed</span>
            </span>
          )}
          {hasStudentAuthor && (
            <span className="text-[10px] bg-sky-50 text-[#004b87] border border-sky-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
              <GraduationCap className="w-3 h-3 text-[#004b87]" />
              <span>Student Co-Author</span>
            </span>
          )}
          {publication.isFeatured && (
            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-serif-academic text-lg sm:text-xl font-bold leading-snug text-slate-900 hover:text-[#004b87] transition-colors">
          <button
            onClick={() => onOpenDetail(publication)}
            className="text-left hover:underline underline-offset-3"
          >
            "{publication.title}"
          </button>
        </h3>

        {/* Authors */}
        <div className="text-xs sm:text-sm leading-relaxed text-slate-700">
          {renderAuthors()}
        </div>

        {/* Venue, Volume, Issue, Pages */}
        <div className="text-xs sm:text-[13px] text-slate-600 italic">
          <span className="text-[#004b87] font-medium">{publication.venue}</span>
          {publication.volume && <span>, Vol. {publication.volume}</span>}
          {publication.issue && <span>({publication.issue})</span>}
          {publication.pages && <span>, pp. {publication.pages}</span>}
          <span className="not-italic text-slate-400"> ({publication.year})</span>
        </div>

        {/* Quick Action Links: Abstract, DOI, PDF, Infographic, Cite, Detail */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          {/* Abstract Toggle */}
          <button
            onClick={() => setShowAbstract(!showAbstract)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-[#004b87] bg-slate-100 hover:bg-sky-50 rounded text-xs transition-colors font-medium border border-slate-200"
          >
            <span>Abstract</span>
            {showAbstract ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Infographic Button */}
          {publication.hasInfographic && (
            <button
              onClick={() => onOpenInfographic(publication)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-300 rounded text-xs font-semibold transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#004b87] animate-pulse" />
              <span>View Infographic</span>
            </button>
          )}

          {/* DOI External Link */}
          {publication.doi && (
            <a
              href={publication.doi.startsWith('http') ? publication.doi : `https://doi.org/${publication.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-[#004b87] border border-slate-200 hover:border-sky-300 rounded text-xs transition-colors"
            >
              <span>DOI</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}

          {/* PDF Link */}
          {(publication.pdfUrl || publication.pdfFileId) && (
            <a
              href={publication.pdfUrl || `/api/storage/preview/${publication.pdfFileId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-[#004b87] border border-slate-200 hover:border-sky-300 rounded text-xs transition-colors"
            >
              <FileText className="w-3 h-3 text-slate-400" />
              <span>Full Text PDF</span>
            </a>
          )}

          {/* Citation Button */}
          <button
            onClick={() => onOpenCitation(publication)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-[#004b87] border border-slate-200 hover:border-sky-300 rounded text-xs transition-colors"
          >
            <Quote className="w-3 h-3 text-slate-400" />
            <span>Cite</span>
          </button>

          {/* Detail Link */}
          <button
            onClick={() => onOpenDetail(publication)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-600 hover:text-[#004b87] border border-slate-200 hover:border-sky-300 rounded text-xs transition-colors"
          >
            <Eye className="w-3 h-3 text-slate-400" />
            <span>Details</span>
          </button>
        </div>

        {/* Collapsible Abstract */}
        {showAbstract && (
          <div className="mt-3 p-4 bg-sky-50/50 border border-sky-100 rounded-xl text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 animate-in fade-in duration-200">
            <div className="font-semibold text-[#004b87] text-xs uppercase tracking-wider">
              Research Abstract:
            </div>
            <p className="text-justify font-sans">
              {publication.abstract || 'Abstract is not currently available for this publication.'}
            </p>
            {publication.keywords && publication.keywords.length > 0 && (
              <div className="pt-2 text-xs text-slate-600 flex flex-wrap items-center gap-1">
                <span className="font-semibold text-slate-800">Keywords:</span>
                {publication.keywords.map((kw, i) => (
                  <span key={i} className="text-slate-600 font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {kw}{i < publication.keywords.length - 1 ? ',' : ''}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
