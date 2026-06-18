"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { AgentTransactionFlowStep } from "@/app/(customer)/_utils/transaction-flow";

const VALID_STEPS = new Set<AgentTransactionFlowStep>([
  "select-customer",
  "upload-documents",
  "amount",
  "pickup-point",
  "bank-details",
]);

function parseStep(
  raw: string | null,
  fallback: AgentTransactionFlowStep = "select-customer"
): AgentTransactionFlowStep {
  if (raw && VALID_STEPS.has(raw as AgentTransactionFlowStep)) {
    return raw as AgentTransactionFlowStep;
  }
  return fallback;
}

/** Keeps agent transaction step in sync with `?step=` for breadcrumb navigation. */
export function useAgentTransactionStep(basePath: string) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeStep, setActiveStepState] = useState<AgentTransactionFlowStep>(() =>
    parseStep(searchParams.get("step"))
  );

  useEffect(() => {
    setActiveStepState(parseStep(searchParams.get("step")));
  }, [searchParams]);

  const setActiveStep = useCallback(
    (step: AgentTransactionFlowStep) => {
      setActiveStepState(step);
      const query = step === "select-customer" ? "" : `?step=${encodeURIComponent(step)}`;
      router.replace(`${basePath}${query}`, { scroll: false });
    },
    [basePath, router]
  );

  return [activeStep, setActiveStep] as const;
}
