import type { BvnConsentStatusResponseData } from "@/app/_lib/api/types";

/** Persists profile fields returned after NIBSS consent completes. */
export function persistVerificationProfile(
  data: BvnConsentStatusResponseData,
  extras?: { bvn?: string; userType?: string }
): void {
  if (typeof window === "undefined") return;

  sessionStorage.setItem("verificationToken", data.verificationToken ?? "");

  if (extras?.bvn) sessionStorage.setItem("bvn", extras.bvn);
  if (extras?.userType) sessionStorage.setItem("userType", extras.userType);
  if (data.email) sessionStorage.setItem("email", data.email);
  if (data.fullName) sessionStorage.setItem("fullName", data.fullName);
  if (data.phoneNumber) sessionStorage.setItem("phoneNumber", data.phoneNumber);
  if (data.address) sessionStorage.setItem("address", data.address);
  if (data.firstName) sessionStorage.setItem("firstName", data.firstName);
  if (data.lastName) sessionStorage.setItem("lastName", data.lastName);
}
