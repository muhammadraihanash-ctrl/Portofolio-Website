import React from 'react';
import { BookOpen, ExternalLink, GraduationCap, CheckCircle2 } from 'lucide-react';
import { TeachingCourse } from '../types';

interface TeachingPageProps {
  courses: TeachingCourse[];
}

export const TeachingPage: React.FC<TeachingPageProps> = ({ courses }) => {
  return (
    <div className="space-y-10 pb-20 max-w-4xl">
      {/* Header */}
      <div className="border-b border-sky-100 pb-8">
        <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
          Pedagogy & Curriculum
        </span>
        <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold text-slate-900 mt-1">
          Teaching & Course Activities
        </h1>
        <p className="text-sm text-slate-600 mt-2 font-serif italic">
          Undergraduate and graduate courses in Operations Research, Optimization, and Mathematical Modelling at FMIPA UNS.
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-sky-200 rounded-xl text-slate-500 text-sm">
          No courses currently listed.
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map(course => (
            <div
              key={course.id}
              className="p-6 border border-sky-100 rounded-2xl bg-white hover:border-[#004b87]/40 shadow-xs transition-colors space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#004b87] bg-sky-50 px-2.5 py-0.5 rounded border border-sky-200">
                    {course.code}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {course.level}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span>Semester: {course.semester}</span>
                  <span>•</span>
                  <span>Academic Year {course.academicYear}</span>
                </div>
              </div>

              <div>
                <h2 className="font-serif-academic text-xl font-bold text-slate-900">
                  {course.name}
                </h2>
                <div className="text-xs text-[#004b87] font-medium mt-0.5">
                  {course.program}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                {course.description}
              </p>

              {/* Learning Outcomes */}
              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="p-4 bg-sky-50/40 rounded-xl space-y-2 border border-sky-100 text-xs sm:text-sm">
                  <div className="font-semibold text-[#004b87] text-xs uppercase tracking-wider">
                    Course Learning Outcomes:
                  </div>
                  <ul className="space-y-1.5 text-slate-700">
                    {course.learningOutcomes.map((lo, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                        <span className="leading-relaxed">{lo}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Material Link */}
              {course.materialsUrl && (
                <div className="pt-2">
                  <a
                    href={course.materialsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#004b87] hover:underline underline-offset-3"
                  >
                    <span>Course Syllabus & SPADA Learning Portal</span>
                    <ExternalLink className="w-3 h-3 text-sky-500" />
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
