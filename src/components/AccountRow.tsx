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
      <View style={styles.top}>
        <View style={styles.nameBlock}>
          <Text style={styles.name} numberOfLines={1}>
            {account.name}
          </Text>
          {account.accountNumber !== '' && (
            <Text style={styles.number}>••••{account.accountNumber}</Text>
          )}
        </View>
        <Text style={styles.balance} numberOfLines={1}>
          {hidden ? '₦••••••' : formatMoney(account.balance)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable onPress={onEdit} hitSlop={8} style={styles.action}>
          <Text style={styles.edit}>Edit</Text>
        </Pressable>
        <Pressable onPress={onDelete} hitSlop={8} style={styles.action}>
          <Text style={styles.delete}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1f4a52',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  nameBlock: { flex: 1 },
  name: { fontSize: 16, color: '#ffffff' },
  number: { fontSize: 12, color: '#6f9aa1', marginTop: 2 },
  balance: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  action: { paddingVertical: 8, paddingLeft: 20 },
  edit: { fontSize: 14, color: '#9fc6cc' },
  delete: { fontSize: 14, color: '#ff8a80' },
});
