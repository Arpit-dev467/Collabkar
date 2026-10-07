import { apiUrl } from './api';

export type UserRole = 'creator' | 'brand' | 'agency' | 'admin';

export interface AuthUser {
  id: string;
  email: string | null;
  role: UserRole;
  isEmailVerified?: boolean;
  createdAt?: string;
  profile?: {
    displayName?: string;
    companyName?: string;
    agencyName?: string;
    creatorCategory?: string;
    website?: string;
    location?: string;
    bio?: string;
    phone?: string;
    primaryPlatform?: string;
    teamSize?: string;
    rosterSize?: string;
    pricingPerPost?: string;
    budgetRange?: string;
    targetAudience?: string;
    campaignGoals?: string[];
    managementScope?: string;
    billingSetup?: string;
    socialHandles?: {
      instagram?: string;
      tiktok?: string;
      youtube?: string;
      linkedin?: string;
      x?: string;
      website?: string;
    };
  };
  onboarding?: {
    isCompleted?: boolean;
    completedSteps?: string[];
    profileCompletion?: number;
    signupSource?: string;
    interestedFeatures?: string[];
  };
}

const TOKEN_KEY = 'collabkar_token';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY) || getCookie(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

export function getDecodedTokenPayload(): { sub?: string; role?: UserRole; email?: string } | null {
  const token = getToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function fetchMe(): Promise<AuthUser> {
  const token = getToken();
  if (!token) throw new Error('missing_token');

  const response = await fetch(apiUrl('/api/auth/me'), {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!response.ok) throw new Error('unauthorized');
  const data = await response.json();
  return data.user as AuthUser;
}

export async function login(identifier: string, password: string) {
  const response = await fetch(apiUrl('/api/auth/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error || 'login_failed') as Error & { code?: string; requiresEmailVerification?: boolean };
    if (data?.requiresEmailVerification) {
      error.code = 'email_not_verified';
      error.requiresEmailVerification = true;
    }
    throw error;
  }

  if (typeof data?.token === 'string') setToken(data.token);
  return data.user as AuthUser;
}

export async function signup(
  email: string,
  password: string,
  role: 'creator' | 'brand' | 'agency',
  profile: AuthUser['profile']
) {
  const response = await fetch(apiUrl('/api/auth/signup'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role, profile }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'signup_failed');

  if (typeof data?.token === 'string' && data.token) setToken(data.token);
  return {
    user: data.user as AuthUser,
    requiresEmailVerification: Boolean(data?.requiresEmailVerification),
    verificationEmailSent: data?.verificationEmailSent !== false,
  };
}

export async function updateUserProfile(profile: AuthUser['profile']) {
  const token = getToken();
  if (!token) throw new Error('missing_token');

  const response = await fetch(apiUrl('/api/auth/profile'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ profile }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'profile_update_failed');

  return data.user as AuthUser;
}

export async function verifyEmail(token: string) {
  const response = await fetch(apiUrl('/api/auth/verify-email'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'verify_failed');

  if (typeof data?.token === 'string' && data.token) setToken(data.token);
  return data.user as AuthUser;
}

export async function resendVerification(email: string) {
  const response = await fetch(apiUrl('/api/auth/resend-verification'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'resend_failed');
  return true;
}

export async function updateProfile(profile: AuthUser['profile']) {
  const token = getToken();
  if (!token) throw new Error('missing_token');

  const response = await fetch(apiUrl('/api/auth/profile'), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile ?? {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'profile_update_failed');
  return data.user as AuthUser;
}
