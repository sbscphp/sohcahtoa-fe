"use client";

import { Button, Menu } from "@mantine/core";
import { useAtomValue } from "jotai";
import { adminUserAtom } from "@/app/admin/_lib/atoms/admin-auth-atom";
import { hasModuleAccess } from "@/app/admin/_lib/permissions";

export type TakeActionType = "link" | "unlink" | "flag" | "refund" | "disburse";

interface TakeActionMenuProps {
  onAction: (action: TakeActionType) => void;
  canLink?: boolean;
  canUnlink?: boolean;
  canDisburse?: boolean;
  canRefund?: boolean;
  canFlag?: boolean;
  canInitiateDisbursement?: boolean;
}

export default function TakeActionMenu({
  onAction,
  // canLink = false,
  // canUnlink = false,
  // canDisburse = false,
  canRefund = false,
  canInitiateDisbursement = false,
  canFlag = true,
}: Readonly<TakeActionMenuProps>) {
  // const showLink = canLink;
  // const showUnlink = canUnlink;
  // const showLinkSection = showLink || showUnlink;

  const adminUser = useAtomValue(adminUserAtom);
  const userPermissions = adminUser?.userPermissions ?? [];
  const canCreateTransientWallet = hasModuleAccess(
    userPermissions,
    "TRANSIENT_WALLET",
    "create"
  );
  const canEditTransientWallet = hasModuleAccess(
    userPermissions,
    "TRANSIENT_WALLET",
    "edit"
  );

  return (
    <Menu position="bottom-end" shadow="md" width={200}>
      <Menu.Target>
        <Button radius="xl" size="md" color="#DD4F05">
          Take Action
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        {/* {showLinkSection ? (
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
        ) : null} */}
        {canFlag ? (
          <Menu.Item onClick={() => onAction("flag")}>
            Mark as flagged
          </Menu.Item>
        ) : null}
        {canRefund && canCreateTransientWallet && (
          <Menu.Item onClick={() => onAction("refund")}>
            Initiate refund
          </Menu.Item>
        )}
        {canInitiateDisbursement && canEditTransientWallet && (
          <Menu.Item onClick={() => onAction("disburse")}>
            Initiate disbursement
          </Menu.Item>
        )}
        {/* {canDisburse && (
          <Menu.Item onClick={() => onAction("disburse")}>
            Confirm disbursement
          </Menu.Item>
        )} */}
      </Menu.Dropdown>
    </Menu>
  );
}
