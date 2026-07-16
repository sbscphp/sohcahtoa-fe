"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { DatePicker } from "@mantine/dates";

export type DateFilterValue = {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  range: string;     // preset key (e.g. "last_7_days") or "custom"
};

type DateFilterProps = {
  onChange?: (filter: DateFilterValue) => void;
};

const RANGE_OPTIONS = [
  { value: "last_7_days",    label: "Last 7 days" },
  { value: "last_30_days",   label: "Last 30 days" },
  { value: "last_90_days",   label: "Last 90 days" },
  { value: "last_6_months",  label: "Last 6 months" },
  { value: "last_12_months", label: "Last 12 months" },
];

const DAYS_BACK: Record<string, number> = {
  last_7_days:  6,
  last_30_days: 29,
  last_90_days: 89,
};

const MONTHS_BACK: Record<string, number> = {
  last_6_months:  6,
  last_12_months: 12,
};

const EMPTY_FILTER: DateFilterValue = { startDate: "", endDate: "", range: "" };

const TABS = [
  { id: "range",  label: "Quick range" },
  { id: "custom", label: "Custom range" },
];

// Resolves a quick-range preset key into concrete YYYY-MM-DD boundaries,
// anchored on "today".
function resolvePreset(key: string): { startDate: string; endDate: string } {
  const end = dayjs();
  const start =
    key in DAYS_BACK
      ? end.subtract(DAYS_BACK[key], "day")
      : end.subtract(MONTHS_BACK[key] ?? 0, "month");

  return {
    startDate: start.format("YYYY-MM-DD"),
    endDate: end.format("YYYY-MM-DD"),
  };
}

function buildSummary(filter: DateFilterValue): string | null {
  if (!filter.range) return null;

  if (filter.range === "custom") {
    if (!filter.startDate || !filter.endDate) return null;
    const start = dayjs(filter.startDate).format("MMM D");
    const end   = dayjs(filter.endDate).format("MMM D, YYYY");
    return `${start} – ${end}`;
  }

  const opt = RANGE_OPTIONS.find((r) => r.value === filter.range);
  return opt ? opt.label : filter.range;
}

function isActive(filter: DateFilterValue) {
  return !!filter.range;
}

