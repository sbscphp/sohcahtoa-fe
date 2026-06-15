import { buildDetailPayloadFromApi } from "@/app/(customer)/_utils/transaction-detail-payload";
import type { TransactionDetailData } from "@/app/_lib/api/types";

function makeApiDoc(
  type: string,
  required: boolean,
  uploaded: TransactionDetailData["requiredDocuments"][number]["uploaded"] = null,
) {
  return { type, required, uploaded };
}

describe("buildDetailPayloadFromApi documents", () => {
  const baseApi = {
    transactionId: "tx-1",
    referenceNumber: "REF-1",
    type: "SCHOOL_FEES",
    status: "AWAITING_VERIFICATION",
    currency: "USD",
    foreignAmount: 1000,
    nairaEquivalent: 1500000,
    currentStep: "DOCUMENTATION",
    createdAt: "2026-06-10T14:39:57.555Z",
    updatedAt: "2026-06-10T14:39:57.555Z",
    steps: [],
    comments: [],
    paymentDetails: [],
  } satisfies Partial<TransactionDetailData>;

  it("includes optional documents in the sheet when uploaded", () => {
    const uploaded = {
      id: "5a880452-4581-4d1d-b590-39c7a3e2d125",
      fileName: "bank-verification.pdf",
      fileUrl: "https://example.com/bank.pdf",
      status: "PENDING",
      rejectionNotes: null,
      uploadedAt: "2026-06-10T14:39:57.555Z",
      verifiedAt: null,
    };

    const payload = buildDetailPayloadFromApi({
      ...baseApi,
      requiredDocuments: [
        makeApiDoc("PASSPORT", true, uploaded),
        makeApiDoc("BANK_VERIFICATION", false, uploaded),
        makeApiDoc("OTHER_OPTIONAL", false, null),
      ],
    } as TransactionDetailData);

    expect(payload.documentsForSheet?.map((d) => d.id)).toEqual([
      "PASSPORT",
      "BANK_VERIFICATION",
    ]);
    expect(payload.requiredDocuments.uploadedFiles.map((f) => f.documentType)).toEqual([
      "PASSPORT",
      "BANK_VERIFICATION",
    ]);
    expect(payload.requiredDocuments.missingDocumentTypes).toEqual([]);
  });

  it("still lists missing required documents only", () => {
    const payload = buildDetailPayloadFromApi({
      ...baseApi,
      requiredDocuments: [
        makeApiDoc("INVOICE", true, null),
        makeApiDoc("BANK_VERIFICATION", false, null),
      ],
    } as TransactionDetailData);

    expect(payload.documentsForSheet?.map((d) => d.id)).toEqual(["INVOICE"]);
    expect(payload.requiredDocuments.missingDocumentTypes).toEqual([
      { documentType: "INVOICE", label: expect.any(String) },
    ]);
  });

  it("allows uploading missing required documents when transaction is rejected", () => {
    const payload = buildDetailPayloadFromApi({
      ...baseApi,
      status: "REJECTED",
      requiredDocuments: [
        makeApiDoc("PASSPORT", true, {
          id: "doc-1",
          fileName: "passport.jpg",
          fileUrl: "https://example.com/passport.jpg",
          status: "PENDING",
          rejectionNotes: null,
          uploadedAt: "2026-06-13T23:30:42.566Z",
          verifiedAt: null,
        }),
        makeApiDoc("INVOICE", true, null),
      ],
    } as TransactionDetailData);

    expect(payload.allowMissingDocumentUpload).toBe(true);
    const invoice = payload.documentsForSheet?.find((d) => d.id === "INVOICE");
    expect(invoice?.needsUpload).toBe(true);
    expect(invoice?.status).toBe("Not uploaded");
  });
});
