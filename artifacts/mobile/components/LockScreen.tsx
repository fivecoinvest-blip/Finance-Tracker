import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CashperMascot } from '@/components/CashperMascot';
import { useSecurity } from '@/context/SecurityContext';
import { useColors } from '@/context/ThemeContext';

const PAD_KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
const PIN_LENGTH = 4;

export function LockScreen() {
  const Colors = useColors();
  const insets = useSafeAreaInsets();
  const { unlock, biometricType, biometricsAvailable, hasPin } = useSecurity();
  const [loading, setLoading]   = useState(false);
  const [failed, setFailed]     = useState(false);
  const [pin, setPin]           = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn    = useRef(new Animated.Value(0)).current;

  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    if (!isWeb) {
      setTimeout(handleBiometric, 300);
    }
  }, []);

  useEffect(() => {
    if (isWeb && hasPin && pin.length === PIN_LENGTH) {
      handlePinSubmit(pin);
    }
  }, [pin]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleBiometric = async () => {
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

  const handlePinSubmit = async (enteredPin: string) => {
    if (loading) return;
    setLoading(true);
    setFailed(false);
    const success = await unlock(enteredPin);
    if (!success) {
      setFailed(true);
      shake();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setPin(''), 400);
    }
    setLoading(false);
  };

  const handleKey = (key: string) => {
    if (loading) return;
    if (key === '⌫') {
      setPin(p => p.slice(0, -1));
    } else if (key === '') {
      return;
    } else if (pin.length < PIN_LENGTH) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPin(p => p + key);
    }
  };

  const lockLabel = isWeb
    ? 'Enter PIN'
    : biometricsAvailable ? biometricType : 'Device Passcode';

  return (
    <Animated.View style={[styles.container, { backgroundColor: Colors.backgroundDark, opacity: fadeIn }]}>
      <View style={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        <Text style={[styles.appName, { color: Colors.accent }]}>Cashper</Text>
        <Text style={[styles.tagline, { color: Colors.textMuted }]}>Your finances are locked</Text>

        <View style={styles.mascotContainer}>
          <CashperMascot mood="default" size={80} showMessage={false} />
        </View>

        {isWeb && hasPin ? (
          <>
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <View style={styles.dotsRow}>
                {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      {
                        backgroundColor: i < pin.length ? Colors.accent : 'transparent',
                        borderColor: i < pin.length ? Colors.accent : Colors.textMuted,
                      },
                    ]}
                  />
                ))}
              </View>
            </Animated.View>

            {failed && (
              <Text style={[styles.failedText, { color: Colors.danger }]}>
                Wrong PIN — try again
              </Text>
            )}

            <View style={styles.numpad}>
              {PAD_KEYS.map((key, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.numKey,
                    key === '' && { opacity: 0 },
                    key === '⌫' && { backgroundColor: 'transparent' },
                    key !== '' && key !== '⌫' && { backgroundColor: Colors.card },
                  ]}
                  onPress={() => handleKey(key)}
                  disabled={key === '' || loading}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.numKeyText,
                    { color: key === '⌫' ? Colors.textMuted : Colors.textPrimary },
                  ]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : !isWeb ? (
          <>
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
              onPress={handleBiometric}
              disabled={loading}
              activeOpacity={0.85}
            >
              <MaterialIcons
                name={biometricsAvailable ? 'fingerprint' : 'pin'}
                size={22}
                color="#FFFFFF"
              />
              <Text style={styles.unlockBtnText}>
                {loading ? 'Authenticating...' : `Unlock with ${lockLabel}`}
              </Text>
            </TouchableOpacity>

            <Text style={[styles.hint, { color: Colors.textMuted }]}>
              You can also use your device passcode
            </Text>
          </>
        ) : (
          <View style={[styles.lockIcon, { backgroundColor: Colors.card }]}>
            <MaterialIcons name="lock" size={40} color={Colors.accent} />
          </View>
        )}
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
    fontSize: 34,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    marginBottom: 24,
  },
  mascotContainer: {
    marginBottom: 20,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
  },
  failedText: {
    fontSize: 13,
    fontWeight: '600' as const,
    marginBottom: 12,
    textAlign: 'center',
  },
  numpad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    marginTop: 16,
    width: 280,
  },
  numKey: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numKeyText: {
    fontSize: 24,
    fontWeight: '500' as const,
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
