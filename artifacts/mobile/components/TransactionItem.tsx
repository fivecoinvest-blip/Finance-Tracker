import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/constants/colors';
import type { Transaction } from '@/context/FinanceContext';
import { useFinance } from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export function TransactionItem({ transaction, onPress }: TransactionItemProps) {
  const Colors = useColors();
  const { getWalletById, deleteTransaction } = useFinance();
  const wallet = getWalletById(transaction.walletId);
  const iconName = CATEGORY_ICONS[transaction.category] ?? 'category';
  const iconColor = CATEGORY_COLORS[transaction.category] ?? Colors.textSecondary;

  const amountColor = transaction.type === 'income' ? Colors.income
    : transaction.type === 'transfer' ? Colors.transfer
    : Colors.expense;
  const amountSign = transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '↔' : '-';

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Transaction',
      'Remove this transaction? This will reverse the balance change.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            await deleteTransaction(transaction.id);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors.card }]}>
      <TouchableOpacity style={styles.mainArea} onPress={onPress} activeOpacity={0.75}>
        <View style={[styles.iconBg, { backgroundColor: iconColor + '18' }]}>
          <MaterialIcons name={iconName as any} size={22} color={iconColor} />
        </View>
        <View style={styles.info}>
          <Text style={[styles.category, { color: Colors.textPrimary }]}>{transaction.category}</Text>
          <Text style={[styles.description, { color: Colors.textMuted }]} numberOfLines={1}>
            {transaction.description || wallet?.name || 'No description'}
          </Text>
        </View>
        <View style={styles.rightSide}>
          <Text style={[styles.amount, { color: amountColor }]}>
            {amountSign}₱{transaction.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.date, { color: Colors.textMuted }]}>{formatDate(transaction.date)}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.deleteBtn, { backgroundColor: Colors.danger + '15' }]}
        onPress={handleDelete}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  mainArea: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingLeft: 16, paddingRight: 8,
  },
  iconBg: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  category: { fontSize: 14, fontWeight: '600' as const },
  description: { fontSize: 12, marginTop: 2 },
  rightSide: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700' as const },
  date: { fontSize: 11, marginTop: 2 },
  deleteBtn: {
    width: 44, alignSelf: 'stretch',
    justifyContent: 'center', alignItems: 'center',
  },
});
