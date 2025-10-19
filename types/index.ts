// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  biometricEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Account {
  id: string;
  type: "checking" | "savings" | "credit";
  name: string;
  number: string;
  balance: number;
  currency: string;
}

export interface Recipient {
  name?: string;
  phoneNumber: string;
  email?: string;
}

export interface Contact extends Recipient {
  id: string;
  name: string;
}
export interface Transaction {
  id: string;
  type: "transfer" | "payment" | "deposit" | "withdrawal";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
  fromAccount: string;
  toAccount: string;
  recipientName?: string;
}

export enum TRANSACTION_STATUS {
  ALL = "all",
  COMPLETED = "completed",
  PENDING = "pending",
  FAILED = "failed",
}

export enum TRANSACTION_TYPE {
  ALL = "all",
  TRANSFER = "transfer",
  PAYMENT = "payment",
  DEPOSIT = "deposit",
}
