import React, { useState } from 'react';
import { Menu, X, ArrowUpRight, GraduationCap } from 'lucide-react';

export type PublicNavTab =
  | 'home'
  | 'resume'
  | 'teaching'
  | 'students'
  | 'research'
  | 'publications'
  | 'editorial'
  | 'press'
  | 'blog';

interface NavbarProps {
  activeTab: PublicNavTab;
  onSelectTab: (tab: PublicNavTab) => void;
  onOpenAdmin?: () => void;
  isAdminLoggedIn?: boolean;
  photoUrl?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAdmin,
  isAdminLoggedIn,
  photoUrl
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ id: PublicNavTab; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'resume', label: 'Resume' },
    { id: 'teaching', label: 'Teaching' },
    { id: 'students', label: 'Graduate Students' },
    { id: 'research', label: 'Current Research' },
    { id: 'publications', label: 'Publications' },
    { id: 'editorial', label: 'Editorial Roles' },
    { id: 'press', label: 'Press & Media' },
    { id: 'blog', label: 'Blog' }
  ];

  const handleSelect = (tab: PublicNavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100">
      {/* Top micro bar with UNS Deep Blue */}
      <div className="bg-[#004b87] text-white text-[11px] py-1.5 px-4 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wide">Sebelas Maret University</span>
            <span className="text-sky-300">•</span>
            <span className="text-sky-100 hidden sm:inline">
              FMIPA • Department of Mathematics
            </span>
            <span className="text-sky-100 sm:hidden">
              Department of Mathematics
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-sky-200 hidden md:inline text-[11px]">
              Surakarta, Indonesia
            </span>
            {isAdminLoggedIn && onOpenAdmin && (
              <button
                onClick={onOpenAdmin}
                className="bg-sky-700/80 hover:bg-sky-600 text-white font-semibold px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition-colors"
              >
                <span>Admin Portal</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand with UNS Logo & Professor Photo */}
          <button
            onClick={() => handleSelect('home')}
            className="flex items-center gap-3 text-left group transition-all"
          >
            <div className="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-[#004b87] shadow-xs bg-sky-50 ring-2 ring-sky-100">
              <img
                src={photoUrl || '/nughthoh_photo.webp'}
                alt="Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D."
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const img = e.currentTarget;
                  if (!img.src.includes('/nughthoh_photo.webp') && !img.src.includes('/nughthoh_photo.jpg')) {
                    img.src = '/nughthoh_photo.webp';
                  } else if (!img.src.includes('/nughthoh_photo.jpg')) {
                    img.src = '/nughthoh_photo.jpg';
                  }
                }}
              />
            </div>
            <div>
              <div className="font-serif-academic text-lg sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-[#004b87] transition-colors leading-tight">
                Nughthoh Arfawi Kurdhi, S.Si., M.Sc., Ph.D.
              </div>
              <div className="text-[11px] font-medium text-slate-500 tracking-wider uppercase mt-0.5 flex items-center gap-1.5">
                <span className="text-[#004b87] font-semibold">FMIPA UNS</span>
                <span>•</span>
                <span>Applied Mathematics & Optimization</span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`px-3 py-1.5 text-[13px] font-medium transition-all rounded-md relative ${
                    isActive
                      ? 'text-[#004b87] font-bold bg-sky-50/80'
                      : 'text-slate-700 hover:text-[#004b87] hover:bg-sky-50/50'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#004b87] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#004b87] hover:bg-sky-50 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-sky-100 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1">
            Academic Portfolio Navigation
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-[#004b87] text-white font-bold'
                    : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </button>
            );
          })}
          {isAdminLoggedIn && onOpenAdmin && (
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-[#004b87] hover:bg-sky-50 flex items-center justify-between"
              >
                <span>Admin Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
