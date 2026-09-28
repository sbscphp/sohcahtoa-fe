import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  getIgreePageOrigins,
  getIgreeOriginFromConsentUrl,
  isNibssConsentCallbackMessage,
  resolveIgreePageOrigins,
  startIgreeCallbackHandshake,
  withWwwVariants,
} from "../igree-callback-handshake";

describe("withWwwVariants", () => {
  it("adds www and apex siblings", () => {
    expect(withWwwVariants("https://sohcahtoafinance.com")).toEqual([
      "https://sohcahtoafinance.com",
      "https://www.sohcahtoafinance.com",
    ]);
    expect(withWwwVariants("https://www.sohcahtoafinance.com")).toEqual([
      "https://www.sohcahtoafinance.com",
      "https://sohcahtoafinance.com",
    ]);
  });
});

describe("getIgreePageOrigins", () => {
  it("parses origins and expands www", () => {
    expect(
      getIgreePageOrigins(
        "https://igree.example.com, https://callback.sohcahtoa.com"
      )
    ).toEqual([
      "https://igree.example.com",
      "https://www.igree.example.com",
      "https://callback.sohcahtoa.com",
      "https://www.callback.sohcahtoa.com",
    ]);
  });

  it("strips /igree path and expands www variants", () => {
    expect(getIgreePageOrigins("https://sohcahtoafinance.com/igree")).toEqual([
      "https://sohcahtoafinance.com",
      "https://www.sohcahtoafinance.com",
    ]);
  });

  it("allows localhost", () => {
    expect(getIgreePageOrigins("http://localhost:3001")).toEqual([
      "http://localhost:3001",
    ]);
  });

  it("rejects http non-localhost", () => {
    expect(getIgreePageOrigins("http://evil.example.com")).toEqual([]);
  });
});

describe("resolveIgreePageOrigins", () => {
  it("derives origin from authorize redirect_uri", () => {
    const consentUrl =
      "https://idsandbox.nibss-plc.com.ng/oxauth/restv1/authorize?redirect_uri=" +
      encodeURIComponent("https://sohcahtoafinance.com/igree") +
      "&state=abc";

    expect(getIgreeOriginFromConsentUrl(consentUrl)).toBe(
      "https://sohcahtoafinance.com"
    );
    expect(resolveIgreePageOrigins(consentUrl)).toEqual(
      expect.arrayContaining([
        "https://sohcahtoafinance.com",
        "https://www.sohcahtoafinance.com",
      ])
    );
  });
});

describe("isNibssConsentCallbackMessage", () => {
  it("accepts a valid callback payload", () => {
    expect(
      isNibssConsentCallbackMessage({
        type: "NIBSS_CONSENT_CALLBACK",
        code: "auth-code",
        state: "state-123",
      })
    ).toBe(true);
  });

  it("rejects incomplete payloads", () => {
    expect(
      isNibssConsentCallbackMessage({ type: "NIBSS_CALLBACK_REQUEST" })
    ).toBe(false);
    expect(
      isNibssConsentCallbackMessage({
        type: "NIBSS_CONSENT_CALLBACK",
        code: "",
        state: "x",
      })
    ).toBe(false);
  });
});

describe("startIgreeCallbackHandshake", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a trusted consent callback", () => {
    const popup = {
      closed: false,
      postMessage: vi.fn(),
    } as unknown as Window;

    const onCallback = vi.fn();
    const controller = new AbortController();

    startIgreeCallbackHandshake({
      popup,
      igreeOrigins: ["https://igree.example.com"],
      signal: controller.signal,
      onCallback,
      intervalMs: 500,
      timeoutMs: 5_000,
    });

    expect(popup.postMessage).toHaveBeenCalledWith(
      { type: "NIBSS_CALLBACK_REQUEST" },
      "https://igree.example.com"
    );

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "NIBSS_CONSENT_CALLBACK",
          code: "code-1",
          state: "state-1",
        },
        origin: "https://igree.example.com",
        source: popup,
      })
    );

    expect(onCallback).toHaveBeenCalledWith({
      code: "code-1",
      state: "state-1",
      origin: "https://igree.example.com",
    });
  });

  it("on READY from www, immediately REQUEST that origin then accept callback", () => {
    const popup = {
      closed: false,
      postMessage: vi.fn(),
    } as unknown as Window;

    const onCallback = vi.fn();
    const controller = new AbortController();

    startIgreeCallbackHandshake({
      popup,
      igreeOrigins: ["https://sohcahtoafinance.com"],
      signal: controller.signal,
      onCallback,
    });

    window.dispatchEvent(
      new MessageEvent("message", {
        data: { type: "NIBSS_CALLBACK_READY" },
        origin: "https://www.sohcahtoafinance.com",
        source: popup,
      })
    );

    expect(popup.postMessage).toHaveBeenCalledWith(
      { type: "NIBSS_CALLBACK_REQUEST" },
      "https://www.sohcahtoafinance.com"
    );

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "NIBSS_CONSENT_CALLBACK",
          code: "auth-code",
          state: "sess-1",
        },
        origin: "https://www.sohcahtoafinance.com",
        source: popup,
      })
    );

    expect(onCallback).toHaveBeenCalledWith({
      code: "auth-code",
      state: "sess-1",
      origin: "https://www.sohcahtoafinance.com",
    });
  });

  it("ignores callbacks from untrusted origins", () => {
    const popup = {
      closed: false,
      postMessage: vi.fn(),
    } as unknown as Window;

    const onCallback = vi.fn();
    const controller = new AbortController();

    startIgreeCallbackHandshake({
      popup,
      igreeOrigins: ["https://igree.example.com"],
      signal: controller.signal,
      onCallback,
    });

    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          type: "NIBSS_CONSENT_CALLBACK",
          code: "code-1",
          state: "state-1",
        },
        origin: "https://evil.example.com",
        source: popup,
      })
    );

    expect(onCallback).not.toHaveBeenCalled();
    controller.abort();
  });
});
