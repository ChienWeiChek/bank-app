import { useTransactions } from "@/hooks/useTransactions";
import { useAccountsStore } from "@/store/account";
import { useAuthStore } from "@/store/auth";
import { Account } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DashboardScreen = () => {
  const { user } = useAuthStore();
  const {
    accounts,

    loading,
    fetchAccounts,
  } = useAccountsStore();

  // Use SWR hook for recent transactions (limit to 5 for dashboard)
  const {
    transactions,
    isLoading: transactionsLoading,
    refresh: refreshTransactions,
  } = useTransactions();
  const [selectedAccount, setSelectedAccount] = useState<Account>();
  const router = useRouter();

  const totalBalance = accounts.reduce(
    (sum: number, account: Account) => sum + account.balance,
    0
  );
  const recentTransactions = transactions.slice(0, 5);

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
  };

  const quickActions = [
    {
      title: "Transfer",
      icon: "swap-horizontal",
      color: "#0100e7",
      onPress: () => router.push("/(tabs)/transfer"),
    },
    {
      title: "Pay Bills",
      icon: "document-text",
      color: "#28a745",
      onPress: () =>
        Alert.alert("Pay Bills", "Navigate to bill payment screen"),
    },
    {
      title: "Deposit",
      icon: "add-circle",
      color: "#17a2b8",
      onPress: () => Alert.alert("Deposit", "Navigate to deposit screen"),
    },
    {
      title: "More",
      icon: "ellipsis-horizontal",
      color: "#6c757d",
      onPress: () => Alert.alert("More", "Show more options"),
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const handleRefresh = () => {
    fetchAccounts();
    refreshTransactions();
  };

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={loading && accounts.length > 0}
          onRefresh={handleRefresh}
          colors={["#0100e7"]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || "User"}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Total Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
        {/* <View style={styles.balanceTrend}>
          <Ionicons name="trending-up" size={16} color="#28a745" />
          <Text style={styles.trendText}>+2.5% from last month</Text>
        </View> */}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickAction}
              onPress={action.onPress}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: action.color }]}
              >
                <Ionicons name={action.icon as any} size={24} color="#ffffff" />
              </View>
              <Text style={styles.actionText}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Accounts Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Accounts</Text>
        <View style={styles.accountsList}>
          {accounts.map((account: Account) => (
            <TouchableOpacity
              key={account.id}
              style={[
                styles.accountCard,
                selectedAccount?.id === account.id &&
                  styles.accountCardSelected,
              ]}
              onPress={() => handleAccountSelect(account)}
            >
              <View style={styles.accountHeader}>
                <View style={styles.accountInfo}>
                  <Text style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountNumber}>{account.number}</Text>
                </View>
                <View style={styles.accountType}>
                  <Text style={styles.accountTypeText}>
                    {account.type.charAt(0).toUpperCase() +
                      account.type.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.accountBalance}>
                {formatCurrency(account.balance)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity
            onPress={() => {
              router.push("/(tabs)/history");
            }}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.transactionsList}>
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction: any) => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Ionicons
                    name={
                      transaction.type === "transfer"
                        ? "swap-horizontal"
                        : transaction.type === "payment"
                        ? "document-text"
                        : transaction.type === "deposit"
                        ? "arrow-down"
                        : "arrow-up"
                    }
                    size={20}
                    color={transaction.amount > 0 ? "#28a745" : "#dc3545"}
                  />
                </View>
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {formatDate(transaction.date)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: transaction.amount > 0 ? "#28a745" : "#dc3545" },
                  ]}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={32} color="#ccc" />
              <Text style={styles.emptyTransactionsText}>
                No recent transactions
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  date: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  notificationButton: {
    padding: 8,
  },
  balanceCard: {
    backgroundColor: "#0100e7",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    color: "#ffffff",
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  balanceTrend: {
    flexDirection: "row",
    alignItems: "center",
  },
  trendText: {
    color: "#ffffff",
    fontSize: 14,
    opacity: 0.9,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  seeAllText: {
    color: "#0100e7",
    fontSize: 14,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickAction: {
    alignItems: "center",
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: "#333333",
    textAlign: "center",
  },
  accountsList: {
    gap: 12,
  },
  accountCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  accountCardSelected: {
    borderColor: "#0100e7",
  },
  accountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
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
  accountNumber: {
    fontSize: 14,
    color: "#666666",
  },
  accountType: {
    backgroundColor: "#f0f8ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  accountTypeText: {
    fontSize: 12,
    color: "#0100e7",
    fontWeight: "600",
  },
  accountBalance: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  transactionsList: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    minHeight: 100,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: "#666666",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyTransactions: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTransactionsText: {
    marginTop: 8,
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
});

export default DashboardScreen;
