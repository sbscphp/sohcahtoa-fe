import { getDefaultStore } from 'jotai';
import { authTokensAtom, userProfileAtom } from '@/app/_lib/atoms/auth-atom';
import { clearAuthSessionStorage, clearTemporaryAuthData } from '@/app/(customer)/_utils/auth-flow';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

const RETURN_PATH_KEY = 'auth.returnPath';

function saveReturnPath() {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname + window.location.search;
  if (path && !path.startsWith('/auth/')) {
    sessionStorage.setItem(RETURN_PATH_KEY, path);
  }
}

export function getStoredReturnPath(): string | null {
  if (typeof window === 'undefined') return null;
  const path = sessionStorage.getItem(RETURN_PATH_KEY);
  sessionStorage.removeItem(RETURN_PATH_KEY);
  if (path && !path.startsWith('/auth/')) return path;
  return null;
}

export const performLogout = (router?: AppRouterInstance) => {
  if (typeof window === 'undefined') return;

  saveReturnPath();

  const store = getDefaultStore();

  store.set(authTokensAtom, { accessToken: null, refreshToken: null });
  store.set(userProfileAtom, null);

  clearAuthSessionStorage();
  clearTemporaryAuthData();

  if (router) {
    router.push('/auth/login');
  } else {
    window.location.href = '/auth/login';
  }
};
