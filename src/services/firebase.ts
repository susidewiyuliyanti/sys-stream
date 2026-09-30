/*
 * ============================================================
 * SYS STREAM
 * Firebase Compatibility Service
 * ============================================================
 *
 * IMPORTANT:
 * File ini TIDAK lagi menggunakan Firebase.
 *
 * Nama file sengaja dipertahankan sementara agar komponen lama
 * yang masih melakukan import dari:
 *
 *   ../services/firebase
 *
 * tidak langsung rusak.
 *
 * Semua operasi sekarang diarahkan ke:
 *
 *   Cloudflare Pages API
 *          ↓
 *   Hyperdrive
 *          ↓
 *   Neon PostgreSQL
 *
 * Setelah seluruh frontend selesai dimigrasikan, file ini dapat
 * diganti nama menjadi api.ts dan semua import lama dihapus.
 * ============================================================
 */

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
  UserActivityLog,
} from '../types';

import {
  getCurrentUser,
  logoutUser as authLogoutUser,
} from '../lib/auth';

/* ============================================================
   CONSTANTS
   ============================================================ */

export const OWNER_EMAIL =
  'susidewiyuliyanti@gmail.com';

export const ADMIN_EMAILS = [
  OWNER_EMAIL,
];

/*
 * Polling default untuk menggantikan Firebase onSnapshot.
 *
 * Firebase:
 *   onSnapshot(...)
 *
 * Sekarang:
 *   fetch(...) setiap beberapa detik.
 *
 * Nanti bisa diganti WebSocket/SSE jika diperlukan.
 */
const DEFAULT_POLL_INTERVAL = 5000;


/* ============================================================
   LOCAL TYPES
   ============================================================ */

type Unsubscribe = () => void;

type ApiResponse<T = any> = {
  success?: boolean;
  message?: string;
  data?: T;
  user?: T;
  profile?: T;
  result?: T;
  [key: string]: any;
};


/* ============================================================
   GENERIC API CLIENT
   ============================================================ */

async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('sys_stream_auth_token') ||
        localStorage.getItem('blindbox_jwt_token')
      : null;

  const headers = new Headers(
    options.headers || {}
  );

  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  let payload: any = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `API request failed with status ${response.status}`;

    const error: any = new Error(message);

    error.status = response.status;
    error.code =
      payload?.code ||
      `HTTP_${response.status}`;

    error.response = payload;

    throw error;
  }

  /*
   * Be flexible terhadap berbagai bentuk response.
   */
  if (
    payload &&
    payload.data !== undefined &&
    Object.keys(payload).length <= 3
  ) {
    return payload.data as T;
  }

  return payload as T;
}


/* ============================================================
   HTTP HELPERS
   ============================================================ */

async function apiGet<T = any>(
  path: string
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'GET',
  });
}

async function apiPost<T = any>(
  path: string,
  body?: any
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });
}

async function apiPut<T = any>(
  path: string,
  body?: any
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PUT',
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });
}

async function apiPatch<T = any>(
  path: string,
  body?: any
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    body:
      body === undefined
        ? undefined
        : JSON.stringify(body),
  });
}

async function apiDelete<T = any>(
  path: string
): Promise<T> {
  return apiFetch<T>(path, {
    method: 'DELETE',
  });
}


/* ============================================================
   RESPONSE NORMALIZATION
   ============================================================ */

function extractData<T = any>(
  response: any
): T {
  if (
    response &&
    typeof response === 'object'
  ) {
    if (response.data !== undefined) {
      return response.data as T;
    }

    if (response.result !== undefined) {
      return response.result as T;
    }

    if (response.user !== undefined) {
      return response.user as T;
    }

    if (response.profile !== undefined) {
      return response.profile as T;
    }
  }

  return response as T;
}


function extractArray<T = any>(
  response: any
): T[] {
  const value = extractData<any>(response);

  if (Array.isArray(value)) {
    return value;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  if (Array.isArray(value?.rows)) {
    return value.rows;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.rows)) {
    return response.rows;
  }

  return [];
}


