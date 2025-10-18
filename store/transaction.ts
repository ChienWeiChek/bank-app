import { Contact, Transaction } from "@/types";
import { create } from "zustand";

// Transactions Store
interface TransactionsState {
  transactions: Transaction[];
  contacts: Contact[];
  loading: boolean;
  error: string | null;

  // Actions
  addTransaction: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addContact: (contact: Contact) => void;
  clearError: () => void;
}

export const useTransactionsStore = create<TransactionsState>()((set, get) => ({
  transactions: [
    {
      id: "1",
      type: "transfer",
      amount: -250.0,
      description: "Transfer to John Doe",
      date: "2025-10-15T14:30:00Z",
      status: "completed",
      fromAccount: "1",
      toAccount: "external",
      recipientName: "John Doe",
    },
    {
      id: "2",
      type: "payment",
      amount: -89.99,
      description: "Electricity Bill",
      date: "2025-10-14T09:15:00Z",
      status: "completed",
      fromAccount: "1",
      toAccount: "utility",
    },
    {
      id: "3",
      type: "deposit",
      amount: 1500.0,
      description: "Salary Deposit",
      date: "2025-10-10T08:00:00Z",
      status: "completed",
      fromAccount: "external",
      toAccount: "1",
    },
    {
      id: "4",
      type: "transfer",
      amount: -50.0,
      description: "Transfer to Jane Smith",
      date: "2025-10-08T16:45:00Z",
      status: "completed",
      fromAccount: "1",
      toAccount: "external",
      recipientName: "Jane Smith",
    },
  ],
  contacts: [
    {
      id: "1",
      name: "John Doe",
      phoneNumber: "+1234567890",
      email: "john.doe@email.com",
    },
    {
      id: "2",
      name: "Jane Smith",
      phoneNumber: "+0987654321",
      email: "jane.smith@email.com",
    },
    {
      id: "3",
      name: "Bob Johnson",
      phoneNumber: "+1122334455",
    },
    {
      id: "4",
      name: "Alice Brown",
      phoneNumber: "+5566778899",
    },
  ],
  loading: false,
  error: null,

  addTransaction: (transaction: Transaction) => {
    const { transactions } = get();
    set({ transactions: [transaction, ...transactions] });
  },

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),

  addContact: (contact: Contact) => {
    const { contacts } = get();
    set({ contacts: [...contacts, contact] });
  },

  clearError: () => set({ error: null }),
}));
