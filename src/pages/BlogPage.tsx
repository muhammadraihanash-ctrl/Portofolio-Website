import React, { useState } from 'react';
import { BookOpen, Calendar, Clock, ChevronRight, X, ArrowLeft } from 'lucide-react';
import { BlogPost } from '../types';

interface BlogPageProps {
  posts: BlogPost[];
}

export const BlogPage: React.FC<BlogPageProps> = ({ posts }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div className="space-y-10 pb-20 max-w-4xl">
      {/* Header */}
      <div className="border-b border-stone-200 pb-8">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-widest font-mono">
          Reflections & Essays
        </span>
        <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-stone-950 mt-1">
          Academic Blog & Notes
        </h1>
        <p className="text-sm text-stone-600 mt-2 font-serif italic">
          Notes, perspectives, and academic essays on operations research, mathematical modelling, and research methodology.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-stone-300 rounded-xl text-stone-500 text-sm">
          No published essays currently available.
        </div>
      ) : selectedPost ? (
        /* Full Article Reader View */
        <article className="space-y-6 animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedPost(null)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </button>

          <div className="border-b border-stone-200 pb-6 space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{selectedPost.publishedAt}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{selectedPost.readTime}</span>
              </span>
              <span>•</span>
              <span className="font-sans font-semibold text-stone-800">
                By: {selectedPost.author}
              </span>
            </div>

            <h1 className="font-serif-academic text-2xl sm:text-4xl font-bold text-stone-950 leading-tight">
              {selectedPost.title}
            </h1>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedPost.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs bg-stone-100 text-stone-700 px-2.5 py-0.5 rounded font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Formatted Content */}
          <div className="prose prose-stone max-w-none text-sm sm:text-base leading-relaxed text-stone-800 font-sans space-y-4 whitespace-pre-line text-justify">
            {selectedPost.content}
          </div>

          <div className="pt-8 border-t border-sky-100 text-xs text-slate-500">
            Written by <strong className="text-slate-800">{selectedPost.author}</strong> — Department of Mathematics, FMIPA, Universitas Sebelas Maret.
          </div>
        </article>
      ) : (
        /* Article List */
        <div className="space-y-6">
          {posts.map(post => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="p-6 border border-stone-200 rounded-xl bg-white hover:border-stone-400 transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center gap-3 text-xs text-stone-500 font-mono">
                <span>{post.publishedAt}</span>
                <span>•</span>
                <span>{post.readTime}</span>
              </div>

              <h2 className="font-serif-academic text-xl sm:text-2xl font-bold text-stone-950 group-hover:text-stone-700 transition-colors leading-snug">
                {post.title}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 line-clamp-3 leading-relaxed font-sans">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.slice(0, 3).map((t, idx) => (
                    <span key={idx} className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[11px] font-mono">
                      #{t}
                    </span>
                  ))}
                </div>

                <span className="font-semibold text-stone-900 group-hover:underline flex items-center gap-1">
                  <span>Read Full Article</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
