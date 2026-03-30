import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { useCurrency } from '@/context/CurrencyContext';
import { useFinance, type Insight } from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';

function insightColor(type: Insight['type'], Colors: any): string {
  switch (type) {
    case 'positive':    return Colors.success;
    case 'warning':     return '#FF9500';
    case 'danger':      return Colors.danger;
    case 'achievement': return '#9B59B6';
    default:            return Colors.accent;
  }
}

function InsightCard({ insight, Colors }: { insight: Insight; Colors: any }) {
  const color = insightColor(insight.type, Colors);
  return (
    <View style={[styles.insightCard, { backgroundColor: Colors.card, borderLeftColor: color }]}>
      <View style={[styles.insightIconWrap, { backgroundColor: color + '20' }]}>
        <MaterialIcons name={insight.icon as any} size={20} color={color} />
      </View>
      <View style={styles.insightBody}>
        <View style={styles.insightTitleRow}>
          <Text style={[styles.insightTitle, { color: Colors.textPrimary }]}>{insight.title}</Text>
          {insight.metric && (
            <View style={[styles.metricBadge, { backgroundColor: color + '18' }]}>
              <Text style={[styles.metricText, { color }]}>{insight.metric}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.insightDesc, { color: Colors.textSecondary }]}>{insight.body}</Text>
      </View>
    </View>
  );
}

