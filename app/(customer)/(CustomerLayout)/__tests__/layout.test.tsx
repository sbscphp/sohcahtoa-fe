import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils";
import CustomerLayout from "../layout";

vi.mock("@/app/(customer)/_components/layout/CustomerLayoutShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="shell">{children}</div>,
}));

describe("CustomerLayout", () => {
  it("renders CustomerLayoutShell with children", () => {
    render(
      <CustomerLayout>
        <span>Page content</span>
      </CustomerLayout>
    );
    expect(screen.getByTestId("shell")).toBeInTheDocument();
    expect(screen.getByText("Page content")).toBeInTheDocument();
  });
});
