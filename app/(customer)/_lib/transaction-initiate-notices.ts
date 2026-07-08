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

export type SellFxFlowType = "resident" | "expatriate" | "touring-nigeria";

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

/** Builds the confirm-modal amount row for Sell FX (send = FX sold, receive = NGN payout). */
export function buildSellTransactionAmountNotice(
  amount?: TransactionAmountNoticeInput | null
): TransactionNoticeItem | null {
  if (!amount) return null;

  const sell = parseAmountValue(amount.sendAmount);
  if (sell <= 0) return null;

  const sellCurrency =
    (amount.sendCurrency ?? "USD").trim().toUpperCase() || "USD";
  const sellFormatted = formatCurrency(sell, sellCurrency).formatted;

  const receive = parseAmountValue(amount.receiveAmount);
  const receiveCurrency =
    (amount.receiveCurrency ?? "NGN").trim().toUpperCase() || "NGN";

  const title = `${sellFormatted} ${sellCurrency}`;

  let description = `You are selling ${sellFormatted} ${sellCurrency} for this transaction.`;
  if (receive > 0) {
    const receiveFormatted = formatCurrency(receive, receiveCurrency).formatted;
    description = `You are selling ${sellFormatted} ${sellCurrency}. You will be sent approximately ${receiveFormatted} ${receiveCurrency}.`;
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
        title: "School fees amount",
        description: "Enter the exact foreign currency amount required for school fees.",
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
          "You will be able to process your professional fees transaction once your documents are verified and approved."
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

function getSellFxStaticLimitNotice(flowType: SellFxFlowType): TransactionNoticeItem {
  switch (flowType) {
    case "touring-nigeria":
      return {
        title: "Maximum of $10,000 per transaction",
        description: "The maximum you can transact is $10,000 per transaction.",
        icon: "currency",
      };
    case "resident":
    case "expatriate":
      return {
        title: "Proof of funds over $10,000",
        description:
          "Transactions over $10,000 USD require proof of funds documentation.",
        icon: "currency",
      };
  }
}

export function getSellFxInitiateNotices(
  flowType: SellFxFlowType,
  options?: { amount?: TransactionAmountNoticeInput | null }
): TransactionNoticeItem[] {
  const verify = (description: string): TransactionNoticeItem => ({
    title: "Verification before approval",
    description,
    icon: "verify",
  });

  const amountNotice =
    buildSellTransactionAmountNotice(options?.amount) ??
    getSellFxStaticLimitNotice(flowType);

  switch (flowType) {
    case "resident":
      return [
        verify(
          "You will be able to process your sell transaction once your documents are verified and approved."
        ),
        amountNotice,
      ];
    case "expatriate":
      return [
        verify(
          "You will be able to process your expatriate sell transaction once your documents are verified and approved."
        ),
        amountNotice,
      ];
    case "touring-nigeria":
      return [
        verify(
          "You will be able to process your tourist sell transaction once your documents are verified and approved."
        ),
        amountNotice,
      ];
  }
}
