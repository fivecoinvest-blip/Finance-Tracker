import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type WalletType = 'cash' | 'bank' | 'savings' | 'ewallet' | 'credit';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type RecurringFrequency = 'weekly' | 'monthly' | 'none';
export type BudgetPeriod = 'weekly' | 'monthly';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  walletId: string;
  toWalletId?: string;
  date: string;
  recurring: RecurringFrequency;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: BudgetPeriod;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
  unlockedAt?: string;
  condition: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastLogDate: string;
  totalTransactions: number;
  totalSaved: number;
  achievements: string[];
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_tx', title: 'First Step', description: 'Add your first transaction', icon: 'star', xp: 50, condition: 'first_transaction' },
  { id: 'streak_3', title: 'On a Roll', description: 'Log for 3 days in a row', icon: 'local-fire-department', xp: 100, condition: 'streak_3' },
  { id: 'streak_7', title: 'Week Warrior', description: 'Log for 7 days in a row', icon: 'emoji-events', xp: 250, condition: 'streak_7' },
  { id: 'streak_30', title: 'Monthly Master', description: 'Log for 30 days in a row', icon: 'military-tech', xp: 1000, condition: 'streak_30' },
  { id: 'wallet_3', title: 'Multi-wallet', description: 'Create 3 wallets', icon: 'account-balance-wallet', xp: 75, condition: 'wallets_3' },
  { id: 'budget_maker', title: 'Budget Pro', description: 'Create your first budget', icon: 'pie-chart', xp: 100, condition: 'first_budget' },
  { id: 'tx_10', title: 'Tracking Machine', description: 'Log 10 transactions', icon: 'track-changes', xp: 150, condition: 'transactions_10' },
  { id: 'tx_50', title: 'Finance Guru', description: 'Log 50 transactions', icon: 'workspace-premium', xp: 500, condition: 'transactions_50' },
  { id: 'under_budget', title: 'Budget Buster', description: 'Stay under budget for a month', icon: 'savings', xp: 300, condition: 'under_budget_month' },
  { id: 'saver', title: 'Super Saver', description: 'Save over ₱5,000', icon: 'diamond', xp: 400, condition: 'savings_5000' },
];

const DEFAULT_WALLETS: Wallet[] = [
  { id: 'wallet_1', name: 'Cash', type: 'cash', balance: 0, color: '#27AE60', icon: 'payments', createdAt: new Date().toISOString() },
];

const DEFAULT_STATS: UserStats = {
  xp: 0,
  level: 1,
  streak: 0,
  lastLogDate: '',
  totalTransactions: 0,
  totalSaved: 0,
  achievements: [],
};

export function xpToLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 100;
}

export interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'danger' | 'info' | 'achievement';
  icon: string;
  title: string;
  body: string;
  metric?: string;
}

