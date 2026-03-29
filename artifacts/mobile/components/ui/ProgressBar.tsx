import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface ProgressBarProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export function ProgressBar({ progress, color = Colors.accent, backgroundColor = Colors.border, height = 8, style }: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const barColor = progress > 1 ? Colors.danger : progress > 0.8 ? Colors.warning : color;
  return (
    <View style={[styles.container, { backgroundColor, height }, style]}>
      <View style={[styles.fill, { width: `${clampedProgress * 100}%`, backgroundColor: barColor, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
});
