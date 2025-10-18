import { useAuthStore } from "@/store/auth";
import { BiometricAuth } from "@/utils/biometricAuth";
import { Stack } from "expo-router";
import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const { isAuthenticated, biometricEnabled, setBiometricEnabled } =
    useAuthStore();

  React.useEffect(() => {
    const getBiometricPreference = async () => {
      setBiometricEnabled(await BiometricAuth.getBiometricPreference());
    };
    getBiometricPreference();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // If biometric is already enabled, go directly to tabs
          // Otherwise, the biometric setup screen will handle the navigation
          biometricEnabled ? (
            <Stack.Screen name="(tabs)" />
          ) : (
            <Stack.Screen name="(auth)" />
          )
        ) : (
          <Stack.Screen name="(auth)" />
        )}
      </Stack>
    </SafeAreaView>
  );
}
