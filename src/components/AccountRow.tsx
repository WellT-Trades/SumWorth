import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Account } from '../types';
import { formatMoney } from '../utils/money';

type Props = {
  account: Account;
  hidden: boolean;
  onDelete: () => void;
};

export default function AccountRow({ account, hidden, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.name}>{account.name}</Text>
      <View style={styles.right}>
        <Text style={styles.balance}>
          {hidden ? '₦••••••' : formatMoney(account.balance)}
        </Text>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Text style={styles.delete}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f4a52',
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  name: { fontSize: 16, color: '#ffffff' },
  balance: { fontSize: 16, color: '#ffffff' },
  delete: { fontSize: 14, color: '#ff8a80' },
});
