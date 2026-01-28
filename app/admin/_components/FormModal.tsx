"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  Select,
  Group,
  Text,
  LoadingOverlay,
  Textarea,
  NumberInput,
  Grid,
} from "@mantine/core";
import { X } from "lucide-react";
import FileUpload from "./FileUpload";

/* --------------------------------------------
| Types
--------------------------------------------- */
export type InputType = "text" | "email" | "tel" | "number" | "select" | "file" | "textarea";

export interface FormField {
  name: string;
  label: string;
  type: InputType;
  required?: boolean;
  placeholder?: string;
  // For select type
  options?: string[] | { value: string; label: string }[];
  // For file type
  accept?: string;
  maxSize?: number; // in MB
  // For textarea
  rows?: number;
  minRows?: number;
  // For number type
  min?: number;
  max?: number;
  // General
  disabled?: boolean;
  description?: string;
}

export interface FormModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (data: Record<string, any>) => void | Promise<void>;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  initialValues?: Record<string, any>;
  size?: "sm" | "md" | "lg" | "xl";
}

/* --------------------------------------------
| Component
--------------------------------------------- */
export default function   FormModal({
  opened,
  onClose,
  title,
  description,
  fields,
  onSubmit,
  submitLabel = "Submit",
  cancelLabel = "Close",
  loading = false,
  initialValues = {},
  size = "lg"
}: FormModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data with initial values
  useEffect(() => {
    if (opened) {
      const initialData: Record<string, any> = {};
      fields.forEach((field) => {
        initialData[field.name] = initialValues[field.name] || "";
      });
      setFormData(initialData);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (name: string, file: File | null) => {
    if (file) {
      const field = fields.find((f) => f.name === name);
      const maxSize = field?.maxSize || 2;

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          [name]: `File size must be less than ${maxSize} MB`,
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.required) {
        const value = formData[field.name];
        if (!value || (typeof value === "string" && !value.trim())) {
          newErrors[field.name] = `${field.label} is required`;
        }
      }

      // Email validation
      if (
        field.type === "email" &&
        formData[field.name] &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name])
      ) {
        newErrors[field.name] = "Invalid email address";
      }

      // Phone validation (basic)
      if (
        field.type === "tel" &&
        formData[field.name] &&
        !/^[+]?[\d\s()-]+$/.test(formData[field.name])
      ) {
        newErrors[field.name] = "Invalid phone number";
      }

      // Number validation
      if (field.type === "number") {
        const value = formData[field.name];
        if (field.min !== undefined && value < field.min) {
          newErrors[field.name] = `Value must be at least ${field.min}`;
        }
        if (field.max !== undefined && value > field.max) {
          newErrors[field.name] = `Value must be at most ${field.max}`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit(formData);
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      label: field.label,
      placeholder: field.placeholder,
      required: field.required,
      disabled: field.disabled || loading,
      description: field.description,
      error: errors[field.name],
    };

    // File and textarea inputs take full width, others take half on larger screens
    const colSpan = field.type === "file" || field.type === "textarea" ? 12 : { base: 12, sm: 6 };

    let inputElement;

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        inputElement = (
          <TextInput
            {...commonProps}
            type={field.type}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.currentTarget.value)}
          />
        );
        break;

      case "number":
        inputElement = (
          <NumberInput
            {...commonProps}
            value={formData[field.name] || ""}
            onChange={(value) => handleChange(field.name, value)}
            min={field.min}
            max={field.max}
          />
        );
        break;

      case "textarea":
        inputElement = (
          <Textarea
            {...commonProps}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.currentTarget.value)}
            rows={field.rows}
            minRows={field.minRows}
            autosize
          />
        );
        break;

      case "select":
        inputElement = (
          <Select
            {...commonProps}
            value={formData[field.name] || ""}
            onChange={(value) => handleChange(field.name, value)}
            data={field.options || []}
            searchable
            clearable={!field.required}
          />
        );
        break;

      case "file":
        inputElement = (
          <FileUpload
            label={field.label}
            value={formData[field.name] || null}
            onChange={(file) => handleFileChange(field.name, file)}
            accept={field.accept}
            maxSize={field.maxSize}
            required={field.required}
            disabled={field.disabled || loading}
            error={errors[field.name]}
          />
        );
        break;

      default:
        return null;
    }

    return (
      <Grid.Col key={field.name} span={colSpan}>
        {inputElement}
      </Grid.Col>
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div>
          <Text className="text-body-heading-300! text-xl! font-bold! mb-1!">
            {title}
          </Text>
          {description && (
            <Text className="text-body-text-50! text-sm!">
              {description}
            </Text>
          )}
        </div>
      }
      size={size}
      radius="md"
      closeButtonProps={{
        icon: <X size={20} className="bg-[#e69fb6]! text-pink-500! font-bold! rounded-full! p-1! hover:bg-[#e69fb6]/80! transition-all! duration-300!" />,
      }}
      centered
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={handleSubmit}>
        <Grid gutter="md">
          {fields.map((field) => renderField(field))}
        </Grid>

        <Group justify="flex-end" mt="xl" gap="sm">
          <Button
            variant="subtle"
            color="gray"
            onClick={onClose}
            disabled={loading}
            radius="xl"
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant="filled"
            color="#DD4F05"
            loading={loading}
            radius="xl"
          >
            {submitLabel}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}
