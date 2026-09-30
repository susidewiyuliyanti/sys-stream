export type GameTab = 'tebak-seri' | 'spinner-roda' | 'blind-box-deposit' | 'leaderboard';

export interface BlindBoxUser {
  id: number;
  cuid: string;
  username: string;
  email: string;
  balance: number;
  lockedBalance?: number;
  role: string;
  isBlacklisted?: boolean;
  forceJackpotNext?: boolean;
  targetJackpotNominal?: number;
}

export interface BlindBoxDeposit {
  id: number;
  depositCode: string;
  userId: number;
  amount: number;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CLAIMED' | 'EXPIRED' | 'UNLOCKED';
  totalClaimed: number;
  forceJackpot?: boolean;
  targetJackpotNominal?: number;
  createdAt: string;
}

export interface BlindBoxClaimItem {
  id: number;
  depositId: number;
  userId: number;
  claimDate: string;
  amount: number;
  isJackpot: boolean;
  claimedAt: string;
}

export type BoxTierType = 'BRONZE' | 'SILVER' | 'PLATINUM' | 'GOLD' | 'DIAMOND' | 'SULTAN';

export interface OpenedBoxItem {
  boxNumber: number;
  prize: number;
  isJackpot: boolean;
  boxType: string;
  boxTier: BoxTierType;
}

export interface DepositTierInfo {
  tier: BoxTierType;
  tierName: string;
  boxCount: number;
  boxType: string;
  badgeColor: string;
}

export interface BlindBoxGameSettings {
  id: number;
  jackpotAmount: number;
  jackpotChance: number;
  minBox: number;
  maxBox: number;
  updatedAt?: string;
}

export interface AdminBlindBoxStats {
  totalUsers: number;
  totalDepositsCount: number;
  activeDepositsCount: number;
  totalDepositAmount: number;
  totalPrizeDistributed: number;
  totalJackpots: number;
  totalWithdrawalsCount: number;
}

export type BackgroundMode = 'transparent' | 'chroma-green' | 'studio-dark';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  streamerHandle?: string;
  bio?: string;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  saldo?: number; // Saldo resmi pengguna dari users/{uid}.saldo (Saldo Terbuka)
  walletBalance?: number; // Saldo aktif pengguna (sinkron dengan saldo)
  lockedSaldo?: number; // Saldo terkunci pengguna (misal saat penarikan pending)
  affiliateEarnings?: number;
  affiliateWithdrawn?: number;
  isSubscribed: boolean;
  subscriptionPlan: string;
  subscriptionExpiresAt: string;
  role: 'member' | 'host' | 'admin';
  isLifetime?: boolean;
  isBanned?: boolean;
  isBlacklisted?: boolean;
  bannedReason?: string;
  subscribedAt?: string;
  createdAt: string;
}

export interface TransactionOrder {
  id?: string;
  orderId: string;
  userId: string;
  nama?: string;
  jumlah?: number;
  userEmail: string;
  planId?: string;
  planName: string;
  price: number;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  paymentMethod: string;
  durationDays?: number;
  type?: 'subscription' | 'deposit' | 'withdrawal' | 'bonus' | 'commission' | 'transfer_out' | 'transfer_in';
  txHash?: string;
  feeAmount?: number;
  netPayoutAmount?: number;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  userName?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  notes?: string;
  createdAt: string;
}

export interface StreamingSessionLog {
  id?: string;
  sessionId: string;
  userId: string;
  userEmail: string;
  streamTitle: string;
  gameType: 'Banknote Serial Number Guessing' | 'Tebak Nomor Seri Uang' | 'Lucky Spinner 3D' | 'Multi-Game Stream' | string;
  totalRounds: number;
  totalPrizeDistributed: number;
  topWinner?: string;
  durationMinutes: number;
  startedAt: string;
  endedAt?: string;
  notes?: string;
}

export interface ReferralRecord {
  id?: string;
  referrerUid: string;
  referrerEmail: string;
  referredUid: string;
  referredEmail: string;
  referredName: string;
  rewardAmount: number;
  status: 'pending' | 'active' | 'rewarded';
  createdAt: string;
}

export interface AffiliateWithdrawal {
  id?: string;
  withdrawalId: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}

