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
  }) => Promise<void>;
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

  fetchTransactions: async (params = {}) => {
    const { setLoading, setError } = get();
    
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.type) queryParams.append('type', params.type);
      if (params.startDate) queryParams.append('startDate', params.startDate);
      if (params.endDate) queryParams.append('endDate', params.endDate);

      const queryString = queryParams.toString();
      const endpoint = `/api/transactions/history${queryString ? `?${queryString}` : ''}`;

      const response = await apiService.request<TransactionHistoryResponse>(endpoint);

      if (response.success && response.data) {
        set({ transactions: response.data.transactions });
      } else {
        setError(response.error || 'Failed to fetch transactions');
      }
    } catch (error) {
      setError('Network error while fetching transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
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
