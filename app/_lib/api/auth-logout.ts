import { getDefaultStore } from 'jotai';
import { authTokensAtom, userProfileAtom } from '@/app/_lib/atoms/auth-atom';
import { clearAuthSessionStorage, clearTemporaryAuthData } from '@/app/(customer)/_utils/auth-flow';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export const performLogout = (router?: AppRouterInstance) => {
  if (typeof window === 'undefined') return;
  
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
