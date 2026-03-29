import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { Achievement } from '@/context/FinanceContext';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
}

export function AchievementBadge({ achievement, unlocked }: AchievementBadgeProps) {
  return (
    <View style={[styles.container, !unlocked && styles.locked]}>
      <View style={[styles.iconBg, { backgroundColor: unlocked ? Colors.accent + '25' : Colors.border }]}>
        <MaterialIcons
          name={achievement.icon as any}
          size={28}
          color={unlocked ? Colors.accent : Colors.textMuted}
        />
      </View>
      <Text style={[styles.title, !unlocked && styles.lockedText]} numberOfLines={1}>{achievement.title}</Text>
      <Text style={styles.desc} numberOfLines={2}>{achievement.description}</Text>
      <View style={styles.xpBadge}>
        <Text style={[styles.xpText, !unlocked && styles.lockedText]}>+{achievement.xp} XP</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 130, alignItems: 'center', backgroundColor: Colors.card,
    borderRadius: 16, padding: 14, marginRight: 10,
    borderWidth: 1, borderColor: Colors.accent + '40',
  },
  locked: { borderColor: Colors.border, opacity: 0.5 },
  iconBg: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  title: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' as const, textAlign: 'center', marginBottom: 4 },
  desc: { color: Colors.textMuted, fontSize: 11, textAlign: 'center', lineHeight: 14 },
  lockedText: { color: Colors.textMuted },
  xpBadge: { marginTop: 8 },
  xpText: { color: Colors.accent, fontSize: 12, fontWeight: '700' as const },
});
