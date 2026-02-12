"use client";

import { atom } from "jotai";

export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export const authTokensAtom = atom<AuthTokens>({
  accessToken: null,
  refreshToken: null,
});

/**
 * Get auth token from atom (for use in API client)
 * This will be used by the API client to attach tokens to requests
 */
export const getAuthTokenAtom = atom((get) => get(authTokensAtom).accessToken);
