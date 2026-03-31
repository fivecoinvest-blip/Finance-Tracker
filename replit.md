# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Mobile**: Expo (React Native), expo-router, AsyncStorage

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── mobile/             # Expo React Native mobile app (Cashper)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace config
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## Cashper - Track Save Grow (`artifacts/mobile`)

A personal finance tracker mobile app for iOS and Android.

### Features
- **Wallet/Account Tracking**: Cash, Bank, Savings, E-Wallet, Credit Card wallets
- **Free vs Pro Tiers**: Free = 3 wallets max; Pro = unlimited wallets + all features. Paywall via RevenueCat (`$4.99/mo`)
- **Transactions**: Income, expense, transfer with automatic wallet balance updates
- **Budget Management**: Weekly/monthly budgets with progress tracking and alerts
- **Analytics**: Spending charts, category breakdown, trends
- **AI Insights**: Local pattern analysis, personalized saving suggestions
- **Gamification**: Streaks, XP, levels (1-∞), achievements/badges, financial health score
- **Quick Add**: Natural language text input for fast transaction entry
- **Offline-First**: All data in AsyncStorage, no backend required
- **Settings**: Data backup/restore options

### RevenueCat (Monetization)
- Integration connected via Replit RevenueCat connector
- Entitlement: `pro`; Product: `cashper_pro_monthly` ($4.99/month)
- Package: `$rc_monthly`; Offering: `default`
- Env vars: `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY`, `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY`
- Project IDs stored as env vars: `REVENUECAT_PROJECT_ID`, `REVENUECAT_TEST_STORE_APP_ID`, `REVENUECAT_APPLE_APP_STORE_APP_ID`, `REVENUECAT_GOOGLE_PLAY_STORE_APP_ID`
- Client code: `artifacts/mobile/lib/revenuecat.tsx` (SubscriptionProvider + useSubscription hook)
- Paywall component: `artifacts/mobile/components/ProPaywall.tsx`
- Seed script: `scripts/src/seedRevenueCat.ts` (run with `pnpm --filter @workspace/scripts exec tsx src/seedRevenueCat.ts`)

### Architecture
- **State**: React Context (`FinanceContext`) with AsyncStorage persistence
- **Navigation**: Expo Router with 5-tab layout (Home, Wallets, Transactions, Budget, Profile)
- **Theming**: Full light/dark mode via `ThemeContext` (`LightColors`/`DarkColors` in `constants/colors.ts`). All screens use `useColors()` hook for dynamic colors. Toggle persisted to AsyncStorage. Settings screen has live Dark Mode switch.
- **Color pattern**: All components call `const Colors = useColors()` at the top; layout props stay in `StyleSheet.create`; color values applied inline via `[styles.foo, { color: Colors.textPrimary }]`.
- **Storage**: `@react-native-async-storage/async-storage`
- **Icons**: `@expo/vector-icons` (MaterialIcons) + SF Symbols on iOS

### Key Files
- `context/FinanceContext.tsx` — main state, business logic, XP/achievement system
- `constants/colors.ts` — full color theme
- `app/(tabs)/` — 5 tab screens
- `app/add-transaction.tsx` — full transaction form
- `app/ai-insights.tsx` — AI spending analysis
- `app/voice-input.tsx` — natural language transaction input
- `app/settings.tsx` — settings + ad removal

## API Server (`artifacts/api-server`)

Express 5 API server (minimal, used for health check only in current build).
