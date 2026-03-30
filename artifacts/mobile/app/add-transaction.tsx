import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CATEGORY_COLORS } from '@/constants/colors';
import { useFinance, type RecurringFrequency, type TransactionType } from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Savings', 'Salary', 'Other'];
const RECURRING: { value: RecurringFrequency; label: string }[] = [
  { value: 'none', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function AddTransactionScreen() {
  const insets = useSafeAreaInsets();
  const Colors = useColors();
  const { wallets, addTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id ?? '');
  const [recurring, setRecurring] = useState<RecurringFrequency>('none');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const availableToWallets = wallets.filter(w => w.id !== walletId);

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    if (t === 'transfer') {
      const first = wallets.find(w => w.id !== walletId);
      if (first) setToWalletId(first.id);
    }
  };

  const handleFromWalletChange = (id: string) => {
    setWalletId(id);
    if (type === 'transfer' && toWalletId === id) {
      const other = wallets.find(w => w.id !== id);
      setToWalletId(other?.id ?? '');
    }
  };

  const handleSave = async () => {
    if (!amount || parseFloat(amount.replace(/,/g, '')) <= 0) { Alert.alert('Error', 'Enter a valid amount'); return; }
    if (!walletId) { Alert.alert('Error', 'Select a wallet'); return; }
    if (type === 'transfer') {
      if (wallets.length < 2) { Alert.alert('Need more wallets', 'Add at least 2 wallets to make a transfer.'); return; }
      if (!toWalletId || toWalletId === walletId) { Alert.alert('Error', 'Select a different destination wallet'); return; }
    }
    setSaving(true);
    try {
      await addTransaction({
        type,
        amount: parseFloat(amount.replace(/,/g, '')),
        category: type === 'transfer' ? 'Transfer' : category,
        description: description.trim(),
        walletId,
        toWalletId: type === 'transfer' ? toWalletId : undefined,
        date: new Date().toISOString(),
        recurring,
        notes: notes.trim(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const typeColor = (t: TransactionType) => t === 'income' ? Colors.income : t === 'expense' ? Colors.expense : Colors.transfer;

  return (
    <View style={[styles.screen, { backgroundColor: Colors.backgroundDark }]}>
      <View style={[styles.header, { paddingTop: (Platform.OS === 'web' ? 16 : insets.top) + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: Colors.card }]}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>Add Transaction</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.innerContent}>
          <View style={styles.typeRow}>
            {(['expense', 'income', 'transfer'] as TransactionType[]).map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.typeBtn, { backgroundColor: Colors.card, borderColor: Colors.border }, type === t && { backgroundColor: typeColor(t), borderColor: 'transparent' }]}
                onPress={() => handleTypeChange(t)}
              >
                <Text style={[styles.typeBtnText, { color: Colors.textMuted }, type === t && { color: '#fff' }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.amountContainer, { backgroundColor: Colors.card }]}>
            <Text style={[styles.currencySymbol, { color: Colors.textSecondary }]}>₱</Text>
            <TextInput
              style={[styles.amountInput, { color: Colors.textPrimary }]}
              placeholder="0.00"
              placeholderTextColor={Colors.border}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              autoFocus={Platform.OS !== 'web'}
            />
          </View>

          {type !== 'transfer' && (
            <>
              <Text style={[styles.label, { color: Colors.textSecondary }]}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES.map(c => {
                  const active = category === c;
                  const color = CATEGORY_COLORS[c] ?? Colors.accent;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.catBtn, { borderColor: Colors.border }, active && { backgroundColor: color + '20', borderColor: color }]}
                      onPress={() => setCategory(c)}
                    >
                      <Text style={[styles.catBtnText, { color: Colors.textMuted }, active && { color }]}>{c}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          <Text style={[styles.label, { color: Colors.textSecondary }]}>Description</Text>
          <TextInput
            style={[styles.input, { backgroundColor: Colors.card, color: Colors.textPrimary, borderColor: Colors.border }]}
            placeholder="What was this for?"
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={[styles.label, { color: Colors.textSecondary }]}>{type === 'transfer' ? 'From Wallet' : 'Wallet'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {wallets.map(w => (
              <TouchableOpacity
                key={w.id}
                style={[styles.walletBtn, { borderColor: Colors.border }, walletId === w.id && { borderColor: w.color, backgroundColor: w.color + '20' }]}
                onPress={() => handleFromWalletChange(w.id)}
              >
                <MaterialIcons name={w.icon as any} size={16} color={walletId === w.id ? w.color : Colors.textMuted} />
                <Text style={[styles.walletBtnText, { color: Colors.textMuted }, walletId === w.id && { color: w.color }]}>{w.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {type === 'transfer' && (
            <>
              <Text style={[styles.label, { color: Colors.textSecondary }]}>To Wallet</Text>
              {availableToWallets.length === 0 ? (
                <View style={[styles.noWalletHint, { backgroundColor: Colors.warning + '15' }]}>
                  <MaterialIcons name="info-outline" size={16} color={Colors.warning} />
                  <Text style={[styles.noWalletHintText, { color: Colors.warning }]}>Add another wallet to enable transfers</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {availableToWallets.map(w => (
                    <TouchableOpacity
                      key={w.id}
                      style={[styles.walletBtn, { borderColor: Colors.border }, toWalletId === w.id && { borderColor: w.color, backgroundColor: w.color + '20' }]}
                      onPress={() => setToWalletId(w.id)}
                    >
                      <MaterialIcons name={w.icon as any} size={16} color={toWalletId === w.id ? w.color : Colors.textMuted} />
                      <Text style={[styles.walletBtnText, { color: Colors.textMuted }, toWalletId === w.id && { color: w.color }]}>{w.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}

          <Text style={[styles.label, { color: Colors.textSecondary }]}>Recurring</Text>
          <View style={styles.recurringRow}>
            {RECURRING.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[styles.recurringBtn, { backgroundColor: Colors.card, borderColor: Colors.border }, recurring === r.value && { backgroundColor: Colors.accent, borderColor: Colors.accent }]}
                onPress={() => setRecurring(r.value)}
              >
                <Text style={[styles.recurringBtnText, { color: Colors.textMuted }, recurring === r.value && { color: '#FFFFFF' }]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: Colors.textSecondary }]}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput, { backgroundColor: Colors.card, color: Colors.textPrimary, borderColor: Colors.border }]}
            placeholder="Add a note..."
            placeholderTextColor={Colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: Colors.accent }, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
            <MaterialIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Transaction'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
    ...(Platform.OS === 'web' ? { maxWidth: 600, width: '100%', alignSelf: 'center' as const } : {}),
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20, paddingBottom: 40,
    ...(Platform.OS === 'web' ? { alignItems: 'center' as const } : {}),
  },
  innerContent: { width: '100%', ...(Platform.OS === 'web' ? { maxWidth: 600 } : {}) },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  typeBtnText: { fontWeight: '700' as const, fontSize: 13 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, borderRadius: 20, padding: 20 },
  currencySymbol: { fontSize: 28, fontWeight: '600' as const, marginRight: 4 },
  amountInput: { flex: 1, fontSize: 42, fontWeight: '700' as const },
  label: { fontSize: 13, fontWeight: '600' as const, marginBottom: 10 },
  categoryScroll: { marginBottom: 20 },
  catBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8 },
  catBtnText: { fontSize: 13, fontWeight: '600' as const },
  input: { borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 20, borderWidth: 1 },
  walletBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 },
  walletBtnText: { fontSize: 13, fontWeight: '600' as const },
  noWalletHint: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 12, marginBottom: 20 },
  noWalletHintText: { fontSize: 13, fontWeight: '500' as const },
  recurringRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  recurringBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  recurringBtnText: { fontWeight: '600' as const, fontSize: 13 },
  notesInput: { height: 80, textAlignVertical: 'top' as const },
  saveBtn: { borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' as const },
});
