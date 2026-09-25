"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDisclosure } from "@mantine/hooks";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { VerifyBVNModal } from "@/app/(customer)/_components/modals/VerifyBVNModal";
import { BvnConsentOverlay } from "@/app/_components/nibss-bvn-consent/BvnConsentOverlay";
import { TextInput, Button } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CalendarIcon } from "@hugeicons/core-free-icons";
import {
  validateUserType,
  checkAndClearSessionIfUserTypeChanged,
} from "@/app/(customer)/_utils/auth-flow";
import { formatDateToIso } from "@/app/(customer)/_utils/input-validation";
import {
  INPUT_LIMITS,
  sanitizeElevenDigitId,
  sanitizePersonName,
} from "@/app/_lib/input-field-rules";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { notifications } from "@mantine/notifications";
import { customerNigerianBvnConsentClient } from "@/app/_lib/nibss-bvn-consent/clients";
import { persistVerificationProfile } from "@/app/_lib/nibss-bvn-consent/persist-verification-profile";
import { useBvnConsentFlow } from "@/app/_lib/nibss-bvn-consent/use-bvn-consent-flow";
import { normalizeNigerianPhoneInput } from "@/app/_lib/nibss-bvn-consent/phone-validation";
import {
  toIgreeInitiatePayload,
  validateIgreeForm,
  type IgreeFormErrors,
} from "@/app/_lib/nibss-bvn-consent/igree-form-validation";

