"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { Button, Text, TextInput } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { ArrowUpRight, ArrowLeft, Upload, X } from "lucide-react";
import {
  validateUserType,
  getNextStep,
  checkAndClearSessionIfUserTypeChanged,
} from "@/app/(customer)/_utils/auth-flow";
import { uploadIcon } from "@/app/assets/asset";
import Image from "next/image";
import { useCreateData } from "@/app/_lib/api/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { handleApiError } from "@/app/_lib/api/error-handler";
import { PASSPORT_NUMBER_REGEX } from "@/app/(customer)/_utils/input-validation";
import {
  INPUT_LIMITS,
  INPUT_PATTERNS,
  sanitizePersonName,
} from "@/app/_lib/input-field-rules";

export default function UploadPassportPage() {
  const router = useRouter();
  const params = useParams();
  const userType = validateUserType(params.userType);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [file, setFile] = useState<FileWithPath | null>(null);
  const [passportNumber, setPassportNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!userType || userType === "citizen") {
      router.push("/auth/onboarding");
      return;
    }

    checkAndClearSessionIfUserTypeChanged(userType);
  }, [userType, router]);

  const uploadPassportMutation = useCreateData(
    customerApi.auth.kyc.passport.upload
  );
  const verifyPassportMutation = useCreateData(
    customerApi.auth.tourist.verifyPassport
  );

  const handleFileDrop = (files: FileWithPath[]) => {
    if (files.length > 0 && userType) {
      const selectedFile = files[0];
      setFile(selectedFile);
      sessionStorage.setItem("passportFileName", selectedFile.name);
      sessionStorage.setItem("userType", userType);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("passportFileName");
    }
  };

  const handleUpload = () => {
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const normalizedPassportNumber = passportNumber.trim().toUpperCase();

    if (
      !trimmedFirstName ||
      trimmedFirstName.length < INPUT_LIMITS.personNameMin ||
      !INPUT_PATTERNS.personName.test(trimmedFirstName)
    ) {
      handleApiError(
        { message: "Invalid first name", status: 400 },
        { customMessage: "Please enter a valid first name." }
      );
      return;
    }

    if (
      !trimmedLastName ||
      trimmedLastName.length < INPUT_LIMITS.personNameMin ||
      !INPUT_PATTERNS.personName.test(trimmedLastName)
    ) {
      handleApiError(
        { message: "Invalid last name", status: 400 },
        { customMessage: "Please enter a valid last name." }
      );
      return;
    }

    if (
      !PASSPORT_NUMBER_REGEX.test(normalizedPassportNumber) ||
      normalizedPassportNumber.length > 9
    ) {
      handleApiError(
        { message: "Invalid passport number", status: 400 },
        {
          customMessage:
            "Passport number must be alphanumeric and at most 9 characters.",
        }
      );
      return;
    }

    if (
      !file ||
      !userType ||
      !normalizedPassportNumber ||
      isVerifying ||
      isUploading
    ) {
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("passport", file);

    uploadPassportMutation.mutate(formData, {
      onSuccess: (uploadResponse) => {
        if (uploadResponse.success && uploadResponse.data?.passportDocumentUrl) {
          setIsVerifying(true);
          setIsUploading(false);

          verifyPassportMutation.mutate(
            {
              passportNumber: normalizedPassportNumber,
              passportDocumentUrl: uploadResponse.data.passportDocumentUrl,
              firstName: trimmedFirstName,
              lastName: trimmedLastName,
            },
            {
              onSuccess: (response) => {
                if (response.success && response.data) {
                  const resolvedFirstName =
                    response.data.firstName || trimmedFirstName;
                  const resolvedLastName =
                    response.data.lastName || trimmedLastName;

                  sessionStorage.setItem(
                    "verificationToken",
                    response.data.verificationToken
                  );
                  sessionStorage.setItem(
                    "passportNumber",
                    normalizedPassportNumber
                  );
                  sessionStorage.setItem("userType", userType);
                  sessionStorage.setItem("firstName", resolvedFirstName);
                  sessionStorage.setItem("lastName", resolvedLastName);
                  sessionStorage.setItem(
                    "fullName",
                    `${resolvedFirstName} ${resolvedLastName}`
                  );
                  if (response.data.email) {
                    sessionStorage.setItem("email", response.data.email);
                  }
                  if (response.data.phoneNumber) {
                    sessionStorage.setItem(
                      "phoneNumber",
                      response.data.phoneNumber
                    );
                  }
                  if (response.data.address) {
                    sessionStorage.setItem("address", response.data.address);
                  }
                  if (response.data.nationality) {
                    sessionStorage.setItem(
                      "nationality",
                      response.data.nationality
                    );
                  }
                  setIsVerifying(false);
                  router.push(getNextStep(userType, "upload-passport"));
                } else {
                  setIsVerifying(false);
                  handleApiError(
                    {
                      message:
                        response.error?.message ||
                        "Passport verification failed",
                      status: 400,
                    },
                    {
                      customMessage:
                        response.error?.message ||
                        "Passport verification failed. Please check your details and try again.",
                    }
                  );
                }
              },
              onError: (error) => {
                setIsVerifying(false);
                handleApiError(error);
              },
            }
          );
        } else {
          setIsUploading(false);
          handleApiError(
            {
              message: uploadResponse.error?.message || "File upload failed",
              status: 400,
            },
            {
              customMessage:
                uploadResponse.error?.message ||
                "Failed to upload passport. Please try again.",
            }
          );
        }
      },
      onError: (error) => {
        setIsUploading(false);
        handleApiError(error);
      },
    });
  };

  const getUserTypeLabel = () => {
    if (userType === "tourist") return "tourist";
    if (userType === "expatriate") return "expatriate";
    return "user";
  };

  const canSubmit =
    Boolean(file) &&
    firstName.trim().length >= INPUT_LIMITS.personNameMin &&
    lastName.trim().length >= INPUT_LIMITS.personNameMin &&
    passportNumber.trim().length > 0 &&
    !isVerifying &&
    !isUploading;

  if (!userType || userType === "citizen") {
    return null;
  }

  return (
    <>
      <div className="space-y-8">
        <Button
          variant="subtle"
          leftSection={<ArrowLeft size={18} />}
          onClick={() => router.push("/auth/onboarding")}
          className="text-body-text-200 hover:text-body-text-300 p-0 h-auto"
        >
          Back
        </Button>
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold">
            Upload Passport. Verify Your Identity
          </h1>
          <p className="text-body-text-100 text-base">
            We require your international passport to confirm your identity as a{" "}
            {getUserTypeLabel()}.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="passport-first-name"
                className="block text-body-text-100 text-base font-medium"
              >
                First Name <span className="text-error-500">*</span>
              </label>
              <TextInput
                id="passport-first-name"
                value={firstName}
                onChange={(e) =>
                  setFirstName(sanitizePersonName(e.currentTarget.value))
                }
                placeholder="Enter first name"
                size="lg"
                maxLength={INPUT_LIMITS.personName}
                autoComplete="given-name"
                disabled={isVerifying || isUploading}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="passport-last-name"
                className="block text-body-text-100 text-base font-medium"
              >
                Last Name <span className="text-error-500">*</span>
              </label>
              <TextInput
                id="passport-last-name"
                value={lastName}
                onChange={(e) =>
                  setLastName(sanitizePersonName(e.currentTarget.value))
                }
                placeholder="Enter last name"
                size="lg"
                maxLength={INPUT_LIMITS.personName}
                autoComplete="family-name"
                disabled={isVerifying || isUploading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="passport-number"
              className="block text-body-text-100 text-base font-medium"
            >
              Passport Number <span className="text-error-500">*</span>
            </label>
            <TextInput
              id="passport-number"
              value={passportNumber}
              onChange={(e) =>
                setPassportNumber(
                  e.target.value
                    .toUpperCase()
                    .replaceAll(/[^A-Z0-9]/g, "")
                    .slice(0, 9)
                )
              }
              placeholder="Enter passport number"
              size="lg"
              maxLength={9}
              disabled={isVerifying || isUploading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-body-text-100 text-base font-medium">
              Upload International Passport{" "}
              <span className="text-error-500">*</span>
            </label>

            {!file ? (
              <Dropzone
                onDrop={handleFileDrop}
                accept={["image/*", "application/pdf"]}
                maxFiles={1}
                className="border border-gray-100 rounded-xl bg-bg-card hover:border-primary-400 transition-colors"
              >
                <div className="flex items-start p-4 gap-4">
                  <Image src={uploadIcon} alt="Upload" />
                  <p className="text-body-text-100 text-base font-medium">
                    Click to upload
                  </p>
                </div>
              </Dropzone>
            ) : (
              <div className="border border-gray-100 rounded-xl bg-bg-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-25">
                    <Upload size={18} className="text-text-300" />
                  </div>
                  <div>
                    <Text className="text-heading-200 text-base font-medium">
                      {file.name}
                    </Text>
                    <Text className="text-text-200 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-gray-25 rounded-lg transition-colors"
                  aria-label="Remove file"
                  type="button"
                >
                  <X size={18} className="text-text-300" />
                </button>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={!canSubmit}
          loading={isVerifying || isUploading}
          variant="filled"
          size="lg"
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          fullWidth
          radius="xl"
          rightSection={
            !isVerifying && !isUploading && <ArrowUpRight size={18} />
          }
        >
          {isUploading
            ? "Uploading..."
            : isVerifying
              ? "Verifying..."
              : "Upload Document"}
        </Button>

        <SecurityBadges />
      </div>
    </>
  );
}
