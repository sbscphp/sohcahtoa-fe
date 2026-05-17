"use client";

import { atom, useAtom } from "jotai";
import type { FxDashboardTab } from "./fx-dashboard-tabs";

export const fxDashboardTabAtom = atom<FxDashboardTab>("bought");

export function useFxDashboardTab(): [FxDashboardTab, (tab: FxDashboardTab) => void] {
  return useAtom(fxDashboardTabAtom);
}
