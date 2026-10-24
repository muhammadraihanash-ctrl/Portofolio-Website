/**
 * Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D. - Academic Portfolio & Research Archive
 * Universitas Sebelas Maret (UNS)
 */

import React, { useState, useEffect } from 'react';
import { Navbar, PublicNavTab } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ResumePage } from './pages/ResumePage';
import { TeachingPage } from './pages/TeachingPage';
import { GraduateStudentsPage } from './pages/GraduateStudentsPage';
import { CurrentResearchPage } from './pages/CurrentResearchPage';
import { PublicationsPage } from './pages/PublicationsPage';
import { EditorialPage } from './pages/EditorialPage';
import { PressMediaPage } from './pages/PressMediaPage';
import { BlogPage } from './pages/BlogPage';
import { AdminPortal } from './pages/AdminPortal';
import { ResearchInfographicModal } from './components/ResearchInfographicModal';
import { CitationModal } from './components/CitationModal';
import { PublicationDetailModal } from './components/PublicationDetailModal';
import { CVPreviewModal } from './components/CVPreviewModal';
import { academicService } from './services/academicService';
import { Publication, ResearchInfographic } from './types';

export default function App() {
  // Check URL params for initial route / portal
  const checkInitialRoute = () => {
    if (typeof window === 'undefined') return { portal: 'public', tab: 'home' as PublicNavTab, id: '' };
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname;

    const isAdmin =
      path.startsWith('/admin') ||
      params.get('portal') === 'admin' ||
      hash.includes('admin');

    const rawTab = params.get('tab') || hash.replace('#', '') || 'home';
    const validTabs: PublicNavTab[] = [
      'home',
      'resume',
      'teaching',
      'students',
      'research',
      'publications',
      'editorial',
      'press',
      'blog'
    ];
    const tab = validTabs.includes(rawTab as PublicNavTab) ? (rawTab as PublicNavTab) : 'home';
    const id = params.get('id') || '';

    return { portal: isAdmin ? 'admin' : 'public', tab, id };
  };

  const initialRoute = checkInitialRoute();
  const [currentPortal, setCurrentPortal] = useState<'public' | 'admin'>(initialRoute.portal as any);
  const [activeTab, setActiveTab] = useState<PublicNavTab>(initialRoute.tab);

  // Admin authentication state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => academicService.isAdmin());

  // Master data states
  const [profile, setProfile] = useState(academicService.getProfile());
  const [publications, setPublications] = useState(academicService.getPublications());
  const [students, setStudents] = useState(academicService.getStudents());
  const [teaching, setTeaching] = useState(academicService.getTeaching());
  const [researchTopics, setResearchTopics] = useState(academicService.getResearchTopics());
  const [researchProjects, setResearchProjects] = useState(academicService.getResearchProjects());
  const [editorial, setEditorial] = useState(academicService.getEditorial());
  const [pressMedia, setPressMedia] = useState(academicService.getPressMedia());
  const [blogPosts, setBlogPosts] = useState(academicService.getBlogPosts(true));
  const [isInitialLoading, setIsInitialLoading] = useState(!academicService.hasSyncedOnce);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Modals state
  const [activeInfographic, setActiveInfographic] = useState<{
    isOpen: boolean;
    data: ResearchInfographic | null;
    publication: Publication | null;
  }>({
    isOpen: false,
    data: null,
    publication: null
  });

  const [activeCitation, setActiveCitation] = useState<{
    isOpen: boolean;
    publication: Publication | null;
  }>({
    isOpen: false,
    publication: null
  });

  const [activeDetail, setActiveDetail] = useState<{
    isOpen: boolean;
    publication: Publication | null;
  }>({
    isOpen: false,
    publication: null
  });

  const [isCVPreviewOpen, setIsCVPreviewOpen] = useState(false);

  // Re-fetch / re-sync data helper
  const reloadData = () => {
    setProfile(academicService.getProfile());
    setPublications(academicService.getPublications());
    setStudents(academicService.getStudents());
    setTeaching(academicService.getTeaching());
    setResearchTopics(academicService.getResearchTopics());
    setResearchProjects(academicService.getResearchProjects());
    setEditorial(academicService.getEditorial());
    setPressMedia(academicService.getPressMedia());
    setBlogPosts(academicService.getBlogPosts(true));
    setIsAdminLoggedIn(academicService.isAdmin());
  };

  useEffect(() => {
    // Initial sync with central server backend
    academicService.syncFromBackend().then((success) => {
      setIsInitialLoading(false);
      if (!success) {
        setBackendError('Tidak dapat terhubung ke server database pusat.');
      } else {
        setBackendError(null);
      }
      reloadData();
      // Check if URL specified an initial publication ID
      if (initialRoute.id) {
        const found = academicService.getPublicationById(initialRoute.id);
        if (found) {
          setActiveDetail({ isOpen: true, publication: found });
        }
      }
    });

    const unsub = academicService.subscribe(() => {
      reloadData();
    });

    const unsubAuth = academicService.onAuthExpired(() => {
      setIsAdminLoggedIn(false);
    });

    // Handle Hotkey: Ctrl+Shift+A or Alt+Shift+A to toggle Admin
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setCurrentPortal(prev => (prev === 'admin' ? 'public' : 'admin'));
      }
    };

    const handlePopState = () => {
      const r = checkInitialRoute();
      setCurrentPortal(r.portal as any);
      setActiveTab(r.tab);
      if (r.id) {
        const pub = academicService.getPublicationById(r.id);
        if (pub) setActiveDetail({ isOpen: true, publication: pub });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    return () => {
      unsub();
      unsubAuth();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Update URL history state when tab or portal changes
  const handleSelectTab = (tab: PublicNavTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      try {
        const url = tab === 'home' ? '/' : `/?tab=${tab}`;
        window.history.pushState({}, '', url);
      } catch {
        window.location.hash = tab;
      }
    }
  };

  const handleOpenDetailModal = (pub: Publication) => {
    setActiveDetail({ isOpen: true, publication: pub });
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', `/?tab=publications&id=${pub.id}`);
      } catch {
        // fallback
      }
    }
  };

  const handleCloseDetailModal = () => {
    setActiveDetail({ isOpen: false, publication: null });
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({}, '', activeTab === 'home' ? '/' : `/?tab=${activeTab}`);
      } catch {
        // fallback
      }
    }
  };

  // Graceful fallback loading screen only if profile is completely unavailable
  if (!profile || !profile.name) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-white border border-sky-100 rounded-2xl shadow-xl p-8 max-w-md w-full space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#004b87] text-white flex items-center justify-center mx-auto shadow-md">
            <span className="font-serif-academic font-bold text-2xl tracking-wider">UNS</span>
          </div>
          <h1 className="font-serif-academic text-xl font-bold text-slate-900">
            Arsip &amp; Portofolio Akademik
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D. • Memuat data portofolio...
          </p>
          <div className="w-full bg-sky-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#004b87] h-full w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Only published and non-archived works show to public
  const publicPublications = publications.filter(p => p.status === 'Published' && !p.isArchived);

  // Render Admin Portal if in admin mode
  if (currentPortal === 'admin') {
    return (
      <AdminPortal
        onBackToPublic={() => {
          setCurrentPortal('public');
          if (typeof window !== 'undefined') {
            try {
              window.history.pushState({}, '', '/');
            } catch {
              window.location.hash = '';
            }
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true);
        }}
        onLogout={() => {
          academicService.adminLogout();
          setIsAdminLoggedIn(false);
          setCurrentPortal('public');
        }}
      />
    );
  }

  // Render Public Academic Portfolio
  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col font-sans selection:bg-stone-200">
      {backendError && (
        <div className="bg-amber-600 text-white text-xs px-4 py-2 flex items-center justify-between shadow-xs sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="font-bold">⚠️ Mode Tersimpan:</span>
            <span>Tidak dapat terhubung ke server database pusat. Menampilkan data tersimpan terakhir tanpa mereset ke pengaturan default.</span>
          </div>
          <button
            onClick={() => academicService.syncFromBackend().then((ok) => { if (ok) setBackendError(null); reloadData(); })}
            className="underline hover:no-underline font-semibold text-[11px] shrink-0 ml-4 bg-amber-700 hover:bg-amber-800 px-2.5 py-1 rounded-md transition-colors"
          >
            Coba Sinkronisasi
          </button>
        </div>
      )}
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenAdmin={() => {
          setCurrentPortal('admin');
          if (typeof window !== 'undefined') {
            try {
              window.history.pushState({}, '', '/admin');
            } catch {
              window.location.hash = 'admin';
            }
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        photoUrl={profile.photoBase64 || profile.photoUrl || '/api/profile/photo'}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 pt-8">
        {activeTab === 'home' && (
          <HomePage
            profile={profile}
            publications={publicPublications}
            projects={researchProjects}
            blogPosts={blogPosts}
            onNavigate={handleSelectTab}
            onOpenInfographic={pub => {
              if (pub.infographicData) {
                setActiveInfographic({ isOpen: true, data: pub.infographicData, publication: pub });
              }
            }}
            onOpenCitation={pub => {
              setActiveCitation({ isOpen: true, publication: pub });
            }}
            onOpenDetail={handleOpenDetailModal}
            onOpenCVPreview={() => setIsCVPreviewOpen(true)}
          />
        )}

        {activeTab === 'resume' && (
          <ResumePage
            profile={profile}
            onOpenCVPreview={() => setIsCVPreviewOpen(true)}
          />
        )}

        {activeTab === 'teaching' && (
          <TeachingPage courses={teaching} />
        )}

        {activeTab === 'students' && (
          <GraduateStudentsPage
            students={students}
            publications={publicPublications}
            onSelectPublication={handleOpenDetailModal}
            onStudentUpdated={() => {
              setStudents(academicService.getStudents());
            }}
          />
        )}

        {activeTab === 'research' && (
          <CurrentResearchPage
            topics={researchTopics}
            projects={researchProjects}
          />
        )}

        {activeTab === 'publications' && (
          <PublicationsPage
            publications={publicPublications}
            onOpenInfographic={pub => {
              if (pub.infographicData) {
                setActiveInfographic({ isOpen: true, data: pub.infographicData, publication: pub });
              }
            }}
            onOpenCitation={pub => {
              setActiveCitation({ isOpen: true, publication: pub });
            }}
            onOpenDetail={handleOpenDetailModal}
          />
        )}

        {activeTab === 'editorial' && (
          <EditorialPage roles={editorial} />
        )}

        {activeTab === 'press' && (
          <PressMediaPage mediaItems={pressMedia} />
        )}

        {activeTab === 'blog' && (
          <BlogPage posts={blogPosts} />
        )}
      </main>

      {/* Footer */}
      <Footer
        profile={profile}
        onOpenAdmin={() => {
          setCurrentPortal('admin');
          if (typeof window !== 'undefined') {
            try {
              window.history.pushState({}, '', '/admin');
            } catch {
              window.location.hash = 'admin';
            }
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* MODAL: RESEARCH INFOGRAPHIC LIGHTBOX */}
      {activeInfographic.isOpen && activeInfographic.data && (
        <ResearchInfographicModal
          isOpen={true}
          onClose={() => setActiveInfographic({ isOpen: false, data: null, publication: null })}
          infographic={activeInfographic.data}
          publication={activeInfographic.publication || undefined}
        />
      )}

      {/* MODAL: CITATION EXPORTER */}
      {activeCitation.isOpen && activeCitation.publication && (
        <CitationModal
          isOpen={true}
          onClose={() => setActiveCitation({ isOpen: false, publication: null })}
          publication={activeCitation.publication}
        />
      )}

      {/* MODAL: PUBLICATION DETAIL VIEW */}
      {activeDetail.isOpen && activeDetail.publication && (
        <PublicationDetailModal
          isOpen={true}
          onClose={handleCloseDetailModal}
          publication={activeDetail.publication}
          onOpenInfographic={pub => {
            if (pub.infographicData) {
              setActiveInfographic({ isOpen: true, data: pub.infographicData, publication: pub });
            }
          }}
          onOpenCitation={pub => {
            setActiveCitation({ isOpen: true, publication: pub });
          }}
        />
      )}

      {/* MODAL: CURRICULUM VITAE DOCUMENT PREVIEW (INTERACTIVE + PDF STREAM) */}
      <CVPreviewModal
        isOpen={isCVPreviewOpen}
        onClose={() => setIsCVPreviewOpen(false)}
        profile={profile}
      />
    </div>
  );
}
