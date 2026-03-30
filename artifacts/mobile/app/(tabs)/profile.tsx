import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AchievementBadge } from '@/components/AchievementBadge';
import { CashperMascot } from '@/components/CashperMascot';
import { CategoryPieChart } from '@/components/SpendingChart';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  DEFAULT_ACHIEVEMENTS,
  useFinance,
  xpForNextLevel,
  xpForCurrentLevel,
  xpProgressInLevel,
  getLevelTitle,
  type Achievement,
} from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';

const ACHIEVEMENT_CATEGORIES: { label: string; icon: string; ids: string[] }[] = [
  { label: 'Tracking',  icon: 'track-changes',          ids: ['first_tx', 'tx_10', 'tx_50', 'tx_100', 'tx_500'] },
  { label: 'Streaks',   icon: 'local-fire-department',  ids: ['streak_3', 'streak_7', 'streak_14', 'streak_30', 'streak_60', 'streak_100'] },
  { label: 'Savings',   icon: 'savings',                ids: ['net_positive', 'saver', 'big_saver'] },
  { label: 'Income',    icon: 'attach-money',           ids: ['first_income', 'high_income'] },
  { label: 'Budgets',   icon: 'pie-chart',              ids: ['budget_maker', 'budget_5', 'under_budget'] },
  { label: 'Wallets',   icon: 'account-balance-wallet', ids: ['wallet_3', 'wallet_5'] },
  { label: 'Special',   icon: 'auto-awesome',           ids: ['category_explorer', 'night_owl', 'early_bird', 'big_ticket'] },
];

function HealthScore({ score }: { score: number }) {
  const Colors = useColors();
  const color = score >= 70 ? Colors.success : score >= 40 ? '#FF9500' : Colors.danger;
  const label = score >= 70 ? 'Healthy' : score >= 40 ? 'Fair' : 'Needs Work';
  const tip   = score >= 70
    ? 'Keep up the great work!'
    : score >= 40
    ? 'Set budgets and grow your streak to improve.'
    : 'Start tracking and set your first budget.';

  return (
    <View style={styles.healthCard}>
      <View style={[styles.healthRing, { borderColor: color + '40' }]}>
        <Text style={[styles.healthNum, { color }]}>{score}</Text>
        <Text style={[styles.healthDen, { color: Colors.textMuted }]}>/ 100</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 20 }}>
        <Text style={[styles.healthTitle, { color: Colors.textPrimary }]}>Financial Health</Text>
        <Text style={[styles.healthStatus, { color }]}>{label}</Text>
        <ProgressBar progress={score / 100} color={color} style={{ marginTop: 8, marginBottom: 8 }} />
        <Text style={[styles.healthTip, { color: Colors.textMuted }]}>{tip}</Text>
      </View>
    </View>
  );
}

