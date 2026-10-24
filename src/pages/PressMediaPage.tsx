import React from 'react';
import { Newspaper, ExternalLink, Calendar, Video, Mic } from 'lucide-react';
import { PressMediaItem } from '../types';

interface PressMediaPageProps {
  mediaItems: PressMediaItem[];
}

export const PressMediaPage: React.FC<PressMediaPageProps> = ({ mediaItems }) => {
  return (
    <div className="space-y-10 pb-20 max-w-4xl">
      {/* Header */}
      <div className="border-b border-stone-200 pb-8">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest font-mono">
          Public Engagement & News
        </span>
        <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 mt-1">
          Press, Media & Documentation
        </h1>
        <p className="text-sm text-stone-600 mt-2 font-serif italic">
          Media coverage, academic interviews, university news, and public science communication.
        </p>
      </div>

      {mediaItems.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-stone-300 rounded-xl text-stone-500 text-sm">
          No press or media items currently listed.
        </div>
      ) : (
        <div className="space-y-6">
          {mediaItems.map(item => (
            <article
              key={item.id}
              className="p-6 border border-stone-200 rounded-xl bg-white hover:border-stone-400 transition-colors space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5 text-xs text-stone-500">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 bg-stone-100 px-2.5 py-0.5 rounded text-[11px]">
                    {item.mediaOutlet}
                  </span>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-600 font-medium">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono text-[11px]">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  <span>{item.publishDate}</span>
                </div>
              </div>

              <h2 className="font-serif-academic text-xl font-bold text-stone-950 leading-snug">
                {item.title}
              </h2>

              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans text-justify">
                {item.summary}
              </p>

              {item.url && (
                <div className="pt-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 hover:text-stone-950 underline underline-offset-3"
                  >
                    <span>Read Original Article</span>
                    <ExternalLink className="w-3 h-3 text-stone-400" />
                  </a>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
