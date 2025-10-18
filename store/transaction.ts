import { apiService } from "@/services/api";
import { Contact, Transaction } from "@/types";
import { create } from "zustand";

// API Response Types
interface TransactionHistoryResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Transactions Store
interface TransactionsState {
  transactions: Transaction[];
  contacts: Contact[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  loadingMore: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };

  // Actions
  addTransaction: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addContact: (contact: Contact) => void;
  clearError: () => void;
  fetchTransactions: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
    refresh?: boolean;
  }) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  loadMoreTransactions: () => Promise<void>;
}

export const useTransactionsStore = create<TransactionsState>()((set, get) => ({
  transactions: [],
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
  refreshing: false,
  loadingMore: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
  },

  fetchTransactions: async (params = {}) => {
    const { setLoading, setError, transactions, pagination } = get();
    
    const isRefresh = params.refresh;
    const page = params.page || (isRefresh ? 1 : pagination.page);
    
    if (isRefresh) {
      set({ refreshing: true });
    } else if (page > 1) {
      set({ loadingMore: true });
    } else {
      setLoading(true);
    }
    
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', (params.limit || pagination.limit).toString());
      if (params.type) queryParams.append('type', params.type);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const queryString = queryParams.toString();
      const endpoint = `/api/transactions/history${queryString ? `?${queryString}` : ''}`;

      const response = await apiService.request<TransactionHistoryResponse>(endpoint);

      if (response.success && response.data) {
        const newTransactions = response.data.transactions;
        const newPagination = response.data.pagination;
        
        set({
          transactions: isRefresh || page === 1 ? newTransactions : [...transactions, ...newTransactions],
          pagination: {
            ...newPagination,
            hasMore: newPagination.page < newPagination.totalPages,
          },
        });
      } else {
        setError(response.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      setError('Network error while fetching transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      if (isRefresh) {
        set({ refreshing: false });
      } else if (page > 1) {
        set({ loadingMore: false });
      } else {
        setLoading(false);
      }
    }
  },

  refreshTransactions: async () => {
    const { fetchTransactions } = get();
    await fetchTransactions({ refresh: true });
  },

  loadMoreTransactions: async () => {
    const { fetchTransactions, pagination } = get();
    if (pagination.hasMore && !get().loadingMore) {
      await fetchTransactions({ page: pagination.page + 1 });
    }
  },

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
