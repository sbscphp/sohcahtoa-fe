import { describe, expect, it } from "vitest";
import { normalizeInitiateConsentData } from "../normalize-initiate-response";
import {
  isIgreeFormValid,
  toIgreeInitiatePayload,
  validateIgreeForm,
} from "../igree-form-validation";

describe("normalizeInitiateConsentData", () => {
  it("normalizes iGree state/authUrl into sessionId/consentUrl", () => {
    expect(
      normalizeInitiateConsentData({
        sessionId: "",
        consentUrl: "",
        state: "abc123",
        authUrl: "https://idsandbox.nibss-plc.com.ng/oxauth/restv1/authorize",
        message: "ok",
      })
    ).toEqual({
      sessionId: "abc123",
      consentUrl: "https://idsandbox.nibss-plc.com.ng/oxauth/restv1/authorize",
      message: "ok",
    });
  });

  it("keeps Consent Hub sessionId/consentUrl", () => {
    expect(
      normalizeInitiateConsentData({
        sessionId: "sess-1",
        consentUrl: "https://consent.nibss-plc.com.ng/consent",
      })
    ).toEqual({
      sessionId: "sess-1",
      consentUrl: "https://consent.nibss-plc.com.ng/consent",
      message: undefined,
    });
  });

  it("returns null when redirect fields are missing", () => {
    expect(
      normalizeInitiateConsentData({
        sessionId: "",
        consentUrl: "",
        state: "only-state",
      })
    ).toBeNull();
  });
});

describe("validateIgreeForm", () => {
  const valid = {
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    dateOfBirth: "1990-01-01",
    phoneNumber: "+2348031234567",
    bvn: "12345678901",
  };

  it("accepts a complete valid form", () => {
    expect(validateIgreeForm(valid)).toEqual({});
    expect(isIgreeFormValid(valid)).toBe(true);
  });

  it("requires core identity fields", () => {
    const errors = validateIgreeForm({
      firstName: "",
      lastName: "",
      email: "",
      dateOfBirth: "",
      phoneNumber: "",
      bvn: "",
    });
    expect(errors.firstName).toBeTruthy();
    expect(errors.lastName).toBeTruthy();
    expect(errors.email).toBeTruthy();
    expect(errors.dateOfBirth).toBeTruthy();
    expect(errors.phoneNumber).toBeTruthy();
    expect(errors.bvn).toBeTruthy();
  });

  it("builds initiate payload with normalized phone", () => {
    expect(
      toIgreeInitiatePayload({
        ...valid,
        phoneNumber: "08031234567",
      })
    ).toEqual({
      bvn: "12345678901",
      firstName: "John",
      lastName: "Smith",
      dateOfBirth: "1990-01-01",
      phoneNumber: "+2348031234567",
      email: "john@example.com",
    });
  });
});
