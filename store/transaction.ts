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
  currentFilters: {
    type?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  };

  // Actions
  addTransaction: (transaction: Transaction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addContact: (contact: Contact) => void;
  clearError: () => void;
  setCurrentFilters: (filters: {
    type?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  fetchTransactions: (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
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
  currentFilters: {},

  fetchTransactions: async (params = {}) => {
    const { setLoading, setError, transactions, pagination, currentFilters } = get();
    
    const isRefresh = params.refresh;
    const page = params.page || (isRefresh ? 1 : pagination.page);
    
    // Check if this is a new filter query (not pagination)
    const hasFilters = params.type || params.status || params.search || params.startDate || params.endDate;
    const isNewQuery = page === 1 || hasFilters;
    
    // Update current filters if new filters are provided
    if (hasFilters) {
      set({
        currentFilters: {
          type: params.type,
          status: params.status,
          search: params.search,
          startDate: params.startDate,
          endDate: params.endDate,
        }
      });
    }
    
    if (isRefresh) {
      set({ refreshing: true });
    } else if (page > 1 && !isNewQuery) {
      set({ loadingMore: true });
    } else {
      setLoading(true);
    }
    
    setError(null);

    try {
      // Build query parameters - use current filters if no new filters provided
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', (params.limit || pagination.limit).toString());
      
      // Use provided filters or current stored filters
      const type = params.type || currentFilters.type;
      const status = params.status || currentFilters.status;
      const search = params.search || currentFilters.search;
      const startDate = params.startDate || currentFilters.startDate;
      const endDate = params.endDate || currentFilters.endDate;
      
      if (type && type !== 'all') queryParams.append('type', type);
      if (status && status !== 'all') queryParams.append('status', status);
      if (search) queryParams.append('search', search);
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const queryString = queryParams.toString();
      const endpoint = `/api/transactions/history${queryString ? `?${queryString}` : ''}`;

      const response = await apiService.request<TransactionHistoryResponse>(endpoint);

      if (response.success && response.data) {
        const newTransactions = response.data.transactions;
        const newPagination = response.data.pagination;
        
        set({
          transactions: isNewQuery ? newTransactions : [...transactions, ...newTransactions],
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
      } else if (page > 1 && !isNewQuery) {
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

  setCurrentFilters: (filters: {
    type?: string;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) => set({ currentFilters: filters }),
}));
