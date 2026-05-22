import { customerApi } from "@/app/(customer)/_services/customer-api";
import type { DocumentType } from "@/app/(customer)/_utils/transaction-document-requirements";
import type { ApiError } from "@/app/_lib/api/client";

export interface UploadedDocumentInfo {
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number | string;
}

/** Matches POST /api/documents/upload and /upload/multiple (OpenAPI). */
export const MAX_DOCUMENT_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENT_FILE_MB = 10;
export const MAX_DOCUMENTS_PER_REQUEST = 5;

export class DocumentUploadError extends Error {
  readonly code: "validation" | "upload";

  constructor(message: string, code: "validation" | "upload" = "validation") {
    super(message);
    this.name = "DocumentUploadError";
    this.code = code;
  }
}

export function assertDocumentUploadBatch(
  files: File[],
  documentTypes: DocumentType[],
): void {
  if (files.length !== documentTypes.length) {
    throw new DocumentUploadError("Each file must have a matching document type.");
  }
  if (files.length === 0) {
    throw new DocumentUploadError("No documents to upload.");
  }
  if (files.length > MAX_DOCUMENTS_PER_REQUEST) {
    throw new DocumentUploadError(
      `You can upload at most ${MAX_DOCUMENTS_PER_REQUEST} documents at a time.`,
    );
  }

  const tooLarge = files.find((f) => f.size > MAX_DOCUMENT_FILE_BYTES);
  if (tooLarge) {
    throw new DocumentUploadError(
      `"${tooLarge.name}" exceeds ${MAX_DOCUMENT_FILE_MB}MB. Please choose a smaller file.`,
    );
  }
}

export function buildSingleUploadFormData(
  file: File,
  userId: string,
  documentType: DocumentType,
  transactionId?: string,
): FormData {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("userId", userId);
  formData.append("documentType", documentType);
  if (transactionId) {
    formData.append("transactionId", transactionId);
  }
  return formData;
}

function mapUploadedDocument(
  doc: {
    documentType: string;
    fileUrl: string;
    fileName: string;
    fileSize?: number;
  },
): UploadedDocumentInfo {
  return {
    documentType: doc.documentType as DocumentType,
    fileUrl: doc.fileUrl,
    fileName: doc.fileName,
    fileSize: doc.fileSize ?? 0,
  };
}

export function toDocumentUploadUserMessage(error: unknown, fileName?: string): string {
  if (error instanceof DocumentUploadError) {
    return error.message;
  }

  if (error && typeof error === "object" && "status" in error) {
    const apiError = error as ApiError;
    if (apiError.status === 413) {
      return fileName
        ? `"${fileName}" is too large. Maximum size is ${MAX_DOCUMENT_FILE_MB}MB per file.`
        : `Files are too large. Maximum size is ${MAX_DOCUMENT_FILE_MB}MB per file.`;
    }
    if (
      apiError.status === 0 &&
      typeof apiError.message === "string" &&
      apiError.message.toLowerCase().includes("failed to fetch")
    ) {
      return fileName
        ? `Could not upload "${fileName}". The file may be too large or the connection was interrupted.`
        : "Upload failed. Files may be too large or the connection was interrupted.";
    }
    if (apiError.message && apiError.message !== `HTTP ${apiError.status}`) {
      return apiError.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Document upload failed. Please try again.";
}

function rethrowAsDocumentUploadError(error: unknown, fileName: string): never {
  throw new DocumentUploadError(toDocumentUploadUserMessage(error, fileName), "upload");
}

/**
 * Uploads each file via POST /api/documents/upload (one request per file).
 * Avoids oversized multipart batches that can trigger proxy 413 errors.
 */
export async function uploadDocumentsSequential(params: {
  files: File[];
  documentTypes: DocumentType[];
  userId: string;
  transactionId?: string;
}): Promise<UploadedDocumentInfo[]> {
  const { files, documentTypes, userId, transactionId } = params;
  assertDocumentUploadBatch(files, documentTypes);

  const results: UploadedDocumentInfo[] = [];

  for (const [index, file] of files.entries()) {
    const documentType = documentTypes[index];
    if (!documentType) continue;
    try {
      const response = await customerApi.documents.upload(
        buildSingleUploadFormData(file, userId, documentType, transactionId),
      );
      results.push(mapUploadedDocument(response.data));
    } catch (error) {
      rethrowAsDocumentUploadError(error, file.name);
    }
  }

  return results;
}
