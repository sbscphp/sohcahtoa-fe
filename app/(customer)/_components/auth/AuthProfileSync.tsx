'use client';

import { useEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { authTokensAtom, userProfileAtom, USER_PROFILE_STORAGE_KEY } from '@/app/_lib/atoms/auth-atom';
import { customerApi } from '@/app/(customer)/_services/customer-api';
import { normalizeProfile } from '@/app/(customer)/_utils/auth-profile';

export function AuthProfileSync() {
  const [tokens] = useAtom(authTokensAtom);
  const [profile, setUserProfile] = useAtom(userProfileAtom);
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (!tokens.accessToken || profile !== null || fetchingRef.current) return;

    fetchingRef.current = true;
    customerApi.auth
      .profile()
      .then((res) => {
        if (res.success && res.data) {
          const normalized = normalizeProfile(res.data);
          setUserProfile(normalized);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(normalized));
          }
        }
      })
      .finally(() => {
        fetchingRef.current = false;
      });
  }, [tokens.accessToken, profile, setUserProfile]);

  return null;
}
