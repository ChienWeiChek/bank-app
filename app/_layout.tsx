import { useAuthStore } from "@/store/auth";
import { Stack } from "expo-router";
import * as React from "react";

export default function RootLayout() {
  const { isAuthenticated, biometricEnabled } =
    useAuthStore();

    // biometricEnabled: state.biometricEnabled ?? false,
  console.log("🚀 ~ RootLayout ~ isAuthenticated:", isAuthenticated);
  console.log("🚀 ~ RootLayout ~ biometricEnabled:", biometricEnabled);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(tabs)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
