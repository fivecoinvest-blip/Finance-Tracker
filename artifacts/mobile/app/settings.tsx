import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { useFinance } from '@/context/FinanceContext';

const SETTINGS_KEYS = {
  adsRemoved: '@cashper_ads_removed',
  budgetAlerts: '@cashper_budget_alerts',
  streakReminders: '@cashper_streak_reminders',
};

function useToggle(key: string, defaultValue = true) {
  const [value, setValue] = useState(defaultValue);
  const loaded = useRef(false);
  useEffect(() => {
    AsyncStorage.getItem(key).then(v => {
      if (v !== null) setValue(v === 'true');
      loaded.current = true;
    });
  }, [key]);
  const toggle = async (next: boolean) => {
    setValue(next);
    await AsyncStorage.setItem(key, String(next));
  };
  return [value, toggle] as const;
}

function RestoreModal({ visible, onClose, onRestore }: { visible: boolean; onClose: () => void; onRestore: (json: string) => void }) {
  const [input, setInput] = useState('');
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={mStyles.overlay}>
        <View style={mStyles.sheet}>
          <View style={mStyles.handle} />
          <Text style={mStyles.title}>Restore Backup</Text>
          <Text style={mStyles.desc}>Paste your Cashper backup JSON below. This will replace all current data.</Text>
          <TextInput
            style={mStyles.input}
            multiline
            numberOfLines={8}
            placeholder='{"wallets":[...],"transactions":[...],...}'
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
          />
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={mStyles.fileBtn}
              onPress={() => {
                const el = document.createElement('input');
                el.type = 'file';
                el.accept = '.json';
                el.onchange = (e: any) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (re) => { if (re.target?.result) setInput(re.target.result as string); };
                  reader.readAsText(file);
                };
                el.click();
              }}
            >
              <MaterialIcons name="folder-open" size={18} color={Colors.accent} />
              <Text style={mStyles.fileBtnText}>Choose .json file</Text>
            </TouchableOpacity>
          )}
          <View style={mStyles.actions}>
            <TouchableOpacity style={mStyles.cancelBtn} onPress={onClose}>
              <Text style={mStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[mStyles.confirmBtn, !input.trim() && { opacity: 0.4 }]}
              onPress={() => { onRestore(input); onClose(); }}
              disabled={!input.trim()}
            >
              <Text style={mStyles.confirmText}>Restore</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PrivacyModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={mStyles.fullOverlay}>
        <View style={mStyles.fullSheet}>
          <View style={mStyles.fullHeader}>
            <Text style={mStyles.fullTitle}>Privacy Policy</Text>
            <TouchableOpacity onPress={onClose} style={mStyles.closeBtn}>
              <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={mStyles.fullContent} showsVerticalScrollIndicator={false}>
            <Text style={mStyles.policyDate}>Effective date: January 1, 2025</Text>
            <Text style={mStyles.policyHeading}>1. Introduction</Text>
            <Text style={mStyles.policyBody}>
              Cashper ("we", "our", or "us") is a personal finance tracker app. We are committed to protecting your privacy.
              This Privacy Policy explains how we handle information when you use our mobile application.
            </Text>
            <Text style={mStyles.policyHeading}>2. Data Collection</Text>
            <Text style={mStyles.policyBody}>
              Cashper does NOT collect, transmit, or store any personal or financial data on external servers.
              All data you enter — including wallets, transactions, and budgets — is stored exclusively on your device
              using local storage (AsyncStorage). No data is shared with third parties.
            </Text>
            <Text style={mStyles.policyHeading}>3. Data You Enter</Text>
            <Text style={mStyles.policyBody}>
              • Wallet names and balances{'\n'}
              • Transaction amounts, categories, and descriptions{'\n'}
              • Budget limits and categories{'\n'}
              • Gamification stats (XP, level, streaks){'\n\n'}
              All of this data remains on your device and is never sent to us or any third party.
            </Text>
            <Text style={mStyles.policyHeading}>4. Analytics & Crash Reporting</Text>
            <Text style={mStyles.policyBody}>
              Cashper does not use any analytics, crash reporting, or advertising SDK that transmits data off-device.
            </Text>
            <Text style={mStyles.policyHeading}>5. Children's Privacy</Text>
            <Text style={mStyles.policyBody}>
              Cashper is designed for general use. We do not knowingly collect information from children under 13.
            </Text>
            <Text style={mStyles.policyHeading}>6. Changes to This Policy</Text>
            <Text style={mStyles.policyBody}>
              We may update this policy from time to time. Any changes will be reflected in the updated effective date
              above and notified via app update notes.
            </Text>
            <Text style={mStyles.policyHeading}>7. Contact Us</Text>
            <Text style={mStyles.policyBody}>
              If you have questions about this Privacy Policy, please contact us at:{'\n'}
              support@cashperapp.ph
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function TermsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={mStyles.fullOverlay}>
        <View style={mStyles.fullSheet}>
          <View style={mStyles.fullHeader}>
            <Text style={mStyles.fullTitle}>Terms of Service</Text>
            <TouchableOpacity onPress={onClose} style={mStyles.closeBtn}>
              <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={mStyles.fullContent} showsVerticalScrollIndicator={false}>
            <Text style={mStyles.policyDate}>Effective date: January 1, 2025</Text>
            <Text style={mStyles.policyHeading}>1. Acceptance of Terms</Text>
            <Text style={mStyles.policyBody}>
              By downloading or using Cashper, you agree to be bound by these Terms of Service.
              If you do not agree, please uninstall the application.
            </Text>
            <Text style={mStyles.policyHeading}>2. Description of Service</Text>
            <Text style={mStyles.policyBody}>
              Cashper is a personal finance and budget tracking application designed to help you manage
              your income, expenses, wallets, and savings goals. All features are provided for personal,
              non-commercial use.
            </Text>
            <Text style={mStyles.policyHeading}>3. No Financial Advice</Text>
            <Text style={mStyles.policyBody}>
              Cashper is a tracking tool only. The AI insights and analytics provided within the app
              are for informational purposes and do not constitute financial, investment, legal, or
              tax advice. Always consult a qualified financial professional for financial decisions.
            </Text>
            <Text style={mStyles.policyHeading}>4. Data Responsibility</Text>
            <Text style={mStyles.policyBody}>
              All data stored in Cashper is your responsibility. We strongly recommend using the
              Backup feature regularly. We are not liable for any data loss due to device failure,
              app uninstallation, or storage clearing.
            </Text>
            <Text style={mStyles.policyHeading}>5. Purchases</Text>
            <Text style={mStyles.policyBody}>
              In-app purchases (such as "Remove Ads") are one-time payments. All purchases are
              final and non-refundable unless required by applicable law. Purchases are tied to
              your device and may not be transferable.
            </Text>
            <Text style={mStyles.policyHeading}>6. Prohibited Use</Text>
            <Text style={mStyles.policyBody}>
              You agree not to:{'\n'}
              • Reverse engineer or decompile the app{'\n'}
              • Use the app for illegal financial activities{'\n'}
              • Attempt to circumvent any in-app purchase mechanisms
            </Text>
            <Text style={mStyles.policyHeading}>7. Limitation of Liability</Text>
            <Text style={mStyles.policyBody}>
              Cashper is provided "as is" without warranties of any kind. We are not responsible
              for any direct, indirect, incidental, or consequential damages arising from your
              use of the app.
            </Text>
            <Text style={mStyles.policyHeading}>8. Governing Law</Text>
            <Text style={mStyles.policyBody}>
              These Terms are governed by the laws of the Republic of the Philippines.
            </Text>
            <Text style={mStyles.policyHeading}>9. Contact</Text>
            <Text style={mStyles.policyBody}>
              For questions or concerns:{'\n'}
              support@cashperapp.ph
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, wallets, budgets, stats } = useFinance();
  const [adsRemoved, setAdsRemoved] = useToggle(SETTINGS_KEYS.adsRemoved, false);
  const [budgetAlerts, setBudgetAlerts] = useToggle(SETTINGS_KEYS.budgetAlerts, true);
  const [streakReminders, setStreakReminders] = useToggle(SETTINGS_KEYS.streakReminders, true);
  const [showRestore, setShowRestore] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const handleRemoveAds = () => {
    if (adsRemoved) return;
    Alert.alert(
      'Remove Ads Forever',
      'Pay ₱999 once and enjoy Cashper ad-free forever. This is a one-time purchase.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Purchase ₱999', onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await setAdsRemoved(true);
            Alert.alert('Thank you! 🎉', 'Ads removed permanently. Enjoy Cashper ad-free!');
          }
        },
      ]
    );
  };

  const handleBackup = async () => {
    try {
      const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        wallets,
        transactions,
        budgets,
        stats,
      };
      const json = JSON.stringify(data, null, 2);

      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cashper-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('Backup Downloaded', 'Your backup JSON file has been downloaded.');
      } else {
        await Share.share({
          message: json,
          title: 'Cashper Backup',
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Error', 'Could not create backup. Please try again.');
    }
  };

  const handleRestore = async (json: string) => {
    try {
      const data = JSON.parse(json);
      if (!data.wallets || !data.transactions) {
        Alert.alert('Invalid Backup', 'The JSON does not look like a valid Cashper backup.');
        return;
      }
      Alert.alert(
        'Restore Backup?',
        `This will replace all your current data with:\n• ${data.wallets.length} wallets\n• ${data.transactions.length} transactions\n• ${(data.budgets ?? []).length} budgets\n\nThis cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore', style: 'destructive', onPress: async () => {
              await Promise.all([
                AsyncStorage.setItem('@fintrack_wallets', JSON.stringify(data.wallets)),
                AsyncStorage.setItem('@fintrack_transactions', JSON.stringify(data.transactions)),
                AsyncStorage.setItem('@fintrack_budgets', JSON.stringify(data.budgets ?? [])),
                AsyncStorage.setItem('@fintrack_stats', JSON.stringify(data.stats ?? {})),
              ]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Restored!', 'Backup restored. Please restart the app to see your data.');
            }
          },
        ]
      );
    } catch {
      Alert.alert('Invalid JSON', 'Could not parse the backup. Make sure you pasted the full backup file.');
    }
  };

  const handleExportCSV = async () => {
    try {
      const headers = 'Date,Type,Category,Description,Amount,Wallet,Notes\n';
      const rows = transactions.map(tx => {
        const wallet = wallets.find(w => w.id === tx.walletId);
        const date = new Date(tx.date).toLocaleDateString('en-PH');
        const desc = (tx.description || '').replace(/"/g, '""');
        const notes = (tx.notes || '').replace(/"/g, '""');
        return `"${date}","${tx.type}","${tx.category}","${desc}","${tx.amount}","${wallet?.name ?? ''}","${notes}"`;
      }).join('\n');
      const csv = headers + rows;

      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cashper-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('Export Done', 'CSV file has been downloaded.');
      } else {
        await Share.share({ message: csv, title: 'Cashper Transactions CSV' });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert('Error', 'Could not export. Please try again.');
    }
  };

  return (
    <View style={styles.screen}>
      <RestoreModal visible={showRestore} onClose={() => setShowRestore(false)} onRestore={handleRestore} />
      <PrivacyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />

      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.proCard}>
          <View style={styles.proHeader}>
            <MaterialIcons name="workspace-premium" size={28} color={Colors.accent} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.proTitle}>Remove Ads</Text>
              <Text style={styles.proDesc}>One-time payment. Enjoy Cashper ad-free forever.</Text>
            </View>
          </View>
          {adsRemoved ? (
            <View style={styles.adsRemovedBadge}>
              <MaterialIcons name="check-circle" size={16} color={Colors.success} />
              <Text style={styles.adsRemovedText}>Ads removed — Thank you!</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.purchaseBtn} onPress={handleRemoveAds}>
              <Text style={styles.purchaseBtnText}>Remove Ads — ₱999</Text>
            </TouchableOpacity>
          )}
        </Card>

        <Text style={styles.sectionLabel}>Notifications</Text>
        <Card style={styles.settingsGroup}>
          <View style={styles.settingsRow}>
            <MaterialIcons name="notifications" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <Text style={styles.settingsLabel}>Budget Alerts</Text>
            <Switch
              value={budgetAlerts}
              onValueChange={(v) => { setBudgetAlerts(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              trackColor={{ true: Colors.accent, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.settingsRow, styles.lastRow]}>
            <MaterialIcons name="local-fire-department" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <Text style={styles.settingsLabel}>Streak Reminders</Text>
            <Switch
              value={streakReminders}
              onValueChange={(v) => { setStreakReminders(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              trackColor={{ true: Colors.accent, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Appearance</Text>
        <Card style={styles.settingsGroup}>
          <TouchableOpacity
            style={[styles.settingsRow, styles.lastRow]}
            onPress={() => Alert.alert('Dark Mode', 'Dark mode is coming in a future update. Stay tuned!')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="dark-mode" size={20} color={Colors.textMuted} style={styles.settingsIcon} />
            <Text style={[styles.settingsLabel, { color: Colors.textMuted }]}>Dark Mode</Text>
            <Text style={styles.comingSoon}>Coming soon</Text>
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionLabel}>Data</Text>
        <Card style={styles.settingsGroup}>
          <TouchableOpacity style={styles.settingsRow} onPress={handleBackup} activeOpacity={0.7}>
            <MaterialIcons name="backup" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsLabel}>Backup Data</Text>
              <Text style={styles.settingsSubtext}>Export as JSON</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} onPress={() => setShowRestore(true)} activeOpacity={0.7}>
            <MaterialIcons name="restore" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsLabel}>Restore Backup</Text>
              <Text style={styles.settingsSubtext}>Import from JSON file or paste</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingsRow, styles.lastRow]} onPress={handleExportCSV} activeOpacity={0.7}>
            <MaterialIcons name="table-chart" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.settingsLabel}>Export to CSV</Text>
              <Text style={styles.settingsSubtext}>{transactions.length} transactions</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionLabel}>About</Text>
        <Card style={styles.settingsGroup}>
          <View style={styles.settingsRow}>
            <MaterialIcons name="info" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <Text style={styles.settingsLabel}>App Version</Text>
            <Text style={styles.settingsInfoValue}>1.0.0</Text>
          </View>
          <TouchableOpacity style={styles.settingsRow} onPress={() => setShowPrivacy(true)} activeOpacity={0.7}>
            <MaterialIcons name="privacy-tip" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <Text style={styles.settingsLabel}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingsRow, styles.lastRow]} onPress={() => setShowTerms(true)} activeOpacity={0.7}>
            <MaterialIcons name="receipt-long" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <Text style={styles.settingsLabel}>Terms of Service</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <View style={styles.statsFooter}>
          <Text style={styles.statsFooterLabel}>Your Data Summary</Text>
          <Text style={styles.statsFooterValue}>{transactions.length} transactions · {wallets.length} wallets · {budgets.length} budgets</Text>
          <View style={styles.localBadge}>
            <MaterialIcons name="lock" size={12} color={Colors.success} />
            <Text style={styles.localBadgeText}>All data stored locally on your device</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundDark },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '700' as const },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  proCard: { marginBottom: 24, borderWidth: 1, borderColor: Colors.accent + '40' },
  proHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  proTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: '700' as const },
  proDesc: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
  adsRemovedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.success + '20', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14 },
  adsRemovedText: { color: Colors.success, fontSize: 13, fontWeight: '600' as const },
  purchaseBtn: { backgroundColor: Colors.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  purchaseBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' as const },
  sectionLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  settingsGroup: { marginBottom: 20, padding: 0, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  lastRow: { borderBottomWidth: 0 },
  settingsIcon: { marginRight: 14 },
  settingsLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  settingsSubtext: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
  settingsInfoValue: { color: Colors.textMuted, fontSize: 14 },
  comingSoon: { color: Colors.textMuted, fontSize: 12, fontStyle: 'italic' as const },
  statsFooter: { alignItems: 'center', paddingTop: 12 },
  statsFooterLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
  statsFooterValue: { color: Colors.textMuted, fontSize: 13, marginTop: 4 },
  localBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: Colors.success + '15', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  localBadgeText: { color: Colors.success, fontSize: 12, fontWeight: '500' as const },
});

const mStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center' as const, marginBottom: 16 },
  title: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' as const, marginBottom: 8 },
  desc: { color: Colors.textMuted, fontSize: 13, marginBottom: 14 },
  input: {
    backgroundColor: Colors.backgroundDark, borderRadius: 12, padding: 12,
    color: Colors.textPrimary, fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    borderWidth: 1, borderColor: Colors.border, minHeight: 120, textAlignVertical: 'top' as const,
    marginBottom: 10,
  },
  fileBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  fileBtnText: { color: Colors.accent, fontSize: 14, fontWeight: '600' as const },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: Colors.backgroundDark, borderRadius: 12, paddingVertical: 13, alignItems: 'center' as const },
  cancelText: { color: Colors.textSecondary, fontWeight: '600' as const },
  confirmBtn: { flex: 1, backgroundColor: Colors.danger, borderRadius: 12, paddingVertical: 13, alignItems: 'center' as const },
  confirmText: { color: '#FFFFFF', fontWeight: '700' as const },
  fullOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  fullSheet: { flex: 1, backgroundColor: '#FFFFFF', marginTop: 48, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  fullHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: Colors.border },
  fullTitle: { color: Colors.textPrimary, fontSize: 20, fontWeight: '700' as const },
  closeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.backgroundDark, justifyContent: 'center', alignItems: 'center' },
  fullContent: { padding: 24, paddingBottom: 60 },
  policyDate: { color: Colors.textMuted, fontSize: 12, marginBottom: 20 },
  policyHeading: { color: Colors.textPrimary, fontSize: 15, fontWeight: '700' as const, marginTop: 20, marginBottom: 6 },
  policyBody: { color: Colors.textSecondary, fontSize: 14, lineHeight: 22 },
});
