import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_COLORS, CATEGORY_ICONS, Colors } from '@/constants/colors';
import type { Transaction } from '@/context/FinanceContext';
import { useFinance } from '@/context/FinanceContext';

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
  const { getWalletById } = useFinance();
  const wallet = getWalletById(transaction.walletId);
  const iconName = CATEGORY_ICONS[transaction.category] ?? 'category';
  const iconColor = CATEGORY_COLORS[transaction.category] ?? Colors.textSecondary;

  const amountColor = transaction.type === 'income' ? Colors.income
    : transaction.type === 'transfer' ? Colors.transfer
    : Colors.expense;
  const amountSign = transaction.type === 'income' ? '+' : transaction.type === 'transfer' ? '↔' : '-';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconBg, { backgroundColor: iconColor + '20' }]}>
        <MaterialIcons name={iconName as any} size={22} color={iconColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{transaction.category}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {transaction.description || wallet?.name || 'No description'}
        </Text>
      </View>
      <View style={styles.rightSide}>
        <Text style={[styles.amount, { color: amountColor }]}>
          {amountSign}₱{transaction.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={styles.date}>{formatDate(transaction.date)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 16,
    backgroundColor: Colors.card, borderRadius: 14,
    marginBottom: 8,
  },
  iconBg: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1, marginLeft: 12 },
  category: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' as const },
  description: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  rightSide: { alignItems: 'flex-end' },
  amount: { fontSize: 15, fontWeight: '700' as const },
  date: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
});
