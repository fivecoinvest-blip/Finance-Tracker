import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCurrency } from '@/context/CurrencyContext';
import type { Wallet } from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';

interface WalletCardProps {
  wallet: Wallet;
  onPress?: () => void;
  compact?: boolean;
}

const WALLET_TYPE_LABEL: Record<string, string> = {
  cash: 'Cash', bank: 'Bank Account', savings: 'Savings', ewallet: 'E-Wallet', credit: 'Credit Card',
};

export function WalletCard({ wallet, onPress, compact = false }: WalletCardProps) {
  const Colors = useColors();
  const { formatAmount, formatAmountShort } = useCurrency();

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactCard, { backgroundColor: Colors.card, borderLeftColor: wallet.color }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.iconBg, { backgroundColor: wallet.color + '20' }]}>
          <MaterialIcons name={wallet.icon as any} size={20} color={wallet.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[styles.compactName, { color: Colors.textPrimary }]} numberOfLines={1}>{wallet.name}</Text>
          <Text style={[styles.compactType, { color: Colors.textMuted }]}>{WALLET_TYPE_LABEL[wallet.type]}</Text>
        </View>
        <Text style={[styles.compactBalance, { color: wallet.balance >= 0 ? Colors.textPrimary : Colors.danger }]}>
          {formatAmountShort(wallet.balance)}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: Colors.card }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.topBar, { backgroundColor: wallet.color }]} />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: wallet.color + '18' }]}>
            <MaterialIcons name={wallet.icon as any} size={26} color={wallet.color} />
          </View>
          <View style={[styles.typeTag, { backgroundColor: wallet.color + '14' }]}>
            <Text style={[styles.typeText, { color: wallet.color }]}>{WALLET_TYPE_LABEL[wallet.type]}</Text>
          </View>
        </View>
        <Text style={[styles.walletName, { color: Colors.textSecondary }]}>{wallet.name}</Text>
        <Text style={[styles.balance, { color: wallet.balance < 0 ? Colors.danger : Colors.textPrimary }]}>
          {formatAmount(wallet.balance)}
        </Text>
        {wallet.balance < 0 && (
          <View style={[styles.negativeWarning, { backgroundColor: Colors.danger + '15' }]}>
            <MaterialIcons name="warning-amber" size={12} color={Colors.danger} />
            <Text style={[styles.negativeWarningText, { color: Colors.danger }]}>Negative balance</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginRight: 12,
    width: 180,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topBar: { height: 5, width: '100%' },
  body: { padding: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  typeTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 10, fontWeight: '700' as const },
  walletName: { fontSize: 13, marginBottom: 4 },
  balance: { fontSize: 20, fontWeight: '700' as const },
  compactCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 14, marginBottom: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  compactName: { fontSize: 14, fontWeight: '600' as const },
  compactType: { fontSize: 11, marginTop: 2 },
  compactBalance: { fontSize: 15, fontWeight: '700' as const },
  negativeWarning: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
  negativeWarningText: { fontSize: 10, fontWeight: '600' as const },
});
