import {
  getStoredUser,
  getAuthToken,
  type AuthUser,
} from './auth';

export interface CompatibilityAuthUser {
  uid: string;
  email: string;
  displayName: string;
}

function buildAuthUser(user: AuthUser | null): CompatibilityAuthUser | null {
  if (!user) return null;

  return {
    uid: user.cuid || String(user.id),
    email: user.email || '',
    displayName: user.username || user.email || 'Host Streamer',
  };
}

function getCurrentCompatibilityUser(): CompatibilityAuthUser | null {
  return buildAuthUser(getStoredUser());
}

/**
 * Compatibility layer untuk kode lama yang masih membaca auth.currentUser.
 *
 * Firebase Auth sudah tidak digunakan.
 * Sumber sesi sekarang adalah JWT + localStorage melalui src/lib/auth.ts.
 */
export const auth = {
  get currentUser(): CompatibilityAuthUser | null {
    return getCurrentCompatibilityUser();
  },

  get token(): string | null {
    return getAuthToken();
  },
};

/**
 * db hanya dipertahankan sebagai compatibility export
 * untuk file lama yang masih mengimpor { db }.
 *
 * Jangan digunakan untuk query Firestore baru.
 */
export const db = null;

/**
 * Google Login sengaja tidak tersedia.
 * Fungsi-fungsi berikut dipertahankan hanya agar file legacy
 * tidak langsung menyebabkan import error selama migrasi.
 */
export async function loginWithGooglePopup(): Promise<never> {
  throw new Error('Google Login sudah dinonaktifkan.');
}

export async function loginWithGoogleRedirect(): Promise<never> {
  throw new Error('Google Login sudah dinonaktifkan.');
}

export async function loginWithGoogle(): Promise<never> {
  throw new Error('Google Login sudah dinonaktifkan.');
}

/**
 * Auth email lama diarahkan ke sistem auth baru.
 */
export async function loginWithEmail(
  email: string,
  password: string
) {
  const { loginWithEmail: login } = await import('./auth');
  return login(email, password);
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
) {
  const { registerWithEmail: register } = await import('./auth');
  return register(email, password, displayName);
}

export async function sendPasswordReset(email: string) {
  const { sendPasswordReset: reset } = await import('./auth');
  return reset(email);
}

export async function resendVerificationEmail(): Promise<void> {
  throw new Error(
    'Email verification Firebase sudah tidak digunakan.'
  );
}