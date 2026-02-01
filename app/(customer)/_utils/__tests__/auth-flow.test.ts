import { describe, it, expect } from "vitest";
import {
  getNextStep,
  getVerificationMethod,
  validateUserType,
} from "../auth-flow";

describe("auth-flow", () => {
  describe("getNextStep", () => {
    it("returns /auth/citizen/bvn from onboarding for citizen", () => {
      expect(getNextStep("citizen", "onboarding")).toBe("/auth/citizen/bvn");
    });

    it("returns /auth/tourist/upload-passport from onboarding for tourist", () => {
      expect(getNextStep("tourist", "onboarding")).toBe(
        "/auth/tourist/upload-passport"
      );
    });

    it("returns /auth/expatriate/upload-passport from onboarding for expatriate", () => {
      expect(getNextStep("expatriate", "onboarding")).toBe(
        "/auth/expatriate/upload-passport"
      );
    });

    it("returns review from bvn for citizen", () => {
      expect(getNextStep("citizen", "bvn")).toBe("/auth/citizen/review");
    });

    it("returns review from upload-passport for tourist", () => {
      expect(getNextStep("tourist", "upload-passport")).toBe(
        "/auth/tourist/review"
      );
    });

    it("returns verify-email from review", () => {
      expect(getNextStep("citizen", "review")).toBe(
        "/auth/citizen/verify-email"
      );
    });

    it("returns create-password from verify-email", () => {
      expect(getNextStep("citizen", "verify-email")).toBe(
        "/auth/citizen/create-password"
      );
    });

    it("returns /auth/login from create-password", () => {
      expect(getNextStep("citizen", "create-password")).toBe("/auth/login");
    });

    it("returns basePath for unknown step", () => {
      expect(getNextStep("citizen", "unknown")).toBe("/auth/citizen");
    });
  });

  describe("getVerificationMethod", () => {
    it('returns "bvn" for citizen', () => {
      expect(getVerificationMethod("citizen")).toBe("bvn");
    });

    it('returns "passport" for tourist and expatriate', () => {
      expect(getVerificationMethod("tourist")).toBe("passport");
      expect(getVerificationMethod("expatriate")).toBe("passport");
    });
  });

  describe("validateUserType", () => {
    it("returns the type for valid string", () => {
      expect(validateUserType("citizen")).toBe("citizen");
      expect(validateUserType("tourist")).toBe("tourist");
      expect(validateUserType("expatriate")).toBe("expatriate");
    });

    it("returns null for invalid string", () => {
      expect(validateUserType("invalid")).toBeNull();
    });

    it("returns null for array or undefined", () => {
      expect(validateUserType(["citizen"])).toBeNull();
      expect(validateUserType(undefined)).toBeNull();
    });
  });
});
