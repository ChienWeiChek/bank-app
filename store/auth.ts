import { User } from "@/types";
import { zustandStorage } from "@/utils/storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  loading: boolean;
  error: string | null;

  // Actions
  loginStart: () => void;
  loginSuccess: (user: User) => void;
  loginFailure: (error: string) => void;
  logout: () => void;
  setBiometricEnabled: (enabled: boolean) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      biometricEnabled: false,
      loading: false,
      error: null,

      loginStart: () => set({ loading: true, error: null }),

      loginSuccess: (user: User) =>
        set({
          loading: false,
          user,
          isAuthenticated: true,
          error: null,
        }),

      loginFailure: (error: string) =>
        set({
          loading: false,
          error,
          isAuthenticated: false,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          biometricEnabled: false,
        }),

      setBiometricEnabled: (biometricEnabled: boolean) =>
        set({ biometricEnabled }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        biometricEnabled: state.biometricEnabled,
      }),
    }
  )
);
