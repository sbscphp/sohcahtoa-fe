import { Tabs } from "@mantine/core";
import { ReactNode } from "react";

interface AdminTabButtonProps {
  value: string;
  children: ReactNode;
}

export default function AdminTabButton({ value, children }: AdminTabButtonProps) {
  return (
    <Tabs.Tab 
      value={value} 
      className="pb-3! text-body-text-50! data-active:text-orange-500! font-medium!"
    >
      {children}
    </Tabs.Tab>
  );
}
