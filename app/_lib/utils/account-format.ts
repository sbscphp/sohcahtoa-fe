import type { UserProfile } from "@/app/_lib/api/types";

export function formatAccountDate(dateString?: string | null): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export function formatAccountPhone(phone?: string | null): string {
  if (!phone) return "N/A";
  // If backend already masks the phone (e.g. "***6444"), keep it as-is
  if (phone.includes("*")) return phone;
  return phone;
}

export function getDisplayNameFromProfile(profile: UserProfile): {
  displayName: string;
  initials: string;
} {
  const fullName =
    profile.profile?.fullName ||
    [profile.profile?.firstName, profile.profile?.lastName].filter(Boolean).join(" ");

  const displayName = fullName || profile.email?.split("@")[0] || "User";

  const initials =
    profile.profile?.firstName?.[0] ||
    profile.profile?.lastName?.[0] ||
    profile.email?.[0]?.toUpperCase() ||
    "U";

  return { displayName, initials };
}

