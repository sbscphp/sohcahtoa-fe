"use client";

import { useState } from "react";
import { PasswordInput, TextInput, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { notifications } from "@mantine/notifications";
import { AgentAuthLayout } from "@/app/agent/_components/auth/AuthLayout";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { OtpModal } from "@/app/admin/_components/OtpModal";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { useCreateData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";
import { authTokensAtom } from "@/app/_lib/atoms/auth-atom";
import { apiClient } from "@/app/_lib/api/client";
import { clearTemporaryAuthData } from "@/app/(customer)/_utils/auth-flow";
import { getStoredReturnPath, setAuthUserType } from "@/app/_lib/api/auth-logout";
import { maskEmail } from "@/app/agent/_utils/mask-email";

const emailSchema = z.email();

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AgentLoginPage() {
  const router = useRouter();
  const [, setAuthTokens] = useAtom(authTokensAtom);
  const [otpModalOpened, setOtpModalOpened] = useState(false);

  const loginMutation = useCreateData(agentApi.auth.login);
  const verifyLoginMutation = useCreateData(agentApi.auth.verifyLogin);

  const form = useForm<LoginFormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validate: zod4Resolver(loginSchema),
    validateInputOnChange: true,
  });
  const maskedEmail = maskEmail(form.values.email);

  const handleLogin = form.onSubmit(async (values) => {
    loginMutation.mutate(values, {
      onSuccess: (response) => {
        const data = (response as any)?.data;

        // If backend returns tokens directly, treat as completed login
        if ((response as any)?.success && data?.accessToken && data?.refreshToken) {
          const { accessToken, refreshToken } = data;

          setAuthTokens({
            accessToken,
            refreshToken,
          });
          sessionStorage.setItem("accessToken", accessToken);
          sessionStorage.setItem("refreshToken", refreshToken);
          apiClient.setAuthTokenGetter(() => accessToken);
          clearTemporaryAuthData();
          setAuthUserType("agent");
          const returnPath = getStoredReturnPath("agent");
          router.push(returnPath || "/agent/dashboard");
          return;
        }

        // Requires password setup: route into the "verify OTP -> create password" flow
        if (data?.requiresPasswordSet) {
          const search = new URLSearchParams();
          search.set("email", values.email);
          router.push(`/agent/auth/verify-otp?${search.toString()}`);
          return;
        }

        if (data?.requiresVerification) {
          setOtpModalOpened(true);
          return;
        }

        setOtpModalOpened(true);
      },
      onError: (error) => {
        notifications.show({
          title: "Login failed",
          message: error.message || "Login failed. Please try again.",
          color: "red",
        });
      },
    });
  });

  const handleOtpSubmit = async (otp: string) => {
    const email = form.values.email;
    if (!email) return;

    verifyLoginMutation.mutate(
      { email, otp },
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            const { accessToken, refreshToken } = response.data;

            setAuthTokens({
              accessToken,
              refreshToken,
            });
            sessionStorage.setItem("accessToken", accessToken);
            sessionStorage.setItem("refreshToken", refreshToken);
            apiClient.setAuthTokenGetter(() => accessToken);
            clearTemporaryAuthData();
            setOtpModalOpened(false);
            setAuthUserType("agent");
            const returnPath = getStoredReturnPath("agent");
            router.push(returnPath || "/agent/dashboard");
          } else {
            notifications.show({
              title: "OTP verification failed",
              message:
                response.error?.message ||
                "The code you entered is incorrect or has expired. Please try again.",
              color: "red",
            });
          }
        },
        onError: (error) => {
          notifications.show({
            title: "OTP verification failed",
            message:
              error.message ||
              "The code you entered is incorrect or has expired. Please try again.",
            color: "red",
          });
        },
      }
    );
  };

  const handleResendOtp = async () => {
    console.log("Resending OTP...");
    return true;
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
            <TextInput
              label="Email Address"
              placeholder="Enter email address"
              size="lg"
              {...form.getInputProps("email")}
              error={form.errors.email}
            />
          </div>

          <div className="space-y-2">
            <PasswordInput
              label="Password"
              placeholder="Enter password"
              size="lg"
              {...form.getInputProps("password")}
              error={form.errors.password}
            />
          </div>

          <div className="flex justify-between gap-2">
          <Anchor
              component="button"
              type="button"
              c="red"
              size="sm"
              underline="always"
              onClick={() => router.push("/agent/auth/create-password")}
            >
              Create Password
            </Anchor>
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
        description={`A six (6) digit OTP has been sent to your email linked to this account. ${maskedEmail}. Enter code to log in`}
        length={6}
        loading={verifyLoginMutation.isPending}
        onSubmit={handleOtpSubmit}
        onResend={handleResendOtp}
        expiresInSeconds={300}
      />
    </AgentAuthLayout>
  );
}
