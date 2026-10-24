import React from 'react';
import {
  FileText,
  Users,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { AcademicAchievements } from '../types';

interface AcademicMetricsSectionProps {
  achievements: AcademicAchievements;
}

export const AcademicMetricsSection: React.FC<AcademicMetricsSectionProps> = ({ achievements }) => {
  const safeAchievements = achievements || {
    penelitian: 0,
    p2m: 0,
    scopus: 0,
    nonScopus: 0,
    prosiding: 0,
    buku: 0,
    paten: 0,
    hki: 0
  };
  const metricItems = [
    {
      label: 'Research Projects',
      value: safeAchievements.penelitian,
      icon: Layers,
      desc: 'Funded & competitive research'
    },
    {
      label: 'Community Service (P2M)',
      value: safeAchievements.p2m,
      icon: Users,
      desc: 'Outreach & applied service'
    },
    {
      label: 'Scopus Publications',
      value: safeAchievements.scopus,
      icon: Award,
      desc: 'Global Scopus-indexed papers'
    },
    {
      label: 'Peer-Reviewed Journals',
      value: safeAchievements.nonScopus,
      icon: FileText,
      desc: 'Accredited national journals'
    },
    {
      label: 'Conference Proceedings',
      value: safeAchievements.prosiding,
      icon: Bookmark,
      desc: 'International proceedings'
    },
    {
      label: 'Academic Books',
      value: safeAchievements.buku,
      icon: BookOpen,
      desc: 'Textbooks & monographs'
    },
    {
      label: 'Patents',
      value: safeAchievements.paten,
      icon: Sparkles,
      desc: 'Registered inventions'
    },
    {
      label: 'Copyrights (HKI / IPR)',
      value: safeAchievements.hki,
      icon: ShieldCheck,
      desc: 'Intellectual property rights'
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-sky-100 pb-3">
        <div>
          <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
            Faculty Academic Performance
          </span>
          <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Academic Achievements & Research Metrics
          </h2>
        </div>
        <div className="text-xs text-slate-500 font-mono bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100 text-left sm:text-right">
          Recorded since 2014
        </div>
      </div>

      {/* Grid of Metric Cards in UNS White-Blue theme */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {metricItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white border border-sky-100 hover:border-[#004b87]/40 shadow-xs hover:shadow-md transition-all group relative overflow-hidden"
            >
              {/* Top subtle blue accent indicator */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#004b87] to-sky-400 opacity-80 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-slate-600 line-clamp-1">
                  {item.label}
                </span>
                <div className="p-1.5 rounded-lg bg-sky-50 text-[#004b87] group-hover:bg-[#004b87] group-hover:text-white transition-colors">
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="font-serif-academic text-2xl sm:text-3xl font-bold text-[#004b87] tracking-tight flex items-baseline justify-between">
                <span>{item.value}</span>
                {item.label === 'Scopus Publications' && (
                  <a
                    href="https://www.scopus.com/authid/detail.uri?authorId=55851190200"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="text-[9px] font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                    title="Terverifikasi Resmi Scopus ID: 55851190200 (Afiliasi Institusi: Universitas Sebelas Maret - UNS)"
                  >
                    <ShieldCheck className="w-2.5 h-2.5" />
                    <span>Scopus Verified</span>
                  </a>
                )}
              </div>

              <p className="text-[10px] text-slate-500 mt-1 line-clamp-1 font-sans">
                {item.desc}
              </p>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-500 italic text-right pt-1">
        * {achievements.notes || 'Data capaian kinerja dosen terhitung mulai tahun 2014.'}
      </p>
    </section>
  );
};
