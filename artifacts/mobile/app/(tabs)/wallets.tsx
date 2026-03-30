import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
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
import { Colors } from '@/constants/colors';
import { useFinance, type Wallet, type WalletType } from '@/context/FinanceContext';

const WALLET_TYPES: { type: WalletType; label: string; icon: string; color: string }[] = [
  { type: 'cash', label: 'Cash', icon: 'payments', color: '#27AE60' },
  { type: 'bank', label: 'Bank', icon: 'account-balance', color: '#3498DB' },
  { type: 'savings', label: 'Savings', icon: 'savings', color: '#9B59B6' },
  { type: 'ewallet', label: 'E-Wallet', icon: 'phone-android', color: '#E67E22' },
  { type: 'credit', label: 'Credit Card', icon: 'credit-card', color: '#E74C3C' },
];

interface WalletFormModalProps {
  visible: boolean;
  onClose: () => void;
  editWallet?: Wallet;
}

function WalletFormModal({ visible, onClose, editWallet }: WalletFormModalProps) {
  const { addWallet, updateWallet } = useFinance();
  const [name, setName] = useState(editWallet?.name ?? '');
  const [type, setType] = useState<WalletType>(editWallet?.type ?? 'cash');
  const [balance, setBalance] = useState(editWallet ? String(editWallet.balance) : '');

  const isEdit = !!editWallet;
  const selectedType = WALLET_TYPES.find(t => t.type === type)!;

  const handleSubmit = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Enter a wallet name'); return; }
    const parsed = parseFloat(balance.replace(/,/g, '')) || 0;
    if (isEdit) {
      await updateWallet(editWallet.id, {
        name: name.trim(),
        type,
        color: selectedType.color,
        icon: selectedType.icon,
      });
    } else {
      await addWallet({ name: name.trim(), type, balance: parsed, color: selectedType.color, icon: selectedType.icon });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{isEdit ? 'Edit Wallet' : 'Add Wallet'}</Text>

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

          {!isEdit && (
            <>
              <Text style={styles.inputLabel}>Starting Balance (₱)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
                value={balance}
                onChangeText={setBalance}
                keyboardType="decimal-pad"
              />
            </>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleSubmit}>
              <Text style={styles.confirmBtnText}>{isEdit ? 'Save Changes' : 'Add Wallet'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function WalletRow({ wallet, onEdit, onDelete }: { wallet: Wallet; onEdit: () => void; onDelete: () => void }) {
  return (
    <View style={[styles.walletRow, { borderLeftColor: wallet.color }]}>
      <View style={[styles.walletIconBg, { backgroundColor: wallet.color + '20' }]}>
        <MaterialIcons name={wallet.icon as any} size={22} color={wallet.color} />
      </View>
      <View style={styles.walletInfo}>
        <Text style={styles.walletName}>{wallet.name}</Text>
        <Text style={styles.walletType}>{wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}</Text>
      </View>
      <Text style={[styles.walletBalance, { color: wallet.balance < 0 ? Colors.danger : Colors.textPrimary }]}>
        ₱{wallet.balance.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </Text>
      <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
        <MaterialIcons name="edit" size={18} color={Colors.accent} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
        <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

export default function WalletsScreen() {
  const insets = useSafeAreaInsets();
  const { wallets, deleteWallet, getTotalBalance } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [editWallet, setEditWallet] = useState<Wallet | undefined>(undefined);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const handleDelete = (wallet: Wallet) => {
    Alert.alert(
      'Delete Wallet',
      `Remove "${wallet.name}"? This will not delete its transactions.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive', onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            await deleteWallet(wallet.id);
          }
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <WalletFormModal visible={showAdd} onClose={() => setShowAdd(false)} />
      {editWallet && (
        <WalletFormModal visible={true} onClose={() => setEditWallet(undefined)} editWallet={editWallet} />
      )}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 8, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>Wallets</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowAdd(true); }}>
            <MaterialIcons name="add" size={22} color="#FFFFFF" />
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
          wallets.map(w => (
            <WalletRow
              key={w.id}
              wallet={w}
              onEdit={() => setEditWallet(w)}
              onDelete={() => handleDelete(w)}
            />
          ))
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
  totalCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 24, marginBottom: 20, alignItems: 'center', shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  totalLabel: { color: Colors.textMuted, fontSize: 13 },
  totalAmount: { color: Colors.textPrimary, fontSize: 34, fontWeight: '700' as const, marginTop: 4 },
  walletCount: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  walletRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  walletIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  walletInfo: { flex: 1 },
  walletName: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' as const },
  walletType: { color: Colors.textMuted, fontSize: 11, marginTop: 2 },
  walletBalance: { fontSize: 15, fontWeight: '700' as const, marginRight: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 9, backgroundColor: Colors.backgroundDark, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' as const, marginTop: 16 },
  emptyText: { color: Colors.textMuted, fontSize: 14, marginTop: 8, textAlign: 'center' },
  emptyBtn: { backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginTop: 24 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700' as const, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { color: Colors.textPrimary, fontSize: 22, fontWeight: '700' as const, marginBottom: 20 },
  inputLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' as const, marginBottom: 8 },
  textInput: { backgroundColor: Colors.backgroundDark, borderRadius: 14, padding: 14, color: Colors.textPrimary, fontSize: 15, marginBottom: 16, borderWidth: 1, borderColor: Colors.border },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 8, marginBottom: 16 },
  typeBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' as const },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, backgroundColor: Colors.backgroundDark, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { color: Colors.textSecondary, fontWeight: '600' as const },
  confirmBtn: { flex: 1, backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700' as const },
});
