"use client";

import { useState } from "react";
import { PasswordInput, TextInput, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { AgentAuthLayout } from "@/app/agent/_components/auth/AuthLayout";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { OtpModal } from "@/app/admin/_components/OtpModal";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AgentLoginPage() {
  const router = useRouter();
  const [otpModalOpened, setOtpModalOpened] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: "emmanuel@sohcahtoa.com",
      password: "#Mypassword404",
    },
    validate: zod4Resolver(loginSchema),
    validateInputOnChange: true,
  });

  const handleLogin = form.onSubmit(async (values) => {
    setLoginError(null);
    
    // Mock login logic - replace with actual API call
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      // Mock: Check if password is correct
      // In real app, this would come from API response
      if (values.password !== "#Mypassword404") {
        setLoginError("Incorrect password");
      } else {
        // Password is correct, show OTP modal
        setOtpModalOpened(true);
      }
    } catch (error) {
      setLoginError("Login failed. Please try again.");
    }
  });

  const handleOtpSubmit = async (otp: string) => {
    // Mock OTP verification - replace with actual API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setOtpModalOpened(false);
      router.push("/agent/dashboard");
    } catch (error) {
      console.error("OTP verification failed", error);
    }
  };

  const handleResendOtp = async () => {
    // Mock resend OTP - replace with actual API call
    console.log("Resending OTP...");
  };

  return (
    <AgentAuthLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-body-heading-200 text-3xl font-semibold mb-2">
            Log In
          </h1>
          <p className="text-body-text-100 text-base">
            A Central workspace for everything FX
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-heading-200 text-sm font-medium">
              Email Address
            </label>
            <TextInput
              placeholder="Enter email address"
              size="lg"
              {...form.getInputProps("email")}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-heading-200 text-sm font-medium">
              Password
            </label>
            <PasswordInput
              placeholder="Enter password"
              size="lg"
              {...form.getInputProps("password")}
              error={loginError || form.errors.password}
            />
            {loginError && (
              <p className="text-error-500 text-sm mt-1">{loginError}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Anchor
              component="button"
              type="button"
              c="red"
              size="sm"
              underline="always"
              onClick={() => router.push("/agent/auth/forgot-password")}
            >
              Forgot Password?
            </Anchor>
          </div>

          <CustomButton
            buttonType="primary"
            type="submit"
            size="lg"
            radius="xl"
            fullWidth
            disabled={!form.isValid()}
            className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          >
            Log In →
          </CustomButton>
        </form>
      </div>

      <OtpModal
        opened={otpModalOpened}
        onClose={() => setOtpModalOpened(false)}
        title="Account Authorisation Access"
        description="A six (6) digit OTP has been sent to your email linked to this account. e*****sohcahtoa.com. Enter code to log in"
        length={6}
        loading={false}
        onSubmit={handleOtpSubmit}
        onResend={handleResendOtp}
        expiresInSeconds={900}
      />
    </AgentAuthLayout>
  );
}
