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
    const studentPassportFile = new File(["passport"], "student-passport.pdf", {
      type: "application/pdf",
    });

    const spec = getDocumentUploadSpec("SCHOOL_FEES", {
      studentPassportFile,
      evidenceOfAdmissionFile: new File(["admission"], "admission.pdf"),
      schoolInvoiceFile: new File(["invoice"], "invoice.pdf"),
    });

    expect(spec?.documentTypes).toContain("STUDENT_PASSPORT");
    expect(spec?.files).toContain(studentPassportFile);
  });

  it("falls back to legacy passportFile for school fees drafts", () => {
    const legacyPassportFile = new File(["passport"], "legacy-passport.pdf", {
      type: "application/pdf",
    });

    const spec = getDocumentUploadSpec("SCHOOL_FEES", {
      passportFile: legacyPassportFile,
    });

    expect(spec?.documentTypes).toContain("STUDENT_PASSPORT");
    expect(spec?.files).toContain(legacyPassportFile);
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

  it("uploads DIGITAL_SIGNATURE declaration text when signing with initials", () => {
    const spec = getSellOver10kDocumentUploadSpec("RESIDENT_FX", {
      ...over10kAmount,
      sourceOfFundsSignatureMode: "initials",
      sourceOfFundsInitials: "JD",
    });

    expect(spec).not.toBeNull();
    expect(spec!.documentTypes).toEqual(["DIGITAL_SIGNATURE"]);
    expect(spec!.files.some((f) => f.name === "digital-signature.txt")).toBe(true);
    expect(spec!.files.some((f) => f.name === "signature.png")).toBe(false);
  });

  it("uploads DIGITAL_SIGNATURE text and file when a signature file is provided", () => {
    const signatureFile = new File(["sig"], "signature.png", { type: "image/png" });

    const spec = getSellOver10kDocumentUploadSpec("RESIDENT_FX", {
      ...over10kAmount,
      sourceOfFundsSignatureMode: "upload",
      sourceOfFundsSignatureFile: signatureFile,
    });

    expect(spec).not.toBeNull();
    expect(spec!.documentTypes).toEqual(["DIGITAL_SIGNATURE", "DIGITAL_SIGNATURE"]);
    expect(spec!.files).toContain(signatureFile);
    expect(spec!.files.some((f) => f.name === "digital-signature.txt")).toBe(true);
  });
});
