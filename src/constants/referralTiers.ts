import { ReferralRewardTier } from '../types';

export const REFERRAL_BONUS_PER_MEMBER = 5000; // Each 1 member joining via referral link gets 5,000 IDR
export const NEW_MEMBER_WELCOME_BONUS = 15000; // New member gets free 15,000 IDR

export const REFERRAL_REWARD_TIERS: ReferralRewardTier[] = [
  {
    level: 1,
    minReferrals: 50,
    title: 'Promoter Level 1 (50 Reff)',
    rewardCommissionPct: 20,
    bonusCash: 50000,
    freeVipDays: 7,
    badgeTitle: 'BRONZE PROMOTER',
    badgeColor: 'from-amber-700 to-amber-900 border-amber-600',
    perks: [
      'Direct bonus of 5,000 IDR per registered member (250,000 IDR)',
      'Extra milestone bonus for 50 Reff: 50,000 IDR',
      'Total accumulated reward: 300,000 IDR',
      '20% commission on VIP package purchases by referrals'
    ]
  },
  {
    level: 2,
    minReferrals: 100,
    title: 'Partner Level 2 (100 Reff)',
    rewardCommissionPct: 25,
    bonusCash: 100000,
    freeVipDays: 14,
    badgeTitle: 'SILVER PARTNER',
    badgeColor: 'from-slate-400 to-slate-600 border-slate-300',
    perks: [
      'Direct bonus of 5,000 IDR per registered member (500,000 IDR)',
      'Extra milestone bonus for 100 Reff: 100,000 IDR',
      'Total accumulated reward: 600,000 IDR',
      'Permanent commission increase to 25%'
    ]
  },
  {
    level: 3,
    minReferrals: 500,
    title: 'Ambassador Level 3 (500 Reff)',
    rewardCommissionPct: 30,
    bonusCash: 750000,
    freeVipDays: 60,
    badgeTitle: 'GOLD AMBASSADOR',
    badgeColor: 'from-yellow-400 to-amber-600 border-yellow-300',
    perks: [
      'Direct bonus of 5,000 IDR per registered member (2,500,000 IDR)',
      'Extra milestone bonus for 500 Reff: 750,000 IDR',
      'Total accumulated reward: 3,250,000 IDR',
      'Permanent commission increase to 30%'
    ]
  },
  {
    level: 4,
    minReferrals: 1000,
    title: 'Grand Master VIP (1,000 Reff)',
    rewardCommissionPct: 35,
    bonusCash: 1000000,
    eventPrize: 2500000,
    isSultanVip: true,
    freeVipDays: 3650, // Lifetime VIP Sultan
    badgeTitle: 'DIAMOND GRAND MASTER VIP',
    badgeColor: 'from-cyan-400 via-blue-500 to-indigo-600 border-cyan-300',
    perks: [
      'Direct bonus of 5,000 IDR per registered member (5,000,000 IDR)',
      'Extra milestone bonus for 1,000 Reff: 1,000,000 IDR',
      'Special Grand Event Prize: 2,500,000 IDR',
      'TOTAL CASH REWARD: 8,500,000 IDR',
      'FREE LIFETIME GRAND MASTER VIP ACCESS',
      'Highest permanent commission of 35%'
    ]
  }
];

export interface ReferralTerm {
  id: string;
  category: string;
  title: string;
  description: string;
}

