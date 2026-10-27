import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Account } from '../types';
import { formatMoney } from '../utils/money';

type Props = {
  account: Account;
  hidden: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

export default function AccountRow({ account, hidden, onEdit, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.name}>{account.name}</Text>
        {account.accountNumber !== '' && (
          <Text style={styles.number}>••••{account.accountNumber}</Text>
        )}
      </View>
      <View style={styles.right}>
        <Text style={styles.balance}>
          {hidden ? '₦••••••' : formatMoney(account.balance)}
        </Text>
        <Pressable onPress={onEdit} hitSlop={8}>
          <Text style={styles.edit}>Edit</Text>
        </Pressable>
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
  right: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  name: { fontSize: 16, color: '#ffffff' },
  number: { fontSize: 12, color: '#6f9aa1', marginTop: 2 },
  balance: { fontSize: 16, color: '#ffffff' },
  edit: { fontSize: 14, color: '#9fc6cc' },
  delete: { fontSize: 14, color: '#ff8a80' },
});
