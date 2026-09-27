import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Gift, Crown } from 'lucide-react';

interface BlindBox3DSceneProps {
  isOpening?: boolean;
  isOpened?: boolean;
  prizeAmount?: number | null;
  isJackpot?: boolean;
  onBoxClick?: () => void;
  canClick?: boolean;
  tier?: 'BRONZE' | 'SILVER' | 'PLATINUM' | 'GOLD';
  boxCount?: number;
  boxLabel?: string;
}

export const BlindBox3DScene: React.FC<BlindBox3DSceneProps> = ({
  isOpening = false,
  isOpened = false,
  prizeAmount = null,
  isJackpot = false,
  onBoxClick,
  canClick = true,
  tier = 'BRONZE',
  boxCount = 1,
  boxLabel,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isOpening || isOpened) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x: x * 30, y: -y * 30 });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  // Tier specific visual themes
  const tierConfig = {
    GOLD: {
      lidBg: 'from-yellow-200 via-amber-400 to-yellow-600',
      lidBorder: 'border-yellow-200',
      ribbonBg: 'from-red-600 via-rose-500 to-red-600',
      bodyBorder: 'border-amber-400/80',
      glow: 'bg-amber-400/40',
      cornerBorder: 'border-amber-400',
      textGrad: 'from-yellow-100 via-amber-300 to-yellow-500',
      badgeBg: 'from-amber-500/30 to-yellow-600/30 border-amber-300/60',
      label: boxLabel || `${boxCount} Box Emas (Gold)`,
      tagColor: 'text-amber-300',
    },
    PLATINUM: {
      lidBg: 'from-cyan-200 via-teal-400 to-cyan-700',
      lidBorder: 'border-cyan-200',
      ribbonBg: 'from-purple-600 via-fuchsia-500 to-purple-600',
      bodyBorder: 'border-cyan-400/80',
      glow: 'bg-cyan-400/40',
      cornerBorder: 'border-cyan-400',
      textGrad: 'from-cyan-100 via-teal-300 to-cyan-500',
      badgeBg: 'from-cyan-500/30 to-teal-600/30 border-cyan-300/60',
      label: boxLabel || `${boxCount} Box Platinum`,
      tagColor: 'text-cyan-300',
    },
    SILVER: {
      lidBg: 'from-slate-200 via-slate-400 to-slate-600',
      lidBorder: 'border-slate-200',
      ribbonBg: 'from-blue-600 via-indigo-500 to-blue-600',
      bodyBorder: 'border-slate-300/80',
      glow: 'bg-slate-300/30',
      cornerBorder: 'border-slate-300',
      textGrad: 'from-slate-100 via-slate-300 to-slate-400',
      badgeBg: 'from-slate-500/30 to-slate-600/30 border-slate-300/60',
      label: boxLabel || `${boxCount} Box Silver`,
      tagColor: 'text-slate-200',
    },
    BRONZE: {
      lidBg: 'from-amber-500 via-amber-600 to-yellow-700',
      lidBorder: 'border-amber-300',
      ribbonBg: 'from-red-600 via-rose-500 to-red-600',
      bodyBorder: 'border-amber-500/60',
      glow: 'bg-amber-500/30',
      cornerBorder: 'border-amber-400',
      textGrad: 'from-yellow-200 via-amber-300 to-yellow-500',
      badgeBg: 'from-amber-500/30 to-yellow-600/30 border-amber-300/60',
      label: boxLabel || `${boxCount} Box Regular`,
      tagColor: 'text-amber-300',
    },
  }[tier] || {
    lidBg: 'from-amber-300 via-amber-500 to-yellow-600',
    lidBorder: 'border-amber-200',
    ribbonBg: 'from-red-600 via-rose-500 to-red-600',
    bodyBorder: 'border-amber-400/60',
    glow: 'bg-amber-400/40',
    cornerBorder: 'border-amber-400',
    textGrad: 'from-yellow-200 via-amber-300 to-yellow-500',
    badgeBg: 'from-amber-500/30 to-yellow-600/30 border-amber-300/60',
    label: boxLabel || 'Blind Box 3D',
    tagColor: 'text-amber-300',
  };

  return (
    <div
      id="blind-box-3d-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={canClick && !isOpening && !isOpened ? onBoxClick : undefined}
      className={`relative w-72 h-72 sm:w-80 sm:h-80 mx-auto flex items-center justify-center select-none ${
        canClick && !isOpening && !isOpened ? 'cursor-pointer' : ''
      }`}
      style={{ perspective: '1100px' }}
    >
      {/* Ambient Neon Lighting Ring */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
          isJackpot && isOpened
            ? 'bg-amber-400/40 scale-125'
            : isOpening
            ? 'bg-yellow-400/30 scale-110'
            : 'bg-cyan-500/20 group-hover:bg-amber-500/25'
        }`}
      />

      {/* Cyber Floor Grid Reflection */}
      <div
        className="absolute -bottom-8 w-60 h-20 rounded-[50%] bg-gradient-to-t from-transparent via-amber-500/10 to-transparent blur-md"
        style={{
          transform: 'rotateX(75deg)',
          boxShadow: isOpened
            ? '0 0 60px 20px rgba(245, 158, 11, 0.4)'
            : '0 0 40px 10px rgba(6, 182, 212, 0.2)',
        }}
      />

      {/* Floating 3D Box Assembly */}
      <motion.div
        animate={
          isOpening
            ? {
                rotateY: [0, -15, 15, -20, 20, 0, 360],
                rotateX: [15, 25, 10, 30, 15],
                scale: [1, 1.08, 1.15, 1.2, 1.05],
                y: [-5, -15, 5, -25, -10],
              }
            : isOpened
            ? {
                rotateY: 0,
                rotateX: 12,
                scale: 1.05,
                y: -10,
              }
            : {
                rotateY: mousePos.x,
                rotateX: 18 + mousePos.y,
                y: [0, -10, 0],
              }
        }
        transition={
          isOpening
            ? { duration: 3, ease: 'easeInOut' }
            : isOpened
            ? { duration: 0.5 }
            : {
                y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                rotateY: { duration: 0.2 },
                rotateX: { duration: 0.2 },
              }
        }
        className="relative w-44 h-44 sm:w-52 sm:h-52 transform-gpu"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {/* === 3D LID (Opens upwards when opened) === */}
        <motion.div
          animate={
            isOpened
              ? {
                  y: -110,
                  rotateX: -115,
                  rotateZ: 15,
                  opacity: [1, 0.9, 0.8],
                }
              : isOpening
              ? {
                  y: [0, -10, -5, -25, -70],
                  rotateX: [0, -15, 5, -35, -90],
                }
              : { y: 0, rotateX: 0 }
          }
          transition={{ duration: isOpened ? 0.8 : 3, ease: 'easeOut' }}
          className="absolute inset-x-0 -top-3 h-12 rounded-t-xl transform-gpu z-20"
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'bottom center',
          }}
        >
          {/* Lid Top Face */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${tierConfig.lidBg} rounded-t-xl border-2 ${tierConfig.lidBorder} shadow-xl flex items-center justify-center overflow-hidden`}
            style={{
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.4), 0 0 25px rgba(245, 158, 11, 0.6)',
            }}
          >
            {/* Ribbon Cross */}
            <div className={`absolute inset-y-0 w-6 bg-gradient-to-r ${tierConfig.ribbonBg} shadow-md`} />
            <div className={`absolute inset-x-0 h-6 bg-gradient-to-b ${tierConfig.ribbonBg} shadow-md`} />
            <Crown className="w-8 h-8 text-yellow-100 z-10 drop-shadow-md" />
          </div>
        </motion.div>

        {/* === 3D CUBE BASE BODY === */}
        <div
          className={`absolute inset-0 rounded-2xl border ${tierConfig.bodyBorder} shadow-2xl overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-black transform-gpu`}
          style={{
            boxShadow:
              'inset 0 0 35px rgba(245,158,11,0.25), 0 20px 40px -10px rgba(0,0,0,0.8), 0 0 30px rgba(245, 158, 11, 0.3)',
          }}
        >
          {/* Decorative Corner Brackets */}
          <div className={`absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 ${tierConfig.cornerBorder}`} />
          <div className={`absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 ${tierConfig.cornerBorder}`} />
          <div className={`absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 ${tierConfig.cornerBorder}`} />
          <div className={`absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 ${tierConfig.cornerBorder}`} />

          {/* Ribbon on body */}
          <div className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-6 bg-gradient-to-r ${tierConfig.ribbonBg} opacity-90 shadow-lg`} />
          <div className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-gradient-to-b ${tierConfig.ribbonBg} opacity-90 shadow-lg`} />

          {/* Center Emblem: Mystery Glowing Question Mark or Jackpot Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${tierConfig.badgeBg} backdrop-blur-sm flex items-center justify-center shadow-inner`}>
              <span className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-b ${tierConfig.textGrad} drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)]`}>
                ?
              </span>
              <Gift className={`absolute -top-1 -right-1 w-5 h-5 ${tierConfig.tagColor} animate-pulse`} />
            </div>

            <span className={`mt-2 text-[10px] font-black uppercase tracking-widest ${tierConfig.tagColor} drop-shadow`}>
              {tierConfig.label}
            </span>
          </div>

          {/* Cyber Lines Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
        </div>

        {/* === PRIZE EMERGENCE EFFECT (When Opened) === */}
        {isOpened && prizeAmount !== null && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.4 }}
            animate={{ opacity: 1, y: -90, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
            className="absolute -inset-x-6 -top-12 z-30 flex flex-col items-center justify-center pointer-events-none"
          >
            <div
              className={`p-4 rounded-2xl border-2 text-center backdrop-blur-md shadow-2xl ${
                isJackpot
                  ? 'bg-gradient-to-b from-amber-500/90 via-yellow-600/95 to-amber-700/95 border-yellow-200 text-slate-950 shadow-yellow-500/50'
                  : 'bg-neutral-900/95 border-amber-400/80 text-white shadow-amber-500/30'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {isJackpot ? (
                  <>
                    <Crown className="w-5 h-5 text-yellow-200 animate-bounce" />
                    <span className="text-xs font-black uppercase tracking-wider text-yellow-100">
                      MEGA JACKPOT!
                    </span>
                    <Crown className="w-5 h-5 text-yellow-200 animate-bounce" />
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                      Daily Reward
                    </span>
                  </>
                )}
              </div>

              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white drop-shadow-md">
                +Rp {prizeAmount.toLocaleString('id-ID')}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
