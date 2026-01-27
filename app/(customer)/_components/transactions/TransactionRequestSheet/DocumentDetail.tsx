"use client";

/**
 * Documentation tab content: document list with statuses (Approved, Resubmit Document, etc.)
 * and re-upload inputs where needed. Data would come from API.
 */
export default function DocumentDetail() {
  return (
    <div className="flex flex-col px-4 pt-6 pb-8">
      <p className="text-[#8F8B8B] text-sm leading-5">
        Document list and statuses will be shown here (e.g. Form A, Visa, Return Ticket — Approved / Resubmit).
      </p>
    </div>
  );
}
