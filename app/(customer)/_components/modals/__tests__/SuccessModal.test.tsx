import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import { SuccessModal } from "../SuccessModal";

vi.mock("next/image", () => ({
  default: (props: { src?: unknown; alt?: string } & Record<string, unknown>) => (
    <img src={typeof props.src === "string" ? props.src : ""} alt={props.alt ?? ""} />
  ),
}));

describe("SuccessModal", () => {
  it("renders nothing when opened is false", () => {
    render(
      <SuccessModal
        opened={false}
        onClose={vi.fn()}
        title="Done"
        message="All set."
        buttonText="Continue"
        onButtonClick={vi.fn()}
      />
    );
    expect(screen.queryByText("Done")).not.toBeInTheDocument();
  });

  it("renders title, message and button when opened", () => {
    render(
      <SuccessModal
        opened
        onClose={vi.fn()}
        title="Success"
        message="Your request was completed."
        buttonText="Continue"
        onButtonClick={vi.fn()}
      />
    );
    expect(screen.getByRole("heading", { name: /success/i })).toBeInTheDocument();
    expect(screen.getByText(/your request was completed/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/i })).toBeInTheDocument();
  });

  it("calls onButtonClick when the primary button is clicked", async () => {
    const onButtonClick = vi.fn();
    const user = userEvent.setup();
    render(
      <SuccessModal
        opened
        onClose={vi.fn()}
        title="Success"
        message="Done."
        buttonText="Continue"
        onButtonClick={onButtonClick}
      />
    );
    await user.click(screen.getByRole("button", { name: /continue/i }));
    expect(onButtonClick).toHaveBeenCalledTimes(1);
  });
});
