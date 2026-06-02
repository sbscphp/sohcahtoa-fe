"use client";

import BankDetailsFormSection from "./BankDetailsFormSection";

export interface BankDetailsMemberSummaryProps {
  memberName?: string;
  memberNumber?: string;
}

export default function BankDetailsMemberSummary({
  memberName,
  memberNumber,
}: Readonly<BankDetailsMemberSummaryProps>) {
  if (!memberName?.trim() && !memberNumber?.trim()) {
    return null;
  }

  return (
    <BankDetailsFormSection title="Member information">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {memberName?.trim() ? (
          <div>
            <dt className="text-sm text-body-text-200">Member name</dt>
            <dd className="text-sm font-medium text-body-heading-300">{memberName}</dd>
          </div>
        ) : null}
        {memberNumber?.trim() ? (
          <div>
            <dt className="text-sm text-body-text-200">Member number</dt>
            <dd className="text-sm font-medium text-body-heading-300">{memberNumber}</dd>
          </div>
        ) : null}
      </dl>
    </BankDetailsFormSection>
  );
}
