import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform } from 'react-native';
import {
  cancelStreakReminder,
  fireNotification,
  requestPermissions,
  scheduleStreakReminder,
} from '@/services/NotificationService';

interface TxLike { type: string; category: string; amount: number; date: string; }
interface BudgetLike { id: string; category: string; limit: number; period: 'monthly' | 'weekly'; }

const KEYS = {
  budgetAlerts: '@cashper_budget_alerts',
  streakReminders: '@cashper_streak_reminders',
  alertCooldowns: '@cashper_alert_cooldowns',
};

const COOLDOWN_MS = 6 * 60 * 60 * 1000;

interface NotificationContextValue {
  budgetAlerts: boolean;
  streakReminders: boolean;
  toggleBudgetAlerts: (v: boolean) => Promise<void>;
  toggleStreakReminders: (v: boolean) => Promise<void>;
  checkBudgetAlerts: (
    category: string,
    transactions: TxLike[],
    budgets: BudgetLike[],
    currencySymbol: string,
  ) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}

function getStartOfPeriod(period: 'monthly' | 'weekly'): Date {
  const now = new Date();
  if (period === 'monthly') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.getFullYear(), now.getMonth(), diff);
}

function calcSpent(category: string, transactions: TxLike[], period: 'monthly' | 'weekly'): number {
  const since = getStartOfPeriod(period).getTime();
  return transactions
    .filter(t => t.type === 'expense' && t.category === category && new Date(t.date).getTime() >= since)
    .reduce((sum, t) => sum + t.amount, 0);
}

function scheduleWebStreakCheck(lastLogDate: string) {
  if (Platform.OS !== 'web' || !('Notification' in window)) return;
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const hasLoggedToday = lastLogDate === today;
  if (hasLoggedToday) return;

  const target = new Date();
  target.setHours(20, 0, 0, 0);
  const msUntil = target.getTime() - now.getTime();
  const delay = msUntil > 0 ? msUntil : 0;

  setTimeout(() => {
    fireNotification('🔥 Keep your streak alive!', "Don't forget to log your transactions today.");
  }, delay === 0 ? 500 : delay);
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [streakReminders, setStreakReminders] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const cooldownsRef = useRef<Record<string, number>>({});
  const budgetAlertsRef = useRef(budgetAlerts);
  budgetAlertsRef.current = budgetAlerts;

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEYS.budgetAlerts),
      AsyncStorage.getItem(KEYS.streakReminders),
      AsyncStorage.getItem(KEYS.alertCooldowns),
    ]).then(([ba, sr, cd]) => {
      if (ba !== null) setBudgetAlerts(ba === 'true');
      if (sr !== null) setStreakReminders(sr === 'true');
      if (cd) {
        try { cooldownsRef.current = JSON.parse(cd); } catch {}
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (streakReminders) {
      scheduleStreakReminder();
      AsyncStorage.getItem('@cashper_stats').then(raw => {
        if (!raw) return;
        try {
          const s = JSON.parse(raw);
          scheduleWebStreakCheck(s.lastLogDate ?? '');
        } catch {}
      });
    } else {
      cancelStreakReminder();
    }
  }, [loaded, streakReminders]);

  const saveCooldowns = useCallback(async () => {
    await AsyncStorage.setItem(KEYS.alertCooldowns, JSON.stringify(cooldownsRef.current));
  }, []);

  const toggleBudgetAlerts = useCallback(async (v: boolean) => {
    if (v) await requestPermissions();
    setBudgetAlerts(v);
    await AsyncStorage.setItem(KEYS.budgetAlerts, v ? 'true' : 'false');
  }, []);

  const toggleStreakReminders = useCallback(async (v: boolean) => {
    if (v) {
      await requestPermissions();
      await scheduleStreakReminder();
    } else {
      await cancelStreakReminder();
    }
    setStreakReminders(v);
    await AsyncStorage.setItem(KEYS.streakReminders, v ? 'true' : 'false');
  }, []);

  const checkBudgetAlerts = useCallback(async (
    category: string,
    transactions: TxLike[],
    budgets: BudgetLike[],
    currencySymbol: string,
  ) => {
    if (!budgetAlertsRef.current) return;

    const matching = budgets.filter(b => b.category === category);
    for (const budget of matching) {
      const spent = calcSpent(category, transactions, budget.period);
      const pct = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

      const threshold = pct >= 100 ? 100 : pct >= 80 ? 80 : null;
      if (!threshold) continue;

      const cooldownKey = `${budget.id}-${threshold}`;
      const lastFired = cooldownsRef.current[cooldownKey] ?? 0;
      if (Date.now() - lastFired < COOLDOWN_MS) continue;

      const pctLabel = pct >= 100
        ? 'exceeded'
        : `${Math.round(pct)}% used`;

      const title = pct >= 100
        ? `🚨 Budget Exceeded: ${category}`
        : `⚠️ Budget Warning: ${category}`;

      const body = pct >= 100
        ? `You've exceeded your ${budget.period} budget of ${currencySymbol}${budget.limit.toLocaleString()}.`
        : `You've used ${pctLabel} of your ${budget.period} ${category} budget (${currencySymbol}${Math.round(spent).toLocaleString()} / ${currencySymbol}${budget.limit.toLocaleString()}).`;

      await fireNotification(title, body);
      cooldownsRef.current[cooldownKey] = Date.now();
      await saveCooldowns();
    }
  }, [saveCooldowns]);

  return (
    <NotificationContext.Provider
      value={{ budgetAlerts, streakReminders, toggleBudgetAlerts, toggleStreakReminders, checkBudgetAlerts }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
