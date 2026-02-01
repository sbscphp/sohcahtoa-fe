import { Modal, Button } from '@mantine/core';
import { OTPInput } from '../auth/OTPInput';
import { useState } from 'react';

interface VerifyEmailModalProps {
  opened: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  email: string;
}

export function VerifyEmailModal({ opened, onClose, onVerify, email }: VerifyEmailModalProps) {
  const [otp, setOtp] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  const handleOTPComplete = (completedOtp: string) => {
    setOtp(completedOtp);
    setIsComplete(true);
  };

  const handleVerify = () => {
    if (isComplete) {
      onVerify(otp);
    }
  };

  const handleResend = () => {
    setOtp('');
    setIsComplete(false);
  };

  const maskedInfo = `Enter the 6-digit OTP sent to your email address associated with this account ${email}`;

  return (
    <Modal opened={opened} onClose={onClose} title="" centered>
      <div className="space-y-6">
        <div>
          <h2 className="text-heading-300 text-2xl font-bold mb-2">
            Validate Your Email Address
          </h2>
          <p className="text-text-300 text-base mb-6">
            {maskedInfo}
          </p>
          <OTPInput
            onComplete={handleOTPComplete}
            onResend={handleResend}
          />
        </div>

        <Button
          onClick={handleVerify}
          disabled={!isComplete}
          fullWidth
          radius="xl"
          className="h-[52px] min-h-[52px] py-3.5 px-6 bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] font-medium text-base leading-6"
          rightSection={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          }
        >
          Verify
        </Button>
      </div>
    </Modal>
  );
}
