import { Modal, Button } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { UserTypeCard } from "../auth/UserTypeCard";
import { emailIcon, expatriateIcon, phoneIcon } from "@/app/assets/asset";

interface OTPDeliveryModalProps {
  opened: boolean;
  onClose: () => void;
  onContinue: (method: "phone" | "email") => void;
}

export function OTPDeliveryModal({
  opened,
  onClose,
  onContinue
}: OTPDeliveryModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<
    "phone" | "email" | null
  >(null);

  const handleContinue = () => {
    if (selectedMethod) {
      onContinue(selectedMethod);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title=""
      centered
      radius="xl"
      size="500px"
      withCloseButton={false}
    >
      <div className="space-y-6 p-3">
        <div>
          <h2 className="text-body-heading-200 text-2xl font-semibold">
            Send Otp
          </h2>
          <p className="text-body-text-100 text-base">
            We need you to verify your bvn. Kindly select where you want your
            Otp sent
          </p>
        </div>

        <div className="space-y-4 border border-[#F2F4F7] rounded-xl p-4">
          <UserTypeCard
            icon={phoneIcon}
            title="Send to my Phone Number"
            isSelected={selectedMethod === "phone"}
            onClick={() => setSelectedMethod("phone")}
          />

          <UserTypeCard
            icon={emailIcon}
            title="Send to my Mail"
            isSelected={selectedMethod === "email"}
            onClick={() => setSelectedMethod("email")}
          />
        </div>

        <Button
          onClick={handleContinue}
          disabled={!selectedMethod}
          variant="filled"
          size="lg"
          className="disabled:bg-primary-100! disabled:text-white! disabled:cursor-not-allowed"
          fullWidth
          radius="xl"
          rightSection={<ArrowUpRight size={18} />}
        >
          Continue
        </Button>
      </div>
    </Modal>
  );
}
