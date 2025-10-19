import { apiService } from "@/services/api";
import { Transaction } from "@/types";
import useSWRInfinite from "swr/infinite";

interface TransactionHistoryResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UseTransactionsOptions {
  type?: string;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

const fetcher = async (url: string): Promise<TransactionHistoryResponse> => {
  const response = await apiService.request<TransactionHistoryResponse>(url);

  if (!response.success || !response.data) {
    throw new Error(response.error || "Failed to fetch transactions");
  }

  return response.data;
};

export const useTransactions = (options: UseTransactionsOptions = {}) => {
  const { type, status, search, startDate, endDate, limit = 20 } = options;

  const getKey = (
    pageIndex: number,
    previousPageData: TransactionHistoryResponse | null
  ) => {
    // Build query parameters
    const params = new URLSearchParams();
    params.append("page", (pageIndex + 1).toString());
    params.append("limit", limit.toString());

    if (type && type !== "all") params.append("type", type);
    if (status && status !== "all") params.append("status", status);
    if (search) params.append("search", search);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const queryString = params.toString();
    const cacheKey = `/api/transactions/history${
      queryString ? `?${queryString}` : ""
    }`;

    // If we've reached the end, stop fetching
    if (previousPageData && !previousPageData.transactions.length) {
      return null;
    }

    return cacheKey;
  };
  const swrConfig = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: false,
    dedupingInterval: 1000 * 60 * 5, // 5 minutes: reuse cached data during this time
  };
  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite(
    getKey,
    fetcher,
    swrConfig
  );

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData ||
    (size > 0 && data && typeof data[size - 1] === "undefined");

  const isEmpty = data?.[0]?.transactions.length === 0;
  const isReachingEnd =
    isEmpty || (data && data[data.length - 1]?.transactions.length < limit);

  const allTransactions = data ? data.flatMap((page) => page.transactions) : [];
  const totalTransactions = data?.[0]?.pagination.total || 0;
  const hasMore = !isReachingEnd;

  const loadMore = () => {
    if (!isLoadingMore && !isReachingEnd) {
      setSize(size + 1);
    }
  };

  const refresh = () => {
    mutate();
  };

  return {
    transactions: allTransactions,
    isLoading: isLoadingInitialData,
    isLoadingMore,
    error,
    hasMore,
    total: totalTransactions,
    loadMore,
    refresh,
    isRefreshing: isValidating,
  };
};
