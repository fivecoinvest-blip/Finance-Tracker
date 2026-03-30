import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CashperMascot } from '@/components/CashperMascot';
import { useSecurity } from '@/context/SecurityContext';
import { useColors } from '@/context/ThemeContext';

export function LockScreen() {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const { unlock, biometricType, biometricsAvailable } = useSecurity();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    if (Platform.OS !== 'web') {
      setTimeout(handleUnlock, 300);
    }
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleUnlock = async () => {
    if (loading) return;
    setLoading(true);
    setFailed(false);
    const success = await unlock();
    if (!success) {
      setFailed(true);
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    setLoading(false);
  };

  const lockLabel = Platform.OS === 'web'
    ? 'Unlock'
    : biometricsAvailable ? biometricType : 'Device Passcode';

  return (
    <Animated.View style={[styles.container, { backgroundColor: Colors.backgroundDark, opacity: fadeIn }]}>
      <View style={[styles.content, { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }]}>
        <Text style={[styles.appName, { color: Colors.accent }]}>Cashper</Text>
        <Text style={[styles.tagline, { color: Colors.textMuted }]}>Your finances are locked</Text>

        <View style={styles.mascotContainer}>
          <CashperMascot mood="default" size={100} showMessage={false} />
        </View>

        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <View style={[styles.lockIcon, { backgroundColor: Colors.card }]}>
            <MaterialIcons name="lock" size={40} color={Colors.accent} />
          </View>
        </Animated.View>

        {failed && (
          <Text style={[styles.failedText, { color: Colors.danger }]}>
            Authentication failed — try again
          </Text>
        )}

        <TouchableOpacity
          style={[styles.unlockBtn, { backgroundColor: Colors.accent }, loading && { opacity: 0.7 }]}
          onPress={handleUnlock}
          disabled={loading}
          activeOpacity={0.85}
        >
          <MaterialIcons
            name={Platform.OS === 'web' ? 'lock-open' : biometricsAvailable ? 'fingerprint' : 'pin'}
            size={22}
            color="#FFFFFF"
          />
          <Text style={styles.unlockBtnText}>
            {loading ? 'Authenticating...' : `Unlock with ${lockLabel}`}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.hint, { color: Colors.textMuted }]}>
          {Platform.OS === 'web'
            ? 'Tap unlock to access Cashper'
            : 'You can also use your device passcode'}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  appName: {
    fontSize: 36,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    marginBottom: 32,
  },
  mascotContainer: {
    marginBottom: 24,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  failedText: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 16,
    textAlign: 'center',
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  hint: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
