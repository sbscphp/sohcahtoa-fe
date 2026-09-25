import {
  INPUT_LIMITS,
  INPUT_PATTERNS,
} from "@/app/_lib/input-field-rules";
import {
  isValidEmail,
  isValidNigerianPhoneNumber,
  normalizeNigerianPhoneInput,
} from "@/app/_lib/nibss-bvn-consent/phone-validation";

export type IgreeFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  bvn: string;
};

export type IgreeFormErrors = Partial<Record<keyof IgreeFormValues, string>>;

export function validateIgreeForm(
  values: IgreeFormValues,
  options?: { requireEmail?: boolean }
): IgreeFormErrors {
  const requireEmail = options?.requireEmail ?? true;
  const errors: IgreeFormErrors = {};

  const firstName = values.firstName.trim();
  if (!firstName) {
    errors.firstName = "First name is required";
  } else if (firstName.length < INPUT_LIMITS.personNameMin) {
    errors.firstName = `First name must be at least ${INPUT_LIMITS.personNameMin} characters`;
  } else if (!INPUT_PATTERNS.personName.test(firstName)) {
    errors.firstName = "First name contains invalid characters";
  }

  const lastName = values.lastName.trim();
  if (!lastName) {
    errors.lastName = "Last name is required";
  } else if (lastName.length < INPUT_LIMITS.personNameMin) {
    errors.lastName = `Last name must be at least ${INPUT_LIMITS.personNameMin} characters`;
  } else if (!INPUT_PATTERNS.personName.test(lastName)) {
    errors.lastName = "Last name contains invalid characters";
  }

  const email = values.email.trim();
  if (requireEmail) {
    if (!email) {
      errors.email = "Email address is required";
    } else if (!isValidEmail(email)) {
      errors.email = "Enter a valid email address";
    }
  } else if (email && !isValidEmail(email)) {
    errors.email = "Enter a valid email address";
  }

  const dob = values.dateOfBirth.trim();
  if (!dob) {
    errors.dateOfBirth = "Date of birth is required";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    errors.dateOfBirth = "Enter a valid date of birth";
  } else {
    const parsed = new Date(`${dob}T00:00:00.000Z`);
    if (Number.isNaN(parsed.getTime())) {
      errors.dateOfBirth = "Enter a valid date of birth";
    } else {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      if (parsed > today) {
        errors.dateOfBirth = "Date of birth cannot be in the future";
      }
    }
  }

  const phone = normalizeNigerianPhoneInput(values.phoneNumber);
  if (!phone) {
    errors.phoneNumber = "Phone number is required";
  } else if (!isValidNigerianPhoneNumber(phone)) {
    errors.phoneNumber = "Enter a valid Nigerian phone number (+234…)";
  }

  const bvn = values.bvn.replaceAll(/\D/g, "");
  if (!bvn) {
    errors.bvn = "BVN is required";
  } else if (bvn.length !== INPUT_LIMITS.bvn) {
    errors.bvn = `BVN must be exactly ${INPUT_LIMITS.bvn} digits`;
  }

  return errors;
}

export function isIgreeFormValid(
  values: IgreeFormValues,
  options?: { requireEmail?: boolean }
): boolean {
  return Object.keys(validateIgreeForm(values, options)).length === 0;
}

export function toIgreeInitiatePayload(values: IgreeFormValues) {
  const email = values.email.trim();
  return {
    bvn: values.bvn.replaceAll(/\D/g, "").slice(0, INPUT_LIMITS.bvn),
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    dateOfBirth: values.dateOfBirth.trim(),
    phoneNumber: normalizeNigerianPhoneInput(values.phoneNumber),
    ...(email ? { email } : {}),
  };
}
