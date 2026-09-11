import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test-utils";
import FormModal, { type FormField } from "../FormModal";

const phoneFields: FormField[] = [
  {
    name: "phoneNumber",
    label: "Phone Number",
    type: "tel",
    required: true,
    placeholder: "+234 00 0000 0000",
  },
];

const PHONE_ERROR =
  "Phone number must be 080… or +234… format (e.g., 08031234567 or +2348031234567)";

function renderPhoneModal(onSubmit = vi.fn()) {
  render(
    <FormModal
      opened
      onClose={vi.fn()}
      title="Create New Agent"
      fields={phoneFields}
      onSubmit={onSubmit}
      submitLabel="Create Agent"
    />,
  );
  return onSubmit;
}

describe("FormModal phone validation", () => {
  it("accepts 080… (11 digits) and submits", async () => {
    const user = userEvent.setup();
    const onSubmit = renderPhoneModal();

    await user.type(screen.getByLabelText(/phone number/i), "08031234567");
    await user.click(screen.getByRole("button", { name: /create agent/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: "08031234567" }),
    );
    expect(screen.queryByText(PHONE_ERROR)).not.toBeInTheDocument();
  });

  it("accepts +234… (country code + 10 digits) and submits", async () => {
    const user = userEvent.setup();
    const onSubmit = renderPhoneModal();

    await user.type(screen.getByLabelText(/phone number/i), "+2348031234567");
    await user.click(screen.getByRole("button", { name: /create agent/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: "+2348031234567" }),
    );
  });

  it("accepts spaced 080 and +234 formats", async () => {
    const user = userEvent.setup();
    const onSubmit = renderPhoneModal();

    const input = screen.getByLabelText(/phone number/i);
    await user.type(input, "080 3123 4567");
    await user.click(screen.getByRole("button", { name: /create agent/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: "080 3123 4567" }),
    );
  });

  it.each([
    ["0803123456", "too short 080"],
    ["080312345678", "too long 080"],
    ["+234803123456", "too short +234"],
    ["+23480312345678", "too long +234"],
    ["+2340803123456", "leading 0 after +234"],
    ["2348031234567", "missing + on 234"],
  ])("rejects %s (%s) and blocks submit", async (value) => {
    const user = userEvent.setup();
    const onSubmit = renderPhoneModal();

    await user.type(screen.getByLabelText(/phone number/i), value);
    await user.click(screen.getByRole("button", { name: /create agent/i }));

    expect(screen.getByText(PHONE_ERROR)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
