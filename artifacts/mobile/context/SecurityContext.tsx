import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';

const LOCK_KEY = '@cashper_lock_enabled';
const LOCK_DELAY_MS = 3000;

interface SecurityContextValue {
  lockEnabled: boolean;
  isLocked: boolean;
  biometricsAvailable: boolean;
  biometricType: string;
  enableLock: () => Promise<boolean>;
  disableLock: () => Promise<boolean>;
  unlock: () => Promise<boolean>;
  lockNow: () => void;
}

const SecurityContext = createContext<SecurityContextValue | null>(null);

export function useSecurity() {
  const ctx = useContext(SecurityContext);
  if (!ctx) throw new Error('useSecurity must be used inside SecurityProvider');
  return ctx;
}

function getBiometricLabel(types: LocalAuthentication.AuthenticationType[]): string {
  if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'Face ID';
  if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'Fingerprint';
  if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'Iris';
  return 'Biometrics';
}

async function checkBiometrics(): Promise<{ available: boolean; label: string }> {
  if (Platform.OS === 'web') return { available: false, label: 'Biometrics' };
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) return { available: false, label: 'Biometrics' };
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    return { available: true, label: getBiometricLabel(types) };
  } catch {
    return { available: false, label: 'Biometrics' };
  }
}

async function doAuthenticate(reason: string): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: 'Use Passcode',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });
    return result.success;
  } catch {
    return false;
  }
}

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [lockEnabled, setLockEnabled] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometrics');
  const [loaded, setLoaded] = useState(false);

  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);
  const lockEnabledRef = useRef(lockEnabled);
  lockEnabledRef.current = lockEnabled;

  useEffect(() => {
    checkBiometrics().then(({ available, label }) => {
      setBiometricsAvailable(available);
      setBiometricType(label);
    });
    AsyncStorage.getItem(LOCK_KEY).then(v => {
      if (v === 'true') setLockEnabled(true);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;

    if (Platform.OS === 'web') {
      const handleVisibility = () => {
        if (document.hidden) {
          backgroundTime.current = Date.now();
        } else {
          if (lockEnabledRef.current) {
            const elapsed = backgroundTime.current
              ? Date.now() - backgroundTime.current
              : Infinity;
            if (elapsed > LOCK_DELAY_MS) {
              setIsLocked(true);
            }
          }
          backgroundTime.current = null;
        }
      };
      document.addEventListener('visibilitychange', handleVisibility);
      return () => document.removeEventListener('visibilitychange', handleVisibility);
    }

    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;

      if (prev === 'active' && (next === 'background' || next === 'inactive')) {
        backgroundTime.current = Date.now();
      }

      if (next === 'active' && lockEnabledRef.current) {
        const elapsed = backgroundTime.current
          ? Date.now() - backgroundTime.current
          : Infinity;
        if (elapsed > LOCK_DELAY_MS) {
          setIsLocked(true);
        }
        backgroundTime.current = null;
      }
    });
    return () => sub.remove();
  }, [loaded]);

  const lockNow = useCallback(() => {
    if (lockEnabledRef.current) setIsLocked(true);
  }, []);

  const enableLock = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(LOCK_KEY, 'true');
      setLockEnabled(true);
      return true;
    }
    const success = await doAuthenticate('Confirm your identity to enable lock');
    if (success) {
      await AsyncStorage.setItem(LOCK_KEY, 'true');
      setLockEnabled(true);
    }
    return success;
  }, []);

  const disableLock = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(LOCK_KEY, 'false');
      setLockEnabled(false);
      setIsLocked(false);
      return true;
    }
    const success = await doAuthenticate('Confirm your identity to disable lock');
    if (success) {
      await AsyncStorage.setItem(LOCK_KEY, 'false');
      setLockEnabled(false);
      setIsLocked(false);
    }
    return success;
  }, []);

  const unlock = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      setIsLocked(false);
      return true;
    }
    const success = await doAuthenticate('Unlock Cashper');
    if (success) setIsLocked(false);
    return success;
  }, []);

  if (!loaded) return null;

  return (
    <SecurityContext.Provider
      value={{ lockEnabled, isLocked, biometricsAvailable, biometricType, enableLock, disableLock, unlock, lockNow }}
    >
      {children}
    </SecurityContext.Provider>
  );
}
