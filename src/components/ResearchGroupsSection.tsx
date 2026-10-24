import React from 'react';
import { Users, CheckCircle2, History, ShieldCheck, ArrowRight } from 'lucide-react';
import { ResearchGroupEntry } from '../types';

interface ResearchGroupsSectionProps {
  groups: ResearchGroupEntry[];
}

export const ResearchGroupsSection: React.FC<ResearchGroupsSectionProps> = ({ groups }) => {
  const safeGroups = groups || [];
  const activeGroups = safeGroups.filter(g => g.isActive);
  const historyGroups = safeGroups.filter(g => !g.isActive);

  return (
    <section className="space-y-6">
      <div className="border-b border-sky-100 pb-3">
        <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
          Academic Group Affiliations
        </span>
        <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
          Research Groups & Labs
        </h2>
      </div>

      {/* 1. Active Research Group */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#004b87]">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Current Active Research Group</span>
        </div>

        {activeGroups.map(group => (
          <div
            key={group.id}
            className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-[#004b87]/30 shadow-xs hover:border-[#004b87] transition-all space-y-3 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100/40 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-[#004b87] text-white">
                Code: {group.code}
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Active ({group.period})
              </span>
            </div>

            <h3 className="font-serif-academic text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {group.name}
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
              Primary university research group dedicated to applied mathematical modelling, computational data science,
              and Scientific Machine Learning & Explainable AI (XAI) at Sebelas Maret University.
            </p>
          </div>
        ))}
      </div>

      {/* 2. Research Group History */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <History className="w-4 h-4 text-slate-500" />
          <span>Research Group History & Track Record</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {historyGroups.map(group => (
            <div
              key={group.id}
              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/90 hover:bg-white hover:border-sky-200 transition-all space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {group.code}
                </span>
                <span className="font-mono text-[11px] text-slate-500 font-medium">
                  Period: {group.period}
                </span>
              </div>

              <h4 className="font-semibold text-sm text-slate-900 leading-snug">
                {group.name}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
