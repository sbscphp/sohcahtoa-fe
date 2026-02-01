import { describe, it, expect } from "vitest";
import { render, screen } from "@/test-utils";
import Home from "./page";

describe("Home Page", () => {
  it("renders the welcome message", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", {
      name: /welcome to sohcahtoa/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it("has the correct styling classes", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", {
      name: /welcome to sohcahtoa/i,
    });
    expect(heading).toHaveClass("text-2xl", "font-bold", "text-primary-orange");
  });
});
