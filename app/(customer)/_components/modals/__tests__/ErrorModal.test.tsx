import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import { ErrorModal } from "../ErrorModal";

describe("ErrorModal", () => {
  it("renders nothing when opened is false", () => {
    render(
      <ErrorModal
        opened={false}
        onClose={vi.fn()}
        title="Error"
        message="Something went wrong."
      />
    );
    expect(screen.queryByText("Error")).not.toBeInTheDocument();
  });

  it("renders title, message and Close button when opened", () => {
    render(
      <ErrorModal
        opened
        onClose={vi.fn()}
        title="Error"
        message="Something went wrong."
      />
    );
    expect(screen.getByRole("heading", { name: /error/i })).toBeInTheDocument();
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });

  it("uses custom buttonText when provided", () => {
    render(
      <ErrorModal
        opened
        onClose={vi.fn()}
        title="Error"
        message="Failed."
        buttonText="Dismiss"
      />
    );
    expect(screen.getByRole("button", { name: /dismiss/i })).toBeInTheDocument();
  });

  it("calls onButtonClick when the button is clicked", async () => {
    const onButtonClick = vi.fn();
    const user = userEvent.setup();
    render(
      <ErrorModal
        opened
        onClose={vi.fn()}
        title="Error"
        message="Failed."
        onButtonClick={onButtonClick}
      />
    );
    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onButtonClick).toHaveBeenCalledTimes(1);
  });
});
