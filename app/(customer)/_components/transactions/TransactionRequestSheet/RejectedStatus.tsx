"use client";

import { Calendar, Clock } from "lucide-react";

interface RejectedStatusProps {
  transactionId?: string;
  date?: string;
  time?: string;
  adminMessage?: string;
}

/** Rejected status block: pink background, admin message, no action button. */
export default function RejectedStatus({
  transactionId = "8833",
  date = "16 Nov 2025",
  time = "11:00 am",
  adminMessage = "This is a message box that show the message from the SohCahToa Admin regarding the rejection of this client transaction request. As this is rejected, they can't take any action from this point at all",
}: RejectedStatusProps) {
  return (
    <div className="flex flex-col items-center px-4 pt-6 pb-8">
      <div className="w-full max-w-[568px] flex flex-col items-center gap-4 p-3 bg-[#FECDD6] rounded-lg">
        {/* Top section: Title, ID, Date/Time */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex flex-row justify-between items-center gap-2">
            <h3 className="font-medium text-base leading-6 text-[#323131]">
              Request Rejected
            </h3>
          </div>
          <div className="w-full flex flex-row items-center gap-2 flex-wrap">
            <span className="text-xs leading-4 text-[#4D4B4B]">ID:{transactionId}</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#4D4B4B]" />
              <span className="text-xs leading-4 text-[#4D4B4B]">{date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#4D4B4B]" />
              <span className="text-xs leading-4 text-[#4D4B4B]">{time}</span>
            </div>
          </div>
        </div>

        {/* Message box */}
        <div className="w-full flex flex-row justify-center items-center gap-2 p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
          <p className="w-full text-xs leading-4 text-[#4D4B4B]">
            {adminMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
