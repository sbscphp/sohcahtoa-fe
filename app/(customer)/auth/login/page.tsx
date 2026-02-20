'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { SecurityBadges } from '@/app/(customer)/_components/auth/SecurityBadges';
import { PasswordInput } from '@/app/(customer)/_components/auth/PasswordInput';
import { TextInput, Button, Anchor } from '@mantine/core';
import { ArrowUpRight } from 'lucide-react';
import { useCreateData } from '@/app/_lib/api/hooks';
import { customerApi } from '@/app/(customer)/_services/customer-api';
import { handleApiError } from '@/app/_lib/api/error-handler';
import { authTokensAtom, userProfileAtom } from '@/app/_lib/atoms/auth-atom';
import type { UserProfile } from '@/app/_lib/api/types';
import { normalizeProfile, setProfileInStorage } from '@/app/(customer)/_utils/auth-profile';

export default function LoginPage() {
  const router = useRouter();
  const [, setAuthTokens] = useAtom(authTokensAtom);
  const [, setUserProfile] = useAtom(userProfileAtom);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useCreateData(customerApi.auth.login);

  const handleLogin = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (response) => {
          if (response.success && response.data) {
            // Store tokens first so the profile request is authenticated
            setAuthTokens({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
            });
            sessionStorage.setItem('accessToken', response.data.accessToken);
            sessionStorage.setItem('refreshToken', response.data.refreshToken);

            // Fetch full profile from GET /api/auth/profile (source of truth for user)
            try {
              const profileRes = await customerApi.auth.profile();
              if (profileRes.success && profileRes.data) {
                const profile = normalizeProfile(profileRes.data);
                setUserProfile(profile);
                setProfileInStorage(profile);
              } else {
                // Fallback: use login user so UI still has something
                const loginUser = response.data.user;
                const fallback: UserProfile = {
                  id: loginUser.id,
                  email: loginUser.email,
                  phoneNumber: loginUser.phoneNumber,
                  role: loginUser.role || 'CUSTOMER',
                  customerType: loginUser.customerType,
                  isActive: loginUser.isActive ?? true,
                  emailVerified: false,
                  phoneVerified: false,
                  createdAt: loginUser.createdAt || new Date().toISOString(),
                  updatedAt: loginUser.createdAt || new Date().toISOString(),
                  profile: {
                    firstName: loginUser.firstName,
                    lastName: loginUser.lastName,
                  },
                  kyc: {
                    status: loginUser.kycStatus || 'PENDING',
                    bvnVerified: false,
                    tinVerified: false,
                    passportVerified: false,
                  },
                  permissions: [],
                };
                setUserProfile(fallback);
                setProfileInStorage(fallback);
              }
            } catch {
              // Fallback to login user if profile request fails
              const loginUser = response.data.user;
              const fallback: UserProfile = {
                id: loginUser.id,
                email: loginUser.email,
                phoneNumber: loginUser.phoneNumber,
                role: loginUser.role || 'CUSTOMER',
                customerType: loginUser.customerType,
                isActive: loginUser.isActive ?? true,
                emailVerified: false,
                phoneVerified: false,
                createdAt: loginUser.createdAt || new Date().toISOString(),
                updatedAt: loginUser.createdAt || new Date().toISOString(),
                profile: {
                  firstName: loginUser.firstName,
                  lastName: loginUser.lastName,
                },
                kyc: {
                  status: loginUser.kycStatus || 'PENDING',
                  bvnVerified: false,
                  tinVerified: false,
                  passportVerified: false,
                },
                permissions: [],
              };
              setUserProfile(fallback);
              setProfileInStorage(fallback);
            }

            router.push('/dashboard');
          } else {
            handleApiError(
              { message: response.error?.message || 'Login failed', status: 400 },
              { customMessage: response.error?.message || 'Invalid email or password' }
            );
            setError(response.error?.message || 'Invalid email or password');
          }
        },
        onError: (error) => {
          handleApiError(error);
          setError(error.message || 'Login failed. Please try again.');
        },
      }
    );
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-body-heading-200 text-3xl font-semibold mb-2">
            Log In to Continue
          </h1>
          <p className="text-body-text-100 text-base">
            Continue where you left off buy, sell, or receive foreign exchange securely.
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-heading-200 text-sm font-medium">
              Email Address
            </label>
            <TextInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              size="lg"
              error={error && !email ? error : undefined}
            />
          </div>

          <div className="space-y-2">
            <PasswordInput
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="Enter password"
              error={error && !password ? error : undefined}
              size="lg"
            />
          </div>

          <div className="flex justify-between gap-2 items-center">
            <span className="text-body-text-100 text-sm">
              Don&apos;t have an account?{" "}
              <Anchor
                component="button"
                type="button"
                onClick={() => router.push('/auth/onboarding')}
                size="sm"
                underline="always"
              >
                Get Started
              </Anchor>
            </span>
            <Anchor
              component="button"
              type="button"
              onClick={() => router.push('/auth/reset-password')}
              c="red"
              size="sm"
              underline="always"
            >
              Forgot Password?
            </Anchor>
          </div>
        </div>

        <Button
          onClick={handleLogin}
          disabled={!email || !password || loginMutation.isPending}
          loading={loginMutation.isPending}
          variant="filled"
          size="lg"
          fullWidth
          rightSection={!loginMutation.isPending && <ArrowUpRight size={18} />}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          radius="xl"
        >
          {loginMutation.isPending ? 'Logging In...' : 'Log In'}
        </Button>

        <SecurityBadges />
      </div>
    </>
  );
}
