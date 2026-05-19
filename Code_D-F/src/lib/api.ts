import axios from 'axios';
import { getSession } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true,
});

// ─── Token cache ────────────────────────────────────────────────────────────
// Calling getSession() on every request hits /api/auth/session over the network,
// adding ~100–200ms of latency to EVERY API call and making page switches feel slow.
// We cache the token for 4 minutes and only refresh near expiry.
let _cachedToken: string | null = null;
let _cacheExpiresAt = 0;

async function getToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const now = Date.now();
  if (_cachedToken && now < _cacheExpiresAt) return _cachedToken;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const session = (await getSession()) as any;
  _cachedToken = session?.accessToken ?? null;
  // Cache for 4 minutes (JWT expire is 15m, refresh this well before)
  _cacheExpiresAt = now + 4 * 60 * 1000;
  return _cachedToken;
}

// Call this whenever you log in/out to immediately bust the cache
export function clearTokenCache() {
  _cachedToken = null;
  _cacheExpiresAt = 0;
}

// ─── Request interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If 401, bust token cache and redirect to login
    if (error.response?.status === 401) {
      clearTokenCache();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=SessionExpired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
