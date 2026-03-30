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
