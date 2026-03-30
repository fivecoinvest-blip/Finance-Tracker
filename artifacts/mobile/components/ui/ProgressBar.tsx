import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useColors } from '@/context/ThemeContext';

interface ProgressBarProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
  animated?: boolean;
}

export function ProgressBar({ progress, color, backgroundColor, height = 8, style }: ProgressBarProps) {
  const Colors = useColors();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const barColor = color ?? (progress > 1 ? Colors.danger : progress > 0.8 ? Colors.warning : Colors.accent);
  const bgColor = backgroundColor ?? Colors.border;

  return (
    <View style={[styles.container, { backgroundColor: bgColor, height }, style]}>
      <View style={[styles.fill, { width: `${clampedProgress * 100}%`, backgroundColor: barColor, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 100, overflow: 'hidden' },
  fill: { borderRadius: 100 },
});