function AchievementCategory({
  label, icon, ids, unlockedIds,
}: { label: string; icon: string; ids: string[]; unlockedIds: string[] }) {
  const Colors = useColors();
  const [expanded, setExpanded] = useState(true);
  const achievements = ids.map(id => DEFAULT_ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean) as Achievement[];
  const unlockedCount = achievements.filter(a => unlockedIds.includes(a.id)).length;

  return (
    <View style={styles.categorySection}>
      <TouchableOpacity style={styles.categoryHeader} onPress={() => setExpanded(e => !e)}>
        <View style={[styles.categoryIconBg, { backgroundColor: Colors.accent + '18' }]}>
          <MaterialIcons name={icon as any} size={16} color={Colors.accent} />
        </View>
        <Text style={[styles.categoryLabel, { color: Colors.textPrimary }]}>{label}</Text>
        <View style={[styles.categoryPill, { backgroundColor: unlockedCount === achievements.length ? Colors.success + '25' : Colors.border }]}>
          <Text style={[styles.categoryPillText, { color: unlockedCount === achievements.length ? Colors.success : Colors.textMuted }]}>
            {unlockedCount}/{achievements.length}
          </Text>
        </View>
        <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={20} color={Colors.textMuted} />
      </TouchableOpacity>

      {expanded && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgeRow}>
          {achievements.map(a => (
            <AchievementBadge key={a.id} achievement={a} unlocked={unlockedIds.includes(a.id)} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const Colors = useColors();
  const { stats, budgets, getMonthlyIncome, getMonthlyExpenses, getBudgetUsage } = useFinance();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const level      = stats.level;
  const levelTitle = getLevelTitle(level);
  const xpStart    = xpForCurrentLevel(level);
  const xpEnd      = xpForNextLevel(level);
  const xpInLevel  = stats.xp - xpStart;
  const xpNeeded   = xpEnd - xpStart;
  const progress   = xpProgressInLevel(stats.xp);

  const monthlyIncome   = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const savingsRate     = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  const overBudgetCount = budgets.filter(b => getBudgetUsage(b.id) > 1).length;
  const healthScore     = Math.round(Math.min(100, Math.max(0,
    (savingsRate > 0 ? Math.min(40, savingsRate * 2) : 0)
    + (stats.streak > 0 ? Math.min(20, stats.streak * 2) : 0)
    + (budgets.length > 0 ? 20 : 0)
    + (overBudgetCount === 0 ? 20 : 0)
  )));

  const unlockedIds = stats.achievements;
  const totalUnlocked = unlockedIds.length;
  const totalAchievements = DEFAULT_ACHIEVEMENTS.length;

  return (
    <View style={[styles.screen, { backgroundColor: Colors.backgroundDark }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 8, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: Colors.textPrimary }]}>Profile</Text>
          <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: Colors.card }]} onPress={() => router.push('/settings')}>
            <MaterialIcons name="settings" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Level card */}
        <Card style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <CashperMascot mood="happy" size={64} showMessage={false} />
            <View style={styles.levelInfo}>
              <View style={styles.levelTitleRow}>
                <Text style={[styles.levelNum, { color: Colors.accent }]}>Lvl {level}</Text>
                <View style={[styles.titleBadge, { backgroundColor: Colors.accent + '20' }]}>
                  <Text style={[styles.titleBadgeText, { color: Colors.accent }]}>{levelTitle}</Text>
                </View>
              </View>
              <View style={styles.xpRow}>
                <Text style={[styles.xpLabel, { color: Colors.textMuted }]}>
                  {xpInLevel.toLocaleString()} / {xpNeeded.toLocaleString()} XP to next level
                </Text>
              </View>
              <ProgressBar progress={progress} color={Colors.accent} style={styles.xpBar} />
              <Text style={[styles.totalXP, { color: Colors.textMuted }]}>
                {stats.xp.toLocaleString()} XP total
              </Text>
            </View>
          </View>

          <View style={[styles.statsRow, { backgroundColor: Colors.cardLight }]}>
            <View style={styles.statItem}>
              <MaterialIcons name="local-fire-department" size={20} color={Colors.accent} />
              <Text style={[styles.statValue, { color: Colors.textPrimary }]}>{stats.streak}</Text>
              <Text style={[styles.statLabel, { color: Colors.textMuted }]}>Streak</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: Colors.border }]} />
            <View style={styles.statItem}>
              <MaterialIcons name="receipt-long" size={20} color={Colors.info} />
              <Text style={[styles.statValue, { color: Colors.textPrimary }]}>{stats.totalTransactions}</Text>
              <Text style={[styles.statLabel, { color: Colors.textMuted }]}>Logged</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: Colors.border }]} />
            <View style={styles.statItem}>
              <MaterialIcons name="emoji-events" size={20} color={Colors.xpGold} />
              <Text style={[styles.statValue, { color: Colors.textPrimary }]}>{totalUnlocked}/{totalAchievements}</Text>
              <Text style={[styles.statLabel, { color: Colors.textMuted }]}>Badges</Text>
            </View>
          </View>
        </Card>

        {/* XP breakdown */}
        <Card style={styles.xpCard}>
          <Text style={[styles.xpCardTitle, { color: Colors.textPrimary }]}>XP per Action</Text>
          <View style={styles.xpBreakdownGrid}>
            {[
              { icon: 'attach-money', label: 'Income', xp: '+15 XP', color: Colors.income },
              { icon: 'shopping-cart', label: 'Expense', xp: '+12 XP', color: Colors.expense },
              { icon: 'swap-horiz', label: 'Transfer', xp: '+8 XP', color: Colors.info },
              { icon: 'notes', label: '+ Note/Desc', xp: '+2–5 XP', color: Colors.accent },
              { icon: 'account-balance-wallet', label: 'New Wallet', xp: '+15 XP', color: Colors.success },
              { icon: 'pie-chart', label: 'New Budget', xp: '+25 XP', color: '#9B59B6' },
            ].map(item => (
              <View key={item.label} style={[styles.xpBreakdownItem, { backgroundColor: Colors.cardLight }]}>
                <MaterialIcons name={item.icon as any} size={18} color={item.color} />
                <Text style={[styles.xpBreakdownLabel, { color: Colors.textSecondary }]}>{item.label}</Text>
                <Text style={[styles.xpBreakdownXP, { color: item.color }]}>{item.xp}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Financial health */}
        <Card style={styles.section}>
          <HealthScore score={healthScore} />
        </Card>

        {/* Spending chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Spending by Category</Text>
          <Card>
            <CategoryPieChart />
          </Card>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.achievementsHeader}>
            <Text style={[styles.sectionTitle, { color: Colors.textPrimary }]}>Achievements</Text>
            <View style={[styles.achievementsPill, { backgroundColor: Colors.xpGold + '25' }]}>
              <MaterialIcons name="emoji-events" size={14} color={Colors.xpGold} />
              <Text style={[styles.achievementsPillText, { color: Colors.xpGold }]}>
                {totalUnlocked}/{totalAchievements}
              </Text>
            </View>
          </View>

          {ACHIEVEMENT_CATEGORIES.map(cat => (
            <AchievementCategory
              key={cat.label}
              label={cat.label}
              icon={cat.icon}
              ids={cat.ids}
              unlockedIds={unlockedIds}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.insightsBtn, { backgroundColor: Colors.card, borderColor: Colors.accent + '30' }]}
          onPress={() => router.push('/ai-insights')}
        >
          <MaterialIcons name="auto-awesome" size={20} color={Colors.accent} />
          <Text style={[styles.insightsBtnText, { color: Colors.textPrimary }]}>View AI Insights</Text>
          <MaterialIcons name="chevron-right" size={20} color={Colors.accent} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700' as const },
  settingsBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  levelCard: { marginBottom: 16 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 16 },
  levelInfo: { flex: 1 },
  levelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  levelNum: { fontSize: 22, fontWeight: '800' as const },
  titleBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3 },
  titleBadgeText: { fontSize: 13, fontWeight: '700' as const },
  xpRow: { marginBottom: 6 },
  xpLabel: { fontSize: 12 },
  xpBar: { marginBottom: 4 },
  totalXP: { fontSize: 11 },

  statsRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '700' as const },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, height: 36 },

  xpCard: { marginBottom: 16 },
  xpCardTitle: { fontSize: 14, fontWeight: '700' as const, marginBottom: 12 },
  xpBreakdownGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  xpBreakdownItem: { width: '47%', flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10 },
  xpBreakdownLabel: { flex: 1, fontSize: 12, fontWeight: '500' as const },
  xpBreakdownXP: { fontSize: 12, fontWeight: '700' as const },

  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, marginBottom: 12 },

  healthCard: { flexDirection: 'row', alignItems: 'center' },
  healthRing: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  healthNum: { fontSize: 28, fontWeight: '800' as const, lineHeight: 32 },
  healthDen: { fontSize: 11 },
  healthTitle: { fontSize: 16, fontWeight: '700' as const },
  healthStatus: { fontSize: 14, fontWeight: '600' as const, marginTop: 2 },
  healthTip: { fontSize: 12, lineHeight: 18 },

  achievementsHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  achievementsPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 8 },
  achievementsPillText: { fontSize: 13, fontWeight: '700' as const },

  categorySection: { marginBottom: 16 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  categoryIconBg: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  categoryLabel: { flex: 1, fontSize: 14, fontWeight: '700' as const },
  categoryPill: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  categoryPillText: { fontSize: 12, fontWeight: '700' as const },
  badgeRow: { paddingLeft: 2 },

  insightsBtn: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4, borderWidth: 1 },
  insightsBtnText: { fontSize: 15, fontWeight: '600' as const, flex: 1 },
});
