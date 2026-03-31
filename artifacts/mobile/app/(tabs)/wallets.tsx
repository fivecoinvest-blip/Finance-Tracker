import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
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
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ProPaywall } from '@/components/ProPaywall';
import { useCurrency } from '@/context/CurrencyContext';
import { useFinance, type Wallet, type WalletType } from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';
import { useSubscription } from '@/lib/revenuecat';

const FREE_WALLET_LIMIT = 3;

function useCountUp(target: number, duration = 900): number {
  const animRef = useRef(new Animated.Value(0));
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  const listenerRef = useRef<string | null>(null);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = target;

    if (listenerRef.current) animRef.current.removeListener(listenerRef.current);
    animRef.current.setValue(from);

    listenerRef.current = animRef.current.addListener(({ value }) => setDisplay(value));
    Animated.timing(animRef.current, {
      toValue: target,
      duration,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();

    return () => {
      if (listenerRef.current) animRef.current.removeListener(listenerRef.current);
    };
  }, [target]);

  return display;
}

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
  const Colors = useColors();
  const { addWallet, updateWallet } = useFinance();
  const isEdit = !!editWallet;
  const [name, setName] = useState(editWallet?.name ?? '');
  const [type, setType] = useState<WalletType>(editWallet?.type ?? 'cash');
  const [balance, setBalance] = useState(editWallet ? String(editWallet.balance) : '');

  const selectedType = WALLET_TYPES.find(t => t.type === type)!;

  const handleSubmit = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Enter a wallet name'); return; }
    const parsedBalance = parseFloat(balance.replace(/,/g, '')) || 0;
    if (isEdit) {
      await updateWallet(editWallet.id, {
        name: name.trim(),
        type,
        balance: parsedBalance,
        color: selectedType.color,
        icon: selectedType.icon,
      });
    } else {
      await addWallet({ name: name.trim(), type, balance: parsedBalance, color: selectedType.color, icon: selectedType.icon });
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: Colors.card }]}>
          <View style={[styles.modalHandle, { backgroundColor: Colors.border }]} />
          <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>{isEdit ? 'Edit Wallet' : 'Add Wallet'}</Text>

          <Text style={[styles.inputLabel, { color: Colors.textSecondary }]}>Wallet Name</Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: Colors.backgroundDark, color: Colors.textPrimary, borderColor: Colors.border }]}
            placeholder="e.g. BPI Savings"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
          />

          <Text style={[styles.inputLabel, { color: Colors.textSecondary }]}>Type</Text>
          <View style={styles.typeGrid}>
            {WALLET_TYPES.map(t => (
              <TouchableOpacity
                key={t.type}
                style={[styles.typeBtn, { borderColor: Colors.border }, type === t.type && { borderColor: t.color, backgroundColor: t.color + '20' }]}
                onPress={() => setType(t.type)}
              >
                <MaterialIcons name={t.icon as any} size={20} color={type === t.type ? t.color : Colors.textMuted} />
                <Text style={[styles.typeBtnText, { color: Colors.textMuted }, type === t.type && { color: t.color }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.inputLabel, { color: Colors.textSecondary }]}>
            {isEdit ? 'Balance' : 'Starting Balance'}
          </Text>
          <TextInput
            style={[styles.textInput, { backgroundColor: Colors.backgroundDark, color: Colors.textPrimary, borderColor: Colors.border }]}
            placeholder="0.00"
            placeholderTextColor={Colors.textMuted}
            value={balance}
            onChangeText={setBalance}
            keyboardType="decimal-pad"
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: Colors.backgroundDark }]} onPress={onClose}>
              <Text style={[styles.cancelBtnText, { color: Colors.textSecondary }]}>Cancel</Text>
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
  const Colors = useColors();
  const { formatAmount } = useCurrency();
  return (
    <View style={[styles.walletRow, { backgroundColor: Colors.card, borderLeftColor: wallet.color }]}>
      <View style={[styles.walletIconBg, { backgroundColor: wallet.color + '20' }]}>
        <MaterialIcons name={wallet.icon as any} size={22} color={wallet.color} />
      </View>
      <View style={styles.walletInfo}>
        <Text style={[styles.walletName, { color: Colors.textPrimary }]}>{wallet.name}</Text>
        <Text style={[styles.walletType, { color: Colors.textMuted }]}>{wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}</Text>
      </View>
      <Text style={[styles.walletBalance, { color: wallet.balance < 0 ? Colors.danger : Colors.textPrimary }]}>
        {formatAmount(wallet.balance)}
      </Text>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.accent + '18' }]} onPress={onEdit}>
        <MaterialIcons name="edit" size={18} color={Colors.accent} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.danger + '15' }]} onPress={onDelete}>
        <MaterialIcons name="delete-outline" size={18} color={Colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

export default function WalletsScreen() {
  const insets = useSafeAreaInsets();
  const Colors = useColors();
  const { wallets, deleteWallet, getTotalBalance } = useFinance();
  const { formatAmount } = useCurrency();
  const { isSubscribed } = useSubscription();
  const [showAdd, setShowAdd] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [editWallet, setEditWallet] = useState<Wallet | undefined>(undefined);
  const [walletToDelete, setWalletToDelete] = useState<Wallet | undefined>(undefined);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const handleAddWallet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isSubscribed && wallets.length >= FREE_WALLET_LIMIT) {
      setShowPaywall(true);
    } else {
      setShowAdd(true);
    }
  };

  const totalBalance = getTotalBalance();
  const animatedNetWorth = useCountUp(totalBalance);

  const cardScale = useRef(new Animated.Value(0.88)).current;
  useEffect(() => {
    Animated.spring(cardScale, {
      toValue: 1,
      tension: 60,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDeleteConfirmed = async () => {
    if (!walletToDelete) return;
    await deleteWallet(walletToDelete.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setWalletToDelete(undefined);
  };

  return (
    <View style={[styles.screen, { backgroundColor: Colors.backgroundDark }]}>
      <WalletFormModal visible={showAdd} onClose={() => setShowAdd(false)} />
      {editWallet && (
        <WalletFormModal visible={true} onClose={() => setEditWallet(undefined)} editWallet={editWallet} />
      )}
      <ProPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="wallet_limit"
      />
      <ConfirmModal
        visible={!!walletToDelete}
        title="Delete Wallet"
        message={`Remove "${walletToDelete?.name}"? Its transactions will also be deleted and XP reversed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setWalletToDelete(undefined)}
      />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 8, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: Colors.textPrimary }]}>Wallets</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddWallet}>
            <MaterialIcons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.totalCard, { backgroundColor: Colors.card, transform: [{ scale: cardScale }] }]}>
          <Text style={[styles.totalLabel, { color: Colors.textMuted }]}>Net Worth</Text>
          <Text style={[styles.totalAmount, { color: totalBalance < 0 ? Colors.danger : Colors.textPrimary }]}>
            {formatAmount(animatedNetWorth)}
          </Text>
          <Text style={[styles.walletCount, { color: Colors.textMuted }]}>{wallets.length} wallet{wallets.length !== 1 ? 's' : ''}</Text>
          {!isSubscribed && (
            <View style={styles.freeBadge}>
              <Text style={styles.freeBadgeText}>{wallets.length}/{FREE_WALLET_LIMIT} free wallets</Text>
            </View>
          )}
          {isSubscribed && (
            <View style={[styles.freeBadge, { backgroundColor: '#FF6B35' + '20' }]}>
              <MaterialIcons name="workspace-premium" size={12} color="#FF6B35" />
              <Text style={[styles.freeBadgeText, { color: '#FF6B35' }]}>Pro — unlimited wallets</Text>
            </View>
          )}
        </Animated.View>

        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="account-balance-wallet" size={56} color={Colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No wallets yet</Text>
            <Text style={[styles.emptyText, { color: Colors.textMuted }]}>Add a wallet to start tracking your money</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={handleAddWallet}>
              <Text style={styles.emptyBtnText}>Add First Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          wallets.map(w => (
            <WalletRow
              key={w.id}
              wallet={w}
              onEdit={() => setEditWallet(w)}
              onDelete={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setWalletToDelete(w); }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  screenTitle: { fontSize: 28, fontWeight: '700' as const },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FF6B35', justifyContent: 'center', alignItems: 'center' },
  totalCard: { borderRadius: 20, padding: 24, marginBottom: 20, alignItems: 'center', shadowColor: '#FF6B35', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  totalLabel: { fontSize: 13 },
  totalAmount: { fontSize: 34, fontWeight: '700' as const, marginTop: 4 },
  walletCount: { fontSize: 13, marginTop: 4 },
  freeBadge: {
    flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4,
    marginTop: 8, backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
  },
  freeBadgeText: { fontSize: 12, fontWeight: '600' as const, color: '#888' },
  walletRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  walletIconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  walletInfo: { flex: 1 },
  walletName: { fontSize: 15, fontWeight: '600' as const },
  walletType: { fontSize: 11, marginTop: 2 },
  walletBalance: { fontSize: 15, fontWeight: '700' as const, marginRight: 8 },
  actionBtn: { width: 34, height: 34, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700' as const, marginTop: 16 },
  emptyText: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  emptyBtn: { backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginTop: 24 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700' as const, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center' as const, marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '700' as const, marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: '600' as const, marginBottom: 8 },
  textInput: { borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 16, borderWidth: 1 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap' as const, gap: 8, marginBottom: 16 },
  typeBtn: { borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  typeBtnText: { fontSize: 13, fontWeight: '600' as const },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelBtnText: { fontWeight: '600' as const },
  confirmBtn: { flex: 1, backgroundColor: '#FF6B35', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  confirmBtnText: { color: '#FFFFFF', fontWeight: '700' as const },
});
