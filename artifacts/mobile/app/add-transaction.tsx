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
import { CATEGORY_COLORS, Colors } from '@/constants/colors';
import { useFinance, type RecurringFrequency, type TransactionType } from '@/context/FinanceContext';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Savings', 'Salary', 'Other'];
const RECURRING: { value: RecurringFrequency; label: string }[] = [
  { value: 'none', label: 'One-time' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export default function AddTransactionScreen() {
  const insets = useSafeAreaInsets();
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
    if (!amount || parseFloat(amount.replace(/,/g, '')) <= 0) {
      Alert.alert('Error', 'Enter a valid amount'); return;
    }
    if (!walletId) {
      Alert.alert('Error', 'Select a wallet'); return;
    }
    if (type === 'transfer') {
      if (wallets.length < 2) {
        Alert.alert('Need more wallets', 'Add at least 2 wallets to make a transfer.'); return;
      }
      if (!toWalletId || toWalletId === walletId) {
        Alert.alert('Error', 'Select a different destination wallet'); return;
      }
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

  const typeBtnStyle = (t: TransactionType) => [
    styles.typeBtn,
    type === t && {
      backgroundColor: t === 'income' ? Colors.income : t === 'expense' ? Colors.expense : Colors.transfer,
      borderColor: 'transparent',
    },
  ];
  const typeBtnTextStyle = (t: TransactionType) => [
    styles.typeBtnText,
    type === t && { color: '#fff' },
  ];

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: (Platform.OS === 'web' ? 16 : insets.top) + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Transaction</Text>
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
              <TouchableOpacity key={t} style={typeBtnStyle(t)} onPress={() => handleTypeChange(t)}>
                <Text style={typeBtnTextStyle(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>₱</Text>
            <TextInput
              style={styles.amountInput}
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
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES.map(c => {
                  const active = category === c;
                  const color = CATEGORY_COLORS[c] ?? Colors.accent;
                  return (
                    <TouchableOpacity
                      key={c}
                      style={[styles.catBtn, active && { backgroundColor: color + '20', borderColor: color }]}
                      onPress={() => setCategory(c)}
                    >
                      <Text style={[styles.catBtnText, active && { color }]}>{c}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          )}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={styles.input}
            placeholder="What was this for?"
            placeholderTextColor={Colors.textMuted}
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>{type === 'transfer' ? 'From Wallet' : 'Wallet'}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {wallets.map(w => (
              <TouchableOpacity
                key={w.id}
                style={[styles.walletBtn, walletId === w.id && { borderColor: w.color, backgroundColor: w.color + '20' }]}
                onPress={() => handleFromWalletChange(w.id)}
              >
                <MaterialIcons name={w.icon as any} size={16} color={walletId === w.id ? w.color : Colors.textMuted} />
                <Text style={[styles.walletBtnText, walletId === w.id && { color: w.color }]}>{w.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {type === 'transfer' && (
            <>
              <Text style={styles.label}>To Wallet</Text>
              {availableToWallets.length === 0 ? (
                <View style={styles.noWalletHint}>
                  <MaterialIcons name="info-outline" size={16} color={Colors.warning} />
                  <Text style={styles.noWalletHintText}>Add another wallet to enable transfers</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {availableToWallets.map(w => (
                    <TouchableOpacity
                      key={w.id}
                      style={[styles.walletBtn, toWalletId === w.id && { borderColor: w.color, backgroundColor: w.color + '20' }]}
                      onPress={() => setToWalletId(w.id)}
                    >
                      <MaterialIcons name={w.icon as any} size={16} color={toWalletId === w.id ? w.color : Colors.textMuted} />
                      <Text style={[styles.walletBtnText, toWalletId === w.id && { color: w.color }]}>{w.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </>
          )}

          <Text style={styles.label}>Recurring</Text>
          <View style={styles.recurringRow}>
            {RECURRING.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[styles.recurringBtn, recurring === r.value && styles.recurringBtnActive]}
                onPress={() => setRecurring(r.value)}
              >
                <Text style={[styles.recurringBtnText, recurring === r.value && styles.recurringBtnTextActive]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Add a note..."
            placeholderTextColor={Colors.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />

          <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={handleSave} disabled={saving}>
            <MaterialIcons name="check" size={20} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Transaction'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
    ...(Platform.OS === 'web' ? { maxWidth: 600, width: '100%', alignSelf: 'center' as const } : {}),
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' as const },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20, paddingBottom: 40,
    ...(Platform.OS === 'web' ? { alignItems: 'center' as const } : {}),
  },
  innerContent: {
    width: '100%',
    ...(Platform.OS === 'web' ? { maxWidth: 600 } : {}),
  },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  typeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.card, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  typeBtnText: { color: Colors.textMuted, fontWeight: '700' as const, fontSize: 13 },
  amountContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 28, backgroundColor: Colors.card, borderRadius: 20, padding: 20 },
  currencySymbol: { color: Colors.textSecondary, fontSize: 28, fontWeight: '600' as const, marginRight: 4 },
  amountInput: { flex: 1, color: Colors.textPrimary, fontSize: 42, fontWeight: '700' as const },
  label: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' as const, marginBottom: 10 },
  categoryScroll: { marginBottom: 20 },
  catBtn: { borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8 },
  catBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' as const },
  input: { backgroundColor: Colors.card, borderRadius: 14, padding: 14, color: Colors.textPrimary, fontSize: 15, marginBottom: 20, borderWidth: 1, borderColor: Colors.border },
  walletBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12, marginRight: 8 },
  walletBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' as const },
  noWalletHint: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.warning + '15', borderRadius: 10, padding: 12, marginBottom: 20 },
  noWalletHintText: { color: Colors.warning, fontSize: 13, fontWeight: '500' as const },
  recurringRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  recurringBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: Colors.card, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  recurringBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  recurringBtnText: { color: Colors.textMuted, fontWeight: '600' as const, fontSize: 13 },
  recurringBtnTextActive: { color: '#FFFFFF' },
  notesInput: { height: 80, textAlignVertical: 'top' as const },
  saveBtn: { backgroundColor: Colors.accent, borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' as const },
});
