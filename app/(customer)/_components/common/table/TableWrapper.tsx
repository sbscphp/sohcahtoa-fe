"use client";

import { Button, Tabs } from "@mantine/core";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon, UploadIcon } from "@hugeicons/core-free-icons";
import { ReactNode } from "react";
import PaginatedTable, { type PaginatedTableColumn } from "./PaginatedTable";
import FilterTabs from "../FilterTabs";

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
  onExportClick?: () => void;
  actionButton?: ReactNode;
  data: T[];
  columns: PaginatedTableColumn<T>[];
  pageSize?: number;
  onRowClick?: (item: T) => void;
  keyExtractor?: (item: T, index: number) => string | number;
  emptyMessage?: string;
}

export default function TableWrapper<T>({
  title,
  filterOptions,
  activeFilter,
  onFilterChange,
  onFilterClick,
  onExportClick,
  actionButton,
  data,
  columns,
  pageSize = 10,
  onRowClick,
  keyExtractor,
  emptyMessage = "No data found",
}: TableWrapperProps<T>) {
  return (
    <div className="space-y-4">
      {/* Header Section */}
        <h2 className="text-body-heading-300 text-lg font-semibold">{title}</h2>
      <div className="">

        <div className="flex items-center  justify-between gap-3 w-full sm:w-auto">
          {/* Filter Tabs */}
          <div>
            {filterOptions && activeFilter && onFilterChange && (
              <Tabs
              variant="pills"
                value={activeFilter}
                onChange={(v) => {
                  if (v != null) onFilterChange(v as string);
                }}
              >
                <FilterTabs items={filterOptions} value={activeFilter} />
              </Tabs>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 ml-auto">
            {onFilterClick && (
              <Button
                variant="outline"
                size="sm"
                radius="xl"
                rightSection={<HugeiconsIcon icon={FilterIcon} className="w-3.5 h-3.5 text-[#4D4B4B]! hover:text-primary-300!" />}
                onClick={onFilterClick}
                className="border-text-50! bg-white! hover:border-primary-200! hover:bg-[#FFF6F1]! px-4 py-2.5 gap-1.5 h-10 font-medium text-sm leading-5 text-[#4D4B4B]! hover:text-primary-300!"
              >
                Filter By
              </Button>
            )}
            {onExportClick && (
              <Button
                variant="outline"
                size="sm"
                radius="xl"
                rightSection={<HugeiconsIcon icon={UploadIcon} className="w-3.5 h-3.5 text-[#4D4B4B]! hover:text-[#E36C2F]!" />}
                onClick={onExportClick}
                className="border-text-50! bg-white! hover:border-[#E88A58]! hover:bg-[#FFF6F1]! px-4 py-2.5 gap-1.5 h-10 font-medium text-sm leading-5 text-[#4D4B4B]! hover:text-[#E36C2F]!"
                style={{ fontFamily: "'Jost', sans-serif", borderRadius: "48px" }}
              >
                Export
              </Button>
            )}
            {actionButton}
          </div>
        </div>
      </div>

      {/* Table */}
      <PaginatedTable
        data={data}
        columns={columns}
        pageSize={pageSize}
        onRowClick={onRowClick}
        keyExtractor={keyExtractor}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
