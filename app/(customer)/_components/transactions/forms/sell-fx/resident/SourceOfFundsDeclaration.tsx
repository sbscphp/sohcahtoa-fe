"use client";

import { TextInput } from "@mantine/core";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import type { FileWithPath } from "@mantine/dropzone";

const DECLARATION_TEXT =
  "I declare that the source of funds/income stated in this form is true and correct to the best of my knowledge. I understand that providing false information may result in rejection of my transaction and reporting to the relevant authorities.";

export interface SourceOfFundsDeclarationProps {
  /** "initials" | "upload" - user chooses one */
  signatureMode: "initials" | "upload";
  onSignatureModeChange: (mode: "initials" | "upload") => void;
  initialsValue: string;
  onInitialsChange: (value: string) => void;
  initialsError?: string;
  signatureFile: FileWithPath | null;
  onSignatureFileChange: (file: FileWithPath | null) => void;
  signatureFileError?: string;
}

/**
 * Inbuilt source of funds declaration form for residents selling FX of $10k+.
 * Signature can be initials or uploaded signature image.
 */
export default function SourceOfFundsDeclaration({
  signatureMode,
  onSignatureModeChange,
  initialsValue,
  onInitialsChange,
  initialsError,
  signatureFile,
  onSignatureFileChange,
  signatureFileError,
}: SourceOfFundsDeclarationProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 space-y-4">
      <p className="text-body-heading-300 font-medium text-base">
        Source of funds declaration (required for $10,000 and above)
      </p>
      <p className="text-body-text-200 text-sm leading-relaxed">
        {DECLARATION_TEXT}
      </p>
      <div className="flex rounded-md border border-gray-100 bg-white p-0.5 text-sm">
        <button
          type="button"
          onClick={() => onSignatureModeChange("initials")}
          className={`flex-1 py-2 px-3 rounded-[6px] text-xs font-medium transition-colors ${
            signatureMode === "initials"
              ? "bg-white text-[#4D4B4B] shadow-sm border border-gray-100"
              : "text-[#8F8B8B] hover:text-[#4D4B4B]"
          }`}
        >
          Sign with initials
        </button>
        <button
          type="button"
          onClick={() => onSignatureModeChange("upload")}
          className={`flex-1 py-2 px-3 rounded-[6px] text-xs font-medium transition-colors ${
            signatureMode === "upload"
              ? "bg-white text-[#4D4B4B] shadow-sm border border-gray-100"
              : "text-[#8F8B8B] hover:text-[#4D4B4B]"
          }`}
        >
          Upload signature
        </button>
      </div>
      {signatureMode === "initials" && (
        <TextInput
          label="Your initials (signature on declaration)"
          required
          size="md"
          placeholder="e.g. J.D."
          maxLength={20}
          value={initialsValue}
          onChange={(e) => onInitialsChange(e.target.value)}
          error={initialsError}
        />
      )}
      {signatureMode === "upload" && (
        <FileUploadInput
          label="Upload signature"
          required
          value={signatureFile}
          onChange={onSignatureFileChange}
          error={signatureFileError}
          placeholder="Click to upload signature image"
        />
      )}
    </div>
  );
}
