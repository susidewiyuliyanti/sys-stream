import React from 'react';

interface SysLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
  textClassName?: string;
}

export const SysLogo: React.FC<SysLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-white',
  textClassName = '',
}) => {
  const dimensions = {
    sm: { icon: 28, text: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-base', sub: 'text-[10px]' },
    lg: { icon: 48, text: 'text-xl', sub: 'text-xs' },
    xl: { icon: 72, text: 'text-3xl', sub: 'text-sm' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Monogram & Crest matching the uploaded luxury emblem */}
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_2px_10px_rgba(217,119,6,0.35)] transition-transform duration-200 hover:scale-105"
      >
        <defs>
          <linearGradient id="sysGoldGradient" x1="15%" y1="10%" x2="85%" y2="90%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#eab308" />
            <stop offset="65%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>

          <linearGradient id="sysBronzeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          <filter id="sysGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#78350f" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Geometric Monogram Emblem (Interconnected diamond knot crest) */}
        <g filter="url(#sysGlow)">
          {/* Outer Diamond Rhombus Frame */}
          <path
            d="M 50 10 L 74 34 L 50 58 L 26 34 Z"
            fill="none"
            stroke="url(#sysGoldGradient)"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Intertwined Inner Geometric Labyrinth Ribbon */}
          <path
            d="M 50 18 L 66 34 L 54 46 L 46 38 L 54 30 L 46 22 L 38 30 L 46 38"
            fill="none"
            stroke="url(#sysGoldGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 50 50 L 34 34 L 46 22 L 54 30"
            fill="none"
            stroke="url(#sysGoldGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Center decorative diamond accent core */}
          <polygon points="50,30 54,34 50,38 46,34" fill="url(#sysGoldGradient)" />
        </g>

        {/* SyS Serif Typography below the crest with elongated 'y' */}
        <g filter="url(#sysGlow)">
          {/* Capital S (Left) */}
          <text
            x="20"
            y="90"
            fontFamily="'Cinzel', 'Playfair Display', 'Georgia', serif"
            fontSize="38"
            fontWeight="bold"
            fill="url(#sysGoldGradient)"
            letterSpacing="-1"
          >
            S
          </text>

          {/* Lowercase y (Center with elongated curved flourish tail) */}
          <text
            x="42"
            y="92"
            fontFamily="'Cinzel', 'Playfair Display', 'Georgia', serif"
            fontSize="36"
            fontWeight="bold"
            fontStyle="italic"
            fill="url(#sysGoldGradient)"
          >
            y
          </text>

          {/* Capital S (Right) */}
          <text
            x="64"
            y="90"
            fontFamily="'Cinzel', 'Playfair Display', 'Georgia', serif"
            fontSize="38"
            fontWeight="bold"
            fill="url(#sysGoldGradient)"
            letterSpacing="-1"
          >
            S
          </text>
        </g>
      </svg>

      {/* Brand Text: SYS STREAM */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-black tracking-wider uppercase font-serif ${dimensions.text} ${textColor} ${textClassName}`}
              style={{
                fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif",
                letterSpacing: '0.08em',
              }}
            >
              SYS STREAM
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <span className={`text-amber-500/80 font-mono tracking-widest uppercase font-semibold ${dimensions.sub}`}>
            Live Gaming Terminal
          </span>
        </div>
      )}
    </div>
  );
};
export default SysLogo;
