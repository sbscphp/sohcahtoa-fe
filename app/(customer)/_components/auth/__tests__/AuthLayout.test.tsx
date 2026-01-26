import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test-utils";
import { AuthLayout } from "../AuthLayout";

vi.mock("next/image", () => ({
  default: (props: { src?: string; alt?: string }) => (
    <img src={props.src ?? ""} alt={props.alt ?? ""} />
  ),
}));

vi.mock("@/app/assets/asset", () => ({
  logo: "/logo.png",
}));

describe("AuthLayout", () => {
  it("renders children", () => {
    render(
      <AuthLayout>
        <div>Auth form content</div>
      </AuthLayout>
    );
    expect(screen.getByText("Auth form content")).toBeInTheDocument();
  });
});
