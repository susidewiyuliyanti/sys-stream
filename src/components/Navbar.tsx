import React, { useState } from 'react';
import { GameTab, BackgroundMode, PlayerScore, UserProfile } from '../types';
import { useAppConfig } from '../context/AppConfigContext';
import { CountryLanguageSelectorModal } from './CountryLanguageSelectorModal';
import { SoundThemeSelectorModal } from './SoundThemeSelectorModal';
import { SysLogo } from './SysLogo';
import { MemberBadge } from './MemberBadge';
import { isOwnerUser, isMemberActive } from '../utils/memberBadge';
import {
  Banknote as BanknoteIcon,
  RotateCw,
  Trophy,
  Volume2,
  VolumeX,
  Crown,
  LogOut,
  Users,
  Globe,
  Music,
  Gift,
  Wallet,
  Menu,
  X,
  Monitor,
  Check,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  activeTab: GameTab;
  onSelectTab: (tab: GameTab) => void;
  bgMode: BackgroundMode;
  onChangeBgMode: (mode: BackgroundMode) => void;
  onOpenLeaderboard: () => void;
  activePrizeNominal: number;
  players: PlayerScore[];
  isMuted: boolean;
  onToggleMute: () => void;
  userProfile?: UserProfile | null;
  saldo?: number;
  onLogout?: () => void;
  onOpenVipManager?: () => void;
  onOpenProfile?: () => void;
  onOpenReferral?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  bgMode,
  onChangeBgMode,
  onOpenLeaderboard,
  activePrizeNominal,
  players,
  isMuted,
  onToggleMute,
  userProfile,
  saldo,
  onLogout,
  onOpenVipManager,
  onOpenProfile,
  onOpenReferral,
}) => {
  const { country, t, soundTheme, availableSoundThemes, formatCurrency } = useAppConfig();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [showCountryModal, setShowCountryModal] = useState<boolean>(false);
  const [showSoundModal, setShowSoundModal] = useState<boolean>(false);

  const currentThemeInfo = availableSoundThemes.find((theme) => theme.id === soundTheme);

  const handleSelectGame = (tab: GameTab) => {
    onSelectTab(tab);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* COMPACT & CLEAN STREAMER HEADER */}
      <header className="w-full bg-black/90 backdrop-blur-xl border-b border-white/10 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 select-none z-30">
        {/* Brand & Live Streamer Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <SysLogo size="md" showText={false} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-black tracking-wide bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent font-['Poppins']">
                SYS Streamer
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-black animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-white/50 hidden md:block">
              All Reserve @SYS Agency • OBS & TikTok Live
            </p>
          </div>
        </div>

        {/* Quick Game Switcher Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 py-1">
          <button
            id="nav-tab-tebak-seri"
            onClick={() => onSelectTab('tebak-seri')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'tebak-seri'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30 ring-1 ring-cyan-300/40'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <BanknoteIcon className="w-3.5 h-3.5" />
            <span>{t('tab_tebak_seri')}</span>
          </button>

          <button
            id="nav-tab-spinner-roda"
            onClick={() => onSelectTab('spinner-roda')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'spinner-roda'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md shadow-yellow-500/30 font-extrabold ring-1 ring-yellow-300/40'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{t('tab_spinner_roda')}</span>
          </button>

          <button
            id="nav-tab-blind-box"
            onClick={() => onSelectTab('blind-box-deposit')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'blind-box-deposit'
                ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/30 font-black ring-2 ring-amber-300'
                : 'bg-gradient-to-r from-amber-500/15 to-yellow-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-yellow-300" />
            <span>Blind Box 3D</span>
            <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
              NEW
            </span>
          </button>

          <button
            id="nav-tab-leaderboard"
            onClick={() => onSelectTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md shadow-yellow-500/30 font-extrabold ring-1 ring-yellow-300/40'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('leaderboard')}</span>
          </button>
        </nav>

        {/* RIGHT AREA: Saldo Quick Glance + SINGLE CONSOLIDATED MENU BUTTON */}
        <div className="flex items-center gap-2">
          {/* Quick Wallet Pill */}
          {userProfile && (
            <button
              type="button"
              id="btn-header-wallet"
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold transition-all hover:scale-105 cursor-pointer"
              title="Host Wallet Balance • Click to Open Wallet"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400" />
              <span>{formatCurrency(saldo !== undefined ? saldo : (userProfile.saldo ?? userProfile.walletBalance ?? 0))}</span>
            </button>
          )}

          {/* Quick Audio Mute Toggle (Always accessible with 1 tap) */}
          <button
            type="button"
            id="btn-header-mute"
            onClick={onToggleMute}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isMuted ? 'Audio Muted (Click to unmute)' : 'Audio Active'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* THE 1 MASTER MENU BUTTON */}
          <button
            type="button"
            id="btn-main-streamer-menu"
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
            title="Open Streamer Menu & Settings"
          >
            <Menu className="w-4 h-4 text-slate-950 group-hover:rotate-90 transition-transform" />
            <span className="font-extrabold tracking-wide">Menu</span>
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt=""
                className="w-4 h-4 rounded-full object-cover ring-1 ring-black/40"
                referrerPolicy="no-referrer"
              />
            ) : isOwnerUser(userProfile?.email) ? (
              <Crown className="w-3.5 h-3.5 text-slate-950" />
            ) : null}
          </button>
        </div>
      </header>

      {/* CONSOLIDATED MASTER MENU MODAL / DRAWER */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
          {/* Backdrop Click */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Slide-over Menu Container */}
          <div className="relative w-full sm:max-w-md h-full bg-neutral-950/95 border-l border-amber-500/30 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 font-['Poppins']">
            {/* Top Menu Header */}
            <div>
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/30">
                <div className="flex items-center gap-2.5">
                  <SysLogo size="sm" showText={false} />
                  <div>
                    <h3 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                      <span>{t('streamer_menu')}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600 text-white font-mono font-bold">
                        LIVE
                      </span>
                    </h3>
                    <p className="text-[10px] text-white/50">{t('unified_settings')}</p>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-close-master-menu"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card in Menu */}
              {userProfile && (
                <div className="p-4 m-3 rounded-2xl bg-neutral-900/90 border border-amber-500/30 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {userProfile.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt={userProfile.displayName || 'Avatar'}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-400 shadow-md"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-amber-400 text-amber-300 font-black flex items-center justify-center text-sm shadow-md">
                          {userProfile.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{userProfile.displayName || 'Host Streamer'}</span>
                          <MemberBadge userProfile={userProfile} size="xs" />
                        </div>
                        <div className="text-[10px] text-white/50 font-mono truncate max-w-[180px]">
                          {userProfile.email}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      id="btn-menu-open-profile"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenProfile?.();
                      }}
                      className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all cursor-pointer"
                    >
                      {t('open_profile')}
                    </button>
                  </div>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px] text-white/70">{t('wallet_balance')}:</span>
                    </div>
                    <span className="font-mono font-black text-sm text-emerald-400">
                      {formatCurrency(saldo !== undefined ? saldo : (userProfile.saldo ?? userProfile.walletBalance ?? 0))}
                    </span>
                  </div>
                </div>
              )}

              {/* SECTION 1: 🎮 PILIHAN GAME LIVE STREAM */}
              <div className="px-4 py-2 space-y-1.5">
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider px-1">
                  {t('stream_game_selection')}
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectGame('tebak-seri')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'tebak-seri'
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                        <BanknoteIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{t('tab_tebak_seri')}</div>
                        <div className="text-[10px] text-white/50">{t('guess_banknote_desc')}</div>
                      </div>
                    </div>
                    {activeTab === 'tebak-seri' && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectGame('spinner-roda')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'spinner-roda'
                        ? 'bg-yellow-950/60 border-yellow-400 text-white shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-300">
                        <RotateCw className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{t('tab_spinner_roda')}</div>
                        <div className="text-[10px] text-white/50">{t('viewer_wheel_desc')}</div>
                      </div>
                    </div>
                    {activeTab === 'spinner-roda' && <Check className="w-4 h-4 text-yellow-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectGame('blind-box-deposit')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'blind-box-deposit'
                        ? 'bg-amber-950/80 border-amber-400 text-white shadow-md shadow-amber-500/20 ring-1 ring-amber-400/50'
                        : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-amber-500/30 text-amber-300">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                          <span>{t('blind_box_game')}</span>
                          <span className="px-1.5 py-0.2 rounded bg-red-600 text-white text-[9px] font-bold">
                            NEW
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-200/70">
                          🥈 1M (3 Silver) • 💎 2.5M (5 Plat) • 👑 5M (10 Gold)
                        </div>
                      </div>
                    </div>
                    {activeTab === 'blind-box-deposit' && <Check className="w-4 h-4 text-amber-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectGame('leaderboard')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === 'leaderboard'
                        ? 'bg-yellow-950/60 border-yellow-400 text-white shadow-sm'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-300">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">{t('leaderboard')}</div>
                        <div className="text-[10px] text-white/50">{players.length} {t('winners_recorded')}</div>
                      </div>
                    </div>
                    {activeTab === 'leaderboard' && <Check className="w-4 h-4 text-yellow-400" />}
                  </button>
                </div>
              </div>

              {/* SECTION 2: 🎬 PENGATURAN OBS & TAMPILAN LAYAR */}
              <div className="px-4 py-2 space-y-1.5">
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider px-1">
                  {t('display_obs_modes')}
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => onChangeBgMode('transparent')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      bgMode === 'transparent'
                        ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                    }`}
                  >
                    <div className="text-xs font-bold">{t('mode_transparent')}</div>
                    <div className="text-[9px] opacity-80">OBS Overlay</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeBgMode('chroma-green')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      bgMode === 'chroma-green'
                        ? 'bg-[#00FF00] text-black font-black border-[#00FF00] shadow'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                    }`}
                  >
                    <div className="text-xs font-bold">{t('mode_green_screen')}</div>
                    <div className="text-[9px] opacity-80">#00FF00</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeBgMode('studio-dark')}
                    className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                      bgMode === 'studio-dark'
                        ? 'bg-neutral-800 text-white font-black border-white/40 shadow'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 border-white/10'
                    }`}
                  >
                    <div className="text-xs font-bold">{t('mode_studio_dark')}</div>
                    <div className="text-[9px] opacity-80">Dark</div>
                  </button>
                </div>
              </div>

              {/* SECTION 3: 🔊 AUDIO & SOUND THEME & BAHASA */}
              <div className="px-4 py-2 space-y-1.5">
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider px-1">
                  {t('audio_language_section')}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {/* Sound Theme Selector */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowSoundModal(true);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-amber-500/15 border border-white/10 hover:border-amber-500/30 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-0.5">
                      <span className="flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5" />
                        <span>{t('sound_theme_label')}</span>
                      </span>
                      <span>{currentThemeInfo?.icon}</span>
                    </div>
                    <div className="text-[11px] text-white font-medium">{currentThemeInfo?.name}</div>
                  </button>

                  {/* Country & Currency Selector */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowCountryModal(true);
                    }}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500/15 border border-white/10 hover:border-cyan-500/30 text-left transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-cyan-300 mb-0.5">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{t('currency_lang_label')}</span>
                      </span>
                      <span>{country.flag}</span>
                    </div>
                    <div className="text-[11px] text-white font-medium">
                      {country.currencyCode} ({country.name})
                    </div>
                  </button>
                </div>
              </div>

              {/* SECTION 4: 👑 LAYANAN MEMBER & MANAJEMEN */}
              <div className="px-4 py-2 space-y-1.5">
                <div className="text-[10px] font-bold text-white/50 uppercase tracking-wider px-1">
                  {t('services_management')}
                </div>

                <div className="space-y-1">
                  {onOpenReferral && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenReferral();
                      }}
                      className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-amber-400" />
                        <span>{t('referral_rewards')}</span>
                      </span>
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                        Bonus
                      </span>
                    </button>
                  )}

                  {onOpenVipManager && isOwnerUser(userProfile?.email) && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenVipManager();
                      }}
                      className="w-full p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 border border-amber-500/40 flex items-center justify-between text-xs font-black text-amber-300 transition-all cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>{t('manage_vip')}</span>
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                        Owner
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Footer Action (Logout / Ganti Akun) */}
            <div className="p-4 border-t border-white/10 bg-black/40">
              {onLogout && (
                <button
                  type="button"
                  id="btn-menu-logout"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>{t('logout')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Country & Language Selector Modal */}
      <CountryLanguageSelectorModal
        isOpen={showCountryModal}
        onClose={() => setShowCountryModal(false)}
      />

      {/* Sound Theme Selector Modal */}
      <SoundThemeSelectorModal
        isOpen={showSoundModal}
        onClose={() => setShowSoundModal(false)}
      />
    </>
  );
};