export default function DateFilter({ onChange }: DateFilterProps) {
  const [open, setOpen]           = useState(false);
  const [tab, setTab]             = useState("range");
  const [committed, setCommitted] = useState<DateFilterValue>(EMPTY_FILTER);

  // Bound directly to Mantine's <DatePicker type="range" /> value shape.
  const [customDraft, setCustomDraft] = useState<[string | null, string | null]>([null, null]);

  const panelRef   = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // ── Commit helpers ────────────────────────────────────────────────────────

  const commitAndNotify = useCallback(
    (value: DateFilterValue) => {
      setCommitted(value);
      const filter = {
        startDate: value.startDate,
        endDate: value.endDate,
        range: value.startDate && value.endDate ? "" : value.range,
      };
      setTimeout(() => onChange?.(filter), 0);
    },
    [onChange]
  );

  function selectRange(value: string) {
    const { startDate, endDate } = resolvePreset(value);
    commitAndNotify({ startDate, endDate, range: value });
    setOpen(false);
  }

  function applyCustomRange() {
    const [start, end] = customDraft;
    if (!start || !end) return;
    commitAndNotify({ startDate: start, endDate: end, range: "custom" });
    setOpen(false);
  }

  function clearAll() {
    commitAndNotify(EMPTY_FILTER);
    setCustomDraft([null, null]);
    setOpen(false);
  }

  const dismissPanel = useCallback(() => {
    setCustomDraft(
      committed.range === "custom" ? [committed.startDate, committed.endDate] : [null, null]
    );
    setOpen(false);
  }, [committed]);

  // ── Outside-click handler ─────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        panelRef.current   && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) dismissPanel();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, dismissPanel]);

  // ── Derived values ────────────────────────────────────────────────────────

  const active   = isActive(committed);
  const summary  = buildSummary(committed);
  const canApply = !!(customDraft[0] && customDraft[1]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative inline-block">

      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={() => {
          setOpen((v) => {
            if (!v) {
              if (committed.range === "custom") {
                setCustomDraft([committed.startDate, committed.endDate]);
                setTab("custom");
              } else {
                setCustomDraft([null, null]);
                setTab("range");
              }
            }
            return !v;
          });
        }}
        className={[
          "inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-[15px] font-medium cursor-pointer transition-all whitespace-nowrap",
          active
            ? "border-gray-200 bg-white text-gray-900"
            : "border-gray-200 bg-white text-gray-700",
          open ? "shadow-[0_0_0_3px_rgba(0,0,0,0.10)]" : "",
        ].join(" ")}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
          <path d="M1 1h16M4 7h10M7 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>

        <span>Filter By</span>

        {summary && (
          <>
            <span className={`w-px h-3.5 mx-0.5 ${active ? "bg-white/30" : "bg-gray-200"}`} />
            <span className="font-normal text-[13px] opacity-90">{summary}</span>
          </>
        )}

        {active && (
          <span
            role="button"
            tabIndex={0}
            aria-label="Clear filter"
            onClick={(e) => { e.stopPropagation(); clearAll(); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); clearAll(); } }}
            className="ml-0.5 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-white/20 cursor-pointer text-xs leading-none"
          >
            ×
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Date filter options"
          className="absolute top-[calc(100%+8px)] right-0 z-9999 w-[300px] bg-white border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] overflow-hidden"
        >
          {/* Tab bar */}
          <div className="flex border-b border-gray-100 px-1 pt-1 gap-0.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  "flex-1 px-3 py-2 text-[13px] cursor-pointer transition-all rounded-t-[10px] border-b-2",
                  tab === t.id
                    ? "bg-primary-00 text-gray-900 font-medium border-primary-400"
                    : "bg-transparent text-gray-500 font-normal border-transparent hover:text-gray-700",
                ].join(" ")}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Panel body */}
          <div className="p-3">

            {/* Quick range tab */}
            {tab === "range" && (
              <div className="flex flex-col gap-1">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => selectRange(opt.value)}
                    className={[
                      "flex items-center justify-between w-full px-3 py-2.5 rounded-[10px] text-[14px] text-gray-700 cursor-pointer text-left transition-colors",
                      committed.range === opt.value
                        ? "border border-primary-200 bg-primary-00 font-medium"
                        : "border border-transparent hover:bg-primary-00",
                    ].join(" ")}
                  >
                    {opt.label}
                    {committed.range === opt.value && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path
                          d="M2 7l3.5 3.5L12 3.5"
                          stroke="var(--color-primary-400)"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Custom range tab */}
            {tab === "custom" && (
              <div className="flex flex-col gap-3">

                <p className="m-0 text-[12px] text-gray-400 leading-snug">
                  Pick a start and end date. Changes apply only when you press Apply.
                </p>

                <div className="flex justify-center">
                  <DatePicker
                    type="range"
                    value={customDraft}
                    onChange={setCustomDraft}
                    allowSingleDateInRange
                    maxDate={dayjs().format("YYYY-MM-DD")}
                    numberOfColumns={1}
                    size="sm"
                  />
                </div>

                {/* Validation hint */}
                {(customDraft[0] || customDraft[1]) && !canApply && (
                  <p className="m-0 text-[12px] text-warning-400 leading-snug">
                    Please select both a start and an end date.
                  </p>
                )}

                {/* Apply / Clear row */}
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={clearAll}
                    className="flex-1 py-2.5 rounded-[10px] border border-gray-200 bg-white text-gray-500 text-[13px] font-medium cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={applyCustomRange}
                    disabled={!canApply}
                    className={[
                      "py-2.5 rounded-[10px] border-none text-[13px] font-medium transition-all",
                      canApply
                        ? "flex-2 bg-primary-400 text-white cursor-pointer hover:bg-primary-500"
                        : "flex-2 bg-gray-100 text-gray-300 cursor-not-allowed",
                    ].join(" ")}
                  >
                    Apply
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}