interface FinanceContextValue {
  wallets: Wallet[];
  transactions: Transaction[];
  budgets: Budget[];
  achievements: Achievement[];
  stats: UserStats;
  addWallet: (wallet: Omit<Wallet, 'id' | 'createdAt'>) => void;
  updateWallet: (id: string, updates: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  updateBudget: (id: string, updates: Partial<Omit<Budget, 'id' | 'createdAt'>>) => void;
  deleteBudget: (id: string) => void;
  getWalletById: (id: string) => Wallet | undefined;
  getCategorySpending: (category: string, period: BudgetPeriod) => number;
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getBudgetUsage: (budgetId: string) => number;
  getAIInsights: (currencySymbol?: string) => Insight[];
  isLoading: boolean;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

const STORAGE_KEYS = {
  wallets: '@fintrack_wallets',
  transactions: '@fintrack_transactions',
  budgets: '@fintrack_budgets',
  stats: '@fintrack_stats',
};

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [wallets, setWallets] = useState<Wallet[]>(DEFAULT_WALLETS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [walletsJson, txJson, budgetsJson, statsJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.wallets),
        AsyncStorage.getItem(STORAGE_KEYS.transactions),
        AsyncStorage.getItem(STORAGE_KEYS.budgets),
        AsyncStorage.getItem(STORAGE_KEYS.stats),
      ]);
      if (walletsJson) setWallets(JSON.parse(walletsJson));
      if (txJson) setTransactions(JSON.parse(txJson));
      if (budgetsJson) setBudgets(JSON.parse(budgetsJson));
      if (statsJson) setStats(JSON.parse(statsJson));
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };

  const saveWallets = async (data: Wallet[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.wallets, JSON.stringify(data));
  };
  const saveTransactions = async (data: Transaction[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(data));
  };
  const saveBudgets = async (data: Budget[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(data));
  };
  const saveStats = async (data: UserStats) => {
    await AsyncStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(data));
  };

  const updateStreakAndXP = useCallback(async (currentStats: UserStats, xpGain: number, newAchievements: string[]): Promise<UserStats> => {
    const today = new Date().toDateString();
    const lastLog = currentStats.lastLogDate;
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = currentStats.streak;
    if (lastLog === today) {
    } else if (lastLog === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    const newXP = currentStats.xp + xpGain;
    const newLevel = xpToLevel(newXP);
    const updatedAchievements = [...new Set([...currentStats.achievements, ...newAchievements])];

    const updated: UserStats = {
      ...currentStats,
      xp: newXP,
      level: newLevel,
      streak: newStreak,
      lastLogDate: today,
      totalTransactions: currentStats.totalTransactions + 1,
      achievements: updatedAchievements,
    };
    await saveStats(updated);
    return updated;
  }, []);

  const checkAchievements = (currentStats: UserStats, newWallets: Wallet[], newTx: Transaction[], newBudgets: Budget[]): string[] => {
    const unlocked: string[] = [];
    const existing = currentStats.achievements;

    if (newTx.length >= 1 && !existing.includes('first_tx')) unlocked.push('first_tx');
    if (newTx.length >= 10 && !existing.includes('tx_10')) unlocked.push('tx_10');
    if (newTx.length >= 50 && !existing.includes('tx_50')) unlocked.push('tx_50');
    if (newWallets.length >= 3 && !existing.includes('wallet_3')) unlocked.push('wallet_3');
    if (newBudgets.length >= 1 && !existing.includes('budget_maker')) unlocked.push('budget_maker');

    const streak = currentStats.streak;
    if (streak >= 3 && !existing.includes('streak_3')) unlocked.push('streak_3');
    if (streak >= 7 && !existing.includes('streak_7')) unlocked.push('streak_7');
    if (streak >= 30 && !existing.includes('streak_30')) unlocked.push('streak_30');

    return unlocked;
  };

  const addWallet = useCallback(async (wallet: Omit<Wallet, 'id' | 'createdAt'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newWallet: Wallet = { ...wallet, id, createdAt: new Date().toISOString() };
    const updated = [...wallets, newWallet];
    setWallets(updated);
    await saveWallets(updated);
  }, [wallets]);

  const updateWallet = useCallback(async (id: string, updates: Partial<Wallet>) => {
    const updated = wallets.map(w => w.id === id ? { ...w, ...updates } : w);
    setWallets(updated);
    await saveWallets(updated);
  }, [wallets]);

  const deleteWallet = useCallback(async (id: string) => {
    const updatedWallets = wallets.filter(w => w.id !== id);

    // Remove all transactions that belonged to this wallet (either source or destination)
    const removedTxs = transactions.filter(t => t.walletId === id || t.toWalletId === id);
    const updatedTx = transactions.filter(t => t.walletId !== id && t.toWalletId !== id);

    // Undo 10 XP and 1 totalTransaction for each removed transaction
    const xpToRemove = removedTxs.length * 10;
    const newXP = Math.max(0, stats.xp - xpToRemove);
    const updatedStats: UserStats = {
      ...stats,
      xp: newXP,
      level: xpToLevel(newXP),
      totalTransactions: Math.max(0, stats.totalTransactions - removedTxs.length),
    };

    setWallets(updatedWallets);
    setTransactions(updatedTx);
    setStats(updatedStats);
    await saveWallets(updatedWallets);
    await saveTransactions(updatedTx);
    await saveStats(updatedStats);
  }, [wallets, transactions, stats]);

  const addTransaction = useCallback(async (tx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newTx: Transaction = { ...tx, id, createdAt: new Date().toISOString() };

    let updatedWallets = [...wallets];
    if (tx.type === 'income') {
      updatedWallets = updatedWallets.map(w => w.id === tx.walletId ? { ...w, balance: w.balance + tx.amount } : w);
    } else if (tx.type === 'expense') {
      updatedWallets = updatedWallets.map(w => w.id === tx.walletId ? { ...w, balance: w.balance - tx.amount } : w);
    } else if (tx.type === 'transfer' && tx.toWalletId) {
      updatedWallets = updatedWallets.map(w => {
        if (w.id === tx.walletId) return { ...w, balance: w.balance - tx.amount };
        if (w.id === tx.toWalletId) return { ...w, balance: w.balance + tx.amount };
        return w;
      });
    }

    const updatedTx = [newTx, ...transactions];
    const newAchievements = checkAchievements(stats, updatedWallets, updatedTx, budgets);
    const xpGain = 10 + newAchievements.reduce((xpSum, achievementId) => {
      const achievement = DEFAULT_ACHIEVEMENTS.find(ach => ach.id === achievementId);
      return xpSum + (achievement?.xp ?? 0);
    }, 0);

    setWallets(updatedWallets);
    setTransactions(updatedTx);
    await saveWallets(updatedWallets);
    await saveTransactions(updatedTx);

    const updatedStats = await updateStreakAndXP(stats, xpGain, newAchievements);
    setStats(updatedStats);
  }, [wallets, transactions, budgets, stats, updateStreakAndXP]);

  const deleteTransaction = useCallback(async (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // Reverse wallet balance
    let updatedWallets = [...wallets];
    if (tx.type === 'income') {
      updatedWallets = updatedWallets.map(w => w.id === tx.walletId ? { ...w, balance: w.balance - tx.amount } : w);
    } else if (tx.type === 'expense') {
      updatedWallets = updatedWallets.map(w => w.id === tx.walletId ? { ...w, balance: w.balance + tx.amount } : w);
    } else if (tx.type === 'transfer' && tx.toWalletId) {
      updatedWallets = updatedWallets.map(w => {
        if (w.id === tx.walletId) return { ...w, balance: w.balance + tx.amount };
        if (w.id === tx.toWalletId) return { ...w, balance: w.balance - tx.amount };
        return w;
      });
    }

    const updatedTx = transactions.filter(t => t.id !== id);

    // Undo stats: subtract the 10 base XP earned for logging this transaction
    // and decrement the transaction counter. Achievements stay — they're a record of past effort.
    const newXP = Math.max(0, stats.xp - 10);
    const updatedStats: UserStats = {
      ...stats,
      xp: newXP,
      level: xpToLevel(newXP),
      totalTransactions: Math.max(0, stats.totalTransactions - 1),
    };

    setTransactions(updatedTx);
    setWallets(updatedWallets);
    setStats(updatedStats);
    await saveTransactions(updatedTx);
    await saveWallets(updatedWallets);
    await saveStats(updatedStats);
  }, [transactions, wallets, stats]);

  const updateTransaction = useCallback(async (txId: string, updates: Omit<Transaction, 'id' | 'createdAt'>) => {
    const old = transactions.find(t => t.id === txId);
    if (!old) return;

    let updatedWallets = [...wallets];

    // Reverse old balance effect
    if (old.type === 'income') {
      updatedWallets = updatedWallets.map(w => w.id === old.walletId ? { ...w, balance: w.balance - old.amount } : w);
    } else if (old.type === 'expense') {
      updatedWallets = updatedWallets.map(w => w.id === old.walletId ? { ...w, balance: w.balance + old.amount } : w);
    } else if (old.type === 'transfer' && old.toWalletId) {
      updatedWallets = updatedWallets.map(w => {
        if (w.id === old.walletId) return { ...w, balance: w.balance + old.amount };
        if (w.id === old.toWalletId) return { ...w, balance: w.balance - old.amount };
        return w;
      });
    }

    // Apply new balance effect
    if (updates.type === 'income') {
      updatedWallets = updatedWallets.map(w => w.id === updates.walletId ? { ...w, balance: w.balance + updates.amount } : w);
    } else if (updates.type === 'expense') {
      updatedWallets = updatedWallets.map(w => w.id === updates.walletId ? { ...w, balance: w.balance - updates.amount } : w);
    } else if (updates.type === 'transfer' && updates.toWalletId) {
      updatedWallets = updatedWallets.map(w => {
        if (w.id === updates.walletId) return { ...w, balance: w.balance - updates.amount };
        if (w.id === updates.toWalletId) return { ...w, balance: w.balance + updates.amount };
        return w;
      });
    }

    const updatedTx = transactions.map(t =>
      t.id === txId ? { ...t, ...updates } : t
    );

    setWallets(updatedWallets);
    setTransactions(updatedTx);
    await saveWallets(updatedWallets);
    await saveTransactions(updatedTx);
  }, [wallets, transactions]);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id' | 'createdAt'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newBudget: Budget = { ...budget, id, createdAt: new Date().toISOString() };
    const updated = [...budgets, newBudget];
    setBudgets(updated);
    await saveBudgets(updated);

    const newAchievements = checkAchievements(stats, wallets, transactions, updated);
    if (newAchievements.length > 0) {
      const xpGain = newAchievements.reduce((xpSum, achievementId) => {
        const achievement = DEFAULT_ACHIEVEMENTS.find(ach => ach.id === achievementId);
        return xpSum + (achievement?.xp ?? 0);
      }, 0);
      const updatedStats = await updateStreakAndXP(stats, xpGain, newAchievements);
      setStats(updatedStats);
    }
  }, [budgets, stats, wallets, transactions, updateStreakAndXP]);

  const updateBudget = useCallback(async (budgetId: string, updates: Partial<Omit<Budget, 'id' | 'createdAt'>>) => {
    const updated = budgets.map(b => b.id === budgetId ? { ...b, ...updates } : b);
    setBudgets(updated);
    await saveBudgets(updated);
  }, [budgets]);

  const deleteBudget = useCallback(async (id: string) => {
    const updated = budgets.filter(b => b.id !== id);
    setBudgets(updated);
    await saveBudgets(updated);
  }, [budgets]);

  const getWalletById = useCallback((id: string) => wallets.find(w => w.id === id), [wallets]);

  const getCategorySpending = useCallback((category: string, period: BudgetPeriod): number => {
    const now = new Date();
    const start = period === 'monthly'
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return transactions
      .filter(t => t.type === 'expense' && t.category === category && new Date(t.date) >= start)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getTotalBalance = useCallback(() => wallets.reduce((sum, w) => sum + w.balance, 0), [wallets]);

  const getMonthlyIncome = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return transactions
      .filter(t => t.type === 'income' && new Date(t.date) >= start)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getMonthlyExpenses = useCallback(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= start)
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const getBudgetUsage = useCallback((budgetId: string): number => {
    const budget = budgets.find(b => b.id === budgetId);
    if (!budget) return 0;
    const spent = getCategorySpending(budget.category, budget.period);
    return budget.limit > 0 ? spent / budget.limit : 0;
  }, [budgets, getCategorySpending]);

  const getAIInsights = useCallback((currencySymbol = ''): Insight[] => {
    const insights: Insight[] = [];
    const fmt = (n: number) => `${currencySymbol}${Math.round(n).toLocaleString()}`;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const thisTx  = transactions.filter(t => new Date(t.date) >= thisMonthStart);
    const lastTx  = transactions.filter(t => { const d = new Date(t.date); return d >= lastMonthStart && d <= lastMonthEnd; });

    const monthlyExpenses = thisTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const monthlyIncome   = thisTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const lastMonthExp    = lastTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const lastMonthIncome = lastTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const savingsRate     = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    // Spending by category — this month and last month
    const catThis: Record<string, number> = {};
    const catLast: Record<string, number> = {};
    thisTx.filter(t => t.type === 'expense').forEach(t => { catThis[t.category] = (catThis[t.category] ?? 0) + t.amount; });
    lastTx.filter(t => t.type === 'expense').forEach(t => { catLast[t.category] = (catLast[t.category] ?? 0) + t.amount; });

    const topCats = Object.entries(catThis).sort((a, b) => b[1] - a[1]);
    const topCat  = topCats[0];

    // --- Savings rate ---
    if (monthlyIncome > 0) {
      if (savingsRate >= 20) {
        insights.push({ id: 'savings_great', type: 'positive', icon: 'savings', title: 'Great Savings Rate!', body: `You're saving ${Math.round(savingsRate)}% of your income. That's above the recommended 20% target — keep it up!`, metric: `${Math.round(savingsRate)}%` });
      } else if (savingsRate >= 10) {
        insights.push({ id: 'savings_ok', type: 'info', icon: 'savings', title: 'Building Savings', body: `You're saving ${Math.round(savingsRate)}% of your income. Push toward 20% to grow your financial buffer faster.`, metric: `${Math.round(savingsRate)}%` });
      } else if (savingsRate > 0) {
        insights.push({ id: 'savings_low', type: 'warning', icon: 'savings', title: 'Low Savings Rate', body: `Only ${Math.round(savingsRate)}% of income saved this month. Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings.`, metric: `${Math.round(savingsRate)}%` });
      } else if (monthlyExpenses > monthlyIncome) {
        insights.push({ id: 'overspending', type: 'danger', icon: 'trending-down', title: 'Spending More Than You Earn', body: `Your expenses (${fmt(monthlyExpenses)}) exceed your income (${fmt(monthlyIncome)}) by ${fmt(monthlyExpenses - monthlyIncome)} this month.`, metric: `-${fmt(monthlyExpenses - monthlyIncome)}` });
      }
    }

    // --- End-of-month spending forecast ---
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    if (dayOfMonth >= 5 && monthlyExpenses > 0) {
      const dailyRate   = monthlyExpenses / dayOfMonth;
      const projected   = Math.round(dailyRate * daysInMonth);
      const projVsInc   = monthlyIncome > 0 ? Math.round((projected / monthlyIncome) * 100) : null;
      if (projVsInc !== null && projected > monthlyIncome) {
        insights.push({ id: 'forecast_over', type: 'danger', icon: 'show-chart', title: 'Overspend Forecast', body: `At your current pace, you'll spend ${fmt(projected)} by month-end — ${fmt(projected - monthlyIncome)} over your income. Cut back now to close the gap.`, metric: fmt(projected) });
      } else {
        insights.push({ id: 'forecast_ok', type: 'info', icon: 'show-chart', title: 'Month-End Forecast', body: `At your current pace, you'll spend about ${fmt(projected)} by end of ${now.toLocaleString('default', { month: 'long' })}.${projVsInc ? ` That's ${projVsInc}% of your income.` : ''}`, metric: fmt(projected) });
      }
    }

    // --- Top category analysis ---
    if (topCat && monthlyExpenses > 0) {
      const pct  = Math.round((topCat[1] / monthlyExpenses) * 100);
      const save = Math.round(topCat[1] * 0.15);
      const lastAmt = catLast[topCat[0]] ?? 0;
      const trend = lastAmt > 0 ? Math.round(((topCat[1] - lastAmt) / lastAmt) * 100) : null;
      const trendStr = trend !== null ? (trend > 0 ? ` (up ${trend}% vs last month)` : trend < 0 ? ` (down ${Math.abs(trend)}% vs last month)` : '') : '';
      if (pct >= 40) {
        insights.push({ id: 'top_cat_high', type: 'warning', icon: 'donut-large', title: `Heavy ${topCat[0]} Spending`, body: `${topCat[0]} makes up ${pct}% of your expenses this month${trendStr}. Cutting 15% could save you ${fmt(save)}.`, metric: `${pct}%` });
      } else {
        insights.push({ id: 'top_cat', type: 'info', icon: 'donut-large', title: `Top Category: ${topCat[0]}`, body: `${topCat[0]} is your biggest expense at ${pct}% of spending${trendStr}.`, metric: `${pct}%` });
      }
    }

    // --- Month-over-month expense trend ---
    if (lastMonthExp > 0 && monthlyExpenses > 0) {
      const change = Math.round(((monthlyExpenses - lastMonthExp) / lastMonthExp) * 100);
      if (change > 15) {
        insights.push({ id: 'exp_up', type: 'warning', icon: 'trending-up', title: 'Expenses Rising', body: `Your spending is ${change}% higher than last month (${fmt(lastMonthExp)} → ${fmt(monthlyExpenses)}). Check what's driving the increase.`, metric: `+${change}%` });
      } else if (change < -10) {
        insights.push({ id: 'exp_down', type: 'positive', icon: 'trending-down', title: 'Spending Down!', body: `Great discipline — you're spending ${Math.abs(change)}% less than last month (${fmt(lastMonthExp)} → ${fmt(monthlyExpenses)}).`, metric: `${change}%` });
      }
    }

    // --- Income trend ---
    if (lastMonthIncome > 0 && monthlyIncome > 0) {
      const change = Math.round(((monthlyIncome - lastMonthIncome) / lastMonthIncome) * 100);
      if (change > 10) {
        insights.push({ id: 'income_up', type: 'positive', icon: 'attach-money', title: 'Income Increased', body: `Your income is up ${change}% compared to last month. A great opportunity to boost your savings.`, metric: `+${change}%` });
      }
    }

    // --- Budget alerts ---
    const overBudgets = budgets.filter(b => getBudgetUsage(b.id) > 1);
    const nearBudgets = budgets.filter(b => { const u = getBudgetUsage(b.id); return u >= 0.8 && u <= 1; });
    overBudgets.forEach(b => {
      const pct = Math.round(getBudgetUsage(b.id) * 100);
      insights.push({ id: `budget_over_${b.id}`, type: 'danger', icon: 'money-off', title: `${b.category} Budget Exceeded`, body: `You've used ${pct}% of your ${b.period} ${b.category} budget (${fmt(getCategorySpending(b.category, b.period))} / ${fmt(b.limit)}).`, metric: `${pct}%` });
    });
    nearBudgets.forEach(b => {
      const pct = Math.round(getBudgetUsage(b.id) * 100);
      const remaining = b.limit - getCategorySpending(b.category, b.period);
      insights.push({ id: `budget_near_${b.id}`, type: 'warning', icon: 'warning', title: `${b.category} Budget Warning`, body: `You're at ${pct}% of your ${b.period} ${b.category} budget. Only ${fmt(remaining)} remaining.`, metric: `${pct}%` });
    });

    // --- Day-of-week pattern ---
    if (thisTx.length >= 7) {
      const dayTotals: number[] = Array(7).fill(0);
      const dayCounts: number[] = Array(7).fill(0);
      thisTx.filter(t => t.type === 'expense').forEach(t => {
        const d = new Date(t.date).getDay();
        dayTotals[d] += t.amount;
        dayCounts[d]++;
      });
      const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      const heaviestDay = dayTotals.reduce((max, v, i, arr) => v > arr[max] ? i : max, 0);
      if (dayTotals[heaviestDay] > 0) {
        insights.push({ id: 'day_pattern', type: 'info', icon: 'calendar-today', title: `Heavy Spending on ${dayNames[heaviestDay]}s`, body: `${dayNames[heaviestDay]} is your biggest spending day this month. Consider planning ahead for it to avoid impulse buys.`, metric: fmt(dayTotals[heaviestDay]) });
      }
    }

    // --- Streak / gamification ---
    if (stats.streak >= 30) {
      insights.push({ id: 'streak_30', type: 'achievement', icon: 'military-tech', title: '30-Day Streak! 🏆', body: `Incredible! You've tracked your finances every day for ${stats.streak} days. You're a true money master.`, metric: `${stats.streak} days` });
    } else if (stats.streak >= 7) {
      insights.push({ id: 'streak_7', type: 'achievement', icon: 'local-fire-department', title: `${stats.streak}-Day Streak 🔥`, body: `You've logged transactions for ${stats.streak} days straight. Consistent tracking is the first step to financial mastery.`, metric: `${stats.streak} days` });
    } else if (stats.streak >= 3) {
      insights.push({ id: 'streak_3', type: 'positive', icon: 'local-fire-department', title: 'Streak Growing!', body: `You're on a ${stats.streak}-day logging streak. Keep going — 7 days earns the Week Warrior badge!`, metric: `${stats.streak} days` });
    }

    // --- Wallet balance warnings ---
    wallets.forEach(w => {
      if (w.balance < 0) {
        insights.push({ id: `wallet_neg_${w.id}`, type: 'danger', icon: 'account-balance-wallet', title: `${w.name} Is Overdrawn`, body: `Your ${w.name} wallet has a negative balance of ${fmt(Math.abs(w.balance))}. Transfer funds to cover it.`, metric: fmt(w.balance) });
      }
    });

    // --- Empty state ---
    if (insights.length === 0) {
      insights.push({ id: 'start', type: 'info', icon: 'auto-awesome', title: 'Start Tracking', body: 'Add your income and expenses to unlock personalized insights about your spending habits.', });
      insights.push({ id: 'budget_tip', type: 'info', icon: 'pie-chart', title: 'Set Your First Budget', body: 'Creating budgets for spending categories helps you stay on track and unlock budget insights here.', });
    }

    return insights;
  }, [transactions, budgets, wallets, stats, getMonthlyExpenses, getMonthlyIncome, getBudgetUsage, getCategorySpending]);

  return (
    <FinanceContext.Provider value={{
      wallets, transactions, budgets,
      achievements: DEFAULT_ACHIEVEMENTS,
      stats,
      addWallet, updateWallet, deleteWallet,
      addTransaction, updateTransaction, deleteTransaction,
      addBudget, updateBudget, deleteBudget,
      getWalletById,
      getCategorySpending,
      getTotalBalance, getMonthlyIncome, getMonthlyExpenses,
      getBudgetUsage,
      getAIInsights,
      isLoading,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider');
  return ctx;
}

export { DEFAULT_ACHIEVEMENTS };