export const REFERRAL_TERMS_AND_CONDITIONS: ReferralTerm[] = [
  {
    id: 'welcome-bonus',
    category: 'New Member',
    title: 'New Member Welcome Bonus (Free 15,000 IDR)',
    description: 'Every new member who signs up and verifies their account via Google automatically receives a free wallet balance of 15,000 IDR with no initial deposit required.'
  },
  {
    id: 'per-member-reward',
    category: 'Referral Commission',
    title: '5,000 IDR Reward Per Registered Member',
    description: 'The referrer receives an instant 5,000 IDR cash reward for each valid member who joins through their referral link or submits their unique referral code.'
  },
  {
    id: 'milestone-50',
    category: 'Achievement Bonus',
    title: '50 Referrals Milestone: 50,000 IDR Cash Bonus',
    description: 'When accumulated referrals reach 50 valid members, the referrer earns an additional 50,000 IDR milestone bonus. Total earnings: (50 x 5,000 IDR) + 50,000 IDR = 300,000 IDR.'
  },
  {
    id: 'milestone-100',
    category: 'Achievement Bonus',
    title: '100 Referrals Milestone: 100,000 IDR Cash Bonus',
    description: 'When accumulated referrals reach 100 valid members, the referrer earns an additional 100,000 IDR milestone bonus. Total earnings: (100 x 5,000 IDR) + 100,000 IDR = 600,000 IDR.'
  },
  {
    id: 'milestone-500',
    category: 'Achievement Bonus',
    title: '500 Referrals Milestone: 750,000 IDR Cash Bonus',
    description: 'When accumulated referrals reach 500 valid members, the referrer earns an additional 750,000 IDR milestone bonus. Total earnings: (500 x 5,000 IDR) + 750,000 IDR = 3,250,000 IDR.'
  },
  {
    id: 'milestone-1000',
    category: 'Peak Bonus',
    title: '1,000 Referrals Milestone: 1,000,000 IDR Bonus + 2,500,000 IDR Event + Lifetime VIP',
    description: 'Reaching 1,000 valid members awards: 1,000,000 IDR Cash Bonus, 2,500,000 IDR Special Event Prize, and Lifetime Grand Master VIP Status (Total Cash Rewards: 8,500,000 IDR).'
  },
  {
    id: 'validity-anti-fraud',
    category: 'Integrity & Anti-Fraud',
    title: 'Account Validity & Anti-Cheating Policy',
    description: 'Referred members must be unique, authentic users. Self-referrals, automated emulator registrations, IP spoofing, or duplicate bank details are strictly prohibited. Violations lead to bonus cancellation and account suspension.'
  },
  {
    id: 'withdrawal-payout',
    category: 'Withdrawals',
    title: 'Withdrawal Terms & Conditions',
    description: 'Referral commission and milestone rewards can be withdrawn directly to Bank Accounts (BCA, Mandiri, BRI, BNI) or E-Wallets (DANA, GoPay, OVO, ShopeePay). Minimum withdrawal is 50,000 IDR / 100,000 IDR with processing estimated in 1-24 hours.'
  }
];

export function calculateReferralBreakdown(referralCount: number) {
  const baseEarnings = referralCount * REFERRAL_BONUS_PER_MEMBER;
  let milestoneBonus = 0;
  let eventPrize = 0;
  let isVipSultan = false;

  if (referralCount >= 1000) {
    milestoneBonus = 1000000;
    eventPrize = 2500000;
    isVipSultan = true;
  } else if (referralCount >= 500) {
    milestoneBonus = 750000;
  } else if (referralCount >= 100) {
    milestoneBonus = 100000;
  } else if (referralCount >= 50) {
    milestoneBonus = 50000;
  }

  const totalEarnings = baseEarnings + milestoneBonus + eventPrize;

  return {
    referralCount,
    baseEarnings,
    milestoneBonus,
    eventPrize,
    isVipSultan,
    totalEarnings
  };
}

export const LEADERBOARD_PRIZES = [
  {
    rank: 1,
    title: '1ST PLACE STREAMER CHAMPION',
    cashPrize: 2500000,
    badge: 'Gold Trophy + Lifetime VIP',
    gradient: 'from-amber-400 via-yellow-300 to-amber-500',
    border: 'border-yellow-400',
    iconColor: 'text-yellow-400'
  },
  {
    rank: 2,
    title: '2ND PLACE SILVER STREAMER',
    cashPrize: 1250000,
    badge: 'Silver Trophy + 6 Months VIP',
    gradient: 'from-slate-300 via-slate-100 to-slate-400',
    border: 'border-slate-300',
    iconColor: 'text-slate-300'
  },
  {
    rank: 3,
    title: '3RD PLACE BRONZE STREAMER',
    cashPrize: 600000,
    badge: 'Bronze Trophy + 3 Months VIP',
    gradient: 'from-amber-700 via-amber-600 to-amber-800',
    border: 'border-amber-600',
    iconColor: 'text-amber-500'
  }
];
