import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils";
import CustomerSidebar from "../CustomerSidebar";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  useParams: () => ({}),
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

describe("CustomerSidebar", () => {
  it("renders Overview, Transactions and Rate Calculator links", () => {
    render(<CustomerSidebar collapsed={false} />);
    expect(screen.getByRole("link", { name: /Overview/i })).toHaveAttribute("href", "/dashboard");
    expect(screen.getByRole("link", { name: /Transactions/i })).toHaveAttribute("href", "/transactions");
    expect(screen.getByRole("link", { name: /Rate Calculator/i })).toHaveAttribute("href", "/rate-calculator");
  });

  it("renders Need help and Contact Support when not collapsed", () => {
    render(<CustomerSidebar collapsed={false} />);
    expect(screen.getByText(/Need help/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact Support/i)).toBeInTheDocument();
  });

  it("hides Need help section when collapsed", () => {
    render(<CustomerSidebar collapsed />);
    expect(screen.queryByText(/Need help/i)).not.toBeInTheDocument();
  });
});
