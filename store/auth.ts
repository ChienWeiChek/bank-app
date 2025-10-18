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
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  loginStart: () => void;
  loginSuccess: (user: User, tokens: { accessToken: string; refreshToken: string }) => void;
  loginFailure: (error: string) => void;
  logout: () => void;
  setBiometricEnabled: (enabled: boolean) => void;
  clearError: () => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      biometricEnabled: false,
      loading: false,
      error: null,
      accessToken: null,
      refreshToken: null,

      loginStart: () => set({ loading: true, error: null }),

      loginSuccess: (user: User, tokens: { accessToken: string; refreshToken: string }) =>
        set({
          loading: false,
          user,
          isAuthenticated: true,
          error: null,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),

      loginFailure: (error: string) =>
        set({
          loading: false,
          error,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
        }),

      setBiometricEnabled: (biometricEnabled: boolean) =>
        set({ biometricEnabled }),

      clearError: () => set({ error: null }),

      setTokens: (tokens: { accessToken: string; refreshToken: string }) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        biometricEnabled: state.biometricEnabled,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
