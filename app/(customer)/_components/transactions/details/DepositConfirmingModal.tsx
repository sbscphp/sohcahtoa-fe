"use client";

import Image from "next/image";
import { Button, Loader, Modal } from "@mantine/core";
import { successGif } from "@/app/assets/asset";

/** Customer: overlay while bank payment is being confirmed. */
type DepositConfirmingModalProps = {
  opened: boolean;
  confirmTimedOut: boolean;
  onClose: () => void;
};

export function DepositConfirmingModal({
  opened,
  confirmTimedOut,
  onClose,
}: Readonly<DepositConfirmingModalProps>) {
  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      title=""
      centered
      withCloseButton={false}
      radius="lg"
      size="sm"
      zIndex={400}
      closeOnClickOutside={false}
      closeOnEscape={false}
      classNames={{ body: "min-w-0 max-w-full overflow-x-hidden px-4 pt-2 pb-4" }}
      styles={{
        content: {
          width: "min(420px, calc(100vw - 16px))",
          maxWidth: "100%",
          boxSizing: "border-box",
        },
      }}
    >
      <div className="space-y-5 text-center">
        <div className="flex justify-center">
          <div className="relative flex h-30 w-30 items-center justify-center rounded-full">
            <Image src={successGif} alt="" fill unoptimized />
          </div>
        </div>
        <h2 className="text-body-heading-300 text-xl font-semibold">
          {confirmTimedOut ? "Still confirming" : "Confirming payment"}
        </h2>
        {confirmTimedOut ? (
          <p className="text-body-text-100 text-base">
            We have not detected your payment yet. You can leave this open a bit longer, refresh this page later, or
            contact support if the debit already left your account.
          </p>
        ) : (
          <p className="text-body-text-100 text-base">
            Please wait while we confirm your transaction. This should take between 3-5 minutes.
          </p>
        )}
        {confirmTimedOut ? (
          <Button
            type="button"
            variant="filled"
            radius="xl"
            fullWidth
            className="h-12! bg-[#DD4F05] font-medium text-white hover:bg-[#B84204]!"
            onClick={onClose}
          >
            Close
          </Button>
        ) : (
          <>
            <div className="flex justify-center py-1">
              <Loader color="#DD4F05" type="dots" />
            </div>
            <p className="text-body-text-100 py-1 text-sm">
              Please keep this window open while we continue checking your transfer.
            </p>
          </>
        )}
      </div>
    </Modal>
  );
}
