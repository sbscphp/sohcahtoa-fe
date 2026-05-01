const DEFAULT_EXPIRY_SECONDS = 30 * 60;
const ONE_HOUR_SECONDS = 3600;
const ONE_DAY_SECONDS = 86400;

/**
 * Parses API expiry to **seconds remaining until** that moment (vs `Date.now()`), or a **duration** in seconds.
 *
 * Order of interpretation:
 * 1. **ISO / absolute end time** — string contains `T` or looks like `YYYY-MM-DD…` → `expiresAt - now`.
 * 2. **`HH:MM:SS`** duration (exactly three numeric segments).
 * 3. **`MM:SS`** or **`M:SS`** duration (two segments; minutes may exceed 59).
 * 4. Any other string `Date` can parse as an absolute time.
 * 5. Fallback: default window length.
 */
export function parseExpiryToSeconds(expiry: string | null): number {
  if (!expiry) return DEFAULT_EXPIRY_SECONDS;
  const trimmed = expiry.trim();

  // Absolute end time (virtual-account `expiresAt`, etc.) — must run before `:` duration patterns.
  if (
    trimmed.includes("T") ||
    /^[-+]?\d{4}-\d{2}-\d{2}/.test(trimmed) ||
    /^[-+]?\d{4}\/\d{1,2}\/\d{1,2}/.test(trimmed)
  ) {
    const timestamp = new Date(trimmed).getTime();
    if (!Number.isNaN(timestamp)) {
      const remainingSec = Math.floor((timestamp - Date.now()) / 1000);
      return Math.max(remainingSec, 0);
    }
  }

  const hmsMatch = /^(\d+):(\d{2}):(\d{2})$/.exec(trimmed);
  if (hmsMatch) {
    const h = Number(hmsMatch[1]);
    const m = Number(hmsMatch[2]);
    const s = Number(hmsMatch[3]);
    if (m >= 60 || s >= 60) return DEFAULT_EXPIRY_SECONDS;
    return Math.max(h * ONE_HOUR_SECONDS + m * 60 + s, 0);
  }

  const msMatch = /^(\d+):(\d{2})$/.exec(trimmed);
  if (msMatch) {
    const minutes = Number(msMatch[1]);
    const seconds = Number(msMatch[2]);
    if (seconds >= 60) return DEFAULT_EXPIRY_SECONDS;
    return Math.max(minutes * 60 + seconds, 0);
  }

  const timestamp = new Date(trimmed).getTime();
  if (!Number.isNaN(timestamp)) {
    const remaining = Math.floor((timestamp - Date.now()) / 1000);
    return Math.max(remaining, 0);
  }

  return DEFAULT_EXPIRY_SECONDS;
}

/**
 * Human-readable countdown for virtual-account expiry.
 * Under 1 hour: `MM:SS`. From 1 hour up: `Xd Yh Zm` / `Xh Ym` (no misleading minute totals).
 */
export function formatPaymentExpiryCountdown(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));

  if (safe < ONE_HOUR_SECONDS) {
    const m = Math.floor(safe / 60);
    const s = safe % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const days = Math.floor(safe / ONE_DAY_SECONDS);
  const hours = Math.floor((safe % ONE_DAY_SECONDS) / ONE_HOUR_SECONDS);
  const minutes = Math.floor((safe % ONE_HOUR_SECONDS) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

export const SOON_THRESHOLD_SECONDS = 60;

/** Seconds until `expiresAt` (or fallback duration string). Clamped ≥ 0. */
export function getVirtualAccountRemainingSeconds(
  accountData: unknown,
  fallbackExpiry: string | null | undefined
): number {
  const iso = getStringField(accountData, ["expiresAt", "expiryDate", "expiry"]);
  if (iso) return Math.max(0, parseExpiryToSeconds(iso));
  if (fallbackExpiry?.trim()) return Math.max(0, parseExpiryToSeconds(fallbackExpiry));
  return 0;
}

/**
 * Window is closed: server says so, or `expiresAt` is in the past vs wall clock.
 * Do not treat `isExpired === false` as proof the window is still open.
 */
export function isVirtualAccountWindowExpired(accountData: unknown): boolean {
  if (!accountData || typeof accountData !== "object") return false;
  const d = accountData as Record<string, unknown>;
  if (d.isExpired === true) return true;
  const iso = getStringField(accountData, ["expiresAt", "expiryDate", "expiry"]);
  if (!iso) return false;
  return parseExpiryToSeconds(iso) === 0;
}

/** True when still active but ≤ {@link SOON_THRESHOLD_SECONDS}s left (requires ticking parent or same deps as countdown). */
export function isVirtualAccountExpiringSoon(remainingSeconds: number, expired: boolean): boolean {
  return !expired && remainingSeconds > 0 && remainingSeconds <= SOON_THRESHOLD_SECONDS;
}

export function getStringField(source: unknown, keys: string[]): string | null {
  if (!source || typeof source !== "object") return null;
  const data = source as Record<string, unknown>;

  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value;
  }

  return null;
}

export function getInstructionsText(source: unknown): string | null {
  if (!source || typeof source !== "object") return null;
  const data = source as Record<string, unknown>;
  const instructions = data.instructions;

  if (Array.isArray(instructions)) {
    const lines = instructions.filter((item): item is string => typeof item === "string");
    return lines.length ? lines.join(" ") : null;
  }

  if (typeof instructions === "string" && instructions.trim()) return instructions;
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.note === "string" && data.note.trim()) return data.note;

  return null;
}
