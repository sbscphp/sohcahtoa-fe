import {
  getDocumentUploadSpec,
  getBuyOverThresholdProofOfFundsUploadSpec,
  getSellOver10kDocumentUploadSpec,
  mergeDocumentUploadSpecs,
} from "../transaction-document-upload-spec";

describe("mergeDocumentUploadSpecs", () => {
  it("combines files and document types from multiple specs", () => {
    const proofFile = new File(["proof"], "proof.pdf", { type: "application/pdf" });
    const passportFile = new File(["passport"], "passport.pdf", { type: "application/pdf" });

    const merged = mergeDocumentUploadSpecs(
      {
        files: [passportFile],
        documentTypes: ["PASSPORT"],
      },
      {
        files: [proofFile],
        documentTypes: ["PROOF_OF_FUNDS"],
      }
    );

    expect(merged?.files).toEqual([passportFile, proofFile]);
    expect(merged?.documentTypes).toEqual(["PASSPORT", "PROOF_OF_FUNDS"]);
  });
});

describe("getDocumentUploadSpec", () => {
  it("includes school fees student passport file uploads", () => {
    const passportFile = new File(["passport"], "student-passport.pdf", {
      type: "application/pdf",
    });

    const spec = getDocumentUploadSpec("SCHOOL_FEES", {
      passportFile,
      evidenceOfAdmissionFile: new File(["admission"], "admission.pdf"),
      schoolInvoiceFile: new File(["invoice"], "invoice.pdf"),
    });

    expect(spec?.documentTypes).toContain("PASSPORT");
    expect(spec?.files).toContain(passportFile);
  });
});

describe("getBuyOverThresholdProofOfFundsUploadSpec", () => {
  it("uploads proof-of-funds files when amount is over threshold", () => {
    const proofFile = new File(["proof"], "proof.pdf", { type: "application/pdf" });
    const spec = getBuyOverThresholdProofOfFundsUploadSpec({
      receiveAmount: "15000",
      receiveCurrency: "USD",
      sendAmount: "",
      sendCurrency: "NGN",
      proofOfFundsFiles: [proofFile],
    });

    expect(spec?.documentTypes).toEqual(["PROOF_OF_FUNDS"]);
    expect(spec?.files).toEqual([proofFile]);
  });
});

describe("getSellOver10kDocumentUploadSpec", () => {
  const over10kAmount = {
    sendAmount: "15000",
    sendCurrency: "USD",
    receiveAmount: "",
    receiveCurrency: "NGN",
  };

  it("does not upload a separate DIGITAL_SIGNATURE file when signing with initials", () => {
    const spec = getSellOver10kDocumentUploadSpec("RESIDENT_FX", {
      ...over10kAmount,
      sourceOfFundsSignatureMode: "initials",
      sourceOfFundsInitials: "JD",
    });

    expect(spec).not.toBeNull();
    expect(spec!.documentTypes).toContain("SOURCE_OF_FUNDS_DECLARATION");
    expect(spec!.documentTypes).not.toContain("DIGITAL_SIGNATURE");
    expect(spec!.files.some((f) => f.name === "digital-signature.txt")).toBe(false);
  });

  it("uploads DIGITAL_SIGNATURE only when a signature file is provided", () => {
    const signatureFile = new File(["sig"], "signature.png", { type: "image/png" });

    const spec = getSellOver10kDocumentUploadSpec("RESIDENT_FX", {
      ...over10kAmount,
      sourceOfFundsSignatureMode: "upload",
      sourceOfFundsSignatureFile: signatureFile,
    });

    expect(spec).not.toBeNull();
    expect(spec!.documentTypes).toContain("DIGITAL_SIGNATURE");
    expect(spec!.files).toContain(signatureFile);
  });
});
