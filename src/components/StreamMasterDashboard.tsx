import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserProfile, PlayerScore, GameTab, BackgroundMode, TransactionOrder, UserActivityLog } from '../types';
import { isOwnerUser } from '../utils/memberBadge';
import { sound } from '../services/sound';
import { useAppConfig } from '../context/AppConfigContext';
import { CountryLanguageSelectorModal } from './CountryLanguageSelectorModal';
import { SysLogo } from './SysLogo';
import {
  subscribeToAllSubscriptionOrders,
  subscribeToAllUserActivities,
  logUserActivity
} from '../services/firebase';
import confetti from 'canvas-confetti';
import {
  LayoutDashboard,
  Radio,
  Gamepad2,
  BarChart3,
  Settings,
  Search,
  Users,
  MessageSquare,
  Gift,
  TrendingUp,
  Volume2,
  VolumeX,
  Play,
  Square,
  Eye,
  Crown,
  ChevronDown,
  Bell,
  Sliders,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Share2,
  Swords,
  Maximize2,
  Tv,
  LogOut,
  User,
  ShieldCheck,
  Send,
  Filter,
  ArrowUpRight,
  Clock,
  Shuffle,
  Boxes,
  HelpCircle,
  Menu,
  X,
  Globe
} from 'lucide-react';

import { TebakNomorSeri } from './TebakNomorSeri';
import { LuckyWheel } from './LuckyWheel';
import { BlindBoxDashboard } from './blindbox/BlindBoxDashboard';

export interface StreamMasterDashboardProps {
  userProfile: UserProfile | null;
  saldo: number;
  players: PlayerScore[];
  onScoreUpdate: (name: string, points: number) => void;
  onAwardPrize: (nominal: number, winnerName?: string) => void;
  onUpdatePrizeNominal: (nominal: number) => void;
  activePrizeNominal: number;
  onUpdateWalletBalance: (newBalance: number) => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenReferral: () => void;
  onOpenVipManager: () => void;
  onOpenLeaderboard: () => void;
  onSwitchToOwnerDashboard?: () => void;
}

type NavMenu = 'dashboard' | 'games' | 'settings';
type ActiveGame = 'tebak-angka' | 'roda-keberuntungan' | 'blind-box';

interface LiveChatMessage {
  id: string;
  user: string;
  avatar: string;
  text: string;
  type: 'comment' | 'gift' | 'order' | 'system';
  giftName?: string;
  giftCount?: number;
  orderProduct?: string;
  orderPrice?: number;
  time: string;
  badge?: string;
}

