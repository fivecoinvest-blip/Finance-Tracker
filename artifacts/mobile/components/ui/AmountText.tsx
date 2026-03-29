import React from 'react';
import { Text, TextStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface AmountTextProps {
  amount: number;
  type?: 'income' | 'expense' | 'neutral' | 'transfer';
  style?: TextStyle;
  showSign?: boolean;
  prefix?: string;
}

export function AmountText({ amount, type = 'neutral', style, showSign = true, prefix = '₱' }: AmountTextProps) {
  const color = type === 'income' ? Colors.income
    : type === 'expense' ? Colors.expense
    : type === 'transfer' ? Colors.transfer
    : Colors.textPrimary;

  const sign = showSign && type === 'income' ? '+' : type === 'expense' ? '-' : '';

  return (
    <Text style={[{ color, fontWeight: '700' as const }, style]}>
      {sign}{prefix}{Math.abs(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </Text>
  );
}
