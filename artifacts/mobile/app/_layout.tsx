import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LockScreen } from "@/components/LockScreen";
import { useCurrency } from "@/context/CurrencyContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { useFinance } from "@/context/FinanceContext";
import { FinanceProvider } from "@/context/FinanceContext";
import { useNotifications } from "@/context/NotificationContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { SecurityProvider, useSecurity } from "@/context/SecurityContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { initializeRevenueCat, SubscriptionProvider } from "@/lib/revenuecat";

initializeRevenueCat();

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function LockGate({ children }: { children: React.ReactNode }) {
  const { isLocked } = useSecurity();
  return (
    <>
      {children}
      {isLocked && <LockScreen />}
    </>
  );
}

function BudgetAlertWatcher() {
  const { transactions, budgets } = useFinance();
  const { checkBudgetAlerts } = useNotifications();
  const { currency } = useCurrency();
  const prevLengthRef = useRef(transactions.length);

  useEffect(() => {
    const prev = prevLengthRef.current;
    prevLengthRef.current = transactions.length;
    if (transactions.length > prev) {
      const newest = transactions[0];
      if (newest?.type === 'expense') {
        checkBudgetAlerts(newest.category, transactions, budgets, currency.symbol);
      }
    }
  }, [transactions, budgets, checkBudgetAlerts, currency.symbol]);

  return null;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-transaction" />
      <Stack.Screen name="transaction-detail" />
      <Stack.Screen name="ai-insights" />
      <Stack.Screen name="voice-input" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SubscriptionProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <ThemeProvider>
                  <SecurityProvider>
                    <CurrencyProvider>
                      <NotificationProvider>
                        <FinanceProvider>
                          <BudgetAlertWatcher />
                          <LockGate>
                            <RootLayoutNav />
                          </LockGate>
                        </FinanceProvider>
                      </NotificationProvider>
                    </CurrencyProvider>
                  </SecurityProvider>
                </ThemeProvider>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </SubscriptionProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
