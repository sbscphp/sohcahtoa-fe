import { formatCurrency } from "@/app/(customer)/_lib/formatCurrency";

export type TransactionNoticeIcon = "verify" | "currency";

export interface TransactionNoticeItem {
  title: string;
  description: string;
  icon?: TransactionNoticeIcon;
}

export type BuyFxFlowType =
  | "pta"
  | "business"
  | "school-fees"
  | "medical"
  | "professional-body"
  | "tourist";

export type TransactionAmountNoticeInput = {
  receiveAmount?: string;
  receiveCurrency?: string;
  sendAmount?: string;
  sendCurrency?: string;
};

function parseAmountValue(raw: string | undefined): number {
  if (!raw?.trim()) return 0;
  const parsed = Number.parseFloat(raw.replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Builds the confirm-modal amount row from the transaction amount step. */
export function buildTransactionAmountNotice(
  amount?: TransactionAmountNoticeInput | null
): TransactionNoticeItem | null {
  if (!amount) return null;

  const receive = parseAmountValue(amount.receiveAmount);
  if (receive <= 0) return null;

  const receiveCurrency =
    (amount.receiveCurrency ?? "USD").trim().toUpperCase() || "USD";
  const receiveFormatted = formatCurrency(receive, receiveCurrency).formatted;

  const send = parseAmountValue(amount.sendAmount);
  const sendCurrency = (amount.sendCurrency ?? "NGN").trim().toUpperCase() || "NGN";

  const title = `${receiveFormatted} ${receiveCurrency}`;

  let description = `You are requesting ${receiveFormatted} ${receiveCurrency} for this transaction.`;
  if (send > 0) {
    const sendFormatted = formatCurrency(send, sendCurrency).formatted;
    description = `You are requesting ${receiveFormatted} ${receiveCurrency}. You will send approximately ${sendFormatted} ${sendCurrency}.`;
  }

  return {
    title,
    description,
    icon: "currency",
  };
}

function getStaticLimitNotice(flowType: BuyFxFlowType): TransactionNoticeItem {
  switch (flowType) {
    case "pta":
      return {
        title: "Maximum of $4,000 per quarter",
        description: "The maximum you can transact is $4,000 per quarter.",
        icon: "currency",
      };
    case "business":
      return {
        title: "Maximum of $5,000",
        description: "The maximum you can transact is $5,000.",
        icon: "currency",
      };
    case "school-fees":
      return {
        title: "Proof of funds over $10,000",
        description:
          "Transactions over $10,000 USD require proof of funds documentation.",
        icon: "currency",
      };
    case "medical":
    case "professional-body":
    case "tourist":
      return {
        title: "Maximum of $10,000",
        description: "The maximum you can transact is $10,000.",
        icon: "currency",
      };
  }
}

export function getBuyFxInitiateNotices(
  flowType: BuyFxFlowType,
  options?: { amount?: TransactionAmountNoticeInput | null }
): TransactionNoticeItem[] {
  const verify = (description: string): TransactionNoticeItem => ({
    title: "Verification before approval",
    description,
    icon: "verify",
  });

  const amountNotice =
    buildTransactionAmountNotice(options?.amount) ?? getStaticLimitNotice(flowType);

  switch (flowType) {
    case "pta":
      return [
        verify(
          "You will be able to process your PTA once your documents are verified and approved."
        ),
        amountNotice,
      ];
    case "business":
      return [
        verify(
          "You will be able to process your BTA once your documents are verified and approved."
        ),
        amountNotice,
      ];
    case "school-fees":
      return [
        verify(
          "You will be able to process your school fees transaction once your documents are verified and approved."
        ),
        amountNotice,
      ];
    case "medical":
      return [
        verify(
          "You will be able to process your medical fee transaction once your documents are verified and approved."
        ),
        amountNotice,
      ];
    case "professional-body":
      return [
        verify(
          "You will be able to process your professional fee transaction once your documents are verified and approved."
        ),
        amountNotice,
      ];
    case "tourist":
      return [
        verify(
          "You will be able to process your tourist transaction once your documents are verified and approved."
        ),
        amountNotice,
      ];
  }
}
