import { DatePickerInput } from "@mantine/dates";
import { CiCalendar } from "react-icons/ci";
import "@mantine/dates/styles.css";
import { useState } from "react";

interface DateRangePickerProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  minDate?: Date | string;
  maxDate?: Date | string;
  placeholder?: string;
  valueFormat?: string;
  clearable?: boolean;
  disabled?: boolean;
  className?: string;
}

export const DateRangePicker = ({
  onDateRangeChange,
  minDate,
  maxDate,
  placeholder = "Select date range",
  valueFormat = "YYYY-MM-DD",
  clearable = true,
  disabled = false,
  className = "",
}: DateRangePickerProps) => {
  const [dateRange, setDateRange] = useState<[string | null, string | null]>([
    null,
    null,
  ]);

  const handleDateChange = (value: [string | null, string | null]) => {
    setDateRange(value);

    // Only emit when both dates are selected or both are cleared
    const [start, end] = value;
    
    if (start && end) {
      // Both dates selected - emit the date strings
      onDateRangeChange(start, end);
    } else if (!start && !end) {
      // Both dates cleared - emit empty strings
      onDateRangeChange("", "");
    }
    // If only one date is selected, don't emit anything yet
  };

  return (
    <DatePickerInput
      type="range"
      minDate={minDate}
      maxDate={maxDate}
      value={dateRange}
      onChange={handleDateChange}
      valueFormat={valueFormat}
      placeholder={placeholder}
      allowSingleDateInRange
      clearable={clearable}
      disabled={disabled}
      className={className}
      rightSection={
        !dateRange[0] && !dateRange[1] ? <CiCalendar /> : undefined
      }
      classNames={{
        label: "!capitalize",
      }}
      popoverProps={{
        classNames: {
          dropdown: "!text-primary-text",
        },
      }}
    />
  );
};