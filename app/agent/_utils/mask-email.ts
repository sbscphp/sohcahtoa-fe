export function maskEmail(email?: string | null): string {
  if (!email) return "your email";

  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "your email";

  const visibleStart = localPart[0] ?? "";
  const maskedPart = "*".repeat(Math.max(localPart.length - 1, 3));

  return `${visibleStart}${maskedPart}@${domain}`;
}
