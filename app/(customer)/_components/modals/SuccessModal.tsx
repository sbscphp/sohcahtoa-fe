import { Modal, Button } from '@mantine/core';
import { ArrowUpRight } from 'lucide-react';
import { successGif } from '@/app/assets/asset';
import Image from 'next/image';
interface SuccessModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  icon?: React.ReactNode;
  buttonVariant?: 'filled' | 'outline';
}

export function SuccessModal({
  opened,
  onClose,
  title,
  message,
  buttonText,
  onButtonClick,
  icon,
  buttonVariant = 'filled'
}: SuccessModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="" centered withCloseButton={false} radius="lg">
      <div className="text-center space-y-5">
        {/* Success Icon */}
        <div className="flex justify-center">
          {icon || (
            <div className="w-20 h-20 rounded-full bg-success-100 border-4 border-success-500 flex items-center justify-center relative">
              <Image src={successGif} alt="Success" width={100} height={100} />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-body-heading-300 text-xl font-semibold">
          {title}
        </h2>

        {/* Message */}
        <p className="text-body-text-100 text-base">
          {message}
        </p>

        {/* Button */}
        <Button
          onClick={onButtonClick}
          variant={buttonVariant}
          color={buttonVariant === 'filled' ? 'orange' : undefined}
          size="lg"
          radius="xl"
          fullWidth
          rightSection={buttonVariant === 'filled' ? <ArrowUpRight size={18} /> : undefined}
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
}
