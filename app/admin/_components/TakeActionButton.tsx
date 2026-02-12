"use client";

import { Button } from "@mantine/core";
import { useState } from "react";
import TakeActionOverlay from "../(AdminLayout)/transactions/[id]/TakeActionOverlay";

interface TakeActionButtonProps {
  /** Button text - defaults to "Take Action" */
  label?: string;
  /** Button size - defaults to "md" */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Button variant - defaults to "filled" */
  variant?: "filled" | "outline" | "light" | "subtle";
  /** Custom color - defaults to "#DD4F05" */
  color?: string;
  /** Additional className */
  className?: string;
  /** Callback when overlay opens */
  onOpen?: () => void;
  /** Callback when overlay closes */
  onClose?: () => void;
}

export default function TakeActionButton({
  label = "Take Action",
  size = "md",
  variant = "filled",
  color = "#DD4F05",
  className,
  onOpen,
  onClose,
}: TakeActionButtonProps) {
  const [opened, setOpened] = useState(false);

  const handleOpen = () => {
    setOpened(true);
    onOpen?.();
  };

  const handleClose = () => {
    setOpened(false);
    onClose?.();
  };

  return (
    <>
      <Button
        color={color}
        radius="xl"
        size={size}
        variant={variant}
        onClick={handleOpen}
        className={className}
      >
        {label}
      </Button>
      <TakeActionOverlay opened={opened} onClose={handleClose} />
    </>
  );
}
