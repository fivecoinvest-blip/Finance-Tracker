import { MaterialIcons } from '@expo/vector-icons';
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
import { AchievementBadge } from '@/components/AchievementBadge';
import { CashperMascot } from '@/components/CashperMascot';
import { CategoryPieChart } from '@/components/SpendingChart';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Colors } from '@/constants/colors';
import { DEFAULT_ACHIEVEMENTS, useFinance, xpForNextLevel, xpToLevel } from '@/context/FinanceContext';
import { router } from 'expo-router';

function HealthScore({ score }: { score: number }) {
  const color = score >= 70 ? Colors.success : score >= 40 ? Colors.warning : Colors.danger;
  const label = score >= 70 ? 'Healthy' : score >= 40 ? 'Fair' : 'Needs Work';

  return (
    <View style={styles.healthCard}>
      <View style={styles.healthScoreCircle}>
        <Text style={[styles.healthScoreNum, { color }]}>{score}</Text>
        <Text style={styles.healthScoreLabel}>/ 100</Text>
      </View>
      <View style={{ flex: 1, marginLeft: 20 }}>
        <Text style={styles.healthTitle}>Financial Health</Text>
        <Text style={[styles.healthStatus, { color }]}>{label}</Text>
        <ProgressBar progress={score / 100} color={color} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { stats, achievements, transactions, budgets, getMonthlyIncome, getMonthlyExpenses, getBudgetUsage } = useFinance();
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const xpNeeded = xpForNextLevel(stats.level);
  const xpProgress = xpNeeded > 0 ? stats.xp / xpNeeded : 0;

  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

  const overBudgetCount = budgets.filter(b => getBudgetUsage(b.id) > 1).length;
  const healthScore = Math.round(
    Math.min(100, Math.max(0,
      (savingsRate > 0 ? Math.min(40, savingsRate * 2) : 0)
      + (stats.streak > 0 ? Math.min(20, stats.streak * 2) : 0)
      + (budgets.length > 0 ? 20 : 0)
      + (overBudgetCount === 0 ? 20 : 0)
    ))
  );

  const unlockedAchievements = achievements.filter(a => stats.achievements.includes(a.id));
  const lockedAchievements = achievements.filter(a => !stats.achievements.includes(a.id));
  const allAchievements = [...unlockedAchievements, ...lockedAchievements];

  const levelTitle = stats.level <= 3 ? 'Beginner' : stats.level <= 7 ? 'Tracker' : stats.level <= 12 ? 'Saver' : stats.level <= 20 ? 'Expert' : 'Master';

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 8, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')}>
            <MaterialIcons name="settings" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Card style={styles.levelCard}>
          <View style={styles.levelHeader}>
            <CashperMascot mood="happy" size={60} showMessage={false} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.levelTitle}>Level {stats.level} {levelTitle}</Text>
              <Text style={styles.xpText}>{stats.xp.toLocaleString()} / {xpNeeded.toLocaleString()} XP</Text>
              <ProgressBar progress={xpProgress} color={Colors.accent} style={{ marginTop: 8 }} />
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialIcons name="local-fire-department" size={20} color={Colors.accent} />
              <Text style={styles.statValue}>{stats.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="receipt-long" size={20} color={Colors.info} />
              <Text style={styles.statValue}>{stats.totalTransactions}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="emoji-events" size={20} color={Colors.xpGold} />
              <Text style={styles.statValue}>{stats.achievements.length}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.section}>
          <HealthScore score={healthScore} />
        </Card>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spending by Category</Text>
          <Card>
            <CategoryPieChart />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {allAchievements.map(a => (
              <AchievementBadge key={a.id} achievement={a} unlocked={stats.achievements.includes(a.id)} />
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.insightsBtn} onPress={() => router.push('/ai-insights')}>
          <MaterialIcons name="auto-awesome" size={20} color={Colors.accent} />
          <Text style={styles.insightsBtnText}>View AI Insights</Text>
          <MaterialIcons name="chevron-right" size={20} color={Colors.accent} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundDark },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: Colors.textPrimary, fontSize: 28, fontWeight: '700' as const },
  settingsBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  levelCard: { marginBottom: 16 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 60, height: 60, borderRadius: 20, backgroundColor: Colors.accent + '20', justifyContent: 'center', alignItems: 'center' },
  levelTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' as const },
  xpText: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardLight, borderRadius: 14, padding: 16 },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' as const },
  statLabel: { color: Colors.textMuted, fontSize: 11 },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  section: { marginBottom: 20 },
  sectionTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' as const, marginBottom: 12 },
  healthCard: { flexDirection: 'row', alignItems: 'center' },
  healthScoreCircle: { alignItems: 'center' },
  healthScoreNum: { fontSize: 42, fontWeight: '700' as const },
  healthScoreLabel: { color: Colors.textMuted, fontSize: 12 },
  healthTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' as const },
  healthStatus: { fontSize: 14, fontWeight: '600' as const, marginTop: 2 },
  insightsBtn: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4,
    borderWidth: 1, borderColor: Colors.accent + '30',
  },
  insightsBtnText: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' as const, flex: 1 },
});
