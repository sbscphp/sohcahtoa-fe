"use client";

import { useEffect } from "react";
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
import { useForm } from "@mantine/form";
import { X } from "lucide-react";
import FileUpload from "./FileUpload";

/* --------------------------------------------
| Types
--------------------------------------------- */
export type InputType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "file"
  | "textarea";

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
  // Validation
  validation?: (value: any) => React.ReactNode;
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
  onFieldChange?: (
    name: string,
    value: any,
    data: Record<string, any>
  ) => Record<string, any> | void;
}

/* --------------------------------------------
| Component
--------------------------------------------- */
export default function FormModal({
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
  size = "lg",
  onFieldChange,
}: FormModalProps) {
  const form = useForm<Record<string, any>>({
    initialValues: {},
    validate: (values) => {
      const errors: Record<string, any> = {};
      fields.forEach((field) => {
        const value = values[field.name];

        // Required validation
        if (
          field.required &&
          (!value || (typeof value === "string" && !value.trim()))
        ) {
          errors[field.name] = `${field.label} is required`;
          return;
        }

        // Custom validation
        if (field.validation && value) {
          const error = field.validation(value);
          if (error) {
            errors[field.name] = error;
            return;
          }
        }

        // Email validation
        if (
          field.type === "email" &&
          value &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          errors[field.name] = "Invalid email address";
          return;
        }

        // Phone validation (basic)
        if (field.type === "tel" && value && !/^[+]?[\d\s()-]+$/.test(value)) {
          errors[field.name] = "Invalid phone number";
          return;
        }

        // Number validation
        if (field.type === "number" && value !== undefined && value !== "") {
          if (field.min !== undefined && value < field.min) {
            errors[field.name] = `Value must be at least ${field.min}`;
          }
          if (field.max !== undefined && value > field.max) {
            errors[field.name] = `Value must be at most ${field.max}`;
          }
        }
      });
      return errors;
    },
  });

  // Initialize form data with initial values
  useEffect(() => {
    if (opened) {
      const initialData: Record<string, any> = {};
      fields.forEach((field) => {
        initialData[field.name] = initialValues[field.name] || "";
      });
      form.setInitialValues(initialData);
      form.setValues(initialData);
      form.clearErrors();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const handleChange = (name: string, value: any) => {
    let nextData = { ...formData, [name]: value };
    const maybeUpdatedData = onFieldChange?.(name, value, nextData);
    if (maybeUpdatedData && typeof maybeUpdatedData === "object") {
      nextData = maybeUpdatedData;
    }
    setFormData(nextData);
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (values: typeof form.values) => {
    await onSubmit(values);
  };

  const renderField = (field: FormField) => {
    const colSpan =
      field.type === "file" || field.type === "textarea"
        ? 12
        : { base: 12, sm: 6 };

    let inputElement;

    switch (field.type) {
      case "text":
      case "email":
      case "tel":
        inputElement = (
          <TextInput
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled || loading}
            description={field.description}
            type={field.type === "tel" ? "number" : field.type}
            {...form.getInputProps(field.name)}
          />
        );
        break;

      case "number":
        inputElement = (
          <NumberInput
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled || loading}
            description={field.description}
            min={field.min}
            max={field.max}
            {...form.getInputProps(field.name)}
          />
        );
        break;

      case "textarea":
        inputElement = (
          <Textarea
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled || loading}
            description={field.description}
            rows={field.rows}
            minRows={field.minRows}
            autosize
            {...form.getInputProps(field.name)}
          />
        );
        break;

      case "select":
        inputElement = (
          <Select
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled || loading}
            description={field.description}
            data={field.options || []}
            searchable
            clearable={!field.required}
            {...form.getInputProps(field.name)}
          />
        );
        break;

      case "file":
        inputElement = (
          <FileUpload
            label={field.label}
            value={form.values[field.name] || null}
            onChange={(file) => {
              if (file) {
                const maxSize = field.maxSize || 2;
                if (file.size > maxSize * 1024 * 1024) {
                  form.setFieldError(
                    field.name,
                    `File size must be less than ${maxSize} MB`,
                  );
                  return;
                }
                form.setFieldValue(field.name, file);
              } else {
                form.setFieldValue(field.name, null);
              }
            }}
            accept={field.accept}
            maxSize={field.maxSize}
            required={field.required}
            disabled={field.disabled || loading}
            error={form.errors[field.name] as string | undefined}
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
            <Text className="text-body-text-50! text-sm!">{description}</Text>
          )}
        </div>
      }
      size={size}
      radius="md"
      closeButtonProps={{
        icon: (
          <X
            size={20}
            className="bg-[#e69fb6]! text-pink-500! font-bold! rounded-full! p-1! hover:bg-[#e69fb6]/80! transition-all! duration-300!"
          />
        ),
      }}
      centered
    >
      <LoadingOverlay visible={loading} />

      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid gutter="md">{fields.map((field) => renderField(field))}</Grid>

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
