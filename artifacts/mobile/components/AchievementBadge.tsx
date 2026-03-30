import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Achievement } from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
}

export function AchievementBadge({ achievement, unlocked }: AchievementBadgeProps) {
  const Colors = useColors();
  return (
    <View style={[
      styles.container,
      { backgroundColor: Colors.card, borderColor: unlocked ? Colors.accent + '40' : Colors.border },
      !unlocked && styles.locked,
    ]}>
      <View style={[styles.iconBg, { backgroundColor: unlocked ? Colors.accent + '25' : Colors.border }]}>
        <MaterialIcons name={achievement.icon as any} size={28} color={unlocked ? Colors.accent : Colors.textMuted} />
      </View>
      <Text style={[styles.title, { color: unlocked ? Colors.textPrimary : Colors.textMuted }]} numberOfLines={1}>{achievement.title}</Text>
      <Text style={[styles.desc, { color: Colors.textMuted }]} numberOfLines={2}>{achievement.description}</Text>
      <View style={styles.xpBadge}>
        <Text style={[styles.xpText, { color: unlocked ? Colors.accent : Colors.textMuted }]}>+{achievement.xp} XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 130, alignItems: 'center', borderRadius: 16, padding: 14, marginRight: 10, borderWidth: 1 },
  locked: { opacity: 0.5 },
  iconBg: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  title: { fontSize: 13, fontWeight: '700' as const, textAlign: 'center', marginBottom: 4 },
  desc: { fontSize: 11, textAlign: 'center', lineHeight: 14 },
  xpBadge: { marginTop: 8 },
  xpText: { fontSize: 12, fontWeight: '700' as const },
});
