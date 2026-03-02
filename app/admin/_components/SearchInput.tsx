"use client";

import { TextInput, type TextInputProps } from "@mantine/core";
import { Search } from "lucide-react";

const SEARCH_ICON_SIZE = 16;
const LEFT_SECTION_WIDTH = 48;

export interface SearchInputProps extends Omit<TextInputProps, "leftSection"> {
  placeholder?: string;
}

export default function SearchInput({
  placeholder = "Enter keyword",
  value,
  onChange,
  w = 200,
  radius = "xl",
  ...rest
}: SearchInputProps) {
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className=""
      w={w}
      radius={radius}
      leftSection={
        <Search size={SEARCH_ICON_SIZE} className="text-primary-400" />
      }
      leftSectionWidth={LEFT_SECTION_WIDTH}
      leftSectionPointerEvents="none"
      {...rest}
    />
  );
}
