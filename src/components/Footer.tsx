import React from 'react';
import { ExternalLink, Mail, MapPin, Award, BookOpen, GraduationCap } from 'lucide-react';
import { ProfessorProfile } from '../types';
import { UNSLogo } from './UNSLogo';

interface FooterProps {
  profile: ProfessorProfile;
  onOpenAdmin?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ profile, onOpenAdmin, isAdminLoggedIn }) => {
  return (
    <footer className="bg-[#002d5a] text-slate-200 pt-16 pb-12 border-t-4 border-[#004b87] text-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-12 border-b border-sky-900/60">
          {/* Identity & Office */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <UNSLogo size={36} showText={false} />
              <div>
                <h3 className="font-serif-academic text-xl font-bold text-white tracking-tight">
                  {profile.name}
                </h3>
                <p className="text-xs text-sky-300 font-medium uppercase tracking-wider mt-0.5">
                  {profile.department}
                </p>
              </div>
            </div>
            <p className="text-sky-200/80 text-xs leading-relaxed font-sans">
              {profile.faculty}, {profile.institution}. Study Program: {profile.programStudi}.
            </p>
            <div className="space-y-1.5 text-xs text-sky-200/70 pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>{profile.office}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href={`mailto:${profile.email}`}
                  className="text-white hover:text-sky-200 underline underline-offset-2 transition-colors font-mono"
                >
                  {profile.email}
                </a>
              </div>
            </div>
          </div>

          {/* Research & Official Academic Profiles */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-sky-400" />
              <span>Academic Indexing Profiles</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href={profile.googleScholarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sky-200/90 hover:text-white transition-colors"
                >
                  <span>Google Scholar Profile</span>
                  <ExternalLink className="w-3 h-3 text-sky-400" />
                </a>
              </li>
              <li>
                <a
                  href={profile.scopusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sky-200/90 hover:text-white transition-colors"
                >
                  <span>Scopus Author ID (55851190200)</span>
                  <ExternalLink className="w-3 h-3 text-sky-400" />
                </a>
              </li>
              <li>
                <a
                  href={profile.orcidUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sky-200/90 hover:text-white transition-colors"
                >
                  <span>ORCID (0000-0001-9274-1807)</span>
                  <ExternalLink className="w-3 h-3 text-sky-400" />
                </a>
              </li>
              <li>
                <a
                  href={profile.sintaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sky-200/90 hover:text-white transition-colors"
                >
                  <span>SINTA Indonesia (ID: 6765487)</span>
                  <ExternalLink className="w-3 h-3 text-sky-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://iris1103.uns.ac.id/profil-0617078501.asm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sky-200/90 hover:text-white transition-colors"
                >
                  <span>IRIS1103 UNS Faculty Directory</span>
                  <ExternalLink className="w-3 h-3 text-sky-400" />
                </a>
              </li>
            </ul>
          </div>

          {/* Research Focus & University Link */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
              Research Focus & Specializations
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {profile.researchInterests.slice(0, 5).map((interest, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-sky-950 text-sky-200 px-2.5 py-1 rounded border border-sky-800"
                >
                  {interest}
                </span>
              ))}
            </div>
            <div className="pt-2 text-xs text-sky-300/80">
              <a
                href="https://uns.ac.id"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Universitas Sebelas Maret (uns.ac.id)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-sky-300/70">
          <p>
            © {new Date().getFullYear()} Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D. Universitas Sebelas Maret (UNS). All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sky-400/80 font-mono text-[11px]">
            <span>Surakarta, Central Java, Indonesia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
