"use client";

import { File02Icon, FileAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Text } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { X } from "lucide-react";

interface FileUploadInputProps {
  label: string;
  required?: boolean;
  value: FileWithPath | null;
  onChange: (file: FileWithPath | null) => void;
  accept?: string[];
  error?: string;
  placeholder?: string;
}

export default function FileUploadInput({
  label,
  required = false,
  value,
  onChange,
  accept = ["image/*", "application/pdf"],
  error,
  placeholder = "Click to upload",
}: FileUploadInputProps) {
  const handleFileDrop = (files: FileWithPath[]) => {
    if (files.length > 0) {
      onChange(files[0]!);
    }
  };

  const handleRemoveFile = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-body-text-100 text-sm font-medium">
        {label} {required && <span className="text-error-500">*</span>}
      </label>

      {!value ? (
        <Dropzone
          onDrop={handleFileDrop}
          accept={accept}
          maxFiles={1}
          className="border border-gray-200 rounded-lg bg-bg-card hover:border-primary-400 transition-colors"
        >
          <div className="flex items-center p-3 gap-3">
            <HugeiconsIcon icon={FileAddIcon} size={20} className="text-text-300 shrink-0" />
            <p className="text-body-text-100 text-sm font-medium">
              {placeholder}
            </p>
          </div>
        </Dropzone>
      ) : (
        <div className="border border-gray-100 rounded-lg bg-bg-card p-3 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="p-1.5 rounded-lg bg-gray-25 shrink-0">
              <HugeiconsIcon icon={File02Icon} size={16} className="text-text-300" />
            </div>
            <div className="min-w-0 flex-1">
              <Text
                className="text-heading-200 text-sm font-medium truncate block"
                title={value.name}
              >
                {value.name}
              </Text>
              <Text className="text-text-200 text-xs">
                {(value.size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1.5 hover:bg-gray-25 rounded-lg transition-colors"
            aria-label="Remove file"
          >
            <X size={16} className="text-text-300" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-error-500 text-xs">{error}</p>
      )}
    </div>
  );
}
