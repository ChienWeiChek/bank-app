import { apiService } from "@/services/api";
import { Account } from "@/types";
import { create } from "zustand";

// API Response Types
interface AccountsResponse {
  accounts: Account[];
}

interface AccountResponse {
  account: Account;
}

interface BalanceResponse {
  balance: number;
  currency: string;
}

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
  
  // API Actions
  fetchAccounts: () => Promise<void>;
  fetchAccountDetails: (accountId: string) => Promise<void>;
  fetchAccountBalance: (accountId: string) => Promise<number | null>;
}

export const useAccountsStore = create<AccountsState>()((set, get) => ({
  accounts: [],
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

  // API Actions
  fetchAccounts: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await apiService.request<AccountsResponse>("/api/accounts");
      
      if (response.success && response.data) {
        set({ 
          accounts: response.data.accounts,
          loading: false 
        });
      } else {
        set({ 
          error: response.error || "Failed to fetch accounts",
          loading: false 
        });
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      set({ 
        error: "Network error. Please check your connection.",
        loading: false 
      });
    }
  },

  fetchAccountDetails: async (accountId: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await apiService.request<AccountResponse>(`/api/accounts/${accountId}`);
      
      if (response.success && response.data) {
        const { accounts } = get();
        const updatedAccounts = accounts.map(account => 
          account.id === accountId ? response.data!.account : account
        );
        
        set({ 
          accounts: updatedAccounts,
          selectedAccount: response.data.account,
          loading: false 
        });
      } else {
        set({ 
          error: response.error || "Failed to fetch account details",
          loading: false 
        });
      }
    } catch (error) {
      console.error("Error fetching account details:", error);
      set({ 
        error: "Network error. Please check your connection.",
        loading: false 
      });
    }
  },

  fetchAccountBalance: async (accountId: string): Promise<number | null> => {
    try {
      const response = await apiService.request<BalanceResponse>(`/api/accounts/${accountId}/balance`);
      
      if (response.success && response.data) {
        const { accounts, selectedAccount } = get();
        
        const updatedAccounts = accounts.map(account =>
          account.id === accountId ? { ...account, balance: response.data!.balance } : account
        );

        const updatedSelectedAccount =
          selectedAccount?.id === accountId
            ? { ...selectedAccount, balance: response.data!.balance }
            : selectedAccount;

        set({
          accounts: updatedAccounts,
          selectedAccount: updatedSelectedAccount,
        });

        return response.data.balance;
      } else {
        set({ error: response.error || "Failed to fetch account balance" });
        return null;
      }
    } catch (error) {
      console.error("Error fetching account balance:", error);
      set({ error: "Network error. Please check your connection." });
      return null;
    }
  },
}));
