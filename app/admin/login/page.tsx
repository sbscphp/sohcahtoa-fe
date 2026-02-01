"use client";

import { useState } from "react";
import { PasswordInput, TextInput, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";

import { AuthLayout } from "@/app/admin/_components/auth/AuthLayout";
import { OtpModal } from "@/app/admin/_components/OtpModal";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { loginSchema, LoginFormValues } from "./_schemas/login.schema";
import { useLogin } from "./hooks/useLogin";
import { useVerifyOtp } from "./hooks/useVerifyOtp";

export default function LoginPage() {
  const [otpModalOpened, setOtpModalOpened] = useState(false);
  const [successOpened, setSuccessOpened] = useState(false);
  const router = useRouter();

  const loginMutation = useLogin({
    onSuccess: (data: { requiresOtp: boolean }) => {
      if (data.requiresOtp) {
        setOtpModalOpened(true);
      }
    },
  });

  const verifyOtp = useVerifyOtp({
    onSuccess: () => {
      setOtpModalOpened(false);
      setSuccessOpened(true);
    },
  });

  const form = useForm<LoginFormValues>({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },
    validate: zod4Resolver(loginSchema),
    validateInputOnChange: true,
  });

  const onSubmit = form.onSubmit((values) => {
    loginMutation.mutate(values);
  });

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-body-heading-200 text-3xl font-semibold mb-2">
            Log In to Continue
          </h1>
          <p className="text-body-text-100 text-base">
            A central workspace for everything FX.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-heading-200 text-sm font-medium">
              Email Address
            </label>
            <TextInput
              key={form.key("email")}
              placeholder="Enter email address"
              size="lg"
              {...form.getInputProps("email")}
            />
          </div>

          <div className="space-y-2">
            <PasswordInput
              key={form.key("password")}
              label="Password"
              placeholder="Enter password"
              size="lg"
              {...form.getInputProps("password")}
            />
          </div>

          <div className="flex justify-end">
            <Anchor
              component="button"
              type="button"
              c="red"
              size="sm"
              underline="always"
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
            loading={loginMutation.isPending}
            disabled={!form.isValid() || loginMutation.isPending}
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
        description="A six (6) digit OTP has been sent to your email linked to this account. Enter the code to log in."
        length={6}
        loading={verifyOtp.isPending}
        onSubmit={(otp) => verifyOtp.mutate(otp)}
        onResend={() => console.log("Resend OTP")}
      />

      <SuccessModal
        opened={successOpened}
        onClose={() => {
          setSuccessOpened(false);
          router.push("/admin/dashboard");
        }}
        title="Login Successful"
        message="You have successfully logged in to your account."
        primaryButtonText="Go to Dashboard"
        onPrimaryClick={() => {
          setSuccessOpened(false);
          router.push("/admin/dashboard");
        }}
      />
    </AuthLayout>
  );
}
