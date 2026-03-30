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
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CATEGORY_COLORS } from '@/constants/colors';
import { useFinance, type BudgetPeriod } from '@/context/FinanceContext';
import { useColors } from '@/context/ThemeContext';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Other'];

function AddBudgetModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const Colors = useColors();
  const { addBudget } = useFinance();
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('monthly');

  const handleAdd = async () => {
    if (!limit || parseFloat(limit) <= 0) { Alert.alert('Error', 'Enter a valid budget amount'); return; }
    await addBudget({ category, limit: parseFloat(limit), period });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCategory('Food'); setLimit(''); setPeriod('monthly');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { backgroundColor: Colors.card }]}>
          <View style={[styles.handle, { backgroundColor: Colors.border }]} />
          <Text style={[styles.modalTitle, { color: Colors.textPrimary }]}>Set Budget</Text>

          <Text style={[styles.label, { color: Colors.textSecondary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.catBtn, { borderColor: Colors.border }, category === c && { backgroundColor: (CATEGORY_COLORS[c] ?? Colors.accent) + '30', borderColor: CATEGORY_COLORS[c] ?? Colors.accent }]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.catBtnText, { color: Colors.textMuted }, category === c && { color: CATEGORY_COLORS[c] ?? Colors.accent }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={[styles.label, { color: Colors.textSecondary }]}>Period</Text>
          <View style={styles.periodRow}>
            {(['monthly', 'weekly'] as BudgetPeriod[]).map(p => (
              <TouchableOpacity
                key={p}
                style={[styles.periodBtn, { borderColor: Colors.border }, period === p && { backgroundColor: Colors.accent, borderColor: Colors.accent }]}
                onPress={() => setPeriod(p)}
              >
                <Text style={[styles.periodBtnText, { color: Colors.textMuted }, period === p && { color: '#FFFFFF' }]}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: Colors.textSecondary }]}>Budget Limit (₱)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: Colors.backgroundDark, color: Colors.textPrimary, borderColor: Colors.border }]}
            placeholder="0.00"
            placeholderTextColor={Colors.textMuted}
            value={limit}
            onChangeText={setLimit}
            keyboardType="decimal-pad"
          />

          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: Colors.backgroundDark }]} onPress={onClose}>
              <Text style={[styles.cancelText, { color: Colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.addBtn, { backgroundColor: Colors.accent }]} onPress={handleAdd}>
              <Text style={styles.addBtnText}>Set Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const Colors = useColors();
  const { budgets, deleteBudget, getBudgetUsage, getCategorySpending } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.screen, { backgroundColor: Colors.backgroundDark }]}>
      <AddBudgetModal visible={showAdd} onClose={() => setShowAdd(false)} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPadding + 8, paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: Colors.textPrimary }]}>Budgets</Text>
          <TouchableOpacity style={[styles.addHeaderBtn, { backgroundColor: Colors.accent }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowAdd(true); }}>
            <MaterialIcons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {budgets.length === 0 ? (
          <View style={styles.empty}>
            <MaterialIcons name="pie-chart" size={56} color={Colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: Colors.textPrimary }]}>No budgets yet</Text>
            <Text style={[styles.emptyText, { color: Colors.textMuted }]}>Set spending limits to stay on track</Text>
            <TouchableOpacity style={[styles.emptyBtn, { backgroundColor: Colors.accent }]} onPress={() => setShowAdd(true)}>
              <Text style={styles.emptyBtnText}>Create Budget</Text>
            </TouchableOpacity>
          </View>
        ) : (
          budgets.map(b => {
            const usage = getBudgetUsage(b.id);
            const spent = getCategorySpending(b.category, b.period);
            const remaining = b.limit - spent;
            const color = CATEGORY_COLORS[b.category] ?? Colors.accent;
            const statusColor = usage > 1 ? Colors.danger : usage > 0.8 ? Colors.warning : Colors.success;

            return (
              <Card key={b.id} style={styles.budgetCard}>
                <View style={styles.budgetHeader}>
                  <View style={[styles.catDot, { backgroundColor: color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.budgetCat, { color: Colors.textPrimary }]}>{b.category}</Text>
                    <Text style={[styles.budgetPeriod, { color: Colors.textMuted }]}>{b.period.charAt(0).toUpperCase() + b.period.slice(1)}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {usage > 1 ? 'Over budget' : usage > 0.8 ? 'Near limit' : 'On track'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.deleteBtn, { backgroundColor: Colors.danger + '12' }]}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      Alert.alert('Delete Budget', `Remove the ${b.category} budget?`, [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Delete', style: 'destructive', onPress: () => deleteBudget(b.id) },
                      ]);
                    }}
                  >
                    <MaterialIcons name="delete-outline" size={20} color={Colors.danger} />
                  </TouchableOpacity>
                </View>

                <ProgressBar progress={usage} style={styles.progressBar} />

                <View style={styles.budgetStats}>
                  <View>
                    <Text style={[styles.statsLabel, { color: Colors.textMuted }]}>Spent</Text>
                    <Text style={[styles.statsValue, { color: usage > 1 ? Colors.danger : Colors.textPrimary }]}>
                      ₱{spent.toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={[styles.statsLabel, { color: Colors.textMuted }]}>Limit</Text>
                    <Text style={[styles.statsValue, { color: Colors.textPrimary }]}>₱{b.limit.toLocaleString('en-PH', { minimumFractionDigits: 0 })}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.statsLabel, { color: Colors.textMuted }]}>Remaining</Text>
                    <Text style={[styles.statsValue, { color: remaining < 0 ? Colors.danger : Colors.success }]}>
                      ₱{Math.abs(remaining).toLocaleString('en-PH', { minimumFractionDigits: 0 })}
                    </Text>
                  </View>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '700' as const },
  addHeaderBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '700' as const, marginTop: 16 },
  emptyText: { fontSize: 14, marginTop: 8, textAlign: 'center' },
  emptyBtn: { borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginTop: 24 },
  emptyBtnText: { color: '#FFFFFF', fontWeight: '700' as const, fontSize: 15 },
  budgetCard: { marginBottom: 12 },
  budgetHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  catDot: { width: 12, height: 12, borderRadius: 6 },
  budgetCat: { fontSize: 16, fontWeight: '700' as const },
  budgetPeriod: { fontSize: 12 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' as const },
  deleteBtn: { width: 34, height: 34, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginLeft: 4 },
  progressBar: { marginBottom: 12 },
  budgetStats: { flexDirection: 'row', justifyContent: 'space-between' },
  statsLabel: { fontSize: 11 },
  statsValue: { fontSize: 15, fontWeight: '700' as const, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '700' as const, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600' as const, marginBottom: 8 },
  catBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8 },
  catBtnText: { fontSize: 13, fontWeight: '600' as const },
  periodRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  periodBtn: { flex: 1, borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  periodBtnText: { fontWeight: '600' as const },
  input: { borderRadius: 14, padding: 14, fontSize: 15, marginBottom: 16, borderWidth: 1 },
  btnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontWeight: '600' as const },
  addBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  addBtnText: { color: '#FFFFFF', fontWeight: '700' as const },
});
