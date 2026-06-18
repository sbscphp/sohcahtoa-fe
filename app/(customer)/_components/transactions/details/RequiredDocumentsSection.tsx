"use client";

import { getDocumentLabelForApiType } from "@/app/(customer)/_utils/transaction-validation";
import LabelText, { isBlankDetailText } from "./LabelText";
import SectionBlock from "./SectionBlock";

export interface RequiredDocumentsData {
  bvn: string;
  nin?: string;
  tin?: string;
  passportDocumentNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  tinNumber?: string;
  studentName?: string;
  workPermitNumber?: string;
  formAId: string;
  /** Files from API `requiredDocuments` (covers school fees, PTA, sell FX, and future types). */
  uploadedFiles: Array<{
    documentType: string;
    filename: string;
    url?: string;
  }>;
  missingDocumentTypes?: Array<{
    documentType: string;
    label: string;
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
  const hasNin = data.nin != null && !isBlankDetailText(data.nin);
  const hasTin = data.tin != null && !isBlankDetailText(data.tin);
  const hasAnyUploaded = data.uploadedFiles.some(
    (f) => !isBlankDetailText(f.filename)
  );
  const missingDocs = data.missingDocumentTypes ?? [];
  const hasMissing = missingDocs.length > 0;
  const hasSection =
    !isBlankDetailText(data.bvn) ||
    !isBlankDetailText(data.formAId) ||
    hasNin ||
    hasTin ||
    hasAnyUploaded ||
    hasMissing;

  if (!hasSection) {
    return null;
  }

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
console.log(data)
  return (
    <SectionBlock title="Required Documents">
<LabelText hideWhenEmpty label="Student Name" text={data.studentName} />
      <LabelText hideWhenEmpty label="BVN" text={data.bvn} />
      {hasNin && <LabelText hideWhenEmpty label="NIN" text={data.nin} />}
      {hasTin && <LabelText hideWhenEmpty label="TIN" text={data.tin} />}
      <LabelText hideWhenEmpty label="Form A ID" text={data.formAId} />
      <LabelText hideWhenEmpty label="International Passport Number" text={data.passportDocumentNumber} />
      <LabelText hideWhenEmpty label="Passport Issued Date" text={data.passportIssueDate} />
      <LabelText hideWhenEmpty label="Passport Expiry Date" text={data.passportExpiryDate} />
      <LabelText hideWhenEmpty label="TIN Number" text={data.tinNumber} />
      {data.uploadedFiles.map((file) => (
        <LabelText
          key={file.documentType}
          label={getDocumentLabelForApiType(file.documentType)}
          hideWhenEmpty
          document={makeDoc(
            { filename: file.filename, url: file.url },
            file.documentType
          )}
        />
      ))}
      {missingDocs.map((doc) => (
        <LabelText
          key={`missing-${doc.documentType}`}
          label={doc.label}
          text="Not uploaded — use View Updates → Documentation to upload"
        />
      ))}
    </SectionBlock>
  );
}
