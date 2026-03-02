"use client";

import { TextInput, Anchor } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { useRouter } from "next/navigation";

import { CustomButton } from "@/app/admin/_components/CustomButton";
import {
  emailSchema,
  type EmailFormValues,
} from "@/app/admin/forgot-password/_schemas/forgotPassword.schema";

interface EmailFormProps {
  onSubmit: (values: EmailFormValues) => void;
  isLoading?: boolean;
}

export function EmailForm({ onSubmit, isLoading = false }: EmailFormProps) {
  const router = useRouter();

  const form = useForm<EmailFormValues>({
    mode: "uncontrolled",
    initialValues: {
      email: "",
    },
    validate: zod4Resolver(emailSchema),
    validateInputOnChange: true,
  });

  const handleSubmit = form.onSubmit(onSubmit);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-body-heading-200 text-3xl font-semibold mb-2">
          Reset Password
        </h1>
        <p className="text-body-text-100 text-base">
          Don&apos;t worry. Enter your email to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="agent-forgot-email" className="block text-heading-200 text-sm font-medium">
            Email Address
          </label>
          <TextInput
            id="agent-forgot-email"
            key={form.key("email")}
            placeholder="Enter email address"
            size="lg"
            {...form.getInputProps("email")}
          />
        </div>

        <div className="flex justify-end">
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
          loading={isLoading}
          disabled={!form.isValid() || isLoading}
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
        >
          Reset Password →
        </CustomButton>
      </form>
    </div>
  );
}
