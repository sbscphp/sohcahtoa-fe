/** Dev-only logger. */
export function igreeLog(step: string, details?: unknown): void {
  if (process.env.NODE_ENV === "production") return;

  if (details === undefined) {
    console.log(`[iGree] ${step}`);
    return;
  }
  console.log(`[iGree] ${step}`, details);
}
