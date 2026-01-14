export type TransactionStatus =
  | "Pending"
  | "Completed"
  | "Rejected"
  | "Request More Info";

export interface Transaction {
  id: string;
  date: string;
  time: string;
  status: TransactionStatus;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  unread?: boolean;
}
