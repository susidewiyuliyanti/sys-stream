import {
  signOut,
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  UserProfile,
  VIPHostAccount,
  BannedUserAccount,
  TransactionOrder,
  StreamingSessionLog,
  ReferralRecord,
  AffiliateWithdrawal,
  AdminAccount,
  JackpotSettings,
  JackpotWinnerRecord,
  UserActivityLog
} from '../types';
import {
  app,
  auth,
  googleProvider,
  loginWithGoogle,
  loginWithGooglePopup,
  loginWithGoogleRedirect,
  getLoginResult,
  loginWithEmail,
  registerWithEmail,
  resendVerificationEmail,
  sendPasswordReset
} from '../lib/firebase';

// Re-export Auth instance & helpers
export {
  app,
  auth,
  googleProvider,
  loginWithGoogle,
  loginWithGooglePopup,
  loginWithGoogleRedirect,
  getLoginResult,
  loginWithEmail,
  registerWithEmail,
  resendVerificationEmail,
  sendPasswordReset
};

// 1. Kunci database sama dengan admin:
export const db = getFirestore(app, "ai-studio-streammasterinte-ecab4a17-e81c-4ff1-9972-d570bcf4652c");

// Primary Owner / Super Admin email (Otomatis tanpa ada batasan waktu)
export const OWNER_EMAIL = 'susidewiyuliyanti@gmail.com';

export const ADMIN_EMAILS = [
  OWNER_EMAIL
];

