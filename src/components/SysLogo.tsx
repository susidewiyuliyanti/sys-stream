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
  variant = 'full',
}) => {
  // Dimension mapping keeps the complete emblem visible without clipping
  const sizeMap = {
    xs: { box: 'w-7 h-9', text: 'text-xs', subtext: 'text-[8px]' },
    sm: { box: 'w-9 h-11', text: 'text-sm', subtext: 'text-[9px]' },
    md: { box: 'w-11 h-14', text: 'text-base', subtext: 'text-[10px]' },
    lg: { box: 'w-16 h-20', text: 'text-xl', subtext: 'text-xs' },
    xl: { box: 'w-32 sm:w-36 h-40 sm:h-46', text: 'text-2xl', subtext: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  // Pure SVG faithful recreation of the luxury embossed leather "SyS" brand mark
  const renderSvgEmblem = (isFullCard = false) => (
    <svg
      viewBox="0 0 240 340"
      className="w-full h-full select-none object-contain"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Luxury Saddle Leather Gradient */}
        <linearGradient id="sysLeatherSurface" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b68658" />
          <stop offset="25%" stopColor="#a37448" />
          <stop offset="60%" stopColor="#8c5f35" />
          <stop offset="100%" stopColor="#6e4521" />
        </linearGradient>

        {/* Metallic Foil Gold for Monogram & Lettering */}
        <linearGradient id="sysGoldFoil" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8d2" />
          <stop offset="20%" stopColor="#f7dc8a" />
          <stop offset="45%" stopColor="#d8a846" />
          <stop offset="70%" stopColor="#efcd74" />
          <stop offset="90%" stopColor="#b28028" />
          <stop offset="100%" stopColor="#7e5313" />
        </linearGradient>

        {/* Rich Embossed Gold-Burgundy Relief for "SyS" */}
        <linearGradient id="sysEmbossRelief" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fbe8a6" />
          <stop offset="18%" stopColor="#d9a544" />
          <stop offset="55%" stopColor="#7a2a35" />
          <stop offset="85%" stopColor="#4c141d" />
          <stop offset="100%" stopColor="#2a070e" />
        </linearGradient>

        {/* Letter Bevel Gold Highlight Stroke */}
        <linearGradient id="sysLetterRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#f3d078" stopOpacity="0.8" />
          <stop offset="75%" stopColor="#bf8f34" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#613b0c" stopOpacity="0.4" />
        </linearGradient>

        {/* Realistic Deboss & Drop Shadow Filter */}
        <filter id="sysDeboss" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#120603" floodOpacity="0.8" />
          <feDropShadow dx="0" dy="-0.8" stdDeviation="0.8" floodColor="#ffe9b5" floodOpacity="0.4" />
        </filter>

        {/* Knot Glow & Depth Filter */}
        <filter id="knotGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.8" floodColor="#180702" floodOpacity="0.75" />
          <feDropShadow dx="0" dy="-0.5" stdDeviation="0.5" floodColor="#fff5c0" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Leather Background Plaque (when rendered inside full SVG card) */}
      {isFullCard && (
        <>
          <rect
            width="240"
            height="305"
            rx="18"
            fill="url(#sysLeatherSurface)"
          />
          {/* Outer Gold Border Rim */}
          <rect
            x="4"
            y="4"
            width="232"
            height="297"
            rx="15"
            fill="none"
            stroke="url(#sysGoldFoil)"
            strokeWidth="1.2"
            strokeOpacity="0.6"
          />
          {/* Handcrafted Saddle Leather Stitched Accent */}
          <rect
            x="8"
            y="8"
            width="224"
            height="289"
            rx="12"
            fill="none"
            stroke="#e6ba7c"
            strokeWidth="1"
            strokeDasharray="4 3"
            strokeOpacity="0.5"
          />
        </>
      )}

      {/* ========================================================
          1. GOLD GEOMETRIC DIAMOND KNOT MONOGRAM (TOP CREST)
          Centered precisely at X=120, Y=78
         ======================================================== */}
      <g transform="translate(120, 78) scale(1.18)" filter="url(#knotGlow)">
        {/* Outer Rhombus Frame */}
        <path
          d="M 0 -32 L 32 0 L 0 32 L -32 0 Z"
          stroke="url(#sysGoldFoil)"
          strokeWidth="3.4"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Inner Rhombus Contour */}
        <path
          d="M 0 -22 L 22 0 L 0 22 L -22 0 Z"
          stroke="url(#sysGoldFoil)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Intertwined Geometric Celtic Ribbon Loops */}
        {/* Top-Right Loop */}
        <path
          d="M -6 -12 L 0 -18 L 12 -6 L 6 0 L 0 -6 L -6 0"
          stroke="url(#sysGoldFoil)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Bottom-Right Loop */}
        <path
          d="M 0 6 L 6 0 L 18 12 L 0 30 L -9 21"
          stroke="url(#sysGoldFoil)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Left Loop */}
        <path
          d="M 0 -6 L -12 -18 L -30 0 L -18 12 L -6 0"
          stroke="url(#sysGoldFoil)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Center Intersecting Accent */}
        <path
          d="M -7 -7 L 7 7 M -7 7 L 7 -7"
          stroke="url(#sysGoldFoil)"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="0" cy="0" r="2.4" fill="url(#sysGoldFoil)" />
      </g>

      {/* ========================================================
          2. LUXURY EMBOSSED SERIF TYPOGRAPHY: "SyS"
          Centered with X=-19.5, Y=-56 for perfect optical balance
         ======================================================== */}
      <g filter="url(#sysDeboss)" transform="translate(-19.5, -56)">
        {/* 2A. FIRST CAPITAL SERIF 'S' */}
        <path
          d="M 38 214 
             C 38 200, 48 191, 68 191 
             C 86 191, 98 201, 98 215 
             C 98 228, 88 235, 73 241 
             C 56 247, 42 257, 42 274 
             C 42 293, 58 306, 82 306 
             C 101 306, 112 296, 116 288 
             L 113 286 
             C 109 292, 99 300, 83 300 
             C 63 300, 50 289, 50 274 
             C 50 260, 62 251, 79 245 
             C 99 237, 108 227, 108 212 
             C 108 195, 93 186, 70 186 
             C 47 186, 35 198, 35 214 
             Z"
          fill="url(#sysEmbossRelief)"
          stroke="url(#sysLetterRim)"
          strokeWidth="1.4"
        />

        {/* 2B. MIDDLE LOWERCASE 'y' WITH DROPLET TERMINAL */}
        <path
          d="M 116 205 
             L 126 205 
             L 140 248 
             L 153 205 
             L 164 205 
             L 144 266 
             C 137 285, 129 304, 119 318 
             C 111 329, 101 336, 90 336 
             C 82 336, 76 331, 76 323 
             C 76 314, 84 308, 93 308 
             C 102 308, 107 313, 108 318 
             C 114 310, 121 296, 126 279 
             L 116 205 
             Z"
          fill="url(#sysEmbossRelief)"
          stroke="url(#sysLetterRim)"
          strokeWidth="1.4"
        />

        {/* TEARDROP BEAD/DOT ON THE 'y' DESCENDER */}
        <circle
          cx="84"
          cy="323"
          r="8"
          fill="url(#sysEmbossRelief)"
          stroke="url(#sysLetterRim)"
          strokeWidth="1.4"
        />

        {/* 2C. SECOND CAPITAL SERIF 'S' */}
        <path
          d="M 166 214 
             C 166 200, 176 191, 196 191 
             C 214 191, 226 201, 226 215 
             C 226 228, 216 235, 201 241 
             C 184 247, 170 257, 170 274 
             C 170 293, 186 306, 210 306 
             C 229 306, 240 296, 244 288 
             L 241 286 
             C 237 292, 227 300, 211 300 
             C 191 300, 178 289, 178 274 
             C 178 260, 190 251, 207 245 
             C 227 237, 236 227, 236 212 
             C 236 195, 221 186, 198 186 
             C 175 186, 163 198, 163 214 
             Z"
          fill="url(#sysEmbossRelief)"
          stroke="url(#sysLetterRim)"
          strokeWidth="1.4"
        />
      </g>
    </svg>
  );

  // Variant: Full Leather Card (Luxury embossed leather badge)
  if (variant === 'leather' || variant === 'badge') {
    return (
      <div
        className={`relative ${currentSize.box} rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-500/50 bg-gradient-to-b from-[#a87850] via-[#91643c] to-[#69421f] p-2 flex items-center justify-center select-none transition-transform hover:scale-[1.02] ${className}`}
        style={{
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.7), inset 0 1px 2px rgba(255,235,180,0.35), inset 0 -2px 4px rgba(0,0,0,0.5)',
        }}
      >
        {/* Subtle Stitched Border Inside Card */}
        <div className="absolute inset-1.5 rounded-xl border border-dashed border-amber-300/30 pointer-events-none" />
        {renderSvgEmblem(false)}
        {/* Subtle leather sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-amber-200/15 pointer-events-none" />
      </div>
    );
  }

  // Variant: Icon only
  if (variant === 'icon-only') {
    return (
      <div
        className={`relative ${currentSize.box} rounded-xl overflow-hidden shadow-lg border border-amber-400/50 bg-gradient-to-b from-[#9d6f46] via-[#855932] to-[#593719] p-1 flex items-center justify-center shrink-0 select-none ${className}`}
      >
        {renderSvgEmblem(false)}
      </div>
    );
  }

  // Variant: Full (Brand Box + Title Text)
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Luxury Leather Brand Plaque */}
      <div
        className={`relative ${currentSize.box} rounded-xl overflow-hidden shrink-0 shadow-xl border border-amber-400/60 bg-gradient-to-b from-[#a17349] via-[#875b33] to-[#573517] p-1 flex items-center justify-center group`}
        style={{
          boxShadow: '0 8px 20px -4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,230,170,0.3)',
        }}
      >
        {renderSvgEmblem(false)}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-amber-300/5 to-white/10 pointer-events-none" />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-tight text-white font-['Poppins'] ${currentSize.text} bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 bg-clip-text text-transparent drop-shadow-sm`}
            >
              SYS Streamer
            </span>
          </div>
          <span className={`text-amber-200/70 font-medium tracking-wide ${currentSize.subtext}`}>
            by SYS Agency
          </span>
        </div>
      )}
    </div>
  );
};