/* ============================================================
   POLLING SUBSCRIPTION
   Replacement for Firestore onSnapshot
   ============================================================ */

function createPollingSubscription<T>(
  loader: () => Promise<T>,
  callback: (value: T) => void,
  interval = DEFAULT_POLL_INTERVAL
): Unsubscribe {
  let active = true;

  const execute = async () => {
    if (!active) return;

    try {
      const value = await loader();

      if (active) {
        callback(value);
      }
    } catch (error) {
      console.error(
        'API realtime subscription error:',
        error
      );
    }
  };

  void execute();

  const timer = window.setInterval(
    execute,
    interval
  );

  return () => {
    active = false;
    window.clearInterval(timer);
  };
}


/* ============================================================
   EMAIL HELPERS
   ============================================================ */

export function sanitizeEmailKey(
  email: string
): string {
  return String(email || '')
    .trim()
    .toLowerCase();
}


/* ============================================================
   DATA SANITIZATION
   ============================================================ */

export function sanitizeFirestoreData<
  T extends Record<string, any>
>(
  data: T
): Partial<T> {
  const result: Partial<T> = {};

  for (const key of Object.keys(data)) {
    if (data[key] !== undefined) {
      (result as Record<string, any>)[key] = data[key];
    }
  }

  return result;
}


/*
 * Alias mới.
 */
export const sanitizeApiData =
  sanitizeFirestoreData;


/* ============================================================
   BAN CHECK
   ============================================================ */

export async function checkIsBanned(
  email: string
): Promise<boolean> {
  const cleanEmail =
    sanitizeEmailKey(email);

  if (!cleanEmail) {
    return false;
  }

  if (
    cleanEmail ===
    sanitizeEmailKey(OWNER_EMAIL)
  ) {
    return false;
  }

  try {
    const response = await apiGet<any>(
      `/api/users/banned/check?email=${encodeURIComponent(
        cleanEmail
      )}`
    );

    if (
      typeof response === 'boolean'
    ) {
      return response;
    }

    return Boolean(
      response?.banned ??
      response?.isBanned ??
      extractData(response)
    );
  } catch (error) {
    console.warn(
      'Error checking banned user:',
      error
    );

    return false;
  }
}


/* ============================================================
   VIP / ADMIN CHECK
   ============================================================ */

export async function checkIsVipHost(
  email: string
): Promise<boolean> {
  const cleanEmail =
    sanitizeEmailKey(email);

  if (!cleanEmail) {
    return false;
  }

  if (
    cleanEmail ===
    sanitizeEmailKey(OWNER_EMAIL)
  ) {
    return true;
  }

  try {
    const response = await apiGet<any>(
      `/api/users/vip/check?email=${encodeURIComponent(
        cleanEmail
      )}`
    );

    if (
      typeof response === 'boolean'
    ) {
      return response;
    }

    return Boolean(
      response?.isVip ??
      response?.isVipHost ??
      response?.isAdmin ??
      extractData(response)
    );
  } catch (error) {
    console.warn(
      'Error checking VIP status:',
      error
    );

    return false;
  }
}


/* ============================================================
   LOGOUT
   ============================================================ */

export async function logoutUser(): Promise<void> {
  try {
    await apiPost(
      '/api/auth/logout'
    );
  } catch {
    /*
     * Logout lokal tetap dilakukan meskipun
     * endpoint server belum tersedia.
     */
  }

  await authLogoutUser();

  if (
    typeof window !== 'undefined'
  ) {
    localStorage.removeItem(
      'sys_stream_auth_token'
    );

    localStorage.removeItem(
      'blindbox_jwt_token'
    );

    localStorage.removeItem(
      'sys_stream_auth_user'
    );
  }
}


/* ============================================================
   REFERRAL CODE
   ============================================================ */

