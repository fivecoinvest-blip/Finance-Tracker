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
import { Card } from '@/components/ui/Card';
import { CATEGORY_COLORS, Colors } from '@/constants/colors';
import { useFinance, type TransactionType } from '@/context/FinanceContext';

const EXAMPLES = [
  'spent ₱250 on food today',
  'received ₱15000 salary',
  'paid ₱1200 for electric bill',
  'bought groceries ₱800',
  'GrabFood order ₱350',
  'transferred ₱5000 to savings',
];

function parseNaturalInput(text: string): Partial<{ type: TransactionType; amount: number; category: string; description: string }> | null {
  const lower = text.toLowerCase();
  let amount = 0;
  const amountMatch = text.match(/[₱$]?\s*(\d[\d,]*(?:\.\d{1,2})?)/);
  if (amountMatch) {
    amount = parseFloat(amountMatch[1].replace(/,/g, ''));
  }
  if (!amount) return null;

  let type: TransactionType = 'expense';
  let category = 'Other';

  if (/receiv|salary|income|got paid|wage|earn|refund/i.test(lower)) {
    type = 'income';
    category = /salary|wage/i.test(lower) ? 'Salary' : 'Other';
  } else if (/transfer|sent|moved/i.test(lower)) {
    type = 'transfer';
    category = 'Transfer';
  } else {
    if (/food|eat|restaurant|meal|lunch|dinner|breakfast|pizza|burger|sushi|grab|jollibee|mc|kfc|coffee|cafe|snack|mcdonald/i.test(lower)) category = 'Food';
    else if (/groceries|grocery|supermarket|sm|puregold|market/i.test(lower)) category = 'Food';
    else if (/transport|grab|uber|tricycle|jeep|bus|lrt|mrt|taxi|fuel|gas|petrol|commute/i.test(lower)) category = 'Transport';
    else if (/bill|electric|water|internet|phone|load|subscription|netflix|spotify/i.test(lower)) category = 'Bills';
    else if (/shop|clothes|shoes|buy|bought|purchase|lazada|shopee|amazon/i.test(lower)) category = 'Shopping';
    else if (/health|medicine|doctor|hospital|pharmacy|medic/i.test(lower)) category = 'Health';
    else if (/movie|cinema|game|entertainment|concert|streaming/i.test(lower)) category = 'Entertainment';
    else if (/school|tuition|book|course|class|education/i.test(lower)) category = 'Education';
    else if (/save|savings/i.test(lower)) category = 'Savings';
  }

  return { type, amount, category, description: text.trim() };
}

export default function VoiceInputScreen() {
  const insets = useSafeAreaInsets();
  const { wallets, addTransaction } = useFinance();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState<ReturnType<typeof parseNaturalInput>>(null);
  const [confirmed, setConfirmed] = useState(false);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const handleParse = () => {
    const result = parseNaturalInput(text);
    setParsed(result);
    if (result) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleConfirm = async () => {
    if (!parsed || !wallets[0]) return;
    await addTransaction({
      type: parsed.type!,
      amount: parsed.amount!,
      category: parsed.category!,
      description: parsed.description ?? text,
      walletId: wallets[0].id,
      date: new Date().toISOString(),
      recurring: 'none',
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setConfirmed(true);
    setTimeout(() => {
      router.back();
    }, 1200);
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Add</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.inputArea}>
          <MaterialIcons name="edit" size={20} color={Colors.textMuted} style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="Type what you spent or earned..."
            placeholderTextColor={Colors.textMuted}
            value={text}
            onChangeText={t => { setText(t); setParsed(null); }}
            multiline
            autoFocus
          />
        </View>

        <TouchableOpacity style={styles.parseBtn} onPress={handleParse}>
          <MaterialIcons name="auto-awesome" size={18} color={Colors.textDark} />
          <Text style={styles.parseBtnText}>Parse</Text>
        </TouchableOpacity>

        {parsed && !confirmed && (
          <Card style={styles.parsedCard}>
            <Text style={styles.parsedTitle}>Detected Transaction</Text>
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>Type</Text>
              <Text style={[styles.parsedValue, {
                color: parsed.type === 'income' ? Colors.income : parsed.type === 'transfer' ? Colors.transfer : Colors.expense,
              }]}>{parsed.type?.toUpperCase()}</Text>
            </View>
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>Amount</Text>
              <Text style={styles.parsedValue}>₱{parsed.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>Category</Text>
              <View style={[styles.catTag, { backgroundColor: (CATEGORY_COLORS[parsed.category ?? 'Other'] ?? Colors.accent) + '25' }]}>
                <Text style={[styles.catTagText, { color: CATEGORY_COLORS[parsed.category ?? 'Other'] ?? Colors.accent }]}>{parsed.category}</Text>
              </View>
            </View>
            <View style={styles.parsedRow}>
              <Text style={styles.parsedLabel}>Wallet</Text>
              <Text style={styles.parsedValue}>{wallets[0]?.name ?? 'Default'}</Text>
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <MaterialIcons name="check" size={18} color={Colors.textDark} />
              <Text style={styles.confirmBtnText}>Add This Transaction</Text>
            </TouchableOpacity>
          </Card>
        )}

        {confirmed && (
          <View style={styles.successState}>
            <MaterialIcons name="check-circle" size={48} color={Colors.success} />
            <Text style={styles.successText}>Transaction Added!</Text>
          </View>
        )}

        {!parsed && !confirmed && (
          <>
            <Text style={styles.examplesTitle}>Try typing:</Text>
            {EXAMPLES.map((ex, i) => (
              <TouchableOpacity key={i} style={styles.exampleChip} onPress={() => { setText(ex); setParsed(null); }}>
                <MaterialIcons name="chat-bubble-outline" size={14} color={Colors.textMuted} />
                <Text style={styles.exampleText}>{ex}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' as const },
  content: { paddingHorizontal: 20, paddingBottom: 60 },
  inputArea: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border },
  inputIcon: { marginTop: 3, marginRight: 8 },
  textInput: { flex: 1, color: Colors.textPrimary, fontSize: 16, lineHeight: 24, minHeight: 80 },
  parseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.accent, borderRadius: 14, paddingVertical: 14, marginBottom: 20 },
  parseBtnText: { color: Colors.textDark, fontSize: 15, fontWeight: '700' as const },
  parsedCard: { marginBottom: 20 },
  parsedTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' as const, marginBottom: 14 },
  parsedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  parsedLabel: { color: Colors.textMuted, fontSize: 14 },
  parsedValue: { color: Colors.textPrimary, fontSize: 14, fontWeight: '700' as const },
  catTag: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  catTagText: { fontSize: 13, fontWeight: '700' as const },
  confirmBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 14, marginTop: 16 },
  confirmBtnText: { color: Colors.textDark, fontSize: 14, fontWeight: '700' as const },
  examplesTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: '600' as const, marginBottom: 12 },
  exampleChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.card, borderRadius: 10, padding: 12, marginBottom: 8 },
  exampleText: { color: Colors.textSecondary, fontSize: 14, flex: 1 },
  successState: { alignItems: 'center', paddingTop: 40 },
  successText: { color: Colors.success, fontSize: 18, fontWeight: '700' as const, marginTop: 12 },
});
