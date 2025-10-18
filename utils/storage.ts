import * as SecureStore from 'expo-secure-store';
import { StateStorage } from 'zustand/middleware';

// Custom storage implementation using expo-secure-store
export const zustandStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.warn(`Error getting item from storage: ${name}`, error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.warn(`Error setting item in storage: ${name}`, error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.warn(`Error removing item from storage: ${name}`, error);
    }
  },
};
