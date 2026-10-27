import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AccountRow from './src/components/AccountRow';
import { Account } from './src/types';
import { formatMoney } from './src/utils/money';

// Trim, collapse repeated spaces: "  First   Bank " -> "First Bank"
const cleanName = (text: string) => text.trim().replace(/\s+/g, ' ');

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>([
    { id: 1, name: 'Opay', accountNumber: '1111', balance: 150000 },
    { id: 2, name: 'GTBank', accountNumber: '2222', balance: 250000 },
    { id: 3, name: 'Kuda', accountNumber: '3333', balance: 50000 },
    { id: 4, name: 'UBA', accountNumber: '4444', balance: 70000 },
  ]);
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');

  const clearForm = () => {
    setEditingId(null);
    setAccountName('');
    setAccountNumber('');
    setAccountBalance('');
    setFormError('');
  };

  const saveAccount = () => {
    const name = cleanName(accountName);
    const number = accountNumber.trim();

    if (!name || !accountBalance.trim()) {
      setFormError('Please enter an account name and balance.');
      return;
    }

    if (!/^\d{4}$/.test(number)) {
      setFormError('Please enter the last 4 digits of the account number.');
      return;
    }

    const balance = Number(accountBalance);

    if (!Number.isFinite(balance) || balance < 0) {
      setFormError('Please enter a valid, non-negative balance.');
      return;
    }

    const isDuplicate = accounts.some(
      (account) =>
        account.id !== editingId &&
        account.name.toLowerCase() === name.toLowerCase() &&
        account.accountNumber === number
    );

    if (isDuplicate) {
      setFormError('You already have an account with this name and number.');
      return;
    }

    if (editingId !== null) {
      setAccounts(
        accounts.map((account) =>
          account.id === editingId
            ? { ...account, name, accountNumber: number, balance }
            : account
        )
      );
    } else {
      const newAccount: Account = {
        id: Date.now(),
        name,
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
    setFormError('');
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
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.content}>
          <Text style={styles.heading}>SumWorth</Text>
          <Text style={styles.tagline}>
            Your money. Your worth. One clear picture.
          </Text>

          <View style={styles.totalCard}>
            <Text style={styles.label}>TOTAL AVAILABLE MONEY</Text>
            <Text
              style={styles.total}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {balancesHidden ? '₦••••••' : formatMoney(totalAvailable)}
            </Text>
            <Button
              title={balancesHidden ? 'Show balances' : 'Hide balances'}
              onPress={() => setBalancesHidden(!balancesHidden)}
            />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>
              {editingId === null ? 'Add account' : 'Edit account'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Account name (e.g. FirstBank)"
              placeholderTextColor="#6f9aa1"
              value={accountName}
              onChangeText={(text) => {
                setAccountName(text);
                setFormError('');
              }}
            />

            <TextInput
              style={styles.input}
              placeholder="Last 4 digits of account number"
              placeholderTextColor="#6f9aa1"
              value={accountNumber}
              onChangeText={(text) => {
                setAccountNumber(text);
                setFormError('');
              }}
              keyboardType="numeric"
              maxLength={4}
            />

            <TextInput
              style={styles.input}
              placeholder="Balance (e.g. 100000)"
              placeholderTextColor="#6f9aa1"
              value={accountBalance}
              onChangeText={(text) => {
                setAccountBalance(text);
                setFormError('');
              }}
              keyboardType="numeric"
            />

            {formError !== '' && <Text style={styles.error}>{formError}</Text>}

            <View style={styles.buttonRow}>
              <Button
                title={editingId === null ? 'Save Account' : 'Update Account'}
                onPress={saveAccount}
              />
              {editingId !== null && (
                <Button title="Cancel" onPress={clearForm} />
              )}
            </View>
          </View>

          <Text style={styles.sectionTitle}>My accounts</Text>

          {sortedAccounts.length === 0 ? (
            <Text style={styles.empty}>
              No accounts yet. Add your first one above.
            </Text>
          ) : (
            sortedAccounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                hidden={balancesHidden}
                onEdit={() => startEdit(account)}
                onDelete={() => confirmDelete(account)}
              />
            ))
          )}
        </View>

        <StatusBar style="light" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#012e36',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
  },
  content: {
    width: '100%',
    maxWidth: 480,
  },
  heading: {
    fontSize: 28,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: '#9fc6cc',
    textAlign: 'center',
  },
  totalCard: {
    marginTop: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#0a3d47',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    letterSpacing: 1,
    color: '#9fc6cc',
  },
  total: {
    marginVertical: 6,
    maxWidth: '100%',
    fontSize: 38,
    fontWeight: '700',
    color: '#ffffff',
  },
  formCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#0a3d47',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  input: {
    marginTop: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1f4a52',
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 16,
  },
  error: {
    marginTop: 12,
    fontSize: 14,
    color: '#ff8a80',
  },
  buttonRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  empty: {
    marginTop: 12,
    fontSize: 14,
    color: '#9fc6cc',
  },
});
