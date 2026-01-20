import { Modal, Button, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { OTPDeliveryModal } from './OTPDeliveryModal';
import { VerifyBVNModal } from './VerifyBVNModal';

interface BVNModalProps {
  opened: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export function BVNModal({ opened, onClose, onVerified }: BVNModalProps) {
  const [bvn, setBvn] = useState('');
  const [otpDeliveryOpened, { open: openOTPDelivery, close: closeOTPDelivery }] = useDisclosure(false);
  const [verifyBVNOpened, { open: openVerifyBVN, close: closeVerifyBVN }] = useDisclosure(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'phone' | 'email' | null>(null);

  const handleVerify = () => {
    if (bvn.length === 11) {
      sessionStorage.setItem('bvn', bvn);
      openOTPDelivery();
    }
  };

  const handleOTPDeliveryContinue = (method: 'phone' | 'email') => {
    setDeliveryMethod(method);
    sessionStorage.setItem('otpDeliveryMethod', method);
    closeOTPDelivery();
    openVerifyBVN();
  };

  const handleBVNVerified = (otp: string) => {
    // Mock verification
    closeVerifyBVN();
    onVerified();
  };

  return (
    <>
      <Modal opened={opened && !otpDeliveryOpened && !verifyBVNOpened} onClose={onClose} title="" centered>
        <div className="space-y-6">
          <div>
            <h2 className="text-heading-300 text-2xl font-bold mb-2">
              Let's Get you Started.
            </h2>
            <p className="text-text-300 text-base">
              Please enter your BVN. This is required for identity verification and security. Your details are safe and will not be shared.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-heading-200 text-sm font-medium">
              BVN
            </label>
            <TextInput
              value={bvn}
              onChange={(e) => setBvn(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="Enter your BVN"
              size="lg"
              maxLength={11}
            />
            <p className="text-text-300 text-sm">
              If you can't remember, please dial <span className="font-semibold">*565*0#</span> with your registered SIM to get started.
            </p>
          </div>

          <Button
            onClick={handleVerify}
            disabled={bvn.length !== 11}
            color="orange"
            size="lg"
            fullWidth
            rightSection={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            }
          >
            Verify BVN
          </Button>
        </div>
      </Modal>

      <OTPDeliveryModal
        opened={otpDeliveryOpened}
        onClose={closeOTPDelivery}
        onContinue={handleOTPDeliveryContinue}
      />

      {deliveryMethod && (
        <VerifyBVNModal
          opened={verifyBVNOpened}
          onClose={closeVerifyBVN}
          onVerify={handleBVNVerified}
          bvn={bvn}
          deliveryMethod={deliveryMethod}
        />
      )}
    </>
  );
}
