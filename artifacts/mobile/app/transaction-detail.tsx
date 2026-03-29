import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_COLORS, CATEGORY_ICONS, Colors } from '@/constants/colors';
import { useFinance } from '@/context/FinanceContext';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { transactions, deleteTransaction, getWalletById } = useFinance();

  const tx = transactions.find(t => t.id === id);
  if (!tx) {
    return (
      <View style={styles.screen}>
        <Text style={styles.notFound}>Transaction not found</Text>
      </View>
    );
  }

  const wallet = getWalletById(tx.walletId);
  const toWallet = tx.toWalletId ? getWalletById(tx.toWalletId) : undefined;
  const iconName = CATEGORY_ICONS[tx.category] ?? 'category';
  const iconColor = CATEGORY_COLORS[tx.category] ?? Colors.textSecondary;
  const amountColor = tx.type === 'income' ? Colors.income : tx.type === 'transfer' ? Colors.transfer : Colors.expense;
  const sign = tx.type === 'income' ? '+' : tx.type === 'transfer' ? '↔' : '-';

  const handleDelete = () => {
    Alert.alert('Delete Transaction', 'This will reverse the transaction from your wallet balance.', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTransaction(tx.id); router.back(); } },
    ]);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction Detail</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
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
        <Text style={styles.category}>{tx.category}</Text>
        {tx.description ? <Text style={styles.description}>{tx.description}</Text> : null}

        <View style={styles.detailsCard}>
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

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <MaterialIcons name={icon as any} size={18} color={Colors.textMuted} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' as const },
  deleteBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.danger + '20', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 20 },
  iconBig: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  amount: { fontSize: 40, fontWeight: '700' as const, marginBottom: 4 },
  category: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' as const, marginBottom: 4 },
  description: { color: Colors.textMuted, fontSize: 14, marginBottom: 24 },
  detailsCard: { width: '100%', backgroundColor: Colors.card, borderRadius: 20, padding: 20, marginTop: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  detailLabel: { color: Colors.textMuted, fontSize: 14, flex: 1 },
  detailValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' as const },
  notFound: { color: Colors.textMuted, textAlign: 'center', marginTop: 100, fontSize: 16 },
});
