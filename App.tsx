import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import AccountRow from './src/components/AccountRow';
import { Account } from './src/types';
import { formatMoney } from './src/utils/money';

const accounts: Account[] = [
  { id: 1, name: 'Opay', balance: 150000 },
  { id: 2, name: 'GTBank', balance: 250000 },
  { id: 3, name: 'Kuda', balance: 50000 },
  { id: 4, name: 'UBA', balance: 70000 }
];

export default function App() {
  const totalAvailable = accounts.reduce(
    (sum, account) => sum + account.balance,
    0
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>SumWorth</Text>
      <Text style={styles.tagline}>
        Your money. Your worth. One clear picture.
      </Text>

      <Text style={styles.label}>TOTAL AVAILABLE MONEY</Text>
      <Text style={styles.total}>{formatMoney(totalAvailable)}</Text>

      <View style={styles.list}>
        {accounts.map((account) => (
          <AccountRow key={account.id} account={account} />
        ))}
      </View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#012e36',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
  list: { marginTop: 32, width: '100%' },
});
