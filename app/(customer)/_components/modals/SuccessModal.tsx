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
    <Modal opened={opened} onClose={onClose} title="" centered withCloseButton={false} radius="lg" size="sm">
      <div className="text-center space-y-5">
        {/* Success Icon */}
        <div className="flex justify-center">
          {icon || (
            <div className="w-30 h-30 rounded-full flex items-center justify-center relative">
              <Image src={successGif} alt="Success" fill />
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
          fullWidth
          radius="xl"
          className={
            buttonVariant === 'filled'
              ? 'h-[52px] min-h-[52px] py-3.5 px-6 bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] font-medium text-base leading-6'
              : 'h-[52px] min-h-[52px] py-3.5 px-6 bg-white border border-[#CCCACA] text-[#4D4B4B] font-medium text-base leading-6 hover:bg-gray-50'
          }
          rightSection={buttonVariant === 'filled' ? <ArrowUpRight size={18} /> : undefined}
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
}
