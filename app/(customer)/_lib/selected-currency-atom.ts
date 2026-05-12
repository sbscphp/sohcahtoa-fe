"use client";

import { atom, useAtomValue, useSetAtom } from "jotai";

export const selectedCurrencyCodeAtom = atom<string>("USD");

/** Read the currently selected currency code. Use in components that format amounts. */
export function useSelectedCurrencyCode(): string {
  return useAtomValue(selectedCurrencyCodeAtom);
}

/** Set the selected currency code. Use in CurrencySelector. */
export function useSetSelectedCurrencyCode(): (code: string) => void {
  return useSetAtom(selectedCurrencyCodeAtom);
}
