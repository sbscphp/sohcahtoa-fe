import { Modal, Button } from "@mantine/core";

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
  buttonText = "Close",
  onButtonClick,
}: ErrorModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title=""
      centered
      withCloseButton={false}
      radius="lg"
      size="sm"
    >
      <div className="text-center space-y-6 pb-5">
        {/* Warning Icon */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Outer circle with pulse effect */}
            <div className="absolute inset-0 rounded-full bg-warning-100 opacity-30 animate-pulse" />
            {/* Main circle */}
            <div className="relative w-20 h-20 rounded-full bg-warning-100 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-warning-500 flex items-center justify-center">
                <span className="text-white text-3xl font-bold">!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-body-heading-300! text-xl! font-bold!">
          {title}
        </h2>

        {/* Message */}
        <p className="text-body-text-100! text-sm!">
          {message}
        </p>

        {/* Button */}
        <Button
          onClick={onButtonClick || onClose}
          fullWidth
          variant="outline"
          radius="xl"
          size="md"
          className="border-text-50! border! font-semibold!"
        >
          {buttonText}
        </Button>
      </div>
    </Modal>
  );
}
