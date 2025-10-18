export type AccountType = 'checking' | 'savings' | 'credit';

export interface Account {
  id: string;
  userId: string;
  type: AccountType;
  name: string;
  number: string;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AccountResponse {
  id: string;
  type: AccountType;
  name: string;
  number: string;
  balance: number;
  currency: string;
}

export interface BalanceResponse {
  balance: number;
  currency: string;
}

export interface CreateAccountRequest {
  type: AccountType;
  name: string;
  initialBalance?: number;
}
