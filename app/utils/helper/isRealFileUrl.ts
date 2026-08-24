/**
 * Returns true when the value looks like a downloadable file URL (http/https).
 * Useful for distinguishing real file links from placeholder values like "SIGNED".
 */
export function isRealFileUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}
