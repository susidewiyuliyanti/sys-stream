/**
 * Authentication client for Sys-Stream
 *
 * Firebase Auth replacement.
 *
 * Frontend communicates with the backend through:
 *   POST /api/auth/login
 *   POST /api/auth/register
 *   POST /api/auth/sync-session
 *   GET  /api/auth/me
 *   POST /api/auth/logout
 *   POST /api/auth/forgot-password
 *
 * JWT is stored in localStorage and sent through:
 *   Authorization: Bearer <token>
 */

export interface AuthUser {
  id?: number;
  cuid?: string;
  uid?: string;

  username?: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;

  streamerHandle?: string | null;
  bio?: string | null;

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
  subscriptionPlan?: string | null;
  subscriptionExpiresAt?: string | null;
  isLifetime?: boolean;
  subscribedAt?: string | null;

  role?: string;

  isBlacklisted?: boolean;
  isBanned?: boolean;
  bannedReason?: string | null;

  forceJackpotNext?: boolean;
  targetJackpotNominal?: number | null;

  createdAt?: string | null;
  updatedAt?: string | null;

  [key: string]: unknown;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  [key: string]: unknown;
}

export interface LoginResult {
  user: AuthUser;
  token: string;
}

export interface RegisterResult {
  user: AuthUser;
  token: string;
  verificationSent?: boolean;
}

const TOKEN_KEY = "sys_stream_auth_token";
const USER_KEY = "sys_stream_auth_user";

/**
 * ---------------------------------------------------------------------------
 * Token helpers
 * ---------------------------------------------------------------------------
 */

export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Failed to save authentication token:", error);
  }
};

export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Failed to remove authentication token:", error);
  }
};

/**
 * ---------------------------------------------------------------------------
 * User cache helpers
 * ---------------------------------------------------------------------------
 */

export const getStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as AuthUser;
  } catch (error) {
    console.error("Failed to read stored user:", error);
    return null;
  }
};

export const setStoredUser = (user: AuthUser): void => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Failed to save user:", error);
  }
};

export const removeStoredUser = (): void => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Failed to remove stored user:", error);
  }
};

/**
 * ---------------------------------------------------------------------------
 * Clear authentication
 * ---------------------------------------------------------------------------
 */

export const clearAuth = (): void => {
  removeAuthToken();
  removeStoredUser();

  /**
   * Keep compatibility with the existing application, which already
   * uses local/session storage for authentication-related state.
   */
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("token");
  } catch {
    // Ignore storage errors.
  }
};

/**
 * ---------------------------------------------------------------------------
 * API request helper
 * ---------------------------------------------------------------------------
 */

const apiRequest = async <T = AuthResponse>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorData = data as {
      message?: string;
      error?: string;
    } | null;

    const message =
      errorData?.message ||
      errorData?.error ||
      `Request failed with status ${response.status}`;

    const error = new Error(message) as Error & {
      status?: number;
      response?: Response;
      data?: unknown;
    };

    error.status = response.status;
    error.response = response;
    error.data = data;

    throw error;
  }

  return data as T;
};

/**
 * ---------------------------------------------------------------------------
 * Login with email / username + password
 * ---------------------------------------------------------------------------
 *
 * The existing backend route accepts:
 *
 * {
 *   login: string,
 *   password: string
 * }
 *
 * `login` can be username or email.
 */

export const loginWithEmail = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  const result = await apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({
      login: email,
      email,
      password,
    }),
  });

  if (!result.token) {
    throw new Error("Login berhasil tetapi token autentikasi tidak diterima.");
  }

  if (!result.user) {
    throw new Error("Login berhasil tetapi data pengguna tidak diterima.");
  }

  setAuthToken(result.token);
  setStoredUser(result.user);

  return {
    user: result.user,
    token: result.token,
  };
};

/**
 * Alias yang lebih umum digunakan aplikasi.
 */
export const login = loginWithEmail;

/**
 * ---------------------------------------------------------------------------
 * Register
 * ---------------------------------------------------------------------------
 */

export const registerWithEmail = async (
  email: string,
  password: string,
  displayName?: string
): Promise<RegisterResult> => {
  /**
   * Existing backend requires username.
   *
   * If the UI only supplies an email/display name, generate a reasonable
   * username from the email address.
   */
  const username = createUsernameFromEmail(email, displayName);

  const result = await apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({
      username,
      email,
      password,
      displayName: displayName || username,
    }),
  });

  if (!result.token) {
    throw new Error(
      "Pendaftaran berhasil tetapi token autentikasi tidak diterima."
    );
  }

  if (!result.user) {
    throw new Error(
      "Pendaftaran berhasil tetapi data pengguna tidak diterima."
    );
  }

  setAuthToken(result.token);
  setStoredUser(result.user);

  return {
    user: result.user,
    token: result.token,
    verificationSent:
      typeof result.verificationSent === "boolean"
        ? result.verificationSent
        : false,
  };
};

