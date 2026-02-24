"use client";

import { useMutation } from "@tanstack/react-query";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import type { DocumentType } from "@/app/(customer)/_utils/transaction-document-requirements";

export interface UploadedDocumentInfo {
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: number | string;
}

export interface UploadDocumentParams {
  file: File | File[];
  userId: string;
  documentType: DocumentType | DocumentType[];
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: async ({ file, userId, documentType }: UploadDocumentParams): Promise<UploadedDocumentInfo> => {
      const formData = new FormData();
      formData.append("document", file as File);
      formData.append("userId", userId);
      formData.append("documentType", documentType as DocumentType);

      const response = await customerApi.documents.upload(formData);
      const d = response.data;
      return { documentType: d.documentType, fileUrl: d.fileUrl, fileName: d.fileName, fileSize: d.fileSize };
    },
  });
}

export function useUploadDocuments() {
  return useMutation({
    mutationFn: async ({ file, userId, documentType }: UploadDocumentParams): Promise<UploadedDocumentInfo[]> => {
      const files = file as File[];
      const types = documentType as DocumentType[];
      if (files.length !== types.length) {
        throw new Error("Files and documentTypes arrays must have the same length");
      }

      const formData = new FormData();
      files.forEach((f) => formData.append("documents", f));
      formData.append("userId", userId);
      formData.append("documentTypes", JSON.stringify(types));

      const response = await customerApi.documents.uploadMultiple(formData);

      const documents = Array.isArray(response?.data) ? response?.data : [];

      return documents.map((doc: unknown) => {
        const d = doc as { documentType: string; fileUrl: string; fileName: string; fileSize?: number };
        return {
          documentType: d.documentType as DocumentType,
          fileUrl: d.fileUrl,
          fileName: d.fileName,
          fileSize: d.fileSize ?? 0,
        };
      });
    },
  });
}