export default function AIInsightsScreen() {
  const insets = useSafeAreaInsets();
  const Colors = useColors();
  const { formatAmountShort, currency } = useCurrency();
  const { getAIInsights, getMonthlyIncome, getMonthlyExpenses, transactions, budgets, getBudgetUsage, getCategorySpending } = useFinance();

  const insights    = getAIInsights(currency.symbol);
  const income      = getMonthlyIncome();
  const expenses    = getMonthlyExpenses();
  const savings     = income - expenses;
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;
  const topPadding  = Platform.OS === 'web' ? 67 : insets.top;

  const now  = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const dayOfMonth  = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft    = daysInMonth - dayOfMonth;

  const catTotals: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense' && new Date(t.date) >= thisMonthStart)
    .forEach(t => { catTotals[t.category] = (catTotals[t.category] ?? 0) + t.amount; });
  const topCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const catLast: Record<string, number> = {};
  transactions
    .filter(t => { const d = new Date(t.date); return t.type === 'expense' && d >= lastMonthStart && d <= lastMonthEnd; })
    .forEach(t => { catLast[t.category] = (catLast[t.category] ?? 0) + t.amount; });

  const projected = dayOfMonth >= 5 && expenses > 0
    ? Math.round((expenses / dayOfMonth) * daysInMonth) : 0;

  const grouped = {
    danger:      insights.filter(i => i.type === 'danger'),
    warning:     insights.filter(i => i.type === 'warning'),
    positive:    insights.filter(i => i.type === 'positive'),
    achievement: insights.filter(i => i.type === 'achievement'),
    info:        insights.filter(i => i.type === 'info'),
  };
  const ordered = [
    ...grouped.danger,
    ...grouped.warning,
    ...grouped.positive,
    ...grouped.achievement,
    ...grouped.info,
  ];

  return (
    <View style={[styles.screen, { backgroundColor: Colors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: Colors.card }]}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>AI Insights</Text>
          <Text style={[styles.headerSub, { color: Colors.textMuted }]}>
            {now.toLocaleDateString(currency.locale, { month: 'long', year: 'numeric' })}
          </Text>
        </View>
        <View style={[styles.sparkBadge, { backgroundColor: Colors.accent + '20' }]}>
          <MaterialIcons name="auto-awesome" size={18} color={Colors.accent} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Monthly Snapshot */}
        <View style={[styles.snapshotCard, { backgroundColor: Colors.card, borderColor: Colors.accent + '25' }]}>
          <Text style={[styles.sectionLabel, { color: Colors.textMuted }]}>Monthly Snapshot</Text>
          <View style={styles.snapshotRow}>
            <View style={styles.snapshotItem}>
              <Text style={[styles.snapshotLabel, { color: Colors.textMuted }]}>Income</Text>
              <Text style={[styles.snapshotValue, { color: Colors.income }]}>{formatAmountShort(income)}</Text>
            </View>
            <View style={[styles.snapshotDivider, { backgroundColor: Colors.border }]} />
            <View style={styles.snapshotItem}>
              <Text style={[styles.snapshotLabel, { color: Colors.textMuted }]}>Spent</Text>
              <Text style={[styles.snapshotValue, { color: Colors.expense }]}>{formatAmountShort(expenses)}</Text>
            </View>
            <View style={[styles.snapshotDivider, { backgroundColor: Colors.border }]} />
            <View style={styles.snapshotItem}>
              <Text style={[styles.snapshotLabel, { color: Colors.textMuted }]}>Saved</Text>
              <Text style={[styles.snapshotValue, { color: savings >= 0 ? Colors.success : Colors.danger }]}>
                {savings < 0 ? '-' : ''}{formatAmountShort(Math.abs(savings))}
              </Text>
            </View>
          </View>

          {income > 0 && (
            <>
              <View style={[styles.progressTrack, { backgroundColor: Colors.border }]}>
                <View style={[styles.progressFill, {
                  width: `${Math.min(100, Math.round((expenses / income) * 100))}%` as any,
                  backgroundColor: expenses > income ? Colors.danger : expenses / income > 0.8 ? '#FF9500' : Colors.accent,
                }]} />
              </View>
              <Text style={[styles.progressLabel, { color: Colors.textMuted }]}>
                {Math.min(100, Math.round((expenses / income) * 100))}% of income spent · {savingsRate > 0 ? `${savingsRate}% saved` : 'no savings yet'}
              </Text>
            </>
          )}
        </View>

        {/* Forecast */}
        {projected > 0 && (
          <View style={[styles.forecastCard, {
            backgroundColor: projected > income && income > 0 ? Colors.danger + '15' : Colors.accent + '12',
            borderColor: projected > income && income > 0 ? Colors.danger + '40' : Colors.accent + '30',
          }]}>
            <View style={styles.forecastHeader}>
              <MaterialIcons name="show-chart" size={18} color={projected > income && income > 0 ? Colors.danger : Colors.accent} />
              <Text style={[styles.forecastTitle, { color: projected > income && income > 0 ? Colors.danger : Colors.textPrimary }]}>
                Month-End Forecast
              </Text>
            </View>
            <View style={styles.forecastRow}>
              <View>
                <Text style={[styles.forecastAmount, { color: Colors.textPrimary }]}>
                  {formatAmountShort(projected)}
                </Text>
                <Text style={[styles.forecastSub, { color: Colors.textMuted }]}>
                  projected total · {daysLeft} days left
                </Text>
              </View>
              {income > 0 && (
                <View style={[styles.forecastBadge, {
                  backgroundColor: projected > income ? Colors.danger + '20' : Colors.success + '20',
                }]}>
                  <Text style={[styles.forecastBadgeText, { color: projected > income ? Colors.danger : Colors.success }]}>
                    {projected > income ? `Over by ${formatAmountShort(projected - income)}` : `Under by ${formatAmountShort(income - projected)}`}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Top Categories */}
        {topCats.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Top Categories</Text>
            <Card style={styles.catsCard}>
              {topCats.map(([cat, amt], i) => {
                const barPct = expenses > 0 ? (amt / expenses) * 100 : 0;
                const lastAmt = catLast[cat] ?? 0;
                const trend = lastAmt > 0 ? Math.round(((amt - lastAmt) / lastAmt) * 100) : null;
                return (
                  <View key={cat} style={[styles.catRow, i < topCats.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.border }]}>
                    <View style={styles.catTop}>
                      <Text style={[styles.catName, { color: Colors.textPrimary }]}>{cat}</Text>
                      <View style={styles.catRight}>
                        {trend !== null && (
                          <View style={[styles.trendBadge, { backgroundColor: trend > 0 ? Colors.expense + '18' : Colors.success + '18' }]}>
                            <MaterialIcons
                              name={trend > 0 ? 'arrow-upward' : 'arrow-downward'}
                              size={10}
                              color={trend > 0 ? Colors.expense : Colors.success}
                            />
                            <Text style={[styles.trendText, { color: trend > 0 ? Colors.expense : Colors.success }]}>
                              {Math.abs(trend)}%
                            </Text>
                          </View>
                        )}
                        <Text style={[styles.catAmt, { color: Colors.textPrimary }]}>{formatAmountShort(amt)}</Text>
                        <Text style={[styles.catPct, { color: Colors.textMuted }]}>{Math.round(barPct)}%</Text>
                      </View>
                    </View>
                    <View style={[styles.catTrack, { backgroundColor: Colors.border }]}>
                      <View style={[styles.catBar, {
                        width: `${barPct}%` as any,
                        backgroundColor: i === 0 ? Colors.accent : Colors.accent + '80',
                      }]} />
                    </View>
                  </View>
                );
              })}
            </Card>
          </>
        )}

        {/* Budget Status */}
        {budgets.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Budget Status</Text>
            <Card style={styles.budgetsCard}>
              {budgets.map((b, i) => {
                const usage = getBudgetUsage(b.id);
                const spent = getCategorySpending(b.category, b.period);
                const pct   = Math.min(100, Math.round(usage * 100));
                const barColor = usage >= 1 ? Colors.danger : usage >= 0.8 ? '#FF9500' : Colors.success;
                return (
                  <View key={b.id} style={[styles.budgetRow, i < budgets.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.border }]}>
                    <View style={styles.budgetTop}>
                      <Text style={[styles.budgetCat, { color: Colors.textPrimary }]}>{b.category}</Text>
                      <Text style={[styles.budgetAmt, { color: barColor }]}>
                        {formatAmountShort(spent)} / {formatAmountShort(b.limit)}
                      </Text>
                    </View>
                    <View style={[styles.budgetTrack, { backgroundColor: Colors.border }]}>
                      <View style={[styles.budgetBar, { width: `${pct}%` as any, backgroundColor: barColor }]} />
                    </View>
                    <Text style={[styles.budgetStatus, { color: barColor }]}>
                      {usage >= 1 ? `Exceeded by ${formatAmountShort(spent - b.limit)}` : usage >= 0.8 ? `${100 - pct}% remaining — watch out` : `${formatAmountShort(b.limit - spent)} left`}
                    </Text>
                  </View>
                );
              })}
            </Card>
          </>
        )}

        {/* Insights */}
        <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Personalized Insights</Text>
        {ordered.map(insight => (
          <InsightCard key={insight.id} insight={insight} Colors={Colors} />
        ))}

        <View style={styles.footer}>
          <MaterialIcons name="auto-awesome" size={14} color={Colors.textMuted} />
          <Text style={[styles.footerText, { color: Colors.textMuted }]}>Insights are generated from your local data</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const },
  headerSub: { fontSize: 12, marginTop: 1 },
  sparkBadge: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 48 },

  snapshotCard: { borderRadius: 20, padding: 20, marginBottom: 14, borderWidth: 1 },
  sectionLabel: { fontSize: 11, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 14 },
  snapshotRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  snapshotItem: { flex: 1, alignItems: 'center' },
  snapshotLabel: { fontSize: 12, marginBottom: 4 },
  snapshotValue: { fontSize: 20, fontWeight: '700' as const },
  snapshotDivider: { width: 1, height: 40, marginHorizontal: 4 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: 6, borderRadius: 3 },
  progressLabel: { fontSize: 12, textAlign: 'center' as const },

  forecastCard: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1 },
  forecastHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  forecastTitle: { fontSize: 14, fontWeight: '700' as const },
  forecastRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  forecastAmount: { fontSize: 26, fontWeight: '700' as const },
  forecastSub: { fontSize: 12, marginTop: 2 },
  forecastBadge: { borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  forecastBadgeText: { fontSize: 13, fontWeight: '600' as const },

  sectionTitle: { fontSize: 16, fontWeight: '700' as const, marginBottom: 10, marginTop: 4 },

  catsCard: { marginBottom: 20, padding: 0, overflow: 'hidden' },
  catRow: { paddingVertical: 12, paddingHorizontal: 16 },
  catTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  catName: { fontSize: 14, fontWeight: '600' as const },
  catRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  catAmt: { fontSize: 14, fontWeight: '700' as const },
  catPct: { fontSize: 12 },
  catTrack: { height: 5, borderRadius: 3, overflow: 'hidden' },
  catBar: { height: 5, borderRadius: 3 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: 6, paddingVertical: 2, paddingHorizontal: 5 },
  trendText: { fontSize: 10, fontWeight: '700' as const },

  budgetsCard: { marginBottom: 20, padding: 0, overflow: 'hidden' },
  budgetRow: { paddingVertical: 12, paddingHorizontal: 16 },
  budgetTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetCat: { fontSize: 14, fontWeight: '600' as const },
  budgetAmt: { fontSize: 13, fontWeight: '700' as const },
  budgetTrack: { height: 5, borderRadius: 3, overflow: 'hidden', marginBottom: 4 },
  budgetBar: { height: 5, borderRadius: 3 },
  budgetStatus: { fontSize: 11, fontWeight: '600' as const },

  insightCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderRadius: 14, padding: 14, marginBottom: 10, borderLeftWidth: 4 },
  insightIconWrap: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  insightBody: { flex: 1 },
  insightTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  insightTitle: { fontSize: 14, fontWeight: '700' as const, flex: 1, marginRight: 8 },
  insightDesc: { fontSize: 13, lineHeight: 20 },
  metricBadge: { borderRadius: 8, paddingVertical: 3, paddingHorizontal: 8 },
  metricText: { fontSize: 12, fontWeight: '700' as const },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 12 },
  footerText: { fontSize: 11 },
});
