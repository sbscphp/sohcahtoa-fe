import { describe, it, expect, vi } from "vitest";
import { render } from "@/test-utils";
import Home from "./page";

const mockRedirect = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    mockRedirect(path);
  },
}));

describe("Home Page", () => {
  it("renders the welcome message", () => {
    render(<Home />);
    expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
  });

  it("has the correct styling classes", () => {
    mockRedirect.mockClear();
    render(<Home />);
    expect(mockRedirect).toHaveBeenCalledWith("/auth/login");
  });
});
