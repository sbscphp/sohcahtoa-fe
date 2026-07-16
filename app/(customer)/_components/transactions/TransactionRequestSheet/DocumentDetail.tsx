"use client";

import { useMemo, useState } from "react";
import { Button } from "@mantine/core";
import { ChevronUp, Calendar, Clock } from "lucide-react";
import type { FileWithPath } from "@mantine/dropzone";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { getStatusBadge, normalizeStatus } from "@/app/(customer)/_utils/status-badge";
import ResubmitSuccessModal from "./ResubmitSuccessModal";
import { MAX_DOCUMENT_FILE_BYTES, MAX_DOCUMENT_FILE_MB } from "@/app/(customer)/_utils/document-upload";

export function isRequiresManualReviewStatus(status: string): boolean {
  return normalizeStatus(status) === "requires_manual_review";
}

export function documentsIncludeRequiresManualReview(
  documents: TransactionDocumentItem[] | undefined
): boolean {
  return (documents ?? []).some((d) => isRequiresManualReviewStatus(d.status));
}

export interface TransactionDocumentItem {
  /** Unique row id (prefer uploaded file id; never reuse document type alone). */
  id: string;
  /** API document type used when uploading / resubmitting (e.g. PROOF_OF_FUNDS). */
  documentType: string;
  name: string;
  size: string;
  /** Raw status label we show to the user (e.g. "Pending", "Approved", "Resubmit Document"). */
  status: string;
  lastUploadDate?: string;
  lastUploadTime?: string;
  fileName?: string;
  url?: string;
  /** No file on record yet (`requiredDocuments[].uploaded` was null). */
  needsUpload?: boolean;
}

