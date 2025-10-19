import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TransferStatus = "success" | "insufficient_funds" | "account_not_found" | "validation_error" | "network_error";

const TransferStatusScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { status, message, amount, recipient, transactionId } = params;

  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: "checkmark-circle",
          color: "#28a745",
          title: "Transfer Successful",
          message: message || `You have successfully transferred $${amount} to ${recipient}`,
        };
      case "insufficient_funds":
        return {
          icon: "warning",
          color: "#dc3545",
          title: "Insufficient Funds",
          message: message || "Your account does not have sufficient funds to complete this transfer.",
        };
      case "account_not_found":
        return {
          icon: "search",
          color: "#ffc107",
          title: "Account Not Found",
          message: message || "The recipient account was not found. Please check the account number and try again.",
        };
      case "validation_error":
        return {
          icon: "alert-circle",
          color: "#ffc107",
          title: "Validation Error",
          message: message || "Please check your input and try again.",
        };
      case "network_error":
        return {
          icon: "cloud-offline",
          color: "#6c757d",
          title: "Network Error",
          message: message || "Unable to connect to the server. Please check your internet connection and try again.",
        };
      default:
        return {
          icon: "help-circle",
          color: "#6c757d",
          title: "Unknown Status",
          message: message || "An unknown error occurred.",
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleOk = () => {
    // Navigate back to transfer screen
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons 
          name={statusConfig.icon as any} 
          size={80} 
          color={statusConfig.color} 
          style={styles.icon}
        />
        
        <Text style={styles.title}>{statusConfig.title}</Text>
        
        <Text style={styles.message}>{statusConfig.message}</Text>
        
        {transactionId && (
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionLabel}>Transaction ID:</Text>
            <Text style={styles.transactionId}>{transactionId}</Text>
          </View>
        )}
        
        {status === "success" && (
          <View style={styles.successDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>${amount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Recipient:</Text>
              <Text style={styles.detailValue}>{recipient}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, styles.statusCompleted]}>Completed</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.okButton} onPress={handleOk}>
        <Text style={styles.okButtonText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 24,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  transactionInfo: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 24,
    alignSelf: "stretch",
  },
  transactionLabel: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  transactionId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    fontFamily: "monospace",
  },
  successDetails: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignSelf: "stretch",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "600",
  },
  statusCompleted: {
    color: "#28a745",
  },
  okButton: {
    backgroundColor: "#0100e7",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  okButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default TransferStatusScreen;
