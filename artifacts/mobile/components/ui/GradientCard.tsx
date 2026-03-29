import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

interface GradientCardProps {
  children: React.ReactNode;
  colors: string[];
  style?: ViewStyle;
  onPress?: () => void;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function GradientCard({ children, colors, style, onPress, start = { x: 0, y: 0 }, end = { x: 1, y: 1 } }: GradientCardProps) {
  const content = (
    <LinearGradient colors={colors as [string, string, ...string[]]} start={start} end={end} style={[styles.card, style]}>
      {children}
    </LinearGradient>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={style}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
});
