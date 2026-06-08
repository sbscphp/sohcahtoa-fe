import { getSellOver10kDocumentUploadSpec } from "../transaction-document-upload-spec";

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
