import { useTransactionsStore } from "@/store/transaction";
import { Transaction, TRANSACTION_STATUS, TRANSACTION_TYPE } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const HistoryScreen = () => {
  const { 
    transactions, 
    loading, 
    error, 
    refreshing,
    loadingMore,
    pagination,
    fetchTransactions, 
    refreshTransactions, 
    loadMoreTransactions 
  } = useTransactionsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TRANSACTION_TYPE>(
    TRANSACTION_TYPE.ALL
  );
  const [filterStatus, setFilterStatus] = useState<TRANSACTION_STATUS>(
    TRANSACTION_STATUS.ALL
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleRefresh = () => {
    refreshTransactions();
  };

  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      loadMoreTransactions();
    }
  };

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
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string, amount: number) => {
    switch (type) {
      case "transfer":
        return {
          name: "swap-horizontal",
          color: amount > 0 ? "#28a745" : "#dc3545",
        };
      case "payment":
        return { name: "document-text", color: "#ffc107" };
      case "deposit":
        return { name: "arrow-down", color: "#28a745" };
      case "withdrawal":
        return { name: "arrow-up", color: "#dc3545" };
      default:
        return { name: "help-circle", color: "#6c757d" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#28a745";
      case "pending":
        return "#ffc107";
      case "failed":
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };

  const filteredTransactions = transactions.filter(
    (transaction: Transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (transaction.recipientName &&
          transaction.recipientName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));
      const matchesType =
        filterType === "all" || transaction.type === filterType;
      const matchesStatus =
        filterStatus === "all" || transaction.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    }
  );

  const filterButtons = [
    { key: "all", label: "All" },
    { key: "transfer", label: "Transfers" },
    { key: "payment", label: "Payments" },
    { key: "deposit", label: "Deposits" },
  ];

  const statusButtons = [
    { key: "all", label: "All Status" },
    { key: "completed", label: "Completed" },
    { key: "pending", label: "Pending" },
    { key: "failed", label: "Failed" },
  ];

  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const icon = getTransactionIcon(item.type, item.amount);
    const statusColor = getStatusColor(item.status);

    return (
      <TouchableOpacity style={styles.transactionItem}>
        <View style={styles.transactionIcon}>
          <Ionicons name={icon.name as any} size={20} color={icon.color} />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription}>{item.description}</Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionDate}>
              {formatDate(item.date)} • {formatTime(item.date)}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusColor}20` },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>
        <Text
          style={[
            styles.transactionAmount,
            { color: item.amount > 0 ? "#28a745" : "#dc3545" },
          ]}
        >
          {item.amount > 0 ? "+" : ""}
          {formatCurrency(item.amount)}
        </Text>
      </TouchableOpacity>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0100e7" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#dc3545" />
        <Text style={styles.errorTitle}>Failed to load transactions</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchTransactions}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search transactions..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Type Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filterButtons.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              filterType === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilterType(filter.key as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterType === filter.key && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {statusButtons.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              filterStatus === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(filter.key as any)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === filter.key && styles.filterButtonTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transaction List Container */}
      <View style={styles.transactionListContainer}>
        {filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransactionItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.transactionsList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={["#0100e7"]}
                tintColor="#0100e7"
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#0100e7" />
                  <Text style={styles.loadingMoreText}>Loading more...</Text>
                </View>
              ) : pagination.hasMore ? (
                <View style={styles.loadMoreHint}>
                  <Text style={styles.loadMoreHintText}>Pull up to load more</Text>
                </View>
              ) : filteredTransactions.length > 10 ? (
                <View style={styles.endOfList}>
                  <Text style={styles.endOfListText}>No more transactions</Text>
                </View>
              ) : null
            }
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No transactions found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery || filterType !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Your transaction history will appear here"}
            </Text>
          </View>
        )}
      </View>

      {/* Summary */}
      {filteredTransactions.length > 0 && (
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            Showing {filteredTransactions.length} of {pagination.total}{" "}
            transactions
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "#0100e7",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#333333",
  },
  filterContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filterContent: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 8,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#0100e7",
    borderColor: "#0100e7",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#ffffff",
  },
  transactionListContainer: {
    flex: 99999,
  },
  transactionsList: {
    padding: 16,
  },
  loadingMoreContainer: {
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666666",
  },
  loadMoreHint: {
    padding: 16,
    alignItems: "center",
  },
  loadMoreHintText: {
    fontSize: 14,
    color: "#999999",
    fontStyle: "italic",
  },
  endOfList: {
    padding: 16,
    alignItems: "center",
  },
  endOfListText: {
    fontSize: 14,
    color: "#999999",
    fontStyle: "italic",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f0f0f0",
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
    fontWeight: "600",
    color: "#333333",
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  transactionDate: {
    fontSize: 14,
    color: "#666666",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
  },
  summary: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "#ffffff",
  },
  summaryText: {
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
});

export default HistoryScreen;
