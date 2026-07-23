import { buildDetailPayloadFromApi } from "@/app/(customer)/_utils/transaction-detail-payload";
import type {
  TransactionDetailData,
  TransactionDetailRequiredDocUploaded,
} from "@/app/_lib/api/types";

function makeUploaded(
  id: string,
  fileName: string,
  fileUrl: string,
): TransactionDetailRequiredDocUploaded {
  return {
    id,
    fileName,
    fileUrl,
    status: "PENDING",
    rejectionNotes: null,
    uploadedAt: "2026-06-10T14:39:57.555Z",
    verifiedAt: null,
  };
}

function makeApiDoc(
  type: string,
  required: boolean,
  uploaded: TransactionDetailData["requiredDocuments"][number]["uploaded"] = null,
  uploads?: TransactionDetailRequiredDocUploaded[],
) {
  return { type, required, uploaded, ...(uploads ? { uploads } : {}) };
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
    const uploaded = makeUploaded(
      "5a880452-4581-4d1d-b590-39c7a3e2d125",
      "bank-verification.pdf",
      "https://example.com/bank.pdf",
    );

    const payload = buildDetailPayloadFromApi({
      ...baseApi,
      requiredDocuments: [
        makeApiDoc("PASSPORT", true, uploaded),
        makeApiDoc("BANK_VERIFICATION", false, uploaded),
        makeApiDoc("OTHER_OPTIONAL", false, null),
      ],
    } as TransactionDetailData);

    expect(payload.documentsForSheet?.map((d) => d.documentType)).toEqual([
      "PASSPORT",
      "BANK_VERIFICATION",
    ]);
    expect(payload.documentsForSheet?.map((d) => d.id)).toEqual([
      "5a880452-4581-4d1d-b590-39c7a3e2d125",
      "5a880452-4581-4d1d-b590-39c7a3e2d125",
    ]);
    expect(payload.requiredDocuments.uploadedFiles.map((f) => f.documentType)).toEqual([
      "PASSPORT",
      "BANK_VERIFICATION",
    ]);
    expect(payload.requiredDocuments.missingDocumentTypes).toEqual([]);
  });

  it("lists every proof of funds file when multiple share the same type", () => {
    const proofOne = makeUploaded("pof-1", "proof-a.pdf", "https://example.com/proof-a.pdf");
    const proofTwo = makeUploaded("pof-2", "proof-b.pdf", "https://example.com/proof-b.pdf");

    const payload = buildDetailPayloadFromApi({
      ...baseApi,
      requiredDocuments: [
        makeApiDoc("PROOF_OF_FUNDS", true, proofOne),
        makeApiDoc("PROOF_OF_FUNDS", true, proofTwo),
      ],
    } as TransactionDetailData);

    expect(payload.requiredDocuments.uploadedFiles).toEqual([
      {
        id: "pof-1",
        documentType: "PROOF_OF_FUNDS",
        label: "Proof of Funds 1",
        filename: "proof-a.pdf",
        url: "https://example.com/proof-a.pdf",
      },
      {
        id: "pof-2",
        documentType: "PROOF_OF_FUNDS",
        label: "Proof of Funds 2",
        filename: "proof-b.pdf",
        url: "https://example.com/proof-b.pdf",
      },
    ]);
    expect(payload.documentsForSheet?.map((d) => ({ id: d.id, name: d.name, documentType: d.documentType }))).toEqual([
      { id: "pof-1", name: "Proof of Funds 1", documentType: "PROOF_OF_FUNDS" },
      { id: "pof-2", name: "Proof of Funds 2", documentType: "PROOF_OF_FUNDS" },
    ]);
  });

  it("prioritizes uploads[] over singular uploaded for multi-file docs", () => {
    const first = makeUploaded(
      "ef445419-71d8-4475-ae81-552f7abc21dd",
      "receipt.pdf",
      "https://example.com/receipt.pdf",
    );
    const second = makeUploaded(
      "ee559e50-c135-4094-87d6-9e1ff3e8944e",
      "Partner Purpose.jpg",
      "https://example.com/partner.jpg",
    );

    const payload = buildDetailPayloadFromApi({
      ...baseApi,
      requiredDocuments: [
        makeApiDoc("PASSPORT", true, makeUploaded("pass-1", "passport.pdf", "https://example.com/p.pdf")),
        makeApiDoc("PROOF_OF_FUNDS", true, first, [first, second]),
      ],
    } as TransactionDetailData);

    expect(payload.requiredDocuments.uploadedFiles.map((f) => f.id)).toEqual([
      "pass-1",
      "ef445419-71d8-4475-ae81-552f7abc21dd",
      "ee559e50-c135-4094-87d6-9e1ff3e8944e",
    ]);
    expect(payload.requiredDocuments.uploadedFiles.map((f) => f.filename)).toEqual([
      "passport.pdf",
      "receipt.pdf",
      "Partner Purpose.jpg",
    ]);
    expect(
      payload.documentsForSheet
        ?.filter((d) => d.documentType === "PROOF_OF_FUNDS")
        .map((d) => ({ id: d.id, name: d.name, fileName: d.fileName })),
    ).toEqual([
      {
        id: "ef445419-71d8-4475-ae81-552f7abc21dd",
        name: "Proof of Funds 1",
        fileName: "receipt.pdf",
      },
      {
        id: "ee559e50-c135-4094-87d6-9e1ff3e8944e",
        name: "Proof of Funds 2",
        fileName: "Partner Purpose.jpg",
      },
    ]);
  });

  it("still lists missing required documents only", () => {
    const payload = buildDetailPayloadFromApi({
      ...baseApi,
      requiredDocuments: [
        makeApiDoc("INVOICE", true, null),
        makeApiDoc("BANK_VERIFICATION", false, null),
      ],
    } as TransactionDetailData);

    expect(payload.documentsForSheet?.map((d) => d.documentType)).toEqual(["INVOICE"]);
    expect(payload.requiredDocuments.missingDocumentTypes).toEqual([
      { id: "missing-INVOICE-0", documentType: "INVOICE", label: expect.any(String) },
    ]);
    expect(payload.allowMissingDocumentUpload).toBe(true);
  });

  it("blocks document upload when transaction is rejected", () => {
    const payload = buildDetailPayloadFromApi({
      ...baseApi,
      status: "REJECTED",
      requiredDocuments: [
        makeApiDoc(
          "PASSPORT",
          true,
          makeUploaded("doc-1", "passport.jpg", "https://example.com/passport.jpg"),
        ),
        makeApiDoc("INVOICE", true, null),
      ],
    } as TransactionDetailData);

    expect(payload.allowMissingDocumentUpload).toBe(false);
  });

  it("allows missing document upload during compliance review", () => {
    const payload = buildDetailPayloadFromApi({
      ...baseApi,
      status: "COMPLIANCE_REVIEW",
      requiredDocuments: [makeApiDoc("INVOICE", true, null)],
    } as TransactionDetailData);

    expect(payload.allowMissingDocumentUpload).toBe(true);
  });
});