export default function BVNPage() {
  const router = useRouter();
  const params = useParams();
  const userType = validateUserType(params.userType);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bvn, setBvn] = useState("");
  const [fieldErrors, setFieldErrors] = useState<IgreeFormErrors>({});
  const [showErrors, setShowErrors] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [verifyBVNOpened, { open: openVerifyBVN, close: closeVerifyBVN }] =
    useDisclosure(false);

  const formValues = {
    firstName,
    lastName,
    email,
    dateOfBirth,
    phoneNumber,
    bvn,
  };

  const sendOtpMutation = useCreateData(customerApi.auth.nigerian.sendOtp);

  const sendEmailOtpAfterConsent = useCallback(
    (verificationToken: string) => {
      setIsSendingOtp(true);
      sessionStorage.setItem("otpDeliveryMethod", "email");

      sendOtpMutation.mutate(
        {
          verificationToken,
          verificationType: "email",
        },
        {
          onSuccess: (response) => {
            setIsSendingOtp(false);
            if (response.success) {
              const otp = (response as { data?: { otp?: string } })?.data?.otp;
              if (otp) {
                notifications.show({
                  title: "DEV OTP",
                  message: `OTP: ${otp}`,
                  color: "blue",
                  autoClose: 8000,
                });
              }
              openVerifyBVN();
            } else {
              handleApiError(
                {
                  message: response.error?.message || "Failed to send OTP",
                  status: 400,
                },
                {
                  customMessage:
                    response.error?.message ||
                    "Failed to send email OTP. Please try again.",
                }
              );
            }
          },
          onError: (error) => {
            setIsSendingOtp(false);
            handleApiError(error, {
              customMessage: "Failed to send email OTP. Please try again.",
            });
          },
        }
      );
    },
    [openVerifyBVN, sendOtpMutation]
  );

  const handleConsentCompleted = useCallback(
    (data: Parameters<typeof persistVerificationProfile>[0]) => {
      persistVerificationProfile(data, {
        bvn,
        userType: userType ?? undefined,
        email: email.trim(),
        phoneNumber: normalizeNigerianPhoneInput(phoneNumber),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim(),
      });

      const verificationToken =
        data.verificationToken || sessionStorage.getItem("verificationToken");

      if (!verificationToken) {
        handleApiError(
          { message: "Missing verification token", status: 400 },
          {
            customMessage:
              "BVN consent completed but verification token is missing.",
          }
        );
        return;
      }

      sendEmailOtpAfterConsent(verificationToken);
    },
    [
      bvn,
      dateOfBirth,
      email,
      firstName,
      lastName,
      phoneNumber,
      sendEmailOtpAfterConsent,
      userType,
    ]
  );

  const bvnConsent = useBvnConsentFlow({
    client: customerNigerianBvnConsentClient,
    onCompleted: handleConsentCompleted,
  });

  useEffect(() => {
    if (!userType || userType !== "citizen") {
      router.push("/auth/onboarding");
      return;
    }

    checkAndClearSessionIfUserTypeChanged(userType);
  }, [userType, router]);

  useEffect(() => {
    if (!showErrors) return;
    setFieldErrors(
      validateIgreeForm({
        firstName,
        lastName,
        email,
        dateOfBirth,
        phoneNumber,
        bvn,
      })
    );
  }, [bvn, dateOfBirth, email, firstName, lastName, phoneNumber, showErrors]);

  const handleVerify = () => {
    const errors = validateIgreeForm(formValues);
    setShowErrors(true);
    setFieldErrors(errors);

    if (
      Object.keys(errors).length > 0 ||
      !userType ||
      bvnConsent.isActive ||
      isSendingOtp
    ) {
      return;
    }

    void bvnConsent.startConsent(toIgreeInitiatePayload(formValues));
  };

  const handleConsentCancel = () => {
    bvnConsent.cancel();
    bvnConsent.reset();
  };

  const handleBVNVerified = () => {
    if (userType) {
      closeVerifyBVN();
    }
  };

  if (!userType || userType !== "citizen") {
    return null;
  }

  const consentOverlayOpen =
    bvnConsent.phase !== "idle" && bvnConsent.phase !== "completed";
  const isSubmitting = bvnConsent.isActive || isSendingOtp;

  return (
    <>
      <div className="space-y-8">
        <Button
          variant="subtle"
          leftSection={<ArrowLeft size={18} />}
          onClick={() => router.push("/auth/onboarding")}
          className="text-body-text-200 hover:text-body-text-300 p-0 h-auto"
          disabled={isSubmitting}
        >
          Back
        </Button>
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold">
            Let&apos;s Get you Started.
          </h1>
          <p className="text-body-text-100 text-base">
            Please enter your details and BVN. This is required for identity
            verification and security. Your details are safe and will not be
            shared.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="citizen-first-name"
              className="block text-body-text-100 text-base font-medium"
            >
              First Name
            </label>
            <TextInput
              id="citizen-first-name"
              value={firstName}
              onChange={(e) =>
                setFirstName(sanitizePersonName(e.currentTarget.value))
              }
              placeholder="Enter first name"
              size="lg"
              disabled={isSubmitting}
              error={showErrors ? fieldErrors.firstName : undefined}
              maxLength={INPUT_LIMITS.personName}
              autoComplete="given-name"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="citizen-last-name"
              className="block text-body-text-100 text-base font-medium"
            >
              Last Name
            </label>
            <TextInput
              id="citizen-last-name"
              value={lastName}
              onChange={(e) =>
                setLastName(sanitizePersonName(e.currentTarget.value))
              }
              placeholder="Enter last name"
              size="lg"
              disabled={isSubmitting}
              error={showErrors ? fieldErrors.lastName : undefined}
              maxLength={INPUT_LIMITS.personName}
              autoComplete="family-name"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="citizen-email"
              className="block text-body-text-100 text-base font-medium"
            >
              Email Address
            </label>
            <TextInput
              id="citizen-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              placeholder="you@email.com"
              size="lg"
              disabled={isSubmitting}
              error={showErrors ? fieldErrors.email : undefined}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="citizen-dob"
              className="block text-body-text-100 text-base font-medium"
            >
              Date of Birth
            </label>
            <DateInput
              id="citizen-dob"
              placeholder="Select date of birth"
              value={dateOfBirth.trim() ? new Date(dateOfBirth) : null}
              onChange={(value) => setDateOfBirth(formatDateToIso(value))}
              maxDate={new Date()}
              size="lg"
              disabled={isSubmitting}
              error={showErrors ? fieldErrors.dateOfBirth : undefined}
              rightSection={
                <HugeiconsIcon
                  icon={CalendarIcon}
                  size={20}
                  className="text-text-300!"
                />
              }
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="citizen-phone"
              className="block text-body-text-100 text-base font-medium"
            >
              Phone Number
            </label>
            <TextInput
              id="citizen-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(normalizeNigerianPhoneInput(e.currentTarget.value))
              }
              placeholder="+2348031234567"
              size="lg"
              disabled={isSubmitting}
              error={showErrors ? fieldErrors.phoneNumber : undefined}
              maxLength={14}
              autoComplete="tel"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="citizen-bvn"
              className="block text-body-text-100 text-base font-medium"
            >
              BVN
            </label>
            <TextInput
              id="citizen-bvn"
              value={bvn}
              onChange={(e) =>
                setBvn(sanitizeElevenDigitId(e.currentTarget.value))
              }
              placeholder="Enter BVN"
              size="lg"
              disabled={isSubmitting}
              error={showErrors ? fieldErrors.bvn : undefined}
              maxLength={INPUT_LIMITS.bvn}
              inputMode="numeric"
            />
            <p className="text-text-200 text-sm">
              If you can&apos;t remember, please dial{" "}
              <span className="font-semibold">*565*0#</span> with your registered
              SIM to get started.
            </p>
          </div>
        </div>

        <Button
          onClick={handleVerify}
          disabled={isSubmitting}
          loading={isSubmitting}
          variant="filled"
          size="lg"
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          fullWidth
          radius="xl"
          rightSection={!isSubmitting && <ArrowUpRight size={18} />}
        >
          {bvnConsent.isActive
            ? "Starting consent…"
            : isSendingOtp
              ? "Sending email OTP…"
              : "Verify BVN"}
        </Button>

        <SecurityBadges />
      </div>

      <BvnConsentOverlay
        opened={consentOverlayOpen}
        phase={bvnConsent.phase}
        statusMessage={bvnConsent.statusMessage}
        usedPopup={bvnConsent.usedPopup}
        onOpenPortal={bvnConsent.openConsentPortal}
        onRetry={() => void bvnConsent.retryPolling()}
        onCancel={handleConsentCancel}
      />

      <VerifyBVNModal
        opened={verifyBVNOpened}
        onClose={closeVerifyBVN}
        onVerify={handleBVNVerified}
        bvn={bvn}
        deliveryMethod="email"
      />
    </>
  );
}
