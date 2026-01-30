import { Modal, Button } from "@mantine/core";
import { successGif } from "@/app/assets/asset";
import Image from "next/image";

interface SuccessModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** Primary (usually orange) action button label. Omit to hide. */
  primaryButtonText?: string;
  /** Callback when primary button is clicked. Defaults to `onClose` if not provided. */
  onPrimaryClick?: () => void;
  /** Visual style for the primary button. Defaults to `"filled"`. */
  primaryButtonVariant?: "filled" | "outline";
  /** Secondary (subtle) action button label. Omit to hide. */
  secondaryButtonText?: string;
  /** Callback when secondary button is clicked. Defaults to `onClose` if not provided. */
  onSecondaryClick?: () => void;
  /** Visual style for the secondary button. Defaults to `"outline"`. */
  secondaryButtonVariant?: "filled" | "outline";
  icon?: React.ReactNode;
}

export function SuccessModal({
  opened,
  onClose,
  title,
  message,
  primaryButtonText,
  onPrimaryClick,
  primaryButtonVariant = "filled",
  secondaryButtonText,
  onSecondaryClick,
  secondaryButtonVariant = "outline",
  icon,
}: SuccessModalProps) {
  const handlePrimaryClick = () => {
    if (onPrimaryClick) {
      onPrimaryClick();
    } else {
      onClose();
    }
  };

  const handleSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title=""
      centered
      withCloseButton={false}
      radius="lg"
    >
      <div className="space-y-4 pb-5 text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          {icon || (
            <div className="relative flex items-center justify-center">
              <Image
                src={successGif}
                alt="Success"
                width={100}
                height={100}
              />
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-body-heading-300! text-xl! font-bold!">
          {title}
        </h2>

        {/* Message */}
        <p className="text-body-text-100! mb-6!">
          {message}
        </p>

        {/* Actions (optional) */}
        {(primaryButtonText || secondaryButtonText) && (
          <div className="space-y-4">
            {primaryButtonText && (
              <Button
                onClick={handlePrimaryClick}
                variant={primaryButtonVariant}
                color={primaryButtonVariant === "filled" ? "orange" : "gray"}
                radius="xl"
                size="md"
                fullWidth
                className="font-medium! text-sm!"
              >
                {primaryButtonText}
              </Button>
            )}

            {secondaryButtonText && (
              <Button
                onClick={handleSecondaryClick}
                variant={secondaryButtonVariant}
                color={secondaryButtonVariant === "filled" ? "orange" : "gray"}
                radius="xl"
                size="md"
                className="border-text-50! border! font-semibold!"
                fullWidth
              >
                {secondaryButtonText}
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
