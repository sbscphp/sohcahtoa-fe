import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils";
import CustomerLayoutShell from "../CustomerLayoutShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

vi.mock("@/app/assets/asset", () => ({
  logo: "/logo.png",
  collapsed_logo: "/collapsed.png",
}));

vi.mock("next/image", () => ({
  default: (props: { src?: string; alt?: string }) => (
    <img src={props.src ?? ""} alt={props.alt ?? ""} />
  ),
}));

describe("CustomerLayoutShell", () => {
  it("renders children in the main area", () => {
    render(
      <CustomerLayoutShell>
        <div>Main content</div>
      </CustomerLayoutShell>
    );
    expect(screen.getByText("Main content")).toBeInTheDocument();
  });

  it("renders header with Dashboard title when pathname is /dashboard", () => {
    render(
      <CustomerLayoutShell>
        <span>Child</span>
      </CustomerLayoutShell>
    );
    expect(screen.getByRole("heading", { name: /Dashboard/i })).toBeInTheDocument();
  });
});
