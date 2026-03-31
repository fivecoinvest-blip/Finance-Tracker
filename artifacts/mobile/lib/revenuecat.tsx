import React, { createContext, useContext } from "react";
import { Platform } from "react-native";
import Purchases from "react-native-purchases";
import { useMutation, useQuery } from "@tanstack/react-query";

const REVENUECAT_TEST_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? "test_gVlEBfQRTtRYZrfhKWvIMdguIFV";
const REVENUECAT_IOS_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? "appl_srXiNxXmHspwyksaUBAjidRLJRm";
const REVENUECAT_ANDROID_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? "goog_JKCSqrhJfpSVzSLbJmewEVjHVnL";

export const REVENUECAT_ENTITLEMENT_IDENTIFIER = "pro";

function getRevenueCatApiKey() {
  if (Platform.OS === "web") {
    return REVENUECAT_TEST_API_KEY;
  }

  if (Platform.OS === "ios") {
    return REVENUECAT_IOS_API_KEY;
  }

  if (Platform.OS === "android") {
    return REVENUECAT_ANDROID_API_KEY;
  }

  return REVENUECAT_TEST_API_KEY;
}

export function initializeRevenueCat() {
  try {
    const apiKey = getRevenueCatApiKey();
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey });
    console.log("Configured RevenueCat");
  } catch (e) {
    console.warn("RevenueCat init failed:", e);
  }
}

function useSubscriptionContext() {
  const customerInfoQuery = useQuery({
    queryKey: ["revenuecat", "customer-info"],
    queryFn: async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        return info;
      } catch (e) {
        console.warn("RevenueCat getCustomerInfo error (non-fatal):", e);
        return null;
      }
    },
    staleTime: 60 * 1000,
    retry: false,
    throwOnError: false,
  });

  const offeringsQuery = useQuery({
    queryKey: ["revenuecat", "offerings"],
    queryFn: async () => {
      try {
        const offerings = await Purchases.getOfferings();
        return offerings;
      } catch (e) {
        console.warn("RevenueCat getOfferings error (non-fatal):", e);
        return null;
      }
    },
    staleTime: 300 * 1000,
    retry: false,
    throwOnError: false,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: any) => {
      const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
      return customerInfo;
    },
    onSuccess: () => customerInfoQuery.refetch(),
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      return Purchases.restorePurchases();
    },
    onSuccess: () => customerInfoQuery.refetch(),
  });

  const isSubscribed =
    (customerInfoQuery.data?.entitlements?.active?.[REVENUECAT_ENTITLEMENT_IDENTIFIER] !== undefined) ?? false;

  return {
    customerInfo: customerInfoQuery.data ?? null,
    offerings: offeringsQuery.data ?? null,
    isSubscribed,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
}

type SubscriptionContextValue = ReturnType<typeof useSubscriptionContext>;
const Context = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const value = useSubscriptionContext();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSubscription() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return ctx;
}
