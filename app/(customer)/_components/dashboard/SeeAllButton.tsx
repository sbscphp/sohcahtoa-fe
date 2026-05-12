"use client";

import { Button } from "@mantine/core";

type SeeAllButtonProps = {
  href?: string;
  onClick?: () => void;
  isViewAll?: boolean;
};

const buttonClass =
  "flex flex-row items-center justify-center gap-[5px] h-[27px] w-fit px-2.5 py-[5px] bg-white! border border-[#E4E4E7]! shadow-[0px_2px_2px_rgba(35,35,35,0.05)] rounded-[20px] font-medium text-sm leading-[120%] text-center text-[#232323] transition-colors hover:bg-gray-50! hover:border-gray-300! cursor-pointer";

export default function SeeAllButton({
  href,
  onClick,
  isViewAll = false,
}: SeeAllButtonProps) {
  if (href) {
    return (
      <Button component="a" href={href} unstyled className={buttonClass}>
        {isViewAll ? "View all" : "See all"}
      </Button>
    );
  }
  return (
    <Button type="button" onClick={onClick} unstyled className={buttonClass}>
      {isViewAll ? "View all" : "See all"}
    </Button>
  );
}
