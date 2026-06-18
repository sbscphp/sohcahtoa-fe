// export function toSentenceCase(value?: string): string {
//     const normalized = value?.trim().replace(/[_-]+/g, " ");
//     if (!normalized) return "";
//     return normalized?.toLowerCase().split(" ").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ") ?? "";
// }

export function toSentenceCase(value?: string): string {
  const normalized = value
    ?.trim()
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ");

  if (!normalized) return "";

  return (
    normalized
      .toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ") ?? ""
  );
}
