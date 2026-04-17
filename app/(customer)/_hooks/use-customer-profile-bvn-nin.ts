"use client";

import { useEffect } from "react";
import type { UseFormReturnType } from "@mantine/form";
import { useAtomValue } from "jotai";
import { userProfileAtom } from "@/app/_lib/atoms/auth-atom";

type FormWithKycFields = {
  bvn: string;
  ninNumber: string;
};

/**
 * When `initialValues` is missing or has no draft BVN/NIN, profile may load after mount.
 * Fills empty fields once `defaultBvn` / `defaultNin` become available.
 */
export function useKycProfilePrefillEffect<T extends FormWithKycFields>(
  form: UseFormReturnType<T>,
  initialValues: { bvn?: string | null; ninNumber?: string | null } | undefined,
  kyc: { defaultBvn: string; defaultNin: string }
) {
  useEffect(() => {
    const hasDraftBvn =
      initialValues?.bvn != null && String(initialValues.bvn).trim() !== "";
    if (hasDraftBvn) return;
    if (!kyc.defaultBvn.trim()) return;
    if (form.values.bvn.trim() !== "") return;
    (form as unknown as UseFormReturnType<FormWithKycFields>).setFieldValue(
      "bvn",
      kyc.defaultBvn
    );
  }, [kyc.defaultBvn, initialValues?.bvn]);

  useEffect(() => {
    const hasDraftNin =
      initialValues?.ninNumber != null &&
      String(initialValues.ninNumber).trim() !== "";
    if (hasDraftNin) return;
    if (!kyc.defaultNin.trim()) return;
    if ((form.values.ninNumber ?? "").trim() !== "") return;
    (form as unknown as UseFormReturnType<FormWithKycFields>).setFieldValue(
      "ninNumber",
      kyc.defaultNin
    );
  }, [kyc.defaultNin, initialValues?.ninNumber]);
}

/**
 * True when we should lock a field: profile supplies a value and the step
 * did not already have a value from saved draft (`initialValues`).
 */
export function shouldLockKycPrefill(
  hasFromProfile: boolean,
  initialField: string | undefined | null
): boolean {
  if (!hasFromProfile) return false;
  const hasInitial = initialField != null && String(initialField).trim().length > 0;
  return !hasInitial;
}

/**
 * BVN / NIN from `userProfileAtom` (GET profile / `AuthProfileSync`).
 * Uses API values as returned (including masked BVN such as `*******9933`).
 */
export function useCustomerProfileBvnNin() {
  const profile = useAtomValue(userProfileAtom);
  const bvn = profile?.kyc?.bvn;
  const nin = profile?.kyc?.nin;
  const defaultBvn = bvn != null && bvn !== "" ? String(bvn) : "";
  const defaultNin = nin != null && nin !== "" ? String(nin) : "";
  return {
    defaultBvn,
    defaultNin,
    hasBvnFromProfile: defaultBvn.length > 0,
    hasNinFromProfile: defaultNin.length > 0,
  };
}
