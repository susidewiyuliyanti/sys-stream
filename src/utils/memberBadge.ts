import React from 'react';
import { UserProfile } from '../types';

export const OWNER_EMAIL = 'susidewiyuliyanti@gmail.com';

export type MemberBadgeType = 'none' | 'vip_blue' | 'vip_silver' | 'sultan_gold';

export interface MemberBadgeInfo {
  type: MemberBadgeType;
  label: string; // 'VIP' or 'SULTAN'
  description: string;
  badgeClassName: string;
  pillClassName: string;
  color: 'blue' | 'silver' | 'gold';
  iconType: 'crown' | 'shield';
}

/**
 * Checks if the given email belongs to the primary application owner.
 */
export function isOwnerUser(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
}

export function isMemberActive(userProfile: UserProfile | null | undefined): boolean {
  if (!userProfile) return false;
  if (isOwnerUser(userProfile.email)) return true;

  // Wajib memiliki status langganan aktif
  if (!userProfile.isSubscribed) return false;

  const plan = (userProfile.subscriptionPlan || '').toLowerCase().trim();
  // Akun belum member, free trial, atau plan kosong/none
  if (
    !plan ||
    plan === 'none' ||
    plan === 'free' ||
    plan === 'free-trial' ||
    plan.includes('trial') ||
    plan.includes('gratis') ||
    plan.includes('streamer free') ||
    plan.includes('belum member')
  ) {
    return false;
  }

  // Akses Lifetime VIP (Hanya berlaku jika memang isSubscribed aktif)
  if (userProfile.isLifetime) return true;

  // Cek apakah masa aktif langganan sudah kedaluwarsa
  if (userProfile.subscriptionExpiresAt && userProfile.subscriptionExpiresAt !== 'LIFETIME') {
    try {
      const expTime = new Date(userProfile.subscriptionExpiresAt).getTime();
      if (!isNaN(expTime) && expTime < Date.now()) {
        return false;
      }
    } catch {
      // ignore
    }
  }

  return true;
}

/**
 * Resolves member badge according to system rules:
 * - Free profile (belum member) = null (tanpa logo apapun)
 * - Member 1 bulan = VIP (warna biru)
 * - Member 3 bulan = VIP (silver)
 * - Member 1 tahun = SULTAN (emas)
 * - Owner = SULTAN (emas)
 */
export function getMemberBadge(userProfile: UserProfile | null | undefined): MemberBadgeInfo | null {
  if (!userProfile) return null;

  // 1. Owner is always SULTAN (emas)
  if (isOwnerUser(userProfile.email)) {
    return {
      type: 'sultan_gold',
      label: 'SULTAN',
      description: 'Owner & Sultan Streamer',
      badgeClassName: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25 border border-yellow-200',
      pillClassName: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black border border-yellow-200 shadow-sm',
      color: 'gold',
      iconType: 'crown'
    };
  }

  // 2. Akun yang belum member, free trial, atau kedaluwarsa = MUTLAK TANPA LOGO APAPUN
  if (!isMemberActive(userProfile)) {
    return null;
  }

  // 3. Lifetime VIP = SULTAN (emas)
  if (userProfile.isLifetime) {
    return {
      type: 'sultan_gold',
      label: 'SULTAN',
      description: 'Akses Sultan Permanen',
      badgeClassName: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25 border border-yellow-200',
      pillClassName: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black border border-yellow-200 shadow-sm',
      color: 'gold',
      iconType: 'crown'
    };
  }

  const plan = (userProfile.subscriptionPlan || '').toLowerCase();

  // 4. Member 1 Tahun = SULTAN (emas)
  if (
    plan.includes('1 tahun') ||
    plan.includes('tahun') ||
    plan.includes('annual') ||
    plan.includes('sultan') ||
    plan.includes('365')
  ) {
    return {
      type: 'sultan_gold',
      label: 'SULTAN',
      description: 'Member 1 Tahun (Sultan Emas)',
      badgeClassName: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/25 border border-yellow-200',
      pillClassName: 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black border border-yellow-200 shadow-sm',
      color: 'gold',
      iconType: 'crown'
    };
  }

  // 5. Member 3 Bulan = VIP (silver)
  if (
    plan.includes('3 bulan') ||
    plan.includes('quarterly') ||
    plan.includes('silver') ||
    plan.includes('90') ||
    plan.includes('pro')
  ) {
    return {
      type: 'vip_silver',
      label: 'VIP',
      description: 'Member 3 Bulan (VIP Silver)',
      badgeClassName: 'bg-gradient-to-r from-slate-200 via-gray-100 to-slate-300 text-slate-950 font-black border border-white/80 shadow-sm',
      pillClassName: 'bg-gradient-to-r from-slate-200 via-gray-100 to-slate-300 text-slate-950 font-black border border-white/80 shadow-sm',
      color: 'silver',
      iconType: 'shield'
    };
  }

  // 6. Member 1 Bulan = VIP (warna biru)
  if (
    plan.includes('1 bulan') ||
    plan.includes('bulanan') ||
    plan.includes('monthly') ||
    plan.includes('30') ||
    plan.includes('vip')
  ) {
    return {
      type: 'vip_blue',
      label: 'VIP',
      description: 'Member 1 Bulan (VIP Biru)',
      badgeClassName: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-black border border-blue-400/80 shadow-md shadow-blue-500/20',
      pillClassName: 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-black border border-blue-400/80 shadow-sm',
      color: 'blue',
      iconType: 'shield'
    };
  }

  // Jika bukan paket berbayar 1 bulan, 3 bulan, atau 1 tahun = TANPA LOGO APAPUN
  return null;
}
