import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AccountRow from './src/components/AccountRow';
import { Account } from './src/types';
import { formatMoney } from './src/utils/money';

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([
    { id: 1, name: 'Opay', accountNumber: '', balance: 150000 },
    { id: 2, name: 'GTBank', accountNumber: '', balance: 250000 },
    { id: 3, name: 'Kuda', accountNumber: '', balance: 50000 },
    { id: 4, name: 'UBA', accountNumber: '', balance: 70000 },
  ]);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const clearForm = () => {
    setEditingId(null);
    setAccountName('');
    setAccountNumber('');
    setAccountBalance('');
  };

  const saveAccount = () => {
    if (!accountName.trim() || !accountBalance.trim()) {
      alert('Please enter an account name and balance.');
      return;
    }

    const number = accountNumber.trim();

    if (number !== '' && !/^\d{4}$/.test(number)) {
      alert('Account number must be exactly 4 digits, or left blank.');
      return;
    }

    const balance = Number(accountBalance);

    if (!Number.isFinite(balance) || balance < 0) {
      alert('Please enter a valid, non-negative balance.');
      return;
    }

    if (editingId !== null) {
      setAccounts(
        accounts.map((account) =>
          account.id === editingId
            ? {
                ...account,
                name: accountName.trim(),
                accountNumber: number,
                balance,
              }
            : account
        )
      );
    } else {
      const newAccount: Account = {
        id: Date.now(),
        name: accountName.trim(),
        accountNumber: number,
        balance,
      };
      setAccounts([...accounts, newAccount]);
    }

    clearForm();
  };

  const startEdit = (account: Account) => {
    setEditingId(account.id);
    setAccountName(account.name);
    setAccountNumber(account.accountNumber);
    setAccountBalance(String(account.balance));
  };

  const deleteAccount = (id: number) => {
    setAccounts(accounts.filter((account) => account.id !== id));
    if (editingId === id) {
      clearForm();
    }
  };

  const confirmDelete = (account: Account) => {
    const message = `Delete ${account.name}? This cannot be undone.`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        deleteAccount(account.id);
      }
    } else {
      Alert.alert(`Delete ${account.name}?`, 'This cannot be undone.', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAccount(account.id),
        },
      ]);
    }
  };

  const totalAvailable = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  const sortedAccounts = [...accounts].sort(
    (a, b) =>
      a.name.localeCompare(b.name) ||
      a.accountNumber.localeCompare(b.accountNumber)
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>SumWorth</Text>
      <Text style={styles.tagline}>
        Your money. Your worth. One clear picture.
      </Text>

      <Text style={styles.label}>TOTAL AVAILABLE MONEY</Text>
      <Text style={styles.total}>
        {balancesHidden ? '₦••••••' : formatMoney(totalAvailable)}
      </Text>

      <Button
        title={balancesHidden ? 'Show balances' : 'Hide balances'}
        onPress={() => setBalancesHidden(!balancesHidden)}
      />

      <TextInput
        style={styles.input}
        placeholder="Account name (e.g. FirstBank)"
        placeholderTextColor="#6f9aa1"
        value={accountName}
        onChangeText={setAccountName}
      />

      <TextInput
        style={styles.input}
        placeholder="Last 4 digits of account number (optional)"
        placeholderTextColor="#6f9aa1"
        value={accountNumber}
        onChangeText={setAccountNumber}
        keyboardType="numeric"
        maxLength={4}
      />

      <TextInput
        style={styles.input}
        placeholder="Balance (e.g. 100000)"
        placeholderTextColor="#6f9aa1"
        value={accountBalance}
        onChangeText={setAccountBalance}
        keyboardType="numeric"
      />

      <Button
        title={editingId === null ? 'Save Account' : 'Update Account'}
        onPress={saveAccount}
      />

      {editingId !== null && <Button title="Cancel" onPress={clearForm} />}

      <View style={styles.list}>
        {sortedAccounts.map((account) => (
          <AccountRow
            key={account.id}
            account={account}
            hidden={balancesHidden}
            onEdit={() => startEdit(account)}
            onDelete={() => confirmDelete(account)}
          />
        ))}
      </View>

      <StatusBar style="light" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#012e36',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 60,
  },
  heading: { fontSize: 28, fontWeight: '600', color: '#ffffff' },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: '#9fc6cc',
    textAlign: 'center',
  },
  label: {
    marginTop: 40,
    fontSize: 12,
    letterSpacing: 1,
    color: '#9fc6cc',
  },
  total: { marginTop: 4, fontSize: 40, fontWeight: '700', color: '#ffffff' },
  input: {
    width: '100%',
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f4a52',
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 16,
  },
  list: { marginTop: 32, width: '100%' },
});
