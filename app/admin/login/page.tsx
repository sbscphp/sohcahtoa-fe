"use client";

import { useState } from "react";
import {
  PasswordInput,
  TextInput,
  Anchor,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";

import { AuthLayout } from "@/app/admin/_components/auth/AuthLayout";
import { loginSchema, LoginFormValues } from "./_schemas/login.schema";
import { useLogin } from "./hooks/useLogin";
import { useVerifyOtp } from "./hooks/useVerifyOtp";
import { OtpVerification } from "./OtpVerification";
import { SuccessModal } from "@/app/admin/_components/SuccessModal";
import { CustomButton } from "../_components/CustomButton";

export default function LoginPage() {
  const [step, setStep] = useState<"login" | "otp" | "success">("login");
  const [emailForOtp, setEmailForOtp] = useState("");
  const [successOpened, setSuccessOpened] = useState(false);
  const router = useRouter();

  const loginMutation = useLogin({
    onSuccess: (data: { requiresOtp: boolean }, variables: LoginFormValues) => {
      if (data.requiresOtp) {
        setEmailForOtp(variables.email);
        setStep("otp");
      }
    },
  });

  const verifyOtp = useVerifyOtp({
    onSuccess: () => {
      setSuccessOpened(true);
      setStep("success");
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
      {step === "login" && (
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
      )}

      {step === "otp" && (
        <OtpVerification
          email={emailForOtp}
          loading={verifyOtp.isPending}
          onVerify={(otp) => verifyOtp.mutate(otp)}
          onResend={() => console.log("Resend OTP")}
        />
      )}

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
