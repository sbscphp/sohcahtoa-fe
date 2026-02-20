import type { UserProfile } from '@/app/_lib/api/types';
import { USER_PROFILE_STORAGE_KEY } from '@/app/_lib/atoms/auth-atom';

export function normalizeProfile(data: UserProfile): UserProfile {
  const firstName = data.profile?.firstName || '';
  const lastName = data.profile?.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || undefined;
  
  return {
    ...data,
    profile: {
      ...data.profile,
      fullName: fullName,
    },
  };
}

export function setProfileInStorage(profile: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  if (profile) {
    sessionStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } else {
    sessionStorage.removeItem(USER_PROFILE_STORAGE_KEY);
  }
}
