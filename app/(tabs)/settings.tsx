import { useAuthStore } from "@/store/auth";
import { BiometricAuth } from "@/utils/biometricAuth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SettingsScreen = () => {
  const router = useRouter();
  const { user, biometricEnabled, setBiometricEnabled, logout } =
    useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  // Load biometric preference on component mount
  useEffect(() => {
    const loadBiometricPreference = async () => {
      try {
        const isBiometricEnabled = await BiometricAuth.getBiometricPreference();
        setBiometricEnabled(isBiometricEnabled);
      } catch (error) {
        console.error("Error loading biometric preference:", error);
      }
    };

    loadBiometricPreference();
  }, [setBiometricEnabled]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleBiometricToggle = async (value: boolean) => {
    try {
      // Safety check to ensure biometric authentication is properly initialized
      if (
        !BiometricAuth ||
        typeof BiometricAuth.isBiometricAvailable !== "function"
      ) {
        Alert.alert(
          "Biometric Error",
          "Biometric authentication is not properly initialized. Please restart the app."
        );
        return;
      }

      if (value) {
        // When enabling biometric, check if it's available and authenticate
        const isAvailable = await BiometricAuth.isBiometricAvailable();

        if (!isAvailable) {
          Alert.alert(
            "Biometric Unavailable",
            "Biometric authentication is not available on this device. Please ensure your device has biometric capabilities set up."
          );
          return;
        }

        // Authenticate to enable biometric
        const authResult = await BiometricAuth.authenticate(
          "Authenticate to enable biometric login"
        );

        if (authResult.success) {
          await BiometricAuth.setBiometricPreference(true);
          setBiometricEnabled(true);
          Alert.alert(
            "Biometric Enabled",
            "You can now use biometric authentication for secure access"
          );
        } else {
          Alert.alert(
            "Authentication Failed",
            authResult.message ||
              "Failed to authenticate. Biometric authentication was not enabled."
          );
        }
      } else {
        // When disabling biometric, just update the preference
        await BiometricAuth.setBiometricPreference(false);
        setBiometricEnabled(false);
        Alert.alert(
          "Biometric Disabled",
          "Biometric authentication has been disabled"
        );
      }
    } catch (error) {
      console.error("Error toggling biometric authentication:", error);
      Alert.alert(
        "Error",
        "An error occurred while updating biometric settings"
      );
    }
  };

  const settingsSections = [
    {
      title: "Account",
      items: [
        {
          icon: "person-outline",
          title: "Profile Information",
          subtitle: "Update your personal details",
          onPress: () => Alert.alert("Profile", "Navigate to profile screen"),
        },
        {
          icon: "lock-closed-outline",
          title: "Security Settings",
          subtitle: "Change password and security options",
          onPress: () =>
            Alert.alert("Security", "Navigate to security settings"),
        },
        {
          icon: "card-outline",
          title: "Linked Accounts",
          subtitle: "Manage connected bank accounts",
          onPress: () => Alert.alert("Accounts", "Navigate to linked accounts"),
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: "notifications-outline",
          title: "Push Notifications",
          subtitle: "Receive alerts for transactions",
          type: "switch",
          value: notificationsEnabled,
          onValueChange: setNotificationsEnabled,
        },
        {
          icon: "finger-print-outline",
          title: "Biometric Authentication",
          subtitle: "Use Face ID/Touch ID for login",
          type: "switch",
          value: biometricEnabled,
          onValueChange: handleBiometricToggle,
        },
        {
          icon: "moon-outline",
          title: "Dark Mode",
          subtitle: "Switch to dark theme",
          type: "switch",
          value: darkModeEnabled,
          onValueChange: setDarkModeEnabled,
        },
        {
          icon: "language-outline",
          title: "Language",
          subtitle: "English (US)",
          onPress: () =>
            Alert.alert("Language", "Select your preferred language"),
        },
        {
          icon: "cash-outline",
          title: "Currency",
          subtitle: "USD - US Dollar",
          onPress: () =>
            Alert.alert("Currency", "Select your preferred currency"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "help-circle-outline",
          title: "Help & Support",
          subtitle: "Get help with the app",
          onPress: () => Alert.alert("Help", "Contact support team"),
        },
        {
          icon: "document-text-outline",
          title: "Terms & Conditions",
          subtitle: "View our terms of service",
          onPress: () => Alert.alert("Terms", "View terms and conditions"),
        },
        {
          icon: "shield-checkmark-outline",
          title: "Privacy Policy",
          subtitle: "How we protect your data",
          onPress: () => Alert.alert("Privacy", "View privacy policy"),
        },
        {
          icon: "information-circle-outline",
          title: "About",
          subtitle: "App version 1.0.0",
          onPress: () =>
            Alert.alert("About", "BankApp v1.0.0\nBuilt with React Native"),
        },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* User Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>
            {user?.email || "user@example.com"}
          </Text>
        </View>
      </View>

      {/* Settings Sections */}
      {settingsSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionContent}>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.settingItem}
                onPress={item.onPress}
                disabled={item.type === "switch"}
              >
                <View style={styles.settingIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#0100e7" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                {item.type === "switch" ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onValueChange}
                    trackColor={{ false: "#f0f0f0", true: "#0100e7" }}
                    thumbColor="#ffffff"
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert("Export", "Export transaction data")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#28a74520" }]}
            >
              <Ionicons name="download-outline" size={20} color="#28a745" />
            </View>
            <Text style={styles.quickActionText}>Export Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert("Clear", "Clear app cache")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#dc354520" }]}
            >
              <Ionicons name="trash-outline" size={20} color="#dc3545" />
            </View>
            <Text style={styles.quickActionText}>Clear Cache</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => Alert.alert("Feedback", "Send feedback")}
          >
            <View
              style={[styles.quickActionIcon, { backgroundColor: "#17a2b820" }]}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#17a2b8" />
            </View>
            <Text style={styles.quickActionText}>Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#dc3545" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>BankApp v1.0.0</Text>
        <Text style={styles.copyrightText}>
          © 2025 BankApp. All rights reserved.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  profileHeader: {
    backgroundColor: "#ffffff",
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0100e7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#666666",
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666666",
    marginBottom: 12,
    marginHorizontal: 16,
  },
  sectionContent: {
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f8ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#666666",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#333333",
    textAlign: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dc3545",
  },
  logoutText: {
    color: "#dc3545",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: "center",
    padding: 20,
  },
  versionText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: "#999999",
  },
});

export default SettingsScreen;
