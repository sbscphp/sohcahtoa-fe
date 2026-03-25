"use client";

import { useState, useMemo } from "react";
import { PasswordInput, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter, useSearchParams } from "next/navigation";
import { notifications } from "@mantine/notifications";
import { AgentAuthLayout } from "@/app/agent/_components/auth/AuthLayout";
import { PasswordRequirements } from "@/app/agent/_components/auth/PasswordRequirements";
import { PasswordCreatedModal } from "@/app/agent/_components/auth/PasswordCreatedModal";
import { CustomButton } from "@/app/admin/_components/CustomButton";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { useCreateData } from "@/app/_lib/api/hooks";
import { agentApi } from "@/app/agent/_services/agent-api";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(12, "Password must be at most 12 characters")
      .regex(/[a-z]/, "Password must contain lowercase letters")
      .regex(/[A-Z]/, "Password must contain uppercase letters")
      .regex(/\d/, "Password must contain numbers")
      .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain special characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function CreatePasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const email = useMemo(() => searchParams.get("email") || "", [searchParams]);
  const otp = useMemo(() => searchParams.get("otp") || "", [searchParams]);

  const createPasswordMutation = useCreateData(agentApi.auth.createPassword);

  const form = useForm<PasswordFormValues>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: zod4Resolver(passwordSchema),
    validateInputOnChange: true,
  });

  const handleSubmit = form.onSubmit(async (values) => {
    if (!email || !otp) {
      notifications.show({
        title: "Link invalid or expired",
        message:
          "We could not find the email or code for this password setup. Please use the link from your email again.",
        color: "red",
      });
      return;
    }

    createPasswordMutation.mutate(
      {
        email,
        otp,
        password: values.password,
        confirmPassword: values.confirmPassword,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            setShowSuccessModal(true);
            return;
          }
          notifications.show({
            title: "Password creation failed",
            message:
              response.error?.message ||
              "We were unable to set your password. Please try again.",
            color: "red",
          });
        },
        onError: (error) => {
          notifications.show({
            title: "Password creation failed",
            message:
              error.message ||
              "We were unable to set your password. Please try again.",
            color: "red",
          });
        },
      }
    );
  });

  const handleContinue = () => {
    setShowSuccessModal(false);
    router.push("/agent/auth/login");
  };

  return (
    <>
      <AgentAuthLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-body-heading-200 text-3xl font-semibold mb-2">
              Create password
            </h1>
            <p className="text-body-text-100 text-base">
              This password will be used every time you sign in as an Agent. Make sure it&apos;s unique and secure for you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-heading-200 text-sm font-medium">
                Password
              </label>
              <PasswordInput
                placeholder="Enter password"
                size="lg"
                {...form.getInputProps("password")}
                onFocus={() => setShowRequirements(true)}
              />
              {showRequirements && (
                <PasswordRequirements password={form.values.password} showAll />
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-heading-200 text-sm font-medium">
                Confirm password
              </label>
              <PasswordInput
                placeholder="Enter password"
                size="lg"
                {...form.getInputProps("confirmPassword")}
              />
            </div>

            <div className="flex justify-end gap-2">
            <Anchor
              component="button"
              type="button"
              c="red"
              size="sm"
              underline="always"
              onClick={() => router.push("/agent/auth/login")}
            >
              Return to Login
            </Anchor>
          </div>

            <CustomButton
              buttonType="primary"
              type="submit"
              size="lg"
              radius="xl"
              fullWidth
            loading={createPasswordMutation.isPending}
            disabled={!form.isValid() || createPasswordMutation.isPending}
              className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
            >
              Log In →
            </CustomButton>
          </form>
        </div>
      </AgentAuthLayout>

      <PasswordCreatedModal
        opened={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onContinue={handleContinue}
      />
    </>
  );
}
