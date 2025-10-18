import { apiService } from "@/services/api";
import { useAuthStore } from "@/store/auth";
import { BiometricAuth } from "@/utils/biometricAuth";
import { Stack, useRouter } from "expo-router";
import * as React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  const { isAuthenticated, biometricEnabled, setBiometricEnabled } =
    useAuthStore();
  const router = useRouter();
  
  React.useEffect(() => {
    const getBiometricPreference = async () => {
      setBiometricEnabled(await BiometricAuth.getBiometricPreference());
    };
    getBiometricPreference();

    // Set navigation callback for API service to handle 401 responses
    apiService.setNavigationCallback(() => {
      console.log("Navigation callback triggered - redirecting to login");
      router.replace("/(auth)/login");
    });
  }, [router, setBiometricEnabled]);

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
