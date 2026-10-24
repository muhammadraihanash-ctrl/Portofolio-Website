import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  FileText,
  Sparkles,
  Quote,
  Share2,
  Check,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen,
  Award
} from 'lucide-react';
import { Publication } from '../types';

interface PublicationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  publication?: Publication | null;
  onOpenInfographic: (pub: Publication) => void;
  onOpenCitation: (pub: Publication) => void;
}

export const PublicationDetailModal: React.FC<PublicationDetailModalProps> = ({
  isOpen,
  onClose,
  publication,
  onOpenInfographic,
  onOpenCitation
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !publication) return null;

  const handleShare = () => {
    const url = `${window.location.origin}?tab=publications&id=${publication.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50 shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-mono">
            <span>Research Document Archive</span>
            <span>•</span>
            <span className="font-semibold text-stone-800">{publication.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              title="Copy Permanent Reference Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-800">
          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-stone-900 bg-stone-100 px-2.5 py-1 rounded font-mono">
              Year: {publication.year}
            </span>
            <span className="bg-sky-50 text-[#004b87] border border-sky-200 px-2.5 py-1 rounded font-semibold font-mono">
              {publication.type}
            </span>
            <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded">
              {publication.category}
            </span>
            {publication.connectToAnnual && (
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded font-semibold font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>IRIS 1103 ({publication.annualCategory?.toUpperCase() || 'TERHUBUNG'})</span>
              </span>
            )}
            {publication.authors.some(a => a.isStudent) && (
              <span className="bg-sky-50 text-[#004b87] border border-sky-200 px-2.5 py-1 rounded font-medium flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#004b87]" />
                <span>Supervised Student Co-Authored Work</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold leading-tight text-stone-950">
            {publication.title}
          </h2>

          {/* Detailed Authors Section */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Authors & Research Affiliations
            </div>
            <div className="space-y-1.5 text-xs sm:text-sm">
              {publication.authors.map((author, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-stone-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-mono text-[11px] flex items-center justify-center font-bold">
                      {author.order || idx + 1}
                    </span>
                    <span className={`font-medium ${author.isMainAuthor ? 'text-stone-950 font-bold' : 'text-stone-800'}`}>
                      {author.name}
                    </span>
                    {author.isStudent && (
                      <span className="text-[10px] bg-sky-100 text-[#004b87] px-1.5 py-0.2 rounded font-semibold">
                        Supervised Advisee
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-500 hidden sm:inline">
                    {author.affiliation || 'Universitas Sebelas Maret'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Venue & Publication Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-3.5 rounded-lg border border-stone-200 bg-white space-y-1">
              <span className="text-stone-500 text-xs block font-medium">Journal / Proceedings:</span>
              <span className="font-semibold text-stone-900 italic">{publication.venue}</span>
            </div>
            <div className="p-3.5 rounded-lg border border-stone-200 bg-white space-y-1">
              <span className="text-stone-500 text-xs block font-medium">Volume & Pages:</span>
              <span className="text-stone-800">
                {publication.volume ? `Vol. ${publication.volume}` : 'Vol. -'}
                {publication.issue ? `, Issue ${publication.issue}` : ''}
                {publication.pages ? `, pp. ${publication.pages}` : ''}
              </span>
            </div>
          </div>

          {/* Abstract */}
          <div className="space-y-2">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-stone-900">
              Abstract
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans text-justify bg-stone-50/60 p-4 rounded-xl border border-stone-200">
              {publication.abstract || 'Abstract is currently not available.'}
            </p>
          </div>

          {/* Keywords */}
          {publication.keywords && publication.keywords.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                Keywords
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {publication.keywords.map((kw, i) => (
                  <span key={i} className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded border border-stone-200 font-mono">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center gap-3">
            {publication.hasInfographic && (
              <button
                onClick={() => {
                  onClose();
                  onOpenInfographic(publication);
                }}
                className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-300 rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#004b87] animate-pulse" />
                <span>View Research Infographic</span>
              </button>
            )}

            {publication.doi && (
              <a
                href={publication.doi.startsWith('http') ? publication.doi : `https://doi.org/${publication.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-stone-300 hover:border-stone-400 text-stone-800 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5"
              >
                <span>Open DOI / Publisher</span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
              </a>
            )}

            {(publication.pdfUrl || publication.pdfFileId) && (
              <a
                href={publication.pdfUrl || `/api/storage/preview/${publication.pdfFileId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Download / Preview PDF</span>
              </a>
            )}

            <button
              onClick={() => onOpenCitation(publication)}
              className="px-4 py-2 border border-stone-300 hover:border-[#004b87] text-stone-800 hover:text-[#004b87] rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ml-auto"
            >
              <Quote className="w-4 h-4 text-stone-500" />
              <span>Cite This Article</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
