import type { IgreeRetrieveResponseData } from "@/app/_lib/api/types";

type VerificationProfileExtras = {
  bvn?: string;
  userType?: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
};

export function persistVerificationProfile(
  data: IgreeRetrieveResponseData,
  extras?: VerificationProfileExtras
): void {
  if (typeof window === "undefined") return;

  sessionStorage.setItem("verificationToken", data.verificationToken ?? "");

  const customer = data.customer;
  const email = customer?.email || extras?.email;
  const phoneNumber = customer?.phoneNumber || extras?.phoneNumber;
  const firstName = customer?.firstName || extras?.firstName;
  const lastName = customer?.lastName || extras?.lastName;
  const dateOfBirth = customer?.dateOfBirth || extras?.dateOfBirth;
  const bvn = customer?.bvn || extras?.bvn;

  if (extras?.userType) sessionStorage.setItem("userType", extras.userType);
  if (bvn) sessionStorage.setItem("bvn", bvn);
  if (dateOfBirth) sessionStorage.setItem("dateOfBirth", dateOfBirth);
  if (email) sessionStorage.setItem("email", email);
  if (phoneNumber) sessionStorage.setItem("phoneNumber", phoneNumber);
  if (firstName) sessionStorage.setItem("firstName", firstName);
  if (lastName) sessionStorage.setItem("lastName", lastName);
  if (firstName && lastName) {
    sessionStorage.setItem("fullName", `${firstName} ${lastName}`);
  }
}
