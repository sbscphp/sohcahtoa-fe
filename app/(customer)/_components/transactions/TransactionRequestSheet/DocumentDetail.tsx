"use client";

import { useState } from "react";
import { Button } from "@mantine/core";
import { ChevronUp, Calendar, Clock } from "lucide-react";
import type { FileWithPath } from "@mantine/dropzone";
import FileUploadInput from "@/app/(customer)/_components/forms/FileUploadInput";
import { getStatusBadge } from "@/app/(customer)/_utils/status-badge";
import ResubmitSuccessModal from "./ResubmitSuccessModal";

export interface TransactionDocumentItem {
  id: string;
  name: string;
  size: string;
  status: "Approved" | "Resubmit Document";
  lastUploadDate?: string;
  lastUploadTime?: string;
}

interface DocumentDetailProps {
  /** Transaction type label (e.g. "BTA", "Personal Travel Allowance (PTA)") – used in resubmit success modal title */
  transactionTypeLabel?: string;
  documents?: TransactionDocumentItem[];
  onViewTransaction?: () => void;
}

const DEFAULT_DOCUMENTS: TransactionDocumentItem[] = [
  { id: "form-a", name: "Form A", size: "100 KB", status: "Approved" },
  { id: "internal-passport", name: "Internal Passport", size: "100 KB", status: "Approved" },
  {
    id: "valid-visa",
    name: "Valid Visa",
    size: "100 KB",
    status: "Resubmit Document",
    lastUploadDate: "October 17",
    lastUploadTime: "11:00 am",
  },
  {
    id: "return-ticket",
    name: "Return Ticket",
    size: "100 KB",
    status: "Resubmit Document",
    lastUploadDate: "October 17",
    lastUploadTime: "11:00 am",
  },
];

/** Documentation tab: document list, status badges, re-upload for Resubmit items, Resubmit button. */
export default function DocumentDetail({
  transactionTypeLabel = "Transaction",
  documents = DEFAULT_DOCUMENTS,
  onViewTransaction,
}: DocumentDetailProps) {
  const [reuploadFiles, setReuploadFiles] = useState<Record<string, FileWithPath | null>>({});
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [sectionCollapsed, setSectionCollapsed] = useState(false);

  const resubmitDocs = documents.filter((d) => d.status === "Resubmit Document");
  const hasResubmit = resubmitDocs.length > 0;

  const handleResubmit = () => {
    setSuccessModalOpen(true);
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
                  <p className="font-medium text-base leading-6 text-[#323131]">{doc.name}</p>
                  <p className="text-xs leading-4 text-[#8F8B8B]">{doc.size}</p>
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
                    doc.status === "Resubmit Document" ? "resubmit_document" : doc.status
                  )}
                >
                  {doc.status}
                </div>
              </div>

              {doc.status === "Resubmit Document" && (
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
      
{hasResubmit && (
            <Button
              variant="filled"
              fullWidth
              radius="xl"
              size="md"
              className="mt-4 bg-primary-400 hover:bg-primary-500 text-white font-medium"
              onClick={handleResubmit}
            >
              Resubmit
            </Button>
          )}

      <ResubmitSuccessModal
        opened={successModalOpen}
        onClose={handleCloseSuccess}
        transactionTypeLabel={transactionTypeLabel}
        onViewTransaction={handleViewTransaction}
      />
    </div>
  );
}