/**
 * ---------------------------------------------------------------------------
 * Google login
 * ---------------------------------------------------------------------------
 *
 * Firebase previously handled Google OAuth.
 *
 * The new architecture does not use Firebase.
 *
 * Until a Google OAuth provider is connected to the Cloudflare backend,
 * these functions intentionally return a clear error instead of silently
 * trying to use Firebase.
 */

export const loginWithGooglePopup = async (): Promise<LoginResult> => {
  throw new Error(
    "Login Google belum dikonfigurasi pada backend Cloudflare. Gunakan login email/password untuk sementara."
  );
};

export const loginWithGoogleRedirect = async (): Promise<void> => {
  throw new Error(
    "Login Google belum dikonfigurasi pada backend Cloudflare. Gunakan login email/password untuk sementara."
  );
};

export const loginWithGoogle = async (): Promise<LoginResult> => {
  return loginWithGooglePopup();
};

/**
 * ---------------------------------------------------------------------------
 * Redirect result compatibility
 * ---------------------------------------------------------------------------
 *
 * Firebase used this for Google redirect authentication.
 * It is retained so existing imports do not immediately break.
 */

export const getLoginResult = async (): Promise<null> => {
  return null;
};

/**
 * ---------------------------------------------------------------------------
 * Current authenticated user
 * ---------------------------------------------------------------------------
 *
 * Calls:
 *   GET /api/auth/me
 *
 * The backend validates the JWT.
 */

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  try {
    const result = await apiRequest<AuthResponse>("/api/auth/me", {
      method: "GET",
    });

    if (!result.user) {
      clearAuth();
      return null;
    }

    setStoredUser(result.user);

    return result.user;
  } catch (error) {
    const status = (error as { status?: number })?.status;

    /**
     * Only clear the token when the backend explicitly tells us
     * the authentication is unauthorized.
     */
    if (status === 401 || status === 403) {
      clearAuth();
    }

    return null;
  }
};

/**
 * ---------------------------------------------------------------------------
 * Auth state compatibility
 * ---------------------------------------------------------------------------
 *
 * Firebase previously provided:
 *
 *   onAuthStateChanged(...)
 *
 * The replacement checks the JWT/backend session.
 *
 * This function returns an unsubscribe function so components that were
 * written around Firebase-style auth state handling can migrate gradually.
 */

export const onAuthStateChanged = (
  callback: (user: AuthUser | null) => void
): (() => void) => {
  let cancelled = false;

  const checkAuth = async () => {
    const user = await getCurrentUser();

    if (!cancelled) {
      callback(user);
    }
  };

  void checkAuth();

  return () => {
    cancelled = true;
  };
};

/**
 * ---------------------------------------------------------------------------
 * Sync session
 * ---------------------------------------------------------------------------
 *
 * This is used by App.tsx after authentication.
 *
 * Existing backend route:
 *
 *   POST /api/auth/sync-session
 */

export interface SyncSessionData {
  uid?: string;
  email: string;
  displayName?: string | null;
  role?: string;
  walletBalance?: number;
  photoURL?: string | null;
}

export const syncSession = async (
  data: SyncSessionData
): Promise<LoginResult> => {
  const result = await apiRequest<AuthResponse>("/api/auth/sync-session", {
    method: "POST",
    body: JSON.stringify({
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      walletBalance: data.walletBalance,
      photoURL: data.photoURL,
    }),
  });

  if (!result.token) {
    throw new Error(
      "Sinkronisasi sesi berhasil tetapi token tidak diterima."
    );
  }

  if (!result.user) {
    throw new Error(
      "Sinkronisasi sesi berhasil tetapi data pengguna tidak diterima."
    );
  }

  setAuthToken(result.token);
  setStoredUser(result.user);

  return {
    user: result.user,
    token: result.token,
  };
};

/**
 * ---------------------------------------------------------------------------
 * Logout
 * ---------------------------------------------------------------------------
 */

