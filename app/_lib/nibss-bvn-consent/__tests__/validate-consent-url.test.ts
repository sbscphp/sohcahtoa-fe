import { describe, expect, it } from "vitest";
import { isAllowedNibssConsentUrl } from "../validate-consent-url";

describe("isAllowedNibssConsentUrl", () => {
  it("allows production NIBSS consent host", () => {
    expect(
      isAllowedNibssConsentUrl(
        "https://consent.nibss-plc.com.ng/consent/request/?sessionId=abc",
      ),
    ).toBe(true);
  });

  it("allows dev NIBSS consent hub host returned by verify-bvn", () => {
    expect(
      isAllowedNibssConsentUrl(
        "https://test-consenthub.nibss-plc.com.ng/consent/request/?sessionId=abc",
      ),
    ).toBe(true);
  });

  it("rejects non-NIBSS hosts", () => {
    expect(isAllowedNibssConsentUrl("https://evil.example.com/consent")).toBe(false);
    expect(isAllowedNibssConsentUrl("http://consent.nibss-plc.com.ng/consent")).toBe(false);
  });
});
