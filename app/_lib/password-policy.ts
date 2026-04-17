/**
 * Shared password rules (min 8 chars, upper + lower, digit, symbol).
 * Symbols are any non–letter/digit except whitespace so e.g. ? ( ) _ + count,
 * not only the small set !@#$%^&* (which caused “valid-looking” passwords to fail while fields matched).
 */

export function passwordLengthOk(pwd: string): boolean {
  return pwd.length >= 8;
}

export function passwordUpperLowerOk(pwd: string): boolean {
  return /[A-Z]/.test(pwd) && /[a-z]/.test(pwd);
}

export function passwordNumberOk(pwd: string): boolean {
  return /\d/.test(pwd);
}

/** True if the password contains at least one symbol (not A–Z, a–z, 0–9, or space). */
export function passwordSpecialOk(pwd: string): boolean {
  return /[^A-Za-z0-9\s]/.test(pwd);
}

export function isPasswordPolicyCompliant(pwd: string): boolean {
  return (
    passwordLengthOk(pwd) &&
    passwordUpperLowerOk(pwd) &&
    passwordNumberOk(pwd) &&
    passwordSpecialOk(pwd)
  );
}
