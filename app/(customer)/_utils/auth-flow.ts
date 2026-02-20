export type UserType = "citizen" | "tourist" | "expatriate";

export interface AuthFlowConfig {
  userType: UserType;
  nextStep: string;
  verificationMethod: "bvn" | "passport";
}

/**
 * Get the next step in the auth flow based on user type and current step
 */
export function getNextStep(userType: UserType, currentStep: string): string {
  const basePath = `/auth/${userType}`;

  switch (currentStep) {
    case "onboarding":
      if (userType === "citizen") {
        return `${basePath}/bvn`;
      } else {
        // tourist or expatriate
        return `${basePath}/upload-passport`;
      }

    case "bvn":
    case "upload-passport":
      return `${basePath}/review`;

    case "review":
      return `${basePath}/verify-email`;

    case "verify-email":
      return `${basePath}/create-password`;

    case "create-password":
      return "/auth/login";

    default:
      return basePath;
  }
}

/**
 * Get verification method for user type
 */
export function getVerificationMethod(userType: UserType): "bvn" | "passport" {
  return userType === "citizen" ? "bvn" : "passport";
}

/**
 * Validate user type from route params
 */
export function validateUserType(
  userType: string | string[] | undefined
): UserType | null {
  if (typeof userType === "string") {
    if (["citizen", "tourist", "expatriate"].includes(userType)) {
      return userType as UserType;
    }
  }
  return null;
}

/**
 * Clear onboarding-related sessionStorage data
 */
export function clearOnboardingSessionStorage() {
  if (typeof window === "undefined") return;
  
  const keysToRemove = [
    "verificationToken",
    "validationToken",
    "bvn",
    "passportNumber",
    "passportFileName",
    "email",
    "fullName",
    "firstName",
    "lastName",
    "phoneNumber",
    "address",
    "nationality",
    "otpDeliveryMethod",
    "userType",
  ];
  
  keysToRemove.forEach((key) => {
    sessionStorage.removeItem(key);
  });
}

/**
 * Check if userType has changed and clear sessionStorage if needed
 */
export function checkAndClearSessionIfUserTypeChanged(currentUserType: UserType | null) {
  if (typeof window === "undefined" || !currentUserType) return;
  
  const storedUserType = sessionStorage.getItem("userType");
  
  if (storedUserType && storedUserType !== currentUserType) {
    clearOnboardingSessionStorage();
  }
  
  sessionStorage.setItem("userType", currentUserType);
}
