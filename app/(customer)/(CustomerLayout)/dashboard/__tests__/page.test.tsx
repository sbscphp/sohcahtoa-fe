import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils";
import DashboardPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/dashboard",
  useParams: () => ({}),
}));

describe("Dashboard page", () => {
  it("renders the dashboard layout with FX overview", () => {
    render(<DashboardPage />);
    expect(screen.getByRole("tab", { name: /FX bought/i })).toBeInTheDocument();
  });

  it("renders FX sold and Others tabs", () => {
    render(<DashboardPage />);
    expect(screen.getByRole("tab", { name: /FX sold/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Others/i })).toBeInTheDocument();
  });
});
