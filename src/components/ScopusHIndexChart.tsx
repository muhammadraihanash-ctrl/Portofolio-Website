import React from 'react';
import { Award, Info, TrendingUp, Calendar } from 'lucide-react';
import { ScopusHIndexYearEntry } from '../types';

interface ScopusHIndexChartProps {
  history: ScopusHIndexYearEntry[];
}

export const ScopusHIndexChart: React.FC<ScopusHIndexChartProps> = ({ history }) => {
  // Ensure we have 13 sorted rows from 2014 to 2026
  const years = Array.from({ length: 13 }, (_, i) => 2014 + i);
  const safeHistory = history || [];
  const dataMap = new Map(safeHistory.map(item => [item.year, item.hIndex]));
  const fullData: ScopusHIndexYearEntry[] = years.map(y => ({
    year: y,
    hIndex: dataMap.get(y) ?? null
  }));

  const validEntries = fullData.filter(d => d.hIndex !== null) as Array<{ year: number; hIndex: number }>;
  const hasValues = validEntries.length > 0;

  // Chart dimensions
  const width = 800;
  const height = 240;
  const paddingX = 50;
  const paddingY = 40;

  const maxVal = hasValues ? Math.max(...validEntries.map(e => e.hIndex), 5) : 10;
  const minVal = 0;

  const getX = (index: number) => paddingX + (index / (fullData.length - 1)) * (width - 2 * paddingX);
  const getY = (val: number) => height - paddingY - ((val - minVal) / (maxVal - minVal || 1)) * (height - 2 * paddingY);

  // Path data if values exist
  const points = validEntries.map(e => {
    const idx = fullData.findIndex(d => d.year === e.year);
    return { x: getX(idx), y: getY(e.hIndex), ...e };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '')
    : '';

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-sky-100 pb-3">
        <div>
          <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
            Scopus Citation Index
          </span>
          <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
            Scopus H-Index History
          </h2>
        </div>
        <div className="text-xs text-slate-500 font-mono bg-sky-50 px-2.5 py-1 rounded-md border border-sky-100 text-left sm:text-right">
          Period: 2014 – 2026 (13 Years)
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-sky-100 shadow-xs space-y-6">
        {/* SVG Line Chart */}
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto min-w-[620px] select-none"
          >
            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = height - paddingY - pct * (height - 2 * paddingY);
              const labelVal = Math.round(minVal + pct * (maxVal - minVal));
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 12}
                    y={y + 4}
                    fontSize="11"
                    fill="#94a3b8"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {labelVal}
                  </text>
                </g>
              );
            })}

            {/* X Axis Years */}
            {fullData.map((d, i) => {
              const x = getX(i);
              return (
                <g key={d.year}>
                  <line
                    x1={x}
                    y1={height - paddingY}
                    x2={x}
                    y2={height - paddingY + 6}
                    stroke="#cbd5e1"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={height - paddingY + 22}
                    fontSize="11"
                    fill="#64748b"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {d.year}
                  </text>
                </g>
              );
            })}

            {/* Plot Line & Points if values exist */}
            {hasValues && pathD && (
              <>
                <path
                  d={pathD}
                  fill="none"
                  stroke="#004b87"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {points.map((p, i) => (
                  <g key={i}>
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill="#ffffff"
                      stroke="#004b87"
                      strokeWidth="3"
                    />
                    <text
                      x={p.x}
                      y={p.y - 10}
                      fontSize="11"
                      fontWeight="bold"
                      fill="#004b87"
                      textAnchor="middle"
                    >
                      {p.hIndex}
                    </text>
                  </g>
                ))}
              </>
            )}
          </svg>
        </div>

        {/* Informative Status Banner */}
        <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#004b87] shrink-0" />
            <span>
              <strong>Note:</strong> {hasValues
                ? 'Scopus H-Index records verified and synced from central database.'
                : 'Scopus H-Index values will be updated periodically from official indexing records.'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 shrink-0">
            Source: Scopus Author ID 55851190200
          </span>
        </div>

        {/* 13-Year Data Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 border-b border-slate-200 flex items-center justify-between">
            <span>Annual Scopus H-Index Breakdown (2014–2026)</span>
            <span className="text-[11px] text-slate-500 font-normal">13 Annual Entries</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-13 divide-x divide-y sm:divide-y-0 divide-slate-100 text-center text-xs">
            {fullData.map(d => (
              <div key={d.year} className="p-2.5 space-y-1 hover:bg-sky-50/50 transition-colors">
                <div className="font-mono text-[11px] text-slate-500 font-semibold">{d.year}</div>
                <div className={`font-mono font-bold text-sm ${d.hIndex !== null ? 'text-[#004b87]' : 'text-slate-400 italic'}`}>
                  {d.hIndex !== null ? d.hIndex : '—'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
