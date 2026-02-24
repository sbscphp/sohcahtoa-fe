export type UserType = "citizen" | "tourist" | "expatriate";

export interface AuthFlowConfig {
  userType: UserType;
  nextStep: string;
  verificationMethod: "bvn" | "passport";
}

export const getNextStep = (userType: UserType, currentStep: string): string => {
  const basePath = `/auth/${userType}`;

  switch (currentStep) {
    case "onboarding":
      if (userType === "citizen") {
        return `${basePath}/bvn`;
      } else {
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
};

export const getVerificationMethod = (userType: UserType): "bvn" | "passport" => {
  return userType === "citizen" ? "bvn" : "passport";
};

export const validateUserType = (
  userType: string | string[] | undefined
): UserType | null => {
  if (typeof userType === "string") {
    if (["citizen", "tourist", "expatriate"].includes(userType)) {
      return userType as UserType;
    }
  }
  return null;
};

export const AUTH_STORAGE_KEYS = {
  ONBOARDING: [
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
  ],
  PASSWORD_RESET: [
    "resetEmail",
    "resetToken",
  ],
  AUTH: [
    "accessToken",
    "refreshToken",
    "userProfile",
  ],
} as const;

export const clearOnboardingSessionStorage = () => {
  if (typeof window === "undefined") return;
  AUTH_STORAGE_KEYS.ONBOARDING.forEach((key) => {
    sessionStorage.removeItem(key);
  });
};

export const clearPasswordResetSessionStorage = () => {
  if (typeof window === "undefined") return;
  AUTH_STORAGE_KEYS.PASSWORD_RESET.forEach((key) => {
    sessionStorage.removeItem(key);
  });
};

export const clearAuthSessionStorage = () => {
  if (typeof window === "undefined") return;
  AUTH_STORAGE_KEYS.AUTH.forEach((key) => {
    sessionStorage.removeItem(key);
  });
  // Also clear userInfo if it exists
  sessionStorage.removeItem('userInfo');
};

export const clearTemporaryAuthData = () => {
  clearOnboardingSessionStorage();
  clearPasswordResetSessionStorage();
};

export const checkAndClearSessionIfUserTypeChanged = (currentUserType: UserType | null) => {
  if (typeof window === "undefined" || !currentUserType) return;

  const storedUserType = sessionStorage.getItem("userType");

  if (storedUserType && storedUserType !== currentUserType) {
    clearOnboardingSessionStorage();
  }

  sessionStorage.setItem("userType", currentUserType);
};
