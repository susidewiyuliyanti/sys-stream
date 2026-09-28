import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Env } from './db';

export interface AuthUser {
  id?: number;
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  streamerHandle?: string | null;
  bio?: string | null;

  username?: string;
  cuid?: string;

  referralCode?: string | null;
  referredBy?: string | null;
  referralCount?: number;

  balance?: number;
  saldo?: number;
  walletBalance?: number;
  lockedSaldo?: number;

  affiliateEarnings?: number;
  affiliateWithdrawn?: number;

  isSubscribed?: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string | null;
  isLifetime?: boolean;

  role?: string;

  isBlacklisted?: boolean;
  isBanned?: boolean;
  bannedReason?: string | null;

  forceJackpotNext?: boolean;
}

const TOKEN_KEY =
  'sys_stream_auth_token';

const USER_KEY =
  'sys_stream_auth_user';


async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    localStorage.getItem(
      TOKEN_KEY
    );

  const headers =
    new Headers(
      options.headers || {}
    );

  headers.set(
    'Content-Type',
    'application/json'
  );

  if (token) {
    headers.set(
      'Authorization',
      `Bearer ${token}`
    );
  }

  const response =
    await fetch(
      path,
      {
        ...options,
        headers,
      }
    );

  const data =
    await response
      .json()
      .catch(() => ({}));

  if (!response.ok) {
    const error: any =
      new Error(
        data?.message ||
          'Request gagal.'
      );

    error.code =
      data?.code;

    error.status =
      response.status;

    throw error;
  }

  return data;
}


/* ============================================================
   LOGIN EMAIL
   ============================================================ */

export async function loginWithEmail(
  email: string,
  password: string
) {
  const response =
    await apiRequest<{
      success: boolean;
      token: string;
      user: AuthUser;
    }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

  localStorage.setItem(
    TOKEN_KEY,
    response.token
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      response.user
    )
  );

  return {
    user: response.user,
    token: response.token,
  };
}


/* ============================================================
   REGISTER
   ============================================================ */

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
) {
  const response =
    await apiRequest<{
      success: boolean;
      token: string;
      user: AuthUser;
      verificationSent?: boolean;
    }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          displayName,
        }),
      }
    );

  localStorage.setItem(
    TOKEN_KEY,
    response.token
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      response.user
    )
  );

  return {
    credential: {
      user: response.user,
    },
    user: response.user,
    verificationSent:
      response.verificationSent ??
      false,
  };
}


/* ============================================================
   CURRENT USER
   ============================================================ */

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token =
    localStorage.getItem(
      TOKEN_KEY
    );

  if (!token) {
    return null;
  }

  try {
    const response =
      await apiRequest<{
        success: boolean;
        user: AuthUser;
      }>(
        '/api/auth/me'
      );

    if (response.user) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(
          response.user
        )
      );
    }

    return response.user;
  } catch {
    localStorage.removeItem(
      TOKEN_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );

    return null;
  }
}


/* ============================================================
   SESSION SYNC
   ============================================================ */

export async function syncSession(
  data: {
    uid: string;
    email: string;
    displayName?: string;
    role?: string;
    walletBalance?: number;
  }
) {
  return apiRequest(
    '/api/auth/sync-session',
    {
      method: 'POST',
      body: JSON.stringify(
        data
      ),
    }
  );
}


/* ============================================================
   LOGOUT
   ============================================================ */

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest(
      '/api/auth/logout',
      {
        method: 'POST',
      }
    );
  } catch {
    // Local logout tetap dilakukan.
  }

  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}


/* ============================================================
   FORGOT PASSWORD
   ============================================================ */

export async function sendPasswordReset(
  email: string
) {
  return apiRequest(
    '/api/auth/forgot-password',
    {
      method: 'POST',
      body: JSON.stringify({
        email,
      }),
    }
  );
}


/* ============================================================
   GOOGLE
   ============================================================ */

export async function loginWithGooglePopup() {
  throw new Error(
    'Login Google belum dikonfigurasi pada backend Cloudflare.'
  );
}

export async function loginWithGoogleRedirect() {
  throw new Error(
    'Login Google belum dikonfigurasi pada backend Cloudflare.'
  );
}

export async function loginWithGoogle() {
  throw new Error(
    'Login Google belum dikonfigurasi pada backend Cloudflare.'
  );
}

export async function getLoginResult() {
  return null;
}
