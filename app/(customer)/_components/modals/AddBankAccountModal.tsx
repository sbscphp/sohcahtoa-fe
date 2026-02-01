"use client";

import { Modal, Button, Select, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { z } from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDown } from "@hugeicons/core-free-icons";

const addBankSchema = z.object({
  bankName: z.string().min(1, "Select a bank"),
  accountNumber: z.string().min(1, "Account number is required")
});

export type AddBankAccountFormData = z.infer<typeof addBankSchema>;

const DEFAULT_BANKS = [
  "Wema Bank",
  "UBA Bank",
  "Union Bank",
  "Access Bank",
  "First Bank of Nigeria",
  "GTBank",
  "Zenith Bank"
];

interface AddBankAccountModalProps {
  opened: boolean;
  onClose: () => void;
  onAddAccount: (data: AddBankAccountFormData) => void;
  bankOptions?: string[];
}

export function AddBankAccountModal({
  opened,
  onClose,
  onAddAccount,
  bankOptions = DEFAULT_BANKS
}: AddBankAccountModalProps) {
  const form = useForm<AddBankAccountFormData>({
    mode: "uncontrolled",
    initialValues: {
      bankName: "",
      accountNumber: ""
    },
    validate: zod4Resolver(addBankSchema)
  });

  const handleSubmit = form.onSubmit(values => {
    onAddAccount(values);
    form.reset();
    onClose();
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <div className="pt-0 pr-0 pb-0 pl-0">
          <h2 className="text-[#4D4B4B] font-bold text-xl leading-7">
            Add New account
          </h2>
          <p className="text-[#6C6969] font-normal text-base leading-6 mt-1">
            Fill in the appropriate information to add a new account
          </p>
        </div>
      }
      centered
      radius="xl"
      size="lg"
      classNames={{
        content: "!p-0 overflow-hidden",
        header: "!p-0 !mb-0",
        title: "!p-6 !pb-4 border-b border-gray-100",
        body: "!p-0"
      }}
    >
      <form onSubmit={handleSubmit} className="flex flex-col">
        <div className="flex flex-col gap-6 px-6 py-6 overflow-y-auto max-h-[60vh]">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium leading-5 text-[#6C6969]">
              Select Bank <span className="text-red-500">*</span>
            </label>
            <Select
              required
              placeholder="Select Bank"
              data={bankOptions}
              size="md"
              rightSection={
                <HugeiconsIcon
                  icon={ChevronDown}
                  size={20}
                  className="text-[#B2AFAF]"
                />
              }
              classNames={{
                input:
                  "!min-h-[56px] !rounded-lg !border-[#CCCACA] !shadow-[0px_1px_2px_rgba(16,24,40,0.05)] !text-base !text-[#4D4B4B] placeholder:!text-[#8F8B8B]"
              }}
              {...form.getInputProps("bankName")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium leading-5 text-[#6C6969]">
              Account Number <span className="text-red-500">*</span>
            </label>
            <TextInput
              required
              placeholder="Enter Number"
              size="md"
              classNames={{
                input:
                  "!min-h-[56px] !rounded-lg !border-[#CCCACA] !shadow-[0px_1px_2px_rgba(16,24,40,0.05)] !text-base !text-[#4D4B4B] placeholder:!text-[#8F8B8B]"
              }}
              {...form.getInputProps("accountNumber")}
            />
          </div>
        </div>

        <div className="flex gap-4 px-6 py-6 bg-[#FFFAF8] justify-end">
          <Button
            type="button"
            variant="outline"
            radius="xl"
            className="min-w-[200px]! min-h-[52px]! py-3.5! px-6! bg-[#FFF6F1]! border-primary-200! text-primary-300! font-medium! text-base! hover:bg-[#FFEDE5]! hover:border-primary-200!"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            radius="xl"
            className="min-w-[200px]! min-h-[52px]! py-3.5! px-6! bg-primary-400! hover:bg-[#C74704]! text-[#FFF6F1]! font-medium! text-base!"
          >
            Add Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
