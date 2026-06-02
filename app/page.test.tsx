import { describe, it, expect, vi } from "vitest";
import Home from "./page";

const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    mockRedirect(path);
    throw new Error("NEXT_REDIRECT");
  },
}));

describe("Home Page", () => {
  it("redirects to login", () => {
    expect(() => Home()).toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
  });

  it("always redirects to the same path", () => {
    mockRedirect.mockClear();
    expect(() => Home()).toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
  });
});
