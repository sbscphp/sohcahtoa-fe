"use client";

import { Modal } from "@mantine/core";
import { SuccessModal } from "@/app/(customer)/_components/modals/SuccessModal";
import {
  CustomerTypeStep,
  OtpDeliveryStep,
  PassportDetailsStep,
  ResidentBvnStep,
  VerifyOtpStep,
} from "@/app/agent/(AgentLayout)/transactions/_components/AgentAddCustomerSteps";
import { useAgentAddCustomerFlow } from "@/app/agent/(AgentLayout)/transactions/_components/useAgentAddCustomerFlow";

interface AgentAddCustomerModalProps {
  opened: boolean;
  onClose: () => void;
}

export function AgentAddCustomerModal({
  opened,
  onClose,
}: Readonly<AgentAddCustomerModalProps>) {
  const flow = useAgentAddCustomerFlow();

  const handleClose = () => {
    flow.resetState();
    onClose();
  };

  const renderBody = () => {
    switch (flow.step) {
      case "type-select":
        return (
          <CustomerTypeStep
            selectedType={flow.selectedType}
            onSelectType={flow.setSelectedType}
            onContinue={flow.handleTypeContinue}
          />
        );
      case "resident-bvn":
        return (
          <ResidentBvnStep
            bvn={flow.bvn}
            isSubmitting={flow.isSubmitting}
            onBvnChange={flow.setBvn}
            onContinue={flow.handleResidentBvnContinue}
            onBack={flow.handleBack}
          />
        );
      case "otp-delivery":
        return (
          <OtpDeliveryStep
            selectedOtpMethod={flow.selectedOtpMethod}
            isSendingOtp={flow.isSendingOtp}
            onSelectOtpMethod={flow.setSelectedOtpMethod}
            onContinue={flow.handleOtpDeliveryContinue}
            onBack={flow.handleBack}
          />
        );
      case "passport-details":
        return (
          <PassportDetailsStep
            passportNumber={flow.passportNumber}
            passportFile={flow.passportFile}
            isSubmitting={flow.isSubmitting}
            onPassportNumberChange={flow.setPassportNumber}
            onPassportFileChange={flow.setPassportFile}
            onContinue={flow.handlePassportContinue}
            onBack={flow.handleBack}
          />
        );
      case "verify-otp":
        return (
          <VerifyOtpStep
            selectedType={flow.selectedType}
            otpDeliveryMethod={flow.otpDeliveryMethod}
            isOtpComplete={flow.isOtpComplete}
            isSubmitting={flow.isSubmitting}
            isResendingOtp={flow.isResendingOtp}
            onOtpComplete={flow.handleOtpComplete}
            onResendOtp={flow.handleResendOtp}
            onContinue={flow.handleVerifyContinue}
            onBack={flow.handleBack}
          />
        );
      case "success":
        return null;
      default:
        return null;
    }
  };

  return (
    <>
      <Modal
        opened={opened && flow.step !== "success"}
        onClose={handleClose}
        centered
        radius="xl"
        size="577px"
        closeOnClickOutside={false}
      >
        <div className="p-4 md:p-6">{renderBody()}</div>
      </Modal>

      <SuccessModal
        opened={opened && flow.step === "success"}
        onClose={handleClose}
        title="Customer Added Successfully"
        message="The customer has been verified and added successfully. Continue below to begin the transaction."
        buttonText="Continue"
        onButtonClick={handleClose}
      />
    </>
  );
}

