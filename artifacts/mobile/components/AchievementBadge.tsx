import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Achievement } from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';

const CATEGORY_COLORS: Record<string, string> = {
  // Tracking
  first_tx: '#2980B9', tx_10: '#2980B9', tx_50: '#2980B9', tx_100: '#2980B9', tx_500: '#2980B9',
  // Streaks
  streak_3: '#FF6B35', streak_7: '#FF6B35', streak_14: '#FF6B35', streak_30: '#FF6B35', streak_60: '#FF6B35', streak_100: '#FF6B35',
  // Savings
  net_positive: '#27AE60', saver: '#27AE60', big_saver: '#27AE60',
  // Income
  first_income: '#27AE60', high_income: '#27AE60',
  // Budgets
  budget_maker: '#9B59B6', budget_5: '#9B59B6', under_budget: '#9B59B6',
  // Wallets
  wallet_3: '#E67E22', wallet_5: '#E67E22',
  // Special
  category_explorer: '#E91E63', night_owl: '#673AB7', early_bird: '#FF9800', big_ticket: '#F44336',
};

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
}

export function AchievementBadge({ achievement, unlocked }: AchievementBadgeProps) {
  const Colors = useColors();
  const color = unlocked ? (CATEGORY_COLORS[achievement.id] ?? Colors.accent) : Colors.textMuted;

  return (
    <View style={[
      styles.container,
      { backgroundColor: Colors.card, borderColor: unlocked ? color + '45' : Colors.border },
    ]}>
      {unlocked && (
        <View style={[styles.unlockedRibbon, { backgroundColor: color }]}>
          <MaterialIcons name="check" size={10} color="#fff" />
        </View>
      )}

      <View style={[styles.iconBg, {
        backgroundColor: unlocked ? color + '22' : Colors.cardLight,
        borderColor: unlocked ? color + '40' : Colors.border,
      }]}>
        {unlocked
          ? <MaterialIcons name={achievement.icon as any} size={26} color={color} />
          : <MaterialIcons name="lock" size={22} color={Colors.textMuted} />
        }
      </View>

      <Text
        style={[styles.title, { color: unlocked ? Colors.textPrimary : Colors.textMuted }]}
        numberOfLines={1}
      >
        {achievement.title}
      </Text>

      <Text style={[styles.desc, { color: Colors.textMuted }]} numberOfLines={2}>
        {achievement.description}
      </Text>

      <View style={[styles.xpBadge, { backgroundColor: unlocked ? color + '18' : Colors.cardLight }]}>
        <MaterialIcons name="bolt" size={12} color={unlocked ? color : Colors.textMuted} />
        <Text style={[styles.xpText, { color: unlocked ? color : Colors.textMuted }]}>
          {achievement.xp.toLocaleString()} XP
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 126,
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    marginRight: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  unlockedRibbon: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: '700' as const,
    textAlign: 'center',
    marginBottom: 4,
  },
  desc: {
    fontSize: 10,
    textAlign: 'center',
    lineHeight: 14,
    marginBottom: 8,
    minHeight: 28,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  xpText: {
    fontSize: 11,
    fontWeight: '700' as const,
  },
});
