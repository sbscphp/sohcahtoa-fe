"use client";

import { Button } from "@mantine/core";
import { Calendar, Clock, ArrowUpRight } from "lucide-react";

interface ApprovedStatusProps {
  transactionId?: string;
  date?: string;
  time?: string;
  adminMessage?: string;
  onProceedToPayment?: () => void;
}

/** Approved status block: green background, admin message, "Proceed to Payment" button. */
export default function ApprovedStatus({
  transactionId = "8833",
  date = "16 Nov 2025",
  time = "11:00 am",
  adminMessage = "This is a message box that show the message from the SohCahToa Admin regarding the approval of this client transaction request. As this is approved, this customer would then be able to take an action from this point",
  onProceedToPayment
}: ApprovedStatusProps) {
  return (
    <div className="flex flex-col items-center py-5">
      <div className="w-full min-h-[500px] ">
      <div className="w-full flex flex-col items-center gap-4 p-3 bg-success-100 rounded-lg">
        {/* Top section: Title, ID, Date/Time */}
        <div className="flex flex-col gap-2 w-full">
          <div className="space-y-1">
            <h3 className="font-medium text-base leading-6 text-[#323131]">
              Request Approved
            </h3>
            <span className="text-xs leading-4 text-[#4D4B4B]">
              ID:{transactionId}
            </span>
            <div className="flex flex-row flex-wrap gap-2 items-center w-full">
              <div className="flex gap-1 items-center">
                <Calendar
                  className="w-3.5 h-3.5 text-success-300"
                  strokeWidth={2}
                />
                <span className="text-xs leading-4 text-body-text-300">
                  {date}
                </span>
              </div>
              <div className="flex gap-1 items-center">
                <Clock
                  className="w-3.5 h-3.5 text-success-300"
                  strokeWidth={2}
                />
                <span className="text-xs leading-4 text-body-text-300">
                  {time}
                </span>
              </div>
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

      {/* Proceed to Payment button */}
      <div className="w-full mt-4">
        <Button
          variant="filled"
          fullWidth
          radius="xl"
          size="md"
          className="mt-4 bg-primary-400 hover:bg-primary-500 text-white font-medium! text-sm! leading-6"
          rightSection={<ArrowUpRight size={18} />}
          onClick={onProceedToPayment}
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}