export function sanitizeEmailKey(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Remove any undefined values from an object before writing to Firestore
 */
export function sanitizeFirestoreData<T extends Record<string, any>>(data: T): Partial<T> {
  const result: any = {};
  for (const key of Object.keys(data)) {
    if (data[key] !== undefined) {
      result[key] = data[key];
    }
  }
  return result;
}

/**
 * Check if an email is banned
 */
export async function checkIsBanned(email: string): Promise<boolean> {
  const cleanEmail = sanitizeEmailKey(email);
  if (!cleanEmail) return false;
  if (cleanEmail === sanitizeEmailKey(OWNER_EMAIL)) return false;

  try {
    const banDocRef = doc(db, 'banned_users', cleanEmail);
    const snap = await getDoc(banDocRef);
    return snap.exists();
  } catch (err) {
    console.warn('Error checking banned user status:', err);
    return false;
  }
}

/**
 * Check if an email is an owner or registered Sultan VIP Host
 */
export async function checkIsVipHost(email: string): Promise<boolean> {
  const cleanEmail = sanitizeEmailKey(email);
  if (!cleanEmail) return false;
  if (cleanEmail === sanitizeEmailKey(OWNER_EMAIL)) return true;

  try {
    const adminDocRef = doc(db, 'admins', cleanEmail);
    const adminSnap = await getDoc(adminDocRef);
    if (adminSnap.exists()) return true;

    const vipDocRef = doc(db, 'vip_hosts', cleanEmail);
    const vipSnap = await getDoc(vipDocRef);
    return vipSnap.exists();
  } catch (err) {
    console.warn('Error checking VIP/Admin host status:', err);
    return false;
  }
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  try {
    localStorage.removeItem('sys_streamer_emergency_user');
    sessionStorage.clear();
  } catch (e) {
    console.warn('Could not clear storage:', e);
  }
  await signOut(auth);
}

/**
 * Generate clean unique referral code
 */
export function generateReferralCode(uid: string, email: string): string {
  const prefix = email ? email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase() : 'HOST';
  const suffix = uid ? uid.slice(0, 4).toUpperCase() : Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SYS-${prefix}${suffix}`;
}

/**
 * Ensure user document exists in Firestore and return profile.
 * Automatically gives Lifetime VIP without expiration to susidewiyuliyanti@gmail.com
 * and any email in the vip_hosts whitelist!
 */
export async function syncUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userRef);

  const cleanEmail = user.email ? sanitizeEmailKey(user.email) : '';
  const isOwner = cleanEmail === sanitizeEmailKey(OWNER_EMAIL);

  // Check if user is banned
  const isBanned = await checkIsBanned(cleanEmail);
  if (isBanned && !isOwner) {
    throw new Error('Your account has been suspended by the Primary Owner (susidewiyuliyanti@gmail.com). Access closed.');
  }

  const isVipInWhitelist = await checkIsVipHost(cleanEmail);
  const isVip = isOwner || isVipInWhitelist;

  const lifetimePlanName = isOwner
    ? 'Sultan VIP Host (Owner Permanen)'
    : 'Sultan VIP Host (Permanen)';

  const generatedCode = generateReferralCode(user.uid, user.email || '');

  if (!snap.exists()) {
    const defaultProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || (isOwner ? 'Susi Dewi Yuliyanti (Owner)' : 'Streamer Host'),
      photoURL: user.photoURL || '',
      referralCode: generatedCode,
      referralCount: 0,
      saldo: 15000, // Saldo resmi di users/{uid}.saldo
      walletBalance: 15000, // Sinkronisasi saldo
      affiliateEarnings: 0,
      affiliateWithdrawn: 0,
      isSubscribed: true, // Biaya member dinonaktifkan: Bebas biaya untuk semua user
      subscriptionPlan: isVip ? lifetimePlanName : 'Akses Bebas Gratis (Permanen)',
      subscriptionExpiresAt: 'LIFETIME',
      isLifetime: true,
      role: isVip ? 'admin' : 'member',
      ...(isVip ? { subscribedAt: new Date().toISOString() } : {}),
      createdAt: new Date().toISOString()
    };

    await setDoc(userRef, sanitizeFirestoreData(defaultProfile));

    // Otomatis catat transaksi bonus sambutan pendaftaran Rp 15.000
    try {
      await createTransactionOrder({
        orderId: `BONUS-${Date.now().toString(36).toUpperCase()}`,
        userId: user.uid,
        userEmail: user.email || '',
        planName: 'Bonus Sambutan Pendaftaran Member Baru',
        price: 15000,
        currency: 'IDR',
        status: 'success',
        paymentMethod: 'Bonus Saldo Gratis SYS',
        type: 'bonus',
        notes: 'Bonus pendaftaran member baru otomatis diterima',
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Could not record welcome bonus transaction:', e);
    }

    return defaultProfile;
  } else {
    const data = snap.data() as UserProfile;
    const updates: Partial<UserProfile> = {};

    // Ensure referralCode exists
    if (!data.referralCode) {
      updates.referralCode = generatedCode;
    }
    if (data.referralCount === undefined) {
      updates.referralCount = 0;
    }
    const currentSaldoVal = typeof (data as any).saldo === 'number'
      ? (data as any).saldo
      : (typeof data.walletBalance === 'number' ? data.walletBalance : 15000);

    if ((data as any).saldo === undefined) {
      updates.saldo = currentSaldoVal;
    }
    if (data.walletBalance === undefined) {
      updates.walletBalance = currentSaldoVal;
    }
    if (data.affiliateEarnings === undefined) {
      updates.affiliateEarnings = 0;
    }
    if (data.affiliateWithdrawn === undefined) {
      updates.affiliateWithdrawn = 0;
    }

    // Biaya member dinonaktifkan: Berikan akses aktif gratis untuk semua user yang ada
    if (!data.isSubscribed) {
      updates.isSubscribed = true;
      updates.subscriptionPlan = data.subscriptionPlan || 'Akses Bebas Gratis (Permanen)';
      updates.isLifetime = true;
      updates.subscriptionExpiresAt = 'LIFETIME';
    }

    // If owner or VIP whitelist, always guarantee Lifetime Sultan VIP status without expiration
    if (isVip && (!data.isSubscribed || !data.isLifetime || data.subscriptionExpiresAt !== 'LIFETIME' || data.role !== 'admin')) {
      updates.isSubscribed = true;
      updates.subscriptionPlan = lifetimePlanName;
      updates.subscriptionExpiresAt = 'LIFETIME';
      updates.isLifetime = true;
      updates.role = 'admin';
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(userRef, updates);
      return { ...data, ...updates };
    }
    return data;
  }
}

/**
 * Add an email to the Sultan VIP Host whitelist (Tanpa batasan waktu)
 */
export async function addVipHostAccount(
  email: string,
  addedByEmail: string,
  notes?: string,
  planType: '1_month' | '3_months' | '1_year' | 'lifetime' = 'lifetime'
): Promise<void> {
  const cleanEmail = sanitizeEmailKey(email);
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Invalid email format. Please enter a valid email address.');
  }

  let planName = 'Sultan VIP Host (Permanent)';
  let isLifetime = true;
  let expiresAt = 'LIFETIME';
  let role: 'admin' | 'host' | 'member' = 'admin';

  if (planType === '1_month') {
    planName = 'Monthly Streamer Package (1 Month)';
    isLifetime = false;
    expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
    role = 'member';
  } else if (planType === '3_months') {
    planName = 'Streamer Pro Package (3 Months)';
    isLifetime = false;
    expiresAt = new Date(Date.now() + 90 * 86400000).toISOString();
    role = 'host';
  } else if (planType === '1_year') {
    planName = 'Sultan VIP Package (1 Year)';
    isLifetime = false;
    expiresAt = new Date(Date.now() + 365 * 86400000).toISOString();
    role = 'host';
  }

  const docRef = doc(db, 'vip_hosts', cleanEmail);
  const newVip: VIPHostAccount = {
    email: cleanEmail,
    addedBy: addedByEmail || OWNER_EMAIL,
    addedAt: new Date().toISOString(),
    role,
    plan: planName,
    planType,
    expiresAt,
    notes: notes?.trim() || `Access ${planName}`
  };

  await setDoc(docRef, newVip, { merge: true });

  // If user already registered in users collection, immediately upgrade their user doc
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const querySnap = await getDocs(q);
    const updatePromises = querySnap.docs.map((docSnap) =>
      updateDoc(docSnap.ref, {
        isSubscribed: true,
        subscriptionPlan: planName,
        subscriptionExpiresAt: expiresAt,
        isLifetime,
        role
      })
    );
    await Promise.all(updatePromises);
  } catch (err) {
    console.warn('Could not batch update existing user docs for VIP email:', err);
  }
}

/**
 * Remove an email from the Sultan VIP Host whitelist
 */
export async function removeVipHostAccount(email: string): Promise<void> {
  const cleanEmail = sanitizeEmailKey(email);
  if (cleanEmail === sanitizeEmailKey(OWNER_EMAIL)) {
    throw new Error('Primary Owner account susidewiyuliyanti@gmail.com cannot be deleted.');
  }

  const docRef = doc(db, 'vip_hosts', cleanEmail);
  await deleteDoc(docRef);

  // Optionally downgrade users doc if they exist
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const querySnap = await getDocs(q);
    const updatePromises = querySnap.docs.map((docSnap) =>
      updateDoc(docSnap.ref, {
        isSubscribed: false,
        subscriptionPlan: 'none',
        subscriptionExpiresAt: '',
        isLifetime: false,
        role: 'member'
      })
    );
    await Promise.all(updatePromises);
  } catch (err) {
    console.warn('Could not batch downgrade user docs:', err);
  }
}

/**
 * Subscribe to realtime Sultan VIP Host whitelist
 */
export function subscribeToVipHosts(callback: (hosts: VIPHostAccount[]) => void) {
  const hostsCol = collection(db, 'vip_hosts');
  return onSnapshot(
    hostsCol,
    (snap) => {
      const list: VIPHostAccount[] = [];
      snap.forEach((doc) => {
        list.push({ id: doc.id, ...(doc.data() as VIPHostAccount) });
      });
      callback(list);
    },
    (err) => {
      console.error('Error listening to vip_hosts:', err);
    }
  );
}

/**
 * Activate or update regular user subscription
 */
export async function activateSubscription(
  uid: string,
  planName: string,
  durationDays: number,
  paymentDetails?: {
    userEmail?: string;
    planId?: string;
    price?: number;
    currency?: string;
    paymentMethod?: string;
    txHash?: string;
  }
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 3600 * 1000);

  await updateDoc(userRef, {
    isSubscribed: true,
    subscriptionPlan: planName,
    subscriptionExpiresAt: expiresAt.toISOString(),
    isLifetime: false,
    subscribedAt: now.toISOString()
  });

  // Automatically record order transaction in subscription_orders
  try {
    const userDoc = await getDoc(userRef);
    const userData = userDoc.exists() ? (userDoc.data() as UserProfile) : null;
    const email = paymentDetails?.userEmail || userData?.email || auth.currentUser?.email || '';
    const orderPrice = paymentDetails?.price || 0;
    
    await createTransactionOrder({
      orderId: `SYS-${Date.now().toString(36).toUpperCase()}`,
      userId: uid,
      userEmail: email,
      planId: paymentDetails?.planId || 'member-plan',
      planName: planName,
      price: orderPrice,
      currency: paymentDetails?.currency || 'IDR',
      status: 'success',
      paymentMethod: paymentDetails?.paymentMethod || 'QRIS',
      durationDays: durationDays,
      txHash: paymentDetails?.txHash || '',
      createdAt: now.toISOString()
    });

    // If this user was referred by someone, credit affiliate commission (25%)
    if (userData?.referredBy && orderPrice > 0) {
      try {
        const referrerRef = doc(db, 'users', userData.referredBy);
        const referrerSnap = await getDoc(referrerRef);
        if (referrerSnap.exists()) {
          const referrerData = referrerSnap.data() as UserProfile;
          const commission = Math.round(orderPrice * 0.25);
          await updateDoc(referrerRef, {
            affiliateEarnings: (referrerData.affiliateEarnings || 0) + commission
          });
        }
      } catch (commErr) {
        console.warn('Could not credit affiliate commission:', commErr);
      }
    }
  } catch (orderErr) {
    console.warn('Could not auto-create order record:', orderErr);
  }
}

/**
 * Subscribe to realtime user profile changes
 */
export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
) {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserProfile);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Realtime profile listener error:', error);
    }
  );
}

/**
 * Ban a user/email permanently (Owner susidewiyuliyanti@gmail.com only)
 */
export async function banUserAccount(
  email: string,
  reason: string = 'Suspended by Primary Owner susidewiyuliyanti@gmail.com',
  bannedByEmail: string = OWNER_EMAIL
): Promise<void> {
  const cleanEmail = sanitizeEmailKey(email);
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Invalid email address.');
  }
  if (cleanEmail === sanitizeEmailKey(OWNER_EMAIL)) {
    throw new Error('Primary Owner account (susidewiyuliyanti@gmail.com) cannot be suspended.');
  }

  // 1. Add to banned_users collection
  const banDocRef = doc(db, 'banned_users', cleanEmail);
  const banData: BannedUserAccount = {
    email: cleanEmail,
    reason: reason.trim() || 'Suspended by Primary Owner susidewiyuliyanti@gmail.com',
    bannedBy: bannedByEmail,
    bannedAt: new Date().toISOString()
  };
  await setDoc(banDocRef, banData);

  // 2. Remove from vip_hosts if present
  try {
    const vipDocRef = doc(db, 'vip_hosts', cleanEmail);
    await deleteDoc(vipDocRef);
  } catch (err) {
    console.warn('Error removing from vip_hosts during ban:', err);
  }

  // 3. Mark user document as banned and cancel subscription
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const querySnap = await getDocs(q);
    const updatePromises = querySnap.docs.map((d) =>
      updateDoc(d.ref, {
        isBanned: true,
        bannedReason: banData.reason,
        isSubscribed: false,
        subscriptionPlan: 'none',
        subscriptionExpiresAt: '',
        isLifetime: false,
        role: 'member'
      })
    );
    await Promise.all(updatePromises);
  } catch (err) {
    console.warn('Error updating user document during ban:', err);
  }
}

/**
 * Unban a user/email (Owner susidewiyuliyanti@gmail.com only)
 */
export async function unbanUserAccount(email: string): Promise<void> {
  const cleanEmail = sanitizeEmailKey(email);
  if (!cleanEmail) return;

  // 1. Remove from banned_users collection
  const banDocRef = doc(db, 'banned_users', cleanEmail);
  await deleteDoc(banDocRef);

  // 2. Update user doc if exists
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const querySnap = await getDocs(q);
    const updatePromises = querySnap.docs.map((d) =>
      updateDoc(d.ref, {
        isBanned: false,
        bannedReason: ''
      })
    );
    await Promise.all(updatePromises);
  } catch (err) {
    console.warn('Error unbanning user doc:', err);
  }
}

/**
 * Delete a user permanently from the system (Owner susidewiyuliyanti@gmail.com only)
 */
export async function deleteUserPermanently(email: string): Promise<void> {
  const cleanEmail = sanitizeEmailKey(email);
  if (!cleanEmail) throw new Error('Invalid email address.');
  if (cleanEmail === sanitizeEmailKey(OWNER_EMAIL)) {
    throw new Error('Primary Owner account (susidewiyuliyanti@gmail.com) cannot be deleted.');
  }

  // 1. Delete from vip_hosts if present
  try {
    const vipDocRef = doc(db, 'vip_hosts', cleanEmail);
    await deleteDoc(vipDocRef);
  } catch (err) {
    console.warn('Error deleting from vip_hosts:', err);
  }

  // 2. Delete from users collection
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const querySnap = await getDocs(q);
    const deletePromises = querySnap.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  } catch (err) {
    console.warn('Error deleting from users collection:', err);
    throw err;
  }
}

/**
 * Subscribe to realtime banned users list
 */
export function subscribeToBannedUsers(callback: (banned: BannedUserAccount[]) => void) {
  const banCol = collection(db, 'banned_users');
  return onSnapshot(
    banCol,
    (snap) => {
      const list: BannedUserAccount[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as BannedUserAccount) });
      });
      callback(list);
    },
    (err) => {
      console.error('Error listening to banned_users:', err);
    }
  );
}

/**
 * Update user profile details (photo, display name, handle, bio)
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, 'users', uid);

  // Sync saldo & walletBalance automatically
  const sanitizedUpdates = { ...updates };
  if (sanitizedUpdates.saldo !== undefined && sanitizedUpdates.walletBalance === undefined) {
    sanitizedUpdates.walletBalance = sanitizedUpdates.saldo;
  }
  if (sanitizedUpdates.walletBalance !== undefined && sanitizedUpdates.saldo === undefined) {
    sanitizedUpdates.saldo = sanitizedUpdates.walletBalance;
  }

  await updateDoc(userRef, sanitizedUpdates);

  // Sync with Firebase Auth user if current user is logged in
  if (auth.currentUser && auth.currentUser.uid === uid) {
    const authUpdates: { displayName?: string; photoURL?: string } = {};
    if (updates.displayName !== undefined) authUpdates.displayName = updates.displayName;
    if (updates.photoURL !== undefined) authUpdates.photoURL = updates.photoURL;

    if (Object.keys(authUpdates).length > 0) {
      try {
        await updateProfile(auth.currentUser, authUpdates);
      } catch (err) {
        console.warn('Could not update Firebase Auth profile:', err);
      }
    }
  }
}

/**
 * Record a new subscription transaction order
 */
export async function createTransactionOrder(
  order: Omit<TransactionOrder, 'id'>
): Promise<string> {
  const orderRef = doc(collection(db, 'subscription_orders'));
  const orderData: TransactionOrder = {
    ...order,
    orderId: order.orderId || `SYS-${Date.now().toString(36).toUpperCase()}`
  };
  await setDoc(orderRef, orderData);
  return orderRef.id;
}

/**
 * Subscribe to realtime orders for a specific user
 */
export function subscribeToUserOrders(
  userId: string,
  callback: (orders: TransactionOrder[]) => void
) {
  const ordersCol = collection(db, 'subscription_orders');
  const q = query(ordersCol, where('userId', '==', userId));
  return onSnapshot(
    q,
    (snap) => {
      const list: TransactionOrder[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as TransactionOrder) });
      });
      // Sort client-side by createdAt desc
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => {
      console.error('Error listening to user orders:', err);
    }
  );
}

/**
 * Record a completed or live streaming session log
 */
export async function createStreamingSessionLog(
  session: Omit<StreamingSessionLog, 'id'>
): Promise<string> {
  const sessionRef = doc(collection(db, 'streaming_sessions'));
  const sessionData: StreamingSessionLog = {
    ...session,
    sessionId: session.sessionId || `STREAM-${Date.now().toString(36).toUpperCase()}`
  };
  await setDoc(sessionRef, sessionData);
  return sessionRef.id;
}

/**
 * Subscribe to realtime streaming sessions for a specific user
 */
export function subscribeToUserStreamingSessions(
  userId: string,
  callback: (sessions: StreamingSessionLog[]) => void
) {
  const sessionsCol = collection(db, 'streaming_sessions');
  const q = query(sessionsCol, where('userId', '==', userId));
  return onSnapshot(
    q,
    (snap) => {
      const list: StreamingSessionLog[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as StreamingSessionLog) });
      });
      // Sort client-side by startedAt desc
      list.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      callback(list);
    },
    (err) => {
      console.error('Error listening to streaming sessions:', err);
    }
  );
}

/**
 * Apply a referral code during registration or from profile
 */
export async function applyReferralCode(
  currentUserUid: string,
  referralCodeInput: string
): Promise<{ success: boolean; message: string; referrerName?: string }> {
  const code = referralCodeInput.trim().toUpperCase();
  if (!code) {
    return { success: false, message: 'Referral code cannot be empty.' };
  }

  const currentUserRef = doc(db, 'users', currentUserUid);
  const currentUserSnap = await getDoc(currentUserRef);
  if (!currentUserSnap.exists()) {
    return { success: false, message: 'Your account is not registered yet.' };
  }

  const currentUser = currentUserSnap.data() as UserProfile;
  if (currentUser.referredBy) {
    return { success: false, message: 'You have already used a referral code previously.' };
  }
  if (currentUser.referralCode?.toUpperCase() === code) {
    return { success: false, message: 'You cannot use your own referral code.' };
  }

  // Find referrer user by referralCode
  const usersCol = collection(db, 'users');
  const q = query(usersCol, where('referralCode', '==', code));
  const snap = await getDocs(q);

  if (snap.empty) {
    return { success: false, message: 'Referral code not found. Please make sure the code is correct.' };
  }

  const referrerDoc = snap.docs[0];
  const referrer = referrerDoc.data() as UserProfile;

  if (referrer.uid === currentUserUid) {
    return { success: false, message: 'You cannot use your own referral code.' };
  }

  const bonusPerMember = 5000;
  const newReferralCount = (referrer.referralCount || 0) + 1;
  let milestoneBonus = 0;
  let eventPrize = 0;
  let milestoneMsg = '';
  const referrerUpdates: any = {
    referralCount: newReferralCount
  };

  // Milestone bonus thresholds
  if (newReferralCount === 50) {
    milestoneBonus = 50000;
    milestoneMsg = ' Congratulations! Milestone reached: 50 referrals (+Bonus Rp 50,000)!';
  } else if (newReferralCount === 100) {
    milestoneBonus = 100000;
    milestoneMsg = ' Congratulations! Milestone reached: 100 referrals (+Bonus Rp 100,000)!';
  } else if (newReferralCount === 500) {
    milestoneBonus = 750000;
    milestoneMsg = ' Congratulations! Milestone reached: 500 referrals (+Bonus Rp 750,000)!';
  } else if (newReferralCount === 1000) {
    milestoneBonus = 1000000;
    eventPrize = 2500000;
    referrerUpdates.isSubscribed = true;
    referrerUpdates.isLifetime = true;
    referrerUpdates.subscriptionPlan = 'VIP Sultan Grand Master (Lifetime)';
    referrerUpdates.role = 'host';
    milestoneMsg = ' PINNACLE ACHIEVEMENT! 1,000 Referrals: Bonus Rp 1,000,000 + Event Prize Rp 2,500,000 + Free Lifetime VIP Sultan!';
  }

  const totalCredit = bonusPerMember + milestoneBonus + eventPrize;
  referrerUpdates.affiliateEarnings = (referrer.affiliateEarnings || 0) + totalCredit;

  // 1. Record referral document
  const referralRef = doc(collection(db, 'referrals'));
  const newReferral: ReferralRecord = {
    referrerUid: referrer.uid,
    referrerEmail: referrer.email,
    referredUid: currentUserUid,
    referredEmail: currentUser.email,
    referredName: currentUser.displayName || 'New Host',
    rewardAmount: bonusPerMember,
    status: 'active',
    createdAt: new Date().toISOString()
  };
  await setDoc(referralRef, newReferral);

  // 2. Update referred user (set referredBy and ensure welcome free Rp 15.000)
  const userUpdates: any = {
    referredBy: referrer.uid
  };
  if (currentUser.walletBalance === undefined || currentUser.walletBalance < 15000) {
    userUpdates.walletBalance = 15000;
  }
  await updateDoc(currentUserRef, userUpdates);

  // 3. Update referrer
  await updateDoc(referrerDoc.ref, referrerUpdates);

  return {
    success: true,
    message: `Successfully connected with Host ${referrer.displayName || referrer.email}! Referral reward of Rp ${bonusPerMember.toLocaleString('id-ID')} has been credited to sponsor.${milestoneMsg}`,
    referrerName: referrer.displayName || referrer.email
  };
}

/**
 * Subscribe to user referrals
 */
export function subscribeToUserReferrals(
  userId: string,
  callback: (referrals: ReferralRecord[]) => void
) {
  const refCol = collection(db, 'referrals');
  const q = query(refCol, where('referrerUid', '==', userId));
  return onSnapshot(
    q,
    (snap) => {
      const list: ReferralRecord[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as ReferralRecord) });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => {
      console.error('Error listening to user referrals:', err);
    }
  );
}

/**
 * Request affiliate commission withdrawal / payout
 */
export async function requestAffiliateWithdrawal(
  withdrawal: Omit<AffiliateWithdrawal, 'id'>
): Promise<string> {
  const userRef = doc(db, 'users', withdrawal.userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error('User account not found.');
  }

  const user = userSnap.data() as UserProfile;
  const availableBalance = (user.affiliateEarnings || 0) - (user.affiliateWithdrawn || 0);

  if (withdrawal.amount < 100000) {
    throw new Error('Minimum withdrawal amount is Rp 100,000.');
  }

  if (withdrawal.amount > availableBalance) {
    throw new Error(`Insufficient commission balance. Available balance: Rp ${availableBalance.toLocaleString('id-ID')}`);
  }

  // Create withdrawal document
  const withdrawalRef = doc(collection(db, 'affiliate_withdrawals'));
  const withdrawalData: AffiliateWithdrawal = {
    ...withdrawal,
    withdrawalId: `WD-${Date.now().toString(36).toUpperCase()}`,
    status: 'completed', // Instant simulated approval for streamer ease
    createdAt: new Date().toISOString()
  };
  await setDoc(withdrawalRef, withdrawalData);

  // Update user withdrawn total
  await updateDoc(userRef, {
    affiliateWithdrawn: (user.affiliateWithdrawn || 0) + withdrawal.amount
  });

  return withdrawalRef.id;
}

/**
 * Deposit funds request to user wallet balance
 * Wajib input link/hash transaksi, status PENDING menunggu konfirmasi owner atau admin yang ditunjuk.
 * 2. Saat deposit, WAJIB simpan userId dari auth, bukan dari input!
 */
export async function depositUserWallet(
  amountOrUid: number | string,
  amountOrMethod?: number | string,
  paymentMethod: string = 'Crypto (USDT)',
  notes?: string,
  txHash?: string,
  _userEmail?: string,
  _userName?: string
): Promise<{ success: boolean; status: 'pending'; currentBalance: number; orderId: string; message: string }> {
  let nominal: number;
  let method: string = paymentMethod;
  let customNotes: string | undefined = notes;
  let hashVal: string | undefined = txHash;

  if (typeof amountOrUid === 'number') {
    nominal = amountOrUid;
    if (typeof amountOrMethod === 'string') method = amountOrMethod;
  } else {
    nominal = typeof amountOrMethod === 'number' ? amountOrMethod : 0;
  }

  if (nominal <= 0) {
    throw new Error('Deposit amount must be greater than Rp 0.');
  }

  // 2. Saat deposit, WAJIB simpan userId dari auth, bukan dari input:
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser) {
    throw new Error('Silakan login terlebih dahulu untuk melakukan deposit.');
  }

  const cleanTxHash = (hashVal || '').trim();
  if (!cleanTxHash) {
    throw new Error('Transaction link or hash (TxHash / TXID) is required as transfer proof.');
  }

  const userRef = doc(db, 'users', currentAuthUser.uid);
  const userSnap = await getDoc(userRef);
  let currentBalance = 0;
  if (userSnap.exists()) {
    const uData = userSnap.data() as any;
    currentBalance = typeof uData.saldo === 'number'
      ? uData.saldo
      : (typeof uData.walletBalance === 'number' ? uData.walletBalance : 0);
  }

  const orderId = `DEP-${Date.now().toString(36).toUpperCase()}`;

  // 2. Saat deposit, WAJIB simpan userId dari auth, bukan dari input:
  const orderDocRef = await addDoc(collection(db, "subscription_orders"), {
    userId: currentAuthUser.uid,
    nama: currentAuthUser.displayName || 'Host Streamer',
    jumlah: nominal,
    status: "pending",
    createdAt: serverTimestamp(),
    orderId,
    userEmail: currentAuthUser.email || '',
    userName: currentAuthUser.displayName || 'Host Streamer',
    planName: `Deposit Crypto ${method}`,
    price: nominal,
    currency: 'IDR',
    paymentMethod: method,
    type: 'deposit',
    txHash: cleanTxHash,
    notes: customNotes || `Deposit pending verifikasi admin/owner. TxHash: ${cleanTxHash}`
  });

  try {
    await logUserActivity({
      type: 'deposit',
      userId: currentAuthUser.uid,
      userEmail: currentAuthUser.email || '',
      userName: currentAuthUser.displayName || 'Host Streamer',
      title: `Pengajuan Deposit: Rp ${nominal.toLocaleString('id-ID')} (${method})`,
      amount: nominal,
      details: `Metode: ${method} • TxHash: ${cleanTxHash || '-'} • Status: Menunggu Verifikasi Admin`
    });
  } catch (e) {
    console.warn('Could not log deposit activity:', e);
  }

  return {
    success: true,
    status: 'pending',
    currentBalance,
    orderId: orderDocRef.id || orderId,
    message: 'Deposit submitted successfully with PENDING status! Awaiting verification confirmation from Owner or Admin.'
  };
}

/**
 * Approve pending deposit by Owner or Admin
 * Automatically credits user balance based on requested deposit amount
 */
export async function approvePendingDeposit(
  orderIdOrDocId: string,
  approverEmail: string
): Promise<{ success: boolean; newTargetBalance: number; orderId: string }> {
  const ordersCol = collection(db, 'subscription_orders');
  
  let targetDocRef = doc(ordersCol, orderIdOrDocId);
  let orderSnap = await getDoc(targetDocRef);

  if (!orderSnap.exists()) {
    const q = query(ordersCol, where('orderId', '==', orderIdOrDocId));
    const querySnap = await getDocs(q);
    if (querySnap.empty) {
      throw new Error('Deposit transaction data not found.');
    }
    targetDocRef = querySnap.docs[0].ref;
    orderSnap = querySnap.docs[0];
  }

  const orderData = orderSnap.data() as any;
  if (orderData.status !== 'pending') {
    throw new Error(`Transaction is not in pending status (Current status: ${orderData.status}).`);
  }

  const depositAmount = typeof orderData.jumlah === 'number' && !isNaN(orderData.jumlah)
    ? orderData.jumlah
    : (typeof orderData.price === 'number' && !isNaN(orderData.price) ? orderData.price : 0);

  if (depositAmount <= 0) {
    throw new Error('Deposit amount must be greater than Rp 0.');
  }

  // Find target user in users collection
  let targetUserRef = doc(db, 'users', orderData.userId);
  let userSnap = await getDoc(targetUserRef);

  if (!userSnap.exists() && orderData.userEmail) {
    const qEmail = query(collection(db, 'users'), where('email', '==', orderData.userEmail.trim().toLowerCase()));
    const qEmailSnap = await getDocs(qEmail);
    if (!qEmailSnap.empty) {
      targetUserRef = qEmailSnap.docs[0].ref;
      userSnap = qEmailSnap.docs[0];
    }
  }

  let currentBalance = 0;
  if (userSnap.exists()) {
    const userData = userSnap.data() as any;
    currentBalance = userData.saldo !== undefined && typeof userData.saldo === 'number'
      ? userData.saldo
      : (userData.walletBalance !== undefined && typeof userData.walletBalance === 'number'
          ? userData.walletBalance
          : 0);
  }

  const newBalance = currentBalance + depositAmount;

  // 1. Update saldo directly in Firestore users/{uid}.saldo (and sync walletBalance)
  if (userSnap.exists()) {
    await updateDoc(targetUserRef, {
      saldo: newBalance,
      walletBalance: newBalance,
      updatedAt: new Date().toISOString()
    });
  } else {
    await setDoc(targetUserRef, {
      uid: orderData.userId,
      email: orderData.userEmail || '',
      displayName: orderData.nama || orderData.userName || 'Host Streamer',
      saldo: newBalance,
      walletBalance: newBalance,
      role: 'member',
      isSubscribed: true,
      subscriptionPlan: 'Free Lifetime Access (Permanent)',
      subscriptionExpiresAt: 'LIFETIME',
      isLifetime: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 2. Update transaction status to 'success'
  await updateDoc(targetDocRef, {
    status: 'success',
    approvedBy: approverEmail,
    approvedAt: new Date().toISOString(),
    notes: `${orderData.notes || ''} • Approved by ${approverEmail} on ${new Date().toLocaleString('en-US')} (Balance credited +Rp ${depositAmount.toLocaleString('id-ID')})`
  });

  // 3. Sinkronisasi saldo ke backend database jika diperlukan
  try {
    fetch('/api/auth/sync-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: orderData.userId,
        email: orderData.userEmail,
        displayName: orderData.nama || orderData.userName,
        saldo: newBalance,
        walletBalance: newBalance
      })
    }).catch((e) => console.warn('Deposit approval backend sync notice:', e));
  } catch {}

  // 4. Emit custom event ke window browser agar UI yang aktif langsung mengupdate saldo
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sys_user_balance_approved', {
        detail: {
          userId: orderData.userId,
          userEmail: orderData.userEmail,
          newBalance,
          saldo: newBalance,
          depositAmount,
          orderId: orderData.orderId || targetDocRef.id
        }
      })
    );
  }

  return { success: true, newTargetBalance: newBalance, orderId: orderData.orderId || targetDocRef.id };
}

/**
 * Reject pending deposit by Owner or Admin
 */
export async function rejectPendingDeposit(
  orderIdOrDocId: string,
  rejecterEmail: string,
  reason: string = 'Transaction verification invalid or funds not received'
): Promise<{ success: boolean; orderId: string }> {
  const ordersCol = collection(db, 'subscription_orders');
  let targetDocRef = doc(ordersCol, orderIdOrDocId);
  let orderSnap = await getDoc(targetDocRef);

  if (!orderSnap.exists()) {
    const q = query(ordersCol, where('orderId', '==', orderIdOrDocId));
    const querySnap = await getDocs(q);
    if (querySnap.empty) {
      throw new Error('Deposit transaction data not found.');
    }
    targetDocRef = querySnap.docs[0].ref;
    orderSnap = querySnap.docs[0];
  }

  const orderData = orderSnap.data() as TransactionOrder;
  if (orderData.status !== 'pending') {
    throw new Error(`Transaction is not in pending status (Current status: ${orderData.status}).`);
  }

  await updateDoc(targetDocRef, {
    status: 'failed',
    rejectedBy: rejecterEmail,
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
    notes: `${orderData.notes || ''} • Rejected by ${rejecterEmail}: ${reason}`
  });

  return { success: true, orderId: orderData.orderId };
}

/**
 * Subscribe to pending deposits for Owner & Admin
 */
export function subscribeToPendingDeposits(callback: (orders: TransactionOrder[]) => void) {
  const ordersCol = collection(db, 'subscription_orders');
  const q = query(ordersCol, where('type', '==', 'deposit'), where('status', '==', 'pending'));
  return onSnapshot(
    q,
    (snap) => {
      const list: TransactionOrder[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as TransactionOrder) });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => {
      console.warn('Pending deposits snapshot listener notice (caught gracefully):', err?.message);
      callback([]);
    }
  );
}

/**
 * Withdraw funds from user wallet balance
 * Minimum withdrawal: Rp 100.000
 * Withdrawal fee: 3% of transaction amount
 */
export async function withdrawUserWallet(
  uid: string,
  amount: number,
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  },
  networkGasFee: number = 0
): Promise<{ success: boolean; newBalance: number; orderId: string; feeAmount: number; netPayoutAmount: number; networkGasFee: number }> {
  if (amount < 100000) {
    throw new Error('Minimum withdrawal amount is Rp 100,000.');
  }

  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error('User not found.');
  }

  const user = userSnap.data() as UserProfile;
  const currentBalance = typeof (user as any).saldo === 'number'
    ? (user as any).saldo
    : (user.walletBalance !== undefined ? user.walletBalance : 15000);

  if (amount > currentBalance) {
    throw new Error(`Insufficient balance. Your available balance: Rp ${currentBalance.toLocaleString('id-ID')}`);
  }

  // Withdrawal fee: 3% + Blockchain Network Gas Fee
  const feeRate = 0.03;
  const systemFeeAmount = Math.round(amount * feeRate);
  const feeAmount = systemFeeAmount + networkGasFee;
  const netPayoutAmount = Math.max(0, amount - feeAmount);

  const newBalance = currentBalance - amount;
  const currentLocked = typeof (user as any).lockedSaldo === 'number' ? (user as any).lockedSaldo : 0;
  const newLocked = currentLocked + amount;

  await updateDoc(userRef, {
    saldo: newBalance,
    walletBalance: newBalance,
    lockedSaldo: newLocked,
    affiliateWithdrawn: (user.affiliateWithdrawn || 0) + amount,
    updatedAt: new Date().toISOString()
  });

  const orderId = `WD-${Date.now().toString(36).toUpperCase()}`;

  // Realtime notification event for client UI
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sys_user_balance_approved', {
        detail: {
          userId: uid,
          userEmail: user.email,
          newBalance,
          saldo: newBalance,
          lockedSaldo: newLocked,
          orderId
        }
      })
    );
  }
  await createTransactionOrder({
    orderId,
    userId: uid,
    userEmail: user.email,
    userName: user.displayName || 'Host Streamer',
    planName: `Crypto Withdrawal (${bankDetails.bankName}) - 3% Fee + Gas Fee Deducted`,
    price: amount,
    feeAmount,
    netPayoutAmount,
    currency: 'IDR',
    status: 'pending',
    paymentMethod: `Crypto (${bankDetails.bankName})`,
    type: 'withdrawal',
    bankDetails,
    notes: `Address: ${bankDetails.accountNumber} | Amount: Rp ${amount.toLocaleString('id-ID')} | Fee (3%): Rp ${systemFeeAmount.toLocaleString('id-ID')} | Gas Fee: Rp ${networkGasFee.toLocaleString('id-ID')} | Total Potongan: Rp ${feeAmount.toLocaleString('id-ID')} | Net Payout: Rp ${netPayoutAmount.toLocaleString('id-ID')}`,
    createdAt: new Date().toISOString()
  });

  // Also record in affiliate_withdrawals collection for dual compatibility
  try {
    const withdrawalRef = doc(collection(db, 'affiliate_withdrawals'));
    await setDoc(withdrawalRef, {
      withdrawalId: orderId,
      userId: uid,
      userEmail: user.email,
      userName: user.displayName || 'Host Streamer',
      amount,
      feeAmount,
      netPayoutAmount,
      bankName: bankDetails.bankName,
      accountNumber: bankDetails.accountNumber,
      accountName: bankDetails.accountName,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Could not record to affiliate_withdrawals:', e);
  }

  // Realtime activity log
  try {
    await logUserActivity({
      type: 'withdrawal',
      userId: uid,
      userEmail: user.email,
      userName: user.displayName || 'Host Streamer',
      title: `Pengajuan Penarikan Crypto (${bankDetails.bankName}): Rp ${amount.toLocaleString('id-ID')}`,
      amount,
      details: `Wallet: ${bankDetails.accountNumber} • Fee (3% + Gas Fee): Rp ${feeAmount.toLocaleString('id-ID')} • Net: Rp ${netPayoutAmount.toLocaleString('id-ID')}`
    });
  } catch (e) {
    console.warn('Could not log withdrawal activity:', e);
  }

  return { success: true, newBalance, orderId, feeAmount, netPayoutAmount, networkGasFee };
}

/**
 * Transfer balance between users (minimum Rp 100.000) using username or email.
 */
export async function transferUserWallet(
  senderUid: string,
  recipientIdentifier: string,
  amount: number,
  notes?: string
): Promise<{
  success: boolean;
  recipientName: string;
  recipientEmail: string;
  newSenderBalance: number;
  orderId: string;
}> {
  if (amount < 100000) {
    throw new Error('Minimum balance transfer between users is Rp 100,000.');
  }

  const cleanTarget = recipientIdentifier.trim().toLowerCase();
  if (!cleanTarget) {
    throw new Error('Please enter the recipient username or email.');
  }

  // 1. Validate sender directly from Firestore users/{senderUid}.saldo
  const senderRef = doc(db, 'users', senderUid);
  const senderSnap = await getDoc(senderRef);
  if (!senderSnap.exists()) {
    throw new Error('Pengguna pengirim tidak ditemukan di database Firestore.');
  }

  const sender = senderSnap.data() as any;
  const currentSenderBalance = typeof sender.saldo === 'number'
    ? sender.saldo
    : (typeof sender.walletBalance === 'number' ? sender.walletBalance : 0);
  const senderEmail = sender.email || '';
  const senderName = sender.displayName || sender.email || 'Host Streamer';

  if (amount > currentSenderBalance) {
    throw new Error(
      `Insufficient balance. Current balance: Rp ${currentSenderBalance.toLocaleString('id-ID')}, transfer amount: Rp ${amount.toLocaleString('id-ID')}.`
    );
  }

  if (cleanTarget === senderEmail.toLowerCase() || cleanTarget === senderName.toLowerCase()) {
    throw new Error('You cannot transfer balance to your own account.');
  }

  // 2. Find recipient in users collection
  const usersCol = collection(db, 'users');
  let targetUserDoc: { id: string; data: UserProfile } | null = null;

  try {
    const qEmail = query(usersCol, where('email', '==', cleanTarget));
    const snapEmail = await getDocs(qEmail);
    if (!snapEmail.empty) {
      const docItem = snapEmail.docs[0];
      targetUserDoc = { id: docItem.id, data: docItem.data() as UserProfile };
    } else {
      const allUsersSnap = await getDocs(usersCol);
      for (const docItem of allUsersSnap.docs) {
        const uData = docItem.data() as UserProfile;
        const uEmail = (uData.email || '').toLowerCase();
        const uName = (uData.displayName || '').toLowerCase();
        const uHandle = (uData.streamerHandle || '').toLowerCase().replace('@', '');
        const searchHandle = cleanTarget.replace('@', '');

        if (uEmail === cleanTarget || uName === cleanTarget || uHandle === searchHandle) {
          targetUserDoc = { id: docItem.id, data: uData };
          break;
        }
      }
    }
  } catch (err) {
    console.warn('Firestore query error during user transfer lookup:', err);
  }

  const recipientName = targetUserDoc ? (targetUserDoc.data.displayName || targetUserDoc.data.email) : recipientIdentifier;
  const recipientEmail = targetUserDoc ? targetUserDoc.data.email : (cleanTarget.includes('@') ? cleanTarget : `${cleanTarget}@streamer.sys`);
  const recipientUid = targetUserDoc ? targetUserDoc.id : `user-${cleanTarget.replace(/[^a-z0-9]/g, '')}`;

  if (targetUserDoc && targetUserDoc.id === senderUid) {
    throw new Error('You cannot transfer balance to your own account.');
  }

  const newSenderBalance = currentSenderBalance - amount;

  // 3. Update sender saldo in Firestore
  await updateDoc(senderRef, {
    saldo: newSenderBalance,
    walletBalance: newSenderBalance
  });

  // Update recipient if registered in Firestore
  if (targetUserDoc) {
    const recipientRef = doc(db, 'users', recipientUid);
    const targetData = targetUserDoc.data as any;
    const currRecipBal = typeof targetData.saldo === 'number'
      ? targetData.saldo
      : (typeof targetData.walletBalance === 'number' ? targetData.walletBalance : 0);
    await updateDoc(recipientRef, {
      saldo: currRecipBal + amount,
      walletBalance: currRecipBal + amount
    });
  }

  // 4. Outgoing transfer record (Sender)
  const transferOrderId = `TRF-${Date.now().toString(36).toUpperCase()}`;
  await createTransactionOrder({
    orderId: transferOrderId,
    userId: senderUid,
    userEmail: senderEmail || 'streamer@sys.app',
    planName: `Transfer Balance to ${recipientName}`,
    price: amount,
    currency: 'IDR',
    status: 'success',
    paymentMethod: 'User Balance Transfer',
    type: 'transfer_out',
    notes: notes ? `${notes} (Recipient: ${recipientName})` : `Transfer balance to ${recipientName} (${recipientEmail})`,
    createdAt: new Date().toISOString()
  });

  // 5. Incoming transfer record (Recipient)
  const receiveOrderId = `TRFIN-${Date.now().toString(36).toUpperCase()}`;
  await createTransactionOrder({
    orderId: receiveOrderId,
    userId: recipientUid,
    userEmail: recipientEmail,
    planName: `Receive Balance from ${senderName}`,
    price: amount,
    currency: 'IDR',
    status: 'success',
    paymentMethod: 'User Balance Transfer',
    type: 'transfer_in',
    notes: notes ? `${notes} (Sender: ${senderName})` : `Received balance transfer from ${senderName}`,
    createdAt: new Date().toISOString()
  });

  return {
    success: true,
    recipientName,
    recipientEmail,
    newSenderBalance,
    orderId: transferOrderId
  };
}

/**
 * Subscribe to user withdrawal history
 */
export function subscribeToUserWithdrawals(
  userId: string,
  callback: (withdrawals: AffiliateWithdrawal[]) => void
) {
  const wdCol = collection(db, 'affiliate_withdrawals');
  const q = query(wdCol, where('userId', '==', userId));
  return onSnapshot(
    q,
    (snap) => {
      const list: AffiliateWithdrawal[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as AffiliateWithdrawal) });
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => {
      console.error('Error listening to withdrawals:', err);
    }
  );
}

/**
 * Subscribe to all streaming sessions
 */
export function subscribeToAllStreamingSessions(
  callback: (sessions: StreamingSessionLog[]) => void
) {
  const colRef = collection(db, 'streaming_sessions');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: StreamingSessionLog[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as StreamingSessionLog) });
      });
      callback(list);
    },
    (err) => {
      console.error('Error listening to all streaming sessions:', err);
    }
  );
}

/**
 * Subscribe to realtime registered users list
 */
export function subscribeToAllUsers(callback: (users: UserProfile[]) => void) {
  const usersCol = collection(db, 'users');
  return onSnapshot(
    usersCol,
    (snap) => {
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push({ uid: d.id, ...(d.data() as UserProfile) });
      });
      callback(list);
    },
    (err) => {
      console.error('Error listening to all users:', err);
    }
  );
}

/**
 * Owner adds an admin account.
 * Anyone added as an admin will have the exact same dashboard as the owner, with role "admin".
 */
export async function addAdminAccount(
  email: string,
  displayName: string = 'SYS Admin',
  notes: string = '',
  addedBy: string = OWNER_EMAIL
): Promise<AdminAccount> {
  const cleanEmail = sanitizeEmailKey(email);
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  // 1. Save to admins collection
  const adminDocRef = doc(db, 'admins', cleanEmail);
  const adminData: AdminAccount = {
    email: cleanEmail,
    displayName: displayName.trim() || 'SYS Admin',
    role: 'admin',
    addedBy,
    addedAt: new Date().toISOString(),
    notes: notes.trim()
  };
  await setDoc(adminDocRef, adminData);

  // 2. Also save to vip_hosts so all VIP permissions apply
  const vipDocRef = doc(db, 'vip_hosts', cleanEmail);
  await setDoc(vipDocRef, {
    email: cleanEmail,
    addedBy,
    addedAt: new Date().toISOString(),
    role: 'admin',
    plan: 'Administrator Sultan Permanen',
    planType: 'lifetime',
    expiresAt: 'LIFETIME',
    notes: `Designated Administrator by Owner ${addedBy}`
  });

  // 3. Update any user document with this email
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const userDocs = await getDocs(q);
    for (const d of userDocs.docs) {
      await updateDoc(d.ref, {
        role: 'admin',
        isSubscribed: true,
        subscriptionPlan: 'Administrator Sultan Permanen',
        subscriptionExpiresAt: 'LIFETIME',
        isLifetime: true,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Note updating user document for admin:', err);
  }

  // 4. Log activity
  await logUserActivity({
    type: 'admin_action',
    userId: cleanEmail,
    userEmail: cleanEmail,
    userName: displayName,
    title: `Admin account granted to ${cleanEmail}`,
    details: `Added by ${addedBy}. Notes: ${notes || '-'}`
  });

  return adminData;
}

/**
 * Remove an admin account
 */
export async function removeAdminAccount(email: string, removedBy: string = OWNER_EMAIL): Promise<void> {
  const cleanEmail = sanitizeEmailKey(email);
  if (!cleanEmail) return;

  if (cleanEmail === sanitizeEmailKey(OWNER_EMAIL)) {
    throw new Error('Cannot remove primary owner from admin privileges.');
  }

  // 1. Delete from admins
  await deleteDoc(doc(db, 'admins', cleanEmail));

  // 2. Delete from vip_hosts
  await deleteDoc(doc(db, 'vip_hosts', cleanEmail));

  // 3. Demote user in users collection
  try {
    const q = query(collection(db, 'users'), where('email', '==', cleanEmail));
    const userDocs = await getDocs(q);
    for (const d of userDocs.docs) {
      await updateDoc(d.ref, {
        role: 'member',
        updatedAt: new Date().toISOString()
      });
    }
  } catch (err) {
    console.warn('Note demoting user document:', err);
  }

  await logUserActivity({
    type: 'admin_action',
    userId: cleanEmail,
    userEmail: cleanEmail,
    userName: cleanEmail,
    title: `Admin privileges revoked for ${cleanEmail}`,
    details: `Revoked by ${removedBy}`
  });
}

/**
 * Subscribe to realtime list of admins
 */
export function subscribeToAdmins(callback: (admins: AdminAccount[]) => void) {
  const colRef = collection(db, 'admins');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: AdminAccount[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as AdminAccount) });
      });
      callback(list);
    },
    (err) => {
      console.error('Error listening to admins:', err);
    }
  );
}

/**
 * Owner or Admin directly updates a user's saldo
 */
export async function updateUserSaldoByAdmin(
  userId: string,
  newSaldo: number,
  reason: string,
  adminEmail: string,
  newLockedSaldo?: number
): Promise<{ success: boolean; newSaldo: number; newLockedSaldo?: number }> {
  if (newSaldo < 0) {
    throw new Error('Saldo cannot be negative.');
  }

  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error('User not found.');
  }

  const prevData = snap.data() as any;
  const oldSaldo = typeof prevData.saldo === 'number' ? prevData.saldo : (prevData.walletBalance ?? 0);
  const diff = newSaldo - oldSaldo;

  const updatePayload: any = {
    saldo: newSaldo,
    walletBalance: newSaldo,
    updatedAt: new Date().toISOString(),
    lastSaldoModifiedBy: adminEmail,
    lastSaldoModificationReason: reason
  };

  if (typeof newLockedSaldo === 'number' && newLockedSaldo >= 0) {
    updatePayload.lockedSaldo = newLockedSaldo;
  }

  await updateDoc(userRef, updatePayload);

  // Record transaction order for user audit trail
  const orderId = `ADJ-${Date.now().toString(36).toUpperCase()}`;
  await createTransactionOrder({
    orderId,
    userId,
    userEmail: prevData.email || '',
    userName: prevData.displayName || 'Host Streamer',
    planName: `Saldo Adjustment by Admin (${diff >= 0 ? '+' : ''}${diff.toLocaleString('id-ID')})`,
    price: Math.abs(diff),
    currency: 'IDR',
    status: 'success',
    paymentMethod: 'Admin Direct Adjustment',
    type: diff >= 0 ? 'bonus' : 'withdrawal',
    notes: `Reason: ${reason || 'Admin adjustment'}. Authorized by ${adminEmail}. Old balance: Rp ${oldSaldo.toLocaleString('id-ID')} -> New balance: Rp ${newSaldo.toLocaleString('id-ID')}`,
    createdAt: new Date().toISOString()
  });

  // Log user activity
  await logUserActivity({
    type: 'admin_action',
    userId,
    userEmail: prevData.email || '',
    userName: prevData.displayName || 'User',
    title: `Saldo modified by ${adminEmail}`,
    amount: newSaldo,
    details: `Old: Rp ${oldSaldo.toLocaleString('id-ID')} -> New: Rp ${newSaldo.toLocaleString('id-ID')}. Reason: ${reason}`
  });

  // Emit event so active windows update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sys_user_balance_approved', {
        detail: {
          userId,
          userEmail: prevData.email,
          newBalance: newSaldo,
          saldo: newSaldo,
          depositAmount: diff,
          orderId
        }
      })
    );
  }

  return { success: true, newSaldo };
}

/**
 * Subscribe to all subscription and deposit orders for Admin
 */
export function subscribeToAllSubscriptionOrders(callback: (orders: TransactionOrder[]) => void) {
  const colRef = collection(db, 'subscription_orders');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: TransactionOrder[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as TransactionOrder) });
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(list);
    },
    (err) => {
      console.error('Error listening to all subscription orders:', err);
    }
  );
}

/**
 * Subscribe to Jackpot settings
 */
export function subscribeToJackpotSettings(callback: (settings: JackpotSettings) => void) {
  const docRef = doc(db, 'system_settings', 'jackpot');
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as JackpotSettings);
      } else {
        const defaultSettings: JackpotSettings = {
          poolAmount: 50000000,
          winChance: 100,
          minBet: 10000,
          forceNextUser: '',
          forceNextNominal: 0,
          updatedAt: new Date().toISOString(),
          updatedBy: 'System'
        };
        callback(defaultSettings);
      }
    },
    (err) => {
      console.error('Error listening to jackpot settings:', err);
    }
  );
}

/**
 * Update Jackpot Settings
 */
export async function updateJackpotSettings(
  updates: Partial<JackpotSettings>,
  adminEmail: string
): Promise<void> {
  const docRef = doc(db, 'system_settings', 'jackpot');
  const snap = await getDoc(docRef);

  const payload: JackpotSettings = {
    poolAmount: updates.poolAmount ?? 50000000,
    winChance: updates.winChance ?? 100,
    minBet: updates.minBet ?? 10000,
    forceNextUser: updates.forceNextUser ?? '',
    forceNextNominal: updates.forceNextNominal ?? 0,
    updatedAt: new Date().toISOString(),
    updatedBy: adminEmail,
    ...(snap.exists() ? snap.data() : {}),
    ...updates
  };

  await setDoc(docRef, payload, { merge: true });

  await logUserActivity({
    type: 'jackpot',
    userId: 'system',
    userEmail: adminEmail,
    userName: 'Admin / Owner',
    title: `Jackpot Settings Updated`,
    amount: updates.poolAmount,
    details: `Pool: Rp ${(updates.poolAmount ?? 50000000).toLocaleString('id-ID')}, Chance: 1 in ${updates.winChance ?? 100}`
  });
}

/**
 * Manual Jackpot Payout by Admin to a user
 */
export async function distributeManualJackpot(
  userId: string,
  userName: string,
  userEmail: string,
  amount: number,
  adminEmail: string,
  notes: string = 'Manual Grand Jackpot Payout'
): Promise<{ success: boolean; newBalance: number }> {
  if (amount <= 0) {
    throw new Error('Jackpot amount must be greater than 0.');
  }

  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) {
    throw new Error('User not found.');
  }

  const userData = userSnap.data() as any;
  const currentSaldo = typeof userData.saldo === 'number' ? userData.saldo : (userData.walletBalance ?? 0);
  const newBalance = currentSaldo + amount;

  // 1. Credit balance
  await updateDoc(userRef, {
    saldo: newBalance,
    walletBalance: newBalance,
    updatedAt: new Date().toISOString()
  });

  // 2. Record jackpot history
  const historyRef = doc(collection(db, 'jackpot_history'));
  await setDoc(historyRef, {
    userId,
    userName: userName || userData.displayName || 'Host Streamer',
    userEmail: userEmail || userData.email || '',
    amount,
    gameType: 'Manual Admin Award',
    wonAt: new Date().toISOString(),
    notes: `${notes} by ${adminEmail}`
  });

  // 3. Record order
  const orderId = `JKP-${Date.now().toString(36).toUpperCase()}`;
  await createTransactionOrder({
    orderId,
    userId,
    userEmail: userEmail || userData.email || '',
    userName: userName || userData.displayName || 'Host Streamer',
    planName: `🔥 GRAND JACKPOT PRIZE (Rp ${amount.toLocaleString('id-ID')})`,
    price: amount,
    currency: 'IDR',
    status: 'success',
    paymentMethod: 'Jackpot Payout',
    type: 'bonus',
    notes: `Jackpot awarded by ${adminEmail}. Notes: ${notes}`,
    createdAt: new Date().toISOString()
  });

  // 4. Update last winner in settings
  const settingsRef = doc(db, 'system_settings', 'jackpot');
  await setDoc(
    settingsRef,
    {
      lastWinner: {
        name: userName || userData.displayName || 'Winner',
        email: userEmail || userData.email || '',
        amount,
        wonAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    },
    { merge: true }
  );

  // 5. Log activity
  await logUserActivity({
    type: 'jackpot',
    userId,
    userEmail: userEmail || userData.email || '',
    userName: userName || userData.displayName || 'Winner',
    title: `🏆 Jackpot Rp ${amount.toLocaleString('id-ID')} Awarded to ${userName}`,
    amount,
    details: `Disbursed by ${adminEmail}. Notes: ${notes}`
  });

  // 6. Emit event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sys_user_balance_approved', {
        detail: {
          userId,
          userEmail,
          newBalance,
          saldo: newBalance,
          depositAmount: amount,
          orderId
        }
      })
    );
  }

  return { success: true, newBalance };
}

/**
 * Subscribe to Jackpot History
 */
export function subscribeToJackpotHistory(callback: (records: JackpotWinnerRecord[]) => void) {
  const colRef = collection(db, 'jackpot_history');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: JackpotWinnerRecord[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as JackpotWinnerRecord) });
      });
      list.sort((a, b) => new Date(b.wonAt || 0).getTime() - new Date(a.wonAt || 0).getTime());
      callback(list);
    },
    (err) => {
      console.error('Error listening to jackpot history:', err);
    }
  );
}

/**
 * Approve a pending withdrawal by Owner or Admin
 */
export async function approvePendingWithdrawal(
  orderId: string,
  approverEmail: string,
  payoutTxHash: string = ''
): Promise<void> {
  const ordersCol = collection(db, 'subscription_orders');
  const q = query(ordersCol, where('orderId', '==', orderId));
  const querySnap = await getDocs(q);

  let docRef: any = null;
  let orderData: any = null;

  if (!querySnap.empty) {
    docRef = querySnap.docs[0].ref;
    orderData = querySnap.docs[0].data();
  } else {
    const directDoc = doc(ordersCol, orderId);
    const snap = await getDoc(directDoc);
    if (snap.exists()) {
      docRef = directDoc;
      orderData = snap.data();
    }
  }

  if (!docRef || !orderData) {
    throw new Error('Withdrawal order not found.');
  }

  await updateDoc(docRef, {
    status: 'success',
    approvedBy: approverEmail,
    approvedAt: new Date().toISOString(),
    txHash: payoutTxHash.trim() || undefined,
    notes: `${orderData.notes || ''} • Approved & paid out by ${approverEmail} on ${new Date().toLocaleString('en-US')}${payoutTxHash ? ' • Payout TxHash: ' + payoutTxHash : ''}`
  });

  // Deduct from user's lockedSaldo permanently
  if (orderData.userId && orderData.price) {
    try {
      const userRef = doc(db, 'users', orderData.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data() as any;
        const currentLocked = typeof uData.lockedSaldo === 'number' ? uData.lockedSaldo : 0;
        const newLocked = Math.max(0, currentLocked - (orderData.price || 0));
        await updateDoc(userRef, {
          lockedSaldo: newLocked,
          updatedAt: new Date().toISOString()
        });

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('sys_user_balance_approved', {
              detail: {
                userId: orderData.userId,
                userEmail: orderData.userEmail,
                lockedSaldo: newLocked,
                orderId
              }
            })
          );
        }
      }
    } catch (e) {
      console.warn('Note updating user lockedSaldo on approve:', e);
    }
  }

  // Also update in affiliate_withdrawals if present
  try {
    const qWd = query(collection(db, 'affiliate_withdrawals'), where('withdrawalId', '==', orderId));
    const wdSnap = await getDocs(qWd);
    for (const d of wdSnap.docs) {
      await updateDoc(d.ref, {
        status: 'completed',
        approvedBy: approverEmail,
        payoutTxHash: payoutTxHash.trim() || undefined
      });
    }
  } catch (e) {
    console.warn('Note updating affiliate_withdrawals:', e);
  }

  await logUserActivity({
    type: 'withdrawal',
    userId: orderData.userId,
    userEmail: orderData.userEmail,
    userName: orderData.userName || 'Streamer',
    title: `Withdrawal of Rp ${(orderData.price || 0).toLocaleString('id-ID')} Approved`,
    amount: orderData.price,
    details: `Approved by ${approverEmail}.${payoutTxHash ? ' TxHash: ' + payoutTxHash : ''}`
  });
}

/**
 * Reject a withdrawal request and automatically refund the balance back to user's saldo!
 */
export async function rejectPendingWithdrawal(
  orderId: string,
  rejectorEmail: string,
  reason: string = 'Rejected by Admin'
): Promise<void> {
  const ordersCol = collection(db, 'subscription_orders');
  const q = query(ordersCol, where('orderId', '==', orderId));
  const querySnap = await getDocs(q);

  let docRef: any = null;
  let orderData: any = null;

  if (!querySnap.empty) {
    docRef = querySnap.docs[0].ref;
    orderData = querySnap.docs[0].data();
  } else {
    const directDoc = doc(ordersCol, orderId);
    const snap = await getDoc(directDoc);
    if (snap.exists()) {
      docRef = directDoc;
      orderData = snap.data();
    }
  }

  if (!docRef || !orderData) {
    throw new Error('Withdrawal order not found.');
  }

  const refundAmount = orderData.price || 0;

  // 1. Mark order as rejected
  await updateDoc(docRef, {
    status: 'failed',
    rejectedBy: rejectorEmail,
    rejectedAt: new Date().toISOString(),
    rejectionReason: reason,
    notes: `${orderData.notes || ''} • Rejected by ${rejectorEmail}: ${reason} (Amount Rp ${refundAmount.toLocaleString('id-ID')} refunded back to saldo)`
  });

  // 2. Refund balance back to user's saldo and release lockedSaldo
  if (orderData.userId && refundAmount > 0) {
    const userRef = doc(db, 'users', orderData.userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const uData = userSnap.data() as any;
      const currentSaldo = typeof uData.saldo === 'number' ? uData.saldo : (uData.walletBalance ?? 0);
      const currentLocked = typeof uData.lockedSaldo === 'number' ? uData.lockedSaldo : 0;
      const refundedSaldo = currentSaldo + refundAmount;
      const newLocked = Math.max(0, currentLocked - refundAmount);

      await updateDoc(userRef, {
        saldo: refundedSaldo,
        walletBalance: refundedSaldo,
        lockedSaldo: newLocked,
        affiliateWithdrawn: Math.max(0, (uData.affiliateWithdrawn || 0) - refundAmount),
        updatedAt: new Date().toISOString()
      });

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('sys_user_balance_approved', {
            detail: {
              userId: orderData.userId,
              userEmail: orderData.userEmail,
              newBalance: refundedSaldo,
              saldo: refundedSaldo,
              lockedSaldo: newLocked,
              depositAmount: refundAmount,
              orderId: `REF-${orderId}`
            }
          })
        );
      }
    }
  }

  await logUserActivity({
    type: 'withdrawal',
    userId: orderData.userId,
    userEmail: orderData.userEmail,
    userName: orderData.userName || 'Streamer',
    title: `Withdrawal of Rp ${refundAmount.toLocaleString('id-ID')} Rejected & Refunded`,
    amount: refundAmount,
    details: `Reason: ${reason}. Refunded by ${rejectorEmail}`
  });
}

/**
 * Log a user activity to Firestore
 */
export async function logUserActivity(
  activity: Omit<UserActivityLog, 'id' | 'createdAt'>
): Promise<void> {
  try {
    const colRef = collection(db, 'user_activities');
    await addDoc(colRef, {
      ...activity,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Note logging user activity:', err);
  }
}

/**
 * Subscribe to all user activities
 */
export function subscribeToAllUserActivities(callback: (activities: UserActivityLog[]) => void) {
  const colRef = collection(db, 'user_activities');
  return onSnapshot(
    colRef,
    (snap) => {
      const list: UserActivityLog[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as UserActivityLog) });
      });
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(list);
    },
    (err) => {
      console.error('Error listening to user activities:', err);
    }
  );
}

/**
 * Automatically credit user balance and record transaction order for completed NOWPayments payment
 */
export async function recordSuccessfulNowPaymentDeposit(params: {
  userId: string;
  userEmail: string;
  userName: string;
  nominalIdr: number;
  paymentId: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  txHash?: string;
  network?: string;
}): Promise<{ success: boolean; newBalance: number; orderId: string; status?: string }> {
  const {
    userId,
    userEmail,
    userName,
    nominalIdr,
    paymentId,
    payAddress,
    payAmount,
    payCurrency,
    txHash,
    network
  } = params;

  if (!userId || !nominalIdr || nominalIdr <= 0) {
    throw new Error('Data pembayaran deposit tidak valid.');
  }

  // 1. Prevent duplicate credit for the same paymentId
  const ordersCol = collection(db, 'subscription_orders');
  const qExisting = query(ordersCol, where('nowpaymentsPaymentId', '==', paymentId));
  const snapExisting = await getDocs(qExisting);
  if (!snapExisting.empty) {
    const existingDoc = snapExisting.docs[0].data() as TransactionOrder;
    if (existingDoc.status === 'success') {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const currentBalance = userSnap.exists()
        ? (userSnap.data().saldo ?? userSnap.data().walletBalance ?? 0)
        : 0;
      return { success: true, newBalance: currentBalance, orderId: existingDoc.orderId };
    }
  }

  // 2. Fetch user to obtain current balance (Do NOT credit balance yet; all deposits must be PENDING before admin verification)
  let userRef = doc(db, 'users', userId);
  let userSnap = await getDoc(userRef);

  if (!userSnap.exists() && userEmail) {
    const qEmail = query(collection(db, 'users'), where('email', '==', userEmail.trim().toLowerCase()));
    const qEmailSnap = await getDocs(qEmail);
    if (!qEmailSnap.empty) {
      userRef = qEmailSnap.docs[0].ref;
      userSnap = qEmailSnap.docs[0];
    }
  }

  let currentBalance = 0;
  if (userSnap.exists()) {
    const userData = userSnap.data() as any;
    currentBalance = typeof userData.saldo === 'number'
      ? userData.saldo
      : (typeof userData.walletBalance === 'number' ? userData.walletBalance : 0);
  } else {
    // If user document does not exist yet, initialize baseline record with 0 balance
    await setDoc(userRef, {
      uid: userId,
      email: userEmail || '',
      displayName: userName || 'Host Streamer',
      saldo: 0,
      walletBalance: 0,
      role: 'member',
      isSubscribed: true,
      subscriptionPlan: 'Free Lifetime Access (Permanent)',
      subscriptionExpiresAt: 'LIFETIME',
      isLifetime: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // 3. Record deposit order with status PENDING (Wajib verifikasi oleh administrator)
  const orderId = `NOW-DEP-${Date.now().toString(36).toUpperCase()}`;
  const orderRef = doc(collection(db, 'subscription_orders'));
  const cleanTxHash = txHash || `np_${paymentId}`;
  const orderData: TransactionOrder = {
    orderId,
    userId,
    userEmail: userEmail || '',
    userName: userName || 'Host Streamer',
    planName: `Deposit Crypto NOWPayments (${payAmount} ${payCurrency.toUpperCase()})`,
    price: nominalIdr,
    currency: 'IDR',
    status: 'pending', // Wajib status: 'pending' sebelum diverifikasi administrator!
    paymentMethod: 'NOWPayments Otomatis',
    type: 'deposit',
    txHash: cleanTxHash,
    createdAt: new Date().toISOString(),
    notes: `Pembayaran crypto via NOWPayments (${payAmount} ${payCurrency.toUpperCase()}) telah terkonfirmasi di blockchain. Status: PENDING (Menunggu verifikasi & persetujuan Administrator sebelum saldo dikreditkan). ID: ${paymentId}`
  };

  (orderData as any).nowpaymentsPaymentId = paymentId;
  (orderData as any).payAddress = payAddress;
  (orderData as any).payAmount = payAmount;
  (orderData as any).payCurrency = payCurrency;
  (orderData as any).jumlah = nominalIdr;

  await setDoc(orderRef, orderData);

  // 4. Log activity as pending deposit awaiting admin verification
  await logUserActivity({
    type: 'deposit',
    userId,
    userEmail: userEmail || '',
    userName: userName || 'Host Streamer',
    title: `📥 Pengajuan Deposit NOWPayments: Rp ${nominalIdr.toLocaleString('id-ID')}`,
    amount: nominalIdr,
    details: `${payAmount} ${payCurrency.toUpperCase()} (${network || 'Crypto'}) • Status: PENDING (Menunggu Verifikasi Administrator) • ID: ${paymentId}`
  });

  return { success: true, newBalance: currentBalance, orderId, status: 'pending' as const };
}


