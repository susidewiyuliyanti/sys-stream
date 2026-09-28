export interface AuthUser {
  id: number;
  cuid: string;
  username: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'USER';
  balance?: number;
  isBlacklisted?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
  error?: string;
}

const TOKEN_KEY = 'sys_stream_auth_token';
const USER_KEY = 'sys_stream_auth_user';

export async function loginWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  const response = await fetch(
    '/api/auth/login',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify({
        login: email.trim().toLowerCase(),
        password,
      }),
    }
  );

  const data =
    (await response.json()) as AuthResponse;

  if (!response.ok) {
    throw new Error(
      data.error ||
        'Login gagal.'
    );
  }

  if (data.token) {
    localStorage.setItem(
      TOKEN_KEY,
      data.token
    );
  }

  if (data.user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(data.user)
    );
  }

  return data;
}

export async function registerWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthResponse> {
  const username =
    displayName?.trim() ||
    email
      .split('@')[0]
      .replace(/[^a-zA-Z0-9_]/g, '')
      .slice(0, 30);

  const response = await fetch(
    '/api/auth/register',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify({
        username,
        email: email.trim().toLowerCase(),
        password,
      }),
    }
  );

  const data =
    (await response.json()) as AuthResponse;

  if (!response.ok) {
    throw new Error(
      data.error ||
        'Pendaftaran gagal.'
    );
  }

  if (data.token) {
    localStorage.setItem(
      TOKEN_KEY,
      data.token
    );
  }

  if (data.user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(data.user)
    );
  }

  return data;
}

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
      await fetch(
        '/api/auth/me',
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

    if (!response.ok) {
      if (
        response.status === 401
      ) {
        logout();
      }

      return null;
    }

    const data =
      await response.json();

    if (data.user) {
      localStorage.setItem(
        USER_KEY,
        JSON.stringify(
          data.user
        )
      );

      return data.user;
    }

    return null;
  } catch {
    return null;
  }
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw =
      localStorage.getItem(
        USER_KEY
      );

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(
    TOKEN_KEY
  );
}

export function logout(): void {
  localStorage.removeItem(
    TOKEN_KEY
  );

  localStorage.removeItem(
    USER_KEY
  );
}

export async function logoutUser(): Promise<void> {
  logout();
}
export async function sendPasswordReset(
  email: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(
    '/api/auth/forgot-password',
    {
      method: 'POST',
      headers: {
        'Content-Type':
          'application/json',
      },
      body: JSON.stringify({
        email:
          email.trim().toLowerCase(),
      }),
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        'Gagal mengirim permintaan reset password.'
    );
  }

  return data;
}