interface DocumentDetailProps {
  transactionTypeLabel?: string;
  documents?: TransactionDocumentItem[];
  /** When true, customer may upload missing docs or resubmit (blocked when transaction is REJECTED). */
  allowMissingDocumentUpload?: boolean;
  onResubmitDocuments?: (
    documents: Array<{ documentType: string; file: FileWithPath }>
  ) => Promise<void>;
  onViewTransaction?: () => void;
  onOpenDocument?: (doc: TransactionDocumentItem) => void;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"]);

function canResubmitStatus(status: string): boolean {
  const normalized = normalizeStatus(status);
  return (
    normalized === "requires_manual_review" ||
    normalized === "resubmit_document" ||
    normalized === "request_more_info" ||
    normalized === "rejected"
  );
}

function validateSelectedFiles(
  selected: Array<{ documentType: string; file: FileWithPath }>
): string | null {
  if (selected.length === 0) {
    return "Please choose at least one document to upload.";
  }

  const tooLarge = selected.find(({ file }) => file.size > MAX_DOCUMENT_FILE_BYTES);
  if (tooLarge) {
    return `${tooLarge.file.name} exceeds ${MAX_DOCUMENT_FILE_MB}MB. Please upload a smaller file.`;
  }

  const unsupported = selected.find(({ file }) => {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    return !(ALLOWED_MIME_TYPES.has(file.type) || ALLOWED_EXTENSIONS.has(extension));
  });
  if (unsupported) {
    return `${unsupported.file.name} is not supported. Use JPEG, PNG, WEBP, PDF, DOC or DOCX.`;
  }

  return null;
}

export default function DocumentDetail({
  transactionTypeLabel = "Transaction",
  documents = [],
  allowMissingDocumentUpload = false,
  onResubmitDocuments,
  onViewTransaction,
  onOpenDocument,
}: Readonly<DocumentDetailProps>) {
  const [reuploadFiles, setReuploadFiles] = useState<Record<string, FileWithPath | null>>({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [sectionCollapsed, setSectionCollapsed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const displayDocuments = useMemo(() => documents, [documents]);

  const uploadableDocs = useMemo(
    () =>
      displayDocuments.filter(
        (doc) =>
          allowMissingDocumentUpload &&
          (canResubmitStatus(doc.status) || Boolean(doc.needsUpload)),
      ),
    [displayDocuments, allowMissingDocumentUpload],
  );

  const hasUploadAction = uploadableDocs.length > 0;

  const submitButtonLabel = useMemo(() => {
    if (uploadableDocs.length === 0) return "Submit";
    const allFirstUpload = uploadableDocs.every((d) => d.needsUpload);
    const allResubmit = uploadableDocs.every((d) => !d.needsUpload);
    if (allFirstUpload) return "Upload documents";
    if (allResubmit) return "Resubmit";
    return "Submit documents";
  }, [uploadableDocs]);

  const docTypeLabel = uploadableDocs.length > 1 ? "Documents" : "Document";

  const handleSubmitDocuments = async () => {
    const selected = uploadableDocs
      .map((doc) => {
        const file = reuploadFiles[doc.id];
        return file
          ? { documentType: doc.documentType || doc.id, file }
          : null;
      })
      .filter((item): item is { documentType: string; file: FileWithPath } => item !== null);

    const validationError = validateSelectedFiles(selected);
    if (validationError) {
      setSubmitError(validationError);
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
      const message =
        error instanceof Error ? error.message : "Failed to upload documents.";
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
        <button
          type="button"
          onClick={() => setSectionCollapsed((c) => !c)}
          className="flex items-center justify-between gap-2 w-full text-left bg-[#FFF6F1] p-2 rounded-lg my-2"
        >
          <span className="font-medium text-sm leading-5 text-primary-400">
            {displayDocuments.length} Documents
          </span>
          <ChevronUp
            className={`w-4 h-4 text-gray-900 transition-transform ${sectionCollapsed ? "rotate-180" : ""}`}
          />
        </button>

        {!sectionCollapsed && (
          <div className="flex flex-col gap-6">
            {displayDocuments.length === 0 ? (
              <p className="text-sm text-[#8F8B8B]">No documents are required for this transaction.</p>
            ) : (
              displayDocuments.map((doc) => {
                const showUploadField =
                  allowMissingDocumentUpload &&
                  (canResubmitStatus(doc.status) || Boolean(doc.needsUpload));
                const canOpenExisting = Boolean(doc.url?.trim());
                const subtitle = doc.needsUpload
                  ? "No file uploaded yet"
                  : (doc.fileName ?? doc.size);

                return (
                  <div key={doc.id} className="flex flex-col gap-2">
                    <div className="flex flex-row items-start justify-between gap-2 border-b border-gray-100 pb-2">
                      <div>
                        {canOpenExisting ? (
                          <button
                            type="button"
                            onClick={() => onOpenDocument?.(doc)}
                            className="font-medium text-base leading-6 text-[#323131] hover:underline cursor-pointer hover:text-primary-400"
                          >
                            {doc.name}
                          </button>
                        ) : (
                          <span className="font-medium text-base leading-6 text-[#323131]">
                            {doc.name}
                          </span>
                        )}
                        <p className="text-xs leading-4 text-[#8F8B8B]">{subtitle}</p>
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
                        style={getStatusBadge(normalizeStatus(doc.status))}
                      >
                        {doc.status}
                      </div>
                    </div>

                    {showUploadField && (
                      <div className="mt-2 bg-bg-card-2 p-2 rounded-lg">
                        <FileUploadInput
                          label={doc.needsUpload ? "Upload document" : "Re-upload document"}
                          value={reuploadFiles[doc.id] ?? null}
                          onChange={(file) =>
                            setReuploadFiles((prev) => ({ ...prev, [doc.id]: file }))
                          }
                          placeholder={
                            doc.needsUpload
                              ? "Click to upload document"
                              : "Click to re-upload document"
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {submitError && <p className="mt-3 text-xs text-red-600">{submitError}</p>}

      {hasUploadAction && (
        <Button
          variant="filled"
          fullWidth
          radius="xl"
          size="md"
          className="mt-4 bg-primary-400 hover:bg-primary-500 text-white font-medium"
          onClick={handleSubmitDocuments}
          loading={submitting}
        >
          {submitButtonLabel}
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
