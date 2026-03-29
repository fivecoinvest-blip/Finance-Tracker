import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_COLORS, Colors } from '@/constants/colors';
import { useFinance } from '@/context/FinanceContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;
const CHART_HEIGHT = 140;

interface SpendingChartProps {
  months?: number;
}

export function SpendingChart({ months = 6 }: SpendingChartProps) {
  const { transactions } = useFinance();

  const now = new Date();
  const monthData = Array.from({ length: months }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const label = date.toLocaleDateString('en-PH', { month: 'short' });
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const income = transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
      .reduce((s, t) => s + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd)
      .reduce((s, t) => s + t.amount, 0);
    return { label, income, expense };
  });

  const maxVal = Math.max(...monthData.flatMap(d => [d.income, d.expense]), 1);
  const barWidth = (CHART_WIDTH / months - 16) / 2;

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.income }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.expense }]} />
          <Text style={styles.legendText}>Expenses</Text>
        </View>
      </View>
      <View style={styles.chartArea}>
        {monthData.map((d, i) => (
          <View key={i} style={styles.barGroup}>
            <View style={styles.bars}>
              <View style={[styles.bar, {
                height: Math.max((d.income / maxVal) * CHART_HEIGHT, 2),
                backgroundColor: Colors.income, width: barWidth,
              }]} />
              <View style={[styles.bar, {
                height: Math.max((d.expense / maxVal) * CHART_HEIGHT, 2),
                backgroundColor: Colors.expense, width: barWidth,
              }]} />
            </View>
            <Text style={styles.barLabel}>{d.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function CategoryPieChart() {
  const { transactions } = useFinance();
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);

  const categoryTotals: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= start)
    .forEach(t => { categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + t.amount; });

  const total = Object.values(categoryTotals).reduce((s, v) => s + v, 0);
  const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 6);

  if (entries.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>No expense data this month</Text>
      </View>
    );
  }

  return (
    <View>
      {entries.map(([cat, amount]) => {
        const pct = total > 0 ? (amount / total) * 100 : 0;
        const color = CATEGORY_COLORS[cat] ?? Colors.textSecondary;
        return (
          <View key={cat} style={styles.categoryRow}>
            <View style={[styles.categoryDot, { backgroundColor: color }]} />
            <Text style={styles.categoryName}>{cat}</Text>
            <View style={styles.categoryBar}>
              <View style={[styles.categoryBarFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
            <Text style={styles.categoryAmount}>
              ₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  legend: { flexDirection: 'row', marginBottom: 12, gap: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: Colors.textSecondary, fontSize: 12 },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', height: CHART_HEIGHT + 20, justifyContent: 'space-around' },
  barGroup: { alignItems: 'center', flex: 1 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginBottom: 6 },
  bar: { borderRadius: 4, minHeight: 2 },
  barLabel: { color: Colors.textMuted, fontSize: 10, marginTop: 2 },
  emptyChart: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: Colors.textMuted, fontSize: 14 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  categoryName: { color: Colors.textSecondary, fontSize: 13, width: 80 },
  categoryBar: { flex: 1, height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: 'hidden' },
  categoryBarFill: { height: '100%', borderRadius: 3 },
  categoryAmount: { color: Colors.textPrimary, fontSize: 12, fontWeight: '600' as const, width: 70, textAlign: 'right' },
});
