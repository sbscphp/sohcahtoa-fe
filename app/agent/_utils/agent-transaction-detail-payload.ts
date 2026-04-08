import type { TransactionDetailData } from "@/app/_lib/api/types";
import { buildDetailPayloadFromApi } from "@/app/(customer)/_utils/transaction-detail-payload";

type CustomerDetailPayload = ReturnType<typeof buildDetailPayloadFromApi>;

export interface AgentTransactionDetailPayload extends CustomerDetailPayload {
  identification: {
    bvn: string;
    nin: string;
    admissionType: string;
  };
}

export function buildAgentDetailPayloadFromApi(api: TransactionDetailData): AgentTransactionDetailPayload {
  const basePayload = buildDetailPayloadFromApi(api);
  const personalInfo = api.personalInfo;

  return {
    ...basePayload,
    identification: {
      bvn: personalInfo?.bvn ?? "—",
      nin: personalInfo?.nin ?? "—",
      admissionType: personalInfo?.admissionType ?? "—",
    },
  };
}