export interface ReferralRewardTier {
  level: number;
  minReferrals: number;
  title: string;
  rewardCommissionPct: number; // e.g., 20%, 25%, 30%, 35%
  bonusCash: number;           // Cash reward (IDR)
  eventPrize?: number;         // Hadiah event tambahan (e.g. 2.500.000)
  freeVipDays: number;         // Free VIP access days
  isSultanVip?: boolean;       // Status VIP Sultan gratis seumur hidup
  badgeTitle: string;
  badgeColor: string;
  perks: string[];
}

export interface BannedUserAccount {
  id?: string;
  email: string;
  reason?: string;
  bannedBy: string;
  bannedAt: string;
}

export interface VIPHostAccount {
  id?: string;
  email: string;
  addedBy: string;
  addedAt: string;
  role: 'admin' | 'host' | 'member';
  plan: string;
  planType?: '1_month' | '3_months' | '1_year' | 'lifetime';
  expiresAt?: string;
  notes?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  period: string;
  durationDays: number;
  popular?: boolean;
  badge?: string;
  features: string[];
  gradient: string;
}

export interface Banknote {
  id: string;
  country: string;
  currency: string;
  symbol: string;
  denomination: string;
  series: string;
  year: string;
  serialNumber: string; // e.g. "IDR 94827103"
  prefix: string;       // e.g. "IDR "
  digits: string;       // e.g. "94827103"
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  figureOrLandmark: string;
  watermarkText: string;
  isCrypto?: boolean;
}

export interface PlayerScore {
  id: string;
  name: string;
  score: number;
  rupiah: number;
  lastWin?: string;
  avatarColor?: string;
}

export type SoundTheme = 'modern' | 'arcade' | 'retro';

export interface SoundThemeInfo {
  id: SoundTheme;
  name: string;
  tagline: string;
  icon: string;
  description: string;
}

export interface CountryCurrencyConfig {
  code: string;           // 'ID', 'US', 'MY', 'JP', 'SG', 'GB', 'EU', 'SA', 'TH', 'VN', 'PH', 'KR', 'CN', 'IN', 'BR', 'AU'
  name: string;           // Country name in local language
  nameEn: string;         // English country name
  flag: string;           // Flag emoji (e.g. 🇮🇩, 🇺🇸)
  languageCode: string;   // 'id', 'en', 'ms', 'ja', 'zh', 'ar', 'th', 'vi', 'tl', 'ko', 'hi', 'pt', 'de', 'fr'
  languageName: string;   // 'Bahasa Indonesia', 'English', etc.
  currencyCode: string;   // 'IDR', 'USD', 'MYR', 'JPY', 'SGD', 'GBP', 'EUR', 'SAR', 'THB', 'VND', 'PHP', 'KRW', 'CNY', 'INR', 'BRL', 'AUD'
  currencySymbol: string; // 'Rp', '$', 'RM', '¥', 'S$', '£', '€', 'ر.س', '฿', '₫', '₱', '₩', '¥', '₹', 'R$', 'A$'
  rateFromIdr: number;    // Multiplier from IDR (e.g. 1 / 16000 for USD)
  decimals: number;       // 0 for IDR/JPY/KRW/VND, 2 for USD/EUR/SGD
  banknotePrefix: string; // 'IDR ', 'USD ', etc.
}

export interface CryptoNetworkOption {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  network: string;
  address: string;
  explorerUrl: string;
}

export interface AdminAccount {
  id?: string;
  email: string;
  displayName?: string;
  role: 'admin';
  addedBy: string;
  addedAt: string;
  notes?: string;
}

export interface JackpotSettings {
  poolAmount: number;
  winChance: number; // e.g. 1 in 100
  minBet: number;
  forceNextUser?: string;
  forceNextNominal?: number;
  lastWinner?: {
    name: string;
    email: string;
    amount: number;
    wonAt: string;
  };
  updatedAt?: string;
  updatedBy?: string;
}

export interface JackpotWinnerRecord {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  gameType: string;
  wonAt: string;
  notes?: string;
}

export interface UserActivityLog {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'game_play' | 'jackpot' | 'user_login' | 'admin_action' | 'gift' | 'order' | 'comment' | 'system';
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  amount?: number;
  details?: string;
  createdAt: string;
}

