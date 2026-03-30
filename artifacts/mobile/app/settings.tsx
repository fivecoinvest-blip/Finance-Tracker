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
import { CURRENCIES, useCurrency } from '@/context/CurrencyContext';
import { useFinance } from '@/context/FinanceContext';
import { useSecurity } from '@/context/SecurityContext';
import { useColors, useTheme } from '@/context/ThemeContext';

const SETTINGS_KEYS = {
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
  const Colors = useColors();
  const [input, setInput] = useState('');
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: Colors.card }]}>
          <View style={[styles.handle, { backgroundColor: Colors.border }]} />
          <Text style={[styles.sheetTitle, { color: Colors.textPrimary }]}>Restore Backup</Text>
          <Text style={[styles.sheetDesc, { color: Colors.textMuted }]}>Paste your Cashper backup JSON below. This will replace all current data.</Text>
          <TextInput
            style={[styles.jsonInput, { backgroundColor: Colors.backgroundDark, color: Colors.textPrimary, borderColor: Colors.border }]}
            multiline
            numberOfLines={8}
            placeholder='{"wallets":[...],"transactions":[...],...}'
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
          />
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={styles.fileBtn}
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
              <Text style={[styles.fileBtnText, { color: Colors.accent }]}>Choose .json file</Text>
            </TouchableOpacity>
          )}
          <View style={styles.sheetActions}>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: Colors.backgroundDark }]} onPress={onClose}>
              <Text style={[styles.cancelText, { color: Colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: Colors.accent }, !input.trim() && { opacity: 0.4 }]}
              onPress={() => { onRestore(input); onClose(); }}
              disabled={!input.trim()}
            >
              <Text style={styles.confirmText}>Restore</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function PrivacyModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const Colors = useColors();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.fullOverlay}>
        <View style={[styles.fullSheet, { backgroundColor: Colors.backgroundMid }]}>
          <View style={[styles.fullHeader, { borderBottomColor: Colors.border }]}>
            <Text style={[styles.fullTitle, { color: Colors.textPrimary }]}>Privacy Policy</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: Colors.backgroundDark }]}>
              <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.fullContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.policyDate, { color: Colors.textMuted }]}>Effective date: January 1, 2025</Text>
            <Text style={[styles.policyHeading, { color: Colors.textPrimary }]}>1. Introduction</Text>
            <Text style={[styles.policyBody, { color: Colors.textSecondary }]}>Cashper is a personal finance tracker app. We are committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our mobile application.</Text>
            <Text style={[styles.policyHeading, { color: Colors.textPrimary }]}>2. Data Collection</Text>
            <Text style={[styles.policyBody, { color: Colors.textSecondary }]}>Cashper does NOT collect, transmit, or store any personal or financial data on external servers. All data you enter is stored exclusively on your device using local storage (AsyncStorage). No data is shared with third parties.</Text>
            <Text style={[styles.policyHeading, { color: Colors.textPrimary }]}>3. Data You Enter</Text>
            <Text style={[styles.policyBody, { color: Colors.textSecondary }]}>{'• Wallet names and balances\n• Transaction amounts, categories, and descriptions\n• Budget limits and categories\n• Gamification stats (XP, level, streaks)\n\nAll data remains on your device and is never sent to us or any third party.'}</Text>
            <Text style={[styles.policyHeading, { color: Colors.textPrimary }]}>4. Analytics & Crash Reporting</Text>
            <Text style={[styles.policyBody, { color: Colors.textSecondary }]}>Cashper does not use any analytics, crash reporting, or advertising SDK that transmits data off-device.</Text>
            <Text style={[styles.policyHeading, { color: Colors.textPrimary }]}>5. Contact Us</Text>
            <Text style={[styles.policyBody, { color: Colors.textSecondary }]}>support@cashperapp.ph</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function TermsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const Colors = useColors();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.fullOverlay}>
        <View style={[styles.fullSheet, { backgroundColor: Colors.backgroundMid }]}>
          <View style={[styles.fullHeader, { borderBottomColor: Colors.border }]}>
            <Text style={[styles.fullTitle, { color: Colors.textPrimary }]}>Terms of Service</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: Colors.backgroundDark }]}>
              <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.fullContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.policyDate, { color: Colors.textMuted }]}>Effective date: January 1, 2025</Text>
            <Text style={[styles.policyHeading, { color: Colors.textPrimary }]}>1. Acceptance of Terms</Text>
            <Text style={[styles.policyBody, { color: Colors.textSecondary }]}>By downloading or using Cashper, you agree to be bound by these Terms of Service.</Text>
            <Text style={[styles.policyHeading, { color: Colors.textPrimary }]}>2. No Financial Advice</Text>
            <Text style={[styles.policyBody, { color: Colors.textSecondary }]}>Cashper is a tracking tool only. AI insights are for informational purposes and do not constitute financial advice. Always consult a qualified professional for financial decisions.</Text>
            <Text style={[styles.policyHeading, { color: Colors.textPrimary }]}>3. Data Responsibility</Text>
            <Text style={[styles.policyBody, { color: Colors.textSecondary }]}>All data stored in Cashper is your responsibility. Use the Backup feature regularly. We are not liable for data loss due to device failure or app uninstallation.</Text>
            <Text style={[styles.policyHeading, { color: Colors.textPrimary }]}>4. Purchases</Text>
            <Text style={[styles.policyBody, { color: Colors.textSecondary }]}>In-app purchases (such as "Remove Ads") are one-time, final, and non-refundable unless required by applicable law.</Text>
            <Text style={[styles.policyHeading, { color: Colors.textPrimary }]}>5. Governing Law</Text>
            <Text style={[styles.policyBody, { color: Colors.textSecondary }]}>These Terms are governed by the laws of the Republic of the Philippines.</Text>
            <Text style={[styles.policyHeading, { color: Colors.textPrimary }]}>6. Contact</Text>
            <Text style={[styles.policyBody, { color: Colors.textSecondary }]}>support@cashperapp.ph</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const Colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const { currency, setCurrencyByCode } = useCurrency();
  const { lockEnabled, biometricsAvailable, biometricType, enableLock, disableLock, lockNow, hasPin, savePin } = useSecurity();
  const { transactions, wallets, budgets, stats } = useFinance();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [pinStep, setPinStep]           = useState<'enter' | 'confirm'>('enter');
  const [pinFirst, setPinFirst]         = useState('');
  const [pinInput, setPinInput]         = useState('');
  const [pinError, setPinError]         = useState('');
  const [budgetAlerts, setBudgetAlerts] = useToggle(SETTINGS_KEYS.budgetAlerts, true);
  const [streakReminders, setStreakReminders] = useToggle(SETTINGS_KEYS.streakReminders, true);
  const [showRestore, setShowRestore] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const PIN_LEN = 4;
  const PAD_KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

  const openPinSetup = () => {
    setPinStep('enter');
    setPinFirst('');
    setPinInput('');
    setPinError('');
    setShowPinSetup(true);
  };

  const handlePinKey = (key: string) => {
    if (key === '⌫') {
      setPinInput(p => p.slice(0, -1));
      setPinError('');
      return;
    }
    if (key === '' || pinInput.length >= PIN_LEN) return;
    const next = pinInput + key;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPinInput(next);
    if (next.length === PIN_LEN) {
      if (pinStep === 'enter') {
        setPinFirst(next);
        setPinInput('');
        setPinStep('confirm');
        setPinError('');
      } else {
        if (next === pinFirst) {
          savePin(next).then(() => {
            setShowPinSetup(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          });
        } else {
          setPinError('PINs do not match — try again');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setTimeout(() => { setPinInput(''); setPinStep('enter'); setPinFirst(''); setPinError(''); }, 600);
        }
      }
    }
  };

  const handleBackup = async () => {
    try {
      const data = { version: '1.0', exportedAt: new Date().toISOString(), wallets, transactions, budgets, stats };
      const json = JSON.stringify(data, null, 2);
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cashper-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('Backup Downloaded', 'Your backup JSON file has been downloaded.');
      } else {
        await Share.share({ message: json, title: 'Cashper Backup' });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch { Alert.alert('Error', 'Could not create backup.'); }
  };

  const handleRestore = async (json: string) => {
    try {
      const data = JSON.parse(json);
      if (!data.wallets || !data.transactions) { Alert.alert('Invalid Backup', 'The JSON does not look like a valid Cashper backup.'); return; }
      Alert.alert(
        'Restore Backup?',
        `This will replace all your current data with:\n• ${data.wallets.length} wallets\n• ${data.transactions.length} transactions\n\nThis cannot be undone.`,
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
    } catch { Alert.alert('Invalid JSON', 'Could not parse the backup file.'); }
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
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Alert.alert('Export Done', 'CSV file has been downloaded.');
      } else {
        await Share.share({ message: csv, title: 'Cashper Transactions CSV' });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch { Alert.alert('Error', 'Could not export.'); }
  };

  return (
    <View style={[styles.screen, { backgroundColor: Colors.backgroundDark }]}>
      <RestoreModal visible={showRestore} onClose={() => setShowRestore(false)} onRestore={handleRestore} />
      <PrivacyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <TermsModal visible={showTerms} onClose={() => setShowTerms(false)} />

      <Modal visible={showCurrencyPicker} animationType="slide" transparent onRequestClose={() => setShowCurrencyPicker(false)}>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: Colors.card }]}>
            <View style={[styles.handle, { backgroundColor: Colors.border }]} />
            <Text style={[styles.sheetTitle, { color: Colors.textPrimary }]}>Select Currency</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
              {CURRENCIES.map(c => (
                <TouchableOpacity
                  key={c.code}
                  style={[styles.currencyRow, { borderBottomColor: Colors.border }, c.code === currency.code && { backgroundColor: Colors.accent + '12' }]}
                  onPress={() => { setCurrencyByCode(c.code); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowCurrencyPicker(false); }}
                >
                  <Text style={[styles.currencySymbol, { color: Colors.textSecondary }]}>{c.symbol}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.currencyCode, { color: Colors.textPrimary }]}>{c.code}</Text>
                    <Text style={[styles.currencyName, { color: Colors.textMuted }]}>{c.name}</Text>
                  </View>
                  {c.code === currency.code && <MaterialIcons name="check-circle" size={20} color={Colors.accent} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: Colors.backgroundDark, marginTop: 12 }]} onPress={() => setShowCurrencyPicker(false)}>
              <Text style={[styles.cancelText, { color: Colors.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={[styles.header, { paddingTop: topPadding + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: Colors.card }]}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors.textPrimary }]}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: Colors.textMuted }]}>Notifications</Text>
        <Card style={styles.settingsGroup}>
          <View style={[styles.settingsRow, { borderBottomColor: Colors.border }]}>
            <MaterialIcons name="notifications" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <Text style={[styles.settingsLabel, { color: Colors.textPrimary }]}>Budget Alerts</Text>
            <Switch
              value={budgetAlerts}
              onValueChange={(v) => { setBudgetAlerts(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              trackColor={{ true: Colors.accent, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.settingsRow, styles.lastRow]}>
            <MaterialIcons name="local-fire-department" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <Text style={[styles.settingsLabel, { color: Colors.textPrimary }]}>Streak Reminders</Text>
            <Switch
              value={streakReminders}
              onValueChange={(v) => { setStreakReminders(v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              trackColor={{ true: Colors.accent, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        <Text style={[styles.sectionLabel, { color: Colors.textMuted }]}>Security</Text>
        <Card style={styles.settingsGroup}>
          <View style={[styles.settingsRow, styles.lastRow]}>
            <MaterialIcons
              name={biometricsAvailable ? 'fingerprint' : 'lock'}
              size={20}
              color={Colors.textSecondary}
              style={styles.settingsIcon}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsLabel, { color: Colors.textPrimary }]}>
                {biometricsAvailable ? `${biometricType} / PIN Lock` : 'PIN / Passcode Lock'}
              </Text>
              <Text style={[styles.settingsSubtext, { color: Colors.textMuted }]}>
                {Platform.OS === 'web'
                  ? 'Lock Cashper when you leave the app'
                  : biometricsAvailable
                  ? `Unlock with ${biometricType} or your device passcode`
                  : 'Unlock with your device passcode'}
              </Text>
            </View>
            <Switch
              value={lockEnabled}
              onValueChange={async (v) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (v) {
                  const success = await enableLock();
                  if (!success) { Alert.alert('Authentication Failed', 'Could not verify your identity.'); return; }
                  if (Platform.OS === 'web' && !hasPin) openPinSetup();
                } else {
                  const success = await disableLock();
                  if (!success) Alert.alert('Authentication Failed', 'Could not verify your identity.');
                }
              }}
              trackColor={{ true: Colors.accent, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
          {lockEnabled && (
            <TouchableOpacity
              style={[styles.settingsRow, styles.lastRow, { borderBottomColor: Colors.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); lockNow(); }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="lock" size={20} color={Colors.accent} style={styles.settingsIcon} />
              <Text style={[styles.settingsLabel, { color: Colors.accent, fontWeight: '600' }]}>Lock Now</Text>
              <MaterialIcons name="chevron-right" size={20} color={Colors.accent} />
            </TouchableOpacity>
          )}
        </Card>

        <Text style={[styles.sectionLabel, { color: Colors.textMuted }]}>Appearance</Text>
        <Card style={styles.settingsGroup}>
          <View style={[styles.settingsRow, { borderBottomColor: Colors.border }]}>
            <MaterialIcons name="dark-mode" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <Text style={[styles.settingsLabel, { color: Colors.textPrimary }]}>Dark Mode</Text>
            <Switch
              value={isDark}
              onValueChange={() => { toggleTheme(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              trackColor={{ true: Colors.accent, false: Colors.border }}
              thumbColor="#fff"
            />
          </View>
          <TouchableOpacity style={[styles.settingsRow, styles.lastRow]} onPress={() => setShowCurrencyPicker(true)} activeOpacity={0.7}>
            <MaterialIcons name="attach-money" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsLabel, { color: Colors.textPrimary }]}>Currency</Text>
              <Text style={[styles.settingsSubtext, { color: Colors.textMuted }]}>{currency.code} — {currency.name}</Text>
            </View>
            <Text style={[styles.currencyBadge, { color: Colors.accent }]}>{currency.symbol}</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <Text style={[styles.sectionLabel, { color: Colors.textMuted }]}>Data</Text>
        <Card style={styles.settingsGroup}>
          <TouchableOpacity style={[styles.settingsRow, { borderBottomColor: Colors.border }]} onPress={handleBackup} activeOpacity={0.7}>
            <MaterialIcons name="backup" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsLabel, { color: Colors.textPrimary }]}>Backup Data</Text>
              <Text style={[styles.settingsSubtext, { color: Colors.textMuted }]}>Export as JSON</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingsRow, { borderBottomColor: Colors.border }]} onPress={() => setShowRestore(true)} activeOpacity={0.7}>
            <MaterialIcons name="restore" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsLabel, { color: Colors.textPrimary }]}>Restore Backup</Text>
              <Text style={[styles.settingsSubtext, { color: Colors.textMuted }]}>Import from JSON file or paste</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingsRow, styles.lastRow]} onPress={handleExportCSV} activeOpacity={0.7}>
            <MaterialIcons name="table-chart" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingsLabel, { color: Colors.textPrimary }]}>Export to CSV</Text>
              <Text style={[styles.settingsSubtext, { color: Colors.textMuted }]}>{transactions.length} transactions</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <Text style={[styles.sectionLabel, { color: Colors.textMuted }]}>About</Text>
        <Card style={styles.settingsGroup}>
          <View style={[styles.settingsRow, { borderBottomColor: Colors.border }]}>
            <MaterialIcons name="info" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <Text style={[styles.settingsLabel, { color: Colors.textPrimary }]}>App Version</Text>
            <Text style={[styles.settingsInfoValue, { color: Colors.textMuted }]}>1.0.0</Text>
          </View>
          <TouchableOpacity style={[styles.settingsRow, { borderBottomColor: Colors.border }]} onPress={() => setShowPrivacy(true)} activeOpacity={0.7}>
            <MaterialIcons name="privacy-tip" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <Text style={[styles.settingsLabel, { color: Colors.textPrimary }]}>Privacy Policy</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingsRow, styles.lastRow]} onPress={() => setShowTerms(true)} activeOpacity={0.7}>
            <MaterialIcons name="receipt-long" size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
            <Text style={[styles.settingsLabel, { color: Colors.textPrimary }]}>Terms of Service</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        <View style={styles.statsFooter}>
          <Text style={[styles.statsFooterLabel, { color: Colors.textMuted }]}>Your Data Summary</Text>
          <Text style={[styles.statsFooterValue, { color: Colors.textMuted }]}>{transactions.length} transactions · {wallets.length} wallets · {budgets.length} budgets</Text>
          <View style={[styles.localBadge, { backgroundColor: Colors.success + '15' }]}>
            <MaterialIcons name="lock" size={12} color={Colors.success} />
            <Text style={[styles.localBadgeText, { color: Colors.success }]}>All data stored locally on your device</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showPinSetup} transparent animationType="fade" onRequestClose={() => {}}>
        <View style={[styles.pinOverlay, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
          <View style={[styles.pinBox, { backgroundColor: Colors.background }]}>
            <Text style={[styles.pinTitle, { color: Colors.textPrimary }]}>
              {pinStep === 'enter' ? 'Set Your PIN' : 'Confirm Your PIN'}
            </Text>
            <Text style={[styles.pinSub, { color: Colors.textMuted }]}>
              {pinStep === 'enter'
                ? 'Choose a 4-digit PIN to lock Cashper'
                : 'Enter the same PIN again to confirm'}
            </Text>

            <View style={styles.pinDotsRow}>
              {Array.from({ length: PIN_LEN }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.pinDot,
                    {
                      backgroundColor: i < pinInput.length ? Colors.accent : 'transparent',
                      borderColor: i < pinInput.length ? Colors.accent : Colors.border,
                    },
                  ]}
                />
              ))}
            </View>

            {pinError ? (
              <Text style={[styles.pinError, { color: Colors.danger }]}>{pinError}</Text>
            ) : null}

            <View style={styles.pinPad}>
              {PAD_KEYS.map((key, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.pinKey,
                    key === '' && { opacity: 0 },
                    key !== '' && key !== '⌫' && { backgroundColor: Colors.card },
                  ]}
                  onPress={() => handlePinKey(key)}
                  disabled={key === ''}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.pinKeyText,
                    { color: key === '⌫' ? Colors.textMuted : Colors.textPrimary },
                  ]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' as const },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 12, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  settingsGroup: { marginBottom: 20, padding: 0, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  lastRow: { borderBottomWidth: 0 },
  settingsIcon: { marginRight: 14 },
  settingsLabel: { flex: 1, fontSize: 15 },
  settingsSubtext: { fontSize: 12, marginTop: 2 },
  settingsInfoValue: { fontSize: 14 },
  statsFooter: { alignItems: 'center', paddingTop: 12 },
  statsFooterLabel: { fontSize: 12, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
  statsFooterValue: { fontSize: 13, marginTop: 4 },
  localBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10 },
  localBadgeText: { fontSize: 12, fontWeight: '500' as const },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center' as const, marginBottom: 16 },
  sheetTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 8 },
  sheetDesc: { fontSize: 13, marginBottom: 14 },
  jsonInput: { borderRadius: 12, padding: 12, fontSize: 13, borderWidth: 1, minHeight: 120, textAlignVertical: 'top' as const, marginBottom: 10 },
  fileBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  fileBtnText: { fontSize: 14, fontWeight: '600' as const },
  sheetActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  cancelText: { fontWeight: '600' as const },
  confirmBtn: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  confirmText: { color: '#FFFFFF', fontWeight: '700' as const },
  fullOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  fullSheet: { flex: 1, marginTop: 60, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  fullHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  fullTitle: { fontSize: 20, fontWeight: '700' as const },
  closeBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  fullContent: { padding: 20, paddingBottom: 40 },
  policyDate: { fontSize: 12, marginBottom: 16 },
  policyHeading: { fontSize: 15, fontWeight: '700' as const, marginTop: 16, marginBottom: 6 },
  policyBody: { fontSize: 14, lineHeight: 22 },
  currencyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1 },
  currencySymbol: { fontSize: 20, fontWeight: '700' as const, width: 28, textAlign: 'center' },
  currencyCode: { fontSize: 15, fontWeight: '600' as const },
  currencyName: { fontSize: 12, marginTop: 1 },
  currencyBadge: { fontSize: 18, fontWeight: '700' as const, marginRight: 6 },
  pinOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pinBox: { borderRadius: 24, padding: 32, alignItems: 'center', width: 320 },
  pinTitle: { fontSize: 20, fontWeight: '700' as const, marginBottom: 6 },
  pinSub: { fontSize: 14, textAlign: 'center' as const, marginBottom: 28 },
  pinDotsRow: { flexDirection: 'row' as const, gap: 16, marginBottom: 12 },
  pinDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
  pinError: { fontSize: 13, fontWeight: '600' as const, marginBottom: 8, textAlign: 'center' as const },
  pinPad: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, justifyContent: 'center' as const, gap: 14, marginTop: 16, width: 260 },
  pinKey: { width: 68, height: 68, borderRadius: 34, justifyContent: 'center' as const, alignItems: 'center' as const },
  pinKeyText: { fontSize: 22, fontWeight: '500' as const },
});
