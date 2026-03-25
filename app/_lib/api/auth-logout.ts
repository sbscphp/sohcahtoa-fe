import { getDefaultStore } from 'jotai';
import { authTokensAtom, userProfileAtom } from '@/app/_lib/atoms/auth-atom';
import { clearAuthSessionStorage, clearTemporaryAuthData } from '@/app/(customer)/_utils/auth-flow';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export type AuthUserType = 'customer' | 'agent';

const RETURN_PATH_KEY_CUSTOMER = 'auth.returnPath.customer';
const RETURN_PATH_KEY_AGENT = 'auth.returnPath.agent';
const USER_TYPE_KEY = 'auth.userType';

export function setAuthUserType(type: AuthUserType) {
  if (globalThis.window === undefined) return;
  sessionStorage.setItem(USER_TYPE_KEY, type);
}

export function getAuthUserType(): AuthUserType | null {
  if (globalThis.window === undefined) return null;
  const v = sessionStorage.getItem(USER_TYPE_KEY);
  return v === 'agent' || v === 'customer' ? v : null;
}

function inferUserTypeFromLocation(): AuthUserType {
  if (globalThis.window === undefined) return 'customer';
  return globalThis.window.location.pathname.startsWith('/agent') ? 'agent' : 'customer';
}

function getReturnPathKey(type: AuthUserType) {
  return type === 'agent' ? RETURN_PATH_KEY_AGENT : RETURN_PATH_KEY_CUSTOMER;
}

function saveReturnPath(type: AuthUserType) {
  if (globalThis.window === undefined) return;
  const path = globalThis.window.location.pathname + globalThis.window.location.search;
  const isAuthPath = type === 'agent' ? path.startsWith('/agent/auth/') : path.startsWith('/auth/');
  if (path && !isAuthPath) {
    sessionStorage.setItem(getReturnPathKey(type), path);
  }
}

export function getStoredReturnPath(type?: AuthUserType): string | null {
  if (globalThis.window === undefined) return null;
  const effectiveType = type ?? getAuthUserType() ?? inferUserTypeFromLocation();
  const key = getReturnPathKey(effectiveType);
  const path = sessionStorage.getItem(key);
  sessionStorage.removeItem(key);
  const isAuthPath = effectiveType === 'agent'
    ? path?.startsWith('/agent/auth/')
    : path?.startsWith('/auth/');
  if (path && !isAuthPath) return path;
  return null;
}

export const performLogout = (router?: AppRouterInstance, type?: AuthUserType) => {
  if (globalThis.window === undefined) return;

  const effectiveType = type ?? getAuthUserType() ?? inferUserTypeFromLocation();
  saveReturnPath(effectiveType);

  const store = getDefaultStore();

  store.set(authTokensAtom, { accessToken: null, refreshToken: null });
  store.set(userProfileAtom, null);

  clearAuthSessionStorage();
  clearTemporaryAuthData();

  const loginPath = effectiveType === 'agent' ? '/agent/auth/login' : '/auth/login';
  if (router) {
    router.push(loginPath);
  } else {
    globalThis.window.location.href = loginPath;
  }
};
