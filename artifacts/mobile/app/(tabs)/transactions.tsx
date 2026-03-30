import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionItem } from '@/components/TransactionItem';
import { useFinance } from '@/context/FinanceContext';
import type { Transaction } from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';

const FILTERS = ['All', 'Income', 'Expense', 'Transfer'] as const;
type Filter = typeof FILTERS[number];

function groupByDate(transactions: Transaction[]) {
  const groups: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const d = new Date(tx.date);
    const key = d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }
  return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const Colors = useColors();
  const { transactions } = useFinance();
  const [filter, setFilter] = useState<Filter>('All');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = useMemo(() => {
    if (filter === 'All') return transactions;
    return transactions.filter(t => t.type === filter.toLowerCase());
  }, [transactions, filter]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <View style={[styles.screen, { backgroundColor: Colors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Text style={[styles.title, { color: Colors.textPrimary }]}>Transactions</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add-transaction'); }}
        >
          <MaterialIcons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, { backgroundColor: Colors.card }, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: Colors.textMuted }, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="receipt-long" size={56} color={Colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No transactions</Text>
          <Text style={[styles.emptyText, { color: Colors.textMuted }]}>Add a transaction to get started</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'web' ? 100 : 80 }}
          renderSectionHeader={({ section }) => (
            <Text style={[styles.sectionHeader, { color: Colors.textMuted }]}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <TransactionItem
              transaction={item}
              onPress={() => router.push({ pathname: '/transaction-detail', params: { id: item.id } })}
            />
          )}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700' as const },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
  filterBtnActive: { backgroundColor: '#FF6B35' },
  filterText: { fontSize: 13, fontWeight: '600' as const },
  filterTextActive: { color: '#FFFFFF' },
  sectionHeader: { fontSize: 12, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.8, marginTop: 16, marginBottom: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyTitle: { fontSize: 18, fontWeight: '700' as const, marginTop: 16 },
  emptyText: { fontSize: 14, marginTop: 6 },
});
