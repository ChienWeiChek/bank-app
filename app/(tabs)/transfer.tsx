import { useAccountsStore } from '@/store/account';
import { useTransactionsStore } from '@/store/transaction';
import { Account, Contact } from '@/types';
import { BiometricAuth } from '@/utils/biometricAuth';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
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
} from 'react-native';

const TransferScreen = () => {
  const { accounts, selectedAccount, updateAccountBalance } = useAccountsStore();
  const { contacts, addTransaction } = useTransactionsStore();

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [fromAccount, setFromAccount] = useState<Account | null>(selectedAccount || accounts[0]);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleTransfer = async () => {
    if (!fromAccount) {
      Alert.alert('Error', 'Please select an account to transfer from');
      return;
    }

    if (!recipient) {
      Alert.alert('Error', 'Please enter recipient information');
      return;
    }

    const transferAmount = parseFloat(amount);
    if (!transferAmount || transferAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (transferAmount > fromAccount.balance) {
      Alert.alert('Error', 'Insufficient funds');
      return;
    }

    setLoading(true);

    try {
      // Check if biometric authentication should be used
      const shouldUseBiometric = await BiometricAuth.shouldUseBiometric();
      
      if (shouldUseBiometric) {
        // Authenticate using biometrics
        const authResult = await BiometricAuth.authenticate(
          'Authenticate to complete your transfer'
        );

        if (!authResult.success) {
          setLoading(false);
          Alert.alert(
            'Authentication Failed',
            authResult.message || 'Authentication failed. Please try again.'
          );
          return;
        }
      }

      // Simulate API call after successful authentication
      setTimeout(() => {
        setLoading(false);
        
        // Update account balance
        updateAccountBalance(fromAccount.id, fromAccount.balance - transferAmount);

        // Add transaction to history
        addTransaction({
          id: Date.now().toString(),
          type: 'transfer',
          amount: -transferAmount,
          description: note || `Transfer to ${recipient}`,
          date: new Date().toISOString(),
          status: 'completed',
          fromAccount: fromAccount.id,
          toAccount: 'external',
          recipientName: recipient,
        });

        Alert.alert(
          'Transfer Successful',
          `You have successfully transferred ${formatCurrency(transferAmount)} to ${recipient}`,
          [
            {
              text: 'OK',
              onPress: () => {
                setAmount('');
                setRecipient('');
                setNote('');
              },
            },
          ]
        );
      }, 1000);
    } catch (error) {
      setLoading(false);
      console.error('Transfer error:', error);
      Alert.alert(
        'Transfer Failed',
        'An error occurred while processing your transfer. Please try again.'
      );
    }
  };

  const selectContact = (contact: Contact) => {
    setRecipient(contact.name);
    setShowContactsModal(false);
  };

  const selectAccount = (account: Account) => {
    setFromAccount(account);
    setShowAccountsModal(false);
  };

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
              {fromAccount?.name || 'Select Account'}
            </Text>
            <Text style={styles.accountBalance}>
              Balance: {fromAccount ? formatCurrency(fromAccount.balance) : '$0.00'}
            </Text>
          </View>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Recipient */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recipient</Text>
        <View style={styles.recipientContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter recipient name or phone number"
            value={recipient}
            onChangeText={setRecipient}
          />
          <TouchableOpacity
            style={styles.contactsButton}
            onPress={() => setShowContactsModal(true)}
          >
            <Ionicons name="person-add" size={20} color="#0100e7" />
          </TouchableOpacity>
        </View>
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
        style={[styles.transferButton, loading && styles.transferButtonDisabled]}
        onPress={handleTransfer}
        disabled={loading || !amount || !recipient || !fromAccount}
      >
        <Text style={styles.transferButtonText}>
          {loading ? 'Processing...' : 'Transfer Money'}
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
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{item.name}</Text>
                  <Text style={styles.contactPhone}>{item.phoneNumber}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  accountSelector: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
    color: '#666666',
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  contactsButton: {
    marginLeft: 12,
    padding: 12,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    paddingVertical: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0100e7',
  },
  quickAmountText: {
    color: '#0100e7',
    fontSize: 14,
    fontWeight: '600',
  },
  noteInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  transferButton: {
    backgroundColor: '#0100e7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  transferButtonDisabled: {
    backgroundColor: '#b3b3b3',
  },
  transferButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  securityText: {
    color: '#666666',
    fontSize: 14,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0100e7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  contactPhone: {
    fontSize: 14,
    color: '#666666',
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  accountItemInfo: {
    flex: 1,
  },
  accountItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  accountItemNumber: {
    fontSize: 14,
    color: '#666666',
  },
  accountItemBalance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
});

export default TransferScreen;
