import { Modal, Button } from '@mantine/core';

interface ErrorModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function ErrorModal({
  opened,
  onClose,
  title,
  message,
  buttonText = 'Close',
  onButtonClick
}: ErrorModalProps) {
  return (
    <Modal opened={opened} onClose={onClose} title="" centered radius="lg" size="sm" withCloseButton={false}>
      <div className="text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-error-100 border-4 border-error-500 flex items-center justify-center">
            <svg className="w-10 h-10 text-error-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-heading-300 text-2xl font-bold">
          {title}
        </h2>

        {/* Message */}
        <p className="text-text-300 text-base">
          {message}
        </p>

        {/* Button */}
        <Button
          onClick={onButtonClick || onClose}
          fullWidth
          radius="xl"
          className="h-[52px] min-h-[52px] py-3.5 px-6 bg-primary-400 hover:bg-primary-500 text-[#FFF6F1] font-medium text-base leading-6"
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
}
