import type { BvnConsentStatusResponseData } from "@/app/_lib/api/types";

type VerificationProfileExtras = {
  bvn?: string;
  userType?: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
};

/** Writes consent profile fields into sessionStorage for later signup steps. */
export function persistVerificationProfile(
  data: BvnConsentStatusResponseData,
  extras?: VerificationProfileExtras
): void {
  if (typeof window === "undefined") return;

  sessionStorage.setItem("verificationToken", data.verificationToken ?? "");

  if (extras?.bvn) sessionStorage.setItem("bvn", extras.bvn);
  if (extras?.userType) sessionStorage.setItem("userType", extras.userType);
  if (extras?.dateOfBirth) sessionStorage.setItem("dateOfBirth", extras.dateOfBirth);

  const email = data.email || extras?.email;
  const phoneNumber = data.phoneNumber || extras?.phoneNumber;
  const firstName = data.firstName || extras?.firstName;
  const lastName = data.lastName || extras?.lastName;

  if (email) sessionStorage.setItem("email", email);
  if (data.fullName) sessionStorage.setItem("fullName", data.fullName);
  if (phoneNumber) sessionStorage.setItem("phoneNumber", phoneNumber);
  if (data.address) sessionStorage.setItem("address", data.address);
  if (firstName) sessionStorage.setItem("firstName", firstName);
  if (lastName) sessionStorage.setItem("lastName", lastName);

  if (!data.fullName && firstName && lastName) {
    sessionStorage.setItem("fullName", `${firstName} ${lastName}`);
  }
}
