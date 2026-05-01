"use client";

import { Button, Group, Tabs } from "@mantine/core";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon, UploadIcon } from "@hugeicons/core-free-icons";
import { ReactNode, useMemo, useState } from "react";
import PaginatedTable, { type PaginatedTableColumn } from "./PaginatedTable";
import FilterTabs from "../FilterTabs";
import TableFilterSheet, {
  type TableFilterGroup,
  type TableFilterValues,
} from "./TableFilterSheet";

export interface FilterTabOption {
  value: string;
  label: string;
}

interface TableWrapperProps<T> {
  title: string;
  filterOptions?: FilterTabOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  onFilterClick?: () => void;
  filters?: TableFilterGroup[];
  filterValues?: TableFilterValues;
  onFiltersApply?: (values: TableFilterValues) => void;
  filterSheetTitle?: string;
  onExportClick?: () => void;
  actionButton?: ReactNode;
  data: T[];
  columns: PaginatedTableColumn<T>[];
  pageSize?: number;
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T, index: number) => string | number;
  emptyMessage?: string;
  isLoading?: boolean;
  skeletonRowCount?: number;
}

export default function TableWrapper<T>({
  title,
  filterOptions,
  activeFilter,
  onFilterChange,
  onFilterClick,
  filters,
  filterValues,
  onFiltersApply,
  filterSheetTitle,
  onExportClick,
  actionButton,
  data,
  columns,
  pageSize = 10,
  onRowClick,
  keyExtractor,
  emptyMessage = "No data found",
  isLoading = false,
  skeletonRowCount = 4,
}: TableWrapperProps<T>) {
  const [filterSheetOpened, setFilterSheetOpened] = useState(false);

  const hasInlineFilters = useMemo(
    () => Array.isArray(filters) && filters.length > 0 && typeof onFiltersApply === "function",
    [filters, onFiltersApply]
  );

  const handleFilterButtonClick = () => {
    if (onFilterClick) return onFilterClick();
    if (hasInlineFilters) setFilterSheetOpened(true);
  };

  const showFilterTabs =
    filterOptions != null &&
    activeFilter != null &&
    onFilterChange != null;

  return (
    <div className="min-w-0 space-y-4">
      <h2 className="text-body-heading-300 text-lg font-semibold">{title}</h2>

      <Group
        justify={showFilterTabs ? "space-between" : "flex-end"}
        align="flex-start"
        wrap="wrap"
        gap="md"
        preventGrowOverflow={false}
        className="w-full min-w-0"
      >
        {showFilterTabs && (
          <div
            className="min-h-0 min-w-0 max-w-full flex-1 basis-0"
            aria-label="Transaction type filters"
          >
            <Tabs
              variant="pills"
              value={activeFilter}
              onChange={(v) => {
                if (v != null) onFilterChange(v as string);
              }}
            >
              <FilterTabs items={filterOptions} value={activeFilter} />
            </Tabs>
          </div>
        )}

        <Group
          gap="xs"
          wrap="wrap"
          justify="flex-end"
          preventGrowOverflow={false}
          className="min-w-0 max-w-full shrink-0 basis-full sm:basis-auto sm:max-w-none"
        >
          {(onFilterClick || hasInlineFilters) && (
            <Button
              variant="outline"
              size="sm"
              radius="xl"
              rightSection={
                <HugeiconsIcon
                  icon={FilterIcon}
                  className="h-3.5 w-3.5 text-[#4D4B4B]! hover:text-primary-300!"
                />
              }
              onClick={handleFilterButtonClick}
              className="h-10 gap-1.5 border-text-50! bg-white! px-4 py-2.5 font-medium text-sm leading-5 text-[#4D4B4B]! hover:border-primary-200! hover:bg-[#FFF6F1]! hover:text-primary-300!"
            >
              Filter By
            </Button>
          )}
          {onExportClick && (
            <Button
              variant="outline"
              size="sm"
              radius="xl"
              rightSection={
                <HugeiconsIcon
                  icon={UploadIcon}
                  className="h-3.5 w-3.5 text-[#4D4B4B]! hover:text-[#E36C2F]!"
                />
              }
              onClick={onExportClick}
              className="h-10 gap-1.5 border-text-50! bg-white! px-4 py-2.5 font-medium text-sm leading-5 text-[#4D4B4B]! hover:border-[#E88A58]! hover:bg-[#FFF6F1]! hover:text-[#E36C2F]!"
              style={{ fontFamily: "'Jost', sans-serif", borderRadius: "48px" }}
            >
              Export
            </Button>
          )}
          {actionButton ? (
            <div className="w-full min-w-0 shrink-0 basis-full sm:basis-auto sm:w-auto [&_a]:block [&_button]:w-full sm:[&_button]:w-auto">
              {actionButton}
            </div>
          ) : null}
        </Group>
      </Group>

      {/* Table */}
      <PaginatedTable
        data={data}
        columns={columns}
        pageSize={pageSize}
        onRowClick={onRowClick}
        keyExtractor={keyExtractor}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        skeletonRowCount={skeletonRowCount}
      />

      {hasInlineFilters && (
        <TableFilterSheet
          opened={filterSheetOpened}
          onClose={() => setFilterSheetOpened(false)}
          title={filterSheetTitle ?? "Filter By"}
          groups={filters ?? []}
          value={filterValues}
          onApply={(next) => onFiltersApply?.(next)}
        />
      )}
    </div>
  );
}
