import { apiService } from "@/services/api";
import { useAccountsStore } from "@/store/account";
import { Account, Contact, Recipient } from "@/types";
import { BiometricAuth } from "@/utils/biometricAuth";
import { ContactService } from "@/utils/contacts";
import { TransferHistoryService } from "@/utils/transferHistory";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type TransferMethod = "bank" | "duitnow";

const TransferScreen = () => {
  const router = useRouter();
  const { accounts, refreshAccountBalance } = useAccountsStore();

  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState<Recipient | null>();
  const [recipientAccountNumber, setRecipientAccountNumber] = useState("");
  const [note, setNote] = useState("");
  const [fromAccount, setFromAccount] = useState<Account>(accounts[0]);
  const [transferMethod, setTransferMethod] =
    useState<TransferMethod>("duitnow");
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");
  const [lastTransferAmounts, setLastTransferAmounts] = useState<
    Record<string, number>
  >({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Validate account number format (basic validation)
  const validateAccountNumber = (accountNumber: string): boolean => {
    // Basic validation: numbers only, 8-20 characters
    const accountNumberRegex = /^\d{8,20}$/;
    return accountNumberRegex.test(accountNumber);
  };

  // Load last transfer amounts for contacts
  const loadLastTransferAmounts = async () => {
    try {
      const history = await TransferHistoryService.getTransferHistory();
      const amounts: Record<string, number> = {};
      history.forEach((item) => {
        amounts[item.contactId] = item.lastAmount;
      });
      setLastTransferAmounts(amounts);
    } catch (error) {
      console.error("Error loading last transfer amounts:", error);
    }
  };

  const handleTransfer = async () => {
    if (!fromAccount) {
      Alert.alert("Error", "Please select an account to transfer from");
      return;
    }

    if (transferMethod === "bank" && !recipientAccountNumber) {
      Alert.alert("Error", "Please enter recipient account number");
      return;
    }

    if (transferMethod === "duitnow" && !recipient) {
      Alert.alert("Error", "Please select a recipient");
      return;
    }

    const transferAmount = parseFloat(amount);
    if (!transferAmount || transferAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    if (transferAmount > fromAccount.balance) {
      Alert.alert("Error", "Insufficient funds");
      return;
    }

    if (
      transferMethod === "bank" &&
      !validateAccountNumber(recipientAccountNumber)
    ) {
      Alert.alert("Error", "Please enter a valid account number (8-20 digits)");
      return;
    }

    setLoading(true);

    try {
      // Check if biometric authentication should be used
      const shouldUseBiometric = await BiometricAuth.shouldUseBiometric();

      if (shouldUseBiometric) {
        // Authenticate using biometrics
        const authResult = await BiometricAuth.authenticate(
          "Authenticate to complete your transfer"
        );

        if (!authResult.success) {
          setLoading(false);
          Alert.alert(
            "Authentication Failed",
            authResult.message || "Authentication failed. Please try again."
          );
          return;
        }
      } else {
        // Show password modal for re-authentication
        setShowPasswordModal(true);
        setLoading(false);
        return;
      }

      // Proceed with transfer after successful authentication
      await processTransfer();
    } catch (error) {
      setLoading(false);
      console.error("Authentication error:", error);
      Alert.alert(
        "Authentication Failed",
        "An error occurred during authentication. Please try again."
      );
    }
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    setShowPasswordModal(false);
    setLoading(true);

    try {
      // Here you would validate the password against the backend
      // For now, we'll simulate password validation
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Proceed with transfer after successful password authentication
      await processTransfer();
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Authentication Failed",
        "Invalid password. Please try again."
      );
    } finally {
      setPassword("");
    }
  };

  const processTransfer = async () => {
    try {
      const transferAmount = parseFloat(amount);

      // Prepare transfer data
      const transferData = {
        fromAccountId: fromAccount!.id,
        toAccountId:
          transferMethod === "bank"
            ? recipientAccountNumber
            : recipient?.phoneNumber,
        amount: transferAmount,
        description:
          note ||
          `Transfer to ${
            transferMethod === "bank"
              ? "account"
              : recipient?.name ?? recipient?.phoneNumber
          }`,
        recipientName: recipient?.name ?? recipient?.phoneNumber,
      };

      // Make API call to backend
      const response = await apiService.request<any>(
        "/api/transactions/transfer",
        {
          method: "POST",
          body: JSON.stringify(transferData),
        }
      );

      if (response.success && response.data) {
        // Refresh account balance from backend to ensure data consistency
        const data = await refreshAccountBalance(fromAccount!.id);
        if (data) setFromAccount((prev) => ({ ...prev, balance: data }));

        // Save transfer history if recipient is from contacts
        if (transferMethod === "duitnow" && recipient && "id" in recipient) {
          const contact = recipient as Contact;
          await TransferHistoryService.saveLastTransfer(
            contact.id,
            contact.name,
            contact.phoneNumber,
            transferAmount
          );
          await loadLastTransferAmounts(); // Refresh the amounts
        }

        // Navigate to success screen
        router.push({
          pathname: "../transfer-status",
          params: {
            status: "success",
            amount: transferAmount.toString(),
            recipient: recipient?.name,
            transactionId: response.data.transaction?.id || "N/A",
          },
        });

        // Clear form
        setAmount("");
        setRecipient(null);
        setRecipientAccountNumber("");
        setNote("");
      } else {
        // Handle different error types
        let status: string = "network_error";
        let message = response.error || "Transfer failed. Please try again.";

        if (response.status === 400) {
          if (response.error?.includes("INSUFFICIENT_FUNDS")) {
            status = "insufficient_funds";
          } else if (response.error?.includes("ACCOUNT_NOT_FOUND")) {
            status = "account_not_found";
          } else if (response.error?.includes("VALIDATION_ERROR")) {
            status = "validation_error";
          }
        }

        router.push({
          pathname: "../transfer-status",
          params: {
            status,
            message,
          },
        });
      }
    } catch (error) {
      console.error("Transfer error:", error);
      router.push({
        pathname: "../transfer-status",
        params: {
          status: "network_error",
          message: "Network error. Please check your connection.",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const selectContact = (contact: Contact) => {
    setRecipient(contact);
    setShowContactsModal(false);

    // Auto-fill amount if this contact has a last transfer amount
    const lastAmount = lastTransferAmounts[contact.id];
    if (lastAmount) {
      setAmount(lastAmount.toString());
    }
  };

  const selectAccount = (account: Account) => {
    setFromAccount(account);
    setShowAccountsModal(false);
  };

  const loadContacts = async () => {
    setContactsLoading(true);
    try {
      const deviceContacts = await ContactService.getContacts();
      setContacts(deviceContacts);
      await loadLastTransferAmounts(); // Load last transfer amounts when contacts are loaded
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setContactsLoading(false);
    }
  };

  useEffect(() => {
    if (showContactsModal) {
      loadContacts();
    }
  }, [showContactsModal]);

  const quickAmounts = [10, 50, 100, 200, 500];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* From Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>From Account</Text>
        <TouchableOpacity
          style={styles.accountSelector}
          onPress={() => setShowAccountsModal(true)}
        >
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>
              {fromAccount?.name || "Select Account"}
            </Text>
            <Text style={styles.accountBalance}>
              Balance:{" "}
              {fromAccount ? formatCurrency(fromAccount.balance) : "$0.00"}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Transfer Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transfer Method</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[
              styles.radioButton,
              transferMethod === "duitnow" && styles.radioButtonSelected,
            ]}
            onPress={() => setTransferMethod("duitnow")}
          >
            <View
              style={[
                styles.radioCircle,
                transferMethod === "duitnow" && styles.radioCircleSelected,
              ]}
            >
              {transferMethod === "duitnow" && (
                <View style={styles.radioInnerCircle} />
              )}
            </View>
            <Text style={styles.radioLabel}>DuitNow</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.radioButton,
              transferMethod === "bank" && styles.radioButtonSelected,
            ]}
            onPress={() => setTransferMethod("bank")}
          >
            <View
              style={[
                styles.radioCircle,
                transferMethod === "bank" && styles.radioCircleSelected,
              ]}
            >
              {transferMethod === "bank" && (
                <View style={styles.radioInnerCircle} />
              )}
            </View>
            <Text style={styles.radioLabel}>Via Bank</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipient - Conditional based on transfer method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {transferMethod === "bank" ? "Recipient Account Number" : "Recipient"}
        </Text>

        {transferMethod === "bank" ? (
          <TextInput
            style={styles.input}
            placeholder="Enter account number (8-20 digits)"
            value={recipientAccountNumber}
            onChangeText={setRecipientAccountNumber}
            keyboardType="numeric"
            maxLength={20}
          />
        ) : (
          <View style={styles.recipientContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter recipient name or phone number"
              value={recipient?.name ?? recipient?.phoneNumber}
              onChangeText={(text) => {
                setRecipient({ phoneNumber: text });
              }}
            />
            <TouchableOpacity
              style={styles.contactsButton}
              onPress={() => setShowContactsModal(true)}
            >
              <Ionicons name="person-add" size={20} color="#0100e7" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Amount */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amount</Text>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Quick Amounts */}
        <View style={styles.quickAmounts}>
          {quickAmounts.map((quickAmount) => (
            <TouchableOpacity
              key={quickAmount}
              style={styles.quickAmountButton}
              onPress={() => setAmount(quickAmount.toString())}
            >
              <Text style={styles.quickAmountText}>
                {formatCurrency(quickAmount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Note */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Note (Optional)</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Add a note for this transfer"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Transfer Button */}
      <TouchableOpacity
        style={[
          styles.transferButton,
          loading && styles.transferButtonDisabled,
        ]}
        onPress={handleTransfer}
        disabled={
          loading ||
          !amount ||
          !fromAccount ||
          (transferMethod === "bank" ? !recipientAccountNumber : !recipient)
        }
      >
        <Text style={styles.transferButtonText}>
          {loading ? "Processing..." : "Transfer Money"}
        </Text>
      </TouchableOpacity>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Ionicons name="shield-checkmark" size={20} color="#28a745" />
        <Text style={styles.securityText}>
          Your transfer is secured with bank-level encryption
        </Text>
      </View>

      {/* Contacts Modal */}
      <Modal
        visible={showContactsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Contact</Text>
            <TouchableOpacity onPress={() => setShowContactsModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          {contactsLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading contacts...</Text>
            </View>
          ) : contacts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No contacts found</Text>
              <Text style={styles.emptySubtext}>
                Make sure you have granted contacts permission
              </Text>
            </View>
          ) : (
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.contactItem}
                  onPress={() => selectContact(item)}
                >
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>
                      {item?.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{item.name}</Text>
                    <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                    {lastTransferAmounts[item.id] && (
                      <Text style={styles.lastTransferText}>
                        Last transfer:{" "}
                        {formatCurrency(lastTransferAmounts[item.id])}
                      </Text>
                    )}
                    {item.email && (
                      <Text style={styles.contactEmail}>{item.email}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </Modal>

      {/* Accounts Modal */}
      <Modal
        visible={showAccountsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Account</Text>
            <TouchableOpacity onPress={() => setShowAccountsModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={accounts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.accountItem}
                onPress={() => selectAccount(item)}
              >
                <View style={styles.accountItemInfo}>
                  <Text style={styles.accountItemName}>{item.name}</Text>
                  <Text style={styles.accountItemNumber}>{item.number}</Text>
                </View>
                <Text style={styles.accountItemBalance}>
                  {formatCurrency(item.balance)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* Password Modal */}
      <Modal
        visible={showPasswordModal}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.passwordModalContainer}>
          <View style={styles.passwordModalContent}>
            <Text style={styles.passwordModalTitle}>Enter Password</Text>
            <Text style={styles.passwordModalSubtitle}>
              Please enter your password to confirm this transfer
            </Text>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoFocus
            />
            <View style={styles.passwordModalButtons}>
              <TouchableOpacity
                style={[styles.passwordButton, styles.passwordButtonCancel]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                }}
              >
                <Text style={styles.passwordButtonCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.passwordButton, styles.passwordButtonSubmit]}
                onPress={handlePasswordSubmit}
                disabled={!password}
              >
                <Text style={styles.passwordButtonSubmitText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 12,
  },
  accountSelector: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
    color: "#666666",
  },
  radioGroup: {
    flexDirection: "row",
    gap: 16,
  },
  radioButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    flex: 1,
  },
  radioButtonSelected: {
    borderColor: "#0100e7",
    backgroundColor: "#f0f8ff",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ccc",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    borderColor: "#0100e7",
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0100e7",
  },
  radioLabel: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  recipientContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333333",
    flex: 1,
  },
  contactsButton: {
    marginLeft: 12,
    padding: 12,
    backgroundColor: "#f0f8ff",
    borderRadius: 12,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    paddingVertical: 16,
  },
  quickAmounts: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0100e7",
  },
  quickAmountText: {
    color: "#0100e7",
    fontSize: 14,
    fontWeight: "600",
  },
  noteInput: {
    height: 80,
    textAlignVertical: "top",
  },
  transferButton: {
    backgroundColor: "#0100e7",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  transferButtonDisabled: {
    backgroundColor: "#b3b3b3",
  },
  transferButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  securityText: {
    color: "#666666",
    fontSize: 14,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666666",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999999",
    textAlign: "center",
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0100e7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactAvatarText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: "#666666",
  },
  lastTransferText: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "500",
    marginTop: 2,
  },
  contactEmail: {
    fontSize: 12,
    color: "#999999",
    marginTop: 2,
  },
  accountItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  accountItemInfo: {
    flex: 1,
  },
  accountItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  accountItemNumber: {
    fontSize: 14,
    color: "#666666",
  },
  accountItemBalance: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  passwordModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  passwordModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  passwordModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    textAlign: "center",
  },
  passwordModalSubtitle: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 24,
    textAlign: "center",
  },
  passwordInput: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#333333",
    marginBottom: 24,
  },
  passwordModalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  passwordButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  passwordButtonCancel: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  passwordButtonSubmit: {
    backgroundColor: "#0100e7",
  },
  passwordButtonCancelText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "600",
  },
  passwordButtonSubmitText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default TransferScreen;
