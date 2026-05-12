import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils";
import TransactionPage from "../page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/transactions",
  useParams: () => ({}),
}));

describe("Transactions page", () => {
  it("renders the main heading and subtitle", () => {
    render(<TransactionPage />);
    expect(screen.getByText(/No\. of Transaction/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Completed/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Rejected/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pending/i).length).toBeGreaterThan(0);
  });

  it("renders transaction type tabs", () => {
    render(<TransactionPage />);
    expect(screen.getByRole("tab", { name: /Buy FX/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Sell FX/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Receive FX/i })).toBeInTheDocument();
  });
});
