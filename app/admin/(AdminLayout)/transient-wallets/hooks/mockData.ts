export type LedgerEntryStatus = "Matched" | "Unmatched";
export type LedgerEntryType = "Credit" | "Debit";

export interface TransientWalletListItem {
  id: string;
  walletId: string;
  customerId: string;
  customerName: string;
  totalDebit: number;
  totalCredit: number;
  dateCreated: string;
  timeCreated: string;
  hasUnmatched: boolean;
}

export interface TransientWalletDetail {
  id: string;
  walletId: string;
  customerId: string;
  customerName: string;
  totalDebit: number;
  totalCredit: number;
  dateCreated: string;
  timeCreated: string;
}

export interface TransientLedgerEntry {
  id: string;
  walletId: string;
  entryId: string;
  date: string;
  time: string;
  sessionId: string;
  type: LedgerEntryType;
  amount: number;
  status: LedgerEntryStatus;
}

export interface TransientEntryDetail {
  id: string;
  walletId: string;
  entryId: string;
  virtualAccountNo: string;
  sessionId: string;
  transactionType: LedgerEntryType;
  amount: number;
  entryDate: string;
  entryTime: string;
  status: LedgerEntryStatus;
}

export interface TransientAuditLog {
  id: string;
  entryId: string;
  date: string;
  time: string;
  action: string;
  initiator: string;
}

export interface TransientAdminNote {
  id: string;
  entryId: string;
  date: string;
  time: string;
  note: string;
  author: string;
}

export interface LinkableTransaction {
  id: string;
  ref: string;
  customerName: string;
  amount: number;
}

export interface TransientWalletStats {
  totalWallets: number;
  matchedEntries: number;
  unmatchedEntries: number;
  totalVolume: number;
}

export const MOCK_WALLET_STATS: TransientWalletStats = {
  totalWallets: 128,
  matchedEntries: 342,
  unmatchedEntries: 47,
  totalVolume: 458_750_000,
};

export const MOCK_WALLETS: TransientWalletListItem[] = [
  {
    id: "677333",
    walletId: "677333",
    customerId: "677333",
    customerName: "Samuel Joshson",
    totalDebit: 1_250_000,
    totalCredit: 1_250_000,
    dateCreated: "Nov 10, 2025",
    timeCreated: "11:00 am",
    hasUnmatched: true,
  },
  {
    id: "677334",
    walletId: "677334",
    customerId: "445821",
    customerName: "Bola Tinubu",
    totalDebit: 2_150_000,
    totalCredit: 2_150_000,
    dateCreated: "Sept 19, 2025",
    timeCreated: "11:00 am",
    hasUnmatched: false,
  },
  {
    id: "677335",
    walletId: "677335",
    customerId: "882901",
    customerName: "Emeka Duru",
    totalDebit: 890_000,
    totalCredit: 890_000,
    dateCreated: "Oct 5, 2025",
    timeCreated: "2:30 pm",
    hasUnmatched: true,
  },
  {
    id: "677336",
    walletId: "677336",
    customerId: "331002",
    customerName: "Stephen Seunfunmi",
    totalDebit: 4_465_009,
    totalCredit: 4_465_009,
    dateCreated: "Aug 22, 2025",
    timeCreated: "9:15 am",
    hasUnmatched: false,
  },
  {
    id: "677337",
    walletId: "677337",
    customerId: "119443",
    customerName: "Adeola Aderinsola",
    totalDebit: 750_000,
    totalCredit: 750_000,
    dateCreated: "Jul 14, 2025",
    timeCreated: "4:45 pm",
    hasUnmatched: true,
  },
  {
    id: "677338",
    walletId: "677338",
    customerId: "556712",
    customerName: "Chioma Okonkwo",
    totalDebit: 3_200_000,
    totalCredit: 3_200_000,
    dateCreated: "Jun 30, 2025",
    timeCreated: "10:20 am",
    hasUnmatched: false,
  },
  {
    id: "677339",
    walletId: "677339",
    customerId: "778234",
    customerName: "Ibrahim Musa",
    totalDebit: 1_800_000,
    totalCredit: 1_800_000,
    dateCreated: "May 18, 2025",
    timeCreated: "1:00 pm",
    hasUnmatched: true,
  },
  {
    id: "677340",
    walletId: "677340",
    customerId: "992011",
    customerName: "Fatima Bello",
    totalDebit: 560_000,
    totalCredit: 560_000,
    dateCreated: "Apr 3, 2025",
    timeCreated: "8:30 am",
    hasUnmatched: false,
  },
  {
    id: "677341",
    walletId: "677341",
    customerId: "223456",
    customerName: "Oluwaseun Adeyemi",
    totalDebit: 2_900_000,
    totalCredit: 2_900_000,
    dateCreated: "Mar 12, 2025",
    timeCreated: "3:15 pm",
    hasUnmatched: true,
  },
  {
    id: "677342",
    walletId: "677342",
    customerId: "667890",
    customerName: "Grace Eze",
    totalDebit: 1_100_000,
    totalCredit: 1_100_000,
    dateCreated: "Feb 28, 2025",
    timeCreated: "11:45 am",
    hasUnmatched: false,
  },
  {
    id: "677343",
    walletId: "677343",
    customerId: "334567",
    customerName: "Tunde Bakare",
    totalDebit: 675_000,
    totalCredit: 675_000,
    dateCreated: "Jan 15, 2025",
    timeCreated: "5:00 pm",
    hasUnmatched: true,
  },
  {
    id: "677344",
    walletId: "677344",
    customerId: "445678",
    customerName: "Ngozi Okafor",
    totalDebit: 5_100_000,
    totalCredit: 5_100_000,
    dateCreated: "Dec 8, 2024",
    timeCreated: "12:00 pm",
    hasUnmatched: false,
  },
];

