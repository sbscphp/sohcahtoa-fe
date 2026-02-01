"use client";

import PrepaidCard from "./PrepaidCard";
import AddCardButton from "./AddCardButton";

export default function CardsSection() {
  return (
    <div className="flex flex-col rounded-2xl bg-[#FAFAFA] p-2 shadow-sm">
      <div className="flex flex-1 flex-col gap-[15px]">
        <h2 className="text-sm font-normal leading-[120%] text-[#232323]">Cards</h2>
        <div className="flex h-[156px] flex-row items-stretch gap-[10px]">
          <PrepaidCard />
          <AddCardButton />
        </div>
      </div>
    </div>
  );
}
