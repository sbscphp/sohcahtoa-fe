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

export function getBuyFxInitiateNotices(flowType: BuyFxFlowType): TransactionNoticeItem[] {
  const verify = (description: string): TransactionNoticeItem => ({
    title: "Verification before approval",
    description,
    icon: "verify",
  });

  const limit4k: TransactionNoticeItem = {
    title: "Maximum of $4,000 per quarter",
    description: "The maximum you can transact is $4,000 per quarter.",
    icon: "currency",
  };

  const limit10k: TransactionNoticeItem = {
    title: "Maximum of $10,000",
    description: "The maximum you can transact is $10,000.",
    icon: "currency",
  };

  switch (flowType) {
    case "pta":
      return [
        verify(
          "You will be able to process your PTA once your documents are verified and approved."
        ),
        limit4k,
      ];
    case "business":
      return [
        verify(
          "You will be able to process your BTA once your documents are verified and approved."
        ),
        limit4k,
      ];
    case "school-fees":
      return [
        verify(
          "You will be able to process your school fees transaction once your documents are verified and approved."
        ),
        limit10k,
      ];
    case "medical":
      return [
        verify(
          "You will be able to process your medical fee transaction once your documents are verified and approved."
        ),
        limit10k,
      ];
    case "professional-body":
      return [
        verify(
          "You will be able to process your professional fee transaction once your documents are verified and approved."
        ),
        limit10k,
      ];
    case "tourist":
      return [
        verify(
          "You will be able to process your tourist transaction once your documents are verified and approved."
        ),
        limit10k,
      ];
  }
}
