import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils";
import DashboardPageEmpty from "../page-empty";

vi.mock("@/app/assets/asset", () => ({
  landingFig: "/landing.png",
}));

vi.mock("next/image", () => ({
  default: (props: { src?: string; alt?: string }) => (
    <img src={props.src ?? ""} alt={props.alt ?? ""} />
  ),
}));

describe("Dashboard page-empty", () => {
  it("renders Hi, There heading and welcome text", () => {
    render(<DashboardPageEmpty />);
    expect(screen.getByRole("heading", { name: /Hi, There/i })).toBeInTheDocument();
    expect(screen.getByText(/Welcome to Sohcahtoa, choose the transaction/i)).toBeInTheDocument();
  });

  it("renders Buy Fx, Sell Fx and Receive Money cards", () => {
    render(<DashboardPageEmpty />);
    expect(screen.getByRole("heading", { name: /Buy Fx/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Sell Fx/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Receive Money/i })).toBeInTheDocument();
  });
});
