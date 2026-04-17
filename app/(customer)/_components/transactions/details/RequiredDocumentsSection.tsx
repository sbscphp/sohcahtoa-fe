"use client";

import { getDocumentLabelForApiType } from "@/app/(customer)/_utils/transaction-validation";
import LabelText from "./LabelText";
import SectionBlock from "./SectionBlock";

export interface RequiredDocumentsData {
  bvn: string;
  nin?: string;
  tin?: string;
  formAId: string;
  /** Files from API `requiredDocuments` (covers school fees, PTA, sell FX, and future types). */
  uploadedFiles: Array<{
    documentType: string;
    filename: string;
    url?: string;
  }>;
}

interface RequiredDocumentsSectionProps {
  data: RequiredDocumentsData;
  onDownload?: (doc: string, filename: string) => void;
  /** When provided and document has url, clicking opens a viewer modal. */
  onViewDocument?: (docKey: string, filename: string, url: string) => void;
}

export default function RequiredDocumentsSection({
  data,
  onDownload,
  onViewDocument,
}: RequiredDocumentsSectionProps) {
  const makeDoc = (d: { filename: string; url?: string } | undefined, key: string) =>
    d
      ? {
          filename: d.filename,
          url: d.url,
          onView:
            d.url && onViewDocument
              ? () => {
                  const url = d.url;
                  if (url) onViewDocument(key, d.filename, url);
                }
              : undefined,
          onDownload: onDownload ? () => onDownload(key, d.filename) : undefined,
        }
      : undefined;

  return (
    <SectionBlock title="Required Documents">
      <LabelText label="BVN" text={data.bvn} />
      {data.nin != null && <LabelText label="NIN" text={data.nin} />}
      {data.tin != null && <LabelText label="TIN" text={data.tin} />}
      <LabelText label="Form A ID" text={data.formAId} />
      {data.uploadedFiles.map((file) => (
        <LabelText
          key={file.documentType}
          label={getDocumentLabelForApiType(file.documentType)}
          document={makeDoc(
            { filename: file.filename, url: file.url },
            file.documentType
          )}
        />
      ))}
    </SectionBlock>
  );
}
