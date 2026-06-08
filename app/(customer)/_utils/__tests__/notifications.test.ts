import {
  normalizeNotificationHref,
  resolveNotificationHref,
} from "../notifications";
import type { Notification } from "@/app/_lib/api/types";

describe("normalizeNotificationHref", () => {
  it("prefixes relative paths with a leading slash", () => {
    expect(normalizeNotificationHref("transactions/detail/abc-123")).toBe(
      "/transactions/detail/abc-123",
    );
  });

  it("leaves absolute in-app paths unchanged", () => {
    expect(normalizeNotificationHref("/transactions/detail/abc-123")).toBe(
      "/transactions/detail/abc-123",
    );
  });

  it("leaves external URLs unchanged", () => {
    expect(normalizeNotificationHref("https://example.com/foo")).toBe(
      "https://example.com/foo",
    );
  });

  it("returns undefined for empty values", () => {
    expect(normalizeNotificationHref(undefined)).toBeUndefined();
    expect(normalizeNotificationHref("   ")).toBeUndefined();
  });
});

describe("resolveNotificationHref", () => {
  it("reads actionUrl from notification or nested data", () => {
    const notification = {
      id: "1",
      title: "Tx update",
      createdAt: "2025-01-01T00:00:00Z",
      actionUrl: "transactions/detail/tx-1",
    } as Notification;

    expect(resolveNotificationHref(notification)).toBe("/transactions/detail/tx-1");
  });
});
