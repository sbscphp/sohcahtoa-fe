"use client";

import LabelText from "./LabelText";
import SectionBlock from "./SectionBlock";
import type { TransactionDetailBankAccount } from "@/app/_lib/api/types";

interface TransactionBankAccountsSectionProps {
  accounts: TransactionDetailBankAccount[];
}

function accountLabel(base: string, index: number, total: number): string {
  return total > 1 ? `${base} (${index + 1})` : base;
}

export default function TransactionBankAccountsSection({
  accounts,
}: Readonly<TransactionBankAccountsSectionProps>) {
  if (accounts.length === 0) return null;

  const title = accounts.length === 1 ? "Bank Account" : "Bank Accounts";

  return (
    <SectionBlock title={title}>
      {accounts.flatMap((account, index) => {
        const fields = [
          <LabelText
            key={`${account.id}-bank`}
            label={accountLabel("Bank name", index, accounts.length)}
            text={account.bankName}
          />,
          <LabelText
            key={`${account.id}-number`}
            label={accountLabel("Account number", index, accounts.length)}
            text={account.accountNumber}
          />,
          <LabelText
            key={`${account.id}-name`}
            label={accountLabel("Account name", index, accounts.length)}
            text={account.accountName}
          />,
          <LabelText
            key={`${account.id}-verified`}
            label={accountLabel("Verification", index, accounts.length)}
            statusBadge={account.isVerified ? "Verified" : "Pending verification"}
          />,
        ];

        if (account.isDefault) {
          fields.push(
            <LabelText
              key={`${account.id}-default`}
              label={accountLabel("Default account", index, accounts.length)}
              statusBadge="Default"
            />,
          );
        }

        return fields;
      })}
    </SectionBlock>
  );
}
