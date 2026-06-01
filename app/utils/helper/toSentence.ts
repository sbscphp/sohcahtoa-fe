export function toSentenceCase(value?: string): string {
    const normalized = value?.trim().replace(/[_-]+/g, " ");
    if (!normalized) return "";
    return normalized?.toLowerCase().split(" ").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") ?? "";
}