import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscription } from '@/lib/revenuecat';
import { useColors } from '@/context/ThemeContext';

interface ProPaywallProps {
  visible: boolean;
  onClose: () => void;
  trigger?: string;
}

const PRO_FEATURES = [
  { icon: 'account-balance-wallet', label: 'Unlimited wallets', desc: 'Add as many wallets as you need' },
  { icon: 'cloud-upload', label: 'Backup & restore', desc: 'Never lose your data' },
  { icon: 'star', label: 'All future features', desc: 'Get every new feature first' },
];

export function ProPaywall({ visible, onClose, trigger }: ProPaywallProps) {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const { offerings, isSubscribed, purchase, restore, isPurchasing, isRestoring, isLoading } = useSubscription();
  const [purchaseConfirm, setPurchaseConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentOffering = offerings?.current;
  const pkg = currentOffering?.availablePackages[0];
  const price = pkg?.product.priceString ?? '$4.99';
  const productTitle = pkg?.product.title ?? 'Cashper Pro';

  const handlePurchase = async () => {
    if (!pkg) return;
    if (!purchaseConfirm) {
      setPurchaseConfirm(true);
      return;
    }
    setError(null);
    setPurchaseConfirm(false);
    try {
      await purchase(pkg);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1800);
    } catch (e: any) {
      if (e?.userCancelled) return;
      setError('Purchase failed. Please try again.');
    }
  };

  const handleRestore = async () => {
    setError(null);
    try {
      await restore();
    } catch {
      setError('Restore failed. Please try again.');
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: Colors.backgroundDark, paddingTop: topPad }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <MaterialIcons name="close" size={24} color={Colors.textMuted} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.hero}>
            <View style={[styles.crownBadge, { backgroundColor: '#FF6B35' }]}>
              <MaterialIcons name="workspace-premium" size={40} color="#fff" />
            </View>
            <Text style={[styles.heroTitle, { color: Colors.textPrimary }]}>Cashper Pro</Text>
            <Text style={[styles.heroSub, { color: Colors.textMuted }]}>
              {trigger === 'wallet_limit'
                ? 'You\'ve reached the 3-wallet limit on the free plan.'
                : 'Unlock everything Cashper has to offer.'}
            </Text>
          </View>

          <View style={[styles.featuresCard, { backgroundColor: Colors.card }]}>
            {PRO_FEATURES.map((f, i) => (
              <View key={f.icon} style={[styles.featureRow, i < PRO_FEATURES.length - 1 && { borderBottomWidth: 1, borderBottomColor: Colors.border }]}>
                <View style={[styles.featureIcon, { backgroundColor: '#FF6B35' + '20' }]}>
                  <MaterialIcons name={f.icon as any} size={20} color="#FF6B35" />
                </View>
                <View style={styles.featureText}>
                  <Text style={[styles.featureLabel, { color: Colors.textPrimary }]}>{f.label}</Text>
                  <Text style={[styles.featureDesc, { color: Colors.textMuted }]}>{f.desc}</Text>
                </View>
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              </View>
            ))}
          </View>

          {isSubscribed ? (
            <View style={[styles.alreadyPro, { backgroundColor: '#4CAF50' + '20' }]}>
              <MaterialIcons name="check-circle" size={22} color="#4CAF50" />
              <Text style={[styles.alreadyProText, { color: '#4CAF50' }]}>You're already on Pro!</Text>
            </View>
          ) : success ? (
            <View style={[styles.alreadyPro, { backgroundColor: '#4CAF50' + '20' }]}>
              <MaterialIcons name="check-circle" size={22} color="#4CAF50" />
              <Text style={[styles.alreadyProText, { color: '#4CAF50' }]}>Welcome to Cashper Pro!</Text>
            </View>
          ) : (
            <>
              {error && (
                <View style={[styles.errorBox, { backgroundColor: '#FF3B30' + '15' }]}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {purchaseConfirm && (
                <View style={[styles.confirmBox, { backgroundColor: Colors.card }]}>
                  <Text style={[styles.confirmText, { color: Colors.textPrimary }]}>
                    Confirm one-time purchase of {productTitle} for {price}?
                  </Text>
                </View>
              )}

              {isLoading ? (
                <ActivityIndicator color="#FF6B35" style={{ marginVertical: 20 }} />
              ) : (
                <TouchableOpacity
                  style={[styles.purchaseBtn, { backgroundColor: '#FF6B35', opacity: isPurchasing ? 0.7 : 1 }]}
                  onPress={handlePurchase}
                  disabled={isPurchasing || isRestoring}
                >
                  {isPurchasing ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <MaterialIcons name="workspace-premium" size={20} color="#fff" />
                      <Text style={styles.purchaseBtnText}>
                        {purchaseConfirm ? 'Confirm — ' : 'Get Pro — '}
                        {price} one-time
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.restoreBtn}
                onPress={handleRestore}
                disabled={isPurchasing || isRestoring}
              >
                {isRestoring ? (
                  <ActivityIndicator color={Colors.textMuted} size="small" />
                ) : (
                  <Text style={[styles.restoreBtnText, { color: Colors.textMuted }]}>Restore purchase</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <Text style={[styles.legal, { color: Colors.textMuted }]}>
            One-time purchase. Pay once, own Cashper Pro forever. No recurring charges.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 },
  scroll: { padding: 24, paddingBottom: 48 },
  hero: { alignItems: 'center', marginBottom: 28, marginTop: 24 },
  crownBadge: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  heroTitle: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  heroSub: { fontSize: 15, textAlign: 'center', lineHeight: 22, maxWidth: 280 },
  featuresCard: { borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  featureRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  featureIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1 },
  featureLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  featureDesc: { fontSize: 13 },
  alreadyPro: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, padding: 16, marginBottom: 16,
  },
  alreadyProText: { fontSize: 16, fontWeight: '600' },
  errorBox: { borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { color: '#FF3B30', fontSize: 14, textAlign: 'center' },
  confirmBox: { borderRadius: 12, padding: 14, marginBottom: 12 },
  confirmText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  purchaseBtn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12,
  },
  purchaseBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  restoreBtn: { alignItems: 'center', paddingVertical: 10, marginBottom: 16 },
  restoreBtnText: { fontSize: 14 },
  legal: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
});
