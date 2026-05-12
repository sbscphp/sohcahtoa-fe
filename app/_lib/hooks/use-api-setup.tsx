/**
 * Setup hook for API client
 * Call this once in your root layout to initialize the API client with auth tokens
 */

"use client";

import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { getAuthTokenAtom } from "../atoms/auth-atom";
import { apiClient } from "../api/client";

/**
 * Hook to setup API client with auth token from Jotai
 * Call this once in your root layout or providers
 */
export function useApiSetup() {
  const authToken = useAtomValue(getAuthTokenAtom);

  useEffect(() => {
    // Set auth token getter function
    apiClient.setAuthTokenGetter(() => authToken);
  }, [authToken]);
}

/**
 * Component wrapper for API setup
 * Use this in your root layout if you prefer component-based setup
 */
export function ApiSetup({ children }: { children: React.ReactNode }) {
  useApiSetup();
  return <>{children}</>;
}
