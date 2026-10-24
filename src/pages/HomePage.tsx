import React from 'react';
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  MapPin,
  Mail,
  User,
  School,
  FileText,
  Download
} from 'lucide-react';
import { ProfessorProfile, Publication, ResearchProject, BlogPost } from '../types';
import { PublicationCard } from '../components/PublicationCard';
import { PublicNavTab } from '../components/Navbar';
import { AcademicMetricsSection } from '../components/AcademicMetricsSection';
import { AnnualPerformanceSection } from '../components/AnnualPerformanceSection';
import { ResearchGroupsSection } from '../components/ResearchGroupsSection';

interface HomePageProps {
  profile: ProfessorProfile;
  publications: Publication[];
  projects: ResearchProject[];
  blogPosts: BlogPost[];
  onNavigate: (tab: PublicNavTab) => void;
  onOpenInfographic: (pub: Publication) => void;
  onOpenCitation: (pub: Publication) => void;
  onOpenDetail: (pub: Publication) => void;
  onOpenCVPreview?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  profile,
  publications,
  projects,
  blogPosts,
  onNavigate,
  onOpenInfographic,
  onOpenCitation,
  onOpenDetail,
  onOpenCVPreview
}) => {
  const activePublications = publications.filter(p => !p.isArchived);
  const featuredPubs = activePublications.filter(p => p.isFeatured).slice(0, 3);
  const recentPubs = featuredPubs.length > 0 ? featuredPubs : activePublications.slice(0, 3);

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Academic Hero Profile (White & Blue UNS) */}
      <section className="pt-6 pb-12 border-b border-sky-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Photo Card & Identifiers */}
          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-2xl border-2 border-sky-100 overflow-hidden bg-white shadow-sm p-4 text-center space-y-4 relative group">
              {/* Profile Photo Display */}
              <div className="aspect-square w-full max-w-[280px] mx-auto rounded-xl overflow-hidden bg-gradient-to-b from-sky-50 to-blue-50 border border-sky-100 flex items-center justify-center relative shadow-inner">
                {profile.photoBase64 || profile.photoUrl ? (
                  <img
                    src={profile.photoBase64 || profile.photoUrl || '/nughthoh_photo.webp'}
                    alt={profile.name}
                    className="w-full h-full object-cover object-top transition-opacity duration-300"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.src.includes('/nughthoh_photo.webp') && !img.src.includes('/nughthoh_photo.jpg')) {
                        img.src = '/nughthoh_photo.webp';
                      } else if (!img.src.includes('/nughthoh_photo.jpg')) {
                        img.src = '/nughthoh_photo.jpg';
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-[#004b87]">
                    <div className="w-20 h-20 rounded-full bg-[#004b87] text-white flex items-center justify-center font-serif text-3xl font-bold shadow-md mb-3">
                      NK
                    </div>
                    <span className="font-serif-academic text-base font-bold text-slate-800">
                      Nughthoh Arfawi Kurdhi
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5">
                      Sebelas Maret University
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Details under photo */}
              <div className="space-y-1 pt-1 text-xs">
                <div className="font-serif-academic font-bold text-slate-900 text-sm">
                  {profile.name}
                </div>
                <div className="text-slate-500 font-medium">
                  {profile.department}
                </div>
                <div className="text-[#004b87] font-semibold">
                  {profile.faculty} • {profile.institution}
                </div>
                <div className="text-[11px] text-slate-500">
                  Study Program: <strong className="text-slate-700">{profile.programStudi}</strong>
                </div>
                {profile.labLocation && (
                  <div className="text-[11px] text-slate-500 pt-0.5">
                    Lab: <strong className="text-slate-700">{profile.labLocation}</strong>
                  </div>
                )}
                {profile.consultationHours && (
                  <div className="text-[11px] text-slate-500 pt-0.5">
                    Hours: <strong className="text-slate-700">{profile.consultationHours}</strong>
                  </div>
                )}
              </div>

              {/* Direct Email */}
              <div className="pt-2 border-t border-sky-50">
                <a
                  href={`mailto:${profile.email}`}
                  className="w-full py-2 bg-sky-50 hover:bg-[#004b87] text-[#004b87] hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span className="font-mono">{profile.email}</span>
                </a>
              </div>
            </div>

            {/* External Academic Profile Links */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                External Academic Profiles:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a
                  href={profile.googleScholarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-sky-100 hover:border-[#004b87] bg-white hover:bg-sky-50/50 text-slate-800 hover:text-[#004b87] transition-all flex items-center justify-between group shadow-2xs"
                >
                  <span className="font-medium text-[11px]">Google Scholar</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#004b87]" />
                </a>

                <a
                  href={profile.scopusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-sky-100 hover:border-[#004b87] bg-white hover:bg-sky-50/50 text-slate-800 hover:text-[#004b87] transition-all flex items-center justify-between group shadow-2xs"
                >
                  <span className="font-medium text-[11px]">Scopus Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#004b87]" />
                </a>

                <a
                  href={profile.orcidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-sky-100 hover:border-[#004b87] bg-white hover:bg-sky-50/50 text-slate-800 hover:text-[#004b87] transition-all flex items-center justify-between group shadow-2xs"
                >
                  <span className="font-medium text-[11px]">ORCID</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#004b87]" />
                </a>

                <a
                  href={profile.sintaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-sky-100 hover:border-[#004b87] bg-white hover:bg-sky-50/50 text-slate-800 hover:text-[#004b87] transition-all flex items-center justify-between group shadow-2xs"
                >
                  <span className="font-medium text-[11px]">SINTA UNS</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#004b87]" />
                </a>

                {profile.researchGateUrl && (
                  <a
                    href={profile.researchGateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-sky-100 hover:border-[#004b87] bg-white hover:bg-sky-50/50 text-slate-800 hover:text-[#004b87] transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <span className="font-medium text-[11px]">ResearchGate</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#004b87]" />
                  </a>
                )}

                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl border border-sky-100 hover:border-[#004b87] bg-white hover:bg-sky-50/50 text-slate-800 hover:text-[#004b87] transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <span className="font-medium text-[11px]">LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-[#004b87]" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Bio Narrative & Focus */}
          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
                Academic Profile & Research Archive
              </span>
              <h1 className="font-serif-academic text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
                {profile.name}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-serif italic">
                Lecturer in Department of Mathematics • FMIPA Sebelas Maret University (UNS)
              </p>
            </div>

            {/* Official Profile Narrative */}
            <div className="p-6 rounded-2xl bg-sky-50/40 border border-sky-100 text-slate-800 text-sm leading-relaxed space-y-4 font-sans text-justify">
              <p>
                <strong>Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.</strong> is a Lecturer in the Department of Mathematics, Faculty of Mathematics and Natural Sciences (FMIPA), Universitas Sebelas Maret (UNS), Indonesia. He received his B.Sc. in Mathematics from Universitas Sebelas Maret, his M.Sc. in Applied Mathematics from Universitas Gadjah Mada (UGM), and his Ph.D. in Applied Mathematics in Industrial Engineering from Eindhoven University of Technology, the Netherlands.
              </p>
              <p>
                His research focuses on optimization, mathematical modelling, operations research, and discrete choice experiments, with applications in epidemiology, immunology and virology, and industrial engineering. His current research also encompasses Explainable Artificial Intelligence (XAI), including Generative Adversarial Networks (GANs), SHapley Additive exPlanations (SHAP), and Local Interpretable Model-Agnostic Explanations (LIME), as well as metaheuristic optimization algorithms for the Electric Vehicle Routing Problem (EVRP).
              </p>
              <p>
                Nughthoh Arfawi Kurdhi actively teaches and supervises undergraduate, master's, and doctoral students, and has published extensively in internationally recognized journals. His research has appeared in leading outlets, including the <em>Journal of Operations Management (ABS 4*)</em>.
              </p>
            </div>

            {/* Research Interests Categories */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Research Interests & Specializations:
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.researchInterests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white text-[#004b87] font-semibold px-3 py-1.5 rounded-lg border border-sky-200/80 shadow-2xs hover:bg-sky-50 transition-colors"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('publications')}
                className="px-4 py-2.5 bg-[#004b87] hover:bg-[#003865] text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-sm hover:shadow"
              >
                <BookOpen className="w-4 h-4 text-sky-200" />
                <span>Explore Publications Archive ({activePublications.length})</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-200" />
              </button>

              <a
                href={profile.cvPdfUrl || 'https://expert.uns.ac.id/researcher/1091?export=cv'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-[#004b87] border border-sky-200 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 shadow-2xs hover:border-[#004b87]"
                title="Open Official Curriculum Vitae"
              >
                <FileText className="w-4 h-4 text-[#004b87]" />
                <span>Curriculum Vitae</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#004b87]" />
              </a>

              <button
                onClick={() => onNavigate('students')}
                className="px-4 py-2.5 bg-white hover:bg-sky-50 text-slate-800 hover:text-[#004b87] border border-sky-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <GraduationCap className="w-4 h-4 text-[#004b87]" />
                <span>Graduate Students</span>
              </button>

              <button
                onClick={() => onNavigate('resume')}
                className="px-3.5 py-2.5 bg-white hover:bg-sky-50 text-slate-700 hover:text-[#004b87] border border-sky-200 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <span>View Academic Profile</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Academic Achievements & Research Metrics Section */}
      <AcademicMetricsSection achievements={profile.achievements} />

      {/* 3. Annual Personal Performance Index Table & IRIS Explorer */}
      <AnnualPerformanceSection
        performance={profile.annualPerformance}
        publications={publications}
        p2mActivities={profile.p2mActivities}
        onOpenDetail={onOpenDetail}
        onNavigateToPublications={() => onNavigate('publications')}
      />

      {/* 5. Research Groups Section (Active & History) */}
      <ResearchGroupsSection groups={profile.researchGroups} />

      {/* 6. Featured Publications Showcase */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-sky-100 pb-3">
          <div>
            <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
              Selected Works
            </span>
            <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Publikasi Unggulan
            </h2>
          </div>
          <button
            onClick={() => onNavigate('publications')}
            className="text-xs font-semibold text-[#004b87] hover:underline flex items-center gap-1 group"
          >
            <span>Seluruh Publikasi ({activePublications.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="divide-y divide-sky-100">
          {recentPubs.map(pub => (
            <PublicationCard
              key={pub.id}
              publication={pub}
              onOpenInfographic={onOpenInfographic}
              onOpenCitation={onOpenCitation}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      </section>

      {/* 7. Academic Thoughts / Blog Highlights */}
      {blogPosts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-sky-100 pb-3">
            <div>
              <span className="text-xs font-semibold text-[#004b87] uppercase tracking-widest font-mono">
                Academic Reflections
              </span>
              <h2 className="font-serif-academic text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
                Catatan & Pemikiran Akademik
              </h2>
            </div>
            <button
              onClick={() => onNavigate('blog')}
              className="text-xs font-semibold text-[#004b87] hover:underline flex items-center gap-1 group"
            >
              <span>Semua Tulisan</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.slice(0, 2).map(post => (
              <article
                key={post.id}
                onClick={() => onNavigate('blog')}
                className="p-6 rounded-xl border border-sky-100 bg-white hover:border-[#004b87]/40 hover:shadow-xs transition-all space-y-3 cursor-pointer group"
              >
                <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <span>{post.publishedAt}</span>
                  <span>•</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-serif-academic text-lg font-bold text-slate-900 group-hover:text-[#004b87] transition-colors leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="text-xs text-[#004b87] font-semibold flex items-center gap-1 pt-1">
                  <span>Baca Artikel</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