export const logoutUser = async (): Promise<void> => {
  try {
    /**
     * The current backend does not need a server-side logout because JWT
     * authentication is stateless.
     *
     * We still attempt the endpoint in case a server-side logout/revocation
     * endpoint is added later.
     */
    try {
      await apiRequest("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      /**
       * Ignore this request if the endpoint does not exist yet.
       */
    }
  } finally {
    clearAuth();
  }
};

export const logout = logoutUser;

/**
 * ---------------------------------------------------------------------------
 * Password reset
 * ---------------------------------------------------------------------------
 *
 * Firebase previously handled password reset email.
 *
 * The backend endpoint can be implemented later.
 */

export const sendPasswordReset = async (email: string): Promise<void> => {
  const result = await apiRequest<AuthResponse>(
    "/api/auth/forgot-password",
    {
      method: "POST",
      body: JSON.stringify({
        email,
      }),
    }
  );

  if (result.success === false) {
    throw new Error(
      result.message || "Permintaan reset password gagal."
    );
  }
};

/**
 * ---------------------------------------------------------------------------
 * Email verification compatibility
 * ---------------------------------------------------------------------------
 *
 * Firebase previously sent verification emails.
 *
 * These functions are retained so existing imports don't break.
 */

export const sendEmailVerification = async (): Promise<void> => {
  throw new Error(
    "Verifikasi email belum dikonfigurasi pada backend Cloudflare."
  );
};

export const resendVerificationEmail = async (): Promise<void> => {
  throw new Error(
    "Verifikasi email belum dikonfigurasi pada backend Cloudflare."
  );
};

/**
 * ---------------------------------------------------------------------------
 * Update user profile
 * ---------------------------------------------------------------------------
 *
 * This replaces Firebase updateProfile().
 *
 * The backend endpoint can accept profile updates once implemented.
 */

export interface UpdateProfileData {
  displayName?: string;
  photoURL?: string | null;
  streamerHandle?: string | null;
  bio?: string | null;
}

export const updateUserProfile = async (
  data: UpdateProfileData
): Promise<AuthUser> => {
  const result = await apiRequest<AuthResponse>("/api/user/profile", {
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!result.user) {
    throw new Error(
      "Profil diperbarui tetapi data pengguna tidak diterima."
    );
  }

  setStoredUser(result.user);

  return result.user;
};

/**
 * ---------------------------------------------------------------------------
 * Wallet synchronization
 * ---------------------------------------------------------------------------
 *
 * NOTE:
 * The existing backend currently exposes /api/user/sync-wallet.
 *
 * This function is retained for compatibility with App.tsx.
 *
 * For production, wallet balances should ultimately be changed only by
 * trusted server-side transaction logic rather than accepting a client-
 * supplied balance.
 */

export const syncWallet = async (
  walletBalance: number
): Promise<AuthUser | null> => {
  const result = await apiRequest<AuthResponse>("/api/user/sync-wallet", {
    method: "POST",
    body: JSON.stringify({
      walletBalance,
    }),
  });

  if (result.user) {
    setStoredUser(result.user);
    return result.user;
  }

  return null;
};

/**
 * ---------------------------------------------------------------------------
 * Utility
 * ---------------------------------------------------------------------------
 */

const createUsernameFromEmail = (
  email: string,
  displayName?: string
): string => {
  const source =
    displayName?.trim() ||
    email
      .split("@")[0]
      ?.trim() ||
    "user";

  let username = source
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!username) {
    username = "user";
  }

  /**
   * Backend usernames should not become excessively long.
   */
  username = username.substring(0, 24);

  /**
   * Add a short deterministic suffix when the username is very generic.
   * This does not guarantee uniqueness; the backend should still handle
   * duplicate usernames correctly.
   */
  if (username.length < 3) {
    username = `${username}_user`;
  }

  return username.substring(0, 30);
};

/**
 * ---------------------------------------------------------------------------
 * Compatibility exports
 * ---------------------------------------------------------------------------
 *
 * These aliases make the migration easier and reduce the number of files
 * that have to change immediately.
 */

export const getUser = getCurrentUser;

export const getToken = getAuthToken;

export const clearAuthentication = clearAuth;

export default {
  loginWithEmail,
  login,
  registerWithEmail,

  loginWithGooglePopup,
  loginWithGoogleRedirect,
  loginWithGoogle,

  getLoginResult,

  getCurrentUser,
  onAuthStateChanged,

  syncSession,

  logoutUser,
  logout,

  sendPasswordReset,

  sendEmailVerification,
  resendVerificationEmail,

  updateUserProfile,
  syncWallet,

  getAuthToken,
  setAuthToken,
  removeAuthToken,

  getStoredUser,
  setStoredUser,
  removeStoredUser,

  clearAuth,
};
