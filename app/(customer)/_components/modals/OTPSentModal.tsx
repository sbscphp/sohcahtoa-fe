import { successGif } from "@/app/assets/asset";
import { Modal, Button } from "@mantine/core";
import Image from "next/image";

interface OTPSentModalProps {
  opened: boolean;
  onClose: () => void;
  onGoToEmail: () => void;
  email?: string;
}

export function OTPSentModal({
  opened,
  onClose,
  onGoToEmail
}: OTPSentModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title=""
      centered
      radius="lg"
      withCloseButton={false}
      size="sm"
    >
      <div className="text-center space-y-6">
        {/* Success Icon with animated halo */}
        <div className="flex justify-center">
          <div className="w-30 h-30 rounded-full flex items-center justify-center relative">
            <Image src={successGif} alt="Success" fill />
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
