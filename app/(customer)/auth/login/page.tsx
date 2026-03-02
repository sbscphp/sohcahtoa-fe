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
import { getStoredReturnPath } from '@/app/_lib/api/auth-logout';
import { authTokensAtom } from '@/app/_lib/atoms/auth-atom';
import { apiClient } from '@/app/_lib/api/client';
import { clearTemporaryAuthData } from '@/app/(customer)/_utils/auth-flow';

export default function LoginPage() {
  const router = useRouter();
  const [, setAuthTokens] = useAtom(authTokensAtom);
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
            const { accessToken, refreshToken } = response.data;
            
            // Store tokens first so the profile request is authenticated
            setAuthTokens({
              accessToken,
              refreshToken,
            });
            sessionStorage.setItem('accessToken', accessToken);
            sessionStorage.setItem('refreshToken', refreshToken);

            // Update API client token getter immediately
            apiClient.setAuthTokenGetter(() => accessToken);

            // Clear any leftover onboarding/reset password data since user is now authenticated
            clearTemporaryAuthData();

            // Redirect to previous path if user was logged out from a protected page
            const returnPath = getStoredReturnPath();
            router.push(returnPath || '/dashboard');
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
