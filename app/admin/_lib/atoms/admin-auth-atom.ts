"use client";

import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  altPhoneNumber: string | null;
  position: string | null;
  branch: string;
  roleId: string;
  departmentId: string;
  permissions: string[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Persisted admin session atom.
 * Stored under the key "admin_auth" in localStorage to avoid clashing
 * with customer or agent sessions which use their own namespaced keys.
 */
export const adminUserAtom = atomWithStorage<AdminUser | null>(
  "admin_auth",
  null
);

/** Derived read-only atom – used by the API client token getter. */
export const adminAccessTokenAtom = atom(
  (get) => get(adminUserAtom)?.accessToken ?? null
);
