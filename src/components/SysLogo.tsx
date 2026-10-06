import React from 'react';

interface SysLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textColor?: string;
}

export const SysLogo: React.FC<SysLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  textColor = 'text-white',
}) => {
  const dimensions = {
    sm: { icon: 30, text: 'text-sm', sub: 'text-[8px]' },
    md: { icon: 40, text: 'text-[11px] sm:text-base', sub: 'text-[6px] sm:text-[9px]' },
    lg: { icon: 52, text: 'text-xl', sub: 'text-[10px]' },
    xl: { icon: 76, text: 'text-3xl', sub: 'text-xs' },
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2.5 select-none ${className}`}>
      <img
        src="/sys-streamer-mark.svg"
        width={dimensions.icon}
        height={dimensions.icon}
        alt="SYS STREAMER"
        className="shrink-0 drop-shadow-[0_0_12px_rgba(245,169,0,0.28)] transition-transform duration-200 hover:scale-105"
      />

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black uppercase tracking-[0.12em] ${dimensions.text} ${textColor}`}
            style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}
          >
            SYS STREAMER
          </span>
          <span
            className={`mt-1 text-amber-400/90 font-semibold uppercase tracking-[0.22em] ${dimensions.sub}`}
            style={{ fontFamily: "'Space Grotesk', 'Plus Jakarta Sans', sans-serif" }}
          >
            LIVE • GAMING • CREATOR
          </span>
        </div>
      )}
    </div>
  );
};

export default SysLogo;
