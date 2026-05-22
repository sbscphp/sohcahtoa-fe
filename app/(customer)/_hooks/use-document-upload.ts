"use client";

import { useMutation } from "@tanstack/react-query";
import type { DocumentType } from "@/app/(customer)/_utils/transaction-document-requirements";
import {
  assertDocumentUploadBatch,
  buildSingleUploadFormData,
  uploadDocumentsSequential,
  type UploadedDocumentInfo,
} from "@/app/(customer)/_utils/document-upload";
import { customerApi } from "@/app/(customer)/_services/customer-api";

export type { DocumentUploadError } from "@/app/(customer)/_utils/document-upload";
export type { UploadedDocumentInfo };

export interface UploadDocumentParams {
  file: File | File[];
  userId: string;
  documentType: DocumentType | DocumentType[];
  transactionId?: string;
}

function mapUploadedDocument(doc: {
  documentType: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
}): UploadedDocumentInfo {
  return {
    documentType: doc.documentType as DocumentType,
    fileUrl: doc.fileUrl,
    fileName: doc.fileName,
    fileSize: doc.fileSize ?? 0,
  };
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: async ({
      file,
      userId,
      documentType,
      transactionId,
    }: UploadDocumentParams): Promise<UploadedDocumentInfo> => {
      const singleFile = file as File;
      const singleType = documentType as DocumentType;
      assertDocumentUploadBatch([singleFile], [singleType]);

      const response = await customerApi.documents.upload(
        buildSingleUploadFormData(singleFile, userId, singleType, transactionId),
      );
      return mapUploadedDocument(response.data);
    },
  });
}

/** Uploads transaction documents one file per request (POST /api/documents/upload). */
export function useUploadDocuments() {
  return useMutation({
    mutationFn: async (params: UploadDocumentParams): Promise<UploadedDocumentInfo[]> => {
      const files = params.file as File[];
      const types = params.documentType as DocumentType[];
      return uploadDocumentsSequential({
        files,
        documentTypes: types,
        userId: params.userId,
        transactionId: params.transactionId,
      });
    },
  });
}
