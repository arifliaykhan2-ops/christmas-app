/**
 * "Christmas Premium" — one auto-renewable monthly subscription ($0.99, first week free)
 * sold through Apple In-App Purchase and managed by RevenueCat (receipts, renewals,
 * restore). Prices and the free-trial wording come from the App Store, so they are
 * already localized per country. In Expo Go (no native RevenueCat) purchases are
 * simulated so the whole flow can be tried on a phone.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useSyncExternalStore } from 'react';
import type { CustomerInfo, PurchasesPackage } from 'react-native-purchases';

export const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/** RevenueCat public iOS key ("appl_…", RevenueCat → Project settings → API keys). Empty = purchases disabled. */
export const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
/** RevenueCat entitlement unlocked by the subscription. */
export const ENTITLEMENT = 'premium';
/** App Store Connect product (subscription group "Christmas Premium"). */
export const PRODUCT_ID = 'app.christmascountdown.ios.premium.monthly';

/** Links Apple requires on a subscription screen. */
export const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';

export type PremiumState = { active: boolean; expiresAt: number | null; test: boolean };

/** What the paywall shows — all strings come localized from the App Store. */
export type Offer = { price: string; trialDays: number | null };

const KEY = 'premium:v1';
const DAY = 86_400_000;

let state: PremiumState = { active: false, expiresAt: null, test: false };
const listeners = new Set<() => void>();

function set(next: PremiumState) {
  state = next;
  AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  listeners.forEach((l) => l());
}

export const getPremium = () => state;

export function usePremium(): PremiumState {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getPremium,
    getPremium,
  );
}

// ───────── native (development / store builds) ─────────

type RC = typeof import('react-native-purchases');
let rc: RC['default'] | null = null;
if (!IS_EXPO_GO && REVENUECAT_IOS_KEY) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    rc = (require('react-native-purchases') as RC).default;
  } catch {
    rc = null;
  }
}

let monthly: PurchasesPackage | null = null;

function apply(info: CustomerInfo) {
  const e = info.entitlements.active[ENTITLEMENT];
  set({ active: !!e?.isActive, expiresAt: e?.expirationDateMillis ?? null, test: false });
}

export async function initPurchases(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) state = JSON.parse(raw) as PremiumState;
  } catch {}
  // A cached or simulated subscription past its end date no longer counts (RevenueCat refresh corrects real ones).
  if (state.active && state.expiresAt && state.expiresAt < Date.now()) state = { ...state, active: false };
  listeners.forEach((l) => l());
  if (!rc) return;
  try {
    rc.configure({ apiKey: REVENUECAT_IOS_KEY });
    rc.addCustomerInfoUpdateListener(apply);
    apply(await rc.getCustomerInfo());
  } catch {
    // Offline or RevenueCat unavailable: keep the last known state.
  }
}

/** Loads the monthly package with its localized price and free-trial length. */
export async function loadOffer(): Promise<Offer | null> {
  if (!rc) return IS_EXPO_GO ? { price: '$0.99', trialDays: 7 } : null;
  const offering = (await rc.getOfferings()).current;
  monthly =
    offering?.availablePackages.find((p) => p.product.identifier === PRODUCT_ID) ??
    offering?.availablePackages.find((p) => p.packageType === 'MONTHLY') ??
    null;
  if (!monthly) return null;
  const intro = monthly.product.introPrice;
  const trialDays =
    intro && intro.price === 0
      ? intro.periodUnit === 'WEEK'
        ? 7 * intro.periodNumberOfUnits
        : intro.periodUnit === 'DAY'
          ? intro.periodNumberOfUnits
          : intro.periodUnit === 'MONTH'
            ? 30 * intro.periodNumberOfUnits
            : null
      : null;
  return { price: monthly.product.priceString, trialDays };
}

/** Resolves true when subscribed, false when the user closed Apple's sheet. */
export async function subscribe(): Promise<boolean> {
  if (!rc) {
    if (!IS_EXPO_GO) throw new Error('Purchases not configured');
    set({ active: true, expiresAt: Date.now() + 7 * DAY, test: true });
    return true;
  }
  if (!monthly) await loadOffer();
  if (!monthly) throw new Error('Offer not loaded');
  try {
    const { customerInfo } = await rc.purchasePackage(monthly);
    apply(customerInfo);
    return state.active;
  } catch (e) {
    if ((e as { userCancelled?: boolean | null })?.userCancelled) return false;
    throw e;
  }
}

/** Apple requires a visible "Restore purchases" action. */
export async function restore(): Promise<boolean> {
  if (!rc) return state.active;
  apply(await rc.restorePurchases());
  return state.active;
}

export async function manageSubscription(): Promise<void> {
  if (rc) await rc.showManageSubscriptions();
}

/** Expo Go only: undo a simulated purchase. */
export function clearTestPurchase() {
  if (state.test) set({ active: false, expiresAt: null, test: false });
}
