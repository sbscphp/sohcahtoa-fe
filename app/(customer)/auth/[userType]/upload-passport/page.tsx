"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AuthLayout } from "@/app/(customer)/_components/auth/AuthLayout";
import { SecurityBadges } from "@/app/(customer)/_components/auth/SecurityBadges";
import { Button, Text } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { ArrowUpRight, Upload, X } from "lucide-react";
import {
  validateUserType,
  getNextStep
} from "@/app/(customer)/_utils/auth-flow";
import { uploadIcon } from "@/app/assets/asset";
import Image from "next/image";

export default function UploadPassportPage() {
  const router = useRouter();
  const params = useParams();
  const userType = validateUserType(params.userType);

  const [file, setFile] = useState<FileWithPath | null>(null);

  useEffect(() => {
    // Redirect if citizen or invalid userType
    if (!userType || userType === "citizen") {
      router.push("/auth/onboarding");
    }
  }, [userType, router]);

  const handleFileDrop = (files: FileWithPath[]) => {
    if (files.length > 0 && userType) {
      const selectedFile = files[0];
      setFile(selectedFile);
      // Store file info in sessionStorage
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
    if (file && userType) {
      // For now, just proceed to review
      router.push(getNextStep(userType, "upload-passport"));
    }
  };

  const getUserTypeLabel = () => {
    if (userType === "tourist") return "tourist";
    if (userType === "expatriate") return "expatriate";
    return "user";
  };

  if (!userType || userType === "citizen") {
    return null;
  }

  return (
    <AuthLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-body-heading-300 text-3xl font-semibold">
            Upload Passport. Verify Your Identity
          </h1>
          <p className="text-body-text-100 text-base">
            We require your international passport to confirm your identity as a{" "}
            {getUserTypeLabel()}.
          </p>
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
              >
                <X size={18} className="text-text-300" />
              </button>
            </div>
          )}
        </div>

        <Button
          onClick={handleUpload}
          disabled={!file}
          variant="filled"
          size="lg"
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          fullWidth
          radius="xl"
          rightSection={<ArrowUpRight size={18} />}
        >
          Upload Document
        </Button>

        <SecurityBadges />
      </div>
    </AuthLayout>
  );
}