export const StreamMasterDashboard: React.FC<StreamMasterDashboardProps> = ({
  userProfile,
  saldo,
  players,
  onScoreUpdate,
  onAwardPrize,
  onUpdatePrizeNominal,
  activePrizeNominal,
  onUpdateWalletBalance,
  onLogout,
  onOpenProfile,
  onOpenReferral,
  onOpenVipManager,
  onOpenLeaderboard,
  onSwitchToOwnerDashboard,
}) => {
  const { t, formatCurrency, country, languageCode, allCountries } = useAppConfig();

  // Navigation State
  const [activeMenu, setActiveMenu] = useState<NavMenu>('dashboard');
  const [activeGame, setActiveGame] = useState<ActiveGame>('tebak-angka');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(false);

  // Live Stream Status
  const [isLive, setIsLive] = useState<boolean>(true);
  const [liveDuration, setLiveDuration] = useState<number>(3720); // 1h 02m
  const [platform, setPlatform] = useState<'tiktok' | 'shopee'>('tiktok');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [copiedOverlayUrl, setCopiedOverlayUrl] = useState<boolean>(false);

  // Real-time Firestore Live Stats & Subscriptions
  const [realOrders, setRealOrders] = useState<TransactionOrder[]>([]);
  const [realActivities, setRealActivities] = useState<UserActivityLog[]>([]);

  useEffect(() => {
    const unsubOrders = subscribeToAllSubscriptionOrders((orders) => {
      setRealOrders(orders || []);
    });
    const unsubActs = subscribeToAllUserActivities((acts) => {
      setRealActivities(acts || []);
    });
    return () => {
      unsubOrders();
      unsubActs();
    };
  }, []);

  // Compute real counts from Firestore data
  const orderCount = realOrders.length;
  const totalLiveGmv = useMemo(() => {
    return realOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  }, [realOrders]);

  const giftCount = useMemo(() => {
    const gifts = realActivities.filter((a) => a.type === 'gift');
    return gifts.reduce((acc, g) => acc + (g.amount || 1), 0);
  }, [realActivities]);

  const commentCount = useMemo(() => {
    return realActivities.filter((a) => a.type === 'comment').length;
  }, [realActivities]);

  const viewerCount = useMemo(() => {
    return Math.max(1, players.length || 1);
  }, [players]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [chatFilter, setChatFilter] = useState<'all' | 'comment' | 'gift' | 'order'>('all');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [pinnedAnnouncement, setPinnedAnnouncement] = useState<string>('');
  const [customChatMessage, setCustomChatMessage] = useState<string>('');
  const [localHostMessages, setLocalHostMessages] = useState<LiveChatMessage[]>([]);

  // Initial announcement localized
  useEffect(() => {
    setPinnedAnnouncement(t('pinned_announcement_default'));
  }, [languageCode, country.languageCode]);

  // Real-time Live Chat Feed populated from Firestore
  const chatFeed = useMemo<LiveChatMessage[]>(() => {
    const items: LiveChatMessage[] = [];

    // Real orders from Firestore
    realOrders.forEach((o) => {
      items.push({
        id: `order-${o.id || o.orderId}`,
        user: o.userName || (o.userEmail ? `@${o.userEmail.split('@')[0]}` : '@pembeli_live'),
        avatar: 'ðŸ›ï¸',
        text: `Checkout: ${o.planName || o.paymentMethod || 'Pesanan Live'}`,
        orderProduct: o.planName || 'Produk Live',
        orderPrice: o.price || 0,
        badge: o.status === 'success' || o.status === 'active' ? 'Order Selesai' : 'Order Baru',
        time: o.createdAt ? new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'
      });
    });

    // Real activities from Firestore
    realActivities.forEach((act) => {
      items.push({
        id: `act-${act.id}`,
        user: act.userName || (act.userEmail ? `@${act.userEmail.split('@')[0]}` : '@user_live'),
        avatar: act.type === 'deposit' ? 'ðŸ’³' : act.type === 'jackpot_win' ? 'ðŸ†' : act.type === 'gift' ? 'ðŸŒ¹' : 'ðŸ’¬',
        text: act.title || 'Aktivitas streaming baru',
        type: act.type === 'gift' ? 'gift' : act.type === 'deposit' || act.type === 'order' ? 'order' : act.type === 'system' ? 'system' : 'comment',
        orderPrice: act.amount,
        giftName: act.type === 'gift' ? act.title : undefined,
        giftCount: act.type === 'gift' ? Math.max(1, Math.round((act.amount || 100) / 100)) : undefined,
        badge: act.type === 'jackpot_win' ? 'Pemenang' : act.type === 'gift' ? 'Gifter' : undefined,
        time: act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'
      });
    });

    // Add local host announcements / chat messages
    items.push(...localHostMessages);

    // If no data exists yet in Firestore, provide clean system welcome banner
    if (items.length === 0) {
      items.push({
        id: 'sys-welcome',
        user: 'SYS System',
        avatar: 'ðŸ’Ž',
        text: 'Live stream aktif! Aktivitas penonton, gift, dan order pesanan dari database Firestore akan otomatis muncul di sini.',
        type: 'system',
        badge: 'SYS Host',
        time: 'Live'
      });
    }

    return items;
  }, [realOrders, realActivities, localHostMessages]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Live Stream Duration Counter
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLive) {
      timer = setInterval(() => {
        setLiveDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLive]);

  // Auto-scroll chat feed safely: only if user is near bottom (< 100px) and never move window scroll
  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      const container = chatContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }, [chatFeed, autoScroll]);

  // Format Duration string
  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Trigger Sound Toggle
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
  };

  // Copy OBS Overlay Link
  const handleCopyOverlay = () => {
    const url = `${window.location.origin}/?overlay=1&game=${activeGame}`;
    navigator.clipboard.writeText(url);
    setCopiedOverlayUrl(true);
    setTimeout(() => setCopiedOverlayUrl(false), 2000);
  };

  // Send Custom Chat / Host announcement
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customChatMessage.trim()) return;

    const hostMsg: LiveChatMessage = {
      id: String(Date.now()),
      user: userProfile?.displayName || t('chat_host_name'),
      avatar: 'ðŸŽ™ï¸',
      text: customChatMessage.trim(),
      type: 'system',
      badge: t('chat_host_badge'),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setLocalHostMessages((prev) => [...prev, hostMsg]);
    setCustomChatMessage('');
    sound.playClick();
    try {
      logUserActivity({
        type: 'comment',
        userId: userProfile?.uid || 'host',
        userEmail: userProfile?.email || 'host@sysstreamer.com',
        userName: userProfile?.displayName ? `${userProfile.displayName} (Host)` : 'Host Streamer',
        title: customChatMessage.trim(),
        amount: 0
      });
    } catch {}
  };

  // Filtered Chat
  const filteredChat = chatFeed.filter((msg) => {
    if (chatFilter === 'comment') return msg.type === 'comment';
    if (chatFilter === 'gift') return msg.type === 'gift';
    if (chatFilter === 'order') return msg.type === 'order';
    return true;
  });

  const isOwner = userProfile ? isOwnerUser(userProfile.email) : false;

  // Find active language display name
  const currentLangObj = allCountries.find(
    (c) => c.languageCode === (languageCode || country.languageCode)
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-['Inter',sans-serif] selection:bg-[#FE2C55] selection:text-white">
      {/* 1. SIDEBAR KIRI (Fixed Desktop, Mobile Drawer) */}
      <div className="flex flex-1">
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
          />
        )}

        <aside
          className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* Top Brand Logo */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <SysLogo size="md" showText={true} />

            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-white/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Menu */}
          <div
            className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto col-scroll-contain"
            style={{ overflowAnchor: 'none', overscrollBehavior: 'contain' }}
          >
            <div className="px-3 pb-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {t('main_menu')}
            </div>

            <button
              onClick={() => {
                setActiveMenu('dashboard');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-xs transition-all cursor-pointer ${
                activeMenu === 'dashboard'
                  ? 'bg-[#FE2C55] text-white shadow-lg shadow-[#FE2C55]/25 font-bold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t('nav_dashboard')}</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('games');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-xs transition-all cursor-pointer ${
                activeMenu === 'games'
                  ? 'bg-[#FE2C55] text-white shadow-lg shadow-[#FE2C55]/25 font-bold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>{t('nav_games')}</span>
            </button>

            <button
              onClick={() => {
                setActiveMenu('settings');
                setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-xs transition-all cursor-pointer ${
                activeMenu === 'settings'
                  ? 'bg-[#FE2C55] text-white shadow-lg shadow-[#FE2C55]/25 font-bold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>{t('nav_settings')}</span>
            </button>

            {/* Quick Game Switcher in Sidebar */}
            <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {t('quick_games')}
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveGame('tebak-angka');
                  setActiveMenu('dashboard');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeGame === 'tebak-angka'
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>ðŸ”¢</span> {t('game_guess_number')}
                </span>
                {activeGame === 'tebak-angka' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE2C55]" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveGame('roda-keberuntungan');
                  setActiveMenu('dashboard');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeGame === 'roda-keberuntungan'
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>ðŸŽ¡</span> {t('game_lucky_wheel')}
                </span>
                {activeGame === 'roda-keberuntungan' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE2C55]" />
                )}
              </button>

              <button
                onClick={() => {
                  setActiveGame('blind-box');
                  setActiveMenu('dashboard');
                  setIsMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  activeGame === 'blind-box'
                    ? 'bg-white/10 text-white font-bold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>ðŸŽ</span> {t('tab_blind_box')}
                </span>
                {activeGame === 'blind-box' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE2C55]" />
                )}
              </button>
            </div>

            {/* Language Switcher Button in Sidebar */}
            <div className="pt-4">
              <button
                onClick={() => setIsLangModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer hover:border-cyan-500/40"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>{t('select_lang_btn')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/70 text-[11px]">
                  <span>{country.flag}</span>
                  <span className="uppercase font-mono">{languageCode || country.languageCode}</span>
                </div>
              </button>
            </div>

            {/* Special Owner Admin Panel shortcut if owner */}
            {isOwner && onSwitchToOwnerDashboard && (
              <div className="pt-2">
                <button
                  onClick={onSwitchToOwnerDashboard}
                  className="w-full px-3 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center gap-2 hover:border-amber-400 transition-all cursor-pointer shadow-md"
                >
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{t('btn_switch_owner')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Balance Preview in Sidebar */}
          <div className="p-4 border-t border-white/10 space-y-3 bg-white/[0.02]">
            <div
              onClick={onOpenProfile}
              className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between text-xs cursor-pointer transition-colors shadow-sm"
            >
              <span className="text-white/60">{t('wallet_balance')}</span>
              <span className="font-mono font-bold text-amber-300">
                {formatCurrency(saldo)}
              </span>
            </div>
          </div>
        </aside>

        {/* 2. HEADER ATAS & MAIN CONTENT CONTAINER */}
        <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
          {/* HEADER ATAS */}
          <header className="sticky top-0 z-30 h-16 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4">
            {/* Left: Mobile Toggle & Search Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search Bar */}
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_placeholder')}
                  className="w-full bg-white/5 hover:bg-white/[0.08] focus:bg-white/[0.08] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#FE2C55] transition-colors"
                />
              </div>
            </div>

            {/* Right: Platform, Language, Go Live Button, Profile Seller */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Language Switcher in Header */}
              <button
                onClick={() => setIsLangModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all cursor-pointer shadow-sm hover:border-cyan-500/40"
                title={t('language_selector_title')}
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-sm">{country.flag}</span>
                <span className="hidden md:inline text-white/90 text-xs">
                  {currentLangObj?.languageName || country.languageName}
                </span>
              </button>

              {/* Platform Selector Switcher */}
              <div className="hidden sm:flex items-center bg-black/60 p-1 rounded-2xl border border-white/10 text-xs">
                <button
                  onClick={() => setPlatform('tiktok')}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    platform === 'tiktok'
                      ? 'bg-[#FE2C55] text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span>ðŸŽµ</span> {t('platform_tiktok')}
                </button>
                <button
                  onClick={() => setPlatform('shopee')}
                  className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    platform === 'shopee'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <span>ðŸ›ï¸</span> {t('platform_shopee')}
                </button>
              </div>

              {/* Sound Mute Toggle */}
              <button
                onClick={toggleSound}
                className="p-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors cursor-pointer"
                title={isMuted ? t('toggle_sound_on') : t('toggle_sound_off')}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Profile Seller Dropdown Pill */}
              <div
                onClick={onOpenProfile}
                className="flex items-center gap-2 pl-2 py-1 pr-2.5 sm:pr-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-[#FE2C55] flex items-center justify-center text-white font-extrabold text-xs">
                  {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div className="hidden md:block text-left leading-none">
                  <div className="font-bold text-white text-xs truncate max-w-[120px]">
                    {userProfile?.displayName || t('streamer_host')}
                  </div>
                  <div className="text-[10px] text-white/50 mt-0.5">
                    {userProfile?.role === 'admin' ? t('super_admin') : isOwner ? t('owner_badge') : t('verified_seller')}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/50 hidden sm:block" />
              </div>
            </div>
          </header>

          {/* MAIN DASHBOARD CONTENT AREA */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
            {/* If Active Menu is NOT dashboard, show other dedicated views */}
            {activeMenu === 'games' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{t('nav_games')}</h2>
                    <p className="text-xs text-white/60">
                      {t('stream_game_selection')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveMenu('dashboard')}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
                    >
                      {t('back_to_dashboard')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveGame('tebak-angka')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeGame === 'tebak-angka'
                        ? 'bg-[#FE2C55]/20 border-[#FE2C55] text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">ðŸ”¢</div>
                    <div className="font-bold text-xs">{t('game_guess_number')}</div>
                    <div className="text-[10px] text-white/50">{t('game_guess_number_sub')}</div>
                  </button>

                  <button
                    onClick={() => setActiveGame('roda-keberuntungan')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeGame === 'roda-keberuntungan'
                        ? 'bg-[#FE2C55]/20 border-[#FE2C55] text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">ðŸŽ¡</div>
                    <div className="font-bold text-xs">{t('game_lucky_wheel')}</div>
                    <div className="text-[10px] text-white/50">{t('game_lucky_wheel_sub')}</div>
                  </button>

                  <button
                    onClick={() => setActiveGame('blind-box')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      activeGame === 'blind-box'
                        ? 'bg-[#FE2C55]/20 border-[#FE2C55] text-white'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-1">ðŸŽ</div>
                    <div className="font-bold text-xs">{t('tab_blind_box')}</div>
                    <div className="text-[10px] text-white/50">{t('game_blind_box_sub')}</div>
                  </button>
                </div>

                {/* Render active game in full mode */}
                <div className="pt-2">
                  {activeGame === 'tebak-angka' && (
                    <TebakNomorSeri
                      onScoreUpdate={onScoreUpdate}
                      activePrizeNominal={activePrizeNominal}
                      players={players}
                      onOpenLeaderboard={onOpenLeaderboard}
                      userProfile={userProfile}
                      onUpdateWalletBalance={onUpdateWalletBalance}
                      onOpenProfile={onOpenProfile}
                    />
                  )}
                  {activeGame === 'roda-keberuntungan' && (
                    <LuckyWheel
                      onAwardPrize={onAwardPrize}
                      activePrizeNominal={activePrizeNominal}
                      onUpdatePrizeNominal={onUpdatePrizeNominal}
                      players={players}
                      userProfile={userProfile}
                      onUpdateWalletBalance={onUpdateWalletBalance}
                      onOpenProfile={onOpenProfile}
                    />
                  )}
                  {activeGame === 'blind-box' && (
                    <BlindBoxDashboard
                      userProfile={userProfile}
                      onUpdateWalletBalance={onUpdateWalletBalance}
                      onOpenAppProfile={onOpenProfile}
                      onOpenAppAuth={onOpenProfile}
                      onLogoutApp={onLogout}
                    />
                  )}
                </div>
              </div>
            )}

            {activeMenu === 'live-control' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{t('live_control_title')}</h2>
                    <p className="text-xs text-white/60">
                      {t('live_control_subtitle')}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
                  >
                    {t('back_to_dashboard')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* OBS Browser Source URL Card */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                        <Tv className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{t('obs_browser_source_title')}</h4>
                        <p className="text-xs text-white/50">{t('obs_browser_source_desc')}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/60 border border-white/15 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-amber-300 truncate">
                        {window.location.origin}/?overlay=1&game={activeGame}
                      </span>
                      <button
                        onClick={handleCopyOverlay}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        {copiedOverlayUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedOverlayUrl ? t('copied') : t('copy_url_btn')}</span>
                      </button>
                    </div>

                    <div className="text-xs text-white/60 space-y-1">
                      <div>â€¢ {t('obs_rec_res')}</div>
                      <div>â€¢ {t('obs_rec_check')}</div>
                    </div>
                  </div>

                  {/* Sound FX & Alerts Controller */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{t('sound_effects_title')}</h4>
                        <p className="text-xs text-white/50">{t('sound_effects_desc')}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => sound.playWinner()}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-left flex items-center gap-2 cursor-pointer"
                      >
                        <span>ðŸŽ‰</span> {t('sound_effect_winner')}
                      </button>
                      <button
                        onClick={() => sound.playAlert()}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-left flex items-center gap-2 cursor-pointer"
                      >
                        <span>ðŸš¨</span> {t('sound_effect_enrage')}
                      </button>
                      <button
                        onClick={() => sound.playDrumroll()}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-left flex items-center gap-2 cursor-pointer"
                      >
                        <span>ðŸ¥</span> {t('sound_effect_drumroll')}
                      </button>
                      <button
                        onClick={() => sound.playWheelSpin()}
                        className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-left flex items-center gap-2 cursor-pointer"
                      >
                        <span>ðŸŽ¡</span> {t('sound_effect_wheel')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeMenu === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">{t('settings_title')}</h2>
                    <p className="text-xs text-white/60">
                      {t('settings_subtitle')}
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold cursor-pointer"
                  >
                    {t('back_to_dashboard')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Withdrawal Fee Policy Card (3% per transaksi) */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        %
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{t('withdrawal_fee_policy_title')}</h4>
                        <p className="text-xs text-white/50">{t('withdrawal_fee_policy_subtitle')}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                      <div className="text-xs text-white/70">{t('current_withdrawal_fee')}</div>
                      <div className="text-2xl font-black text-emerald-400 mt-1">
                        3.0% <span className="text-xs font-normal text-white/60">+ {t('blockchain_gas_fee')}</span>
                      </div>
                      <p className="text-[11px] text-white/70 mt-2">
                        {t('withdrawal_fee_detail')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className="text-white/60">{t('available_balance')}</span>
                      <span className="font-mono font-bold text-amber-300">
                        {formatCurrency(saldo)}
                      </span>
                    </div>

                    <button
                      onClick={onOpenProfile}
                      className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold text-xs transition-colors cursor-pointer"
                    >
                      {t('open_withdraw_btn')}
                    </button>
                  </div>

                  {/* Connected Accounts Card */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#FE2C55]/20 text-[#FE2C55] flex items-center justify-center">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{t('connected_shops_title')}</h4>
                        <p className="text-xs text-white/50">{t('connected_shops_subtitle')}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>ðŸŽµ</span>
                          <span className="font-bold">TikTok Shop Live</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          {t('connected_badge')}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>ðŸ›ï¸</span>
                          <span className="font-bold">Shopee Live Partner</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          {t('connected_badge')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Language & Regional Settings Card */}
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{t('currency_lang_label')}</h4>
                        <p className="text-xs text-white/50">{t('select_country_desc')}</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{country.flag}</span>
                        <div>
                          <div className="font-bold text-xs">{currentLangObj?.languageName || country.languageName}</div>
                          <div className="text-[10px] text-white/50">{country.currencyCode} ({country.currencySymbol})</div>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsLangModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer"
                      >
                        {t('select_lang_btn')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DEFAULT VIEW: DASHBOARD (MAIN REQUIRED LAYOUT) */}
            {activeMenu === 'dashboard' && (
              <>
                {/* 4. TENGAH - 2 KOLOM:
                    - Kiri (60%): Live Preview + Kontrol Game. Ada tombol besar: [Mulai Tebak angka] [Putar Roda] [Buka Blind Box]
                    - Kanan (40%): Live Chat Feed real-time, scroll otomatis.
                */}
                <div className="grid grid-cols-1 lg:grid-cols-10 gap-5 items-start">
                  {/* Kolom Kiri (60% / 6 cols out of 10) */}
                  <div className="lg:col-span-6 space-y-4">
                    {/* Live Preview Container Card */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5 border border-gray-100 text-[#0A0A0A] space-y-4">
                      {/* Live Preview Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-3 h-3 rounded-full bg-[#FE2C55] animate-ping" />
                          <h3 className="text-base font-black text-[#0A0A0A] tracking-tight">
                            {t('live_preview_title')}
                          </h3>
                        </div>
                      </div>

                      {/* Tombol Besar Kontrol Game:
                          [Mulai Tebak angka] [Putar Roda] [Buka Blind Box]
                      */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        <button
                          onClick={() => {
                            setActiveGame('tebak-angka');
                            sound.playClick();
                          }}
                          className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                            activeGame === 'tebak-angka'
                              ? 'bg-gradient-to-r from-[#FE2C55] to-rose-600 text-white shadow-md shadow-[#FE2C55]/30 ring-2 ring-[#FE2C55]/50 scale-[1.02]'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                        >
                          <span className="text-lg">ðŸ”¢</span>
                          <span>{t('btn_start_guess')}</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveGame('roda-keberuntungan');
                            sound.playClick();
                          }}
                          className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                            activeGame === 'roda-keberuntungan'
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-500/50 scale-[1.02]'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                        >
                          <span className="text-lg">ðŸŽ¡</span>
                          <span>{t('btn_start_wheel')}</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveGame('blind-box');
                            sound.playClick();
                          }}
                          className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                            activeGame === 'blind-box'
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50 scale-[1.02]'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                          }`}
                        >
                          <span className="text-lg">ðŸŽ</span>
                          <span>{t('tab_blind_box')}</span>
                        </button>
                      </div>

                      {/* Active Live Game Stage Render */}
                      <div className="rounded-2xl overflow-hidden border border-gray-200 bg-[#0A0A0A] p-2 sm:p-3">
                        {activeGame === 'tebak-angka' && (
                          <TebakNomorSeri
                            onScoreUpdate={onScoreUpdate}
                            activePrizeNominal={activePrizeNominal}
                            players={players}
                            onOpenLeaderboard={onOpenLeaderboard}
                            userProfile={userProfile}
                            onUpdateWalletBalance={onUpdateWalletBalance}
                            onOpenProfile={onOpenProfile}
                          />
                        )}

                        {activeGame === 'roda-keberuntungan' && (
                          <LuckyWheel
                            onAwardPrize={onAwardPrize}
                            activePrizeNominal={activePrizeNominal}
                            onUpdatePrizeNominal={onUpdatePrizeNominal}
                            players={players}
                            userProfile={userProfile}
                            onUpdateWalletBalance={onUpdateWalletBalance}
                            onOpenProfile={onOpenProfile}
                          />
                        )}

                        {activeGame === 'blind-box' && (
                          <BlindBoxDashboard
                            userProfile={userProfile}
                            onUpdateWalletBalance={onUpdateWalletBalance}
                            onOpenAppProfile={onOpenProfile}
                            onOpenAppAuth={onOpenProfile}
                            onLogoutApp={onLogout}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan (40% / 4 cols out of 10):
                      Live Chat Feed real-time, scroll otomatis.
                  */}
                  <div className="lg:col-span-4 space-y-4">
                    <div
                      className="bg-white rounded-2xl p-5 shadow-sm shadow-black/5 border border-gray-100 text-[#0A0A0A] flex flex-col h-[640px] max-h-[85dvh]"
                      style={{ overscrollBehavior: 'contain' }}
                    >
                      {/* Live Chat Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-[#FE2C55]/10 text-[#FE2C55] flex items-center justify-center">
                            <MessageSquare className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-[#0A0A0A] leading-tight">
                              {t('live_chat_title')}
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              {filteredChat.length} {t('detected_messages')}
                            </p>
                          </div>
                        </div>

                        {/* Auto-scroll toggle */}
                        <button
                          onClick={() => setAutoScroll(!autoScroll)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                            autoScroll
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                          title="Auto Scroll"
                        >
                          {autoScroll ? t('auto_scroll_active') : t('auto_scroll_paused')}
                        </button>
                      </div>

                      {/* Chat Filter Chips */}
                      <div className="flex items-center gap-1.5 py-2.5 border-b border-gray-100 text-xs overflow-x-auto">
                        <button
                          onClick={() => setChatFilter('all')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
                            chatFilter === 'all'
                              ? 'bg-[#0A0A0A] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {t('filter_all')}
                        </button>
                        <button
                          onClick={() => setChatFilter('comment')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
                            chatFilter === 'comment'
                              ? 'bg-[#0A0A0A] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {t('filter_comments')}
                        </button>
                        <button
                          onClick={() => setChatFilter('gift')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
                            chatFilter === 'gift'
                              ? 'bg-[#FE2C55] text-white'
                              : 'bg-rose-50 text-[#FE2C55] hover:bg-rose-100'
                          }`}
                        >
                          {t('filter_gifts')}
                        </button>
                        <button
                          onClick={() => setChatFilter('order')}
                          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
                            chatFilter === 'order'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {t('filter_orders')}
                        </button>
                      </div>

                      {/* Pinned Broadcast Banner at Top of Chat */}
                      {pinnedAnnouncement && (
                        <div className="my-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                          <span className="text-sm">ðŸ“Œ</span>
                          <div className="flex-1 font-medium leading-snug">
                            {pinnedAnnouncement}
                          </div>
                        </div>
                      )}

                      {/* Real-time Message Stream List */}
                      <div
                        ref={chatContainerRef}
                        className="flex-1 overflow-y-auto space-y-2 pr-1 my-2 col-scroll-contain"
                        style={{ overflowAnchor: 'none', overscrollBehavior: 'contain' }}
                      >
                        {filteredChat.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-2.5 rounded-xl text-xs transition-all ${
                              msg.type === 'gift'
                                ? 'bg-rose-50/70 border border-rose-200 text-rose-950'
                                : msg.type === 'order'
                                ? 'bg-emerald-50/70 border border-emerald-200 text-emerald-950'
                                : msg.type === 'system'
                                ? 'bg-amber-50 border border-amber-300 font-semibold text-amber-900'
                                : 'bg-gray-50 border border-gray-100 text-gray-900'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5 font-bold">
                                <span>{msg.avatar}</span>
                                <span className="text-[#0A0A0A] font-extrabold">{msg.user}</span>
                                {msg.badge && (
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                      msg.type === 'gift'
                                        ? 'bg-[#FE2C55] text-white'
                                        : msg.type === 'order'
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-[#0A0A0A] text-white'
                                    }`}
                                  >
                                    {msg.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 font-mono">{msg.time}</span>
                            </div>

                            <p className="text-gray-800 leading-snug">{msg.text}</p>

                            {/* Additional metadata for gifts or orders */}
                            {msg.type === 'gift' && msg.giftName && (
                              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-black text-[#FE2C55]">
                                <span>{msg.giftName}</span>
                                <span>x{msg.giftCount || 1}</span>
                              </div>
                            )}

                            {msg.type === 'order' && msg.orderProduct && (
                              <div className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                                <span>{msg.orderProduct}</span>
                                <span className="font-bold">
                                  {formatCurrency(msg.orderPrice || 100000)}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>

                      {/* Quick Interactive Triggers (Saved to Firestore) */}
                      <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                        <button
                          onClick={async () => {
                            try {
                              await logUserActivity({
                                type: 'gift',
                                userId: userProfile?.uid || 'host',
                                userEmail: userProfile?.email || 'host@sysstreamer.com',
                                userName: userProfile?.displayName ? `@${userProfile.displayName}` : '@sultan_gift',
                                title: `ðŸŒ¹ ${t('gift_rose')}`,
                                amount: 5000
                              });
                              sound.playAlert();
                            } catch (err) {
                              console.warn('Record gift:', err);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#FE2C55] font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Gift className="w-3 h-3" /> {t('gift_rose')}
                        </button>


                      </div>

                      {/* Host Message Input Box */}
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!customChatMessage.trim()) return;
                          const text = customChatMessage.trim();
                          setCustomChatMessage('');
                          try {
                            await logUserActivity({
                              type: 'comment',
                              userId: userProfile?.uid || 'host',
                              userEmail: userProfile?.email || 'host@sysstreamer.com',
                              userName: userProfile?.displayName ? `${userProfile.displayName} (Host)` : 'Host Streamer',
                              title: text,
                              amount: 0
                            });
                            sound.playClick();
                          } catch (err) {
                            console.warn('Send message:', err);
                          }
                        }}
                        className="mt-2 flex gap-1.5"
                      >
                        <input
                          type="text"
                          value={customChatMessage}
                          onChange={(e) => setCustomChatMessage(e.target.value)}
                          placeholder={t('send_chat_placeholder')}
                          className="flex-1 bg-gray-100 hover:bg-gray-200/70 focus:bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FE2C55]"
                        />
                        <button
                          type="submit"
                          className="p-2 rounded-xl bg-[#FE2C55] hover:bg-[#FE2C55]/90 text-white transition-colors cursor-pointer shrink-0"
                          title="Send"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>

              </>
            )}
          </main>
        </div>
      </div>

      {/* Language & Currency Selection Modal */}
      <CountryLanguageSelectorModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
      />
    </div>
  );
};






