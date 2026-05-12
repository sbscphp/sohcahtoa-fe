"use client";

import { atom } from "jotai";
import type { UserProfile } from "@/app/_lib/api/types";

export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export const USER_PROFILE_STORAGE_KEY = "userProfile";

// Initialize from sessionStorage if available
const getInitialTokens = (): AuthTokens => {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: sessionStorage.getItem("accessToken"),
    refreshToken: sessionStorage.getItem("refreshToken"),
  };
};

export const authTokensAtom = atom<AuthTokens>(getInitialTokens());

/**
 * Full user profile from GET /api/auth/profile
 */
const getInitialProfile = (): UserProfile | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
};

export const userProfileAtom = atom<UserProfile | null>(getInitialProfile());

/**
 * Get auth token from atom
 */
export const getAuthTokenAtom = atom((get) => get(authTokensAtom).accessToken);
