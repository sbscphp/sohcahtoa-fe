import { describe, it, expect } from "vitest";
import { render, screen } from "@/test-utils";
import TransactionPage from "../page";

describe("Transactions page", () => {
  it("renders the main heading and subtitle", () => {
    render(<TransactionPage />);
    expect(
      screen.getByRole("heading", { name: /what would like to use the fx for/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/select transaction type below/i)).toBeInTheDocument();
  });

  it("renders all six FX transaction type cards", () => {
    render(<TransactionPage />);
    expect(screen.getByRole("heading", { name: /i am going on a vacation/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /i am travelling for business/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /pay school fees/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /seek medical treatment/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /pay a professional body/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /i am touring nigeria/i })).toBeInTheDocument();
  });
});
