"use client";

import { Button, Menu } from "@mantine/core";

export type TakeActionType = "link" | "unlink" | "flag" | "refund" | "disburse";

interface TakeActionMenuProps {
  onAction: (action: TakeActionType) => void;
  isMatched?: boolean;
  canUnlink?: boolean;
  canDisburse?: boolean;
  canRefund?: boolean;
}

export default function TakeActionMenu({
  onAction,
  isMatched = false,
  canUnlink = false,
  canDisburse = false,
  canRefund = false,
}: TakeActionMenuProps) {
  const showLink = !isMatched;
  const showUnlink = isMatched && canUnlink;
  const showLinkSection = showLink || showUnlink;

  return (
    <Menu position="bottom-end" shadow="md" width={200}>
      <Menu.Target>
        <Button radius="xl" size="md" color="#DD4F05">
          Take Action
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {showLinkSection ? (
          <>
            {showLink ? (
              <Menu.Item onClick={() => onAction("link")}>
                Link transaction
              </Menu.Item>
            ) : null}
            {showUnlink ? (
              <Menu.Item onClick={() => onAction("unlink")}>
                Unlink transaction
              </Menu.Item>
            ) : null}
            <Menu.Divider />
          </>
        ) : null}
        <Menu.Item onClick={() => onAction("flag")}>
          Mark as flagged
        </Menu.Item>
        {canRefund && (
          <Menu.Item onClick={() => onAction("refund")}>
            Initiate refund
          </Menu.Item>
        )}
        {canDisburse && (
          <Menu.Item onClick={() => onAction("disburse")}>
            Confirm disbursement
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
