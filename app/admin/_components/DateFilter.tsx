"use client";
import { useState, useRef, useEffect, useCallback } from "react";

export type DateFilterValue = { year: string; month: string; range: string };

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

const MONTHS = [
  { value: "1",  label: "January" },
  { value: "2",  label: "February" },
  { value: "3",  label: "March" },
  { value: "4",  label: "April" },
  { value: "5",  label: "May" },
  { value: "6",  label: "June" },
  { value: "7",  label: "July" },
  { value: "8",  label: "August" },
  { value: "9",  label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => String(CURRENT_YEAR - i));
const EMPTY_FILTER: DateFilterValue = { year: "", month: "", range: "" };

const TABS = [
  { id: "range",      label: "Quick range" },
  { id: "month_year", label: "Month / Year" },
];

function buildSummary(filter: DateFilterValue): string | null {
  const { year, month, range } = filter;
  if (range) {
    const opt = RANGE_OPTIONS.find((r) => r.value === range);
    return opt ? opt.label : range;
  }
  if (month && year) {
    const m = MONTHS.find((mo) => mo.value === month);
    return `${m?.label ?? month} ${year}`;
  }
  if (month) {
    const m = MONTHS.find((mo) => mo.value === month);
    return m?.label ?? month;
  }
  if (year) return year;
  return null;
}

function isActive(filter: DateFilterValue) {
  return !!(filter.range || filter.month || filter.year);
}

export default function DateFilter({ onChange }: DateFilterProps) {
  const [open, setOpen]           = useState(false);
  const [tab, setTab]             = useState("range");
  const [committed, setCommitted] = useState<DateFilterValue>(EMPTY_FILTER);
  const [draft, setDraft]         = useState<DateFilterValue>(EMPTY_FILTER);

  const panelRef   = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // ── Commit helpers ────────────────────────────────────────────────────────

  const commitAndNotify = useCallback(
    (value: DateFilterValue) => {
      setCommitted(value);
      setDraft(value);
      setTimeout(() => onChange?.(value), 0);
    },
    [onChange]
  );

  function selectRange(value: string) {
    commitAndNotify({ year: "", month: "", range: value });
    setOpen(false);
  }

  function applyMonthYear() {
    if (!draft.month || !draft.year) return;
    commitAndNotify(draft);
    setOpen(false);
  }

  function clearAll() {
    commitAndNotify(EMPTY_FILTER);
    setOpen(false);
  }

  const dismissPanel = useCallback(() => {
    setDraft(committed);
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
  const canApply = !!(draft.month && draft.year);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="relative inline-block">

      {/* Trigger button */}
      <button
        ref={triggerRef}
        onClick={() => {
          setOpen((v) => {
            if (!v) setDraft(committed);
            return !v;
          });
        }}
        className={[
          "inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-[15px] font-medium cursor-pointer transition-all whitespace-nowrap",
          active
            ? "border-primary-400 bg-primary-500 text-white"
            : "border-gray-200 bg-white text-gray-700",
          open ? "shadow-[0_0_0_3px_rgba(221,79,5,0.15)]" : "",
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

            {/* Month / Year tab */}
            {tab === "month_year" && (
              <div className="flex flex-col gap-3">

                <p className="m-0 text-[12px] text-gray-400 leading-snug">
                  Both month and year are required. Changes apply only when you press Apply.
                </p>

                {/* Month picker */}
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-gray-300 mb-1.5">
                    Month
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {MONTHS.map((m) => (
                      <button
                        key={m.value}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            range: "",
                            month: prev.month === m.value ? "" : m.value,
                          }))
                        }
                        className={[
                          "py-1.5 rounded-lg text-[12px] cursor-pointer transition-all border",
                          draft.month === m.value
                            ? "border-primary-400 bg-primary-500 text-white font-medium"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-primary-00 hover:border-primary-100",
                        ].join(" ")}
                      >
                        {m.label.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Year picker */}
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.06em] text-gray-300 mb-1.5">
                    Year
                  </label>
                  <div className="grid grid-cols-5 gap-1">
                    {YEARS.map((y) => (
                      <button
                        key={y}
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            range: "",
                            year: prev.year === y ? "" : y,
                          }))
                        }
                        className={[
                          "py-1.5 px-1 rounded-lg text-[12px] cursor-pointer transition-all border",
                          draft.year === y
                            ? "border-primary-400 bg-primary-500 text-white font-medium"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-primary-00 hover:border-primary-100",
                        ].join(" ")}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Validation hint */}
                {(draft.month || draft.year) && !canApply && (
                  <p className="m-0 text-[12px] text-warning-400 leading-snug">
                    {!draft.month
                      ? "Please select a month to continue."
                      : "Please select a year to continue."}
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
                    onClick={applyMonthYear}
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
