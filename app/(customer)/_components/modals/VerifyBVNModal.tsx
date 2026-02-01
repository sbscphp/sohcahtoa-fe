import { Modal, Button } from '@mantine/core';
import { OTPInput } from '../auth/OTPInput';
import { SuccessModal } from './SuccessModal';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface VerifyBVNModalProps {
  opened: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  bvn: string;
  deliveryMethod: 'phone' | 'email';
}

export function VerifyBVNModal({ opened, onClose, onVerify, bvn, deliveryMethod }: VerifyBVNModalProps) {
  const [otp, setOtp] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [successOpened, setSuccessOpened] = useState(false);

  const handleOTPComplete = (completedOtp: string) => {
    setOtp(completedOtp);
    setIsComplete(true);
  };

  const handleContinue = () => {
    if (isComplete) {
      // Close the verify modal
      onClose();
      // Show success modal
      setSuccessOpened(true);
    }
  };

  const handleSuccessContinue = () => {
    setSuccessOpened(false);
    // Call onVerify to proceed to next step
    onVerify(otp);
  };

  const handleResend = () => {
    setOtp('');
    setIsComplete(false);
  };

  const maskedBvn = `${bvn.slice(0, 3)}*****${bvn.slice(-3)}`;
  const maskedInfo = `A six (6) digit OTP has been sent to your ${deliveryMethod === 'phone' ? 'phone number' : 'email'} linked to BVN ${maskedBvn}. Enter to verify`;

  return (
    <>
      <Modal opened={opened} onClose={onClose} title="" centered radius="xl" size="500px" withCloseButton={false}>
        <div className="space-y-6 p-3">
          <div>
            <h2 className="text-body-heading-200 text-2xl font-semibold">
              Verify BVN
            </h2>
            <OTPInput
              onComplete={handleOTPComplete}
              onResend={handleResend}
              maskedInfo={maskedInfo}
            />
          </div>

          <Button
            onClick={handleContinue}
            disabled={!isComplete}
            variant="filled"
            fullWidth
            radius="xl"
            rightSection={<ArrowUpRight size={18} />}
            className="h-[52px] min-h-[52px] py-3.5 px-6 bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] font-medium text-base leading-6 disabled:bg-primary-100 disabled:text-white disabled:cursor-not-allowed"
          >
            Continue
          </Button>
        </div>
      </Modal>

      <SuccessModal
        opened={successOpened}
        onClose={() => setSuccessOpened(false)}
        title="BVN Verified Successfully"
        message="Your BVN has been successfully verified. Continue below to complete account creation. "
        buttonText="Continue"
        onButtonClick={handleSuccessContinue}
      />
    </>
  );
}
