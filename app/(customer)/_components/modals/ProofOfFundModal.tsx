"use client";

import { useState } from "react";
import { Modal, Button } from "@mantine/core";
import { FileWithPath } from "@mantine/dropzone";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { Plus } from "lucide-react";

const PROOF_OF_FUND_LABEL = "Proof of Fund";
const INITIAL_SLOTS = 1;

export interface ProofOfFundModalProps {
  opened: boolean;
  onClose: () => void;
  /** Called when user clicks "Attach Document" with the list of selected files. */
  onAttach?: (files: File[]) => void;
}

export default function ProofOfFundModal({
  opened,
  onClose,
  onAttach,
}: ProofOfFundModalProps) {
  const [files, setFiles] = useState<(FileWithPath | null)[]>(() =>
    Array(INITIAL_SLOTS).fill(null)
  );

  const addMore = () => {
    setFiles((prev) => [...prev, null]);
  };

  const setFileAt = (index: number, file: FileWithPath | null) => {
    setFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const handleAttach = () => {
    const selected = files.filter((f): f is FileWithPath => f != null);
    onAttach?.(selected);
    setFiles(Array(INITIAL_SLOTS).fill(null));
    onClose();
  };

  const handleClose = () => {
    setFiles(Array(INITIAL_SLOTS).fill(null));
    onClose();
  };

  const hasAtLeastOneFile = files.some((f) => f != null);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Attach Proof of Fund Document"
      centered
      size={693}
      radius="md"
      classNames={{
        content: "!max-w-[693px] p-0 overflow-hidden flex flex-col bg-white rounded-xl",
        header: "border-b border-gray-100 pb-6 px-6 pt-6",
        title: "text-xl font-bold text-[#4D4B4B] leading-7",
        body: "p-0 flex flex-col min-h-0 max-h-[524px]",
      }}
    >
      {/* Scrollable content – max height so "Add more" doesn’t grow modal indefinitely */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 py-4 max-h-[348px]">
        <div className="flex flex-col gap-6">
          {files.map((file, index) => (
            <FileUploadInput
              key={index}
              label={`${PROOF_OF_FUND_LABEL} *`}
              required
              value={file}
              onChange={(value) => setFileAt(index, value)}
              placeholder="Click to upload"
            />
          ))}

          <button
            type="button"
            onClick={addMore}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-gray-200 border-dashed text-body-text-200 text-sm font-medium hover:border-primary-400 hover:text-primary-400 transition-colors w-full"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden />
            Add more files
          </button>
        </div>
      </div>

      {/* Footer – design: background #FFFAF8, padding 24px 16px, gap 16px, buttons 52px / rounded 80px */}
      <div
        className="flex flex-row items-center justify-end gap-4 py-6 px-4 flex-none"
        style={{ background: "#FFFAF8" }}
      >
        <div className="flex flex-row items-center gap-4">
          <Button
            type="button"
            variant="outline"
            radius="xl"
            className="min-h-[52px] h-[52px] px-6 border-primary-200 bg-primary-00 text-primary-300 hover:bg-primary-25 hover:border-primary-200 font-medium text-base"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="filled"
            radius="xl"
            className="min-h-[52px] h-[52px] px-6 bg-primary-400 text-primary-00 hover:bg-primary-500 font-medium text-base disabled:bg-primary-100 disabled:text-white disabled:opacity-90"
            onClick={handleAttach}
            disabled={!hasAtLeastOneFile}
          >
            Attach Document
          </Button>
        </div>
      </div>
    </Modal>
  );
}
