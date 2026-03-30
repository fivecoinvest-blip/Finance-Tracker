import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/ui/Card';
import { Colors } from '@/constants/colors';
import { useFinance } from '@/context/FinanceContext';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { stats, transactions, wallets } = useFinance();
  const [adsRemoved, setAdsRemoved] = useState(false);
  const topPadding = Platform.OS === 'web' ? 67 : insets.top;

  const handleRemoveAds = () => {
    Alert.alert(
      'Remove Ads Forever',
      'Pay ₱999 once and enjoy Cashper ad-free forever. This is a one-time purchase.',
      [
        { text: 'Cancel' },
        {
          text: 'Purchase ₱999', onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setAdsRemoved(true);
            Alert.alert('Thank you!', 'Ads removed permanently. Enjoy FinTrack ad-free!');
          }
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
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

        <Text style={styles.sectionLabel}>App</Text>
        <Card style={styles.settingsGroup}>
          <SettingsRow icon="notifications" label="Budget Alerts" value={true} type="toggle" />
          <SettingsRow icon="local-fire-department" label="Streak Reminders" value={true} type="toggle" />
          <SettingsRow icon="dark-mode" label="Dark Mode" value={true} type="toggle" disabled />
        </Card>

        <Text style={styles.sectionLabel}>Data</Text>
        <Card style={styles.settingsGroup}>
          <SettingsRow icon="backup" label="Backup Data" onPress={() => Alert.alert('Coming Soon', 'Cloud backup will be available in a future update.')} />
          <SettingsRow icon="restore" label="Restore Backup" onPress={() => Alert.alert('Coming Soon', 'Cloud restore will be available in a future update.')} />
        </Card>

        <Text style={styles.sectionLabel}>About</Text>
        <Card style={styles.settingsGroup}>
          <SettingsRow icon="info" label="App Version" value="1.0.0" type="info" />
          <SettingsRow icon="privacy-tip" label="Privacy Policy" onPress={() => Alert.alert('Privacy', 'All data is stored locally on your device. We do not collect or share your financial data.')} />
          <SettingsRow icon="receipt" label="Terms of Service" onPress={() => Alert.alert('Terms', 'Cashper is provided as-is for personal finance tracking.')} />
        </Card>

        <View style={styles.statsFooter}>
          <Text style={styles.statsFooterLabel}>Your Data</Text>
          <Text style={styles.statsFooterValue}>{transactions.length} transactions · {wallets.length} wallets</Text>
          <Text style={styles.statsFooterValue}>All stored locally on your device</Text>
        </View>
      </ScrollView>
    </View>
  );
}

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: boolean | string;
  type?: 'toggle' | 'info' | 'nav';
  onPress?: () => void;
  disabled?: boolean;
}

function SettingsRow({ icon, label, value, type = 'nav', onPress, disabled }: SettingsRowProps) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} disabled={type === 'toggle' || type === 'info' || disabled} activeOpacity={0.7}>
      <MaterialIcons name={icon as any} size={20} color={Colors.textSecondary} style={styles.settingsIcon} />
      <Text style={styles.settingsLabel}>{label}</Text>
      {type === 'toggle' && (
        <Switch
          value={typeof value === 'boolean' ? value : false}
          onValueChange={() => {}}
          trackColor={{ true: Colors.accent, false: Colors.border }}
          thumbColor="#fff"
          disabled={disabled}
        />
      )}
      {type === 'info' && typeof value === 'string' && (
        <Text style={styles.settingsInfoValue}>{value}</Text>
      )}
      {type === 'nav' && (
        <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
      )}
    </TouchableOpacity>
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
  purchaseBtnText: { color: Colors.textDark, fontSize: 15, fontWeight: '700' as const },
  sectionLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 1, marginBottom: 8, marginTop: 4 },
  settingsGroup: { marginBottom: 20, padding: 0, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingsIcon: { marginRight: 14 },
  settingsLabel: { flex: 1, color: Colors.textPrimary, fontSize: 15 },
  settingsInfoValue: { color: Colors.textMuted, fontSize: 14 },
  statsFooter: { alignItems: 'center', paddingTop: 12 },
  statsFooterLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '700' as const, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
  statsFooterValue: { color: Colors.textMuted, fontSize: 13, marginTop: 2 },
});
