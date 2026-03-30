import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useColors } from '@/context/ThemeContext';

interface ProgressBarProps {
  progress: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
}

export function ProgressBar({ progress, color, backgroundColor, height = 8, style }: ProgressBarProps) {
  const Colors = useColors();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const barColor = color ?? (progress > 1 ? Colors.danger : progress > 0.8 ? Colors.warning : Colors.accent);
  const bgColor = backgroundColor ?? Colors.border;

  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animValue, {
      toValue: clampedProgress,
      tension: 55,
      friction: 9,
      useNativeDriver: false,
    }).start();
  }, [clampedProgress]);

  const animatedWidth = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: bgColor, height }, style]}>
      <Animated.View style={[styles.fill, { width: animatedWidth, backgroundColor: barColor, height }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 100, overflow: 'hidden' },
  fill: { borderRadius: 100 },
});
