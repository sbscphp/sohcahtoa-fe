const NIGERIAN_PHONE_REGEX = /^\+234\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeNigerianPhoneInput(value: string): string {
  const digitsOnly = value.replaceAll(/\D/g, "");

  if (value.startsWith("+")) {
    return `+${digitsOnly}`.slice(0, 14);
  }

  if (digitsOnly.startsWith("234")) {
    return `+${digitsOnly}`.slice(0, 14);
  }

  if (digitsOnly.startsWith("0")) {
    return `+234${digitsOnly.slice(1)}`.slice(0, 14);
  }

  if (digitsOnly.length > 0) {
    return `+234${digitsOnly}`.slice(0, 14);
  }

  return "";
}

export function isValidNigerianPhoneNumber(value: string): boolean {
  return NIGERIAN_PHONE_REGEX.test(value.trim());
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}
