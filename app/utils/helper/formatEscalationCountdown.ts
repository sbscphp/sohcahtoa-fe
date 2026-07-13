function formatUnit(value: number, singular: string, plural: string): string {
  return `${value.toLocaleString("en-US")} ${value === 1 ? singular : plural}`;
}

export function formatEscalationCountdown(totalMinutes: number): string {
  const minutes = Math.max(0, Math.floor(totalMinutes));

  if (minutes < 60) {
    return formatUnit(minutes, "min", "mins");
  }

  if (minutes < 24 * 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const parts = [formatUnit(hours, "hr", "hrs")];

    if (mins > 0) {
      parts.push(formatUnit(mins, "min", "mins"));
    }

    return parts.join(" ");
  }

  const days = Math.floor(minutes / (24 * 60));
  const remainder = minutes % (24 * 60);
  const hours = Math.floor(remainder / 60);
  const mins = remainder % 60;
  const parts = [formatUnit(days, "day", "days")];

  if (hours > 0) {
    parts.push(formatUnit(hours, "hr", "hrs"));
  }

  if (mins > 0) {
    parts.push(formatUnit(mins, "min", "mins"));
  }

  return parts.join(" ");
}

export function getElapsedMinutesSince(
  dateInitiatedAt: string,
  fallbackMinutes = 0
): number {
  if (!dateInitiatedAt) {
    return Math.max(0, Math.floor(fallbackMinutes));
  }

  const started = new Date(dateInitiatedAt);
  if (Number.isNaN(started.getTime())) {
    return Math.max(0, Math.floor(fallbackMinutes));
  }

  return Math.max(0, Math.floor((Date.now() - started.getTime()) / 60_000));
}
