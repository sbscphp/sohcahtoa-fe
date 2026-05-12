"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FileAddIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Text } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { Folder, X } from "lucide-react";

interface TransactionFileUploadInputProps {
  label: string;
  required?: boolean;
  value: FileWithPath | null;
  onChange: (file: FileWithPath | null) => void;
  accept?: string[];
  error?: string;
  placeholder?: string;
  supportingText?: string;
}

export default function TransactionFileUploadInput({
  label,
  required = false,
  value,
  onChange,
  accept = ["image/*", "application/pdf"],
  error,
  placeholder = "Click to upload",
  supportingText ="PDF, PNG, IMG, JPG Supported. Max. size: 5 MB",
}: TransactionFileUploadInputProps) {
  const isImage = value?.type.startsWith("image/");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create a fresh blob URL whenever we have a file (so preview works after going back)
  useEffect(() => {
    if (!value || !isImage) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return () => {};
    }
    const url = URL.createObjectURL(value);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    return () => URL.revokeObjectURL(url);
  }, [value, isImage]);

  const handleFileDrop = (files: FileWithPath[]) => {
    if (files.length > 0) {
      onChange(files[0]!);
    }
  };

  const handleChangeFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept.join(",");
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onChange(file as FileWithPath);
      }
    };
    input.click();
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
          className="border-2 border-dashed border-[#E4E4E7] rounded-[20px] bg-[#F7F7F7] hover:border-primary-400 transition-all duration-200 w-full"
        >
          <div className="flex flex-col justify-end items-end p-3 gap-5 min-h-[132px] w-full ">
            <div className="flex flex-row items-start w-full gap-3 pb-[5px] sm:pb-0">
              <div className="flex flex-col justify-center items-center p-[9px_12px] gap-[10px] w-10 h-10 bg-[#FAFAFA] rounded-full shrink-0">
                <HugeiconsIcon icon={FileAddIcon} size={18} className="text-[#232323]" />
              </div>
              <div className="flex flex-col items-start gap-1.5 flex-1 min-w-0">
                <p className="text-sm font-normal text-[#232323] leading-[140%]">
                  {placeholder}
                </p>
                {supportingText && (
                  <p className="text-xs font-normal text-[#666666] leading-[140%] tracking-[0.04px]" >
                    {supportingText}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              className="flex flex-row justify-center items-center px-6 py-3 gap-2.5 w-32 h-10 bg-white border border-[#F0F0F0] rounded-full shrink-0 hover:bg-gray-25 transition-all duration-200"
            >
              <Folder size={20} className="text-[#232323]" />
              <Text className="text-sm font-medium text-[#232323] leading-[120%] text-center">
                Browse
              </Text>
            </button>
          </div>
        </Dropzone>
      ) : (
        <div className="relative border-2 border-dashed border-[#2F7D01] rounded-[20px] bg-[#F1F1F1] p-3 transition-all duration-300 w-full">
          {isImage && previewUrl ? (
            <div className="relative w-full h-[115px] sm:h-[139px] rounded-[10px] overflow-hidden isolate">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                unoptimized
                className="object-cover rounded-[10px] transition-opacity duration-300"
              />
              <div 
                className="absolute inset-0 rounded-[8px] pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, rgba(241, 241, 241, 0) 44.76%, rgba(35, 35, 35, 0.3) 100%)"
                }}
              />
              <div className="absolute top-2 right-2 z-20">
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200 active:scale-95"
                  aria-label="Remove file"
                >
                  <X size={16} className="text-[#232323]" />
                </button>
              </div>
              <button
                type="button"
                onClick={handleChangeFile}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row justify-center items-center px-6 py-3 gap-2.5 min-w-[100px] h-10 bg-[#FAFAFA] border border-[#F0F0F0] rounded-full shadow-[0px_2px_2px_rgba(21,31,20,0.1)] hover:bg-white hover:shadow-[0px_4px_4px_rgba(21,31,20,0.15)] transition-all duration-200 z-10 active:scale-95"
                
              >
                <Text className="text-sm font-medium text-[#232323] leading-[120%] text-center whitespace-nowrap">
                  Change
                </Text>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 min-h-[115px] sm:min-h-[139px]">
              <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:w-auto">
                <div className="flex flex-col justify-center items-center p-[9px_12px] gap-[10px] w-10 h-10 bg-[#FAFAFA] rounded-full shrink-0">
                  <HugeiconsIcon icon={FileAddIcon} size={18} className="text-[#232323]" />
                </div>
                <div className="min-w-0 flex-1">
                  <Text
                    className="text-sm font-normal text-[#232323] leading-[140%] truncate block"
                    title={value.name}
                    
                  >
                    {value.name}
                  </Text>
                  <Text className="text-xs font-normal text-[#666666] leading-[140%] tracking-[0.04px]" >
                    {(value.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </div>
              </div>
              <div className="flex flex-row gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="flex flex-row justify-center items-center px-4 py-2 h-10 bg-white border border-[#F0F0F0] rounded-full hover:bg-gray-25 transition-all duration-200 shrink-0 active:scale-95"
                  aria-label="Remove file"
                >
                  <X size={16} className="text-[#232323]" />
                </button>
                <button
                  type="button"
                  onClick={handleChangeFile}
                  className="flex flex-row justify-center items-center px-6 py-3 gap-2.5 h-10 bg-[#FAFAFA] border border-[#F0F0F0] rounded-full hover:bg-white transition-all duration-200 shrink-0 flex-1 sm:flex-initial active:scale-95"
                  
                >
                  <Text className="text-sm font-medium text-[#232323] leading-[120%] text-center whitespace-nowrap">
                    Change
                  </Text>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-error-500 text-xs">{error}</p>
      )}
    </div>
  );
}
