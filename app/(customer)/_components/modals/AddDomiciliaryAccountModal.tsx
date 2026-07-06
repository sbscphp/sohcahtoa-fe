"use client";

import { useState } from "react";
import { Modal, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import DomiciliaryAccountFields from "@/app/(customer)/_components/transactions/forms/DomiciliaryAccountFields";
import {
  domiciliaryAccountInitialValues,
  domiciliaryAccountSchema,
  type DomiciliaryAccountFormData,
} from "@/app/(customer)/_lib/domiciliary-account-schema";

interface AddDomiciliaryAccountModalProps {
  opened: boolean;
  onClose: () => void;
  onAddAccount: (data: DomiciliaryAccountFormData) => void | Promise<void>;
  isSubmitting?: boolean;
}

export function AddDomiciliaryAccountModal({
  opened,
  onClose,
  onAddAccount,
  isSubmitting = false,
}: Readonly<AddDomiciliaryAccountModalProps>) {
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm({
    initialValues: domiciliaryAccountInitialValues(),
    validate: zod4Resolver(domiciliaryAccountSchema),
  });

  const handleClose = () => {
    form.reset();
    setFormError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const validation = form.validate();
    if (validation.hasErrors) return;

    try {
      await onAddAccount(form.values);
      form.reset();
      onClose();
    } catch {
      setFormError("Unable to save domiciliary account. Please try again.");
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add Domiciliary Account"
      centered
      size="lg"
      radius="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <DomiciliaryAccountFields
          getInputProps={form.getInputProps}
          setFieldValue={form.setFieldValue}
          clearFieldError={form.clearFieldError}
          errors={form.errors}
        />

        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            radius="xl"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" radius="xl" loading={isSubmitting}>
            Add Account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
