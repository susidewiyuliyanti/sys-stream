import React from 'react';

interface SysLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only' | 'badge' | 'leather';
}

export const SysLogo: React.FC<SysLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'full'
}) => {
  // Dimension mapping
  const sizeMap = {
    xs: { box: 'w-6 h-6', text: 'text-xs', subtext: 'text-[8px]' },
    sm: { box: 'w-8 h-8', text: 'text-sm', subtext: 'text-[9px]' },
    md: { box: 'w-10 h-10', text: 'text-base', subtext: 'text-[10px]' },
    lg: { box: 'w-14 h-14', text: 'text-xl', subtext: 'text-xs' },
    xl: { box: 'w-24 h-24', text: 'text-2xl', subtext: 'text-sm' }
  };

  const currentSize = sizeMap[size];

  // Pure SVG faithful recreation of the uploaded luxury embossed leather "SyS" brand mark
  const renderSvgEmblem = (isStandaloneBadge = false) => (
    <svg
      viewBox="0 0 200 240"
      className="w-full h-full select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Leather warm bronze/caramel gradient */}
        <radialGradient id="sysLeatherBg" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#b48962" />
          <stop offset="50%" stopColor="#9a714c" />
          <stop offset="100%" stopColor="#6e4d30" />
        </radialGradient>

        {/* Metallic Gold for Diamond Knot Monogram */}
        <linearGradient id="sysGoldKnot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe999" />
          <stop offset="25%" stopColor="#e5ba55" />
          <stop offset="60%" stopColor="#c59231" />
          <stop offset="85%" stopColor="#dfb249" />
          <stop offset="100%" stopColor="#8d6118" />
        </linearGradient>

        {/* Embossed deep wine / maroon / burgundy letters gradient */}
        <linearGradient id="sysWineLetter" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#641e2b" />
          <stop offset="40%" stopColor="#4e1420" />
          <stop offset="85%" stopColor="#300a12" />
          <stop offset="100%" stopColor="#1e040a" />
        </linearGradient>

        {/* Emboss highlight filter */}
        <filter id="sysEmbossShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1.5" stdDeviation="0.8" floodColor="#000000" floodOpacity="0.55" />
        </filter>
      </defs>

      {/* Optional rich leather background plate when standalone */}
      {isStandaloneBadge && (
        <rect
          width="200"
          height="240"
          rx="24"
          fill="url(#sysLeatherBg)"
          stroke="#e5ba55"
          strokeWidth="2.5"
          strokeOpacity="0.4"
        />
      )}

      {/* ========================================================
          1. TOP MONOGRAM: GOLD DIAMOND INTERLACED KNOT EMBLEM
         ======================================================== */}
      <g transform="translate(100, 52) scale(0.95)" filter="url(#sysEmbossShadow)">
        {/* Outer Diamond Rhombus */}
        <path
          d="M 0 -38 L 38 0 L 0 38 L -38 0 Z"
          stroke="url(#sysGoldKnot)"
          strokeWidth="3.6"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Inner Diamond Frame */}
        <path
          d="M 0 -26 L 26 0 L 0 26 L -26 0 Z"
          stroke="url(#sysGoldKnot)"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Interlacing Geometric Ribbon Knot Elements */}
        {/* Top-Right Loop */}
        <path
          d="M -7 -14 L 0 -21 L 14 -7 L 7 0 L 0 -7 L -7 0"
          stroke="url(#sysGoldKnot)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Bottom-Right Loop */}
        <path
          d="M 0 7 L 7 0 L 21 14 L 0 35 L -10 25"
          stroke="url(#sysGoldKnot)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Left Loop */}
        <path
          d="M 0 -7 L -14 -21 L -35 0 L -21 14 L -7 0"
          stroke="url(#sysGoldKnot)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Center Interlocking S-cross */}
        <path
          d="M -8 -8 L 8 8 M -8 8 L 8 -8"
          stroke="url(#sysGoldKnot)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="0" cy="0" r="2.5" fill="url(#sysGoldKnot)" />
      </g>

      {/* ========================================================
          2. LUXURY SERIF TYPOGRAPHY: "SyS"
          Capital Serif 'S' + Droplet-descender 'y' + Capital Serif 'S'
         ======================================================== */}
      <g filter="url(#sysEmbossShadow)">
        {/* FIRST CAPITAL 'S' */}
        <path
          d="M 28 126 
             C 28 116, 36 109, 52 109
             C 67 109, 76 117, 76 127
             C 76 137, 68 143, 56 148
             C 42 153, 31 161, 31 174
             C 31 190, 44 200, 63 200
             C 78 200, 87 192, 90 186
             L 88 184
             C 85 189, 77 195, 64 195
             C 48 195, 38 186, 38 174
             C 38 163, 47 156, 61 151
             C 77 145, 84 137, 84 125
             C 84 112, 72 105, 54 105
             C 36 105, 26 114, 26 126
             Z"
          fill="url(#sysWineLetter)"
          stroke="#e5ba55"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />

        {/* MIDDLE LOWERCASE 'y' WITH CURVED TEARDROP DESCENDER */}
        <path
          d="M 90 120 
             L 98 120 
             L 109 154 
             L 120 120 
             L 128 120 
             L 112 168 
             C 107 183, 101 198, 93 209 
             C 87 217, 79 223, 70 223 
             C 64 223, 59 219, 59 213 
             C 59 206, 65 201, 72 201 
             C 79 201, 83 205, 84 209 
             C 89 202, 94 191, 98 178 
             L 90 120 
             Z"
          fill="url(#sysWineLetter)"
          stroke="#e5ba55"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />

        {/* TEARDROP TERMINAL ON 'y' DESCENDER */}
        <circle
          cx="65.5"
          cy="213"
          r="6.5"
          fill="url(#sysWineLetter)"
          stroke="#e5ba55"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />

        {/* SECOND CAPITAL 'S' */}
        <path
          d="M 132 126 
             C 132 116, 140 109, 156 109 
             C 171 109, 180 117, 180 127 
             C 180 137, 172 143, 160 148 
             C 146 153, 135 161, 135 174 
             C 135 190, 148 200, 167 200 
             C 182 200, 191 192, 194 186 
             L 192 184 
             C 189 189, 181 195, 168 195 
             C 152 195, 142 186, 142 174 
             C 142 163, 151 156, 165 151 
             C 181 145, 188 137, 188 125 
             C 188 112, 176 105, 158 105 
             C 140 105, 130 114, 130 126 
             Z"
          fill="url(#sysWineLetter)"
          stroke="#e5ba55"
          strokeWidth="0.8"
          strokeOpacity="0.6"
        />
      </g>
    </svg>
  );

  // If variant is leather badge (matching the user's uploaded photo exactly)
  if (variant === 'badge' || variant === 'leather') {
    return (
      <div
        className={`relative ${currentSize.box} rounded-2xl overflow-hidden shadow-2xl border border-amber-400/40 bg-gradient-to-b from-[#a47a54] via-[#8c6341] to-[#5a3c23] p-1.5 flex items-center justify-center select-none ${className}`}
      >
        {renderSvgEmblem(false)}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Luxury Brand Emblem Box with leather/gold aesthetic */}
      <div
        className={`relative ${currentSize.box} rounded-xl overflow-hidden shrink-0 shadow-lg border border-amber-400/40 bg-gradient-to-br from-[#9b724e] via-[#7c5535] to-[#452b18] flex items-center justify-center p-0.5 group`}
      >
        {renderSvgEmblem(false)}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none" />
      </div>

      {/* Brand Text Platform */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-white font-['Poppins'] ${currentSize.text} bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent`}
            >
              SYS Streamer
            </span>
          </div>
          <span className={`text-white/50 font-medium ${currentSize.subtext}`}>
            by SYS Agency
          </span>
        </div>
      )}
    </div>
  );
};

