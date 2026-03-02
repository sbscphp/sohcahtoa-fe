"use client";

import { Modal, Button } from "@mantine/core";
import { Download, X } from "lucide-react";

interface DocumentViewerModalProps {
  opened: boolean;
  onClose: () => void;
  /** URL of the file to display (e.g. Cloudinary or CDN). */
  fileUrl: string | null;
  /** Display name for the file. */
  filename?: string;
}

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const PDF_EXTENSIONS = [".pdf"];

function getFileKind(url: string, filename?: string): "pdf" | "image" | "other" {
  const lower = (filename ?? url).toLowerCase();
  if (PDF_EXTENSIONS.some((ext) => lower.endsWith(ext))) return "pdf";
  if (IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext))) return "image";
  return "other";
}

export default function DocumentViewerModal({
  opened,
  onClose,
  fileUrl,
  filename = "Document",
}: DocumentViewerModalProps) {
  const kind = fileUrl ? getFileKind(fileUrl, filename) : "other";

  const handleDownload = () => {
    if (fileUrl) window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={filename}
      size="lg"
      classNames={{
        title: "text-body-heading-300 font-semibold text-lg",
        header: "border-b border-gray-100",
        body: "p-0 overflow-hidden",
        content: "rounded-2xl overflow-hidden",
      }}
      closeButtonProps={{ "aria-label": "Close" }}
    >
      {fileUrl && (
        <div className="flex flex-col">
          <div className="min-h-[320px] max-h-[70vh] bg-gray-50 flex items-center justify-center p-4">
            {kind === "pdf" && (
              <iframe
                src={fileUrl}
                title={filename}
                className="w-full h-[60vh] min-h-[320px] rounded-lg border-0 bg-white"
              />
            )}
            {kind === "image" && (
              <img
                src={fileUrl}
                alt={filename}
                className="max-w-full max-h-[65vh] object-contain rounded-lg"
              />
            )}
            {kind === "other" && (
              <div className="flex flex-col items-center gap-4 text-center py-8">
                <p className="text-body-text-300 text-sm">Preview not available for this file type.</p>
                <Button
                  variant="light"
                  leftSection={<Download className="w-4 h-4" />}
                  onClick={handleDownload}
                  className="border-gray-200"
                >
                  Open or download file
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-row justify-end gap-2 p-4 border-t border-gray-100">
            <Button variant="outline" onClick={onClose} leftSection={<X className="w-4 h-4" />}>
              Close
            </Button>
            {(kind === "pdf" || kind === "image") && (
              <Button variant="filled" leftSection={<Download className="w-4 h-4" />} onClick={handleDownload}>
                Download
              </Button>
            )}
          </div>
        </div>
      )}
      {!fileUrl && (
        <div className="p-6 text-body-text-300 text-sm">
          No file URL available.
        </div>
      )}
    </Modal>
  );
}