export const MOCK_LEDGER_ENTRIES: TransientLedgerEntry[] = [
  {
    id: "9022",
    walletId: "677333",
    entryId: "9022",
    date: "Sept 19, 2025",
    time: "11:00 am",
    sessionId: "1256273817933739273",
    type: "Credit",
    amount: 1_250_000,
    status: "Matched",
  },
  {
    id: "9023",
    walletId: "677333",
    entryId: "9023",
    date: "Sept 18, 2025",
    time: "3:45 pm",
    sessionId: "1256273817933739274",
    type: "Debit",
    amount: 1_250_000,
    status: "Unmatched",
  },
  {
    id: "9024",
    walletId: "677333",
    entryId: "9024",
    date: "Sept 17, 2025",
    time: "9:20 am",
    sessionId: "1256273817933739275",
    type: "Credit",
    amount: 500_000,
    status: "Matched",
  },
  {
    id: "9025",
    walletId: "677334",
    entryId: "9025",
    date: "Sept 19, 2025",
    time: "11:00 am",
    sessionId: "1256273817933739280",
    type: "Credit",
    amount: 2_150_000,
    status: "Matched",
  },
  {
    id: "9026",
    walletId: "677334",
    entryId: "9026",
    date: "Sept 18, 2025",
    time: "2:00 pm",
    sessionId: "1256273817933739281",
    type: "Debit",
    amount: 2_150_000,
    status: "Matched",
  },
  {
    id: "9027",
    walletId: "677335",
    entryId: "9027",
    date: "Oct 5, 2025",
    time: "2:30 pm",
    sessionId: "1256273817933739290",
    type: "Credit",
    amount: 890_000,
    status: "Unmatched",
  },
  {
    id: "9028",
    walletId: "677336",
    entryId: "9028",
    date: "Aug 22, 2025",
    time: "9:15 am",
    sessionId: "1256273817933739300",
    type: "Credit",
    amount: 4_465_009,
    status: "Matched",
  },
  {
    id: "677333",
    walletId: "677333",
    entryId: "677333",
    date: "Nov 10, 2025",
    time: "11:00 am",
    sessionId: "125627381793373927",
    type: "Credit",
    amount: 4_465_009,
    status: "Unmatched",
  },
];

