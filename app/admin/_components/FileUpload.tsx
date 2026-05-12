"use client";

import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";
import { Text } from "@mantine/core";

/* --------------------------------------------
| Types
--------------------------------------------- */
interface FileUploadProps {
  label: string;
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in MB
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

/* --------------------------------------------
| Helper Functions
--------------------------------------------- */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/* --------------------------------------------
| Component
--------------------------------------------- */
export default function FileUpload({
  label,
  value,
  onChange,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 2,
  required = false,
  disabled = false,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize} MB`);
      return;
    }

    // Validate file type
    if (accept) {
      const acceptedTypes = accept.split(",").map((type) => type.trim());
      const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      const isValidType = acceptedTypes.some(
        (type) => type === fileExtension || type === file.type
      );

      if (!isValidType) {
        alert(`Please upload a valid file type: ${accept}`);
        return;
      }
    }

    onChange(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
  };

  const handleClick = () => {
    if (!disabled && !value) {
      document.getElementById(`file-input-${label}`)?.click();
    }
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <Text size="sm" fw={500} mb={8}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Text>
      )}

      {/* File Input Area */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex items-center gap-3 p-4 rounded-lg border-2 border-dashed
          transition-all duration-200 cursor-pointer
          ${isDragging ? "border-orange-500 bg-orange-50" : "border-gray-300 bg-white"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-orange-400"}
          ${error ? "border-red-500" : ""}
          ${value ? "border-solid border-gray-200" : ""}
        `}
      >
        {/* File Icon */}
        <div
          className={`
          shrink-0 flex items-center justify-center w-10 h-10 rounded-lg
          ${value ? "bg-orange-100" : "bg-gray-100"}
        `}
        >
          <FileText
            size={20}
            className={value ? "text-orange-600" : "text-gray-500"}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {value ? (
            // File selected state
            <>
              <Text size="sm" fw={500} className="truncate text-gray-900">
                {value.name}
              </Text>
              <Text size="xs" c="dimmed" className="text-gray-500">
                {formatFileSize(value.size)}
              </Text>
            </>
          ) : (
            // Empty state
            <>
              <Text size="sm" fw={400} className="text-gray-700">
                Click or drag to upload {label}
              </Text>
              <Text size="xs" c="dimmed" className="text-gray-500">
                Max. {maxSize} MB
              </Text>
            </>
          )}
        </div>

        {/* Delete Button */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Remove file"
          >
            <Trash2 size={18} />
          </button>
        )}

        {/* Hidden File Input */}
        <input
          id={`file-input-${label}`}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <Text size="xs" c="red" mt={4}>
          {error}
        </Text>
      )}
    </div>
  );
}
