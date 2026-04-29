"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { ChevronUp, Calendar, Clock } from "lucide-react";
import type { FileWithPath } from "@mantine/dropzone";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { getStatusBadge, normalizeStatus } from "@/app/(customer)/_utils/status-badge";
import ResubmitSuccessModal from "./ResubmitSuccessModal";

export interface TransactionDocumentItem {
  id: string;
  name: string;
  size: string;
  /** Raw status label we show to the user (e.g. "Pending", "Approved", "Resubmit Document"). */
  status: string;
  lastUploadDate?: string;
  lastUploadTime?: string;
  fileName?: string;
  url?: string;
}

interface DocumentDetailProps {
  /** Transaction type label (e.g. "BTA", "Personal Travel Allowance (PTA)") – used in resubmit success modal title */
  transactionTypeLabel?: string;
  /** Live documents from the single-transaction API (no stale defaults). */
  documents?: TransactionDocumentItem[];
  onResubmitDocuments?: (
    documents: Array<{ documentType: string; file: FileWithPath }>
  ) => Promise<void>;
  onViewTransaction?: () => void;
  onOpenDocument?: (doc: TransactionDocumentItem) => void;
}

/** Documentation tab: document list, status badges, re-upload for Resubmit items, Resubmit button. */
export default function DocumentDetail({
  transactionTypeLabel = "Transaction",
  documents = [],
  onResubmitDocuments,
  onViewTransaction,
  onOpenDocument,
}: Readonly<DocumentDetailProps>) {
  const [reuploadFiles, setReuploadFiles] = useState<Record<string, FileWithPath | null>>({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [sectionCollapsed, setSectionCollapsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
  const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);
  const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"]);

  const canResubmit = (status: string) => {
    console.log("status", status);
    const normalized = normalizeStatus(status);
    return normalized === "requires_manual_review" || normalized === "resubmit_document" || normalized === "request_more_info" || normalized === "rejected";
  };

  const resubmitDocs = documents.filter((d) => canResubmit(d.status));
  const docTypeLabel = resubmitDocs.length > 1 ? "Documents" : "Document";
  const hasResubmit = resubmitDocs.length > 0;

  const handleResubmit = async () => {
    const selected = resubmitDocs
      .map((doc) => {
        const file = reuploadFiles[doc.id];
        return file ? { documentType: doc.id, file } : null;
      })
      .filter((item): item is { documentType: string; file: FileWithPath } => item !== null);

    if (selected.length === 0) {
      setSubmitError("Please choose at least one document to re-upload.");
      return;
    }

    const tooLarge = selected.find(({ file }) => file.size > MAX_FILE_SIZE_BYTES);
    if (tooLarge) {
      setSubmitError(`${tooLarge.file.name} exceeds 5MB. Please upload a smaller file.`);
      return;
    }

    const unsupported = selected.find(({ file }) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      return !(ALLOWED_MIME_TYPES.has(file.type) || ALLOWED_EXTENSIONS.has(extension));
    });
    if (unsupported) {
      setSubmitError(
        `${unsupported.file.name} is not supported. Use JPEG, PNG, WEBP, PDF, DOC or DOCX.`
      );
      return;
    }

    setSubmitError(null);
    if (!onResubmitDocuments) {
      setSuccessModalOpen(true);
      return;
    }

    try {
      setSubmitting(true);
      await onResubmitDocuments(selected);
      setSuccessModalOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to resubmit documents.";
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessModalOpen(false);
    setReuploadFiles({});
  };

  const handleViewTransaction = () => {
    setSuccessModalOpen(false);
    setReuploadFiles({});
    onViewTransaction?.();
  };

  return (
    <div className="flex flex-col px-4 pt-4 pb-8">
 <div className="flex flex-col gap-4 max-h-[550px] overflow-y-auto">
       {/* 4 Documents header with chevron */}
       <button
        type="button"
        onClick={() => setSectionCollapsed((c) => !c)}
        className="flex items-center justify-between gap-2 w-full text-left bg-[#FFF6F1] p-2 rounded-lg my-2"
      >
        <span className="font-medium text-sm leading-5 text-primary-400">
          {documents.length} Documents
        </span>
        <ChevronUp
          className={`w-4 h-4 text-gray-900 transition-transform ${sectionCollapsed ? "rotate-180" : ""}`}
        />
      </button>

      {!sectionCollapsed && (
        <div className="flex flex-col gap-6">
          {documents.map((doc) => (
          <div key={doc.id} className="flex flex-col gap-2">
              <div className="flex flex-row items-start justify-between gap-2 border-b border-gray-100 pb-2">
                <div>
                  <button
                      type="button"
                      onClick={() => onOpenDocument?.(doc)} className="font-medium text-base leading-6 text-[#323131] hover:underline cursor-pointer hover:text-primary-400">{doc.name}</button>
                  <p className="text-xs leading-4 text-[#8F8B8B]">
                    {doc.fileName ?? doc.size}
                  </p>
                  {(doc.lastUploadDate ?? doc.lastUploadTime) && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-[#4D4B4B]">
                      {doc.lastUploadDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-purple-400" strokeWidth={2} />
                          {doc.lastUploadDate}
                        </span>
                      )}
                      {doc.lastUploadTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-purple-400" strokeWidth={2} />
                          {doc.lastUploadTime}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div
                  className="shrink-0"
                  style={getStatusBadge(
                    normalizeStatus(doc.status)
                  )}
                >
                  {doc.status}
                </div>
              </div>

              {canResubmit(doc.status) && (
                <div className="mt-2 bg-bg-card-2 p-2 rounded-lg">
                  <FileUploadInput
                    label="Re-upload Document"
                    value={reuploadFiles[doc.id] ?? null}
                    onChange={(file) =>
                      setReuploadFiles((prev) => ({ ...prev, [doc.id]: file }))
                    }
                    placeholder="click to re-upload document"
                  />
                </div>
              )}
            </div>
          ))}

        </div>
      )}

 </div>
      {submitError && (
        <p className="mt-3 text-xs text-red-600">{submitError}</p>
      )}
      
{hasResubmit && (
            <Button
              variant="filled"
              fullWidth
              radius="xl"
              size="md"
              className="mt-4 bg-primary-400 hover:bg-primary-500 text-white font-medium"
              onClick={handleResubmit}
              loading={submitting}
            >
              Resubmit
            </Button>
          )}

      <ResubmitSuccessModal
        opened={successModalOpen}
        onClose={handleCloseSuccess}
        transactionTypeLabel={transactionTypeLabel}
        docTypeLabel={docTypeLabel}
        onViewTransaction={handleViewTransaction}
      />
    </div>
  );
}
