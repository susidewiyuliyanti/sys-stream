export type RarityTier = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export interface UserProfile {
  id: string;
  username: string;
  avatar: string;
  coins: number;
  diamonds: number;
  vipTier: number;
  referralCode: string;
  registrationBonusIdr?: number;
  registrationBonusGranted?: boolean;
  lockedBalance?: number;
  referredBy?: string;
  totalWon: number;
  totalBet: number;
  winStreak: number;
  bestWin: number;
}

export interface BlindboxItem {
  id: string;
  name: string;
  category: 'Relic' | 'Skin' | 'Companion' | 'Vehicle' | 'Weapon';
  rarity: RarityTier;
  powerStat: number;
  coinValue: number;
  usdtReward: number; // Reward in USDT
  iconName: string;
  obtainedAt?: string;
}

export interface GameHistoryEntry {
  id: string;
  gameType: 'tebak' | 'spinner' | 'blindbox' | 'room_duel';
  gameName: string;
  betAmount: number;
  payoutAmount: number;
  multiplier: number;
  isWin: boolean;
  timestamp: number;
  details: string;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  score: number;
  metricLabel: string;
  winStreak: number;
  vipTier: number;
}

export interface ReferralStat {
  code: string;
  totalReferrals: number;
  activeReferrals: number;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
  pendingCoins: number;
  pendingDiamonds: number;
  totalEarnedCoins: number;
  history: {
    id: string;
    username: string;
    date: string;
    tier: number;
    earnedCoins: number;
  }[];
}

export interface CryptoInvoice {
  orderId: string;
  paymentId: string;
  payAddress: string;
  priceAmountUsd: number;
  payAmount: number;
  payCurrency: string;
  coinsToCredit: number;
  status: 'waiting' | 'confirming' | 'finished' | 'failed';
  qrCodeUrl: string;
  expiresAt: number;
}

export interface LockRecord {
  id: string;
  userId: string;
  amount: number; // >= 4 USDT
  durationDays: 30 | 60 | 90;
  multiplier: number;
  startDate: number;
  endDate: number;
  status: 'locked' | 'unlocked' | 'claimed';
  dailyClaims: number;
  accumulatedYieldCoins: number;
}

export interface CryptoCardConfig {
  cardTitle: string;
  serialNumber: string;
  network: string;
  rarity: 'Legendary' | 'Mythic' | 'Rare';
  digits: [number, number, number, number]; // exactly 4 numbers
  concealed: [boolean, boolean, boolean, boolean];
  streamerNote: string;
}


