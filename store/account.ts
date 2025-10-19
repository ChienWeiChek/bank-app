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
  loading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // API Actions
  fetchAccounts: () => Promise<void>;
  fetchAccountDetails: (accountId: string) => Promise<void>;
  fetchAccountBalance: (accountId: string) => Promise<number | null>;
  refreshAccountBalance: (accountId: string) => Promise<number | null>;
}

export const useAccountsStore = create<AccountsState>()((set, get) => ({
  accounts: [],
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  // API Actions
  fetchAccounts: async () => {
    set({ loading: true, error: null });

    try {
      const response = await apiService.request<AccountsResponse>(
        "/api/accounts"
      );

      if (response.success && response.data) {
        set({
          accounts: response.data.accounts,
          loading: false,
        });
      } else {
        set({
          error: response.error || "Failed to fetch accounts",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      set({
        error: "Network error. Please check your connection.",
        loading: false,
      });
    }
  },

  fetchAccountDetails: async (accountId) => {
    set({ loading: true, error: null });

    try {
      const response = await apiService.request<AccountResponse>(
        `/api/accounts/${accountId}`
      );

      if (response.success && response.data) {
        const { accounts } = get();
        const updatedAccounts = accounts.map((account) =>
          account.id === accountId ? response.data!.account : account
        );

        set({
          accounts: updatedAccounts,
          loading: false,
        });
      } else {
        set({
          error: response.error || "Failed to fetch account details",
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error fetching account details:", error);
      set({
        error: "Network error. Please check your connection.",
        loading: false,
      });
    }
  },

  fetchAccountBalance: async (accountId) => {
    try {
      const response = await apiService.request<BalanceResponse>(
        `/api/accounts/${accountId}/balance`
      );

      if (response.success && response.data) {
        const { accounts } = get();

        const updatedAccounts = accounts.map((account) =>
          account.id === accountId
            ? { ...account, balance: response.data!.balance }
            : account
        );

        set({
          accounts: updatedAccounts,
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

  // Refresh account balance after transfer to ensure data consistency
  refreshAccountBalance: async (accountId) => {
    try {
      const data = await get().fetchAccountBalance(accountId);
      console.log("🚀 ~ data:", data);
      return data;
    } catch (error) {
      console.error("Error refreshing account balance:", error);
      return null;
      // Silently fail - the local state is already updated, this is just for synchronization
    }
  },
}));
