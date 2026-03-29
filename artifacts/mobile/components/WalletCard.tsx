import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/colors';
import type { Wallet } from '@/context/FinanceContext';

interface WalletCardProps {
  wallet: Wallet;
  onPress?: () => void;
  compact?: boolean;
}

const WALLET_TYPE_LABEL: Record<string, string> = {
  cash: 'Cash', bank: 'Bank Account', savings: 'Savings', ewallet: 'E-Wallet', credit: 'Credit Card',
};

export function WalletCard({ wallet, onPress, compact = false }: WalletCardProps) {
  if (compact) {
    return (
      <TouchableOpacity style={[styles.compactCard, { borderColor: wallet.color }]} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.iconBg, { backgroundColor: wallet.color + '30' }]}>
          <MaterialIcons name={wallet.icon as any} size={20} color={wallet.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.compactName} numberOfLines={1}>{wallet.name}</Text>
          <Text style={styles.compactType}>{WALLET_TYPE_LABEL[wallet.type]}</Text>
        </View>
        <Text style={[styles.compactBalance, { color: wallet.balance >= 0 ? Colors.textPrimary : Colors.danger }]}>
          ₱{Math.abs(wallet.balance).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.card, { borderColor: wallet.color + '50' }]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: wallet.color + '25' }]}>
          <MaterialIcons name={wallet.icon as any} size={28} color={wallet.color} />
        </View>
        <View style={styles.typeTag}>
          <Text style={styles.typeText}>{WALLET_TYPE_LABEL[wallet.type]}</Text>
        </View>
      </View>
      <Text style={styles.walletName}>{wallet.name}</Text>
      <Text style={[styles.balance, { color: wallet.balance < 0 ? Colors.danger : Colors.textPrimary }]}>
        ₱{wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginRight: 12,
    width: 180,
    borderWidth: 1,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  iconContainer: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  typeTag: { backgroundColor: Colors.border, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeText: { color: Colors.textSecondary, fontSize: 10, fontWeight: '600' as const },
  walletName: { color: Colors.textSecondary, fontSize: 13, marginBottom: 4 },
  balance: { fontSize: 22, fontWeight: '700' as const },
  compactCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 14,
    padding: 14, marginBottom: 8, borderWidth: 1,
  },
  iconBg: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  compactName: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' as const },
  compactType: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  compactBalance: { fontSize: 15, fontWeight: '700' as const },
});
