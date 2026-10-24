import React from 'react';
import { BookOpen, ExternalLink, Award, CheckCircle2, ShieldCheck } from 'lucide-react';
import { EditorialRole } from '../types';

interface EditorialPageProps {
  roles: EditorialRole[];
}

export const EditorialPage: React.FC<EditorialPageProps> = ({ roles }) => {
  return (
    <div className="space-y-10 pb-20 max-w-4xl">
      {/* Header */}
      <div className="border-b border-stone-200 pb-8">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest font-mono">
          Academic Service & Peer Review
        </span>
        <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 mt-1">
          Editorial Roles & Peer Review
        </h1>
        <p className="text-sm text-stone-600 mt-2 font-serif italic">
          Dedication to peer review, editorial boards, and academic stewardship for leading international and national journals.
        </p>
      </div>

      {roles.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-stone-300 rounded-xl text-stone-500 text-sm">
          No editorial roles currently listed.
        </div>
      ) : (
        <div className="space-y-4">
          {roles.map(role => (
            <div
              key={role.id}
              className="p-6 border border-stone-200 rounded-xl bg-white hover:border-stone-400 transition-colors space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-stone-950">
                    {role.role}
                  </span>
                  {role.indexing && (
                    <span className="text-[11px] bg-stone-100 text-stone-800 font-mono px-2 py-0.5 rounded border border-stone-200">
                      {role.indexing}
                    </span>
                  )}
                </div>
                <span className="text-xs text-stone-500 font-mono">
                  {role.period}
                </span>
              </div>

              <div>
                <h3 className="font-serif-academic text-lg font-semibold text-stone-900 italic">
                  {role.venue}
                </h3>
                {role.publisher && (
                  <div className="text-xs text-stone-500 mt-0.5">
                    Publisher: {role.publisher}
                  </div>
                )}
              </div>

              {role.description && (
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans pt-1">
                  {role.description}
                </p>
              )}

              {role.url && (
                <div className="pt-2">
                  <a
                    href={role.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-950 font-medium underline underline-offset-2"
                  >
                    <span>Journal / Editorial Board Portal</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
