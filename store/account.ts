import { Account } from "@/types";
import { create } from "zustand";

// Accounts Store
interface AccountsState {
  accounts: Account[];
  selectedAccount: Account | null;
  loading: boolean;
  error: string | null;

  // Actions
  setSelectedAccount: (account: Account) => void;
  updateAccountBalance: (accountId: string, newBalance: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAccountsStore = create<AccountsState>()((set, get) => ({
  accounts: [
    {
      id: "1",
      type: "checking",
      name: "Main Checking",
      number: "****1234",
      balance: 12500.75,
      currency: "USD",
    },
    {
      id: "2",
      type: "savings",
      name: "Emergency Fund",
      number: "****5678",
      balance: 8500.25,
      currency: "USD",
    },
    {
      id: "3",
      type: "credit",
      name: "Credit Card",
      number: "****9012",
      balance: -1250.5,
      currency: "USD",
    },
  ],
  selectedAccount: null,
  loading: false,
  error: null,

  setSelectedAccount: (selectedAccount: Account) => set({ selectedAccount }),

  updateAccountBalance: (accountId: string, newBalance: number) => {
    const { accounts, selectedAccount } = get();

    const updatedAccounts = accounts.map((account) =>
      account.id === accountId ? { ...account, balance: newBalance } : account
    );

    const updatedSelectedAccount =
      selectedAccount?.id === accountId
        ? { ...selectedAccount, balance: newBalance }
        : selectedAccount;

    set({
      accounts: updatedAccounts,
      selectedAccount: updatedSelectedAccount,
    });
  },

  setLoading: (loading: boolean) => set({ loading }),

  setError: (error: string | null) => set({ error }),
}));
