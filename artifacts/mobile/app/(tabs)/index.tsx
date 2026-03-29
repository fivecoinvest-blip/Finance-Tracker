import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SpendingChart } from '@/components/SpendingChart';
import { TransactionItem } from '@/components/TransactionItem';
import { WalletCard } from '@/components/WalletCard';
import { Card } from '@/components/ui/Card';
import { GradientCard } from '@/components/ui/GradientCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';
import { useFinance, xpForNextLevel } from '@/context/FinanceContext';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const {
    wallets, transactions, budgets, stats,
    getTotalBalance, getMonthlyIncome, getMonthlyExpenses, getBudgetUsage,
  } = useFinance();

  const totalBalance = getTotalBalance();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const recentTx = transactions.slice(0, 5);

  const xpNeeded = xpForNextLevel(stats.level);
  const xpProgress = xpNeeded > 0 ? stats.xp / xpNeeded : 0;

  const topBudgets = budgets.slice(0, 3);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 8, paddingBottom: Platform.OS === 'web' ? 100 : 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Good {getGreeting()}</Text>
            <Text style={styles.subGreeting}>Your financial overview</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add-transaction'); }}
          >
            <MaterialIcons name="add" size={24} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        <GradientCard colors={['#1A2F5A', '#2E4A80', '#1A2F5A']} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            ₱{totalBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.incomeExpenseRow}>
            <View style={styles.incomeExpenseItem}>
              <View style={styles.incomeIcon}>
                <MaterialIcons name="trending-up" size={16} color={Colors.income} />
              </View>
              <View>
                <Text style={styles.ieLabel}>Income</Text>
                <Text style={[styles.ieAmount, { color: Colors.income }]}>
                  ₱{monthlyIncome.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.incomeExpenseItem}>
              <View style={styles.expenseIcon}>
                <MaterialIcons name="trending-down" size={16} color={Colors.expense} />
              </View>
              <View>
                <Text style={styles.ieLabel}>Expenses</Text>
                <Text style={[styles.ieAmount, { color: Colors.expense }]}>
                  ₱{monthlyExpenses.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                </Text>
              </View>
            </View>
          </View>
        </GradientCard>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/add-transaction'); }}>
            <MaterialIcons name="add-circle" size={22} color={Colors.accent} />
            <Text style={styles.actionText}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/voice-input'); }}>
            <MaterialIcons name="mic" size={22} color={Colors.info} />
            <Text style={styles.actionText}>Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/ai-insights'); }}>
            <MaterialIcons name="auto-awesome" size={22} color={Colors.accentLight} />
            <Text style={styles.actionText}>AI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/budget'); }}>
            <MaterialIcons name="pie-chart" size={22} color={Colors.success} />
            <Text style={styles.actionText}>Budget</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.xpRow}>
          <MaterialIcons name="local-fire-department" size={18} color={Colors.accent} />
          <Text style={styles.streakText}>{stats.streak} day streak</Text>
          <View style={styles.xpSection}>
            <Text style={styles.levelText}>Lvl {stats.level}</Text>
            <View style={styles.xpBarContainer}>
              <ProgressBar progress={xpProgress} color={Colors.accent} height={6} />
            </View>
            <Text style={styles.xpText}>{stats.xp}/{xpNeeded} XP</Text>
          </View>
        </View>

        {wallets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Wallets</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/wallets')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 0, paddingRight: 8 }}>
              {wallets.map(w => <WalletCard key={w.id} wallet={w} onPress={() => router.push('/(tabs)/wallets')} />)}
            </ScrollView>
          </View>
        )}

        {topBudgets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Budgets</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/budget')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            {topBudgets.map(b => {
              const usage = getBudgetUsage(b.id);
              return (
                <Card key={b.id} style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <Text style={styles.budgetCategory}>{b.category}</Text>
                    <Text style={[styles.budgetPercent, { color: usage > 1 ? Colors.danger : usage > 0.8 ? Colors.warning : Colors.textSecondary }]}>
                      {Math.round(usage * 100)}%
                    </Text>
                  </View>
                  <ProgressBar progress={usage} />
                  <View style={styles.budgetFooter}>
                    <Text style={styles.budgetSpent}>
                      ₱{(usage * b.limit).toLocaleString('en-PH', { minimumFractionDigits: 0 })} spent
                    </Text>
                    <Text style={styles.budgetLimit}>
                      of ₱{b.limit.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Spending Trends</Text>
          </View>
          <Card>
            <SpendingChart months={4} />
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentTx.length === 0 ? (
            <Card style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={36} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first transaction</Text>
            </Card>
          ) : (
            recentTx.map(tx => <TransactionItem key={tx.id} transaction={tx} onPress={() => router.push({ pathname: '/transaction-detail', params: { id: tx.id } })} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundDark },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greeting: { color: Colors.textPrimary, fontSize: 24, fontWeight: '700' as const },
  subGreeting: { color: Colors.textMuted, fontSize: 14, marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center',
  },
  balanceCard: { marginBottom: 16 },
  balanceLabel: { color: Colors.textSecondary, fontSize: 14, marginBottom: 4 },
  balanceAmount: { color: Colors.textPrimary, fontSize: 36, fontWeight: '700' as const, marginBottom: 20 },
  incomeExpenseRow: { flexDirection: 'row', alignItems: 'center' },
  incomeExpenseItem: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  incomeIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.income + '20', justifyContent: 'center', alignItems: 'center' },
  expenseIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.expense + '20', justifyContent: 'center', alignItems: 'center' },
  ieLabel: { color: Colors.textMuted, fontSize: 11 },
  ieAmount: { fontSize: 16, fontWeight: '700' as const },
  divider: { width: 1, height: 40, backgroundColor: Colors.border, marginHorizontal: 16 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, backgroundColor: Colors.card, borderRadius: 16, padding: 12 },
  actionBtn: { alignItems: 'center', gap: 4, flex: 1 },
  actionText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' as const },
  xpRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, backgroundColor: Colors.card, borderRadius: 14, padding: 12, gap: 8 },
  streakText: { color: Colors.accent, fontWeight: '700' as const, fontSize: 13 },
  xpSection: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  levelText: { color: Colors.textPrimary, fontWeight: '700' as const, fontSize: 13 },
  xpBarContainer: { flex: 1 },
  xpText: { color: Colors.textMuted, fontSize: 11 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' as const },
  seeAll: { color: Colors.accent, fontSize: 13, fontWeight: '600' as const },
  budgetCard: { marginBottom: 8 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetCategory: { color: Colors.textPrimary, fontWeight: '600' as const, fontSize: 14 },
  budgetPercent: { fontWeight: '700' as const, fontSize: 14 },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  budgetSpent: { color: Colors.textSecondary, fontSize: 12 },
  budgetLimit: { color: Colors.textMuted, fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { color: Colors.textSecondary, fontSize: 16, fontWeight: '600' as const, marginTop: 12 },
  emptySubtext: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
});
