import React from 'react';
import { Layers, Users, Calendar, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { ResearchTopic, ResearchProject } from '../types';

interface CurrentResearchPageProps {
  topics: ResearchTopic[];
  projects: ResearchProject[];
}

export const CurrentResearchPage: React.FC<CurrentResearchPageProps> = ({ topics, projects }) => {
  return (
    <div className="space-y-12 pb-20 max-w-4xl">
      {/* Header */}
      <div className="border-b border-sky-100 pb-8">
        <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
          Research Programs & Grants
        </span>
        <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
          Current Research & Projects
        </h1>
        <p className="text-sm text-slate-600 mt-2 font-serif italic">
          Applied mathematics, EVRP optimization, Explainable AI (XAI), mathematical epidemiology, and scientific machine learning at FMIPA UNS.
        </p>
      </div>

      {/* 1. Core Research Areas / Topics */}
      <section className="space-y-6">
        <h2 className="font-serif-academic text-2xl font-bold text-slate-900 border-b border-sky-100 pb-2">
          Research Specializations & Core Topics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map(topic => (
            <div
              key={topic.id}
              className="p-6 rounded-2xl border border-sky-100 bg-white hover:border-[#004b87]/40 shadow-xs transition-colors space-y-3"
            >
              <h3 className="font-serif-academic text-lg font-bold text-slate-900">
                {topic.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-sans text-justify">
                {topic.description}
              </p>
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Key Concepts:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {topic.keyConcepts.map((concept, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-sky-50 text-[#004b87] border border-sky-200 px-2.5 py-0.5 rounded font-mono font-medium"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Research Projects & Grants */}
      <section className="space-y-6 pt-4">
        <h2 className="font-serif-academic text-2xl font-bold text-slate-900 border-b border-sky-100 pb-2">
          Funded Projects & Competitive Research Grants
        </h2>

        <div className="space-y-6">
          {projects.map(project => (
            <div
              key={project.id}
              className="p-6 rounded-2xl border border-sky-100 bg-white hover:border-[#004b87]/40 shadow-xs transition-colors space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-50 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    project.status === 'Ongoing'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-sky-50 text-[#004b87] border border-sky-200'
                  }`}>
                    {project.status === 'Ongoing' ? 'Ongoing' : 'Completed'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Period: {project.period}
                  </span>
                </div>
                <div className="text-xs font-semibold text-[#004b87] bg-sky-50 px-2.5 py-0.5 rounded">
                  {project.role}
                </div>
              </div>

              <div>
                <h3 className="font-serif-academic text-xl font-bold text-slate-900 leading-snug">
                  {project.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans text-justify">
                {project.description}
              </p>

              {/* Funding & Collaborators */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-sky-50">
                <div>
                  <span className="font-semibold text-slate-500 block">Funding Source & Grant Scheme:</span>
                  <span className="text-slate-800 font-medium">
                    {project.fundingSource} {project.grantName ? `(${project.grantName})` : ''}
                  </span>
                </div>

                <div>
                  <span className="font-semibold text-slate-500 block">Collaborators & Research Team:</span>
                  <span className="text-slate-800">
                    {project.collaborators.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
