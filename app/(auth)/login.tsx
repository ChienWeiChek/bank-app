import AuthApi from "@/services/auth";
import { useAuthStore } from "@/store/auth";
import { BiometricAuth } from "@/utils/biometricAuth";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const [email, setEmail] = useState("demo@bankapp.com");
  const [password, setPassword] = useState("SecurePassword123!");
  const router = useRouter();
  const {
    loading,
    error,
    loginStart,
    loginSuccess,
    loginFailure,
    biometricEnabled,
    refreshToken,
  } = useAuthStore();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("Biometric");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    loginStart();

    try {
      const response = await AuthApi.login({ email, password });

      if (response.success && response.data) {
        const { user, tokens } = response.data;
        loginSuccess(user, tokens);

        // Redirect to biometric setup screen after successful login
        if (user.biometricEnabled && biometricEnabled) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(auth)/biometric-setup");
        }
      } else {
        loginFailure(response.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      loginFailure("An unexpected error occurred. Please try again.");
    }
  };

  const navigateToRegister = () => {
    router.push("/(auth)/register");
  };

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await BiometricAuth.isBiometricAvailable();
      setBiometricAvailable(available);

      if (available) {
        const types = await BiometricAuth.getAvailableBiometricTypes();
        const typeName = BiometricAuth.getBiometricTypeName(types);
        setBiometricType(typeName);
      }
    } catch (error) {
      console.error("Error checking biometric availability:", error);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricAvailable) {
      Alert.alert(
        "Biometric Unavailable",
        "Biometric authentication is not available on this device."
      );
      return;
    }

    if (!refreshToken) {
      Alert.alert("Login credential expired", "Kindly re login again");
      return;
    }

    loginStart();

    try {
      const result = await BiometricAuth.authenticate(
        `Sign in with ${biometricType}`
      );

      if (!(result.success && refreshToken)) {
        loginFailure(result.message || "Biometric authentication failed");
        return;
      }
      // For biometric login, we'll need to implement proper API integration
      // For now, we'll use the demo credentials for biometric login
      const tokens = await AuthApi.refreshToken(refreshToken);

      if (!(tokens.success && tokens.data)) {
        loginFailure(tokens.error || "Biometric authentication failed");
        return;
      }

      const user = await AuthApi.getCurrentUser(tokens.data.accessToken);
      if (!(user.success && user.data?.user)) {
        loginFailure(user.error || "Biometric login failed. Please try again.");
        return;
      }

      loginSuccess(user.data?.user, tokens.data);
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Biometric login error:", error);
      loginFailure("An error occurred during biometric authentication");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        <View style={styles.form}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Signing In..." : "Sign In"}
            </Text>
          </TouchableOpacity>

          {biometricEnabled && biometricAvailable && refreshToken && (
            <TouchableOpacity
              style={[
                styles.biometricButton,
                loading && styles.biometricButtonDisabled,
              ]}
              onPress={handleBiometricLogin}
              disabled={loading}
            >
              <Text style={styles.biometricButtonText}>
                {loading
                  ? "Authenticating..."
                  : `Sign In with ${biometricType}`}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don&apos;t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.demoContainer}>
          <Text style={styles.demoText}>Demo Credentials:</Text>
          <Text style={styles.demoText}>Email: demo@bank.com</Text>
          <Text style={styles.demoText}>Password: password</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0100e7",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#333333",
  },
  loginButton: {
    backgroundColor: "#0100e7",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  loginButtonDisabled: {
    backgroundColor: "#b3b3b3",
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotPasswordText: {
    color: "#0100e7",
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  registerText: {
    color: "#666666",
    fontSize: 16,
  },
  registerLink: {
    color: "#0100e7",
    fontSize: 16,
    fontWeight: "bold",
  },
  demoContainer: {
    marginTop: 40,
    padding: 16,
    backgroundColor: "#f0f8ff",
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#0100e7",
  },
  biometricButton: {
    backgroundColor: "#28a745",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#218838",
  },
  biometricButtonDisabled: {
    backgroundColor: "#b3b3b3",
    borderColor: "#999999",
  },
  biometricButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  demoText: {
    color: "#666666",
    fontSize: 14,
    marginBottom: 4,
  },
});

export default LoginScreen;
