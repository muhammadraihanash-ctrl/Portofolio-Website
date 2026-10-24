import React, { useState } from 'react';
import { X, Copy, Check, Quote } from 'lucide-react';
import { Publication } from '../types';
import {
  generateAPACitation,
  generateIEEECitation,
  generateBibTeX
} from '../utils/citationHelper';

interface CitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  publication?: Publication | null;
}

export const CitationModal: React.FC<CitationModalProps> = ({
  isOpen,
  onClose,
  publication
}) => {
  const [style, setStyle] = useState<'APA' | 'IEEE' | 'BibTeX'>('APA');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !publication) return null;

  const getCitationText = () => {
    switch (style) {
      case 'APA':
        return generateAPACitation(publication);
      case 'IEEE':
        return generateIEEECitation(publication);
      case 'BibTeX':
        return generateBibTeX(publication);
    }
  };

  const citationText = getCitationText();

  const handleCopy = () => {
    navigator.clipboard.writeText(citationText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Quote className="w-4 h-4 text-stone-700" />
            <span>Cite This Work</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style Selector */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
            {(['APA', 'IEEE', 'BibTeX'] as const).map(s => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  style === s
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Citation Output Box */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl font-mono text-xs sm:text-sm text-stone-800 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
            {citationText}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-stone-500">
              Standardized bibliographic format for scholarly papers and research theses.
            </span>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Citation'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