export function generateReferralCode(
  uid: string,
  email: string
): string {
  const source =
    String(uid || email || '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();

  const suffix =
    source.slice(-6) ||
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  return `SYS-${suffix}`;
}


/* ============================================================
   USER PROFILE
   ============================================================ */

export async function syncUserProfile(
  user: any
): Promise<UserProfile> {
  if (!user) {
    throw new Error(
      'User authentication data is required.'
    );
  }

  const uid =
    user.uid ||
    user.id ||
    user.cuid;

  const email =
    user.email || '';

  const displayName =
    user.displayName ||
    user.display_name ||
    email ||
    'Host Streamer';

  /*
   * Gunakan backend sebagai sumber kebenaran.
   */
  try {
    const response =
      await apiPost<any>(
        '/api/auth/sync-session',
        {
          uid,
          email,
          displayName,
          role:
            user.role ||
            'USER',
          walletBalance:
            user.walletBalance ??
            user.saldo ??
            0,
        }
      );

    const profile =
      extractData<any>(response);

    if (profile) {
      return profile as UserProfile;
    }
  } catch (error) {
    console.warn(
      'Backend syncUserProfile failed:',
      error
    );
  }

  /*
   * Fallback profile.
   */
  return {
    uid,
    email,
    displayName,
    photoURL: user.photoURL || '',
    createdAt: user.createdAt || new Date().toISOString(),
    role:
      user.role ||
      'member',
    saldo:
      user.saldo ??
      user.walletBalance ??
      0,
    walletBalance:
      user.walletBalance ??
      user.saldo ??
      0,
    lockedSaldo:
      user.lockedSaldo ??
      0,
    referralCode:
      user.referralCode ||
      generateReferralCode(
        uid,
        email
      ),
    referralCount:
      user.referralCount ??
      0,
    affiliateEarnings:
      user.affiliateEarnings ??
      0,
    affiliateWithdrawn:
      user.affiliateWithdrawn ??
      0,
    isSubscribed:
      user.isSubscribed ??
      true,
    subscriptionPlan:
      user.subscriptionPlan ||
      'Akses Bebas Gratis (Permanen)',
    subscriptionExpiresAt:
      user.subscriptionExpiresAt,
    isLifetime:
      user.isLifetime ??
      true,
    isBanned:
      user.isBanned ??
      false,
    isBlacklisted:
      user.isBlacklisted ??
      false,
  } as UserProfile;
}


/* ============================================================
   VIP HOST
   ============================================================ */

export async function addVipHostAccount(
  email: string,
  addedByEmail: string,
  notes = '',
  planType:
    | '1_month'
    | '3_months'
    | '1_year'
    | 'lifetime' = 'lifetime'
): Promise<void> {
  const cleanEmail =
    sanitizeEmailKey(email);

  if (!cleanEmail) {
    throw new Error(
      'Email is required.'
    );
  }

  await apiPost(
    '/api/admin/vip-hosts',
    {
      email: cleanEmail,
      addedBy: addedByEmail,
      notes,
      planType,
    }
  );
}


export async function removeVipHostAccount(
  email: string
): Promise<void> {
  const cleanEmail =
    sanitizeEmailKey(email);

  await apiDelete(
    `/api/admin/vip-hosts/${encodeURIComponent(
      cleanEmail
    )}`
  );
}


export function subscribeToVipHosts(
  callback: (
    hosts: VIPHostAccount[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          '/api/admin/vip-hosts'
        );

      return extractArray<VIPHostAccount>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   SUBSCRIPTION
   ============================================================ */

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
  await apiPost(
    '/api/subscriptions/activate',
    {
      uid,
      planName,
      durationDays,
      ...paymentDetails,
    }
  );
}


/* ============================================================
   USER PROFILE SUBSCRIPTION
   ============================================================ */

export function subscribeToUserProfile(
  uid: string,
  callback: (
    profile: UserProfile | null
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      try {
        const response =
          await apiGet<any>(
            `/api/user/profile?uid=${encodeURIComponent(
              uid
            )}`
          );

        return (
          extractData<UserProfile>(
            response
          ) || null
        );
      } catch {
        return null;
      }
    },
    callback
  );
}


/* ============================================================
   BAN USER
   ============================================================ */

export async function banUserAccount(
  email: string,
  reason = 'Suspended by Primary Owner',
  bannedByEmail = OWNER_EMAIL
): Promise<void> {
  const cleanEmail =
    sanitizeEmailKey(email);

  if (
    !cleanEmail ||
    !cleanEmail.includes('@')
  ) {
    throw new Error(
      'Invalid email address.'
    );
  }

  if (
    cleanEmail ===
    sanitizeEmailKey(OWNER_EMAIL)
  ) {
    throw new Error(
      'Primary Owner account cannot be suspended.'
    );
  }

  await apiPost(
    '/api/admin/banned-users',
    {
      email: cleanEmail,
      reason,
      bannedBy: bannedByEmail,
    }
  );
}


/* ============================================================
   UNBAN
   ============================================================ */

export async function unbanUserAccount(
  email: string
): Promise<void> {
  const cleanEmail =
    sanitizeEmailKey(email);

  await apiDelete(
    `/api/admin/banned-users/${encodeURIComponent(
      cleanEmail
    )}`
  );
}


/* ============================================================
   DELETE USER
   ============================================================ */

export async function deleteUserPermanently(
  email: string
): Promise<void> {
  const cleanEmail =
    sanitizeEmailKey(email);

  if (!cleanEmail) {
    throw new Error(
      'Invalid email address.'
    );
  }

  if (
    cleanEmail ===
    sanitizeEmailKey(OWNER_EMAIL)
  ) {
    throw new Error(
      'Primary Owner account cannot be deleted.'
    );
  }

  await apiDelete(
    `/api/admin/users/${encodeURIComponent(
      cleanEmail
    )}`
  );
}


/* ============================================================
   BANNED USERS SUBSCRIPTION
   ============================================================ */

export function subscribeToBannedUsers(
  callback: (
    banned: BannedUserAccount[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          '/api/admin/banned-users'
        );

      return extractArray<BannedUserAccount>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   UPDATE USER PROFILE
   ============================================================ */

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  const sanitizedUpdates =
    sanitizeApiData(
      updates as Record<string, any>
    );

  /*
   * Saldo dan walletBalance tetap sinkron
   * seperti behavior Firebase lama.
   */
  if (
    sanitizedUpdates.saldo !== undefined &&
    sanitizedUpdates.walletBalance ===
      undefined
  ) {
    sanitizedUpdates.walletBalance =
      sanitizedUpdates.saldo;
  }

  if (
    sanitizedUpdates.walletBalance !==
      undefined &&
    sanitizedUpdates.saldo === undefined
  ) {
    sanitizedUpdates.saldo =
      sanitizedUpdates.walletBalance;
  }

  await apiPatch(
    `/api/user/profile/${encodeURIComponent(
      uid
    )}`,
    sanitizedUpdates
  );
}


/* ============================================================
   TRANSACTION ORDER
   ============================================================ */

export async function createTransactionOrder(
  order: Omit<TransactionOrder, 'id'>
): Promise<string> {
  const orderId =
    order.orderId ||
    `SYS-${Date.now()
      .toString(36)
      .toUpperCase()}`;

  const response =
    await apiPost<any>(
      '/api/orders',
      {
        ...order,
        orderId,
      }
    );

  return (
    response?.id ||
    response?.orderId ||
    response?.data?.id ||
    orderId
  );
}


/* ============================================================
   USER ORDERS
   ============================================================ */

export function subscribeToUserOrders(
  userId: string,
  callback: (
    orders: TransactionOrder[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          `/api/orders/user/${encodeURIComponent(
            userId
          )}`
        );

      return extractArray<TransactionOrder>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   STREAMING SESSION
   ============================================================ */

export async function createStreamingSessionLog(
  session: Omit<
    StreamingSessionLog,
    'id'
  >
): Promise<string> {
  const response =
    await apiPost<any>(
      '/api/streaming/sessions',
      session
    );

  return (
    response?.id ||
    response?.sessionId ||
    response?.data?.id ||
    ''
  );
}


export function subscribeToUserStreamingSessions(
  userId: string,
  callback: (
    sessions: StreamingSessionLog[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          `/api/streaming/sessions/user/${encodeURIComponent(
            userId
          )}`
        );

      return extractArray<StreamingSessionLog>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   REFERRAL
   ============================================================ */

export async function applyReferralCode(
  currentUserUid: string,
  referralCodeInput: string
): Promise<any> {
  if (!referralCodeInput?.trim()) {
    throw new Error(
      'Referral code is required.'
    );
  }

  return apiPost(
    '/api/referrals/apply',
    {
      currentUserUid,
      referralCode:
        referralCodeInput
          .trim()
          .toUpperCase(),
    }
  );
}


export function subscribeToUserReferrals(
  userId: string,
  callback: (
    referrals: ReferralRecord[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          `/api/referrals/user/${encodeURIComponent(
            userId
          )}`
        );

      return extractArray<ReferralRecord>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   AFFILIATE WITHDRAWAL
   ============================================================ */

export async function requestAffiliateWithdrawal(
  withdrawal: Omit<
    AffiliateWithdrawal,
    'id'
  >
): Promise<string> {
  const response =
    await apiPost<any>(
      '/api/affiliate/withdrawals',
      withdrawal
    );

  return (
    response?.id ||
    response?.withdrawalId ||
    response?.data?.id ||
    ''
  );
}


/* ============================================================
   DEPOSIT WALLET
   ============================================================ */

export async function depositUserWallet(
  amountOrUid: number | string,
  amountOrMethod?: number | string,
  paymentMethod = 'Crypto (USDT)',
  notes?: string,
  txHash?: string,
  _userEmail?: string,
  _userName?: string
): Promise<{
  success: boolean;
  status: 'pending';
  currentBalance: number;
  orderId: string;
  message: string;
}> {
  let amount = 0;
  let method = paymentMethod;

  if (
    typeof amountOrUid === 'number'
  ) {
    amount = amountOrUid;

    if (
      typeof amountOrMethod === 'string'
    ) {
      method = amountOrMethod;
    }
  } else {
    amount =
      typeof amountOrMethod === 'number'
        ? amountOrMethod
        : 0;
  }

  if (amount <= 0) {
    throw new Error(
      'Deposit amount must be greater than Rp 0.'
    );
  }

  const cleanTxHash =
    String(txHash || '').trim();

  if (!cleanTxHash) {
    throw new Error(
      'Transaction link or hash is required.'
    );
  }

  const response =
    await apiPost<any>(
      '/api/wallet/deposit',
      {
        amount,
        paymentMethod: method,
        notes,
        txHash: cleanTxHash,
        userEmail: _userEmail,
        userName: _userName,
      }
    );

  const data =
    extractData<any>(response);

  return {
    success:
      data?.success ??
      true,

    status: 'pending',

    currentBalance:
      data?.currentBalance ??
      data?.balance ??
      0,

    orderId:
      data?.orderId ||
      data?.id ||
      '',

    message:
      data?.message ||
      'Deposit submitted successfully.',
  };
}


/* ============================================================
   APPROVE DEPOSIT
   ============================================================ */

export async function approvePendingDeposit(
  orderIdOrDocId: string,
  approverEmail: string
): Promise<{
  success: boolean;
  newTargetBalance: number;
  orderId: string;
}> {
  const response =
    await apiPost<any>(
      '/api/admin/deposits/approve',
      {
        orderId:
          orderIdOrDocId,
        approverEmail,
      }
    );

  const data =
    extractData<any>(response);

  return {
    success:
      data?.success ??
      true,

    newTargetBalance:
      data?.newTargetBalance ??
      data?.newBalance ??
      0,

    orderId:
      data?.orderId ||
      orderIdOrDocId,
  };
}


/* ============================================================
   REJECT DEPOSIT
   ============================================================ */

export async function rejectPendingDeposit(
  orderIdOrDocId: string,
  rejecterEmail: string,
  reason =
    'Transaction verification invalid or funds not received'
): Promise<any> {
  return apiPost(
    '/api/admin/deposits/reject',
    {
      orderId:
        orderIdOrDocId,
      rejecterEmail,
      reason,
    }
  );
}


/* ============================================================
   PENDING DEPOSITS
   ============================================================ */

export function subscribeToPendingDeposits(
  callback: (
    orders: TransactionOrder[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          '/api/admin/deposits/pending'
        );

      return extractArray<TransactionOrder>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   WITHDRAW WALLET
   ============================================================ */

export async function withdrawUserWallet(
  uid: string,
  amount: number,
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  },
  networkGasFee = 0
): Promise<any> {
  if (amount <= 0) {
    throw new Error(
      'Withdrawal amount must be greater than zero.'
    );
  }

  return apiPost(
    '/api/wallet/withdraw',
    {
      uid,
      amount,
      bankDetails,
      networkGasFee,
    }
  );
}


/* ============================================================
   TRANSFER WALLET
   ============================================================ */

export async function transferUserWallet(
  senderUid: string,
  recipientIdentifier: string,
  amount: number,
  notes?: string
): Promise<any> {
  if (amount <= 0) {
    throw new Error(
      'Transfer amount must be greater than zero.'
    );
  }

  if (
    !recipientIdentifier?.trim()
  ) {
    throw new Error(
      'Recipient is required.'
    );
  }

  return apiPost(
    '/api/wallet/transfer',
    {
      senderUid,
      recipientIdentifier:
        recipientIdentifier.trim(),
      amount,
      notes,
    }
  );
}


/* ============================================================
   USER WITHDRAWALS
   ============================================================ */

export function subscribeToUserWithdrawals(
  userId: string,
  callback: (
    withdrawals: AffiliateWithdrawal[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          `/api/wallet/withdrawals/user/${encodeURIComponent(
            userId
          )}`
        );

      return extractArray<AffiliateWithdrawal>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   ALL STREAMING SESSIONS
   ============================================================ */

export function subscribeToAllStreamingSessions(
  callback: (
    sessions: StreamingSessionLog[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          '/api/admin/streaming/sessions'
        );

      return extractArray<StreamingSessionLog>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   ALL USERS
   ============================================================ */

export function subscribeToAllUsers(
  callback: (
    users: UserProfile[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          '/api/admin/users'
        );

      return extractArray<UserProfile>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   ADMINS
   ============================================================ */

export async function addAdminAccount(
  email: string,
  displayName = 'SYS Admin',
  notes = '',
  addedBy = OWNER_EMAIL
): Promise<AdminAccount> {
  const response =
    await apiPost<any>(
      '/api/admin/admins',
      {
        email:
          sanitizeEmailKey(email),
        displayName,
        notes,
        addedBy,
      }
    );

  return extractData<AdminAccount>(
    response
  );
}


export async function removeAdminAccount(
  email: string,
  removedBy = OWNER_EMAIL
): Promise<void> {
  await apiDelete(
    `/api/admin/admins/${encodeURIComponent(
      sanitizeEmailKey(email)
    )}?removedBy=${encodeURIComponent(
      removedBy
    )}`
  );
}


export function subscribeToAdmins(
  callback: (
    admins: AdminAccount[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          '/api/admin/admins'
        );

      return extractArray<AdminAccount>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   ADMIN SALDO
   ============================================================ */

export async function updateUserSaldoByAdmin(
  userId: string,
  newSaldo: number,
  reason: string,
  adminEmail: string,
  newLockedSaldo?: number
): Promise<{
  success: boolean;
  newSaldo: number;
  lockedSaldo: number;
}> {
  const response =
    await apiPost<any>(
      '/api/admin/users/saldo',
      {
        userId,
        newSaldo,
        reason,
        adminEmail,
        newLockedSaldo,
      }
    );

  const data =
    extractData<any>(response);

  return {
    success:
      data?.success ??
      true,

    newSaldo:
      data?.newSaldo ??
      newSaldo,

    lockedSaldo:
      data?.lockedSaldo ??
      newLockedSaldo ??
      0,
  };
}


/* ============================================================
   ALL SUBSCRIPTION ORDERS
   ============================================================ */

export function subscribeToAllSubscriptionOrders(
  callback: (
    orders: TransactionOrder[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          '/api/admin/orders'
        );

      return extractArray<TransactionOrder>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   JACKPOT SETTINGS
   ============================================================ */

export function subscribeToJackpotSettings(
  callback: (
    settings: JackpotSettings
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          '/api/jackpot/settings'
        );

      return extractData<JackpotSettings>(
        response
      );
    },
    callback
  );
}


export async function updateJackpotSettings(
  updates: Partial<JackpotSettings>,
  adminEmail: string
): Promise<void> {
  await apiPatch(
    '/api/admin/jackpot/settings',
    {
      ...updates,
      adminEmail,
    }
  );
}


/* ============================================================
   MANUAL JACKPOT
   ============================================================ */

export async function distributeManualJackpot(
  userId: string,
  userName: string,
  userEmail: string,
  amount: number,
  adminEmail: string,
  notes =
    'Manual Grand Jackpot Payout'
): Promise<any> {
  if (amount <= 0) {
    throw new Error(
      'Jackpot amount must be greater than zero.'
    );
  }

  return apiPost(
    '/api/admin/jackpot/distribute',
    {
      userId,
      userName,
      userEmail,
      amount,
      adminEmail,
      notes,
    }
  );
}


/* ============================================================
   JACKPOT HISTORY
   ============================================================ */

export function subscribeToJackpotHistory(
  callback: (
    records: JackpotWinnerRecord[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          '/api/jackpot/history'
        );

      return extractArray<JackpotWinnerRecord>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   APPROVE WITHDRAWAL
   ============================================================ */

export async function approvePendingWithdrawal(
  orderId: string,
  approverEmail: string,
  payoutTxHash = ''
): Promise<void> {
  await apiPost(
    '/api/admin/withdrawals/approve',
    {
      orderId,
      approverEmail,
      payoutTxHash,
    }
  );
}


/* ============================================================
   REJECT WITHDRAWAL
   ============================================================ */

export async function rejectPendingWithdrawal(
  orderId: string,
  rejectorEmail: string,
  reason = 'Rejected by Admin'
): Promise<void> {
  await apiPost(
    '/api/admin/withdrawals/reject',
    {
      orderId,
      rejectorEmail,
      reason,
    }
  );
}


/* ============================================================
   USER ACTIVITY
   ============================================================ */

export async function logUserActivity(
  activity: Omit<
    UserActivityLog,
    'id' | 'createdAt'
  >
): Promise<void> {
  try {
    await apiPost(
      '/api/activities',
      activity
    );
  } catch (error) {
    /*
     * Logging tidak boleh membuat transaksi utama
     * gagal.
     */
    console.warn(
      'Could not log user activity:',
      error
    );
  }
}


export function subscribeToAllUserActivities(
  callback: (
    activities: UserActivityLog[]
  ) => void
): Unsubscribe {
  return createPollingSubscription(
    async () => {
      const response =
        await apiGet<any>(
          '/api/admin/activities'
        );

      return extractArray<UserActivityLog>(
        response
      );
    },
    callback
  );
}


/* ============================================================
   NOWPAYMENTS
   ============================================================ */

export async function recordSuccessfulNowPaymentDeposit(
  params: {
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
  }
): Promise<any> {
  return apiPost(
    '/api/payments/nowpayments/deposit',
    params
  );
}


/* ============================================================
   AUTH COMPATIBILITY
   ============================================================
 *
 * File lama mengekspos:
 *
 * app
 * auth
 * googleProvider
 * loginWithGoogle
 * loginWithGooglePopup
 * loginWithGoogleRedirect
 * getLoginResult
 * loginWithEmail
 * registerWithEmail
 * resendVerificationEmail
 * sendPasswordReset
 *
 * Kita pertahankan export-nya agar komponen lama tidak langsung
 * error saat build.
 * ============================================================
 */

export const app = {
  name: 'sys-stream-cloudflare',
};


/*
 * Compatibility object.
 *
 * Jangan gunakan object ini untuk database.
 */
export const auth = {
  get currentUser() {
    try {
      const raw =
        typeof window !== 'undefined'
          ? localStorage.getItem(
              'sys_stream_auth_user'
            )
          : null;

      return raw
        ? JSON.parse(raw)
        : null;
    } catch {
      return null;
    }
  },
};


/*
 * Google provider compatibility.
 *
 * Implementasi Google OAuth sebenarnya harus dibuat
 * pada backend Cloudflare.
 */
export const googleProvider = {
  providerId: 'google',
};


/*
 * Login Google popup.
 *
 * Untuk sementara endpoint backend disiapkan sebagai:
 *
 * /api/auth/google
 */
export async function loginWithGooglePopup(): Promise<any> {
  return apiGet(
    '/api/auth/google'
  );
}


export async function loginWithGoogleRedirect(): Promise<any> {
  if (
    typeof window !== 'undefined'
  ) {
    window.location.href =
      '/api/auth/google?mode=redirect';
  }

  return undefined;
}


export async function loginWithGoogle(): Promise<any> {
  return loginWithGooglePopup();
}


export async function getLoginResult(): Promise<any> {
  /*
   * Cloudflare OAuth callback seharusnya
   * menyelesaikan session sebelum halaman kembali
   * ke frontend.
   */

  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}


/*
 * Re-export helper authentication.
 */
export {
};


/*
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */

export default {
  OWNER_EMAIL,
  ADMIN_EMAILS,

  sanitizeEmailKey,
  sanitizeFirestoreData,

  checkIsBanned,
  checkIsVipHost,

  logoutUser,
  syncUserProfile,

  addVipHostAccount,
  removeVipHostAccount,
  subscribeToVipHosts,

  activateSubscription,
  subscribeToUserProfile,

  banUserAccount,
  unbanUserAccount,
  deleteUserPermanently,
  subscribeToBannedUsers,

  updateUserProfile,

  createTransactionOrder,
  subscribeToUserOrders,

  createStreamingSessionLog,
  subscribeToUserStreamingSessions,

  applyReferralCode,
  subscribeToUserReferrals,

  requestAffiliateWithdrawal,

  depositUserWallet,
  approvePendingDeposit,
  rejectPendingDeposit,
  subscribeToPendingDeposits,

  withdrawUserWallet,
  transferUserWallet,
  subscribeToUserWithdrawals,

  subscribeToAllStreamingSessions,
  subscribeToAllUsers,

  addAdminAccount,
  removeAdminAccount,
  subscribeToAdmins,
  updateUserSaldoByAdmin,

  subscribeToAllSubscriptionOrders,

  subscribeToJackpotSettings,
  updateJackpotSettings,
  distributeManualJackpot,
  subscribeToJackpotHistory,

  approvePendingWithdrawal,
  rejectPendingWithdrawal,

  logUserActivity,
  subscribeToAllUserActivities,

  recordSuccessfulNowPaymentDeposit,
};
