"use client";

type SeeAllButtonProps = {
  href?: string;
  onClick?: () => void;
};

export default function SeeAllButton({ href, onClick }: SeeAllButtonProps) {
  const className =
    "rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-[#6C6969] transition-colors hover:bg-gray-200";

  if (href) {
    return (
      <a href={href} className={className}>
        See all
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      See all
    </button>
  );
}
