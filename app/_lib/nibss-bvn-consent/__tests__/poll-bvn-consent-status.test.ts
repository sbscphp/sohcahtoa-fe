import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  BvnConsentPollError,
  pollBvnConsentStatus,
} from "@/app/_lib/nibss-bvn-consent/poll-bvn-consent-status";

describe("pollBvnConsentStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns immediately when status is COMPLETED with verificationToken", async () => {
    const fetchStatus = vi.fn().mockResolvedValue({
      success: true,
      data: {
        status: "COMPLETED",
        verificationToken: "token-123",
      },
    });

    const result = await pollBvnConsentStatus({
      fetchStatus,
      initialIntervalMs: 1000,
    });

    expect(result.verificationToken).toBe("token-123");
    expect(fetchStatus).toHaveBeenCalledTimes(1);
  });

  it("polls until COMPLETED", async () => {
    const fetchStatus = vi
      .fn()
      .mockResolvedValueOnce({
        success: true,
        data: { status: "PENDING", message: "Waiting" },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { status: "COMPLETED", verificationToken: "token-456" },
      });

    const promise = pollBvnConsentStatus({
      fetchStatus,
      initialIntervalMs: 1000,
      maxIntervalMs: 1000,
    });

    await vi.advanceTimersByTimeAsync(1000);
    const result = await promise;

    expect(result.verificationToken).toBe("token-456");
    expect(fetchStatus).toHaveBeenCalledTimes(2);
  });

  it("throws FAILED when status is FAILED", async () => {
    const fetchStatus = vi.fn().mockResolvedValue({
      success: true,
      data: { status: "FAILED", message: "User declined consent" },
    });

    await expect(
      pollBvnConsentStatus({ fetchStatus, initialIntervalMs: 1000 })
    ).rejects.toMatchObject({
      code: "FAILED",
      message: "User declined consent",
    });
  });

  it("aborts when signal is triggered", async () => {
    const controller = new AbortController();
    const fetchStatus = vi.fn().mockResolvedValue({
      success: true,
      data: { status: "PENDING" },
    });

    const promise = pollBvnConsentStatus({
      fetchStatus,
      signal: controller.signal,
      initialIntervalMs: 5000,
    });

    controller.abort();

    await expect(promise).rejects.toBeInstanceOf(BvnConsentPollError);
  });
});
