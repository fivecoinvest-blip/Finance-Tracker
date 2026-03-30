import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/constants/colors';
import { useFinance } from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const Colors = useColors();
  return (
    <View style={[styles.detailRow, { borderBottomColor: Colors.border }]}>
      <MaterialIcons name={icon as any} size={18} color={Colors.textMuted} />
      <Text style={[styles.detailLabel, { color: Colors.textMuted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: Colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const Colors = useColors();
  const { transactions, deleteTransaction, getWalletById } = useFinance();
  const [showConfirm, setShowConfirm] = useState(false);
  const topPadding = Platform.OS === 'web' ? 16 : insets.top;

  const tx = transactions.find(t => t.id === id);
  if (!tx) {
    return (
      <View style={[styles.screen, { backgroundColor: Colors.backgroundDark }]}>
        <Text style={[styles.notFound, { color: Colors.textMuted }]}>Transaction not found</Text>
      </View>
    );
  }

  const wallet = getWalletById(tx.walletId);
  const toWallet = tx.toWalletId ? getWalletById(tx.toWalletId) : undefined;
  const iconName = CATEGORY_ICONS[tx.category] ?? 'category';
  const iconColor = CATEGORY_COLORS[tx.category] ?? Colors.textSecondary;
  const amountColor = tx.type === 'income' ? Colors.income : tx.type === 'transfer' ? Colors.transfer : Colors.expense;
  const sign = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔' : '-';

  return (
    <View style={[styles.screen, { backgroundColor: Colors.backgroundDark }]}>
      <ConfirmModal
        visible={showConfirm}
        title="Delete Transaction"
        message="This will reverse the transaction from your wallet balance."
        confirmLabel="Delete"
        destructive
        onConfirm={async () => { setShowConfirm(false); await deleteTransaction(tx.id); router.back(); }}
        onCancel={() => setShowConfirm(false)}
      />

      <View style={[styles.header, { paddingTop: topPadding + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: Colors.card }]}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>Transaction Detail</Text>
        <TouchableOpacity onPress={() => setShowConfirm(true)} style={[styles.deleteBtn, { backgroundColor: Colors.danger + '20' }]}>
          <MaterialIcons name="delete-outline" size={22} color={Colors.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconBig, { backgroundColor: iconColor + '20' }]}>
          <MaterialIcons name={iconName as any} size={44} color={iconColor} />
        </View>

        <Text style={[styles.amount, { color: amountColor }]}>
          {sign}₱{tx.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
        <Text style={[styles.category, { color: Colors.textSecondary }]}>{tx.category}</Text>
        {tx.description ? <Text style={[styles.description, { color: Colors.textMuted }]}>{tx.description}</Text> : null}

        <View style={[styles.detailsCard, { backgroundColor: Colors.card }]}>
          <DetailRow icon="calendar-today" label="Date" value={new Date(tx.date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })} />
          <DetailRow icon="account-balance-wallet" label="Wallet" value={wallet?.name ?? 'Unknown'} />
          {toWallet && <DetailRow icon="swap-horiz" label="To Wallet" value={toWallet.name} />}
          <DetailRow icon="repeat" label="Recurring" value={tx.recurring === 'none' ? 'One-time' : tx.recurring.charAt(0).toUpperCase() + tx.recurring.slice(1)} />
          <DetailRow icon="swap-vert" label="Type" value={tx.type.charAt(0).toUpperCase() + tx.type.slice(1)} />
          {tx.notes ? <DetailRow icon="notes" label="Notes" value={tx.notes} /> : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 20 },
  iconBig: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  amount: { fontSize: 40, fontWeight: '700' as const, marginBottom: 4 },
  category: { fontSize: 16, fontWeight: '600' as const, marginBottom: 4 },
  description: { fontSize: 14, marginBottom: 24 },
  detailsCard: { width: '100%', borderRadius: 20, padding: 20, marginTop: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  detailLabel: { fontSize: 14, flex: 1 },
  detailValue: { fontSize: 14, fontWeight: '600' as const },
  notFound: { textAlign: 'center', marginTop: 100, fontSize: 16 },
});
