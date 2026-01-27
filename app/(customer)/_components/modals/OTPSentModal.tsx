import { Modal, Button } from '@mantine/core';

interface OTPSentModalProps {
  opened: boolean;
  onClose: () => void;
  onGoToEmail: () => void;
  email?: string;
}

export function OTPSentModal({ opened, onClose, onGoToEmail }: OTPSentModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="" centered radius="lg" withCloseButton={false} size="sm">
      <div className="text-center space-y-6">
        {/* Success Icon with animated halo */}
        <div className="flex justify-center relative">
          <div className="w-20 h-20 rounded-full bg-success-500 flex items-center justify-center relative">
            {/* Animated halo effect */}
            <div className="absolute inset-0 rounded-full border-4 border-success-500 border-dashed animate-pulse opacity-50"></div>
            {/* Checkmark */}
            <svg className="w-10 h-10 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-body-heading-300 text-xl font-semibold">
          OTP Code Sent
        </h2>

        {/* Message */}
        <p className="text-body-text-100 text-base">
          An OTP Code has been sent to your email address.
        </p>

        {/* Button */}
        <Button
          onClick={onGoToEmail}
          variant="outline"
          fullWidth
          radius="xl"
          className="h-[52px] min-h-[52px] py-3.5 px-6 bg-white border border-[#CCCACA] text-[#4D4B4B] font-medium text-base leading-6 hover:bg-gray-50"
        >
          Go To Email
        </Button>
      </div>
    </Modal>
  );
}
