export type TransactionType = 'in' | 'out';

export interface Transaction {
  id: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  account: string;
  amount: number;
  name: string;
  category: string;
  details: string;
}

export interface Invoice {
  id: number;
  no: string;
  client: string;
  desc: string;
  amount: number;
  status: 'paid' | 'unpaid';
  date: string;
}

export const ACCOUNTS = [
  "Akaun Pejabat",
  "Akaun Dokumen",
  "Akaun Tunai",
  "Akaun Partner",
  "Akaun Client Lawyer"
];

export const CATEGORIES = [
  "Legal Fee",
  "Filing Fee",
  "Mileage",
  "Office Supplies",
  "Utilities",
  "Salary",
  "Rental"
];

export const MONTHS = [
  "Januari", "Februari", "Mac", "April", "Mei", "Jun", 
  "Julai", "Ogos", "September", "Oktober", "November", "Disember"
];