export const MOCK_ENTRY_DETAILS: TransientEntryDetail[] = [
  {
    id: "677333",
    walletId: "677333",
    entryId: "677333",
    virtualAccountNo: "2009812347",
    sessionId: "125627381793373927",
    transactionType: "Credit",
    amount: 4_465_009,
    entryDate: "Nov 10, 2025",
    entryTime: "11:00 am",
    status: "Unmatched",
  },
  {
    id: "9022",
    walletId: "677333",
    entryId: "9022",
    virtualAccountNo: "2009812347",
    sessionId: "1256273817933739273",
    transactionType: "Credit",
    amount: 1_250_000,
    entryDate: "Sept 19, 2025",
    entryTime: "11:00 am",
    status: "Matched",
  },
  {
    id: "9023",
    walletId: "677333",
    entryId: "9023",
    virtualAccountNo: "2009812348",
    sessionId: "1256273817933739274",
    transactionType: "Debit",
    amount: 1_250_000,
    entryDate: "Sept 18, 2025",
    entryTime: "3:45 pm",
    status: "Unmatched",
  },
  {
    id: "9025",
    walletId: "677334",
    entryId: "9025",
    virtualAccountNo: "2009812350",
    sessionId: "1256273817933739280",
    transactionType: "Credit",
    amount: 2_150_000,
    entryDate: "Sept 19, 2025",
    entryTime: "11:00 am",
    status: "Matched",
  },
];

export const MOCK_AUDIT_LOGS: TransientAuditLog[] = [
  {
    id: "1",
    entryId: "677333",
    date: "Sept 19, 2025",
    time: "11:00 am",
    action: "Matched",
    initiator: "Stephen Seunfunmi",
  },
  {
    id: "2",
    entryId: "677333",
    date: "Sept 19, 2025",
    time: "11:00 am",
    action: "Received by system",
    initiator: "Transaction by Emeka Duru",
  },
  {
    id: "3",
    entryId: "9022",
    date: "Sept 19, 2025",
    time: "11:00 am",
    action: "Matched",
    initiator: "Stephen Seunfunmi",
  },
  {
    id: "4",
    entryId: "9022",
    date: "Sept 19, 2025",
    time: "11:00 am",
    action: "Received by system",
    initiator: "Transaction by Emeka Duru",
  },
];

export const MOCK_ADMIN_NOTES: TransientAdminNote[] = [
  {
    id: "1",
    entryId: "677333",
    date: "Nov 10, 2025",
    time: "11:30 am",
    note: "This transaction is not fraudulent. Please carryon with matching the transaction",
    author: "Admin User",
  },
  {
    id: "2",
    entryId: "9022",
    date: "Sept 20, 2025",
    time: "9:00 am",
    note: "Verified with customer support team.",
    author: "Stephen Seunfunmi",
  },
];

export const MOCK_LINKABLE_TRANSACTIONS: LinkableTransaction[] = [
  { id: "1", ref: "TXN-8820", customerName: "Bola Tinubu", amount: 2_150_000 },
  { id: "2", ref: "TXN-8821", customerName: "Samuel Joshson", amount: 1_250_000 },
  { id: "3", ref: "TXN-8822", customerName: "Emeka Duru", amount: 890_000 },
  { id: "4", ref: "TXN-8823", customerName: "Adeola Aderinsola", amount: 750_000 },
  { id: "5", ref: "TXN-8824", customerName: "Chioma Okonkwo", amount: 3_200_000 },
];

export function formatLinkableTransactionLabel(tx: LinkableTransaction): string {
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(tx.amount);
  return `${tx.ref} — ${tx.customerName} (${formatted})`;
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    total,
    page: safePage,
    totalPages,
  };
}

export function filterBySearch<T>(
  items: T[],
  search: string | undefined,
  getSearchableText: (item: T) => string
): T[] {
  const q = search?.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) =>
    getSearchableText(item).toLowerCase().includes(q)
  );
}

export function getWalletDetail(walletId: string): TransientWalletDetail | null {
  const wallet = MOCK_WALLETS.find((w) => w.id === walletId);
  if (!wallet) return null;
  return {
    id: wallet.id,
    walletId: wallet.walletId,
    customerId: wallet.customerId,
    customerName: wallet.customerName,
    totalDebit: wallet.totalDebit,
    totalCredit: wallet.totalCredit,
    dateCreated: wallet.dateCreated,
    timeCreated: wallet.timeCreated,
  };
}

export function getEntryDetail(
  walletId: string,
  entryId: string
): TransientEntryDetail | null {
  return (
    MOCK_ENTRY_DETAILS.find(
      (e) => e.walletId === walletId && e.entryId === entryId
    ) ?? null
  );
}
