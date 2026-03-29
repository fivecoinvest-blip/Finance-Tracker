import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { useFinance } from '@/context/FinanceContext';

const INSIGHT_ICONS = [
  'auto-awesome',
  'savings',
  'warning',
  'trending-up',
  'local-fire-department',
  'lightbulb',
];

export default function AIInsightsScreen() {
  const insets = useSafeAreaInsets();
  const { getAIInsights, getMonthlyIncome, getMonthlyExpenses, transactions } = useFinance();
  const insights = getAIInsights();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const income = getMonthlyIncome();
  const expenses = getMonthlyExpenses();
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const txThisMonth = transactions.filter(t => new Date(t.date) >= start);
  const topCategory = (() => {
    const cats: Record<string, number> = {};
    txThisMonth.filter(t => t.type === 'expense').forEach(t => { cats[t.category] = (cats[t.category] ?? 0) + t.amount; });
    const top = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
    return top ? { name: top[0], amount: top[1] } : null;
  })();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Insights</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialIcons name="auto-awesome" size={24} color={Colors.accent} />
            <Text style={styles.summaryTitle}>Monthly Summary</Text>
          </View>
          <Text style={styles.summaryMonth}>{now.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })}</Text>

          <View style={styles.summaryStats}>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Income</Text>
              <Text style={[styles.summaryStatValue, { color: Colors.income }]}>
                ₱{income.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Expenses</Text>
              <Text style={[styles.summaryStatValue, { color: Colors.expense }]}>
                ₱{expenses.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={styles.summaryStatItem}>
              <Text style={styles.summaryStatLabel}>Saved</Text>
              <Text style={[styles.summaryStatValue, { color: savings >= 0 ? Colors.success : Colors.danger }]}>
                ₱{Math.abs(savings).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
              </Text>
            </View>
          </View>

          {savingsRate > 0 && (
            <Text style={styles.savingsRateText}>
              You saved {Math.round(savingsRate)}% of your income this month
            </Text>
          )}
        </View>

        {topCategory && (
          <Card style={styles.topCatCard}>
            <View style={styles.topCatHeader}>
              <MaterialIcons name="bar-chart" size={20} color={Colors.accent} />
              <Text style={styles.topCatTitle}>Top Spending Category</Text>
            </View>
            <Text style={styles.topCatName}>{topCategory.name}</Text>
            <Text style={styles.topCatAmount}>
              ₱{topCategory.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </Text>
            {expenses > 0 && (
              <Text style={styles.topCatPct}>
                {Math.round((topCategory.amount / expenses) * 100)}% of total expenses
              </Text>
            )}
          </Card>
        )}

        <Text style={styles.insightsTitle}>Personalized Insights</Text>
        {insights.map((insight, i) => (
          <Card key={i} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={styles.insightIconBg}>
                <MaterialIcons name={INSIGHT_ICONS[i % INSIGHT_ICONS.length] as any} size={18} color={Colors.accent} />
              </View>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          </Card>
        ))}

        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Quick Tips</Text>
          {[
            '50/30/20 Rule: 50% needs, 30% wants, 20% savings',
            'Track every expense, even small ones — they add up',
            'Pay yourself first: save before spending',
            'Review recurring subscriptions monthly',
          ].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' as const },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  summaryCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: Colors.accent + '30' },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  summaryTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' as const },
  summaryMonth: { color: Colors.textMuted, fontSize: 13, marginBottom: 16 },
  summaryStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  summaryStatItem: { alignItems: 'center' },
  summaryStatLabel: { color: Colors.textMuted, fontSize: 12, marginBottom: 2 },
  summaryStatValue: { fontSize: 18, fontWeight: '700' as const },
  savingsRateText: { color: Colors.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 4 },
  topCatCard: { marginBottom: 16 },
  topCatHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  topCatTitle: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' as const },
  topCatName: { color: Colors.textPrimary, fontSize: 24, fontWeight: '700' as const },
  topCatAmount: { color: Colors.accent, fontSize: 20, fontWeight: '700' as const, marginTop: 2 },
  topCatPct: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  insightsTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' as const, marginBottom: 12 },
  insightCard: { marginBottom: 10 },
  insightHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  insightIconBg: { width: 34, height: 34, borderRadius: 10, backgroundColor: Colors.accent + '20', justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  insightText: { flex: 1, color: Colors.textSecondary, fontSize: 14, lineHeight: 21 },
  tipsCard: { marginTop: 8 },
  tipsTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' as const, marginBottom: 12 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.accent, marginTop: 7 },
  tipText: { flex: 1, color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
});
