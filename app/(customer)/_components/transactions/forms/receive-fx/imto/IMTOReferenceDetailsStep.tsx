"use client";

import { Button } from "@mantine/core";
import { IMTOAlert } from "./IMTOAlert";

interface IMTOReferenceDetailsStepProps {
  referenceNumber: string;
  senderName: string;
  receiverName: string;
  amount: string;
  status?: string;
  onProceed: () => void;
  onBack?: () => void;
}

export default function IMTOReferenceDetailsStep({
  referenceNumber,
  senderName,
  receiverName,
  amount,
  status = "Verified",
  onProceed,
  onBack,
}: IMTOReferenceDetailsStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h2 className="text-body-heading-300 text-2xl font-semibold leading-7">
          Reference Details
        </h2>
        <p className="text-body-text-300">
          View transaction details fetched from reference ID
        </p>
      </div>

    <div className="flex items-center justify-center">
    <IMTOAlert />
    </div>
    
      <div className="bg-bg-card rounded-2xl border border-gray-100 p-6 space-y-0">
        {/* Transaction Details / Ref */}
        <div className="flex justify-between items-start py-6 border-b border-gray-100">
          <span className="text-text-300 text-base">Transaction Details</span>
          <span className="text-heading-200 text-base font-medium text-primary-400">
            Ref: {referenceNumber}
          </span>
        </div>

        {/* Sender's Name */}
        <div className="flex justify-between items-start py-6 border-b border-gray-100">
          <span className="text-text-300 text-base">Sender&apos;s Name</span>
          <span className="text-heading-200 text-base font-medium">
            {senderName}
          </span>
        </div>

        {/* Receiver's Name */}
        <div className="flex justify-between items-start py-6 border-b border-gray-100">
          <span className="text-text-300 text-base">Receiver&apos;s Name</span>
          <span className="text-heading-200 text-base font-medium">
            {receiverName}
          </span>
        </div>

        {/* Status */}
        <div className="flex justify-between items-start py-6 border-b border-gray-100">
          <span className="text-text-300 text-base">Status</span>
          <span className="text-heading-200 text-base font-medium text-green-600">
            {status}
          </span>
        </div>

        {/* Amount */}
        <div className="flex justify-between items-start py-6">
          <span className="text-text-300 text-base">Amount</span>
          <span className="text-heading-200 text-base font-medium">
            {amount}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {onBack && (
          <Button
            type="button"
            variant="outline"
            radius="xl"
            className="!flex !items-center !justify-center !px-6 !py-3.5 w-full sm:!w-[138px] !min-h-[48px] !bg-white !border !border-text-50 !rounded-full !font-medium !text-base !leading-6 !text-[#4D4B4B]"
            onClick={onBack}
          >
            Back
          </Button>
        )}
        <Button
          type="button"
          size="md"
          radius="xl"
          className="w-full sm:!min-w-[200px] !min-h-[44px] !font-medium !text-base !bg-primary-400 hover:!bg-primary-500"
          onClick={onProceed}
        >
          Proceed to Disbursement
        </Button>
      </div>
    </div>
  );
}
