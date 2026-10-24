import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Award,
  Users,
  Download,
  Printer,
  ExternalLink,
  MapPin,
  Mail,
  Building,
  CheckCircle2,
  Calendar,
  FileText
} from 'lucide-react';
import { ProfessorProfile } from '../types';

interface ResumePageProps {
  profile: ProfessorProfile;
  onOpenCVPreview?: () => void;
}

export const ResumePage: React.FC<ResumePageProps> = ({ profile, onOpenCVPreview }) => {
  return (
    <div className="space-y-12 pb-20 max-w-4xl">
      {/* Page Header */}
      <div className="border-b border-sky-100 pb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
            Curriculum Vitae
          </span>
          <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
            Academic Resume & Education
          </h1>
          <p className="text-sm text-slate-600 mt-2 font-serif italic">
            {profile.name} — {profile.department}, {profile.faculty}, Sebelas Maret University
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <a
            href={profile.cvPdfUrl || 'https://expert.uns.ac.id/researcher/1091?export=cv'}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 shadow-2xs"
            title="Open Official Curriculum Vitae"
          >
            <FileText className="w-4 h-4 text-sky-200" />
            <span>Curriculum Vitae (UNS Export)</span>
            <ExternalLink className="w-3.5 h-3.5 text-sky-200" />
          </a>

          {onOpenCVPreview && (
            <button
              onClick={onOpenCVPreview}
              className="px-3.5 py-2 bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
              title="Interactive CV preview"
            >
              <FileText className="w-3.5 h-3.5 text-[#004b87]" />
              <span>Preview CV</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-sky-200 hover:border-[#004b87] text-slate-700 hover:text-[#004b87] hover:bg-sky-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print CV</span>
          </button>
        </div>
      </div>

      {/* 1. Academic Biography */}
      <section className="space-y-3">
        <h2 className="font-serif-academic text-xl font-bold text-slate-900 flex items-center gap-2">
          <span>Personal Profile</span>
        </h2>
        <div className="p-6 bg-sky-50/40 border border-sky-100 rounded-2xl text-slate-800 text-sm leading-relaxed space-y-3 font-sans text-justify">
          <p>{profile.bio}</p>
        </div>
      </section>

      {/* 2. Research Interests */}
      <section className="space-y-3">
        <h2 className="font-serif-academic text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-sky-100 pb-2">
          <span>Research Interests & Focus Areas</span>
        </h2>
        <div className="flex flex-wrap gap-2 pt-1">
          {profile.researchInterests.map((interest, idx) => (
            <span
              key={idx}
              className="text-xs bg-white text-[#004b87] font-semibold px-3.5 py-1.5 rounded-lg border border-sky-200 shadow-2xs"
            >
              {interest}
            </span>
          ))}
        </div>
      </section>

      {/* 3. Education History Timeline */}
      <section className="space-y-4">
        <h2 className="font-serif-academic text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-sky-100 pb-2">
          <GraduationCap className="w-5 h-5 text-[#004b87]" />
          <span>Education History</span>
        </h2>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-sky-200">
          {profile.education.map((edu, idx) => (
            <div key={edu.id || idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-[#004b87] shadow-xs group-hover:scale-125 transition-transform" />

              <div className="p-5 border border-sky-100 rounded-xl bg-white hover:border-[#004b87]/40 shadow-xs transition-all space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 font-mono">
                  <span className="font-bold text-[#004b87] text-sm font-sans">
                    {edu.degree} — {edu.field}
                  </span>
                  <span className="bg-sky-50 text-[#004b87] font-bold px-2.5 py-0.5 rounded border border-sky-200">
                    Year {edu.year}
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-800">
                  {edu.institution}
                </div>

                {edu.thesisTitle && (
                  <div className="text-xs text-slate-500 italic pt-1">
                    Thesis / Dissertation: "{edu.thesisTitle}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Work History Timeline */}
      <section className="space-y-4">
        <h2 className="font-serif-academic text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-sky-100 pb-2">
          <Briefcase className="w-5 h-5 text-[#004b87]" />
          <span>Work & Research Experience</span>
        </h2>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-sky-200">
          {profile.workHistory.map((work, idx) => (
            <div key={work.id || idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white bg-sky-600 shadow-xs group-hover:scale-125 transition-transform" />

              <div className="p-5 border border-sky-100 rounded-xl bg-white hover:border-[#004b87]/40 shadow-xs transition-all space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-500">
                  <span className="font-bold text-slate-900 text-sm font-sans">
                    {work.role}
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                    Period: {work.period}
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-medium text-[#004b87]">
                  {work.institution}
                </div>

                {work.description && (
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {work.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Academic Appointments & Current Responsibilities */}
      <section className="space-y-4">
        <h2 className="font-serif-academic text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-sky-100 pb-2">
          <Building className="w-5 h-5 text-[#004b87]" />
          <span>Academic Appointments & Leadership at UNS</span>
        </h2>
        <div className="space-y-3">
          {profile.appointments.map(app => (
            <div
              key={app.id}
              className="p-5 border border-sky-100 rounded-xl bg-white space-y-1.5 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono text-slate-500">
                <span className="font-bold text-slate-900 text-sm font-sans">{app.role}</span>
                <span className="bg-sky-50 text-[#004b87] font-semibold px-2 py-0.5 rounded">{app.period}</span>
              </div>
              <div className="text-xs sm:text-sm font-medium text-slate-700">
                {app.department}, {app.institution}
              </div>
              {app.description && (
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {app.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. Professional Memberships */}
      <section className="space-y-4">
        <h2 className="font-serif-academic text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-sky-100 pb-2">
          <Users className="w-5 h-5 text-[#004b87]" />
          <span>Professional Memberships & Affiliations</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.memberships.map((mem, idx) => (
            <div
              key={idx}
              className="p-3.5 border border-sky-100 rounded-xl bg-sky-50/50 text-xs sm:text-sm font-medium text-slate-800 flex items-center gap-2.5"
            >
              <span className="w-2 h-2 rounded-full bg-[#004b87]" />
              <span>{mem}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
