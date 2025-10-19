import * as SecureStore from 'expo-secure-store';

export interface TransferHistoryItem {
  contactId: string;
  contactName: string;
  phoneNumber: string;
  lastAmount: number;
  timestamp: string;
  transferCount: number;
}

const STORAGE_KEY = 'contact_transfer_history';

export class TransferHistoryService {
  static async saveLastTransfer(
    contactId: string, 
    contactName: string, 
    phoneNumber: string, 
    amount: number
  ): Promise<void> {
    try {
      const history = await this.getTransferHistory();
      
      // Find existing entry for this contact
      const existingIndex = history.findIndex(item => item.contactId === contactId);
      
      if (existingIndex >= 0) {
        // Update existing entry
        history[existingIndex] = {
          ...history[existingIndex],
          lastAmount: amount,
          timestamp: new Date().toISOString(),
          transferCount: history[existingIndex].transferCount + 1
        };
      } else {
        // Add new entry
        history.push({
          contactId,
          contactName,
          phoneNumber,
          lastAmount: amount,
          timestamp: new Date().toISOString(),
          transferCount: 1
        });
      }
      
      // Sort by most recent first
      history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      // Keep only the last 50 entries to prevent storage bloat
      const trimmedHistory = history.slice(0, 50);
      
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error saving transfer history:', error);
    }
  }

  static async getLastTransfer(contactId: string): Promise<number | null> {
    try {
      const history = await this.getTransferHistory();
      const entry = history.find(item => item.contactId === contactId);
      return entry?.lastAmount || null;
    } catch (error) {
      console.error('Error getting last transfer:', error);
      return null;
    }
  }

  static async getTransferHistory(): Promise<TransferHistoryItem[]> {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting transfer history:', error);
      return [];
    }
  }

  static async getRecentTransfers(limit: number = 5): Promise<TransferHistoryItem[]> {
    try {
      const history = await this.getTransferHistory();
      return history.slice(0, limit);
    } catch (error) {
      console.error('Error getting recent transfers:', error);
      return [];
    }
  }

  static async clearTransferHistory(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing transfer history:', error);
    }
  }

  static async removeTransferHistory(contactId: string): Promise<void> {
    try {
      const history = await this.getTransferHistory();
      const filteredHistory = history.filter(item => item.contactId !== contactId);
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(filteredHistory));
    } catch (error) {
      console.error('Error removing transfer history:', error);
    }
  }
}
