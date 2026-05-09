import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCookie, removeCookie, setCookie } from '../lib/cookies';

const TOKEN_COOKIE = 'rt_token';

export type AuthUser = { username: string };

type AuthState = {
  user: AuthUser | null;
  setSession: (user: AuthUser, token: string, expiresInSeconds: number) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setSession: (user, token, expiresInSeconds) => {
        setCookie(TOKEN_COOKIE, token, expiresInSeconds);
        set({ user });
      },
      clearSession: () => {
        removeCookie(TOKEN_COOKIE);
        set({ user: null });
      },
    }),
    {
      name: 'rt-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);

export const getAuthToken = () => getCookie(TOKEN_COOKIE);

export const useAuthUser = () => useAuthStore((s) => s.user);
export const useClearSession = () => useAuthStore((s) => s.clearSession);
export const useSetSession = () => useAuthStore((s) => s.setSession);
