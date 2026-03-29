import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WalletCard } from '@/components/WalletCard';
import { Colors } from '@/constants/colors';
import { useFinance, type Wallet, type WalletType } from '@/context/FinanceContext';

const WALLET_TYPES: { type: WalletType; label: string; icon: string; color: string }[] = [
  { type: 'cash', label: 'Cash', icon: 'payments', color: '#27AE60' },
  { type: 'bank', label: 'Bank', icon: 'account-balance', color: '#3498DB' },
  { type: 'savings', label: 'Savings', icon: 'savings', color: '#9B59B6' },
  { type: 'ewallet', label: 'E-Wallet', icon: 'phone-android', color: '#E67E22' },
  { type: 'credit', label: 'Credit Card', icon: 'credit-card', color: '#E74C3C' },
];

function AddWalletModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addWallet } = useFinance();
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('cash');
  const [balance, setBalance] = useState('');

  const selectedType = WALLET_TYPES.find(t => t.type === type)!;

  const handleAdd = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Enter a wallet name'); return; }
    await addWallet({
      name: name.trim(),
      type,
      balance: parseFloat(balance.replace(/,/g, '')) || 0,
      color: selectedType.color,
      icon: selectedType.icon,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setName(''); setType('cash'); setBalance('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Add Wallet</Text>

          <Text style={styles.inputLabel}>Wallet Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. BPI Savings"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.inputLabel}>Type</Text>
          <View style={styles.typeGrid}>
            {WALLET_TYPES.map(t => (
              <TouchableOpacity
                key={t.type}
                style={[styles.typeBtn, type === t.type && { borderColor: t.color, backgroundColor: t.color + '20' }]}
                onPress={() => setType(t.type)}
              >
                <MaterialIcons name={t.icon as any} size={20} color={type === t.type ? t.color : Colors.textMuted} />
                <Text style={[styles.typeBtnText, type === t.type && { color: t.color }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Starting Balance (₱)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0.00"
            placeholderTextColor={Colors.textMuted}
            value={balance}
            onChangeText={setBalance}
            keyboardType="decimal-pad"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleAdd}>
              <Text style={styles.confirmBtnText}>Add Wallet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function WalletsScreen() {
  const insets = useSafeAreaInsets();
  const { wallets, getTotalBalance } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={styles.screen}>
      <AddWalletModal visible={showAdd} onClose={() => setShowAdd(false)} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 8, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Wallets</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowAdd(true); }}>
            <MaterialIcons name="add" size={22} color={Colors.textDark} />
          </TouchableOpacity>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Net Worth</Text>
          <Text style={styles.totalAmount}>
            ₱{getTotalBalance().toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text style={styles.walletCount}>{wallets.length} wallet{wallets.length !== 1 ? 's' : ''}</Text>
        </View>

        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="account-balance-wallet" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No wallets yet</Text>
            <Text style={styles.emptyText}>Add a wallet to start tracking your money</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowAdd(true)}>
              <Text style={styles.emptyBtnText}>Add First Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          wallets.map(w => <WalletCard key={w.id} wallet={w} compact />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundDark },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { color: Colors.textPrimary, fontSize: 28, fontWeight: '700' as const },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: Colors.accent, justifyContent: 'center', alignItems: 'center' },
  totalCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 24, marginBottom: 20, alignItems: 'center' },
  totalLabel: { color: Colors.textMuted, fontSize: 13 },
  totalAmount: { color: Colors.textPrimary, fontSize: 34, fontWeight: '700' as const, marginTop: 4 },
  walletCount: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' as const, marginTop: 16 },
  emptyText: { color: Colors.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center' },
  emptyBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginTop: 24 },
  emptyBtnText: { color: Colors.textDark, fontWeight: '700' as const, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: '#000000BB', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.backgroundMid, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700' as const, marginBottom: 20 },
  inputLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' as const, marginBottom: 8 },
  textInput: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, color: Colors.textPrimary, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' as const },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: Colors.card, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' as const },
  confirmBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { color: Colors.textDark, fontWeight: '700' as const },
});
