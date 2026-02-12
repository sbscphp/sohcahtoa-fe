'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SecurityBadges } from '@/app/(customer)/_components/auth/SecurityBadges';
import { PasswordInput } from '@/app/(customer)/_components/auth/PasswordInput';
import { TextInput, Button, Anchor } from '@mantine/core';
import { ArrowUpRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // Mock login logic
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    // In real app, this would call an API
    router.push('/dashboard'); // Navigate to dashboard
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
          disabled={!email || !password}
          variant="filled"
          size="lg"
          fullWidth
          rightSection={<ArrowUpRight size={18} />}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          radius="xl"
        >
          Log In
        </Button>

        <SecurityBadges />
      </div>
    </>
  );
}
