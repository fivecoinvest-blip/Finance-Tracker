import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CashperMascot, type MascotMood } from '@/components/CashperMascot';
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

  const mascotMood = useMemo<MascotMood>(() => {
    const overBudget = budgets.some(b => getBudgetUsage(b.id) > 0.8);
    if (overBudget) return 'alert';
    if (stats.streak >= 7) return 'celebrate';
    if (monthlyExpenses < monthlyIncome * 0.5 && monthlyIncome > 0) return 'saving';
    if (recentTx.length === 0) return 'default';
    return 'happy';
  }, [budgets, stats.streak, monthlyIncome, monthlyExpenses, recentTx.length]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 8, paddingBottom: Platform.OS === 'web' ? 100 : 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.appName}>Cashper</Text>
            <Text style={styles.tagline}>Track • Save • Grow</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add-transaction'); }}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.mascotRow}>
          <CashperMascot mood={mascotMood} size={70} showMessage={true} />
        </View>

        <GradientCard colors={['#FF6B35', '#FF8C5A', '#FF6B35']} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>
            ₱{totalBalance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <View style={styles.incomeExpenseRow}>
            <View style={styles.incomeExpenseItem}>
              <View style={styles.incomeIcon}>
                <MaterialIcons name="trending-up" size={16} color="rgba(255,255,255,0.9)" />
              </View>
              <View>
                <Text style={styles.ieLabel}>Income</Text>
                <Text style={styles.ieAmount}>
                  ₱{monthlyIncome.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.incomeExpenseItem}>
              <View style={styles.expenseIcon}>
                <MaterialIcons name="trending-down" size={16} color="rgba(255,255,255,0.9)" />
              </View>
              <View>
                <Text style={styles.ieLabel}>Expenses</Text>
                <Text style={styles.ieAmount}>
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
            <MaterialIcons name="auto-awesome" size={22} color={Colors.accent} />
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
              <CashperMascot mood="default" size={80} showMessage={true} message="No transactions yet — tap + to add your first!" />
            </Card>
          ) : (
            recentTx.map(tx => <TransactionItem key={tx.id} transaction={tx} onPress={() => router.push({ pathname: '/transaction-detail', params: { id: tx.id } })} />)
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundDark },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  appName: { color: Colors.accent, fontSize: 26, fontWeight: '700' as const, letterSpacing: 0.5 },
  tagline: { color: Colors.textMuted, fontSize: 12, marginTop: 2, letterSpacing: 1 },
  addBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center',
  },
  mascotRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceCard: { marginBottom: 16 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  balanceAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '700' as const, marginBottom: 20 },
  incomeExpenseRow: { flexDirection: 'row', alignItems: 'center' },
  incomeExpenseItem: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  incomeIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  expenseIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center' },
  ieLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  ieAmount: { fontSize: 16, fontWeight: '700' as const, color: '#FFFFFF' },
  divider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 16 },
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
});
