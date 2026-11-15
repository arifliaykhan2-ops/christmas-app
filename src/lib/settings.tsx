import { ExtensionStorage } from '@bacons/apple-targets';
import Constants from 'expo-constants';
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { defaultOrthodox, useLang } from '@/i18n';
import type { ChristmasMode } from './christmas';
import { syncReminders } from './notifications';
import { FREE_THEME, THEMES, pickPhoto, removePhoto, type ThemeId } from './personalize';
import { usePremium } from './premium';
import { useStored } from './storage';

type Settings = {
  ready: boolean;
  mode: ChristmasMode;
  reminders: boolean;
  snow: boolean;
  onboarded: boolean;
  /** Theme and photo actually in use: Premium choices fall back to the free look when the subscription ends. */
  theme: ThemeId;
  photo: string | null;
  setMode: (m: ChristmasMode) => void;
  setReminders: (on: boolean) => Promise<boolean>;
  setSnow: (on: boolean) => void;
  finishOnboarding: (snow: boolean) => void;
  setTheme: (t: ThemeId) => void;
  choosePhoto: () => Promise<void>;
  clearPhoto: () => void;
};

const Ctx = createContext<Settings | null>(null);

const appGroup = Constants.expoConfig?.extra?.appGroup as string | undefined;
const widgetStore = appGroup ? new ExtensionStorage(appGroup) : null;

type SavedPhoto = { uri: string; widget: string } | null;

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [mode, setMode, modeLoaded] = useStored<ChristmasMode>('settings.mode', defaultOrthodox ? 'jan7' : 'dec25');
  const [reminders, setRemindersRaw, remindersLoaded] = useStored<boolean>('settings.reminders', false);
  const [snow, setSnow, snowLoaded] = useStored<boolean>('settings.snow', false);
  const [onboarded, setOnboarded, onboardedLoaded] = useStored<boolean>('settings.onboarded', false);
  const [themeChoice, setTheme] = useStored<ThemeId>('settings.theme', FREE_THEME);
  const [photoChoice, setPhoto] = useStored<SavedPhoto>('settings.photo', null);
  const premium = usePremium().active;
  const lang = useLang();

  const theme: ThemeId = premium && THEMES[themeChoice] ? themeChoice : FREE_THEME;
  const photo = premium ? (photoChoice?.uri ?? null) : null;

  // Keep the Home/Lock Screen widget in sync (no-op in Expo Go).
  useEffect(() => {
    if (!modeLoaded) return;
    try {
      widgetStore?.set('mode', mode);
      widgetStore?.set('lang', lang);
      widgetStore?.set('themeTop', THEMES[theme].top);
      widgetStore?.set('themeBottom', THEMES[theme].bottom);
      widgetStore?.set('photo', premium && photoChoice ? photoChoice.widget : undefined);
      ExtensionStorage.reloadWidget();
    } catch {}
  }, [mode, modeLoaded, lang, theme, premium, photoChoice]);

  // Re-schedule local reminders on launch so the texts follow the current language.
  useEffect(() => {
    if (remindersLoaded && reminders) syncReminders(true, mode).catch(() => {});
  }, [remindersLoaded, reminders, mode, lang]);

  const ready = modeLoaded && remindersLoaded && snowLoaded && onboardedLoaded;

  const value = useMemo<Settings>(
    () => ({
      ready,
      mode,
      reminders,
      snow,
      onboarded,
      theme,
      photo,
      setMode,
      setSnow,
      setTheme,
      setReminders: async (on) => {
        const ok = await syncReminders(on, mode);
        setRemindersRaw(on && ok);
        return ok;
      },
      finishOnboarding: (withSnow) => {
        setSnow(withSnow);
        setOnboarded(true);
      },
      choosePhoto: async () => {
        const picked = await pickPhoto(photoChoice?.uri);
        if (picked) setPhoto({ uri: picked.uri, widget: picked.widgetBase64 });
      },
      clearPhoto: () => {
        if (photoChoice) removePhoto(photoChoice.uri);
        setPhoto(null);
      },
    }),
    [ready, mode, reminders, snow, onboarded, theme, photo, photoChoice, setMode, setSnow, setTheme, setRemindersRaw, setOnboarded, setPhoto],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSettings outside SettingsProvider');
  return ctx;
}
