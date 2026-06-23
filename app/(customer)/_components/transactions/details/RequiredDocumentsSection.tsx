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
  studentPassportDocumentNumber?: string;
  studentPassportIssueDate?: string;
  studentPassportExpiryDate?: string;
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

function hasRequiredDocumentsContent(data: RequiredDocumentsData): boolean {
  const textFields = [
    data.studentName,
    data.studentPassportDocumentNumber,
    data.studentPassportIssueDate,
    data.studentPassportExpiryDate,
    data.bvn,
    data.nin,
    data.tin,
    data.tinNumber,
    data.formAId,
    data.passportDocumentNumber,
    data.passportIssueDate,
    data.passportExpiryDate,
    data.workPermitNumber,
  ];

  if (textFields.some((value) => !isBlankDetailText(value))) {
    return true;
  }

  if (data.uploadedFiles.some((file) => !isBlankDetailText(file.filename))) {
    return true;
  }

  return (data.missingDocumentTypes?.length ?? 0) > 0;
}

export default function RequiredDocumentsSection({
  data,
  onDownload,
  onViewDocument,
}: Readonly<RequiredDocumentsSectionProps>) {
  if (!hasRequiredDocumentsContent(data)) {
    return null;
  }

  const missingDocs = data.missingDocumentTypes ?? [];
  const tinDisplay = data.tinNumber ?? data.tin;

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
      <LabelText hideWhenEmpty label="Student Name" text={data.studentName} />
      <LabelText
        hideWhenEmpty
        label="Student International Passport Number"
        text={data.studentPassportDocumentNumber}
      />
      <LabelText
        hideWhenEmpty
        label="Student Passport Issued Date"
        text={data.studentPassportIssueDate}
      />
      <LabelText
        hideWhenEmpty
        label="Student Passport Expiry Date"
        text={data.studentPassportExpiryDate}
      />
      <LabelText hideWhenEmpty label="BVN" text={data.bvn} />
      <LabelText hideWhenEmpty label="NIN" text={data.nin} />
      <LabelText hideWhenEmpty label="TIN Number" text={tinDisplay} />
      <LabelText hideWhenEmpty label="Form A ID" text={data.formAId} />
      <LabelText hideWhenEmpty label="Work Permit Number" text={data.workPermitNumber} />
      <LabelText
        hideWhenEmpty
        label="Applicant International Passport Number"
        text={data.passportDocumentNumber}
      />
      <LabelText hideWhenEmpty label="Applicant Passport Issued Date" text={data.passportIssueDate} />
      <LabelText hideWhenEmpty label="Applicant Passport Expiry Date" text={data.passportExpiryDate} />

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
