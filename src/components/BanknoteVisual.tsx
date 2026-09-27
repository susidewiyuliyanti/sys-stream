import React, { useState, useRef } from 'react';
import { Banknote } from '../types';

interface BanknoteVisualProps {
  banknote: Banknote;
  maskedDigits: string[];
  maskIndices: number[];
  isRevealed: boolean;
  isZoomed?: boolean;
  onToggleZoom?: () => void;
}

export const BanknoteVisual: React.FC<BanknoteVisualProps> = ({
  banknote,
  maskedDigits,
  maskIndices,
  isRevealed,
  isZoomed = false,
  onToggleZoom
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isZoomed) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Mild 3D tilt
    setTilt({
      x: -(y / (rect.height / 2)) * 12,
      y: (x / (rect.width / 2)) * 12
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onToggleZoom}
      className={`relative cursor-pointer select-none transition-transform duration-200 ease-out will-change-transform ${
        isZoomed ? 'scale-110 md:scale-125 z-40' : 'hover:scale-[1.01]'
      }`}
      style={{
        transform: isZoomed
          ? 'scale(1.15) rotateX(0deg) rotateY(0deg)'
          : `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d'
      }}
    >
      {/* 3D Banknote Canvas Card */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl border-2 border-white/20"
        style={{
          background: `linear-gradient(135deg, ${banknote.primaryColor} 0%, ${banknote.secondaryColor} 65%, #05070d 100%)`,
          boxShadow: `0 20px 45px -10px ${banknote.primaryColor}55, 0 0 35px rgba(255,255,255,0.1) inset`
        }}
      >
        {/* Holographic Security Sheen Overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay"
          style={{
            background:
              'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.7) 45%, rgba(0,255,255,0.8) 50%, rgba(255,0,255,0.8) 55%, transparent 75%)',
            backgroundSize: '200% 200%'
          }}
        />

        {/* Guilloche Security Lattice Pattern Background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M0 20 Q 10 0 20 20 T 40 20 M0 20 Q 10 40 20 20 T 40 20"
                fill="none"
                stroke={banknote.accentColor}
                strokeWidth="0.75"
              />
              <circle cx="20" cy="20" r="14" fill="none" stroke={banknote.accentColor} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#guilloche)" />
        </svg>

        {/* Vertical Hologram Foil Ribbon */}
        <div
          className="absolute top-0 bottom-0 right-28 w-10 sm:w-14 pointer-events-none flex flex-col justify-around items-center border-l border-r border-white/30"
          style={{
            background: 'linear-gradient(180deg, #ffd700 0%, #00ffff 25%, #ff00ff 50%, #ffd700 75%, #00ff66 100%)',
            opacity: 0.85,
            boxShadow: '0 0 15px rgba(0, 255, 255, 0.4)'
          }}
        >
          <span className="text-[10px] font-black tracking-widest text-black rotate-90 uppercase">
            AUTHENTIC
          </span>
          <span className="text-[11px] font-black text-black">{banknote.symbol}</span>
          <span className="text-[10px] font-black tracking-widest text-black -rotate-90 uppercase">
            SECURE
          </span>
        </div>

        {/* Banknote Content Container */}
        <div className="relative p-5 sm:p-7 flex flex-col justify-between min-h-[260px] sm:min-h-[300px]">
          {/* Header Row */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-lg border-2 border-white/40 shadow-inner"
                style={{ backgroundColor: banknote.secondaryColor }}
              >
                {banknote.symbol}
              </div>
              <div>
                <div className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/90">
                  {banknote.country} &bull; {banknote.currency}
                </div>
                <div className="text-[11px] text-white/70 font-mono tracking-wide">
                  {banknote.series}
                </div>
              </div>
            </div>

            {/* Denomination Top Right */}
            <div className="text-right">
              <div className="text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-md font-['Chakra_Petch']">
                {banknote.symbol} {banknote.denomination}
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-yellow-300">
                Official Currency
              </div>
            </div>
          </div>

          {/* Central Artwork & Watermark Figure */}
          <div className="my-3 flex items-center justify-between gap-4">
            <div className="max-w-[70%]">
              <div className="text-xs uppercase tracking-wider text-white/60 font-semibold mb-1">
                {banknote.isCrypto ? 'Virtual Token Asset' : 'Tokoh / Landmark Resmi'}
              </div>
              <div className="text-base sm:text-xl font-bold text-white drop-shadow leading-tight">
                {banknote.figureOrLandmark}
              </div>
              <div className="text-xs text-white/75 mt-1 font-mono">
                Tahun Emisi: {banknote.year} | Watermark: &quot;{banknote.watermarkText}&quot;
              </div>
            </div>

            {/* Circular Bank Seal / Emblem */}
            <div className="hidden sm:flex flex-col items-center justify-center w-20 h-20 rounded-full border border-dashed border-white/40 bg-black/20 p-2 text-center">
              <span className="text-[9px] uppercase font-bold text-white/80">BANK CENTRAL</span>
              <span className="text-xs font-black text-yellow-300">{banknote.year}</span>
              <span className="text-[8px] tracking-tighter text-white/60">GUARANTEED</span>
            </div>
          </div>

          {/* Bottom Row: Official Serial Number Banner */}
          <div className="mt-2 pt-3 border-t border-white/20 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-emerald-300 mb-1 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                NOMOR SERI RESMI BANKNOTE
              </div>
              <div className="font-mono text-sm sm:text-base font-bold text-yellow-200 tracking-wider bg-black/40 px-2.5 py-1 rounded border border-white/20">
                {banknote.prefix}
                {isRevealed
                  ? banknote.digits
                  : maskedDigits.map((char, i) => (
                      <span
                        key={i}
                        className={
                          maskIndices.includes(i)
                            ? 'text-cyan-400 underline font-black font-["Poppins"]'
                            : 'text-white'
                        }
                      >
                        {char}
                      </span>
                    ))}
              </div>
            </div>

            {/* Bottom Denomination Micro */}
            <div className="text-xs font-mono text-white/60 text-right">
              {banknote.denomination} {banknote.currency.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Zoom Hint Indicator */}
        <div className="absolute bottom-2 right-3 text-[10px] text-white/50 hidden md:block">
          {isZoomed ? 'Klik untuk mengecilkan' : 'Tekan [Z] atau klik untuk Zoom 🔍'}
        </div>
      </div>
    </div>
  );
};
