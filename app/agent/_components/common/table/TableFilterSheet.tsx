"use client";

import { ChevronDown } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Drawer, Button, Checkbox, MultiSelect, Select } from "@mantine/core";
import { DatePickerInput, type DatesRangeValue } from "@mantine/dates";
import { useMemo, useState } from "react";

export interface TableFilterOption {
  label: string;
  value: string;
}

export type TableFilterControlType = "multi" | "single" | "dateRange";

export interface TableFilterGroup {
  label: string;
  key: string;
  type?: TableFilterControlType;
  options?: TableFilterOption[];
  placeholder?: string;
}

export interface TableFilterValues {
  selections: Record<string, string[]>;
  dateRange?: DatesRangeValue | null;
}

interface TableFilterSheetProps {
  opened: boolean;
  onClose: () => void;
  title?: string;
  groups: TableFilterGroup[];
  value?: TableFilterValues;
  onApply: (next: TableFilterValues) => void;
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function normalize(values?: TableFilterValues): TableFilterValues {
  return {
    selections: values?.selections ?? {},
    dateRange: values?.dateRange ?? null,
  };
}

export default function TableFilterSheet({
  opened,
  onClose,
  title = "Filter By",
  groups,
  value,
  onApply,
}: Readonly<TableFilterSheetProps>) {
  const initial = useMemo(() => normalize(value), [value]);
  const [draft, setDraft] = useState<TableFilterValues>(initial);

  const handleReset = () => setDraft({ selections: {}, dateRange: null });
  const handleSave = () => {
    onApply(draft);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="md"
      withCloseButton={false}
      overlayProps={{ opacity: 0.45, blur: 2 }}
      styles={{
        content: {
          borderTopLeftRadius: 18,
          borderBottomLeftRadius: 18,
        },
        body: {
          padding: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div className="px-5 pt-4 pb-3 border-b border-[#F0F0F0] flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-body-heading-300 text-base font-semibold">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#8F8B8B] hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {groups.map((group) => {
          const type: TableFilterControlType = group.type ?? "multi";

          if (type === "dateRange") {
            return (
              <div key={group.key} className="space-y-2">
                <p className="text-body-text-200 text-sm font-medium">
                  {group.label}
                </p>
                <DatePickerInput
                  type="range"
                  placeholder={group.placeholder ?? "Select"}
                  value={draft.dateRange ?? undefined}
                  onChange={(next) =>
                    setDraft((p) => ({ ...p, dateRange: next ?? null }))
                  }
                  size="md"
                  radius="md"
                />
              </div>
            );
          }

          const options = group.options ?? [];

          return (
            <div key={group.key} className="space-y-2">
              <p className="text-body-text-200 text-sm font-medium">{group.label}</p>
              {type === "single" ? (
                <Select
                  placeholder={group.placeholder ?? "Select"}
                  data={options.map((o) => ({ label: o.label, value: o.value }))}
                  value={(draft.selections[group.key] ?? [])[0] ?? null}
                  onChange={(next) =>
                    setDraft((prev) => ({
                      ...prev,
                      selections: {
                        ...prev.selections,
                        [group.key]: next ? [next] : [],
                      },
                    }))
                  }
                  size="md"
                  radius="md"
                  classNames={{
                    
                    dropdown: "rounded-xl!",
                  }}
                  rightSection={<HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />}
                  renderOption={({ option, checked }) => (
                    <div>
                    <Checkbox label={option.label} checked={checked} readOnly radius="sm" />
                    </div>
                  )}
                />
              ) : (
                <MultiSelect
                  placeholder={group.placeholder ?? "Select"}
                  data={options.map((o) => ({ label: o.label, value: o.value }))}
                  value={draft.selections[group.key] ?? []}
                  onChange={(next) =>
                    setDraft((prev) => ({
                      ...prev,
                      selections: {
                        ...prev.selections,
                        [group.key]: next,
                      },
                    }))
                  }
                  size="md"
                  radius="md"
                  clearable
                  hidePickedOptions={false}
                  rightSection={<HugeiconsIcon icon={ChevronDown} size={20} className="text-text-300" />}
                  searchable={false}
                  classNames={{
                    
                    dropdown: "rounded-xl!",
                    pillsList: "hidden",
                  }}
                  renderOption={({ option, checked }) => (
                    <Checkbox label={option.label} checked={checked} readOnly radius="sm" />
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="px-5 py-4 border-t border-[#F0F0F0] flex items-center justify-between gap-3">
        <Button
          variant="outline"
          radius="xl"
          className="flex-1 h-12!"
          onClick={handleReset}
        >
          Reset
        </Button>
        <Button
          variant="filled"
          radius="xl"
          className="flex-1 h-12! bg-primary-400 hover:bg-primary-500"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </Drawer>
  );
}

