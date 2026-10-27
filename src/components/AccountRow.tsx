import { StyleSheet, Text, View } from 'react-native';
import { Account } from '../types';
import { formatMoney } from '../utils/money';

type Props = {
  account: Account;
  hidden: boolean;
};

export default function AccountRow({ account, hidden }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{account.name}</Text>
      <Text style={styles.balance}>
        {hidden ? '₦••••••' : formatMoney(account.balance)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f4a52',
  },
  name: { fontSize: 16, color: '#ffffff' },
  balance: { fontSize: 16, color: '#ffffff' },
});
