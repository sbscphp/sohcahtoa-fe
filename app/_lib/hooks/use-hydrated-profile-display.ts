"use client";

import { useSyncExternalStore } from "react";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/app/_lib/atoms/auth-atom";

export type HydratedProfileDisplayOptions = {
  fallbackName?: string;
};

function subscribeHydrated() {
  return () => {};
}

function getClientHydrated() {
  return true;
}

function getServerHydrated() {
  return false;
}

/**
 * Profile labels from sessionStorage-backed atom differ on the client’s first paint vs SSR.
 * useSyncExternalStore keeps server HTML on fallback until after hydration (no useEffect setState).
 */
export function useHydratedProfileDisplay(options?: HydratedProfileDisplayOptions) {
  const fallbackName = options?.fallbackName ?? "User";
  const hydrated = useSyncExternalStore(
    subscribeHydrated,
    getClientHydrated,
    getServerHydrated,
  );
  const userProfile = useAtomValue(userProfileAtom);

  if (!hydrated) {
    return {
      hydrated: false,
      displayName: fallbackName,
      displayEmail: "",
      avatarUrl: undefined as string | undefined,
    };
  }

  const displayName =
    userProfile?.profile?.fullName ||
    [userProfile?.profile?.firstName, userProfile?.profile?.lastName].filter(Boolean).join(" ") ||
    userProfile?.email?.split("@")[0] ||
    fallbackName;

  return {
    hydrated: true,
    displayName,
    displayEmail: userProfile?.email ?? "",
    avatarUrl: userProfile?.profile?.avatar || undefined,
  };
}
