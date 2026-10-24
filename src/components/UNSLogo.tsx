import React from 'react';

interface UNSLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const UNSLogo: React.FC<UNSLogoProps> = ({ className = '', size = 38, showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Official UNS Emblem SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-2xs"
        aria-label="Logo Universitas Sebelas Maret"
      >
        {/* Outer Circular Ring with UNS Deep Blue */}
        <circle cx="50" cy="50" r="47" stroke="#004b87" strokeWidth="4" fill="#ffffff" />
        <circle cx="50" cy="50" r="42" stroke="#f1b434" strokeWidth="1.5" fill="none" />

        {/* 11 Petals (Sebelas Maret) */}
        <g stroke="#004b87" strokeWidth="1.2" fill="#004b87" opacity="0.95">
          {/* Stylized Lotus / Flower petals */}
          <path d="M50 18 C52 28, 55 35, 50 44 C45 35, 48 28, 50 18 Z" fill="#004b87" />
          <path d="M50 18 C58 26, 62 36, 54 44 C49 39, 49 28, 50 18 Z" fill="#005ca9" />
          <path d="M50 18 C42 26, 38 36, 46 44 C51 39, 51 28, 50 18 Z" fill="#005ca9" />
          
          <path d="M28 34 C38 37, 43 43, 45 49 C37 47, 31 43, 28 34 Z" fill="#004b87" />
          <path d="M72 34 C62 37, 57 43, 55 49 C63 47, 69 43, 72 34 Z" fill="#004b87" />
          
          <path d="M22 52 C32 50, 40 51, 46 54 C37 57, 28 58, 22 52 Z" fill="#005ca9" />
          <path d="M78 52 C68 50, 60 51, 54 54 C63 57, 72 58, 78 52 Z" fill="#005ca9" />

          {/* Central Eternal Flame (Cahaya Ilmu Pengetahuan) */}
          <path d="M50 38 C54 44, 55 52, 50 58 C45 52, 46 44, 50 38 Z" fill="#f1b434" />
        </g>

        {/* Base Pedestal (Wadah Pengabdian) */}
        <path
          d="M32 68 C40 65, 60 65, 68 68 L64 74 C56 73, 44 73, 36 74 Z"
          fill="#004b87"
        />
        {/* Book / Knowledge Base */}
        <path
          d="M36 74 C44 76, 50 78, 50 78 C50 78, 56 76, 64 74 L64 77 C56 79, 50 81, 50 81 C50 81, 44 79, 36 77 Z"
          fill="#f1b434"
        />

        {/* Micro text arc indicator: SEBELAS MARET */}
        <circle cx="50" cy="50" r="38" stroke="#004b87" strokeWidth="0.5" strokeDasharray="2 2" fill="none" />
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-bold text-xs tracking-wider text-[#004b87] leading-none uppercase">
            Universitas Sebelas Maret
          </span>
          <span className="text-[10px] text-slate-500 font-medium tracking-normal mt-0.5">
            FMIPA • Department of Mathematics
          </span>
        </div>
      )}
    </div>
  );
};
