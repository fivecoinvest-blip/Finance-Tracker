import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useCurrency } from '@/context/CurrencyContext';
import { useColors } from '@/context/ThemeContext';

interface AmountTextProps {
  amount: number;
  type?: 'income' | 'expense' | 'neutral' | 'transfer';
  style?: TextStyle;
  showSign?: boolean;
}

export function AmountText({ amount, type = 'neutral', style, showSign = true }: AmountTextProps) {
  const Colors = useColors();
  const { formatAmount } = useCurrency();
  const color = type === 'income' ? Colors.income
    : type === 'expense' ? Colors.expense
    : type === 'transfer' ? Colors.transfer
    : Colors.textPrimary;
  const sign = showSign && type === 'income' ? '+' : type === 'expense' ? '-' : '';

  return (
    <Text style={[{ color, fontWeight: '700' as const }, style]}>
      {sign}{formatAmount(amount)}
    </Text>
  );
}
