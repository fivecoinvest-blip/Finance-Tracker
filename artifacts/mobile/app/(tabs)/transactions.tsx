import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionItem } from '@/components/TransactionItem';
import { Colors } from '@/constants/colors';
import { useFinance } from '@/context/FinanceContext';
import type { Transaction } from '@/context/FinanceContext';

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
  const { transactions } = useFinance();
  const [filter, setFilter] = useState<Filter>('All');
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = useMemo(() => {
    if (filter === 'All') return transactions;
    return transactions.filter(t => t.type === filter.toLowerCase());
  }, [transactions, filter]);

  const sections = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add-transaction'); }}
        >
          <MaterialIcons name="add" size={22} color={Colors.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="receipt-long" size={56} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No transactions</Text>
          <Text style={styles.emptyText}>Add a transaction to get started</Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: Platform.OS === 'web' ? 100 : 80 }}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
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
  screen: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 12 },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '700' as const },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: Colors.card },
  filterBtnActive: { backgroundColor: Colors.accent },
  filterText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' as const },
  filterTextActive: { color: Colors.textDark },
  sectionHeader: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.8, marginTop: 16, marginBottom: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' as const, marginTop: 16 },
  emptyText: { color: Colors.textMuted, fontSize: 14, marginTop: 6 },
});
