import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
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
import { useCurrency } from '@/context/CurrencyContext';
import { useFinance, xpProgressInLevel } from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';

function useCountUp(target: number, duration = 900): number {
  const animRef = useRef(new Animated.Value(0));
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const listenerRef = useRef<string | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = target;

    if (listenerRef.current) animRef.current.removeListener(listenerRef.current);
    animRef.current.setValue(from);

    listenerRef.current = animRef.current.addListener(({ value }) => setDisplay(value));
    Animated.timing(animRef.current, {
      toValue: target,
      duration,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();

    return () => {
      if (listenerRef.current) animRef.current.removeListener(listenerRef.current);
    };
  }, [target]);

  return display;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const Colors = useColors();
  const { formatAmount, formatAmountShort } = useCurrency();
  const {
    wallets, transactions, budgets, stats,
    getTotalBalance, getMonthlyIncome, getMonthlyExpenses, getBudgetUsage,
  } = useFinance();

  const totalBalance = getTotalBalance();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const recentTx = transactions.slice(0, 5);

  const xpProgress = xpProgressInLevel(stats.xp);

  // Animated balance count-up
  const animatedBalance = useCountUp(totalBalance);

  // Balance card scale-pop on mount
  const balanceScale = useRef(new Animated.Value(0.88)).current;
  useEffect(() => {
    Animated.spring(balanceScale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const topBudgets = budgets.slice(0, 3);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const mascotMood = useMemo<MascotMood>(() => {
    if (wallets.some(w => w.balance < 0)) return 'alert';
    if (budgets.some(b => getBudgetUsage(b.id) > 1)) return 'alert';
    if (budgets.some(b => getBudgetUsage(b.id) > 0.8)) return 'alert';
    if (stats.streak === 7 || stats.streak === 30) return 'celebrate';
    if (stats.streak >= 14) return 'celebrate';
    if (transactions.length === 0) return 'encourage';
    if (monthlyIncome > 0 && monthlyExpenses < monthlyIncome * 0.5) return 'saving';
    if (monthlyIncome > 0 && monthlyExpenses < monthlyIncome * 0.8) return 'saving';
    if (stats.streak >= 3) return 'happy';
    if (recentTx.length === 0) return 'encourage';
    return 'happy';
  }, [wallets, budgets, stats.streak, transactions.length, monthlyIncome, monthlyExpenses, recentTx.length, getBudgetUsage]);

  const mascotMessage = useMemo<string | undefined>(() => {
    const negWallet = wallets.find(w => w.balance < 0);
    if (negWallet) return `Your ${negWallet.name} wallet is overdrawn — let's fix that!`;
    const overBudget = budgets.find(b => getBudgetUsage(b.id) > 1);
    if (overBudget) return `Your ${overBudget.category} budget is exceeded. Time to review!`;
    const nearBudget = budgets.find(b => { const u = getBudgetUsage(b.id); return u > 0.8 && u <= 1; });
    if (nearBudget) return `Almost at the ${nearBudget.category} budget limit — watch out!`;
    if (stats.streak === 30) return `30-day streak! You're a Monthly Master!`;
    if (stats.streak === 7) return `7-day streak! Week Warrior badge unlocked!`;
    if (stats.streak === 14) return `14 days straight! You're unstoppable!`;
    if (stats.streak >= 3) return `${stats.streak}-day streak! Keep the momentum going!`;
    if (transactions.length === 0) return `Hi! I'm Cashper — tap + to log your first transaction!`;
    const hour = new Date().getHours();
    if (hour < 12) return undefined;
    if (hour >= 21) return `End of day! Don't forget to log today's transactions.`;
    return undefined;
  }, [wallets, budgets, stats.streak, transactions.length, getBudgetUsage]);

  return (
    <View style={[styles.screen, { backgroundColor: Colors.backgroundDark }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 8, paddingBottom: Platform.OS === 'web' ? 100 : 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.appName, { color: Colors.accent }]}>Cashper</Text>
            <Text style={[styles.tagline, { color: Colors.textSecondary }]}>Track • Save • Grow</Text>
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: Colors.accent }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/add-transaction'); }}
          >
            <MaterialIcons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.mascotRow}>
          <CashperMascot mood={mascotMood} size={70} showMessage={true} message={mascotMessage} />
        </View>

        <Animated.View style={{ transform: [{ scale: balanceScale }] }}>
        <GradientCard colors={['#FF6B35', '#FF8C5A', '#FF6B35']} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{formatAmount(animatedBalance)}</Text>
          <View style={styles.incomeExpenseRow}>
            <View style={styles.incomeExpenseItem}>
              <View style={styles.incomeIcon}>
                <MaterialIcons name="trending-up" size={16} color="rgba(255,255,255,0.9)" />
              </View>
              <View>
                <Text style={styles.ieLabel}>Income</Text>
                <Text style={styles.ieAmount}>{formatAmountShort(monthlyIncome)}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.incomeExpenseItem}>
              <View style={styles.expenseIcon}>
                <MaterialIcons name="trending-down" size={16} color="rgba(255,255,255,0.9)" />
              </View>
              <View>
                <Text style={styles.ieLabel}>Expenses</Text>
                <Text style={styles.ieAmount}>{formatAmountShort(monthlyExpenses)}</Text>
              </View>
            </View>
          </View>
        </GradientCard>
        </Animated.View>

        <View style={[styles.quickActions, { backgroundColor: Colors.card }]}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/add-transaction'); }}>
            <MaterialIcons name="add-circle" size={22} color={Colors.accent} />
            <Text style={[styles.actionText, { color: Colors.textSecondary }]}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/voice-input'); }}>
            <MaterialIcons name="mic" size={22} color={Colors.info} />
            <Text style={[styles.actionText, { color: Colors.textSecondary }]}>Voice</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/ai-insights'); }}>
            <MaterialIcons name="auto-awesome" size={22} color={Colors.accent} />
            <Text style={[styles.actionText, { color: Colors.textSecondary }]}>AI</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(tabs)/budget'); }}>
            <MaterialIcons name="pie-chart" size={22} color={Colors.success} />
            <Text style={[styles.actionText, { color: Colors.textSecondary }]}>Budget</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.xpRow, { backgroundColor: Colors.card }]}>
          <MaterialIcons name="local-fire-department" size={18} color={Colors.accent} />
          <Text style={[styles.streakText, { color: Colors.accent }]}>{stats.streak} day streak</Text>
          <View style={styles.xpSection}>
            <Text style={[styles.levelText, { color: Colors.textPrimary }]}>Lvl {stats.level}</Text>
            <View style={styles.xpBarContainer}>
              <ProgressBar progress={xpProgress} color={Colors.accent} height={6} />
            </View>
            <Text style={[styles.xpLabel, { color: Colors.textMuted }]}>{stats.xp} XP</Text>
          </View>
        </View>

        {wallets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Wallets</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/wallets')}>
                <Text style={[styles.seeAll, { color: Colors.accent }]}>See all</Text>
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
              <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Budgets</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/budget')}>
                <Text style={[styles.seeAll, { color: Colors.accent }]}>See all</Text>
              </TouchableOpacity>
            </View>
            {topBudgets.map(b => {
              const usage = getBudgetUsage(b.id);
              return (
                <Card key={b.id} style={styles.budgetCard}>
                  <View style={styles.budgetHeader}>
                    <Text style={[styles.budgetCategory, { color: Colors.textPrimary }]}>{b.category}</Text>
                    <Text style={[styles.budgetPercent, { color: usage > 1 ? Colors.danger : usage > 0.8 ? Colors.warning : Colors.textSecondary }]}>
                      {Math.round(usage * 100)}%
                    </Text>
                  </View>
                  <ProgressBar progress={usage} />
                  <View style={styles.budgetFooter}>
                    <Text style={[styles.budgetSpent, { color: Colors.textSecondary }]}>
                      {formatAmountShort(usage * b.limit)} spent
                    </Text>
                    <Text style={[styles.budgetLimit, { color: Colors.textMuted }]}>
                      of {formatAmountShort(b.limit)}
                    </Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Spending Trends</Text>
          </View>
          <Card>
            <SpendingChart months={4} />
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={[styles.seeAll, { color: Colors.accent }]}>See all</Text>
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
  screen: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  appName: { fontSize: 26, fontWeight: '700' as const, letterSpacing: 0.5 },
  tagline: { fontSize: 12, marginTop: 2, letterSpacing: 1 },
  addBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  mascotRow: { marginBottom: 16 },
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
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, borderRadius: 16, padding: 12 },
  actionBtn: { alignItems: 'center', gap: 4, flex: 1 },
  actionText: { fontSize: 11, fontWeight: '600' as const },
  xpRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderRadius: 14, padding: 12, gap: 8 },
  streakText: { fontWeight: '700' as const, fontSize: 13 },
  xpSection: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  levelText: { fontWeight: '700' as const, fontSize: 13 },
  xpBarContainer: { flex: 1 },
  xpLabel: { fontSize: 11 },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const },
  seeAll: { fontSize: 13, fontWeight: '600' as const },
  budgetCard: { marginBottom: 8 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetCategory: { fontWeight: '600' as const, fontSize: 14 },
  budgetPercent: { fontWeight: '700' as const, fontSize: 14 },
  budgetFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  budgetSpent: { fontSize: 12 },
  budgetLimit: { fontSize: 12 },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
});
