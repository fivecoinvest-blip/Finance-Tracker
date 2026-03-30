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
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  deleteBudget: (id: string) => void;
  getWalletById: (id: string) => Wallet | undefined;
  getCategorySpending: (category: string, period: BudgetPeriod) => number;
  getTotalBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
  getBudgetUsage: (budgetId: string) => number;
  getAIInsights: () => string[];
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

  const getAIInsights = useCallback((): string[] => {
    const insights: string[] = [];
    const monthlyExpenses = getMonthlyExpenses();
    const monthlyIncome = getMonthlyIncome();
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    const categoryTotals: Record<string, number> = {};
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    transactions
      .filter(t => t.type === 'expense' && new Date(t.date) >= start)
      .forEach(t => { categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + t.amount; });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    if (topCategory && monthlyExpenses > 0) {
      const pct = Math.round((topCategory[1] / monthlyExpenses) * 100);
      const saving = Math.round(topCategory[1] * 0.2);
      insights.push(`You spent ${pct}% of your money on ${topCategory[0]} this month. Reducing it by 20% could save you ₱${saving.toLocaleString()}.`);
    }

    if (savingsRate < 10 && monthlyIncome > 0) {
      insights.push(`Your savings rate is ${Math.round(savingsRate)}%. Aim for at least 20% to build financial security.`);
    } else if (savingsRate >= 20) {
      insights.push(`Great job! You're saving ${Math.round(savingsRate)}% of your income this month.`);
    }

    const overBudgets = budgets.filter(b => getBudgetUsage(b.id) > 1);
    if (overBudgets.length > 0) {
      insights.push(`You've exceeded your ${overBudgets[0].category} budget. Consider reviewing your spending in this category.`);
    }

    const nearBudgets = budgets.filter(b => { const u = getBudgetUsage(b.id); return u >= 0.8 && u < 1; });
    if (nearBudgets.length > 0) {
      insights.push(`Heads up! You're at ${Math.round(getBudgetUsage(nearBudgets[0].id) * 100)}% of your ${nearBudgets[0].category} budget.`);
    }

    if (stats.streak > 5) {
      insights.push(`You've been tracking expenses for ${stats.streak} days in a row. Keep it up!`);
    }

    if (insights.length === 0) {
      insights.push("Start adding transactions to get personalized AI insights about your spending.");
      insights.push("Set budgets for your spending categories to get alerts when you're close to your limits.");
    }

    return insights;
  }, [transactions, budgets, stats, getMonthlyExpenses, getMonthlyIncome, getBudgetUsage]);

  return (
    <FinanceContext.Provider value={{
      wallets, transactions, budgets,
      achievements: DEFAULT_ACHIEVEMENTS,
      stats,
      addWallet, updateWallet, deleteWallet,
      addTransaction, deleteTransaction,
      addBudget, deleteBudget,
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
