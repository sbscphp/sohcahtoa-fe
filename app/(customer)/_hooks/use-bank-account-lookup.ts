"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { customerApi } from "@/app/(customer)/_services/customer-api";
import { getCustomerApiErrorMessage } from "@/app/(customer)/_utils/customer-api-error-message";

const ACCOUNT_NUMBER_LENGTH = 10;

export function useBankAccountLookup(enabled: boolean) {
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [debouncedAccountNumber] = useDebouncedValue(accountNumber, 400);
  const [debouncedBankName] = useDebouncedValue(bankName, 300);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const lookupSeqRef = useRef(0);

  const resetLookup = useCallback(() => {
    lookupSeqRef.current += 1;
    setAccountNumber("");
    setBankName("");
    setAccountName("");
    setLookupError(null);
    setLookupLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const trimmedBank = debouncedBankName.trim();
    const canLookup =
      trimmedBank.length > 0 && debouncedAccountNumber.length === ACCOUNT_NUMBER_LENGTH;

    if (!canLookup) {
      setAccountName("");
      setLookupError(null);
      setLookupLoading(false);
      return;
    }

    const seq = ++lookupSeqRef.current;
    setLookupLoading(true);
    setLookupError(null);

    void customerApi.bankAccounts
      .lookup({
        bankName: trimmedBank,
        accountNumber: debouncedAccountNumber,
      })
      .then((response) => {
        if (seq !== lookupSeqRef.current) return;
        const name = response.data?.accountName?.trim();
        if (!name) {
          setAccountName("");
          setLookupError("Could not resolve account name.");
          return;
        }
        setAccountName(name);
        setLookupError(null);
      })
      .catch((error) => {
        if (seq !== lookupSeqRef.current) return;
        setAccountName("");
        setLookupError(
          getCustomerApiErrorMessage(error, "Could not resolve account name."),
        );
      })
      .finally(() => {
        if (seq === lookupSeqRef.current) {
          setLookupLoading(false);
        }
      });
  }, [enabled, debouncedBankName, debouncedAccountNumber]);

  const setAccountNumberDigits = useCallback((raw: string) => {
    setAccountNumber(raw.replaceAll(/\D/g, "").slice(0, ACCOUNT_NUMBER_LENGTH));
  }, []);

  const isResolved =
    bankName.trim().length > 0 &&
    accountNumber.length === ACCOUNT_NUMBER_LENGTH &&
    accountName.trim().length > 0 &&
    !lookupLoading &&
    !lookupError;

  return {
    bankName,
    setBankName,
    accountNumber,
    setAccountNumberDigits,
    accountName,
    lookupLoading,
    lookupError,
    isResolved,
    resetLookup,
    accountNumberLength: ACCOUNT_NUMBER_LENGTH,
  };
}
