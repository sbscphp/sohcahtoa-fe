"use client";

import { atom } from "jotai";

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

export const ADMIN_AUTH_STORAGE_KEY = "admin_auth";

/**
 * Reads the admin session from localStorage synchronously.
 * Called once during module initialization on the client so that the atom
 * has the correct value on the very first render — avoiding the race
 * condition that `atomWithStorage` has where it returns null before
 * asynchronously hydrating from storage.
 */
const getInitialAdminUser = (): AdminUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminUser;
    return parsed?.id ? parsed : null;
  } catch {
    return null;
  }
};

const _adminUserBase = atom<AdminUser | null>(getInitialAdminUser());

/**
 * Admin session atom — write-through to localStorage.
 *
 * Reading: returns the in-memory admin user (populated synchronously from
 *   localStorage on module load, so it is correct on the first render).
 *
 * Writing: persists every update to localStorage automatically, so all
 *   existing `setAdminUser(value)` call-sites work without any changes.
 */
export const adminUserAtom = atom(
  (get) => get(_adminUserBase),
  (
    get,
    set,
    update: AdminUser | null | ((prev: AdminUser | null) => AdminUser | null)
  ) => {
    const next =
      typeof update === "function" ? update(get(_adminUserBase)) : update;
    set(_adminUserBase, next);
    if (typeof window !== "undefined") {
      if (next) {
        localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(next));
      } else {
        localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
      }
    }
  }
);

/** Derived read-only atom – used by the API client token getter. */
export const adminAccessTokenAtom = atom(
  (get) => get(adminUserAtom)?.accessToken ?? null
);
