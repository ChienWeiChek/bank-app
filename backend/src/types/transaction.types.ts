export type TransactionType = 'transfer' | 'payment' | 'deposit' | 'withdrawal';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: Date;
  status: TransactionStatus;
  fromAccountId: string | null;
  toAccountId: string | null;
  recipientName: string | null;
  userId: string;
  createdAt: Date;
}

export interface TransactionResponse {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  status: TransactionStatus;
  fromAccount: string | null;
  toAccount: string | null;
  recipientName: string | null;
}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  description?: string;
  recipientName?: string;
}

export interface TransactionHistoryRequest {
  page?: number;
  limit?: number;
  type?: TransactionType;
  startDate?: string;
  endDate?: string;
}

export interface TransactionHistoryResponse {
  transactions: TransactionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
