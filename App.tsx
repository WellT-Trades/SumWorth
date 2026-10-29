import { createAccount, fetchAccounts } from './src/api';
import { useEffect, useState } from 'react';
import { fetchAccounts } from './src/api';
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
  useColorScheme,
  View,
} from 'react-native';
import AccountRow from './src/components/AccountRow';
import { Colors, darkColors, lightColors } from './src/theme';
import { Account } from './src/types';
import { formatMoney } from './src/utils/money';

// Trim, collapse repeated spaces: "  First   Bank " -> "First Bank"
const cleanName = (text: string) => text.trim().replace(/\s+/g, ' ');

export default function App() {
    const [accounts, setAccounts] = useState<Account[]>([]);
    
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountBalance, setAccountBalance] = useState('');
  const [balancesHidden, setBalancesHidden] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');

    const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadAccounts = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setAccounts(await fetchAccounts());
        } catch (e) {
      setLoadError(`Couldn't reach the SumWorth server. (${String(e)})`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // Theme: follow the phone, unless the user has tapped the toggle
  const systemScheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<'light' | 'dark' | null>(
    null
  );
  const scheme = themeOverride ?? systemScheme ?? 'dark';
  const colors = scheme === 'dark' ? darkColors : lightColors;
  const styles = createStyles(colors);

  const clearForm = () => {
    setEditingId(null);
    setAccountName('');
    setAccountNumber('');
    setAccountBalance('');
    setFormError('');
  };

  const saveAccount = async () => {
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
      try {
        const created = await createAccount({
          name,
          accountNumber: number,
          balance,
        });
        setAccounts([...accounts, created]);
      } catch (e) {
        setFormError(
          e instanceof Error ? e.message : 'Could not save the account.'
        );
        return;
      }
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

          <View style={styles.themeRow}>
            <Button
              title={scheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              onPress={() =>
                setThemeOverride(scheme === 'dark' ? 'light' : 'dark')
              }
            />
          </View>

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
            <Text style={[styles.sectionTitle, { marginTop: 0 }]}>
              {editingId === null ? 'Add account' : 'Edit account'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Account name (e.g. FirstBank)"
              placeholderTextColor={colors.textFaint}
              value={accountName}
              onChangeText={(text) => {
                setAccountName(text);
                setFormError('');
              }}
            />

            <TextInput
              style={styles.input}
              placeholder="Last 4 digits of account number"
              placeholderTextColor={colors.textFaint}
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
              placeholderTextColor={colors.textFaint}
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

                    {loading ? (
            <Text style={styles.empty}>Loading accounts...</Text>
          ) : loadError !== '' ? (
            <View>
              <Text style={styles.error}>{loadError}</Text>
              <Button title="Try again" onPress={loadAccounts} />
            </View>
          ) : sortedAccounts.length === 0 ? (
            <Text style={styles.empty}>
              No accounts yet. Add your first one above.
            </Text>
          ) : (
            sortedAccounts.map((account) => (
              <AccountRow
                key={account.id}
                account={account}
                hidden={balancesHidden}
                colors={colors}
                onEdit={() => startEdit(account)}
                onDelete={() => confirmDelete(account)}
              />
            ))
          )}
        </View>

        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.text,
      textAlign: 'center',
    },
    tagline: {
      marginTop: 8,
      fontSize: 16,
      color: colors.textMuted,
      textAlign: 'center',
    },
    themeRow: {
      marginTop: 8,
      alignItems: 'center',
    },
    totalCard: {
      marginTop: 16,
      padding: 20,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    label: {
      fontSize: 12,
      letterSpacing: 1,
      color: colors.textMuted,
    },
    total: {
      marginVertical: 6,
      maxWidth: '100%',
      fontSize: 38,
      fontWeight: '700',
      color: colors.text,
    },
    formCard: {
      marginTop: 20,
      padding: 16,
      borderRadius: 16,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      marginTop: 24,
      marginBottom: 4,
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    input: {
      marginTop: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      color: colors.text,
      fontSize: 16,
    },
    error: {
      marginTop: 12,
      fontSize: 14,
      color: colors.danger,
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
      color: colors.textMuted,
    },
  });
