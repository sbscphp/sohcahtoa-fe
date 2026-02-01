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
  adminMessage = "This is a message box that show the message from the SohCahToa Admin regarding the rejection of this client transaction request. As this is rejected, they can't take any action from this point at all"
}: RejectedStatusProps) {
  return (
    <div className="flex flex-col items-center py-5">
      <div className="w-full max-w-[568px] flex flex-col items-center gap-4 p-3 bg-pink-100 rounded-lg">
        {/* Top section: Title, ID, Date/Time */}
        <div className="flex flex-col gap-2 w-full">
          <div className="space-y-1">
            <h3 className="font-medium text-base leading-6 text-[#323131]">
              Request Rejected
            </h3>
            <span className="text-xs leading-4 text-[#4D4B4B]">
              ID:{transactionId}
            </span>
            <div className="flex flex-row flex-wrap gap-2 items-center w-full">
              <div className="flex gap-1 items-center">
                <Calendar className="w-3.5 h-3.5 text-rose-300" strokeWidth={2} />
                <span className="text-xs leading-4 text-body-text-300">
                  {date}
                </span>
              </div>
              <div className="flex gap-1 items-center">
                <Clock className="w-3.5 h-3.5 text-rose-300" strokeWidth={2} />
                <span className="text-xs leading-4 text-body-text-300">
                  {time}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Message box */}
        <div className="flex flex-row gap-2 justify-center items-center p-3 w-full bg-white rounded-lg border border-gray-100 shadow-sm">
          <p className="w-full text-sm  text-[#4D4B4B]">
            {adminMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
