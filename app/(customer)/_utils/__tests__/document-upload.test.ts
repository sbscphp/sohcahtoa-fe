import {
  assertDocumentUploadBatch,
  DocumentUploadError,
  MAX_DOCUMENT_FILE_BYTES,
  MAX_DOCUMENTS_PER_REQUEST,
  toDocumentUploadUserMessage,
} from "../document-upload";

describe("assertDocumentUploadBatch", () => {
  it("rejects when file count exceeds API max", () => {
    const files = Array.from({ length: MAX_DOCUMENTS_PER_REQUEST + 1 }, (_, i) =>
      new File(["x"], `f${i}.pdf`, { type: "application/pdf" }),
    );
    const types = files.map(() => "PASSPORT" as const);

    expect(() => assertDocumentUploadBatch(files, types)).toThrow(DocumentUploadError);
  });

  it("rejects files over 10MB", () => {
    const big = new File([new Uint8Array(MAX_DOCUMENT_FILE_BYTES + 1)], "big.pdf", {
      type: "application/pdf",
    });
    expect(() => assertDocumentUploadBatch([big], ["PASSPORT"])).toThrow(
      /exceeds 10MB/,
    );
  });

  it("allows valid batch", () => {
    const file = new File(["ok"], "ok.pdf", { type: "application/pdf" });
    expect(() => assertDocumentUploadBatch([file], ["PASSPORT"])).not.toThrow();
  });
});

describe("toDocumentUploadUserMessage", () => {
  it("maps 413 to a clear message", () => {
    expect(
      toDocumentUploadUserMessage({ message: "HTTP 413", status: 413 }, "passport.pdf"),
    ).toMatch(/passport\.pdf.*10MB/);
  });

  it("maps failed to fetch on upload", () => {
    expect(
      toDocumentUploadUserMessage({ message: "Failed to fetch", status: 0 }),
    ).toMatch(/too large|interrupted/i);
  });
});
