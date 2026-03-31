import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', locale: 'en-PH', decimals: 2 },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-EU', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', decimals: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU', decimals: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', decimals: 2 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', decimals: 2 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP', decimals: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN', decimals: 2 },
  { code: 'KRW', symbol: '₩', name: 'Korean Won', locale: 'ko-KR', decimals: 0 },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', locale: 'zh-TW', decimals: 0 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', decimals: 2 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', locale: 'id-ID', decimals: 0 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', locale: 'ms-MY', decimals: 2 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', locale: 'th-TH', decimals: 2 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', locale: 'vi-VN', decimals: 0 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR', decimals: 2 },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso', locale: 'es-MX', decimals: 2 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE', decimals: 2 },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA', decimals: 2 },
];

const LOCALE_TO_CURRENCY: Record<string, string> = {
  'en-PH': 'PHP', 'fil-PH': 'PHP',
  'en-US': 'USD', 'en': 'USD',
  'en-GB': 'GBP',
  'en-AU': 'AUD',
  'en-CA': 'CAD',
  'en-SG': 'SGD',
  'en-HK': 'HKD', 'zh-HK': 'HKD',
  'ja-JP': 'JPY', 'ja': 'JPY',
  'zh-CN': 'CNY', 'zh': 'CNY',
  'ko-KR': 'KRW', 'ko': 'KRW',
  'zh-TW': 'TWD',
  'en-IN': 'INR', 'hi-IN': 'INR',
  'id-ID': 'IDR', 'id': 'IDR',
  'ms-MY': 'MYR', 'ms': 'MYR',
  'th-TH': 'THB', 'th': 'THB',
  'vi-VN': 'VND', 'vi': 'VND',
  'pt-BR': 'BRL', 'pt': 'BRL',
  'es-MX': 'MXN',
  'ar-AE': 'AED',
  'ar-SA': 'SAR',
  'de-DE': 'EUR', 'fr-FR': 'EUR', 'es-ES': 'EUR', 'it-IT': 'EUR',
};

function detectDefaultCurrency(): string {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    if (LOCALE_TO_CURRENCY[locale]) return LOCALE_TO_CURRENCY[locale];
    const lang = locale.split('-')[0];
    return LOCALE_TO_CURRENCY[lang] ?? 'PHP';
  } catch {
    return 'PHP';
  }
}

interface CurrencyContextValue {
  currency: CurrencyInfo;
  setCurrencyByCode: (code: string) => Promise<void>;
  formatAmount: (amount: number, fractionDigits?: number) => string;
  formatAmountShort: (amount: number) => string;
  formatDate: (dateStr: string, options?: Intl.DateTimeFormatOptions) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const STORAGE_KEY = '@cashper_currency';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyInfo>(
    CURRENCIES.find(c => c.code === 'PHP') ?? CURRENCIES[0]
  );

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(saved => {
      if (saved) {
        const found = CURRENCIES.find(c => c.code === saved);
        if (found) { setCurrency(found); return; }
      }
      const detected = detectDefaultCurrency();
      const found = CURRENCIES.find(c => c.code === detected) ?? CURRENCIES[0];
      setCurrency(found);
    });
  }, []);

  const setCurrencyByCode = useCallback(async (code: string) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (!found) return;
    setCurrency(found);
    await AsyncStorage.setItem(STORAGE_KEY, code);
  }, []);

  const formatAmount = useCallback((amount: number, fractionDigits?: number): string => {
    const digits = fractionDigits ?? currency.decimals;
    const abs = Math.abs(amount).toLocaleString(currency.locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    return amount < 0 ? `-${currency.symbol}${abs}` : `${currency.symbol}${abs}`;
  }, [currency]);

  const formatAmountShort = useCallback((amount: number): string => {
    const abs = Math.abs(amount).toLocaleString(currency.locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return amount < 0 ? `-${currency.symbol}${abs}` : `${currency.symbol}${abs}`;
  }, [currency]);

  const formatDate = useCallback((dateStr: string, options?: Intl.DateTimeFormatOptions): string => {
    return new Date(dateStr).toLocaleDateString(currency.locale, options);
  }, [currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyByCode, formatAmount, formatAmountShort, formatDate }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
