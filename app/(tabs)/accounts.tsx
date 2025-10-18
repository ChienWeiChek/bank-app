import { useAccountsStore } from '@/store/account';
import { Account } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const AccountsScreen = () => {
  const { accounts, selectedAccount, setSelectedAccount } = useAccountsStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return { name: 'wallet-outline', color: '#0100e7' };
      case 'savings':
        return { name: 'cash-outline', color: '#28a745' };
      case 'credit':
        return { name: 'card-outline', color: '#dc3545' };
      default:
        return { name: 'help-circle-outline', color: '#6c757d' };
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking':
        return 'Checking Account';
      case 'savings':
        return 'Savings Account';
      case 'credit':
        return 'Credit Card';
      default:
        return 'Account';
    }
  };

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
  };

  const totalBalance = accounts.reduce((sum: number, account: Account) => sum + account.balance, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Total Balance */}
      <View style={styles.totalBalanceCard}>
        <Text style={styles.totalBalanceLabel}>Total Balance</Text>
        <Text style={styles.totalBalanceAmount}>{formatCurrency(totalBalance)}</Text>
        <View style={styles.balanceTrend}>
          <Ionicons name="trending-up" size={16} color="#28a745" />
          <Text style={styles.trendText}>Overall account summary</Text>
        </View>
      </View>

      {/* Accounts List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Accounts</Text>
        <View style={styles.accountsList}>
          {accounts.map((account: Account) => {
            const icon = getAccountIcon(account.type);
            const isSelected = selectedAccount?.id === account.id;
            
            return (
              <TouchableOpacity
                key={account.id}
                style={[
                  styles.accountCard,
                  isSelected && styles.accountCardSelected,
                ]}
                onPress={() => handleAccountSelect(account)}
              >
                <View style={styles.accountHeader}>
                  <View style={styles.accountIcon}>
                    <Ionicons name={icon.name as any} size={24} color={icon.color} />
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{account.name}</Text>
                    <Text style={styles.accountType}>
                      {getAccountTypeLabel(account.type)}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.selectedIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color="#0100e7" />
                    </View>
                  )}
                </View>
                
                <View style={styles.accountDetails}>
                  <View style={styles.accountNumberContainer}>
                    <Text style={styles.accountNumberLabel}>Account Number</Text>
                    <Text style={styles.accountNumber}>{account.number}</Text>
                  </View>
                  <Text style={styles.accountBalance}>
                    {formatCurrency(account.balance)}
                  </Text>
                </View>

                {/* Quick Actions */}
                <View style={styles.accountActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="arrow-up" size={16} color="#0100e7" />
                    <Text style={styles.actionText}>Transfer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="arrow-down" size={16} color="#28a745" />
                    <Text style={styles.actionText}>Deposit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="document-text" size={16} color="#6c757d" />
                    <Text style={styles.actionText}>Details</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Account Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Account Summary</Text>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Ionicons name="wallet-outline" size={24} color="#0100e7" />
            <Text style={styles.summaryAmount}>
              {formatCurrency(accounts.find((acc: Account) => acc.type === 'checking')?.balance || 0)}
            </Text>
            <Text style={styles.summaryLabel}>Checking</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="cash-outline" size={24} color="#28a745" />
            <Text style={styles.summaryAmount}>
              {formatCurrency(accounts.find((acc: Account) => acc.type === 'savings')?.balance || 0)}
            </Text>
            <Text style={styles.summaryLabel}>Savings</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="card-outline" size={24} color="#dc3545" />
            <Text style={styles.summaryAmount}>
              {formatCurrency(accounts.find((acc: Account) => acc.type === 'credit')?.balance || 0)}
            </Text>
            <Text style={styles.summaryLabel}>Credit</Text>
          </View>
        </View>
      </View>

      {/* Add Account Button */}
      <TouchableOpacity style={styles.addAccountButton}>
        <Ionicons name="add-circle" size={24} color="#0100e7" />
        <Text style={styles.addAccountText}>Add New Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  totalBalanceCard: {
    backgroundColor: '#0100e7',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  totalBalanceLabel: {
    color: '#ffffff',
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 8,
  },
  totalBalanceAmount: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  balanceTrend: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.9,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  accountsList: {
    gap: 16,
  },
  accountCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  accountCardSelected: {
    borderColor: '#0100e7',
    backgroundColor: '#f0f8ff',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  accountType: {
    fontSize: 14,
    color: '#666666',
  },
  selectedIndicator: {
    padding: 4,
  },
  accountDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  accountNumberContainer: {
    flex: 1,
  },
  accountNumberLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  accountBalance: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  accountActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666666',
  },
  addAccountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  addAccountText: {
    color: '#0100e7',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default AccountsScreen;
