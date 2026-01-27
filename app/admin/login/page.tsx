"use client";

import { useState } from "react";
import {
  Button,
  PasswordInput,
  TextInput,
  Title,
  Text,
  Paper,
  Stack,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import Image from "next/image";

import { loginSchema, LoginFormValues } from "./_schemas/login.schema";
import { useLogin } from "./hooks/useLogin";
import { useVerifyOtp } from "./hooks/useVerifyOtp";

import { AuthSlideshow } from "./AuthSlideshow";
import { OtpVerification } from "./OtpVerification";
import { ModalConfirmed } from "./ModalConfirmed";
import { useRouter } from "next/navigation";
import Logo from "../_components/assets/logo.png";

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full grid grid-cols-1 lg:grid-cols-[1fr_2fr] bg-white rounded-xl overflow-hidden shadow-lg">
        {/* LEFT SECTION */}
        <div className="hidden lg:flex flex-col justify-between bg-bg-card-2 py-10 pl-10 ">
          <div>
            <Image src={Logo} alt="Logo" className="h-8 mb-10" />

            <Title order={2}>
              Welcome to the <br /> Back-Office Portal
            </Title>

            <Text c="dimmed" mt="sm" size="sm" maw={380}>
              Your central workspace for settlement control, rate configuration,
              and franchise oversight — all in one dependable place.
            </Text>
          </div>

          <AuthSlideshow />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center justify-center p-8">
          {step === "login" && (
            <Paper w="100%" maw={420} radius="md" p="xl">
              <form onSubmit={onSubmit}>
                <Stack>
                  <div>
                    <Title order={3}>Log In</Title>
                    <Text size="sm" c="dimmed">
                      A central workspace for everything FX
                    </Text>
                  </div>

                  <TextInput
                    key={form.key("email")}
                    label="Email Address"
                    placeholder="Enter email address"
                    {...form.getInputProps("email")}
                  />

                  <PasswordInput
                    key={form.key("password")}
                    label="Password"
                    placeholder="Enter password"
                    {...form.getInputProps("password")}
                  />

                  <Group justify="flex-end">
                    <Text size="xs" c="orange">
                      Forgot Password?
                    </Text>
                  </Group>

                  <Button
                    type="submit"
                    size="md"
                    radius="xl"
                    color="#DD4F05"
                    fullWidth
                    loading={loginMutation.isPending}
                    disabled={!form.isValid() || loginMutation.isPending}
                  >
                    Log In →
                  </Button>
                </Stack>
              </form>
            </Paper>
          )}

          {step === "otp" && (
            <OtpVerification
              email={emailForOtp}
              loading={verifyOtp.isPending}
              onVerify={(otp) => verifyOtp.mutate(otp)}
              onResend={() => console.log("Resend OTP")}
            />
          )}

          <ModalConfirmed
            opened={successOpened}
            onClose={() => {
              setSuccessOpened(false);
              router.push("/admin/dashboard"); // optional redirect
            }}
            props={{
              title: "Login Successful",
              description: "You have successfully logged in to your account.",
            }}
          />
        </div>
      </div>
    </div>
  );
}
